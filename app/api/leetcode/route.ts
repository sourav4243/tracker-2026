import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.LEETCODE_BACKEND_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

export async function GET() {
  try {
    // Fetch from external backend (now with MongoDB persistence)
    const response = await fetch(`${BACKEND_URL}/api/leetcode`, {
      headers: {
        'x-api-key': API_KEY!
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Backend response not OK:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch LeetCode data', status: response.status },
        { status: response.status }
      )
    }

    const backendData = await response.json()
    
    // Backend now handles daily calculation, just pass through
    return NextResponse.json({
      total_active_seconds: backendData.total_active_seconds || 0,
      is_active_now: backendData.is_active_now || false,
      daily_active_seconds: backendData.daily_active_seconds || 0,
      last_updated: backendData.last_updated || backendData.last_update
    })
  } catch (error) {
    console.error('Error fetching LeetCode data:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Forward to external backend (though extension already does this)
    const response = await fetch(`${BACKEND_URL}/api/leetcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('Backend POST response not OK:', response.status)
      return NextResponse.json(
        { error: 'Failed to update LeetCode data', status: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating LeetCode data:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
