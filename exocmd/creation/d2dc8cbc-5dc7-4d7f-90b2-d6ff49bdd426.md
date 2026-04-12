---
exo__Asset_uid: d2dc8cbc-5dc7-4d7f-90b2-d6ff49bdd426
exo__Asset_label: "Create Child Task → Project binding"
exo__Asset_isDefinedBy: "[[60967c6a-4e8a-4ee3-8922-db98b981e4f4]]"
exo__Asset_createdAt: "2026-04-13T22:00:00+0500"
exo__Instance_class:
  - "[[3677039a-a5a8-4402-9a07-f8f18fe384ad]]"
exocmd__CommandBinding_command: "[[2adf3655-0ab9-4578-ad2e-223108729db8|Create Child Task]]"
exocmd__CommandBinding_targetClass: "ems__Project"
exocmd__CommandBinding_position: "inline"
exocmd__CommandBinding_order: 220
exocmd__CommandBinding_group: "creation"
aliases:
  - "Create Child Task → Project binding"
---

# Create Child Task → Project binding

Binds `Create Child Task` to `ems__Project` assets. Order `220` places it before the generic `Create Task` button (`0efec799-…`, order `231`), making parent-aware creation the primary action on projects.
