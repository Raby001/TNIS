import type { FieldObservation } from '@/types/field-observation'

export function createFieldObservationPopupHtml(
    observation: FieldObservation,
    options: {
        showActions?: boolean
    } = {},
) {
    const showActions = options.showActions ?? true

    return `
        <div class="space-y-2">
            <div>
                <div class="text-sm font-semibold text-slate-900">
                    ${observation.name}
                </div>

                <div class="text-xs text-slate-500">
                    Field Observation
                </div>
            </div>

            ${observation.description
            ? `
                        <div class="text-sm text-slate-700">
                            ${observation.description}
                        </div>
                    `
            : ''
        }

            <div class="space-y-1 border-t border-slate-200 pt-2">
                <div class="flex justify-between gap-4 text-xs">
                    <span class="text-slate-500">
                        Status
                    </span>

                    <span class="font-medium text-slate-700">
                        ${observation.status}
                    </span>
                </div>

                <div class="flex justify-between gap-4 text-xs">
                    <span class="text-slate-500">
                        Latitude
                    </span>

                    <span class="font-medium text-slate-700">
                        ${observation.latitude}
                    </span>
                </div>

                <div class="flex justify-between gap-4 text-xs">
                    <span class="text-slate-500">
                        Longitude
                    </span>

                    <span class="font-medium text-slate-700">
                        ${observation.longitude}
                    </span>
                </div>
            </div>

            ${showActions
            ? `
            <div class="flex gap-2 border-t border-slate-200 pt-2">
                <button
                    type="button"
                    data-action="cancel-field-observation"
                    class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                    Remove
                </button>

                <button
                    type="button"
                    data-action="convert-field-observation"
                    class="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                >
                    Convert
                </button>
            </div>
            `
            : ''
        }
        </div>
    `
}
