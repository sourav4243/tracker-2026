import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const [dsaTotal, dsaDone, dsaRevisit, csTotal, csDone, dailyLogs] = await Promise.all([
    prisma.dSAQuestion.count(),
    prisma.dSAQuestion.count({ where: { status: 'DONE' } }),
    prisma.dSAQuestion.count({ where: { status: 'REVISIT' } }),
    prisma.cSConcept.count(),
    prisma.cSConcept.count({ where: { status: 'DONE' } }),
    prisma.dailyLog.count({ where: { exercise: true } })
  ])
  
  return NextResponse.json({
    dsa: { total: dsaTotal, done: dsaDone, revisit: dsaRevisit },
    cs: { total: csTotal, done: csDone },
    exercise: { days: dailyLogs }
  })
}
