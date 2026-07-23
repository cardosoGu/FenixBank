# STATE

## Decisions

### AD-001
- **Decision**: Integration branch for the lab is `main` (not a separate `production` branch).
- **Reason**: Test repository; naming does not need to mirror production topology.
- **Trade-off**: Docs/scripts must say `main` instead of `production`.
- **Scope**: All CI/CD workflows and distribution automation.
- **Date**: 2026-07-23
- **Status**: active

### AD-002
- **Decision**: Immediate deploy priority is selected via PR body checkboxes for `prod-a`, `prod-b`, `prod-c` only.
- **Reason**: Simple, visible, matches PR template; unmarked branches wait for daily pairing.
- **Trade-off**: Labels/API not used; body format must stay stable.
- **Scope**: `distribute-on-merge` and future daily pairing job.
- **Date**: 2026-07-23
- **Status**: active

### AD-003
- **Decision**: Quality gate is `deno lint src` → `deno check server.ts` → `deno task test` (with CI test env vars).
- **Reason**: Deno stack; blocks broken deploys before push.
- **Trade-off**: Must keep env vars available in Actions for JWT/DB validation on import.
- **Scope**: PR CI and pre-push gates on distribution.
- **Date**: 2026-07-23
- **Status**: active

### AD-004
- **Decision**: Apply strategy uses `merge_commit_sha` cherry-pick, with retry `cherry-pick -m 1` for two-parent merge commits.
- **Reason**: Squash vs merge commit still under evaluation; this path covers both in the lab.
- **Trade-off**: May need refinement once merge strategy is fixed repo-wide.
- **Scope**: Pontual distribution and (later) daily pairing apply step.
- **Date**: 2026-07-23
- **Status**: active

### AD-005
- **Decision**: Discord notifications are out of v1 for pontual distribution; audit via Actions logs + PR comment.
- **Reason**: Avoid blocking on webhook secret setup during lab bootstrap.
- **Trade-off**: No Discord visibility until a follow-up task.
- **Scope**: `distribute-on-merge` v1.
- **Date**: 2026-07-23
- **Status**: active

## Handoff

- **Feature**: distribute-on-merge / `.specs/features/distribute-on-merge`
- **Phase / Task**: Execute complete — Verifier PASS
- **Completed**: bootstrap specs, parse-checkboxes, distribute+summary, validation
- **In-progress**: none
- **Next step**: Live UAT via merge PR with checkbox; then daily pairing job
- **Blockers**: none (sensor LIMITED — no workflow unit harness)
- **Uncommitted files**: validation.md + spec status (committing)
- **Branch**: main
