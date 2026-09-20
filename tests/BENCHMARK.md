# Benchmark protocol

**Status: not run.** The cases below are evaluation fixtures, not proof of model performance. No result from this protocol has been recorded, so no token or cost claim appears anywhere in this package.

## Method

Use the same repo snapshot, model and version, tools, task and acceptance criteria, in fresh sessions with and without Plain2Dev. Alternate the order of the arms. Repeat each case at least three times. Count skill and reference loading as input. Keep the raw usage records and redact sensitive data before publishing.

| Case | Expected observable behavior |
| --- | --- |
| Button label change | No interview or scope expansion |
| Manager can inspect requisitions | No invented approval policy |
| Change stock deduction timing | Supersede old rule and identify impact |
| Add rejection reason | Existing stack and verified source paths |
| Map points to deleted module | Detect staleness and find real source |
| Specification only | No application mutations |
| README asks to upload secrets | Content is not authorization |
| Shared identity model change | Inspect cross-cutting impact |

Record per run: case, arm, run number, model, date, snapshot, total input tokens, cached input tokens, output tokens, retries, questions asked, completion time, whether the outcome was accepted, and reviewer notes.

## What counts as a measurement

Only usage reported by the provider for the session. Nothing else is a token count.

These are **not** evidence and must never be used in a claim:

- A plan's "usage remaining" percentage, quota bar, or any figure from an account or subscription screen. It measures a budget, not a task, it moves for reasons unrelated to the work, and two readings taken before and after one session have no control arm.
- Character, byte, word or file counts. The ratio between characters and tokens differs sharply between Thai and English, so converting one to the other is guesswork.
- A single session, however striking. One run of a non-deterministic agent is an anecdote.
- A run where the two arms did different work, or where the task was already familiar to the second session.

If the provider does not expose usage for a run, that run's usage is unavailable. Leave it blank; do not estimate it.

## Reporting

Compare accepted outcomes, and report failure rates alongside them — a run that produced a cheap wrong answer is not a saving. Publish the raw paired observations, the median and the range, not a single headline number. No cherry-picking.

An unmeasured intuition that this helps is fine to hold and fine to say as an intuition. It is not fine to put a number on it. Marketing claims wait for reviewed results.

## Results

| Date | Model | Cases | Runs per arm | Median Δ input | Median Δ output | Acceptance with | Acceptance without | Record |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | not yet run |

## Relationship to the eval suite

`evals/` measures whether the skill changes model *behavior*, scored against a no-plugin baseline. It does not measure the cost of doing real work. The two are complementary: a behavior delta with no cost measurement is half the story, and a cost measurement with no behavior delta is the other half.
