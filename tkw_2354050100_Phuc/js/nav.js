// NÚT LÊN ĐẦU TRANG
export function initToTop() {
  const button = document.getElementById("to-top");

  if (!button) return;

  const updateVisibility = () => {
    button.classList.toggle("hidden", window.scrollY <= 400);
  };

  window.addEventListener("scroll", updateVisibility, {
    passive: true,
  });

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  updateVisibility();
}

// NAV BAR
export function initNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (!header || !toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("hidden", !open);

    toggle.setAttribute("aria-expanded", String(open));

    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");

    document.body.classList.toggle("overflow-hidden", open);
  };

  // Trạng thái ban đầu
  setOpen(false);

  // Mở / đóng menu bằng nút hamburger
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";

    setOpen(!isOpen);
  });

  // Đóng bằng phím ESC
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        setOpen(false);
        toggle.focus();
      }
    }
  });

  // Click ra ngoài header → đóng menu
  document.addEventListener("click", (event) => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";

    if (!isOpen) return;

    if (!header.contains(event.target)) {
      setOpen(false);
    }
  });

  // Khi chuyển sang desktop → đóng menu
  const desktopMedia = window.matchMedia("(min-width: 1024px)");

  const handleDesktopChange = (event) => {
    if (event.matches) {
      setOpen(false);
    }
  };

  desktopMedia.addEventListener("change", handleDesktopChange);

  // Click link trong menu mobile → đóng menu
  menu.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (!link) return;

    setOpen(false);
  });
}

// CUỘN TRANG
export function initHeaderOnScroll() {
  const header = document.querySelector(".site-header");
  const sentinel = document.getElementById("nav-sentinel");

  if (!header || !sentinel) return;

  const observer = new IntersectionObserver(([entry]) => {
    const scrolled = !entry.isIntersecting;

    header.classList.toggle("shadow-sm", scrolled);
  });

  observer.observe(sentinel);
}
