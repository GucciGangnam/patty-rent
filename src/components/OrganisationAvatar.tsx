interface OrganisationAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-24 w-24 text-2xl',
}

export default function OrganisationAvatar({ name, avatarUrl, size = 'md' }: OrganisationAvatarProps) {
  const initial = name.charAt(0).toUpperCase()
  const sizeClass = sizeClasses[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium`}
    >
      {initial}
    </div>
  )
}
