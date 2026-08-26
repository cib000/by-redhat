/*
  Turns SVG markup into a data URI that is safe to drop straight into an
  HTML attribute, while staying as readable as possible.

  Double quotes become single quotes so the result can live inside
  href="...", and the handful of characters that would break URL parsing
  (most importantly # in hex colors) get percent-encoded. Angle brackets
  are left alone on purpose: they are legal in a quoted attribute value and
  keeping them makes the tag readable at a glance.
*/
window.FaviconURI = {
  fromSvg(markup) {
    const compact = markup
      .replace(/\n\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .replace(/"/g, "'");

    const encoded = compact
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/&/g, '%26');

    return `data:image/svg+xml,${encoded}`;
  },

  linkTag(href) {
    return `<link rel="icon" href="${href}">`;
  },
};
