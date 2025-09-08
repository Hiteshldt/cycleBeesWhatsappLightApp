# 🧪 CycleBees Local Testing Guide

**Your system is running at: http://localhost:3001**

## ✅ Test Checklist - Complete This Step by Step

### **Test 1: Admin Dashboard Access** 
- [ ] Open `http://localhost:3001`
- [ ] ✅ **Expected**: CycleBees admin dashboard loads
- [ ] ✅ **Expected**: "Requests" page shows (empty list initially)
- [ ] ✅ **Expected**: "New Request" button is visible
- [ ] ❌ **Issue?**: If you see errors, check browser console

---

### **Test 2: Create Your First Estimate**

#### Step 2a: Access New Request Form
- [ ] Click **"New Request"** button
- [ ] ✅ **Expected**: Form loads with customer details and service sections

#### Step 2b: Fill in Customer Details
```
Order ID: TEST001
Bike Name: Honda Activa 6G  
Customer Name: John Doe
WhatsApp Number: 919876543210 (use your actual number for testing!)
```

#### Step 2c: Add Repair Services
- [ ] Click **"Add Service"** in Repair Services section
- [ ] Add: `Oil Change` - `₹300`
- [ ] Add: `Brake Check` - `₹150`
- [ ] ✅ **Expected**: Total updates automatically

#### Step 2d: Add Replacement Parts  
- [ ] Click **"Add Part"** in Replacement Parts section
- [ ] Add: `Air Filter` - `₹200`
- [ ] Add: `Spark Plug` - `₹100`
- [ ] ✅ **Expected**: Grand total should show ₹885 (₹750 + 18% GST)

#### Step 2e: Save the Estimate
- [ ] Click **"Save Request"**
- [ ] ✅ **Expected**: Success message appears
- [ ] ✅ **Expected**: Order URL appears: `http://localhost:3001/o/XXXXXXXX`
- [ ] ✅ **Expected**: "Send on WhatsApp" button appears

---

### **Test 3: WhatsApp Integration**

#### Step 3a: Generate WhatsApp Link
- [ ] Click **"Send on WhatsApp"**
- [ ] ✅ **Expected**: WhatsApp opens (or browser asks to open WhatsApp)
- [ ] ✅ **Expected**: Message is pre-filled with:
  ```
  Hi John, your CycleBees service estimate for Honda Activa 6G (Order TEST001) is ready. 
  Review & choose items here: http://localhost:3001/o/XXXXXXXX
  ```

#### Step 3b: Send Message to Yourself
- [ ] **Send the WhatsApp message to your own number**
- [ ] ✅ **Expected**: You receive the message with clickable link

---

### **Test 4: Customer Experience**

#### Step 4a: Access Customer Page
- [ ] Click the link from WhatsApp (or copy/paste the order URL)
- [ ] ✅ **Expected**: Professional customer page loads
- [ ] ✅ **Expected**: Shows "Service Estimate for Honda Activa 6G"
- [ ] ✅ **Expected**: Customer details displayed correctly

#### Step 4b: Review Services
- [ ] ✅ **Expected**: Repair Services section shows your items
- [ ] ✅ **Expected**: Replacement Parts section shows your items  
- [ ] ✅ **Expected**: All items are pre-selected (checkboxes ticked)
- [ ] ✅ **Expected**: Total amount shows ₹885

#### Step 4c: Test Service Selection
- [ ] **Uncheck** one service (e.g., Brake Check)
- [ ] ✅ **Expected**: Total amount decreases immediately
- [ ] **Re-check** the service
- [ ] ✅ **Expected**: Total amount increases back

---

### **Test 5: Bill Generation** 🎯

#### Step 5a: Download Professional Estimate
- [ ] With all desired services selected, click **"Download Estimate"**
- [ ] ✅ **Expected**: HTML file downloads (e.g., `CycleBees-Estimate-TEST001-2025-01-07.html`)
- [ ] ✅ **Expected**: File size ~50-100KB

#### Step 5b: Review Downloaded Bill
- [ ] **Open the downloaded HTML file** in browser
- [ ] ✅ **Expected**: Professional bill with CycleBees branding
- [ ] ✅ **Expected**: All customer details (John Doe, Honda Activa 6G, TEST001)
- [ ] ✅ **Expected**: Selected services with prices
- [ ] ✅ **Expected**: Subtotal: ₹750, GST (18%): ₹135, Total: ₹885
- [ ] ✅ **Expected**: Professional formatting, easy to read
- [ ] ✅ **Expected**: Note: "Show this to our mechanic to proceed"

#### Step 5c: Test Bill on Mobile
- [ ] Transfer bill to your phone or test on mobile browser
- [ ] ✅ **Expected**: Bill displays perfectly on mobile
- [ ] ✅ **Expected**: Easy to read, professional appearance

---

### **Test 6: Admin Dashboard Updates**

#### Step 6a: Check Status Update
- [ ] Go back to admin dashboard: `http://localhost:3001`
- [ ] ✅ **Expected**: Your TEST001 estimate appears in the list
- [ ] ✅ **Expected**: Status shows **"Viewed"** (green badge)
- [ ] ✅ **Expected**: Total amount shows ₹885

#### Step 6b: Test Dashboard Features
- [ ] Click status filter **"Viewed"**
- [ ] ✅ **Expected**: Only your viewed estimate shows
- [ ] Click **"All"** filter
- [ ] ✅ **Expected**: All estimates show again
- [ ] Click **"View"** button on your estimate
- [ ] ✅ **Expected**: Customer page opens in new tab

---

### **Test 7: Advanced Features**

#### Step 7a: Create Second Estimate
- [ ] Create another estimate with different customer
- [ ] Use different services and amounts
- [ ] Test the complete flow again

#### Step 7b: Test Status Management
- [ ] Try **"Resend WhatsApp"** on an existing estimate
- [ ] Try **"Cancel"** on a draft estimate
- [ ] ✅ **Expected**: Status updates correctly

#### Step 7c: Test Edge Cases
- [ ] Try creating estimate with no services selected
- [ ] Try accessing invalid order URL: `http://localhost:3001/o/INVALID123`
- [ ] ✅ **Expected**: Appropriate error messages

---

## 🎯 **Test Results Summary**

### ✅ **If Everything Works:**
- Admin dashboard loads and functions
- Estimates save to database successfully  
- WhatsApp integration generates correct messages
- Customer pages display professionally
- Bills download as professional HTML documents
- Status tracking works (Draft → Sent → Viewed)
- Mobile experience is smooth

### 🚨 **Common Issues & Solutions:**

**Problem**: Admin dashboard shows loading forever  
**Solution**: Check browser console, verify Supabase connection

**Problem**: "Save Request" fails  
**Solution**: Check all required fields are filled, check network tab

**Problem**: WhatsApp doesn't open  
**Solution**: Copy the message manually and send via WhatsApp web

**Problem**: Customer page shows "Order not found"  
**Solution**: Check the URL is complete, verify database has the record

**Problem**: Bill won't download  
**Solution**: Try different browser, check browser's download settings

---

## 📱 **Real-World Test Scenario**

Try this complete business workflow:

1. **As Mechanic**: Customer calls about bike service
2. **Create Estimate**: Use real customer details
3. **Send WhatsApp**: Send to your phone pretending to be customer
4. **As Customer**: Open link, review services, download bill
5. **As Mechanic**: Customer shows bill, proceed with selected services

---

## 🎉 **Success! What You've Accomplished**

If all tests pass, you have:
- ✅ **Professional service estimate system**
- ✅ **WhatsApp integration for customer communication**  
- ✅ **Downloadable, branded service bills**
- ✅ **Complete admin management system**
- ✅ **Mobile-optimized customer experience**
- ✅ **Real-time status tracking**

**Your CycleBees system is ready for production deployment!**

---

## 📋 **Next Steps After Testing**

1. **If tests pass**: System is ready for production deployment
2. **Customize branding**: Update company name, colors in bill generator
3. **Train staff**: Show mechanics how to use the admin interface
4. **Deploy live**: Follow the deployment guide for production setup

**Go through each test step and let me know your results!**