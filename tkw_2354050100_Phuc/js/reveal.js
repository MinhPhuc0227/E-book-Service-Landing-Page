export function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");

  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => {
      item.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
    },
  );

  items.forEach((item) => {
    observer.observe(item);
  });
}
