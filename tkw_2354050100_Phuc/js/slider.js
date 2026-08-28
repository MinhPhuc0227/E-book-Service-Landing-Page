export function initSlider() {
  const root = document.getElementById("testimonial-slider");

  if (!root) return;

  const track = root.querySelector("[data-slider-track]");
  const slides = [...root.querySelectorAll("[data-slide]")];
  const prevButton = root.querySelector("[data-slider-prev]");
  const nextButton = root.querySelector("[data-slider-next]");
  const dotsContainer = root.querySelector("[data-slider-dots]");

  if (
    !track ||
    !slides.length ||
    !prevButton ||
    !nextButton ||
    !dotsContainer
  ) {
    return;
  }

  let index = 0;
  let timerId = null;

  /*
   * Track rộng bằng tổng số slide.
   * Ví dụ có 3 slide → track rộng 300%.
   */
  track.style.width = `${slides.length * 100}%`;

  /*
   * Mỗi slide rộng đúng 1 phần của track.
   * 3 slide → mỗi slide 33.333%.
   */
  slides.forEach((slide) => {
    slide.style.width = `${100 / slides.length}%`;
  });

  const go = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;

    /*
     * Vì track rộng N lần viewport,
     * mỗi slide chiếm 100 / N % của track.
     */
    const offset = (index * 100) / slides.length;

    track.style.transform = `translateX(-${offset}%)`;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;

      slide.toggleAttribute("inert", !active);

      slide.setAttribute("aria-hidden", String(!active));
    });

    const dots = dotsContainer.querySelectorAll("[data-slider-dot]");

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;

      dot.setAttribute("aria-current", active ? "true" : "false");

      dot.setAttribute("aria-label", `Xem cảm nhận ${dotIndex + 1}`);

      dot.classList.toggle("bg-brand-600", active);

      dot.classList.toggle("bg-transparent", !active);

      dot.classList.toggle("scale-125", active);
    });
  };

  /*
   * Sinh dots từ số slide thật.
   */
  slides.forEach((_, slideIndex) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.dataset.sliderDot = "";

    dot.className =
      "size-3 rounded-full border border-brand-600 bg-transparent transition-all duration-200";

    dot.setAttribute("aria-label", `Xem cảm nhận ${slideIndex + 1}`);

    dot.setAttribute("aria-current", "false");

    dot.addEventListener("click", () => {
      go(slideIndex);
      start();
    });

    dotsContainer.append(dot);
  });

  prevButton.addEventListener("click", () => {
    go(index - 1);
    start();
  });

  nextButton.addEventListener("click", () => {
    go(index + 1);
    start();
  });

  const stop = () => {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const start = () => {
    stop();

    if (slides.length <= 1) return;

    timerId = setInterval(() => {
      go(index + 1);
    }, 5000);
  };

  /*
   * Trạng thái ban đầu
   */
  go(0);
  start();

  /*
   * Hover → dừng
   */
  root.addEventListener("mouseenter", stop);

  root.addEventListener("mouseleave", start);

  /*
   * Keyboard → dừng autoplay
   */
  root.addEventListener("focusin", stop);

  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) {
      start();
    }
  });

  /*
   * Chuyển tab → dừng
   */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });
}
