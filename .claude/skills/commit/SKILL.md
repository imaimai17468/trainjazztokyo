---
name: commit
description: Stage and commit changes split by feature. Use when the user wants to commit their work as fine-grained, feature-based commits.
argument-hint: [optional message or guidance]
allowed-tools: Bash(git *) Read Grep Glob
---

# Feature-based Commit Skill

Create fine-grained, feature-based commits from the current working tree changes. Each commit should represent a single logical unit of work.

## Process

1. **Analyze changes**: Run `git status` and `git diff` (staged + unstaged) to understand all modifications.
2. **Group by feature**: Classify each changed file into logical feature groups. A feature group is a cohesive unit such as:
   - A new component and its styles
   - A configuration change (e.g. adding a tool, updating tsconfig)
   - A bug fix touching related files
   - A refactor of a specific module
   - Test additions for a specific feature
3. **Order commits logically**: Infrastructure/config changes first, then features, then tests/docs.
4. **For each feature group**, in order:
   - Stage only the files belonging to that group using `git add <specific files>`
   - Commit with a concise, conventional commit message following this format:
     ```
     <type>(<scope>): <short description>
     ```
     Types: `feat`, `fix`, `refactor`, `chore`, `style`, `test`, `docs`, `ci`, `perf`
   - End the commit message with:
     ```
     Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
     ```
5. **Verify**: Run `git status` after all commits to confirm a clean working tree.

## Rules

- NEVER use `git add -A` or `git add .` — always add specific files
- NEVER amend existing commits
- NEVER push to remote
- Keep each commit small and focused — prefer more commits over fewer
- If user provides $ARGUMENTS, use it as guidance for grouping or messaging
- Use Japanese for commit scope names only if the user's conversation is in Japanese, otherwise use English
- Always pass commit messages via HEREDOC for proper formatting
