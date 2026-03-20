import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'default-secret-change-in-production-32c'

export function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}

export function decrypt(encryptedText) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY)
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  if (!decrypted) throw new Error('Failed to decrypt data')
  return decrypted
}

export function encryptObject(obj) {
  return encrypt(JSON.stringify(obj))
}

export function decryptObject(encryptedText) {
  return JSON.parse(decrypt(encryptedText))
}

export function generateSecureToken(length = 32) {
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  }
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

export function generateQRData(emergencyData) {
  const json = JSON.stringify(emergencyData)
  const encrypted = CryptoJS.AES.encrypt(json, SECRET_KEY).toString()
  // Browser-compatible base64url encoding
  return btoa(encrypted).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decryptQRData(qrData) {
  // Browser-compatible base64url decoding
  let base64 = qrData.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  const encrypted = atob(base64)
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}
