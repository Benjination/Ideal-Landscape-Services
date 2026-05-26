#!/usr/bin/env python3
"""
Remove duplicate image entries from the database where duplicates differ only in file extension case.
On macOS, the filesystem is case-insensitive, so File.jpg and File.JPG are the same file.
"""

import json
from pathlib import Path
from collections import defaultdict

# Paths
DATABASE_FILE = Path("Website/Actual/image-database.json")

def main():
    print("Loading database...")
    with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    original_count = len(db['images'])
    print(f"Original image count: {original_count}")
    
    # Track images by lowercase path (case-insensitive key)
    seen_paths = {}
    unique_images = []
    duplicates_removed = 0
    
    # Group by category to track removals
    category_removals = defaultdict(int)
    
    for img in db['images']:
        path_lower = img['path'].lower()
        
        if path_lower in seen_paths:
            # This is a duplicate
            duplicates_removed += 1
            category_removals[img['category']] += 1
            print(f"  Removing duplicate: {img['path']}")
            print(f"    (duplicate of: {seen_paths[path_lower]['path']})")
        else:
            # Keep this image
            seen_paths[path_lower] = img
            unique_images.append(img)
    
    # Update database
    db['images'] = unique_images
    
    # Recalculate category counts
    category_counts = defaultdict(int)
    for img in unique_images:
        category_counts[img['category']] += 1
    
    db['categories'] = dict(category_counts)
    
    print(f"\nDuplicates removed: {duplicates_removed}")
    print(f"New image count: {len(unique_images)}")
    print("\nCategory changes:")
    for category in sorted(category_removals.keys()):
        old_count = db['categories'].get(category, 0) + category_removals[category]
        new_count = db['categories'].get(category, 0)
        print(f"  {category}: {old_count} → {new_count} (-{category_removals[category]})")
    
    # Save cleaned database
    print(f"\nSaving cleaned database to {DATABASE_FILE}...")
    with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print("✓ Database cleaned successfully!")
    print(f"\nFinal category counts:")
    for category in sorted(db['categories'].keys()):
        print(f"  {category}: {db['categories'][category]}")

if __name__ == '__main__':
    main()
