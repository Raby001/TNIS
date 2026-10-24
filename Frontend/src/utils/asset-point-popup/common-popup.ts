import type { AssetPoint } from '@/types/asset-point'

export const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

const formatValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') {
        return 'N/A'
    }
    return escapeHtml(String(value))
}

export const createPopupActions = (
    showActions = true,
) => {
    if (!showActions) {
        return ''
    }

    return `
        <div style="
            display: flex;
            gap: 8px;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
        ">
            <button
                type="button"
                data-action="edit-asset-point"
                style="
                    flex: 1;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #334155;
                    border-radius: 7px;
                    padding: 6px 10px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                "
            >
                Edit
            </button>

            <button
                type="button"
                data-action="remove-asset-point"
                style="
                    flex: 1;
                    border: 1px solid #fecaca;
                    background: #fef2f2;
                    color: #dc2626;
                    border-radius: 7px;
                    padding: 6px 10px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                "
            >
                Remove
            </button>
        </div>
    `
}

export const createCommonPopupHtml = (
    assetPoint: AssetPoint,
    assetType: string,
    specificHtml: string,
    options: {
        showActions?: boolean
    } = {},
) => {
    const statusName = assetPoint.asset.statusName || 'N/A'
    const showActions = options.showActions ?? true

    return `
        <div style="width: 100%; box-sizing: border-box; font-family: inherit;">
            <!-- Header Section -->
            <div style="margin-bottom: 12px; padding-right: 24px;">
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
                    ${formatValue(assetType)}
                </div>
                
                <div style="
                    font-size: 16px;
                    font-weight: 700;
                    line-height: 1.25;
                    color: #0f172a;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                ">
                    ${formatValue(assetPoint.asset.name)}
                </div>
            </div>

            <!-- Key Highlights (Code & Status) -->
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 8px 10px;
                margin-bottom: 12px;
            ">
                <div>
                    <div style="font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Code</div>
                    <div style="font-size: 12px; font-weight: 600; color: #1e293b;">${formatValue(assetPoint.asset.code)}</div>
                </div>

                <div style="text-align: right;">
                    <div style="font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Status</div>
                    <span style="
                        display: inline-block;
                        font-size: 11px;
                        font-weight: 600;
                        color: ${statusName === 'N/A' ? '#64748b' : '#0369a1'};
                        background: ${statusName === 'N/A' ? '#f1f5f9' : '#e0f2fe'};
                        padding: 1px 6px;
                        border-radius: 4px;
                    ">
                        ${escapeHtml(statusName)}
                    </span>
                </div>
            </div>

            <!-- Detail Rows -->
            <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;">
                ${specificHtml}
                ${createDetailRow('Installation Date', assetPoint.asset.installationDate)}
            </div>

            <!-- Description Box (Full Width Card for long text) -->
            <div style="
                background: #f8fafc;
                border-left: 3px solid #cbd5e1;
                border-radius: 0 6px 6px 0;
                padding: 6px 8px;
                margin-top: 8px;
            ">
                <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 2px;">Description</div>
                <div style="
                    font-size: 12px;
                    color: #334155;
                    line-height: 1.35;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                ">
                    ${formatValue(assetPoint.asset.description)}
                </div>
            </div>
            
            ${createPopupActions(showActions)}
        </div>
    `
}

export const createDetailRow = (
    label: string,
    value: string | number | null | undefined,
) => {
    return `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            line-height: 1.4;
        ">
            <span style="color: #64748b; font-weight: 500;">${escapeHtml(label)}</span>
            <span style="
                color: #1e293b;
                font-weight: 600;
                text-align: right;
                min-width: 0;
                overflow-wrap: anywhere;
                word-break: break-word;
            ">
                ${formatValue(value)}
            </span>
        </div>
    `
}
