/**
 * Generates a dynamic placeholder image URL using UI Avatars
 * @param name - The name of the item to generate a unique image for
 * @returns URL for the generated placeholder image
 */
export const generatePlaceholderImage = (name: string): string => {
  // Get initials from the name (up to 2 characters)
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate URL with custom styling
  const params = new URLSearchParams({
    name: initials,
    background: '2563eb', // Blue background
    color: 'ffffff', // White text
    size: '400', // Image size
    bold: 'true',
    format: 'svg'
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
}; 