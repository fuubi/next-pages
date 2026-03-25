# Git Workflow: Orphan Branch + Worktree Checkout

This repository uses a **coordinator pattern** with **orphan branches per client** and **git worktrees** to isolate client development while maintaining a shared component library.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Branching Model](#branching-model)
- [Worktree Structure](#worktree-structure)
- [Daily Workflows](#daily-workflows)
- [Common Tasks](#common-tasks)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
colombalink/client-sites (this repo)
├── main branch (coordinator)
│   ├── tools/cli/          # CLI tooling
│   ├── clients.json        # Client registry
│   └── docs/               # Documentation
│
├── client/garage-mueller (orphan branch)
│   └── Full client site structure
│
├── client/garage-other (orphan branch)
│   └── Full client site structure
│
└── shared/components (orphan branch)
    ├── tags: v1.0.0, v1.1.0, v1.2.0...
    └── Shared component library
```

**Key principles:**
1. **Coordinator branch (`main`)**: Contains CLI, documentation, and client registry
2. **Client branches (`client/*`)**: Independent orphan branches with no shared history
3. **Shared library (`shared/components`)**: Orphan branch with semantic versioning via git tags
4. **Worktrees**: Clients checked out as worktrees for parallel development; shared components extracted at specific versions

---

## Branching Model

### Branch Types

| Branch Pattern | Purpose | Example |
|---|---|---|
| `main` | Coordinator: CLI, docs, registry | `main` |
| `client/<name>` | Client site (orphan branch) | `client/garage-mueller` |
| `shared/components` | Shared component library (orphan branch) | `shared/components` |

### Orphan Branches

Client branches are **orphan branches** — they have **no shared git history** with the coordinator or other clients.

**Why orphan branches?**
- **Complete isolation**: Changes in one client never affect others
- **Clean history**: Each client's git log shows only that client's commits
- **No merge conflicts**: No shared ancestor means no cross-client conflicts
- **Deployment simplicity**: One branch = one deployment target

To verify a client branch is orphan:
```bash
git checkout client/garage-mueller
git log --oneline --all --graph --decorate
# Should show only this client's commits, no shared history
```

---

## Worktree Structure

When you checkout a client, the structure looks like:

```
/workspaces/next-pages/              # Coordinator repo root
├── clients.json                     # Registry
├── tools/cli/                       # CLI tools
├── packages/                        
│   └── shared/                      # Development worktree ← shared/components branch
│       ├── components/              # For working on shared components
│       ├── layouts/                 #
│       └── styles/                  #
│
├── sites/                           # Worktree checkout directory (gitignored)
│   ├── garage-mueller/              # Client worktree ← client/garage-mueller branch
│   │   ├── src/                     # Client source code
│   │   │   ├── pages/               #
│   │   │   ├── i18n/                #
│   │   │   └── shared/              # Extracted files from shared/components@v1.0.0
│   │   │       ├── components/      # (Not a worktree - regular files)
│   │   │       ├── layouts/         #
│   │   │       └── styles/          #
│   │   ├── public/                  #
│   │   └── package.json             #
│   │
│   └── garage-other/                # Another client worktree
│       ├── src/                     #
│       │   └── shared/              # Can use different version (e.g., v1.1.0)
│       └── package.json             #
│
└── .git/                            # Main git directory
```

**Key distinctions:**
- **`packages/shared/`**: Worktree for developing shared components (linked to `shared/components` branch)
- **`sites/<client>/`**: Worktree per client (one per client branch)
- **`sites/<client>/src/shared/`**: Extracted snapshot at a specific version tag (not a worktree)

**Multiple clients checked out simultaneously:**
- Each client in its own `sites/<client-name>/` directory
- Each has its own version of shared components extracted at the version specified in `clients.json`
- Work on multiple clients without switching branches
- Update to newer shared component versions with `cli upgrade`

---

## Daily Workflows

### 1. Checkout a Client

```bash
# From coordinator branch (main)
cli checkout garage-mueller
```

**What happens:**
1. Creates worktree at `sites/garage-mueller/` on branch `client/garage-mueller`
2. Extracts shared components at the specified version (e.g., `v1.0.0`) into `sites/garage-mueller/src/shared/`
3. Client is ready for development

**Result:**
```
✓ Successfully checked out garage-mueller with shared lib v1.0.0

Client workspace:
  /workspaces/next-pages/sites/garage-mueller

Shared components:
  /workspaces/next-pages/sites/garage-mueller/src/shared
  Version: v1.0.0 (extracted snapshot)
```

### 2. Work on the Client

```bash
cd sites/garage-mueller/
npm install
npm run dev
```

Edit files, commit changes:
```bash
git add .
git commit -m "feat: add contact page"
git push origin client/garage-mueller
```

**The shared components in `src/shared/` are version-locked** — they're a snapshot at a specific tag. To update to a newer version, use `cli upgrade`.

### 3. View All Clients

```bash
cli list
```

Output:
```
✓ Checked Out Clients:

  ● garage-mueller (client/garage-mueller)
    Domain: garage-mueller.ch
    Shared lib: v1.0.0 | Language: de
    Path: sites/garage-mueller/

Available Clients:

  ○ garage-other (client/garage-other)
    Domain: garage-other.com
    Shared lib: v1.1.0 | Language: fr
    Checkout with: cli checkout garage-other

──────────────────────────────────────────────────────────────
Total: 2 clients | Checked out: 1 | Available: 1
```

### 4. Upgrade Shared Library

```bash
# Check available versions
cli upgrade-shared garage-mueller

# Upgrade to specific version
cli upgrade-shared garage-mueller v1.1.0
```

**What happens:**
1. Fetches latest tags from `shared/components` branch
2. Shows diff of changes between old and new version
3. Removes old shared components and extracts new version
4. Updates `clients.json` registry
5. You test the changes and commit if all works

### 5. Close a Client

```bash
cli close garage-mueller
```

**What happens:**
1. Checks for uncommitted changes (fails if found)
2. Removes nested shared lib worktree
3. Removes client worktree
4. Frees up disk space

**Note:** You can have multiple clients checked out at once. Closing one doesn't affect others.

---

## Common Tasks

### Create a New Client

```bash
cli create garage-new-client \
  --name "New Client Garage" \
  --domain "new-client.ch" \
  --language fr \
  --shared-version v1.0.0
```

**What happens:**
1. Creates orphan branch `client/garage-new-client`
2. Scaffolds client structure on that branch
3. Adds client to `clients.json` registry
4. Automatically checks out the client (unless `--no-checkout`)

### Checkout Multiple Clients Simultaneously

```bash
cli checkout garage-mueller
cli checkout garage-other
cli checkout garage-third

# All three are now available in sites/
ls sites/
# garage-mueller/  garage-other/  garage-third/
```

**Use case:** Work on multiple clients in different IDE windows/terminals.

### Switch Between Checked-Out Clients

```bash
# No need to close! Just cd to the other client
cd sites/garage-mueller/
# ... work ...

cd ../garage-other/
# ... work ...
```

### Close All Clients

```bash
cli close  # Without argument closes all
# or
cli close --all
```

### Update Client Registry (Coordinator Changes)

```bash
# On coordinator branch
git checkout main
vim clients.json   # Edit registry
git add clients.json
git commit -m "chore: update garage-mueller shared lib version"
git push
```

---

## Best Practices

### 1. Always Work on Client Branches

Never commit client code to the `main` (coordinator) branch. 

Client code lives on `client/*` branches.

### 2. Don't Modify Shared Library

The shared library (`sites/<client>/src/shared/`) is **read-only** for clients.

If you need changes:
1. Make changes on the `shared/components` orphan branch
2. Create a new version tag (e.g., `v1.1.0`)
3. Upgrade your client: `cli upgrade-shared <client> v1.1.0`

### 3. Check Status Before Closing

Always ensure clean state before closing a client:
```bash
cd sites/garage-mueller/
git status
# Commit or stash changes first
```

The CLI will prevent closing if uncommitted changes exist.

### 4. Pin Shared Lib Versions

Each client pins a specific shared lib version. Don't use "latest" — always use explicit version tags.

**Why?** Different clients can use different versions simultaneously without interference.

### 5. Keep Coordinator Updated

After creating or updating clients, push changes to the coordinator:
```bash
git checkout main
git add clients.json
git commit -m "chore: register new client garage-xyz"
git push
```

### 6. Regular Cleanup

If you're only working on one client at a time, close others to save disk space:
```bash
cli close garage-mueller  # When done working on it
```

Worktrees can be recreated instantly with `cli checkout`.

---

## Troubleshooting

### "Worktree already exists"

If you see this warning when checking out:
```bash
✗ Client garage-mueller is already checked out
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
