#!/usr/bin/env bash



set -euo pipefail

PROJECT_DIR="/home/z/my-project"
OUT_DIR="/home/z/my-project/download"
OUT_FILE="${OUT_DIR}/autoforge-ai.zip"

mkdir -p "$OUT_DIR"


rm -f "$OUT_FILE"


EXCLUDES=(
  "node_modules/*"
  ".next/*"
  ".zscripts/*"
  "dev.log"
  "server.log"
  "db/*.db"
  "db/*.db-journal"
  ".git/*"
  "*.DS_Store"
  "download/*"
  "examples/*"
  "skills/*"
  "mini-services/*"
  "upload/*"
  "worklog.md"
  ".env"
  ".env.local"
  "*.log"
)

cd "$PROJECT_DIR"

echo "Packaging AutoForge → $OUT_FILE"
zip -r "$OUT_FILE" . \
  -x "${EXCLUDES[@]}" \
  > /dev/null


SIZE=$(du -h "$OUT_FILE" | cut -f1)
FILES=$(unzip -l "$OUT_FILE" | tail -1 | awk '{print $2}')
echo "✓ Packaged $FILES files, total size: $SIZE"
echo "✓ Download: $OUT_FILE"
