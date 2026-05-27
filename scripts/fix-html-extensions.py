#!/usr/bin/env python3
"""
Update all HTML files to use lowercase image extensions
"""

import os
import re
from pathlib import Path

workspace = Path(__file__).parent.parent
website_dir = workspace / "Website" / "Actual"

# Pattern to find image references with uppercase extensions
pattern = re.compile(r'(\.)(JPG|JPEG|PNG|GIF)(\b)', re.IGNORECASE)

def should_fix(match):
    """Only fix if the extension is actually uppercase"""
    ext = match.group(2)
    return ext in ['JPG', 'JPEG', 'PNG', 'GIF']

def fix_extension(match):
    """Replace uppercase extension with lowercase"""
    return match.group(1) + match.group(2).lower() + match.group(3)

fixed_files = []
total_replacements = 0

# Process all HTML files
for root, dirs, files in os.walk(website_dir):
    for filename in files:
        if filename.endswith('.html'):
            filepath = Path(root) / filename
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find all uppercase extensions
                matches = list(pattern.finditer(content))
                uppercase_matches = [m for m in matches if should_fix(m)]
                
                if uppercase_matches:
                    # Replace all uppercase extensions
                    new_content = pattern.sub(
                        lambda m: fix_extension(m) if should_fix(m) else m.group(0),
                        content
                    )
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    rel_path = filepath.relative_to(website_dir)
                    fixed_files.append(str(rel_path))
                    total_replacements += len(uppercase_matches)
                    print(f"  {rel_path}: {len(uppercase_matches)} fixes")
                    
            except Exception as e:
                print(f"  Error processing {filepath}: {e}")

print(f"\n✓ Fixed {total_replacements} image references in {len(fixed_files)} HTML files")
