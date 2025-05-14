  
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // ========== DARK MODE TOGGLE ==========
        const darkModeToggle = document.getElementById('darkModeToggle');
        const icon = darkModeToggle.querySelector('i');
        
        // Initialize dark mode
        function initDarkMode() {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const savedMode = localStorage.getItem('darkMode');
            
            if (savedMode === 'true' || (savedMode === null && prefersDark)) {
                document.body.classList.add('dark-mode');
                icon.classList.replace('fa-moon', 'fa-sun');
            }
        }
        
        // Toggle dark mode
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            icon.classList.toggle('fa-sun');
            icon.classList.toggle('fa-moon');
        }
        
        // Initialize and set up event listener
        initDarkMode();
        darkModeToggle.addEventListener('click', toggleDarkMode);

        // ========== READING TIME CALCULATOR ==========
        function calculateReadingTime() {
            // Calculate for article previews
            document.querySelectorAll('.article-preview').forEach(preview => {
                const text = preview.textContent;
                const words = text.split(/\s+/).length;
                const minutes = Math.ceil(words / 150);
                const badge = `<span class="reading-time">${minutes} Daqiiqo akhris ah</span>`;
                preview.querySelector('.article-date').insertAdjacentHTML('afterend', badge);
            });
            
            // Calculate for full articles
            document.querySelectorAll('.article-detail').forEach(article => {
                const text = article.textContent;
                const words = text.split(/\s+/).length;
                const minutes = Math.ceil(words / 150);
                const badge = `<div class="reading-time">${minutes} Daqiiqo akhris ah</div>`;
                article.querySelector('.article-content').insertAdjacentHTML('afterbegin', badge);
            });
        }

        // ========== ARTICLE NAVIGATION WITH SMOOTH SCROLL ==========
        const articlesList = document.getElementById('articlesList');
        const articleDetails = document.getElementById('articleDetails');
        const heroSection = document.getElementById('heroSection');
        let scrollPosition = 0;
        let isAnimating = false;
        
        function showArticle(articleId) {
            if (isAnimating) return;
            isAnimating = true;
            
            // Store current scroll position
            scrollPosition = window.scrollY || window.pageYOffset;
            
            // Start fade out animation
            articlesList.classList.add('fade-out');
            heroSection.classList.add('fade-out');
            
            setTimeout(() => {
                // Hide all articles
                document.querySelectorAll('.article-detail').forEach(article => {
                    article.style.display = 'none';
                    article.classList.remove('active');
                });
                
                // Show requested article
                const article = document.getElementById(articleId);
                if (article) {
                    articleDetails.style.display = 'block';
                    article.style.display = 'block';
                    
                    // Small delay for display to take effect before animation
                    setTimeout(() => {
                        article.classList.add('active');
                    }, 10);
                    
                    // Update history
                    history.pushState({ 
                        articleId, 
                        scrollPosition,
                        from: 'article' 
                    }, null, `#${articleId}`);
                }
                
                // Hide main content
                articlesList.style.display = 'none';
                heroSection.style.display = 'none';
                
                // Reset animation classes
                articlesList.classList.remove('fade-out');
                heroSection.classList.remove('fade-out');
                
                // Smooth scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                isAnimating = false;
            }, 300);
        }
        
        function showMainPage(savedPosition = scrollPosition) {
            if (isAnimating) return;
            isAnimating = true;
            
            // Start fade out animation for article
            articleDetails.querySelector('.article-detail.active')?.classList.remove('active');
            articleDetails.classList.add('fade-out');
            
            setTimeout(() => {
                // Show main content
                articlesList.style.display = 'block';
                heroSection.style.display = 'block';
                articleDetails.style.display = 'none';
                
                // Start fade in animation
                articlesList.classList.add('fade-in');
                heroSection.classList.add('fade-in');
                
                setTimeout(() => {
                    // Reset animation classes
                    articlesList.classList.remove('fade-in');
                    heroSection.classList.remove('fade-in');
                    articleDetails.classList.remove('fade-out');
                    
                    // Smooth scroll to saved position
                    window.scrollTo({
                        top: savedPosition,
                        behavior: 'smooth'
                    });
                    
                    isAnimating = false;
                }, 300);
                
                // Update history
                history.pushState(null, null, ' ');
            }, 300);
        }

        // Set up event listeners for navigation
        function setupNavigation() {
            // Read more buttons
            document.querySelectorAll('.read-more-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const articleId = this.getAttribute('href').substring(1);
                    showArticle(articleId);
                });
            });

            // Back home buttons
            document.querySelectorAll('.back-home-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showMainPage();
                });
            });

            // Handle initial load from URL hash
            function loadArticleFromHash() {
                if (window.location.hash) {
                    const articleId = window.location.hash.substring(1);
                    const article = document.getElementById(articleId);
                    
                    if (article) {
                        articlesList.style.display = 'none';
                        heroSection.style.display = 'none';
                        articleDetails.style.display = 'block';
                        article.style.display = 'block';
                        article.classList.add('active');
                    }
                }
            }

            // Handle browser back/forward navigation
            window.addEventListener('popstate', function(event) {
                if (event.state && event.state.from === 'article') {
                    showMainPage(event.state.scrollPosition);
                } else if (window.location.hash) {
                    loadArticleFromHash();
                } else {
                    showMainPage(0);
                }
            });

            loadArticleFromHash();
        }

        // ========== STAR RATING SYSTEM ==========
        function setupStarRatings() {
            const messages = [
                "Waan ka xumahay.",
                "Mahadsanid.",
                "Waad ku mahadsan tahay.",
                "Aad baad u mahadsan tahay.",
                "Waan ku faraxsanahay."
            ];

            document.querySelectorAll('.star').forEach(star => {
                star.addEventListener('click', function() {
                    const container = this.closest('.rating-container');
                    const value = parseInt(this.getAttribute('data-value'));
                    const feedback = container.querySelector('.rating-feedback');
                    
                    // Update star display
                    container.querySelectorAll('.star').forEach((s, i) => {
                        s.classList.toggle('active', i < value);
                    });
                    
                    // Show feedback message
                    feedback.textContent = messages[value - 1];
                    feedback.style.display = 'block';
                    
                    // Save to localStorage
                    const articleId = this.closest('.article-detail').id;
                    localStorage.setItem(`rating_${articleId}`, value);
                });
            });

            // Load saved ratings
            document.querySelectorAll('.article-detail').forEach(article => {
                const savedRating = localStorage.getItem(`rating_${article.id}`);
                if (savedRating) {
                    const rating = parseInt(savedRating);
                    const container = article.querySelector('.rating-container');
                    
                    container.querySelectorAll('.star').forEach((star, i) => {
                        star.classList.toggle('active', i < rating);
                    });
                    
                    const feedback = container.querySelector('.rating-feedback');
                    feedback.textContent = messages[rating - 1];
                    feedback.style.display = 'block';
                }
            });
        }
// ========== INITIALIZE ALL FUNCTIONALITY ==========
        calculateReadingTime();
        setupNavigation();
        setupStarRatings();
    });
document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', function() {
    const rating = this.getAttribute('data-value');
    const phone = "252614008340"; // Replace with your number

    // 1. GUARANTEED TITLE EXTRACTION
    let articleTitle = "Unknown Article"; // Fallback text
    
    // Method 1: Check article detail view
    const articleDetail = this.closest('.article-detail');
    if (articleDetail) {
      const titleEl = articleDetail.querySelector('.article-title, h1, h2');
      if (titleEl) articleTitle = titleEl.innerText;
    }
    
    // Method 2: Check preview cards (if Method 1 fails)
    if (articleTitle === "Unknown Article") {
      const articlePreview = this.closest('.article-preview');
      if (articlePreview) {
        const previewTitle = articlePreview.querySelector('.article-title, h2, h4');
        if (previewTitle) articleTitle = previewTitle.innerText;
      }
    }

    // 2. WHATSAPP MESSAGE
    const message = `🌟 REYS AQOON RATING 🌟
    
*Maqaal:* ${articleTitle}
*Xiddigaha:* ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}  
*Taariikh:* ${new Date().toLocaleString()}
    
Mahadsanid qiimayntaada! ❤️`;

    window.open(`https://wa.me/252614008340?text=${encodeURIComponent(message)}`, '_blank');

    // 3. VISUAL FEEDBACK (with emoji fallback)
    const feedback = this.closest('.rating-container').querySelector('.rating-feedback');
    feedback.innerHTML = `
      <i class="fab fa-whatsapp" style="color: #25D366;"></i>
      ${articleTitle === "Unknown Article" ? "❌" : "✓"} 
      Diiwaan gelinta: ${articleTitle.substring(0, 20)}${articleTitle.length > 20 ? "..." : ""}
    `;
    feedback.style.display = 'block';
  });
});
