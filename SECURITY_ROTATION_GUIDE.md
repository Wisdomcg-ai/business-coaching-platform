# API Key Rotation Guide

## 🚨 CRITICAL: Your API keys were exposed and need to be rotated immediately!

This guide will walk you through rotating all your API credentials safely.

---

## Step 1: Rotate Supabase Keys

### 1.1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project: `uudfstpvndurzwnapibf`
3. Go to **Project Settings** → **API**

### 1.2: Reset Service Role Key
1. Scroll to **Service Role Key** section
2. Click **"Reveal"** to see current key
3. Click **"Reset Service Role Key"** or **"Generate new key"**
4. Copy the new key immediately (you won't see it again!)
5. Update your `.env.local` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<new_key_here>
   ```

### 1.3: Anon Key
The Anon key typically doesn't need rotation unless compromised. However:
- If you see a "Reset" option, use it
- Copy the new value to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<new_key_here>
  ```

### 1.4: Project URL
This doesn't need changing:
```
NEXT_PUBLIC_SUPABASE_URL=https://uudfstpvndurzwnapibf.supabase.co
```

---

## Step 2: Rotate OpenAI Key

### 2.1: Go to OpenAI Dashboard
1. Visit: https://platform.openai.com/api-keys
2. Log in to your account

### 2.2: Create New Key
1. Click **"+ Create new secret key"**
2. Give it a name: `business-coaching-platform-$(date +%Y-%m)`
3. Click **"Create secret key"**
4. **IMPORTANT:** Copy the key immediately (shown only once!)
5. Update your `.env.local` file:
   ```
   OPENAI_API_KEY=sk-proj-...your_new_key...
   ```

### 2.3: Delete Old Key
1. Find the old key in the list (starts with `sk-proj-NMQ9...`)
2. Click the **trash icon** or **"Delete"** button
3. Confirm deletion

---

## Step 3: Update Local Environment

### 3.1: Update .env.local
Edit `/Users/mattmalouf/Desktop/business-coaching-platform/.env.local`:

```bash
# Open in your editor
code .env.local  # VS Code
# or
nano .env.local  # Terminal editor
```

Replace the old values with your new keys from Step 1 and Step 2.

### 3.2: Verify Format
Your `.env.local` should look like this:

```
NEXT_PUBLIC_SUPABASE_URL=https://uudfstpvndurzwnapibf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...NEW_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...NEW_KEY_HERE
OPENAI_API_KEY=sk-proj-...NEW_KEY_HERE
```

---

## Step 4: Test That Everything Works

### 4.1: Start Dev Server
```bash
npm run dev
```

### 4.2: Test Authentication
1. Open: http://localhost:3000
2. Try to log in with your credentials
3. Should successfully authenticate

### 4.3: Test Database Access
1. Navigate to Dashboard
2. Should see your business data loading
3. Check browser console (F12) - no errors

### 4.4: Test AI Features
1. Go to any page with AI assistance
2. Try using AI suggestion feature
3. Should work without errors

### 4.5: Check Logs
Look for these success indicators:
- ✅ No "Invalid API key" errors
- ✅ No "Authentication failed" errors
- ✅ Data loads correctly
- ✅ AI features respond

---

## Step 5: Update Production Environment (If Deployed)

### If using Vercel:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update these variables:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
5. Click **Save**
6. Redeploy: **Deployments** → **...** → **Redeploy**

### If using other platforms:
- Update environment variables in your hosting dashboard
- Redeploy or restart your application

---

## Step 6: Verify .gitignore Protection

### 6.1: Check .gitignore
```bash
cat .gitignore | grep -E "\.env"
```

Should see:
```
.env*
.env.local
```

### 6.2: Verify Not in Git
```bash
git ls-files | grep .env.local
```

Should return **nothing** (empty output = good!)

### 6.3: Check Git History
```bash
git log --all --full-history --oneline -- .env.local
```

If this shows commits, your keys were previously committed! In that case:
1. Your repository history contains old keys
2. You MUST rotate as described above
3. Consider using `git filter-branch` or BFG Repo-Cleaner to remove history (advanced)

---

## Step 7: Commit the Changes

```bash
# Ensure you're on the security branch
git checkout security/rotate-credentials

# Add only the .env.example file (NOT .env.local!)
git add .env.example
git add SECURITY_ROTATION_GUIDE.md

# Commit
git commit -m "security: Add .env.example template and rotation guide

- Created .env.example with placeholder values
- Added comprehensive rotation guide
- .env.local is protected by .gitignore"

# Push the branch
git push origin security/rotate-credentials
```

---

## Step 8: Complete the Security Fix

```bash
# Merge to main
git checkout main
git merge security/rotate-credentials
git push origin main

# Tag this important security fix
git tag -a v0.1.1-security -m "Security: Credentials secured and rotation completed"
git push origin v0.1.1-security
```

---

## Verification Checklist

Before considering this complete, verify:

- [ ] New Supabase Service Role Key generated
- [ ] New OpenAI API key created
- [ ] Old OpenAI API key deleted
- [ ] `.env.local` updated with new keys
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` created with placeholders
- [ ] App works with new keys (tested locally)
- [ ] No errors in browser console
- [ ] Production environment updated (if applicable)
- [ ] Changes committed to git
- [ ] `.env.local` NOT in git (verified)

---

## Future Best Practices

### 1. Never Commit Secrets
- Always use `.env.local` for secrets
- Always keep `.env.local` in `.gitignore`
- Use `.env.example` for templates

### 2. Rotate Keys Regularly
- Set calendar reminder: Rotate keys every 90 days
- Keep track of key creation dates
- Name keys with dates: `my-app-2025-01`

### 3. Use Key Management
Consider these for production:
- Vercel Environment Variables
- AWS Secrets Manager
- HashiCorp Vault
- GitHub Secrets (for CI/CD)

### 4. Monitor Key Usage
- Supabase: Check API usage in dashboard
- OpenAI: Monitor usage and set spending limits

### 5. Least Privilege
- Use service role key only in server-side code
- Use anon key for client-side operations
- Set Row Level Security policies in Supabase

---

## Emergency: If Keys Are Compromised

If you discover keys have been leaked:

1. **Immediately rotate** all keys (Steps 1-2 above)
2. **Check usage logs** in Supabase and OpenAI dashboards for unauthorized access
3. **Enable rate limiting** to prevent abuse
4. **Review recent database changes** for suspicious activity
5. **Consider enabling 2FA** on your accounts
6. **Report to security team** if part of an organization

---

## Support

If you encounter issues:

1. **Supabase Support:** https://supabase.com/support
2. **OpenAI Support:** https://help.openai.com/
3. **Check logs:** Browser console, terminal output
4. **Verify format:** Keys should match the pattern shown in .env.example

---

**Status:** ⏳ In Progress
**Priority:** 🚨 CRITICAL
**Due:** Immediately

Once completed, proceed to **Fix 1.2: Standardize Supabase Client**
