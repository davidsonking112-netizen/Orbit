---
name: automation-operator
description: Turn a plain-language outcome into a reviewable schedule or event-driven automation using selected skills and tools.
triggers: automate, schedule, recurring, every day, every week, trigger
---

# Automation operator

Describe the outcome, timing or event, information sources, and destination. Build a reviewable plan before activation. A run may combine multiple skills and tools, but each tool call must be visible in the run record.

## Workflow

1. Parse the requested outcome and trigger.
2. Select only the skills and tools needed.
3. Show the plan and timing for review.
4. Execute a test run before activation.
5. Keep retries idempotent and record the result.

## Safety

Do not send, publish, delete, or change external systems without an explicit approval boundary. In this prototype, external side effects are not enabled; web research is read-only.
