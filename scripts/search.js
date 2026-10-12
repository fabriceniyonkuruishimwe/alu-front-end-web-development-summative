
import { compileRegex } from "./validators.js";

export function searchTransactions(transactions, query, caseSensitive = false) {
  const { regex, error } = compileRegex(query, caseSensitive);

  if (error) {
    return {
      results: [],
      error
    };
  }

  if (!regex) {
    return {
      results: [...transactions],
      error: ""
    };
  }

  const results = transactions.filter(transaction => {
    const searchableText = [
      transaction.description,
      transaction.category,
      transaction.date,
      String(transaction.amount)
    ].join(" ");

    regex.lastIndex = 0;
    return regex.test(searchableText);
  });

  return {
    results,
    error: ""
  };
}

export function sortTransactions(transactions, sortBy = "date-desc") {
  const sorted = [...transactions];

  const sorters = {
    "date-asc": (a, b) => a.date.localeCompare(b.date),
    "date-desc": (a, b) => b.date.localeCompare(a.date),
    "description-asc": (a, b) => a.description.localeCompare(b.description),
    "description-desc": (a, b) => b.description.localeCompare(a.description),
    "amount-asc": (a, b) => Number(a.amount) - Number(b.amount),
    "amount-desc": (a, b) => Number(b.amount) - Number(a.amount)
  };

  const sorter = sorters[sortBy] || sorters["date-desc"];

  return sorted.sort(sorter);
}

export function filterByCategory(transactions, category) {
  if (!category) {
    return [...transactions];
  }

  return transactions.filter(transaction => transaction.category === category);
}

export function getVisibleTransactions(transactions, options = {}) {
  const {
    query = "",
    caseSensitive = false,
    category = "",
    sortBy = "date-desc"
  } = options;

  const searchResult = searchTransactions(transactions, query, caseSensitive);

  if (searchResult.error) {
    return {
      results: [],
      error: searchResult.error
    };
  }

  const categoryResults = filterByCategory(searchResult.results, category);

  return {
    results: sortTransactions(categoryResults, sortBy),
    error: ""
  };
}

export function highlightText(element, text, query, caseSensitive = false) {
  element.replaceChildren();

  const value = String(text ?? "");
  const { regex, error } = compileRegex(query, caseSensitive);

  if (!regex || error) {
    element.textContent = value;
    return;
  }

  regex.lastIndex = 0;

  let lastIndex = 0;
  let match;
  let count = 0;

  while ((match = regex.exec(value)) !== null && count < 500) {
    const matchedText = match[0];

    if (!matchedText) {
      regex.lastIndex += 1;
      continue;
    }

    element.append(document.createTextNode(value.slice(lastIndex, match.index)));

    const mark = document.createElement("mark");
    mark.textContent = matchedText;
    element.append(mark);

    lastIndex = match.index + matchedText.length;
    count += 1;
  }

  element.append(document.createTextNode(value.slice(lastIndex)));
}
