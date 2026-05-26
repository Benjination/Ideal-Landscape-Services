#!/usr/bin/env python3
"""
Copy images from Ideal Website directory to Website/Actual/images/
Maintains folder structure and handles case-sensitive filenames
"""

import os
import shutil
from pathlib import Path

# Source and target directories
SOURCE_DIR = Path("Ideal Website")
TARGET_DIR = Path("Website/Actual/images")

# Category mappings (source folder → target folder)
CATEGORY_MAP = {
    "Home Page": "home-page",
    "Hardscapes": "hardscapes",
    "Landscaping": "landscaping",
    "Lighting": "lighting",
    "Lawn Maintenance": "maintenance",
    "Outdoor Living and Pergolas": "outdoor-living",
    "Water Features": "water-features",
    "Projects": "projects",
    "Accolades": "accolades",
    "About": "about",
    "Misc": "misc"
}

# Image extensions to copy
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP'}

def copy_images():
    print("╔════════════════════════════════════════════════╗")
    print("║  Ideal Landscape Services - Image Copy Tool    ║")
    print("╚════════════════════════════════════════════════╝")
    print()
    
    # Check if source exists
    if not SOURCE_DIR.exists():
        print(f"❌ Error: '{SOURCE_DIR}' not found!")
        return False
    
    # Create target directory if it doesn't exist
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Source: {SOURCE_DIR}")
    print(f"📁 Target: {TARGET_DIR}")
    print()
    print("Categories to copy:")
    for source_folder, target_folder in CATEGORY_MAP.items():
        print(f"  - {source_folder} → {target_folder}")
    print()
    
    total_copied = 0
    total_skipped = 0
    
    # Copy each category
    for source_folder, target_folder in CATEGORY_MAP.items():
        source_path = SOURCE_DIR / source_folder
        target_path = TARGET_DIR / target_folder
        
        # Skip if source doesn't exist
        if not source_path.exists():
            print(f"⚠️  Skipped: {source_folder} (not found)")
            total_skipped += 1
            continue
        
        # Create target folder
        target_path.mkdir(parents=True, exist_ok=True)
        
        # Handle Projects specially (has subdirectories)
        if source_folder == "Projects":
            print("📦 Copying Projects (with subdirectories)...")
            
            # Copy all subdirectories
            for project_dir in source_path.iterdir():
                if project_dir.is_dir():
                    project_name = project_dir.name
                    target_project = target_path / project_name
                    target_project.mkdir(parents=True, exist_ok=True)
                    
                    # Count and copy images
                    file_count = 0
                    for image_file in project_dir.iterdir():
                        if image_file.is_file() and image_file.suffix in IMAGE_EXTENSIONS:
                            shutil.copy2(image_file, target_project / image_file.name)
                            file_count += 1
                    
                    total_copied += file_count
                    print(f"  ✓ {project_name}: {file_count} images")
        else:
            # Regular category (flat structure)
            print(f"📦 Copying {source_folder}...")
            
            # Count and copy images
            file_count = 0
            for image_file in source_path.iterdir():
                if image_file.is_file() and image_file.suffix in IMAGE_EXTENSIONS:
                    shutil.copy2(image_file, target_path / image_file.name)
                    file_count += 1
            
            if file_count == 0:
                print(f"  ⚠️  No images found")
                total_skipped += 1
            else:
                total_copied += file_count
                print(f"  ✓ Copied {file_count} images")
    
    print()
    print("════════════════════════════════════════════════")
    print("✨ Copy complete!")
    print()
    print("📊 Statistics:")
    print(f"  • Total images copied: {total_copied}")
    print(f"  • Categories skipped: {total_skipped}")
    print()
    print("📋 Next steps:")
    print(f"  1. Verify images at: {TARGET_DIR}")
    print("  2. Test gallery at: Website/Actual/gallery/index.html")
    print()
    
    return True

if __name__ == "__main__":
    try:
        copy_images()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
