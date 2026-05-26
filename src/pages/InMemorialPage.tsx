import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import memorialFlower from '../assets/memorial_flower.png'
import watercolorMeadow from '../assets/watercolor_meadow.png'
import styles from './InMemorialPage.module.css'

const INITIAL_FLOWER_COUNT = 342

type MemorialEntry = {
  id: number
  name: string
  years: string
  hasPhoto: boolean
  gradient?: string
}

const MEMORIAL_ENTRIES: MemorialEntry[] = [
  {
    id: 1,
    name: 'Agnes Wabano',
    years: '1934 – 2021',
    hasPhoto: true,
    gradient: 'linear-gradient(170deg, #8a8078 0%, #3e3830 55%, #2a2420 100%)',
  },
  {
    id: 2,
    name: 'Samuel Grey',
    years: '1941 – 2023',
    hasPhoto: false,
  },
  {
    id: 3,
    name: 'David Kee',
    years: '1945 – 2022',
    hasPhoto: true,
    gradient: 'linear-gradient(160deg, #707870 0%, #303830 55%, #202820 100%)',
  },
  {
    id: 4,
    name: 'Mary Pine',
    years: '1938 – 2020',
    hasPhoto: true,
    gradient: 'linear-gradient(170deg, #787080 0%, #302838 55%, #201820 100%)',
  },
]

type Story = { id: number; quote: string; attribution: string }

const STORIES: Story[] = [
  {
    id: 1,
    quote:
      'I remember how we used to whisper in the dormitories, sharing memories of home to keep our spirits alive. Those whispers became the foundation of our brotherhood.',
    attribution: "Anonymous Alumnus, Class of '58",
  },
  {
    id: 2,
    quote:
      'My mother always said that even in the longest winter, the roots are dreaming of spring. She lived her whole life as that spring, blossoming for her children and grandchildren.',
    attribution: 'T. Wabano, Community Member',
  },
]

const FLOWER_COLORS = [
  '#e57373', '#f06292', '#ba68c8', '#7986cb',
  '#4db6ac', '#81c784', '#ffb74d', '#ff8a65',
  '#a1887f', '#90a4ae',
]

function randomFlowerColor() {
  return FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]
}

type Particle = { id: number; drift: number; color: string }

/* ─── Wave SVG divider ─── */
const WAVE_PATH =
  'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,100.8,118.42,100.34,176.49,90.47,227,81.86,276.54,64.74,321.39,56.44Z'

function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <div className={`${styles.waveDivider} ${flip ? styles.waveDividerFlip : ''}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={styles.waveSvg}
        style={{ fill }}
        aria-hidden="true"
      >
        <path d={WAVE_PATH} />
      </svg>
    </div>
  )
}

/* ─── Page ─── */
export function InMemorialPage() {
  const { t } = useTranslation()
  const [flowerCount, setFlowerCount] = useState(INITIAL_FLOWER_COUNT)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isPulsing, setIsPulsing] = useState(false)
  const nextId = useRef(0)

  function handlePlantFlower() {
    setFlowerCount((prev) => prev + 1)
    setIsPulsing(true)
    setTimeout(() => setIsPulsing(false), 700)

    const id = ++nextId.current
    const drift = Math.round(Math.random() * 80 - 40)
    const color = randomFlowerColor()
    setParticles((prev) => [...prev, { id, drift, color }])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id))
    }, 1500)
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroInLoving}>{t('inMemorial.hero.inLoving')}</span>
          <h1 className={styles.heroMemory}>{t('inMemorial.hero.memory')}</h1>
          <p className={styles.heroTagline}>{t('inMemorial.hero.tagline')}</p>
          <img
            src={memorialFlower}
            alt={t('inMemorial.hero.imageAlt')}
            className={styles.heroFlower}
          />
        </div>
        <WaveDivider fill="#f2f5f4" />
      </section>

      {/* ── Gallery ── */}
      <section className={styles.gallerySection} aria-label={t('inMemorial.gallery.label')}>
        <div className={styles.galleryGrid}>
          {MEMORIAL_ENTRIES.map((entry) => (
            <MemorialCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      {/* ── Stories of Resilience ── */}
      <section className={styles.storiesSection}>
        <WaveDivider fill="#f6f3f2" flip />
        <div className={styles.storiesInner}>
          <div className={styles.storiesHeader}>
            <p className={styles.storiesEyebrow}>{t('inMemorial.stories.eyebrow')}</p>
            <h2 className={styles.storiesTitle}>{t('inMemorial.stories.title')}</h2>
          </div>
          <div className={styles.quoteList}>
            {STORIES.map((story) => (
              <div key={story.id} className={styles.quoteBlock}>
                <span className={styles.quoteMark} aria-hidden="true">"</span>
                <blockquote className={styles.quote}>
                  <p className={styles.quoteText}>{story.quote}</p>
                  <footer className={styles.quoteAttribution}>— {story.attribution}</footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
        <WaveDivider fill="#f2f5f4" />
      </section>

      {/* ── Remembrance Garden ── */}
      <section className={styles.gardenSection}>
        <div className={styles.gardenCard}>
          <h2 className={styles.gardenTitle}>{t('inMemorial.garden.title')}</h2>
          <p className={styles.gardenCountLine}>
            {t('inMemorial.garden.countPrefix')}
            <span className={`${styles.gardenCountNum} ${isPulsing ? styles.pulse : ''}`}>
              {flowerCount}
            </span>
            {t('inMemorial.garden.countSuffix')}
          </p>
          <div className={styles.gardenMeadow}>
            <img src={watercolorMeadow} alt="" className={styles.meadowImage} />
          </div>
          <div className={styles.gardenAction}>
            {particles.map((p) => (
              <span
                key={p.id}
                className={styles.floatingFlower}
                style={{ '--drift': `${p.drift}px`, '--flower-color': p.color } as React.CSSProperties}
                aria-hidden="true"
              >
                ✿
              </span>
            ))}
            <button type="button" className={styles.plantButton} onClick={handlePlantFlower}>
              {t('inMemorial.garden.action')}
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}

/* ─── Memorial Card ─── */
function MemorialCard({ entry }: { entry: MemorialEntry }) {
  return (
    <article className={styles.memorialCard}>
      {entry.hasPhoto ? (
        <div
          className={styles.cardPhoto}
          style={{ background: entry.gradient }}
        />
      ) : (
        <div className={styles.cardPlaceholder}>
          <ParkIcon />
        </div>
      )}
      <div className={styles.cardOverlay}>
        <h3 className={styles.cardName}>{entry.name}</h3>
        <p className={styles.cardYears}>{entry.years}</p>
      </div>
    </article>
  )
}

function ParkIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path
        d="M40 8L14 38h14L20 58h16v14h8V58h16L52 38h14L40 8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
