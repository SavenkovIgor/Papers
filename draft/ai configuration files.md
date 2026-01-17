# AI Context Artifacts

File-based artifacts that define what an AI knows, how it behaves,
and what it is allowed to do in a project.

Visual Studio Code provides a growing set of file‑based mechanisms that allow
you to tune the behavior of its built‑in GitHub Copilot AI using configuration
files in your projects. These include custom instruction files, prompt files,
multi‑agent instruction files (`AGENTS.md`), agent “skills” (`SKILL.md`),
and Model Context Protocol configuration (`mcp.json`).
Below we detail each feature, the purpose of its files, what to put in them,
how they influence Copilot’s context and behavior, where to place them, and
the relevant settings for enabling them.

## *.instructions.md (custom instruction files)

[ [VS Code docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) ]

Instruction files can be used as a set of rules/guidelines that
could be applied to specific files/dirs, filetypes, or the entire workspace.

Their naming pattern is `*.instructions.md` and these files consist
of optional YAML Frontmatter prefix and a free-form body
(preferred Markdown format).

### Context Injection rules

- **No scope at Frontmatter prefix:** - the entire file body is injected
  as-is into Copilot’s prompt context for *all* chat queries.
- **With `applyTo` scope at Frontmatter prefix:** - the file body
  is injected only when the current chat query involves files matching
  the specified glob pattern.
- **Manually**, by attaching an instructions file to a chat request
  via the Copilot Chat UI or command palette.

### Project placement

- **Global instructions file:** You can place a global instructions file
  `.github/copilot-instructions.md` that would apply to the entire repository.
  but you can achieve the same effect by placing a file at `/instructions/`
  subfolder with no `applyTo` scope.
- **GitHub Default location for scoped instructions:** The recommended location for
  project-specific instruction files is the
  `.github/instructions/<instruction_name>.instructions.md`
- **VS Code custom location:** You can also place instruction files
  at any path defined with setting: `chat.instructionsFilesLocations`

## *.prompt.md (prompt files)

[ [VS Code docs](https://code.visualstudio.com/docs/copilot/customization/prompt-files) ]

Prompt files define **fully‑formed, reusable chat requests** that can be executed
explicitly by a user. Unlike instruction files, they do not describe behavioral
constraints, but instead encode a concrete task or question.

Prompt files follow the `*.prompt.md` naming convention and consist of an optional
YAML frontmatter prefix and a free‑form Markdown body.

### Execution model

- Prompt files are **never applied automatically** - they must be explicitly
  invoked by the user via slash commands.

### Invocation methods

- As a **slash command** in chat (each prompt file becomes a `/command`).
- Via **direct execution** from the editor.

### Project placement

- **GitHub Default location for prompt files:** - `.github/prompts/<prompt_name>.prompt.md`
- **VS Code custom location**: at path defined with setting: `chat.promptFilesLocations`

## AGENTS.md (shared agent context)

[ [Agents specification](https://agents.md) ]

[ [VS Code docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) ]

`AGENTS.md` defines **persistent, shared background context** for AI agents.
Its contents are implicitly included in agent interactions without requiring
explicit attachment or invocation.

The file is intentionally loosely specified and acts as a descriptive rather
than normative artifact.

### Context injection rules

- A root‑level `AGENTS.md` is injected into all agent interactions.
- Nested `AGENTS.md` files may apply to subdirectories.
- Injection is automatic when agent features are enabled.

### Intended usage

Typical contents include:

- High‑level project descriptions
- Architectural overviews
- Agent role expectations
- Domain terminology

`AGENTS.md` is not designed for fine‑grained constraints or task definitions.

### Project placement

- Workspace root: `AGENTS.md`
- Optional subdirectory‑scoped `AGENTS.md` files

## SKILL.md (agent skills)

[ [Skill specification](https://agentskills.io/home) ]

[ [VS Code docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills) ]

A Skill represents a **conditionally loaded capability bundle** that provides
specialized knowledge or procedures to an AI agent.

Each skill is defined by a directory containing a mandatory `SKILL.md` file and
optional supporting resources.

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

- `.github/skills/<skill-name>/SKILL.md` (recommended)
- `.claude/skills/<skill-name>/SKILL.md` (legacy)

### Scope of application

When activated, the skill’s contents are injected into the agent’s prompt
context for the duration of the relevant request only.

## mcp.json (external tools configuration)

[ [MCP specification](https://modelcontextprotocol.io) ]

[ [VS Code docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) ]

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

- Workspace‑local configuration: `.vscode/mcp.json`

### Scope of application

Configured tools are available to the agent **only in tool‑enabled or agent
execution modes**.

## Feature‑specific instruction hooks

[ [VS Code docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) ]

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
