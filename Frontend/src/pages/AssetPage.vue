<template>
  <Transition name="fade">
    <div
      v-if="successMessage"
      class="fixed left-[59%] top-4 z-[4200] -translate-x-1/2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
    >
      {{ successMessage }}
    </div>
  </Transition>
  <div class="h-full overflow-y-auto px-4 py-6 pb-10 sm:px-6 lg:px-8">
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-slate-900">Directory</h1>
      </div>
      <Button v-if="canCreateAsset" @click="openAddModal" class="rounded-xl border border-blue-600 bg-blue-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">
        <PackagePlusIcon class="h-4 w-4" />
        Add Asset
      </Button>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Total"
        :value="store.pagination.total"
        :active="filters.statusId === ''"
        dot-class="bg-slate-900"
        value-class="text-slate-900"
        @click="showAll"
      />
      <StatCard
        v-for="status in assetLevelStatuses"
        :key="status.id"
        :label="status.name"
        :value="countByStatus(status.id)"
        :active="filters.statusId === status.id"
        :dot-class="statusColorMap[(status.color ?? 'slate') as keyof typeof statusColorMap].dot"
        value-class="text-slate-900"
        @click="toggleStatusFilter(status.id)"
      />
    </div>

    <section class="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
        <div class="relative max-w-xs flex-1">
          <SearchIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input variant="asset" v-model="filters.search" placeholder="Search name, tag, serial…" class="border-slate-300 bg-white pl-9 focus:ring-1 focus:ring-slate-500/30"/>
        </div>

        <SearchableSelection
          v-model="filters.siteId"
          :items="siteOptions"
          label-key="name"
          value-key="id"
          secondary-key="code"
          placeholder="Filter by site…"
        />

        <Select variant="asset" v-model="filters.assetTypeId" class="max-w-[180px]">
          <option value="">All types</option>
          <option v-for="t in store.assetTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </Select>

        <!-- <Select variant="asset" v-model="filters.project_id" class="max-w-[180px]">
          <option value="">All projects</option>
          <option v-for="p in store.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </Select> -->

        <span class="ml-auto text-xs text-slate-500">{{ filteredAssets.length }} items</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th class="px-4 py-2.5 font-medium">Asset Tag</th>
              <th class="px-4 py-2.5 font-medium">Asset Code</th>
              <th class="px-4 py-2.5 font-medium">Name</th>
              <th class="px-4 py-2.5 font-medium">Type</th>
              <!-- <th class="px-4 py-2.5 font-medium">Manufacturer / Model</th> -->
              <th class="px-4 py-2.5 font-medium">Status</th>
              <th class="px-4 py-2.5 font-medium">Last Update</th>
              <th class="px-4.5 py-2.5 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="store.isLoading">
              <td colspan="7" class="px-4 py-12 text-center text-sm text-slate-500">Loading assets…</td>
            </tr>
            <tr
              v-for="asset in filteredAssets"
              v-else
              :key="asset.id"
              class="cursor-pointer transition hover:bg-slate-50"
              @click="openDetail(asset)"
            >
              <td class="px-4 py-3 text-xs text-slate-700">{{ asset.assetTag ?? 'None' }}</td>
              <td class="font-mono-num px-4 py-3 text-xs text-slate-700">{{ asset.code }}</td>
              <td class="px-4 py-3 font-medium text-slate-900">{{ asset.name }}</td>
              <td class="px-4 py-3 text-slate-600">{{ asset.assetType?.name ?? 'None' }}</td>
              <!-- <td class="px-4 py-3 text-slate-600">
                {{ asset.manufacturer?.name ?? 'None' }}
                <span v-if="asset.assetModel">· {{ asset.assetModel.name }}</span>
              </td> -->
              <td class="px-4 py-3">
                <Badge
                  :label="asset.statusName ?? 'None'"
                  :color="store.statuses.find((status) => status.id === asset.statusId)?.color"
                  size="sm"
                />
              </td>
              <td class="px-4 py-3 text-slate-600">
                <p>{{ formatOrdinalDate(asset.updatedAt) }}</p>
                <p class="text-xs text-slate-400">{{ getSiteName(asset) ?? 'None' }}</p>
              </td>
              <td class="px-2.5 py-3 text-left">
                  <div class="inline-block text-left" data-action-menu @click.stop>
                  <Button class="text-blue-600" variant="secondary" size="sm" @click="toggleActionMenu(asset.id, $event)">
                    More
                    <ChevronDownIcon class="h-4 w-4" />
                  </Button>

                  <Teleport to="body">
                    <div
                        v-if="openActionMenuId === asset.id"
                        class="fixed z-[4100] w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                        :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
                    >
                        <button
                        type="button"
                        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        @click="openDetail(asset)"
                        >
                        <EyeIcon class="h-4 w-4" /> See detail
                        </button>
                        <button
                        v-if="canUpdateAsset"
                        type="button"
                        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        @click="onEdit(asset)"
                        >
                        <PencilIcon class="h-4 w-4" /> Edit
                        </button>
                        <!-- <button
                        v-if="canReadAssets"
                        type="button"
                        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        @click="onDocuments(asset)"
                        >
                        <FileTextIcon class="h-4 w-4" /> Documents & Photos
                        </button> -->
                        <!-- <button
                        type="button"
                        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        @click="onLifecycle(asset)"
                        >
                        <HistoryIcon class="h-4 w-4" /> Lifecycle History
                        </button> -->
                        <!-- <button
                          v-if="getConnectivityKind(asset.assetType?.name) === 'cores'"
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          @click="onManageCores(asset)"
                        >
                          <CableIcon class="h-4 w-4" /> Manage Cores
                        </button>
                        <button 
                          v-if="asset.assetType?.name === 'Fiber Cable'" 
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          @click="onManageCoresAndConnections(asset)">
                          <Link2Icon class="h-4 w-4" /> Manage Fiber Cables
                        </button> -->
                        <button
                          v-if="getConnectivityKind(asset.assetType?.name) === 'ports'"
                          type="button"
                          class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-white"
                          @click="onManagePorts(asset)"
                        >
                          <PlugIcon class="h-4 w-4" /> Manage Ports
                        </button>
                        <div class="my-1 border-t border-slate-100" />
                        <!-- <button
                        type="button"
                        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        @click="onDecommission(asset)"
                        >
                        <ArchiveIcon class="h-4 w-4" /> Decommission
                        </button> -->
                        <button
                          v-if="isAdmin"
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          @click="onVoid(asset)"
                        >
                          <Trash2Icon class="h-4 w-4" /> Void / Data Entry Error
                        </button>

                    </div>
                  </Teleport>
                </div>
              </td>
            </tr>
            <tr v-if="!store.isLoading && filteredAssets.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-sm text-slate-500">
                No assets match those filters.
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination -->
        <div ref="paginationRef" class="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p class="text-sm text-slate-500">
            Showing
            <span class="font-medium text-slate-700">
              {{ filteredAssets.length === 0 ? 0 : (currentPage - 1) * 10 + 1 }}
            </span>
            –
            <span class="font-medium text-slate-700">
              {{ Math.min(currentPage * 10, totalItems) }}
            </span>
            of
            <span class="font-medium text-slate-700">{{ totalItems }}</span>
            assets
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
    </section>

    <AssetFormModal
      :open="showFormModal"
      :asset="editingAsset"
      @close="closeFormModal"
      @saved="handleSaved"
    />

    <!-- <DocumentsPhotosModal
      :open="showDocsModal"
      :asset="docsAsset"
      @close="showDocsModal = false"
    /> -->

    <!-- <LifecycleHistoryModal :open="showLifecycleModal" :asset="lifecycleAsset" @close="showLifecycleModal = false" /> -->

    <ManageCoreModal :open="showCoresModal" :asset="coresAsset" @close="showCoresModal = false" />

    <ManagePortModal :open="showPortsModal" :asset="portsAsset" @close="showPortsModal = false" />

    <AssetDetailPanel :open="showDetailPanel" :asset="detailAsset" @close="showDetailPanel = false" />

    <VoidConfirmModal :open="showVoidModal" :asset="voidAsset" @close="showVoidModal = false; voidAsset = null" @confirmed="handleVoidConfirmed"/>

    <ManageFiberCableModal :open="showFiberModal" :asset="fiberModalAsset" @close="showFiberModal = false"/>

  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, onBeforeUnmount, watch } from 'vue'
import { PackagePlusIcon, SearchIcon, ChevronDownIcon, PencilIcon, FileTextIcon, HistoryIcon, ArchiveIcon, Trash2Icon, CableIcon, PlugIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, Link2Icon } from 'lucide-vue-next'
import { useAssetsStore } from '../stores/assets'
import { useAuthStore } from '../stores/auth'
import type { Asset } from '../types/asset'
import { assetApi } from '../services/api/asset.api.ts'
import { statusColorMap } from '../utils/statusColors'
import { formatOrdinalDate } from '../utils/formatDate'
import StatCard from '../components/ui/StatCard.vue'
import Badge from '../components/ui/Badge.vue'
import Button from '../components/ui/button.vue'
import Input from '../components/ui/input.vue'
import Select from '../components/ui/Select.vue'
import AssetFormModal from '../components/asset/AssetFormModal.vue'
import DocumentsPhotosModal from '../components/asset/DocumentsPhotosModal.vue'
// import LifecycleHistoryModal from '../components/asset/LifecycleHistoryModal.vue'
import ManageCoreModal from '../components/asset/ManageCoreModal.vue'
import { getConnectivityKind } from '../utils/connectivity'
import { CORE_STATUS_IDS } from '../data/mockFiberCore'
import ManagePortModal from '../components/asset/ManagePortModal.vue'
import AssetDetailPanel from '../components/asset/AssetDetailPanel.vue'
import VoidConfirmModal from '../components/asset/VoidConfirmModal.vue'
import ManageFiberCableModal from '../components/asset/ManageFiberCableConnectionModal.vue'
import SearchableSelection from '@/components/ui/SearchableSelection.vue'

const store = useAssetsStore()
const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.roleName === 'ADMIN')

// Permission-based flags
const canReadAssets = computed(() => auth.can('ASSET_READ'))
const canCreateAsset = computed(() => auth.can('ASSET_CREATE'))
const canUpdateAsset = computed(() => auth.can('ASSET_UPDATE'))
const canDeleteAsset = computed(() => auth.can('ASSET_DELETE'))

// Filters that go to the backend
const filters = reactive({
  search: '',
  assetTypeId: '',
  statusId: '',
  project_id: '', 
  siteId: '',      
  page: 1,
  limit: 10,
  sortBy: 'updatedAt',
  sortOrder: 'DESC' as const,
})

// ---- Status cards
const assetLevelStatuses = computed(() => {
  const coreOnlyIds = new Set(Object.values(CORE_STATUS_IDS))
  return store.statuses.filter((s: { id: string }) => !coreOnlyIds.has(s.id))
})

function countByStatus(statusId: string) {
  return store.statusCounts[statusId] ?? 0
}

function toggleStatusFilter(statusId: string) {
  filters.statusId = filters.statusId === statusId ? '' : statusId
  filters.page = 1
  reload()
}

function showAll() {
  filters.statusId = ''
  filters.page = 1
  reload()
}

// const filteredAssets = computed(() =>
//   store.assets.filter((a) => {
//     const matchesSearch =
//       !filters.search ||
//       `${a.name} ${a.asset_tag} ${a.serial_number ?? ''}`.toLowerCase().includes(filters.search.toLowerCase())
//     const matchesType = !filters.asset_type_id || a.asset_type_id === filters.asset_type_id
//     const matchesStatus = !filters.status_id || a.status_id === filters.status_id
//     const matchesProject = !filters.project_id || a.project_id === filters.project_id
//     return matchesSearch && matchesType && matchesStatus && matchesProject
//   })
// )

const siteOptions = computed(() =>
  store.sites.map((site) => ({
    id: site.id,
    name: site.name,
    code: site.code ?? '',
  })),
)

const filteredAssets = computed(() => {
  return store.assets.filter((a) => {
    const searchText = filters.search.trim().toLowerCase()
    const matchesSearch = !searchText ||
      a.name.toLowerCase().includes(searchText) ||
      (a.assetTag ?? '').toLowerCase().includes(searchText) ||
      (a.code ?? '').toLowerCase().includes(searchText)

    const matchesType = !filters.assetTypeId || a.assetTypeId === filters.assetTypeId
    const matchesProject = !filters.project_id || a.projectId === filters.project_id
    const matchesSite = !filters.siteId || a.siteId === filters.siteId
    const matchesStatus = !filters.statusId || a.statusId === filters.statusId

    return matchesSearch && matchesType && matchesProject && matchesSite && matchesStatus
  })
})

watch(() => filters.siteId, () => {
  filters.page = 1
  reload()
})

// ---- Reload helper ----
async function reload() {
  const apiFilters = {
    search: filters.search || undefined,
    assetTypeId: filters.assetTypeId || undefined,
    statusId: filters.statusId || undefined,
    projectId: filters.project_id || undefined,
    siteId: filters.siteId || undefined,
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }

  await store.loadAssets(apiFilters)

  await store.fetchStatusCounts(
    assetLevelStatuses.value.map((status) => status.id),
    {
      search: filters.search || undefined,
      assetTypeId: filters.assetTypeId || undefined,
      projectId: filters.project_id || undefined,
      siteId: filters.siteId || undefined,
      statusId: filters.statusId || undefined,
    },
  )
}

// Debounce search a little
let searchTimeout: ReturnType<typeof setTimeout>
watch(() => filters.search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    reload()
  }, 350)
})

watch(() => filters.assetTypeId, () => {
  filters.page = 1
  reload()
})

watch(() => filters.project_id, () => {
  filters.page = 1
  reload()
})

// ---- Pagination helpers ----
const currentPage = computed(() => store.pagination.page)
const totalPages = computed(() => store.pagination.totalPages)
const totalItems = computed(() => store.pagination.total)

async function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  filters.page = page
  await reload()
  await nextTick()
  paginationRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

// Declare modal state variables
const showFormModal = ref(false)
const editingAsset = ref<Asset | null>(null)
const showDocsModal = ref(false)
const docsAsset = ref<Asset | null>(null)
const successMessage = ref('')
const showDetailPanel = ref(false)
const detailAsset = ref<Asset | null>(null)
const openActionMenuId = ref<string | null>(null)
const menuPosition = ref({ top: 0, left: 0 })
// const showLifecycleModal = ref(false)
// const lifecycleAsset = ref<Asset | null>(null)
const showCoresModal = ref(false)
const coresAsset = ref<Asset | null>(null)
const showPortsModal = ref(false)
const portsAsset = ref<Asset | null>(null)
const showVoidModal = ref(false)
const voidAsset = ref<Asset | null>(null)
const showFiberModal = ref(false)
const fiberModalAsset = ref<Asset | null>(null)
const paginationRef = ref<HTMLElement | null>(null)

// Add Asset button opens the form modal in "add" mode 
function openAddModal() {
  editingAsset.value = null
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  editingAsset.value = null
}

function getSiteName(asset: Asset) {
  return store.sites.find((s: { id: string | undefined }) => s.id === asset.siteId)?.name ?? '—'
}

async function handleSaved({ isEdit }: { isEdit: boolean }) {
  filters.page = 1
  await reload()
  successMessage.value = isEdit ? 'Asset updated successfully.' : 'Asset added successfully.'
  setTimeout(() => { successMessage.value = '' }, 3000)
}

// ---- Detail view ----
function openDetail(asset: Asset) {
  detailAsset.value = asset
  showDetailPanel.value = true
}

// ---- Row action dropdown ----
// function toggleActionMenu(assetId: string, event: MouseEvent) {
//   if (openActionMenuId.value === assetId) {
//     openActionMenuId.value = null
//     return
//   }
//   const button = event.currentTarget as HTMLElement
//   const rect = button.getBoundingClientRect()

//    menuPosition.value = {
//     top: rect.bottom + 4,
//     left: rect.right - 290,
//   }
//   openActionMenuId.value = assetId
// }

function toggleActionMenu(assetId: string, event: MouseEvent) {
  if (openActionMenuId.value === assetId) {
    openActionMenuId.value = null
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  const menuHeight = 220          
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow

  menuPosition.value = {
    top: openUpward
      ? rect.top - menuHeight - 4   
      : rect.bottom + 4,            
    left: Math.max(8, rect.right - 199),
  }

  openActionMenuId.value = assetId
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target) return
  if (!target.closest('[data-action-menu]')) {
    openActionMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function closeActionMenu() {
  openActionMenuId.value = null
}

function onEdit(asset: Asset) {
  closeActionMenu()
  editingAsset.value = asset
  showFormModal.value = true
}

function onDocuments(asset: Asset) {
  closeActionMenu()
  docsAsset.value = asset
  showDocsModal.value = true
}

function onVoid(asset: Asset) {
  closeActionMenu()
  voidAsset.value = asset
  showVoidModal.value = true
}

async function handleVoidConfirmed(asset: Asset, reason: string) {
  try {
    await assetApi.deleteAsset(asset)

    // Remove from current list
    store.assets = store.assets.filter((a: { id: string }) => a.id !== asset.id)

    // Optional: also update total count if you want
    if (store.pagination.total > 0) {
      store.pagination.total -= 1
    }

    successMessage.value = `Asset "${asset.name}" has been voided.`
    setTimeout(() => { successMessage.value = '' }, 3000)

    showVoidModal.value = false
    voidAsset.value = null
  } catch (err) {
    console.error(err)
    alert('Failed to void asset. Please try again.')
  }
}

// function onLifecycle(asset: Asset) {
//   closeActionMenu()
//   lifecycleAsset.value = asset
//   showLifecycleModal.value = true
// }

function onManageCores(asset: Asset) {
  closeActionMenu()
  coresAsset.value = asset
  showCoresModal.value = true
}

function onManageCoresAndConnections(asset: Asset) {
  closeActionMenu()
  fiberModalAsset.value = asset
  showFiberModal.value = true
}

function onManagePorts(asset: Asset) {
  openActionMenuId.value = null 
  portsAsset.value = asset
  showPortsModal.value = true
}

function onDecommission(asset: Asset) {
  closeActionMenu()
  console.log('decommission', asset.id)
}

onMounted(async () => {
  await store.loadReferenceData()
  await reload()
})
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>