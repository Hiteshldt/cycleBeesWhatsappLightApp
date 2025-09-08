'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Search } from 'lucide-react'

export default function RequestLookup() {
  const [orderId, setOrderId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) {
      setError('Please enter an Order ID')
      return
    }
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Call API to find request by order ID and phone number
      const response = await fetch(`/api/public/lookup?orderId=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(phoneNumber.trim())}`)
      
      if (response.ok) {
        const data = await response.json()
        // Redirect to the order page using the short slug
        router.push(`/o/${data.shortSlug}`)
      } else if (response.status === 404) {
        setError('Order not found. Please check your Order ID and phone number.')
      } else {
        setError('Failed to lookup order. Please try again.')
      }
    } catch (error) {
      console.error('Lookup error:', error)
      setError('Failed to lookup order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">CycleBees</h1>
            <p className="text-sm text-gray-600">Professional Bike Service</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Find Your Service Request</h2>
            <p className="text-gray-600 mt-2">Enter your Order ID to view and download your service details</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., CB25010715342X"
                className="text-center font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Order ID starts with "CB" followed by date and time
              </p>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+</span>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="7005192650"
                  className="pl-8"
                  maxLength={15}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter 10-digit mobile number (91 prefix will be added automatically)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Find My Order'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Can't find your Order ID?</p>
            <p className="mt-1">Check your WhatsApp messages or contact us for help</p>
          </div>
        </div>
      </div>
    </div>
  )
}