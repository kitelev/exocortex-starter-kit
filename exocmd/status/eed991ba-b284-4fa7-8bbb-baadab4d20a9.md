---
exo__Asset_uid: eed991ba-b284-4fa7-8bbb-baadab4d20a9
exo__Asset_label: "Not in Waiting status"
exo__Asset_isDefinedBy: "[[!exocmd]]"
exo__Asset_createdAt: "2026-04-05T15:00:00+0500"
exo__Instance_class:
  - "[[exocmd__Precondition]]"
exocmd__Precondition_sparqlAsk: >
  PREFIX ems: <https://exocortex.my/ontology/ems#>
  ASK {
    $target ems:Effort_status ?s .
    FILTER(?s != <https://exocortex.my/ontology/ems#EffortStatusWaiting>)
  }
---

# Not in Waiting status

SPARQL ASK precondition: returns `true` when asset status is NOT `ems__EffortStatusWaiting`.
