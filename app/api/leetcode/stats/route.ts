import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.LEETCODE_BACKEND_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/leetcode/stats`, {
      headers: {
        'x-api-key': API_KEY!
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Backend stats response not OK:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch LeetCode stats' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
