/**
 * Mask phone numbers in text while preserving other content
 * Pattern: +XXX XXXX XXXX or similar variations
 * Masked format: +XXX XXXX **XX
 */
export function maskPhoneNumbers(text: string): string {
  // Match phone patterns like +221771234567, +221 77 123 4567, +33612345678, etc.
  const phonePattern = /(\+?\d{1,3})[\s.-]?(\d{2,4})[\s.-]?(\d{2,4})[\s.-]?(\d{2,4})/g
  
  return text.replace(phonePattern, (match, country, part1, part2, part3) => {
    // Keep first part and first digits visible, mask the rest
    const visible = `${country || ''}${part1}`
    const masked = '**'
    return `${visible}${masked}${part3}`
  })
}

/**
 * Reverse mask to reveal phone for authorized users
 * In production, this would be controlled server-side
 */
export function unmaskPhoneNumbers(text: string, reveal: boolean): string {
  if (!reveal) return text
  // In a real app, this would be a database lookup, not client-side
  return text
}

/**
 * Format timestamp for message display
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins}m`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  
  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
}

/**
 * Get chat type label for display
 */
export function getChatTypeLabel(chatType: string): string {
  const labels: Record<string, string> = {
    buyer_seller: 'Discussion Acheteur-Vendeur',
    seller_delivery: 'Discussion Vendeur-Livreur',
    buyer_delivery: 'Discussion Acheteur-Livreur',
  }
  return labels[chatType] || 'Message'
}
