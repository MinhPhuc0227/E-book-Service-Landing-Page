const RECORDS_STORAGE_KEY = "bookly-records";

const state = {
  records: [],
  query: "",
  category: "all",
  status: "all",
  sort: "date-desc",
  loading: true,
  error: null,
};

const sorters = {
  "date-desc": (a, b) => b.date.localeCompare(a.date),

  "date-asc": (a, b) => a.date.localeCompare(b.date),

  "views-desc": (a, b) => b.views - a.views,

  "views-asc": (a, b) => a.views - b.views,

  "price-desc": (a, b) => b.price - a.price,

  "price-asc": (a, b) => a.price - b.price,
};

const amountFormatter = new Intl.NumberFormat("vi-VN");

function getStoredRecords() {
  const raw = localStorage.getItem(RECORDS_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const records = JSON.parse(raw);

    return Array.isArray(records) ? records : null;
  } catch {
    return null;
  }
}

function saveRecords(records) {
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

async function loadRecords() {
  const storedRecords = getStoredRecords();

  // Những lần sau đọc trực tiếp từ localStorage
  if (storedRecords) {
    return storedRecords;
  }

  // Lần đầu tiên đọc từ JSON
  const response = await fetch("./data/records.json");

  // fetch không tự throw khi nhận 404
  if (!response.ok) {
    throw new Error(`Máy chủ trả về ${response.status}`);
  }

  const records = await response.json();

  if (!Array.isArray(records)) {
    throw new Error("Dữ liệu JSON không đúng định dạng.");
  }

  // Lưu lại để những lần sau đọc từ localStorage
  saveRecords(records);

  return records;
}

function visibleRecords() {
  const query = state.query.trim().toLowerCase();

  return [...state.records]
    .filter((record) => {
      if (!query) {
        return true;
      }

      return (
        record.title.toLowerCase().includes(query) ||
        record.author.toLowerCase().includes(query)
      );
    })
    .filter((record) => {
      return state.category === "all" || record.category === state.category;
    })
    .filter((record) => {
      return state.status === "all" || record.status === state.status;
    })
    .sort(sorters[state.sort]);
}

function renderFilters() {
  const categoryFilter = document.getElementById("category-filter");

  const statusFilter = document.getElementById("status-filter");

  categoryFilter.replaceChildren();

  const categoryAll = document.createElement("option");

  categoryAll.value = "all";
  categoryAll.textContent = "Tất cả thể loại";

  categoryFilter.append(categoryAll);

  const categories = [
    ...new Set(state.records.map((record) => record.category)),
  ].sort((a, b) => a.localeCompare(b, "vi"));

  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;

    categoryFilter.append(option);
  });

  categoryFilter.value = state.category;

  statusFilter.replaceChildren();

  const statusAll = document.createElement("option");

  statusAll.value = "all";
  statusAll.textContent = "Tất cả trạng thái";

  statusFilter.append(statusAll);

  Object.entries(statusLabels).forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;

    statusFilter.append(option);
  });

  statusFilter.value = state.status;
}

function getCategories() {
  return [...new Set(state.records.map((record) => record.category))].sort(
    (a, b) => a.localeCompare(b, "vi"),
  );
}

function getStatuses() {
  return [...new Set(state.records.map((record) => record.status))].sort(
    (a, b) => a.localeCompare(b, "vi"),
  );
}

function createSkeletonRow() {
  const row = document.createElement("tr");

  row.className = "border-b border-line dark:border-line-invert animate-pulse";

  for (let index = 0; index < 8; index += 1) {
    const cell = document.createElement("td");

    cell.className = "p-4";

    const skeleton = document.createElement("div");

    skeleton.className = "h-4 w-24 rounded bg-surface-alt";

    cell.append(skeleton);
    row.append(cell);
  }

  return row;
}

const statusLabels = {
  available: "Có sẵn",
  limited: "Giới hạn",
  unavailable: "Không có sẵn",
};

function buildRow(record) {
  const template = document.getElementById("record-row-template");

  const row = template.content.firstElementChild.cloneNode(true);

  row.querySelector("[data-cell='id']").textContent = record.id;

  row.querySelector("[data-cell='title']").textContent = record.title;

  row.querySelector("[data-cell='author']").textContent = record.author;

  row.querySelector("[data-cell='category']").textContent = record.category;

  row.querySelector("[data-cell='status']").textContent =
    statusLabels[record.status] ?? record.status;

  row.querySelector("[data-cell='views']").textContent =
    record.views.toLocaleString("vi-VN");

  row.querySelector("[data-cell='price']").textContent =
    `${record.price.toLocaleString("vi-VN")} VNĐ`;

  row.querySelector("[data-cell='date']").textContent = record.date;

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";

  deleteButton.dataset.action = "delete";

  deleteButton.dataset.id = record.id;

  deleteButton.className =
    "btn border border-red-300 text-red-600 hover:bg-red-50";

  deleteButton.textContent = "Xóa";

  deleteButton.setAttribute("aria-label", `Xóa sách ${record.title}`);

  row.querySelector("[data-cell='actions']").append(deleteButton);

  return row;
}

function renderLoading() {
  const tbody = document.getElementById("records-body");

  tbody.replaceChildren(
    createSkeletonRow(),
    createSkeletonRow(),
    createSkeletonRow(),
    createSkeletonRow(),
    createSkeletonRow(),
  );
}

function renderError() {
  const tbody = document.getElementById("records-body");

  tbody.replaceChildren();

  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 8;
  cell.className = "p-8 text-center";

  const title = document.createElement("p");

  title.className = "font-semibold text-red-600";
  title.textContent = "Không thể tải dữ liệu.";

  const message = document.createElement("p");

  message.className = "mt-2 text-sm text-muted";
  message.textContent = state.error;

  cell.append(title, message);
  row.append(cell);
  tbody.append(row);
}

function renderEmpty() {
  const tbody = document.getElementById("records-body");

  tbody.replaceChildren();

  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 8;
  cell.className = "p-8 text-center text-muted";

  cell.textContent = "Không có bản ghi phù hợp với điều kiện hiện tại.";

  row.append(cell);
  tbody.append(row);
}

function renderData() {
  const tbody = document.getElementById("records-body");

  const records = visibleRecords();

  if (!records.length) {
    renderEmpty();
    return;
  }

  const rows = records.map(buildRow);

  tbody.replaceChildren(...rows);
}

function renderStatus() {
  const statusBox = document.getElementById("records-status");

  statusBox.replaceChildren();

  const text = document.createElement("p");

  text.className = "text-sm text-muted";

  if (state.loading) {
    text.textContent = "Đang tải dữ liệu...";
  } else if (state.error) {
    text.textContent = "Đã xảy ra lỗi khi tải dữ liệu.";
  } else {
    const count = visibleRecords().length;

    text.textContent = `Đang hiển thị ${count} bản ghi.`;
  }

  statusBox.append(text);
}

function render() {
  renderFilters();

  renderStatus();

  if (state.loading) {
    renderLoading();
    return;
  }

  if (state.error) {
    renderError();
    return;
  }

  renderData();
}

function debounce(fn, delay = 300) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

function createRecordId() {
  const numbers = state.records.map((record) => {
    const match = record.id.match(/(\d+)$/);

    return match ? Number(match[1]) : 0;
  });

  const nextNumber = Math.max(0, ...numbers) + 1;

  return `BK-2607-${String(nextNumber).padStart(3, "0")}`;
}

function handleAddRecord(form) {
  const formData = new FormData(form);

  const title = String(formData.get("title") ?? "").trim();

  const author = String(formData.get("author") ?? "").trim();

  const category = String(formData.get("category") ?? "").trim();

  const status = String(formData.get("status") ?? "");

  const views = Number(formData.get("views"));

  const price = Number(formData.get("price"));

  const date = String(formData.get("date") ?? "");

  if (
    !title ||
    !author ||
    !category ||
    !status ||
    !date ||
    !Number.isFinite(views) ||
    views < 0 ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return;
  }

  const newRecord = {
    id: createRecordId(),
    title,
    author,
    category,
    status,
    views,
    price,
    date,
  };

  state.records = [...state.records, newRecord];

  saveRecords(state.records);

  form.reset();

  render();
}

function resetForm(form) {
  form.reset();
}

function handleDelete(id) {
  const record = state.records.find((item) => item.id === id);

  if (!record) {
    return;
  }

  const confirmed = window.confirm(
    `Bạn có chắc muốn xóa "${record.title}" không?`,
  );

  if (!confirmed) {
    return;
  }

  state.records = state.records.filter((item) => item.id !== id);

  saveRecords(state.records);

  render();
}

async function restoreRecords() {
  state.loading = true;
  state.error = null;

  render();

  try {
    const response = await fetch("./data/records.json");

    if (!response.ok) {
      throw new Error(`Máy chủ trả về ${response.status}`);
    }

    const records = await response.json();

    if (!Array.isArray(records)) {
      throw new Error("Dữ liệu JSON không đúng định dạng.");
    }

    state.records = records;

    saveRecords(state.records);
  } catch (error) {
    state.error = `Không thể khôi phục dữ liệu: ${error.message}`;
  } finally {
    state.loading = false;

    render();
  }
}

function bindEvents() {
  const searchInput = document.getElementById("record-search");

  const categoryFilter = document.getElementById("category-filter");

  const statusFilter = document.getElementById("status-filter");

  const sortSelect = document.getElementById("sort-select");

  const form = document.getElementById("record-form");

  const recordsBody = document.getElementById("records-body");

  const restoreButton = document.getElementById("restore-records");

  /*
   * SEARCH + DEBOUNCE
   */
  searchInput.addEventListener(
    "input",
    debounce((event) => {
      state.query = event.target.value;

      render();
    }, 300),
  );

  /*
   * CATEGORY
   */
  categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;

    render();
  });

  /*
   * STATUS
   */
  statusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;

    render();
  });

  /*
   * SORT
   */
  sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;

    render();
  });

  /*
   * ADD
   */
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    handleAddRecord(form);
  });

  /*
   * DELETE
   */
  recordsBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='delete']");

    if (!button) {
      return;
    }

    handleDelete(button.dataset.id);
  });

  /*
   * RESTORE
   */
  restoreButton.addEventListener("click", () => {
    restoreRecords();
  });
}

export async function initRecords() {
  const recordsBody = document.getElementById("records-body");

  if (!recordsBody) {
    return;
  }

  bindEvents();

  // Nhiệm vụ 1: loading trước
  render();

  try {
    state.records = await loadRecords();
  } catch (error) {
    state.error = `Không tải được dữ liệu: ${error.message}`;
  } finally {
    state.loading = false;

    render();
  }
}
