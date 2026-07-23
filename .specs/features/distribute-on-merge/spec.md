# Distribute on Merge Specification

## Problem Statement

Merges into `main` do not propagate changes to deploy branches (`prod-a` / `prod-b` / `prod-c`). The lab needs pontual distribution driven by PR checkboxes, with a quality gate before push and isolated failure per branch.

## Goals

- [ ] Merge into `main` triggers automation that reads PR priority checkboxes
- [ ] Marked branches receive the merge SHA via cherry-pick without manual intervention on the happy path
- [ ] Lint + typecheck + tests pass on the result before push
- [ ] PR receives an audit comment with per-branch results

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Daily pairing job | Separate rhythm; later |
| Discord notifications | Out of v1 (AD-005) |
| DigitalOcean deploy config | Deploy is a side effect of push |
| Force-push / auto-resolve conflicts | Fail-closed; human intervention |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Integration branch | `main` | AD-001 | y |
| Priority mechanism | checklist `- [x] prod-*` | AD-002 | y |
| Targets whitelist | `prod-a`, `prod-b`, `prod-c` | AD-002 | y |
| Pre-push gate | lint → check → test (+ CI env) | AD-003 | y |
| Squash vs merge commit | cherry-pick SHA; retry `-m 1` | AD-004 | y (lab default) |
| Discord v1 | no | AD-005 | y |
| Aggregate workflow status | red if any target branch fails | visibility in lab | y |
| Job name for parse | `parse-checkboxes` | matches in-progress stub | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Parse priority and decide targets

**User Story**: As a developer, I want to mark branches on the PR so only those get immediate deploy.

**Why P1**: Without parse, nothing else runs correctly.

**Acceptance Criteria**:

1. WHEN a PR is merged into `main` THEN the workflow SHALL start
2. WHEN the body contains `- [x] prod-a` (case-insensitive `x`) THEN the system SHALL include `prod-a` in targets
3. WHEN no valid checkbox is marked THEN the system SHALL not distribute and SHALL comment that daily pairing will cover it
4. WHEN the body marks names outside the whitelist THEN the system SHALL ignore them

**Independent Test**: Merge with only `prod-b` → output `branches=["prod-b"]`; merge with none → PR comment and no matrix.

---

### P1: Apply commit on prioritized branch

**User Story**: As the team, I want marked branches to receive the merge SHA automatically.

**Why P1**: Core of pontual distribution.

**Acceptance Criteria**:

1. WHEN there are targets THEN for each branch the system SHALL attempt cherry-pick of `merge_commit_sha`
2. WHEN the SHA is already an ancestor of the branch THEN the system SHALL skip idempotently without error
3. WHEN cherry-pick conflicts THEN the system SHALL abort only that branch with no push
4. WHEN plain cherry-pick fails on a merge commit THEN the system SHALL retry `cherry-pick -m 1` before failing

**Independent Test**: Merge with `prod-a` → `prod-a` contains SHA; `prod-b` unchanged.

---

### P1: Pre-push quality gate

**User Story**: As the team, I want to block pushes that would break autodeploy.

**Why P1**: Fail-closed before DigitalOcean-style deploy.

**Acceptance Criteria**:

1. WHEN cherry-pick succeeds THEN the system SHALL run lint → check → test
2. WHEN the gate fails THEN the system SHALL not push that branch
3. WHEN the gate passes THEN the system SHALL push the target branch

**Independent Test**: Force gate failure → no push; happy path → push.

---

### P2: PR summary comment

**User Story**: As the PR author, I want per-branch results on the PR.

**Why P2**: Audit without opening Actions for every detail.

**Acceptance Criteria**:

1. WHEN distribution finishes (full or partial) THEN the system SHALL comment status per branch (`ok` / `skip` / `fail:reason`)

**Independent Test**: After a run, PR has a comment listing each target.

---

## Edge Cases

- WHEN PR is closed without merge THEN the workflow SHALL not distribute
- WHEN one matrix branch fails and another succeeds THEN successful branches SHALL have been pushed; aggregate workflow SHALL fail
- WHEN `merge_commit_sha` is empty THEN the job SHALL fail with an explicit error

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| DIST-01 | P1: Parse + trigger | Execute | Implementing |
| DIST-02 | P1: No targets → comment | Execute | Implementing |
| DIST-03 | P1: Cherry-pick / idempotency / conflict | Execute | Implementing |
| DIST-04 | P1: Pre-push gate | Execute | Implementing |
| DIST-05 | P1: Push only if gate ok | Execute | Implementing |
| DIST-06 | P2: PR summary comment | Execute | Implementing |

**Coverage:** 6 total, 6 mapped to workflow jobs, 0 unmapped.

---

## Success Criteria

- [ ] Merge with a subset marked updates only that subset
- [ ] No marks → no pontual push + comment
- [ ] Conflict / CI fail → no push on bad branch; others continue
- [ ] PR receives an auditable summary
