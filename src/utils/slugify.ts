/**
 * Generate URL-friendly slug from text
 * Converts text to lowercase and replaces spaces with hyphens
 *
 * @param text - Text to convert to slug
 * @returns URL-friendly slug string
 *
 * @example
 * generateSlug('Hello World') // returns 'hello-world'
 * generateSlug('Electronics & Gadgets') // returns 'electronics-gadgets'
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()                    // Convert to lowercase
    .trim()                           // Trim leading/trailing whitespace
    .replace(/[^\w\s-]/g, '')        // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')            // Replace spaces with hyphens
    .replace(/-+/g, '-')             // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');        // Remove leading/trailing hyphens
}
