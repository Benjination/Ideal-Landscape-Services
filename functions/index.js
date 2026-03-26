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

const { onRequest }     = require("firebase-functions/v2/https");
const { defineSecret }  = require("firebase-functions/params");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger            = require("firebase-functions/logger");

// Secret is stored in Google Cloud Secret Manager via:
//   firebase functions:secrets:set STRIPE_SECRET_KEY
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
