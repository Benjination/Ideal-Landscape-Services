#!/usr/bin/env python3
"""
Fix spaces in image src attributes by URL-encoding them as %20
"""
import re

# Read the HTML file
with open('Website/Actual/projects/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all src attributes with spaces and replace spaces with %20
# Pattern matches: src:'../images/[folder]/[filename with spaces]'
def encode_spaces_in_src(match):
    full_match = match.group(0)
    src_path = match.group(1)
    # Replace spaces with %20
    encoded_path = src_path.replace(' ', '%20')
    return f"src:'{encoded_path}'"

# Match src:'...' patterns and encode spaces
pattern = r"src:'(\.\.\/images\/[^']+)'"
new_content = re.sub(pattern, encode_spaces_in_src, content)

# Write back
with open('Website/Actual/projects/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Count how many were changed
old_matches = re.findall(r"src:'(\.\.\/images\/[^']+)'", content)
new_matches = re.findall(r"src:'(\.\.\/images\/[^']+)'", new_content)

spaces_fixed = sum(1 for old, new in zip(old_matches, new_matches) if old != new)

print(f"Fixed {spaces_fixed} filenames with spaces")
print("\nSample changes:")
for old, new in zip(old_matches[:10], new_matches[:10]):
    if old != new:
        print(f"  {old}")
        print(f"  → {new}")
