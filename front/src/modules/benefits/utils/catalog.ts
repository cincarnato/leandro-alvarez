import type { PublicBenefit } from '../interfaces/PublicBenefit'
export const displayName = (value?: string) => (value || '').replace(/^Demo · /, '')
export const isDemo = (benefit: PublicBenefit) => benefit.title.startsWith('Demo · ')
export const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim()
export function filterBenefits(items: PublicBenefit[], query: string, category: string, order: string) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean)
  return items.filter(item => (!category || item.category?._id === category) && words.every(word => normalizeSearch([item.title, item.company?.name, item.category?.name, item.description].join(' ')).includes(word)))
    .sort((a, b) => order === 'name' ? displayName(a.company?.name).localeCompare(displayName(b.company?.name)) : order === 'ending' ? Date.parse(a.endDate) - Date.parse(b.endDate) : Number(b.featured) - Number(a.featured))
}
