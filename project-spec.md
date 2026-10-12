# Pennywise Project Specification

## Purpose

Pennywise is a student finance tracker that helps students record expenses, manage budgets and understand their spending habits.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- ES modules
- Browser localStorage
- JSON import and export
- GitHub Pages

## Design

The application uses a dark dashboard with muted colors, subtle glow effects, readable typography and responsive layouts.

## Core Features

- Dashboard statistics
- Add, edit and delete transactions
- Regular expression search
- Sorting and search highlighting
- Budget caps and remaining balance
- Editable expense categories
- Manual currency conversion rates
- Persistent browser storage
- Validated JSON import and export
- Accessible keyboard navigation

## Transaction Data

Each transaction contains an id, description, amount, category, date, createdAt and updatedAt.

## Default Categories

Food, Books, Transport, Entertainment, Fees and Other.

## Validation

Descriptions cannot have leading or trailing spaces. Amounts must be nonnegative and have at most two decimal places. Dates must use YYYY-MM-DD and be valid calendar dates. Categories allow letters, spaces and hyphens. An advanced back-reference pattern detects repeated consecutive words.

## Accessibility

The application uses semantic landmarks, labelled controls, visible focus indicators, keyboard navigation, live announcements, readable color contrast and reduced-motion support.

## Responsive Design

The application supports mobile, tablet and desktop screens. Transaction tables become cards on narrow screens.

## Milestones

1. Specification and wireframes
2. Semantic HTML and responsive CSS
3. Forms and regex validation
4. Rendering, sorting and search
5. Dashboard statistics and budget caps
6. Persistence, settings and JSON import and export
7. Polish, tests and accessibility audit

## Testing

The test page will cover validation, duplicate words, invalid regular expressions and imported JSON structures.

## Deployment

The finished application will be published using GitHub Pages.
