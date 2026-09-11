# Traffic baseline

What `waterforge.app` actually receives, how to re-measure it, and — the part
that matters most — **how to read the numbers without fooling yourself**.

> **This number justifies nothing.** Under
> [Principle 6](../../CONSTITUTION.md#principles), effort is justified by the
> maintainer's own use of the app, by correctness under Principle 3, or by the
> durability of the artifact — **never** by an assumed audience.
> [ADR 0016](../decisions/0016-built-for-its-maintainer.md) is explicitly not
> contingent on any traffic figure. A big number here would not license more
> work, and a small one does not license less. This page exists because the
> maintainer likes metrics, which is a complete reason on its own.

## Baseline — measured 2026-09-11

Two independent measurements, because they answer different questions.

### Edge requests (server-side, all traffic)

Window **2026-06-13 → 2026-09-10** (90 days), from the CloudFlare zone that
[fronts the site](./cloudflare-pages.md):

| Metric            | 90-day total |
| ----------------- | ------------ |
| Edge requests     | 87,432       |
| "Page views"      | 38,503       |
| "Unique visitors" | 3,300        |
| Bytes served      | ~402 MB      |
| Cached requests   | 406          |

**Do not read these as people.** See [How to read this](#how-to-read-this).

### Page loads (browser beacon, humans only)

Window **2026-06-11 → 2026-09-11** (92 days — the retention limit, see
[Limits](#limits-of-the-data)), from CloudFlare Web Analytics
([ADR 0017](../decisions/0017-client-side-analytics-scope.md)):

| Metric                 | 92-day total      |
| ---------------------- | ----------------- |
| Page loads             | ~40               |
| Distinct days with any | 4                 |
| Flagged as bot         | 0                 |
| Countries              | 2 (US, PL)        |
| Device types           | desktop only      |
| Referrers              | none — all direct |

Browsers seen: Chrome, Firefox, Safari (US) and Chrome (PL).

**The two tables differ by a factor of ~2,000.** That gap _is_ the finding.

## How to read this

**The edge figures are dominated by traffic that is not a visitor.** A
composition sample over the 24 hours to 2026-09-11 — 4,892 requests total, of
which the top 25 user agents account for 3,149:

| Bucket                         | Requests | Share of sample |
| ------------------------------ | -------- | --------------- |
| Maintainer's own uptime checks | 2,150    | 68%             |
| Declared bots / AI crawlers    | 550      | 17%             |
| Browser-like user agents       | 417      | 13%             |
| Exploit scanners               | 32       | 1%              |

Four things follow, and each one is a trap avoided:

1. **There is a floor of roughly 2,000 requests/day that the project generates
   about itself.** Two independent uptime checks poll the site continuously.
   They are the single largest source of traffic to `waterforge.app`.

2. **"Unique visitors" at the edge counts crawler IPs.** 3,300 is an upper bound
   on humans by roughly two orders of magnitude, not an estimate of them. The
   beacon's ~40 page loads is the figure with any claim to meaning.

3. **"Browser-like user agent" does not mean human.** Scrapers spoof Chrome
   routinely. That 13% slice reconciles with ~40 real page loads only if nearly
   all of it is spoofed, asset sub-requests, or both.

4. **A modest arrival of real users would be invisible in the edge data.** Fifty
   human visits a day is a ~2% wobble against the noise floor — well inside the
   day-to-day variance. The edge counts cannot serve as a tripwire for growth.
   The beacon can, because it reports only executed page loads and flags bots.

The honest one-line summary: **essentially nobody visits `waterforge.app`, and
nothing about that is surprising** — the project has never been promoted, has no
inbound links, and all four measured page-load days are consistent with the
maintainer and a single passer-by.

## Limits of the data

- **Beacon retention is ~13 weeks.** Account-level RUM queries are rejected
  beyond `13w2d`. Anything older than that is gone; re-pull before it ages out
  if a longer series ever matters.
- **Beacon counts are sampled.** Every figure returns as a multiple of 10, so
  "~40 page loads" is 4 sampled events scaled up. Treat it as an order of
  magnitude, not a count.
- **Per-user-agent edge detail is capped at a 1-day query window** on this plan,
  which is why the composition table above is a dated sample rather than a
  90-day breakdown.
- **Daily "uniques" are not additive.** CloudFlare estimates uniques per bucket;
  summing 90 daily figures overcounts. Query the range without a `date`
  dimension to get a properly deduplicated total (as done above).
- **The beacon misses anyone who blocks it** — script blockers, no-JS, and
  privacy browsers. It undercounts humans; the edge counts wildly overcount
  them. The truth is nearer the beacon.

## How to re-measure

Both datasets come from CloudFlare's GraphQL Analytics API at
`https://api.cloudflare.com/client/v4/graphql`. You need the zone tag (for edge
data) or the account tag plus the Web Analytics site tag (for beacon data) —
find them in the CloudFlare dashboard; they are deliberately not recorded here
(see the scope note in [continuity.md](./continuity.md)).

**Edge requests over 90 days**, deduplicated uniques:

```graphql
query ($zoneTag: String!, $start: Date!, $end: Date!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequests1dGroups(
        limit: 1
        filter: { date_geq: $start, date_leq: $end }
      ) {
        sum {
          requests
          pageViews
          bytes
          cachedRequests
        }
        uniq {
          uniques
        }
      }
    }
  }
}
```

**Traffic composition** (1-day window maximum on this plan):

```graphql
query ($zoneTag: String!, $s: Time!, $e: Time!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        limit: 25
        filter: { datetime_geq: $s, datetime_leq: $e }
        orderBy: [count_DESC]
      ) {
        count
        dimensions {
          userAgent
        }
      }
    }
  }
}
```

**Beacon page loads** (humans), account-scoped:

```graphql
query ($accountTag: String!, $s: Time!, $e: Time!, $siteTag: String!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      rumPageloadEventsAdaptiveGroups(
        limit: 100
        filter: { datetime_geq: $s, datetime_leq: $e, siteTag: $siteTag }
        orderBy: [count_DESC]
      ) {
        count
        dimensions {
          bot
          countryName
          deviceType
          refererHost
          userAgentBrowser
        }
      }
    }
  }
}
```

## Related

- [ADR 0017](../decisions/0017-client-side-analytics-scope.md) — what Principle 5
  bans, and why the beacon is allowed under it.
- [ADR 0016](../decisions/0016-built-for-its-maintainer.md) — why a traffic
  figure is not a justification for anything.
- [cloudflare-pages.md](./cloudflare-pages.md) — the proxy these numbers come
  from.
