import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SharedImageHero } from '../components/SharedImageHero'
import styles from './LivingHistoryHubPage.module.css'

const danPineCoverImg = '/dan-pine-family-shingwauk.jpg'

// Archive Reel carousel — add more entries to grow the (infinite) carousel.
// sddefault is used because maxresdefault doesn't exist for every upload.
const VIDEOS = [
  {
    id: 'fsVfckxA0RQ',
    title: 'The Story in Motion',
    desc: 'An introduction to the living history of Shingwauk: the people, the place, and the memories that endure.',
  },
  {
    id: 'ftkjsjHE9yY',
    title: 'Shirley: A Residential School Story',
    desc: 'Shirley Horn shares her residential school story on The Human Challenge: healing, culture, and a longing for language.',
  },
  {
    id: 'PQNA9vqP42g',
    title: 'Tree Planting, 1981 Shingwauk Reunion',
    desc: 'Survivors gather to plant an Eastern White Pine, turning grief into a living monument to the children.',
  },
  {
    id: 'ROSWdtjCTHI',
    title: 'Mike Cachagee at the Shingwauk 1981 Reunion',
    desc: 'Survivor and CSAA founder Mike Cachagee reflects on returning to Shingwauk and why this reunion mattered.',
  },
  {
    id: 'oXoru1Nu72U',
    title: 'Daisy Diamond Kostus Interview',
    desc: 'Daisy Diamond Kostus shares her memories of the school and the community that carried her through.',
  },
  {
    id: 'YSQ-1CugiuU',
    title: 'Mike Cachagee Shingwauk 1981 Reunion, Part 2',
    desc: 'Mike Cachagee continues his story, on remembrance, resilience, and the road toward healing.',
  },
  {
    id: 'lGj9BK1W4hM',
    title: 'Shirley Roach, Calvin Corbiere & Lindsay Sword, 1981 Reunion',
    desc: 'Three Survivors recall their years at Shingwauk and the bonds that reunited them decades later.',
  },
  {
    id: '1OjR5MZtZFo',
    title: 'Don and Nellie Sands',
    desc: 'Don and Nellie Sands speak to family, language, and keeping culture alive across generations.',
  },
  {
    id: 'bOF9pkkfzj0',
    title: 'Jack White at Shingwauk Reunion',
    desc: 'Jack White remembers the reunion and the importance of telling these stories in his own words.',
  },
]
// hqdefault is the largest size available for *every* upload (sddefault/maxres
// are missing for some), so it's the safest choice for the carousel thumbnails.
// Beyond this many videos the list collapses behind a "See more" toggle,
// then becomes a fixed-height scrollable list.
const ARCHIVE_VISIBLE = 6
const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
const embedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`

// In-page "Living History Journal" blog. Each post opens an article in place.
const TREE_PLANTING_BODY = [
  'In 1981, Survivors of the Shingwauk Indian Residential School returned to the grounds for the first reunion. Among the prayers, the feasts, and the reunions of old friends came a quiet, deliberate act of reclamation: the planting of an Eastern White Pine, the tree of Chief Shingwaukonse, as a living monument to the children who never made it home.',
  'What followed was not a single moment but a story that unfolded across decades, of a tree planted, lost, and planted again, and of a community that refused to let the memory be erased.',
]
const DAN_PINE_BODY = [
  'In the early nineteenth century, the Anishinaabe leader Chief Shingwaukonse, known as "Little Pine," walked and paddled great distances to advocate for his people. He carried a vision of a "teaching wigwam": a place where Anishinaabe children could gain the knowledge of the newcomers while remaining rooted in their own language, land, and ways of knowing.',
  'A school was eventually built in Sault Ste. Marie and given his name. But the institution that became the Shingwauk Indian Residential School betrayed that vision entirely. For nearly a century, children were taken from their families and punished for speaking their language and practising their culture. The name of a man who fought for his people came to mark one of the places where so much was taken from them.',
  'Through those years and after, Elder Dan Pine Sr. of Garden River First Nation stood as a keeper of Anishinaabe knowledge, a respected healer and teacher who quietly held the ceremonies, medicines, and teachings the schools sought to erase. His presence, and that of his family, became a thread of continuity that connected the old vision of Little Pine to the survivors who would one day return.',
  'When Survivors gathered at Shingwauk in 1981, they came not only to remember what had happened, but to reclaim the ground itself. From that gathering grew a simple, powerful act: the planting of a pine, the tree of Shingwaukonse, as a living monument to the children.',
]
const SHIRLEY_BODY = [
  `A special episode of The Human Challenge features Shirley Horn, in an episode titled "Shirley: A Residential School Story."`,
  `As we mark National Indigenous Languages Day on Turtle Island, Shirley Horn shares her residential school story, growing up in not one, but two residential schools. She would return years later to Shingwauk Hall after it became a university to pursue her education, become first chancellor, and then Chief of the Missanabie to help return land back to her community.`,
  `In this touching episode, Shirley talks about her life healing the trauma that came with the residential school system, reconnecting with Indigenous culture, and her longing for Indigenous language. Learn more about her life in a new children's book, "Shirley: An Indian Residential School Story," written by Joanne Robertson. Available now!`,
  `Special thank you to the Children of Shingwauk Alumni Association and Algoma University. This episode was recorded in The Elder Room at the Shingwauk Anishinaabe Students Lounge at Algoma University. Cinematography by Shae Mclurg.`,
]
const BLOG_POSTS = [
  {
    id: 'shirley-story',
    date: 'March 2026',
    author: 'The Human Challenge',
    title: 'Shirley: A Residential School Story',
    excerpt:
      'Shirley Horn shares her residential school story: healing, reconnecting with culture, and a longing for language.',
    image: '/shirley-podcast.jpg',
    caption:
      'Shirley Horn on The Human Challenge, recorded in The Elder Room at the Shingwauk Anishinaabe Students Lounge, Algoma University.',
    videoId: 'ftkjsjHE9yY',
    body: SHIRLEY_BODY,
  },
  {
    id: 'dan-pine',
    date: 'June 2026',
    author: 'Community Support Team',
    title: 'Dan Pine & the Pine Trees',
    excerpt:
      "Little Pine's vision, Elder Dan Pine Sr., and the pines planted by Survivors as a living monument to the children.",
    image: '/dan-pine-family-shingwauk.jpg',
    caption:
      'The Dan Pine family at the Shingwauk Residential Schools Centre, Algoma University.',
    videoId: 'fsVfckxA0RQ',
    body: DAN_PINE_BODY,
  },
  {
    id: 'tree-planting',
    date: 'May 2026',
    author: 'Community Support Team',
    title: 'The Tree Planting',
    excerpt:
      'The 1981 planting of an Eastern White Pine, a tree planted, lost, and planted again, as a living monument to the children.',
    image: '/tree-p1.jpg',
    caption: '',
    videoId: 'PQNA9vqP42g',
    body: TREE_PLANTING_BODY,
  },
]

// Text blocks that scroll past the sticky photo. Each block has its own
// image, which crossfades into view as that block scrolls into focus.
const FEATURE_BLOCKS = [
  {
    img: '/tree-p1.jpg',
    alt: 'Survivors and children planting an Eastern White Pine at Shingwauk',
    title: 'The First Root',
    subhead: 'Shingwauk Reunion · 1981',
    body:
      'At the first Shingwauk reunion, Survivors planted an Eastern White Pine, the tree of ' +
      'Chief Shingwaukonse, whose name means "Little Pine." Hands that had been taken as ' +
      'children returned to place a living promise in the ground: that those who were lost ' +
      'would be remembered, and those who endured would be honoured.',
  },
  {
    img: '/seedling-1.png',
    alt: 'A young Eastern White Pine seedling',
    title: 'Taking Root',
    subhead: 'A fragile beginning',
    body:
      'A seedling is a small, stubborn act of hope. Like the community gathered around it, ' +
      'the young pine had to find its footing in disturbed ground, drawing on deep roots, ' +
      'shared care, and the seasons to grow into something lasting.',
  },
  {
    img: '/seedling-singleleaf.png',
    alt: 'A single pine frond, the lost monument',
    title: 'Torn From the Soil',
    subhead: 'The lost monument',
    body:
      'The original pine did not survive. Campus expansion brought machinery that could not ' +
      'read the history embedded in the land, and the tree was destroyed. The loss echoed an ' +
      'older wound, but the roots of remembrance ran deeper than the soil that was disturbed.',
  },
  {
    img: '/seedling-pine.png',
    alt: 'A young pine taking root',
    effect: 'zoomPan',
    title: 'Planted Again',
    subhead: 'Resilience, ten years on',
    body:
      'In 1991, undeterred, the community returned and planted again, this time two Eastern ' +
      'White Pines beside the stone marker of the 1874 school foundation. Two trees, two ' +
      'intertwined root systems, planted so the memory could never again be erased.',
  },
]

export function LivingHistoryHubPage() {
  const { t } = useTranslation()

  // Which feature text block is currently in focus → drives sticky-image crossfade
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeBlock, setActiveBlock] = useState(0)

  // TV that flies from centred (tvSection) into the right slot of tvLand
  const tvSlotARef = useRef<HTMLDivElement>(null)
  const tvSlotBRef = useRef<HTMLDivElement>(null)
  const tvFlyRef   = useRef<HTMLDivElement>(null)

  // Archive Reel carousel: reveal-on-scroll + click-to-play + infinite nav
  const videoRef = useRef<HTMLElement>(null)
  const [videoVisible, setVideoVisible] = useState(false)
  const [videoIndex, setVideoIndex] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [theatre, setTheatre] = useState(false)
  const [theatreId, setTheatreId] = useState<string | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveExpanded, setArchiveExpanded] = useState(false)
  const [openPost, setOpenPost] = useState<string | null>(null)
  const [articlePlaying, setArticlePlaying] = useState(false)
  const [contributeSent, setContributeSent] = useState(false)
  const blogRef = useRef<HTMLDivElement>(null)

  const openTheatre = (id: string) => { setTheatreId(id); setTheatre(true) }
  const post = BLOG_POSTS.find((p) => p.id === openPost) ?? null

  // Open a post → reset its inline video and jump to the top of the article
  const showPost = (id: string) => {
    setOpenPost(id)
    setArticlePlaying(false)
    requestAnimationFrame(() =>
      blogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  const playActive = () => {
    setVideoPlaying(true)
    setVideoLoading(true) // cleared by the iframe's onLoad
  }

  const goToVideo = (i: number) => {
    setVideoPlaying(false)
    setVideoLoading(false)
    // wrap-around for an "infinite" carousel
    setVideoIndex((i + VIDEOS.length) % VIDEOS.length)
  }

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

  // Auto-advance the carousel — pauses while a video plays, the archive list
  // is open, or the section is off-screen; resets when the slide changes.
  useEffect(() => {
    if (VIDEOS.length < 2 || !videoVisible || videoPlaying || archiveOpen) return
    const id = window.setInterval(() => {
      setVideoIndex((c) => (c + 1) % VIDEOS.length)
    }, 6000)
    return () => window.clearInterval(id)
  }, [videoVisible, videoPlaying, videoIndex, archiveOpen])

  // Fly the TV from its centred slot into the right slot of the next section
  useEffect(() => {
    const fly   = tvFlyRef.current
    const slotA = tvSlotARef.current
    const slotB = tvSlotBRef.current
    if (!fly || !slotA || !slotB) return

    // On mobile the TV is a single static section — no fly animation.
    if (window.matchMedia('(max-width: 768px)').matches) return

    const lerp = (a: number, b: number, f: number) => a + (b - a) * f

    let raf = 0
    const update = () => {
      raf = 0
      const aRect = slotA.getBoundingClientRect()
      const bRect = slotB.getBoundingClientRect()

      const vpCenter = window.innerHeight / 2
      const aCenter  = aRect.top + aRect.height / 2
      const bCenter  = bRect.top + bRect.height / 2
      const span     = aCenter - bCenter
      const f = span !== 0
        ? Math.min(1, Math.max(0, (aCenter - vpCenter) / span))
        : 0

      fly.style.left   = `${lerp(aRect.left,   bRect.left,   f)}px`
      fly.style.top    = `${lerp(aRect.top,    bRect.top,    f)}px`
      fly.style.width  = `${lerp(aRect.width,  bRect.width,  f)}px`
      fly.style.height = `${lerp(aRect.height, bRect.height, f)}px`

      // Video content only reveals once the TV nears the landing section
      const reveal = Math.max(0, Math.min(1, (f - 0.4) / 0.4))
      fly.style.setProperty('--reveal', reveal.toFixed(3))
    }

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Close theatre mode on Escape
  useEffect(() => {
    if (!theatre) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTheatre(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [theatre])

  // Mid-pan snapping: nudging into the pan zone glides the TV to the nearest
  // end — scroll down → landing section; scroll up → initial centred state.
  useEffect(() => {
    const slotA = tvSlotARef.current
    const slotB = tvSlotBRef.current
    if (!slotA || !slotB) return
    if (window.matchMedia('(max-width: 768px)').matches) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let lastY = window.scrollY
    let cooldownUntil = 0
    let raf = 0

    const snapTo = (el: HTMLElement) => {
      cooldownUntil = performance.now() + 900 // ignore events during the glide
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }

    const check = () => {
      raf = 0
      const now = performance.now()
      const y = window.scrollY
      const goingDown = y > lastY
      lastY = y
      if (now < cooldownUntil) return

      const aR = slotA.getBoundingClientRect()
      const bR = slotB.getBoundingClientRect()
      const vc = window.innerHeight / 2
      const aC = aR.top + aR.height / 2
      const bC = bR.top + bR.height / 2
      const span = aC - bC
      if (span === 0) return

      // f: 0 = initial (TV centred in intro), 1 = landed
      const f = (aC - vc) / span
      if (f > 0.12 && f < 0.88) {
        snapTo(goingDown ? slotB : slotA)
      }
    }

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Reveal the Archive Reel as it scrolls into view
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVideoVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
    // re-attach when the Tree Planting article mounts/unmounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPost])

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
    // re-attach when the Tree Planting article mounts/unmounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPost])

  return (
    <div className={styles.page}>
      <SharedImageHero
        eyebrow="Living History Hub"
        title="The Memory in the Soil"
        description="A Chronology of the Shingwauk Awakening"
        backgroundImageUrl={danPineCoverImg}
        backgroundPosition="center center"
        waveColor="#faf7f2"
      />

      {/* ── Retro TV — centred, with intro copy (start of the fly) ── */}
      <section className={styles.tvSection}>
        <div className={styles.tvIntro}>
          <p className={styles.tvEyebrow}>Living Memory</p>
          <h2 className={styles.tvIntroTitle}>Stories are better told together</h2>
          <p className={styles.tvIntroBody}>
            Some truths are carried not in textbooks, but in voices, in the
            people who lived them. Pull up a chair and listen as Survivors and
            Elders share the memories that keep this history alive.
          </p>
        </div>
        <div ref={tvSlotARef} className={styles.tvSlot} aria-hidden="true" />
      </section>

      {/* ── TV lands into the right space; text + carousel controls on the left ── */}
      <section ref={videoRef} className={styles.tvLand} data-archive-open={archiveOpen}>
        <div className={styles.tvLandInner}>
          <div className={styles.tvLandText}>
            {/* Default: heading, copy, button, carousel controls */}
            <div className={styles.tvDefault} aria-hidden={archiveOpen}>
              <p className={styles.tvEyebrow}>Watch · In Their Words</p>
              <h2 key={videoIndex} className={`${styles.featureTitle} ${styles.tvTitleFade}`}>
                {VIDEOS[videoIndex].title}
              </h2>
              <div className={styles.featureRule} aria-hidden="true" />
              <p className={styles.featureBody}>{VIDEOS[videoIndex].desc}</p>
              <button type="button" className={styles.revealButton} onClick={playActive}>
                Watch on the TV
              </button>

              {VIDEOS.length > 1 && (
                <div className={styles.tvControls}>
                  <button
                    type="button"
                    className={styles.tvNav}
                    onClick={() => goToVideo(videoIndex - 1)}
                    aria-label="Previous video"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className={styles.tvDots}>
                    {VIDEOS.map((v, i) => (
                      <button
                        key={v.id}
                        type="button"
                        className={styles.tvDot}
                        data-active={i === videoIndex}
                        onClick={() => goToVideo(i)}
                        aria-label={`Go to ${v.title}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.tvNav}
                    onClick={() => goToVideo(videoIndex + 1)}
                    aria-label="Next video"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Archive: list of videos, replaces the copy when open */}
            <div className={styles.tvArchive} aria-hidden={!archiveOpen}>
              <div className={styles.tvArchiveHead}>
                <p className={styles.tvEyebrow}>Archive Tapes</p>
                <button
                  type="button"
                  className={styles.tvArchiveClose}
                  onClick={() => { setArchiveOpen(false); setArchiveExpanded(false) }}
                  aria-label="Close list and return to overview"
                >
                  ×
                </button>
              </div>
              <ul
                className={styles.archiveList}
                data-scroll={VIDEOS.length > ARCHIVE_VISIBLE && archiveExpanded}
              >
                {(archiveExpanded ? VIDEOS : VIDEOS.slice(0, ARCHIVE_VISIBLE)).map((v, i) => (
                  <ArchiveItem
                    key={v.id}
                    video={v}
                    index={i}
                    active={i === videoIndex}
                    onSelect={() => goToVideo(i)}
                  />
                ))}
              </ul>
              {VIDEOS.length > ARCHIVE_VISIBLE && (
                <button
                  type="button"
                  className={styles.archiveSeeMore}
                  onClick={() => setArchiveExpanded((e) => !e)}
                  aria-expanded={archiveExpanded}
                >
                  {archiveExpanded ? 'See less' : `See more (${VIDEOS.length - ARCHIVE_VISIBLE})`}
                </button>
              )}
            </div>
          </div>
          {/* Landing slot holds the TV. Desktop: TV is fixed & flies into it.
              Mobile: TV sits statically inside it (single section). */}
          <div ref={tvSlotBRef} className={styles.tvSlot}>
            <div ref={tvFlyRef} className={styles.tvFly}>
              <img src="/tv-model.svg" alt="Vintage television" className={styles.tvFrameImg} />
              <div className={styles.tvScreen}>
                {/* Video content — only revealed once the TV lands (var --reveal) */}
                <div className={styles.tvScreenContent}>
                {/* Thumbnails stacked & crossfaded; active one is clickable */}
                {VIDEOS.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    className={styles.videoFacade}
                    data-active={i === videoIndex && !videoPlaying}
                    style={{ backgroundImage: `url(${thumbUrl(v.id)})` }}
                    onClick={() => i === videoIndex && playActive()}
                    aria-label={`Play ${v.title}`}
                    aria-hidden={i !== videoIndex}
                    tabIndex={i === videoIndex ? 0 : -1}
                  >
                    <span className={styles.videoPlay} aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="26" height="26">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                      </svg>
                    </span>
                  </button>
                ))}

                {/* Active video plays on top once clicked */}
                {videoPlaying && (
                  <iframe
                    className={styles.videoIframe}
                    src={embedUrl(VIDEOS[videoIndex].id)}
                    title={VIDEOS[videoIndex].title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setVideoLoading(false)}
                  />
                )}

                {/* Retro "tuning in" loader until the iframe is ready */}
                {videoPlaying && videoLoading && (
                  <div className={styles.tvLoader} aria-hidden="true">
                    <span className={styles.tvLoaderRing} />
                    <span className={styles.tvLoaderText}>Tuning in…</span>
                  </div>
                )}
                </div>{/* /tvScreenContent */}
              </div>

              {/* Button row — Theatre + Archive, aligned together */}
              <div className={styles.tvBtnRow}>
                <button
                  type="button"
                  className={styles.theatreBtn}
                  onClick={() => openTheatre(VIDEOS[videoIndex].id)}
                  aria-label="Open in theatre mode"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                    <path
                      d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"
                      fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                  Theatre Mode
                </button>
                <button
                  type="button"
                  className={styles.archiveBtn}
                  data-active={archiveOpen}
                  onClick={() => setArchiveOpen((o) => !o)}
                  aria-pressed={archiveOpen}
                  aria-label="Toggle archive tape list"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Archive Tapes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Living History Journal — in-page blog ── */}
      <section ref={blogRef} className={styles.blog} data-article={openPost ?? ''}>
        <div className={styles.blogInner}>
          <p className={styles.tvEyebrow}>Living History Journal</p>

          {post ? (
            <article className={styles.blogArticle}>
              <button
                type="button"
                className={styles.blogBack}
                onClick={() => setOpenPost(null)}
              >
                ← All stories
              </button>
              <h2 className={styles.blogArticleTitle}>{post.title}</h2>
              <div className={styles.featureRule} aria-hidden="true" />
              {post.id === 'tree-planting' ? (
                <>
                  <div className={styles.blogVideo}>
                    {articlePlaying ? (
                      <iframe
                        src={embedUrl(post.videoId)}
                        title={post.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <button
                        type="button"
                        className={styles.blogVideoFacade}
                        style={{ backgroundImage: `url(${thumbUrl(post.videoId)})` }}
                        onClick={() => setArticlePlaying(true)}
                        aria-label={`Play ${post.title}`}
                      >
                        <span className={styles.videoPlay} aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="26" height="26">
                            <path d="M8 5v14l11-7z" fill="currentColor" />
                          </svg>
                        </span>
                      </button>
                    )}
                  </div>
                  <p className={styles.blogPara}>
                    In 1981, Survivors of the Shingwauk Indian Residential School
                    returned to the grounds for the first reunion. Among the
                    prayers, the feasts, and the reunions of old friends came a
                    quiet, deliberate act of reclamation: the planting of an
                    Eastern White Pine, the tree of Chief Shingwaukonse, as a
                    living monument to the children who never made it home.
                  </p>
                  <p className={styles.blogPara}>
                    What followed was not a single moment but a story that unfolded
                    across decades, of a tree planted, lost, and planted again, and
                    of a community that refused to let the memory be erased. Scroll
                    on to follow the story of the pine, from the first root to the
                    trees that stand at Shingwauk today.
                  </p>
                </>
              ) : (
                <>
                  <figure className={styles.blogHero}>
                    <img src={post.image} alt={post.title} />
                    {post.caption && <figcaption>{post.caption}</figcaption>}
                  </figure>
                  {post.body.map((para, i) => (
                    <p key={i} className={styles.blogPara}>{para}</p>
                  ))}
                  <button
                    type="button"
                    className={styles.revealButton}
                    onClick={() => openTheatre(post.videoId)}
                  >
                    ▶ Watch the feature
                  </button>
                </>
              )}
            </article>
          ) : (
            <>
              <h2 className={styles.blogHeading}>Stories &amp; Editions</h2>
              <div className={styles.featureRule} aria-hidden="true" />
              <div className={styles.blogGrid}>
                {BLOG_POSTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.blogCard}
                    onClick={() => showPost(p.id)}
                  >
                    <span
                      className={styles.blogCardImg}
                      style={{ backgroundImage: `url(${p.image})` }}
                      aria-hidden="true"
                    />
                    <span className={styles.blogCardBody}>
                      <span className={styles.blogCardDate}>{p.date}</span>
                      <span className={styles.blogCardTitle}>{p.title}</span>
                      <span className={styles.blogCardExcerpt}>{p.excerpt}</span>
                      <span className={styles.blogCardLink}>Read story →</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══ Tree Planting article body: the immersive scrollytelling ══ */}
      {post?.id === 'tree-planting' && (<>
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
          <h2 className={styles.centeredTitle}>Living Memory</h2>
          <div className={styles.centeredRule} aria-hidden="true" />
          <p className={styles.centeredSubhead}>
            The pine that stands at Shingwauk today
          </p>
        </div>
        {/* Placeholder defining the photo's starting position */}
        <div ref={slotARef} className={styles.flySlot} aria-hidden="true" />
      </section>

      {/* ── Section B: text column + photo lands on the right ── */}
      <section className={styles.flyEnd}>
        <div className={styles.flyEndInner}>
          <div ref={detailRef} className={styles.flyDetail}>
            <h2 className={styles.featureTitle}>Still Standing Today</h2>
            <div className={styles.featureRule} aria-hidden="true" />
            <p className={styles.featureSubhead}>
              Twin pines beside the 1874 foundation
            </p>
            <p className={styles.featureBody}>
              What began as a hand-drawn memory is now rooted in the earth at Algoma
              University. The Eastern White Pines planted by Survivors continue to
              grow beside the stone marker, a living reminder that this history is
              carried forward, season after season.
            </p>
            <Link to="/our-story/healing-memorials" className={styles.revealButton}>
              Healing &amp; Memorials
            </Link>
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
      </>)}

      {/* ── Post footer: posted-by attribution at the end of an article ── */}
      {post && (
        <div className={styles.blogFooter}>
          <div className={styles.blogFooterInner}>
            Posted by {post.author} · {post.date}
          </div>
        </div>
      )}

      {/* ── Contribute: form to submit a post or video (under every view) ── */}
      {(
        <section className={styles.contribute}>
          <div className={styles.contributeInner}>
            <p className={styles.tvEyebrow}>Share Your Story</p>
            <h2 className={styles.contributeTitle}>Add to the Living History</h2>
            <div className={styles.featureRule} aria-hidden="true" />
            <p className={styles.contributeLead}>
              Have a story, a memory, or a video you'd like to share? Tell us a
              little about it and our team will reach out to help you add it to
              the Living History Hub.
            </p>

            {contributeSent ? (
              <div className={styles.contributeThanks} role="status">
                <strong>Miigwetch — thank you.</strong>
                <p>We've received your submission and will be in touch soon.</p>
              </div>
            ) : (
              <form
                className={styles.contributeForm}
                onSubmit={(e) => { e.preventDefault(); setContributeSent(true) }}
              >
                <div className={styles.formRow}>
                  <label className={styles.formField}>
                    <span>Name</span>
                    <input type="text" name="name" required autoComplete="name" />
                  </label>
                  <label className={styles.formField}>
                    <span>Email</span>
                    <input type="email" name="email" required autoComplete="email" />
                  </label>
                </div>
                <div className={styles.formRow}>
                  <label className={styles.formField}>
                    <span>Phone (optional)</span>
                    <input type="tel" name="phone" autoComplete="tel" />
                  </label>
                  <label className={styles.formField}>
                    <span>I'd like to submit</span>
                    <select name="type" defaultValue="post">
                      <option value="post">A written post / story</option>
                      <option value="video">A video</option>
                      <option value="both">Both a post and a video</option>
                    </select>
                  </label>
                </div>
                <label className={styles.formField}>
                  <span>Tell us about it</span>
                  <textarea name="message" rows={5} required />
                </label>
                <button type="submit" className={styles.revealButton}>
                  Submit
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* ── Theatre mode overlay ── */}
      {theatre && (() => {
        const tId = theatreId ?? VIDEOS[videoIndex].id
        const tTitle = VIDEOS.find((v) => v.id === tId)?.title ?? ''
        return (
        <div
          className={styles.theatre}
          onClick={() => setTheatre(false)}
          role="dialog"
          aria-modal="true"
          aria-label={tTitle}
        >
          <button
            type="button"
            className={styles.theatreClose}
            onClick={() => setTheatre(false)}
            aria-label="Close theatre mode"
          >
            ×
          </button>
          <div className={styles.theatreFrame} onClick={(e) => e.stopPropagation()}>
            <iframe
              className={styles.theatreIframe}
              src={embedUrl(tId)}
              title={tTitle}
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

// ── Archive list item: title selects the video; + slides its description ──
function ArchiveItem({
  video,
  index,
  active,
  onSelect,
}: {
  video: (typeof VIDEOS)[number]
  index: number
  active: boolean
  onSelect: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <li className={styles.archiveItem} data-active={active}>
      <div className={styles.archiveItemRow}>
        <button type="button" className={styles.archiveItemTitle} onClick={onSelect}>
          <span className={styles.archiveItemNo}>{String(index + 1).padStart(2, '0')}</span>
          <span>{video.title}</span>
        </button>
        <button
          type="button"
          className={styles.archivePlus}
          data-open={open}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Hide description' : 'Show description'}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className={styles.archiveDesc} data-open={open}>
        <p>{video.desc}</p>
      </div>
    </li>
  )
}
