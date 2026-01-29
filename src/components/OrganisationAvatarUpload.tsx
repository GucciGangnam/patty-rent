import { useRef, useState, useEffect } from 'react'
import { Loader2, Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import OrganisationAvatar from './OrganisationAvatar'

interface OrganisationAvatarUploadProps {
  organisationId: string
  name: string
  avatarUrl?: string | null
  onUpload: (url: string) => void
}

function extractStoragePath(publicUrl: string): string | null {
  // Extract the file path from a Supabase storage public URL
  // URL format: https://{project}.supabase.co/storage/v1/object/public/avatars/{path}
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/avatars\/(.+)$/)
  return match ? match[1] : null
}

export default function OrganisationAvatarUpload({
  organisationId,
  name,
  avatarUrl,
  onUpload,
}: OrganisationAvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync with prop when it changes externally
  useEffect(() => {
    setCurrentAvatarUrl(avatarUrl)
  }, [avatarUrl])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const filePath = `org_${organisationId}/${Date.now()}.${fileExt}`
    const previousAvatarUrl = currentAvatarUrl

    setUploading(true)

    try {
      // Delete the previous avatar if it exists
      if (previousAvatarUrl) {
        const oldPath = extractStoragePath(previousAvatarUrl)
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // Update local state immediately for instant UI feedback
      setCurrentAvatarUrl(data.publicUrl)
      onUpload(data.publicUrl)
    } catch (error) {
      console.error('Error uploading organisation avatar:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <OrganisationAvatar
          name={name}
          avatarUrl={currentAvatarUrl}
          size="lg"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
