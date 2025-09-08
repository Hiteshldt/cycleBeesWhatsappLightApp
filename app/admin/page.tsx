'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Request } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor, generateWhatsAppURL, generateWhatsAppMessage } from '@/lib/utils'
import { Eye, Send, Copy, Filter, Download } from 'lucide-react'

type RequestWithTotal = Request & {
  total_items: number
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<RequestWithTotal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/api/requests'
        : `/api/requests?status=${statusFilter}`
      
      console.log('Fetching requests from:', url)
      const response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Received data:', data)
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
      // Set empty array on error so the UI still renders
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendWhatsApp = async (request: Request) => {
    const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/o/${request.short_slug}`
    const message = generateWhatsAppMessage(
      request.customer_name,
      request.bike_name,
      request.order_id,
      orderUrl
    )
    const whatsappUrl = generateWhatsAppURL(request.phone_digits_intl, message)
    
    // Update status to 'draft' (no status change needed for WhatsApp send)
    // The status will be updated to 'viewed' when customer clicks the link
    
    window.open(whatsappUrl, '_blank')
  }

  const copyOrderLink = (shortSlug: string) => {
    const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/o/${shortSlug}`
    navigator.clipboard.writeText(orderUrl)
    // You could add a toast notification here
    alert('Order link copied to clipboard!')
  }

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchRequests() // Refresh the list
    } catch (error) {
      console.error('Error updating request status:', error)
    }
  }

  const handleDownloadConfirmedPDF = async (request: Request) => {
    if (request.status !== 'confirmed') {
      alert('This order has not been confirmed yet.')
      return
    }

    try {
      // 1) Get confirmed selections (IDs)
      const respConfirmed = await fetch(`/api/requests/${request.id}/confirmed`)
      if (!respConfirmed.ok) {
        alert('Failed to load confirmed selections.')
        return
      }
      const { selectedItems, selectedAddons } = await respConfirmed.json()

      // 2) Load full request with items
      const respRequest = await fetch(`/api/requests/${request.id}`)
      if (!respRequest.ok) {
        alert('Failed to load request details.')
        return
      }
      const requestData = await respRequest.json()

      // 3) Load addons (admin endpoint to include inactive if needed)
      const respAddons = await fetch('/api/admin/addons')
      const allAddons = respAddons.ok ? await respAddons.json() : []

      // 4) Build selected items/addons arrays with full details
      const selectedItemsDetails = (requestData.request_items || []).filter((it: any) => selectedItems.includes(it.id))
      const selectedAddonsDetails = (allAddons || []).filter((ad: any) => selectedAddons.includes(ad.id))

      // 5) Compute totals
      const subtotal = selectedItemsDetails.reduce((sum: number, it: any) => sum + (it.price_paise || 0), 0)
      const addonsTotal = selectedAddonsDetails.reduce((sum: number, ad: any) => sum + (ad.price_paise || 0), 0)
      const laCarte = 9900
      const total = subtotal + addonsTotal + laCarte

      // 6) Create bill data with exact selections
      const billData = {
        order_id: request.order_id,
        customer_name: request.customer_name,
        bike_name: request.bike_name,
        created_at: request.created_at,
        confirmed_at: new Date().toISOString(),
        items: selectedItemsDetails.map((it: any) => ({
          section: it.section,
          label: it.label,
          price_paise: it.price_paise,
        })),
        addons: selectedAddonsDetails.map((ad: any) => ({
          name: ad.name,
          description: ad.description,
          price_paise: ad.price_paise,
        })),
        subtotal_paise: subtotal,
        addons_paise: addonsTotal,
        lacarte_paise: laCarte,
        total_paise: total,
        status: 'confirmed',
        isAdmin: true,
      }

      const { generateBillHTML, createBillDownload } = await import('@/lib/bill-generator')
      const html = generateBillHTML(billData)
      const filename = `Admin_Confirmed_Order_${request.order_id}.pdf`
      createBillDownload(html, filename)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <div className="spinner"></div>
          <div className="text-lg text-gray-600">Loading requests...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-600">Manage all customer service requests</p>
        </div>
        <Link href="/admin/new">
          <Button>Create New Request</Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex gap-2">
          {['all', 'draft', 'viewed', 'confirmed', 'cancelled'].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No requests found.</p>
            <Link href="/admin/new">
              <Button className="mt-4">Create your first request</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bike
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.order_id}
                      </div>
                      <div className="text-xs text-gray-500">
                        #{request.short_slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.customer_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      +{request.phone_digits_intl}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.bike_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(request.total_paise)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {/* View Order Page */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/o/${request.short_slug}`, '_blank')}
                          title="View Order Page"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Copy Link */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyOrderLink(request.short_slug)}
                          title="Copy Order Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        {/* Download Confirmed PDF */}
                        {request.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadConfirmedPDF(request)}
                            title="Download Confirmed Order PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Send/Resend WhatsApp */}
                        {(request.status === 'draft' || request.status === 'viewed') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendWhatsApp(request)}
                            title={request.status === 'draft' ? 'Send WhatsApp' : 'Resend WhatsApp'}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Status Actions */}
                        {(request.status === 'draft' || request.status === 'viewed') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(request.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
