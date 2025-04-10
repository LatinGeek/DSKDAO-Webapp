/**
 * Formats a number as a price string with the currency symbol
 * @param price - The price to format
 * @returns The formatted price string
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}; 