<template>
  <section class="space-y-5">
    <!-- ONU Information -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- ONU MAC Address -->
        <div>
          <FormLabel
            label="ONU MAC Address"
            optional
          />

          <input
            v-model="model.macAddressONU"
            type="text"
            placeholder="Enter ONU MAC address"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <!-- Router MAC Address -->
        <div>
          <FormLabel
            label="Router MAC Address"
            optional
          />

          <input
            v-model="model.macAddressRouter"
            type="text"
            placeholder="Enter router MAC address"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </div>

      <!-- PON Type -->
      <div>
        <FormLabel
          label="PON Type"
          optional
        />

        <input
          v-model="model.ponType"
          type="text"
          placeholder="e.g. GPON"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Speed / Allowance -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <!-- Download -->
        <div>
          <FormLabel
            label="Download Speed (Mbps)"
            optional
          />

          <input
            v-model.number="model.downloadSpeedMbps"
            type="number"
            min="0"
            placeholder="e.g. 100"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <!-- Upload -->
        <div>
          <FormLabel
            label="Upload Speed (Mbps)"
            optional
          />

          <input
            v-model.number="model.uploadSpeedMbps"
            type="number"
            min="0"
            placeholder="e.g. 50"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <!-- Data Allowance -->
        <div>
          <FormLabel
            label="Data Allowance (GB)"
            optional
          />

          <input
            v-model.number="model.dataAllowanceGb"
            type="number"
            min="0"
            placeholder="e.g. 500"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </div>
    </div>

    <!-- Customer -->
    <div class="border-t border-slate-200 pt-5">
      <div class="mb-3">
        <h3 class="text-sm font-semibold text-slate-800">
          Customer
        </h3>

        <p class="mt-1 text-xs text-slate-500">
          Select an existing customer or create a new one.
        </p>
      </div>

      <!-- Customer mode -->
      <div
        v-if="!props.editMode"
        class="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1"
      >
        <button
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="
            model.customerMode === 'existing'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          "
          @click="selectExistingCustomer"
        >
          Existing Customer
        </button>

        <button
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="
            model.customerMode === 'new'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          "
          @click="selectNewCustomer"
        >
          New Customer
        </button>
      </div>

      <!-- Existing customer -->
      <div class="space-y-4">
        <div>
          <label
            class="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            Search Customer
          </label>

          <input
            v-model="search"
            type="text"
            placeholder="Search by name, phone, or email"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            @input="handleSearch"
          />
        </div>

        <!-- Search results -->
        <div
          v-if="props.searchResults.length"
          class="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <button
            v-for="customer in props.searchResults"
            :key="customer.id"
            type="button"
            class="w-full border-b border-slate-100 px-3 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
            @click="selectCustomer(customer)"
          >
            <div class="text-sm font-medium text-slate-800">
              {{ customer.name }}
            </div>

            <div class="mt-0.5 text-xs text-slate-500">
              {{ customer.phone }}

              <span v-if="customer.email">
                · {{ customer.email }}
              </span>
            </div>
          </button>
        </div>

        <!-- Selected customer -->
        <div
          v-if="selectedCustomer"
          class="rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-800">
                {{ selectedCustomer.name }}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                {{ selectedCustomer.phone }}
              </p>

              <p
                v-if="selectedCustomer.email"
                class="text-xs text-slate-500"
              >
                {{ selectedCustomer.email }}
              </p>
            </div>

            <button
              type="button"
              class="text-xs font-medium text-slate-500 hover:text-slate-800"
              @click="clearCustomer"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <!-- New customer -->
      <div
        v-if="!props.editMode && model.customerMode === 'new'"
        class="space-y-4"
      >
        <div>
          <FormLabel
            label="Customer Name"
            required
          />

          <input
            v-model="model.customer.name"
            type="text"
            placeholder="Enter customer name"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div>
          <FormLabel
            label="Phone Number"
            optional
          />

          <input
            v-model="model.customer.phone"
            type="tel"
            placeholder="Enter phone number"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div>
          <FormLabel
            label="Email"
            optional
          />

          <input
            v-model="model.customer.email"
            type="email"
            placeholder="Enter email address"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div>
          <FormLabel
            label="Address"
            optional
          />

          <input
            v-model="model.customer.address"
            type="text"
            placeholder="Enter customer address"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div>
          <FormLabel
            label="Description"
            optional
          />

          <textarea
            v-model="model.customer.description"
            rows="3"
            placeholder="Enter customer description"
            class="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
} from 'vue'

import type { OnuFormData } from '@/types/onu'
import type { Customer } from '@/types/customer'

import FormLabel from '@/components/common/FormLabel.vue'

const model = defineModel<OnuFormData>({
  required: true,
})

const props = defineProps<{
  searchResults: Customer[]
  editMode?: boolean
}>()

const emit = defineEmits<{
  searchCustomers: [search: string]
}>()

const search = ref('')
const selectedCustomer = ref<Customer | null>(null)

watch(
  () => model.value.customerId,
  (customerId) => {
    if (!customerId) {
      selectedCustomer.value = null
      return
    }

    selectedCustomer.value = {
      id: customerId,
      name: model.value.customer.name,
      phone: model.value.customer.phone,
      email: model.value.customer.email || undefined,
    } as Customer
  },
  {
    immediate: true,
  },
)

const selectExistingCustomer = () => {
  model.value.customerMode = 'existing'
}

const selectNewCustomer = () => {
  model.value.customerMode = 'new'
  model.value.customerId = null
  selectedCustomer.value = null
  search.value = ''
}

const handleSearch = () => {
  const value = search.value.trim()

  if (!value) {
    emit('searchCustomers', '')
    return
  }

  emit('searchCustomers', value)
}

const selectCustomer = (
  customer: Customer,
) => {
  model.value.customerMode = 'existing'
  model.value.customerId = customer.id

  selectedCustomer.value = customer

  search.value = ''
}

const clearCustomer = () => {
  model.value.customerId = null
  selectedCustomer.value = null
  search.value = ''
}
</script>