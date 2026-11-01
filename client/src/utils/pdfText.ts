/**
 * jsPDF's built-in fonts only cover Latin text. AI answers can contain arrows,
 * emoji or other symbols that print as garbage, so map or drop them first.
 */
export const toPdfSafeText = (text: string): string =>
  text
    .replace(/[\u2192\u21D2]/g, "->")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/[\s\S]/g, (character) => {
      const code = character.charCodeAt(0);
      return code === 9 ||
        code === 10 ||
        code === 13 ||
        (code >= 32 && code <= 126) ||
        (code >= 160 && code <= 255)
        ? character
        : "";
    });
