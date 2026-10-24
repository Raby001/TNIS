export type StatusColor = 'green' | 'blue' | 'amber' | 'purple' | 'teal' | 'red' | 'slate'

interface ColorClasses {
  dot: string 
  badgeBg: string 
  badgeText: string 
}

export const statusColorMap: Record<StatusColor, ColorClasses> = {
  green: { dot: 'bg-emerald-400', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
  blue: { dot: 'bg-sky-400', badgeBg: 'bg-sky-50', badgeText: 'text-sky-700' },
  amber: { dot: 'bg-amber-400', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' },
  purple: { dot: 'bg-purple-400', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700' },
  teal: { dot: 'bg-teal-400', badgeBg: 'bg-teal-50', badgeText: 'text-teal-700' },
  red: { dot: 'bg-red-400', badgeBg: 'bg-red-50', badgeText: 'text-red-700' },
  slate: { dot: 'bg-slate-400', badgeBg: 'bg-slate-100', badgeText: 'text-slate-600' },
}