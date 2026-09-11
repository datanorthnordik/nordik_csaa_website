import { describe, expect, it } from 'vitest'
import {
  formatEventDateTime,
  formatEventTimeRange,
  parseEventWallClockDate,
} from './eventsDate'

const translate = (key: string) => key

describe('event wall-clock dates', () => {
  it('displays the saved time without applying the API UTC suffix', () => {
    expect(
      formatEventTimeRange(
        '2026-09-19T12:00:00Z',
        '2026-09-19T15:30:00Z',
        'single_day_partial',
        'en-CA',
        translate,
      ),
    ).toBe('12:00 p.m. - 3:30 p.m.')
  })

  it('ignores an offset when preserving the CMS wall-clock value', () => {
    expect(
      formatEventDateTime(
        '2026-09-19T12:00:00-04:00',
        'single_day_partial',
        'en-CA',
        translate,
      ),
    ).toContain('12:00 p.m.')
  })

  it('rejects invalid calendar values', () => {
    expect(parseEventWallClockDate('2026-02-31T12:00:00Z')).toBeNull()
    expect(parseEventWallClockDate('time pending')).toBeNull()
  })
})
