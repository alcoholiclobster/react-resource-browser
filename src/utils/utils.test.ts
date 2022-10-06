import { formatNumber, formatValueSign } from './format';

describe('utils', () => {
	it('formatNumber', () => {
		expect(formatNumber(1)).toBe('1');
		expect(formatNumber(1234)).toBe('1 234');
		expect(formatNumber(12345)).toBe('12 345');
		expect(formatNumber(1234567)).toBe('1 234 567');
	});

	it('formatValueSign', () => {
		expect(formatValueSign(0)).toBe('0');
		expect(formatValueSign(10)).toBe('+10');
		expect(formatValueSign(-5)).toBe('-5');
	});
});
