import type {
    CableDetail,
    CableConnectionEndpoint,
    CableSplicePoint,
} from '@/types/cable'

export const createCablePopupHtml = (
    cable: CableDetail,
    start: CableConnectionEndpoint,
    end: CableConnectionEndpoint,
    splicePoints: CableSplicePoint[],
    options: {
        showActions?: boolean
    } = {},
) => {

    const showActions =
        options.showActions ?? true

    const statusName =
        cable.status?.name || 'N/A'

    const totalLength =
        end.cumulativeDistanceM

    return `
        <div style="
            width: 100%;
            box-sizing: border-box;
            font-family: inherit;
        ">

            <!-- Header -->
            <div style="
                margin-bottom: 12px;
                padding-right: 24px;
            ">
                <div style="
                    display: inline-block;
                    padding: 2px 8px;
                    margin-bottom: 6px;
                    background: #f1f5f9;
                    color: #475569;
                    font-size: 11px;
                    font-weight: 600;
                    border-radius: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                ">
                    Fiber Cable
                </div>

                <div style="
                    font-size: 16px;
                    font-weight: 700;
                    line-height: 1.25;
                    color: #0f172a;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                ">
                    ${escapeHtml(cable.name)}
                </div>
            </div>

            <!-- Code & Status -->
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 8px 10px;
                margin-bottom: 12px;
            ">
                <div style="min-width: 0;">
                    <div style="
                        font-size: 10px;
                        font-weight: 600;
                        color: #94a3b8;
                        text-transform: uppercase;
                    ">
                        Code
                    </div>

                    <div style="
                        font-size: 12px;
                        font-weight: 600;
                        color: #1e293b;
                        overflow-wrap: anywhere;
                    ">
                        ${escapeHtml(cable.code)}
                    </div>
                </div>

                <div style="
                    text-align: right;
                    flex-shrink: 0;
                ">
                    <div style="
                        font-size: 10px;
                        font-weight: 600;
                        color: #94a3b8;
                        text-transform: uppercase;
                    ">
                        Status
                    </div>

                    <span style="
                        display: inline-block;
                        font-size: 11px;
                        font-weight: 600;
                        color: ${statusName === 'N/A'
            ? '#64748b'
            : '#0369a1'
        };
                        background: ${statusName === 'N/A'
            ? '#f1f5f9'
            : '#e0f2fe'
        };
                        padding: 1px 6px;
                        border-radius: 4px;
                    ">
                        ${escapeHtml(statusName)}
                    </span>
                </div>
            </div>

            <!-- Connection Path -->
            <div style="
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 12px;
            ">
                <div style="
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                ">
                    Connection Path
                </div>

                <div style="
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 4px;
                    font-size: 12px;
                ">
                    ${connectionPath(start, end)}
                </div>
            </div>

            <!-- Specifications -->
            <div style="
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-bottom: 12px;
            ">
                ${row(
            'Segment Type',
            cable.segmentType?.name,
        )}

                ${row(
            'Cable Type',
            cable.cableType?.name,
        )}

                ${row(
            'Core Count',
            cable.coreCount?.name,
        )}

                ${row(
            'Installation',
            cable.installationMethod?.name,
        )}

                ${row(
            'Length',
            formatDistance(totalLength),
        )}
            </div>

            <!-- Asset Metadata -->
            <div style="
                border-top: 1px dashed #e2e8f0;
                padding-top: 8px;
                margin-top: 8px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            ">
                ${row(
            'Asset Tag',
            cable.assetTag,
        )}

                ${row(
            'Serial Number',
            cable.serialNumber,
        )}

                ${row(
            'Purchase Date',
            cable.purchaseDate,
        )}

                ${row(
            'Installation Date',
            cable.installationDate,
        )}
            </div>

            ${splicePoints.length > 0
            ? `
                        <!-- Splice Points -->
                        <div style="
                            border-top: 1px dashed #e2e8f0;
                            padding-top: 8px;
                            margin-top: 8px;
                        ">
                            ${row(
                'Splice Points',
                splicePoints.length,
            )}
                        </div>
                    `
            : ''
        }

            <!-- Description -->
            ${cable.description
            ? `
                            <div style="
                                background: #f8fafc;
                                border-left: 3px solid #cbd5e1;
                                border-radius: 0 6px 6px 0;
                                padding: 6px 8px;
                                margin-top: 10px;
                            ">
                                <div style="
                                    font-size: 10px;
                                    font-weight: 600;
                                    color: #64748b;
                                    margin-bottom: 2px;
                                    text-transform: uppercase;
                                ">
                                    Description
                                </div>

                                <div style="
                                    font-size: 12px;
                                    color: #334155;
                                    line-height: 1.35;
                                    overflow-wrap: anywhere;
                                    word-break: break-word;
                                ">
                                    ${escapeHtml(cable.description)}
                                </div>
                            </div>
                        `
            : ''
        }

        ${showActions
            ? `
                <!-- Actions -->
                <div style="
                    border-top: 1px solid #e2e8f0;
                    padding-top: 10px;
                    margin-top: 12px;
                    display: flex;
                    gap: 8px;
                ">
                    <button
                        type="button"
                        data-action="edit-cable"
                        style="
                            flex: 1;
                            padding: 8px 12px;
                            border: 1px solid #cbd5e1;
                            border-radius: 8px;
                            background: white;
                            color: #334155;
                            font-size: 12px;
                            font-weight: 700;
                            cursor: pointer;
                        "
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        data-action="remove-cable"
                        style="
                            flex: 1;
                            padding: 8px 12px;
                            border: 1px solid #fecaca;
                            border-radius: 8px;
                            background: #fef2f2;
                            color: #dc2626;
                            font-size: 12px;
                            font-weight: 700;
                            cursor: pointer;
                        "
                    >
                        Delete
                    </button>
                </div>
            `
            : ''
        }
        </div>
    `
}

const getTargetTypeLabel = (
    connection: CableConnectionEndpoint,
) => {
    if (connection.targetType === 'SITE') {
        return 'Site'
    }

    if (connection.targetType === 'ASSET') {
        return 'Asset'
    }

    if (connection.target?.site) {
        return 'Site'
    }

    if (connection.target?.asset) {
        return 'Asset'
    }

    return 'Target'
}

const getConnectionTargetCode = (
    connection: CableConnectionEndpoint,
): string => {
    const site = connection.target?.site

    if (site?.code) {
        return site.code
    }

    if (site?.name) {
        return site.name
    }

    const asset = connection.target?.asset

    if (asset?.code) {
        return asset.code
    }

    if (asset?.name) {
        return asset.name
    }

    return 'Unknown'
}
const connectionPath = (
    start: CableConnectionEndpoint,
    end: CableConnectionEndpoint,
) => {
    const startCode =
        getConnectionTargetCode(start)

    const endCode =
        getConnectionTargetCode(end)

    const startType =
        getTargetTypeLabel(start)

    const endType =
        getTargetTypeLabel(end)

    return `
        <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            overflow: hidden;
        ">
            <span
                title="${escapeHtml(startType)}"
                style="
                    display: inline-flex;
                    align-items: center;
                    padding: 5px 7px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    background: white;
                    color: #334155;
                    font-size: 11px;
                    font-weight: 600;

                    max-width: 100%;
                    white-space: normal;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    box-sizing: border-box;
                "
            >
                ${escapeHtml(startCode)}
            </span>

            <span style="
                flex-shrink: 0;
                font-size: 16px;
                font-weight: 600;
                color: #94a3b8;
            ">
                →
            </span>

            <span
                title="${escapeHtml(endType)}"
                style="
                    display: inline-flex;
                    align-items: center;
                    padding: 5px 7px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    background: white;
                    color: #334155;
                    font-size: 11px;
                    font-weight: 600;

                    max-width: 100%;
                    white-space: normal;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    box-sizing: border-box;
                "
            >
                ${escapeHtml(endCode)}
            </span>
        </div>
    `
}

const formatDistance = (
    value: number | null | undefined,
) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(value)
    ) {
        return 'N/A'
    }

    if (value >= 1000) {
        return `${(value / 1000).toFixed(2)} km`
    }

    return `${value.toFixed(2)} m`
}

const row = (
    label: string,
    value: string | number | null | undefined,
) => {
    return `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            font-size: 12px;
            line-height: 1.4;
        ">
            <span style="
                color: #64748b;
                font-weight: 500;
                flex-shrink: 0;
            ">
                ${escapeHtml(label)}
            </span>

            <span style="
                color: #1e293b;
                font-weight: 600;
                text-align: right;
                min-width: 0;
                overflow-wrap: anywhere;
                word-break: break-word;
            ">
                ${escapeHtml(
        displayValue(value),
    )}
            </span>
        </div>
    `
}

const displayValue = (
    value: string | number | null | undefined,
) => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return 'N/A'
    }

    return String(value)
}

const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}