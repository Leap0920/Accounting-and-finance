/**
 * Dashboard JavaScript
 * Modern interactive features for Evergreen Accounting & Finance
 */

(function() {
    'use strict';

    /**
     * Initialize all dashboard features when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', function() {
        initSmoothScrolling();
        initActiveNavLinks();
        initModuleCardInteractions();
    });

    /**
     * Smooth scrolling for anchor links
     */
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            });
        });
    }

    /**
     * Set active state for navigation links
     */
    function initActiveNavLinks() {
        const currentLocation = window.location.pathname;
        
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            
            // Check if link matches current page
            if (href && (href === currentLocation || currentLocation.includes(href))) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Add interactive features to module cards
     */
    function initModuleCardInteractions() {
        const moduleCards = document.querySelectorAll('.module-card');
        
        moduleCards.forEach((card, index) => {
            // Add ripple effect on click
            card.addEventListener('click', function(e) {
                if (!e.target.classList.contains('module-link')) {
                    const link = this.querySelector('.module-link');
                    if (link) {
                        window.location.href = link.getAttribute('href');
                    }
                }
            });

            // Add keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            
            card.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = this.querySelector('.module-link');
                    if (link) {
                        window.location.href = link.getAttribute('href');
                    }
                }
            });
        });
    }

    /**
     * Optional: Add loading animation for module icons
     */
    function addIconAnimation() {
        const icons = document.querySelectorAll('.module-icon i');
        
        icons.forEach(icon => {
            icon.style.transition = 'transform 0.3s ease';
            
            icon.parentElement.addEventListener('mouseenter', function() {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
            });
            
            icon.parentElement.addEventListener('mouseleave', function() {
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }

    // Call optional animations
    addIconAnimation();

})();

