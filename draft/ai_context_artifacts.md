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

This article focuses on **context artifacts** - what the AI knows - not tool
capabilities or action primitives (what levers the AI has to execute tasks).
MCP servers are included as they configure external tool integrations, but
the built-in capabilities of any particular AI system are out of scope.

Most modern tools converge on a similar set of artifacts: instruction files,
prompt files, shared agent context, skills, and tool integrations.

## Project-wide instructions (what LLM knows about the project)

Docs: [AGENTS.md spec](https://agents.md) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) |
[Claude Code](https://code.claude.com/docs/en/memory#modular-rules-with-claude/rules) |
[Cursor](https://cursor.com/docs/context/rules)

Project-wide context files provide **persistent background context** that is
automatically included in all AI interactions within a project. These files
define shared knowledge that should be available across all sessions without
requiring explicit attachment or invocation. Typical contents include
high-level project descriptions, architectural overviews,
agent role expectations, and domain terminology.

**Placement:**

| Location | File                              | Copilot | Cursor | Claude Code |
| -------- | --------------------------------- | ------- | ------ | ----------- |
| Project  | `AGENTS.md`                       | ✓       | ✓      | ✓           |
| Project  | `.github/copilot-instructions.md` | ✓       | ✗      | ✗           |
| Project  | `.cursorrules`                    | ✗       | ✓      | ✗           |
| Project  | `CLAUDE.md`                       | ✗       | ✗      | ✓           |
| User-dir | `~/.claude/CLAUDE.md`             | ✗       | ✗      | ✓           |

**Context injection rules:**

- Full contents are automatically injected into all agent sessions

**Design philosophy:**

These files are intentionally loosely specified and not designed for:

- Fine-grained file-specific constraints
- Conditional application based on file types
- Action-specific instructions

For those use cases, see scoped instruction files, skills, or feature-specific hooks.

## Scoped Instructions (what LLM knows about the dir or file)

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) |
[Claude Code](https://code.claude.com/docs/en)

Instruction files provide a set of rules and guidelines that can be applied to
specific files, directories or filetypes. They usually consist of optional
YAML frontmatter and a free-form Markdown body. Use them to apply consistent
coding rules and guidelines only to specific parts of the project.
They define behavioral constraints rather than concrete tasks or questions.

**Placement:**

| Location | File                                     | Copilot | Cursor | Claude Code |
| -------- | ---------------------------------------- | ------- | ------ | ----------- |
| Project  | `**/AGENTS.md`                           | ✓       | ✓      | ✓           |
| Project  | `.github/instructions/*.instructions.md` | ✓       | ✗      | ✗           |
| Project  | `**/CLAUDE.md`                           | ✗       | ✗      | ✓           |

**Context injection rules:**

Instructions can be scoped to specific parts of the project using different approaches:

- **Filesystem-based scoping:** Place context files (`AGENTS.md`, `CLAUDE.md`) in subdirectories
  to apply them only to files within that directory and its children. Claude Code automatically
  pulls `CLAUDE.md` files from parent directories (for monorepos) and child directories (on demand).
- **Pattern-based scoping:** Use `applyTo` glob pattern in frontmatter (for `*.instructions.md`)
  to inject instructions only when working with matching files.
- **Manual attachment:** Attach instruction files to specific chat requests via UI or command palette.

## Commands / Prompts (what LLM should do now)

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files) |
[Cursor](https://cursor.com/docs/context/commands) |
[Claude Code](https://code.claude.com/docs/en)

These files define **a reusable chat request** for recurring
development tasks. Unlike instruction files, they do not describe behavioral
constraints, but instead encode concrete tasks or questions. They usually
consist of optional YAML frontmatter and a free-form Markdown body.

**Placement:**

| Location | File                          | Copilot | Cursor | Claude Code |
| -------- | ----------------------------- | ------- | ------ | ----------- |
| Project  | `.github/prompts/*.prompt.md` | ✓       | ✗      | ✗           |
| Project  | `.cursor/commands/*.md`       | ✗       | ✓      | ✗           |
| Project  | `.claude/commands/*.md`       | ✗       | ✗      | ✓           |
| User-dir | `~/.cursor/commands/*.md`     | ✗       | ✓      | ✗           |
| User-dir | `~/.claude/commands/*.md`     | ✗       | ✗      | ✓           |

**Context injection rules:**

- Prompt files are **never applied automatically** - they must be explicitly
  invoked by the user via slash commands or direct attachment to the chat.

## Skills (what LLM can do in project)

Docs: [Skill spec](https://agentskills.io/home) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills) |
[Claude Code](https://code.claude.com/docs/en)

Skills are **conditionally loaded capability bundles** that provide specialized
knowledge or procedures to an AI agent. Each skill is defined by a directory
containing a mandatory `SKILL.md` file and optional supporting resources. Use
them to add specialized capabilities that load only when needed for specific tasks.

**Placement:**

| Location | File                                    | Copilot | Cursor | Claude Code |
| -------- | --------------------------------------- | ------- | ------ | ----------- |
| Project  | `.github/skills/<skill-name>/SKILL.md`  | ✓       | ✗      | ✗           |
| Project  | `.claude/skills/<skill-name>/SKILL.md`  | ✓       | ✗      | ✓           |

**Context injection rules:**

- Skills are **not always active**.
- A skill is loaded only when the agent determines it is relevant to the
  current request.
- Relevance is inferred primarily from metadata in `SKILL.md`.

**File structure:**

`SKILL.md` consists of:

- YAML frontmatter describing the skill’s purpose and activation criteria
- A Markdown body containing detailed instructions or domain knowledge

Additional files in the same directory may be referenced by the skill.

**Scope of application:**

When activated, the skill’s contents are injected into the agent’s prompt
context for the duration of the relevant request only.

## Custom Agents (what role LLM should play)

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

Custom agents enable you to configure the AI to adopt different personas
tailored to specific development roles and tasks. Each custom agent can have its
own behavior, available tools, and specialized instructions. Unlike project-wide
context files which provide passive background context, custom agents are active
personas that users explicitly switch to. They usually consist of optional
YAML frontmatter and a Markdown body.

**Placement:**

| Location | File                              | Copilot | Cursor | Claude Code |
| -------- | --------------------------------- | ------- | ------ | ----------- |
| Project  | `.github/agents/*.agent.md`       | ✓       | ✗      | ✗           |

**Context injection rules:**

- Custom agents are **not automatically active** - they must be explicitly selected
  by the user via agents dropdown in Chat view.
- Unlike project-wide context files, custom agents are active personas rather than
  passive background context.
- Built-in chat participants (like `@workspace`, `@terminal`, `@vscode`) are
  IDE-native features, not user-definable.
- Programmatic: used as subagent via APIs when `infer: true`

**File structure:**

**Header (optional YAML frontmatter)** may include:

- `name`: the name of the custom agent (defaults to filename)
- `description`: brief description shown as placeholder text in chat input
- `argument-hint`: optional hint text to guide user interaction
- `tools`: list of available tool or tool set names (built-in, MCP, or extension-provided)
- `model`: the AI model to use (defaults to currently selected model)
- `infer`: boolean to enable use as subagent (default: true)
- `handoffs`: suggested next actions to transition between agents

**Body** contains the agent implementation in Markdown format: prompts, guidelines,
and instructions that are prepended to user chat prompts when the agent is active.
Can reference other files via Markdown links.

## MCP Servers (what external tools LLM can use)

Docs: [MCP spec](https://modelcontextprotocol.io) |
[VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) |
[Cursor](https://cursor.com/docs/context/mcp) |
[Claude Code](https://code.claude.com/docs/en/mcp)

`mcp.json` configures **external tool integrations** via the Model Context
Protocol (MCP). These tools allow AI agents to perform actions outside the
language model itself.

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

## Ignored files (what LLM should not see)

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/ignoring-files) |
[Cursor](https://cursor.com/docs/context/ignore-files) |
[Claude Code](https://code.claude.com/docs/en)

Ignore files define which parts of the workspace should be **excluded from AI context**.
They use gitignore-style patterns to prevent sensitive data exposure and improve
performance by reducing the indexed surface area.

Files listed in ignore patterns are typically blocked from:

- Semantic search and codebase indexing
- Automatic context gathering
- @ mention references
- Code completion and inline edits

**Note:** Terminal and MCP server tools may still access ignored files, as they
operate outside the AI context system.

Syntax is similar to `.gitignore` files.

**Placement:**

| File                    | Scope                                           | Copilot | Cursor | Claude Code |
| ----------------------- | ------------------------------------------------| ------- | ------ | ----------- |
| `.gitignore`            | Excludes from indexing (honored by default)     | ✓       | ✓      | ✓           |
| `.cursorignore`         | Excludes from all AI features                   | ✗       | ✓      | ✗           |
| `.claudeignore`         | Excludes from all AI features                   | ✗       | ✗      | ✓           |
| `.cursorindexingignore` | Excludes only from indexing, remains accessible | ✗       | ✓      | ✗           |

## Feature-specific Instruction Hooks

Docs: [VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

Feature-specific instruction hooks are **targeted settings** that let you append
instruction text (inline or via referenced markdown files) to Copilot's prompt
for a *particular action*, rather than globally. They are configured via dedicated
settings keys, inject instructions *verbatim* into the prompt for specific features,
and act as lightweight, scoped policy layers.

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

## Additional Sources

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
  - Anthropic's guide to effective agentic coding workflows and best practices for using Claude Code
