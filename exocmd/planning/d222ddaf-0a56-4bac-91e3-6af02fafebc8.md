---
exo__Asset_uid: d222ddaf-0a56-4bac-91e3-6af02fafebc8
exo__Asset_label: "Set scheduled date"
exo__Asset_isDefinedBy: "[[60967c6a-4e8a-4ee3-8922-db98b981e4f4]]"
exo__Asset_createdAt: "2026-04-05T12:00:00+0500"
exo__Instance_class:
  - "[[11579feb-2e42-491c-af59-b89b1129a539]]"
exocmd__Grounding_type: "service_call"
exocmd__Grounding_serviceId: "updateProperty"
exocmd__Grounding_serviceCallPayload: '{"property":"ems__Effort_scheduledDate"}'
exocmd__Grounding_inputSchema: '{"type":"object","properties":{"value":{"type":"string","title":"Scheduled date"}},"required":["value"]}'
aliases:
  - "Set scheduled date"
---

# Set scheduled date

Grounding action that calls the `updateProperty` service to set `ems__Effort_scheduledDate`.

Uses `service_call` grounding type with `updateProperty` service and user-provided date value.
