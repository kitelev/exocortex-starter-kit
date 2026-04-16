---
exo__Asset_uid: eed991ba-b284-4fa7-8bbb-baadab4d20a9
exo__Asset_label: "Not in Waiting status"
exo__Asset_isDefinedBy: "[[60967c6a-4e8a-4ee3-8922-db98b981e4f4]]"
exo__Asset_createdAt: "2026-04-05T15:00:00+0500"
exo__Instance_class:
  - "[[15d119b5-9636-431e-9e91-1f140107d059]]"
exocmd__Precondition_sparqlAsk: >
  PREFIX ems: <https://exocortex.my/ontology/ems#>
  ASK {
    FILTER NOT EXISTS {
      $target ems:Effort_status <https://exocortex.my/ontology/ems#EffortStatusWaiting> .
    }
  }
aliases:
  - "Not in Waiting status"
---

# Not in Waiting status

SPARQL ASK precondition: returns `true` when asset status is missing or NOT `ems__EffortStatusWaiting`.
