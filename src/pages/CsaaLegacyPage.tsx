/**
 * CSAA Legacy — Scrollytelling Experience
 * ─────────────────────────────────────────
 * 700 vh scroll track → sticky canvas pins at 100 vh.
 * GSAP ScrollTrigger scrubs a 20-unit master timeline.
 * Layers build up one-by-one to form the full "Taking the Children"
 * composite, then the canvas slides through Scenes 2 & 3.
 */

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'

// ── Artwork layers (transparent PNGs) ────────────────────────────────────────
const canoeImg   = WEBSITE_ASSET_URLS.canoeVector
const trainImg   = WEBSITE_ASSET_URLS.trainVector
const planeImg   = WEBSITE_ASSET_URLS.planeVector
const modelTImg  = WEBSITE_ASSET_URLS.modelTVector
const buggyImg   = WEBSITE_ASSET_URLS.buggyVector
const schoolImg  = WEBSITE_ASSET_URLS.irsVectorPng
const scene2Img = WEBSITE_ASSET_URLS.returnHomeVector
const scene3Img = WEBSITE_ASSET_URLS.rememberVector
const shirleySignature = WEBSITE_ASSET_URLS.shirleySignature

// ── Static assets ─────────────────────────────────────────────────────────────
const shingwaukHeroImg = WEBSITE_ASSET_URLS.shingwaukHallHero
const drHornImg = WEBSITE_ASSET_URLS.drShirleyHorn

import styles from './CsaaLegacyPage.module.css'

// ── Wave divider (intro → canvas transition) ──────────────────────────────────
const WAVE = 'M0,45 C400,45 450,95 700,95 C1000,95 1100,25 1300,25 C1380,25 1410,35 1440,35'
function IntroWave() {
  return (
    <div className={styles.waveDivider} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={styles.waveSvg}>
        <path d={`${WAVE} L1440,120 L0,120 Z`} fill="#fdfbf8" />
        <path d={WAVE} fill="none" stroke="#9c0000" strokeWidth="5"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

gsap.registerPlugin(ScrollTrigger)

// ── Hotspot data ──────────────────────────────────────────────────────────────
type Hotspot = { id: string; x: string; y: string; title: string; body: string }

const S1_HOTSPOTS: Hotspot[] = [
  {
    id: 's1-train',
    x: '8%', y: '28%',
    title: 'Came by Train',
    body: 'Many children were taken hundreds of miles by train — often for the very first time — towards an unknown destination far from their families and communities.',
  },
  {
    id: 's1-school',
    x: '50%', y: '52%',
    title: 'Shingwauk Hall',
    body: 'The Shingwauk Indian Residential School in Sault Ste. Marie, Ontario, operated from 1873 to 1970. Hundreds of children were held here, separated from language, family, and culture.',
  },
  {
    id: 's1-plane',
    x: '78%', y: '36%',
    title: 'Came by Plane',
    body: 'Children from the most remote northern communities were flown out — a journey that felt like being taken to another world entirely.',
  },
  {
    id: 's1-canoe',
    x: '91%', y: '86%',
    title: 'Came by Canoe',
    body: 'For those living along waterways, the journey began in a canoe — paddled away from their home shores, often never to return in the same way.',
  },
  {
    id: 's1-modelT',
    x: '9%', y: '73%',
    title: 'Came by Car',
    body: 'As roads reached more communities, Indian Agents arrived by automobile. Children were loaded into cars and driven away — the vehicle of "progress" became a tool of forced removal.',
  },
  {
    id: 's1-buggy',
    x: '35%', y: '80%',
    title: 'Came by Buggy',
    body: 'Before railways and roads, priests and government agents arrived by horse-drawn buggy — recording names and assessing communities. The buggy was among the first symbols of an unwanted authority.',
  },
]

const S2_HOTSPOTS: Hotspot[] = [
  {
    id: 's2-tipi',
    x: '39%', y: '43%',
    title: 'The Tipi',
    body: 'The tipi stands as a symbol of home and belonging — traditions the residential school system tried to erase but could never extinguish. It remains standing, as it always has.',
  },
  {
    id: 's2-pumpkins',
    x: '27%', y: '55%',
    title: 'The Harvest',
    body: 'Pumpkins and gathered food speak to the deep connection between the land and the people — a harvest that feeds both body and spirit.',
  },
  {
    id: 's2-house',
    x: '53%', y: '47%',
    title: 'Coming Home',
    body: 'The family cabin represents the long-awaited return — a place to rebuild, to heal, and to pass on what the schools tried so hard to take away.',
  },
  {
    id: 's2-canoe',
    x: '40%', y: '73%',
    title: 'The Canoe Returns',
    body: 'The same canoe that once carried children away now brings them home — a powerful symbol of resilience and the continuation of culture across generations.',
  },
  {
    id: 's2-water',
    x: '46%', y: '85%',
    title: 'The Water',
    body: 'Water is life. The river carries memory, cleansing, and renewal — a living witness to everything that was taken and everything that endured.',
  },
  {
    id: 's2-fish',
    x: '73%', y: '65%',
    title: 'Fish & Net',
    body: 'Traditional fishing sustained communities for millennia. The net represents an unbroken relationship with the water — a practice no school could take away.',
  },
]

const S3_HOTSPOTS: Hotspot[] = [
  {
    id: 's3-drum',
    x: '14%', y: '44%',
    title: 'The Drum',
    body: 'The drum is the heartbeat of the community. Forbidden in residential schools, here it reclaims its place at the table of renewal.',
  },
  {
    id: 's3-bannock',
    x: '20%', y: '64%',
    title: 'Bannock',
    body: 'Bannock is more than bread — it is a symbol of resilience and sharing, made and passed down through generations of Indigenous families.',
  },
  {
    id: 's3-harvest',
    x: '34%', y: '62%',
    title: 'The Harvest',
    body: 'Gathered nuts, berries, and roots speak to an unbroken relationship with the land — a relationship no school could sever.',
  },
  {
    id: 's3-blueberries',
    x: '52%', y: '43%',
    title: 'Blueberries',
    body: 'Blueberries hold deep cultural and medicinal significance. Their presence on the table is a quiet act of reclaiming what was always ours.',
  },
  {
    id: 's3-fish',
    x: '63%', y: '67%',
    title: 'The Fish',
    body: 'Fish has sustained communities for millennia. To share it at the feast table is to honour the water, the land, and those who came before.',
  },
  {
    id: 's3-teapot',
    x: '80%', y: '66%',
    title: 'Tea & Ceremony',
    body: 'Gathering around tea is an act of welcome — an invitation to slow down, remember, and be present with one another in healing.',
  },
  {
    id: 's3-table',
    x: '50%', y: '84%',
    title: 'Coming to the Table',
    body: 'A shared meal is an act of healing. Gathering around food reconnects community, memory, and belonging across generations.',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────
export function CsaaLegacyPage() {
  const { t } = useTranslation()
  const scrollTrackRef  = useRef<HTMLDivElement>(null)
  const stickyCanvasRef = useRef<HTMLDivElement>(null)

  const [activeScene,   setActiveScene]   = useState<1 | 2 | 3>(1)
  const [hotspotsOn,    setHotspotsOn]    = useState(false)
  const [isMuted,       setIsMuted]       = useState(true)
  const [showIdleNudge, setShowIdleNudge] = useState(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  usePageBreadcrumbs([
    {
      label: t('site.breadcrumbs.ourStory'),
      href: '/our-story',
    },
    {
      label: t('ourStory.legacy.csaaLegacy.title'),
    },
  ])

  // Audio refs (swap src paths when files are available)
  const audioWater = useRef<HTMLAudioElement>(null)
  const audioTrain = useRef<HTMLAudioElement>(null)
  const audioPlane = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track  = scrollTrackRef.current
      const canvas = stickyCanvasRef.current
      if (!track || !canvas) return

      const vw = window.innerWidth
      const vh = window.innerHeight

      // ── Full-screen toggle ────────────────────────────────────────────────
      // When the scroll track is active, switch the canvas from position:sticky
      // (constrained by SiteShell) to position:fixed covering the full viewport.
      // z-index 50 sits above the SiteHeader (z-index 40) so the nav hides
      // naturally. Body class lets global CSS fade the header gracefully.
      const showFullscreen = () => {
        canvas.classList.add(styles.stickyCanvasFixed)
        document.body.classList.add('csaa-story-active')
      }
      const hideFullscreen = () => {
        canvas.classList.remove(styles.stickyCanvasFixed)
        document.body.classList.remove('csaa-story-active')
      }

      ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        onEnter:      showFullscreen,
        onLeave:      hideFullscreen,
        onEnterBack:  showFullscreen,
        onLeaveBack:  hideFullscreen,
      })

      // ── Master scrub timeline ─────────────────────────────────────────────
      // Total = 20 "units"; 700 vh track → 1 unit ≈ 35 vh of scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      })

      // ── BEAT 1 (0.0–1.5): "Once upon a time…" ───────────────────────────
      tl.fromTo('[data-beat="intro"]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0)
      tl.to('[data-beat="intro"]',  { opacity: 0, y: -20, duration: 0.5 }, 0.9)

      // Canvas scroll cue — appears with beat 1, fades before canoe arrives
      tl.fromTo('[data-beat="canvas-cue"]', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 }, 0.15)
      tl.to('[data-beat="canvas-cue"]', { opacity: 0, y: -6, duration: 0.4 }, 1.1)

      // ── BEAT 2 (1.5–3.7): Canoe slides in from bottom-right ─────────────
      tl.fromTo('[data-beat="canoe-layer"]',
        { x: vw * 0.85, y: vh * 0.18, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' },
        1.5,
      )
      // All transport captions sit at bottom-centre — slide up from below
      tl.fromTo('[data-beat="canoe-text"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, 2.3)
      tl.to('[data-beat="canoe-text"]',   { opacity: 0, duration: 0.4 }, 3.2)

      // ── BEAT 3 (3.7–6.0): Train slides in from the right ────────────────
      tl.fromTo('[data-beat="train-layer"]',
        { x: vw, y: -vh * 0.1, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' },
        3.7,
      )
      tl.fromTo('[data-beat="train-text"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, 4.5)
      tl.to('[data-beat="train-text"]',   { opacity: 0, duration: 0.4 }, 5.5)

      // ── BEAT 4 (6.0–8.2): Plane flies in from upper-right ───────────────
      tl.fromTo('[data-beat="plane-layer"]',
        { x: vw * 0.6, y: -vh * 0.45, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power1.out' },
        6.0,
      )
      tl.fromTo('[data-beat="plane-text"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, 6.8)
      tl.to('[data-beat="plane-text"]',   { opacity: 0, duration: 0.4 }, 7.8)

      // ── BEAT 4.5 (8.2–10.2): Model T slides in from lower-left ──────────
      tl.fromTo('[data-beat="modelT-layer"]',
        { x: -vw * 0.5, y: vh * 0.1, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' },
        8.2,
      )
      tl.fromTo('[data-beat="modelT-text"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, 9.0)
      tl.to('[data-beat="modelT-text"]',   { opacity: 0, duration: 0.4 }, 10.0)

      // ── BEAT 4.7 (10.2–12.2): Buggy rises from bottom-centre-left ───────
      tl.fromTo('[data-beat="buggy-layer"]',
        { x: 0, y: vh * 0.35, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' },
        10.2,
      )
      tl.fromTo('[data-beat="buggy-text"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, 11.0)
      tl.to('[data-beat="buggy-text"]',   { opacity: 0, duration: 0.4 }, 12.0)

      // ── BEAT 5 (12.2–14.5): School drops in from above ──────────────────
      tl.fromTo('[data-beat="school-layer"]',
        { y: -vh * 0.07, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
        12.2,
      )
      tl.fromTo('[data-beat="school-text"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, 13.0)
      tl.to('[data-beat="school-text"]',   { opacity: 0, duration: 0.4 }, 14.2)

      // ── BEAT 6 (13.5–16.0): Title appears right after school lands ───────
      tl.fromTo('[data-beat="scene1-title"]',  { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.9 }, 13.5)
      tl.fromTo('[data-beat="artist-credit"]', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 14.0)

      // DWELL for scene 1 → 18.0

      // ── BEAT 7 (18.0–19.5): Scene 1 → Scene 2 (scroll-down reveal) ──────
      tl.to('[data-beat="scene1"]',
        { y: '-100%', opacity: 0, duration: 1.2, ease: 'power2.inOut' },
        18.0,
      )
      tl.fromTo('[data-beat="scene2"]',
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 1.2, ease: 'power2.inOut' },
        18.0,
      )
      tl.fromTo('[data-beat="scene2-title"]', { opacity: 0, y: -22 }, { opacity: 1, y: 0, duration: 0.7 }, 19.0)

      // DWELL scene 2 → 22.0

      // ── BEAT 8 (22.0–23.5): Scene 2 → Scene 3 (scroll-down reveal) ──────
      tl.to('[data-beat="scene2"]',
        { y: '-100%', opacity: 0, duration: 1.2, ease: 'power2.inOut' },
        22.0,
      )
      tl.fromTo('[data-beat="scene3"]',
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 1.2, ease: 'power2.inOut' },
        22.0,
      )
      tl.fromTo('[data-beat="scene3-title"]', { opacity: 0, y: -22 }, { opacity: 1, y: 0, duration: 0.7 }, 23.0)

      // ── BEAT 9 (24.0): Artist credit fades out after all artworks ────────
      tl.to('[data-beat="artist-credit"]', { opacity: 0, duration: 0.5 }, 24.0)

      // ── Scene / hotspot tracker ───────────────────────────────────────────
      ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress

          // These thresholds match the timeline beats above
          // Total timeline = 25 units across 875vh
          let scene: 1 | 2 | 3 = 1
          let on = false

          if (p >= 0.56 && p < 0.72) { scene = 1; on = true }          // beat 6 dwell (units 14–18)
          else if (p >= 0.76 && p < 0.88) { scene = 2; on = true }     // beat 7 dwell (units 19–22)
          else if (p >= 0.92 && p < 0.98) { scene = 3; on = true }     // beat 8 dwell (units 23–24.5)

          setActiveScene(s => s !== scene ? scene : s)
          setHotspotsOn(h => h !== on ? on : h)
        },
      })

      // ── Audio cues (fires when muted===false at time of scroll) ──────────
      ScrollTrigger.create({
        trigger: track,
        start: '6% top',    // ≈ canoe beat (scaled for 875vh track)
        onEnter: () => {
          if (!isMuted && audioWater.current) {
            audioWater.current.currentTime = 0
            audioWater.current.play().catch(() => {})
          }
        },
      })
      ScrollTrigger.create({
        trigger: track,
        start: '14% top',   // ≈ train beat
        onEnter: () => {
          if (!isMuted && audioTrain.current) {
            audioTrain.current.currentTime = 0
            audioTrain.current.play().catch(() => {})
          }
        },
      })
      ScrollTrigger.create({
        trigger: track,
        start: '24% top',   // ≈ plane beat
        onEnter: () => {
          if (!isMuted && audioPlane.current) {
            audioPlane.current.currentTime = 0
            audioPlane.current.play().catch(() => {})
          }
        },
      })
    }, scrollTrackRef)

    return () => {
      ctx.revert()
      // Ensure body class is cleaned up if the component unmounts mid-scroll
      document.body.classList.remove('csaa-story-active')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Flashlight / proximity effect for hotspot dots ───────────────────────
  // Tracks mouse position on the canvas and sets --spotlight (0→1) on each
  // hotspot button based on distance. Dots appear only when the cursor is near.
  useEffect(() => {
    const canvas = stickyCanvasRef.current
    if (!canvas) return

    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = canvas.getBoundingClientRect()
      const mx = e.clientX - left
      const my = e.clientY - top
      canvas.querySelectorAll<HTMLElement>('[data-hotspot-btn]').forEach(el => {
        const hx = (parseFloat(el.style.left) / 100) * width
        const hy = (parseFloat(el.style.top) / 100) * height
        const dist = Math.hypot(mx - hx, my - hy)
        // Flashlight radius: 180px — fully lit at 0 px, dark at 180 px
        el.style.setProperty('--spotlight', Math.max(0, 1 - dist / 180).toFixed(3))
      })
    }
    const onLeave = () => {
      canvas.querySelectorAll<HTMLElement>('[data-hotspot-btn]').forEach(el =>
        el.style.setProperty('--spotlight', '0')
      )
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    return () => {
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // ── Idle-scroll nudge ────────────────────────────────────────────────────
  // If the user stops scrolling for 4 s while the story canvas is active,
  // show the "Keep scrolling" prompt. Resets immediately on any scroll event.
  useEffect(() => {
    const IDLE_MS = 4000

    const startIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        if (document.body.classList.contains('csaa-story-active')) {
          setShowIdleNudge(true)
        }
      }, IDLE_MS)
    }

    const onScroll = () => {
      setShowIdleNudge(false)
      startIdleTimer()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  return (
    <div className={styles.page}>

      {/* ── Hidden audio (swap src when files land in /public/audio/) ── */}
      <audio ref={audioWater} src="/audio/water.mp3"  loop     preload="none" />
      <audio ref={audioTrain} src="/audio/train.mp3"           preload="none" />
      <audio ref={audioPlane} src="/audio/plane.mp3"           preload="none" />

      {/* ── Page intro (normal scroll, above the pin zone) ──────────── */}
      <section className={styles.intro}>
        {/* Background photo */}
        <div
          className={styles.introImage}
          style={{ backgroundImage: `url(${shingwaukHeroImg})` }}
          aria-hidden="true"
        />
        <div className={styles.introOverlay} aria-hidden="true" />

        <Link to="/our-story" className={styles.backLink}>← Our Story</Link>
        <div className={styles.introContent}>
          <p className={styles.introEyebrow}>CSAA Legacy</p>
          <h1 className={styles.introTitle}>Artwork by Dr. Shirley Horn</h1>
          <p className={styles.introDesc}>
            An interactive journey through the lived experience of the Shingwauk
            Residential School — told through Dr. Shirley Horn's artwork.
          </p>
        </div>

        {/* Scroll cue — absolute bottom-centre so it stays viewport-centred */}
        <div className={styles.scrollCue} aria-hidden="true">
          <span className={styles.scrollCueWheel} />
          <span className={styles.scrollCueLabel}>Keep scrolling to explore</span>
        </div>

        {/* Wave transitions from dark hero → paper-white canvas */}
        <IntroWave />
      </section>

      {/* ── 700 vh scroll track — drives the scrubbed timeline ──────── */}
      <div ref={scrollTrackRef} className={styles.scrollTrack}>

        {/* Sticky canvas — switches to fixed fullscreen while track is active */}
        <div ref={stickyCanvasRef} className={styles.stickyCanvas}>

          {/* Mute toggle */}
          <button
            type="button"
            className={styles.muteButton}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            onClick={() => setIsMuted(m => !m)}
          >
            {isMuted ? <MutedIcon /> : <UnmutedIcon />}
          </button>

          {/* Canvas scroll cue — GSAP fades it in with beat 1, out before beat 2 */}
          <div data-beat="canvas-cue" className={styles.canvasCue} aria-hidden="true">
            <span className={styles.canvasCueWheel} />
            <span className={styles.canvasCueLabel}>Keep scrolling to explore</span>
          </div>

          {/* Idle nudge — appears after 4 s of no scrolling, hides on next scroll */}
          {showIdleNudge && (
            <div className={styles.idleNudge} aria-live="polite" aria-label="Keep scrolling to explore">
              <span className={styles.canvasCueWheel} />
              <span className={styles.canvasCueLabel}>Keep scrolling to explore</span>
            </div>
          )}

          {/* ── SCENE 1: Taking the Children ─────────────────────────── */}
          <div data-beat="scene1" className={styles.scene}>

            {/* Artwork layers — each starts invisible, GSAP animates in */}
            <img
              data-beat="canoe-layer"
              src={canoeImg}
              alt=""
              aria-hidden="true"
              className={`${styles.artLayer} ${styles.layerCanoe}`}
            />
            <img
              data-beat="train-layer"
              src={trainImg}
              alt=""
              aria-hidden="true"
              className={`${styles.artLayer} ${styles.layerTrain}`}
            />
            <img
              data-beat="plane-layer"
              src={planeImg}
              alt=""
              aria-hidden="true"
              className={`${styles.artLayer} ${styles.layerPlane}`}
            />
            <img
              data-beat="modelT-layer"
              src={modelTImg}
              alt=""
              aria-hidden="true"
              className={`${styles.artLayer} ${styles.layerModelT}`}
            />
            <img
              data-beat="buggy-layer"
              src={buggyImg}
              alt=""
              aria-hidden="true"
              className={`${styles.artLayer} ${styles.layerBuggy}`}
            />
            <img
              data-beat="school-layer"
              src={schoolImg}
              alt=""
              aria-hidden="true"
              className={`${styles.artLayer} ${styles.layerSchool}`}
            />

            {/* ── Narration captions ─────────────────────────────────── */}
            <div data-beat="intro" className={`${styles.caption} ${styles.captionCenter}`} aria-hidden="true">
              <span className={styles.captionQuote}>"Once upon a time…"</span>
            </div>

            <div data-beat="canoe-text" className={`${styles.caption} ${styles.captionUpperCenter} ${styles.captionNarrative}`} aria-hidden="true">
              <span className={styles.captionLine}>For generations, the waters carried us.</span>
              <span className={styles.captionLine}>Our canoes moved with the rhythm of the land — connecting family, seasonal camps, and community.</span>
              <span className={styles.captionLine}>But then, the waters brought a different kind of vessel. One that did not come to share the land, but to divide it.</span>
            </div>

            <div data-beat="train-text" className={`${styles.caption} ${styles.captionUpperCenter} ${styles.captionNarrative}`} aria-hidden="true">
              <span className={styles.captionLine}>They arrived on tracks of iron and wings of steel, cutting through the territories.</span>
              <span className={styles.captionLine}>They brought a calculated silence. No longer just a journey, transport became a tool of separation — carrying away the laughter of our villages, one community at a time.</span>
            </div>

            <div data-beat="plane-text" className={`${styles.caption} ${styles.captionUpperCenter} ${styles.captionNarrative}`} aria-hidden="true">
              <span className={styles.captionLine}>Then came the roar from the sky.</span>
              <span className={styles.captionLine}>Bush planes descended upon our most remote northern waters, reaching places where no tracks could go.</span>
              <span className={styles.captionLine}>For the children of the Far North, the plane didn't mean adventure — it meant a sudden departure from the quiet of the bush, carrying them thousands of miles from the only homes they had ever known.</span>
            </div>

            <div data-beat="modelT-text" className={`${styles.caption} ${styles.captionUpperCenter} ${styles.captionNarrative}`} aria-hidden="true">
              <span className={styles.captionLine}>Then the roads brought them too.</span>
              <span className={styles.captionLine}>As automobiles began to reach more communities, Indian Agents arrived by car — the vehicle of "progress" repurposed as a tool of removal.</span>
              <span className={styles.captionLine}>Children were loaded in and driven away from everything familiar, the dust of the road erasing the path home.</span>
            </div>

            <div data-beat="buggy-text" className={`${styles.caption} ${styles.captionUpperCenter} ${styles.captionNarrative}`} aria-hidden="true">
              <span className={styles.captionLine}>Before railways, before roads — the buggy came first.</span>
              <span className={styles.captionLine}>Priests and government agents arrived by horse-drawn carriage, recording names and assessing communities across the land.</span>
              <span className={styles.captionLine}>The creak of wheels on a dirt path became one of the earliest sounds of an authority that did not ask permission.</span>
            </div>

            <div data-beat="school-text" className={`${styles.caption} ${styles.captionUpperCenter} ${styles.captionNarrative}`} aria-hidden="true">
              <span className={styles.captionLine}>And the doors closed.</span>
              <span className={styles.captionLine}>Heavy stone, rigid walls, and unfamiliar rules replaced the open canopy of the forest and the warmth of the fireside.</span>
              <span className={styles.captionLine}>The circle of the family was broken — locked inside an institution meant to erase who we were.</span>
            </div>

            {/* ── Scene title (appears at beat 6) ────────────────────── */}
            <h2 data-beat="scene1-title" className={styles.sceneTitle}>
              "Taking the Children"
            </h2>

            {/* ── Hotspot dots ───────────────────────────────────────── */}
            {hotspotsOn && activeScene === 1 && S1_HOTSPOTS.map(hs => (
              <HotspotDot key={hs.id} hotspot={hs} />
            ))}
          </div>

          {/* ── SCENE 2: Going Home / Moving Forward ─────────────────── */}
          <div data-beat="scene2" className={styles.scene}>
            <img
              src={scene2Img}
              alt="Going Home — Moving Forward, artwork by Dr. Shirley Horn"
              className={styles.sceneFullImg}
            />
            <h2 data-beat="scene2-title" className={styles.sceneTitle}>
              Going Home &amp; Moving Forward
            </h2>
            {hotspotsOn && activeScene === 2 && S2_HOTSPOTS.map(hs => (
              <HotspotDot key={hs.id} hotspot={hs} />
            ))}
          </div>

          {/* ── SCENE 3: Remembering, and Renewal ───────────────────── */}
          <div data-beat="scene3" className={styles.scene}>
            <img
              src={scene3Img}
              alt="Remembering, and Renewal, artwork by Dr. Shirley Horn"
              className={styles.sceneFullImg}
            />
            <h2 data-beat="scene3-title" className={styles.sceneTitle}>
              Remembering, and Renewal
            </h2>
            {hotspotsOn && activeScene === 3 && S3_HOTSPOTS.map(hs => (
              <HotspotDot key={hs.id} hotspot={hs} />
            ))}
          </div>

          {/* ── Artist signature — bottom-left, persists across all scenes ── */}
          <div data-beat="artist-credit" className={styles.artistCredit}>
            <div className={styles.signatureShell}>
              <img
                src={shirleySignature}
                alt="Dr. Shirley Horn signature"
                className={styles.signatureImg}
              />
              <p className={styles.signatureName}>— Dr. Shirley Horn —</p>
              <p className={styles.signatureRole}>Artist &amp; Elder</p>
            </div>
          </div>

        </div>{/* /stickyCanvas */}
      </div>{/* /scrollTrack */}

      {/* ── About the Artist (normal scroll resumes here) ─────────────── */}
      <section className={styles.exit}>
        <div className={styles.exitInner}>
          {/* Portrait */}
          <div className={styles.exitPortrait}>
            <img
              src={drHornImg}
              alt="Dr. Shirley Horn — Artist and Elder"
              className={styles.exitPortraitImg}
            />
          </div>
          {/* Text + CTAs */}
          <div className={styles.exitContent}>
            <p className={styles.exitEyebrow}>About the Artist</p>
            <h2 className={styles.exitTitle}>Dr. Shirley Horn</h2>
            <div className={styles.exitRule} aria-hidden="true" />
            <p className={styles.exitBody}>
              Dr. Shirley Horn is a respected Elder, artist, and survivor of the Shingwauk
              Residential School. Her artwork bears witness to the lived experience of
              the residential school system, preserving memory, healing, and the enduring
              spirit of her community for generations to come.
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

// ── Hotspot dot ───────────────────────────────────────────────────────────────
// Shows an inline callout beside the dot on hover — no overlay, no backdrop.
// Smart side: x ≤ 55% → callout to the right; x > 55% → callout to the left.
function HotspotDot({ hotspot }: { hotspot: Hotspot }) {
  const [isOpen, setIsOpen] = useState(false)
  const showRight = parseFloat(hotspot.x) <= 55

  return (
    <button
      type="button"
      data-hotspot-btn
      className={styles.hotspot}
      style={{ left: hotspot.x, top: hotspot.y }}
      aria-label={hotspot.title}
      aria-expanded={isOpen}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <span className={styles.hotspotRing} aria-hidden="true" />

      {isOpen && (
        <div className={showRight ? styles.hotspotCallout : styles.hotspotCalloutLeft}>
          <strong className={styles.hotspotCalloutTitle}>{hotspot.title}</strong>
          <p className={styles.hotspotCalloutBody}>{hotspot.body}</p>
        </div>
      )}
    </button>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function MutedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}

function UnmutedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}
