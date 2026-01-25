import { FileText, Calendar, Info } from 'lucide-react'
import type { AssetViewData } from '../AssetViewModal'

interface DetailsViewStepProps {
  data: AssetViewData
}

function formatDate(dateString: string | null) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
}

export default function DetailsViewStep({ data }: DetailsViewStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="h-5 w-5" />
        <p className="text-sm">Property details and description</p>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Status</div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                STATUS_STYLES[data.status] || STATUS_STYLES.draft
              }`}
            >
              {data.status}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-muted-foreground mb-1">Asset ID</div>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{data.id}</code>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="rounded-lg border border-border p-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">Property Title</div>
        {data.title ? (
          <h3 className="text-lg font-semibold">{data.title}</h3>
        ) : (
          <p className="text-sm text-muted-foreground italic">No title specified</p>
        )}
      </div>

      {/* Description */}
      <div className="rounded-lg border border-border p-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">Public Description</div>
        {data.description ? (
          <p className="text-sm whitespace-pre-wrap">{data.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description specified</p>
        )}
      </div>

      {/* Internal Notes */}
      <div className="rounded-lg border border-border p-4 bg-amber-50/50">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-amber-600" />
          <div className="text-xs font-medium text-muted-foreground">
            Internal Notes
            <span className="font-normal ml-1">(not shown to tenants)</span>
          </div>
        </div>
        {data.internal_notes ? (
          <p className="text-sm whitespace-pre-wrap">{data.internal_notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No internal notes</p>
        )}
      </div>

      {/* Timestamps */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-medium">Timestamps</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Created</div>
            <div className="text-sm">{formatDate(data.created_at)}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Last Updated</div>
            <div className="text-sm">{formatDate(data.updated_at)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
