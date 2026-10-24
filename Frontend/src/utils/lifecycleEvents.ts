import type { Component } from 'vue'
import { PackageCheckIcon, AlertTriangleIcon, WrenchIcon, ClipboardCheckIcon } from 'lucide-vue-next'

export type LifecycleEventType = 'installed' | 'fault_reported' | 'repair_completed' | 'inspection' | 'returned_to_stock' | 'maintenance_started'

interface EventMeta {
  label: string
  icon: Component
  color: string // matches the dot/badge color style used elsewhere
  validFromStatuses: string[] // status *names*, matched against store.statuses
  resultingStatus: string | null // null = no status change, just a log entry
}

export const lifecycleEventMeta: Record<LifecycleEventType, EventMeta> = {
  installed: {
    label: 'Installed',
    icon: PackageCheckIcon,
    color: 'text-teal-600 bg-teal-50',
    validFromStatuses: ['In Stock', 'Reserved', 'In Transit', 'Returned'],
    resultingStatus: 'Installed',
  },
  fault_reported: {
    label: 'Fault Reported',
    icon: AlertTriangleIcon,
    color: 'text-red-600 bg-red-50',
    validFromStatuses: ['Installed'],
    resultingStatus: 'Under Repair',
  },
  repair_completed: {
    label: 'Repair Completed',
    icon: WrenchIcon,
    color: 'text-emerald-600 bg-emerald-50',
    validFromStatuses: ['Under Repair'],
    resultingStatus: 'Installed',
  },
  inspection: {
    label: 'Inspection',
    icon: ClipboardCheckIcon,
    color: 'text-sky-600 bg-sky-50',
    validFromStatuses: ['Installed', 'Under Repair'],
    resultingStatus: null,
  },
  returned_to_stock: {
    label: 'Returned to Stock',
    icon: PackageCheckIcon, // reuse, or pick a different icon like RotateCcwIcon
    color: 'text-blue-600 bg-blue-50',
    validFromStatuses: ['Installed', 'Under Repair'],
    resultingStatus: 'In Stock',
  },
  maintenance_started: {
    label: 'Maintenance Started',
    icon: WrenchIcon,
    color: 'text-purple-600 bg-purple-50',
    validFromStatuses: ['Installed'],
    resultingStatus: 'Under Maintenance',
  },
}

export function getValidEventTypes(currentStatusName: string | undefined): LifecycleEventType[] {
  if (!currentStatusName) return []
  return (Object.keys(lifecycleEventMeta) as LifecycleEventType[]).filter((key) =>
    lifecycleEventMeta[key].validFromStatuses.includes(currentStatusName)
  )
}