
import { loadTransactions, saveTransactions } from "./storage.js";

let transactions = loadTransactions();

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return `txn${globalThis.crypto.randomUUID().replaceAll("-", "")}`;
  }

  return `txn${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
}

function getTimestamp() {
  return new Date().toISOString();
}

function validateTransactionData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Transaction details are required.");
  }

  const description = typeof data.description === "string" ? data.description : "";
  const category = typeof data.category === "string" ? data.category : "";
  const date = typeof data.date === "string" ? data.date : "";
  const amount = Number(data.amount);

  if (!/^\S(?:.*\S)?$/.test(description) || description.length > 100) {
    throw new Error("Enter a description without leading or trailing spaces.");
  }

  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(String(data.amount))) {
    throw new Error("Enter a valid amount with up to two decimal places.");
  }

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a nonnegative number.");
  }

  if (!/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(category)) {
    throw new Error("Choose a valid category.");
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)) {
    throw new Error("Enter a date in YYYY-MM-DD format.");
  }

  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw new Error("Enter a real calendar date.");
  }

  return {
    description,
    amount,
    category,
    date
  };
}

function persist() {
  if (!saveTransactions(transactions)) {
    throw new Error("Your changes could not be saved. Check browser storage.");
  }
}

export function getTransactions() {
  return transactions.map(transaction => ({ ...transaction }));
}

export function addTransaction(data) {
  const validData = validateTransactionData(data);
  const timestamp = getTimestamp();

  const transaction = {
    id: createId(),
    ...validData,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  transactions = [...transactions, transaction];
  persist();

  return { ...transaction };
}

export function updateTransaction(id, data) {
  const existing = transactions.find(transaction => transaction.id === id);

  if (!existing) {
    throw new Error("Transaction not found.");
  }

  const validData = validateTransactionData(data);

  const updated = {
    ...existing,
    ...validData,
    updatedAt: getTimestamp()
  };

  transactions = transactions.map(transaction =>
    transaction.id === id ? updated : transaction
  );

  persist();

  return { ...updated };
}

export function deleteTransaction(id) {
  const exists = transactions.some(transaction => transaction.id === id);

  if (!exists) {
    throw new Error("Transaction not found.");
  }

  transactions = transactions.filter(transaction => transaction.id !== id);
  persist();
}

export function replaceTransactions(data) {
  if (!Array.isArray(data)) {
    throw new Error("Imported data must be an array.");
  }

  const ids = new Set();

  const validated = data.map(item => {
    const validData = validateTransactionData(item);

    if (
      typeof item.id !== "string" ||
      !item.id.trim() ||
      ids.has(item.id) ||
      typeof item.createdAt !== "string" ||
      Number.isNaN(Date.parse(item.createdAt)) ||
      typeof item.updatedAt !== "string" ||
      Number.isNaN(Date.parse(item.updatedAt))
    ) {
      throw new Error("An imported transaction has invalid IDs or timestamps.");
    }

    ids.add(item.id);

    return {
      id: item.id,
      ...validData,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  });

  const previous = transactions;
  transactions = validated;

  try {
    persist();
  } catch (error) {
    transactions = previous;
    throw error;
  }

  return getTransactions();
}
