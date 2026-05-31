#!/usr/bin/env bash
# Regenerate the PWA icons (and favicon.ico) from the brand mark.
#
# Source of truth: assets/icon.svg — the Waterforge mark (neutral hexagon +
# sky droplet) on a full-bleed lab-white background, sized for the maskable
# safe zone. Outputs land in public/ and are committed.
#
# Uses @vite-pwa/assets-generator via npx (fetched on demand if not installed).
set -euo pipefail

cd "$(dirname "$0")/.."

# The generator names outputs after the source basename, so stage the source
# under the desired name, generate, then drop the staged copy.
cp assets/icon.svg public/icon-src.svg
trap 'rm -f public/icon-src.svg' EXIT

npx --yes @vite-pwa/assets-generator --preset minimal-2023 public/icon-src.svg

echo "Regenerated PWA icons in public/ from assets/icon.svg"
