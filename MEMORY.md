# Memory

## Mandatory Git Workflow

When making ANY code changes, ALWAYS follow this workflow:

1. **git pull** - Get latest changes from remote
2. **git branch** - Create a feature branch for the work
3. **git add** - Stage the changes
4. **git commit** - Commit with descriptive message
5. **git push** - Push to remote
6. **create PR** - Create a pull request using `gh pr create`

This workflow is NON-NEGOTIABLE for all code changes.

**IMPORTANT**: You must always pull origin/main into your branch whenever making a change. You must resolve conflicts if they exist.

## Important Rules

- **Never merge PRs without approval** - Create PR and wait for review/approval before merging
- Do not use `--admin` flag to bypass branch protection rules

## Go Version Management for Docker Images

- **Always verify before changing Go version**:
  - Check what Go version is actually required (e.g., by checking upstream go.mod or build errors)
  - Verify the version exists at go.dev/dl before using it
  - Test the URL returns a 200 OK before including it in Dockerfile
- Never assume versions - use official URLs and verify
- Search https://go.dev/dl for available versions before making changes

- **Go 1.25.7 is the current stable release** (Feb 2026):
  - Official URL: https://go.dev/dl/go1.25.7.linux-amd64.tar.gz
  - This version is the latest stable and includes bug fixes

- **Previous Debian `golang` package is outdated** (Go 1.25.7):
  - Installing Go from Debian apt (golang package) often lags behind official releases
  - This was causing picoclaw build failures
- **Always use official Go from go.dev for Docker builds**

- **Architecture naming**:
  - `uname -m` returns `x86_64` but Go download URLs use `amd64`
  - For Docker linux/amd64 builds, use hardcoded `amd64` in download URL

## GitHub Actions Workflow Dependencies

- **Job dependency race condition**: Jobs with `needs:` dependency can sometimes start before dependency job's outputs are fully available
  - In `.github/workflows/docker-build.yml`, build jobs depend on `check-pr-status` to get `can_skip_build` output
  - However, outputs aren't immediately available to dependent jobs - there's a small delay
  - If dependent jobs start too early, they can't access to output and fail with "State not set" or similar errors
  - **Solution**: Don't have build jobs depend on external output. Instead, check the PR status logic inside each job itself
  - **Pattern**: Have self-contained logic in each job that can independently decide whether to run, rather than relying on outputs from a separate job
  - This avoids complex cross-job dependencies that are hard to reason about

- **Workflow `needs` clause behavior**:
  - `needs: [job1, job2]` means that job waits for BOTH jobs to complete
  - The dependency job must finish completely (including output setting) before dependent job starts
  - GitHub Actions has a delay of several seconds between job completion and output availability
  - **Pattern**: Have self-contained logic in each job that can independently decide whether to run, rather than relying on outputs from a separate job
  - **Don't have job A depend on job B's outputs** - job A should do its own checks and set its own outputs

- **When fixing workflow dependency issues**:
  - Look for jobs that depend on outputs from other jobs
  - Consider removing the external dependency and making the job self-contained
  - Add a sleep/delay or check for condition inside the dependent job if needed
  - Better yet: Make each job independently determine its behavior without needing external outputs
  - Document the dependency pattern in MEMORY.md so future agents understand the issue

- **Correct workflow pattern for PR artifact reuse**:
  - Build jobs should check internally: "Is this from a PR merge with available artifacts?"
  - If yes: Skip build, download artifacts from PR run
  - If no: Build fresh images
  - This avoids race conditions where jobs access outputs before they're available

The following tools are available:
- `read` - Read files from filesystem
- `write` - Write files to filesystem
- `edit` - Edit existing files
- `bash` - Execute shell commands
- `glob` - Search for files by pattern
- `grep` - Search file contents
- `git_*` - Git operations (status, diff, commit, add, branch, etc.)
- `sequential-thinking` - Problem-solving through structured thinking
- `jina-mcp-server_*` - Web search, URL reading, image search, etc.
- `playwright_browser_*` - Browser automation
- `puppeteer_*` - Browser automation
- `memory_*` - Knowledge graph operations
- `gemini-cli_*` - Gemini AI interactions
- `mcp-server-analyzer_*` - Code analysis (ruff, vulture)
- `filesystem_*` - File operations
- `mcp_everything_*` - Utility functions
