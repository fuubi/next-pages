# Worktree Management

## Quick Overview

This project uses git worktrees for parallel development:

- **`packages/shared-main/`** → Development worktree (packages/shared-main branch)
- **`packages/shared-latest/`** → Latest version worktree (detached HEAD)
- **`sites/<client>/`** → Client worktrees (client/\* branches)

## Checking Worktree Status

```bash
# List all worktrees
git worktree list

# Check shared components version
cd packages/shared-main
git describe --tags
```

## Manual Worktree Operations

```bash
# Update development branch
cd packages/shared-main
git pull origin packages/shared-main

# Switch to specific version (in shared-latest)
cd packages/shared-latest
git checkout v1.0.0
```

---

For normal development, just use `cli` commands. Manual worktree management is rarely needed.
