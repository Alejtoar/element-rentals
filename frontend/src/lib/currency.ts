/**
 * Format a number as Colombian Pesos (COP) with thousands separators
 * @param amount - The amount to format
 * @returns Formatted string like "$ 450,000 COP"
 */
export function formatCOP(amount: number): string {
    const formatted = amount.toLocaleString('en-US');
    return `$ ${formatted} COP`;
}
