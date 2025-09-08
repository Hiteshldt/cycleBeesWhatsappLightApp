import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/requests/[id] - Get a specific request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { data: requestData, error } = await supabase
      .from('requests')
      .select(`
        *,
        request_items (
          id,
          section,
          label,
          price_paise,
          is_suggested
        )
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch request' },
        { status: 500 }
      )
    }

    return NextResponse.json(requestData)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/requests/[id] - Update a request (mainly for status updates)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    
    // Only allow certain fields to be updated
    const allowedFields = ['status']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['draft', 'sent', 'viewed', 'cancelled']
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        )
      }
      
      // If status is being set to 'sent', also set sent_at timestamp
      if (updateData.status === 'sent') {
        updateData.sent_at = new Date().toISOString()
      }
    }

    const resolvedParams = await params
    const { data, error } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...data,
      message: 'Request updated successfully',
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/requests/[id] - Delete a request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    // First check if request exists
    const { data: existingRequest, error: fetchError } = await supabase
      .from('requests')
      .select('id, status')
      .eq('id', resolvedParams.id)
      .single()

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of viewed requests
    if (existingRequest.status === 'viewed') {
      return NextResponse.json(
        { error: 'Cannot delete viewed requests' },
        { status: 403 }
      )
    }

    // Delete the request (items will be deleted via CASCADE)
    const { error: deleteError } = await supabase
      .from('requests')
      .delete()
      .eq('id', resolvedParams.id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Request deleted successfully',
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}