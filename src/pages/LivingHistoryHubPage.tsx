import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SharedImageHero } from '../components/SharedImageHero'
import styles from './LivingHistoryHubPage.module.css'

const danPineCoverImg = '/dan-pine-family-shingwauk.jpg'

// Text blocks that scroll past the sticky photo. Each block has its own
// image, which crossfades into view as that block scrolls into focus.
const FEATURE_BLOCKS = [
  {
    img: '/tree-p1.jpg',
    alt: 'Survivors and children planting an Eastern White Pine at Shingwauk',
    title: 'Lorem Ipsum Dolor Sit Amet',
    subhead: 'Consectetur adipiscing elit sed do eiusmod',
    body:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
      'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
      'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    img: '/seedling-1.png',
    alt: 'A young Eastern White Pine seedling',
    title: 'Duis Aute Irure Dolor',
    subhead: 'In reprehenderit in voluptate velit',
    body:
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
      'deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus ' +
      'error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.',
  },
  {
    img: '/seedling-singleleaf.png',
    alt: 'A single pine frond — the lost monument',
    title: 'Nemo Enim Ipsam',
    subhead: 'Voluptatem quia voluptas sit aspernatur',
    body:
      'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis ' +
      'praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias ' +
      'excepturi sint occaecati cupiditate non provident.',
  },
  {
    img: '/seedling-pine.png',
    alt: 'A young pine taking root',
    effect: 'zoomPan',
    title: 'Temporibus Autem Quibusdam',
    subhead: 'Et aut officiis debitis aut rerum',
    body:
      'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis ' +
      'voluptatibus maiores alias consequatur aut perferendis doloribus asperiores ' +
      'repellat. Nam libero tempore, cum soluta nobis est eligendi optio cumque.',
  },
]

export function LivingHistoryHubPage() {
  const { t } = useTranslation()

  // Which feature text block is currently in focus → drives sticky-image crossfade
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeBlock, setActiveBlock] = useState(0)

  // Final reveal: everything (crossfade, header fade, flight, text) is driven
  // by scroll progress, so it plays forward scrolling down and reverses on the
  // way back up. slotA/slotB are layout placeholders; flyRef is a fixed element
  // whose geometry interpolates between them.
  const slotARef      = useRef<HTMLDivElement>(null)
  const slotBRef      = useRef<HTMLDivElement>(null)
  const flyRef        = useRef<HTMLDivElement>(null)
  const detailRef     = useRef<HTMLDivElement>(null)
  const revealTextRef = useRef<HTMLDivElement>(null)
  const pineRef       = useRef<HTMLImageElement>(null)
  const realRef       = useRef<HTMLImageElement>(null)

  usePageBreadcrumbs([
    {
      label: t('site.breadcrumbs.ourStory'),
      href: '/our-story',
    },
    {
      label: 'Living History Hub',
    },
  ])

  // Track which feature text block is centred in the viewport → crossfade image
  useEffect(() => {
    const blocks = blockRefs.current.filter(Boolean) as HTMLDivElement[]
    if (!blocks.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = blockRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) setActiveBlock(idx)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    blocks.forEach((b) => observer.observe(b))
    return () => observer.disconnect()
  }, [])

  // Drive the whole final reveal from scroll progress (reversible / replayable)
  useEffect(() => {
    const fly    = flyRef.current
    const slotA  = slotARef.current
    const slotB  = slotBRef.current
    const detail = detailRef.current
    const intro  = revealTextRef.current
    const pine   = pineRef.current
    const real   = realRef.current
    if (!fly || !slotA || !slotB) return

    const lerp = (a: number, b: number, f: number) => a + (b - a) * f
    // smoothstep — eased 0→1 between edges a and b
    const ss = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
      return t * t * (3 - 2 * t)
    }

    let raf = 0
    const update = () => {
      raf = 0
      const aRect = slotA.getBoundingClientRect()
      const bRect = slotB.getBoundingClientRect()

      // Progress: 0 when slotA is centred in the viewport, 1 when slotB is.
      const vpCenter = window.innerHeight / 2
      const aCenter  = aRect.top + aRect.height / 2
      const bCenter  = bRect.top + bRect.height / 2
      const span     = aCenter - bCenter
      const f = span !== 0
        ? Math.min(1, Math.max(0, (aCenter - vpCenter) / span))
        : 0

      // Interpolate the fixed photo between the two slots' live positions
      fly.style.left   = `${lerp(aRect.left,   bRect.left,   f)}px`
      fly.style.top    = `${lerp(aRect.top,    bRect.top,    f)}px`
      fly.style.width  = `${lerp(aRect.width,  bRect.width,  f)}px`
      fly.style.height = `${lerp(aRect.height, bRect.height, f)}px`

      // Intro header fades out early
      if (intro) intro.style.opacity = String(1 - ss(0.02, 0.2, f))
      // Sketch → real crossfade (still early, near section A)
      if (pine) pine.style.opacity = String(1 - ss(0.06, 0.28, f))
      if (real) real.style.opacity = String(ss(0.1, 0.32, f))

      // Shadow grows as it approaches its resting place
      const s = ss(0.4, 0.85, f)
      fly.style.boxShadow = `0 ${24 * s}px ${50 * s}px rgba(26, 18, 8, ${0.32 * s})`

      // Text column fades in near the end of the flight
      if (detail) detail.style.opacity = String(ss(0.6, 0.9, f))
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className={styles.page}>
      <SharedImageHero
        eyebrow="Living History Hub"
        title="The Memory in the Soil"
        description="A Chronology of the Shingwauk Awakening"
        backgroundImageUrl={danPineCoverImg}
        backgroundPosition="center center"
      />

      {/* ── Feature section: sticky photo, scrolling text blocks ── */}
      <section className={styles.feature}>
        <div className={styles.featureInner}>
          {/* Sticky photo — stays in view while the text scrolls past.
              All block images are stacked; the active one crossfades in. */}
          <div className={styles.featureSticky}>
            <div className={styles.featureImageWrap}>
              {FEATURE_BLOCKS.map((block, i) => {
                const isActive = i === activeBlock
                const zoomPan = block.effect === 'zoomPan' && isActive
                return (
                  <img
                    key={i}
                    src={block.img}
                    alt={isActive ? block.alt : ''}
                    className={`${styles.featureImage} ${zoomPan ? styles.zoomPan : ''}`}
                    style={{ opacity: isActive ? 1 : 0 }}
                    aria-hidden={!isActive}
                  />
                )
              })}
            </div>
          </div>

          {/* Scrolling text blocks */}
          <div className={styles.featureBlocks}>
            {FEATURE_BLOCKS.map((block, i) => (
              <div
                key={i}
                ref={el => { blockRefs.current[i] = el }}
                className={styles.featureBlock}
              >
                <h2 className={styles.featureTitle}>{block.title}</h2>
                <div className={styles.featureRule} aria-hidden="true" />
                <p className={styles.featureSubhead}>{block.subhead}</p>
                <p className={styles.featureBody}>{block.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section A: sketch → real photo crossfade (centred) ── */}
      <section className={styles.flyStart}>
        <div ref={revealTextRef} className={styles.revealText}>
          <h2 className={styles.centeredTitle}>Lorem Ipsum Dolor Sit Amet</h2>
          <div className={styles.centeredRule} aria-hidden="true" />
          <p className={styles.centeredSubhead}>
            Consectetur adipiscing elit sed do eiusmod tempor
          </p>
        </div>
        {/* Placeholder defining the photo's starting position */}
        <div ref={slotARef} className={styles.flySlot} aria-hidden="true" />
      </section>

      {/* ── Section B: text column + photo lands on the right ── */}
      <section className={styles.flyEnd}>
        <div className={styles.flyEndInner}>
          <div ref={detailRef} className={styles.flyDetail}>
            <h2 className={styles.featureTitle}>Lorem Ipsum Dolor Sit Amet</h2>
            <div className={styles.featureRule} aria-hidden="true" />
            <p className={styles.featureSubhead}>
              Consectetur adipiscing elit sed do eiusmod
            </p>
            <p className={styles.featureBody}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat.
            </p>
            <a href="#" className={styles.revealButton}>Learn More</a>
          </div>
          {/* Placeholder defining the photo's landing position */}
          <div ref={slotBRef} className={styles.flySlot} aria-hidden="true" />
        </div>
      </section>

      {/* The flying photo — fixed, geometry interpolated between the slots */}
      <div ref={flyRef} className={styles.flyImage} aria-hidden="true">
        <img
          ref={pineRef}
          src="/final-pine.png"
          alt=""
          className={`${styles.revealImage} ${styles.revealPine}`}
        />
        <img
          ref={realRef}
          src="/final-pine-real.png"
          alt=""
          className={`${styles.revealImage} ${styles.revealReal}`}
        />
      </div>
    </div>
  )
}
