import { RRule } from 'rrule'
import { CalendarEvent } from '../types/calendar.types'
import dateUtil from './date.utility'

const calendarUtil = {
	freqMapToRRule: {
		weekly: RRule.WEEKLY,
		monthly: RRule.MONTHLY,
		daily: RRule.DAILY,
	},

	weekDaysMapToRRuleDays: {
		mon: RRule.MO,
		tue: RRule.TU,
		wed: RRule.WE,
		thur: RRule.TH,
		fri: RRule.FR,
		sat: RRule.SA,
		sun: RRule.SU,
	},

	applyRuleAndGetEvents(
		e: Pick<
			CalendarEvent,
			| 'repeats'
			| 'repeatsUntil'
			| 'daysOfWeek'
			| 'daysOfMonth'
			| 'interval'
			| 'startDateTimeMs'
			| 'occurrences'
			| 'nthOccurrences'
			| 'timeBlocks'
			| 'nthInRepeating'
			| 'totalInRepeating'
		>,
		dateUntil: number
	) {
		const events = this.applyRuleAndGetEventsWithoutExclusion(e, dateUntil)
		const excludedEvents = events.filter((e) => !this.isExcluded(e))

		return excludedEvents
	},
	applyRuleAndGetEventsWithoutExclusion(
		e: Pick<
			CalendarEvent,
			| 'repeats'
			| 'repeatsUntil'
			| 'daysOfWeek'
			| 'daysOfMonth'
			| 'interval'
			| 'startDateTimeMs'
			| 'occurrences'
			| 'nthOccurrences'
			| 'timeBlocks'
			| 'nthInRepeating'
			| 'totalInRepeating'
		>,
		dateUntil: number
	) {
		let repeatsUntil: number | undefined

		if (e.repeats) {
			if (e.repeatsUntil) {
				repeatsUntil = Math.min(e.repeatsUntil, dateUntil)
			} else {
				repeatsUntil = dateUntil
			}

			const rule = new RRule({
				freq: this.freqMapToRRule[e.repeats],
				interval: e.interval ?? 1,
				byweekday: e.daysOfWeek?.map((d) => this.weekDaysMapToRRuleDays[d]),
				dtstart: new Date(e.startDateTimeMs),
				bymonthday: e.daysOfMonth?.map((d) => parseInt(d)),
				until: new Date(repeatsUntil),
				count: e.occurrences,
				bysetpos: e.nthOccurrences?.map((o) => {
					if (o >= 0) {
						++o
					}
					return o
				}),
			})

			const events = this.mapRulesToEvents(rule, e)

			return events
		}

		return [e]
	},
	mapRulesToEvents(rule: RRule, e: Pick<CalendarEvent, 'startDateTimeMs'>) {
		const allEvents = rule.all()
		let events = allEvents.map((r, idx) => ({
			...e,
			nthInRepeating: idx,
			totalInRepeating: allEvents.length,
			startDateTimeMs: r.getTime(),
		})) as CalendarEvent[]

		return events
	},
	isExcluded(e: Pick<CalendarEvent, 'exclusionDates' | 'startDateTimeMs'>) {
		if (e.exclusionDates) {
			const splitStartDate = dateUtil.splitDate(e.startDateTimeMs)

			const isExcluded = e.exclusionDates.find((d) => {
				if (
					splitStartDate.year === d.year &&
					splitStartDate.month === d.month &&
					splitStartDate.day === d.day
				) {
					return true
				}
				return false
			})
			if (isExcluded) {
				return true
			}
		}
		return false
	},

	getEventFromRangeByDate(
		values: Pick<
			CalendarEvent,
			| 'repeats'
			| 'repeatsUntil'
			| 'daysOfWeek'
			| 'daysOfMonth'
			| 'interval'
			| 'startDateTimeMs'
			| 'occurrences'
			| 'nthOccurrences'
			| 'timeBlocks'
			| 'nthInRepeating'
			| 'totalInRepeating'
		>,
		date: number
	) {
		const dateUntil = dateUtil.addYears(new Date().getTime(), 10)
		const searchDate = dateUtil.splitDate(date)
		const repeatingEvents = this.applyRuleAndGetEvents(values, dateUntil)
		return repeatingEvents.find((e) => {
			const event = dateUtil.splitDate(e.startDateTimeMs)
			if (
				searchDate.year === event.year &&
				searchDate.month === event.month &&
				searchDate.day === event.day
			) {
				return true
			}
			return false
		})
	},
}

export default calendarUtil
