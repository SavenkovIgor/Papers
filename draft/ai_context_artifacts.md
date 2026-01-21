---
goal: Find common ground across tools by treating AI Context Artifacts as the primary entities and IDE implementations as secondary. Also it is important to not be too verbose - it is an overview, not a documentation. For documentation links are provided.
---

<!-- TODO: Claude Code additions
- [ ] Add Claude Code implementation details alongside VS Code/Copilot throughout:
  - [ ] Instruction files: mention CLAUDE.md as Claude Code's equivalent (project root or subdirectories)
  - [ ] AGENTS.md: confirm Claude Code support (already implied but could be explicit)
  - [ ] Skills: add `.claude/skills/` path; note that Copilot supports BOTH `.github/skills/` and `.claude/skills/`
  - [ ] MCP: add `.claude/mcp.json` and `~/.config/claude/mcp.json` paths
- [ ] Add new Claude Code-specific artifacts:
  - [ ] .claudeignore - gitignore-style exclusion file
  - [ ] Hooks system - shell commands on tool events (distinct from instruction hooks)
  - [ ] Memory/persistence - user-level CLAUDE.md at ~/.config/claude/CLAUDE.md
- [ ] Consider restructuring sections to show tool implementations side-by-side
- [ ] Add Claude Code docs links where relevant

Claude Code documentation:
- Main docs: https://docs.anthropic.com/en/docs/claude-code
- Memory & CLAUDE.md: https://docs.anthropic.com/en/docs/claude-code/memory
- Settings: https://docs.anthropic.com/en/docs/claude-code/settings
- MCP: https://docs.anthropic.com/en/docs/claude-code/mcp
- Hooks: https://docs.anthropic.com/en/docs/claude-code/hooks
-->

# AI Context Artifacts

AI Context Artifacts are file‑based inputs that define what an AI knows,
how it behaves, and what it is allowed to do in a project.
They are the primary entities; IDE or tool support is just one way to
discover and apply them.

This article focuses on **context artifacts** - what the AI knows - not tool
capabilities or action primitives (what levers the AI has to execute tasks).
MCP servers are included as they configure external tool integrations, but
the built-in capabilities of any particular AI system are out of scope.

Most modern tools converge on a similar set of artifacts: instruction files,
prompt files, shared agent context, skills, and tool integrations. Visual Studio
Code (via GitHub Copilot) is a concrete implementation of these ideas using
specific filenames, locations, and settings. Below, each artifact is defined
first in tool‑agnostic terms, followed by how VS Code implements it.

## Project-wide context files

[AGENTS.md specification](https://agents.md) |
[VS Code docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) |
[Claude Code docs](https://docs.anthropic.com/en/docs/claude-code/memory) |
[Cursor docs](https://cursor.com/docs/context/rules)

Project-wide context files provide **persistent background context** that is
automatically included in all AI interactions within a project. These files
define shared knowledge that should be available across all sessions without
requiring explicit attachment or invocation.

### Use case

Provide project-wide context that persists across all AI sessions and interactions.

### Context injection rules

- Contents are automatically injected into all agent sessions

### Common implementations

Different tools use different filenames for this purpose:

| File | Tool | Scope |
|---------------|---------------|-------|
| `./AGENTS.md` | Tool-agnostic | Project |
| `./CLAUDE.md` | Claude Code | Project |
| `~/.config/claude/CLAUDE.md` | Claude Code | User-level (cross-project) |
| `./.github/copilot-instructions.md` | GitHub Copilot | Project |
| `./.cursorrules` | Cursor | Project |

Typical contents include high-level project descriptions, architectural overviews,
agent role expectations, and domain terminology.

### Design philosophy

These files are intentionally loosely specified and not designed for:

- Fine‑grained file-specific constraints
- Conditional application based on file types
- Action-specific instructions

For those use cases, see scoped instruction files, skills, or feature-specific hooks.

## Scoped Instruction files (*.instructions.md)

[VS Code docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

Instruction files can be used as a set of rules/guidelines that
could be applied to specific files/dirs, filetypes, or the entire workspace.

Their naming pattern is `*.instructions.md` and these files consist
of optional YAML Frontmatter prefix and a free-form body
(preferred Markdown format).

### Use case

Apply consistent coding rules and guidelines without repeating them in every chat.

### Context Injection rules

Instructions can be scoped to specific parts of the project using different approaches:

- **Filesystem-based scoping:** Place context files (`AGENTS.md`, `CLAUDE.md`) in subdirectories
  to apply them only to files within that directory and its children.
- **Pattern-based scoping:** Use `applyTo` glob pattern in frontmatter (for `*.instructions.md`)
  to inject instructions only when working with matching files.
- **Manual attachment:** Attach instruction files to specific chat requests via UI or command palette.

### Project placement

- **GitHub default location:** `.github/instructions/<instruction_name>.instructions.md`
- **VS Code custom location:** any path defined with setting: `chat.instructionsFilesLocations`
- **Directory-scoped:** `<subdirectory>/AGENTS.md` or `<subdirectory>/CLAUDE.md`

## Prompt files (*.prompt.md)

[VS Code docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files) |
[Cursor docs](https://cursor.com/docs/context/commands)

Prompt files define **fully‑formed, reusable chat requests**. Unlike instruction
files, they do not describe behavioral constraints, but instead encode a concrete
task or question.

Prompt files follow the `*.prompt.md` naming convention and consist of an optional
YAML frontmatter prefix and a free-form Markdown body.

### Use case

Create reusable chat commands for recurring development tasks.

### Execution model

- Prompt files are **never applied automatically** - they must be explicitly
  invoked by the user via slash commands.

### Invocation methods

- As a **slash command** in chat (each prompt file becomes a `/command`).
- Via **direct execution** from the editor.

### Project placement

- **VS Code:** `.github/prompts/<prompt_name>.prompt.md` (or custom path via `chat.promptFilesLocations`)
- **Cursor:** `.cursor/commands/<command_name>.md` (project-level)
- **Cursor:** `~/.cursor/commands/<command_name>.md` (user-level, cross-project)

### Team sharing

Cursor supports centralized team commands managed via dashboard, automatically
synchronized to all team members.

## Skills (SKILL.md)

[Skill specification](https://agentskills.io/home) |
[VS Code docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

A skill is a **conditionally loaded capability bundle** that provides
specialized knowledge or procedures to an AI agent.

Each skill is defined by a directory containing a mandatory `SKILL.md` file and
optional supporting resources.

### Use case

Add specialized capabilities loaded only when needed for specific tasks.

### Skill activation model

- Skills are **not always active**.
- A skill is loaded only when the agent determines it is relevant to the
  current request.
- Relevance is inferred primarily from metadata in `SKILL.md`.

### Skill file structure

`SKILL.md` consists of:

- YAML frontmatter describing the skill’s purpose and activation criteria
- A Markdown body containing detailed instructions or domain knowledge

Additional files in the same directory may be referenced by the skill.

### Project placement

- `.github/skills/<skill-name>/SKILL.md` (recommended?)
- `.claude/skills/<skill-name>/SKILL.md`

### Scope of application

When activated, the skill’s contents are injected into the agent’s prompt
context for the duration of the relevant request only.

## Custom agents (*.agent.md)

[VS Code docs](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

**Custom agents** enable you to configure the AI to adopt different personas
tailored to specific development roles and tasks. Each custom agent can have its
own behavior, available tools, and specialized instructions. Unlike project-wide
context files which provide passive background context, custom agents are active
personas that users explicitly switch to.

Custom agent files follow the `*.agent.md` naming convention and consist of an
optional YAML frontmatter header and a Markdown body.

### Use case

Create specialized AI personas with distinct behaviors, tools, and instructions.

### Distinction from project-wide context and built-in chat participants

- **Project-wide context files**: passive background context, always injected automatically
- **Custom agents**: active personas, explicitly selected via agents dropdown
- **Built‑in chat participants** (like `@workspace`, `@terminal`, `@vscode`):
  IDE‑native features, not user‑definable

### File structure

**Header (optional YAML frontmatter)** may include:

- `name`: the name of the custom agent (defaults to filename)
- `description`: brief description shown as placeholder text in chat input
- `argument-hint`: optional hint text to guide user interaction
- `tools`: list of available tool or tool set names (built‑in, MCP, or extension‑provided)
- `model`: the AI model to use (defaults to currently selected model)
- `infer`: boolean to enable use as subagent (default: true)
- `handoffs`: suggested next actions to transition between agents

**Body** contains the agent implementation in Markdown format: prompts, guidelines,
and instructions that are prepended to user chat prompts when the agent is active.
Can reference other files via Markdown links.

### Invocation model

- **Interactive**: selected via agents dropdown in Chat view
- **Programmatic**: used as subagent via APIs when `infer: true`
- **Handoffs**: transitioning between agents with pre‑filled prompts

### Project placement

- **Workspace**: `.github/agents/<name>.agent.md` (detected automatically)
- **User profile**: stored in profile folder for reuse across workspaces
- **Organization level**: GitHub organization‑defined agents (experimental)

## mcp.json (external tools configuration)

[MCP specification](https://modelcontextprotocol.io) |
[VS Code docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) |
[Cursor docs](https://cursor.com/docs/context/mcp)

`mcp.json` configures **external tool integrations** via the Model Context
Protocol (MCP). These tools allow AI agents to perform actions outside the
language model itself.

### Use case

Configure external tool integrations via the Model Context Protocol.

### Configuration model

- MCP servers are declared under a top‑level `servers` object.
- Each server entry specifies connection details such as `url` or `command`.
- Servers may expose multiple tools to the agent.

### Authentication and inputs

- Sensitive values are provided via an `inputs` section.
- Tool authentication is handled by the host environment (e.g. OAuth flows).
- Secrets are not intended to be stored directly in plaintext files.

### Development mode

Optional development configuration may include:

- `watch`: file globs that trigger server restarts
- `debug`: debugger attachment settings

### Project placement

- Workspace‑local configuration: `.vscode/mcp.json`

### Scope of application

Configured tools are available to the agent **only in tool‑enabled or agent
execution modes**.

## Ignore files

[VS Code docs](https://code.visualstudio.com/docs/copilot/customization/ignoring-files) |
[Cursor docs](https://cursor.com/docs/context/ignore-files)

Ignore files define which parts of the workspace should be **excluded from AI context**.
They use gitignore-style patterns to prevent sensitive data exposure and improve
performance by reducing the indexed surface area.

### Use case

Control which files and directories are accessible to AI features for security and performance.

### Common implementations

Different tools use different filenames:

| File | Tool | Scope |
|------|------|-------|
| `.gitignore` | All tools | Excludes from indexing (honored by default) |
| `.cursorignore` | Cursor | Excludes from all AI features |
| `.claudeignore` | Claude Code | Excludes from all AI features |
| `.cursorindexingignore` | Cursor | Excludes only from indexing, remains accessible |

### Exclusion scope

Files listed in ignore patterns are typically blocked from:

- Semantic search and codebase indexing
- Automatic context gathering
- @ mention references
- Code completion and inline edits

**Note:** Terminal and MCP server tools may still access ignored files, as they
operate outside the AI context system.

### Pattern syntax

Uses standard `.gitignore` syntax:

- `config.json` - specific file
- `dist/` - entire directory
- `*.log` - file extension pattern
- `**/logs` - nested directories
- `!app/` - negation (exclude from ignore)

### Security considerations

While ignore files restrict AI access to sensitive data (API keys, credentials,
secrets), complete protection is not guaranteed due to LLM unpredictability and
indirect context leakage. Use as defense-in-depth, not sole protection.

## Feature‑specific instruction hooks

[VS Code docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

VS Code introduced several **feature‑specific instruction hooks**.
These are targeted settings that let you append instruction text
(inline or via referenced markdown files) to Copilot’s prompt
for a *particular action*, rather than globally.

All they share the same core characteristics:

- They are configured via dedicated settings keys
- Instructions can be provided inline or loaded from arbitrary workspace files
- The referenced instructions are injected *verbatim* into the prompt
  for that specific feature
- They act as lightweight, scoped policy layers rather than general AI context

### Use case

Apply targeted instructions to specific Copilot features like commits or reviews.

Currently existing hooks include:

- **Commit message generation**
  (`github.copilot.chat.commitMessageGeneration.instructions`) – commonly used
  to enforce commit formats, tone, and length (e.g. Conventional Commits).
- **Review‑on‑selection**
  (`github.copilot.chat.reviewSelection.instructions`) – used to define review
  rubrics, focus areas, exclusions, and output structure for quick code reviews.
- **Pull request title and description generation**
  (`github.copilot.chat.pullRequestDescriptionGeneration.instructions`) –
  typically aligned with PR templates, required sections, and stylistic rules.

Conceptually, these hooks predate but closely resemble modern
instruction files: they are **action‑scoped**, manually wired through settings,
and applied only at generation time for the relevant Copilot feature.
