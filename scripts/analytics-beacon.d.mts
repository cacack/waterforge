// Types for the build-time analytics beacon. Hand-written because scripts/
// is plain .mjs while its consumers — vite.config.ts and
// src/analytics-beacon.test.ts — are type-checked.

import type { HtmlTagDescriptor, Plugin } from 'vite'

export declare function beaconTag(
  token: string | null | undefined,
): HtmlTagDescriptor | null

export declare function analyticsBeaconPlugin(
  token: string | null | undefined,
): Plugin
