# AI context configuration files

Overview of VS Code’s AI Customization Files (2025 Updates)

Over the past year, Visual Studio Code introduced several features that let you
tune the behavior of its built-in GitHub Copilot AI using configuration files
in your projects. These include custom instruction files, prompt files,
multi-agent instruction files (`AGENTS.md`), agent “skills” (`SKILL.md`), and
Model Context Protocol config (mcp.json).
Below we detail each feature, the purpose of its files, what to put in them,
how they influence Copilot’s context/behavior, where to place them,
and relevant settings for enabling these features.

## Custom Instructions Files (instructions.md)

Custom instructions allow you to provide general guidelines or rules to tailor
Copilot’s responses for your needs. Initially, VS Code supported a single
workspace-specific instructions file, and later expanded to multiple
reusable instruction files:

Workspace Instructions (`copilot-instructions.md`): Starting in
VS Code February 2025 (v1.98), you can add a markdown file
`.github/copilot-instructions.md` in your repository to supply custom
instructions (for example, coding style rules or project conventions).
When the setting github.copilot.chat.codeGeneration.useInstructionFiles
is enabled, Copilot will incorporate this file’s content into its responses.
This feature reached general availability in v1.98, so make sure the setting
is on and the file is present for Copilot to use it.

Reusable Instructions Files (`.instructions.md`): In April 2025 (v1.100),
VS Code introduced a more flexible system for instructions files.
Any file with the suffix .instructions.md can act as an instruction file.
These can reside in your workspace (e.g. a dedicated folder like
`.github/instructions/`) or in your global user data folder.
VS Code maintains a list of folders to scan via the
`chat.instructionsFilesLocations` setting.

Usage: Instructions files are not standalone chat prompts, but additional
context that can be attached to chat queries. You can attach an instructions
file manually (for a given chat question) via the chat UI
(“Add Context > Instructions…”) or using the Chat: Attach Instructions… command.
You can also configure them to attach automatically based on context:
include a YAML frontmatter in the file with an applyTo pattern (glob)
indicating which files or scenarios it applies to.

If your chat query involves a file matching that pattern, VS Code will
auto-attach the instructions file as context. For example,
an instructions file might start with:

```plaintext
---
applyTo: '**/*.ts'
---

Free form guidelines
```

The above would be auto-included whenever Copilot is asked about a .ts file.
Instructions files can be created easily via the “Chat: New Instructions File…”
command, and VS Code even syncs user-level instruction files across machines
if Settings Sync is enabled (ensure “Prompts and Instructions” is checked
in sync settings).

Effect on Copilot: These instruction files’ content is injected into Copilot’s
prompt context (as a system or user message) whenever they are attached.
This steers the AI’s answers to follow your rules or preferences. For example,
you might include preferred coding style, architectural guidelines,
or project-specific terminology, and Copilot will then attempt to obey those
instructions in its suggestions.

## Prompt Files (.prompt.md)

Prompt files provide a way to define entire reusable chat prompts
(questions or tasks) that you or your team frequently use. They were
standardized in v1.100 alongside instructions files. A prompt file
(suffix `.prompt.md`) contains a complete chat request, including any preset
question/task and even which AI “mode” and tools to use.

Location and Setup: Like instructions, prompt files can live in the workspace
or user folders, configured via chat.promptFilesLocations setting.
They often reside in a folder (for example, `.github/prompts/` or similar).

Using Prompt Files: There are multiple ways to invoke a prompt file:

Type `/` in the Copilot Chat input, and you’ll see available prompt names
(each prompt file becomes a slash command). For example, if you have a prompt
file named `deploy.prompt.md`, you can run it by typing `/deploy`.

Open the prompt file in the editor and click the “Run” (▶) button in the
editor toolbar to execute it immediately.

Use the Chat: Run Prompt File... command from the Command Palette to pick
and run a prompt.

Prompt File Format: Prompt files support YAML frontmatter to specify how they
run. Key fields include:

`mode:` which chat mode to use (ask, edit, or agent). For instance,
`mode: 'agent'` if the prompt should run in autonomous agent mode.

`tools:` if in agent mode, you can list which tools are allowed for this prompt.

The rest of the file’s body is the prompt text to send.
For example, a prompt file to generate release notes could be defined as:

```plaintext
---
mode: 'agent'
tools: ['getReleaseFeatures', 'file_search', 'read_file', ...]
---

Generate release notes for the features I worked on in the current release...
```

This defines a custom agent-mode task with specific tools. You can create
new prompt files with the `Chat: New Prompt File...` command. Prompt files are
useful for one-click automation of common workflows (they appear as slash
commands and can encapsulate multi-step tasks).

Effect on Copilot: When you run a prompt file, Copilot Chat will treat its
content as if you asked that multi-line question or issued those instructions.
If mode: agent is set, Copilot will autonomously use the specified tools to
complete the task.

Prompt files essentially let you predefine complex queries or actions for
the AI to execute.

## AGENTS.md (Multi-Agent Instructions File)

`AGENTS.md` is a special markdown file introduced in August 2025 (v1.104)
to provide shared context or instructions when you are working with multiple
AI agents in VS Code. Think of it as a README for AI agents in your project.

Purpose: The `AGENTS.md` file is automatically included as additional context
for Copilot (and other agents) in your workspace. It’s useful especially for
teams or scenarios using more than one AI agent (e.g. Copilot plus custom
agents) to coordinate their behavior or give them project-wide guidance.
You might include high-level project notes, coding conventions, or a
description of each agent’s role.

Location: Place `AGENTS.md` at the root of your workspace repository.
In a multi-root workspace, you can have one in each root. By default,
VS Code will detect this file and include it. Starting with v1.104,
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
agents should collaborate. Whenever you start a new chat or agent task,
Copilot will include the text from `AGENTS.md` in the prompt it sends
to the model, which helps align the AI’s output with your project’s context.

## Agent Skills (SKILL.md files)

Agent Skills were introduced as an experimental feature in
December 2025 (v1.108) to “teach” the AI new capabilities or domain
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

## MCP Configuration (mcp.json for Tools/Servers)

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
 section in its config. This was introduced in v1.101.
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

1) Commit message generation: file-based tuning (VS Code 1.96+)
What shipped

VS Code added custom instructions for commit message generation in v1.96 (Nov 2024).

How to configure

Setting:

github.copilot.chat.commitMessageGeneration.instructions

It accepts either:

inline instructions ({ "text": "..." })

or file references ({ "file": "path/to/file.md" })

…and VS Code explicitly says these instructions are appended to the prompt used to generate the commit message.

Where the file can live

This is not a standardized filename like copilot-instructions.md. Instead, you can put the file anywhere in the workspace, and reference it by path from your workspace (typical: guidance/commit.md, .github/instructions/commit.instructions.md, etc.). The release notes call it “a file from your workspace”.

What to put in the file 🧩

Common patterns that work well:

Required format (Conventional Commits, Jira ticket prefix, etc.)

Allowed/required sections (summary + body + breaking changes)

Tone / tense rules (“imperative mood”, “max 72 chars”, etc.)

Project-specific keywords / components list

2) “Review selection” instructions: file-based review policy (VS Code 1.95+)
What shipped

VS Code added support for custom review instructions for Copilot’s “quick review on code selection” in v1.95 (Oct 2024).

How to configure

Setting:

github.copilot.chat.reviewSelection.instructions

Same mechanism:

inline text, or

one or multiple files

The official docs show an example with two file references (e.g., backend + frontend review guidelines).

Where files can live

Again: any path inside your workspace (example uses guidance/backend-review-guidelines.md, guidance/frontend-review-guidelines.md).

What to put in review instruction files 🧠

This is best used as a “review rubric”, for example:

what to check (security, performance, correctness, error handling)

what to ignore (generated code, formatting-only diffs)

what to output (bulleted findings + severity + suggested patch)

project-specific pitfalls (threading model, i18n, logging policy)

3) PR title/description generation instructions: file-based (docs)
What exists in VS Code

VS Code has “smart actions” to generate:

commit message

PR title and description (via Source Control / GitHub PR experience)

How to tune PR description generation

Setting:

github.copilot.chat.pullRequestDescriptionGeneration.instructions

The docs show this as a list of instruction objects, same as above (inline text or file).

What to put there ✍️

Typical:

required PR template sections (Motivation / Changes / Testing / Risks)

include checklists, deployment notes, migration steps

style rules (“include a list of key changes”) — the docs use this exact kind of instruction
