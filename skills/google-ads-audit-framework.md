# google-ads-audit-framework

## Description

Comprehensive audit wrapper skill for the account.
This borrows the strongest public pattern found in the ecosystem: multi-dimension auditing with severity scoring, explicit action plans, and a clean divide between read-only diagnosis and approval-gated writes.

## Audit dimensions

1. Tracking and measurement
2. Campaign structure
3. Query quality and search term waste
4. Budget and pacing
5. Bidding and learning stability
6. Creative and asset quality
7. Competition and impression share

## Audit outputs

- weighted health score
- severity-rated findings
- quick wins
- 30/60/90-day action plan
- approval-required mutation queue

## Read-only mode

Default mode.
Use for first-pass audits, exports, screenshots, and account discovery.

## CEP write mode

If the human explicitly approves a change set:
1. Confirm exact mutations and affected entities
2. Execute only approved changes
3. Post-check status, counts, and before/after evidence

## Why include this

Public repos like `claude-ads` and `google-ads-skills` showed that one-off skills are useful, but operators also want a wrapper audit that orchestrates them into one decision-grade pass.
