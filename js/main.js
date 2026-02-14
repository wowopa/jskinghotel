document.addEventListener('DOMContentLoaded', function () {
    // Scroll reveal animation
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);

                setTimeout(() => {
                    entry.target.classList.remove('reveal', 'active');
                }, 800);
            }
        });
    }, { threshold: 0.15 });

    const revealTargets = document.querySelectorAll('.section-header, .room-card, .surround-card, .map-wrapper, .hero-content');
    revealTargets.forEach((el) => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // Header scroll style
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile nav toggle
    const btnMenu = document.querySelector('.btn-menu');
    const gnb = document.querySelector('.gnb');

    if (btnMenu && gnb) {
        btnMenu.addEventListener('click', function () {
            const isOpen = this.classList.toggle('active');
            gnb.classList.toggle('active');
            this.setAttribute('aria-expanded', String(isOpen));
        });

        gnb.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                btnMenu.classList.remove('active');
                gnb.classList.remove('active');
                btnMenu.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Flatpickr setup
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    if (checkinInput && checkoutInput && typeof flatpickr !== 'undefined') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const fpCheckout = flatpickr(checkoutInput, {
            dateFormat: 'Y-m-d',
            minDate: tomorrow,
            defaultDate: tomorrow,
        });

        flatpickr(checkinInput, {
            dateFormat: 'Y-m-d',
            minDate: 'today',
            defaultDate: 'today',
            onChange: function (selectedDates) {
                if (selectedDates[0]) {
                    const nextDay = new Date(selectedDates[0]);
                    nextDay.setDate(nextDay.getDate() + 1);
                    fpCheckout.set('minDate', nextDay);
                    fpCheckout.setDate(nextDay, true);
                }
            },
        });
    }

    // Booking link
    function handleBooking(event) {
        event.preventDefault();

        const checkinDate = checkinInput ? checkinInput.value : '';
        const checkoutDate = checkoutInput ? checkoutInput.value : '';
        const yanoljaUrl = `https://nol.yanolja.com/stay/domestic/3008795?checkInDate=${checkinDate}&checkOutDate=${checkoutDate}&adultCount=2`;
        window.open(yanoljaUrl, '_blank', 'noopener,noreferrer');
    }

    const btnBook = document.querySelector('.btn-book');
    const btnSearch = document.querySelector('.btn-search');
    if (btnBook) btnBook.addEventListener('click', handleBooking);
    if (btnSearch) btnSearch.addEventListener('click', handleBooking);

    // Room modal
    const modal = document.getElementById('room-modal');
    if (modal) {
        const modalMainImg = modal.querySelector('.modal-main-img');
        const modalThumbList = modal.querySelector('.modal-thumb-list');
        const modalTitle = modal.querySelector('.modal-title');
        const modalDesc = modal.querySelector('.modal-desc');
        const modalFeaturesList = modal.querySelector('.modal-features ul');
        const btnClose = modal.querySelector('.btn-close');
        const overlay = modal.querySelector('.modal-overlay');
        let lastFocusedElement = null;

        const trapFocus = (event) => {
            if (!modal.classList.contains('show')) return;

            if (event.key === 'Escape') {
                closeModal();
                return;
            }

            if (event.key !== 'Tab') return;

            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        function closeModal() {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', trapFocus);
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }

        document.querySelectorAll('.btn-detail').forEach((btn) => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                lastFocusedElement = document.activeElement;

                const card = this.closest('.room-card');
                if (!card) return;

                const titleEl = card.querySelector('h4');
                const title = titleEl ? titleEl.innerText : '';
                const desc = this.getAttribute('data-detail') || '';

                const imagesAttr = this.getAttribute('data-images');
                let images = [];
                try {
                    images = JSON.parse(imagesAttr || '[]');
                } catch (err) {
                    const fallbackImg = card.querySelector('.room-img img');
                    if (fallbackImg) images.push(fallbackImg.src);
                }

                const amenitiesAttr = this.getAttribute('data-amenities');
                let amenities = [];
                try {
                    amenities = JSON.parse(amenitiesAttr || '[]');
                } catch (err) {
                    amenities = ['무료 Wi-Fi', '기본 어메니티'];
                }

                if (modalTitle) modalTitle.innerText = title;
                if (modalDesc) modalDesc.innerText = desc;

                if (modalFeaturesList) {
                    modalFeaturesList.innerHTML = '';
                    amenities.forEach((item) => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        modalFeaturesList.appendChild(li);
                    });
                }

                if (modalThumbList && modalMainImg) {
                    modalThumbList.innerHTML = '';

                    if (images.length > 0) {
                        modalMainImg.src = images[0];

                        images.forEach((imgSrc, index) => {
                            const thumb = document.createElement('img');
                            thumb.src = imgSrc;
                            thumb.alt = `${title} thumbnail ${index + 1}`;
                            thumb.classList.add('modal-thumb');
                            if (index === 0) thumb.classList.add('active');

                            thumb.addEventListener('click', function () {
                                modalMainImg.src = this.src;
                                const activeThumb = modalThumbList.querySelector('.active');
                                if (activeThumb) activeThumb.classList.remove('active');
                                this.classList.add('active');
                            });

                            modalThumbList.appendChild(thumb);
                        });
                    }
                }

                modal.classList.add('show');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                document.addEventListener('keydown', trapFocus);
                if (btnClose) btnClose.focus();
            });
        });

        if (btnClose) btnClose.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
    }

    // Surroundings horizontal scroll controls
    const surroundGrid = document.querySelector('.surround-grid');
    const prevBtn = document.querySelector('.scroll-btn.prev');
    const nextBtn = document.querySelector('.scroll-btn.next');

    if (surroundGrid && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            surroundGrid.scrollBy({ left: -300, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            surroundGrid.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
});
