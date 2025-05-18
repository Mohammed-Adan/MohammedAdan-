// main.js - Complete Solution with Scroll Position Preservation

document.addEventListener('DOMContentLoaded', function() {
    // ========== GLOBAL VARIABLES ==========
    let scrollPosition = 0;
    const isArticlePage = document.querySelector('.article-detail') !== null;
    
    // ========== DARK MODE TOGGLE ==========
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        
        function initDarkMode() {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const savedMode = localStorage.getItem('darkMode');

            if (savedMode === 'true' || (savedMode === null && prefersDark)) {
                document.body.classList.add('dark-mode');
                icon.classList.replace('fa-moon', 'fa-sun');
            }
        }
        
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            icon.classList.toggle('fa-sun');
            icon.classList.toggle('fa-moon');
        }
        
        initDarkMode();
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // ========== NAVIGATION SYSTEM ==========
    function setupNavigation() {
        // Handle article links on index page
        if (!isArticlePage) {
            document.querySelectorAll('.read-more-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Save the exact position of this article preview
                    const articlePreview = this.closest('.article-preview');
                    const previewRect = articlePreview.getBoundingClientRect();
                    const previewTop = previewRect.top + window.scrollY;
                    
                    localStorage.setItem('scrollPosition', previewTop);
                    window.location.href = this.getAttribute('href');
                });
            });
            
            // Restore scroll position if coming back from article
            const savedPosition = localStorage.getItem('scrollPosition');
            if (savedPosition) {
                setTimeout(() => {
                    window.scrollTo(0, savedPosition);
                    localStorage.removeItem('scrollPosition');
                }, 100);
            }
        }
        
        // Handle back button on article pages
        if (isArticlePage) {
            const backBtn = document.querySelector('.back-home-btn');
            if (backBtn) {
                backBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Get the article ID to find its preview
                    const articleId = document.querySelector('.article-detail').id;
                    
                    // Save the article ID to highlight it later
                    localStorage.setItem('lastArticleId', articleId);
                    
                    // Navigate back to index
                    window.location.href = 'index.html';
                });
            }
        }

        // Highlight the article preview when returning
        if (!isArticlePage) {
            const lastArticleId = localStorage.getItem('lastArticleId');
            if (lastArticleId) {
                const articlePreview = document.getElementById(lastArticleId);
                if (articlePreview) {
                    // Scroll to the preview
                    setTimeout(() => {
                        const previewRect = articlePreview.getBoundingClientRect();
                        const previewTop = previewRect.top + window.scrollY - 100; // 100px offset from top
                        
                        window.scrollTo({
                            top: previewTop,
                            behavior: 'smooth'
                        });
                        
                        // Highlight effect
                        articlePreview.style.boxShadow = '0 0 0 3px var(--primary)';
                        articlePreview.style.transition = 'box-shadow 0.3s ease';
                        setTimeout(() => {
                            articlePreview.style.boxShadow = 'none';
                        }, 2000);
                        
                        localStorage.removeItem('lastArticleId');
                    }, 100);
                }
            }
        }
    }

    // ========== READING TIME CALCULATOR ==========
    function calculateReadingTime() {
        const article = document.querySelector('.article-detail');
        if (article) {
            const text = article.textContent;
            const words = text.split(/\s+/).length;
            const minutes = Math.ceil(words / 150);
            const badge = `<div class="reading-time">${minutes} Daqiiqo akhris ah</div>`;
            article.querySelector('.article-content').insertAdjacentHTML('afterbegin', badge);
        }
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
                                star.style.color = 'var(--secondary)';
                            }
                        });
                    }
                }
            }
        }
    }

    // ========== RATING MODAL FUNCTIONS ==========
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
            const phone = "252614008340";
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
        const messages = [
            "Waan ka xumahay.",
            "Mahadsanid.",
            "Waad ku mahadsan tahay.",
            "Aad baad u mahadsan tahay.",
            "Waan ku faraxsanahay."
        ];
        
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

    // ========== ANIMATION HANDLERS ==========
    function setupAnimations() {
        // Hash-based animation
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target && target.classList.contains('animate-appear')) {
                setTimeout(() => {
                    target.classList.add("show");
                }, 200);
            }
        }

        // Intersection Observer for article previews
        const options = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('.article-preview').forEach(article => {
            observer.observe(article);
        });
    }

    // ========== INITIALIZE ALL FUNCTIONALITY ==========
    setupNavigation();
    calculateReadingTime();
    setupStarRatings();
    setupAnimations();
});
