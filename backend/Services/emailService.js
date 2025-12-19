const nodemailer = require('nodemailer');

// Email configuration from user request
const transporter = nodemailer.createTransport({
    host: 'mail.kilisoftware.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'mcheni@kilisoftware.com',
        pass: 'mcheni@123',
    },
});

/**
 * Send Tender Invitation Email
 * @param {string} toEmail - Recipient email
 * @param {string} buyerName - Name of the buyer organization
 * @param {string} tenderTitle - Title of the tender
 * @param {string} documents - Required documents text
 * @param {string} invitationLink - Secure link to access tender
 */
const sendTenderInvitation = async (toEmail, buyerName, tenderTitle, documents, invitationLink) => {
    const mailOptions = {
        from: '"Power Bidding System" <mcheni@kilisoftware.com>',
        to: toEmail,
        subject: `Invitation to Tender: ${tenderTitle}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Tender Invitation</h2>
        <p>Dear Valued Supplier,</p>
        <p>You have been invited by <strong>${buyerName}</strong> to participate in the following tender:</p>
        
        <h3 style="background-color: #f8f9fa; padding: 10px; border-left: 4px solid #0d6efd;">${tenderTitle}</h3>
        
        <p>To be considered for this opportunity, please review the requirements carefully.</p>
        
        <h4>Required Documents:</h4>
        <p style="white-space: pre-wrap;">${documents || 'Standard business documents required.'}</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${invitationLink}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Tender Details & Apply</a>
        </div>
        
        <p>Or copy this link to your browser:</p>
        <p><a href="${invitationLink}">${invitationLink}</a></p>
        
        <p>Best Regards,<br>Power Bidding System</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Invitation sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendTenderInvitation,
};
