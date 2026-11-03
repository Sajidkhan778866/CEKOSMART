# Ekosmart Platform - cPanel Production Deployment & SMTP OTP Guide

This comprehensive guide details the step-by-step procedure to deploy the entire **Ekosmart EV Battery Solution & Spare Parts** platform on a standard **cPanel hosting account** and configure production **cPanel SMTP** for automatic, secure OTP verification emails.

---

## Quick Deployment Using Pre-Built cPanel ZIP Packages (`cpanel-ready-zips/`)

All files have been pre-compiled, assembled with Apache `.htaccess` SPA routing rules, and packaged with Linux/POSIX paths inside the `cpanel-ready-zips/` directory:

| ZIP Archive | Target Folder in cPanel File Manager | Contents |
| :--- | :--- | :--- |
| **`1-public_html-complete.zip`** | `/home/<user>/public_html/` | Customer Web App (`/`), Admin Portal (`/admin`), Employee Portal (`/employee`), API folder (`/api/.htaccess`), and all `.htaccess` rules in one archive |
| **`2-backend-ekosmart-api.zip`** | `/home/<user>/ekosmart-api/` | Compiled Express API (`dist/`), Passenger startup entry (`app.js`), `package.json`, `package-lock.json`, `.env`, `uploads/`, and `tmp/restart.txt` |
| **`frontend-only.zip`** | `public_html/` | Customer Website standalone build (optional if deploying portals separately) |
| **`admin-portal-only.zip`** | `public_html/admin/` or subdomain root | Admin Portal standalone build (supports both `/admin` subfolder and `admin.` subdomain) |
| **`employee-portal-only.zip`** | `public_html/employee/` or subdomain root | Employee Portal standalone build (supports both `/employee` subfolder and `employee.` subdomain) |

### 3-Minute Fast Track Deployment
1. **Upload Frontends**: Open **cPanel File Manager** -> navigate to `public_html/` -> upload `cpanel-ready-zips/1-public_html-complete.zip` -> right-click and click **Extract**.
2. **Setup Node.js App**: Open **Software** -> **Setup Node.js App** -> **Create Application**:
   - **Node.js version**: `18.x` or `20.x` ( or `22.x`)
   - **Application mode**: `Production`
   - **Application root**: `ekosmart-api`
   - **Application URL**: `<your-domain>/api` (or `api.<your-domain>`)
   - **Application startup file**: `app.js`
3. **Upload Backend**: In **cPanel File Manager**, navigate to `/home/<user>/ekosmart-api/` -> upload `cpanel-ready-zips/2-backend-ekosmart-api.zip` -> click **Extract**.
4. **Install & Restart**: Edit `/home/<user>/ekosmart-api/.env` with your MongoDB Atlas `DATABASE_URL`, then in **Setup Node.js App** click **Run NPM Install** and **Restart**.

---

## Architecture Overview

| Component | Technology | cPanel Target Location | Deployment Strategy |
| :--- | :--- | :--- | :--- |
| **Customer Web App** | React / Vite SPA | `public_html/` (or main domain) | Static files from `frontend/dist/` with `.htaccess` SPA router |
| **Admin Portal** | React / Vite SPA | `admin.ekosmartdrivecomplain.in` (or `public_html/admin/`) | Static files from `admin-portal/dist/` with `.htaccess` |
| **Employee Portal** | React / Vite SPA | `employee.ekosmartdrivecomplain.in` (or `public_html/employee/`) | Static files from `employee-portal/dist/` with `.htaccess` |
| **Backend API** | Node.js / Express / TypeScript | Subdomain `api.ekosmartdrivecomplain.in` or Passenger app | cPanel "Setup Node.js App" with `app.js` entry point |
| **Database** | MongoDB Atlas / Remote MongoDB | External Cloud / cPanel MongoDB | Cloud Connection string in backend `.env` |
| **OTP & Invoicing Email** | Nodemailer / cPanel Exim SMTP | `support_otp_email@ekosmartdrivecomplain.in` | SMTP SSL (Port 465) or STARTTLS (Port 587) |

---

## Step 1: Create & Configure cPanel Email Account (SMTP)

### 1.1 Create the Mailbox in cPanel
1. Log into your **cPanel Dashboard**.
2. Navigate to **Email** > **Email Accounts**.
3. Click **+ Create**.
4. Configure the account:
   - **Domain**: `ekosmartdrivecomplain.in`
   - **Username**: `support_otp_email` (Full email: `support_otp_email@ekosmartdrivecomplain.in`)
   - **Password**: Generate a strong password (keep this safe for your `.env` configuration).
   - **Storage Space**: 1024 MB or Unlimited.
5. Click **+ Create**.

### 1.2 Note Mail Server Connection Details
Under **Email Accounts**, click **Connect Devices** next to `support_otp_email@ekosmartdrivecomplain.in`:
- **Outgoing Mail Server (SMTP)**: `mail.ekosmartdrivecomplain.in`
- **SMTP Port (SSL/TLS - Recommended)**: `465`
- **SMTP Port (STARTTLS - Alternative)**: `587`
- **Authentication**: Required (Username is full email address, Password is mailbox password)

### 1.3 Configure DNS Records for 100% Deliverability (SPF, DKIM, DMARC)
To guarantee OTP emails land directly in customer inboxes rather than spam folders:
1. In cPanel, navigate to **Email** > **Email Deliverability**.
2. Locate `ekosmartdrivecomplain.in` and click **Manage**.
3. **DKIM**: Ensure DKIM is enabled and copy the generated TXT record into your domain's DNS.
4. **SPF**: Ensure the SPF TXT record includes your server:
   ```txt
   v=spf1 +a +mx +ip4:<YOUR_SERVER_IP> ~all
   ```
5. **DMARC**: In cPanel **Zone Editor**, add a TXT record for `_dmarc.ekosmartdrivecomplain.in`:
   ```txt
   v=DMARC1; p=quarantine; sp=quarantine; pct=100;
   ```

---

## Step 2: Deploy the Backend API via "Setup Node.js App"

### 2.1 Prepare Backend Files Locally
Ensure the backend is built:
```powershell
npm run build --prefix backend
```
This generates the compiled JavaScript files inside `backend/dist/`.

The files required for cPanel deployment from the `backend/` directory are:
- `backend/dist/` (Entire folder containing compiled code)
- `backend/package.json`
- `backend/app.js` (The cPanel Phusion Passenger entry point)
- `backend/.env` (Configured with production secrets)

### 2.2 Create Node.js Application in cPanel
1. In cPanel, open **Software** > **Setup Node.js App**.
2. Click **Create Application**.
3. Fill in the fields:
   - **Node.js version**: `18.x` or `20.x` (LTS recommended)
   - **Application mode**: `Production`
   - **Application root**: `ekosmart-api` (This creates a folder `/home/<user>/ekosmart-api`)
   - **Application URL**: Select `api.ekosmartdrivecomplain.in` or your main domain path
   - **Application startup file**: `app.js`
4. Click **Create**.

### 2.3 Upload Backend Code
1. Open **cPanel File Manager**.
2. Navigate to your application root directory (e.g. `/home/<user>/ekosmart-api/`).
3. Upload:
   - `dist/` folder
   - `package.json`
   - `app.js`
   - `.env`
4. In cPanel **Setup Node.js App**, click **Run NPM Install** (or enter the cPanel Terminal and run `npm install --omit=dev`).

### 2.4 Configure Environment Variables in cPanel
You can either define these in `/home/<user>/ekosmart-api/.env` or in the **Environment variables** section inside cPanel's Node.js manager:

```env
NODE_ENV=production
PORT=5000

# MongoDB Database URI (Ensure your cPanel server IP is whitelisted in MongoDB Atlas)
DATABASE_URL=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/ekosmart?retryWrites=true&w=majority

# JWT Token Secret
JWT_SECRET=ekosmart_super_secure_production_jwt_secret_2026_ebs

# cPanel SMTP Configuration
SMTP_HOST=mail.ekosmartdrivecomplain.in
SMTP_PORT=465
SMTP_USER=support_otp_email@ekosmartdrivecomplain.in
SMTP_PASS=YourStrongMailboxPasswordHere
SMTP_FROM="Ekosmart Verification" <support_otp_email@ekosmartdrivecomplain.in>
SMTP_REJECT_UNAUTHORIZED=true
```

### 2.5 Restart the Node.js App
In cPanel **Setup Node.js App**, click **Restart**.

---

## Step 3: Deploy the Frontend Applications

### 3.1 Build Frontend Projects
Run the monorepo build command:
```powershell
npm run build
```
This builds all frontends and copies the optimized `.htaccess` file directly into each `dist/` directory.

### 3.2 Uploading Customer Website (`frontend/dist`)
1. Open **cPanel File Manager** > `public_html/`.
2. Upload and extract the contents of `frontend/dist/`.
3. Verify that `index.html`, `assets/`, and `.htaccess` are directly inside `public_html/`.

### 3.3 Uploading Admin Portal (`admin-portal/dist`)
**Option A: Subdomain (Recommended)**
1. In cPanel, go to **Domains** > **Domains** > **Create A New Domain**.
2. Enter `admin.ekosmartdrivecomplain.in` with document root `public_html/admin/` or `subdomains/admin/`.
3. Upload and extract the contents of `admin-portal/dist/` into that folder.

**Option B: Subfolder**
- Upload to `public_html/admin/`.

### 3.4 Uploading Employee Portal (`employee-portal/dist`)
1. In cPanel, create domain/subdomain `employee.ekosmartdrivecomplain.in` with document root `public_html/employee/` or `subdomains/employee/`.
2. Upload and extract the contents of `employee-portal/dist/` into that folder.

### 3.5 How `.htaccess` SPA Routing Works
Each frontend includes a pre-configured `.htaccess` file that:
1. Rewrites non-file and non-directory requests to `index.html` so client-side React Router paths (e.g. `/customer/login`, `/complaint/register`, `/warranty/check`) work seamlessly on page refresh.
2. Automatically redirects HTTP requests to HTTPS.
3. Sets security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`).
4. Prevents caching of `index.html` so new updates are loaded instantly, while caching static JS/CSS assets for performance.
5. Enables Gzip/Brotli compression for fast mobile loading.

---

## Step 4: End-to-End Verification & SMTP Diagnostics

### 4.1 Automated SMTP Diagnostic Endpoint
We have implemented a built-in diagnostic endpoint in the backend. You can verify your SMTP configuration without writing any code:

#### Test Connection Only:
Send a `GET` or `POST` request to:
```
https://api.ekosmartdrivecomplain.in/api/v1/customers/auth/test-smtp
```
**Expected Response:**
```json
{
  "success": true,
  "message": "SMTP connection to mail.ekosmartdrivecomplain.in:465 via support_otp_email@ekosmartdrivecomplain.in successfully verified!",
  "smtp": {
    "host": "mail.ekosmartdrivecomplain.in",
    "port": 465,
    "secure": true,
    "user": "support_otp_email@ekosmartdrivecomplain.in",
    "from": "\"Ekosmart Verification\" <support_otp_email@ekosmartdrivecomplain.in>",
    "isConfigured": true
  }
}
```

#### Test Live OTP Email Delivery:
Send a `POST` request with a JSON body specifying your test recipient email:
```bash
curl -X POST https://api.ekosmartdrivecomplain.in/api/v1/customers/auth/test-smtp \
  -H "Content-Type: application/json" \
  -d '{"email": "your_personal_email@example.com"}'
```
This triggers the live cPanel SMTP engine to dispatch a test 6-digit branded OTP email to your inbox and confirms real-time delivery.

### 4.2 Security & Rate Limiting Enforcement
The OTP system is protected by the following safeguards:
- **Cryptographic Randomness**: Generated using Node.js `crypto.randomInt(100000, 1000000)`.
- **5-Minute Expiry**: OTPs expire strictly 5 minutes after issuance.
- **Rate Limiting**: Maximum 3 OTP requests per 5 minutes per user/email, with a 45-second resend cooldown.
- **Lockout Safeguard**: Maximum 5 invalid attempts allowed before the OTP is invalidated.
- **Immediate Invalidation**: The OTP is purged from memory cache immediately after successful verification to prevent replay attacks.
- **Credential Protection**: When `SMTP_PASS` is set or in production, `debugOtp` is completely stripped from API responses.

---

## Step 5: Troubleshooting & Common Pitfalls

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **503 Service Unavailable on Backend** | Phusion Passenger could not find entry point or port was incorrectly cast | Verify `app.js` exists in the application root and points to `./dist/server.js`. Our `server.ts` automatically handles Passenger UNIX sockets. |
| **404 Not Found on Page Refresh in Frontend** | Apache `.htaccess` missing or `mod_rewrite` disabled | Ensure `.htaccess` is present in `public_html/` and hidden files are visible in cPanel File Manager (Settings > Show Hidden Files). |
| **SMTP Authentication Error (`EAUTH`)** | Incorrect mailbox password or username | Verify in cPanel **Email Accounts** that the username is the full email (`support_otp_email@ekosmartdrivecomplain.in`), not just `support_otp_email`. |
| **SMTP Timeout (`ETIMEDOUT`)** | Outbound port blocked by hosting firewall | Try port `587` with STARTTLS instead of `465`, or check if your cPanel host blocks external SMTP connections (SMTP Restrictions in WHM). |
| **Self-Signed Certificate Warning (`DEPTH_ZERO_SELF_SIGNED_CERT`)** | cPanel AutoSSL not yet issued for `mail.ekosmartdrivecomplain.in` | Run cPanel AutoSSL or temporarily set `SMTP_REJECT_UNAUTHORIZED=false` until AutoSSL finishes installing certificates. |
| **MongoDB Connection Timeout** | MongoDB Atlas IP Access List does not allow cPanel IP | In MongoDB Atlas, go to **Network Access** > **Add IP Address** > Enter your cPanel server's public IP address (or `0.0.0.0/0` with strong password). |

---

## Step 6: Database Backups & Restoration Procedures

Because the production database is hosted on **MongoDB Atlas** (or an external MongoDB cluster), follow these procedures for regular backups and point-in-time recovery:

### 6.1 Automated Cloud Backups (MongoDB Atlas)
1. Log into **MongoDB Atlas** > **Database** > **Backup** tab for your cluster.
2. Enable **Cloud Backup** (or Scheduled Snapshots on M2/M5/M10+ clusters) to automatically retain daily snapshots.
3. For Free Tier (M0) clusters, use `mongodump` / `mongorestore` via a scheduled cron job or local administrative machine:

```bash
# Full Database Backup (Export BSON archive)
mongodump --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ekosmart" --archive="ekosmart_backup_$(date +%F).gz" --gzip

# Full Database Restore
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ekosmart" --archive="ekosmart_backup_YYYY-MM-DD.gz" --gzip --drop
```

### 6.2 Application-Level CSV / Excel Exports
Administrators can also export human-readable CSV/Excel backups directly from the **Admin Portal** (`/admin`) at any time:
- **Billing & GST Invoices**: `/api/v1/billing/export/csv`
- **Stock & Inventory**: `/api/v1/stock/export/csv`
- **Customers, Referrals & Wallet Ledger**: `/api/v1/customers/export/csv`, `/api/v1/customers/referrals/export/csv`, `/api/v1/customers/wallet/export/csv`
- **Complaints & Warranties**: `/api/v1/complaints/export`, `/api/v1/warranty/export/csv`
- **Employee Directory**: `/api/v1/admin/employees/export`

---

## Deployment Checklist

- [x] Nodemailer & cPanel SMTP service configured (`backend/src/services/email.service.ts`)
- [x] Secure OTP generation & 5-minute expiry implemented (`backend/src/controllers/customer.controller.ts`)
- [x] Built-in SMTP diagnostic route registered (`GET/POST /api/v1/customers/auth/test-smtp`)
- [x] cPanel startup entry point created (`backend/app.js`)
- [x] Dynamic Passenger UNIX socket & port handling enabled (`backend/src/server.ts`)
- [x] Apache `.htaccess` SPA router created for `frontend`, `admin-portal`, and `employee-portal`
- [x] Monorepo full build verified (`npm run build`) with zero compilation errors
- [ ] Create mailbox `support_otp_email@ekosmartdrivecomplain.in` in cPanel
- [ ] Configure `SMTP_PASS` in cPanel `.env` or Node.js App environment variables
- [ ] Upload compiled `dist` files to cPanel and verify live OTP delivery
