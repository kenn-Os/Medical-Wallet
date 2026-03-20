import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { generateSecureToken } from '../encryption'

export { generateSecureToken }

export function cn(...inputs) { return twMerge(clsx(inputs)) }

export function formatDate(date) {
  if (!date) return '—'
  try { return format(parseISO(date), 'MMM d, yyyy') } catch { return date }
}

export function formatDateTime(date) {
  if (!date) return '—'
  try { return format(parseISO(date), 'MMM d, yyyy HH:mm') } catch { return date }
}

export function timeAgo(date) {
  if (!date) return '—'
  try { return formatDistanceToNow(parseISO(date), { addSuffix: true }) } catch { return date }
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function severityColor(severity) {
  switch (severity) {
    case 'severe': return 'text-red-600 bg-red-50 border-red-200'
    case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'mild': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function verificationBadge(status) {
  switch (status) {
    case 'doctor_verified': return { label: 'Doctor Verified', color: 'text-blue-700 bg-blue-50 border-blue-200' }
    case 'institution_verified': return { label: 'Institution Verified', color: 'text-purple-700 bg-purple-50 border-purple-200' }
    default: return { label: 'Self Reported', color: 'text-gray-600 bg-gray-50 border-gray-200' }
  }
}

export function getExpiryFromDuration(duration) {
  const now = new Date()
  switch (duration) {
    case '1h': return new Date(now.getTime() + 60 * 60 * 1000)
    case '24h': return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '7d': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
}

export function isExpired(expiresAt) { return new Date(expiresAt) < new Date() }

export function bloodTypeColor(bloodType) {
  if (['A+', 'A-', 'AB+', 'AB-'].includes(bloodType)) return 'text-red-600 bg-red-50'
  if (['B+', 'B-'].includes(bloodType)) return 'text-blue-600 bg-blue-50'
  return 'text-gray-600 bg-gray-50'
}
