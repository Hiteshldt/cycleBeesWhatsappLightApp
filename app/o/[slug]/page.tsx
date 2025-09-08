'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Request, RequestItem, Addon } from '@/lib/supabase'
import { formatCurrency, generateWhatsAppURL, generateWhatsAppMessage, generateUPIPaymentURL, formatDate } from '@/lib/utils'
import { generateBillHTML, generateBillFilename, createBillDownload } from '@/lib/bill-generator'
import { Check, MessageCircle, AlertCircle, Download, Receipt, CreditCard } from 'lucide-react'

type OrderData = {
  request: Request
  items: (RequestItem & { selected?: boolean })[]
}

export default function PublicOrderPage() {
  const params = useParams()
  const slug = params.slug as string

  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [addons, setAddons] = useState<Addon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set())
  const [hasViewedEstimate, setHasViewedEstimate] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmedData, setConfirmedData] = useState<any>(null)

  useEffect(() => {
    if (slug) {
      fetchOrderData()
      fetchAddons()
    }
  }, [slug])

  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/public/orders/${slug}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found or has expired.')
        } else {
          setError('Failed to load order details.')
        }
        return
      }

      const data = await response.json()
      setOrderData(data)

      // Pre-select all suggested items or load confirmed selections
      if (data.request.status === 'confirmed') {
        // For confirmed orders, load the actual confirmed selections
        try {
          const confirmedResponse = await fetch(`/api/requests/${data.request.id}/confirmed`)
          if (confirmedResponse.ok) {
            const confirmedData = await confirmedResponse.json()
            setSelectedItems(new Set(confirmedData.selectedItems))
            setSelectedAddons(new Set(confirmedData.selectedAddons))
            setConfirmedData({
              selectedItems: confirmedData.selectedItems,
              selectedAddons: confirmedData.selectedAddons,
              totals: calculateTotal()
            })
          }
        } catch (error) {
          console.error('Error loading confirmed selections:', error)
        }
      } else {
        // For non-confirmed orders, pre-select suggested items
        const suggestedItemIds = new Set<string>(
          data.items.filter((item: RequestItem) => item.is_suggested).map((item: RequestItem) => item.id)
        )
        setSelectedItems(suggestedItemIds)
      }

      // Mark as viewed if status is still draft
      if (data.request.status === 'draft') {
        try {
          await fetch(`/api/public/orders/${slug}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selected_items: data.items.filter((item: RequestItem) => item.is_suggested).map((item: RequestItem) => item.id),
              status: 'viewed'
            }),
          })
          setHasViewedEstimate(true)
          // Update local status
          setOrderData({
            ...data,
            request: { ...data.request, status: 'viewed' }
          })
        } catch (error) {
          console.error('Error marking as viewed:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching order data:', error)
      setError('Failed to load order details.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAddons = async () => {
    try {
      const response = await fetch('/api/addons')
      if (response.ok) {
        const data = await response.json()
        setAddons(data)
      }
    } catch (error) {
      console.error('Error fetching addons:', error)
    }
  }

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const toggleAddonSelection = (addonId: string) => {
    const newSelected = new Set(selectedAddons)
    if (newSelected.has(addonId)) {
      newSelected.delete(addonId)
    } else {
      newSelected.add(addonId)
    }
    setSelectedAddons(newSelected)
  }

  const calculateTotal = () => {
    if (!orderData) return { subtotal: 0, addonsTotal: 0, total: 0 }

    const subtotal = orderData.items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price_paise, 0)
    
    // Calculate selected addons total
    const addonsTotal = addons
      .filter(addon => selectedAddons.has(addon.id))
      .reduce((sum, addon) => sum + addon.price_paise, 0)
    
    // Add fixed La Carte Services charge (₹99)
    const laCarteCharge = 9900 // ₹99 in paise
    const total = subtotal + addonsTotal + laCarteCharge

    return { subtotal, addonsTotal, total }
  }

  const handleConfirmOrder = () => {
    const totals = calculateTotal()
    if (totals.total < 9900) {
      alert('Please select at least one service or keep the default La Carte services.')
      return
    }
    
    // Show confirmation dialog
    setShowConfirmation(true)
  }

  const handleNeedHelp = () => {
    if (!orderData) return
    
    const message = `Hi, I need help with my service estimate for ${orderData.request.bike_name} (Order ${orderData.request.order_id}). Can you please assist me?`
    const whatsappUrl = generateWhatsAppURL(orderData.request.phone_digits_intl, message)
    window.open(whatsappUrl, '_blank')
  }

  const handleFinalConfirmation = async () => {
    if (!orderData) return
    
    setIsConfirming(true)
    
    try {
      // Mark as viewed and confirmed
      await fetch(`/api/public/orders/${slug}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_items: Array.from(selectedItems),
          selected_addons: Array.from(selectedAddons),
          status: 'confirmed'
        }),
      })
      
      // Update local state
      setHasViewedEstimate(true)
      setShowConfirmation(false)
      
      // Store confirmed data for PDF download
      const totals = calculateTotal()
      setConfirmedData({
        selectedItems: Array.from(selectedItems),
        selectedAddons: Array.from(selectedAddons),
        totals
      })
      
      // Show success message
      alert('Order confirmed successfully! You can now download your confirmed order PDF. Our team will contact you soon to schedule the service.')
      
    } catch (error) {
      console.error('Error confirming order:', error)
      alert('Failed to confirm order. Please try again or contact us for help.')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleDownloadConfirmedPDF = () => {
    if (!orderData || !confirmedData) return

    // Get confirmed items data
    const confirmedItems = orderData.items.filter(item => 
      confirmedData.selectedItems.includes(item.id)
    )
    
    // Get confirmed addons data  
    const confirmedAddons = addons.filter(addon =>
      confirmedData.selectedAddons.includes(addon.id)
    )

    const totals = confirmedData.totals
    const subtotal = confirmedItems.reduce((sum, item) => sum + item.price_paise, 0)
    const addonsTotal = confirmedAddons.reduce((sum, addon) => sum + addon.price_paise, 0)
    const laCarteCharge = 9900
    const total = subtotal + addonsTotal + laCarteCharge

    // Generate confirmed order PDF
    const billData = {
      order_id: orderData.request.order_id,
      customer_name: orderData.request.customer_name,
      bike_name: orderData.request.bike_name,
      created_at: orderData.request.created_at,
      confirmed_at: new Date().toISOString(),
      items: confirmedItems,
      addons: confirmedAddons,
      subtotal_paise: subtotal,
      addons_paise: addonsTotal,
      lacarte_paise: laCarteCharge,
      total_paise: total,
      status: 'confirmed'
    }

    const html = generateBillHTML(billData)
    const filename = `Confirmed_Order_${orderData.request.order_id}.pdf`
    createBillDownload(html, filename)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your service estimate...</p>
        </div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-4">{error || 'Something went wrong'}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const { request, items } = orderData
  const repairItems = items.filter(item => item.section === 'repair')
  const replacementItems = items.filter(item => item.section === 'replacement')
  const totals = calculateTotal()

  // Check if order is cancelled
  if (request.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Cancelled</h1>
          <p className="text-gray-600 mb-4">
            This service request has been cancelled. If you have any questions, please contact us.
          </p>
          <Button onClick={handleNeedHelp} variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Us
          </Button>
        </div>
      </div>
    )
  }

  // Check if order is already confirmed
  if (request.status === 'confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Your service request for {request.bike_name} has been confirmed. 
            Our team will contact you soon to schedule the service.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700">Order ID: <strong>{request.order_id}</strong></p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleDownloadConfirmedPDF} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Confirmed Order PDF
            </Button>
            <Button onClick={handleNeedHelp} variant="outline" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CycleBees</h1>
              <p className="text-sm text-gray-600">Professional Bike Service</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              Order #{request.order_id}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Service Estimate for {request.bike_name}
          </h2>
          <p className="text-gray-600 mb-4">
            Review the services and parts recommended for your bike. Select the items you want and download your estimate. All prices include GST.
          </p>
          
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium">{request.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bike</p>
              <p className="font-medium">{request.bike_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Request Created</p>
              <p className="font-medium">{formatDate(request.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sent to You</p>
              <p className="font-medium">{request.sent_at ? formatDate(request.sent_at) : 'Not sent yet'}</p>
            </div>
          </div>
        </div>

        {/* Repair Services */}
        {repairItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Repair Services</h3>
            <div className="space-y-3">
              {repairItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedItems.has(item.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        selectedItems.has(item.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedItems.has(item.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      {item.is_suggested && (
                        <p className="text-sm text-blue-600">Recommended</p>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.price_paise)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Replacement Parts */}
        {replacementItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Replacement Parts</h3>
            <div className="space-y-3">
              {replacementItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedItems.has(item.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        selectedItems.has(item.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedItems.has(item.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      {item.is_suggested && (
                        <p className="text-sm text-blue-600">Recommended</p>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.price_paise)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons Section */}
        {addons.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add-on Services</h3>
            <p className="text-sm text-gray-600 mb-4">Select additional services to enhance your bike maintenance experience</p>
            <div className="space-y-3">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedAddons.has(addon.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleAddonSelection(addon.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        selectedAddons.has(addon.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAddons.has(addon.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{addon.name}</p>
                      {addon.description && (
                        <p className="text-sm text-gray-600">{addon.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(addon.price_paise)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* La Carte Services Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">La Carte Services (Fixed charges - Free Services included below)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-blue-500 bg-blue-50 cursor-not-allowed">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded border-2 border-blue-500 bg-blue-500 mr-3 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Complete Service Package</p>
                  <p className="text-sm text-blue-600">Always Included - Fixed Price</p>
                  <p className="text-xs text-gray-600 mt-1">
                    General service & inspection report, full cleaning, tyre puncture check, 
                    air filling, oiling & lubrication, fitting & repair labour, 
                    tightening of loose parts, and pick & drop or full service at your doorstep
                  </p>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(9900)}
              </div>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Selected Services ({selectedItems.size} items)</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {selectedAddons.size > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Add-on Services ({selectedAddons.size} items)</span>
                <span>{formatCurrency(totals.addonsTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-700">
              <span>La Carte Services (Fixed)</span>
              <span>{formatCurrency(9900)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Amount (GST Inclusive)</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirmOrder}
            disabled={false}
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Check className="h-5 w-5 mr-2" />
            Confirm Your Order - {formatCurrency(totals.total)}
          </Button>

          <Button
            onClick={handleNeedHelp}
            variant="outline"
            className="w-full h-10"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Need Help?
          </Button>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Your Order
              </h3>
              
              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Selected Services ({selectedItems.size} items)</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {selectedAddons.size > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span>Add-on Services ({selectedAddons.size} items)</span>
                      <span>{formatCurrency(totals.addonsTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm mt-1">
                    <span>La Carte Services</span>
                    <span>{formatCurrency(9900)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This is the rough amount that you will be charged upon the successful completion of your service. 
                  Please note that the final charges may vary slightly due to additional services or parts that may be required during the service.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isConfirming}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFinalConfirmation}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isConfirming}
                >
                  {isConfirming ? 'Confirming...' : 'Confirm Order'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Review and confirm your order to proceed with the service</p>
          <p className="mt-1">Questions? Contact us on WhatsApp</p>
        </div>
      </div>
    </div>
  )
}