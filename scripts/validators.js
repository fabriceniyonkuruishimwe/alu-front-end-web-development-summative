
export const patterns = {
  description: /^\S(?:.*\S)?$/,
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  duplicateWords: /\b(\w+)\s+\1\b/i
};

export function validateDescription(value) {
  const text = String(value ?? "");

  if (!text) {
    return "Enter a description.";
  }

  if (!patterns.description.test(text)) {
    return "Remove leading and trailing spaces.";
  }

  if (text.length > 100) {
    return "Description must be 100 characters or fewer.";
  }

  return "";
}

export function validateAmount(value) {
  const text = String(value ?? "");

  if (!text) {
    return "Enter an amount.";
  }

  if (!patterns.amount.test(text)) {
    return "Enter a nonnegative amount with up to two decimal places.";
  }

  if (!Number.isFinite(Number(text))) {
    return "Enter a valid number.";
  }

  return "";
}

export function validateDate(value) {
  const text = String(value ?? "");

  if (!patterns.date.test(text)) {
    return "Enter a date in YYYY-MM-DD format.";
  }

  const date = new Date(`${text}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== text
  ) {
    return "Enter a real calendar date.";
  }

  return "";
}

export function validateCategory(value) {
  const text = String(value ?? "");

  if (!patterns.category.test(text)) {
    return "Choose a valid category.";
  }

  return "";
}

export function findDuplicateWords(value) {
  return patterns.duplicateWords.test(String(value ?? ""));
}

export function validateTransaction(data) {
  const errors = {
    description: validateDescription(data.description),
    amount: validateAmount(data.amount),
    category: validateCategory(data.category),
    date: validateDate(data.date)
  };

  return {
    valid: Object.values(errors).every(error => !error),
    errors,
    duplicateWords: findDuplicateWords(data.description)
  };
}

export function compileRegex(input, caseSensitive = false) {
  if (!input) {
    return {
      regex: null,
      error: ""
    };
  }

  try {
    const flags = caseSensitive ? "g" : "gi";

    return {
      regex: new RegExp(input, flags),
      error: ""
    };
  } catch {
    return {
      regex: null,
      error: "Invalid regular expression. Check your pattern."
    };
  }
}
