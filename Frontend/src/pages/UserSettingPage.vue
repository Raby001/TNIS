<template>
  <div class="h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Personal preferences for how the app works for you.
        </p>
      </div>

      <!-- Preferences -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Preferences</h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Defaults applied when you sign in.
            </p>
          </div>
          <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            Coming soon
          </span>
        </div>

        <div class="mt-4 space-y-4 opacity-60 pointer-events-none">
          <div>
            <Label>Default page after login</Label>
            <Select disabled class="mt-1.5">
              <option>Dashboard</option>
              <option>Map</option>
              <option>Assets</option>
            </Select>
          </div>

          <div>
            <Label>Rows per table page</Label>
            <Select disabled class="mt-1.5">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </Select>
          </div>
        </div>
      </section>

      <!-- Map -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Map</h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Default layers and display units.
            </p>
          </div>
          <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            Coming soon
          </span>
        </div>

        <ul class="mt-4 space-y-3 opacity-60 pointer-events-none">
          <li class="flex items-center justify-between text-sm text-slate-700">
            <span>Show sites by default</span>
            <span class="text-xs text-slate-400">On</span>
          </li>
          <li class="flex items-center justify-between text-sm text-slate-700">
            <span>Show cables by default</span>
            <span class="text-xs text-slate-400">On</span>
          </li>
          <li class="flex items-center justify-between text-sm text-slate-700">
            <span>Distance units</span>
            <span class="text-xs text-slate-400">Meters</span>
          </li>
        </ul>
      </section>

      <!-- Appearance -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Appearance</h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Theme and layout density.
            </p>
          </div>
          <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            Coming soon
          </span>
        </div>

        <div class="mt-4 opacity-60 pointer-events-none">
          <Label>Theme</Label>
          <Select disabled class="mt-1.5">
            <option>System</option>
            <option>Light</option>
            <option>Dark</option>
          </Select>
        </div>
      </section>

      <p class="text-center text-xs text-slate-400">
        These settings will be saved to your account when the server supports them.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Label from '@/components/ui/label.vue'
import Select from '@/components/ui/Select.vue'
</script>