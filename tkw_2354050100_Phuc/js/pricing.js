const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function initPricing() {
  const root = document.getElementById("bang-gia");

  if (!root) return;

  const toggle = root.querySelector("[data-price-toggle]");
  const prices = root.querySelectorAll("[data-price]");
  const periods = root.querySelectorAll("[data-price-period]");

  if (!toggle) return;
  if (!prices.length) return;

  const updatePrices = (isYearly) => {
    prices.forEach((price) => {
      const rawValue = isYearly ? price.dataset.yearly : price.dataset.monthly;

      const value = Number(rawValue);

      if (!Number.isFinite(value)) return;

      price.textContent = PRICE_FORMATTER.format(value);
    });

    periods.forEach((period) => {
      period.textContent = isYearly ? "/năm" : "/tháng";
    });

    toggle.setAttribute("aria-checked", String(isYearly));

    toggle.setAttribute(
      "aria-label",
      isYearly ? "Đang xem giá theo năm" : "Đang xem giá theo tháng",
    );
  };

  // Trạng thái ban đầu: theo tháng
  updatePrices(false);

  toggle.addEventListener("click", () => {
    const isYearly = toggle.getAttribute("aria-checked") === "true";

    updatePrices(!isYearly);
  });
}
