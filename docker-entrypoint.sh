#!/bin/sh
set -eu

SOURCE_DIR="/app/default-uploads"
TARGET_DIR="/app/frontend/public/uploads"

mkdir -p "$TARGET_DIR"

if [ -d "$SOURCE_DIR" ]; then
  find "$SOURCE_DIR" -mindepth 1 -maxdepth 1 -type f | while IFS= read -r source_file; do
    target_file="$TARGET_DIR/$(basename "$source_file")"

    if [ ! -f "$target_file" ]; then
      cp "$source_file" "$target_file"
    fi
  done
fi

exec "$@"
