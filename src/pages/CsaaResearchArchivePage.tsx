import type { ReactNode } from 'react'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SharedImageHero } from '../components/SharedImageHero'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import styles from './CsaaResearchArchivePage.module.css'

/** External home of the SRSC research archive. */
const SRSC_ARCHIVE_URL = 'https://srsc.algomau.ca/'
const NATIONAL_CRISIS_LINE = '1-866-925-4419'

type Offering = {
  title: string
  description: string
  icon: ReactNode
}

const OFFERINGS: Offering[] = [
  {
    title: 'Archives & Collections',
    description:
      'Residential school records, photographs, newsletters, correspondence, and student artwork — stewarded as a lasting record for Survivors and their families.',
    icon: <ArchiveIcon />,
  },
  {
    title: 'Research & Truth-Telling',
    description:
      'A place of truth-telling and learning that supports scholarly and community research into the history and ongoing impacts of the Residential School system.',
    icon: <ResearchIcon />,
  },
  {
    title: 'Education & Reconciliation',
    description:
      "Cross-cultural education rooted in Chief Shingwauk's vision of a teaching wigwam — sharing, healing, and learning across communities.",
    icon: <EducationIcon />,
  },
  {
    title: 'Truth Walks & Exhibitions',
    description:
      'Guided tours of the historic site and survivor-created exhibitions, including the permanent Reclaiming Shingwauk Hall installation.',
    icon: <ExhibitIcon />,
  },
]

type Milestone = {
  year: string
  title: string
  description: string
}

const MILESTONES: Milestone[] = [
  {
    year: '1873–1970',
    title: 'The Shingwauk Indian Residential School',
    description:
      'The school operated for nearly a century in Sault Ste. Marie, on Robinson-Huron Treaty territory.',
  },
  {
    year: '1979',
    title: 'The Shingwauk Project begins',
    description:
      'Survivors and Algoma University partners launch the Shingwauk Project to gather and preserve the school’s history.',
  },
  {
    year: '1981',
    title: 'First reunion & the CSAA',
    description:
      'Former students returned for the first reunion, bringing documents and photographs to share — grassroots beginnings of both the CSAA and the archives.',
  },
  {
    year: '2005',
    title: 'The SRSC opens',
    description:
      'The Shingwauk Residential Schools Centre opens with Algoma University, on the site of the former school in Shingwauk Hall.',
  },
  {
    year: '2027',
    title: 'Makwa Waakaa’igan',
    description:
      'A purpose-built home for the archives, research, and community — expanding access for generations to come.',
  },
]

export function CsaaResearchArchivePage() {
  usePageBreadcrumbs([{ label: 'Research & Archive' }])

  usePageSeo({
    title: `Research & Archive | ${SITE_NAME}`,
    description:
      'The Children of Shingwauk Alumni Association and the Shingwauk Residential Schools Centre — a survivor-led partnership preserving Residential School history. Explore the SRSC research archive.',
    canonicalPath: '/research-and-archive',
    image: WEBSITE_ASSET_URLS.shingwaukHallHero,
  })

  return (
    <div className={styles.page}>
      <SharedImageHero
        eyebrow="CSAA & SRSC"
        title="Research & Archive"
        description="A survivor-led partnership between the Children of Shingwauk Alumni Association and the Shingwauk Residential Schools Centre — keeping our history, and the truth of it, within reach."
        backgroundImageUrl={WEBSITE_ASSET_URLS.shingwaukHallHero}
        backgroundPosition="center 40%"
        waveColor="#ffffff"
      />

      {/* Partnership intro */}
      <section className={styles.intro}>
        <div className={styles.introHead}>
          <p className={styles.eyebrow}>A living partnership</p>
          <h2 className={styles.introTitle}>Carrying the truth forward, together</h2>
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.introLead}>
            For more than forty years, the Children of Shingwauk Alumni Association has
            worked to remember, honour, and educate. The archive that Survivors began
            building — one photograph and one story at a time — grew into the Shingwauk
            Residential Schools Centre (SRSC), today jointly governed by the CSAA and
            Algoma University. Together we steward a place of truth-telling, learning,
            and relationship-building, guided always by Survivor voices.
          </p>
        </div>

        <div className={styles.partners}>
          <div className={styles.partnerLogo}>
            <img src={WEBSITE_ASSET_URLS.csaaLogo} alt="Children of Shingwauk Alumni Association" />
            <span>Children of Shingwauk Alumni Association</span>
          </div>
          <span className={styles.partnerJoin} aria-hidden="true">
            +
          </span>
          <div className={styles.partnerLogo}>
            <img src={WEBSITE_ASSET_URLS.srscLogo} alt="Shingwauk Residential Schools Centre" />
            <span>Shingwauk Residential Schools Centre</span>
          </div>
        </div>
      </section>

      {/* What the archive holds */}
      <section className={styles.offerings}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>What the centre holds</p>
          <h2 className={styles.sectionTitle}>An archive built by Survivors</h2>
        </div>
        <div className={styles.offeringGrid}>
          {OFFERINGS.map((offering) => (
            <article key={offering.title} className={styles.offeringCard}>
              <span className={styles.offeringIcon} aria-hidden="true">
                {offering.icon}
              </span>
              <h3 className={styles.offeringTitle}>{offering.title}</h3>
              <p className={styles.offeringDesc}>{offering.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* History timeline */}
      <section className={styles.history}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>How it grew</p>
          <h2 className={styles.sectionTitle}>A survivor-led story</h2>
        </div>
        <ol className={styles.timeline}>
          {MILESTONES.map((milestone) => (
            <li key={milestone.year} className={styles.timelineItem}>
              <span className={styles.timelineYear}>{milestone.year}</span>
              <div className={styles.timelineBody}>
                <h3 className={styles.timelineTitle}>{milestone.title}</h3>
                <p className={styles.timelineDesc}>{milestone.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Call to action → external archive */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <p className={styles.ctaEyebrow}>The SRSC Research Archive</p>
          <h2 className={styles.ctaTitle}>Explore the collections</h2>
          <p className={styles.ctaLead}>
            Search records, photographs, and exhibitions in the Shingwauk Residential
            Schools Centre’s online archive, hosted at Algoma University. You’ll leave
            this site and open the SRSC archive in a new tab.
          </p>
          <a
            href={SRSC_ARCHIVE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={styles.ctaButton}
          >
            Visit the SRSC Research Archive
            <span aria-hidden="true">↗</span>
          </a>
          <p className={styles.ctaSupport}>
            Support is available. If you or someone you know needs help, the National
            Residential School Crisis Line offers 24-hour support at{' '}
            <a href={`tel:${NATIONAL_CRISIS_LINE.replace(/-/g, '')}`}>{NATIONAL_CRISIS_LINE}</a>.
          </p>
        </div>
      </section>
    </div>
  )
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 12l8 3.5 8-3.5M4 16.5 12 20l8-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function ResearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m15 15 4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function EducationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4 2.5 9 12 14l9.5-5L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 11v5c0 1 2.5 2.5 5.5 2.5s5.5-1.5 5.5-2.5v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExhibitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20h8M12 16.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
