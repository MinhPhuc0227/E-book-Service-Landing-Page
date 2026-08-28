// js/nav.js

export function initToTop() {
  const button = document.getElementById("to-top");

  if (!button) return;

  const updateVisibility = () => {
    button.classList.toggle("hidden", window.scrollY <= 400);
  };

  window.addEventListener("scroll", updateVisibility, { passive: true });

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  updateVisibility();
}
