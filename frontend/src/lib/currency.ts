/**
 * Format a number as Colombian Pesos (COP) with thousands separators
 * @param amount - The amount to format
 * @returns Formatted string like "$ 450,000 COP"
 */
export function formatCOP(amount: number): string {
    const formatted = Math.round(amount)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `$ ${formatted}`;
}
