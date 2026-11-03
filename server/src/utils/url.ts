/**
 * Returns a clean http(s) address, or an empty string when the value is not one.
 * Blocks values such as "javascript:..." before they can reach a link on a page.
 */
export const toSafeUrl = (value: string): string => {
  const text = value.trim();

  if (!text) return "";

  // Addresses typed without a scheme, like "github.com/name", get https://.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(text)
    ? text
    : `https://${text}`;

  try {
    const url = new URL(candidate);

    const isWebAddress = url.protocol === "http:" || url.protocol === "https:";
    // A real address has a dot in its host, so "https://name/" is rejected.
    const hasDomain = url.hostname.includes(".");

    return isWebAddress && hasDomain ? url.toString() : "";
  } catch {
    return "";
  }
};
