# Pennywise Student Finance Tracker

Pennywise is a responsive student finance tracker built with vanilla HTML, CSS, and JavaScript. It helps students record expenses, monitor spending, manage a budget, and review spending patterns through a simple dashboard.

## Project Overview

The application was developed as a front-end web development summative project. It demonstrates semantic HTML, responsive CSS, modular JavaScript, regular expression validation, browser storage, data visualization, and testing.

## Features

- Add, edit, and delete transactions.
- Validate transaction descriptions, amounts, dates, and categories.
- Detect repeated consecutive words in text.
- Search transactions and highlight matching text.
- Filter transactions by category.
- Sort transactions by available sorting options.
- View total spending, transaction counts, budget status, and spending categories.
- Visualize spending over the latest seven days.
- Configure the budget limit and currency conversion rates.
- Save transactions and settings using browser local storage.
- Export transactions as JSON and import JSON backups.
- Use the interface on desktop, tablet, and mobile screens.
- Navigate forms and controls using a keyboard.

## Technologies

- HTML5 for semantic page structure.
- CSS3 for layout, responsive design, and visual styling.
- Vanilla JavaScript with ES modules for application logic.
- Regular expressions for validation and search support.
- Browser local storage for persistence.
- JSON for transaction backup and restoration.
- HTML and JavaScript tests for checking validation behavior.

## Project Structure

- `index.html`: Main application page.
- `styles/style.css`: Application styling and responsive layout.
- `scripts/app.js`: Application events and coordination.
- `scripts/state.js`: Transaction state and updates.
- `scripts/storage.js`: Local storage and JSON import or export.
- `scripts/ui.js`: Dashboard, chart, and transaction rendering.
- `scripts/validators.js`: Input validation and regular expression utilities.
- `scripts/search.js`: Searching, filtering, sorting, and text highlighting.
- `tests.html`: Browser-based validation tests.
- `seed.json`: Example transaction data.
- `project-spec.md`: Project specification and milestones.
- `assets/`: Project assets.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/fabriceniyonkuruishimwe/alu-front-end-web-development-summative.git
cd alu-front-end-web-development-summative
```

Start a local development server from the project directory:

```bash
python3 -m http.server 8080
```

Open the forwarded port 8080 in your development environment. If you run the project locally on your own computer, visit `http://localhost:8080`.

JavaScript modules should be served over HTTP rather than opened directly as a file.

## Using the Application

1. Open the application in your browser.
2. Enter a description, amount, category, and date to record an expense.
3. Review your dashboard to monitor spending and budget status.
4. Use search, category filtering, and sorting to find transactions.
5. Edit or delete transactions when necessary.
6. Open Settings to change the budget limit, currency, or conversion rates.
7. Export a JSON backup when you want to preserve your data.
8. Import a valid JSON backup to restore transactions.

Transaction and settings data are stored in the browser. Data saved in one browser is not automatically shared with another browser or device.

## Validation and Regular Expressions

Pennywise validates transaction descriptions, monetary amounts, dates, and categories before saving transactions.

| Field or rule | Expected behavior |
| --- | --- |
| Description | Must not contain leading or trailing spaces and must stay within the allowed length. |
| Amount | Must be nonnegative and contain no more than two decimal places. |
| Date | Must use the YYYY-MM-DD format and represent a valid calendar date. |
| Category | Allows letters, spaces, and hyphens. |
| Repeated words | Detects consecutive repeated words using a back-reference pattern. |
| Regular expression input | Invalid patterns are caught and reported instead of crashing the application. |

The validation test page checks input rules, repeated words, invalid regular expressions, and imported JSON structures.

## Accessibility

The application aims to support accessible use through semantic landmarks, labelled controls, visible keyboard focus, keyboard navigation, live announcements, readable color contrast, and reduced-motion support.

## Responsive Design

The layout adapts to desktop, tablet, and mobile screens. Transaction information is presented in a more compact layout on narrow screens.

## Testing

Open `tests.html` through the same local development server to run the browser-based tests. Review the results after making changes to the validation logic.

Manual testing should also cover transaction creation, editing, deletion, searching, filtering, sorting, settings persistence, JSON export, and JSON import.

## Deployment

The application is intended to be published using GitHub Pages.

After enabling GitHub Pages for the repository, add the published website address here:

[Live application](ADD-YOUR-PUBLISHED-GITHUB-PAGES-URL-HERE)

## Author

**Fabriceniyonkuru Ishimwe**

GitHub repository:

https://github.com/fabriceniyonkuruishimwe/alu-front-end-web-development-summative

## License

This project was created for educational purposes as part of a front-end web development summative assignment.
