import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const concepts = await prisma.cSConcept.findMany({
    orderBy: [
      { subject: 'asc' },
      { topic: 'asc' }
    ]
  })
  return NextResponse.json(concepts)
}

export async function PUT(request: Request) {
  const { id, status } = await request.json()
  const updated = await prisma.cSConcept.update({
    where: { id },
    data: { status }
  })
  return NextResponse.json(updated)
}
