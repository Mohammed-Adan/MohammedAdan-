document.addEventListener('DOMContentLoaded', function() {
    // ========== CONFIGURATION ==========
    const CONFIG = {
        readingSpeed: 150,
        previewReadingSpeed: 100,
        whatsappPhone: "252614008340",
        scrollOffset: 100,
        ratingMessages: [
            "Waan ka xumahay.",
            "Mahadsanid.",
            "Waad ku mahadsan tahay.",
            "Aad baad u mahadsan tahay.",
            "Waan ku faraxsanahay."
        ]
    };

    // ========== STATE CHECK ==========
    const isArticlePage = document.querySelector('.article-detail') !== null;

    // ========== DARK MODE TOGGLE ==========
    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (!darkModeToggle) return;

        const icon = darkModeToggle.querySelector('i');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedMode = localStorage.getItem('darkMode');

        // Set initial mode
        if (savedMode === 'true' || (savedMode === null && prefersDark)) {
            document.body.classList.add('dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
        }

        // Toggle handler
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            icon.classList.toggle('fa-sun');
            icon.classList.toggle('fa-moon');
        });
    }

// ========== PERFECT SMOOTH NAVIGATION SYSTEM ==========
let isNavigating = false;

function setupNavigation() {
    // Track page types
    const isArticlePage = /article\d*\.html/i.test(window.location.pathname);
    const isIndexPage = /index\.html$/i.test(window.location.pathname);

    // Improved click handler for all navigation
    document.addEventListener('click', function(e) {
        const articleLink = e.target.closest('[data-navigate="article"]');
        const backButton = e.target.closest('[data-navigate="home"]');
        
        if (articleLink && !isNavigating) {
            e.preventDefault();
            isNavigating = true;
            
            // Save current state
            const articleId = articleLink.closest('.article-preview')?.id;
            if (articleId) {
                sessionStorage.setItem('lastArticleId', articleId);
                sessionStorage.setItem('lastScrollPosition', window.scrollY.toString());
            }
            
            // Add loading class to body
            document.body.classList.add('page-transition');
            
            // Delay navigation to allow CSS transition
            setTimeout(() => {
                window.location.href = articleLink.getAttribute('href');
            }, 300);
        }
        
        if (backButton && isArticlePage && !isNavigating) {
            e.preventDefault();
            isNavigating = true;
            
            // Set transition direction
            document.body.classList.add('page-transition', 'returning-home');
            
            setTimeout(() => {
                window.location.href = backButton.getAttribute('href');
            }, 300);
        }
    });

    // Handle page entrance animations
    window.addEventListener('DOMContentLoaded', function() {
        // Coming back to index from article
        if (isIndexPage) {
            const lastArticleId = sessionStorage.getItem('lastArticleId');
            const lastScrollPosition = sessionStorage.getItem('lastScrollPosition');
            
            if (lastScrollPosition) {
                document.body.classList.add('page-loading');
                
                // Wait for all assets to load
                const checkReady = () => {
                    if (document.readyState === 'complete') {
                        restoreScrollPosition(lastArticleId, lastScrollPosition);
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            }
        }
        // Coming to article from anywhere
        else if (isArticlePage) {
            document.body.classList.add('page-loading');
            setTimeout(() => {
                document.body.classList.remove('page-loading');
            }, 600);
        }
    });
}

function restoreScrollPosition(articleId, scrollPosition) {
    // Initial immediate scroll (hidden by opacity)
    window.scrollTo(0, parseInt(scrollPosition));
    
    // Wait for next frame
    requestAnimationFrame(() => {
        // Smooth scroll to final position
        if (articleId) {
            const articleElement = document.getElementById(articleId);
            if (articleElement) {
                const targetPosition = articleElement.getBoundingClientRect().top + 
                                    window.scrollY - 20; // 20px offset
                
                setTimeout(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Highlight animation
                    articleElement.classList.add('return-highlight');
                    setTimeout(() => {
                        articleElement.classList.remove('return-highlight');
                    }, 1500);
                }, 50);
            }
        }
        
        // Fade in content
        setTimeout(() => {
            document.body.classList.remove('page-loading');
            sessionStorage.removeItem('lastArticleId');
            sessionStorage.removeItem('lastScrollPosition');
        }, 100);
    });
}

// Initialize with slight delay
setTimeout(setupNavigation, 50);

    // ========== READING TIME CALCULATOR ==========
    function calculateReadingTime() {
        // For full articles
        const article = document.querySelector('.article-detail');
        if (article) {
            const text = article.textContent;
            const words = text.split(/\s+/).length;
            const minutes = Math.ceil(words / CONFIG.readingSpeed);
            const badge = `<div class="reading-time">${minutes} Daqiiqo akhris ah</div>`;
            article.querySelector('.article-content')?.insertAdjacentHTML('afterbegin', badge);
        }

        // For preview cards
        document.querySelectorAll('.preview-card').forEach(card => {
            const excerpt = card.querySelector('.excerpt')?.textContent || '';
            const words = excerpt.split(/\s+/).length;
            const minutes = Math.max(1, Math.ceil(words / CONFIG.previewReadingSpeed));
            
            const timeElement = card.querySelector('.stats .time');
            if (timeElement) {
                timeElement.innerHTML = `<i class="far fa-clock"></i> ${minutes} daq.`;
            }
        });
    }

    // ========== STAR RATING SYSTEM ==========
    function setupStarRatings() {
        // Star interaction handlers
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('mouseenter', handleStarHover);
            star.addEventListener('mouseleave', handleStarHoverOut);
            star.addEventListener('click', handleStarClick);
        });

        // Load saved ratings
        if (isArticlePage) {
            const articleId = document.querySelector('.article-detail')?.id;
            if (articleId) {
                const savedRating = localStorage.getItem(`rating_${articleId}`);
                if (savedRating) {
                    const rating = parseInt(savedRating);
                    const container = document.querySelector('.rating-container');
                    if (container) {
                        container.querySelectorAll('.star').forEach((star, i) => {
                            if (i < rating) {
                                star.classList.add('active');
                                star.style.color = '#ffc107';
                            }
                        });
                    }
                }
            }
        }

        // Update preview card ratings
        document.querySelectorAll('.preview-card').forEach(card => {
            const articleId = card.id;
            const avgRating = localStorage.getItem(`avgRating_${articleId}`);
            const ratingElement = card.querySelector('.rating');
            if (ratingElement && avgRating) {
                ratingElement.innerHTML = `<i class="fas fa-star"></i> ${avgRating}`;
            }
        });

        function handleStarHover(e) {
            const value = parseInt(e.target.getAttribute('data-value'));
            const stars = e.target.parentElement.querySelectorAll('.star');
            stars.forEach((star, i) => {
                star.style.transform = i < value ? 'scale(1.2)' : '';
                star.style.color = i < value ? '#ffc107' : '#e0e0e0';
            });
        }

        function handleStarHoverOut(e) {
            const stars = e.target.parentElement.querySelectorAll('.star');
            stars.forEach(star => {
                if (!star.classList.contains('active')) {
                    star.style.transform = '';
                    star.style.color = '';
                }
            });
        }

        function handleStarClick(e) {
            const container = e.target.closest('.rating-container');
            const value = parseInt(e.target.getAttribute('data-value'));
            const articleTitle = container.closest('.article-detail')?.querySelector('.article-title')?.textContent || "Maqaal aan la garaneyn";

            // Update UI
            container.querySelectorAll('.star').forEach((star, i) => {
                star.classList.toggle('active', i < value);
                star.style.color = i < value ? '#ffc107' : '#e0e0e0';
            });

            // Save rating
            const articleId = container.closest('[id]').id;
            if (articleId) {
                localStorage.setItem(`rating_${articleId}`, value);
                updateAverageRating(articleId, value);
                showRatingModal(value, articleTitle, container);
            }
        }
    }

    function updateAverageRating(articleId, newRating) {
        const ratings = JSON.parse(localStorage.getItem(`ratings_${articleId}`)) || [];
        ratings.push(newRating);
        localStorage.setItem(`ratings_${articleId}`, JSON.stringify(ratings));
        
        const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
        localStorage.setItem(`avgRating_${articleId}`, avg);
        
        // Update preview card if exists
        const previewCard = document.getElementById(articleId);
        if (previewCard) {
            const ratingElement = previewCard.querySelector('.rating');
            if (ratingElement) {
                ratingElement.innerHTML = `<i class="fas fa-star"></i> ${avg}`;
            }
        }
    }

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

        // Event handlers
        modal.querySelector('.modal-confirm').addEventListener('click', function() {
            const message = `🌟 REYS AQOON RATING 🌟\n\n*Maqaal:* ${articleTitle}\n*Qiimaynta:* ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}\n*Taariikh:* ${new Date().toLocaleDateString()}\n\nKu mahadsantahay qiimayntaada. ❤️`;
            window.open(`https://wa.me/${CONFIG.whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
            closeModal(modal);
            showFeedback(rating, container);
        });

        modal.querySelector('.modal-cancel').addEventListener('click', function() {
            closeModal(modal);
            showFeedback(rating, container);
        });

        modal.addEventListener('click', function(e) {
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
        if (!feedback) return;

        feedback.innerHTML = `
            <div class="feedback-content">
                <svg class="feedback-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
                </svg>
                <span> ${CONFIG.ratingMessages[rating - 1]} Qiimayntaadu waa: <span class="feedback-stars">${'★'.repeat(rating)}</span></span>
            </div>
        `;

        feedback.style.display = 'flex';
        feedback.style.animation = 'feedbackIn 0.4s forwards';

        setTimeout(() => {
            feedback.style.animation = 'feedbackOut 0.4s forwards';
            setTimeout(() => feedback.style.display = 'none', 400);
        }, 3000);
    }

    // ========== ANIMATION HANDLERS ==========
    function setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.article-preview, .preview-card').forEach(el => {
            observer.observe(el);
        });
    }

    // ========== INITIALIZE ALL FUNCTIONALITY ==========
    initDarkMode();
    setupNavigation();
    calculateReadingTime();
    setupStarRatings();
    setupAnimations();
});

document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  // Sample articles data (replace with your actual articles)
  const articles = [
  {
    id: 'ChatGPT!',
    title:'ChatGPT wuxuu noqon karaa marin aad ku lumin karto garashadaada.!',
    excerpt:'ChatGPT aad buu kuu taageeraa, mararka qaarna si aan kala sooc lahayn ayuuba u taageeraa fikrad kasta oo aad la timaaddo..',
    date:'May 29,2025'
  },
  {
    id: 'xifdinta-maskaxda',
    title: 'Sida Maskaxdu u Kaydiso Macluumaadka',
    excerpt: 'Baro habka cilmi-nafsiyadeed ee ay maskaxdu u xifdo macluumaadka...',
    date: 'May 14, 2025'
  },
  {
    id: 'malware-iyo-virus',
    title: 'MALWARE IYO VIRUS – WAA MAXAY?',
    excerpt: 'Aqoonta muhiimka ah ee ku saabsan malware, virus...',
    date: 'May 8, 2025'
  },
  {
    id: 'cadaadiska-nafeed',
    title: 'CADAADISKA NAFTA',
    excerpt: 'Fahanka cadaadiska nafeed iyo sida loola dhaqmo...',
    date: 'April 30, 2025'
  },
  {
    id: 'labada nooc ee aqoonta',
    title: 'LABADA NOOC EE AQOONTA',
    excerpt: 'Waxaa jira laba nooc oo aqoon ah oo aan faa\'iido kuu lahayn...',
    date: 'April 29, 2025'
  },
{
  id: 'Diinta-Nolosha',
  title: 'INTA AAD KU NOOLAANAYSO NOLOSHA.!',
  excerpt: 'Nolosha dhan marka la isku daro, Diinta Islaamka intey ka tartaa?...',
  date: 'June 04, 2025'
},
  {
    id: 'DUCO-KU-DHOW-AQBALAADDA!',
    title: 'DUCO KU DHOW AQBALAADDA!',
    excerpt: 'Tilmaamo wax tar leh oo uu qofka Muslimka ah u sahlaya inuu duco u jeediyo Rabbigiis si niyad-sami iyo aqbalaad leh...',
    date: 'May 27, 2025',
    category: 'Tilmaamaha Ducada',
    image: '/Picture/pray-7741275_1280.png'
  }
];

  // Search function
  function performSearch(query) {
    if (!query.trim()) {
      searchResults.style.display = 'none';
      return;
    }

    const results = articles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) || 
      article.excerpt.toLowerCase().includes(query.toLowerCase())
    );

    displayResults(results);
  }

  // Display results
  function displayResults(results) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">Ma jiro maqaal la heli karo</div>';
      searchResults.style.display = 'block';
      return;
    }

    results.forEach(article => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';
      resultItem.innerHTML = `
        <h4>${article.title}</h4>
        <p>${article.excerpt.substring(0, 80)}...</p>
        <small>${article.date}</small>
      `;
      
      resultItem.addEventListener('click', () => {
        window.location.hash = article.id;
        searchResults.style.display = 'none';
        searchInput.value = '';
      });
      
      searchResults.appendChild(resultItem);
    });

    searchResults.style.display = 'block';
  }

  // Event listeners
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    performSearch(searchInput.value);
  });

  searchInput.addEventListener('input', function() {
    performSearch(this.value);
  });

  // Close results when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchForm.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = searchResults.querySelectorAll('.search-result-item');
      if (items.length === 0) return;
      
      let currentIndex = -1;
      items.forEach((item, index) => {
        if (item.classList.contains('highlighted')) {
          item.classList.remove('highlighted');
          currentIndex = index;
        }
      });
      
      if (e.key === 'ArrowDown') {
        currentIndex = (currentIndex + 1) % items.length;
      } else {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
      }
      
      items[currentIndex].classList.add('highlighted');
      items[currentIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && searchResults.style.display === 'block') {
      const highlighted = searchResults.querySelector('.highlighted');
      if (highlighted) {
        highlighted.click();
      }
    }
  });
});
// Add this at the beginning of your script
   let articles = [];
   
   // Load articles when page loads
   function loadArticles() {
     document.querySelectorAll('.article-preview').forEach(preview => {
       articles.push({
         id: preview.dataset.article,
         title: preview.querySelector('.article-title').textContent,
         excerpt: preview.querySelector('.article-excerpt').textContent,
         date: preview.querySelector('.date').textContent
       });
     });
   }
   