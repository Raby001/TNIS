export type Role =
  | 'ADMIN'
  | 'VIEWER'
  | 'INVENTORY_MANAGER'
  | 'WAREHOUSE_STAFF'
  | 'FIELD_ENGINEER'
  | 'PLANNER'
  | 'AUDITOR'

export const roleMeta: Record<Role, { label: string; chip: string }> = {
  ADMIN: {
    label: 'Admin',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  VIEWER: {
    label: 'Viewer',
    chip: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
  INVENTORY_MANAGER: {
    label: 'Inventory Manager',
    chip: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  WAREHOUSE_STAFF: {
    label: 'Warehouse',
    chip: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  FIELD_ENGINEER: {
    label: 'Field Engineer',
    chip: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  PLANNER: {
    label: 'Planner',
    chip: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
  AUDITOR: {
    label: 'Auditor',
    chip: 'bg-orange-50 text-orange-700 ring-orange-200',
  },
}