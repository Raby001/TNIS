export type DashboardTone = 'emerald' | 'blue' | 'violet' | 'amber' | 'slate' | 'red'

export type ActivityAction = 'Insert' | 'Update' | 'Delete' | string

export interface ActivityEntry {
  id: string
  user: string
  action: ActivityAction
  table: string
  record: string
  newValue: string
  timestamp: string
}

/** One row of the "Network status mix" bar. `name` matches `getStatusMeta()` keys. */
export interface HealthRow {
  name: string
  count: number
}

export interface Metric {
  label: string
  value: number | string
  hint: string
  tone: DashboardTone
  to?: string 
}

export interface SystemHealthItem {
  label: string
  value: string
}