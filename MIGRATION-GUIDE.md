# Migration Guide: From Monorepo to Orphan Branch + Worktree Architecture

This guide walks you through migrating from the old monorepo structure (all clients in one branch) to the new coordinator pattern with orphan branches and nested worktrees.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Migration Steps](#migration-steps)
- [Post-Migration Workflow](#post-migration-workflow)
- [Rollback Plan](#rollback-plan)
- [FAQ](#faq)

---

## Overview

### Old Structure (Before Migration)

```
main branch
├── packages/
│   ├── shared/          # Shared components
│   └── templates/       # Templates
├── sites/
│   ├── garage-mueller/  # Client 1
│   ├── garage-other/    # Client 2
│   └── garage-third/    # Client 3
└── tools/cli/           # CLI
```

**Problems:**
- All clients share git history
- Changes to one client appear in `git log` for all clients
- Deployment complexity (must deploy from specific directories)
- Version conflicts between clients
- Messy git history

### New Structure (After Migration)

```
Repository: colombalink/client-sites (this repo)
├── main (coordinator)
│   ├── clients.json     # Registry
│   ├── tools/cli/       # Enhanced CLI
│   └── docs/            # Documentation
│
├── client/garage-mueller (orphan branch)
├── client/garage-other (orphan branch)
├── client/garage-third (orphan branch)
│
└── shared/components (orphan branch)
    ├── tags: v1.0.0, v1.1.0, v1.2.0...
    └── Shared component library
```

**Benefits:**
- Complete client isolation (orphan branches)
- Clean git history per client
- Deploy one branch = one client
- Different clients can use different shared lib versions
- Work on multiple clients simultaneously
- Shared components versioned via tags on orphan branch

---

## Prerequisites

### 1. Backup Current State

```bash
# Create a backup branch
git checkout main
git branch backup/pre-migration
git push origin backup/pre-migration
```

### 2. Verify Clean State

```bash
git status
# Should show: "nothing to commit, working tree clean"
```

### 3. Install Latest CLI

```bash
npm install
```

### 4. Document Current State

```bash
# List all current sites
cli list > migration-current-sites.txt

# Capture current versions
cd packages/shared
git log --oneline -1 > ../../migration-shared-version.txt
```

---

## Migration Steps

### Phase 1: Create Shared Components Orphan Branch

#### 1.1. Create Orphan Branch for Shared Components

```bash
cd /workspaces/next-pages

# Create orphan branch
git checkout --orphan shared/components

# Remove all files (clean slate)
git rm -rf .

# Copy shared components
cp -r packages/shared/* .
cp -r packages/shared/.* . 2>/dev/null || true

# Commit
git add .
git commit -m "feat: initialize shared components library"

# Tag initial version
git tag v1.0.0

# Push
git push origin shared/components
git push origin v1.0.0
```

#### 1.2. Verify Shared Components Branch

```bash
git checkout shared/components
ls -la
# Should see: components/, layouts/, styles/, utils/, etc.

git log --oneline
# Should show history of shared components only
```

### Phase 2: Create Client Orphan Branches

For each client site, create an independent orphan branch.

#### 2.1. Migrate First Client (garage-mueller)

```bash
cd /workspaces/next-pages

# Create orphan branch
git checkout --orphan client/garage-mueller

# Remove all files (clean slate)
git rm -rf .

# Copy only this client's files
cp -r sites/garage-mueller/* .
cp -r sites/garage-mueller/.* . 2>/dev/null || true

# Update imports/references
# (shared lib will be added as worktree, not in repo)

# Commit
git add .
git commit -m "feat: initialize garage-mueller client branch"

# Tag initial version
git tag client/garage-mueller-v1.0.0

# Push
git push origin client/garage-mueller
git push origin client/garage-mueller-v1.0.0
```

#### 2.2. Update Client Configuration

Update the client's `astro.config.ts` to reference shared components from src/shared/:

```typescript
// astro.config.ts
export default defineConfig({
  // ...
  vite: {
    resolve: {
      alias: {
        // Shared components are extracted at src/shared/
        '@shared': resolve(__dirname, 'src/shared'),
        '@templates': resolve(__dirname, '../../packages/templates'),
      },
    },
  },
});
```

Update `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@templates/*": ["../../packages/templates/*"]
    }
  }
}
```

#### 2.3. Repeat for Each Client

```bash
# For each client in sites/
for client in garage-mueller garage-other garage-third; do
  echo "Migrating $client..."
  
  # Create orphan branch
  git checkout --orphan client/$client
  git rm -rf .
  
  # Copy client files
  cp -r sites/$client/* .
  cp -r sites/$client/.* . 2>/dev/null || true
  
  # Commit
  git add .
  git commit -m "feat: initialize $client client branch"
  
  # Push
  git push origin client/$client
  
  # Return to main for next iteration
  git checkout main
done
```

### Phase 3: Setup Coordinator Branch

#### 3.1. Clean Up Main Branch

```bash
git checkout main

# Remove site directories (now on client branches)
git rm -rf sites/

# Remove packages (now in separate repo)
git rm -rf packages/

# Keep: tools/cli/, README.md, docs/, clients.json
git add .
git commit -m "refactor: convert to coordinator branch pattern"
git push origin main
```

#### 3.2. Verify Coordinator Structure

```bash
ls -la
# Should see:
# - tools/cli/
# - clients.json
# - GIT-WORKFLOW.md
# - MIGRATION-GUIDE.md
# - README.md
# - .gitignore
```

### Phase 4: Update Client Registry

The `clients.json` file should already exist. Verify it contains all clients:

```json
{
  "clients": [
    {
      "name": "garage-mueller",
      "branch": "client/garage-mueller",
      "sharedLibVersion": "v1.0.0",
      "domain": "garage-mueller.ch",
      "language": "de",
      "created": "2026-03-25"
    }
  ],
  "sharedComponentsBranch": "shared/components"
}
```

### Phase 5: Test New Setup

#### 5.1. Test Checkout

```bash
# From coordinator branch (main)
cli checkout garage-mueller
```

Expected output:
```
✓ Created client worktree at /workspaces/next-pages/sites/garage-mueller/
✓ Successfully checked out garage-mueller with shared lib v1.0.0
```

#### 5.2. Verify Structure

```bash
ls -la sites/garage-mueller/
# Should show complete client structure

ls -la sites/garage-mueller/src/shared/
# Should show extracted shared components at the version specified in clients.json
```

#### 5.3. Test Development

```bash
cd sites/garage-mueller/
npm install
npm run dev
```

Visit site in browser to verify everything works.

#### 5.4. Test Multiple Checkouts

```bash
cli checkout garage-other
cli list
```

Should show both clients checked out.

#### 5.5. Test Close

```bash
cli close garage-mueller
ls sites/
# garage-mueller/ should be gone
```

---

## Post-Migration Workflow

### For Developers

**Old workflow:**
```bash
cd sites/garage-mueller/
git checkout main
# ... work ...
git add .
git commit -m "feat: update"
git push
```

**New workflow:**
```bash
cli checkout garage-mueller
cd sites/garage-mueller/
# ... work ...
git add .
git commit -m "feat: update"
git push origin client/garage-mueller

# When done:
cli close garage-mueller
```

### For CI/CD

**Old workflow:**
- Trigger on push to `main`
- Deploy specific `sites/garage-mueller/` directory

**New workflow:**
- Trigger on push to `client/garage-mueller` branch
- Deploy entire branch (it's only that client)

Example GitHub Actions:
```yaml
name: Deploy garage-mueller
on:
  push:
    branches:
      - client/garage-mueller

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: client/garage-mueller
      # No need to specify subdirectory!
      # The entire branch is the client
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

---

## Rollback Plan

If migration fails or needs to be reverted:

### Option 1: Restore from Backup Branch

```bash
git checkout backup/pre-migration
git branch -D main
git checkout -b main
git push origin main --force
```

### Option 2: Keep Both (Transition Period)

Keep old monorepo structure on `main` and new structure on `main-v2`:

```bash
# Current state becomes main-v2
git branch main-v2
git push origin main-v2

# Restore main from backup
git checkout backup/pre-migration
git branch -D main
git checkout -b main
git push origin main --force
```

Teams can gradually migrate to `main-v2`.

### Option 3: Revert Specific Changes

```bash
# Restore sites/ and packages/ to main
git checkout backup/pre-migration -- sites/
git checkout backup/pre-migration -- packages/
git add .
git commit -m "revert: restore monorepo structure"
git push
```

---

## FAQ

### Q: Can I still access old commits?

**A:** Yes! All history remains:
- **Coordinator/shared history**: On `main` branch (before cleanup commit)
- **Old client history**: In the monorepo, before the client was extracted
- **Backup**: On `backup/pre-migration` branch

To view old history:
```bash
git checkout backup/pre-migration
git log -- sites/garage-mueller/
```

### Q: What happens to `packages/templates/`?

**A:** Decision needed:
- **Option A**: Move to `shared/components` branch alongside components (recommended)
- **Option B**: Keep in coordinator as separate package
- **Option C**: Copy into each client branch (allows customization)

Current migration assumes **Option A** (templates are part of shared components).

### Q: How do I deploy clients now?

**A:** Deploy each client branch independently:
- **Client branch**: `client/garage-mueller`
- **Source**: Entire branch (not a subdirectory)
- **Build**: Run `npm install && npm run build` at repo root

### Q: Can clients share code?

**A:** No, clients are completely isolated. Shared code belongs in the `shared/components` orphan branch.

If you need client-specific reusable code, create it within that client's branch.

### Q: What about existing PRs and issues?

**A:** 
- **PRs targeting `main`**: Need to be retargeted to appropriate `client/*` branches
- **Issues**: Add labels to indicate which client they belong to
- **GitHub Projects**: Consider separate projects per client

### Q: How do I update multiple clients at once?

**A:** You don't! Each client is independent. If you need to update all clients:

1. Update the shared components on the `shared/components` branch
2. Create a new version tag (`v1.1.0`)
3. Upgrade each client individually:
   ```bash
   cli upgrade-shared garage-mueller v1.1.0
   cli upgrade-shared garage-other v1.1.0
   ```

This gives you control over when each client adopts new changes.

### Q: What if a client needs a custom shared component?

**A:** 
- **Option 1**: Add configuration to the shared component on `shared/components` branch (recommended)
- **Option 2**: Create a new version of the component in the shared branch
- **Option 3**: Copy the component into the client branch and customize it there

Avoid Option 3 unless truly necessary — it breaks the single source of truth.

### Q: How do I onboard a new developer?

**A:**
```bash
# Clone the coordinator repo
git clone https://github.com/colombalink/client-sites.git
cd client-sites

# Checkout the client they'll work on
cli checkout garage-mueller

# Start working
cd sites/garage-mueller/
npm install
npm run dev
```

Show them:
- [GIT-WORKFLOW.md](GIT-WORKFLOW.md) — How to work with branches and worktrees
- [README.md](README.md) — Project overview
- `cli --help` — CLI commands

---

## Checklist

Use this checklist to track migration progress:

- [ ] **Phase 1: Shared Components**
  - [ ] Create `shared/components` orphan branch
  - [ ] Extract `packages/shared/` contents to orphan branch
  - [ ] Tag `v1.0.0`
  - [ ] Verify branch works independently

- [ ] **Phase 2: Client Branches**
  - [ ] Create `client/garage-mueller` orphan branch
  - [ ] Create `client/garage-other` orphan branch
  - [ ] Create `client/garage-third` orphan branch
  - [ ] Verify each branch contains only that client

- [ ] **Phase 3: Coordinator**
  - [ ] Clean up `main` branch (remove `sites/`, `packages/`)
  - [ ] Verify `clients.json` is complete
  - [ ] Update `.gitignore`

- [ ] **Phase 4: Testing**
  - [ ] Test `cli checkout` for each client
  - [ ] Test `cli list`
  - [ ] Test `cli close`
  - [ ] Test `cli upgrade-shared`
  - [ ] Verify development workflow (npm run dev)
  - [ ] Verify build process (npm run build)

- [ ] **Phase 5: CI/CD**
  - [ ] Update GitHub Actions for client branches
  - [ ] Test deployment for each client
  - [ ] Update deployment scripts

- [ ] **Phase 6: Team**
  - [ ] Share [GIT-WORKFLOW.md](GIT-WORKFLOW.md) with team
  - [ ] Update team wiki/documentation
  - [ ] Schedule team training session

---

## Support

If you encounter issues during migration:

1. **Check troubleshooting** in [GIT-WORKFLOW.md](GIT-WORKFLOW.md#troubleshooting)
2. **Verify prerequisites** (clean state, backups in place)
3. **Don't force-push** without backup
4. **Ask for help** before proceeding if unsure

Migration is reversible if you follow the backup steps!

---

**Next steps:** See [GIT-WORKFLOW.md](GIT-WORKFLOW.md) for daily workflows in the new structure.
