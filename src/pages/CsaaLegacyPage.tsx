/**
 * CSAA Legacy — Scene 1 GSAP scrollytelling, Scenes 2 & 3 scroll-reveal.
 *
 * Scene 1 pattern (pinned canvas):
 *   Panel 0: text alone on clean canvas (no art yet).
 *   Panels 1–6: canvas overlay fades in → text fades in on overlay →
 *               text fades out → overlay fades out → art layer slides in (stays).
 *   Art accumulates permanently; overlay acts as a reading curtain.
 *
 * Scenes 2 & 3: IntersectionObserver fade-in reveal.
 */

import { createPortal } from 'react-dom'
import { type RefObject, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import styles from './CsaaLegacyPage.module.css'

gsap.registerPlugin(ScrollTrigger)

// ── Artwork image assets ──────────────────────────────────────────────────────
const canoeImg         = WEBSITE_ASSET_URLS.canoeVector
const trainImg         = WEBSITE_ASSET_URLS.trainVector
const planeImg         = WEBSITE_ASSET_URLS.planeVector
const modelTImg        = WEBSITE_ASSET_URLS.modelTVector
const buggyImg         = WEBSITE_ASSET_URLS.buggyVector
const schoolImg        = WEBSITE_ASSET_URLS.irsVectorPng
const scene2Img        = WEBSITE_ASSET_URLS.returnHomeVector
const scene3Img        = WEBSITE_ASSET_URLS.rememberVector
const shirleySignature = WEBSITE_ASSET_URLS.shirleySignature
const shingwaukHeroImg = WEBSITE_ASSET_URLS.shingwaukHallHero
const drHornImg        = WEBSITE_ASSET_URLS.drShirleyHorn

// ── Hotspot types ─────────────────────────────────────────────────────────────
/**
 * x / y are percentages of the *image's own* pixel dimensions (not the wrapper).
 * Used by S2, S3, and — via layer rect — S1.
 */
type Hotspot  = { id: string; x: string; y: string; title: string; body: string }
type ImageRect = { left: number; top: number; width: number; height: number }

// ── Scene 1 ───────────────────────────────────────────────────────────────────
/** Which art-layer image each S1 hotspot belongs to. */
type S1Layer = 'train' | 'plane' | 'school' | 'canoe' | 'modelT' | 'buggy'
type S1LayerRects = Record<S1Layer, ImageRect>

/**
 * x / y are % within the specific art-layer image.
 * callout controls which side the tooltip opens on.
 */
type S1Hotspot = Hotspot & {
  layer: S1Layer
  callout: 'right' | 'left'
}

const S1_HOTSPOTS: S1Hotspot[] = [
  {
    id: 's1-train',
    layer: 'train',
    x: '50%', y: '60%',
    callout: 'right',
    title: 'Came by Train',
    body: 'Many children were taken hundreds of miles by train — often for the very first time — towards an unknown destination far from their families.',
  },
  {
    id: 's1-school',
    layer: 'school',
    x: '50%', y: '40%',
    callout: 'right',
    title: 'Shingwauk Hall',
    body: 'The Shingwauk Indian Residential School in Sault Ste. Marie, Ontario, operated from 1873 to 1970. Hundreds of children were held here, separated from language, family, and culture.',
  },
  {
    id: 's1-plane',
    layer: 'plane',
    x: '50%', y: '55%',
    callout: 'left',
    title: 'Came by Plane',
    body: 'Children from the most remote northern communities were flown out — a journey that felt like being taken to another world entirely.',
  },
  {
    id: 's1-canoe',
    layer: 'canoe',
    x: '50%', y: '50%',
    callout: 'left',
    title: 'Came by Canoe',
    body: 'For those living along waterways, the journey began in a canoe — paddled away from their home shores, often never to return the same way.',
  },
  {
    id: 's1-modelT',
    layer: 'modelT',
    x: '50%', y: '55%',
    callout: 'right',
    title: 'Came by Car',
    body: 'As roads reached more communities, Indian Agents arrived by automobile. Children were loaded into cars and driven away from everything familiar.',
  },
  {
    id: 's1-buggy',
    layer: 'buggy',
    x: '50%', y: '55%',
    callout: 'right',
    title: 'Came by Buggy',
    body: 'Before railways and roads, priests and government agents arrived by horse-drawn buggy — recording names and assessing communities.',
  },
]

// Positions are % of the image's own pixel dimensions (measured from the artwork directly)
const S2_HOTSPOTS: Hotspot[] = [
  {
    id: 's2-tipi',
    x: '34%', y: '37%',
    title: 'The Tipi',
    body: 'The tipi stands as a symbol of home and belonging — traditions the residential school system tried to erase but could never extinguish. It remains standing, as it always has.',
  },
  {
    id: 's2-pumpkins',
    x: '22%', y: '52%',
    title: 'The Harvest',
    body: 'Pumpkins and gathered food speak to the deep connection between the land and the people — a harvest that feeds both body and spirit.',
  },
  {
    id: 's2-house',
    x: '55%', y: '42%',
    title: 'Coming Home',
    body: 'The family cabin represents the long-awaited return — a place to rebuild, to heal, and to pass on what the schools tried so hard to take away.',
  },
  {
    id: 's2-canoe',
    x: '28%', y: '76%',
    title: 'The Canoe Returns',
    body: 'The same canoe that once carried children away now brings them home — a powerful symbol of resilience and the continuation of culture across generations.',
  },
  {
    id: 's2-water',
    x: '47%', y: '86%',
    title: 'The Water',
    body: 'Water is life. The river carries memory, cleansing, and renewal — a living witness to everything that was taken and everything that endured.',
  },
  {
    id: 's2-fish',
    x: '84%', y: '64%',
    title: 'Fish & Net',
    body: 'Traditional fishing sustained communities for millennia. The net represents an unbroken relationship with the water — a practice no school could take away.',
  },
]

// Positions are % of the image's own pixel dimensions (measured from the artwork directly)
const S3_HOTSPOTS: Hotspot[] = [
  {
    id: 's3-dreamcatcher',
    x: '54%', y: '9%',
    title: 'The Dreamcatcher',
    body: 'Hung in the window where the light passes through, the dreamcatcher filters harm and lets good spirits in — a guardian of rest, memory, and healing.',
  },
  {
    id: 's3-drum',
    x: '13%', y: '48%',
    title: 'The Drum',
    body: 'The drum is the heartbeat of the community. Forbidden in residential schools, here it reclaims its place at the table of renewal.',
  },
  {
    id: 's3-bannock',
    x: '19%', y: '59%',
    title: 'Bannock',
    body: 'Bannock is more than bread — it is a symbol of resilience and sharing, made and passed down through generations of Indigenous families.',
  },
  {
    id: 's3-harvest',
    x: '30%', y: '56%',
    title: 'The Harvest',
    body: 'Gathered nuts, berries, and roots speak to an unbroken relationship with the land — a relationship no school could sever.',
  },
  {
    id: 's3-blueberries',
    x: '49%', y: '34%',
    title: 'Blueberries',
    body: 'Blueberries hold deep cultural and medicinal significance. Their presence on the table is a quiet act of reclaiming what was always ours.',
  },
  {
    id: 's3-fish',
    x: '66%', y: '54%',
    title: 'The Fish',
    body: 'Fish has sustained communities for millennia. To share it at the feast table is to honour the water, the land, and those who came before.',
  },
  {
    id: 's3-teapot',
    x: '86%', y: '62%',
    title: 'Tea & Ceremony',
    body: 'Gathering around tea is an act of welcome — an invitation to slow down, remember, and be present with one another in healing.',
  },
  {
    id: 's3-table',
    x: '90%', y: '47%',
    title: 'Coming to the Table',
    body: 'A shared meal is an act of healing. Gathering around food reconnects community, memory, and belonging across generations.',
  },
]

// ── Wave divider ──────────────────────────────────────────────────────────────
const WAVE_PATH = 'M0,45 C400,45 450,95 700,95 C1000,95 1100,25 1300,25 C1380,25 1410,35 1440,35'
function IntroWave() {
  return (
    <div className={styles.waveDivider} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={styles.waveSvg}>
        <path d={`${WAVE_PATH} L1440,120 L0,120 Z`} fill="#f5f0e8" />
        <path d={WAVE_PATH} fill="none" stroke="#9c0000" strokeWidth="5"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

// ── Empty rects ───────────────────────────────────────────────────────────────
const EMPTY_LAYER_RECT: ImageRect = { left: 0, top: 0, width: 0, height: 0 }
const EMPTY_S1_RECTS: S1LayerRects = {
  train: EMPTY_LAYER_RECT, plane: EMPTY_LAYER_RECT, school: EMPTY_LAYER_RECT,
  canoe: EMPTY_LAYER_RECT, modelT: EMPTY_LAYER_RECT, buggy: EMPTY_LAYER_RECT,
}

/**
 * Measures each S1 art-layer image rect relative to the sticky canvas.
 * Re-runs whenever `revision` changes (pass `showHotspots` so rects are
 * remeasured after GSAP finishes its slide-in animations).
 */
function useArtLayerRects(
  canvasRef: RefObject<HTMLDivElement | null>,
  trainRef:  RefObject<HTMLImageElement | null>,
  planeRef:  RefObject<HTMLImageElement | null>,
  schoolRef: RefObject<HTMLImageElement | null>,
  canoeRef:  RefObject<HTMLImageElement | null>,
  modelTRef: RefObject<HTMLImageElement | null>,
  buggyRef:  RefObject<HTMLImageElement | null>,
  revision:  unknown,
): S1LayerRects {
  const [rects, setRects] = useState<S1LayerRects>(EMPTY_S1_RECTS)
  useEffect(() => {
    function compute() {
      const canvas = canvasRef.current
      if (!canvas) return
      const cb = canvas.getBoundingClientRect()
      const read = (img: HTMLImageElement | null): ImageRect => {
        if (!img) return EMPTY_LAYER_RECT
        const r = img.getBoundingClientRect()
        return { left: r.left - cb.left, top: r.top - cb.top, width: r.width, height: r.height }
      }
      setRects({
        train:  read(trainRef.current),
        plane:  read(planeRef.current),
        school: read(schoolRef.current),
        canoe:  read(canoeRef.current),
        modelT: read(modelTRef.current),
        buggy:  read(buggyRef.current),
      })
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(compute)
    ro.observe(canvas)
    compute()
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, revision])
  return rects
}

/**
 * Measures the actual rendered rect of an `object-fit: contain` image
 * relative to its wrapper. Works for S2 and S3 scenes.
 */
function useImageRect(
  wrapRef: RefObject<HTMLDivElement | null>,
  imgRef:  RefObject<HTMLImageElement | null>,
): ImageRect | undefined {
  const [rect, setRect] = useState<ImageRect | undefined>(undefined)
  useEffect(() => {
    function compute() {
      const wrap = wrapRef.current
      const img  = imgRef.current
      if (!wrap || !img) return
      const wb = wrap.getBoundingClientRect()
      const ib = img.getBoundingClientRect()

      // The <img> fills its box, but object-fit: contain renders the artwork
      // scaled to fit and centred inside, leaving letterbox margins. Compute
      // the *actual* rendered artwork rect so percentage-based hotspots land
      // on the artwork at any screen size / aspect ratio.
      const natW = img.naturalWidth
      const natH = img.naturalHeight
      if (!natW || !natH || !ib.width || !ib.height) return

      const scale   = Math.min(ib.width / natW, ib.height / natH)
      const renderW = natW * scale
      const renderH = natH * scale
      const offsetX = (ib.width  - renderW) / 2
      const offsetY = (ib.height - renderH) / 2

      setRect({
        left:   (ib.left - wb.left) + offsetX,
        top:    (ib.top  - wb.top)  + offsetY,
        width:  renderW,
        height: renderH,
      })
    }
    const wrap = wrapRef.current
    const img  = imgRef.current
    if (!wrap) return
    const ro = new ResizeObserver(compute)
    ro.observe(wrap)
    // naturalWidth is only available once the image has loaded
    if (img && !img.complete) img.addEventListener('load', compute)
    window.addEventListener('resize', compute)
    compute()
    return () => {
      ro.disconnect()
      if (img) img.removeEventListener('load', compute)
      window.removeEventListener('resize', compute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapRef, imgRef])
  return rect
}

// ─────────────────────────────────────────────────────────────────────────────
export function CsaaLegacyPage() {
  const { t } = useTranslation()

  usePageBreadcrumbs([
    { label: t('site.breadcrumbs.ourStory'), href: '/our-story' },
    { label: t('ourStory.legacy.csaaLegacy.title') },
  ])

  // ── Scene 1 refs ────────────────────────────────────────────────────────────
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const canvasRef      = useRef<HTMLDivElement>(null)

  // 7 text panels (panel 0 = "once upon a time" intro, panels 1–6 = one per art layer)
  const panelEls = useRef<(HTMLDivElement | null)[]>([])

  // Canvas reading overlay (fades in/out around each story panel)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Art layer refs
  const canoeRef   = useRef<HTMLImageElement>(null)
  const buggyRef   = useRef<HTMLImageElement>(null)
  const trainRef   = useRef<HTMLImageElement>(null)
  const planeRef   = useRef<HTMLImageElement>(null)
  const modelTRef  = useRef<HTMLImageElement>(null)
  const schoolRef  = useRef<HTMLImageElement>(null)

  // End-of-scene elements
  const sceneTitleRef  = useRef<HTMLHeadingElement>(null)
  const [showHotspots, setShowHotspots] = useState(false)
  const [showIdleNudge, setShowIdleNudge] = useState(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Auto-play: gently auto-scrolls a scene's track so it plays itself ──
  const [autoStarted, setAutoStarted] = useState(false)
  const [autoPlaying, setAutoPlaying] = useState(false)
  const autoRafRef = useRef<number | null>(null)
  const autoTrackRef = useRef<HTMLDivElement | null>(null)

  const playAnimation = (track: HTMLDivElement | null) => {
    if (!track) return
    // Scroll naturally so the pin engages on its own (no jump).
    autoTrackRef.current = track
    setAutoStarted(true)
    setAutoPlaying(true)
  }

  // ── Scenes 2 & 3 (GSAP scrollytelling) ──────────────────────────────────────
  const [showS2Hotspots, setShowS2Hotspots] = useState(false)
  const [showS3Hotspots, setShowS3Hotspots] = useState(false)

  const track2Ref    = useRef<HTMLDivElement>(null)
  const canvas2Ref   = useRef<HTMLDivElement>(null)
  const overlay2Ref  = useRef<HTMLDivElement>(null)
  const s2ArtWrapRef = useRef<HTMLDivElement>(null)
  const s2ImgRef     = useRef<HTMLImageElement>(null)
  const s2TitleRef   = useRef<HTMLHeadingElement>(null)
  const s2PromptRef  = useRef<HTMLDivElement>(null)
  const panelS2      = useRef<(HTMLDivElement | null)[]>([])

  const track3Ref    = useRef<HTMLDivElement>(null)
  const canvas3Ref   = useRef<HTMLDivElement>(null)
  const overlay3Ref  = useRef<HTMLDivElement>(null)
  const s3ArtWrapRef = useRef<HTMLDivElement>(null)
  const s3ImgRef     = useRef<HTMLImageElement>(null)
  const s3TitleRef   = useRef<HTMLHeadingElement>(null)
  const s3PromptRef  = useRef<HTMLDivElement>(null)
  const panelS3      = useRef<(HTMLDivElement | null)[]>([])

  // ── Image-rect derived values — accurate hotspot positioning ────────────────
  // S1: each art layer tracked individually relative to the sticky canvas
  // Pass showHotspots as the revision so rects are remeasured the moment GSAP
  // finishes its slide-in animations — before that, transforms skew the rects.
  const s1LayerRects = useArtLayerRects(
    canvasRef, trainRef, planeRef, schoolRef, canoeRef, modelTRef, buggyRef,
    showHotspots,
  )
  // S2 & S3: single object-fit:contain image per scene
  const s2ImageRect = useImageRect(s2ArtWrapRef, s2ImgRef)
  const s3ImageRect = useImageRect(s3ArtWrapRef, s3ImgRef)

  // ── Fixed signature — animated across all three scenes ────────────────────
  const fixedSigRef = useRef<HTMLDivElement>(null)

  // ── About Shirley section ref (nav reappears here) ────────────────────────
  const exitRef = useRef<HTMLElement>(null)

  // ── GSAP scene 1 timeline ───────────────────────────────────────────────────
  useEffect(() => {
    const track  = scrollTrackRef.current
    const canvas = canvasRef.current
    if (!track || !canvas) return

    // Initial states — CSS already sets artLayer opacity:0
    gsap.set(panelEls.current.filter(Boolean), { opacity: 0 })
    gsap.set(sceneTitleRef.current, { opacity: 0 })
    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(fixedSigRef.current, { opacity: 0 })

    const PANEL_IN   = 0.9
    const PANEL_HOLD = 3.2   // long dwell so readers can finish the text
    const PANEL_OUT  = 0.7
    const OVL_IN     = 0.5
    const OVL_OUT    = 0.55

    // Panel 0 only: text alone on a clean canvas (no overlay needed)
    function addPanel(tl: gsap.core.Timeline, el: HTMLDivElement | null, gap = 0.3) {
      if (!el) return
      tl.to(el, { opacity: 1, duration: PANEL_IN, ease: 'power2.inOut' }, `+=${gap}`)
        .to(el, { opacity: 0, duration: PANEL_OUT, ease: 'power2.inOut' }, `+=${PANEL_HOLD}`)
    }

    // Panels 1–6: overlay rises as a reading curtain, text appears on it,
    // then both dissolve together before the art slides in.
    function addPanelWithOverlay(
      tl: gsap.core.Timeline,
      el: HTMLDivElement | null,
      gap = 0.3,
    ) {
      if (!el) return
      const ovl = overlayRef.current
      tl.to(ovl,  { opacity: 1, duration: OVL_IN,   ease: 'power2.inOut' }, `+=${gap}`)
        .to(el,   { opacity: 1, duration: PANEL_IN,  ease: 'power2.inOut' }, `-=${OVL_IN * 0.4}`)
        .to(el,   { opacity: 0, duration: PANEL_OUT, ease: 'power2.inOut' }, `+=${PANEL_HOLD}`)
        .to(ovl,  { opacity: 0, duration: OVL_OUT,   ease: 'power2.inOut' }, `-=${PANEL_OUT * 0.5}`)
    }

    // Art layer slides in from a given direction and stays permanently
    function addArt(
      tl: gsap.core.Timeline,
      el: HTMLImageElement | null,
      from: gsap.TweenVars,
      gap = 0.15,
    ) {
      if (!el) return
      tl.fromTo(
        el,
        { opacity: 0, ...from },
        { opacity: 1, x: 0, y: 0, duration: 1.4, ease: 'power3.out' },
        `+=${gap}`,
      )
    }

    const tl = gsap.timeline()

    // ── Beat 0: Intro "Once upon a time" — clean canvas, no overlay ──────────
    addPanel(tl, panelEls.current[0], 0)

    // ── Beat 1: Canoe story → overlay in → text → overlay out → canoe from right
    addPanelWithOverlay(tl, panelEls.current[1], 0.2)
    addArt(tl, canoeRef.current, { x: '42vw', y: '8vh' })

    // ── Beat 2: Buggy story → overlay → buggy rises from below ───────────────
    addPanelWithOverlay(tl, panelEls.current[2], 0.4)
    addArt(tl, buggyRef.current, { y: '38vh' })

    // ── Beat 3: Train story → overlay → train from left ──────────────────────
    addPanelWithOverlay(tl, panelEls.current[3], 0.4)
    addArt(tl, trainRef.current, { x: '-42vw', y: '-8vh' })

    // ── Beat 4: Plane story → overlay → plane descends from upper-right ──────
    addPanelWithOverlay(tl, panelEls.current[4], 0.4)
    addArt(tl, planeRef.current, { x: '30vw', y: '-28vh' })

    // ── Beat 5: Model T story → overlay → car from lower-left ────────────────
    addPanelWithOverlay(tl, panelEls.current[5], 0.4)
    addArt(tl, modelTRef.current, { x: '-38vw', y: '18vh' })

    // ── Beat 6: School story → overlay → school rises from below ─────────────
    addPanelWithOverlay(tl, panelEls.current[6], 0.4)
    addArt(tl, schoolRef.current, { y: '42vh' })

    // ── Final: title fades in, signature appears with the school (stays for rest of scene) ──
    tl.to(sceneTitleRef.current, { opacity: 1, duration: 1.0, ease: 'power2.inOut' }, '+=0.4')
      .to(fixedSigRef.current,   { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.6')
      .to({}, { duration: 4.0 }) // long hold so signature is clearly visible

    // Total duration for hotspot threshold calculation
    const totalDur = tl.duration()

    // ── ScrollTrigger (animation) ─────────────────────────────────────────────
    ScrollTrigger.create({
      trigger:   track,
      start:     'top top',
      end:       'bottom bottom',
      scrub:     1.5,
      animation: tl,
      onEnter:      () => { canvas.classList.add(styles.stickyCanvasFixed); document.body.classList.add('csaa-story-active') },
      onLeave:      () => { canvas.classList.remove(styles.stickyCanvasFixed); document.body.classList.remove('csaa-story-active') },
      onEnterBack:  () => { canvas.classList.add(styles.stickyCanvasFixed); document.body.classList.add('csaa-story-active') },
      onLeaveBack:  () => { canvas.classList.remove(styles.stickyCanvasFixed); document.body.classList.remove('csaa-story-active') },
      // Show hotspots only in the final portion (after all art is revealed)
      onUpdate: (self) => {
        const hotspotsAt = 1 - (2.0 / totalDur)
        setShowHotspots(self.progress >= hotspotsAt)
      },
    })

    // ── Header hide trigger ───────────────────────────────────────────────────
    // Hides the nav when entering the scroll track; restores it at About Shirley
    const headerEl = document.querySelector('header') as HTMLElement | null
    const breadcrumbEl = document.querySelector('[data-testid="site-breadcrumbs"]') as HTMLElement | null
    if (headerEl && exitRef.current) {
      const hideHeader = () => {
        gsap.to(headerEl, { y: '-100%', opacity: 0, duration: 0.35, ease: 'power2.in' })
        headerEl.style.pointerEvents = 'none'
        if (breadcrumbEl) {
          gsap.to(breadcrumbEl, { opacity: 0, duration: 0.25, ease: 'power2.in' })
          breadcrumbEl.style.pointerEvents = 'none'
        }
      }
      const showHeader = () => {
        gsap.to(headerEl, { y: '0%', opacity: 1, duration: 0.4, ease: 'power2.out' })
        headerEl.style.pointerEvents = ''
        if (breadcrumbEl) {
          gsap.to(breadcrumbEl, { opacity: 1, duration: 0.35, ease: 'power2.out' })
          breadcrumbEl.style.pointerEvents = ''
        }
      }

      ScrollTrigger.create({
        trigger:    track,
        start:      'top top',
        endTrigger: exitRef.current,
        end:        'top 80%',
        onEnter:      hideHeader,
        onLeave:      showHeader,
        onEnterBack:  hideHeader,
        onLeaveBack:  showHeader,
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill())
      tl.kill()
      setShowHotspots(false)
      document.body.classList.remove('csaa-story-active')
      if (fixedSigRef.current) {
        gsap.killTweensOf(fixedSigRef.current)
        gsap.set(fixedSigRef.current, { opacity: 0 })
      }
      // Restore header + breadcrumbs in case component unmounts mid-scroll
      if (headerEl) {
        gsap.killTweensOf(headerEl)
        gsap.set(headerEl, { clearProps: 'y,opacity' })
        headerEl.style.pointerEvents = ''
      }
      if (breadcrumbEl) {
        gsap.killTweensOf(breadcrumbEl)
        gsap.set(breadcrumbEl, { clearProps: 'opacity' })
        breadcrumbEl.style.pointerEvents = ''
      }
    }
  }, [])

  // ── Idle-scroll nudge ─────────────────────────────────────────────────────────
  useEffect(() => {
    const IDLE_MS = 4000
    const startIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        if (document.body.classList.contains('csaa-story-active')) setShowIdleNudge(true)
      }, IDLE_MS)
    }
    const onScroll = () => { setShowIdleNudge(false); startIdleTimer() }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  // ── GSAP Scene 2 timeline ────────────────────────────────────────────────────
  useEffect(() => {
    const track  = track2Ref.current
    const canvas = canvas2Ref.current
    const ovl    = overlay2Ref.current
    if (!track || !canvas || !ovl) return

    const PANEL_IN = 0.9, PANEL_HOLD = 3.2, PANEL_OUT = 0.7
    const OVL_IN = 0.5, OVL_OUT = 0.55

    gsap.set(panelS2.current.filter(Boolean), { opacity: 0 })
    gsap.set(s2TitleRef.current, { opacity: 0 })
    gsap.set(s2PromptRef.current, { opacity: 1 }) // visible at the scene start
    gsap.set(ovl, { opacity: 0 })
    gsap.set(s2ArtWrapRef.current, { opacity: 0 })

    function addPanel(tl: gsap.core.Timeline, el: HTMLDivElement | null, gap = 0.3) {
      if (!el) return
      tl.to(el, { opacity: 1, duration: PANEL_IN,  ease: 'power2.inOut' }, `+=${gap}`)
        .to(el, { opacity: 0, duration: PANEL_OUT, ease: 'power2.inOut' }, `+=${PANEL_HOLD}`)
    }
    function addPanelWithOverlay(tl: gsap.core.Timeline, el: HTMLDivElement | null, gap = 0.3) {
      if (!el) return
      tl.to(ovl, { opacity: 1, duration: OVL_IN,   ease: 'power2.inOut' }, `+=${gap}`)
        .to(el,  { opacity: 1, duration: PANEL_IN,  ease: 'power2.inOut' }, `-=${OVL_IN * 0.4}`)
        .to(el,  { opacity: 0, duration: PANEL_OUT, ease: 'power2.inOut' }, `+=${PANEL_HOLD}`)
        .to(ovl, { opacity: 0, duration: OVL_OUT,   ease: 'power2.inOut' }, `-=${PANEL_OUT * 0.5}`)
    }

    const tl = gsap.timeline()
    // Play/scroll prompt is visible at the start, then fades as the scene begins
    tl.to(s2PromptRef.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 1.0)
    addPanel(tl, panelS2.current[0], 0)
    addPanelWithOverlay(tl, panelS2.current[1], 0.3)
    addPanelWithOverlay(tl, panelS2.current[2], 0.4)
    addPanelWithOverlay(tl, panelS2.current[3], 0.4)
    tl.fromTo(s2ArtWrapRef.current,
      { opacity: 0, y: '30vh' },
      { opacity: 1, y: 0, duration: 1.6, ease: 'power3.out' },
      '+=0.3',
    )
    tl.to(fixedSigRef.current, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, '<+=0.4')
    tl.to(s2TitleRef.current, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, '+=0.3')
      .to({}, { duration: 4.0 })

    const totalDur = tl.duration()
    const st = ScrollTrigger.create({
      trigger: track, start: 'top top', end: 'bottom bottom', scrub: 1.5, animation: tl,
      onEnter:     () => {
        canvas.classList.add(styles.stickyCanvasFixed)
        document.body.classList.add('csaa-story-active')
        if (fixedSigRef.current) gsap.set(fixedSigRef.current, { opacity: 0 })
      },
      onLeave:     () => { canvas.classList.remove(styles.stickyCanvasFixed); document.body.classList.remove('csaa-story-active') },
      onEnterBack: () => {
        canvas.classList.add(styles.stickyCanvasFixed)
        document.body.classList.add('csaa-story-active')
      },
      onLeaveBack: () => { canvas.classList.remove(styles.stickyCanvasFixed); document.body.classList.remove('csaa-story-active') },
      onUpdate: (self) => {
        const at = 1 - (2.5 / totalDur)
        setShowS2Hotspots(self.progress >= at)
      },
    })
    return () => { st.kill(); tl.kill(); setShowS2Hotspots(false) }
  }, [])

  // ── GSAP Scene 3 timeline ────────────────────────────────────────────────────
  useEffect(() => {
    const track  = track3Ref.current
    const canvas = canvas3Ref.current
    const ovl    = overlay3Ref.current
    if (!track || !canvas || !ovl) return

    const PANEL_IN = 0.9, PANEL_HOLD = 3.2, PANEL_OUT = 0.7
    const OVL_IN = 0.5, OVL_OUT = 0.55

    gsap.set(panelS3.current.filter(Boolean), { opacity: 0 })
    gsap.set(s3TitleRef.current, { opacity: 0 })
    gsap.set(s3PromptRef.current, { opacity: 1 }) // visible at the scene start
    gsap.set(ovl, { opacity: 0 })
    gsap.set(s3ArtWrapRef.current, { opacity: 0 })

    function addPanel(tl: gsap.core.Timeline, el: HTMLDivElement | null, gap = 0.3) {
      if (!el) return
      tl.to(el, { opacity: 1, duration: PANEL_IN,  ease: 'power2.inOut' }, `+=${gap}`)
        .to(el, { opacity: 0, duration: PANEL_OUT, ease: 'power2.inOut' }, `+=${PANEL_HOLD}`)
    }
    function addPanelWithOverlay(tl: gsap.core.Timeline, el: HTMLDivElement | null, gap = 0.3) {
      if (!el) return
      tl.to(ovl, { opacity: 1, duration: OVL_IN,   ease: 'power2.inOut' }, `+=${gap}`)
        .to(el,  { opacity: 1, duration: PANEL_IN,  ease: 'power2.inOut' }, `-=${OVL_IN * 0.4}`)
        .to(el,  { opacity: 0, duration: PANEL_OUT, ease: 'power2.inOut' }, `+=${PANEL_HOLD}`)
        .to(ovl, { opacity: 0, duration: OVL_OUT,   ease: 'power2.inOut' }, `-=${PANEL_OUT * 0.5}`)
    }

    const tl = gsap.timeline()
    // Play/scroll prompt is visible at the start, then fades as the scene begins
    tl.to(s3PromptRef.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 1.0)
    addPanel(tl, panelS3.current[0], 0)
    addPanelWithOverlay(tl, panelS3.current[1], 0.3)
    addPanelWithOverlay(tl, panelS3.current[2], 0.4)
    addPanelWithOverlay(tl, panelS3.current[3], 0.4)
    tl.fromTo(s3ArtWrapRef.current,
      { opacity: 0, y: '30vh' },
      { opacity: 1, y: 0, duration: 1.6, ease: 'power3.out' },
      '+=0.3',
    )
    tl.to(fixedSigRef.current, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, '<+=0.4')
    tl.to(s3TitleRef.current, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, '+=0.3')
      .to({}, { duration: 4.0 })

    const totalDur = tl.duration()
    const st = ScrollTrigger.create({
      trigger: track, start: 'top top', end: 'bottom bottom', scrub: 1.5, animation: tl,
      onEnter:     () => {
        canvas.classList.add(styles.stickyCanvasFixed)
        document.body.classList.add('csaa-story-active')
        if (fixedSigRef.current) gsap.set(fixedSigRef.current, { opacity: 0 })
      },
      onLeave:     () => {
        canvas.classList.remove(styles.stickyCanvasFixed)
        document.body.classList.remove('csaa-story-active')
        if (fixedSigRef.current) gsap.to(fixedSigRef.current, { opacity: 0, duration: 0.5, ease: 'power2.in' })
      },
      onEnterBack: () => {
        canvas.classList.add(styles.stickyCanvasFixed)
        document.body.classList.add('csaa-story-active')
      },
      onLeaveBack: () => { canvas.classList.remove(styles.stickyCanvasFixed); document.body.classList.remove('csaa-story-active') },
      onUpdate: (self) => {
        const at = 1 - (2.5 / totalDur)
        setShowS3Hotspots(self.progress >= at)
      },
    })
    return () => { st.kill(); tl.kill(); setShowS3Hotspots(false) }
  }, [])

  // ── Auto-scroll the active scene while autoPlaying; stops at its track end ──
  useEffect(() => {
    if (!autoPlaying) return
    const track = autoTrackRef.current
    if (!track) return
    const step = () => {
      const end = track.offsetTop + track.offsetHeight - window.innerHeight
      if (window.scrollY >= end - 1) {
        setAutoPlaying(false)
        setAutoStarted(false)
        return
      }
      window.scrollBy(0, 9)
      autoRafRef.current = requestAnimationFrame(step)
    }
    autoRafRef.current = requestAnimationFrame(step)
    return () => { if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current) }
  }, [autoPlaying])

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Hero intro ─────────────────────────────────────────────────────── */}
      <section className={styles.intro}>
        <div
          className={styles.introImage}
          style={{ backgroundImage: `url(${shingwaukHeroImg})` }}
          aria-hidden="true"
        />
        <div className={styles.introOverlay} aria-hidden="true" />
        <div className={styles.introContent}>
          <p className={styles.introEyebrow}>CSAA Legacy</p>
          <h1 className={styles.introTitle}>Artwork by Dr. Shirley Horn</h1>
          <p className={styles.introDesc}>
            A journey through the lived experience of the Shingwauk Residential School —
            told through Dr. Shirley Horn's artwork.
          </p>
          <div className={styles.introActions}>
            <button
              type="button"
              className={styles.playBtn}
              onClick={() => playAnimation(scrollTrackRef.current)}
            >
              ▶ Play the animation
            </button>
            <span className={styles.introOr}>or scroll to experience it yourself</span>
          </div>
        </div>

        <div className={styles.scrollCue} aria-hidden="true">
          <span className={styles.scrollCueWheel} />
          <span className={styles.scrollCueLabel}>Scroll to explore</span>
        </div>

        <IntroWave />
      </section>

      {/* ── Floating auto-play control (Pause / Continue) ── */}
      {autoStarted && (
        <button
          type="button"
          className={styles.autoControl}
          onClick={() => setAutoPlaying((p) => !p)}
          aria-label={autoPlaying ? 'Pause animation' : 'Continue animation'}
        >
          {autoPlaying ? '❚❚ Pause' : '▶ Continue'}
        </button>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 1 — GSAP scrollytelling (pinned canvas)
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={scrollTrackRef} className={styles.scrollTrack}>
        <div ref={canvasRef} className={styles.stickyCanvas}>

          {/* ── Art layers — GSAP animates opacity + position ── */}
          <img ref={canoeRef}  data-layer="canoe"  src={canoeImg}  alt=""
            aria-hidden="true" className={`${styles.artLayer} ${styles.layerCanoe}`} />
          <img ref={trainRef}  data-layer="train"  src={trainImg}  alt=""
            aria-hidden="true" className={`${styles.artLayer} ${styles.layerTrain}`} />
          <img ref={planeRef}  data-layer="plane"  src={planeImg}  alt=""
            aria-hidden="true" className={`${styles.artLayer} ${styles.layerPlane}`} />
          <img ref={modelTRef} data-layer="modelT" src={modelTImg} alt=""
            aria-hidden="true" className={`${styles.artLayer} ${styles.layerModelT}`} />
          <img ref={buggyRef}  data-layer="buggy"  src={buggyImg}  alt=""
            aria-hidden="true" className={`${styles.artLayer} ${styles.layerBuggy}`} />
          <img ref={schoolRef} data-layer="school" src={schoolImg}
            alt="Shingwauk Hall residential school, artwork by Dr. Shirley Horn"
            className={`${styles.artLayer} ${styles.layerSchool}`} />

          {/* ── Reading overlay — GSAP fades in/out as a curtain over the art ── */}
          <div ref={overlayRef} className={styles.canvasOverlay} aria-hidden="true" />

          {/* ── Text panels — fade in / hold / fade out ── */}

          {/* Panel 0: Once upon a time (intro) */}
          <div ref={el => { panelEls.current[0] = el }} className={styles.textPanel}>
            <h2 className={styles.panelTitle}>"Taking the Children"</h2>
            <div className={styles.panelRule} aria-hidden="true" />
            <blockquote className={styles.panelQuote}>"Once upon a time…"</blockquote>
          </div>

          {/* Panel 1: Canoe — traditional life on the water */}
          <div ref={el => { panelEls.current[1] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              For generations, the waters carried us. Our canoes moved with the rhythm of
              the land — connecting family, seasonal camps, and community. But then, the
              waters brought a different kind of vessel. One that did not come to share the
              land, but to divide it.
            </p>
          </div>

          {/* Panel 2: Buggy */}
          <div ref={el => { panelEls.current[2] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              Before railways, before roads — the buggy came first. Priests and government
              agents arrived by horse-drawn carriage, recording names and assessing
              communities across the land. The creak of wheels on a dirt path became one of
              the earliest sounds of an authority that did not ask permission.
            </p>
          </div>

          {/* Panel 3: Train */}
          <div ref={el => { panelEls.current[3] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              They arrived on tracks of iron, cutting through the territories with a
              calculated silence. No longer just a journey, transport became a tool of
              separation — carrying away the laughter of our villages, one community at
              a time.
            </p>
          </div>

          {/* Panel 4: Plane */}
          <div ref={el => { panelEls.current[4] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              Then came the roar from the sky. Bush planes descended upon our most remote
              northern waters, reaching places where no tracks could go. For the children
              of the Far North, the plane didn't mean adventure — it meant a sudden
              departure from the quiet of the bush, thousands of miles from the only homes
              they had ever known.
            </p>
          </div>

          {/* Panel 5: Model T */}
          <div ref={el => { panelEls.current[5] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              As roads reached more communities, Indian Agents arrived by car — the vehicle
              of "progress" repurposed as a tool of removal. Children were loaded in and
              driven away, the dust of the road erasing the path home.
            </p>
          </div>

          {/* Panel 6: School */}
          <div ref={el => { panelEls.current[6] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              And the doors closed. Heavy stone, rigid walls, and unfamiliar rules replaced
              the open canopy of the forest and the warmth of the fireside. The circle of
              the family was broken — locked inside an institution meant to erase who we
              were.
            </p>
          </div>

          {/* ── Scene title (appears after all art is revealed) ── */}
          <h3 ref={sceneTitleRef} className={styles.sceneTitle}>
            "Taking the Children"
          </h3>

          {/* ── Hotspots (shown after art complete) ── */}
          {showHotspots && S1_HOTSPOTS.map(hs => (
            <S1HotspotDot key={hs.id} hotspot={hs} rects={s1LayerRects} />
          ))}

          {/* ── Idle nudge ── */}
          {showIdleNudge && (
            <div className={styles.idleNudge} aria-live="polite" aria-label="Keep scrolling to explore">
              <span className={styles.canvasCueWheel} />
              <span className={styles.canvasCueLabel}>Keep scrolling to explore</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 2 — Going Home & Moving Forward (GSAP pinned canvas)
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={track2Ref} className={styles.scrollTrack} style={{ height: '900vh' }}>
        <div ref={canvas2Ref} className={styles.stickyCanvas}>
          <div ref={s2ArtWrapRef} className={styles.artWrap}>
            <img ref={s2ImgRef} src={scene2Img}
              alt="Going Home — Moving Forward, artwork by Dr. Shirley Horn"
              className={styles.artWrapImg} />
            {showS2Hotspots && S2_HOTSPOTS.map(hs => (
              <HotspotDot key={hs.id} hotspot={hs} imageRect={s2ImageRect} />
            ))}
          </div>
          <div ref={overlay2Ref} className={styles.canvasOverlay} aria-hidden="true" />
          <div ref={el => { panelS2.current[0] = el }} className={styles.textPanel}>
            <h2 className={styles.panelTitle}>Going Home &amp; Moving Forward</h2>
            <div className={styles.panelRule} aria-hidden="true" />
          </div>
          <div ref={el => { panelS2.current[1] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              The same canoe that once carried children away now brings them home. The river
              carries memory, cleansing, and renewal in its current. Fish nets are cast again
              in familiar waters; the harvest fills baskets as the seasons turn.
            </p>
          </div>
          <div ref={el => { panelS2.current[2] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              The tipi stands where it always has. The residential school system tried to
              erase it — along with the language, the ceremony, and the knowledge carried
              inside it — but it remains standing, as it always will.
            </p>
          </div>
          <div ref={el => { panelS2.current[3] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              The family cabin waits: a place to rebuild, to heal, and to pass on what the
              schools tried so hard to take away. Pumpkins ripen. Smoke rises. The land
              remembers us even when we were not allowed to remember it.
            </p>
          </div>
          <h3 ref={s2TitleRef} className={styles.sceneTitle}>Going Home &amp; Moving Forward</h3>
          <div ref={s2PromptRef} className={styles.scenePrompt}>
            <button
              type="button"
              className={styles.playBtn}
              onClick={() => playAnimation(track2Ref.current)}
            >
              ▶ Play the animation
            </button>
            <span className={styles.scenePromptOr}>or scroll to experience it yourself</span>
          </div>
          {showIdleNudge && (
            <div className={styles.idleNudge} aria-live="polite" aria-label="Keep scrolling to explore">
              <span className={styles.canvasCueWheel} />
              <span className={styles.canvasCueLabel}>Keep scrolling to explore</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 3 — Remembering, and Renewal (GSAP pinned canvas)
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={track3Ref} className={styles.scrollTrack} style={{ height: '900vh' }}>
        <div ref={canvas3Ref} className={styles.stickyCanvas}>
          <div ref={s3ArtWrapRef} className={styles.artWrap}>
            <img ref={s3ImgRef} src={scene3Img}
              alt="Remembering, and Renewal, artwork by Dr. Shirley Horn"
              className={styles.artWrapImg} />
            {showS3Hotspots && S3_HOTSPOTS.map(hs => (
              <HotspotDot key={hs.id} hotspot={hs} imageRect={s3ImageRect} />
            ))}
          </div>
          <div ref={overlay3Ref} className={styles.canvasOverlay} aria-hidden="true" />
          <div ref={el => { panelS3.current[0] = el }} className={styles.textPanel}>
            <h2 className={styles.panelTitle}>Remembering, and Renewal</h2>
            <div className={styles.panelRule} aria-hidden="true" />
          </div>
          <div ref={el => { panelS3.current[1] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              The drum beats again. Forbidden in residential schools, it reclaims its place
              at the table — the heartbeat of the community restored to the centre of
              gathering.
            </p>
          </div>
          <div ref={el => { panelS3.current[2] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              Bannock is broken and shared. Blueberries and gathered roots speak to an
              unbroken relationship with the land. Fish is placed with honour. Tea steeps as
              voices come together in ceremony.
            </p>
          </div>
          <div ref={el => { panelS3.current[3] = el }} className={styles.textPanel}>
            <p className={styles.panelBody}>
              A shared meal is an act of healing. To gather around food is to reconnect
              memory, community, and belonging across generations. What was taken could not
              be kept. The feast table is laid. The people have come home.
            </p>
          </div>
          <h3 ref={s3TitleRef} className={styles.sceneTitle}>Remembering, and Renewal</h3>
          <div ref={s3PromptRef} className={styles.scenePrompt}>
            <button
              type="button"
              className={styles.playBtn}
              onClick={() => playAnimation(track3Ref.current)}
            >
              ▶ Play the animation
            </button>
            <span className={styles.scenePromptOr}>or scroll to experience it yourself</span>
          </div>
          {showIdleNudge && (
            <div className={styles.idleNudge} aria-live="polite" aria-label="Keep scrolling to explore">
              <span className={styles.canvasCueWheel} />
              <span className={styles.canvasCueLabel}>Keep scrolling to explore</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed signature — persists across all three scene canvases ──────── */}
      <div ref={fixedSigRef} className={styles.fixedSignature}>
        <div className={styles.signatureShell}>
          <img src={shirleySignature} alt="Dr. Shirley Horn signature" className={styles.signatureImg} />
          <p className={styles.signatureName}>— Dr. Shirley Horn —</p>
          <p className={styles.signatureRole}>Artist &amp; Elder</p>
        </div>
      </div>

      {/* ── About the Artist ──────────────────────────────────────────────────── */}
      <section ref={exitRef} className={styles.exit}>
        <div className={styles.exitInner}>
          <div className={styles.exitPortrait}>
            <img
              src={drHornImg}
              alt="Dr. Shirley Horn — Artist and Elder"
              className={styles.exitPortraitImg}
            />
          </div>
          <div className={styles.exitContent}>
            <p className={styles.exitEyebrow}>About the Artist</p>
            <h2 className={styles.exitTitle}>Dr. Shirley Horn</h2>
            <div className={styles.exitRule} aria-hidden="true" />
            <p className={styles.exitBody}>
              Dr. Shirley Horn is a respected Elder, artist, and survivor of the Shingwauk
              Residential School. Her artwork bears witness to the lived experience of the
              residential school system, preserving memory, healing, and the enduring spirit
              of her community for generations to come.
            </p>
            <div className={styles.exitActions}>
              <Link to="/our-story/healing-memorials" className={styles.exitPrimary}>
                Healing &amp; Memorials
              </Link>
              <a
                href="https://srsc.algomau.ca/"
                target="_blank"
                rel="noreferrer noopener"
                className={styles.exitSecondary}
              >
                Visit SRSC Archives
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

// ── Shared callout helper ─────────────────────────────────────────────────────
/**
 * Computes `position: fixed` inline styles for a callout box so it never gets
 * clipped by `overflow: hidden` on the sticky canvas (or any other ancestor).
 * The result is clamped to keep the box fully within the viewport.
 */
type CalloutDir = 'right' | 'left' | 'below'

function computeFixedCallout(
  btn: DOMRect,
  dir: CalloutDir,
  calloutW = 170,
  calloutH = 160,
): React.CSSProperties {
  const gap    = 14
  const margin = 8
  const vpW    = window.innerWidth
  const vpH    = window.innerHeight

  const clampX = (x: number) => Math.min(Math.max(x, margin), vpW - calloutW - margin)
  const clampY = (y: number) => Math.min(Math.max(y, margin), vpH - calloutH - margin)

  if (dir === 'right') {
    return { left: Math.min(btn.right + gap, vpW - calloutW - margin), top: clampY(btn.top + btn.height / 2 - calloutH / 2) }
  }
  if (dir === 'left') {
    return { left: Math.max(btn.left - gap - calloutW, margin), top: clampY(btn.top + btn.height / 2 - calloutH / 2) }
  }
  // below
  return { left: clampX(btn.left + btn.width / 2 - calloutW / 2), top: Math.min(btn.bottom + gap, vpH - calloutH - margin) }
}

// ── Scene 1 hotspot dot ───────────────────────────────────────────────────────
function S1HotspotDot({ hotspot, rects }: { hotspot: S1Hotspot; rects: S1LayerRects }) {
  const [calloutStyle, setCalloutStyle] = useState<React.CSSProperties | null>(null)
  const [calloutDir,   setCalloutDir  ] = useState<CalloutDir>('right')
  const btnRef = useRef<HTMLButtonElement>(null)
  const rect   = rects[hotspot.layer]

  const posStyle: React.CSSProperties = rect.width > 0
    ? { left: rect.left + (parseFloat(hotspot.x) / 100) * rect.width,
        top:  rect.top  + (parseFloat(hotspot.y) / 100) * rect.height }
    : { display: 'none' }

  function open() {
    const btn = btnRef.current
    if (!btn) return
    const dir: CalloutDir = window.innerWidth < 480
      ? 'below'
      : hotspot.callout === 'left' ? 'left' : 'right'
    setCalloutDir(dir)
    setCalloutStyle(computeFixedCallout(btn.getBoundingClientRect(), dir))
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className={`${styles.hotspot}${calloutStyle ? ` ${styles.hotspotOpen}` : ''}`}
      style={posStyle}
      aria-label={hotspot.title}
      aria-expanded={calloutStyle !== null}
      onMouseEnter={open}
      onMouseLeave={() => setCalloutStyle(null)}
      onFocus={open}
      onBlur={() => setCalloutStyle(null)}
      onClick={() => calloutStyle ? setCalloutStyle(null) : open()}
    >
      <span className={styles.hotspotRing} aria-hidden="true" />
      {calloutStyle && createPortal(
        <div
          className={styles.hotspotCalloutFixed}
          data-callout={calloutDir}
          style={calloutStyle}
        >
          <strong className={styles.hotspotCalloutTitle}>{hotspot.title}</strong>
          <p className={styles.hotspotCalloutBody}>{hotspot.body}</p>
        </div>,
        document.body,
      )}
    </button>
  )
}

// ── Hotspot dot component (S2 / S3) ──────────────────────────────────────────
function HotspotDot({
  hotspot,
  imageRect,
}: {
  hotspot: Hotspot
  imageRect?: ImageRect
}) {
  const [calloutStyle, setCalloutStyle] = useState<React.CSSProperties | null>(null)
  const [calloutDir,   setCalloutDir  ] = useState<CalloutDir>('right')
  const btnRef = useRef<HTMLButtonElement>(null)

  const posStyle: React.CSSProperties = imageRect && imageRect.width > 0
    ? { left: imageRect.left + (parseFloat(hotspot.x) / 100) * imageRect.width,
        top:  imageRect.top  + (parseFloat(hotspot.y) / 100) * imageRect.height }
    : { left: hotspot.x, top: hotspot.y }

  function open() {
    const btn = btnRef.current
    if (!btn) return
    const dir: CalloutDir = window.innerWidth < 480
      ? 'below'
      : parseFloat(hotspot.x) <= 55 ? 'right' : 'left'
    setCalloutDir(dir)
    setCalloutStyle(computeFixedCallout(btn.getBoundingClientRect(), dir))
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className={`${styles.hotspot}${calloutStyle ? ` ${styles.hotspotOpen}` : ''}`}
      style={posStyle}
      aria-label={hotspot.title}
      aria-expanded={calloutStyle !== null}
      onMouseEnter={open}
      onMouseLeave={() => setCalloutStyle(null)}
      onFocus={open}
      onBlur={() => setCalloutStyle(null)}
      onClick={() => calloutStyle ? setCalloutStyle(null) : open()}
    >
      <span className={styles.hotspotRing} aria-hidden="true" />
      {calloutStyle && createPortal(
        <div
          className={styles.hotspotCalloutFixed}
          data-callout={calloutDir}
          style={calloutStyle}
        >
          <strong className={styles.hotspotCalloutTitle}>{hotspot.title}</strong>
          <p className={styles.hotspotCalloutBody}>{hotspot.body}</p>
        </div>,
        document.body,
      )}
    </button>
  )
}
