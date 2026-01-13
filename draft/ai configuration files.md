# AI context configuration files

Overview of VS Code’s AI Customization Files

Visual Studio Code provides a growing set of file‑based mechanisms that allow
you to tune the behavior of its built‑in GitHub Copilot AI using configuration
files in your projects. These include custom instruction files, prompt files,
multi‑agent instruction files (`AGENTS.md`), agent “skills” (`SKILL.md`),
and Model Context Protocol configuration (`mcp.json`).
Below we detail each feature, the purpose of its files, what to put in them,
how they influence Copilot’s context and behavior, where to place them, and
the relevant settings for enabling them.

## *.instructions.md (custom instruction files)

[VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

Instruction files provide reusable, file-backed guidance that is injected into
Copilot’s prompt context. They are not standalone prompts, but
*policy layers* that shape how Copilot responds.

### What they are

Any `*.instructions.md` file contains free-form guidance (style rules,
conventions, constraints) that Copilot should follow when answering.
A special case is the workspace-wide `.github/copilot-instructions.md`,
which acts as a default instruction set for the repository.

### How they are applied

Instruction files can be attached in two ways:

- **Automatically**, via YAML frontmatter:

```yaml
---
applyTo: '**/*.ts'
---
```

When a chat query involves a matching file, the instructions are auto-included.

- **Manually**, by attaching an instructions file to a chat request
  via the Copilot Chat UI or command palette.

### Effect on the prompt

**Scope of application:** Instruction files apply either to the entire workspace
 (for `.github/copilot-instructions.md`), to a subset of files matched by
 `applyTo`, or to an individual chat request when attached manually.

When attached, the file’s contents are injected verbatim into Copilot’s prompt
context (system or user message). This steers output toward project-specific
rules such as coding style, architectural constraints, or terminology,
without requiring you to restate them in every prompt. For example,
you might include preferred coding style, architectural guidelines,
or project-specific terminology, and Copilot will then attempt to obey those
instructions in its suggestions.

## *.prompt.md (prompt files)

[VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files)

Prompt files provide a way to define entire reusable chat prompts
(questions or tasks) that you or your team frequently use. They were
standardized in v1.100 alongside instructions files. A prompt file
(suffix `.prompt.md`) contains a complete chat request, including any preset
question/task and even which AI “mode” and tools to use.

Location and Setup: Like instructions, prompt files can live in the workspace
or user folders, configured via chat.promptFilesLocations setting.
They often reside in a folder (for example, `.github/prompts/` or similar).

### Usage and Format

Prompt files are invoked as slash commands in Copilot Chat
(each `*.prompt.md` file becomes a `/command`), but can also be executed
directly from the editor or via the Command Palette.
Technically, a prompt file is a markdown document with optional
YAML frontmatter that controls execution behavior.

The frontmatter can specify the chat `mode` (`ask`, `edit`, or `agent`) and,
in agent mode, the set of allowed `tools`. The remainder of the file
is treated as the prompt body and sent to Copilot. For example,
a release-notes generator might declare `mode: agent` and list file
or search tools, turning the prompt into a reusable, one‑command automation.

**Scope of application:** Prompt files apply at the level of a single explicit
invocation (slash command, command palette action, or direct execution)
and affect only that specific request.

Effect on Copilot: When you run a prompt file, Copilot Chat will treat its
content as if you asked that multi-line question or issued those instructions.
If mode: agent is set, Copilot will autonomously use the specified tools to
complete the task.

Prompt files essentially let you predefine complex queries or actions for
the AI to execute.

## AGENTS.md (multi-agent instructions file)

[spec](https://agents.md)
[VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

`AGENTS.md` is a special markdown file introduced
to provide shared context or instructions when you are working with multiple
AI agents in VS Code. Think of it as a README for AI agents in your project.

Purpose: The `AGENTS.md` file is automatically included as additional context

**Scope of application:** `AGENTS.md` applies implicitly to all chat queries
within its workspace or folder scope, without requiring explicit attachment
or invocation.

for Copilot (and other agents) in your workspace. It’s useful especially for
teams or scenarios using more than one AI agent (e.g. Copilot plus custom
agents) to coordinate their behavior or give them project-wide guidance.
You might include high-level project notes, coding conventions, or a
description of each agent’s role.

Location: Place `AGENTS.md` at the root of your workspace repository.
In a multi-root workspace, you can have one in each root. By default,
VS Code will detect this file and include it. introduced,
support for `AGENTS.md` is enabled by default (controlled by the
`chat.useAgentsMdFile` setting). When enabled, VS Code looks for an
`AGENTS.md` in the workspace root(s) and automatically uses it
as context for all chat queries.

Nested `AGENTS.md` files: Initially, only root-level `AGENTS.md` was supported.
Later updates introduced nested `AGENTS.md` (experimental) which
allows additional `AGENTS.md` files in subfolders.
If `chat.useNestedAgentsMdFiles` is enabled, VS Code will recursively
discover `AGENTS.md` files in subdirectories and include them,
noting their relative path context.
This is useful if you want different instructions for different parts of
a large project (for example, one `AGENTS.md` in `frontend/` and another in
`backend/` with domain-specific guidance).

Content: The `AGENTS.md` format is open-ended (an emerging standard in the
AI community). You can write any information or directives here that you want
the AI to be aware of for the whole project. For instance, you might describe
project architecture, coding standards, or instruct the AI on how multiple
agents should collaborate.

## SKILL.md (agent skills)

[spec](https://agentskills.io/home)
[VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

Agent Skills introduced to “teach” the AI new capabilities or domain
knowledge by providing skill packages. A Skill is essentially a bundle
of instructions and resources that the Copilot coding agent can load
on demand when a certain topic comes up.

What is a Skill: A skill is represented by a folder in your project that
contains all the materials needed for that capability – for example,
custom instructions, templates, or data relevant to the skill.
Each skill folder must include a `SKILL.md` file which defines the
skill’s behavior and metadata. The `SKILL.md` is a Markdown file
(with YAML frontmatter for metadata) that describes what the skill is for
and how to execute it. You can also include supporting files in the
skill folder (scripts, config files, example data, etc.) that the
AI might use when performing the skill.

Location: VS Code automatically detects skills in two locations:

The recommended location is your repository’s `.github/skills/` directory.
Each subdirectory under this corresponds to one skill (for example,
`.github/skills/test-writer/SKILL.md` for a “test writing” skill).

For backward compatibility, it also looks in a root folder named
`.claude/skills/` (this was used by early adopters and relates to
Anthropic’s Claude agent). New projects should use the `.github/skills/`
convention.

Enabling Skills: The feature is experimental in VS Code 1.108, so you’ll need
to enable the setting chat.useAgentSkills to activate skill detection.
Once enabled, VS Code will scan the above folders for skills.
 Skills are not loaded all at once; instead, they are loaded on-demand.
 This means Copilot will include a skill’s instructions only when it determines
 that the skill is relevant to your current query. The YAML metadata in
 `SKILL.md` usually contains a brief description or trigger words that
 help Copilot decide when to use that skill. When a query matches a
 skill’s description criteria, Copilot pulls in the `SKILL.md` content
 (and possibly related files in that skill folder) into the prompt
 context automatically.

Skill File Contents: In the `SKILL.md`, you typically provide:

A YAML header (frontmatter) with fields like a name, a description
(what the skill does / when to invoke it), and possibly pointers
to tool requirements or resource files.

The body of `SKILL.md` contains the detailed instructions or knowledge
the AI should apply when the skill is invoked. For example, if you create
a skill for writing unit tests, the `SKILL.md` might include guidelines
for test structure, examples, or a specific testing approach
the AI should follow. It could even reference a code template file
in the skill folder.

Example: A skill folder test-writer/ might have:

`SKILL.md` – “Instructions for writing unit tests in this project”
(with YAML description: "when user asks to write tests"
so Copilot knows to load it).

test-template.js – a file the skill can use as a template for generating tests.

perhaps an examples/ subfolder with sample tests or data.

**Scope of application:** Skills apply conditionally, at query time,
and are fully injected only when the agent determines that a given skill
is relevant to the current request.

Effect on Copilot: Skills extend Copilot’s knowledge or toolset in
a context-specific way. When active, they let Copilot perform specialized
tasks it otherwise might not know how to do. The agent will only load a skill’s
instructions when relevant, keeping the prompt concise.

This mechanism allows you to inject domain-specific expertise (like how
to interact with your custom API, or specific debugging procedures)
into Copilot without constantly supplying that info in every prompt – the skill
is there and will be pulled in automatically.
Essentially, Agent Skills make the AI smarter about your project’s domain
by providing on-demand contextual plugins in the form of files.

## mcp.json (MCP configuration for tools and servers)

[spec](https://modelcontextprotocol.io)
[VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

MCP (Model Context Protocol) is an extensibility feature that connects
AI agents with external tools, APIs, or services by defining “MCP servers.”
In simpler terms, MCP lets Copilot use external resources (like web APIs,
databases, GitHub operations, etc.) via a standardized interface.
VS Code added robust MCP support during 2025
to power Copilot’s Agent Mode tools.

What is mcp.json: It is a JSON configuration file where you list the MCP
servers (external tool integrations) you want to use in your workspace.
By convention, this file is named mcp.json and lives in your project’s
`.vscode/` directory (workspace-specific).
VS Code will read this config and spin up or connect to the specified servers
to make their tools available to the AI.

Defining MCP Servers: In .vscode/mcp.json, you define a top-level "servers"
object. Each entry under it names an MCP server and provides its connection
details. For example, a minimal entry for a remote server might look like:

```json
{
  "servers": {
    "my-mcp-server": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

This would tell VS Code to connect to an MCP server at that URL (supporting
either Server-Sent Events or the newer streamable HTTP protocol).
Some servers (like a local tool runner) can be launched via a shell command
instead of a URL – in that case you’d specify a "command" and "args" instead
of "url". For example, the built-in GitHub MCP server (which provides tools
to manage GitHub issues/PRs) might be configured to run via a Node.js script.

Authentication and Inputs: Many MCP servers require API keys or tokens
(for example, a server that manages GitHub on your behalf needs your
GitHub auth). Rather than hardcoding secrets in the JSON, VS Code’s
Add Server workflow will use an "inputs" section to prompt you securely.
For instance, the config might include:

```json
"servers": {
  "github": {
     "url": "https://github-mcp.example.com",
     "inputs": { "authToken": "<enter your token here>" }
  }
}
```

VS Code will handle asking for and storing that token (often via OAuth now)
rather than saving plaintext in the file.
Recent updates introduced a seamless OAuth flow for MCP servers so you
can authorize them easily without manually editing tokens.

Dev Mode for MCP Servers: If you are developing or debugging a custom
MCP server, you can enable “development mode” for it by adding a "dev"
 section in its config. introduced.
 The dev object supports:

"watch" – a glob of files to watch. If those files change,
VS Code will auto-restart the server (great for iterative development).

"debug" – config for attaching a debugger when the server runs.
VS Code currently supports Node.js and Python servers (if you set
"debug": { "type": "node" }, for example, it will launch the server
such that VS Code can attach a debugger).

Example excerpt from mcp.json with dev mode, as shown in the release notes:

```json
{
  "servers": {
    "gistpad": {
      "command": "node",
      "args": ["build/index.js"],
      "dev": {
        "watch": "build/**/*.js",
        "debug": { "type": "node" }
      }
    }
  }
}
```

This would launch a local MCP server (named “gistpad”) with Node.js, restart
it on changes to the build folder, and allow debugging.

Using MCP in VS Code: Once your mcp.json is configured, the defined tools
become available to Copilot when in Agent mode. Copilot’s agent can call these
tools to perform actions (for example, call an API, run a database query,
open a web URL, etc.). VS Code provides a command “MCP: Add Server…” to help
you interactively add entries to mcp.json. There are also commands to manage
trust and permissions for these servers (since they can perform powerful
actions). For instance, you can review trusted servers or revoke access via
commands like “MCP: Manage Trusted Servers”. By default, VS Code will trust
no external servers until you add them.

Effect on Copilot: The Model Context Protocol essentially extends the AI’s
capabilities by giving it tools it can use autonomously. The mcp.json config
is how you inform VS Code (and Copilot) which external tools/servers to wire in.
For example, if you configure the GitHub MCP server, the AI gains the ability
to create issues, comment on PRs, etc., by invoking those tool APIs.
If you configure a custom “Docs” MCP server, the AI could fetch external
documentation. In the chat, these appear as special commands (usually
referenced with a #toolName syntax in prompts).
The release notes describe that you can combine tools into tool sets and even
have slash-commands for MCP-provided prompts. In short, mcp.json is the
file where you customize the AI’s external tool belt.

In summary, VS Code’s 2025 updates introduced a rich set of file-based
conventions to customize AI behavior:

Instructions files (`.github/copilot-instructions.md` and any
`*.instructions.md`): for injecting style guides or rules into Copilot’s context

Prompt files (`*.prompt.md`): for defining reusable AI tasks or questions
(exposed as slash commands).

`AGENTS.md`: a workspace guide for AI, automatically included in all prompts (enabled by default).

Agent Skills (folders in `.github/skills/` with `SKILL.md`): to give
Copilot new domain-specific abilities on demand (requires setting enabled).

`mcp.json` (in `.vscode/`): to configure external tools and integrations
the AI can use in Agent mode.

By leveraging these, you can deeply customize Copilot’s behavior – guiding
its coding style, instructing it with project knowledge, enabling it to use
new tools, or even orchestrating multiple AI “agents” together – all through
simple files in your codebase. These features were gradually rolled out
through 2025, so ensure you’re on a recent VS Code version and have the
appropriate settings toggled to take advantage of them.

## Additional File‑Based Instruction Hooks (Pre‑1.100 Features)

[VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

Before the broader unification around `.instructions.md` and `.prompt.md`,
VS Code had already started introducing *file‑backed instruction hooks*
for specific Copilot features. These are not standalone file conventions,
but targeted configuration points where instruction files are appended
to the underlying prompt for a particular action.

### Commit Message Generation (VS Code 1.96+)

In November 2024 (v1.96), VS Code added support for custom instructions
when generating commit messages. These instructions are appended directly
to the prompt Copilot uses when proposing a commit message.

Configuration is done via the setting:
`github.copilot.chat.commitMessageGeneration.instructions`

This setting accepts either inline instruction text or references to one
or more files from your workspace. Unlike `copilot-instructions.md`,
there is no fixed filename or location: any markdown file can be used,
as long as it is referenced by path.

In practice, teams use this to encode commit conventions such
as required formats (e.g. Conventional Commits), tone and tense rules,
maximum summary length, or project‑specific prefixes and components.
Because the instructions are injected verbatim into the generation prompt,
they act as a lightweight but effective policy layer.

### “Review Selection” Instructions (VS Code 1.95+)

In October 2024 (v1.95), VS Code introduced customizable instructions
for Copilot’s *review on selection* feature. This allows you to guide
how Copilot performs quick reviews on selected code snippets.

The configuration entry point is:
`github.copilot.chat.reviewSelection.instructions`

As with commit messages, instructions can be provided inline or via one or
more workspace files. The documentation explicitly shows multiple files
being combined, which makes this mechanism suitable for layered review
policies (for example, separate backend and frontend guidelines).

These instruction files typically act as a review rubric: what dimensions
to evaluate (correctness, security, performance), what to ignore
(generated code, formatting‑only changes), and what structure the output
should follow (findings, severity, suggested fixes).
This keeps review feedback consistent without requiring full agent mode.

### Pull Request Title and Description Generation

VS Code also exposes file‑based instructions for generating pull request
titles and descriptions through the GitHub integration.

The relevant setting is:
`github.copilot.chat.pullRequestDescriptionGeneration.instructions`

Here, instruction files are commonly used to mirror a repository’s PR template:
required sections (motivation, changes, testing), checklists, deployment notes,
or stylistic rules for summaries. As with other targeted hooks, these
instructions are appended to the prompt at generation time rather
than acting as global Copilot context.
