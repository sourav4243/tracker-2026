import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.LEETCODE_BACKEND_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '7' // Default to last 7 days
    
    // Calculate start_date and end_date
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))
    
    const start = startDate.toISOString().split('T')[0]
    const end = endDate.toISOString().split('T')[0]
    
    const response = await fetch(`${BACKEND_URL}/api/leetcode/history?start_date=${start}&end_date=${end}`, {
      headers: {
        'x-api-key': API_KEY!
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Backend history response not OK:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch LeetCode history' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching LeetCode history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
