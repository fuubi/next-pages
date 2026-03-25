# Git Hook Setup

## Post-Checkout Hook

A post-checkout hook has been created at `.git/hooks/post-checkout` to automatically sync the `packages/shared/` worktree when switching to the main branch.

### Enable the Hook

To enable automatic worktree syncing, make the hook executable:

```bash
chmod +x .git/hooks/post-checkout
```

### What It Does

When you checkout the `main` branch, the hook automatically:
1. Fetches the latest `shared/components` branch
2. Updates the `packages/shared/` worktree to the latest version
3. Shows a confirmation message

### Manual Sync

If you don't want to use the git hook, you can manually sync worktrees anytime:

```bash
cli sync
```

This ensures `packages/shared/` is at the latest version of the `shared/components` branch.

## Worktree Behavior

**Important**: Git worktrees are independent - they don't automatically update when you switch branches in the main worktree. Each worktree stays on its own branch/commit until explicitly changed.

### Example

```bash
# You're on main, packages/shared/ is at v1.0.0
git checkout feature-branch
# packages/shared/ is STILL at v1.0.0 (doesn't change automatically)

# To update it:
cli sync
# Now packages/shared/ is at latest shared/components

# Or update the hook:
chmod +x .git/hooks/post-checkout
# Then it syncs automatically when checking out main
```

### Checking Worktree Status

```bash
# List all worktrees and their branches
git worktree list

# Check version of shared components
cd packages/shared
git describe --tags
```

### Manual Worktree Management

```bash
# Switch shared components to a specific version
cd packages/shared
git checkout v1.0.0

# Switch to latest
cd packages/shared
git checkout shared/components
git pull origin shared/components

# Or switch to a different tag
cd packages/shared
git checkout v1.1.0
```
