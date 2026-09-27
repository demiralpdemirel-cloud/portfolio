export const assetPath = (path = '') => {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
