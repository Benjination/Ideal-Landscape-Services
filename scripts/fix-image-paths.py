#!/usr/bin/env python3
"""
Fix image paths in image-database.json to match actual file names (case-sensitive)
"""

import json
import os
from pathlib import Path
from urllib.parse import unquote

# Paths
workspace = Path(__file__).parent.parent
json_file = workspace / "Website" / "Actual" / "image-database.json"
images_dir = workspace / "Website" / "Actual" / "images"

# Load the JSON
with open(json_file, 'r') as f:
    data = json.load(f)

# Build a map of actual files (lowercase -> actual case)
actual_files = {}
for root, dirs, files in os.walk(images_dir):
    for file in files:
        if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            rel_path = os.path.relpath(os.path.join(root, file), images_dir)
            # Store with lowercase key for lookup
            actual_files[rel_path.lower()] = rel_path

print(f"Found {len(actual_files)} image files")
print(f"Processing {len(data['images'])} database entries...")

# Fix each image entry
fixed_count = 0
errors = []

for img in data['images']:
    old_path = img['path']
    
    # Skip if not in images/ directory
    if not old_path.startswith('images/'):
        continue
    
    # Extract the path after 'images/'
    path_after_images = old_path[7:]  # Remove 'images/'
    
    # Decode URL encoding (e.g., %20 -> space)
    decoded_path = unquote(path_after_images)
    
    # Look up the actual file (case-insensitive)
    lookup_key = decoded_path.lower()
    
    if lookup_key in actual_files:
        actual_path = actual_files[lookup_key]
        # Build the correct path with URL encoding for spaces
        correct_path = 'images/' + actual_path.replace(' ', '%20')
        
        if correct_path != old_path:
            print(f"  Fixing: {old_path}")
            print(f"       -> {correct_path}")
            img['path'] = correct_path
            fixed_count += 1
    else:
        errors.append(f"  NOT FOUND: {old_path} (decoded: {decoded_path})")

# Save the updated JSON
if fixed_count > 0:
    with open(json_file, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\n✓ Fixed {fixed_count} image paths")
    print(f"✓ Updated {json_file}")
else:
    print("\n✓ No changes needed")

if errors:
    print(f"\n⚠ {len(errors)} files not found:")
    for error in errors[:10]:  # Show first 10
        print(error)
    if len(errors) > 10:
        print(f"  ... and {len(errors) - 10} more")
