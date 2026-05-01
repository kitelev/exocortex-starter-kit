---
exo__Asset_uid: ee1647f5-f3df-4ecd-9a42-cbaacb6ae28d
exo__Asset_label: "Create Child Task → Area binding"
exo__Asset_isDefinedBy: "[[60967c6a-4e8a-4ee3-8922-db98b981e4f4]]"
exo__Asset_createdAt: "2026-04-13T22:00:00+0500"
exo__Asset_updatedAt: "2026-05-02T00:32:46+0500"
exo__Instance_class:
  - "[[3677039a-a5a8-4402-9a07-f8f18fe384ad]]"
exocmd__CommandBinding_command: "[[2adf3655-0ab9-4578-ad2e-223108729db8|Create Child Task]]"
exocmd__CommandBinding_targetClass: "ems__Area"
exocmd__CommandBinding_position: "inline"
exocmd__CommandBinding_order: 220
exocmd__CommandBinding_variant: "primary"
aliases:
  - "Create Child Task → Area binding"
---

# Create Child Task → Area binding

Binds `Create Child Task` to `ems__Area` assets. When invoked, the plugin detects the Area parent class and writes `ems__Effort_area: [[<area>]]` (instead of `ems__Effort_parent`). Order `220` places it before the generic `Create Task` button (`859b4816-…`, order `230`).
