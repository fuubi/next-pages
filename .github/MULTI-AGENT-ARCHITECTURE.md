# Multi-Agent Architecture

This document explains the multi-agent system for parallel work in this monorepo.

## Overview

The monorepo uses **three specialized agents** with clear boundaries to enable safe parallel work:

```
┌─────────────────────────────────────────────────────────┐
│                    Monorepo Root                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📦 src/shared/               ← @component-library       │
│  📦 packages/templates/       ← @component-library       │
│                                                          │
│  🌐 sites/garage-mueller/     ← @site-developer (1)     │
│  🌐 sites/client-abc/         ← @site-developer (2)     │
│  🌐 sites/another-site/       ← @site-developer (3)     │
│                                                          │
│  🔧 tools/cli/                ← @cli-developer           │
│                                                          │
└─────────────────────────────────────────────────────────┘

Parallelizable: ✅ Multiple Site Developer agents (different sites)
Single-threaded: ⚠️  Component Library, CLI Developer
```

## Agent Roles

### 1. Site Developer Agent

**Invocation**: `@site-developer [task description]`

**Scope**:

- `sites/[site-name]/src/`
- `sites/[site-name]/public/`
- `sites/[site-name]/astro.config.ts`
- `sites/[site-name]/site.config.ts`

**Responsibilities**:

- Edit page templates and content
- Manage multi-language support (DE/FR/IT)
- Configure site-specific settings
- Run dev servers and debug
- Import and use shared components

**Tools**: `read`, `edit`, `search`, `execute`

**Parallelization**: ✅ **Yes** — Sites are independent

- Agent 1 works on `sites/garage-mueller/`
- Agent 2 works on `sites/client-abc/`
- No conflicts, safe to run simultaneously

**Boundaries**:

- ❌ Cannot modify `packages/` (components)
- ❌ Cannot modify `tools/` (CLI)
- ❌ Cannot modify other sites
- ✅ Only works within assigned site

### 2. Component Library Agent

**Invocation**: `@component-library [task description]`

**Scope**:

- `src/shared/components/`
- `src/shared/layouts/`
- `src/shared/styles/`
- `src/shared/utils/`
- `packages/templates/`

**Responsibilities**:

- Create and modify shared components
- Manage component versioning (v1/, v2/ folders)
- Create Changesets for semantic versioning
- Update design tokens and global styles
- Document component APIs

**Tools**: `read`, `edit`, `search`, `execute`

**Parallelization**: ⚠️ **No** — Single-threaded

- Only one agent should modify shared components at a time
- Changes affect all sites
- Requires coordination and versioning

**Boundaries**:

- ❌ Cannot modify `sites/` (site content)
- ❌ Cannot modify `tools/` (CLI)
- ✅ Only works on shared packages

**Key Workflow**: Always create Changesets after component changes

### 3. CLI Developer Agent

**Invocation**: `@cli-developer [task description]`

**Scope**:

- `tools/cli/src/`
- `tools/cli/package.json`

**Responsibilities**:

- Build and maintain CLI commands
- Implement validation logic
- Create scaffolding templates
- Develop workspace utilities
- Update CLI configuration

**Tools**: `read`, `edit`, `search`, `execute`

**Parallelization**: ⚠️ **No** — Single-threaded

- CLI changes affect all sites and workflows
- Requires testing across entire monorepo

**Boundaries**:

- ❌ Cannot modify `sites/` (site content)
- ❌ Cannot modify `packages/` (components)
- ✅ Only works on CLI tooling

## Parallel Work Patterns

### Pattern 1: Multiple Sites, Different Agents

**Scenario**: Three sites need updates

```
Thread 1: @site-developer
Task: "Update garage-mueller contact page"
Working in: sites/garage-mueller/

Thread 2: @site-developer
Task: "Add new service to client-abc"
Working in: sites/client-abc/

Thread 3: @site-developer
Task: "Translate another-site to Italian"
Working in: sites/another-site/
```

**Result**: ✅ All three agents work simultaneously without conflicts

### Pattern 2: Site + Components, Sequential

**Scenario**: Add new component and use it in site

```
Step 1: @component-library
Task: "Create new PricingTable component"
Working in: src/shared/components/sections/
Creates: PricingTable.astro + Changeset

Step 2: @site-developer
Task: "Add pricing section to garage-mueller"
Working in: sites/garage-mueller/
Imports: @shared/components/sections/PricingTable.astro
```

**Result**: ⚠️ Sequential execution required (component must exist first)

### Pattern 3: Mixed Work, Coordinated

**Scenario**: Multiple simultaneous tasks

```
Thread 1: @component-library
Task: "Fix Button component hover state"
Working in: src/shared/components/ui/Button.astro

Thread 2: @site-developer (garage-mueller)
Task: "Update homepage content"
Working in: sites/garage-mueller/src/pages/de/index.json

Thread 3: @site-developer (client-abc)
Task: "Add testimonials page"
Working in: sites/client-abc/src/pages/de/testimonials.astro

Thread 4: @cli-developer
Task: "Add new validation check"
Working in: tools/cli/src/commands/validate.ts
```

**Result**: ✅ Partially parallel (2 Site Developers run together, others sequential)

## Agent Communication

Agents cannot directly communicate. Instead, they work through:

### 1. Shared Dependencies

Sites import components from `@shared` with explicit versions:

```astro
import Hero from '@shared/components/sections/Hero/v1/Hero.astro';
```

When Component Library agent updates a component version, sites using that version automatically see changes on next build/refresh.

### 2. Versioned Imports

All imports MUST specify explicit versions - there is NO "latest" version:

```astro
// Current version import Hero from '@shared/components/sections/Hero/v1/Hero.astro'; // Upgrade to
newer version when ready import Hero from '@shared/components/sections/Hero/v2/Hero.astro';
```

This guarantees breaking changes never affect sites until they explicitly opt-in to new versions.

### 3. File System State

All agents read/write to the same monorepo:

- Component Library creates/modifies components
- Site Developers import those components
- CLI Developer scaffolds new site structures

### 4. Changesets

Component Library agent creates Changesets:

```bash
npm run changeset
# Documents what changed and why
```

This serves as a communication log for version history.

## Decision Matrix

| Task                         | Agent                      | Parallelizable?          |
| ---------------------------- | -------------------------- | ------------------------ |
| Edit garage-mueller homepage | `@site-developer`          | ✅ Yes, with other sites |
| Create new Hero variant      | `@component-library`       | ⚠️ No                    |
| Add CLI command              | `@cli-developer`           | ⚠️ No                    |
| Translate site to French     | `@site-developer`          | ✅ Yes, with other sites |
| Fix Button component bug     | `@component-library`       | ⚠️ No                    |
| Update multiple sites        | Multiple `@site-developer` | ✅ Yes, all in parallel  |
| Validate site structure      | `@cli-developer`           | ⚠️ No                    |
| Add testimonials to site     | `@site-developer`          | ✅ Yes, with other sites |
| Create new section component | `@component-library`       | ⚠️ No                    |
| Update design tokens         | `@component-library`       | ⚠️ No                    |

## Best Practices

### For Site Developer Agents

1. **Always specify site**: "Update garage-mueller homepage" (not "update homepage")
2. **Stay in scope**: Don't touch `packages/` or `tools/`
3. **Import, don't modify**: Use shared components, don't edit them
4. **Test locally**: Run dev server to verify changes

### For Component Library Agent

1. **Consider versioning**: Breaking change? → Create new version folder
2. **Always create Changeset**: Document what changed
3. **Test in a site**: Ask Site Developer to test, or test manually
4. **Document props**: Keep component APIs clear

### For CLI Developer Agent

1. **Test all commands**: Verify create, list, validate still work
2. **Update help text**: Keep `--help` output accurate
3. **Handle errors gracefully**: Clear messages, helpful suggestions
4. **Clean up after testing**: Delete test sites created during dev

## Limitations

### Not Truly Parallel (Yet)

While agents have separate scopes, **current Copilot implementation runs sequentially**. This architecture **prepares for future parallel execution** by:

1. Defining clear boundaries (no conflicting file edits)
2. Isolating agent contexts (site A doesn't need site B's context)
3. Enabling independent work (sites don't depend on each other)

When Copilot supports parallel subagents, this structure will "just work".

### Coordination Required

Some tasks inherently require coordination:

- **Component + Usage**: Must create component before using in site
- **CLI + Site**: Must scaffold site before developing it
- **Breaking Changes**: Must version component before sites can use new version

These remain sequential even with parallel support.

## Migration Path

To use this architecture:

1. **Identify task type**:
   - Site-specific? → Site Developer
   - Component work? → Component Library
   - CLI/tooling? → CLI Developer

2. **Invoke appropriate agent**:

   ```
   @site-developer Update garage-mueller homepage with new services
   ```

3. **Let agent work in scope**:
   - Agent only touches its assigned directories
   - Agent reports what changed
   - Agent suggests testing steps

4. **Coordinate if needed**:
   - If task spans agents, break into sequential steps
   - Let each agent complete its part
   - Verify integration between agent outputs

## Examples

### Example 1: Single Site Update

**Task**: Update garage-mueller contact information

```
@site-developer Update garage-mueller contact page:
- Change phone number to +41 44 123 4567
- Update email to info@garage-mueller.ch
- Add new opening hours for Saturdays
```

**Agent works in**: `sites/garage-mueller/src/pages/*/contact.json`
**Other agents**: Can work on other sites simultaneously

### Example 2: New Component

**Task**: Create reusable pricing table component

```
@component-library Create new PricingTable component:
- Accepts array of pricing tiers
- Each tier has: title, price, features, CTA button
- Responsive 3-column grid
- Highlight recommended tier
```

**Agent works in**: `src/shared/components/sections/PricingTable.astro`
**Creates changeset**: MINOR bump (new feature)
**Other agents**: Must wait (components are single-threaded)

### Example 3: Parallel Site Updates

**Task**: Update three sites with new design tokens

```
Agent 1: @site-developer
Task: Apply new color scheme to garage-mueller
Site: garage-mueller

Agent 2: @site-developer
Task: Apply new color scheme to client-abc
Site: client-abc

Agent 3: @site-developer
Task: Apply new color scheme to another-site
Site: another-site
```

**Result**: All three agents work independently, no conflicts

### Example 4: Component + Usage (Sequential)

**Task**: Add newsletter signup component and use it

```
Agent 1: @component-library
Create Newsletter component with email input and subscribe button

Step 2: @site-developer
Add Newsletter component to garage-mueller footer
```

**Execution**: Sequential (component must exist before site can import it)

## Summary

This multi-agent architecture enables:

1. **Clear separation of concerns**: Each agent owns its domain
2. **Safe parallel work**: Sites are independent
3. **Enforceable boundaries**: Agents cannot modify outside their scope
4. **Future-proof**: Ready for true parallel execution when available
5. **Better organization**: Specialized agents with focused expertise

Use the right agent for the right job, and let the architecture handle the rest.
