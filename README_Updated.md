# CycleBees Service Estimate System

**A simplified, professional service estimate delivery system for bike repair businesses.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)

---

## 🎯 What This System Does

- **Creates professional service estimates** with your business branding
- **Sends estimates to customers via WhatsApp** with one-click
- **Customers download HTML bills** to show mechanics or keep for records
- **Tracks estimate status** (draft → sent → viewed → complete)
- **Works completely offline** after estimates are downloaded

### ✅ **Key Benefits**
- **Deploy in 30 minutes** (no payment gateway setup)
- **Zero transaction fees** (customers pay you directly) 
- **Professional customer experience** (branded estimates)
- **Mobile-optimized** for WhatsApp users
- **Simple to maintain** (focus on your core business)

---

## 🚀 Quick Start

### Prerequisites
- GitHub account
- Phone with WhatsApp (for testing)

### Deploy Now (30 minutes)
1. **Database**: Set up free Supabase project
2. **Hosting**: Deploy to Vercel (free)
3. **Configure**: Add 3 environment variables
4. **Test**: Create your first estimate!

**👉 See [SETUP_GUIDE_Updated.md](./SETUP_GUIDE_Updated.md) for detailed step-by-step instructions.**

---

## 💼 How It Works

### For Mechanics (Admin)
```
Create Estimate → Send WhatsApp → Track Status → Complete Service
```

1. **Create Estimate**: Add customer details and recommended services
2. **Send WhatsApp**: One-click sends personalized message with estimate link  
3. **Track Status**: See if customer viewed and downloaded estimate
4. **Complete Service**: Customer shows estimate, you proceed with selected services

### For Customers
```
Receive WhatsApp → View Estimate → Download Bill → Show to Mechanic
```

1. **Receive WhatsApp**: Get message with personalized estimate link
2. **View Estimate**: See all recommended services with clear pricing
3. **Download Bill**: Professional HTML estimate downloads to phone
4. **Show to Mechanic**: Present estimate for service (works offline)

---

## 📱 Screenshots & Demo

### Admin Dashboard
- Clean interface for creating and managing estimates
- Status filtering (Draft/Sent/Viewed/Cancelled)
- One-click WhatsApp sending

### Customer Experience  
- Mobile-optimized estimate viewing
- Professional service breakdown
- Downloadable branded bills
- WhatsApp support integration

### Professional Estimates
- CycleBees branding (customizable)
- Itemized service breakdown  
- GST calculation (18%)
- Customer and bike details
- Offline-capable HTML format

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form handling with validation

### Backend  
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with real-time features
- **Zod** - Runtime validation schemas

### Infrastructure
- **Vercel** - Hosting and deployment (free tier)
- **Supabase Cloud** - Database hosting (free tier)
- **No payment gateway** - Direct customer payments

---

## 📂 Project Structure

```
cyclebees-whatsapp-service/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx             # Estimates list
│   │   ├── new/page.tsx         # Create new estimate
│   │   └── layout.tsx           # Admin layout
│   ├── o/[slug]/page.tsx        # Customer estimate pages  
│   ├── api/                     # API routes
│   │   ├── requests/            # Estimate CRUD operations
│   │   └── public/orders/       # Customer estimate API
│   └── page.tsx                 # Home (redirects to admin)
├── components/ui/               # Reusable UI components
├── lib/                         # Utility libraries
│   ├── bill-generator.ts       # Professional estimate generation
│   ├── supabase.ts             # Database configuration  
│   ├── validations.ts          # Zod schemas
│   └── utils.ts                # Helper functions
├── database/                    # Database schema
│   └── schema.sql              # PostgreSQL schema
└── docs/                        # Documentation
    ├── SETUP_GUIDE_Updated.md  # Deployment guide
    ├── projectReport_Updated.md # Technical documentation
    └── SIMPLIFIED_DEPLOYMENT_GUIDE.md # Quick deploy guide
```

---

## 🛠️ Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/cyclebees-estimates.git
cd cyclebees-estimates

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

### Database Setup
```bash
# Run this SQL in your Supabase SQL Editor
cat database/schema.sql
# Copy contents and execute in Supabase Dashboard
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJh...

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Customization
- **Branding**: Edit `lib/bill-generator.ts` for company name, colors, logo
- **Pricing**: Modify GST rate (default 18%) in calculation functions
- **Message Templates**: Update WhatsApp message format in `lib/utils.ts`

---

## 📊 Database Schema

### Tables
- **`requests`**: Customer estimates with status tracking
- **`request_items`**: Individual services and parts with pricing

### Key Features
- **Auto-generated slugs**: Unique public identifiers (8 characters)
- **Automatic totals**: Database triggers update totals when items change
- **Status tracking**: Draft → Sent → Viewed → Complete
- **Optimized indexes**: Fast queries on slug, status, dates

---

## 🔐 Security

### Data Protection
- **Minimal data collection**: Only essential customer information
- **Input validation**: Zod schemas for all user inputs
- **SQL injection prevention**: Supabase client with parameterized queries
- **No payment data**: All transactions handled offline

### Best Practices
- Environment variables for sensitive configuration
- Type-safe database operations
- Proper error handling and logging
- CORS configuration for API security

---

## 📈 Performance

### Optimizations
- **Server-side rendering**: Fast initial page loads
- **Database indexing**: Optimized queries for large datasets
- **Efficient queries**: Proper joins and data fetching
- **Mobile-first**: Optimized for WhatsApp mobile users

### Scalability
- **Serverless architecture**: Auto-scaling API routes
- **Database**: Supabase handles connection pooling
- **CDN**: Static assets served via Vercel's global CDN
- **Minimal dependencies**: Reduced complexity and bundle size

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create estimate with customer details
- [ ] Add repair services and replacement parts  
- [ ] Send WhatsApp message (test with your number)
- [ ] Customer flow: view estimate, select items, download bill
- [ ] Verify status updates in admin dashboard
- [ ] Test estimate quality and professional appearance

### Production Testing
- [ ] Test with real customer (small job first)
- [ ] Verify WhatsApp message delivery
- [ ] Confirm bill download works on customer's device  
- [ ] Check estimate quality meets professional standards
- [ ] Monitor system performance under real usage

---

## 📞 Support

### Documentation
- **Setup Guide**: [SETUP_GUIDE_Updated.md](./SETUP_GUIDE_Updated.md)
- **Technical Details**: [projectReport_Updated.md](./projectReport_Updated.md)
- **Quick Deploy**: [SIMPLIFIED_DEPLOYMENT_GUIDE.md](./SIMPLIFIED_DEPLOYMENT_GUIDE.md)

### Common Issues
- **Database connection**: Check Supabase project status and credentials
- **WhatsApp links**: Verify phone number format (no + prefix)
- **Estimate download**: Try different browser or clear cache
- **Deployment**: Check Vercel deployment logs and environment variables

### Getting Help
- Check Supabase documentation for database issues
- Review Vercel documentation for deployment issues
- Test in different browsers/devices for compatibility issues

---

## 🎯 Business Impact

### Cost Savings
- **No payment gateway fees**: Save 2-3% on all transactions
- **No setup fees**: No business verification or account setup
- **Low maintenance**: Focus on core business vs technical maintenance

### Operational Benefits  
- **Faster quote delivery**: Seconds vs phone calls or meetings
- **Professional image**: Branded estimates vs verbal quotes
- **Reduced miscommunication**: Clear written estimates
- **Scalable process**: Handle more customers without proportional staff increase

### Customer Experience
- **Instant delivery**: Get estimates immediately via WhatsApp
- **Mobile optimized**: Perfect for smartphone users
- **Offline capable**: Downloaded bills work without internet
- **Professional presentation**: Builds trust and credibility

---

## 🚀 Future Enhancements

### Short-term (Optional)
- PDF generation instead of HTML
- SMS backup for non-WhatsApp customers
- Basic analytics dashboard
- Service templates for common jobs

### Long-term (Growth Features)
- Customer database with service history
- Automated service reminders
- Inventory integration  
- Multi-location support
- Mobile app for mechanics

---

## 📄 License

This project is built for CycleBees business use. Modify and customize as needed for your specific business requirements.

---

## 🤝 Contributing

This is a business application built specifically for bike repair service estimates. Focus areas for improvements:

1. **Customer Experience**: Enhance estimate presentation and download process
2. **Admin Efficiency**: Streamline estimate creation and management
3. **Mobile Optimization**: Improve WhatsApp integration and mobile responsiveness  
4. **Professional Features**: Add branding options, templates, analytics

---

**🎉 Ready to deploy your professional service estimate system!**

*For detailed setup instructions, see [SETUP_GUIDE_Updated.md](./SETUP_GUIDE_Updated.md)*