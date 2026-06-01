---
name: Profile request
about: Ask for a bottled or reference water to be added to the library
title: 'Add profile: <water name>'
labels: 'type:feat, area:data'
---

**Which water?** (brand / name, and country or region if relevant)

**Source for its mineral analysis**
A link or citation to an authoritative analysis — the bottler's official
composition page, a product label, or a published lab analysis. Profiles are
only added when they can be sourced to this standard (see
[ADR 0011](../../docs/decisions)).

**Ion values (if you have them)**
Ca, Mg, Na, K, HCO₃ (or alkalinity as CaCO₃), SO₄, Cl — in mg/L. Note the
alkalinity unit if you know it.

**Geography** _(optional)_
Country of origin, and the region / city / spring source if known.

**Category** _(optional)_
One of `bottled`, `brewing`, `coffee`, `synthetic` — see the
[category enum](../../docs/guides/reference-data.md#category-enum).

**Notable traits** _(optional)_
Chemistry/origin tags from the
[controlled vocabulary](../../docs/guides/reference-data.md#traits-controlled-vocabulary)
(e.g. `calcium-rich`, `artesian`). Chemistry/origin only — no flavour language.
Leave blank if unsure; a curator will assign these.

**Anything else?**
