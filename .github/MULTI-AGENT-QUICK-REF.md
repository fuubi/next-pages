# Multi-Agent Quick Reference

Quick guide for using the multi-agent architecture in this monorepo.

## Available Agents

| Agent                 | Command              | Scope            | Parallel? |
| --------------------- | -------------------- | ---------------- | --------- |
| **Site Developer**    | `@site-developer`    | Individual sites | ✅ Yes    |
| **Component Library** | `@component-library` | Shared packages  | ⚠️ No     |
| **CLI Developer**     | `@cli-developer`     | CLI tooling      | ⚠️ No     |

## When to Use Which Agent

### Site Developer (`@site-developer`)

Use for:

- ✅ Editing page content and templates
- ✅ Managing translations (DE/FR/IT)
- ✅ Site-specific configuration
- ✅ Running dev servers
- ✅ Importing shared components

**Example**:

```
@site-developer Update garage-mueller:
- Change contact phone number
- Add new service to homepage
- Translate about page to Italian
```

**Cannot**:

- ❌ Modify shared components
- ❌ Change CLI tools
- ❌ Edit other sites

### Component Library (`@component-library`)

Use for:

- ✅ Creating new components
- ✅ Modifying existing components
- ✅ Managing design tokens
- ✅ Component versioning
- ✅ Creating Changesets

**Example**:

```
@component-library Create PricingTable component:
- 3-column responsive grid
- Accepts array of pricing tiers
- Highlight recommended option
```

**Cannot**:

- ❌ Modify site content
- ❌ Change CLI tools
- ❌ Site-specific changes

### CLI Developer (`@cli-developer`)

Use for:

- ✅ Adding CLI commands
- ✅ Updating validation logic
- ✅ Scaffolding templates
- ✅ Workspace utilities
- ✅ CLI configuration

**Example**:

```
@cli-developer Add new CLI command:
- Add 'cli deploy <site>' command
- Deploy site to production
- Validate before deployment
```

**Cannot**:

- ❌ Modify site content
- ❌ Change shared components
- ❌ Site-specific changes

## Parallel Work

### ✅ Safe to Run in Parallel

Multiple Site Developers on different sites:

```
Agent 1: @site-developer → sites/garage-mueller/
Agent 2: @site-developer → sites/client-abc/
Agent 3: @site-developer → sites/another-site/
```

**Why**: Sites are independent, no shared files

### ⚠️ Must Run Sequentially

Component Library and CLI Developer:

```
Sequential:
1. @component-library → Creates component
2. @site-developer → Uses component in site
```

**Why**: Shared resources, affects multiple sites

## Common Workflows

### 1. Update Single Site

```
@site-developer Update garage-mueller homepage:
- Add new testimonials
- Update hero image
- Fix contact form validation
```

**Parallel**: Other agents can work on different sites

### 2. Create and Use Component

```
Step 1: @component-library
Create Newsletter component with subscribe form

Step 2: @site-developer
Add Newsletter to garage-mueller footer
```

**Execution**: Sequential

### 3. Update Multiple Sites

```
Agent 1: @site-developer garage-mueller
Apply new branding colors

Agent 2: @site-developer client-abc
Apply new branding colors

Agent 3: @site-developer another-site
Apply new branding colors
```

**Parallel**: All three can run simultaneously

### 4. Fix Component Bug

```
@component-library Fix Button component:
- Correct hover state styling
- Fix focus outline
- Create patch Changeset
```

**Impact**: All sites using Button will get fix

## Decision Tree

```
What are you working on?
│
├─ Individual site content/pages
│  └─ @site-developer ✅ (parallelizable)
│
├─ Shared components/styles
│  └─ @component-library ⚠️ (single-threaded)
│
└─ CLI commands/tooling
   └─ @cli-developer ⚠️ (single-threaded)
```

## Tips

### For Parallel Work

1. **Identify independent tasks**: Can they touch different sites?
2. **Use multiple Site Developers**: One per site
3. **Coordinate component work**: Single-threaded, plan accordingly

### For Site Developer

- Always specify which site: "garage-mueller", not "the site"
- Stay in your site's directory
- Import components, don't modify them
- Test with `npm run dev` in site directory

### For Component Library

- Consider versioning for breaking changes
- Always create Changeset after changes
- Test in at least one site
- Document component props and usage

### For CLI Developer

- Test all commands after changes
- Update help text (`--help`)
- Clean up test artifacts
- Handle errors gracefully

## File Structure

```
.github/
  agents/
    site-developer.agent.md      # Site work
    component-library.agent.md   # Component work
    cli-developer.agent.md       # CLI work
  AGENTS.md                      # Workspace instructions
  MULTI-AGENT-ARCHITECTURE.md   # Full architecture docs

sites/
  [site-name]/                   # Site Developer scope
    src/pages/
    astro.config.ts

packages/
  shared/                        # Component Library scope
    components/
  templates/                     # Component Library scope

tools/
  cli/                           # CLI Developer scope
    src/commands/
```

## Getting Started

1. **Read full docs**: [MULTI-AGENT-ARCHITECTURE.md](MULTI-AGENT-ARCHITECTURE.md)
2. **Check workspace guide**: [AGENTS.md](AGENTS.md)
3. **Pick your agent**: Based on task type
4. **Invoke with @**: `@agent-name [task description]`
5. **Let agent work**: It knows its scope and boundaries

## Questions?

- **"Can I update multiple sites at once?"** → Yes! Use multiple `@site-developer` agents
- **"Can I modify a component and use it immediately?"** → No, run Component Library first, then Site Developer
- **"Can I work on components and CLI at same time?"** → No, both are single-threaded
- **"How do I know which agent to use?"** → Follow the decision tree above

## Documentation

- **Quick Reference**: This file
- **Full Architecture**: [MULTI-AGENT-ARCHITECTURE.md](MULTI-AGENT-ARCHITECTURE.md)
- **Workspace Guide**: [AGENTS.md](AGENTS.md)
- **Component Versioning**: [COMPONENT-VERSIONING.md](../COMPONENT-VERSIONING.md)
- **Changesets**: [VERSIONING.md](../VERSIONING.md)
