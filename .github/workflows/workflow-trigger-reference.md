# Workflow Trigger Reference

This file summarizes when the workflow files in this directory trigger and when their jobs actually run.

## PR Agent / AI PR Reviewer

Workflow file: `pr_agent.yml`

Relevant trigger and job guard:

```yaml
on:
  pull_request:
    types: [opened, reopened, ready_for_review, synchronize]
  issue_comment:
    types: [created]

jobs:
  pr_agent_job:
    if: >-
      ${{
        github.event.sender.type != 'Bot' &&
        (
          (
            github.event_name == 'pull_request' &&
            github.event.pull_request.draft == false
          ) ||
          (
            github.event_name == 'issue_comment' &&
            github.event.issue.pull_request
          )
        )
      }}
```

| Scenario | GitHub event | Workflow triggered | Job runs | Notes |
| --- | --- | ---: | ---: | --- |
| New Ready PR | `pull_request.opened` | Yes | Yes | PR is not draft, so `draft == false` passes. |
| New Draft PR | `pull_request.opened` | Yes | No | Workflow starts, but the job is skipped by the draft guard. |
| Reopen Ready PR | `pull_request.reopened` | Yes | Yes | Non-draft PRs get automatic review. |
| Reopen Draft PR | `pull_request.reopened` | Yes | No | Draft PR automatic review is skipped. |
| Draft PR becomes Ready for review | `pull_request.ready_for_review` | Yes | Yes | After becoming Ready, `draft == false` passes. |
| Push new commit to Ready PR | `pull_request.synchronize` | Yes | Yes | `synchronize` is included both in workflow triggers and PR Agent `pr_actions`. |
| Push new commit to Draft PR | `pull_request.synchronize` | Yes | No | Workflow starts, but the job is skipped by the draft guard. |
| Human creates a new PR conversation comment | `issue_comment.created` | Yes | Yes | Comment target is a PR, so `github.event.issue.pull_request` passes. |
| Human creates a new normal issue comment | `issue_comment.created` | Yes | No | Workflow starts, but the job detects it is not a PR and skips. |
| Bot creates or updates PR/comment | Matching event | Yes/maybe | No | `github.event.sender.type != 'Bot'` prevents review loops. |
| Edit PR title or description | `pull_request.edited` | No | No | `edited` is not listed in `pull_request.types`. |
| Close or merge PR | `pull_request.closed` | No | No | `closed` is not listed in `pull_request.types`. |
| Inline PR review comment | `pull_request_review_comment` | No | No | The workflow listens to `issue_comment`, not inline review comments. |

Automatic PR Agent actions are restricted to:

```yaml
github_action_config.pr_actions: '["opened", "reopened", "ready_for_review", "review_requested", "synchronize"]'
```

Manual trigger examples in a PR conversation comment:

```text
/review
```

```text
/ask Is there any security risk in the latest change?
```

Note: `issue_comment` workflows are resolved from the default branch. If this workflow file only exists on an unmerged PR branch, comment-based triggering may not be fully testable until the PR is merged.

## CI Build Check

Workflow file: `ci-build-check.yml`

Relevant trigger:

```yaml
on:
  pull_request:
  push:
    branches:
      - main
      - master
```

| Scenario | GitHub event | Workflow triggered | Job runs | Notes |
| --- | --- | ---: | ---: | --- |
| New Ready PR | `pull_request.opened` | Yes | Yes | `pull_request` has no explicit `types`, so GitHub uses default PR trigger types. |
| New Draft PR | `pull_request.opened` | Yes | Yes | CI does not distinguish Draft vs Ready PRs. |
| Push new commit to PR branch | `pull_request.synchronize` | Yes | Yes | Applies to both Ready and Draft PRs. |
| Reopen PR | `pull_request.reopened` | Yes | Yes | Included in the default `pull_request` behavior. |
| Draft PR becomes Ready for review | `pull_request.ready_for_review` | Usually no | No | Not explicitly listed; may only run if another default PR event also occurs. |
| Human creates a new PR comment | `issue_comment.created` | No | No | CI does not listen to comments. |
| Human creates a normal issue comment | `issue_comment.created` | No | No | CI does not listen to comments. |
| Push to `main` | `push` | Yes | Yes | Merging a PR into `main` also creates a push to `main`. |
| Push to `master` | `push` | Yes | Yes | Kept for compatibility if a repository uses `master`. |
| Push to feature branch without PR | `push` | No | No | `push` is limited to `main` and `master`. |
| Edit PR title or description | `pull_request.edited` | No | No | Default `pull_request` behavior does not include `edited`. |
| Close PR without merge | `pull_request.closed` | No | No | The PR close event itself does not run CI. |
| Merge PR into `main` | `push` | Yes | Yes | The merge creates a push to `main`. |

When triggered, CI runs on `windows-latest` and performs:

1. Checkout.
2. Setup Node.js 22.
3. `npm ci`.
4. `npm test`.
5. `npm run test:smoke`.
6. `npm run package:win`.
7. Upload `release/Thunderbolt Fighter-win32-x64` as a GitHub Actions artifact.
