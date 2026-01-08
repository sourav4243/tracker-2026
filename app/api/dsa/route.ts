import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// API routes for DSA questions with revision tracking
export async function GET() {
  const questions = await prisma.dSAQuestion.findMany({
    include: {
      revisions: {
        orderBy: { createdAt: 'desc' }
      }
    },
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
    },
    include: {
      revisions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  return NextResponse.json(updated)
}

export async function POST(request: Request) {
  const { id } = await request.json()
  
  // Get the current question to know its status
  const question = await prisma.dSAQuestion.findUnique({
    where: { id }
  })
  
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }
  
  // Create a revision entry with the current status
  await prisma.dSARevision.create({
    data: {
      questionId: id,
      status: question.status
    }
  })
  
  // Return updated question with revisions
  const updated = await prisma.dSAQuestion.findUnique({
    where: { id },
    include: {
      revisions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  return NextResponse.json(updated)
}
