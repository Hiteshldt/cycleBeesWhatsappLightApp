// Bill/Receipt generator utilities
import { formatCurrency, formatDate } from './utils'

export interface BillData {
  order_id: string
  customer_name: string
  bike_name: string
  created_at: string
  sent_at?: string | null
  confirmed_at?: string
  items: {
    section: 'repair' | 'replacement'
    label: string
    price_paise: number
  }[]
  addons?: {
    name: string
    description?: string
    price_paise: number
  }[]
  subtotal_paise: number
  addons_paise?: number
  lacarte_paise: number
  total_paise: number
  status?: string
  isAdmin?: boolean
}

// Generate HTML for the bill/estimate
export function generateBillHTML(data: BillData): string {
  const repairItems = data.items.filter(item => item.section === 'repair')
  const replacementItems = data.items.filter(item => item.section === 'replacement')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Estimate - ${data.order_id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }
        .bill-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
        }
        .bill-title {
            font-size: 18px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .info-item {
            display: flex;
            flex-direction: column;
        }
        .info-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid #d1d5db;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
        }
        .items-table th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #d1d5db;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        .items-table tr:hover {
            background: #f9fafb;
        }
        .price-cell {
            text-align: right;
            font-weight: 600;
        }
        .totals-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16px;
        }
        .subtotal { color: #6b7280; }
        .tax { color: #6b7280; }
        .final-total {
            border-top: 2px solid #3b82f6;
            padding-top: 12px;
            margin-top: 8px;
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            color: #92400e;
            font-size: 14px;
        }
        @media print {
            body { padding: 0; }
            .bill-container { 
                box-shadow: none; 
                border: 1px solid #000;
                max-width: none;
            }
        }
    </style>
</head>
<body>
    <div class="bill-container">
        <div class="header">
            <div class="company-name">CycleBees</div>
            <div class="bill-title">${data.status === 'confirmed' ? 'Confirmed Service Order' : 'Service Estimate'}</div>
            ${data.isAdmin ? '<div style="color: #059669; font-weight: 600; margin-top: 8px;">ADMIN COPY</div>' : ''}
        </div>

        <div class="order-info">
            <div class="info-item">
                <div class="info-label">Order ID</div>
                <div class="info-value">${data.order_id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Created Date</div>
                <div class="info-value">${formatDate(data.created_at)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">${data.status === 'confirmed' ? 'Confirmed Date' : 'Sent Date'}</div>
                <div class="info-value">${data.confirmed_at ? formatDate(data.confirmed_at) : (data.sent_at ? formatDate(data.sent_at) : 'Not sent')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Customer</div>
                <div class="info-value">${data.customer_name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Bike</div>
                <div class="info-value">${data.bike_name}</div>
            </div>
        </div>

        ${repairItems.length > 0 ? `
        <div class="section">
            <div class="section-title">🔧 Repair Services</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${repairItems.map(item => `
                    <tr>
                        <td>${item.label}</td>
                        <td class="price-cell">${formatCurrency(item.price_paise)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${replacementItems.length > 0 ? `
        <div class="section">
            <div class="section-title">🔩 Replacement Parts</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${replacementItems.map(item => `
                    <tr>
                        <td>${item.label}</td>
                        <td class="price-cell">${formatCurrency(item.price_paise)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${data.addons && data.addons.length > 0 ? `
        <div class="section">
            <div class="section-title">✨ Add-on Services</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.addons.map(addon => `
                    <tr>
                        <td>
                            <strong>${addon.name}</strong>
                            ${addon.description ? `<br><small style="color: #6b7280;">${addon.description}</small>` : ''}
                        </td>
                        <td class="price-cell">${formatCurrency(addon.price_paise)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="section">
            <div class="section-title">🛠️ La Carte Services (Fixed charges - Free Services included below)</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Service Package</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>Complete Service Package</strong><br>
                            <small style="color: #6b7280;">General service & inspection report, full cleaning, tyre puncture check, air filling, oiling & lubrication, fitting & repair labour, tightening of loose parts, and pick & drop or full service at your doorstep</small>
                        </td>
                        <td class="price-cell">${formatCurrency(data.lacarte_paise)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="totals-section">
            <div class="total-row subtotal">
                <span>Selected Services:</span>
                <span>${formatCurrency(data.subtotal_paise)}</span>
            </div>
            ${data.addons_paise ? `
            <div class="total-row tax">
                <span>Add-on Services:</span>
                <span>${formatCurrency(data.addons_paise)}</span>
            </div>
            ` : ''}
            <div class="total-row tax">
                <span>La Carte Services (Fixed):</span>
                <span>${formatCurrency(data.lacarte_paise)}</span>
            </div>
            <div class="total-row final-total">
                <span>Total Amount (GST Inclusive):</span>
                <span>${formatCurrency(data.total_paise)}</span>
            </div>
        </div>

        <div class="note">
            <strong>Note:</strong> ${data.status === 'confirmed' 
              ? 'This order has been confirmed by the customer. These are the agreed services and approximate charges. Final charges may vary based on actual work required.' 
              : 'This is an estimate for your bike service. Please show this to our mechanic to proceed with the selected services. Final charges may vary based on actual work required.'}
        </div>

        <div class="footer">
            <p>Thank you for choosing CycleBees!</p>
            <p>For any queries, contact us via WhatsApp</p>
            <p style="margin-top: 10px; font-size: 12px;">Generated on ${new Date().toLocaleString('en-IN')}</p>
        </div>
    </div>
</body>
</html>
  `
}

// Generate a downloadable filename
export function generateBillFilename(orderId: string): string {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return `CycleBees-Estimate-${orderId}-${date}.pdf`
}

// Create downloadable PDF for the bill
export function createBillDownload(html: string, filename: string) {
  // Create a temporary div to hold the HTML content
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  tempDiv.style.width = '210mm' // A4 width
  tempDiv.style.minHeight = '297mm' // A4 height
  document.body.appendChild(tempDiv)
  
  // Import html2pdf dynamically
  import('html2pdf.js').then((html2pdf) => {
    const element = tempDiv.querySelector('.bill-container')
    if (element) {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      }
      
      html2pdf.default().set(opt).from(element).save().then(() => {
        // Clean up
        document.body.removeChild(tempDiv)
      }).catch((error: any) => {
        console.error('PDF generation error:', error)
        // Fallback to HTML download
        createHtmlDownload(html, filename.replace('.pdf', '.html'))
        document.body.removeChild(tempDiv)
      })
    } else {
      console.error('Bill container not found')
      // Fallback to HTML download
      createHtmlDownload(html, filename.replace('.pdf', '.html'))
      document.body.removeChild(tempDiv)
    }
  }).catch((error) => {
    console.error('html2pdf import error:', error)
    // Fallback to HTML download
    createHtmlDownload(html, filename.replace('.pdf', '.html'))
    document.body.removeChild(tempDiv)
  })
}

// Fallback HTML download function
function createHtmlDownload(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  // Create temporary download link
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}