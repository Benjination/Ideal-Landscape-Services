/**
 * Firebase Cloud Function — createPayment
 *
 * Receives a Stripe paymentMethodId + invoice details from the Pay Online page,
 * creates and confirms a Stripe PaymentIntent server-side, and returns the result.
 *
 * ─── Setup (one-time, done by developer) ────────────────────────────────────
 *  1. npm install  (in this /functions directory)
 *  2. firebase functions:secrets:set STRIPE_SECRET_KEY
 *       → paste the client's Stripe SECRET key when prompted
 *       → found at https://dashboard.stripe.com/apikeys → "Secret key"
 *  3. firebase deploy --only functions
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── What the client needs to provide ───────────────────────────────────────
 *  • Stripe account (free to create at https://stripe.com)
 *  • Stripe Publishable Key  → goes in Website/Actual/pay/index.html
 *  • Stripe Secret Key       → stored as a Firebase secret (step 2 above)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { onRequest }          = require("firebase-functions/v2/https");
const { onDocumentCreated }  = require("firebase-functions/v2/firestore");
const { defineSecret }       = require("firebase-functions/params");
const { setGlobalOptions }   = require("firebase-functions/v2");
const logger                 = require("firebase-functions/logger");
const admin                  = require("firebase-admin");

admin.initializeApp();

// Secret stored in Google Cloud Secret Manager.
// Set via: npx firebase-tools functions:secrets:set STRIPE_SECRET_KEY
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

setGlobalOptions({ region: "us-central1" });

exports.createPayment = onRequest(
  { secrets: [stripeSecretKey], cors: ["https://ideallandscapeservices.com"] },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { paymentMethodId, invoiceNumber, amountCents } = req.body;

    if (!paymentMethodId || !invoiceNumber || !amountCents || amountCents < 50) {
      return res.status(400).json({ success: false, message: "Missing or invalid payment details." });
    }

    const Stripe = require("stripe");
    const stripe = Stripe(stripeSecretKey.value());

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount:               amountCents,   // in cents, e.g. 15000 = $150.00
        currency:             "usd",
        payment_method:       paymentMethodId,
        confirm:              true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        description:          `Invoice ${invoiceNumber} — Ideal Landscape Services`,
        metadata:             { invoiceNumber },
        receipt_email:        req.body.email || undefined,
      });

      if (paymentIntent.status === "succeeded") {
        logger.info("Payment succeeded", { invoiceNumber, amountCents });
        return res.json({ success: true, intentId: paymentIntent.id });
      } else {
        logger.warn("Unexpected payment status", { status: paymentIntent.status });
        return res.json({ success: false, message: "Payment was not completed. Please try again." });
      }
    } catch (err) {
      logger.error("Stripe error", err);
      const userMessage = err.type === "StripeCardError"
        ? err.message
        : "An error occurred processing your payment. Please call 817-457-7507.";
      return res.status(500).json({ success: false, message: userMessage });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// Contact Form Email Notification
//
// Triggers when a new contact submission lands in Firestore, then writes
// a document to the "mail" collection. The Firebase "Trigger Email from
// Firestore" extension watches that collection and sends it via SMTP.
//
// Setup (one-time):
//   1. Firebase Console → Extensions → install "Trigger Email from Firestore"
//   2. When prompted, set:
//        SMTP connection URI:
//          smtps://info@ideallandscapeservices.com:APP_PASSWORD@smtp.gmail.com:465
//        Email documents collection: mail
//        (APP_PASSWORD = client's Gmail App Password — myaccount.google.com/apppasswords)
//   3. npx firebase-tools deploy --only functions
// ═══════════════════════════════════════════════════════════════════════════
exports.notifyNewContact = onDocumentCreated(
  { document: "contact-submissions/{docId}" },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const projectTypes = Array.isArray(data.projectTypes) && data.projectTypes.length
      ? data.projectTypes.join(", ")
      : "Not specified";

    try {
      await admin.firestore().collection("mail").add({
        to: "info@ideallandscapeservices.com",
        message: {
          subject: `New website lead: ${data.name}`,
          text: [
            `New contact form submission from your website.`,
            ``,
            `Name:         ${data.name}`,
            `Phone:        ${data.phone}`,
            `Email:        ${data.email}`,
            `Address:      ${data.address || "—"}`,
            `City:         ${data.city || "—"}`,
            `ZIP:          ${data.zip || "—"}`,
            `Project type: ${projectTypes}`,
            `Timeline:     ${data.timeline || "—"}`,
            `Heard about:  ${data.heardAbout || "—"}`,
            ``,
            `Message:`,
            data.comment || "(none)",
          ].join("\n"),
          html: `
            <h2 style="color:#2d6a2d;">New Website Lead</h2>
            <table style="border-collapse:collapse; font-family:sans-serif; font-size:14px;">
              <tr><td style="padding:4px 16px 4px 0; font-weight:600;">Name</td><td>${data.name}</td></tr>
              <tr><td style="padding:4px 16px 4px 0; font-weight:600;">Phone</td><td><a href="tel:${data.phone}">${data.phone}</a></td></tr>
              <tr><td style="padding:4px 16px 4px 0; font-weight:600;">Email</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
              <tr><td style="padding:4px 16px 4px 0; font-weight:600;">Address</td><td>${data.address || "—"}, ${data.city || ""} ${data.zip || ""}</td></tr>
              <tr><td style="padding:4px 16px 4px 0; font-weight:600;">Project</td><td>${projectTypes}</td></tr>
              <tr><td style="padding:4px 16px 4px 0; font-weight:600;">Timeline</td><td>${data.timeline || "—"}</td></tr>
              <tr><td style="padding:4px 16px 4px 0; font-weight:600;">Heard about</td><td>${data.heardAbout || "—"}</td></tr>
            </table>
            <p style="font-weight:600; margin-top:16px;">Message:</p>
            <p style="white-space:pre-wrap;">${data.comment || "(none)"}</p>
          `
        }
      });
      logger.info("Mail document queued", { name: data.name });
    } catch (err) {
      logger.error("Failed to queue mail document", err);
    }
  }
);
