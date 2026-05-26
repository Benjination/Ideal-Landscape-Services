# Image Database & Search System
## Ideal Landscape Services

This system provides SEO-optimized image management and keyword-based search for both **static images** (from the Ideal Website directory) and **dynamic images** (uploaded through the admin portal).

---

## 📁 Files Created

### 1. **convert_csv_to_json.py**
- **Location:** `/IdealLandscapes/convert_csv_to_json.py`
- **Purpose:** Converts the CSV spreadsheet into a JSON database
- **Usage:** Run once when CSV updates: `python3 convert_csv_to_json.py`
- **Output:** Creates `image-database.json` with 266 static images

### 2. **image-database.json**
- **Location:** `/IdealLandscapes/image-database.json`
- **Purpose:** Master database of static images with keywords
- **Structure:**
  ```json
  {
    "version": "1.0",
    "lastUpdated": "ISO timestamp",
    "categories": {...},
    "images": [
      {
        "id": "unique-id",
        "filename": "actual-file.jpg",
        "category": "category-slug",
        "path": "images/category/file.jpg",
        "keywords": ["keyword1", "keyword2"],
        "alt": "SEO alt text",
        "projectName": "street name or null",
        "beforeAfter": "before|after|null",
        "source": "static"
      }
    ]
  }
  ```

### 3. **js/image-database.js**
- **Location:** `/Website/Actual/js/image-database.js`
- **Purpose:** JavaScript module for loading and searching images
- **Features:**
  - Loads static images from JSON
  - Loads blog images from Firestore `blogPosts` collection
  - Loads project images from Firestore `projectImages` collection
  - Unified search across all image sources
  - Keyword filtering (AND/OR logic)
  - Category filtering
  - Before/After filtering
- **Usage:**
  ```javascript
  import imageDB from '/js/image-database.js';
  
  await imageDB.load();
  
  // Search by keywords
  const results = imageDB.search('patio roses', {
    category: 'landscaping',
    matchAll: false // OR logic
  });
  
  // Get by category
  const hardscapes = imageDB.getByCategory('hardscapes');
  ```

### 4. **js/image-search.js**
- **Location:** `/Website/Actual/js/image-search.js`
- **Purpose:** Ready-to-use search UI component
- **Features:**
  - Search input with debouncing
  - Category dropdown filter
  - Before/After toggle
  - Responsive grid layout
  - Lightbox on click
  - Customizable columns
- **Usage:**
  ```javascript
  import { createImageSearch } from '/js/image-search.js';
  
  const searchAPI = await createImageSearch({
    containerId: 'image-search',
    showSearch: true,
    showCategoryFilter: true,
    columnsDesktop: 4
  });
  ```

### 5. **gallery/index.html**
- **Location:** `/Website/Actual/gallery/index.html`
- **Purpose:** Example gallery page with search
- **View at:** `https://your-domain.com/gallery/`

---

## 🔥 Firestore Collections

### **blogPosts**
- **Purpose:** Blog posts uploaded through admin portal
- **Fields:**
  - `title` (string)
  - `dateStr` (string, YYYY-MM-DD)
  - `desc` (string)
  - `published` (boolean)
  - `imageUrl` (string, Firebase Storage URL)
  - **`keywords`** (array, auto-extracted from title + description) ✨ NEW
  - `createdAt` (timestamp)

### **projectImages**
- **Purpose:** Project images uploaded through admin portal
- **Fields:**
  - `imageUrl` (string, Firebase Storage URL)
  - `collectionId` (string)
  - `collectionName` (string)
  - `projectName` (string)
  - `beforeAfter` (string, 'before' or 'after')
  - **`keywords`** (array, editable via admin keyword editor)

### **hardcodedImageKeywords**
- **Purpose:** Editable keywords for static images from JSON
- **Fields:**
  - `keywords` (array)
- **Document IDs:** Match image IDs from `image-database.json`

---

## 🎯 How It Works

### **Static Images (from CSV)**
1. Client provides CSV with keywords for each image
2. Run `python3 convert_csv_to_json.py` to generate JSON
3. JSON includes keywords, alt text, categories, project names
4. `image-database.js` loads JSON on page load
5. Keywords can be edited via admin portal → saved to `hardcodedImageKeywords` collection

### **Blog Images (admin uploads)**
1. Admin uploads blog post with image
2. **NEW:** System auto-extracts keywords from title + description
3. Keywords saved to `blogPosts.keywords` field in Firestore
4. `image-database.js` loads blog posts and their keywords
5. Blog images appear in search results

### **Project Images (admin uploads)**
1. Admin uploads project image to a collection
2. Admin can edit keywords via "Edit Keywords" button
3. Keywords saved to `projectImages.keywords` field
4. `image-database.js` loads project images with keywords
5. Project images appear in search results

### **Unified Search**
```javascript
// User searches for "patio roses"
const results = imageDB.search('patio roses', {
  includeStatic: true,    // Static images from JSON
  includeBlog: true,      // Blog post images
  includeProjects: true,  // Project images
  matchAll: false         // OR logic (match either keyword)
});

// Returns array of images from ALL sources, sorted by relevance
```

---

## 🚀 Quick Start

### **1. Deploy Database File**
```bash
# Copy JSON to website root
cp image-database.json Website/Actual/
```

### **2. Copy New Images**
```bash
# Copy images from Ideal Website to Website/Actual/images/
# Maintain folder structure:
# - images/hardscapes/
# - images/landscaping/
# - images/projects/[street-name]/
# etc.
```

### **3. Add Search to Any Page**
```html
<div id="image-search"></div>

<script type="module">
  import { createImageSearch } from '/js/image-search.js';
  
  await createImageSearch({
    containerId: 'image-search',
    showSearch: true,
    showCategoryFilter: true
  });
</script>
```

### **4. Update Admin Portal**
- Already updated! ✓
- Blog posts now auto-extract keywords
- Project images can have keywords edited

---

## 📊 Statistics

- **266 static images** in JSON database
- **11 categories** (Home Page, Hardscapes, Landscaping, etc.)
- **126 project images** across 10 street projects
- **Auto keyword extraction** for blog posts
- **Manual keyword editing** for projects + static images

---

## 🔍 Search Examples

### **Single Keyword**
```javascript
imageDB.search('patio')
// Returns all images with "patio" in keywords
```

### **Multiple Keywords (OR logic)**
```javascript
imageDB.search(['roses', 'fountain'], { matchAll: false })
// Returns images with either "roses" OR "fountain"
```

### **Multiple Keywords (AND logic)**
```javascript
imageDB.search(['patio', 'pergola'], { matchAll: true })
// Returns only images with BOTH "patio" AND "pergola"
```

### **Category Filter**
```javascript
imageDB.search('lighting', { category: 'outdoor-living' })
// Returns lighting images only from outdoor living category
```

### **Before/After Filter**
```javascript
imageDB.search('landscaping', { beforeAfter: 'after' })
// Returns only "after" images
```

---

## 🎨 Customization

### **Grid Columns**
```javascript
createImageSearch({
  columnsDesktop: 4,  // 4 columns on desktop
  columnsTablet: 3,   // 3 columns on tablet
  columnsMobile: 2    // 2 columns on mobile
});
```

### **Category Restriction**
```javascript
createImageSearch({
  categories: ['landscaping', 'hardscapes']  // Only these categories
});
```

### **No Search UI (Browse Only)**
```javascript
createImageSearch({
  showSearch: false,
  showCategoryFilter: true  // Just dropdown filter
});
```

---

## 🛠️ Maintenance

### **When CSV Updates**
```bash
python3 convert_csv_to_json.py
# Regenerates image-database.json
# Copy to Website/Actual/
```

### **When Images Change**
- Update CSV first
- Run conversion script
- Copy new images to Website/Actual/images/
- Deploy both JSON and images

### **Editing Keywords**
- **Static images:** Admin portal → Projects → Edit Keywords
- **Blog images:** Auto-extracted (edit title/description and re-save)
- **Project images:** Admin portal → Projects → Collection → Edit Keywords

---

## 🐛 Troubleshooting

### **Images Not Found**
- Check file paths in `image-database.json`
- Verify images exist in `Website/Actual/images/`
- Check for case-sensitive filename issues (`.jpg` vs `.JPG`)

### **Keywords Not Working**
- Blog: Check `blogPosts.keywords` field in Firestore
- Projects: Check `projectImages.keywords` field
- Static: Check `hardcodedImageKeywords` collection

### **Search Returns Nothing**
- Open browser console (F12)
- Check for errors loading `image-database.json`
- Verify Firebase is initialized (`firebase-init.js`)

---

## 📦 Dependencies

- **Firebase Firestore** (for dynamic images)
- **Firebase Storage** (for image hosting)
- **Python 3** (for CSV conversion)
- No additional npm packages required

---

## 🔐 SEO Benefits

1. **Keyword-rich alt tags** generated from keywords
2. **Searchable content** for users and search engines
3. **Semantic keywords** extracted from blog content
4. **Structured data** in JSON format
5. **Image paths** optimized for crawling

---

## 📝 Notes

- Maximum **15 keywords per image** (admin enforced)
- Keywords are **case-insensitive** in search
- Blog keywords **auto-update** when post is edited
- Static image keywords **persist** in Firestore
- Search supports **partial matches** (e.g., "patio" matches "flagstone patio")
