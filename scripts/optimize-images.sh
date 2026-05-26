#!/usr/bin/env bash
# Resize/compress Website/Actual/images for web delivery while preserving visual quality.
# Backs up originals to Website/Actual/images/_originals/ (gitignored).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMG_ROOT="$ROOT/Website/Actual/images"
BACKUP_ROOT="$IMG_ROOT/_originals"
MAX_LONG_EDGE=2400
JPEG_QUALITY=90
REENCODE_MIN_BYTES=450000

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required (macOS)." >&2
  exit 1
fi

get_long_edge() {
  local file="$1"
  local w h
  w=$(sips -g pixelWidth "$file" 2>/dev/null | awk '/pixelWidth:/ {print $2}')
  h=$(sips -g pixelHeight "$file" 2>/dev/null | awk '/pixelHeight:/ {print $2}')
  if [[ -z "$w" || -z "$h" ]]; then
    echo 0
    return
  fi
  if (( w > h )); then echo "$w"; else echo "$h"; fi
}

backup_file() {
  local src="$1"
  local rel="${src#"$IMG_ROOT"/}"
  local dest="$BACKUP_ROOT/$rel"
  mkdir -p "$(dirname "$dest")"
  if [[ ! -f "$dest" ]]; then
    cp -p "$src" "$dest"
  fi
}

processed=0
skipped=0

while IFS= read -r -d '' file; do
  [[ "$file" == *"/_originals/"* ]] && continue

  size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  long_edge=$(get_long_edge "$file")
  ext="${file##*.}"
  ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  case "$ext_lower" in
    jpg|jpeg|png|webp|gif) ;;
    *) continue ;;
  esac

  needs_resize=0
  needs_reencode=0

  if (( long_edge > MAX_LONG_EDGE )); then
    needs_resize=1
  fi

  if [[ "$ext_lower" == "jpg" || "$ext_lower" == "jpeg" ]]; then
    if (( size > REENCODE_MIN_BYTES )) && (( long_edge >= 1400 )); then
      needs_reencode=1
    fi
  fi

  if (( needs_resize == 0 && needs_reencode == 0 )); then
    ((skipped++)) || true
    continue
  fi

  backup_file "$file"

  if (( needs_resize )); then
    sips -Z "$MAX_LONG_EDGE" "$file" >/dev/null
  fi

  if [[ "$ext_lower" == "jpg" || "$ext_lower" == "jpeg" ]]; then
    sips -s format jpeg -s formatOptions "$JPEG_QUALITY" "$file" >/dev/null
  fi

  ((processed++)) || true
done < <(find "$IMG_ROOT" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.gif' \) -print0)

echo "Done. processed=$processed skipped=$skipped"
echo "Backups: $BACKUP_ROOT"
