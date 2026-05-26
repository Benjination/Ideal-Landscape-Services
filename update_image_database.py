#!/usr/bin/env python3
"""
Update image database by scanning actual image directories
and adding any images not already in the database.
"""

import json
import os
from pathlib import Path
from datetime import datetime

# Directory paths
IMAGES_DIR = Path("Website/Actual/images")
DATABASE_FILE = Path("Website/Actual/image-database.json")

# Category mapping
CATEGORY_MAP = {
    "home-page": "home-page",
    "hardscapes": "hardscapes",
    "landscaping": "landscaping",
    "lighting": "lighting",
    "maintenance": "maintenance",
    "outdoor-living": "outdoor-living",
    "water-features": "water-features",
    "projects": "projects",
    "accolades": "accolades",
    "about": "about",
    "misc": "misc"
}

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP'}

def sanitize_filename(filename):
    """Create URL-safe ID from filename"""
    name = Path(filename).stem.lower()
    name = name.replace('_', '-').replace(' ', '-').replace('(', '').replace(')', '')
    name = '-'.join(filter(None, name.split('-')))
    return name

def generate_keywords_from_filename(filename, category):
    """Generate basic keywords from filename and category"""
    keywords = []
    
    # Add category as keyword
    if category in ['hardscapes', 'landscaping', 'lighting', 'maintenance', 'outdoor-living', 'water-features']:
        keywords.append(category.replace('-', ' '))
    
    # Extract words from filename
    name = Path(filename).stem.lower()
    words = name.replace('_', ' ').replace('-', ' ').split()
    
    # Common landscaping terms
    keyword_terms = {
        'patio', 'pergola', 'flagstone', 'hardscape', 'landscape', 
        'lighting', 'fountain', 'water', 'outdoor', 'kitchen', 
        'fire', 'pit', 'gazebo', 'lawn', 'maintenance', 'stone',
        'rock', 'boulder', 'concrete', 'cedar', 'pathway', 'walkway',
        'pool', 'roses', 'flowers', 'native', 'mulch', 'retaining', 'wall'
    }
    
    for word in words:
        if word in keyword_terms and word not in keywords:
            keywords.append(word)
    
    return keywords[:10]

def generate_alt_text(filename, keywords, category):
    """Generate SEO-friendly alt text"""
    name = Path(filename).stem.replace('_', ' ').replace('-', ' ')
    if keywords:
        kw_str = ', '.join(keywords[:3])
        return f"{kw_str} - {name}"
    return name

def scan_and_update_database():
    """Scan image directories and update database"""
    print("🔍 Scanning image directories...")
    
    # Load existing database
    with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    # Get existing image paths
    existing_paths = {img['path'] for img in db['images']}
    
    new_images = []
    categories_updated = {}
    
    # Scan each category directory
    for category_name, category_slug in CATEGORY_MAP.items():
        category_dir = IMAGES_DIR / category_name
        
        if not category_dir.exists():
            continue
        
        # Get all image files in this category
        image_files = [
            f for f in category_dir.iterdir()
            if f.is_file() and f.suffix in IMAGE_EXTENSIONS
        ]
        
        added_count = 0
        
        for img_file in image_files:
            relative_path = f"images/{category_name}/{img_file.name}"
            
            # Skip if already in database
            if relative_path in existing_paths:
                continue
            
            # Generate metadata for new image
            img_id = f"{category_slug}-{sanitize_filename(img_file.name)}"
            keywords = generate_keywords_from_filename(img_file.name, category_slug)
            alt = generate_alt_text(img_file.name, keywords, category_slug)
            
            # Create new image entry
            new_entry = {
                "id": img_id,
                "filename": img_file.name,
                "originalFilename": img_file.name,
                "newFilename": "",
                "category": category_slug,
                "path": relative_path,
                "keywords": keywords,
                "alt": alt,
                "projectName": "",
                "beforeAfter": "",
                "notes": "Auto-added from directory scan",
                "source": "static"
            }
            
            new_images.append(new_entry)
            added_count += 1
        
        if added_count > 0:
            categories_updated[category_slug] = added_count
            print(f"  ✓ {category_slug}: +{added_count} new images")
    
    if not new_images:
        print("✨ No new images found. Database is up to date!")
        return
    
    # Add new images to database
    db['images'].extend(new_images)
    
    # Update category counts
    for category in CATEGORY_MAP.values():
        count = sum(1 for img in db['images'] if img['category'] == category)
        db['categories'][category] = count
    
    # Update metadata
    db['lastUpdated'] = datetime.now().isoformat()
    
    # Save updated database
    with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print(f"\n✨ Database updated!")
    print(f"📊 Statistics:")
    print(f"  • Total images added: {len(new_images)}")
    print(f"  • Categories updated: {len(categories_updated)}")
    print(f"  • Total images in database: {len(db['images'])}")

if __name__ == "__main__":
    scan_and_update_database()
