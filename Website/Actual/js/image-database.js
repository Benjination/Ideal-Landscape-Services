/* ═══════════════════════════════════════════════════════════════
   Image Database & Search Module
   Handles static images from JSON + dynamic blog/project images
   ═══════════════════════════════════════════════════════════════ */

import { db } from './firebase-init.js';
import {
  collection, getDocs, doc, getDoc, setDoc, updateDoc
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

class ImageDatabase {
  constructor() {
    this.staticImages = [];
    this.dynamicBlogImages = [];
    this.dynamicProjectImages = [];
    this.categories = {};
    this.loaded = false;
    this.loadPromise = null;
    this.loadOptions = { includeBlog: true, includeProjects: true };
  }

  /**
   * Load all image data (static + dynamic)
   * @returns {Promise<void>}
   */
  async load(options = {}) {
    const includeBlog = options.includeBlog !== undefined ? !!options.includeBlog : true;
    const includeProjects = options.includeProjects !== undefined ? !!options.includeProjects : true;

    // If the caller changes load options, force a reload
    const nextOptions = { includeBlog, includeProjects };
    const optionsChanged =
      this.loadOptions.includeBlog !== nextOptions.includeBlog ||
      this.loadOptions.includeProjects !== nextOptions.includeProjects;

    if (optionsChanged) {
      this.loaded = false;
      this.loadPromise = null;
    }

    this.loadOptions = nextOptions;
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        // Load static images from JSON
        const response = await fetch('/Website/Actual/image-database.json');
        const data = await response.json();
        this.staticImages = data.images || [];
        this.categories = data.categories || {};

        // Load dynamic images (optional, in parallel)
        const dynamicLoads = [];
        if (includeBlog) dynamicLoads.push(this._loadBlogImages());
        if (includeProjects) dynamicLoads.push(this._loadProjectImages());
        await Promise.all(dynamicLoads);

        this.loaded = true;
        console.log(`✓ Image database loaded: ${this.getTotalCount()} images`);
      } catch (error) {
        console.error('Error loading image database:', error);
        throw error;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Load blog images from Firestore
   * @private
   */
  async _loadBlogImages() {
    try {
      const snapshot = await getDocs(collection(db, 'blogPosts'));
      this.dynamicBlogImages = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.imageUrl) return;

        // Extract keywords from title and description
        const keywords = this._extractKeywordsFromText(
          `${data.title || ''} ${data.desc || ''}`
        );

        this.dynamicBlogImages.push({
          id: `blog-${docSnap.id}`,
          firestoreId: docSnap.id,
          filename: this._getFilenameFromUrl(data.imageUrl),
          category: 'blog',
          path: data.imageUrl,
          keywords: keywords,
          alt: data.title || 'Blog image',
          title: data.title,
          dateStr: data.dateStr,
          description: data.desc,
          published: data.published,
          source: 'dynamic-blog'
        });
      });
    } catch (error) {
      console.warn('Could not load blog images:', error);
    }
  }

  /**
   * Load project images from Firestore
   * @private
   */
  async _loadProjectImages() {
    try {
      const snapshot = await getDocs(collection(db, 'projectImages'));
      this.dynamicProjectImages = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const imagePath = data.url || data.imageUrl || '';
        if (!imagePath) return;
        
        this.dynamicProjectImages.push({
          id: `project-${docSnap.id}`,
          firestoreId: docSnap.id,
          filename: this._getFilenameFromUrl(imagePath),
          category: 'projects',
          path: imagePath,
          keywords: data.keywords || [],
          alt: data.alt || this._generateAltFromKeywords(data.keywords),
          collectionId: data.collectionId,
          collectionName: data.collectionName,
          projectName: data.projectName,
          beforeAfter: data.beforeAfter,
          source: 'dynamic-project'
        });
      });
    } catch (error) {
      console.warn('Could not load project images:', error);
    }
  }

  /**
   * Extract filename from Firebase Storage URL
   * @private
   */
  _getFilenameFromUrl(url) {
    if (!url) return '';
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return decodeURIComponent(lastPart.split('?')[0]);
  }

  /**
   * Extract keywords from text for blog posts
   * @private
   */
  _extractKeywordsFromText(text) {
    if (!text) return [];
    
    // Common landscaping terms to extract
    const landscapeTerms = [
      'patio', 'pergola', 'flagstone', 'hardscape', 'landscape', 'lighting',
      'fountain', 'water feature', 'outdoor kitchen', 'fire pit', 'gazebo',
      'lawn', 'maintenance', 'irrigation', 'drainage', 'retaining wall',
      'boulder', 'stone', 'concrete', 'cedar', 'pathway', 'walkway',
      'pool', 'swimming pool', 'seasonal color', 'flowers', 'roses',
      'native', 'xeriscape', 'drought', 'mulch', 'sod', 'turf'
    ];
    
    const textLower = text.toLowerCase();
    const found = [];
    
    for (const term of landscapeTerms) {
      if (textLower.includes(term) && !found.includes(term)) {
        found.push(term);
      }
    }
    
    return found.slice(0, 10); // Max 10 keywords
  }

  /**
   * Generate alt text from keywords
   * @private
   */
  _generateAltFromKeywords(keywords) {
    if (!keywords || keywords.length === 0) return 'Landscaping image';
    return keywords.slice(0, 4).join(', ') + ' - Ideal Landscape Services';
  }

  /**
   * Get all images (static + dynamic)
   * @returns {Array}
   */
  getAllImages() {
    return [
      ...this.staticImages,
      ...this.dynamicBlogImages,
      ...this.dynamicProjectImages
    ];
  }

  /**
   * Get total image count
   * @returns {number}
   */
  getTotalCount() {
    return this.staticImages.length + 
           this.dynamicBlogImages.length + 
           this.dynamicProjectImages.length;
  }

  /**
   * Search images by keywords
   * @param {string|Array<string>} keywords - Single keyword or array of keywords
   * @param {Object} options - Search options
   * @returns {Array} Matching images sorted by relevance
   */
  search(keywords, options = {}) {
    const {
      category = null,          // Filter by category
      beforeAfter = null,       // Filter by 'before' or 'after'
      projectName = null,       // Filter by project name
      includeStatic = true,     // Include static images
      includeBlog = true,       // Include blog images
      includeProjects = true,   // Include project images
      matchAll = false,         // true = AND logic, false = OR logic
      limit = null              // Maximum results to return
    } = options;

    // Normalize keywords to array
    const searchTerms = Array.isArray(keywords) 
      ? keywords.map(k => k.toLowerCase().trim())
      : [keywords.toLowerCase().trim()];

    // Collect images to search
    let imagesToSearch = [];
    if (includeStatic) imagesToSearch.push(...this.staticImages);
    if (includeBlog) imagesToSearch.push(...this.dynamicBlogImages);
    if (includeProjects) imagesToSearch.push(...this.dynamicProjectImages);

    // Filter and score results
    const results = imagesToSearch
      .map(img => {
        // Apply filters
        if (category && img.category !== category) return null;
        if (beforeAfter && img.beforeAfter !== beforeAfter.toLowerCase()) return null;
        if (projectName && img.projectName !== projectName) return null;

        // Calculate relevance score
        const imgKeywords = img.keywords.map(k => k.toLowerCase());
        let matchCount = 0;
        let score = 0;

        for (const term of searchTerms) {
          const found = imgKeywords.some(kw => 
            kw.includes(term) || term.includes(kw)
          );
          
          if (found) {
            matchCount++;
            // Exact matches get higher score
            if (imgKeywords.includes(term)) {
              score += 10;
            } else {
              score += 5;
            }
          }
        }

        // Check alt text for additional matches
        if (img.alt && img.alt.toLowerCase().includes(searchTerms[0])) {
          score += 3;
        }

        // Apply match logic
        if (matchAll) {
          // AND logic - must match all terms
          if (matchCount < searchTerms.length) return null;
        } else {
          // OR logic - must match at least one term
          if (matchCount === 0) return null;
        }

        return { ...img, _score: score };
      })
      .filter(Boolean) // Remove nulls
      .sort((a, b) => b._score - a._score); // Sort by score

    // Apply limit
    return limit ? results.slice(0, limit) : results;
  }

  /**
   * Get images by category
   * @param {string} category - Category ID
   * @returns {Array}
   */
  getByCategory(category) {
    return this.getAllImages().filter(img => img.category === category);
  }

  /**
   * Get image by ID
   * @param {string} id - Image ID
   * @returns {Object|null}
   */
  getById(id) {
    return this.getAllImages().find(img => img.id === id) || null;
  }

  /**
   * Get all categories
   * @returns {Object}
   */
  getCategories() {
    return { ...this.categories };
  }

  /**
   * Add or update keywords for a dynamic image
   * @param {string} firestoreId - Firestore document ID
   * @param {Array<string>} keywords - Array of keywords
   * @param {string} source - 'blog' or 'project'
   * @returns {Promise<void>}
   */
  async updateKeywords(firestoreId, keywords, source = 'project') {
    try {
      const collectionName = source === 'blog' ? 'blogPosts' : 'projectImages';
      await updateDoc(doc(db, collectionName, firestoreId), {
        keywords: keywords
      });

      // Update local cache
      const imageList = source === 'blog' 
        ? this.dynamicBlogImages 
        : this.dynamicProjectImages;
      
      const img = imageList.find(i => i.firestoreId === firestoreId);
      if (img) {
        img.keywords = keywords;
      }
    } catch (error) {
      console.error('Error updating keywords:', error);
      throw error;
    }
  }

  /**
   * Reload all data (useful after admin updates)
   * @returns {Promise<void>}
   */
  async reload() {
    this.loaded = false;
    this.loadPromise = null;
    await this.load();
  }
}

// Create singleton instance
const imageDB = new ImageDatabase();

export default imageDB;
