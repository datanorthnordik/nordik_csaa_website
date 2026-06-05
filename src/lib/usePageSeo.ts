import { useEffect } from 'react'

export const SITE_NAME = 'Children of Shingwauk Alumni Association'

export type PageSeoStructuredData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>

type UsePageSeoOptions = {
  title: string
  description?: string
  canonicalPath?: string
  image?: string
  type?: 'website' | 'article'
  lang?: string
  noIndex?: boolean
  jsonLd?: PageSeoStructuredData
}

export function usePageSeo({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  lang,
  noIndex,
  jsonLd,
}: UsePageSeoOptions) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const cleanups: Array<() => void> = []
    const resolvedUrl = canonicalPath ? buildAbsoluteUrl(canonicalPath) : window.location.href

    cleanups.push(upsertMeta('property', 'og:title', title))
    cleanups.push(upsertMeta('property', 'og:type', type))
    cleanups.push(upsertMeta('property', 'og:url', resolvedUrl))
    cleanups.push(upsertMeta('name', 'twitter:title', title))
    cleanups.push(
      upsertMeta(
        'name',
        'twitter:card',
        image ? 'summary_large_image' : 'summary',
      ),
    )

    if (description) {
      cleanups.push(upsertMeta('name', 'description', description))
      cleanups.push(upsertMeta('property', 'og:description', description))
      cleanups.push(upsertMeta('name', 'twitter:description', description))
    }

    if (canonicalPath) {
      cleanups.push(upsertLink('canonical', resolvedUrl))
    }

    if (image) {
      cleanups.push(upsertMeta('property', 'og:image', image))
      cleanups.push(upsertMeta('name', 'twitter:image', image))
    }

    if (typeof noIndex === 'boolean') {
      cleanups.push(
        upsertMeta(
          'name',
          'robots',
          noIndex ? 'noindex, nofollow' : 'index, follow',
        ),
      )
    }

    if (lang) {
      cleanups.push(upsertHtmlLang(lang))
    }

    if (jsonLd) {
      cleanups.push(upsertStructuredData(jsonLd))
    }

    return () => {
      document.title = previousTitle
      cleanups.reverse().forEach((cleanup) => cleanup())
    }
  }, [canonicalPath, description, image, jsonLd, lang, noIndex, title, type])
}

export function buildAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  const origin = window.location.origin === 'null' ? 'http://localhost' : window.location.origin
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return new URL(normalizedPath, origin).toString()
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  const existed = Boolean(element)
  const previousContent = element?.getAttribute('content') ?? null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)

  return () => {
    if (!element) {
      return
    }

    if (!existed) {
      element.remove()
      return
    }

    if (previousContent === null) {
      element.removeAttribute('content')
      return
    }

    element.setAttribute('content', previousContent)
  }
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  const existed = Boolean(element)
  const previousHref = element?.getAttribute('href') ?? null

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)

  return () => {
    if (!element) {
      return
    }

    if (!existed) {
      element.remove()
      return
    }

    if (previousHref === null) {
      element.removeAttribute('href')
      return
    }

    element.setAttribute('href', previousHref)
  }
}

function upsertHtmlLang(lang: string) {
  const previousLang = document.documentElement.lang
  document.documentElement.lang = lang

  return () => {
    document.documentElement.lang = previousLang
  }
}

function upsertStructuredData(jsonLd: PageSeoStructuredData) {
  const selector = 'script[data-page-seo="structured-data"]'
  let element = document.head.querySelector<HTMLScriptElement>(selector)
  const existed = Boolean(element)
  const previousText = element?.textContent ?? null

  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.setAttribute('data-page-seo', 'structured-data')
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(jsonLd)

  return () => {
    if (!element) {
      return
    }

    if (!existed) {
      element.remove()
      return
    }

    element.textContent = previousText
  }
}
