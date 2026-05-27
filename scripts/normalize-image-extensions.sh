#!/bin/bash
# Normalize all image extensions to lowercase

cd "$(dirname "$0")/../Website/Actual/images" || exit 1

echo "Normalizing image file extensions to lowercase..."
renamed=0

# Find all image files with uppercase extensions
find . -type f \( -name "*.JPG" -o -name "*.JPEG" -o -name "*.PNG" -o -name "*.GIF" \) | while read -r file; do
    # Get the directory and filename
    dir=$(dirname "$file")
    base=$(basename "$file")
    
    # Convert extension to lowercase
    newname=$(echo "$base" | sed 's/\.\(JPG\|JPEG\|PNG\|GIF\)$/.\L\1/')
    
    # Only rename if different
    if [ "$base" != "$newname" ]; then
        echo "  $file -> $newname"
        mv "$file" "$dir/$newname"
        ((renamed++))
    fi
done

echo ""
echo "✓ Renamed $renamed image files to lowercase extensions"
