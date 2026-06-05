import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { eventsApi, type EventDetailResponse } from '../api/eventsApi'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import {
  buildVenueLabel,
  formatEventDateRange,
  formatEventTimeRange,
  isAllDayEventType,
} from '../lib/eventsDate'
import { usePageSeo } from '../lib/usePageSeo'
import styles from './EventCalendarPage.module.css'

type CalendarEntry = {
  key: string
  event: EventDetailResponse
  startAt: string
  endAt?: string | null
}

type CalendarSegment = {
  entry: CalendarEntry
  startColumn: number
  span: number
  toneClassName: string
}

type ViewMode = 'month' | 'list'

const DAY_IN_MS = 24 * 60 * 60 * 1000

export function EventCalendarPage() {
  const { i18n, t } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const seoTitle = t('eventCalendar.seo.title')
  const seoDescription = t('eventCalendar.seo.description')
  const [monthValue, setMonthValue] = useState(toMonthInputValue(new Date()))
  const [events, setEvents] = useState<EventDetailResponse[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedMonth = useMemo(() => parseMonthValue(monthValue), [monthValue])
  const calendarWeeks = useMemo(
    () => buildCalendarWeeks(selectedMonth),
    [selectedMonth],
  )
  const visibleStart = calendarWeeks[0][0]
  const visibleEnd = calendarWeeks[calendarWeeks.length - 1][6]
  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)

  usePageBreadcrumbs([
    {
      label: t('site.nav.gatherings'),
      href: '/events',
    },
    {
      label: t('eventCalendar.title'),
    },
  ])

  usePageSeo({
    title: seoTitle,
    description: seoDescription,
    canonicalPath: '/events/calendar',
    image: WEBSITE_ASSET_URLS.gatheringsHeroStage,
    lang: locale,
  })

  useEffect(() => {
    let ignore = false

    async function loadEvents() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await eventsApi.listEventsByDateRange(
          toApiDate(visibleStart),
          toApiDate(visibleEnd),
        )

        if (!ignore) {
          setEvents(response.items)
        }
      } catch (loadError) {
        if (!ignore) {
          setEvents([])
          setError(
            loadError instanceof Error
              ? loadError.message
              : t('eventCalendar.loadError'),
          )
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadEvents()

    return () => {
      ignore = true
    }
  }, [t, visibleEnd, visibleStart])

  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    events.forEach((event) => {
      event.categories.forEach((category) => categorySet.add(category))
    })
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b, locale))
  }, [events, locale])

  const filteredEntries = useMemo(() => {
    return buildCalendarEntries(events).filter((entry) => {
      if (!entryOverlapsRange(entry, monthStart, monthEnd)) {
        return false
      }

      if (
        selectedCategories.size > 0 &&
        !entry.event.categories.some((cat) => selectedCategories.has(cat))
      ) {
        return false
      }

      return true
    })
  }, [selectedCategories, events, monthEnd, monthStart])

  function moveMonth(direction: -1 | 1) {
    setMonthValue((current) =>
      toMonthInputValue(addMonths(parseMonthValue(current), direction)),
    )
  }

  function resetToCurrentMonth() {
    setMonthValue(toMonthInputValue(new Date()))
  }

  function toggleCategory(category: string) {
    const newCategories = new Set(selectedCategories)
    if (newCategories.has(category)) {
      newCategories.delete(category)
    } else {
      newCategories.add(category)
    }
    setSelectedCategories(newCategories)
  }

  function clearAllFilters() {
    setSelectedCategories(new Set())
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{t('eventCalendar.eyebrow')}</p>
          <h1>{t('eventCalendar.title')}</h1>
          <p>{t('eventCalendar.description')}</p>
        </div>
      </section>

      <div className={styles.containerWithSidebar}>
        <aside className={styles.sidebar}>
          <div className={styles.filtersSection}>
            <div className={styles.filtersHeader}>
              <h3>{t('eventCalendar.filtersLabel')}</h3>
              {selectedCategories.size > 0 && (
                <button
                  className={styles.clearAllBtn}
                  onClick={clearAllFilters}
                  type="button"
                >
                  {t('eventCalendar.clearAll')}
                </button>
              )}
            </div>

            <div className={styles.filterGroup}>
              <p className={styles.filterGroupLabel}>{t('eventCalendar.eventTypeLabel')}</p>
              <div className={styles.checkboxGroup}>
                {categories.map((category) => (
                  <label key={category} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.topBar}>
            <div className={styles.topBarLeft}>
              <div className={styles.filtersLabel}>
                <span>{t('eventCalendar.filtersLabel')}</span>
                {selectedCategories.size > 0 && (
                  <button
                    className={styles.clearAllBtnTop}
                    onClick={clearAllFilters}
                    type="button"
                  >
                    {t('eventCalendar.clearAll')}
                  </button>
                )}
              </div>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => moveMonth(-1)}
                title={t('eventCalendar.previousMonth')}
              >
                {'<'}
              </button>
              <div className={styles.monthTitle}>
                <h2>{formatMonthTitle(selectedMonth, locale)}</h2>
              </div>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => moveMonth(1)}
                title={t('eventCalendar.nextMonth')}
              >
                {'>'}
              </button>
            </div>

            <div className={styles.topBarRight}>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={resetToCurrentMonth}
              >
                {t('eventCalendar.today')}
              </button>

              <div className={styles.viewToggle}>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'month' ? styles.active : ''}`}
                  onClick={() => setViewMode('month')}
                  title={t('eventCalendar.monthView')}
                >
                  {t('eventCalendar.monthViewLabel')}
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                  title={t('eventCalendar.listView')}
                >
                  {t('eventCalendar.listViewLabel')}
                </button>
              </div>
            </div>
          </div>

          {error ? <p className={styles.errorText}>{error}</p> : null}

          {viewMode === 'month' ? (
            <div className={styles.calendarContainer}>
              {isLoading ? (
                <div className={styles.loadingState}>
                  {t('eventCalendar.loading')}
                </div>
              ) : (
                <div className={styles.calendarGrid} aria-busy={isLoading}>
                  <div className={styles.weekdayRow}>
                    {getWeekdayLabels(locale).map((day) => (
                      <div key={day} className={styles.weekdayCell}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {calendarWeeks.map((week) => (
                    <CalendarWeek
                      key={toApiDate(week[0])}
                      week={week}
                      entries={filteredEntries}
                      selectedMonth={selectedMonth}
                      locale={locale}
                    />
                  ))}
                </div>
              )}

              {!isLoading && !filteredEntries.length ? (
                <div className={styles.emptyState}>
                  <h3>{t('eventCalendar.emptyTitle')}</h3>
                  <p>{t('eventCalendar.emptyDescription')}</p>
                </div>
              ) : null}

              <div className={styles.resultCount}>
                <p>
                  {t('eventCalendar.resultCount', {
                    count: filteredEntries.length,
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.listContainer}>
              {isLoading ? (
                <div className={styles.loadingState}>
                  {t('eventCalendar.loading')}
                </div>
              ) : !filteredEntries.length ? (
                <div className={styles.emptyState}>
                  <h3>{t('eventCalendar.emptyListTitle')}</h3>
                  <p>{t('eventCalendar.emptyDescription')}</p>
                </div>
              ) : (
                <div className={styles.listGrid}>
                  {filteredEntries.map((entry) => (
                    <MonthEventCard entry={entry} locale={locale} key={entry.key} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function CalendarWeek({
  week,
  entries,
  selectedMonth,
  locale,
}: {
  week: Date[]
  entries: CalendarEntry[]
  selectedMonth: Date
  locale: string
}) {
  const weekStart = week[0]
  const weekEnd = week[6]
  const segments = entries
    .filter((entry) => entryOverlapsRange(entry, weekStart, weekEnd))
    .map((entry) => buildCalendarSegment(entry, weekStart, weekEnd))
    .sort((left, right) => {
      const columnDifference = left.startColumn - right.startColumn
      return columnDifference || right.span - left.span
    })

  return (
    <div className={styles.weekRow}>
      <div className={styles.weekDayCells}>
        {week.map((day) => (
          <div
            key={toApiDate(day)}
            className={[
              styles.dayCell,
              day.getMonth() !== selectedMonth.getMonth() ? styles.outsideMonth : '',
              isSameCalendarDay(day, new Date()) ? styles.todayCell : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span>{day.getDate()}</span>
          </div>
        ))}
      </div>

      <div className={styles.weekEvents}>
        {segments.slice(0, 4).map((segment) => (
          <Link
            key={`${segment.entry.key}-${segment.startColumn}-${segment.span}`}
            to={`/events/${segment.entry.event.id}`}
            className={`${styles.calendarEvent} ${segment.toneClassName}`}
            style={{
              gridColumn: `${segment.startColumn} / span ${segment.span}`,
            }}
            title={segment.entry.event.title}
          >
            <span>{formatCompactEventRange(segment.entry, locale)}</span>
            <strong>{segment.entry.event.title}</strong>
          </Link>
        ))}
        {segments.length > 4 ? (
          <span className={styles.eventMore}>
            +{segments.length - 4}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function MonthEventCard({
  entry,
  locale,
}: {
  entry: CalendarEntry
  locale: string
}) {
  const { t } = useTranslation()
  const venueLabel = buildVenueLabel(entry.event.address, entry.event.location_mode, t)

  return (
    <article className={styles.listCard}>
      <div className={styles.listDate}>
        <span>
          {new Intl.DateTimeFormat(locale, { month: 'short' }).format(
            getEntryStartDate(entry),
          )}
        </span>
        <strong>
          {new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(
            getEntryStartDate(entry),
          )}
        </strong>
      </div>

      <div>
        <h3>{entry.event.title}</h3>
        <p>
          {formatEventDateRange(
            entry.startAt,
            entry.endAt,
            entry.event.event_type,
            locale,
          )}
        </p>
        <p>
          {formatEventTimeRange(
            entry.startAt,
            entry.endAt,
            entry.event.event_type,
            locale,
            t,
          )}
        </p>
        <p>{venueLabel}</p>
      </div>

      <Link to={`/events/${entry.event.id}`} className={styles.listLink}>
        {t('eventCalendar.viewDetails')}
      </Link>
    </article>
  )
}

function buildCalendarEntries(events: EventDetailResponse[]) {
  return events.flatMap((event) => {
    if (event.repeat_enabled && event.occurrences.length) {
      return event.occurrences.map((occurrence) => ({
        key: `${event.id}-${occurrence.id}`,
        event,
        startAt: occurrence.occurrence_start_at,
        endAt: occurrence.occurrence_end_at,
      }))
    }

    return [
      {
        key: String(event.id),
        event,
        startAt: event.start_at,
        endAt: event.end_at,
      },
    ]
  })
}

function buildCalendarSegment(
  entry: CalendarEntry,
  weekStart: Date,
  weekEnd: Date,
): CalendarSegment {
  const entryStart = getEntryStartDate(entry)
  const entryEnd = getEntryEndDate(entry)
  const segmentStart = entryStart < weekStart ? weekStart : entryStart
  const segmentEnd = entryEnd > weekEnd ? weekEnd : entryEnd
  const startColumn = getCalendarDayDiff(segmentStart, weekStart) + 1
  const span = getCalendarDayDiff(segmentEnd, segmentStart) + 1

  return {
    entry,
    startColumn,
    span,
    toneClassName: getToneClassName(entry.event.id),
  }
}

function buildCalendarWeeks(selectedMonth: Date) {
  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const weeks: Date[][] = []
  let cursor = calendarStart

  while (cursor <= calendarEnd) {
    weeks.push(
      Array.from({ length: 7 }, (_, index) => addDays(cursor, index)),
    )
    cursor = addDays(cursor, 7)
  }

  return weeks
}

function entryOverlapsRange(entry: CalendarEntry, rangeStart: Date, rangeEnd: Date) {
  return getEntryEndDate(entry) >= rangeStart && getEntryStartDate(entry) <= rangeEnd
}

function getEntryStartDate(entry: CalendarEntry) {
  return getCalendarDate(entry.startAt, entry.event.event_type) ?? startOfDay(new Date())
}

function getEntryEndDate(entry: CalendarEntry) {
  return (
    getCalendarDate(entry.endAt ?? entry.startAt, entry.event.event_type) ??
    getEntryStartDate(entry)
  )
}

function getCalendarDate(value: string, eventType: EventDetailResponse['event_type']) {
  if (isAllDayEventType(eventType)) {
    const matchedDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!matchedDate) {
      return null
    }

    return new Date(
      Number(matchedDate[1]),
      Number(matchedDate[2]) - 1,
      Number(matchedDate[3]),
    )
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : startOfDay(date)
}

function formatCompactEventRange(entry: CalendarEntry, locale: string) {
  const start = getEntryStartDate(entry)
  const end = getEntryEndDate(entry)
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  })

  if (isSameCalendarDay(start, end)) {
    return formatter.format(start)
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`
}

function formatMonthTitle(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getWeekdayLabels(locale: string) {
  const sunday = new Date(2026, 0, 4)
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
      addDays(sunday, index),
    ),
  )
}

function parseMonthValue(value: string) {
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

function toMonthInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function toApiDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay())
}

function endOfWeek(date: Date) {
  return addDays(date, 6 - date.getDay())
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function getCalendarDayDiff(left: Date, right: Date) {
  const leftTime = Date.UTC(left.getFullYear(), left.getMonth(), left.getDate())
  const rightTime = Date.UTC(right.getFullYear(), right.getMonth(), right.getDate())
  return Math.round((leftTime - rightTime) / DAY_IN_MS)
}

function getToneClassName(eventId: number) {
  const tones = [
    styles.toneCedar,
    styles.toneForest,
    styles.toneSky,
    styles.toneClay,
  ]

  return tones[Math.abs(eventId) % tones.length]
}
