import { useState } from 'react'
import { LayoutGrid, Bed, Bath, Car, Ruler, Building, Plus, X, ArrowUpDown } from 'lucide-react'
import {
  PROPERTY_TYPE_LABELS,
  FURNISHED_LABELS,
  ROOM_TYPE_LABELS,
  type PropertyFormData,
  type PropertyType,
  type FurnishedOption,
  type PropertyRoom,
  type RoomType,
} from '../../../../types/property'

interface RoomsStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
}

const PROPERTY_TYPES = Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][]
const FURNISHED_OPTIONS = Object.entries(FURNISHED_LABELS) as [FurnishedOption, string][]
const ROOM_TYPES = Object.entries(ROOM_TYPE_LABELS) as [RoomType, string][]

export default function RoomsStep({ formData, updateFormData }: RoomsStepProps) {
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoom, setNewRoom] = useState<Partial<PropertyRoom>>({
    room_type: 'bedroom',
    name: '',
    width_m: undefined,
    length_m: undefined,
    notes: '',
  })

  const addRoom = () => {
    if (!newRoom.room_type) return

    const room: PropertyRoom = {
      id: crypto.randomUUID(),
      room_type: newRoom.room_type as RoomType,
      name: newRoom.name || undefined,
      width_m: newRoom.width_m,
      length_m: newRoom.length_m,
      notes: newRoom.notes || undefined,
    }

    updateFormData({ rooms: [...formData.rooms, room] })
    setNewRoom({
      room_type: 'bedroom',
      name: '',
      width_m: undefined,
      length_m: undefined,
      notes: '',
    })
    setShowAddRoom(false)
  }

  const removeRoom = (roomId: string) => {
    updateFormData({ rooms: formData.rooms.filter(r => r.id !== roomId) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <LayoutGrid className="h-5 w-5" />
        <p className="text-sm">Enter property dimensions, type, and room details.</p>
      </div>

      {/* Basic Counts */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4">Basic Information</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="bedrooms" className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <Bed className="h-4 w-4 text-muted-foreground" />
              Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              min="0"
              placeholder="0"
              value={formData.bedrooms}
              onChange={(e) => updateFormData({ bedrooms: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="bathrooms" className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <Bath className="h-4 w-4 text-muted-foreground" />
              Bathrooms
            </label>
            <input
              id="bathrooms"
              type="number"
              min="0"
              placeholder="0"
              value={formData.bathrooms}
              onChange={(e) => updateFormData({ bathrooms: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="parking_spaces" className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <Car className="h-4 w-4 text-muted-foreground" />
              Parking
            </label>
            <input
              id="parking_spaces"
              type="number"
              min="0"
              placeholder="0"
              value={formData.parking_spaces}
              onChange={(e) => updateFormData({ parking_spaces: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Property Size */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Property Size
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="floor_area_sqm" className="block text-sm font-medium mb-1.5">
              Floor Area (m²)
            </label>
            <input
              id="floor_area_sqm"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 120"
              value={formData.floor_area_sqm}
              onChange={(e) => updateFormData({ floor_area_sqm: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="land_area_sqm" className="block text-sm font-medium mb-1.5">
              Land Area (m²)
            </label>
            <input
              id="land_area_sqm"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 450"
              value={formData.land_area_sqm}
              onChange={(e) => updateFormData({ land_area_sqm: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="floors" className="block text-sm font-medium mb-1.5">
              Floors
            </label>
            <input
              id="floors"
              type="number"
              min="1"
              placeholder="e.g., 2"
              value={formData.floors}
              onChange={(e) => updateFormData({ floors: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Property Type & Furnished */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Building className="h-4 w-4" />
          Property Type
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="property_type" className="block text-sm font-medium mb-1.5">
              Type
            </label>
            <select
              id="property_type"
              value={formData.property_type}
              onChange={(e) => updateFormData({ property_type: e.target.value as PropertyType | '' })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select type</option>
              {PROPERTY_TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="furnished" className="block text-sm font-medium mb-1.5">
              Furnished
            </label>
            <select
              id="furnished"
              value={formData.furnished}
              onChange={(e) => updateFormData({ furnished: e.target.value as FurnishedOption | '' })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select option</option>
              {FURNISHED_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Elevator Toggle */}
        <div className="mt-4 pt-4 border-t border-border">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.elevator === true}
                onChange={(e) => updateFormData({ elevator: e.target.checked ? true : null })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-primary transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Building has elevator</span>
            </div>
          </label>
        </div>
      </div>

      {/* Detailed Room List */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Detailed Room List</h3>
          {!showAddRoom && (
            <button
              type="button"
              onClick={() => setShowAddRoom(true)}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Room
            </button>
          )}
        </div>

        {/* Add Room Form */}
        {showAddRoom && (
          <div className="mb-4 p-3 rounded-md border border-dashed border-border bg-muted/30">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Room Type</label>
                <select
                  value={newRoom.room_type}
                  onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value as RoomType })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ROOM_TYPES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Master Bedroom"
                  value={newRoom.name || ''}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Width (m)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={newRoom.width_m || ''}
                  onChange={(e) => setNewRoom({ ...newRoom, width_m: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Length (m)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={newRoom.length_m || ''}
                  onChange={(e) => setNewRoom({ ...newRoom, length_m: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-end">
                {newRoom.width_m && newRoom.length_m && (
                  <span className="text-xs text-muted-foreground pb-2">
                    = {(newRoom.width_m * newRoom.length_m).toFixed(1)} m²
                  </span>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g., Walk-in robe, ensuite"
                value={newRoom.notes || ''}
                onChange={(e) => setNewRoom({ ...newRoom, notes: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddRoom(false)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addRoom}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Room
              </button>
            </div>
          </div>
        )}

        {/* Room List */}
        {formData.rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No rooms added yet. Add detailed room information for a more complete listing.
          </p>
        ) : (
          <div className="space-y-2">
            {formData.rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-3 rounded-md border border-border bg-background"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {ROOM_TYPE_LABELS[room.room_type]}
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
                <button
                  type="button"
                  onClick={() => removeRoom(room.id!)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
