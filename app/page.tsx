'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">CycleBees</h1>
            <p className="text-gray-600 mt-2">Professional Bike Service Management</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Access */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Find Your Service Request</h2>
            <p className="text-gray-600 mb-6">
              Enter your Order ID and phone number to view service details, select add-ons, and track your order status.
            </p>
            <Link href="/lookup">
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Look Up My Order
              </Button>
            </Link>
          </div>

          {/* Admin Access */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Access the admin panel to create service requests, manage orders, and download service PDFs.
            </p>
            <Link href="/admin">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Settings className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Need help? Contact us on WhatsApp or email for assistance.</p>
        </div>
      </div>
    </div>
  )
}