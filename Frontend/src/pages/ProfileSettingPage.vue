<template>
  <div class="h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl space-y-6">
      <div class="flex items-center gap-4">
        <div class="relative inline-block">
          <UserAvatar
            :name="auth.user?.fullName || 'Guest User'"
            size="lg"
            :photo="avatarPreviewUrl || auth.user?.avatarUrl || null"
          />

          <label
            class="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Change photo"
          >
            <CameraIcon class="h-4 w-4" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="sr-only"
              @change="onAvatarSelected"
            />
          </label>
        </div>

        <div>
          <h1 class="text-xl font-semibold tracking-tight text-slate-900">
            {{ auth.user?.fullName || 'My account' }}
          </h1>
          <p class="mt-0.5 text-sm text-slate-500">Upload your photo and adjust some information if needed.</p>
          <button
            v-if="avatarFile || avatarPreviewUrl"
            type="button"
            class="mt-1 text-xs font-medium text-slate-500 hover:text-red-600"
            @click="clearAvatar"
          >
            Remove photo
          </button>
        </div>
      </div>

      <!-- Profile section -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 class="text-sm font-semibold text-slate-900">Profile</h2>
        <p class="mt-0.5 text-xs text-slate-500">
          Role is managed by your administrator.
        </p>

        <form class="mt-4 space-y-4" @submit.prevent="onSaveProfile">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label for="profile-name" required>Full name <span class="text-red-500">*</span></Label>
              <Input variant="asset" id="profile-name" v-model="profileForm.fullName" />
            </div>

            <div>
              <Label for="profile-username">Username</Label>
              <Input
                variant="asset"
                id="profile-username"
                v-model="profileForm.username"
                maxlength="100"
              />
            </div>

            <div>
              <Label>Province <span class="text-red-500">*</span></Label>
              <SearchableSelection
                v-model="profileForm.provinceId"
                :items="provinces"
                label-key="name"
                value-key="id"
                secondary-key="code"
                placeholder="Type to search provinces…"
                width-class="w-full"
                :loading="profileSaving"
              />
            </div>

            <div>
              <Label for="profile-role">Role</Label>
              <Input
                variant="asset"
                id="profile-role"
                :model-value="auth.user?.roleName ?? ''"
                readonly
              />
            </div>
          </div>

          <p v-if="profileMessage" class="text-xs" :class="profileError ? 'text-red-600' : 'text-emerald-600'">
            {{ profileMessage }}
          </p>

          <div class="flex justify-end gap-2">
            <Button
              type="button"
              appearance="secondary"
              :disabled="profileSaving"
              @click="onCancelProfile"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              class="border border-blue-600 bg-blue-600 text-white"
              :disabled="profileSaving"
            >
              {{ profileSaving ? 'Saving…' : 'Save changes' }}
            </Button>
          </div>
        </form>
      </div>

      <!-- Change password section -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 class="text-sm font-semibold text-slate-900">Change password</h2>
        <p class="mt-0.5 text-xs text-slate-500">
          Choose a strong password you haven't used elsewhere.
        </p>

        <form class="mt-4 space-y-4" @submit.prevent="onChangePassword">
          <div>
            <Label for="current-password" required>Current password <span class="text-red-500">*</span></Label>
            <Input variant="asset" id="current-password" v-model="passwordForm.currentPassword" type="password" />
          </div>
          <div>
            <Label for="new-password" required>New password <span class="text-red-500">*</span></Label>
            <Input variant="asset" id="new-password" v-model="passwordForm.newPassword" type="password" />
          </div>
          <div>
            <Label for="confirm-password" required>Confirm new password <span class="text-red-500">*</span></Label>
            <Input variant="asset" id="confirm-password" v-model="passwordForm.confirmPassword" type="password" />
          </div>

          <p v-if="passwordMessage" class="text-xs" :class="passwordError ? 'text-red-600' : 'text-emerald-600'">
            {{ passwordMessage }}
          </p>

          <div class="flex justify-end gap-2">
            <Button
              type="button"
              appearance="secondary"
              :disabled="passwordSaving"
              @click="onCancelPassword"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              class="border border-blue-600 bg-blue-600 text-white"
              :disabled="passwordSaving"
            >
              {{ passwordSaving ? 'Updating…' : 'Update password' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { CameraIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'
import SearchableSelection from '@/components/ui/SearchableSelection.vue'
import UserAvatar from '@/components/ui/userAvatar.vue'
import { referenceDataApi } from '@/services/api/reference-data.api'

const auth = useAuthStore()

// ── Avatar (UI ready; backend later) ──
const avatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref<string | null>(null)

function onAvatarSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    profileMessage.value = 'Image must be under 2MB.'
    profileError.value = true
    input.value = ''
    return
  }

  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
  }

  avatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
  input.value = ''
}

function clearAvatar() {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
  }
  avatarFile.value = null
  avatarPreviewUrl.value = null
}

onBeforeUnmount(() => {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
  }
})

/** Call when backend supports avatar upload */
async function uploadAvatar(file: File) {
  // const formData = new FormData()
  // formData.append('avatar', file)
  // await api.post('/users/me/avatar', formData)
  console.info('Avatar ready to upload (backend not ready):', file.name)
}

// ── Profile ──
const profileForm = ref({ fullName: '', username: '', provinceId: '' })
const profileSaving = ref(false)
const profileMessage = ref('')
const profileError = ref(false)

const provinces = ref<{ id: string; name: string; code?: string }[]>([])

async function loadProvinces() {
  try {
    const res = await referenceDataApi.getProvinces()
    provinces.value = (res as any).data ?? res ?? []
  } catch (err) {
    console.error('Failed to load provinces', err)
    provinces.value = []
  }
}

onMounted(async () => {
  profileForm.value.fullName = auth.user?.fullName ?? ''
  profileForm.value.username = auth.user?.username ?? ''
  // Load provinces BEFORE setting the value, so the combobox can
  // resolve the current province's name on its first watcher run.
  await loadProvinces()
  profileForm.value.provinceId = auth.user?.provinceId ?? ''
})

async function onSaveProfile() {
  profileMessage.value = ''
  profileError.value = false

  if (!profileForm.value.fullName.trim()) {
    profileMessage.value = 'Full name cannot be empty.'
    profileError.value = true
    return
  }

  profileSaving.value = true
  try {
    await auth.updateProfile({
      fullName: profileForm.value.fullName.trim(),
      username: profileForm.value.username,
      provinceId: profileForm.value.provinceId || null,
    })

    if (avatarFile.value) {
      await uploadAvatar(avatarFile.value)
      // await auth.fetchMe() // uncomment when API returns avatarUrl
      clearAvatar()
    }

    profileMessage.value = 'Profile updated.'
  } catch (e: any) {
    const message = e?.response?.data?.message
    profileMessage.value = Array.isArray(message)
      ? message.join(' ')
      : message ?? 'Failed to update profile.'
    profileError.value = true
  } finally {
    profileSaving.value = false
  }
}

function onCancelProfile() {
  profileForm.value.fullName = auth.user?.fullName ?? ''
  profileForm.value.username = auth.user?.username ?? ''
  profileForm.value.provinceId = auth.user?.provinceId ?? ''
  clearAvatar()
  profileMessage.value = ''
  profileError.value = false
}

// ── Change password ──
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const passwordSaving = ref(false)
const passwordMessage = ref('')
const passwordError = ref(false)

async function onChangePassword() {
  passwordMessage.value = ''
  passwordError.value = false

  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    passwordMessage.value = 'All fields are required.'
    passwordError.value = true
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'New password and confirmation do not match.'
    passwordError.value = true
    return
  }

  passwordSaving.value = true
  try {
    await auth.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordMessage.value = 'Password updated.'
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (e: any) {
    passwordMessage.value = e?.response?.data?.message ?? 'Failed to update password. Check your current password.'
    passwordError.value = true
  } finally {
    passwordSaving.value = false
  }
}

function onCancelPassword() {
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  passwordMessage.value = ''
  passwordError.value = false
}
</script>