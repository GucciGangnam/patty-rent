import { LayoutGrid, Bed, Bath, Car, Ruler, Building } from 'lucide-react'
import {
  PROPERTY_TYPE_LABELS,
  FURNISHED_LABELS,
  ROOM_TYPE_LABELS,
  type PropertyType,
  type FurnishedOption,
} from '../../../../types/property'
import type { AssetViewData } from '../AssetViewModal'

interface RoomsViewStepProps {
  data: AssetViewData
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number | null
}) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <Icon className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
      <div className="text-lg font-semibold">{value ?? '-'}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export default function RoomsViewStep({ data }: RoomsViewStepProps) {
  const hasPropertySize = data.floor_area_sqm || data.land_area_sqm || data.floors
  const hasPropertyType = data.property_type || data.furnished
  const hasRooms = data.rooms.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <LayoutGrid className="h-5 w-5" />
        <p className="text-sm">Property dimensions, type, and room details</p>
      </div>

      {/* Basic Counts */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4">Basic Information</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Bed} label="Bedrooms" value={data.bedrooms} />
          <StatCard icon={Bath} label="Bathrooms" value={data.bathrooms} />
          <StatCard icon={Car} label="Parking" value={data.parking_spaces} />
        </div>
      </div>

      {/* Property Size */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Property Size
        </h3>
        {hasPropertySize ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Floor Area</div>
              <div className="text-sm">
                {data.floor_area_sqm ? `${data.floor_area_sqm} m²` : <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Land Area</div>
              <div className="text-sm">
                {data.land_area_sqm ? `${data.land_area_sqm} m²` : <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Floors</div>
              <div className="text-sm">
                {data.floors ?? <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No size information specified</p>
        )}
      </div>

      {/* Property Type & Furnished */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Building className="h-4 w-4" />
          Property Type
        </h3>
        {hasPropertyType ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Type</div>
              <div className="text-sm">
                {data.property_type
                  ? PROPERTY_TYPE_LABELS[data.property_type as PropertyType] || data.property_type
                  : <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Furnished</div>
              <div className="text-sm">
                {data.furnished
                  ? FURNISHED_LABELS[data.furnished as FurnishedOption] || data.furnished
                  : <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No property type information specified</p>
        )}
      </div>

      {/* Detailed Room List */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4">Detailed Room List</h3>
        {hasRooms ? (
          <div className="space-y-2">
            {data.rooms.map((room, index) => (
              <div
                key={room.id || index}
                className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {ROOM_TYPE_LABELS[room.room_type] || room.room_type}
                    </span>
                    {room.name && (
                      <span className="text-sm text-muted-foreground">
                        - {room.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {room.width_m && room.length_m && (
                      <span>{room.width_m}m × {room.length_m}m ({(room.width_m * room.length_m).toFixed(1)} m²)</span>
                    )}
                    {room.notes && <span>• {room.notes}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 italic">
            No detailed room information has been added.
          </p>
        )}
      </div>
    </div>
  )
}
