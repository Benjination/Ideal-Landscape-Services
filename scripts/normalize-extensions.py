#!/usr/bin/env python3
"""
Normalize all image file extensions to lowercase
"""

import os
from pathlib import Path

workspace = Path(__file__).parent.parent
images_dir = workspace / "Website" / "Actual" / "images"

renamed = 0
errors = []

print("Normalizing image file extensions to lowercase...")

for root, dirs, files in os.walk(images_dir):
    for filename in files:
        if filename.endswith(('.JPG', '.JPEG', '.PNG', '.GIF')):
            old_path = Path(root) / filename
            
            # Create new filename with lowercase extension
            name_part = filename.rsplit('.', 1)[0]
            ext_part = filename.rsplit('.', 1)[1].lower()
            new_filename = f"{name_part}.{ext_part}"
            new_path = Path(root) / new_filename
            
            try:
                old_path.rename(new_path)
                rel_path = old_path.relative_to(images_dir)
                print(f"  {rel_path} -> {new_filename}")
                renamed += 1
            except Exception as e:
                errors.append(f"Error renaming {old_path}: {e}")

print(f"\n✓ Renamed {renamed} image files to lowercase extensions")

if errors:
    print(f"\n⚠ {len(errors)} errors:")
    for error in errors[:5]:
        print(f"  {error}")
