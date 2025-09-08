# CycleBees Setup Guide (Simplified)

**🚀 Deploy your service estimate system in 30 minutes!**

## What You're Building

A **professional service estimate system** that:
- ✅ Creates branded service estimates for customers
- ✅ Sends estimates via WhatsApp instantly  
- ✅ Lets customers download professional bills
- ✅ Tracks estimate status (draft/sent/viewed)
- ✅ **No payment gateway complexity!**

---

## Quick Start Checklist (30 minutes)

- [ ] **Step 1**: Set up Supabase database (10 min)
- [ ] **Step 2**: Deploy to Vercel (5 min)
- [ ] **Step 3**: Configure environment variables (5 min)  
- [ ] **Step 4**: Test with real estimate (10 min)

---

## Step 1: Database Setup (10 minutes)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → Sign up/Login
2. Click **"New Project"**
3. **Organization**: Choose your organization
4. **Project Name**: `cyclebees-estimates`
5. **Database Password**: Generate a strong password (save it!)
6. **Region**: Choose closest to your location (e.g., `ap-south-1` for India)
7. Click **"Create new project"** → Wait ~2 minutes

### Run Database Schema
1. In Supabase Dashboard → **SQL Editor**
2. Open this project's `database/schema.sql` file
3. **Copy all SQL content** and paste into SQL Editor
4. Click **"Run"** → Should see "Success. No rows returned"
5. Go to **Table Editor** → Verify you see tables: `requests`, `request_items`

### Get Your Credentials  
1. **Settings** → **API** → Copy these:
   - **Project URL**: `https://abcdef.supabase.co`
   - **anon public key**: `eyJ0eXAiOiJKV1QiLCJh...`

---

## Step 2: Deploy to Vercel (5 minutes)

### Prepare Your Code
```bash
# In your project folder
cd cyclebees-whatsapp-service
git init
git add .
git commit -m "Initial CycleBees setup"

# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/yourusername/cyclebees-estimates.git
git push -u origin main
```

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"** → Import your GitHub repo
3. **Project Name**: `cyclebees-estimates`
4. **Framework**: Next.js (auto-detected)
5. **Build Settings**: Keep defaults
6. Click **"Deploy"** → Wait ~2 minutes
7. **Your app URL**: `https://cyclebees-estimates.vercel.app`

---

## Step 3: Environment Variables (5 minutes)

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

Add these **3 variables**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ0eXAiOiJKV1QiLCJh...` |
| `NEXT_PUBLIC_BASE_URL` | `https://cyclebees-estimates.vercel.app` |

**Then**: Go to **Deployments** → Click **"Redeploy"** on latest deployment

---

## Step 4: Test Your System (10 minutes)

### Create Your First Estimate
1. Go to your live app: `https://cyclebees-estimates.vercel.app`
2. You'll see the admin dashboard
3. Click **"New Request"**
4. Fill in test data:
   ```
   Order ID: TEST001
   Bike Name: Honda Activa 6G  
   Customer Name: Test Customer
   WhatsApp Number: 919876543210 (your phone number!)
   
   Repair Services:
   - Oil Change: ₹300
   - Brake Check: ₹150
   
   Replacement Parts:
   - Air Filter: ₹200
   ```
5. Click **"Save Request"** → Success! You'll see a short URL

### Test WhatsApp Integration
1. Click **"Send on WhatsApp"** → WhatsApp opens
2. **Send the message to yourself**
3. **Click the link in WhatsApp** → Opens your estimate page
4. Select services → Click **"Download Estimate"**
5. **Check the downloaded HTML file** → Professional estimate!

### Verify Admin Dashboard
1. Go back to admin dashboard → See your test estimate
2. Status should show **"Viewed"** (green badge)
3. Try filtering by status → Works!

---

## Customize Your System

### Add Your Domain (Optional)
1. **Buy domain**: Use Namecheap, GoDaddy, etc.
2. **Vercel Dashboard** → Domains → Add your domain
3. **Update DNS** at your domain provider
4. **Update environment variable** `NEXT_PUBLIC_BASE_URL` to your domain

### Update Branding
Edit `lib/bill-generator.ts` → Change:
- Company name from "CycleBees" to your business name
- Colors, styling, contact info
- Add your logo (if needed)

---

## System Overview

### How It Works
```
Mechanic → Creates estimate → Sends WhatsApp → Customer views → Downloads bill → Shows to mechanic
```

### Status Flow
- **Draft**: Just created, not sent yet
- **Sent**: WhatsApp message delivered  
- **Viewed**: Customer downloaded estimate
- **Cancelled**: Admin cancelled the request

### What Customers Get
- Professional HTML estimate with your branding
- Complete service breakdown with GST
- Works offline after download  
- Can be printed or saved on phone

---

## Business Process

### For Your Mechanics
1. **Create Estimate**: Use `/admin/new` for each customer
2. **Send WhatsApp**: Click button, WhatsApp opens with pre-filled message
3. **Track Status**: Dashboard shows if customer viewed estimate
4. **Complete Service**: Customer shows downloaded estimate, you proceed

### For Your Customers  
1. **Receive WhatsApp**: Get link with personalized message
2. **View Estimate**: See all recommended services with pricing
3. **Download Bill**: Professional estimate downloads to device
4. **Visit Shop**: Show estimate to mechanic for service

---

## Costs & Maintenance

### Monthly Costs
```
Supabase Database: ₹0 (free tier, up to 500MB)
Vercel Hosting: ₹0 (hobby plan)
Domain (optional): ₹500-1000/year
Total: ~₹50-100/month
```

### Maintenance
- **Zero payment gateway fees** (was 2-3% per transaction)
- **No webhook maintenance** (was complex payment tracking)
- **Simple updates** via Git push → auto-deploy
- **Database backups** handled by Supabase automatically

---

## Troubleshooting

### Common Issues

**❌ "Tables not found" error**
- Re-run the SQL schema in Supabase SQL Editor
- Check all tables exist in Table Editor

**❌ WhatsApp link doesn't work**  
- Verify phone number format: `919876543210` (no + or spaces)
- Test URL directly in browser first

**❌ Estimate won't download**
- Try different browser/device
- Check phone storage space
- Clear browser cache

**❌ Admin page won't load**
- Check environment variables in Vercel
- Redeploy after adding variables
- Check Supabase project is active

### Getting Help
- **Database issues**: Check Supabase dashboard logs
- **Deployment issues**: Check Vercel deployment logs  
- **App issues**: Check browser console for errors

---

## Go Live Checklist

### Before Using with Real Customers
- [ ] Test complete flow with your own phone number
- [ ] Download and verify estimate quality
- [ ] Check all pricing calculations are correct
- [ ] Train staff on new process
- [ ] Have backup phone/WhatsApp ready

### Launch Day
- [ ] Create first real customer estimate
- [ ] Send WhatsApp and verify customer receives it
- [ ] Follow up to ensure customer can download estimate
- [ ] Monitor admin dashboard for any issues
- [ ] Be available for customer questions via WhatsApp

### Week 1  
- [ ] Use for all new service estimates
- [ ] Collect customer feedback on experience
- [ ] Monitor system performance and usage
- [ ] Document any process improvements needed

---

## Success! What's Next?

### Your System is Live! 🎉
You now have a **professional service estimate system** that:
- Delivers estimates in seconds vs hours
- Provides professional branded estimates  
- Eliminates miscommunication with written estimates
- Saves money (no payment gateway fees)
- Scales with your business growth

### Optional Enhancements
**Month 2-3**: Add SMS backup, PDF generation, analytics  
**Month 4-6**: Customer database, service reminders, inventory tracking
**Future**: Mobile app, advanced reporting, multi-location support

### Business Impact
- **Faster quotes**: Seconds instead of phone calls
- **Professional image**: Branded estimates vs verbal quotes  
- **Better conversion**: Customers more likely to proceed with written estimates
- **Cost savings**: No transaction fees or gateway maintenance
- **Growth ready**: System scales as you add more customers

---

**🎯 Your CycleBees Service Estimate System is ready for business!**

*Setup Guide Updated - January 2025*