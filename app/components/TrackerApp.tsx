'use client'

import { useState, useEffect, useMemo } from 'react'

// --- Types ---
type DSARevision = {
  id: string
  status: string
  createdAt: string
}

type DSAQuestion = {
  id: string
  title: string
  link: string | null
  phase: string
  topic: string
  status: string
  completedAt?: string | null // Added to track when it was solved
  revisions?: DSARevision[]
}

type CSConcept = {
  id: string
  subject: string
  topic: string
  status: string
}

type DailyLog = {
  id: string
  date: string
  exercise: boolean
  coding: boolean
  notes: string | null
}

type Stats = {
  dsa: { total: number; done: number; revisit: number }
  cs: { total: number; done: number }
  exercise: { days: number }
}

type LeetCodeData = {
  total_active_seconds: number
  is_active_now: boolean
  daily_active_seconds?: number
  last_updated?: string
}

type LeetCodeStats = {
  total_days_active: number
  average_daily_seconds: number
  longest_session: { duration_seconds: number; date: string; start_time: string } | null
  current_streak: number
  total_seconds_all_time: number
  last_7_days_total_seconds: number
  current_month_total_seconds: number
}

type DailyHistory = {
  date: string
  total_seconds: number
  session_count: number
}

type Tab = 'dashboard' | 'dsa' | 'cs' | 'daily'

// --- SVGs ---
const Icons = {
  Chart: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Code: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Book: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  External: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  History: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
}

// --- Component: Monthly Calendar (Question Based) ---
const ContributionGraph = ({ questions }: { questions: DSAQuestion[] }) => {
  const [monthOffset, setMonthOffset] = useState(0)
  
  const { grid, monthName, totalSolvedThisMonth, isCurrentMonth } = useMemo(() => {
    const today = new Date()
    const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    
    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    const isCurrentMonth = monthOffset === 0

    // Group questions by completedAt date
    const solvedMap = new Map<string, number>()
    let monthlyTotal = 0

    questions.forEach(q => {
      if ((q.status === 'DONE' || q.status === 'REVISIT') && q.completedAt) {
        // Normalize date string to YYYY-MM-DD
        const dateStr = q.completedAt.split('T')[0]
        const currentCount = solvedMap.get(dateStr) || 0
        solvedMap.set(dateStr, currentCount + 1)
        
        // Check if this date falls in current month for the total count
        const qDate = new Date(q.completedAt)
        if (qDate.getMonth() === month && qDate.getFullYear() === year) {
            monthlyTotal++
        }
      }
    })

    const gridCells = []

    // Padding
    for (let i = 0; i < startOffset; i++) {
      gridCells.push(null)
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const offset = date.getTimezoneOffset()
      const localDate = new Date(date.getTime() - (offset * 60 * 1000))
      const dateStr = localDate.toISOString().split('T')[0]

      const count = solvedMap.get(dateStr) || 0
      

      let level = 0
      if (count === 0) level = 0
      else if (count === 1) level = 1
      else if (count <= 3) level = 2
      else level = 3

      gridCells.push({
        date: dateStr,
        day: d,
        count: count,
        level: level,
        isToday: isCurrentMonth && dateStr === new Date().toISOString().split('T')[0]
      })
    }

    return { grid: gridCells, monthName, totalSolvedThisMonth: monthlyTotal, isCurrentMonth }
  }, [questions, monthOffset])

  const getColor = (level: number) => {
    switch(level) {
      case 0: return 'bg-[#161b22]'
      case 1: return 'bg-[#0e4429]'
      case 2: return 'bg-[#006d32]'
      case 3: return 'bg-[#39d353]'
      default: return 'bg-[#161b22]'
    }
  }

  return (
    <div className="bg-[#0d1117] border border-zinc-800 rounded-xl p-6 w-full max-w-sm mx-auto md:max-w-none md:mx-0 h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={() => setMonthOffset(prev => prev - 1)}
              className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
              title="Previous month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setMonthOffset(0)}
              disabled={isCurrentMonth}
              className="px-2 py-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
              title="Current month"
            >
              Today
            </button>
            <button
              onClick={() => setMonthOffset(prev => prev + 1)}
              disabled={isCurrentMonth}
              className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{monthName}</h3>
            <p className="text-xs text-zinc-500">{totalSolvedThisMonth} questions solved</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-[#161b22]" />
            <div className="w-2.5 h-2.5 rounded-xs bg-[#0e4429]" />
            <div className="w-2.5 h-2.5 rounded-xs bg-[#006d32]" />
            <div className="w-2.5 h-2.5 rounded-xs bg-[#39d353]" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-xs text-zinc-500 font-medium py-1">
            {d}
          </div>
        ))}

        {grid.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} />
          return (
            <div
              key={cell.date}
              className={`
                aspect-square rounded-[3px] flex items-center justify-center text-[10px] relative group
                ${getColor(cell.level)} 
                ${cell.isToday ? 'ring-1 ring-white' : 'border border-transparent hover:border-zinc-500'}
                transition-all duration-200 cursor-default
              `}
            >
              <span className={`font-medium ${cell.level > 1 ? 'text-black/70' : 'text-zinc-500/50 group-hover:text-zinc-300'}`}>
                {cell.day}
              </span>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-xl border border-zinc-700">
                {new Date(cell.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                <br/>
                {cell.count} Solved
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Component: Revision History Modal ---
const RevisionHistoryModal = ({ question, onClose }: { question: DSAQuestion, onClose: () => void }) => {
  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  const revisions = question.revisions || []

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-start justify-between sticky top-0 bg-zinc-900/95 backdrop-blur-sm">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{question.title}</h3>
            <p className="text-sm text-zinc-400">Revision History</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1">
            <Icons.X />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {revisions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-zinc-500 mb-2">
                <Icons.History />
              </div>
              <p className="text-zinc-400">No revisions yet</p>
              <p className="text-xs text-zinc-600 mt-1">Mark this question as DONE or REVISIT to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
                  <Icons.History />
                  <span className="text-sm font-bold text-white">{revisions.length}</span>
                  <span className="text-xs text-zinc-400">revision{revisions.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              {revisions.map((revision, index) => (
                <div key={revision.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="shrink-0 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      revision.status === 'DONE' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        revision.status === 'DONE' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {revision.status}
                      </span>
                      <span className="text-xs text-zinc-500">#{revisions.length - index}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>{new Date(revision.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="text-zinc-500">{getDaysAgo(revision.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Helper: Format seconds to human-readable time ---
const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

export default function TrackerApp() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [dsaQuestions, setDsaQuestions] = useState<DSAQuestion[]>([])
  const [csConcepts, setCsConcepts] = useState<CSConcept[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [dsaFilter, setDsaFilter] = useState<string>('all')
  const [dsaPhaseFilter, setDsaPhaseFilter] = useState<string>('all')
  const [dsaStatusFilter, setDsaStatusFilter] = useState<string>('all')
  const [selectedQuestion, setSelectedQuestion] = useState<DSAQuestion | null>(null)
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeData | null>(null)
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null)
  const [leetcodeHistory, setLeetcodeHistory] = useState<DailyHistory[]>([])
  const [dailyTarget, setDailyTarget] = useState<number>(3)

  useEffect(() => {
    fetchData()
    
    // Poll LeetCode data every 30 seconds
    const interval = setInterval(() => {
      fetch('/api/leetcode')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setLeetcodeData(data)
          }
        })
        .catch(err => console.error('Error polling LeetCode data:', err))
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, dsaRes, csRes, dailyRes, leetcodeRes, leetcodeStatsRes, leetcodeHistoryRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/dsa'),
        fetch('/api/cs'),
        fetch('/api/daily'),
        fetch('/api/leetcode').catch(err => {
          console.error('LeetCode API error:', err)
          return null
        }),
        fetch('/api/leetcode/stats').catch(err => {
          console.error('LeetCode stats error:', err)
          return null
        }),
        fetch('/api/leetcode/history').catch(err => {
          console.error('LeetCode history error:', err)
          return null
        })
      ])
      setStats(await statsRes.json())
      setDsaQuestions(await dsaRes.json())
      setCsConcepts(await csRes.json())
      setDailyLogs(await dailyRes.json())
      
      if (leetcodeRes && leetcodeRes.ok) {
        const leetcodeData = await leetcodeRes.json()
        if (!leetcodeData.error) {
          setLeetcodeData(leetcodeData)
        }
      }
      
      if (leetcodeStatsRes && leetcodeStatsRes.ok) {
        const statsData = await leetcodeStatsRes.json()
        if (!statsData.error) {
          setLeetcodeStats(statsData)
        }
      }
      
      if (leetcodeHistoryRes && leetcodeHistoryRes.ok) {
        const historyData = await leetcodeHistoryRes.json()
        if (!historyData.error && historyData.data) {
          setLeetcodeHistory(historyData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const updateDSAStatus = async (id: string, status: string) => {
    // Optimistic update logic
    const now = new Date().toISOString()
    
    setDsaQuestions(prev => prev.map(q => {
        if (q.id !== id) return q
        // If marking DONE or REVISIT, set completedAt. If marking TODO, clear it.
        return { 
            ...q, 
            status,
            completedAt: (status === 'DONE' || status === 'REVISIT') ? now : (status === 'TODO' ? null : q.completedAt)
        }
    }))
    
    // Also update stats optimistically to feel snappy
    if (stats) {
        setStats({
            ...stats,
            dsa: {
                ...stats.dsa,
                done: status === 'DONE' ? stats.dsa.done + 1 : stats.dsa.done - 1 // Simplified logic
            }
        })
    }

    await fetch('/api/dsa', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          id, 
          status,
          completedAt: (status === 'DONE' || status === 'REVISIT') ? now : null 
      })
    }).then(res => res.json())
      .then(updatedQuestion => {
        // Update with the actual response including revisions
        setDsaQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q))
      })
    fetchStats()
  }
  const addRevision = async (id: string) => {
    await fetch('/api/dsa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(res => res.json())
      .then(updatedQuestion => {
        // Update with the actual response including new revision
        setDsaQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q))
      })
  }
  const updateCSStatus = async (id: string, status: string) => {
    setCsConcepts(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    
    await fetch('/api/cs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    fetchStats()
  }

  const toggleDaily = async (field: 'exercise' | 'coding') => {
    const today = new Date().toISOString().split('T')[0]
    const existing = dailyLogs.find(l => l.date.split('T')[0] === today)
    
    const newStatus = field === 'exercise' ? !(existing?.exercise ?? false) : !(existing?.coding ?? false)
    
    const tempLog = existing 
      ? { ...existing, [field]: newStatus } 
      : { id: 'temp', date: today, exercise: field === 'exercise', coding: field === 'coding', notes: '' }
    
    setDailyLogs(prev => {
      const filtered = prev.filter(l => l.date.split('T')[0] !== today)
      return [...filtered, tempLog as DailyLog]
    })

    await fetch('/api/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: today,
        exercise: field === 'exercise' ? newStatus : (existing?.exercise ?? false),
        coding: field === 'coding' ? newStatus : (existing?.coding ?? false),
        notes: existing?.notes ?? ''
      })
    })
    
    const res = await fetch('/api/daily')
    setDailyLogs(await res.json())
    fetchStats()
  }

  const fetchStats = async () => {
    const res = await fetch('/api/stats')
    setStats(await res.json())
  }

  // Helper for colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'REVISIT': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  const phases = [...new Set(dsaQuestions.map(q => q.phase))]
  const topics = [...new Set(dsaQuestions.filter(q => dsaPhaseFilter === 'all' || q.phase === dsaPhaseFilter).map(q => q.topic))]

  const filteredDSA = dsaQuestions.filter(q => {
    if (dsaPhaseFilter !== 'all' && q.phase !== dsaPhaseFilter) return false
    if (dsaFilter !== 'all' && q.topic !== dsaFilter) return false
    if (dsaStatusFilter !== 'all' && q.status !== dsaStatusFilter) return false
    return true
  })

  const groupedByTopic = filteredDSA.reduce((acc, q) => {
    if (!acc[q.topic]) acc[q.topic] = []
    acc[q.topic].push(q)
    return acc
  }, {} as Record<string, DSAQuestion[]>)

  const subjects = [...new Set(csConcepts.map(c => c.subject))]

  // Calculate DSA solving streak
  const calculateDSAStreak = () => {
    const solvedDates = new Set<string>()
    
    dsaQuestions.forEach(q => {
      if ((q.status === 'DONE' || q.status === 'REVISIT') && q.completedAt) {
        const dateStr = q.completedAt.split('T')[0]
        solvedDates.add(dateStr)
      }
    })
    
    if (solvedDates.size === 0) return 0
    
    const sortedDates = Array.from(solvedDates).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    )
    
    const today = new Date().toISOString().split('T')[0]
    let streak = 0
    let currentDate = new Date(today)
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = currentDate.toISOString().split('T')[0]
      
      if (sortedDates.includes(checkDate)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }
  
  const dsaStreak = calculateDSAStreak()
  
  // Calculate estimated completion date
  const calculateCompletionDate = () => {
    if (!stats) return null
    
    const remaining = stats.dsa.total - (stats.dsa.done + stats.dsa.revisit)
    if (remaining <= 0 || dailyTarget <= 0) return null
    
    const daysNeeded = Math.ceil(remaining / dailyTarget)
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + daysNeeded)
    
    return {
      date: completionDate,
      daysNeeded,
      remaining
    }
  }
  
  const completionInfo = calculateCompletionDate()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-emerald-500 font-mono text-sm tracking-widest animate-pulse">SYNCING DATA...</div>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const todayLog = dailyLogs.find(l => l.date.split('T')[0] === today)

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30 overscroll-none">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header Section */}
        <header className="mb-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-500">Khel</span> Khatm
              </h1>
              <p className="text-zinc-500 font-medium">Master Data Structures, Core CS & Discipline.</p>
            </div>
            
            <nav className="bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800/50 flex gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Icons.Chart },
                { id: 'dsa', label: 'DSA', icon: Icons.Code },
                { id: 'cs', label: 'Core CS', icon: Icons.Book },
                { id: 'daily', label: 'Daily', icon: Icons.Calendar },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* LeetCode Today's Activity - Prominent Display */}
          {leetcodeData && (
            <div className="bg-linear-to-br from-cyan-950/30 via-blue-950/20 to-purple-950/30 border border-cyan-800/50 rounded-2xl p-4 backdrop-blur-sm shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-0.5">LeetCode Today</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                        {formatTime(leetcodeData.daily_active_seconds || 0)}
                      </span>
                      <span className="text-xs text-zinc-500">active time</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <div className={`w-2.5 h-2.5 rounded-full ${leetcodeData.is_active_now ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-zinc-600'}`} />
                    <span className={`text-sm font-medium ${leetcodeData.is_active_now ? 'text-green-400' : 'text-zinc-500'}`}>
                      {leetcodeData.is_active_now ? 'Active Now' : 'Offline'}
                    </span>
                  </div>
                  
                  {leetcodeStats && (
                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                      <div className="text-center">
                        <div className="text-xs text-zinc-500">Streak</div>
                        <div className="text-lg font-bold text-orange-400">{leetcodeStats.current_streak}</div>
                      </div>
                      <div className="w-px h-8 bg-zinc-700" />
                      <div className="text-center">
                        <div className="text-xs text-zinc-500">Avg/Day</div>
                        <div className="text-lg font-bold text-purple-400">{formatTime(leetcodeStats.average_daily_seconds)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && stats && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* --- Contribution Graph (Questions Solved) --- */}
                <div className="flex-1">
                    <ContributionGraph questions={dsaQuestions} />
                </div>
                
                {/* Weekly Activity Chart */}
                {leetcodeStats && leetcodeHistory.length > 0 && (
                  <div className="flex-1 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-6">
                    <div>
                      <h3 className="text-zinc-200 font-semibold text-lg mb-6">Last 7 Days Activity</h3>
                      <div className="flex items-end justify-between gap-2 sm:gap-4 md:gap-6 h-58 w-full">
                        {leetcodeHistory.slice(0, 7).reverse().map((day) => {
                          const maxSeconds = Math.max(...leetcodeHistory.map(d => d.total_seconds))
                          const height = maxSeconds > 0 ? (day.total_seconds / maxSeconds) * 100 : 0
                          const date = new Date(day.date)
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                          
                          return (
                            <div key={day.date} className="flex flex-col items-center gap-1 sm:gap-2 group relative h-full justify-end flex-1 min-w-0">
                              <div className="w-full max-w-[40px] sm:max-w-[48px] mx-auto h-full bg-zinc-800 rounded-t-lg relative overflow-hidden hover:bg-zinc-700 transition-colors cursor-default flex items-end">
                                <div 
                                  className="w-full bg-linear-to-t from-emerald-500 to-cyan-400 rounded-t-lg transition-all duration-500"
                                  style={{ height: `${height}%`, minHeight: day.total_seconds > 0 ? '4px' : '0px' }}
                                />
                              </div>
                              <div className="text-center shrink-0 w-full">
                                <div className="text-[10px] sm:text-xs text-zinc-400 font-medium truncate">{dayName}</div>
                                <div className="text-[9px] sm:text-[10px] text-zinc-600 truncate">{formatTime(day.total_seconds)}</div>
                              </div>
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-xl border border-zinc-700 transition-opacity">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                <br/>
                                {formatTime(day.total_seconds)}
                                <br/>
                                {day.session_count} session{day.session_count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Quick Check-in */}
                    <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-5">
                      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"/>
                        Quick Check-in
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => toggleDaily('exercise')}
                          className={`group relative p-4 rounded-lg border transition-all duration-300 ${
                            todayLog?.exercise
                              ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20'
                              : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <span className="text-2xl group-hover:scale-110 transition-transform">🏃</span>
                            <span className={`text-xs font-medium ${todayLog?.exercise ? 'text-emerald-400' : 'text-zinc-400'}`}>
                              {todayLog?.exercise ? 'Done' : 'Exercise'}
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={() => toggleDaily('coding')}
                          className={`group relative p-4 rounded-lg border transition-all duration-300 ${
                            todayLog?.coding
                              ? 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20'
                              : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <span className="text-2xl group-hover:scale-110 transition-transform">💻</span>
                            <span className={`text-xs font-medium ${todayLog?.coding ? 'text-blue-400' : 'text-zinc-400'}`}>
                              {todayLog?.coding ? 'Done' : 'Code'}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* DSA Card */}
              <div className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icons.Code />
                </div>
                <h3 className="text-zinc-400 font-medium mb-4 flex items-center gap-2">DSA Progress</h3>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-bold text-white tracking-tight">{stats.dsa.done + stats.dsa.revisit}</span>
                  <span className="text-zinc-500 pb-2 text-lg">/ {stats.dsa.total}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${((stats.dsa.done + stats.dsa.revisit) / stats.dsa.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-emerald-400">{Math.round(((stats.dsa.done + stats.dsa.revisit) / stats.dsa.total) * 100)}% Complete</span>
                  <span className="text-amber-400">{stats.dsa.revisit} To Revisit</span>
                </div>
              </div>

              {/* CS Card */}
              <div className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icons.Book />
                </div>
                <h3 className="text-zinc-400 font-medium mb-4">Core CS</h3>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-bold text-white tracking-tight">{stats.cs.done}</span>
                  <span className="text-zinc-500 pb-2 text-lg">/ {stats.cs.total}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(stats.cs.done / stats.cs.total) * 100}%` }}
                  />
                </div>
                <div className="text-xs font-medium text-blue-400">
                  {Math.round((stats.cs.done / stats.cs.total) * 100)}% Syllabus Covered
                </div>
              </div>

              {/* Exercise Card */}
              <div className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            
                  <span className="text-4xl">🔥</span>
                </div>
                <h3 className="text-zinc-400 font-medium mb-4">Coding Streak</h3>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-br from-orange-400 to-red-500 tracking-tight">
                    {dsaStreak}
                  </span>
                  <span className="text-zinc-500 pb-2 text-lg">Days</span>
                </div>
                <p className="text-sm text-zinc-500 mt-auto">
                  Daily DSA practice streak. Keep solving to maintain it!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DSA View */}
        {activeTab === 'dsa' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 max-w-5xl mx-auto">
            {/* Completion Estimator */}
            {stats && completionInfo && (
              <div className="bg-linear-to-br from-emerald-900/20 via-emerald-800/10 to-cyan-900/20 border border-emerald-700/30 rounded-xl p-5 mb-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">Completion Estimate</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">
                          {completionInfo.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {completionInfo.remaining} questions left • {completionInfo.daysNeeded} days
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-zinc-900/50 rounded-lg border border-zinc-800 px-4 py-2">
                    <button
                      onClick={() => setDailyTarget(Math.max(1, dailyTarget - 1))}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors flex items-center justify-center text-zinc-400 hover:text-white font-bold"
                    >
                      −
                    </button>
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold text-emerald-400">{dailyTarget}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">per day</div>
                    </div>
                    <button
                      onClick={() => setDailyTarget(dailyTarget + 1)}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors flex items-center justify-center text-zinc-400 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4 mb-8">
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-2 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mr-2 flex items-center">Status:</label>
                <button
                  onClick={() => setDsaStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    dsaStatusFilter === 'all'
                      ? 'bg-zinc-700 text-white shadow-lg'
                      : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDsaStatusFilter('TODO')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    dsaStatusFilter === 'TODO'
                      ? 'bg-zinc-600 text-white shadow-lg'
                      : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  To Do
                </button>
                <button
                  onClick={() => setDsaStatusFilter('REVISIT')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    dsaStatusFilter === 'REVISIT'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  Revisit
                </button>
                <button
                  onClick={() => setDsaStatusFilter('DONE')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    dsaStatusFilter === 'DONE'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  Done
                </button>
              </div>

              {/* Phase and Topic Filters */}
              <div className="flex flex-wrap gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                <div className="flex-1 min-w-50">
                  <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1 block">Phase</label>
                  <select
                    value={dsaPhaseFilter}
                    onChange={(e) => {
                      setDsaPhaseFilter(e.target.value)
                      setDsaFilter('all')
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none cursor-pointer hover:bg-zinc-700/50 transition-colors [&>option]:bg-zinc-900 [&>option]:text-zinc-200 [&>option]:py-2"
                  >
                    <option value="all">All Phases</option>
                    {phases.map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-50">
                  <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1 block">Topic</label>
                  <select
                    value={dsaFilter}
                    onChange={(e) => setDsaFilter(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none cursor-pointer hover:bg-zinc-700/50 transition-colors [&>option]:bg-zinc-900 [&>option]:text-zinc-200 [&>option]:py-2"
                  >
                    <option value="all">All Topics</option>
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {Object.entries(groupedByTopic).map(([topic, questions]) => (
                <div key={topic} className="bg-zinc-900/20 rounded-xl border border-zinc-800/50 overflow-hidden">
                  <div className="px-6 py-4 bg-zinc-900/80 border-b border-zinc-800 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
                    <h3 className="text-lg font-bold text-zinc-100">{topic}</h3>
                    <div className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400 border border-zinc-700">
                      {questions.filter(q => q.status === 'DONE').length} / {questions.length}
                    </div>
                  </div>
                  
                  <div className="divide-y divide-zinc-800/50">
                    {questions.map(q => (
                      <div key={q.id} className="p-4 hover:bg-zinc-800/30 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            q.status === 'DONE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                            q.status === 'REVISIT' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                            'bg-zinc-700'
                          }`} />
                          <div className="flex-1 min-w-0">
                            {q.link ? (
                              <a href={q.link} target="_blank" rel="noreferrer" className="text-zinc-200 font-medium hover:text-emerald-400 transition-colors flex items-center gap-2 group-hover:translate-x-1 duration-200">
                                {q.title} <Icons.External />
                              </a>
                            ) : (
                              <span className="text-zinc-200 font-medium">{q.title}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 items-center self-end sm:self-auto">
                          {/* Revision Button */}
                          <button
                            onClick={() => addRevision(q.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/50 hover:border-purple-500 rounded-lg text-purple-400 hover:text-purple-300 transition-all text-xs font-bold"
                            title="Add revision"
                          >
                            <Icons.Plus />
                            <span>Revision</span>
                            {q.revisions && q.revisions.length > 0 && (
                              <span className="ml-1 px-1.5 py-0.5 bg-purple-600/40 rounded text-[10px] font-mono">
                                {q.revisions.length}
                              </span>
                            )}
                          </button>
                          
                          {/* View History Button */}
                          {q.revisions && q.revisions.length > 0 && (
                            <button
                              onClick={() => setSelectedQuestion(q)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all text-xs font-bold"
                              title="View revision history"
                            >
                              <Icons.History />
                            </button>
                          )}
                          
                          {/* Status Buttons */}
                          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                            {(['TODO', 'REVISIT', 'DONE'] as const).map(status => (
                              <button
                                key={status}
                                onClick={() => updateDSAStatus(q.id, status)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                  q.status === status
                                    ? status === 'DONE' ? 'bg-emerald-600 text-white shadow-lg' :
                                      status === 'REVISIT' ? 'bg-amber-600 text-white shadow-lg' :
                                      'bg-zinc-600 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CS View */}
        {activeTab === 'cs' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto space-y-8">
            {subjects.map(subject => (
              <div key={subject} className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50">
                  <h3 className="text-xl font-bold text-blue-400 flex justify-between items-center">
                    {subject}
                    <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                      {csConcepts.filter(c => c.subject === subject && c.status === 'DONE').length} / {csConcepts.filter(c => c.subject === subject).length} completed
                    </span>
                  </h3>
                </div>
                <div className="p-2 grid gap-2">
                  {csConcepts.filter(c => c.subject === subject).map(concept => (
                    <div
                      key={concept.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                        concept.status === 'DONE' 
                          ? 'bg-blue-500/5 border-blue-500/20' 
                          : 'bg-zinc-900 border-transparent hover:border-zinc-700'
                      }`}
                    >
                      <span className={`font-medium ${concept.status === 'DONE' ? 'text-blue-100' : 'text-zinc-400'}`}>
                        {concept.topic}
                      </span>
                      
                      <button
                        onClick={() => updateCSStatus(concept.id, concept.status === 'DONE' ? 'TODO' : 'DONE')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          concept.status === 'DONE'
                            ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                            : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                        }`}
                      >
                        <Icons.Check />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Daily History View */}
        {activeTab === 'daily' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 max-w-3xl mx-auto">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 mb-8 text-center">
                <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Current Habit Streak</h3>
                <div className="flex justify-center gap-1">
                   {Array.from({length: 7}).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      const dateStr = d.toISOString().split('T')[0];
                      const log = dailyLogs.find(l => l.date.split('T')[0] === dateStr);
                      const isToday = dateStr === today;
                      
                      return (
                        <div key={i} className="flex flex-col items-center gap-2">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                             log?.coding && log?.exercise 
                              ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                              : log?.coding || log?.exercise
                                ? 'bg-zinc-700 border-zinc-600'
                                : 'bg-zinc-900 border-zinc-800'
                           } ${isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : ''}`}>
                             <span className="text-xs">
                               {log?.coding && log?.exercise ? '🔥' : log?.coding || log?.exercise ? '👍' : ''}
                             </span>
                           </div>
                           <span className="text-[10px] text-zinc-500 font-mono">
                             {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                           </span>
                        </div>
                      )
                   })}
                </div>
             </div>

            <h3 className="text-xl font-bold text-zinc-100 mb-6 px-2">History Log</h3>
            <div className="space-y-3">
              {dailyLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                <div
                  key={log.id}
                  className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-medium">
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{log.date.split('T')[0]}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className={`px-3 py-1 rounded-md text-sm border font-medium flex items-center gap-2 ${
                      log.exercise 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-zinc-800/50 text-zinc-600 border-zinc-700/50'
                    }`}>
                      🏃 {log.exercise ? 'Done' : '-'}
                    </span>
                    <span className={`px-3 py-1 rounded-md text-sm border font-medium flex items-center gap-2 ${
                      log.coding 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-zinc-800/50 text-zinc-600 border-zinc-700/50'
                    }`}>
                      💻 {log.coding ? 'Done' : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {/* Revision History Modal */}
      {selectedQuestion && (
        <RevisionHistoryModal 
          question={selectedQuestion} 
          onClose={() => setSelectedQuestion(null)} 
        />
      )}
    </div>
  )
}