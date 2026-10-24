<template>
  <Modal
    :open="open"
    :title="`Documents & Photos`"
    :description="asset ? `Attachments for ${asset.name}` : ''"
    width-class="max-w-xl"
    @close="$emit('close')"
  >
    <!-- Tabs -->
    <div class="mb-4 flex gap-1 border-b border-slate-200">
      <button
        type="button"
        class="border-b-2 px-3 py-2 text-sm font-medium transition"
        :class="activeTab === 'photos' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'"
        @click="activeTab = 'photos'"
      >
        Photos
      </button>
      <button
        type="button"
        class="border-b-2 px-3 py-2 text-sm font-medium transition"
        :class="activeTab === 'documents' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'"
        @click="activeTab = 'documents'"
      >
        Documents
      </button>
    </div>

    <!-- Photos tab -->
    <div v-if="activeTab === 'photos'">
      <Label for="asset-photos">Photos</Label>
      <input id="asset-photos" type="file" accept="image/*" multiple class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-600" @change="onFilesSelected($event, 'photos')" />

      <ul v-if="existingPhotos.length || newPhotos.length" class="mt-2 space-y-2">
        <li v-for="(name, i) in existingPhotos" :key="'existing-' + i" class="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
          <span class="truncate">{{ name }}</span>
          <button type="button" class="ml-2 text-slate-400 hover:text-red-500" @click="removeExistingFile(i, 'photos')">
            <XIcon class="h-3.5 w-3.5" />
          </button>
        </li>
        <li v-for="(file, i) in newPhotos" :key="'new-' + i" class="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
          <img :src="getPreviewUrl(file)" alt="" class="h-8 w-8 rounded-md border border-slate-200 object-cover" />
          <span class="truncate">{{ file.name }}</span>
          <button type="button" class="ml-auto text-slate-400 hover:text-red-500" @click="removeNewFile(i, 'photos')">
            <XIcon class="h-3.5 w-3.5" />
          </button>
        </li>
      </ul>
      <p v-else class="mt-3 text-sm text-slate-400">No photos attached yet.</p>
    </div>

    <!-- Documents tab -->
    <div v-if="activeTab === 'documents'">
      <Label for="asset-documents">Documents</Label>
      <input id="asset-documents" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" multiple class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-600" @change="onFilesSelected($event, 'documents')" />

      <ul v-if="existingDocuments.length || newDocuments.length" class="mt-2 space-y-2">
        <li v-for="(name, i) in existingDocuments" :key="'existing-' + i" class="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
          <span class="truncate">{{ name }}</span>
          <button type="button" class="ml-2 text-slate-400 hover:text-red-500" @click="removeExistingFile(i, 'documents')">
            <XIcon class="h-3.5 w-3.5" />
          </button>
        </li>
        <li v-for="(file, i) in newDocuments" :key="'new-' + i" class="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
          <div class="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md border text-[8px] font-bold leading-none" :class="getFileIconClass(file)" :title="getFileTypeLabel(file)">
            <component :is="getFileIcon(file)" class="h-4 w-4" />
            <span>{{ getFileExtension(file) }}</span>
          </div>
          <span class="truncate">{{ file.name }}</span>
          <button type="button" class="ml-auto text-slate-400 hover:text-red-500" @click="removeNewFile(i, 'documents')">
            <XIcon class="h-3.5 w-3.5" />
          </button>
        </li>
      </ul>
      <p v-else class="mt-3 text-sm text-slate-400">No documents attached yet.</p>
    </div>

    <template #footer>
      <Button variant="secondary" @click="$emit('close')" class="rounded-xl border border-blue-600 bg-blue-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">Done</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  File as FileIcon,
  FileArchive,
  FileCode2,
  FileSpreadsheet,
  FileTextIcon,
  Presentation,
  XIcon,
} from 'lucide-vue-next'
import type { Asset } from '../../types/asset.ts'
import { mockAttachments } from '@/data/mockAttachements.ts'
import Modal from '../ui/Modal.vue'
import Button from '../ui/button.vue'
import Label from '../ui/label.vue'

const props = defineProps<{
  open: boolean
  asset: Asset | null
}>()

defineEmits<{ close: [] }>()

const activeTab = ref<'photos' | 'documents'>('photos')
const existingPhotos = ref<string[]>([])
const existingDocuments = ref<string[]>([])
const newPhotos = ref<File[]>([])
const newDocuments = ref<File[]>([])
const previewMap = new Map<string, string>()

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    activeTab.value = 'photos'
    newPhotos.value = []
    newDocuments.value = []

    // TODO: replace this with a real GET /assets/:id/attachments call once
    // the backend exists. For now, load from the mock data by asset id.
    const existing = props.asset ? mockAttachments[props.asset.id] : undefined
    existingPhotos.value = existing?.photos ?? []
    existingDocuments.value = existing?.documents ?? []
  }
)

function onFilesSelected(event: Event, target: 'photos' | 'documents') {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const list = target === 'photos' ? newPhotos : newDocuments
    list.value.push(...Array.from(input.files))
  }
  input.value = ''
  // TODO: upload immediately here (multipart/form-data) once a real endpoint exists.
}

function removeNewFile(index: number, target: 'photos' | 'documents') {
  const list = target === 'photos' ? newPhotos : newDocuments
  list.value.splice(index, 1)
}

function removeExistingFile(index: number, target: 'photos' | 'documents') {
  const list = target === 'photos' ? existingPhotos : existingDocuments
  list.value.splice(index, 1)
  // TODO: call a real DELETE endpoint here once one exists — right now this
  // only removes it from view, not from actual storage.
}

function getPreviewUrl(file: File) {
  const key = `${file.name}-${file.size}-${file.lastModified}`
  if (!previewMap.has(key)) previewMap.set(key, URL.createObjectURL(file))
  return previewMap.get(key)
}

function getFileExtension(file: File) {
  const extension = file.name.split('.').pop()?.toUpperCase()
  return extension && extension.length <= 5 ? extension : 'FILE'
}

function getFileTypeLabel(file: File) {
  return `${getFileExtension(file)} document`
}

function getFileIcon(file: File) {
  const extension = getFileExtension(file)
  if (extension === 'PDF' || ['DOC', 'DOCX', 'ODT', 'RTF'].includes(extension)) return FileTextIcon
  if (['XLS', 'XLSX', 'CSV', 'ODS'].includes(extension)) return FileSpreadsheet
  if (['PPT', 'PPTX', 'ODP'].includes(extension)) return Presentation
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(extension)) return FileArchive
  if (['JS', 'TS', 'JSON', 'HTML', 'CSS', 'XML'].includes(extension)) return FileCode2
  return FileIcon
}

function getFileIconClass(file: File) {
  const extension = getFileExtension(file)
  if (extension === 'PDF') return 'border-red-200 bg-red-50 text-red-600'
  if (['DOC', 'DOCX', 'ODT', 'RTF'].includes(extension)) return 'border-blue-200 bg-blue-50 text-blue-600'
  if (['XLS', 'XLSX', 'CSV', 'ODS'].includes(extension)) return 'border-emerald-200 bg-emerald-50 text-emerald-600'
  if (['PPT', 'PPTX', 'ODP'].includes(extension)) return 'border-orange-200 bg-orange-50 text-orange-600'
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(extension)) return 'border-amber-200 bg-amber-50 text-amber-600'
  return 'border-slate-200 bg-slate-100 text-slate-500'
}

</script>