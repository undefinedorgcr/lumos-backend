export const getFutureDate = (daysToAdd: number): Date => {
    const today = new Date();
    today.setDate(today.getDate() + daysToAdd);
    return today;
};