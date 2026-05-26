#!/usr/bin/env python3
"""
Fix image paths in image-database.json to match actual file extensions
"""

import json
from pathlib import Path

# Load the JSON database
with open('Website/Actual/image-database.json', 'r') as f:
    db = json.load(f)

print("Fixing image paths...")
fixed_count = 0
not_found_count = 0

# Check each image and fix the extension
for img in db['images']:
    path = Path('Website/Actual') / img['path']
    
    # If path doesn't exist, try to find the file with different extensions
    if not path.exists():
        # Try all possible extension variations
        base_path = path.parent / path.stem
        possible_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', 
                              '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP']
        
        found = False
        for ext in possible_extensions:
            test_path = Path(str(base_path) + ext)
            if test_path.exists():
                # Update the path in the JSON
                relative_path = str(test_path.relative_to('Website/Actual'))
                img['path'] = relative_path
                img['filename'] = test_path.name
                fixed_count += 1
                found = True
                print(f"  ✓ Fixed: {img['id']} -> {test_path.name}")
                break
        
        if not found:
            not_found_count += 1
            print(f"  ✗ Not found: {img['id']} ({img['path']})")

# Save the updated JSON
with open('Website/Actual/image-database.json', 'w') as f:
    json.dump(db, f, indent=2)

print()
print(f"✨ Complete!")
print(f"  • Fixed: {fixed_count} images")
print(f"  • Not found: {not_found_count} images")
print()
