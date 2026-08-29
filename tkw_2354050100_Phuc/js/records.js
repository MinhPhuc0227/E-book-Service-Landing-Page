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

  "amount-desc": (a, b) => b.amount - a.amount,
  "amount-asc": (a, b) => a.amount - b.amount,

  "weight-desc": (a, b) => b.weight - a.weight,
  "weight-asc": (a, b) => a.weight - b.weight,
};

const amountFormatter = new Intl.NumberFormat("vi-VN");

const statusLabels = {
  moi: "Mới",
  "dang-xu-ly": "Đang xử lý",
  "da-chot": "Đã chốt",
};

function getStorageRecords() {
  const raw = localStorage.getItem(RECORDS_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveRecords(records) {
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

async function loadRecords() {
  const storedRecords = getStorageRecords();

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
    .filter(
      (record) =>
        state.category === "all" || record.category === state.category,
    )
    .filter(
      (record) => state.status === "all" || record.status === state.status,
    )
    .filter((record) => !query || record.trader.toLowerCase().includes(query))
    .sort(sorters[state.sort]);
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

function buildRow(record) {
  const template = document.getElementById("record-row-template");

  const row = template.content.firstElementChild.cloneNode(true);

  row.querySelector("[data-cell='id']").textContent = record.id;

  row.querySelector("[data-cell='trader']").textContent = record.trader;

  row.querySelector("[data-cell='category']").textContent = record.category;

  row.querySelector("[data-cell='status']").textContent =
    statusLabels[record.status] ?? record.status;

  row.querySelector("[data-cell='weight']").textContent = `${record.weight} kg`;

  row.querySelector("[data-cell='amount']").textContent =
    `${amountFormatter.format(record.amount)} VNĐ`;

  row.querySelector("[data-cell='date']").textContent = record.date;

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = record.id;
  deleteButton.className =
    "btn border border-red-300 text-red-600 hover:bg-red-50";
  deleteButton.textContent = "Xóa";
  deleteButton.setAttribute("aria-label", `Xóa bản ghi ${record.id}`);

  row.querySelector("[data-cell='actions']").append(deleteButton);

  return row;
}

function renderFilters() {
  const categoryFilter = document.getElementById("category-filter");

  const statusFilter = document.getElementById("status-filter");

  categoryFilter.replaceChildren();

  const categoryAll = document.createElement("option");
  categoryAll.value = "all";
  categoryAll.textContent = "Tất cả";
  categoryFilter.append(categoryAll);

  getCategories().forEach((category) => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;

    categoryFilter.append(option);
  });

  categoryFilter.value = state.category;

  statusFilter.replaceChildren();

  const statusAll = document.createElement("option");
  statusAll.value = "all";
  statusAll.textContent = "Tất cả";
  statusFilter.append(statusAll);

  getStatuses().forEach((status) => {
    const option = document.createElement("option");

    option.value = status;
    option.textContent = statusLabels[status] ?? status;

    statusFilter.append(option);
  });

  statusFilter.value = state.status;
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
  const randomPart = Math.floor(Math.random() * 900) + 100;

  return `PC-${new Date().getFullYear()}-${randomPart}`;
}

function resetForm(form) {
  form.reset();
}

function handleDelete(id) {
  const confirmed = window.confirm("Bạn có chắc muốn xóa bản ghi này không?");

  if (!confirmed) {
    return;
  }

  state.records = state.records.filter((record) => record.id !== id);

  saveRecords(state.records);

  render();
}

function handleAddRecord(form) {
  const formData = new FormData(form);

  const trader = String(formData.get("trader") ?? "").trim();

  const category = String(formData.get("category") ?? "").trim();

  const status = String(formData.get("status") ?? "").trim();

  const weight = Number(formData.get("weight"));

  const amount = Number(formData.get("amount"));

  const date = String(formData.get("date") ?? "");

  if (
    !trader ||
    !category ||
    !status ||
    !date ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return;
  }

  const newRecord = {
    id: createRecordId(),
    trader,
    category,
    status,
    weight,
    amount,
    date,
  };

  state.records = [...state.records, newRecord];

  saveRecords(state.records);

  resetForm(form);

  render();
}

function bindEvents() {
  const searchInput = document.getElementById("record-search");

  const categoryFilter = document.getElementById("category-filter");

  const statusFilter = document.getElementById("status-filter");

  const sortSelect = document.getElementById("sort-select");

  const form = document.getElementById("record-form");

  const recordsBody = document.getElementById("records-body");

  const restoreButton = document.getElementById("restore-records");

  searchInput.addEventListener(
    "input",
    debounce((event) => {
      state.query = event.target.value;

      render();
    }, 300),
  );

  categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;

    render();
  });

  statusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;

    render();
  });

  sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;

    render();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    handleAddRecord(form);
  });

  recordsBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='delete']");

    if (!button) {
      return;
    }

    handleDelete(button.dataset.id);
  });

  restoreButton.addEventListener("click", async () => {
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
  });
}

export async function initRecords() {
  const root = document.getElementById("records-body");

  if (!root) {
    return;
  }

  bindEvents();

  // Trạng thái loading được render trước khi fetch
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
