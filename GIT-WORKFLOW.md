# Git Workflow Guide

This repository uses **orphan branches** to isolate client sites while sharing a versioned component library.

## Overview

```
repo (Colombian/client-sites)
├── main                      # Coordinator: CLI, docs, registry
├── client/garage-mueller     # Client A →  isolated history
├── client/garage-other       # Client B → isolated history  
└── shared/components         # Shared components (v1.0.0, v1.1.0...)
```

**Three types of branches, all independent:**
- `main` - Coordinator tools and documentation
- `client/*` - Orphan branches (no shared history between clients)
- `shared/components` - Component library with version tags

---

## Daily Workflow

### Start Working on a Client

```bash
cli checkout garage-mueller
cd sites/garage-mueller
npm install && npm run dev
```

**What happens:**
1. Creates worktree at `sites/garage-mueller/` from `client/garage-mueller` branch
2. Extracts shared components (v1.0.0) into `src/shared/`
3. Ready to work

### Make Changes

```bash
# Edit client files
vim src/pages/de/index.astro

# Commit to client branch
git add .
git commit -m "feat: add contact page"
git push origin client/garage-mueller
```

### Upgrade Shared Components

```bash
# See available versions
git tag -l | grep ^v

# Upgrade
cli upgrade-shared garage-mueller v1.1.0

# Test
npm run build

# Commit if working
git add .
git commit -m "chore: upgrade to v1.1.0"
git push
```

### Finish Working

```bash
cli close garage-mueller
```

---

## Multiple Clients

Work on several clients simultaneously:

```bash
cli checkout garage-mueller
cli checkout garage-other

# Now both available:
cd sites/garage-mueller && npm run dev  # Terminal 1
cd sites/garage-other && npm run dev    # Terminal 2
```

Each client is completely isolated.

---

## Creating New Clients

```bash
cli create garage-new \
  --name "Garage New" \
  --domain "new.ch" \
  --language de \
  --shared-version v1.0.0
```

Creates:
1. Orphan branch `client/garage-new`
2. Scaffolds site structure
3. Registers in `clients.json`
4. Checks out for immediate work

---

## Key Concepts

### Orphan Branches

Each client branch has **no shared git history** with others:

```bash
git checkout client/garage-mueller
git log --oneline --all --graph
# Shows only garage-mueller commits
```

**Benefits:**
- Complete isolation (no cross-client pollution)
- One branch = one deployment
- No merge conflicts between clients

### Version Pinning

Each client locks to a specific component version:

```json
{
  "clients": [
    { "name": "garage-mueller", "sharedLibVersion": "v1.0.0" },
    { "name": "garage-other", "sharedLibVersion": "v1.2.0" }
  ]
}
```

Different clients = different versions (safe).

### Worktrees vs Extracted Files

**Worktree:**
- `sites/garage-mueller/` - Full git repository linked to client branch

**Extracted files:**
- `sites/garage-mueller/src/shared/` - Snapshot from version tag (not a git repo)

`src/shared/` is **read-only**. Update via `cli upgrade-shared`.

---

## Best Practices

✅ **DO:**
- Commit client code on client branches
- Pin specific component versions (not "latest")
- Test upgrades before committing
- Work on multiple clients in parallel

❌ **DON'T:**
- Edit `src/shared/` directly (use `cli upgrade-shared`)
- Commit client code to `main` branch
- Merge between client branches

---

## Troubleshooting

**Already checked out:**
```bash
cli close garage-mueller
cli checkout garage-mueller
```

**Version not found:**
```bash
git tag -l | grep ^v              # List versions
cli upgrade-shared <client> v1.0.0  # Use existing version
```

**Uncommitted changes:**
```bash
cd sites/garage-mueller
git status
git add . && git commit -m "WIP"  # Commit first
cli close garage-mueller          # Then close
```

**Solution:**
```bash
cli close garage-mueller
cli checkout garage-mueller
```

Or manually remove:
```bash
rm -rf sites/garage-mueller
git worktree prune
```

### "Uncommitted changes detected"

When trying to close a client:
```bash
✗ Cannot close: uncommitted changes detected
```

**Solution:**
```bash
cd sites/garage-mueller/
git status
git add . && git commit -m "save work"
# or
git stash
```

### "Shared branch not found"

First checkout might fail if the `shared/components` branch isn't accessible.

**Solution:**
1. Ensure the `shared/components` orphan branch exists in the repository
2. Fetch the branch: `git fetch origin shared/components:shared/components`
3. Re-run `cli checkout <client>`

### "Version tag not found"

When upgrading shared lib:
```bash
✗ Version tag v1.2.0 not found in shared library repository
```

**Solution:**
Check available versions:
```bash
cd sites/<client>/src/shared/
git fetch origin --tags
git tag -l
```

Or from coordinator:
```bash
git tag -l | grep v
```

### Corrupted Worktree

If a worktree becomes corrupted:
```bash
# Remove from filesystem
rm -rf sites/garage-mueller

# Prune git's worktree list
git worktree prune

# Re-checkout
cli checkout garage-mueller
```

### Client Branch Not Found

If `cli checkout` says branch doesn't exist:
```bash
git fetch origin client/garage-mueller:client/garage-mueller
```

Then try again.

---

## Git Commands Reference

### View All Worktrees

```bash
git worktree list
```

### Remove Worktree Manually

```bash
git worktree remove sites/garage-mueller
```

### Create Orphan Branch Manually

```bash
git checkout --orphan client/new-client
git rm -rf .
git commit --allow-empty -m "Initial commit"
```

### Check Branch History

```bash
git checkout client/garage-mueller
git log --oneline --graph --all --decorate
```

### Verify Orphan Status

A true orphan branch has no merge-base with other branches:
```bash
git merge-base main client/garage-mueller
# fatal: Not a valid commit name client/garage-mueller
# ↑ Good! No shared history
```

---

## Related Documentation

- **[MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)** — Migrating from old monorepo structure
- **[README.md](README.md)** — Project overview and quick start
- **[VERSIONING.md](VERSIONING.md)** — Component library versioning strategy

---

**Questions?** Check the [CLI help](tools/cli/README.md) or run `cli --help`.
