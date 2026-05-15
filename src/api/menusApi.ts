import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type MenuPage = {
  id: number
  page_title: string
  url_slug: string
  parent_id: number | null
  page_type: string
  status: string
}

export type MenuItem = {
  id: number
  parent_id: number | null
  label: string
  navigation_type: string
  page_id: number | null
  external_url: string
  open_in_new_tab: boolean
  sort_order: number
  href: string
  page_type?: string
  page?: MenuPage
  children: MenuItem[]
}

export type MenuResponse = {
  id: number
  menu_key: string
  name: string
  items: MenuItem[]
}

async function getMenu(menuKey: string) {
  const response = await apiClient.get<MenuResponse>(API_ROUTES.menuByKey(menuKey), {
    skipAuth: true,
    skipErrorToast: true,
  })

  return response.data
}

export const menusApi = {
  getMainMenu: () => getMenu('main'),
}
