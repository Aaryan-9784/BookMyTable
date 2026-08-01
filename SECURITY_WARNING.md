# ⚠️ CRITICAL SECURITY WARNING

## 🔴 IMMEDIATE ACTIONS REQUIRED

If you have previously committed sensitive files to this repository, you MUST:

### 1. Rotate ALL Credentials Immediately

The following credentials need to be regenerated and updated:

- **MongoDB Atlas Password**: Change at https://cloud.mongodb.com
- **Supabase Service Role Key**: Regenerate at https://supabase.com/dashboard/project/_/settings/api
- **Gmail App Password**: Revoke and create new at https://myaccount.google.com/apppasswords
- **Resend API Key**: Regenerate at https://resend.com/api-keys
- **Cloudinary API Credentials**: Rotate at https://cloudinary.com/console/settings/security
- **JWT Secret**: Generate new secure random string (min 64 characters)
- **AWS EC2 Keys**: If .pem file was committed, regenerate key pair

### 2. Clean Git History

If sensitive files were previously committed, clean the git history:

```bash
# Remove sensitive files from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch server/.env client/.env bookmytable-key.pem' \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote (WARNING: This rewrites history)
git push origin --force --all
git push origin --force --tags
```

**Alternative using BFG Repo-Cleaner (faster):**

```bash
# Install BFG: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files '.env'
bfg --delete-files '*.pem'
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

### 3. Enable Secret Scanning

- Enable GitHub Secret Scanning: Repository Settings → Security → Secret scanning
- Add pre-commit hooks to prevent future commits of secrets
- Use tools like `git-secrets` or `detect-secrets`

## 🛡️ Current Security Measures

This project now implements:

✅ Environment variables properly gitignored
✅ Rate limiting on all API endpoints
✅ CSRF protection
✅ Password complexity requirements
✅ Input sanitization (XSS prevention)
✅ Secure JWT implementation
✅ Proper logging without sensitive data
✅ Redis-based OTP storage

## 📋 Security Checklist for Deployment

Before deploying to production:

- [ ] All credentials rotated and updated in environment variables
- [ ] Git history cleaned of sensitive data
- [ ] `.env` files contain only placeholders (never real credentials)
- [ ] Database uses strong, unique credentials
- [ ] JWT_SECRET is at least 64 random characters
- [ ] Rate limiting configured appropriately
- [ ] CORS origins restricted to production domains only
- [ ] Helmet security headers enabled
- [ ] MongoDB Atlas IP whitelist configured
- [ ] AWS security groups properly configured
- [ ] SSL/TLS certificates valid
- [ ] Monitoring and alerting configured

## 📞 Security Contact

If you discover a security vulnerability, please email: [your-security-email]

Do not create public GitHub issues for security vulnerabilities.

---

**Last Updated:** 2026-08-02
**Security Review Status:** In Progress
