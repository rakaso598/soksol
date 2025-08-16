#!/usr/bin/env bash
set -euo pipefail
# Build Android release AAB for SokSol mobile wrapper
# Usage: scripts/build-android-release.sh

pushd mobile/soksol_mobile/android >/dev/null
./gradlew clean bundleRelease
popd >/dev/null

OUT=mobile/soksol_mobile/android/app/build/outputs/bundle/release/app-release.aab
if [ -f "$OUT" ]; then
  echo "Release bundle generated: $OUT"
else
  echo "Build failed: bundle not found" >&2
  exit 1
fi
