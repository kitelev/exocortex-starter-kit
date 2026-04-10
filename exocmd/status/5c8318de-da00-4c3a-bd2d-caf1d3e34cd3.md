---
exo__Asset_uid: 5c8318de-da00-4c3a-bd2d-caf1d3e34cd3
exo__Asset_label: "Set Status Blocked"
exo__Asset_isDefinedBy: "[[!exocmd]]"
exo__Asset_createdAt: "2026-04-05T12:00:00+0500"
exo__Instance_class:
  - "[[exocmd__Command]]"
exocmd__Command_icon: "ban"
exocmd__Command_precondition: "[[f73d0f13-26f8-42f9-950e-8883c835b114|Not in Blocked status]]"
exocmd__Command_grounding: "[[ef1d12dc-6a65-4f1d-b7f5-d5c5367d9633|Set status to Blocked]]"
exocmd__Command_successMessage: "Status set to Blocked"
exocmd__Command_category: "status"
---

# Set Status Blocked

Sets `ems__Effort_status` to Blocked on the target asset.

- **Precondition**: Visible only when asset is NOT in Blocked status
- **Grounding**: Sets `ems__Effort_status` to `[[ems__EffortStatusBlocked]]`
- **Icon**: ban (Lucide)
- **Category**: status
