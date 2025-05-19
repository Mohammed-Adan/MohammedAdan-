document.addEventListener('DOMContentLoaded', function() {
    // ========== CONFIGURATION ==========
    const config = {
        readingSpeed: 150,       // words per minute for articles
        previewReadingSpeed: 100, // words per minute for previews
        whatsappPhone: "252614008340",
        ratingMessages: [
            "Waan ka xumahay.",
            "Mahadsanid.",
            "Waad ku mahadsan tahay.",
            "Aad baad u mahadsan tahay.",
            "Waan ku faraxsanahay."
        ]
    };

    // ========== STATE MANAGEMENT ==========
    const state = {
        isArticlePage: document.querySelector('.article-detail') !== null,
        currentScrollPosition: 0
    };

    // ========== DARK MODE TOGGLE ==========
    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (!darkModeToggle) return;

        const icon = darkModeToggle.querySelector('i');
        const savedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Set initial mode
        if (savedMode === 'true' || (savedMode === null && prefersDark)) {
            document.body.classList.add('dark-mode');
            icon?.classList.replace('fa-moon', 'fa-sun');
        }

        // Toggle handler
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            icon?.classList.toggle('fa-sun');
            icon?.classList.toggle('fa-moon');
        });
    }

    // ========== NAVIGATION SYSTEM ==========
    function setupNavigation() {
        // Article link click handler
        document.querySelectorAll('.read-btn, .read-more-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.preview-card, .article-preview');
                if (card) {
                    const rect = card.getBoundingClientRect();
                    localStorage.setItem('scrollPosition', rect.top + window.scrollY);
                }
                window.location.href = this.getAttribute('href');
            });
        });

        // Back button handler
        document.querySelector('.back-home-btn')?.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = document.querySelector('.article-detail')?.id;
            if (articleId) {
                localStorage.setItem('lastArticleId', articleId);
            }
            window.location.href = 'index.html';
        });

        // Restore scroll position
        const savedPosition = localStorage.getItem('scrollPosition');
        if (savedPosition) {
            setTimeout(() => {
                window.scrollTo(0, savedPosition);
                localStorage.removeItem('scrollPosition');
            }, 100);
        }

        // Highlight returned article
        const lastArticleId = localStorage.getItem('lastArticleId');
        if (lastArticleId) {
            const articleCard = document.getElementById(lastArticleId);
            if (articleCard) {
                setTimeout(() => {
                    const rect = articleCard.getBoundingClientRect();
                    window.scrollTo({
                        top: rect.top + window.scrollY - 100,
                        behavior: 'smooth'
                    });
                    localStorage.removeItem('lastArticleId');
                }, 100);
            }
        }
    }

    // ========== READING TIME CALCULATOR ==========
    function calculateReadingTime() {
        // For full articles
        const fullArticle = document.querySelector('.article-detail');
        if (fullArticle) {
            const words = fullArticle.textContent.split(/\s+/).length;
            const minutes = Math.ceil(words / config.readingSpeed);
            fullArticle.querySelector('.article-content')?.insertAdjacentHTML(
                'afterbegin',
                `<div class="reading-time">${minutes} Daqiiqo akhris ah</div>`
            );
        }

        // For preview cards
        document.querySelectorAll('.preview-card').forEach(card => {
            const excerpt = card.querySelector('.excerpt')?.textContent || '';
            const words = excerpt.split(/\s+/).length;
            const minutes = Math.max(1, Math.ceil(words / config.previewReadingSpeed));
            
            const timeElement = card.querySelector('.stats .time');
            if (timeElement) {
                timeElement.innerHTML = `<i class="far fa-clock"></i> ${minutes} daq.`;
            }
        });
    }

    // ========== STAR RATING SYSTEM ==========
    function setupStarRatings() {
        // Star hover effects
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('mouseenter', function() {
                const value = parseInt(this.getAttribute('data-value'));
                const stars = this.parentElement.querySelectorAll('.star');
                stars.forEach((s, i) => {
                    s.style.transform = i < value ? 'scale(1.2)' : '';
                    s.style.color = i < value ? '#ffc107' : '#e0e0e0';
                });
            });

            star.addEventListener('mouseleave', function() {
                const stars = this.parentElement.querySelectorAll('.star');
                stars.forEach(s => {
                    if (!s.classList.contains('active')) {
                        s.style.transform = '';
                        s.style.color = '';
                    }
                });
            });

            // Star click handler
            star.addEventListener('click', function() {
                const container = this.closest('.rating-container');
                const value = parseInt(this.getAttribute('data-value'));
                const articleTitle = container.closest('.article-detail')?.querySelector('.article-title')?.textContent || "Maqaal aan la garaneyn";

                // Update UI
                container.querySelectorAll('.star').forEach((s, i) => {
                    s.classList.toggle('active', i < value);
                    s.style.color = i < value ? '#ffc107' : '#e0e0e0';
                });

                // Save rating
                const articleId = container.closest('[id]').id;
                if (articleId) {
                    localStorage.setItem(`rating_${articleId}`, value);
                    updateAverageRating(articleId, value);
                    showRatingModal(value, articleTitle, container);
                }
            });
        });

        // Load saved ratings
        document.querySelectorAll('.article-detail').forEach(article => {
            const articleId = article.id;
            const savedRating = localStorage.getItem(`rating_${articleId}`);
            if (savedRating) {
                const rating = parseInt(savedRating);
                const container = article.querySelector('.rating-container');
                if (container) {
                    container.querySelectorAll('.star').forEach((star, i) => {
                        if (i < rating) {
                            star.classList.add('active');
                            star.style.color = '#ffc107';
                        }
                    });
                }
            }
        });

        // Load average ratings for preview cards
        document.querySelectorAll('.preview-card').forEach(card => {
            const articleId = card.id;
            const avgRating = localStorage.getItem(`avgRating_${articleId}`);
            const ratingElement = card.querySelector('.rating');
            
            if (ratingElement && avgRating) {
                ratingElement.innerHTML = `<i class="fas fa-star"></i> ${avgRating}`;
            }
        });
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

        // Handle confirm
        modal.querySelector('.modal-confirm').addEventListener('click', function() {
            const message = `🌟 REYS AQOON RATING 🌟\n\n*Maqaal:* ${articleTitle}\n*Qiimaynta:* ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}\n*Taariikh:* ${new Date().toLocaleDateString()}\n\nKu mahadsantahay qiimayntaada. ❤️`;
            window.open(`https://wa.me/${config.whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
            closeModal(modal);
            showFeedback(rating, container);
        });

        // Handle cancel
        modal.querySelector('.modal-cancel').addEventListener('click', function() {
            closeModal(modal);
            showFeedback(rating, container);
        });

        // Close when clicking outside
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
                <span> ${config.ratingMessages[rating - 1]} Qiimayntaadu waa: <span class="feedback-stars">${'★'.repeat(rating)}</span></span>
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
        // Hash-based animation
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target?.classList.contains('animate-appear')) {
                setTimeout(() => target.classList.add("show"), 200);
            }
        }

        // Intersection Observer
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