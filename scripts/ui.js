
import { highlightText } from "./search.js";

export function formatMoney(amount, settings = {}) {
  const currency = settings.currency || "RWF";
  let value = Number(amount) || 0;

  if (currency === "USD") {
    value /= Number(settings.usdRate) || 1400;
  } else if (currency === "EUR") {
    value /= Number(settings.eurRate) || 1600;
  }

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "RWF" ? 0 : 2
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function getMonthTransactions(transactions) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return transactions.filter(transaction => {
    const date = new Date(`${transaction.date}T00:00:00`);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

export function renderDashboard(transactions, settings = {}) {
  const totalSpending = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  const monthlyTransactions = getMonthTransactions(transactions);
  const monthlySpending = monthlyTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  const budgetCap = Number(settings.budgetCap) || 0;
  const remaining = budgetCap - monthlySpending;
  const progress = budgetCap > 0
    ? Math.min((monthlySpending / budgetCap) * 100, 100)
    : 0;

  const totalElement = document.getElementById("total-spending");
  const countElement = document.getElementById("transaction-count");
  const remainingElement = document.getElementById("budget-remaining");
  const statusElement = document.getElementById("budget-status");
  const progressElement = document.getElementById("budget-progress-fill");
  const topCategoryElement = document.getElementById("top-category");

  if (totalElement) {
    totalElement.textContent = formatMoney(totalSpending, settings);
  }

  if (countElement) {
    countElement.textContent = String(transactions.length);
  }

  if (remainingElement) {
    remainingElement.textContent = formatMoney(remaining, settings);
  }

  if (statusElement) {
    statusElement.textContent = budgetCap <= 0
      ? "Set a monthly budget"
      : remaining < 0
        ? "Budget exceeded"
        : remaining === 0
          ? "Budget fully used"
          : `${progress.toFixed(0)}% of monthly budget used`;
  }

  if (progressElement) {
    progressElement.style.width = `${progress}%`;
    progressElement.setAttribute("aria-valuenow", String(progress));
  }

  if (progressElement?.parentElement) {
    progressElement.parentElement.setAttribute("role", "progressbar");
    progressElement.parentElement.setAttribute("aria-valuemin", "0");
    progressElement.parentElement.setAttribute("aria-valuemax", "100");
    progressElement.parentElement.setAttribute("aria-valuenow", String(progress));
  }

  const categoryTotals = {};

  for (const transaction of monthlyTransactions) {
    const category = transaction.category || "Other";
    categoryTotals[category] =
      (categoryTotals[category] || 0) + Number(transaction.amount || 0);
  }

  const topCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0];

  if (topCategoryElement) {
    topCategoryElement.textContent = topCategory
      ? topCategory[0]
      : "No spending yet";
  }

  renderSpendingChart(transactions, settings);
}

export function renderSpendingChart(transactions, settings = {}) {
  const chart = document.getElementById("spending-chart");
  const summary = document.getElementById("trend-summary");

  if (!chart) return;

  chart.replaceChildren();

  const days = [];

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");

    const total = transactions
      .filter(transaction => transaction.date === key)
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    days.push({
      key,
      label: date.toLocaleDateString("en", { weekday: "short" }),
      total
    });
  }

  const maximum = Math.max(...days.map(day => day.total), 1);

  for (const day of days) {
    const column = document.createElement("div");
    column.className = "chart-bar";

    const value = document.createElement("span");
    value.className = "chart-value";
    value.textContent = formatMoney(day.total, settings);

    const bar = document.createElement("div");
    bar.className = "chart-bar-fill";
    bar.style.height = `${day.total > 0 ? Math.max((day.total / maximum) * 100, 4) : 0}%`;

    const label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = day.label;

    column.setAttribute(
      "aria-label",
      `${day.key}: ${formatMoney(day.total, settings)}`
    );

    column.append(value, bar, label);
    chart.append(column);
  }

  if (summary) {
    const weeklyTotal = days.reduce((sum, day) => sum + day.total, 0);
    summary.textContent =
      `Last 7 days: ${formatMoney(weeklyTotal, settings)}`;
  }

  const chartData = document.getElementById("chart-data");

  if (chartData) {
    chartData.textContent = days
      .map(day => `${day.key}: ${day.total}`)
      .join("\n");
  }
}

export function renderTransactions(
  transactions,
  settings = {},
  query = "",
  caseSensitive = false
) {
  const list = document.getElementById("transaction-list");

  if (!list) return;

  list.replaceChildren();

  if (transactions.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "No transactions found.";
    cell.className = "empty-state";

    row.append(cell);
    list.append(row);
    return;
  }

  for (const transaction of transactions) {
    const row = document.createElement("tr");

    const description = document.createElement("td");
    highlightText(description, transaction.description || "", query, caseSensitive);

    const amount = document.createElement("td");
    amount.textContent = formatMoney(transaction.amount, settings);

    const category = document.createElement("td");
    category.textContent = transaction.category || "Other";

    const date = document.createElement("td");
    date.textContent = transaction.date || "";

    const actions = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.dataset.action = "edit";
    editButton.dataset.id = transaction.id;
    editButton.setAttribute(
      "aria-label",
      `Edit ${transaction.description || "transaction"}`
    );

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = transaction.id;
    deleteButton.setAttribute(
      "aria-label",
      `Delete ${transaction.description || "transaction"}`
    );

    actions.append(editButton, deleteButton);
    row.append(description, amount, category, date, actions);
    list.append(row);
  }
}

export function showMessage(elementId, message, type = "info") {
  const element = document.getElementById(elementId);

  if (!element) return;

  element.textContent = message;
  element.dataset.type = type;
}
