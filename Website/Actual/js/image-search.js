/* ═══════════════════════════════════════════════════════════════
   Image Search Component
   Displays searchable image gallery with keyword filtering
   ═══════════════════════════════════════════════════════════════ */

import imageDB from './image-database.js';

function resolveImageSrc(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || /^(data|blob):/i.test(path)) return path;
  // Decode URL-encoded characters (e.g., %20 for spaces, %28 for parentheses)
  const decodedPath = decodeURIComponent(path);
  // For paths starting with 'images/', add appropriate prefix based on current location
  if (decodedPath.startsWith('images/')) {
    const currentPath = window.location.pathname;
    const isInServiceSubdir = currentPath.includes('/services/') && currentPath.split('/services/')[1].includes('/');
    return isInServiceSubdir ? '../../' + decodedPath : '../' + decodedPath;
  }
  // For absolute or other paths, return as is
  return decodedPath.startsWith('/') ? decodedPath : decodedPath;
}

/**
 * Create and initialize an image search interface
 * @param {Object} config - Configuration options
 * @returns {Object} API for controlling the search component
 */
export async function createImageSearch(config = {}) {
  const {
    containerId = 'image-search',        // Container element ID
    showSearch = true,                    // Show search input
    showCategoryFilter = true,            // Show category dropdown
    showBeforeAfter = false,              // Show before/after toggle
    columnsDesktop = 4,                   // Grid columns on desktop
    columnsTablet = 3,                    // Grid columns on tablet
    columnsMobile = 2,                    // Grid columns on mobile
    enableLightbox = true,                // Enable image lightbox on click
    categories = null,                    // Array of category IDs to include (null = all)
    includeBlog = true,                   // Include blog images from Firestore
    includeProjects = true,               // Include project images from Firestore
    placeholder = 'Search by keyword (e.g., patio, roses, pergola)...',
    noResultsMessage = 'No images found matching your search.',
    initialDisplayCount = null            // Number of images to show initially (null = show all)
  } = config;

  // Load database
  await imageDB.load({ includeBlog, includeProjects });

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return null;
  }

  // Build UI
  container.innerHTML = `
    <div class="image-search-wrapper">
      ${showSearch ? `
        <div class="image-search-controls">
          <input type="text" 
                 class="image-search-input" 
                 id="${containerId}-search" 
                 placeholder="${placeholder}"
                 autocomplete="off">
          ${showCategoryFilter ? `
            <select class="image-search-category" id="${containerId}-category">
              <option value="">All Categories</option>
            </select>
          ` : ''}
          ${showBeforeAfter ? `
            <select class="image-search-before-after" id="${containerId}-before-after">
              <option value="">Before & After</option>
              <option value="before">Before</option>
              <option value="after">After</option>
            </select>
          ` : ''}
        </div>
      ` : ''}
      <div class="image-search-results" 
           id="${containerId}-results"
           style="--cols-desktop: ${columnsDesktop}; --cols-tablet: ${columnsTablet}; --cols-mobile: ${columnsMobile};">
      </div>
      <div class="image-search-expand" id="${containerId}-expand" style="display: none;">
        <button class="image-search-expand-btn" id="${containerId}-expand-btn">View All Photos</button>
      </div>
      <div class="image-search-no-results" 
           id="${containerId}-no-results" 
           style="display: none;">
        ${noResultsMessage}
      </div>
    </div>
  `;

  // Add styles if not already present
  if (!document.getElementById('image-search-styles')) {
    const style = document.createElement('style');
    style.id = 'image-search-styles';
    style.textContent = `
      .image-search-wrapper {
        width: 100%;
      }
      .image-search-controls {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .image-search-input {
        flex: 1;
        min-width: 250px;
        padding: 12px 16px;
        font-size: 15px;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        font-family: inherit;
      }
      .image-search-category,
      .image-search-before-after {
        padding: 12px 16px;
        font-size: 15px;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        background: white;
        font-family: inherit;
        cursor: pointer;
      }
      .image-search-results {
        display: grid;
        grid-template-columns: repeat(var(--cols-desktop, 4), 1fr);
        gap: 16px;
      }
      @media (max-width: 1024px) {
        .image-search-results {
          grid-template-columns: repeat(var(--cols-tablet, 3), 1fr);
        }
      }
      @media (max-width: 640px) {
        .image-search-results {
          grid-template-columns: repeat(var(--cols-mobile, 2), 1fr);
        }
      }
      .image-search-item {
        position: relative;
        overflow: hidden;
        border-radius: 4px;
        background: #f5f5f5;
        cursor: pointer;
        aspect-ratio: 4/3;
      }
      .image-search-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      .image-search-item:hover img {
        transform: scale(1.05);
      }
      .image-search-item-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 12px;
        background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
        color: white;
        font-size: 13px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .image-search-item:hover .image-search-item-overlay {
        opacity: 1;
      }
      .image-search-item-keywords {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 4px;
      }
      .image-search-no-results {
        text-align: center;
        padding: 48px 24px;
        color: #666;
        font-size: 15px;
      }
      .image-search-expand {
        text-align: center;
        margin-top: 24px;
      }
      .image-search-expand-btn {
        padding: 12px 32px;
        font-size: 15px;
        font-weight: 600;
        color: white;
        background: var(--accent-green, #2d5016);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.3s ease;
      }
      .image-search-expand-btn:hover {
        background: var(--accent-green-dark, #1f3a0f);
      }
      .image-lightbox {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        cursor: pointer;
      }
      .image-lightbox img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    `;
    document.head.appendChild(style);
  }

  // Populate category dropdown
  if (showCategoryFilter) {
    const categorySelect = document.getElementById(`${containerId}-category`);
    const allCategories = imageDB.getCategories();
    
    Object.entries(allCategories).forEach(([id, name]) => {
      if (!categories || categories.includes(id)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        categorySelect.appendChild(option);
      }
    });
  }

  // Search and render logic
  function performSearch() {
    const searchInput = document.getElementById(`${containerId}-search`);
    const categorySelect = document.getElementById(`${containerId}-category`);
    const beforeAfterSelect = document.getElementById(`${containerId}-before-after`);
    const resultsContainer = document.getElementById(`${containerId}-results`);
    const noResults = document.getElementById(`${containerId}-no-results`);

    const searchTerm = searchInput?.value.trim() || '';
    const selectedCategory = categorySelect?.value || null;
    const selectedBeforeAfter = beforeAfterSelect?.value || null;

    let results;

    if (searchTerm) {
      // Perform keyword search
      results = imageDB.search(searchTerm, {
        category: selectedCategory,
        beforeAfter: selectedBeforeAfter,
        matchAll: false
      });
    } else {
      // Show all images (filtered by category/before-after if selected)
      results = imageDB.getAllImages().filter(img => {
        if (selectedCategory && img.category !== selectedCategory) return false;
        if (selectedBeforeAfter && img.beforeAfter !== selectedBeforeAfter) return false;
        if (categories && !categories.includes(img.category)) return false;
        return true;
      });
    }

    renderResults(results, resultsContainer, noResults);
  }

  let allResults = [];
  let isExpanded = false;

  function renderResults(results, container, noResultsEl) {
    container.innerHTML = '';
    allResults = results;

    if (results.length === 0) {
      noResultsEl.style.display = 'block';
      const expandEl = document.getElementById(`${containerId}-expand`);
      if (expandEl) expandEl.style.display = 'none';
      return;
    }

    noResultsEl.style.display = 'none';

    // Determine how many to show
    const displayCount = (initialDisplayCount && !isExpanded) ? Math.min(initialDisplayCount, results.length) : results.length;
    const imagesToShow = results.slice(0, displayCount);

    imagesToShow.forEach(img => {
      const item = document.createElement('div');
      item.className = 'image-search-item';
      
      const imgEl = document.createElement('img');
      imgEl.src = resolveImageSrc(img.path);
      imgEl.alt = img.alt;
      imgEl.loading = 'lazy';
      imgEl.decoding = 'async';
      try { imgEl.fetchPriority = 'low'; } catch {}
      
      item.appendChild(imgEl);
      
      if (enableLightbox) {
        item.addEventListener('click', () => openLightbox(img));
      }
      
      container.appendChild(item);
    });

    // Show/hide expand button
    const expandEl = document.getElementById(`${containerId}-expand`);
    const expandBtn = document.getElementById(`${containerId}-expand-btn`);
    if (expandEl && expandBtn) {
      if (initialDisplayCount && results.length > initialDisplayCount && !isExpanded) {
        expandEl.style.display = 'block';
        expandBtn.textContent = `View All ${results.length} Photos`;
      } else {
        expandEl.style.display = 'none';
      }
    }
  }

  function openLightbox(img) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    
    const imgEl = document.createElement('img');
    imgEl.src = resolveImageSrc(img.path);
    imgEl.alt = img.alt;
    
    lightbox.appendChild(imgEl);
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', () => {
      lightbox.remove();
    });
    
    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        lightbox.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // Attach event listeners
  if (showSearch) {
    const searchInput = document.getElementById(`${containerId}-search`);
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(performSearch, 300); // Debounce
    });
  }

  if (showCategoryFilter) {
    const categorySelect = document.getElementById(`${containerId}-category`);
    categorySelect.addEventListener('change', performSearch);
  }

  if (showBeforeAfter) {
    const beforeAfterSelect = document.getElementById(`${containerId}-before-after`);
    beforeAfterSelect.addEventListener('change', performSearch);
  }

  // Expand button handler
  const expandBtn = document.getElementById(`${containerId}-expand-btn`);
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      isExpanded = true;
      const resultsContainer = document.getElementById(`${containerId}-results`);
      const noResults = document.getElementById(`${containerId}-no-results`);
      renderResults(allResults, resultsContainer, noResults);
    });
  }

  // Initial render
  performSearch();

  // Return API
  return {
    refresh: performSearch,
    reload: async () => {
      await imageDB.reload();
      performSearch();
    }
  };
}

// Export for use in HTML
window.createImageSearch = createImageSearch;
