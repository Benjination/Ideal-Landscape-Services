#!/usr/bin/env python3
"""
Convert Image Keywords CSV to JSON Database
Handles static images and provides structure for dynamic blog/project images
"""

import csv
import json
import os
import re
from pathlib import Path
from datetime import datetime

def sanitize_filename(filename):
    """Remove file extensions and sanitize for ID creation"""
    name = Path(filename).stem
    # Convert to lowercase, replace spaces and special chars with hyphens
    name = re.sub(r'[^\w\s-]', '', name.lower())
    name = re.sub(r'[-\s]+', '-', name)
    return name.strip('-')

def parse_keywords(keyword_string):
    """Parse semicolon-separated keywords into list"""
    if not keyword_string or keyword_string.strip() == '':
        return []
    # Split by semicolon, clean up, and filter empties
    keywords = [kw.strip().lower() for kw in keyword_string.split(';')]
    return [kw for kw in keywords if kw]

def normalize_category(folder_name):
    """Normalize category folder names"""
    mapping = {
        'home page': 'home-page',
        'outdoor living & pergolas': 'outdoor-living',
        'outdoor-living & pergolas': 'outdoor-living',
        'lawn maintenance': 'maintenance',
        'water features': 'water-features',
        'projects': 'projects',
        'misc': 'misc',
        'accolades': 'accolades',
        'about': 'about'
    }
    return mapping.get(folder_name.lower(), folder_name.lower().replace(' ', '-'))

def generate_alt_text(filename, keywords, project_name=None):
    """Generate SEO-friendly alt text from keywords"""
    if project_name:
        base = f"{project_name} landscaping project"
    else:
        base = sanitize_filename(filename).replace('-', ' ')
    
    if keywords:
        # Use first 3-4 most descriptive keywords
        top_keywords = keywords[:4]
        return f"{' '.join(top_keywords)} - {base}"
    return base

def main():
    csv_path = Path('Image_Keywords.xlsx - Image Keywords.csv')
    output_path = Path('image-database.json')
    ideal_website_dir = Path('Ideal Website')
    
    if not csv_path.exists():
        print(f"Error: {csv_path} not found!")
        return
    
    # Initialize database structure
    database = {
        "version": "1.0",
        "lastUpdated": datetime.now().isoformat(),
        "categories": {
            "home-page": "Home Page",
            "hardscapes": "Hardscapes",
            "landscaping": "Landscaping",
            "lighting": "Lighting",
            "maintenance": "Maintenance",
            "outdoor-living": "Outdoor Living",
            "water-features": "Water Features",
            "projects": "Projects",
            "accolades": "Accolades",
            "about": "About",
            "misc": "Miscellaneous"
        },
        "images": [],
        "dynamicImages": {
            "blog": [],
            "projects": []
        }
    }
    
    # Read CSV
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"Processing {len(rows)} rows from CSV...")
    
    image_count = 0
    for row in rows:
        folder = row.get('Folder', '').strip()
        filename = row.get('Filename', '').strip()
        new_filename = row.get('Optional New Filename', '').strip()
        project_name = row.get('Project Name\n(street name)', '').strip()
        before_after = row.get('Before or After?', '').strip()
        keywords_raw = row.get('Keywords\n(semicolons)', '').strip()
        notes = row.get('Notes', '').strip()
        
        # Skip empty rows or header rows
        if not folder or not filename or folder.upper() in ['FOLDER', 'HOW TO USE']:
            continue
        
        # Skip section headers
        if filename.upper() in ['', 'FOLDER', 'FILENAME'] or '←' in notes:
            continue
        
        category = normalize_category(folder)
        keywords = parse_keywords(keywords_raw)
        
        # Generate unique ID
        if project_name:
            image_id = f"{category}-{sanitize_filename(project_name)}-{sanitize_filename(filename)}"
        else:
            image_id = f"{category}-{sanitize_filename(filename)}"
        
        # Determine file path
        # Handle the actual file extensions from Ideal Website directory
        possible_extensions = ['.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.gif', '.webp']
        actual_filename = filename
        
        # Check if filename already has extension
        if not any(filename.endswith(ext) for ext in possible_extensions):
            # Try to find the actual file
            search_paths = []
            if category == 'projects' and project_name:
                search_paths.append(ideal_website_dir / 'Projects' / project_name / filename)
            else:
                category_map = {
                    'home-page': 'Home Page',
                    'hardscapes': 'Hardscapes',
                    'landscaping': 'Landscaping',
                    'lighting': 'Lighting',
                    'maintenance': 'Lawn Maintenance',
                    'outdoor-living': 'Outdoor Living and Pergolas',
                    'water-features': 'Water Features',
                    'accolades': 'Accolades',
                    'about': 'About',
                    'misc': 'Misc'
                }
                folder_name = category_map.get(category, category.replace('-', ' ').title())
                search_paths.append(ideal_website_dir / folder_name / filename)
            
            # Try different extensions
            for search_path in search_paths:
                for ext in possible_extensions:
                    test_path = Path(str(search_path) + ext)
                    if test_path.exists():
                        actual_filename = filename + ext
                        break
        
        # Build relative path for website use
        if category == 'projects' and project_name:
            relative_path = f"images/projects/{project_name}/{actual_filename}"
        else:
            relative_path = f"images/{category}/{actual_filename}"
        
        # Generate alt text
        alt_text = generate_alt_text(filename, keywords, project_name)
        
        # Create image entry
        image_entry = {
            "id": image_id,
            "filename": actual_filename,
            "originalFilename": filename,
            "newFilename": new_filename if new_filename else None,
            "category": category,
            "path": relative_path,
            "keywords": keywords,
            "alt": alt_text,
            "projectName": project_name if project_name else None,
            "beforeAfter": before_after.lower() if before_after.lower() in ['before', 'after'] else None,
            "notes": notes if notes else None,
            "source": "static"
        }
        
        database["images"].append(image_entry)
        image_count += 1
    
    # Add documentation for dynamic images
    database["dynamicImages"]["_schema"] = {
        "blog": {
            "description": "Blog images uploaded through admin portal",
            "fields": {
                "id": "Firestore document ID",
                "filename": "Original filename",
                "path": "Storage URL from Firebase",
                "keywords": "Array of keywords extracted from title/description",
                "alt": "Generated from title",
                "title": "Blog post title",
                "dateStr": "Publication date (YYYY-MM-DD)",
                "description": "Blog post description",
                "published": "Boolean - is post live",
                "source": "dynamic-blog"
            }
        },
        "projects": {
            "description": "Project images uploaded through admin portal",
            "fields": {
                "id": "Firestore document ID",
                "filename": "Original filename",
                "path": "Storage URL from Firebase",
                "keywords": "Array of keywords (editable in admin)",
                "alt": "Generated from keywords",
                "collectionId": "Project collection ID",
                "collectionName": "Project collection name",
                "projectName": "Street name or project identifier",
                "beforeAfter": "before or after",
                "source": "dynamic-project"
            }
        }
    }
    
    # Write JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Successfully created {output_path}")
    print(f"✓ Processed {image_count} images")
    print(f"✓ {len(database['categories'])} categories")
    
    # Print category breakdown
    category_counts = {}
    for img in database["images"]:
        cat = img["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    print("\nImages by category:")
    for cat, count in sorted(category_counts.items()):
        print(f"  {database['categories'].get(cat, cat)}: {count} images")

if __name__ == '__main__':
    main()
