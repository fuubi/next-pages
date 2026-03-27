## Plan: Multi-Version Shared Library Worktrees

Enable multiple versions of the shared library to coexist as git worktrees, allowing different sites to reference different versions simultaneously using file: protocol.

**TL;DR**: Extend the CLI to create version-specific worktrees in `/packages/shared-v{version}/` and a special `/packages/shared-latest/` worktree tracking the highest version tag. Sites reference these using file: protocol. New clients default to "latest" with optional notification when newer versions are available. Supported workflows: pin to specific version, track latest, or switch between the two.

**Steps**

1. **Add version-specific worktree utilities** to `tools/cli/src/utils/workspace.ts`
   - `getSharedVersionWorktreePath(version)` → returns `/packages/shared-v{version}/` or `/packages/shared-latest/` if version is "latest"
   - `getCheckedOutSharedVersions()` → lists all existing shared version worktrees in `/packages/` (including latest)
   - `isSharedVersionCheckedOut(version)` → checks if specific version worktree exists (handles "latest" special case)
   - `getClientSharedVersion(clientName)` → reads version from client's package.json file: reference
   - `getLatestSharedVersion()` → fetches all tags and returns highest semver version (e.g., v1.2.3)
   - `getCurrentLatestWorktreeVersion()` → reads what version `/packages/shared-latest/` is currently on

2. **Modify `checkout` command** (`tools/cli/src/commands/checkout.ts`)
   - After checking out client worktree, detect required `sharedLibVersion` from `clients.json`
   - If version is "latest": resolve to actual latest tag using `getLatestSharedVersion()`, create `/packages/shared-latest/` worktree
   - If version is specific: check if `/packages/shared-v{version}/` worktree exists
   - If missing: auto-create worktree using `git worktree add packages/shared-v{version} v{version}`
   - Update client's package.json: use `"file:../../packages/shared-latest"` for latest, or `"file:../../packages/shared-v{version}"` for specific versions
   - Display message showing which shared version was created/reused and actual version if using latest

3. **Enhance `list` command** (`tools/cli/src/commands/list.ts`)
   - Add column showing checked-out status of each client's shared version (✓ if worktree exists)
   - At bottom, display summary of all checked-out shared versions with client count per version
   - Example output: `Shared versions: v1.0.0 (3 clients), v1.1.0 (1 client)`

4. **Update `sync` command** (`tools/cli/src/commands/sync.ts`) _(parallel with step 3)_
   - Replace single `/packages/shared/` logic with iteration over all checked-out clients
   - For each client, get their `sharedLibVersion` and sync corresponding worktree
   - For specific versions: `git -C packages/shared-v{version} fetch origin --tags && git checkout v{version}`
   - For "latest": fetch tags, compare current version with `getLatestSharedVersion()`, display notification if newer version available (e.g., "⚠ Newer version available: v1.3.0 (currently on v1.2.0). Run `cli upgrade-shared <client> latest` to update.")
   - Display progress for each version synced with upgrade notifications

5. **Extend `close` command** (`tools/cli/src/commands/close.ts`)
   - After removing client worktree, detect if any remaining clients use that shared version
   - Add `--clean-unused-shared` flag to remove orphaned shared version worktrees
   - Display which shared versions were cleaned up (if any)

6. **Modify `create` command** (`tools/cli/src/commands/create.ts`) _(parallel with step 5)_
   - Accept `--version` flag with value "latest" or specific version (e.g., v1.0.0)
   - Default to "latest" if not specified
   - When generating new client's package.json, use file: protocol format
   - Template: `"@colombalink/shared": "file:../../packages/shared-latest"` if version is "latest"
   - Template: `"@colombalink/shared": "file:../../packages/shared-v{sharedLibVersion}"` if specific version
   - Store version (including "latest") in `clients.json` registry

7. **Enhance `upgrade-shared` command** (`tools/cli/src/commands/upgrade-shared.ts`) _(parallel with step 6)_
   - Support upgrading to "latest" as target version
   - When upgrading from "latest" to "latest": update `/packages/shared-latest/` to newest tag
   - When upgrading from specific to "latest": change package.json to use `file:../../packages/shared-latest` and update registry
   - When upgrading from "latest" to specific: change package.json to use `file:../../packages/shared-v{version}` and update registry
   - Display before/after versions clearly

8. **Add `list-shared` command** (new file: `tools/cli/src/commands/list-shared.ts`) _(parallel with step 7)_
   - Display table of all checked-out shared versions
   - Columns: Version, Path, Actual Version (for latest), Clients Using (count + names), Git Status (clean/dirty)
   - Highlight "latest" entries and show which version they're currently on
   - Include available tags from remote in separate section
   - Show upgrade notifications for "latest" clients if newer version available

9. **Update CLI index** (`tools/cli/src/index.ts`)
   - Register new `list-shared` command

**Relevant files**

- [tools/cli/src/utils/workspace.ts](tools/cli/src/utils/workspace.ts) — Add 6 functions: getSharedVersionWorktreePath, getCheckedOutSharedVersions, isSharedVersionCheckedOut, getClientSharedVersion, getLatestSharedVersion, getCurrentLatestWorktreeVersion
- [tools/cli/src/commands/checkout.ts](tools/cli/src/commands/checkout.ts) — Handle "latest" special case, auto-create worktrees, update package.json with correct file: path
- [tools/cli/src/commands/list.ts](tools/cli/src/commands/list.ts) — Add shared version status column, display "latest (v1.2.0)" format, summary footer
- [tools/cli/src/commands/sync.ts](tools/cli/src/commands/sync.ts) — Iterate all versions, add upgrade notification logic for "latest" clients
- [tools/cli/src/commands/close.ts](tools/cli/src/commands/close.ts) — Add --clean-unused-shared flag, handle shared-latest cleanup
- [tools/cli/src/commands/create.ts](tools/cli/src/commands/create.ts) — Accept --version flag, default to "latest", set correct file: protocol path
- [tools/cli/src/commands/upgrade-shared.ts](tools/cli/src/commands/upgrade-shared.ts) — Support "latest" as both source and target version, handle all transitions
- `tools/cli/src/commands/list-shared.ts` — New command showing all versions with actual version for latest, upgrade notifications
- [tools/cli/src/index.ts](tools/cli/src/index.ts) — Register list-shared command

**Verification**

1. Run `cli create test-client-a` (no version) and verify it defaults to "latest", package.json has `"file:../../packages/shared-latest"`
2. Run `cli checkout test-client-a` and verify `/packages/shared-latest/` worktree is created at highest version tag
3. Run `cli list` and verify it shows "latest (v1.2.0)" format for test-client-a
4. Run `cli create test-client-b --version v1.0.0` and checkout - verify `/packages/shared-v1.0.0/` is created
5. Verify both worktrees coexist: `/packages/shared-latest/` and `/packages/shared-v1.0.0/`
6. Run `cli list-shared` and verify it shows both with actual versions and client associations
7. Create fake new version tag v1.2.1, run `cli sync` - verify notification shows for test-client-a about v1.2.1 available
8. Run `cli upgrade-shared test-client-a latest` and verify shared-latest worktree updates to v1.2.1
9. Run `cli upgrade-shared test-client-a v1.1.0` and verify package.json switches to `file:../../packages/shared-v1.1.0`
10. Run `cli upgrade-shared test-client-b latest` and verify package.json switches to `file:../../packages/shared-latest`
11. Run `cli close test-client-a --clean-unused-shared` and verify appropriate cleanup
12. Check that existing garage-mueller site continues to work with current setup

**Decisions**

- Worktree naming: `/packages/shared-v{version}/` for specific versions, `/packages/shared-latest/` for latest
- Package reference: file: protocol with relative path (`file:../../packages/shared-latest` or `file:../../packages/shared-v{version}`)
- Latest behavior: "latest" stored in clients.json as version value, resolves to highest semver tag at checkout time
- Update behavior: Clients on "latest" receive notifications about newer versions during sync but require explicit upgrade command (no auto-update)
- Default version: New clients default to "latest" unless --version flag specified
- Auto-creation: CLI automatically creates version worktrees during checkout (no manual intervention)
- Cleanup policy: Shared version worktrees only removed explicitly with `--clean-unused-shared` flag (conservative approach)
- Existing `/packages/shared/` for development: Keep as-is for active development on `shared/components` branch (not affected by this feature)
- Git-tag based versioning: Repository-level semantic versioning (v1.0.0, v1.1.0, etc.)
