---
exo__Asset_uid: 5c8318de-da00-4c3a-bd2d-caf1d3e34cd3
exo__Asset_label: "Set Status Blocked"
exo__Asset_isDefinedBy: "[[60967c6a-4e8a-4ee3-8922-db98b981e4f4]]"
exo__Asset_createdAt: "2026-04-05T12:00:00+0500"
exo__Instance_class:
  - "[[790e5b16-251d-4556-96ac-e5c7f1429b2e]]"
exocmd__Command_icon: "ban"
exocmd__Command_precondition: "[[f73d0f13-26f8-42f9-950e-8883c835b114|Not in Blocked status]]"
exocmd__Command_grounding: "[[ef1d12dc-6a65-4f1d-b7f5-d5c5367d9633|Set status to Blocked]]"
exocmd__Command_successMessage: "Status set to Blocked"
exocmd__Command_category: "status"
---

# Set Status Blocked

Sets `ems__Effort_status` to Blocked on the target asset.

- **Precondition**: Visible only when asset is NOT in Blocked status
- **Grounding**: Sets `ems__Effort_status` to `[[8c63578b-6aef-4b49-9727-07c4407bdada]]`
- **Icon**: ban (Lucide)
- **Category**: status
