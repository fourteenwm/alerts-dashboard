// src/app/page.tsx

'use client'

import { DashboardPage } from '@/components/DashboardPage'
import { SettingsProvider } from '@/lib/contexts/SettingsContext'
import { Toaster } from '@/components/ui/toaster'
import { COLORS } from '@/lib/config'

export default function Home() {
  return (
    <SettingsProvider>
      <div className="min-h-screen" style={{ backgroundColor: COLORS.lightGrey }}>
        <DashboardPage />
        <Toaster />
      </div>
    </SettingsProvider>
  )
}