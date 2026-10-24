export interface StatusMetaItem {
  label: string
  color: 'green' | 'blue' | 'amber' | 'purple' | 'teal' | 'red' | 'slate'
  chip: string
  dot: string
  line: string
  pin: string
}

export const statusMeta: Record<string, StatusMetaItem> = {
  'In Service': {
    label: 'In Service',
    color: 'green',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
    line: '#10b981',
    pin: '#10b981',
  },
  'Installed': {
    label: 'Installed',
    color: 'teal',
    chip: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    dot: 'bg-teal-500',
    line: '#14b8a6',
    pin: '#14b8a6',
  },
  'In Stock': {
    label: 'In Stock',
    color: 'blue',
    chip: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    dot: 'bg-sky-500',
    line: '#0ea5e9',
    pin: '#0ea5e9',
  },
  'Planned': {
    label: 'Planned',
    color: 'slate',
    chip: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    dot: 'bg-slate-400',
    line: '#94a3b8',
    pin: '#94a3b8',
  },
  'Decommissioned': {
    label: 'Decommissioned',
    color: 'slate',
    chip: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    dot: 'bg-slate-400',
    line: '#94a3b8',
    pin: '#94a3b8',
  },
  'Scrapped': {
    label: 'Scrapped',
    color: 'slate',
    chip: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    dot: 'bg-slate-400',
    line: '#94a3b8',
    pin: '#94a3b8',
  },
  'Under Maintenance': {
    label: 'Under Maintenance',
    color: 'purple',
    chip: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    dot: 'bg-purple-500',
    line: '#a855f7',
    pin: '#a855f7',
  },
  'Under Repair': {
    label: 'Under Repair',
    color: 'amber',
    chip: 'bg-amber-50 text-amber-700 ring-amber-600/30',
    dot: 'bg-amber-500',
    line: '#f59e0b',
    pin: '#f59e0b',
  },
  'Faulty': {
    label: 'Faulty',
    color: 'red',
    chip: 'bg-red-50 text-red-700 ring-red-600/20',
    dot: 'bg-red-500',
    line: '#ef4444',
    pin: '#ef4444',
  },
}

/** Helper – safely get meta by status name */
export function getStatusMeta(name: string | undefined | null): StatusMetaItem {
  if (!name) {
    return {
      label: 'Unknown',
      color: 'slate',
      chip: 'bg-slate-100 text-slate-600 ring-slate-500/20',
      dot: 'bg-slate-400',
      line: '#94a3b8',
      pin: '#94a3b8',
    }
  }

  return (
    statusMeta[name] ?? {
      label: name,
      color: 'slate',
      chip: 'bg-slate-100 text-slate-600 ring-slate-500/20',
      dot: 'bg-slate-400',
      line: '#94a3b8',
      pin: '#94a3b8',
    }
  )
}