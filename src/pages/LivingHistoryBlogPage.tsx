import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  blogsApi,
  resolveBlogAssetUrl,
  type BlogDetailResponse,
} from '../api/blogsApi'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { buildAbsoluteUrl, SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import { blogDetailPath } from '../lib/blogSlug'
import {
  LivingHistoryBlogLayout,
  blogHasAnimations,
  blogHasPostAnimationContent,
} from '../components/blogs/LivingHistoryBlogLayout'
import { ShareStoryForm } from '../components/blogs/ShareStoryForm'
import styles from './LivingHistoryHubPage.module.css'

const HUB_PATH = '/our-story/living-history-hub'

type LoadStatus = 'loading' | 'ready' | 'error'

function extractYouTubeId(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] ?? ''
    }
    return (
      parsed.searchParams.get('v') ??
      parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] ??
      ''
    )
  } catch {
    return url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]+)/)?.[1] ?? ''
  }
}

function embedUrl(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`
}

export function LivingHistoryBlogPage() {
  const { blogSlug } = useParams<{ blogSlug: string }>()
  const { t } = useTranslation()

  const [blog, setBlog] = useState<BlogDetailResponse | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  const [theatre, setTheatre] = useState(false)
  const [theatreId, setTheatreId] = useState<string | null>(null)

  const openTheatre = (videoUrlOrId: string) => {
    const id = extractYouTubeId(videoUrlOrId) || videoUrlOrId
    setTheatreId(id)
    setTheatre(true)
  }

  useEffect(() => {
    let cancelled = false

    async function loadBlog() {
      setStatus('loading')
      try {
        const detail = blogSlug ? await blogsApi.getBlogBySlug(blogSlug) : null
        if (cancelled) {
          return
        }
        if (!detail) {
          setBlog(null)
          setStatus('error')
          return
        }
        setBlog(detail)
        setStatus('ready')
      } catch {
        if (!cancelled) {
          setBlog(null)
          setStatus('error')
        }
      }
    }

    void loadBlog()

    return () => {
      cancelled = true
    }
  }, [blogSlug])

  useEffect(() => {
    if (!theatre) {
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTheatre(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [theatre])

  usePageBreadcrumbs([
    {
      label: t('site.breadcrumbs.ourStory'),
      href: '/our-story',
    },
    {
      label: 'Living History Hub',
      href: HUB_PATH,
    },
    {
      label: blog?.heading.trim() || 'Story',
    },
  ])

  const coverImage = blog
    ? resolveBlogAssetUrl(blog.cover_image_fetch_url || blog.cover_image_url)
    : ''

  usePageSeo({
    title: blog ? `${blog.heading} | ${SITE_NAME}` : `Living History Hub | ${SITE_NAME}`,
    description: blog?.description || undefined,
    canonicalPath: blog ? blogDetailPath(blog) : '/living-history-hub',
    image: coverImage ? buildAbsoluteUrl(coverImage) : undefined,
    type: 'article',
  })

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <section className={styles.blog}>
          <div className={styles.blogInner}>
            <div className={styles.blogLoading} role="status">
              Loading story...
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (status === 'error' || !blog) {
    return (
      <div className={styles.page}>
        <section className={styles.blog}>
          <div className={styles.blogInner}>
            <p className={styles.tvEyebrow}>Living History Journal</p>
            <h1 className={styles.blogArticleTitle}>Story not found</h1>
            <div className={styles.featureRule} aria-hidden="true" />
            <p className={styles.blogPara}>
              We couldn&apos;t find that story. It may have been moved or removed.
            </p>
            <Link to={HUB_PATH} className={styles.blogBack}>
              &larr; All stories
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const immersive = blogHasAnimations(blog)

  return (
    <div className={styles.page}>
      <section
        className={styles.blog}
        data-article={immersive ? 'immersive' : ''}
      >
        <div className={styles.blogInner}>
          <p className={styles.tvEyebrow}>Living History Journal</p>

          <article className={styles.blogArticle}>
            <Link to={HUB_PATH} className={styles.blogBack}>
              &larr; All stories
            </Link>

            <h1 className={styles.blogArticleTitle}>{blog.heading}</h1>
            <div className={styles.featureRule} aria-hidden="true" />

            {!immersive && coverImage && (
              <figure className={styles.blogHero}>
                <img src={coverImage} alt={blog.heading} />
              </figure>
            )}

            <LivingHistoryBlogLayout
              blog={blog}
              phase="article"
              onOpenVideo={openTheatre}
            />
          </article>
        </div>
      </section>

      {immersive && (
        <LivingHistoryBlogLayout
          blog={blog}
          phase="animations"
          onOpenVideo={openTheatre}
        />
      )}

      {blogHasPostAnimationContent(blog) && (
        <section className={`${styles.blog} ${styles.blogContinuation}`}>
          <div className={styles.blogInner}>
            <article className={styles.blogArticle}>
              <LivingHistoryBlogLayout
                blog={blog}
                phase="after-animations"
                onOpenVideo={openTheatre}
              />
            </article>
          </div>
        </section>
      )}

      <ShareStoryForm />

      {theatre &&
        (() => {
          const id = theatreId ?? ''
          if (!id) {
            return null
          }
          return (
            <div
              className={styles.theatre}
              onClick={() => setTheatre(false)}
              role="dialog"
              aria-modal="true"
              aria-label={blog.heading}
            >
              <button
                type="button"
                className={styles.theatreClose}
                onClick={() => setTheatre(false)}
                aria-label="Close theatre mode"
              >
                ×
              </button>

              <div
                className={styles.theatreFrame}
                onClick={(event) => event.stopPropagation()}
              >
                <iframe
                  className={styles.theatreIframe}
                  src={embedUrl(id)}
                  title={blog.heading}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )
        })()}
    </div>
  )
}
