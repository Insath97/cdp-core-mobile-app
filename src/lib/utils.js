import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
export function toTitleCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Masks a phone number showing only the first two and last two characters.
 * @param {string} phone - The phone number to mask.
 * @returns {string} - The masked phone number.
 */
export function maskPhoneNumber(phone) {
    if (!phone || phone === 'N/A') return 'N/A';
    const s = String(phone).trim();

    if (s.startsWith('+')) {
        // If it starts with +, show +, next 2 numbers, and last 2 numbers
        if (s.length <= 5) return s;
        return s.slice(0, 3) + 'x'.repeat(s.length - 5) + s.slice(-2);
    }

    if (s.length <= 4) return 'xxxx';
    return s.slice(0, 2) + 'x'.repeat(s.length - 4) + s.slice(-2);
}

/**
 * Formats a currency amount according to specific business rules:
 * - If the amount has decimals, it rounds up to the next whole number and displays without decimals.
 * - If the amount is a whole number, it displays with two decimal places (.00).
 * - Always uses a space as the thousands separator.
 * @param {number|string} amount - The amount to format.
 * @returns {string} - The formatted amount.
 */
export function formatCurrency(amount, decimalPlaces = 2) {
    const num = parseFloat(amount || 0);
    const finalNum = num % 1 !== 0 ? Math.ceil(num) : num;
    return finalNum.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
    }).replace(/,/g, ' ');
}
