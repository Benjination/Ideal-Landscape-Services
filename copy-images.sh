#!/bin/bash
# Copy new images from Ideal Website to Website/Actual/images/
# Maintains folder structure and handles case-sensitive filenames

SOURCE_DIR="Ideal Website"
TARGET_DIR="Website/Actual/images"

echo "╔════════════════════════════════════════════════╗"
echo "║  Ideal Landscape Services - Image Copy Tool    ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ Error: '$SOURCE_DIR' not found!"
  exit 1
fi

# Check if target exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️  Warning: '$TARGET_DIR' not found. Creating it..."
  mkdir -p "$TARGET_DIR"
fi

echo "📁 Source: $SOURCE_DIR"
echo "📁 Target: $TARGET_DIR"
echo ""
echo "Categories to copy:"

# Define category mappings (source folder → target folder)
declare -A CATEGORY_MAP
CATEGORY_MAP["Home Page"]="home-page"
CATEGORY_MAP["Hardscapes"]="hardscapes"
CATEGORY_MAP["Landscaping"]="landscaping"
CATEGORY_MAP["Lighting"]="lighting"
CATEGORY_MAP["Lawn Maintenance"]="maintenance"
CATEGORY_MAP["Outdoor Living and Pergolas"]="outdoor-living"
CATEGORY_MAP["Water Features"]="water-features"
CATEGORY_MAP["Projects"]="projects"
CATEGORY_MAP["Accolades"]="accolades"
CATEGORY_MAP["About"]="about"
CATEGORY_MAP["Misc"]="misc"

# Display categories
for key in "${!CATEGORY_MAP[@]}"; do
  echo "  - $key → ${CATEGORY_MAP[$key]}"
done

echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "🚀 Starting copy..."
echo ""

TOTAL_COPIED=0
TOTAL_SKIPPED=0

# Copy each category
for SOURCE_FOLDER in "${!CATEGORY_MAP[@]}"; do
  TARGET_FOLDER="${CATEGORY_MAP[$SOURCE_FOLDER]}"
  SOURCE_PATH="$SOURCE_DIR/$SOURCE_FOLDER"
  TARGET_PATH="$TARGET_DIR/$TARGET_FOLDER"
  
  # Skip if source doesn't exist
  if [ ! -d "$SOURCE_PATH" ]; then
    echo "⚠️  Skipped: $SOURCE_FOLDER (not found)"
    continue
  fi
  
  # Create target folder if doesn't exist
  mkdir -p "$TARGET_PATH"
  
  # Handle Projects specially (has subdirectories)
  if [ "$SOURCE_FOLDER" = "Projects" ]; then
    echo "📦 Copying Projects (with subdirectories)..."
    
    # Copy all subdirectories
    for PROJECT_DIR in "$SOURCE_PATH"/*; do
      if [ -d "$PROJECT_DIR" ]; then
        PROJECT_NAME=$(basename "$PROJECT_DIR")
        TARGET_PROJECT="$TARGET_PATH/$PROJECT_NAME"
        mkdir -p "$TARGET_PROJECT"
        
        # Count files
        FILE_COUNT=$(find "$PROJECT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) | wc -l | tr -d ' ')
        
        # Copy images
        cp -v "$PROJECT_DIR"/*.{jpg,jpeg,JPG,JPEG,png,PNG,gif,webp} "$TARGET_PROJECT/" 2>/dev/null
        
        TOTAL_COPIED=$((TOTAL_COPIED + FILE_COUNT))
        echo "  ✓ $PROJECT_NAME: $FILE_COUNT images"
      fi
    done
  else
    # Regular category (flat structure)
    echo "📦 Copying $SOURCE_FOLDER..."
    
    # Count files
    FILE_COUNT=$(find "$SOURCE_PATH" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) | wc -l | tr -d ' ')
    
    if [ "$FILE_COUNT" -eq 0 ]; then
      echo "  ⚠️  No images found"
      TOTAL_SKIPPED=$((TOTAL_SKIPPED + 1))
    else
      # Copy all images (handles case variations)
      cp -v "$SOURCE_PATH"/*.{jpg,jpeg,JPG,JPEG,png,PNG,gif,webp} "$TARGET_PATH/" 2>/dev/null
      TOTAL_COPIED=$((TOTAL_COPIED + FILE_COUNT))
      echo "  ✓ Copied $FILE_COUNT images"
    fi
  fi
done

echo ""
echo "════════════════════════════════════════════════"
echo "✨ Copy complete!"
echo ""
echo "📊 Statistics:"
echo "  • Total images copied: $TOTAL_COPIED"
echo "  • Categories skipped: $TOTAL_SKIPPED"
echo ""
echo "📋 Next steps:"
echo "  1. Verify images at: $TARGET_DIR"
echo "  2. Ensure Website/Actual/image-database.json is up to date"
echo "  3. Test gallery at: /gallery/index.html"
echo ""
