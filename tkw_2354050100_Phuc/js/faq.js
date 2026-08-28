export function initFaq() {
  const roots = document.querySelectorAll("[data-faq]");

  if (!roots.length) return;

  roots.forEach((root) => {
    const triggers = root.querySelectorAll("[data-faq-trigger]");

    if (!triggers.length) return;

    const setOpen = (trigger, open) => {
      const item = trigger.closest("details");

      if (!item) return;

      item.open = open;
      trigger.setAttribute("aria-expanded", String(open));
    };

    triggers.forEach((trigger) => {
      const item = trigger.closest("details");

      if (item) {
        setOpen(trigger, item.open);
      }
    });

    root.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-faq-trigger]");

      if (!trigger || !root.contains(trigger)) return;

      event.preventDefault();

      const currentItem = trigger.closest("details");

      if (!currentItem) return;

      const willOpen = !currentItem.open;

      triggers.forEach((itemTrigger) => {
        setOpen(itemTrigger, false);
      });

      if (willOpen) {
        setOpen(trigger, true);
      }
    });
  });
}
