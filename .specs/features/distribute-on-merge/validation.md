# Distribute on Merge Validation

**Date**: 2026-07-23  
**Spec**: `.specs/features/distribute-on-merge/spec.md`  
**Diff range**: `ee7dbb9^..792adc7` (3 commits)  
**Commits**:
- `ee7dbb9` — docs(distribute-on-merge): bootstrap specs and project decisions
- `f50b01e` — ci(distribute-on-merge): parse PR priority checkboxes on merge
- `792adc7` — ci(distribute-on-merge): cherry-pick to priority branches with pre-push gate  
**Implementation**: `.github/workflows/distribute-on-merge.yml`  
**Related pattern**: `.github/workflows/CI.yml` (lint → check → test + env)  
**Verifier**: independent sub-agent (author ≠ verifier)  
**Verdict**: **PASS**

---

## Task Completion

No formal `tasks.md` for this feature (medium/auto-sized). Inferred from commit range:

| Task (inferred) | Status | Notes |
| --------------- | ------ | ----- |
| Bootstrap specs / decisions | ✅ Done | `ee7dbb9` |
| Parse checkboxes + no-target comment | ✅ Done | `f50b01e` |
| Distribute matrix + gate + push + summary | ✅ Done | `792adc7` |

---

## Spec-Anchored Acceptance Criteria

Evidence is structural (Actions YAML encodes outcomes). There are no unit/integration tests for this workflow — citations point at YAML steps that assert/perform the spec outcome. Evidence-or-zero applied.

### DIST-01 — Parse + trigger (P1)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + what YAML asserts/does | Result |
| ------------------------- | -------------------- | ------------------------------------ | ------ |
| WHEN a PR is merged into `main` THEN the workflow SHALL start | Run on merge to `main` | `distribute-on-merge.yml:3-6` — `on.pull_request` `types: [closed]`, `branches: [main]`; `distribute-on-merge.yml:14` — job `if: github.event.pull_request.merged == true` | ✅ PASS |
| WHEN body contains `- [x] prod-a` (case-insensitive `x`) THEN include `prod-a` | Target list includes `prod-a` | `distribute-on-merge.yml:35-38` — whitelist loop + `grep -Eiq` for `- [x] <name>`; `41-57` — outputs `branches` JSON / `has_targets` | ✅ PASS |
| WHEN body marks names outside whitelist THEN ignore them | Only `prod-a`/`prod-b`/`prod-c` considered | `distribute-on-merge.yml:35` — loop fixed to those three names only | ✅ PASS |

### DIST-02 — No targets → comment (P1)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + what YAML asserts/does | Result |
| ------------------------- | -------------------- | ------------------------------------ | ------ |
| WHEN no valid checkbox marked THEN SHALL not distribute AND SHALL comment that daily pairing will cover it | No matrix distribute; PR comment about daily job | `distribute-on-merge.yml:43-45` — `has_targets=false`, `branches=[]`; `60-68` — `gh pr comment` with daily pairing message; `69-71` — `distribute` gated on `has_targets == 'true'` | ✅ PASS |

### DIST-03 — Cherry-pick / idempotency / conflict (P1)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + what YAML asserts/does | Result |
| ------------------------- | -------------------- | ------------------------------------ | ------ |
| WHEN there are targets THEN for each branch attempt cherry-pick of `merge_commit_sha` | Per-target cherry-pick of merge SHA | `distribute-on-merge.yml:73-77` — matrix over parsed branches; `91-92` — `SHA` from parse outputs; `106-115` — `git cherry-pick` | ✅ PASS |
| WHEN SHA already ancestor THEN skip idempotently without error | Skip, no failure | `distribute-on-merge.yml:100-104` — `merge-base --is-ancestor` → `status=skip`, `exit 0` | ✅ PASS |
| WHEN cherry-pick conflicts THEN abort only that branch with no push | Fail that matrix leg; no push | `distribute-on-merge.yml:110-114` — abort + `status=fail` + `exit 1`; `74` — `fail-fast: false`; `145-146` — push only if `status == 'applied'` | ✅ PASS |
| WHEN plain cherry-pick fails on merge commit THEN retry `cherry-pick -m 1` | Retry `-m 1` before fail | `distribute-on-merge.yml:106-109` — plain then `elif git cherry-pick -m 1` | ✅ PASS |

### DIST-04 — Pre-push gate (P1)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + what YAML asserts/does | Result |
| ------------------------- | -------------------- | ------------------------------------ | ------ |
| WHEN cherry-pick succeeds THEN run lint → check → test | Same gate order as CI (+ env) | `distribute-on-merge.yml:119-143` — Deno setup, `deno lint src`, `deno check server.ts`, `deno task test` only if `status == 'applied'`; env `135-142` matches `CI.yml:33-40` | ✅ PASS |

### DIST-05 — Push only if gate ok (P1)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + what YAML asserts/does | Result |
| ------------------------- | -------------------- | ------------------------------------ | ------ |
| WHEN gate fails THEN SHALL not push that branch | No push after failed lint/check/test | `distribute-on-merge.yml:125-153` — gate steps precede push; push `if: steps.apply.outputs.status == 'applied'` with GHA default `success()` so prior gate failure skips push; `155-160` records gate/push failure | ✅ PASS |
| WHEN gate passes THEN SHALL push target branch | `git push` to matrix branch | `distribute-on-merge.yml:145-153` — `git push origin "HEAD:${BRANCH}"` + `ok: pushed…` artifact line | ✅ PASS |

### DIST-06 — PR summary comment (P2)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + what YAML asserts/does | Result |
| ------------------------- | -------------------- | ------------------------------------ | ------ |
| WHEN distribution finishes (full or partial) THEN comment status per branch (`ok` / `skip` / `fail:reason`) | Auditable PR comment listing each target | `distribute-on-merge.yml:170-172` — `summary` with `if: always() && has_targets`; `175-209` — download artifacts + `gh pr comment` with per-branch lines; writers: `102` (`skip:`), `113` (`fail:`), `153` (`ok:`), `160` (`fail:`) | ✅ PASS |

**Spec-anchored status**: ✅ All DIST-01…DIST-06 ACs covered (6/6). No uncovered ACs. Minor note: comment lines use `ok: …` / `skip: …` / `fail: …` (richer than bare tokens) — still matches `ok` / `skip` / `fail:reason` intent; not flagged as precision gap.

---

## Edge Cases

| Edge case | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| PR closed without merge → SHALL not distribute | No distribute | `distribute-on-merge.yml:14` — parse job requires `merged == true`; distribute `needs` parse and only runs when `has_targets` (unreachable if parse skipped) | ✅ PASS |
| One matrix branch fails, another succeeds → successful pushed; aggregate workflow fails | Isolation + red workflow | `distribute-on-merge.yml:74` — `fail-fast: false`; push on success path `145-153`; any failed matrix leg fails `distribute` job → workflow conclusion failure | ✅ PASS |
| `merge_commit_sha` empty → job fails with explicit error | Explicit error + fail | `distribute-on-merge.yml:29-32` — `::error::merge_commit_sha is empty` + `exit 1` | ✅ PASS |

---

## Discrimination Sensor

**Depth**: lightweight (adapted for Actions YAML)  
**Mode**: **LIMITED** — no unit/workflow tests exist; faults proposed in scratch reasoning only (working tree not mutated). Automated kill cannot be demonstrated.

| # | Proposed fault (scratch only) | Would break | Would CI/unit “look green”? | Catch method |
| - | ----------------------------- | ----------- | --------------------------- | ------------ |
| 1 | Remove checkbox `grep` / always emit empty `BRANCHES` | DIST-01 include targets; DIST-02 false-negative path always taken | Yes — no workflow tests | Review or UAT: marked PR never distributes |
| 2 | Remove lint/check/test steps (or move push before gate) | DIST-04 / DIST-05 | Yes — cherry-pick+push alone succeeds | YAML review or UAT with post-pick breakage |
| 3 | Remove `fail-fast: false` (default `true`) | Edge: sibling success+push under peer failure | Often yes on single-target UAT | Multi-branch UAT / review of strategy |

**Sensor result**: LIMITED — 0/3 empirically killed (no test harness).  
**Surviving risk** (ranked):
1. **No automated regression net** for parse/gate/fail-fast — regressions only caught by human review or live merge UAT.
2. **Single-branch happy-path UAT** can miss fail-fast / isolation regressions.
3. **Gate bypass** would not be caught by app unit tests in this repo’s CI unless someone re-reads the workflow.

---

## Gate Check

- **Gate command**: none defined in feature `tasks.md` (file absent); deliverable is Actions YAML, not Deno app code.
- **Workflow unit/integration tests**: 0
- **App test delta for this feature**: N/A (feature did not add/remove app tests)
- **Result**: N/A structural — treated as gate-by-review against spec; not a test-runner pass/fail.

---

## Code Quality (scoped to feature surface)

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Workflow-only; matches stated scope |
| Surgical changes | ✅ Feature commits confined to specs + this workflow |
| No scope creep | ✅ No Discord/daily pairing (out of scope) |
| Matches patterns | ✅ Gate commands/env align with `CI.yml` |
| Spec-anchored outcomes in deliverable | ✅ |
| Per-layer Coverage Expectation (domain tests 1:1) | ⚠️ N/A / LIMITED — infra YAML, no test layer |
| Every test maps to AC | N/A — no tests |
| Documented guidelines | none for Actions — strong defaults applied (fail-closed, whitelist, fail-fast false) |

---

## Fix Plans

None — no AC failures or grounded implementation gaps requiring fix tasks.

Optional hardening (not FAIL blockers; suggestions only):
- Add workflow-level tests (e.g. act / scripted parse extraction) to kill sensor mutants #1–#3.
- Explicit multi-branch merge UAT checklist for isolation + aggregate red.

---

## Requirement Traceability (verifier recommendation)

| Requirement | Previous Status | Verifier status |
| ----------- | --------------- | --------------- |
| DIST-01 | Implementing | ✅ Verified (structural) |
| DIST-02 | Implementing | ✅ Verified (structural) |
| DIST-03 | Implementing | ✅ Verified (structural) |
| DIST-04 | Implementing | ✅ Verified (structural) |
| DIST-05 | Implementing | ✅ Verified (structural) |
| DIST-06 | Implementing | ✅ Verified (structural) |

Note: `spec.md` status table not mutated by this verifier (report-only scope).

---

## Summary

**Overall**: ✅ Ready (PASS)

**Spec-anchored check**: 6/6 DIST ACs + 3/3 edge cases matched by YAML evidence  
**Sensor**: LIMITED (3 proposed faults; 0 empirically killed — no workflow tests)  
**Gate**: N/A (no workflow test suite)

**What works**: Merge-gated parse with whitelist checkboxes; no-target daily-pairing comment; per-branch cherry-pick with ancestor skip, conflict abort, `-m 1` retry; CI-aligned pre-push gate; push only after applied+success chain; per-branch PR summary via artifacts; empty SHA hard-fail; fail-fast false for isolation.

**Issues found**: None at AC level. Surviving risk is absence of automated discrimination for the workflow.

**Lessons**: No grounded AC failure / surviving-mutant-with-tests / SPEC_DEVIATION — **do not record lessons** for this clean structural PASS.

**Next steps**: Optional UAT on a real merge (subset marked, none marked, forced conflict) to close LIMITED sensor risk; optional workflow tests if lab wants killable mutants.
