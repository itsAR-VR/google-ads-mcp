# cep-write-operations

## Description

Shared safety protocol for all Google Ads mutations in this repo.
Inspired by public Google Ads skill libraries that explicitly gate writes, but tightened so it can be reused by every mutation-capable workflow.

## CEP = Confirm → Execute → Post-check

### 1. Confirm
Before any write, present:
- affected entities
- current state
- proposed new state
- expected reason/benefit
- known risks
- rollback or mitigation notes where possible

### 2. Execute
Execute only the approved subset.
No surprise edits. No batching in extra cleanup because it felt tidy.

### 3. Post-check
Immediately validate:
- API call success/failure
- resulting entity status or values
- whether the expected change took effect
- any partial failures
- next monitoring recommendation

## Required output fields

- `changeSummary`
- `beforeState`
- `requestedAfterState`
- `executionResult`
- `postCheck`
- `riskNotes`

## Use this with

- `negative-keyword-management.md`
- `budget-optimization.md`
- `bid-management.md`
- direct MCP mutation tools

## Default policy

If approval is ambiguous, do not write.
Draft the mutation queue and stop there.
