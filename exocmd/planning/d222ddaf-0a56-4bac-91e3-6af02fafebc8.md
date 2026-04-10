---
exo__Asset_uid: d222ddaf-0a56-4bac-91e3-6af02fafebc8
exo__Asset_label: "Set scheduled date"
exo__Asset_isDefinedBy: "[[!exocmd]]"
exo__Asset_createdAt: "2026-04-05T12:00:00+0500"
exo__Instance_class:
  - "[[exocmd__Grounding]]"
exocmd__Grounding_type: "property_set"
exocmd__Grounding_targetProperty: "ems__Effort_scheduledDate"
exocmd__Grounding_targetValue: "$input"
---

# Set scheduled date

Grounding action that sets `ems__Effort_scheduledDate` on the target asset's frontmatter.

Uses the `property_set` grounding type with `$input` as the target value,
meaning the user provides the date through a modal input.
