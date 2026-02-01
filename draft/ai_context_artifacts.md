---
goal: Find common ground across tools by treating AI Context Artifacts as the primary entities and IDE implementations as secondary. Also it is important to not be too verbose - it is an overview, not a documentation. For documentation links are provided.
---

# AI Context Artifacts

AI Context Artifacts are file-based inputs that define what an AI knows,
how it behaves, and what it is allowed to do in a project.
They are the primary entities; IDE or tool support is just one way to
discover and apply them.

**Note:** Throughout this article, "Copilot" refers to GitHub Copilot, which is
available as an extension in multiple IDEs including Visual Studio Code, JetBrains
IDEs, and others. The implementation details described here apply to Copilot
across all supported IDEs.

Artifacts fall into two categories:

- **Knowledge Artifacts** define what the AI knows: project context, instructions, and prompts
- **Capability Artifacts** define what the AI can do: skills, agents, and external tools

Most modern tools converge on a similar set of artifacts across both categories.

## Knowledge Artifacts

Knowledge artifacts provide context and instructions to the AI - they define what
the model knows about your project, coding standards, and common tasks.

### Instructions

Instructions provide persistent context and behavioral guidelines to the AI,
automatically applied based on scope.
Usually contains project description, coding standards and environment details

#### Project-wide Instructions

**Context injection model:** AUTO / GLOBAL
(Context is auto-injected into all agent sessions)

#### Scoped Instructions

**Context injection model:** AUTO / SCOPED
(Context is auto-injected into specific parts of the project)

- Could be applyd to specific dirs, files or filetypes.
- Scoped via filesystem hierarchy or glob patterns in frontmatter

- **Filesystem-based scoping:** Place context files (`AGENTS.md`, `CLAUDE.md`) in subdirectories
  to apply them only to files within that directory and its children. Claude Code automatically
  pulls `CLAUDE.md` files from parent directories (for monorepos) and child directories (on demand).
- **Pattern-based scoping:** Use `applyTo` glob pattern in frontmatter (for `*.instructions.md`)
  to inject instructions only when working with matching files.

**Placement:**

| Location | Injection | File                                     | Copilot | Cursor | Claude Code |
| -------- | --------- | ---------------------------------------- | ------- | ------ | ----------- |
| Project  | Global    | `AGENTS.md`                              | ✓       | ✓      | ✓           |
| Project  | Scoped    | `**/AGENTS.md`                           | ✓       | ✓      | ✓           |
| Project  | Global    | `.github/copilot-instructions.md`        | ✓       | ✗      | ✗           |
| Project  | Scoped    | `.github/instructions/*.instructions.md` | ✓       | ✗      | ✗           |
| Project  | Global    | `.cursor/rules/*.md`                     | ✗       | ✓      | ✗           |
| Project  | Global    | `CLAUDE.md`                              | ✗       | ✗      | ✓           |
| Project  | Scoped    | `**/CLAUDE.md`                           | ✗       | ✗      | ✓           |
| User-dir | Global    | `~/.claude/CLAUDE.md`                    | ✗       | ✗      | ✓           |

Docs:
[AGENTS.md spec](https://agents.md) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) |
[Claude Code](https://code.claude.com/docs/en/memory#modular-rules-with-claude/rules) |
[Cursor](https://cursor.com/docs/context/rules)

### Commands

**Reusable chat requests** for recurring development tasks.

- Encode concrete tasks or questions, not behavioral rules
- Must be explicitly invoked via slash commands or chat attachment
- Never applied automatically

**Context injection model:** USER-initiated
(Commands are explicitly invoked by the user via slash commands)

**Placement:**

| Location | File                          | Copilot | Cursor | Claude Code |
| -------- | ----------------------------- | ------- | ------ | ----------- |
| Project  | `.github/prompts/*.prompt.md` | ✓       | ✗      | ✗           |
| Project  | `.cursor/commands/*.md`       | ✗       | ✓      | ✗           |
| Project  | `.claude/commands/*.md`       | ✗       | ✗      | ✓           |
| User-dir | `~/.cursor/commands/*.md`     | ✗       | ✓      | ✗           |
| User-dir | `~/.claude/commands/*.md`     | ✗       | ✗      | ✓           |

Docs:
[VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files) |
[Cursor](https://cursor.com/docs/context/commands) |
[Claude Code](https://code.claude.com/docs/en)

## Capability Artifacts

Capability artifacts extend what the AI can do - they define specialized skills,
custom agents with specific roles, and integrations with external tools.

### Skills

**Conditionally loaded capability bundles** providing specialized knowledge.

- Load automatically when agent determines relevance to current task
- Defined by `SKILL.md` + optional supporting files in a directory
- Inject context only for duration of relevant request

**File structure:**

`SKILL.md` consists of:

- YAML frontmatter describing the skill’s purpose and activation criteria
- A Markdown body containing detailed instructions or domain knowledge

Additional files in the same directory may be referenced by the skill.

**Scope of application:**

When activated, the skill’s contents are injected into the agent’s prompt
context for the duration of the relevant request only.

**Context injection model:** MODEL-DETERMINED / GRANULAR

- Skills are **not always active**.
- A skill is loaded only when the agent determines it is relevant to the
  current request.
- Relevance is inferred primarily from metadata in `SKILL.md`.

**Placement:**

| Location | File                                    | Copilot | Cursor | Claude Code |
| -------- | --------------------------------------- | ------- | ------ | ----------- |
| Project  | `.github/skills/<skill-name>/SKILL.md`  | ✓       | ✗      | ✗           |
| Project  | `.claude/skills/<skill-name>/SKILL.md`  | ✓       | ✗      | ✓           |

Docs:
[Skill spec](https://agentskills.io/home) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills) |
[Claude Code](https://code.claude.com/docs/en)

### MCP Servers

**External tool integrations** configured via Model Context Protocol

- Allow AI agents to perform actions outside the language model
- Configured in `mcp.json` with server connection details

**Configuration model:**

- MCP servers are declared under a top-level `servers` object.
- Each server entry specifies connection details such as `url` or `command`.
- Servers may expose multiple tools to the agent.

**Authentication and inputs:**

- Sensitive values are provided via an `inputs` section.
- Tool authentication is handled by the host environment (e.g. OAuth flows).
- Secrets are not intended to be stored directly in plaintext files.

**Development mode:**

Optional development configuration may include:

- `watch`: file globs that trigger server restarts
- `debug`: debugger attachment settings

**Project placement:**

- **Copilot:** Workspace-local configuration: `.vscode/mcp.json` (VS Code) or IDE-specific location
- **Claude Code:** Project-level: `.mcp.json` (can be checked into git for team sharing)
- **Claude Code:** Global config: available in all projects via global settings

**Scope of application:**

Configured tools are available to the agent **only in tool-enabled or agent
execution modes**.

Docs:
[MCP spec](https://modelcontextprotocol.io) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) |
[Cursor](https://cursor.com/docs/context/mcp) |
[Claude Code](https://code.claude.com/docs/en/mcp)

### Custom Agents

**Active personas** with specialized roles, tools, and instructions.

- Explicitly selected by user. Not automatically active
- Each agent defines behavior, available tools, model preferences
- Can be invoked as subagents programmatically when `infer: true`

**Context injection model:** USER-initiated, SUBAGENT

- Custom agents are **not automatically active** - they must be explicitly selected
  by the user via agents dropdown in Chat view.
- Unlike project-wide context files, custom agents are active personas rather than
  passive background context.
- Built-in chat participants (like `@workspace`, `@terminal`, `@vscode`) are
  IDE-native features, not user-definable.
- Programmatic: used as subagent via APIs when `infer: true`

**Placement:**

| Location | File                              | Copilot | Cursor | Claude Code |
| -------- | --------------------------------- | ------- | ------ | ----------- |
| Project  | `.github/agents/*.agent.md`       | ✓       | ✗      | ✗           |

Docs:
[VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

## Ignored files

**Exclusion patterns** to protect sensitive data and reduce indexed surface.

- Block files from indexing, search, @ mentions, completions
- Use gitignore-style syntax
- Terminal and MCP tools may still access ignored files

**Placement:**

| File                    | Scope                                           | Copilot | Cursor | Claude Code |
| ----------------------- | ------------------------------------------------| ------- | ------ | ----------- |
| `.gitignore`            | Excludes from indexing (honored by default)     | ✓       | ✓      | ✓           |
| `.cursorignore`         | Excludes from all AI features                   | ✗       | ✓      | ✗           |
| `.cursorindexingignore` | Excludes only from indexing, remains accessible | ✗       | ✓      | ✗           |
| `.claudeignore`         | Excludes from all AI features                   | ✗       | ✗      | ✓           |

Docs:
[VS Code](https://code.visualstudio.com/docs/copilot/customization/ignoring-files) |
[Cursor](https://cursor.com/docs/context/ignore-files) |
[Claude Code](https://code.claude.com/docs/en)

## Feature-specific Instruction Hooks

**Targeted settings** appending instructions to specific Copilot actions.

- Manually wired through settings keys, not file-based
- Applied only at generation time for specific features (commits, reviews, PRs)
- Inject instructions verbatim as lightweight policy layers

**Execution model:**

- Hooks are **action-scoped** and applied only at generation time for the relevant
  Copilot feature.
- Instructions are injected *verbatim* into the prompt for specific actions.
- Unlike project-wide context files, hooks are manually wired through settings.

**Available hooks:**

Currently existing hooks include:

- Commit message generation
  (`github.copilot.chat.commitMessageGeneration.instructions`) – commonly used
  to enforce commit formats, tone, and length (e.g. Conventional Commits).
- Review-on-selection
  (`github.copilot.chat.reviewSelection.instructions`) – used to define review
  rubrics, focus areas, exclusions, and output structure for quick code reviews.
- Pull request title and description generation
  (`github.copilot.chat.pullRequestDescriptionGeneration.instructions`) –
  typically aligned with PR templates, required sections, and stylistic rules.

**Design philosophy:**

Conceptually, these hooks predate but closely resemble modern
instruction files: they are **action-scoped**, manually wired through settings,
and applied only at generation time for the relevant Copilot feature.

Docs:
[VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

## Additional Sources

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
  - Anthropic's guide to effective agentic coding workflows and best practices for using Claude Code
