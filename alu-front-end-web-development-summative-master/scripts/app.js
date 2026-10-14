
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  replaceTransactions
} from "./state.js";

import {
  loadSettings,
  saveSettings,
  exportTransactions,
  importTransactions
} from "./storage.js";

import {
  validateTransaction,
  compileRegex
} from "./validators.js";

import {
  getVisibleTransactions
} from "./search.js";

import {
  renderDashboard,
  renderTransactions,
  showMessage
} from "./ui.js";

let settings = loadSettings();

const form = document.getElementById("transaction-form");
const settingsForm = document.getElementById("settings-form");
const transactionList = document.getElementById("transaction-list");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const caseSensitiveInput = document.getElementById("case-sensitive");

const fields = {
  description: document.getElementById("description"),
  amount: document.getElementById("amount"),
  category: document.getElementById("category"),
  date: document.getElementById("date")
};

const errorElements = {
  description: document.getElementById("description-error"),
  amount: document.getElementById("amount-error"),
  category: document.getElementById("category-error"),
  date: document.getElementById("date-error")
};

function refreshDashboard() {
  const transactions = getTransactions();
  const query = searchInput?.value || "";
  const selectedCategory = categoryFilter?.value || "all";
  const sort = sortSelect?.value || "date-desc";
  const caseSensitive = Boolean(caseSensitiveInput?.checked);

  renderDashboard(transactions, settings);

  const visibleResult = getVisibleTransactions(transactions, {
    query,
    category: selectedCategory === "all" ? "" : selectedCategory,
    sortBy: sort,
    caseSensitive
  });

  if (visibleResult.error) {
    showMessage("search-error", visibleResult.error, "error");
    return;
  }

  showMessage("search-error", "");

  renderTransactions(
    visibleResult.results,
    settings,
    query,
    caseSensitive
  );
}

function clearErrors() {
  for (const [name, element] of Object.entries(errorElements)) {
    if (element) element.textContent = "";
    if (fields[name]) fields[name].removeAttribute("aria-invalid");
  }

  showMessage("form-feedback", "");
}

function displayValidationErrors(errors) {
  for (const [name, message] of Object.entries(errors)) {
    if (errorElements[name]) {
      errorElements[name].textContent = message;
    }

    if (fields[name]) {
      fields[name].setAttribute("aria-invalid", "true");
    }
  }

  const firstInvalidField = Object.keys(errors).find(name => fields[name]);

  if (firstInvalidField) {
    fields[firstInvalidField].focus();
  }

  showMessage("form-feedback", "Please correct the highlighted fields.", "error");
}

function resetTransactionForm() {
  form?.reset();

  const idField = document.getElementById("transaction-id");
  if (idField) idField.value = "";

  const submitButton = form?.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = "Save transaction";

  clearErrors();
}

function populateTransactionForm(id) {
  const transaction = getTransactions().find(item => item.id === id);

  if (!transaction || !form) return;

  clearErrors();

  const idField = document.getElementById("transaction-id");
  if (idField) idField.value = transaction.id;

  fields.description.value = transaction.description || "";
  fields.amount.value = String(transaction.amount ?? "");
  fields.category.value = transaction.category || "";
  fields.date.value = transaction.date || "";

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = "Update transaction";

  form.scrollIntoView({ behavior: "smooth", block: "start" });
  fields.description.focus();

  showMessage("form-feedback", "Editing transaction.", "info");
}

function updateCategoryOptions() {
  const categories = [
    "Food",
    "Transport",
    "Housing",
    "Education",
    "Health",
    "Shopping",
    "Entertainment",
    "Utilities",
    "Other"
  ];

  for (const select of [fields.category, categoryFilter]) {
    if (!select) continue;

    const previousValue = select.value;
    const firstOption = select.options[0];
    select.replaceChildren();

    if (select === categoryFilter) {
      const option = document.createElement("option");
      option.value = "all";
      option.textContent = "All categories";
      select.append(option);
    } else if (firstOption) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Choose a category";
      select.append(option);
    }

    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.append(option);
    }

    if ([...select.options].some(option => option.value === previousValue)) {
      select.value = previousValue;
    }
  }
}

function populateSettingsForm() {
  const budget = document.getElementById("budget-cap");
  const currency = document.getElementById("currency-select");
  const usdRate = document.getElementById("usd-rate");
  const eurRate = document.getElementById("eur-rate");

  if (budget) budget.value = String(settings.budgetCap);
  if (currency) currency.value = settings.currency;
  if (usdRate) usdRate.value = String(settings.usdRate);
  if (eurRate) eurRate.value = String(settings.eurRate);
}

form?.addEventListener("submit", event => {
  event.preventDefault();
  clearErrors();

  const data = {
    description: fields.description.value,
    amount: fields.amount.value,
    category: fields.category.value,
    date: fields.date.value
  };

  const result = validateTransaction(data);

  if (!result.valid) {
    displayValidationErrors(result.errors);
    return;
  }

  const idField = document.getElementById("transaction-id");
  const existingId = idField?.value;

  try {
    if (existingId) {
      updateTransaction(existingId, data);
      showMessage("form-feedback", "Transaction updated successfully.", "success");
    } else {
      addTransaction(data);
      showMessage("form-feedback", "Transaction added successfully.", "success");
    }

    resetTransactionForm();
    refreshDashboard();
    showMessage("transaction-feedback", "Your transactions have been updated.", "success");
  } catch (error) {
    showMessage(
      "form-feedback",
      error.message || "Unable to save this transaction.",
      "error"
    );
  }
});

form?.addEventListener("reset", () => {
  window.setTimeout(() => {
    const idField = document.getElementById("transaction-id");
    if (idField) idField.value = "";

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = "Save transaction";

    clearErrors();
  }, 0);
});

for (const field of Object.values(fields)) {
  field?.addEventListener("input", () => {
    field.removeAttribute("aria-invalid");
  });
}

transactionList?.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (!id) return;

  if (action === "edit") {
    populateTransactionForm(id);
    return;
  }

  if (action === "delete") {
    const transaction = getTransactions().find(item => item.id === id);
    if (!transaction) return;

    const confirmed = window.confirm(
      `Delete "${transaction.description}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      deleteTransaction(id);
      refreshDashboard();
      showMessage("transaction-feedback", "Transaction deleted.", "success");
    } catch (error) {
      showMessage(
        "transaction-feedback",
        error.message || "Unable to delete this transaction.",
        "error"
      );
    }
  }
});

function updateSearch() {
  const query = searchInput?.value || "";
  const caseSensitive = Boolean(caseSensitiveInput?.checked);
  const result = compileRegex(query, caseSensitive);

  const searchError = document.getElementById("search-error");

  if (searchError) {
    searchError.textContent = result.error || "";
  }

  if (searchInput) {
    searchInput.setAttribute("aria-invalid", result.error ? "true" : "false");
  }

  if (result.error) return;

  refreshDashboard();
}

searchInput?.addEventListener("input", updateSearch);
categoryFilter?.addEventListener("change", refreshDashboard);
sortSelect?.addEventListener("change", refreshDashboard);
caseSensitiveInput?.addEventListener("change", updateSearch);

const addTransactionButton = document.getElementById("add-transaction-button");

addTransactionButton?.addEventListener("click", () => {
  resetTransactionForm();
  form?.scrollIntoView({ behavior: "smooth", block: "start" });
  fields.description.focus();
});

settingsForm?.addEventListener("submit", event => {
  event.preventDefault();

  const budgetCap = Number(document.getElementById("budget-cap")?.value);
  const currency = document.getElementById("currency-select")?.value;
  const usdRate = Number(document.getElementById("usd-rate")?.value);
  const eurRate = Number(document.getElementById("eur-rate")?.value);

  if (!Number.isFinite(budgetCap) || budgetCap < 0) {
    showMessage("settings-feedback", "Budget must be zero or greater.", "error");
    return;
  }

  if (
    !Number.isFinite(usdRate) ||
    usdRate <= 0 ||
    !Number.isFinite(eurRate) ||
    eurRate <= 0
  ) {
    showMessage("settings-feedback", "Exchange rates must be greater than zero.", "error");
    return;
  }

  if (!["RWF", "USD", "EUR"].includes(currency)) {
    showMessage("settings-feedback", "Please select a supported currency.", "error");
    return;
  }

  const nextSettings = { budgetCap, currency, usdRate, eurRate };

  if (!saveSettings(nextSettings)) {
    showMessage("settings-feedback", "Unable to save settings in this browser.", "error");
    return;
  }

  settings = nextSettings;
  refreshDashboard();
  showMessage("settings-feedback", "Settings saved successfully.", "success");
});

document.getElementById("export-button")?.addEventListener("click", () => {
  try {
    exportTransactions(getTransactions());
    showMessage("settings-feedback", "Transactions exported successfully.", "success");
  } catch (error) {
    showMessage("settings-feedback", error.message || "Export failed.", "error");
  }
});

const importButton = document.getElementById("import-button");
const importFile = document.getElementById("import-file");

importButton?.addEventListener("click", () => importFile?.click());

importFile?.addEventListener("change", async () => {
  const file = importFile.files?.[0];
  if (!file) return;

  try {
    const imported = await importTransactions(file);
    replaceTransactions(imported);
    refreshDashboard();
    showMessage("settings-feedback", "Transactions imported successfully.", "success");
  } catch (error) {
    showMessage(
      "settings-feedback",
      error.message || "The selected file could not be imported.",
      "error"
    );
  } finally {
    importFile.value = "";
  }
});

updateCategoryOptions();
populateSettingsForm();

const dateInput = fields.date;

if (dateInput && !dateInput.value) {
  const today = new Date();
  dateInput.value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
}

refreshDashboard();
