const nodemailer = require('nodemailer');

// Cache ethereal test account in memory during dev session so we don't recreate on every email
let etherealAccount = null;

/**
 * Creates and returns a Nodemailer transporter instance
 */
const getTransporter = async () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT;
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const pass = rawPass.replace(/\s+/g, ''); // Strip spaces from Google App Passwords

  // 1. Dedicated Gmail Transport (Recommended for Gmail & Google Workspace)
  if (user && pass && (user.includes('@gmail.com') || (host && host.includes('gmail')))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  // 2. Generic SMTP Transporter (Sendgrid, Mailgun, AWS SES, Custom SMTP)
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // 2. Otherwise in development mode, create / reuse an Ethereal test account with preview URLs
  try {
    if (!etherealAccount) {
      etherealAccount = await nodemailer.createTestAccount();
      console.log('----------------------------------------------------');
      console.log('[Nodemailer] Created ephemeral Ethereal test account:');
      console.log('User:', etherealAccount.user);
      console.log('----------------------------------------------------');
    }

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });
  } catch (err) {
    console.warn('[Nodemailer] Warning: Could not create Ethereal account, falling back to JSON stream transporter:', err.message);
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
};

/**
 * Sends official appointment notification email to newly assigned Hospital Administrator
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient hospital admin email
 * @param {string} params.adminName - Administrator's full name
 * @param {string} params.adminId - Admin ID (e.g. HADM-005)
 * @param {string} params.hospitalName - Name of the hospital
 * @param {string} params.hospitalCode - Code of the hospital
 * @param {string} params.city - Hospital city / location
 * @param {string} params.hospitalPhone - Hospital contact phone
 * @param {string} params.tempPassword - Initial password for login
 * @param {string} [params.portalUrl] - Login portal URL
 */
const sendHospitalAdminAppointmentEmail = async ({
  to,
  adminName,
  adminId,
  hospitalName,
  hospitalCode,
  city,
  hospitalPhone,
  tempPassword,
  portalUrl,
}) => {
  if (!to) {
    return { success: false, error: 'Recipient email is required' };
  }

  const safeAdminName = adminName || 'Hospital Administrator';
  const safeHospitalName = hospitalName || 'Partner Hospital';
  const safeHospitalCode = hospitalCode || 'HOSP-MEDY';
  const safeCity = city || 'Central District';
  const safePhone = hospitalPhone || '+91 22 2847 1100';
  const safePassword = tempPassword || 'Admin@123';
  const safePortalUrl = portalUrl || 'http://localhost:3000/login';
  const fromAddress = process.env.EMAIL_FROM || '"Medy Healthcare Central Command" <admin@medy.health>';

  const subject = `Official Appointment Notice: Hospital Administrator for ${safeHospitalName} (${safeHospitalCode})`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hospital Administrator Appointment</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 620px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      padding: 36px 32px 28px;
      color: #ffffff;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .header h1 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      color: #e0f2fe;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .intro-text {
      font-size: 14px;
      color: #475569;
      margin-bottom: 24px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .info-card-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0284c7;
      margin-top: 0;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .info-grid {
      display: table;
      width: 100%;
    }
    .info-row {
      display: table-row;
    }
    .info-label {
      display: table-cell;
      padding: 6px 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      width: 40%;
    }
    .info-value {
      display: table-cell;
      padding: 6px 0;
      font-size: 13px;
      color: #0f172a;
      font-weight: 600;
    }
    .credentials-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 26px;
    }
    .credentials-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #15803d;
      margin-top: 0;
      margin-bottom: 14px;
    }
    .cred-chip {
      background: #ffffff;
      border: 1px dashed #86efac;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 14px;
      font-weight: 700;
      color: #166534;
      display: inline-block;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background: #0284c7;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
      transition: background 0.2s;
    }
    .btn:hover {
      background: #0369a1;
    }
    .responsibilities {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      margin-top: 10px;
    }
    .responsibilities h4 {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin: 0 0 10px;
    }
    .responsibilities ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #64748b;
    }
    .responsibilities li {
      margin-bottom: 6px;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .footer a {
      color: #0284c7;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="badge">Official Appointment Notice</div>
      <h1>Medy Healthcare Network</h1>
      <p>Central Administrative Operations & Facility Onboarding</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <div class="greeting">Dear ${safeAdminName},</div>
      
      <p class="intro-text">
        Congratulations! You have been officially appointed as the <strong>Hospital Administrator</strong> for 
        <strong>${safeHospitalName}</strong> on the Medy Healthcare Network. Your administrative credentials 
        have been provisioned by the Central Super Administrator.
      </p>

      <!-- Facility Information Card -->
      <div class="info-card">
        <div class="info-card-title">Hospital Facility Details</div>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Hospital Name:</div>
            <div class="info-value">${safeHospitalName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Facility Code:</div>
            <div class="info-value" style="font-family: monospace;">${safeHospitalCode}</div>
          </div>
          <div class="info-row">
            <div class="info-label">City / Region:</div>
            <div class="info-value">${safeCity}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Hospital Phone:</div>
            <div class="info-value">${safePhone}</div>
          </div>
        </div>
      </div>

      <!-- Credentials Box -->
      <div class="credentials-box">
        <div class="credentials-title">Your Administrator Login Credentials</div>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Admin ID:</div>
            <div class="info-value" style="font-family: monospace;">${adminId || 'HADM-AUTO'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Assigned Role:</div>
            <div class="info-value">Hospital Administrator</div>
          </div>
          <div class="info-row">
            <div class="info-label">Login Email:</div>
            <div class="info-value" style="color: #0284c7;">${to}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Initial Password:</div>
            <div class="info-value">
              <span class="cred-chip">${safePassword}</span>
            </div>
          </div>
        </div>
        <p style="margin: 14px 0 0; font-size: 11px; color: #166534;">
          * For security compliance, please log in and change your password immediately in your Account Settings.
        </p>
      </div>

      <!-- Action Button -->
      <div class="btn-container">
        <a href="${safePortalUrl}" class="btn" target="_blank">Access Hospital Admin Portal &rarr;</a>
      </div>

      <!-- Administrator Key Responsibilities -->
      <div class="responsibilities">
        <h4>Your Primary Administrative Operations:</h4>
        <ul>
          <li><strong>Doctor Appointments:</strong> Schedule and manage physician consultations and patient queues.</li>
          <li><strong>Medy Health Cards:</strong> Verify patient applications and issue distinct digital health cards.</li>
          <li><strong>Diagnostic Testing:</strong> Coordinate with approved partnered pathology and imaging laboratories.</li>
          <li><strong>Hospital Analytics:</strong> Monitor inpatient admissions, test turnaround, and revenue metrics.</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 6px;">
        &copy; ${new Date().getFullYear()} Medy Healthcare Systems. All rights reserved.
      </p>
      <p style="margin: 0;">
        This is an automated administrative notification. If you did not expect this message, please contact 
        <a href="mailto:support@medy.health">support@medy.health</a> immediately.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
OFFICIAL APPOINTMENT NOTICE: HOSPITAL ADMINISTRATOR
Medy Healthcare Network

Dear ${safeAdminName},

You have been officially appointed as the Hospital Administrator for ${safeHospitalName} (${safeHospitalCode}) on the Medy Healthcare Network.

FACILITY DETAILS:
- Hospital Name: ${safeHospitalName}
- Facility Code: ${safeHospitalCode}
- Location: ${safeCity}
- Contact Phone: ${safePhone}

YOUR LOGIN CREDENTIALS:
- Admin ID: ${adminId || 'HADM-AUTO'}
- Assigned Role: Hospital Administrator
- Login Email: ${to}
- Initial Password: ${safePassword}
- Admin Portal: ${safePortalUrl}

Please access the admin portal and update your password upon your first sign-in.

Best regards,
Central Administration Command
Medy Healthcare Systems
  `.trim();

  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    console.log('====================================================');
    console.log('[Nodemailer] SUCCESS: Hospital Admin Appointment Email Dispatched!');
    console.log('To:', to);
    console.log('Hospital:', safeHospitalName, `(${safeHospitalCode})`);
    console.log('Admin ID:', adminId);
    console.log('Message ID:', info.messageId);
    if (previewUrl) {
      console.log('Preview Email Online (Ethereal):', previewUrl);
    }
    console.log('====================================================');

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      recipient: to,
    };
  } catch (error) {
    console.error('[Nodemailer] ERROR sending appointment email:', error);
    return {
      success: false,
      error: error.message || 'Failed to dispatch email',
      recipient: to,
    };
  }
};

module.exports = {
  sendHospitalAdminAppointmentEmail,
};
