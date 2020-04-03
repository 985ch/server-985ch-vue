import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Bot的凝视'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
