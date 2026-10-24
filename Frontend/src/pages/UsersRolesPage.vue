<template>
  <div class="h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-slate-900">Directory</h1>
      </div>
      <Button
        v-if="canCreateUser"
        class="rounded-xl border border-blue-600 bg-blue-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
        @click="openAdd"
      >
        <PlusIcon class="h-4 w-4" />
        Add user
      </Button>
    </div>

    <div class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Directory accounts"
        :value="store.meta?.total ?? 0"
        hint="Registered staff accounts"
        :icon="UsersIcon"
        tone="blue"
        :clickable="true"
        :class="userStatusFilter === 'all' ? 'border-blue-200 bg-blue-50 shadow-[0_0_0_3px_rgba(59,130,246,0.12)] ring-1 ring-blue-200' : ''"
        @click="selectUserStatusFilter('all')"
      />
      <MetricCard
        label="Role definitions"
        :value="store.roles.length"
        hint="Available access roles"
        :icon="ShieldCheckIcon"
        tone="violet"
      />
      <MetricCard
        label="Active"
        :value="store.activeCount"
        hint="Currently enabled accounts"
        :icon="UserCheckIcon"
        tone="emerald"
        :clickable="true"
        :class="userStatusFilter === 'active' ? 'border-emerald-200 bg-emerald-50 shadow-[0_0_0_3px_rgba(16,185,129,0.12)] ring-1 ring-emerald-200' : ''"
        @click="selectUserStatusFilter('active')"
      />
      <MetricCard
        label="Inactive"
        :value="store.inactiveCount"
        hint="Deactivated accounts"
        :icon="UserXIcon"
        tone="red"
        :clickable="true"
        :class="userStatusFilter === 'inactive' ? 'border-red-200 bg-red-50 shadow-[0_0_0_3px_rgba(239,68,68,0.12)] ring-1 ring-red-200' : ''"
        @click="selectUserStatusFilter('inactive')"
      />
    </div>

    <!-- Table card -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Input variant="asset" v-model="query" placeholder="Search name or username…" class="max-w-xs" />
        <Select variant="asset" v-model="roleFilter" class="max-w-[200px]" aria-label="Filter by role">
          <option value="all">All roles</option>
          <option v-for="r in store.roles" :key="r.id" :value="r.id">
            {{ r.name }}
          </option>
        </Select>
        <span class="ml-auto text-xs text-slate-500">{{ store.users.length }} on this page · {{ totalItems }} total</span>
      </div>

      <!-- Loading -->
      <div v-if="store.isLoading" class="px-4 py-14 text-center text-sm text-slate-400">
        Loading users…
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="px-4 py-6 text-sm text-red-600">
        Couldn't load users: {{ store.error }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th class="px-4 py-2.5 font-medium">Name</th>
              <th class="px-4 py-2.5 font-medium">Username</th>
              <th class="px-4 py-2.5 font-medium">Role</th>
              <th class="px-4 py-2.5 font-medium">Province</th>
              <th class="px-4 py-2.5 font-medium">Status</th>
              <th class="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in store.users" :key="user.id" class="transition hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    :class="avatarColor(user.fullName)"
                  >
                    {{ initials(user.fullName) }}
                  </span>
                  <span class="font-medium text-slate-900">{{ user.fullName }}</span>
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-slate-600">{{ user.username }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-block rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="roleChip(user.role?.name)"
                >
                  {{ user.role?.name ?? '—' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ user.province?.name ?? '—' }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <span class="h-1.5 w-1.5 rounded-full" :class="user.isActive ? 'bg-emerald-500' : 'bg-slate-400'" />
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1.5">
                  <Button
                    v-if="canUpdateUser"
                    type="button"
                    size="sm"
                    class="border border-slate-200 bg-white text-slate-700"
                    @click="openEdit(user)"
                  >
                    <PencilIcon class="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    v-if="canUpdateUser"
                    type="button"
                    size="sm"
                    class="text-red-600 hover:bg-red-50"
                    :disabled="!user.isActive"
                    @click="onDeactivate(user)"
                  >
                    <UserXIcon class="h-3.5 w-3.5" />
                    Deactivate
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="!store.users.length">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-400">
                {{ store.users.length ? 'No users match your search.' : 'No users yet.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div
        v-if="!store.isLoading && !store.error"
        class="flex items-center justify-between border-t border-slate-200 px-4 py-3"
      >
        <p class="text-sm text-slate-500">
          Showing
          <span class="font-medium text-slate-700">
            {{ totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}
          </span>
          –
          <span class="font-medium text-slate-700">
            {{ Math.min(currentPage * pageSize, totalItems) }}
          </span>
          of
          <span class="font-medium text-slate-700">{{ totalItems }}</span>
          users
        </p>

        <div class="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            :disabled="currentPage <= 1 || store.isLoading"
            @click="goToPage(currentPage - 1)"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </Button>

          <span class="px-3 text-sm text-slate-600">
            Page {{ currentPage }} / {{ totalPages }}
          </span>

          <Button
            variant="secondary"
            size="sm"
            :disabled="currentPage >= totalPages || store.isLoading"
            @click="goToPage(currentPage + 1)"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Add user modal -->
    <Modal
      :open="showAddModal"
      title="Add user"
      description="Create a Telecom Cambodia staff account and assign their role."
      width-class="max-w-lg"
      @close="showAddModal = false"
    >
      <form class="space-y-4" @submit.prevent="onSubmitAdd">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label for="new-name" required>Full name</Label>
            <Input variant="asset" id="new-name" v-model="addForm.fullName" placeholder="e.g. Sok Vichea" />
          </div>
          <div>
            <Label for="new-username" required>Username</Label>
            <Input variant="asset" id="new-username" v-model="addForm.username" placeholder="e.g. svichea" />
          </div>
        </div>
        <div>
          <Label for="new-password" required>Password</Label>
          <div class="relative">
            <LockIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              variant="asset"
              id="new-password"
              v-model="addForm.password"
              :type="showAddPassword ? 'text' : 'password'"
              placeholder="Temporary password"
              class="pl-9 pr-10"
            />
            <button
              type="button"
              :aria-label="showAddPassword ? 'Hide password' : 'Show password'"
              :title="showAddPassword ? 'Hide password' : 'Show password'"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              @click="showAddPassword = !showAddPassword"
            >
              <EyeOffIcon v-if="showAddPassword" class="h-4 w-4" />
              <EyeIcon v-else class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label for="new-role" required>Role</Label>
            <Select variant="asset" id="new-role" v-model="addForm.roleId">
              <option value="" disabled>Select role</option>
              <option v-for="r in store.roles" :key="r.id" :value="r.id">{{ r.name }}</option>
            </Select>
          </div>
          <div>
            <Label for="new-province">Province</Label>
            <Select variant="asset" id="new-province" v-model="addForm.provinceId">
              <option value="">No province</option>
              <option v-for="p in store.provinces" :key="p.id" :value="p.id">{{ p.name }}</option>
            </Select>
          </div>
        </div>
        <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>
        <p class="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          The role determines what this account can view and edit.
        </p>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button type="button" class="border border-slate-200 bg-white" @click="showAddModal = false">
            Cancel
          </Button>
          <Button
            type="button"
            class="border border-blue-600 bg-blue-600 text-white"
            :disabled="submitting"
            @click="onSubmitAdd"
          >
            {{ submitting ? 'Creating…' : 'Create account' }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Edit user modal -->
    <Modal
      :open="showEditModal"
      title="Edit user"
      description="Update account details or reset the password."
      width-class="max-w-lg"
      @close="showEditModal = false"
    >
      <form v-if="editForm" class="space-y-4" @submit.prevent="onSubmitEdit">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label for="edit-name" required>Full name</Label>
            <Input variant="asset" id="edit-name" v-model="editForm.fullName" />
          </div>
          <div>
            <Label for="edit-username" required>Username</Label>
            <Input variant="asset" id="edit-username" v-model="editForm.username" />
          </div>
        </div>
        <div>
          <Label for="edit-password">New password</Label>
          <Input variant="asset" id="edit-password" v-model="editForm.password" type="password" placeholder="Leave blank to keep current password" />
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label for="edit-role" required>Role</Label>
            <Select variant="asset" id="edit-role" v-model="editForm.roleId">
              <option v-for="r in store.roles" :key="r.id" :value="r.id">{{ r.name }}</option>
            </Select>
          </div>
          <div>
            <Label for="edit-province">Province</Label>
            <Select variant="asset" id="edit-province" v-model="editForm.provinceId">
              <option value="">No province</option>
              <option v-for="p in store.provinces" :key="p.id" :value="p.id">{{ p.name }}</option>
            </Select>
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" v-model="editForm.isActive" class="rounded border-slate-300" />
          Active
        </label>
        <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button type="button" class="border border-slate-200 bg-white" @click="showEditModal = false">
            Cancel
          </Button>
          <Button
            type="button"
            class="border border-blue-600 bg-blue-600 text-white"
            :disabled="submitting"
            @click="onSubmitEdit"
          >
            {{ submitting ? 'Saving…' : 'Save changes' }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Deactivate confirmation modal -->
    <Modal
      :open="showDeactivateModal"
      title="Deactivate user"
      description="This account will lose access immediately. You can reactivate it later by editing the user."
      width-class="max-w-sm"
      @close="showDeactivateModal = false"
    >
      <div v-if="userToDeactivate" class="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          :class="avatarColor(userToDeactivate.fullName)"
        >
          {{ initials(userToDeactivate.fullName) }}
        </span>
        <div>
          <p class="text-sm font-medium text-slate-900">{{ userToDeactivate.fullName }}</p>
          <p class="text-xs text-slate-500">{{ userToDeactivate.username }}</p>
        </div>
      </div>
      <p v-if="deactivateError" class="mt-3 text-xs text-red-600">{{ deactivateError }}</p>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button type="button" class="border border-slate-200 bg-white" @click="showDeactivateModal = false">
            Cancel
          </Button>
          <Button
            type="button"
            class="border border-red-600 bg-red-600 text-white"
            :disabled="deactivating"
            @click="confirmDeactivate"
          >
            {{ deactivating ? 'Deactivating…' : 'Deactivate' }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, EyeOffIcon, LockIcon, PencilIcon, PlusIcon, ShieldCheckIcon, UserXIcon, UsersIcon, UserCheckIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUserManagementStore } from '@/stores/users'
import type { RawApiUser } from '@/types/user'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'
import Select from '@/components/ui/Select.vue'
import Modal from '@/components/ui/Modal.vue'
import MetricCard from '@/components/ui/MetricCard.vue'

const auth = useAuthStore()
const store = useUserManagementStore()

const canCreateUser = computed(() => auth.can('USER_CREATE') || auth.isAdmin())
const canUpdateUser = computed(() => auth.can('USER_UPDATE') || auth.isAdmin())

const query = ref('')
const roleFilter = ref('all')
const userStatusFilter = ref<'all' | 'active' | 'inactive'>('all')
const currentPage = ref(1)
const pageSize = 10

const totalItems = computed(() => store.meta?.total ?? 0)
const totalPages = computed(() => store.meta?.totalPages ?? 1)

function selectUserStatusFilter(filter: 'all' | 'active' | 'inactive') {
  userStatusFilter.value = userStatusFilter.value === filter ? 'all' : filter
  currentPage.value = 1

  store.fetchUsers({
    search: query.value.trim() || undefined,
    roleId: roleFilter.value === 'all' ? undefined : roleFilter.value,
    isActive: userStatusFilter.value === 'all' ? undefined : userStatusFilter.value === 'active',
    page: currentPage.value,
    limit: pageSize,
  })
}

function loadUsers() {
  store.fetchUsers({
    search: query.value.trim() || undefined,
    roleId: roleFilter.value === 'all' ? undefined : roleFilter.value,
    isActive: userStatusFilter.value === 'all' ? undefined : userStatusFilter.value === 'active',
    page: currentPage.value,
    limit: pageSize,
  })
}

onMounted(() => {
  loadUsers()
  store.fetchRoles()
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(query, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1 // reset to page 1 on a new search
    loadUsers()
  }, 350)
})

watch(roleFilter, () => {
  currentPage.value = 1
  loadUsers()
})

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadUsers()
}

const showAddModal = ref(false)
const showEditModal = ref(false)
const showAddPassword = ref(false)
const submitting = ref(false)
const formError = ref('')

const showDeactivateModal = ref(false)
const userToDeactivate = ref<RawApiUser | null>(null)
const deactivating = ref(false)
const deactivateError = ref('')

const addForm = ref({
  fullName: '',
  username: '',
  password: '',
  roleId: '',
  provinceId: '',
})

const editForm = ref<{
  id: string
  fullName: string
  username: string
  password: string
  roleId: string
  provinceId: string
  isActive: boolean
} | null>(null)

onMounted(() => {
  store.fetchProvinces()
  loadUsers()
  store.fetchRoles()
  store.fetchActivityCounts()
})

// const filteredUsers = computed(() => {
//   const q = query.value.trim().toLowerCase()
//   return store.users.filter((u: RawApiUser) => {
//     const roleOk = roleFilter.value === 'all' || u.roleId === roleFilter.value
//     const textOk =
//       !q ||
//       u.fullName.toLowerCase().includes(q) ||
//       u.username.toLowerCase().includes(q)
//     return roleOk && textOk
//   })
// })

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  return (parts[0]?.slice(0, 2) ?? '?').toUpperCase()
}

// Deterministic color per name so avatars aren't all identical
const avatarPalette = ['bg-slate-900', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-violet-600', 'bg-rose-600']
function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarPalette[Math.abs(hash) % avatarPalette.length]
}

const roleChipMap: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700 ring-red-200',
  VIEWER: 'bg-slate-100 text-slate-600 ring-slate-200',
  INVENTORY_MANAGER: 'bg-blue-50 text-blue-700 ring-blue-200',
  WAREHOUSE_STAFF: 'bg-amber-50 text-amber-700 ring-amber-200',
  FIELD_ENGINEER: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PLANNER: 'bg-violet-50 text-violet-700 ring-violet-200',
  AUDITOR: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
}
function roleChip(roleName?: string) {
  return roleChipMap[roleName ?? ''] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
}

function openAdd() {
  addForm.value = { fullName: '', username: '', password: '', roleId: '', provinceId: '' }
  showAddPassword.value = false
  formError.value = ''
  showAddModal.value = true
}

function openEdit(user: RawApiUser) {
  editForm.value = {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    password: '',
    roleId: user.roleId,
    provinceId: user.provinceId ?? '',
    isActive: user.isActive,
  }
  formError.value = ''
  showEditModal.value = true
}

async function onSubmitAdd() {
  formError.value = ''
  if (!addForm.value.fullName || !addForm.value.username || !addForm.value.password || !addForm.value.roleId) {
    formError.value = 'Full name, username, password, and role are required.'
    return
  }
  submitting.value = true
  try {
    await store.createUser({
      fullName: addForm.value.fullName,
      username: addForm.value.username,
      password: addForm.value.password,
      roleId: addForm.value.roleId,
      provinceId: addForm.value.provinceId || null,
    })
    showAddModal.value = false
    loadUsers()
  } catch (e: any) {
    formError.value = e?.response?.data?.message ?? 'Failed to create user.'
  } finally {
    submitting.value = false
  }
}

async function onSubmitEdit() {
  if (!editForm.value) return
  formError.value = ''
  submitting.value = true
  try {
    await store.updateUser(editForm.value.id, {
      fullName: editForm.value.fullName,
      username: editForm.value.username,
      password: editForm.value.password || undefined,
      roleId: editForm.value.roleId,
      provinceId: editForm.value.provinceId || null,
      isActive: editForm.value.isActive,
    })
    showEditModal.value = false
  } catch (e: any) {
    formError.value = e?.response?.data?.message ?? 'Failed to update user.'
  } finally {
    submitting.value = false
  }
}

function onDeactivate(user: RawApiUser) {
  userToDeactivate.value = user
  deactivateError.value = ''
  showDeactivateModal.value = true
}

async function confirmDeactivate() {
  if (!userToDeactivate.value) return
  deactivating.value = true
  deactivateError.value = ''
  try {
    await store.deactivateUser(userToDeactivate.value.id)
    showDeactivateModal.value = false
  } catch (e: any) {
    deactivateError.value = e?.response?.data?.message ?? 'Failed to deactivate user.'
  } finally {
    deactivating.value = false
  }
}
</script>