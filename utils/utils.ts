import { v4 as uuidv4 } from 'uuid';


/**
 * Calculates a future date by adding a specified number of days to the current date.
 *
 * @param {number} daysToAdd - The number of days to add to the current date.
 * @returns {Date} The future date after adding the specified number of days.
 *
 * @example
 * // Returns a date 10 days in the future
 * const futureDate = getFutureDate(10);
 */
export const getFutureDate = (daysToAdd: number): Date => {
    const today = new Date();
    today.setDate(today.getDate() + daysToAdd);
    return today;
};

/**
 * Generates a unique identifier (UUID v4).
 * @returns {string} A unique ID string.
 */
export const generateId = (): string => {
    return uuidv4();
};