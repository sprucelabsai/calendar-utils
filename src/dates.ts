import dateUtil from './utilities/date.utility'

export function now(): number {
	return new Date().getTime()
}

export function startOfToday() {
	return dateUtil.getStartOfDay(now())
}

export function lunch() {
	return dateUtil.setTimeOfDay(now(), 12, 0, 0, 0)
}

export function time(hour: number, minute: number) {
	return dateUtil.setTimeOfDay(now(), hour, minute, 0, 0)
}

export function tomorrowLunch() {
	return dateUtil.addDays(lunch(), 1)
}

export function tomorrowStartOfDay() {
	return dateUtil.addDays(startOfToday(), 1)
}