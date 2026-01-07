import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const questions = await prisma.dSAQuestion.findMany({
    orderBy: [
      { phase: 'asc' },
      { topic: 'asc' },
      { title: 'asc' }
    ]
  })
  return NextResponse.json(questions)
}

export async function PUT(request: Request) {
  const { id, status, completedAt } = await request.json()
  const updated = await prisma.dSAQuestion.update({
    where: { id },
    data: { 
      status,
      completedAt: completedAt ? new Date(completedAt) : null
    }
  })
  return NextResponse.json(updated)
}
