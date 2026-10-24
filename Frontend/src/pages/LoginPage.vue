<template>
  <div class="flex h-full w-full bg-slate-950">
    <div class="relative z-10 flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-[520px] lg:shrink-0">
      <div class="fade-in-up relative z-10 mx-auto w-full max-w-sm">
        <div class="flex flex-col items-center gap-3 text-center">
          <span class="flex items-center justify-center rounded-xl text-slate-900">
            <img :src="logo" alt="TC Network Inventory logo" class="h-20 w-20 object-contain" />
          </span>
          <div class="leading-tight">
            <p class="text-lg font-semibold tracking-tight text-white">TC TNI</p>
            <p class="text-xs text-slate-400">Telecom Network Inventory of Telecom Cambodia</p>
          </div>
        </div>

        <!-- Sign-in mode -->
        <template v-if="mode === 'login'">
          <h1 class="mt-10 text-2xl font-semibold tracking-tight text-white">Sign in</h1>
          <p class="mt-1.5 text-sm text-slate-400">
            Use your Telecom Cambodia directory account to continue.
          </p>

          <form class="mt-7 space-y-4" @submit.prevent="handleSubmit">
            <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {{ errorMessage }}
            </p>
            <div>
              <Label for="username">
                <span class="text-slate-300">Username</span>
              </Label>
              <div class="relative">
                <UserIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="username"
                  type="text"
                  autocomplete="username"
                  v-model="username"
                  required
                  class="border-slate-700 bg-slate-900 pl-9 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div>
              <Label for="password">
                <span class="text-slate-300">Password</span>
              </Label>
              <div class="relative">
                <LockIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  v-model="password"
                  required
                  class="border-slate-700 bg-slate-900 pl-9 pr-10 text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  :title="showPassword ? 'Hide password' : 'Show password'"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  @click="showPassword = !showPassword"
                >
                  <EyeOffIcon v-if="showPassword" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  v-model="keepSignedIn"
                  class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30"
                />
                Keep me signed in
              </label>
              <button
                type="button"
                class="text-sm text-emerald-400 hover:text-emerald-300"
                @click="mode = 'forgot'"
              >
                Forgot password?
              </button>
            </div>
            <Button
              type="submit"
              size="lg"
              :disabled="isSubmitting"
              class="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              {{ isSubmitting ? 'Signing in…' : 'Sign In' }}
              <ArrowRightIcon class="h-4 w-4" />
            </Button>
          </form>

          <p class="mt-8 text-[11px] leading-relaxed text-slate-600">
            Authorised use only. All activity on this system is recorded in the audit log.
          </p>
        </template>

        <!-- Forgot-password mode -->
        <template v-else>
          <span class="mt-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <PhoneIcon class="h-6 w-6" />
          </span>
          <h1 class="mt-5 text-2xl font-semibold tracking-tight text-white">Forgot your password?</h1>
          <p class="mt-1.5 text-sm leading-relaxed text-slate-400">
            Accounts are managed by your system administrator. Contact Telecom Cambodia support
            to have your password reset.
          </p>

          <div class="mt-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <a href="tel:8888" class="flex items-center gap-3 text-sm text-slate-200 hover:text-emerald-400">
              <PhoneIcon class="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Hotline
                <span class="ml-1 font-mono text-slate-400">(+855) 8888</span>
              </span>
            </a>
            <a href="tel:023722227" class="flex items-center gap-3 text-sm text-slate-200 hover:text-emerald-400">
              <PhoneIcon class="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Office
                <span class="ml-1 font-mono text-slate-400">(+855) 23 722 227</span>
              </span>
            </a>
          </div>

          <button
            type="button"
            class="mt-8 flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300"
            @click="mode = 'login'"
          >
            <ArrowLeftIcon class="h-3.5 w-3.5" />
            Back to sign in
          </button>
        </template>
      </div>
    </div>

    <div class="relative hidden flex-1 lg:block">
      <MapPreview class="absolute inset-0 h-full w-full opacity-90" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/5 to-transparent" />
      <div class="absolute bottom-10 left-10 right-10">
        <p class="max-w-lg text-xl font-medium leading-snug text-white">
          <span class="whitespace-nowrap">
            One registry for every Site, cable, and node across Cambodia.
          </span>
          <br />
          Replacing the manual Google Earth workflow.
        </p>
        <dl class="mt-6 flex gap-8">
          <div v-for="item in features" :key="item.title">
            <dt class="text-lg font-semibold text-emerald-400 hover:text-emerald-300">{{ item.title }}</dt>
            <dd class="text-xs text-slate-400">{{ item.description }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import Button from '../components/ui/button.vue'
import Input from '../components/ui/input.vue'
import Label from '../components/ui/label.vue'
import MapPreview from '../components/map/MapPreview.vue'
import logo from '../assets/logo.png'

const features = [
  {
    title: 'Network map',
    description: 'Sites, links, and field context in one place',
  },
  {
    title: 'Asset control',
    description: 'Towers, fibre, and equipment tracked by status',
  },
  {
    title: 'Secure access',
    description: 'Roles, provinces, and a full audit trail',
  },
]

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref<'login' | 'forgot'>('login')

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const keepSignedIn = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const roleHome: Record<string, string> = {
  ADMIN: '/app',
  VIEWER: '/app',
  INVENTORY_MANAGER: '/app',
  FIELD_ENGINEER: '/app/map',
  PLANNER: '/app',
  AUDITOR: '/app',
}

onMounted(async () => {
  if (route.query.mode === 'forgot') {
    mode.value = 'forgot'
  }
})

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await auth.signIn(username.value.trim(), password.value, keepSignedIn.value)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null

    if (redirect) {
      await router.push(redirect)
      return
    }

    const home = roleHome[auth.user?.roleName ?? ''] ?? '/app'
    await router.push(home)
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Invalid username or password'
    errorMessage.value = Array.isArray(msg) ? msg.join(', ') : String(msg)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-in-up {
  animation: fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>