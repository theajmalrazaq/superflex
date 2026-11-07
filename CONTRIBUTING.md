# Contributing to SuperFlex

Thank you for your interest in contributing to SuperFlex! Whether you're fixing a bug, adding new features, or improving documentation, your help is appreciated.

---

## Code of Conduct

Please be respectful and constructive in discussions, issue reports, and pull requests. We want to keep SuperFlex an inclusive and welcoming project for everyone.

---

## How Can I Contribute?

- **Reporting Bugs**: Check the [issue tracker](https://github.com/theajmalrazaq/superflex/issues) first. If it's a new bug, open an issue detailing steps to reproduce, expected vs. actual behavior, and browser/OS details.
- **Suggesting Enhancements**: Propose new features or UX improvements via GitHub Issues.
- **Submitting Pull Requests**: Pick up an open issue or implement an improvement.

---

## Development Setup

### Prerequisites

- **Bun** (v1.0 or higher)
- **Google Chrome** or any Chromium-based browser (Brave, Edge, Arc, etc.)

### Getting Started

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/<your-username>/superflex.git
   cd superflex
   ```

2. **Install Dependencies**

   ```bash
   bun install
   ```

3. **Start the Development Server**

   ```bash
   bun run dev
   ```

4. **Load the Extension into Chrome**
   1. Open Chrome and navigate to `chrome://extensions/`.
   2. Turn on **Developer mode** in the top right corner.
   3. Click **Load unpacked**.
   4. Select the `dist/` directory generated in your project root.
   5. Changes made during `bun run dev` will automatically trigger rebuilds.

---

## Development Workflow & Guidelines

### Branching Strategy

- Create a new branch for your feature or bug fix:
  ```bash
  git checkout -b feature/your-feature-name
  # or
  git checkout -b fix/your-bug-fix
  ```

Run `bun run typecheck` and `bun test` before submitting changes. Use `.ts` for modules and `.tsx` for React components and tests. Run `bun run dev:docs` to work on the documentation website.

### Code Style & Formatting

- Maintain consistency with the existing codebase (TypeScript, React 19, Tailwind CSS v4, modern ES module syntax).
- Format your code with oxfmt:
  ```bash
  bun run format
  # or bun run clean
  ```
- Make sure Oxlint checks pass:
  ```bash
  bun run lint
  ```

### Commits

- Write clear, concise commit messages describing what and why the change was made.
- Prefer conventional commit style (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`).

### Pull Request Process

1. Ensure the extension builds successfully:
   ```bash
   bun run build
   ```
2. Test your changes locally on the relevant LMS pages.
3. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Open a Pull Request against the `main` (or `master`) branch of the SuperFlex repository.
5. Provide a clear description of the changes made, screenshots/recordings if UI changes were introduced, and link any related issues.

---

## Questions & Support

If you have any questions or need help getting started, feel free to open a discussion or ask in the [Issues](https://github.com/theajmalrazaq/superflex/issues) section.
