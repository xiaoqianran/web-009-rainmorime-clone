/** Scroll the content page to `#section-${hash}` inside the content wrapper. */
export function scrollToSection(hash: string | undefined | null): void {
  if (typeof window === 'undefined' || !hash) return;
  const id = String(hash).replace(/^#/, '').split('?')[0].split('&')[0];
  if (!id) return;

  const el = document.getElementById(`section-${id}`);
  if (!el) return;

  const container =
    (el.closest('[class*="contentWrapper"]') as HTMLElement | null) ||
    (document.querySelector('[class*="contentWrapper"]') as HTMLElement | null);

  if (container) {
    container.scrollTop = el.offsetTop;
  } else {
    el.scrollIntoView({ block: 'start' });
  }
}

/** Mount / hashchange / post-transition retries (rAF + 50ms + ~200ms). */
export function scrollToSectionWithRetry(hash: string | undefined | null): void {
  scrollToSection(hash);
  if (typeof window === 'undefined' || !hash) return;
  requestAnimationFrame(() => scrollToSection(hash));
  window.setTimeout(() => scrollToSection(hash), 50);
  window.setTimeout(() => scrollToSection(hash), 200);
}
