
const STORAGE_KEY = "pennywiseTransactions";
const SETTINGS_KEY = "pennywiseSettings";

export function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Unable to load transactions:", error);
    return [];
  }
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error("Unable to save transactions:", error);
    return false;
  }
}

export function loadSettings() {
  const defaults = {
    budgetCap: 120000,
    currency: "RWF",
    usdRate: 1400,
    eurRate: 1600
  };

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
      return defaults;
    }

    const parsed = JSON.parse(saved);

    return {
      budgetCap: Number.isFinite(parsed.budgetCap) && parsed.budgetCap >= 0 ? parsed.budgetCap : defaults.budgetCap,
      currency: ["RWF", "USD", "EUR"].includes(parsed.currency) ? parsed.currency : defaults.currency,
      usdRate: Number.isFinite(parsed.usdRate) && parsed.usdRate > 0 ? parsed.usdRate : defaults.usdRate,
      eurRate: Number.isFinite(parsed.eurRate) && parsed.eurRate > 0 ? parsed.eurRate : defaults.eurRate
    };
  } catch (error) {
    console.error("Unable to load settings:", error);
    return defaults;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Unable to save settings:", error);
    return false;
  }
}

export function exportTransactions(transactions) {
  const content = JSON.stringify(transactions, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "pennywise-transactions.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importTransactions(file) {
  const content = await file.text();
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error("The JSON file must contain an array of transactions.");
  }

  return parsed;
}

