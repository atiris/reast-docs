# Contributing to Reast

We welcome contributions to the Reast platform! This guide explains how to get involved.

## Ways to Contribute

- **Report bugs** — Open an issue describing the problem, steps to reproduce, and expected behaviour
- **Suggest features** — Describe the use case and why it would benefit readers or authors
- **Improve documentation** — Fix typos, clarify explanations, add examples
- **Write REA stories** — Create sample stories that showcase language features
- **Submit code** — Fix bugs, implement features, improve tests

## Development Setup

1. **Clone with submodules:**

   ```bash
   git clone --recurse-submodules https://github.com/atiris/reast.git
   cd reast
   ```

2. **Install dependencies:**

   ```bash
   npm install
   cd modules/player && npm install
   cd ../platform && npm install
   ```

3. **Start the development stack:**

   ```bash
   npx reast start
   ```

4. **Apply changes to running containers:**
   ```bash
   npx reast apply
   ```

## Project Structure

| Area          | Location                     | What it contains                   |
| ------------- | ---------------------------- | ---------------------------------- |
| Platform API  | `modules/platform/apps/api/` | NestJS REST backend                |
| Platform Web  | `modules/platform/apps/web/` | Angular PWA frontend               |
| Player Engine | `modules/player/`            | REA parser, runtime, web component |
| Documentation | `modules/docs/`              | This documentation site            |
| CLI Tool      | `cli/`                       | `reast` command-line interface     |

## Code Guidelines

- **Language**: All code, comments, and commit messages in English
- **Style**: Follow existing patterns; ESLint enforces consistency
- **Types**: TypeScript strict mode — no `any`, no unchecked assertions
- **Tests**: Every feature or fix must include tests
- **Security**: Validate inputs, sanitize outputs, follow OWASP guidelines
- **Accessibility**: All UI must be keyboard-navigable with proper ARIA

## Commit Messages

Use conventional commit format:

```
feat: add timer command to REA language
fix: correct choice rendering in RTL mode
docs: update player embedding guide
test: add parser fuzz tests for nested commands
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make focused, atomic commits
3. Ensure all tests pass: `npm test`
4. Ensure no lint errors: `npm run lint`
5. Open a PR with a clear description of changes
6. Address review feedback

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](../LICENSE)).
