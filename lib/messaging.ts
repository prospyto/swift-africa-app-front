/**
 * Masque les numéros de téléphone dans les messages
 * Empêche les utilisateurs de contacter directement en dehors de la plateforme
 */
export function maskPhoneNumbers(text: string): string {
  const phonePattern = /(\+?\d{1,3})[\s.-]?(\d{2,4})[\s.-]?(\d{2,4})[\s.-]?(\d{2,4})/g
  return text.replace(phonePattern, (_, country, part1) => {
    return `${country || ''}${part1}****`
  })
}

export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins}m`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
}

export function getChatTypeLabel(chatType: string): string {
  const labels: Record<string, string> = {
    buyer_seller:    'Acheteur · Vendeur',
    seller_delivery: 'Vendeur · Livreur',
    buyer_delivery:  'Acheteur · Livreur',
  }
  return labels[chatType] || 'Messages'
}
