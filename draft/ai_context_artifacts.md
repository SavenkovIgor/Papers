---
goal: Find common ground across tools by treating AI Context Artifacts as the primary entities and IDE implementations as secondary. Also it is important to not be too verbose - it is an overview, not a documentation. For documentation links are provided.
---

<!-- TODO: Claude Code additions
- [ ] Add Claude Code implementation details alongside Copilot throughout:
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
- Main docs: https://code.claude.com/docs/en
- Settings: https://code.claude.com/docs/en/settings
- MCP: https://code.claude.com/docs/en/mcp
- Hooks: https://code.claude.com/docs/en/hooks
-->

# AI Context Artifacts

AI Context Artifacts are file‑based inputs that define what an AI knows,
how it behaves, and what it is allowed to do in a project.
They are the primary entities; IDE or tool support is just one way to
discover and apply them.

**Note:** Throughout this article, "Copilot" refers to GitHub Copilot, which is
available as an extension in multiple IDEs including Visual Studio Code, JetBrains
IDEs, and others. The implementation details described here apply to Copilot
across all supported IDEs.

This article focuses on **context artifacts** - what the AI knows - not tool
capabilities or action primitives (what levers the AI has to execute tasks).
MCP servers are included as they configure external tool integrations, but
the built-in capabilities of any particular AI system are out of scope.

Most modern tools converge on a similar set of artifacts: instruction files,
prompt files, shared agent context, skills, and tool integrations.

## Project-wide context files

Docs: [AGENTS.md spec](https://agents.md) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) |
[Claude Code](https://code.claude.com/docs/en/memory#modular-rules-with-claude/rules) |
[Cursor](https://cursor.com/docs/context/rules)

Project-wide context files provide **persistent background context** that is
automatically included in all AI interactions within a project. These files
define shared knowledge that should be available across all sessions without
requiring explicit attachment or invocation.

### Context injection rules

- Contents are automatically injected into all agent sessions

### Common implementations

Different tools use different filenames for this purpose:

| File                                | Tool           | Location    | Copilot | Cursor | Claude Code |
| ----------------------------------- | -------------- | ----------- | ------ | ------ | ----------- |
| `./AGENTS.md`                       | Tool-agnostic  | In-Project  | ✓      | ✓      | ✓           |
| `./CLAUDE.md`                       | Claude Code    | In-Project  | ✗      | ✗      | ✓           |
| `./.github/copilot-instructions.md` | Copilot        | In-Project  | ✓      | ✗      | ✗           |
| `./.cursorrules`                    | Cursor         | In-Project  | ✗      | ✓      | ✗           |
| `~/.claude/CLAUDE.md`               | Claude Code    | User-folder | ✗      | ✗      | ✓           |

Typical contents include high-level project descriptions, architectural overviews,
agent role expectations, and domain terminology.

### Design philosophy

These files are intentionally loosely specified and not designed for:

- Fine‑grained file-specific constraints
- Conditional application based on file types
- Action-specific instructions

For those use cases, see scoped instruction files, skills, or feature-specific hooks.

## Scoped Instruction files (*.instructions.md)

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) |
[Claude Code](https://code.claude.com/docs/en)

Instruction files provide a set of rules and guidelines that can be applied to
specific files, directories or filetypes. They usually consist of optional
YAML frontmatter and a free-form Markdown body. Use them to apply consistent
coding rules and guidelines only to specific parts of the project.
They define behavioral constraints rather than concrete tasks or questions.

### Context injection rules

Instructions can be scoped to specific parts of the project using different approaches:

- **Filesystem-based scoping:** Place context files (`AGENTS.md`, `CLAUDE.md`) in subdirectories
  to apply them only to files within that directory and its children. Claude Code automatically
  pulls `CLAUDE.md` files from parent directories (for monorepos) and child directories (on demand).
- **Pattern-based scoping:** Use `applyTo` glob pattern in frontmatter (for `*.instructions.md`)
  to inject instructions only when working with matching files.
- **Manual attachment:** Attach instruction files to specific chat requests via UI or command palette.

### Project placement

- **Copilot default location:** `.github/instructions/<instruction_name>.instructions.md`
- **Copilot custom location:** any path defined with setting: `chat.instructionsFilesLocations` (VS Code only)
- **Directory-scoped:** `<subdirectory>/AGENTS.md` or `<subdirectory>/CLAUDE.md`
- **Claude Code:** `CLAUDE.md` files can be placed in project root, parent directories (monorepos),
  or child directories (loaded on demand when working with files in those directories)

## Prompts / Commands (*.prompt.md)

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files) |
[Cursor](https://cursor.com/docs/context/commands) |
[Claude Code](https://code.claude.com/docs/en)

Prompt files define **fully‑formed, reusable chat requests** for recurring
development tasks. Unlike instruction files, they do not describe behavioral
constraints, but instead encode concrete tasks or questions. They usually
consist of optional YAML frontmatter and a free-form Markdown body.

### Execution model

- Prompt files are **never applied automatically** - they must be explicitly
  invoked by the user via slash commands.

### Invocation methods

- As a **slash command** in chat (each prompt file becomes a `/command`).
- Via **direct execution** from the editor.

### Project placement

- **Copilot:** `.github/prompts/<prompt_name>.prompt.md` (or custom path via `chat.promptFilesLocations` in VS Code)
- **Cursor:** `.cursor/commands/<command_name>.md` (project-level)
- **Cursor:** `~/.cursor/commands/<command_name>.md` (user-level, cross-project)
- **Claude Code:** `.claude/commands/<command_name>.md` (project-level, can be checked into git)
- **Claude Code:** `~/.claude/commands/<command_name>.md` (user-level, cross-project)

### Team sharing

Cursor supports centralized team commands managed via dashboard, automatically
synchronized to all team members. Claude Code commands can be shared by checking
`.claude/commands/` files into git.

## Skills (SKILL.md)

Docs: [Skill spec](https://agentskills.io/home) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills) |
[Claude Code](https://code.claude.com/docs/en)

Skills are **conditionally loaded capability bundles** that provide specialized
knowledge or procedures to an AI agent. Each skill is defined by a directory
containing a mandatory `SKILL.md` file and optional supporting resources. Use
them to add specialized capabilities that load only when needed for specific tasks.

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

- `.github/skills/<skill-name>/SKILL.md` (Copilot)
- `.claude/skills/<skill-name>/SKILL.md` (Claude Code; Copilot also supports this path)

### Scope of application

When activated, the skill’s contents are injected into the agent’s prompt
context for the duration of the relevant request only.

## Custom agents (*.agent.md)

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

Custom agents enable you to configure the AI to adopt different personas
tailored to specific development roles and tasks. Each custom agent can have its
own behavior, available tools, and specialized instructions. Unlike project-wide
context files which provide passive background context, custom agents are active
personas that users explicitly switch to. They usually consist of optional
YAML frontmatter and a Markdown body.

### Activation model

- Custom agents are **not automatically active** - they must be explicitly selected
  by the user via agents dropdown in Chat view.
- Unlike project-wide context files, custom agents are active personas rather than
  passive background context.
- Built‑in chat participants (like `@workspace`, `@terminal`, `@vscode`) are
  IDE‑native features, not user‑definable.

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

Docs: [MCP spec](https://modelcontextprotocol.io) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) |
[Cursor](https://cursor.com/docs/context/mcp) |
[Claude Code](https://code.claude.com/docs/en/mcp)

`mcp.json` configures **external tool integrations** via the Model Context
Protocol (MCP). These tools allow AI agents to perform actions outside the
language model itself.

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

- **Copilot:** Workspace‑local configuration: `.vscode/mcp.json` (VS Code) or IDE-specific location
- **Claude Code:** Project-level: `.mcp.json` (can be checked into git for team sharing)
- **Claude Code:** Global config: available in all projects via global settings

### Scope of application

Configured tools are available to the agent **only in tool‑enabled or agent
execution modes**.

## Ignore files

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/ignoring-files) |
[Cursor](https://cursor.com/docs/context/ignore-files) |
[Claude Code](https://code.claude.com/docs/en)

Ignore files define which parts of the workspace should be **excluded from AI context**.
They use gitignore-style patterns to prevent sensitive data exposure and improve
performance by reducing the indexed surface area.

### Common implementations

Different tools use different filenames:

| File                    | Tool        | Scope                                           | Copilot | Cursor | Claude Code |
| ----------------------- | ----------- | ------------------------------------------------| ------ | ------ | ----------- |
| `.gitignore`            | All tools   | Excludes from indexing (honored by default)     | ✓      | ✓      | ✓           |
| `.cursorignore`         | Cursor      | Excludes from all AI features                   | ✗      | ✓      | ✗           |
| `.claudeignore`         | Claude Code | Excludes from all AI features                   | ✗      | ✗      | ✓           |
| `.cursorindexingignore` | Cursor      | Excludes only from indexing, remains accessible | ✗      | ✓      | ✗           |

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

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

Feature‑specific instruction hooks are **targeted settings** that let you append
instruction text (inline or via referenced markdown files) to Copilot's prompt
for a *particular action*, rather than globally. They are configured via dedicated
settings keys, inject instructions *verbatim* into the prompt for specific features,
and act as lightweight, scoped policy layers.

### Execution model

- Hooks are **action‑scoped** and applied only at generation time for the relevant
  Copilot feature.
- Instructions are injected *verbatim* into the prompt for specific actions.
- Unlike project-wide context files, hooks are manually wired through settings.

### Available hooks

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

### Design philosophy

Conceptually, these hooks predate but closely resemble modern
instruction files: they are **action‑scoped**, manually wired through settings,
and applied only at generation time for the relevant Copilot feature.
