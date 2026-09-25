import { parseEventWallClockDate } from './eventsDate'

export function formatLatestContentDate(value: string, locale: string) {
  const date = parseEventWallClockDate(value)
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .toLocaleUpperCase(locale)
}
