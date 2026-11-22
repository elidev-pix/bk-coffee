import { useMemo, useState } from 'react'
import { useAppState } from './state/store'

/** Catalogue filtré (recherche + catégorie), commun au site, à la borne et à la caisse. */
export function useCatalog() {
  const { products, categories } = useAppState()
  const [categoryId, setCategoryId] = useState<string>('all')
  const [query, setQuery] = useState('')
  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => (categoryId === 'all' || p.categoryId === categoryId) && (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)))
  }, [products, categoryId, query])
  return { categories: sortedCategories, visible, categoryId, setCategoryId, query, setQuery }
}
