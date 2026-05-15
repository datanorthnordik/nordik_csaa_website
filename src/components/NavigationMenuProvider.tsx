import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { menusApi, type MenuResponse } from '../api/menusApi'
import { fallbackMainMenu, sortMenuItems } from '../lib/navigationMenu'

type NavigationMenuContextValue = {
  menu: MenuResponse
  isLoading: boolean
  hasRemoteMenu: boolean
}

const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null)

export function NavigationMenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuResponse>(fallbackMainMenu)
  const [isLoading, setIsLoading] = useState(true)
  const [hasRemoteMenu, setHasRemoteMenu] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadMainMenu() {
      setIsLoading(true)

      try {
        const response = await menusApi.getMainMenu()

        if (!ignore) {
          setMenu({
            ...response,
            items: sortMenuItems(response.items),
          })
          setHasRemoteMenu(true)
        }
      } catch {
        if (!ignore) {
          setMenu({
            ...fallbackMainMenu,
            items: sortMenuItems(fallbackMainMenu.items),
          })
          setHasRemoteMenu(false)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadMainMenu()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <NavigationMenuContext.Provider
      value={{
        menu,
        isLoading,
        hasRemoteMenu,
      }}
    >
      {children}
    </NavigationMenuContext.Provider>
  )
}

export function useNavigationMenu() {
  const context = useContext(NavigationMenuContext)

  if (!context) {
    throw new Error('useNavigationMenu must be used within NavigationMenuProvider.')
  }

  return context
}
