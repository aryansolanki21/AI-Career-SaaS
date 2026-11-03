/**
 * Converts unsupported Unicode characters into PDF-safe text
 * for jsPDF's built-in Helvetica font.
 */
export const toPdfSafeText = (text: string): string =>
  text
    .replace(/[\u2192\u21D2]/g, "->")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/[^\x20-\xFF]/g, (character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 ? character : "";
    });
