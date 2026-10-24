<template>
    <AppCollapsible
        title="Filters"
        :icon="SlidersHorizontal"
        :default-open="false"
        compact
    >
        <div
            class="max-h-[calc(100vh-12rem)] overflow-y-auto px-4 pt-3 pb-2"
        >
            <div class="space-y-5">

                <!-- Asset Type -->
                <section class="space-y-2.5">
                    <div class="flex items-center justify-between">
                        <div>
                            <p
                                class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                            >
                                Filter by type
                            </p>

                            <p class="mt-1 text-xs text-slate-500">
                                Select one or more asset types
                            </p>
                        </div>

                        <span
                            class="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500"
                        >
                            {{ filterState.types.length }} selected
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <button
                            v-for="item in filterTypes"
                            :key="item.value"
                            type="button"
                            class="group flex min-h-10 items-center justify-between rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition-all duration-150"
                            :class="
                                filterState.types.includes(item.value)
                                    ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500/20'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-slate-50'
                            "
                            @click="toggleType(item.value)"
                        >
                            <span class="truncate">
                                {{ item.label }}
                            </span>

                            <span
                                class="ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]"
                                :class="
                                    filterState.types.includes(item.value)
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-slate-100 text-slate-300 group-hover:bg-slate-200'
                                "
                            >
                                {{ filterState.types.includes(item.value) ? '✓' : '+' }}
                            </span>
                        </button>
                    </div>

                    <div
                        v-if="filterState.types.length === 0"
                        class="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 px-3 py-2.5"
                    >
                        <p class="text-[11px] font-medium text-sky-700">
                            All asset types are currently visible.
                        </p>
                    </div>
                </section>

                <!-- Divider -->
                <div class="border-t border-slate-100" />

                <!-- General Filters -->
                <section>
                    <div
                        class="mb-3 flex items-center justify-between"
                    >
                        <div>
                            <p
                                class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                            >
                                Filter options
                            </p>

                            <p class="mt-1 text-sm font-bold text-slate-800">
                                {{ currentTypeLabel }}
                            </p>
                        </div>

                        <span
                            class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500"
                        >
                            {{ filterState.types.length === 0 ? 'All assets' : 'Custom view' }}
                        </span>
                    </div>

                    <div class="space-y-3">

                        <!-- Province -->
                        <FilterSelect
                            v-model="filterState.provinceId"
                            label="Province"
                            @change="handleProvinceChange"
                        >
                            <option value="">
                                All provinces
                            </option>

                            <option
                                v-for="item in provinces"
                                :key="item.value"
                                :value="item.value"
                            >
                                {{ item.label }}
                            </option>
                        </FilterSelect>

                        <!-- City -->
                        <FilterSelect
                            v-model="filterState.cityId"
                            label="City"
                            @change="handleCityChange"
                        >
                            <option value="">
                                All cities
                            </option>

                            <option
                                v-for="item in cities"
                                :key="item.value"
                                :value="item.value"
                            >
                                {{ item.label }}
                            </option>
                        </FilterSelect>

                        <!-- Site -->
                        <FilterSelect
                            v-model="filterState.siteId"
                            label="Site"
                        >
                            <option value="">
                                All sites
                            </option>

                            <option
                                v-for="item in sites"
                                :key="item.value"
                                :value="item.value"
                            >
                                {{ item.label }}
                            </option>
                        </FilterSelect>

                        <!-- Status -->
                        <FilterSelect
                            v-model="filterState.statusId"
                            label="Status"
                        >
                            <option value="">
                                All statuses
                            </option>

                            <option
                                v-for="item in statuses"
                                :key="item.value"
                                :value="item.value"
                            >
                                {{ item.label }}
                            </option>
                        </FilterSelect>

                        <!-- Fiber Cable Filters -->
                        <template v-if="showFiberCableFilters">
                            <FilterSelect
                                v-model="
                                    filterState.coreCountId
                                "
                                label="Core Count"
                            >
                                <option value="">
                                    All core counts
                                </option>

                                <option
                                    v-for="item in coreCounts"
                                    :key="item.value"
                                    :value="item.value"
                                >
                                    {{ item.label }}
                                </option>
                            </FilterSelect>

                            <FilterSelect
                                v-model="
                                    filterState.segmentTypeId
                                "
                                label="Segment Type"
                            >
                                <option value="">
                                    All segment types
                                </option>

                                <option
                                    v-for="item in segmentTypes"
                                    :key="item.value"
                                    :value="item.value"
                                >
                                    {{ item.label }}
                                </option>
                            </FilterSelect>

                            <FilterSelect
                                v-model="
                                    filterState.cableTypeId
                                "
                                label="Cable Type"
                            >
                                <option value="">
                                    All cable types
                                </option>

                                <option
                                    v-for="item in cableTypes"
                                    :key="item.value"
                                    :value="item.value"
                                >
                                    {{ item.label }}
                                </option>
                            </FilterSelect>

                            <FilterSelect
                                v-model="
                                    filterState.installationMethodId
                                "
                                label="Installation Method"
                            >
                                <option value="">
                                    All methods
                                </option>

                                <option
                                    v-for="item in installationMethods"
                                    :key="item.value"
                                    :value="item.value"
                                >
                                    {{ item.label }}
                                </option>
                            </FilterSelect>
                        </template>

                        <!-- ONU -->
                        <FilterSelect
                            v-if="showCustomerFilter"
                            v-model="filterState.customerId"
                            label="Customer"
                        >
                            <option value="">
                                All customers
                            </option>

                            <option
                                v-for="item in customers"
                                :key="item.value"
                                :value="item.value"
                            >
                                {{ item.label }}
                            </option>
                        </FilterSelect>

                    </div>
                </section>

                <!-- Limit -->
                <section
                    class="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                >
                    <div class="mb-2 flex items-center justify-between">
                        <div>
                            <label
                                class="block text-xs font-bold text-slate-700"
                            >
                                Result limit
                            </label>

                            <p class="mt-0.5 text-[10px] text-slate-400">
                                Maximum features returned per layer
                            </p>
                        </div>

                        <span
                            class="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm"
                        >
                            {{ filterState.limit }}
                        </span>
                    </div>

                    <input
                        v-model.number="filterState.limit"
                        type="number"
                        min="1"
                        max="10000"
                        step="1"
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                </section>

                <!-- Actions -->
                <div
                    class="sticky bottom-0 z-20 -mx-3 mt-2 border-slate-300 bg-white pt-2"
                >
                    <div class="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            class="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                            @click="resetFilters"
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            class="flex h-11 items-center justify-center rounded-xl bg-sky-500 px-3 text-xs font-bold text-white shadow-sm shadow-sky-500/20 transition-all duration-150 hover:bg-sky-600 active:scale-[0.98]"
                            @click="applyFilters"
                        >
                            Apply filters
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </AppCollapsible>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
    SlidersHorizontal,
} from 'lucide-vue-next'

import AppCollapsible from '@/components/common/AppCollapsible.vue'
import FilterSelect from './FilterSelect.vue'

import { useMapFilters } from '@/composables/useMapFilters'

const {
    filterState,
    filterTypes,
    currentTypeLabel,

    provinces,
    cities,
    sites,
    statuses,
    coreCounts,
    segmentTypes,
    cableTypes,
    installationMethods,
    customers,

    showFiberCableFilters,
    showCustomerFilter,

    toggleType,
    resetFilters,
    applyFilters,
    loadFilterOptions,
    handleCityChange,
    handleProvinceChange,
} = useMapFilters()

onMounted(() => {
    loadFilterOptions()
})
</script>