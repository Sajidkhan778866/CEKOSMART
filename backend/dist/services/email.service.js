"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoiceSoftCopyEmail = exports.sendOtpEmail = exports.verifySmtpConnection = exports.saveSmtpConfiguration = exports.getTransporter = exports.resetTransporter = exports.getSmtpConfigAsync = exports.loadSmtpCredentialsAsync = exports.getSmtpConfig = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = require("../config/db");
const SmtpConfig_1 = require("../models/SmtpConfig");
let runtimeSmtpOverride = null;
let lastDbFetchTime = 0;
/**
 * Synchronous config getter (reads runtime cache + environment variables).
 */
const getSmtpConfig = () => {
    const creds = getInternalSmtpCredentialsSync();
    const { pass, ...publicInfo } = creds;
    return publicInfo;
};
exports.getSmtpConfig = getSmtpConfig;
const normalizeSmtpInput = (rawHost, rawUser, rawPass, rawFrom) => {
    let host = (rawHost || '').trim() || 'server62.hostingraja.org';
    if (host === 'mail.ekosmartdrivecomplain.in' || host === 'mail.ekosmartfeedback.in') {
        host = 'server62.hostingraja.org';
    }
    let user = (rawUser || '').trim() || 'support_otp_email@ekosmartdrive.in';
    if (user.toLowerCase() === 'support_otp_email' ||
        user.toLowerCase().startsWith('support_otp_email@ekosmartdrivecomplain.in') ||
        user.toLowerCase().startsWith('support_otp_email@ekosmartfeedback.in') ||
        user.toLowerCase().startsWith('support_otp_email@ekosmartdrive.in')) {
        user = 'support_otp_email@ekosmartdrive.in';
    }
    else if (!user.includes('@')) {
        user = `${user.toLowerCase()}@ekosmartdrive.in`;
    }
    let pass = (rawPass !== undefined && rawPass !== null ? String(rawPass).trim() : '');
    if (user.toLowerCase() === 'support_otp_email@ekosmartdrive.in' && (!pass || pass === 'Sajid1503' || pass === 'Shoyab@1516')) {
        pass = 'Sajid1502';
    }
    let from = (rawFrom || '').trim() || `"Ekosmart Verification" <${user}>`;
    if (from.includes('ekosmartdrivecomplain.in') || from.includes('ekosmartfeedback.in') || !from.includes('@')) {
        from = `"Ekosmart Verification" <${user}>`;
    }
    return { host, user, pass, from };
};
const getInternalSmtpCredentialsSync = () => {
    const envHost = process.env.SMTP_HOST?.trim();
    const envPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const envUser = process.env.SMTP_USER?.trim();
    const envPass = process.env.SMTP_PASS?.trim();
    const envFrom = process.env.SMTP_FROM?.trim();
    const rawHost = runtimeSmtpOverride?.host || envHost || 'server62.hostingraja.org';
    const port = runtimeSmtpOverride?.port || envPort || 465;
    const secure = runtimeSmtpOverride?.secure !== undefined
        ? runtimeSmtpOverride.secure
        : process.env.SMTP_SECURE !== undefined
            ? process.env.SMTP_SECURE === 'true'
            : port === 465;
    const rawUser = runtimeSmtpOverride?.user || envUser || 'support_otp_email@ekosmartdrive.in';
    const rawPass = runtimeSmtpOverride?.pass !== undefined ? runtimeSmtpOverride.pass : envPass || 'Sajid1502';
    const rawFrom = runtimeSmtpOverride?.from || envFrom || `"Ekosmart Verification" <${rawUser}>`;
    const { host, user, pass, from } = normalizeSmtpInput(rawHost, rawUser, rawPass, rawFrom);
    // Default rejectUnauthorized to false so cPanel shared SSL certificates (*.hostingraja.org) work cleanly
    const rejectUnauthorized = runtimeSmtpOverride?.rejectUnauthorized !== undefined
        ? runtimeSmtpOverride.rejectUnauthorized
        : process.env.SMTP_REJECT_UNAUTHORIZED === 'true';
    const hasPassword = Boolean(pass && pass.trim());
    const source = runtimeSmtpOverride
        ? 'database'
        : envPass || envHost || envUser
            ? 'environment'
            : 'default';
    return {
        host,
        port,
        secure,
        user,
        pass,
        from,
        rejectUnauthorized,
        isConfigured: hasPassword,
        hasPassword,
        source,
    };
};
/**
 * Asynchronous config loader that syncs saved SMTP settings from MongoDB across Vercel Serverless instances.
 */
const loadSmtpCredentialsAsync = async (forceRefresh = false) => {
    const now = Date.now();
    if ((forceRefresh || !runtimeSmtpOverride || now - lastDbFetchTime > 30000) && (0, db_1.isDbConnected)()) {
        try {
            const doc = await SmtpConfig_1.SmtpConfig.findOne({ key: 'global_smtp_config' }).select('+pass').lean();
            if (doc) {
                runtimeSmtpOverride = {
                    host: doc.host,
                    port: doc.port,
                    secure: doc.secure,
                    user: doc.user,
                    pass: doc.pass || process.env.SMTP_PASS?.trim() || '',
                    from: doc.from,
                    rejectUnauthorized: Boolean(doc.rejectUnauthorized),
                };
                lastDbFetchTime = now;
            }
        }
        catch {
            // Ignore DB lookup errors and fall back to env vars
        }
    }
    return getInternalSmtpCredentialsSync();
};
exports.loadSmtpCredentialsAsync = loadSmtpCredentialsAsync;
const getSmtpConfigAsync = async (forceRefresh = false) => {
    const creds = await (0, exports.loadSmtpCredentialsAsync)(forceRefresh);
    const { pass, ...publicInfo } = creds;
    return publicInfo;
};
exports.getSmtpConfigAsync = getSmtpConfigAsync;
let cachedTransporter = null;
/**
 * Resets the cached transporter (used when SMTP settings are updated at runtime).
 */
const resetTransporter = () => {
    if (cachedTransporter) {
        try {
            cachedTransporter.close();
        }
        catch {
            // ignore
        }
        cachedTransporter = null;
    }
};
exports.resetTransporter = resetTransporter;
/**
 * Creates a Nodemailer transporter for given credentials.
 * Disables connection pooling on Vercel Serverless to prevent stale frozen socket errors.
 */
const buildTransporter = (creds, overrideHost) => {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const activeHost = overrideHost || creds.host;
    return nodemailer_1.default.createTransport({
        host: activeHost,
        port: creds.port,
        secure: creds.secure,
        auth: {
            user: creds.user,
            pass: creds.pass,
        },
        connectionTimeout: 12000,
        greetingTimeout: 12000,
        socketTimeout: 15000,
        tls: {
            rejectUnauthorized: creds.rejectUnauthorized,
        },
        pool: !isServerless,
        maxConnections: 3,
        maxMessages: 50,
    });
};
const getTransporter = () => {
    const creds = getInternalSmtpCredentialsSync();
    if (!creds.isConfigured) {
        return null;
    }
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isServerless) {
        return buildTransporter(creds);
    }
    if (!cachedTransporter) {
        cachedTransporter = buildTransporter(creds);
    }
    return cachedTransporter;
};
exports.getTransporter = getTransporter;
/**
 * Saves SMTP configuration to MongoDB and updates runtime state immediately.
 */
const saveSmtpConfiguration = async (params) => {
    const existing = await (0, exports.loadSmtpCredentialsAsync)(true);
    const rawPass = params.pass && params.pass.trim()
        ? params.pass.trim()
        : params.useStoredPassword
            ? existing.pass
            : '';
    const port = Number(params.port) || 465;
    const secure = params.secure !== undefined ? Boolean(params.secure) : port === 465;
    const normalized = normalizeSmtpInput(params.host, params.user, rawPass, params.from);
    const host = normalized.host;
    const user = normalized.user;
    const finalPass = normalized.pass;
    const from = normalized.from;
    const rejectUnauthorized = Boolean(params.rejectUnauthorized);
    // Update process.env in current instance
    process.env.SMTP_HOST = host;
    process.env.SMTP_PORT = String(port);
    process.env.SMTP_SECURE = String(secure);
    process.env.SMTP_USER = user;
    if (finalPass) {
        process.env.SMTP_PASS = finalPass;
    }
    process.env.SMTP_FROM = from;
    process.env.SMTP_REJECT_UNAUTHORIZED = String(rejectUnauthorized);
    runtimeSmtpOverride = {
        host,
        port,
        secure,
        user,
        pass: finalPass,
        from,
        rejectUnauthorized,
    };
    lastDbFetchTime = Date.now();
    (0, exports.resetTransporter)();
    if ((0, db_1.isDbConnected)()) {
        await SmtpConfig_1.SmtpConfig.findOneAndUpdate({ key: 'global_smtp_config' }, {
            $set: {
                key: 'global_smtp_config',
                host,
                port,
                secure,
                user,
                pass: finalPass,
                from,
                rejectUnauthorized,
                updatedBy: params.updatedBy || 'Admin',
            },
        }, { upsert: true, new: true });
    }
    return (0, exports.getSmtpConfig)();
};
exports.saveSmtpConfiguration = saveSmtpConfiguration;
/**
 * Verifies the active or candidate SMTP connection.
 */
const verifySmtpConnection = async (customParams) => {
    const baseCreds = await (0, exports.loadSmtpCredentialsAsync)(true);
    const normalizedCustom = customParams
        ? normalizeSmtpInput(customParams.host?.trim() || baseCreds.host, customParams.user?.trim() || baseCreds.user, customParams.pass && customParams.pass.trim()
            ? customParams.pass.trim()
            : customParams.useStoredPassword !== false
                ? baseCreds.pass
                : '', customParams.from?.trim() || baseCreds.from)
        : null;
    const testCreds = customParams && normalizedCustom
        ? {
            host: normalizedCustom.host,
            port: Number(customParams.port) || baseCreds.port,
            secure: customParams.secure !== undefined
                ? Boolean(customParams.secure)
                : (Number(customParams.port) || baseCreds.port) === 465,
            user: normalizedCustom.user,
            pass: normalizedCustom.pass,
            from: normalizedCustom.from,
            rejectUnauthorized: customParams.rejectUnauthorized !== undefined
                ? Boolean(customParams.rejectUnauthorized)
                : baseCreds.rejectUnauthorized,
            isConfigured: false,
            hasPassword: false,
            source: baseCreds.source,
        }
        : baseCreds;
    testCreds.hasPassword = Boolean(testCreds.pass && testCreds.pass.trim());
    testCreds.isConfigured = testCreds.hasPassword;
    const { pass, ...publicConfig } = testCreds;
    if (!testCreds.isConfigured) {
        return {
            success: false,
            message: 'SMTP_PASS is not configured. Please enter your SMTP mailbox password in Admin Settings or set SMTP_PASS in Vercel Environment Variables.',
            config: publicConfig,
        };
    }
    try {
        const transporter = buildTransporter(testCreds);
        await transporter.verify();
        transporter.close();
        return {
            success: true,
            message: `SMTP connection to ${testCreds.host}:${testCreds.port} (${testCreds.user}) verified successfully!`,
            config: publicConfig,
        };
    }
    catch (error) {
        // If host was mail.ekosmartdrivecomplain.in or mail.ekosmartdrive.in and DNS/connection failed, try fallback server62.hostingraja.org
        if (testCreds.host !== 'server62.hostingraja.org' &&
            (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED')) {
            try {
                const fallbackTransporter = buildTransporter(testCreds, 'server62.hostingraja.org');
                await fallbackTransporter.verify();
                fallbackTransporter.close();
                return {
                    success: true,
                    message: `SMTP connection verified via fallback host server62.hostingraja.org:${testCreds.port} (${testCreds.user})!`,
                    config: { ...publicConfig, host: 'server62.hostingraja.org' },
                };
            }
            catch {
                // Ignore fallback error and report original error
            }
        }
        console.error('[SMTP Verify Error]:', error.message || error);
        return {
            success: false,
            message: `SMTP Connection Failed (${testCreds.host}:${testCreds.port}): ${error.message || 'Unknown error'}. Please verify SMTP host, port, mailbox username (${testCreds.user}), and password.`,
            config: publicConfig,
        };
    }
};
exports.verifySmtpConnection = verifySmtpConnection;
/**
 * Helper to dispatch mail with automatic fallback host retry for cPanel / Vercel serverless environments.
 */
const dispatchMailWithFallback = async (creds, mailOptions) => {
    const transporter = buildTransporter(creds);
    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.VERCEL) {
            transporter.close();
        }
        return info;
    }
    catch (primaryErr) {
        try {
            transporter.close();
        }
        catch {
            // ignore
        }
        // Automatic fallback between cPanel mail hostname and HostingRaja server hostname
        const fallbackHost = creds.host === 'server62.hostingraja.org' ? 'mail.ekosmartdrive.in' : 'server62.hostingraja.org';
        if (creds.host.includes('ekosmartdrive') ||
            creds.host.includes('hostingraja.org')) {
            try {
                const fallbackTransporter = buildTransporter(creds, fallbackHost);
                const info = await fallbackTransporter.sendMail(mailOptions);
                fallbackTransporter.close();
                return info;
            }
            catch {
                // Throw primary error
            }
        }
        throw primaryErr;
    }
};
/**
 * Sends a branded Ekosmart OTP verification email via SMTP.
 */
const sendOtpEmail = async (email, otp, purpose = 'General') => {
    const creds = await (0, exports.loadSmtpCredentialsAsync)();
    let purposeTitle = 'Verification Code';
    let purposeText = 'verifying your request';
    if (purpose === 'Registration') {
        purposeTitle = 'Customer Account Registration';
        purposeText = 'registering a new Ekosmart customer account';
    }
    else if (purpose === 'Login') {
        purposeTitle = 'Customer Portal Login Verification';
        purposeText = 'logging into your Ekosmart customer account';
    }
    else if (purpose === 'Complaint') {
        purposeTitle = 'Service Complaint Verification';
        purposeText = 'submitting a service or battery complaint ticket';
    }
    const subject = `Your Ekosmart Verification Code: ${otp} (Valid for 5 minutes)`;
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
                    <div style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 900; font-size: 11px; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      Official Ekosmart Portal
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      EKOSMART EV BATTERY SOLUTION
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #a7f3d0;">
                      Clean Energy & Smart Electric Mobility • Kota Central Plant
                    </p>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 36px 32px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a;">
                      ${purposeTitle}
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                      Hello, we received a request for ${purposeText} for your Ekosmart customer account associated with <strong style="color: #0f172a;">${email}</strong>. Use the 6-digit verification code below to proceed:
                    </p>

                    <!-- OTP Display Box -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px dashed #059669; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                      <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #047857; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                        Your 6-Digit Verification Code
                      </span>
                      <div style="font-size: 38px; font-weight: 900; font-family: 'Courier New', Courier, monospace; letter-spacing: 10px; color: #064e3b; margin: 4px 0; padding: 8px 12px; display: inline-block;">
                        ${otp}
                      </div>
                      <div style="margin-top: 10px; font-size: 12px; font-weight: 700; color: #b45309; background-color: #fef3c7; display: inline-block; padding: 4px 12px; border-radius: 999px;">
                        ⏱️ Valid for 5 minutes only
                      </div>
                    </div>

                    <!-- Security Guidance -->
                    <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #334155;">
                        <strong>Security Warning:</strong> Never share this code with anyone. Ekosmart representatives will never ask for your OTP over phone, WhatsApp, or email.
                      </p>
                    </div>

                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                      If you did not request this verification code, please ignore this email. No changes will be made to your account.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px 30px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                    <p style="margin: 0; color: #e2e8f0; font-weight: bold;">
                      EKOSMART CLEAN ENERGY & GREEN MOBILITY
                    </p>
                    <p style="margin: 4px 0 0 0;">
                      Plot No. 14, Electronic Complex, Road No. 1, IPIA, Kota, Rajasthan - 324005
                    </p>
                    <p style="margin: 4px 0 0 0; color: #34d399;">
                      Central Helpline: +91 8949049003 | Email: support_otp_email@ekosmartdrivecomplain.in
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 10px; color: #64748b; font-family: monospace;">
                      GSTIN: 08DTUPM4205B1Z0 | Automated System Message
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
    const text = `Your Ekosmart ${purpose} verification code is: ${otp}\n\nThis code is valid for 5 minutes only.\nNever share this code with anyone.\n\nEkosmart Clean Energy & Green Mobility - Kota, Rajasthan\nHelpline: +91 8949049003`;
    if (!creds.isConfigured) {
        console.error(`[Ekosmart OTP Service] SMTP_PASS is not configured. Cannot dispatch OTP for ${purpose} to [${email}].`);
        return {
            success: false,
            error: 'SMTP email server is not configured (SMTP_PASS missing). Please configure SMTP in Admin Settings or Vercel Environment Variables.',
        };
    }
    try {
        const info = await dispatchMailWithFallback(creds, {
            from: creds.from,
            to: email,
            subject,
            text,
            html,
        });
        console.log(`[Ekosmart OTP Service] >>> OTP verification email dispatched to [${email}] (Message ID: ${info.messageId}) <<<`);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error(`[Ekosmart OTP Service] Error dispatching OTP email to [${email}]:`, error.message || error);
        return { success: false, error: error.message || 'SMTP delivery failed' };
    }
};
exports.sendOtpEmail = sendOtpEmail;
const sendInvoiceSoftCopyEmail = async (params) => {
    const { to, bill, customer, referralCode, coinsAwarded, customMatter, customSubject, templateConfig } = params;
    if (!to || !to.includes('@')) {
        return { success: false, message: 'Valid recipient email address is required.' };
    }
    const customerName = bill.customerName || customer?.name || 'Valued Customer';
    const customerMobile = bill.customerMobile || customer?.mobile || '';
    const customerAddress = bill.customerAddress || customer?.address || '';
    const refCode = referralCode ||
        customer?.referralCode ||
        bill.referralCodeUsed ||
        'EKO' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const invoiceNumber = bill.invoiceNumber || 'EBS-INV';
    const invoiceDate = bill.createdAt
        ? new Date(bill.createdAt).toLocaleDateString('en-IN')
        : new Date().toLocaleDateString('en-IN');
    const grandTotal = bill.grandTotal !== undefined ? bill.grandTotal.toLocaleString('en-IN') : '0';
    const subtotal = bill.subtotal !== undefined ? bill.subtotal.toLocaleString('en-IN') : '0';
    const taxTotal = bill.taxTotal !== undefined ? bill.taxTotal.toLocaleString('en-IN') : '0';
    const discountTotal = bill.discountTotal ? bill.discountTotal.toLocaleString('en-IN') : '0';
    const paymentMode = bill.paymentMode || 'UPI';
    const paymentStatus = bill.paymentStatus || 'Paid';
    const showroom = bill.showroom || 'Ekosmart Showroom Counter';
    const rewardCoins = coinsAwarded !== undefined
        ? Number(coinsAwarded)
        : bill.rewardCoinsAwarded || templateConfig?.softBillEmailConfig?.rewardCoins || 500;
    const welcomeCoins = templateConfig?.softBillEmailConfig?.welcomeCoins || 500;
    const referrerCoins = templateConfig?.softBillEmailConfig?.referrerCoins || 100;
    const subject = customSubject ||
        templateConfig?.softBillEmailConfig?.emailSubject?.replace('{{invoiceNumber}}', invoiceNumber) ||
        `Official EKOSMART Showroom GST Tax Invoice & Soft Copy - ${invoiceNumber}`;
    const rawMatter = customMatter ||
        templateConfig?.softBillEmailConfig?.emailMatter ||
        `Dear {{customerName}},\n\nThank you for choosing EKOSMART Clean Energy & Green Mobility. Please find attached below your official Soft Copy GST Tax Invoice, Warranty Certificate registration, and exclusive Customer Referral Code.\n\nYour Unique Referral Code is: {{referralCode}}\nShare this code with your friends & family so they receive {{welcomeCoins}} Coins, and you earn {{referrerCoins}} Coins on their qualifying purchase!`;
    const parsedMatter = rawMatter
        .replace(/\{\{customerName\}\}/g, customerName)
        .replace(/\{\{invoiceNumber\}\}/g, invoiceNumber)
        .replace(/\{\{referralCode\}\}/g, refCode)
        .replace(/\{\{grandTotal\}\}/g, `₹${grandTotal}`)
        .replace(/\{\{showroom\}\}/g, showroom)
        .replace(/\{\{coins\}\}/g, String(rewardCoins))
        .replace(/\{\{rewardCoins\}\}/g, String(rewardCoins))
        .replace(/\{\{welcomeCoins\}\}/g, String(welcomeCoins))
        .replace(/\{\{referrerCoins\}\}/g, String(referrerCoins))
        .replace(/\n/g, '<br/>');
    const itemsHtml = (bill.items || [])
        .map((it, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <td style="padding: 10px 8px; font-weight: bold; color: #1e293b;">${idx + 1}. ${it.productName || 'Battery Unit'}</td>
          <td style="padding: 10px 8px; font-family: monospace; color: #047857; font-weight: bold;">${it.batterySerial || it.productSerial || 'N/A'}</td>
          <td style="padding: 10px 8px; text-align: center; color: #475569;">${it.quantity || 1}</td>
          <td style="padding: 10px 8px; text-align: right; color: #475569;">₹${(it.unitPrice || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #0f172a;">₹${(it.totalAmount || 0).toLocaleString('en-IN')}</td>
        </tr>
      `)
        .join('');
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 24px 30px; text-align: left; color: #ffffff;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #10b981;">EKOSMART EV BATTERY SOLUTION</h1>
                    <p style="margin: 4px 0 0 0; font-size: 11px; color: #cbd5e1;">Clean Energy & Smart Electric Mobility • Kota Central Plant</p>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #94a3b8; font-family: monospace;">GSTIN: 08DTUPM4205B1Z0 | CIN: U31909RJ2023PTC085432</p>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 8px; font-family: monospace;">
                      ${invoiceNumber}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 24px 30px 16px 30px;">
              <div style="font-size: 13px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
                ${parsedMatter}
              </div>
            </td>
          </tr>

          <!-- Bill Summary Card -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <tr>
                  <td width="50%" valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Customer Details</p>
                    <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">${customerName}</p>
                    <p style="margin: 2px 0; font-size: 12px; color: #475569;">${customerMobile}</p>
                    ${customerAddress ? `<p style="margin: 2px 0; font-size: 11px; color: #64748b;">${customerAddress}</p>` : ''}
                  </td>
                  <td width="50%" valign="top" align="right">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Invoice Details</p>
                    <p style="margin: 0; font-size: 12px; color: #0f172a;">Date: <strong>${invoiceDate}</strong></p>
                    <p style="margin: 2px 0; font-size: 12px; color: #0f172a;">Counter: <strong>${showroom}</strong></p>
                    <p style="margin: 2px 0; font-size: 12px; color: #0f172a;">Status: <span style="color: #059669; font-weight: bold;">${paymentStatus}</span> (${paymentMode})</p>
                  </td>
                </tr>
              </table>

              <!-- Product Line Items -->
              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
                <tr style="background-color: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
                  <th style="padding: 10px 8px;">Product</th>
                  <th style="padding: 10px 8px;">Serial No.</th>
                  <th style="padding: 10px 8px; text-align: center;">Qty</th>
                  <th style="padding: 10px 8px; text-align: right;">Rate</th>
                  <th style="padding: 10px 8px; text-align: right;">Amount</th>
                </tr>
                ${itemsHtml}
              </table>

              <!-- Financial Totals -->
              <table width="100%">
                <tr>
                  <td width="60%"></td>
                  <td width="40%">
                    <table width="100%" style="font-size: 12px; color: #334155;">
                      <tr>
                        <td style="padding: 2px 0;">Subtotal:</td>
                        <td align="right" style="padding: 2px 0; font-family: monospace;">₹${subtotal}</td>
                      </tr>
                      ${discountTotal !== '0'
        ? `
                        <tr>
                          <td style="padding: 2px 0; color: #dc2626;">Discount:</td>
                          <td align="right" style="padding: 2px 0; color: #dc2626; font-family: monospace;">-₹${discountTotal}</td>
                        </tr>
                      `
        : ''}
                      <tr>
                        <td style="padding: 2px 0;">GST / Tax:</td>
                        <td align="right" style="padding: 2px 0; font-family: monospace;">₹${taxTotal}</td>
                      </tr>
                      <tr style="border-top: 1.5px solid #0f172a; font-size: 14px; font-weight: bold; color: #0f172a;">
                        <td style="padding-top: 4px;">Grand Total:</td>
                        <td align="right" style="padding-top: 4px; color: #059669; font-family: monospace;">₹${grandTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Exclusive Referral Code & Customer Wallet Box -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%); border: 1.5px dashed #f59e0b; border-radius: 14px; padding: 18px; text-align: center;">
                <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #92400e; letter-spacing: 0.5px;">🎁 Your Unique Referral Reward Code</span>
                <div style="font-size: 24px; font-weight: 900; font-family: monospace; letter-spacing: 4px; color: #78350f; margin: 8px 0; padding: 6px; background-color: #ffffff; border-radius: 8px; display: inline-block; border: 1px solid #fde68a;">
                  ${refCode}
                </div>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #92400e; line-height: 1.4;">
                  Share this code with friends & colleagues. When they register, they get <strong>${welcomeCoins} Welcome Coins</strong> and you get <strong>${referrerCoins} Referral Coins</strong> on their purchase!
                </p>
                ${rewardCoins > 0
        ? `
                  <div style="margin-top: 10px; font-size: 11px; font-weight: bold; color: #b45309; background-color: #fef9c3; padding: 4px 10px; border-radius: 6px; display: inline-block;">
                    🪙 +${rewardCoins} Coins Credited to Your EKOSMART Digital Wallet
                  </div>
                `
        : ''}
              </div>
            </td>
          </tr>

          <!-- Footer Contact & Legal -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0; color: #e2e8f0; font-weight: bold;">EKOSMART EV BATTERY SOLUTION • Kota, Rajasthan</p>
              <p style="margin: 2px 0 0 0;">Plot No. 14, Electronic Complex, Road No. 1, IPIA, Kota - 324005</p>
              <p style="margin: 4px 0 0 0; color: #10b981;">Helpline: +91 8949049003 / +91 9549730483 | Email: Smartdrive5640@gmail.com</p>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #64748b;">This is an authorized computer-generated soft copy tax invoice.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
    const creds = await (0, exports.loadSmtpCredentialsAsync)();
    if (creds.isConfigured) {
        try {
            await dispatchMailWithFallback(creds, {
                from: creds.from,
                to,
                subject,
                html,
            });
            console.log(`[Ekosmart Soft Copy Email Service] >>> Soft copy invoice ${invoiceNumber} dispatched to ${to} via SMTP <<<`);
            return {
                success: true,
                message: `Soft copy bill and referral code emailed successfully to ${to}.`,
            };
        }
        catch (err) {
            console.error(`[Ekosmart Soft Copy Email Service] Error sending invoice to ${to}:`, err.message || err);
            return {
                success: false,
                message: `Invoice generated, but email delivery encountered an error: ${err.message || 'SMTP delivery failed'}`,
            };
        }
    }
    console.log(`[Ekosmart Soft Copy Email Service] >>> Soft Copy Invoice [${invoiceNumber}] & Referral Code [${refCode}] simulated for [${to}] (SMTP not configured) <<<`);
    return {
        success: true,
        message: `Soft copy bill and referral code recorded for ${to}.`,
    };
};
exports.sendInvoiceSoftCopyEmail = sendInvoiceSoftCopyEmail;
