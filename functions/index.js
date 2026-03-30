const { onDocumentCreated }  = require("firebase-functions/v2/firestore");
const { setGlobalOptions }   = require("firebase-functions/v2");
const logger                 = require("firebase-functions/logger");
const admin                  = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({ region: "us-central1" });

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
