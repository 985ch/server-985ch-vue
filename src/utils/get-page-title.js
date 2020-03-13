import defaultSettings from '@/settings'

const title = defaultSettings.title || 'QNAP管理工具'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
