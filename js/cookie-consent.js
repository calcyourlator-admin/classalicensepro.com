document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('cookie-banner');
    if (banner && !localStorage.getItem('cookie-consent')) {
        setTimeout(() => {
            banner.classList.add('active');
        }, 2000);
    }

    window.acceptAllCookies = function() {
        if (banner) {
            localStorage.setItem('cookie-consent', 'all');
            banner.classList.remove('active');
        }
    };

    window.rejectNonEssential = function() {
        if (banner) {
            localStorage.setItem('cookie-consent', 'essential');
            banner.classList.remove('active');
        }
    };

    window.resetCookieConsent = function() {
        localStorage.removeItem('cookie-consent');
        location.reload();
    };

    // Enhanced Form Validation & Anti-spam
    const forms = document.querySelectorAll('form[action*="web3forms"]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // 1. Check for required fields
            const requiredFields = form.querySelectorAll('[required]');
            let missingFields = [];
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    const label = form.querySelector(`label[for="${field.id}"]`) || 
                                  field.closest('.form-group')?.querySelector('label') ||
                                  { textContent: field.name };
                    missingFields.push(label.textContent.trim());
                    field.classList.add('invalid-field');
                    
                    // Remove highlight on input
                    field.addEventListener('input', () => {
                        field.classList.remove('invalid-field');
                    }, { once: true });
                }
            });

            if (missingFields.length > 0) {
                e.preventDefault();
                alert(`Please fill out the following required field(s):\n- ${missingFields.join('\n- ')}`);
                return;
            }

            // 2. Anti-spam link blocking (respects link_scanning bypass)
            const formData = new FormData(form);
            
            if (formData.get('link_scanning') !== 'false') {
                let hasLink = false;
                const urlPattern = /(https?:\/\/|www\.|[a-z0-9]+\.[a-z]{2,})/i;

                for (let [name, value] of formData.entries()) {
                    // Ignore Web3forms hidden configuration fields that may contain URLs
                    if (['access_key', 'subject', 'from_name', 'redirect', 'botcheck', 'link_scanning'].includes(name)) {
                        continue;
                    }

                    if (typeof value === 'string' && urlPattern.test(value)) {
                        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailPattern.test(value)) {
                            hasLink = true;
                            break;
                        }
                    }
                }

                if (hasLink) {
                    e.preventDefault();
                    alert('For security reasons, web links are not allowed in this form. Please only provide text and email addresses.');
                }
            }
        });
    });

    window.openPrivacyRights = function() {
        const path = window.location.pathname;
        const isSubDir = path.includes('/services/') || path.includes('/onboarding/') || path.includes('/resources/');
        window.location.href = (isSubDir ? '../' : '') + 'privacy-policy.html#rights';
    };
});
