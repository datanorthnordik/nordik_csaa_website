/**
 * CSAA Legacy — Scene 1 GSAP scrollytelling, Scenes 2 & 3 scroll-reveal.
 *
 * Scene 1 pattern (pinned canvas):
 *   text panel fades in → text panel fades out → art layer slides in (stays)
 *   Repeat for each beat — art accumulates on the canvas.
 *
 * Scenes 2 & 3: IntersectionObserver fade-in reveal.
 */

import { useEffect, useRef, useState } from 'react'
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

// ── Hotspot data (Scene 1) ────────────────────────────────────────────────────
type Hotspot = { id: string; x: string; y: string; title: string; body: string }

const S1_HOTSPOTS: Hotspot[] = [
  {
    id: 's1-train',
    x: '8%', y: '28%',
    title: 'Came by Train',
    body: 'Many children were taken hundreds of miles by train — often for the very first time — towards an unknown destination far from their families.',
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
    body: 'For those living along waterways, the journey began in a canoe — paddled away from their home shores, often never to return the same way.',
  },
  {
    id: 's1-modelT',
    x: '9%', y: '73%',
    title: 'Came by Car',
    body: 'As roads reached more communities, Indian Agents arrived by automobile. Children were loaded into cars and driven away from everything familiar.',
  },
  {
    id: 's1-buggy',
    x: '35%', y: '80%',
    title: 'Came by Buggy',
    body: 'Before railways and roads, priests and government agents arrived by horse-drawn buggy — recording names and assessing communities.',
  },
]

// ── Scroll-reveal hook (Scenes 2 & 3) ────────────────────────────────────────
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, isVisible }
}

// ── Wave divider ──────────────────────────────────────────────────────────────
const WAVE_PATH = 'M0,45 C400,45 450,95 700,95 C1000,95 1100,25 1300,25 C1380,25 1410,35 1440,35'
function IntroWave() {
  return (
    <div className={styles.waveDivider} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={styles.waveSvg}>
        <path d={`${WAVE_PATH} L1440,120 L0,120 Z`} fill="#fdfbf8" />
        <path d={WAVE_PATH} fill="none" stroke="#9c0000" strokeWidth="5"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
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

  // Art layer refs
  const canoeRef   = useRef<HTMLImageElement>(null)
  const buggyRef   = useRef<HTMLImageElement>(null)
  const trainRef   = useRef<HTMLImageElement>(null)
  const planeRef   = useRef<HTMLImageElement>(null)
  const modelTRef  = useRef<HTMLImageElement>(null)
  const schoolRef  = useRef<HTMLImageElement>(null)

  // End-of-scene elements
  const sceneTitleRef  = useRef<HTMLHeadingElement>(null)
  const artistCreditRef = useRef<HTMLDivElement>(null)
  const [showHotspots, setShowHotspots] = useState(false)

  // ── Scenes 2 & 3 reveal ─────────────────────────────────────────────────────
  const scene2Reveal = useScrollReveal(0.08)
  const scene3Reveal = useScrollReveal(0.08)

  // ── GSAP scene 1 timeline ───────────────────────────────────────────────────
  useEffect(() => {
    const track  = scrollTrackRef.current
    const canvas = canvasRef.current
    if (!track || !canvas) return

    // Initial states — CSS already sets artLayer opacity:0
    gsap.set(panelEls.current.filter(Boolean), { opacity: 0 })
    gsap.set([sceneTitleRef.current, artistCreditRef.current], { opacity: 0 })

    // Helper: panel in → hold → out
    const PANEL_IN   = 0.9
    const PANEL_HOLD = 1.0
    const PANEL_OUT  = 0.7

    function addPanel(tl: gsap.core.Timeline, el: HTMLDivElement | null, gap = 0.3) {
      if (!el) return
      tl.to(el, { opacity: 1, duration: PANEL_IN, ease: 'power2.inOut' }, `+=${gap}`)
        .to(el, { opacity: 0, duration: PANEL_OUT, ease: 'power2.inOut' }, `+=${PANEL_HOLD}`)
    }

    // Helper: art layer slides in from a given direction and stays
    function addArt(
      tl: gsap.core.Timeline,
      el: HTMLImageElement | null,
      from: gsap.TweenVars,
      gap = 0.1,
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

    // ── Beat 0: Intro "Once upon a time" ──────────────────────────────────────
    addPanel(tl, panelEls.current[0], 0)

    // ── Beat 1: Canoe story → canoe slides in from right ─────────────────────
    addPanel(tl, panelEls.current[1], 0.2)
    addArt(tl, canoeRef.current, { x: '42vw', y: '8vh' }, 0.1)

    // ── Beat 2: Buggy story → buggy rises from bottom-centre ─────────────────
    addPanel(tl, panelEls.current[2], 0.4)
    addArt(tl, buggyRef.current, { y: '38vh' }, 0.1)

    // ── Beat 3: Train story → train slides in from left ───────────────────────
    addPanel(tl, panelEls.current[3], 0.4)
    addArt(tl, trainRef.current, { x: '-42vw', y: '-8vh' }, 0.1)

    // ── Beat 4: Plane story → plane descends from upper-right ─────────────────
    addPanel(tl, panelEls.current[4], 0.4)
    addArt(tl, planeRef.current, { x: '30vw', y: '-28vh' }, 0.1)

    // ── Beat 5: Model T story → car drives in from bottom-left ───────────────
    addPanel(tl, panelEls.current[5], 0.4)
    addArt(tl, modelTRef.current, { x: '-38vw', y: '18vh' }, 0.1)

    // ── Beat 6: School story → school rises from below ────────────────────────
    addPanel(tl, panelEls.current[6], 0.4)
    addArt(tl, schoolRef.current, { y: '42vh' }, 0.1)

    // ── Final: title + artist credit fade in ─────────────────────────────────
    tl.to(sceneTitleRef.current,   { opacity: 1, duration: 1.0, ease: 'power2.inOut' }, '+=0.6')
      .to(artistCreditRef.current, { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.4')
      .to({}, { duration: 2.0 }) // hold at end

    // Total duration for hotspot threshold calculation
    const totalDur = tl.duration()

    // ── ScrollTrigger ─────────────────────────────────────────────────────────
    ScrollTrigger.create({
      trigger:   track,
      start:     'top top',
      end:       'bottom bottom',
      scrub:     1.5,
      animation: tl,
      onEnter:      () => canvas.classList.add(styles.stickyCanvasFixed),
      onLeave:      () => canvas.classList.remove(styles.stickyCanvasFixed),
      onEnterBack:  () => canvas.classList.add(styles.stickyCanvasFixed),
      onLeaveBack:  () => canvas.classList.remove(styles.stickyCanvasFixed),
      // Show hotspots only in the final portion (after all art is revealed)
      onUpdate: (self) => {
        const hotspotsAt = 1 - (2.0 / totalDur) // progress when hold begins
        setShowHotspots(self.progress >= hotspotsAt)
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill())
      tl.kill()
      setShowHotspots(false)
    }
  }, [])

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
        <Link to="/our-story" className={styles.backLink}>← Our Story</Link>

        <div className={styles.introContent}>
          <p className={styles.introEyebrow}>CSAA Legacy</p>
          <h1 className={styles.introTitle}>Artwork by Dr. Shirley Horn</h1>
          <p className={styles.introDesc}>
            A journey through the lived experience of the Shingwauk Residential School —
            told through Dr. Shirley Horn's artwork.
          </p>
        </div>

        <div className={styles.scrollCue} aria-hidden="true">
          <span className={styles.scrollCueWheel} />
          <span className={styles.scrollCueLabel}>Scroll to explore</span>
        </div>

        <IntroWave />
      </section>

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

          {/* ── Text panels — fade in / hold / fade out ── */}

          {/* Panel 0: Once upon a time (intro) */}
          <div ref={el => { panelEls.current[0] = el }} className={styles.textPanel}>
            <p className={styles.panelEyebrow}>Scene One</p>
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

          {/* ── Artist credit ── */}
          <div ref={artistCreditRef} className={styles.artistCredit}>
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

          {/* ── Hotspots (shown after art complete) ── */}
          {showHotspots && S1_HOTSPOTS.map(hs => (
            <HotspotDot key={hs.id} hotspot={hs} />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 2 — Going Home & Moving Forward
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={`${styles.narrativeSection} ${styles.narrativeSectionAlt}`}>
        <div className={styles.narrativeInner}>
          <p className={styles.narrativeEyebrow}>Scene Two</p>
          <h2 className={styles.narrativeTitle}>Going Home &amp; Moving Forward</h2>
          <div className={styles.narrativeRule} aria-hidden="true" />
          <p className={styles.narrativePara}>
            The same canoe that once carried children away now brings them home. The river
            carries memory, cleansing, and renewal in its current. Fish nets are cast again
            in familiar waters; the harvest fills baskets as the seasons turn.
          </p>
          <p className={styles.narrativePara}>
            The tipi stands where it always has. The residential school system tried to
            erase it — along with the language, the ceremony, and the knowledge carried
            inside it — but it remains standing, as it always will.
          </p>
          <p className={styles.narrativePara}>
            The family cabin waits: a place to rebuild, to heal, and to pass on what the
            schools tried so hard to take away. Pumpkins ripen. Smoke rises. The land
            remembers us even when we were not allowed to remember it.
          </p>
        </div>
      </section>

      <div
        ref={scene2Reveal.ref}
        className={`${styles.artworkSection} ${styles.artworkSectionAlt} ${scene2Reveal.isVisible ? styles.artworkVisible : ''}`}
      >
        <div className={styles.scene23Canvas}>
          <img
            src={scene2Img}
            alt="Going Home — Moving Forward, artwork by Dr. Shirley Horn"
            className={styles.sceneFullImg}
          />
        </div>
        <div className={styles.artworkMeta}>
          <h3 className={styles.artworkTitle}>Going Home &amp; Moving Forward</h3>
          <p className={styles.artworkCredit}>Artwork by Dr. Shirley Horn</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 3 — Remembering, and Renewal
      ══════════════════════════════════════════════════════════════════════ */}
      <section className={styles.narrativeSection}>
        <div className={styles.narrativeInner}>
          <p className={styles.narrativeEyebrow}>Scene Three</p>
          <h2 className={styles.narrativeTitle}>Remembering, and Renewal</h2>
          <div className={styles.narrativeRule} aria-hidden="true" />
          <p className={styles.narrativePara}>
            The drum beats again. Forbidden in residential schools, it reclaims its place
            at the table — the heartbeat of the community restored to the centre of
            gathering.
          </p>
          <p className={styles.narrativePara}>
            Bannock is broken and shared. Blueberries and gathered roots speak to an
            unbroken relationship with the land. Fish is placed with honour. Tea steeps as
            voices come together in ceremony.
          </p>
          <p className={styles.narrativePara}>
            A shared meal is an act of healing. To gather around food is to reconnect
            memory, community, and belonging across generations. What was taken could not
            be kept. The feast table is laid. The people have come home.
          </p>
        </div>
      </section>

      <div
        ref={scene3Reveal.ref}
        className={`${styles.artworkSection} ${scene3Reveal.isVisible ? styles.artworkVisible : ''}`}
      >
        <div className={styles.scene23Canvas}>
          <img
            src={scene3Img}
            alt="Remembering, and Renewal, artwork by Dr. Shirley Horn"
            className={styles.sceneFullImg}
          />
        </div>
        <div className={styles.artworkMeta}>
          <h3 className={styles.artworkTitle}>Remembering, and Renewal</h3>
          <div className={styles.artistCredit}>
            <img src={shirleySignature} alt="Dr. Shirley Horn signature" className={styles.signatureImg} />
            <div>
              <p className={styles.signatureName}>— Dr. Shirley Horn —</p>
              <p className={styles.signatureRole}>Artist &amp; Elder</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── About the Artist ──────────────────────────────────────────────────── */}
      <section className={styles.exit}>
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

// ── Hotspot dot component ─────────────────────────────────────────────────────
function HotspotDot({ hotspot }: { hotspot: Hotspot }) {
  const [isOpen, setIsOpen] = useState(false)
  const showRight = parseFloat(hotspot.x) <= 55

  return (
    <button
      type="button"
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
