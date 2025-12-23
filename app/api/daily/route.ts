import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const logs = await prisma.dailyLog.findMany({
    orderBy: { date: 'desc' },
    take: 30
  })
  return NextResponse.json(logs)
}

export async function POST(request: Request) {
  const { date, exercise, coding, notes } = await request.json()
  
  const existing = await prisma.dailyLog.findUnique({
    where: { date: new Date(date) }
  })
  
  if (existing) {
    const updated = await prisma.dailyLog.update({
      where: { id: existing.id },
      data: { exercise, coding, notes }
    })
    return NextResponse.json(updated)
  }
  
  const created = await prisma.dailyLog.create({
    data: {
      date: new Date(date),
      exercise,
      coding,
      notes
    }
  })
  return NextResponse.json(created)
}
