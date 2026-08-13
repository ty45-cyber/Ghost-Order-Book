# Contributing to Ghost Order Book

> This is a DevPost Hackathon submission. All contributions and improvements are welcome!

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/ty45-cyber/Ghost-Order-Book.git
   cd Ghost-Order-Book
   ```

2. **Set up development environment**
   ```bash
   # Backend
   cd backend
   cargo build

   # Frontend
   cd frontend
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Backend Changes
- Located in `backend/src/`
- Build: `cargo build --release`
- Test: `cargo test`
- Format: `cargo fmt`

### Frontend Changes
- Located in `frontend/`
- Start dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

### Contract Changes
- Located in `contracts/ghost_liquidity.compact`
- Compile: `compact build contracts/Compact.toml`
- Deploy: `cd deploy && npm run deploy:simple`

## Commit Guidelines

Follow conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

Example:
```bash
git commit -m "feat: Add stop-loss order support to frontend"
```

## Pull Request Process

1. Update documentation if needed
2. Test your changes thoroughly
3. Ensure no build artifacts are committed
4. Write clear PR description explaining:
   - What problem does it solve?
   - How does it work?
   - Any breaking changes?

## Code Style

### Rust
- Follow `rustfmt` formatting
- Use `clippy` for linting
- Document public APIs

### TypeScript/React
- Use Prettier for formatting
- Follow ESLint rules
- Write JSDoc comments

## Testing

### Backend
```bash
cd backend
cargo test --release
```

### Frontend
```bash
cd frontend
npm run lint
npm run build
```

## Reporting Issues

Include:
- What you were trying to do
- What happened instead
- Steps to reproduce
- System info (OS, versions)
- Relevant logs or error messages

## Feature Requests

Suggest features with:
- Clear description of the feature
- Use cases and benefits
- Proposed implementation (if you have ideas)

## Questions?

- Check existing issues and discussions
- Review documentation in DEPLOYMENT.md
- Ask on Midnight Discord: https://discord.com/invite/midnightnetwork

---

**Thank you for contributing! 🌙**
