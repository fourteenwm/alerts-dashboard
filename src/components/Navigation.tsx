'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Settings } from 'lucide-react'
import { COLORS } from '@/lib/config'


export function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="fixed top-0 z-50 w-full border-b" style={{ backgroundColor: COLORS.lightGrey, borderColor: COLORS.lightPink }}>
            <div className="container mx-auto px-4 h-16 flex items-center">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-6">
                        <Link href="/" className="flex items-center">
                            <span className="font-bold" style={{ color: COLORS.primary }}>
                                Alerts Dashboard
                            </span>
                        </Link>
                        <Link
                            href="/dashboard"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-foreground/80",
                                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
                            )}
                            style={{ color: pathname === "/dashboard" ? COLORS.primary : COLORS.darkGrey }}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard-live-core"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-foreground/80",
                                pathname === "/dashboard-live-core" ? "text-foreground" : "text-foreground/60"
                            )}
                            style={{ color: pathname === "/dashboard-live-core" ? COLORS.primary : COLORS.darkGrey }}
                        >
                            Dashboard LivCor
                        </Link>
                        <Link
                            href="/all-error-score-card"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-foreground/80",
                                pathname === "/all-error-score-card" ? "text-foreground" : "text-foreground/60"
                            )}
                            style={{ color: pathname === "/all-error-score-card" ? COLORS.primary : COLORS.darkGrey }}
                        >
                            All Error Score Card
                        </Link>
                        <Link
                            href="/broken-error-dashboard"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-foreground/80",
                                pathname === "/broken-error-dashboard" ? "text-foreground" : "text-foreground/60"
                            )}
                            style={{ color: pathname === "/broken-error-dashboard" ? COLORS.primary : COLORS.darkGrey }}
                        >
                            Broken Errors
                        </Link>
                        <Link
                            href="/soft-error-dashboard"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-foreground/80",
                                pathname === "/soft-error-dashboard" ? "text-foreground" : "text-foreground/60"
                            )}
                            style={{ color: pathname === "/soft-error-dashboard" ? COLORS.primary : COLORS.darkGrey }}
                        >
                            Soft Errors
                        </Link>
                        <Link
                            href="/data-insights"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-foreground/80",
                                pathname === "/data-insights" ? "text-foreground" : "text-foreground/60"
                            )}
                            style={{ color: pathname === "/data-insights" ? COLORS.primary : COLORS.darkGrey }}
                        >
                            Data Insights
                        </Link>
                    </div>
                    <Link
                        href="/settings"
                        className={cn(
                            "transition-colors hover:text-foreground/80",
                            pathname === "/settings" ? "text-foreground" : "text-foreground/60"
                        )}
                        style={{ color: pathname === "/settings" ? COLORS.primary : COLORS.darkGrey }}
                    >
                        <Settings size={20} />
                    </Link>
                </div>
            </div>
        </nav>
    )
} 