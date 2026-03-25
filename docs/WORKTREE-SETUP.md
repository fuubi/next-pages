# Worktree Management

## Quick Overview

This project uses git worktrees for parallel development:

- **`packages/shared/`** → Development worktree (shared/components branch)
- **`sites/<client>/`** → Client worktrees (client/* branches)
- **`sites/<client>/src/shared/`** → NOT a worktree (extracted files)

## Auto-Sync Development Worktree

Enable automatic syncing of `packages/shared/` when switching to main:

```bash
chmod +x .git/hooks/post-checkout
```

This hook updates `packages/shared/` to the latest `shared/components` when you checkout main.

**Manual sync:**
```bash
cli sync
```

## Checking Worktree Status

```bash
# List all worktrees
git worktree list

# Check shared components version
cd packages/shared
git describe --tags
```

## Manual Worktree Operations

```bash
# Switch to specific version
cd packages/shared
git checkout v1.0.0

# Update to latest
cd packages/shared
git checkout shared/components
git pull origin shared/components
```

---

For normal development, just use `cli` commands. Manual worktree management is rarely needed.
