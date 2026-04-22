export function stripStyles(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove all style attributes
  doc.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));

  // Remove class attributes
  doc.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));

  // Unwrap useless <span> tags (no attributes left)
  doc.querySelectorAll("span").forEach((span) => {
    if (span.attributes.length === 0) {
      const parent = span.parentNode;

      if (!parent) return;

      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    }
  });

  return doc.body.innerHTML;
}
