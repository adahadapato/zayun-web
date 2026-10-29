/**
 * The same comparison key as the API's TagNames.Key: UPPERCASE without spaces, dots, dashes or underscores, so
 * "asp.net core" and "ASP NET Core" are the same tag.
 */
export const tagKey = (name: string) => name.trim().toUpperCase().replace(/[\s._\-–—]/g, '')

/** Trimmed, with runs of spaces made single. */
export const cleanTag = (name: string) => name.trim().replace(/\s+/g, ' ')
