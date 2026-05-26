#!/usr/bin/env python3
"""Fix ALL file extensions in HARDCODED array to match actual filesystem."""

# All files with uppercase extensions that need fixing
uppercase_files = {
    'water-features': [
        'Craig Street.JPEG',
        'Lilly Pad Pond (3).JPG',
        'Lilly Pad Pond (5).JPG',
        'Lilly Pad Pond (9).JPG',
    ],
    'hardscapes': [
        'Border and Water Feature.JPG',
        'Craig Street (3).JPG',
        'Flagstone (1).JPG',
        'Flagstone (2).JPEG',
        'Flagstone (3).JPG',
        'Flagstone (4).JPG',
        'Flagstone (5).JPG',
        'Flagstone (6).JPG',
        'Flagstone (7).JPG',
        'Flagstone (8).JPG',
        'Flagstone (9).JPG',
        'Flagstone Pavers.JPG',
        'Flagstone.JPEG',
        'Hardscapes.JPG',
        'Hopper (1).JPEG',
        'Hopper (20).JPG',
        'Hopper (27).JPG',
        'Hopper (28).JPG',
        'Pathway.JPG',
    ],
    'outdoor-living': [
        'Craig Street (5).JPEG',
        'Hopper (21).JPG',
    ],
    'lighting': [
        'Craig Street (2).JPG',
        'Craig Street (6).JPEG',
        'Estonia (3).JPEG',
        'Estonia (6).JPEG',
    ],
    'maintenance': [
        'Lawn Maintenance (2).JPG',
        'Lawn Maintenance (3).JPG',
        'Lawn Maintenance (4).JPG',
        'Lawn Maintenance (5).JPG',
        'Lawn Maintenance (6).JPG',
    ],
}

# Read the HTML file
html_file = 'Website/Actual/projects/index.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Track replacements
replacements = []

# For each category and its files
for category, files in uppercase_files.items():
    for filename in files:
        # Generate all possible lowercase variants
        basename = filename.rsplit('.', 1)[0]
        
        # Try both .jpg and .jpeg lowercase
        for lowercase_ext in ['.jpg', '.jpeg']:
            lowercase_filename = basename + lowercase_ext
            search_path = f"../images/{category}/{lowercase_filename}"
            replace_path = f"../images/{category}/{filename}"
            
            if search_path in content:
                content = content.replace(search_path, replace_path)
                replacements.append(f"{category}/{lowercase_filename} → {filename}")

# Write back
with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {len(replacements)} file extensions:")
for r in replacements:
    print(f"  ✓ {r}")
