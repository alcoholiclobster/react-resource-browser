const monthNames = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

/**
 * Format integer by adding extra spaces (1 123 456)
 */
export function formatNumber(value: number): string {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Add sign before number
 */
export function formatValueSign(value: number): string {
	if (value === 0) {
		return value.toString();
	}

	return value > 0 ? `+${value}` : value.toString();
}

/**
 * Convert Date month to 3 letter month name (Oct)
 */
export function getMonthName(month: number): string {
	return monthNames[month];
}
