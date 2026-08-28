// Dark mode
const THEME_KEY = "theme";

export function initTheme() {
  const toggle = document.getElementById("theme-toggle");

  if (!toggle) return;

  const updateButton = (dark) => {
    toggle.setAttribute("aria-checked", String(dark));

    toggle.setAttribute(
      "aria-label",
      dark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối",
    );

    const icon = toggle.querySelector("[data-theme-icon]");

    if (icon) {
      icon.textContent = dark ? "☀" : "☾";
    }
  };

  const applyTheme = (dark) => {
    document.documentElement.classList.toggle("dark", dark);

    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");

    updateButton(dark);
  };

  const currentDark = document.documentElement.classList.contains("dark");

  updateButton(currentDark);

  toggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");

    applyTheme(!isDark);
  });
}
