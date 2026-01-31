document.addEventListener('DOMContentLoaded', function() {
    // --- 페이지 로드 시 페이드인 효과 ---
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // --- Scroll Reveal Animation (스크롤 시 요소 등장 효과) ---
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // 한 번만 실행

                // 애니메이션 종료 후 클래스 제거 (기존 CSS 호버 효과와의 충돌 방지)
                setTimeout(() => {
                    entry.target.classList.remove('reveal', 'active');
                }, 800); // CSS transition 시간(0.8s)과 일치
            }
        });
    }, { threshold: 0.15 }); // 요소가 15% 보일 때 작동

    // 애니메이션 적용 대상 선택
    const revealTargets = document.querySelectorAll('.section-header, .room-card, .surround-card, .map-wrapper, .hero-content');
    revealTargets.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // --- 헤더 스크롤 이벤트 ---
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

    // --- 모바일 메뉴 토글 ---
    const btnMenu = document.querySelector('.btn-menu');
    const gnb = document.querySelector('.gnb');
    
    if (btnMenu && gnb) {
        btnMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            gnb.classList.toggle('active');
        });

        // 메뉴 링크 클릭 시 닫기
        gnb.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                btnMenu.classList.remove('active');
                gnb.classList.remove('active');
            });
        });
    }

    // --- 날짜 선택 (Flatpickr) 설정 ---
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    // 내일 날짜 계산
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 체크아웃 캘린더 (먼저 선언해야 체크인에서 참조 가능)
    const fpCheckout = flatpickr(checkoutInput, {
        dateFormat: "Y-m-d",
        minDate: tomorrow,
        defaultDate: tomorrow
    });

    // 체크인 캘린더
    const fpCheckin = flatpickr(checkinInput, {
        dateFormat: "Y-m-d",
        minDate: "today",
        defaultDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates[0]) {
                // 체크인 날짜가 선택되면, 체크아웃 캘린더의 최소 날짜를 체크인 다음날로 설정
                const nextDay = new Date(selectedDates[0]);
                nextDay.setDate(nextDay.getDate() + 1);
                fpCheckout.set('minDate', nextDay);

                // 체크인 날짜 선택 시 체크아웃 날짜를 자동으로 다음날로 설정
                fpCheckout.setDate(nextDay, true);
            }
        }
    });

    // --- 예약 URL 생성 및 이동 함수 ---
    function handleBooking(event) {
        event.preventDefault(); // a 태그나 button의 기본 동작 방지
        const checkinDate = checkinInput.value;
        const checkoutDate = checkoutInput.value;
        const yanoljaUrl = `https://nol.yanolja.com/stay/domestic/3008795?checkInDate=${checkinDate}&checkOutDate=${checkoutDate}&adultCount=2`;
        window.open(yanoljaUrl, '_blank'); // 새 탭에서 야놀자 예약 페이지 열기
    }

    // 헤더의 'RESERVATION' 버튼과 검색 바의 'SEARCH' 버튼에 이벤트 리스너 추가
    document.querySelector('.btn-book').addEventListener('click', handleBooking);
    document.querySelector('.btn-search').addEventListener('click', handleBooking);

    // --- 객실 상세 모달 팝업 ---
    const modal = document.getElementById('room-modal');
    if (modal) {
        const modalMainImg = modal.querySelector('.modal-main-img');
        const modalThumbList = modal.querySelector('.modal-thumb-list');
        const modalTitle = modal.querySelector('.modal-title');
        const modalDesc = modal.querySelector('.modal-desc');
        const modalFeaturesList = modal.querySelector('.modal-features ul');
        const btnClose = modal.querySelector('.btn-close');
        const overlay = modal.querySelector('.modal-overlay');
 
        // 모달 열기
        document.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
 
                // 클릭한 버튼의 부모 요소(카드)에서 정보 가져오기
                const card = this.closest('.room-card');
                const title = card.querySelector('h4').innerText;
                const desc = this.getAttribute('data-detail'); // 버튼에 저장된 상세 설명
 
                // data-images 속성에서 이미지 목록 가져오기
                const imagesAttr = this.getAttribute('data-images');
                let images = [];
                try {
                    images = JSON.parse(imagesAttr);
                } catch (err) {
                    // 파싱 실패 시, 카드 이미지 하나만 사용
                    images.push(card.querySelector('.room-img img').src);
                }

                // data-amenities 속성에서 편의시설 목록 가져오기
                const amenitiesAttr = this.getAttribute('data-amenities');
                let amenities = [];
                try {
                    amenities = JSON.parse(amenitiesAttr);
                } catch (err) {
                    amenities = ["무료 Wi-Fi", "기본 어메니티"]; // 기본값
                }
 
                // 모달 내용 채우기
                modalTitle.innerText = title;
                modalDesc.innerText = desc;

                // 편의시설 목록 생성
                if (modalFeaturesList) {
                    modalFeaturesList.innerHTML = '';
                    amenities.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        modalFeaturesList.appendChild(li);
                    });
                }
 
                // 갤러리 설정
                modalThumbList.innerHTML = ''; // 이전 썸네일 초기화
                if (images && images.length > 0) {
                    modalMainImg.src = images[0]; // 메인 이미지 설정
 
                    images.forEach((imgSrc, index) => {
                        const thumb = document.createElement('img');
                        thumb.src = imgSrc;
                        thumb.alt = `${title} thumbnail ${index + 1}`;
                        thumb.classList.add('modal-thumb');
                        if (index === 0) {
                            thumb.classList.add('active');
                        }
 
                        thumb.addEventListener('click', function() {
                            modalMainImg.src = this.src;
                            modalThumbList.querySelector('.active')?.classList.remove('active');
                            this.classList.add('active');
                        });
 
                        modalThumbList.appendChild(thumb);
                    });
                }
 
                // 모달 표시
                modal.classList.add('show');
                document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
            });
        });
 
        // 모달 닫기 함수
        const closeModal = () => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        };
 
        btnClose.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
    }

    // --- 주변시설 가로 스크롤 버튼 ---
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