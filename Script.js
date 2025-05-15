  
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
document.addEventListener('DOMContentLoaded', function() {
  // Initialize stars with event listeners
  document.querySelectorAll('.star').forEach(star => {
    // Hover effects
    star.addEventListener('mouseenter', function() {
      const value = parseInt(this.getAttribute('data-value'));
      const stars = this.parentElement.querySelectorAll('.star');
      
      stars.forEach((s, i) => {
        if (i < value) {
          s.style.transform = 'scale(1.2)';
          s.style.color = 'var(--secondary)';
        }
      });
    });
    
    star.addEventListener('mouseleave', function() {
      const stars = this.parentElement.querySelectorAll('.star');
      
      stars.forEach(s => {
        if (!s.classList.contains('active')) {
          s.style.transform = 'scale(1)';
          s.style.color = 'var(--light-gray)';
        }
      });
    });
    
    // Click handler
    star.addEventListener('click', function() {
      const container = this.closest('.rating-container');
      const value = parseInt(this.getAttribute('data-value'));
      const articleTitle = this.closest('.article-detail')?.querySelector('.article-title')?.textContent || "Maqaal aan la garaneyn";
      
      // Update UI
      container.querySelectorAll('.star').forEach((s, i) => {
        s.classList.toggle('active', i < value);
        s.style.color = i < value ? 'var(--secondary)' : 'var(--light-gray)';
      });
      
      // Show confirmation modal
      showRatingModal(value, articleTitle, container);
    });
  });
  
  // Load saved ratings
  document.querySelectorAll('.article-detail').forEach(article => {
    const savedRating = localStorage.getItem(`rating_${article.id}`);
    if (savedRating) {
      const rating = parseInt(savedRating);
      const container = article.querySelector('.rating-container');
      
      container.querySelectorAll('.star').forEach((star, i) => {
        if (i < rating) {
          star.classList.add('active');
          star.style.color = 'var(--secondary)';
        }
      });
    }
  });
});

function showRatingModal(rating, articleTitle, container) {
  const modal = document.createElement('div');
  modal.className = 'rating-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Qiimayntaadu</h3>
      <div class="modal-stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
      <p>Ma rabtaa inaad iigu soo dirto WhatsApp, qiimayntaada?</p>
      <div class="modal-buttons">
        <button class="modal-cancel">Maya</button>
        <button class="modal-confirm">Haa</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate in
  setTimeout(() => {
    modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    modal.querySelector('.modal-content').style.opacity = '1';
  }, 10);
  
  // Handle confirm
  modal.querySelector('.modal-confirm').addEventListener('click', function() {
    const phone = "252614008340"; // Replace with your WhatsApp number
    const message = `🌟 REYS AQOON RATING 🌟\n\n*Maqaal:* ${articleTitle}\n*Qiimaynta:* ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}\n*Taariikh:* ${new Date().toLocaleDateString()}\n\nKu mahadsantahay qiimayntaada. ❤️`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    closeModal(modal);
    showFeedback(rating, container);
  });
  
  // Handle cancel
  modal.querySelector('.modal-cancel').addEventListener('click', function() {
    closeModal(modal);
    showFeedback(rating, container);
  });
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
}

function closeModal(modal) {
  modal.querySelector('.modal-content').style.transform = 'translateY(20px)';
  modal.querySelector('.modal-content').style.opacity = '0';
  setTimeout(() => modal.remove(), 300);
}

function showFeedback(rating, container) {
  const feedback = container.querySelector('.rating-feedback');
  feedback.innerHTML = `
    <div class="feedback-content">
      <svg class="feedback-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
      </svg>
      <span> Haye, waad mahadsantahay. Qiimayntaadu waa: <span class="feedback-stars">${'★'.repeat(rating)}</span></span>
    </div>
  `;
  
  feedback.style.display = 'flex';
  feedback.style.animation = 'feedbackIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
  
  // Save rating to localStorage
  const articleId = container.closest('.article-detail').id;
  localStorage.setItem(`rating_${articleId}`, rating);
  
  setTimeout(() => {
    feedback.style.animation = 'feedbackOut 0.4s ease forwards';
    setTimeout(() => feedback.style.display = 'none', 400);
  }, 3000);
}
