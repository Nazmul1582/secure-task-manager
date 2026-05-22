---
name: github-push-after-task
description: Commit and push completed repository work to GitHub after code changes. Use when working in this workspace after implementing, fixing, or refactoring code so completed tasks are verified, committed, and pushed before final response.
---

# GitHub Push After Task

After completing code changes in this workspace:

1. Run the relevant tests and checks for the changed area.
2. Inspect `git status --short` and `git diff` to confirm only intended files changed.
3. Create a concise commit that describes the completed task.
4. Push the current branch to its configured GitHub remote.
5. Mention the commit hash, pushed branch, and verification commands in the final response.

If tests cannot run or pushing fails, explain the exact blocker and leave the work committed locally only when a commit was successfully created.
