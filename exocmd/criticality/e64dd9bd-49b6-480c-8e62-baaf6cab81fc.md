---
exo__Asset_uid: e64dd9bd-49b6-480c-8e62-baaf6cab81fc
exo__Asset_label: "Set Criticality Medium"
exo__Asset_isDefinedBy: "[[60967c6a-4e8a-4ee3-8922-db98b981e4f4]]"
exo__Asset_createdAt: "2026-04-05T18:00:00+0500"
exo__Instance_class:
  - "[[790e5b16-251d-4556-96ac-e5c7f1429b2e]]"
exocmd__Command_icon: "calendar-days"
exocmd__Command_precondition: "[[5140daf0-a565-427b-a14d-8e7f7cf770a3|Not in This Week zone]]"
exocmd__Command_grounding: "[[6d78a3a4-401a-4fb9-8b44-48c6530eef62|Set zone to This Week]]"
exocmd__Command_successMessage: "Criticality zone set to This Week"
exocmd__Command_category: "criticality"
---

# Set Criticality Medium

Sets `ems__Task_zone` to This Week (medium criticality) on the target task.

- **Precondition**: Visible only when task is NOT in This Week zone
- **Grounding**: Sets `ems__Task_zone` to `[[c7f1a968-0959-4ac7-ac82-31b0cdc2aba7]]`
- **Icon**: calendar-days (Lucide)
- **Category**: criticality
