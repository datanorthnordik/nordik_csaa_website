import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import {
  publicMemorialsApi,
  type PublicMemorialEntry,
} from '../api/memorialsApi'
import memorialFlower from '../assets/memorial_flower.png'
import watercolorMeadow from '../assets/watercolor_meadow.png'
import styles from './InMemorialPage.module.css'

const MEMORIAL_PAGE_SIZE = 100

type Story = {
  id: number
  quote: string
  attribution: string
}

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
  '#e57373',
  '#f06292',
  '#ba68c8',
  '#7986cb',
  '#4db6ac',
  '#81c784',
  '#ffb74d',
  '#ff8a65',
  '#a1887f',
  '#90a4ae',
]

type Particle = {
  id: number
  drift: number
  color: string
}

const WAVE_PATH =
  'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,100.8,118.42,100.34,176.49,90.47,227,81.86,276.54,64.74,321.39,56.44Z'

function randomFlowerColor() {
  return FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]
}

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

export function InMemorialPage() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<PublicMemorialEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    let ignore = false

    async function loadMemorials() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await publicMemorialsApi.listMemorials({
          page: 1,
          pageSize: MEMORIAL_PAGE_SIZE,
          sortBy: 'date_of_passing',
          sortOrder: 'desc',
        })

        if (!ignore) {
          setEntries(response.items)
        }
      } catch (loadError) {
        if (!ignore) {
          setEntries([])
          setError(getErrorMessage(loadError))
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadMemorials()

    return () => {
      ignore = true
    }
  }, [])

  function handlePlantFlower() {
    const id = ++nextId.current
    const drift = Math.round(Math.random() * 80 - 40)
    const color = randomFlowerColor()
    setParticles((current) => [...current, { id, drift, color }])
    window.setTimeout(() => {
      setParticles((current) => current.filter((particle) => particle.id !== id))
    }, 1500)
  }

  return (
    <div className={styles.page}>
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

      <section className={styles.gallerySection} aria-label={t('inMemorial.gallery.label')}>
        {isLoading ? (
          <div className={styles.galleryGrid} aria-label="Loading memorial portraits">
            {Array.from({ length: 8 }).map((_, index) => (
              <article key={index} className={styles.skeletonCard} aria-hidden="true">
                <div className={styles.skeletonPhoto} />
                <div className={styles.skeletonOverlay} />
              </article>
            ))}
          </div>
        ) : error ? (
          <div className={styles.galleryState}>
            <p className={styles.galleryNotice}>{error}</p>
          </div>
        ) : entries.length ? (
          <div className={styles.galleryGrid}>
            {entries.map((entry) => (
              <MemorialCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className={styles.galleryState}>
            <p className={styles.galleryNotice}>Memorial portraits will appear here soon.</p>
          </div>
        )}
      </section>

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
                <span className={styles.quoteMark} aria-hidden="true">
                  "
                </span>
                <blockquote className={styles.quote}>
                  <p className={styles.quoteText}>{story.quote}</p>
                  <footer className={styles.quoteAttribution}>- {story.attribution}</footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
        <WaveDivider fill="#f2f5f4" />
      </section>

      <section className={styles.gardenSection}>
        <div className={styles.gardenCard}>
          <h2 className={styles.gardenTitle}>{t('inMemorial.garden.title')}</h2>
          <div className={styles.gardenMeadow}>
            <img src={watercolorMeadow} alt="" className={styles.meadowImage} />
          </div>
          <div className={styles.gardenAction}>
            {particles.map((particle) => (
              <span
                key={particle.id}
                className={styles.floatingFlower}
                style={
                  {
                    '--drift': `${particle.drift}px`,
                    '--flower-color': particle.color,
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                *
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

function MemorialCard({ entry }: { entry: PublicMemorialEntry }) {
  const yearsLabel = getMemorialYearsLabel(entry)
  const portraitUrl = entry.portraitContentUrl.trim()

  return (
    <article className={styles.memorialCard}>
      {portraitUrl ? (
        <img
          src={portraitUrl}
          alt={entry.fullName}
          className={styles.cardPhoto}
          loading="lazy"
        />
      ) : (
        <div className={styles.cardPlaceholder}>
          <ParkIcon />
        </div>
      )}
      <div className={styles.cardOverlay}>
        <h3 className={styles.cardName}>{entry.fullName}</h3>
        {yearsLabel ? <p className={styles.cardYears}>{yearsLabel}</p> : null}
      </div>
    </article>
  )
}

function getMemorialYearsLabel(entry: Pick<PublicMemorialEntry, 'dateOfBirth' | 'dateOfPassing'>) {
  const birthYear = getYear(entry.dateOfBirth)
  const passingYear = getYear(entry.dateOfPassing)

  if (birthYear && passingYear) {
    return `${birthYear} - ${passingYear}`
  }

  return passingYear || birthYear
}

function getYear(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.slice(0, 4)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'We could not load memorial portraits right now.'
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
