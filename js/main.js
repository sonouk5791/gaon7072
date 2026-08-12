document.addEventListener('DOMContentLoaded', () => {

    // Migration: Replace old brand name references and update address/service areas in localStorage
    try {
        const rawSettings = localStorage.getItem('gaon_settings');
        let settings = rawSettings ? JSON.parse(rawSettings) : {};
        let changed = false;
        
        if (settings.agencyName === '가온' || settings.agencyName === '가온방문요양/방문목욕' || !settings.agencyName) {
            settings.agencyName = '가온복지센터';
            changed = true;
        }
        
        if (settings.address !== '전북특별자치도 부안군 부안읍 용계길 13번지 2호') {
            settings.address = '전북특별자치도 부안군 부안읍 용계길 13번지 2호';
            changed = true;
        }
        
        if (settings.mapAddress !== '전북특별자치도 부안군 부안읍 용계길 13번지 2호') {
            settings.mapAddress = '전북특별자치도 부안군 부안읍 용계길 13번지 2호';
            changed = true;
        }
        
        const targetAreas = '부안읍\n주산면\n동진면\n행안면\n계화면\n보안면\n변산면\n진서면\n백산면\n상서면\n하서면\n줄포면';
        if (settings.serviceAreas !== targetAreas) {
            settings.serviceAreas = targetAreas;
            changed = true;
        }
        if (!settings.hasClearedExamples) {
            settings.reviews = "[]";
            settings.gallery = "[]";
            settings.hasClearedExamples = true;
            changed = true;
        }
        if (settings.hoursWeekday === '09:00 ~ 18:00 (이후 당직 연결)' || !settings.hoursWeekday) {
            settings.hoursWeekday = '09:00 ~ 17:00 (이후 기관장 번호로 연결)';
            changed = true;
        }
        
        for (let key in settings) {
            if (typeof settings[key] === 'string') {
                const original = settings[key];
                let replaced = original
                    .replace(/가온방문요양\/방문목욕/g, '가온복지센터')
                    .replace(/가온이/g, '가온복지센터가')
                    .replace(/가온은/g, '가온복지센터는')
                    .replace(/가온의/g, '가온복지센터의')
                    .replace(/가온에는/g, '가온복지센터에는');
                
                if (replaced !== original) {
                    settings[key] = replaced;
                    changed = true;
                }
            }
        }
        if (changed || !rawSettings) {
            localStorage.setItem('gaon_settings', JSON.stringify(settings));
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }

    /* ==========================================================================
       0. Load Site Configurations from LocalStorage
       ========================================================================== */
    function loadSiteSettings() {
        const settings = JSON.parse(localStorage.getItem('gaon_settings')) || {};

        // Shared HTML escape helper
        const escapeHtml = (str) => String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // 기관명
        const footerAgencyName = document.getElementById('footerAgencyName');
        if (footerAgencyName) footerAgencyName.textContent = settings.agencyName || '가온복지센터';
        
        // 대표자명
        const footerOwner = document.getElementById('footerOwner');
        if (footerOwner) footerOwner.textContent = settings.owner || '';
        
        // 장기요양기관 지정번호
        const footerDesignation = document.getElementById('footerDesignation');
        if (footerDesignation) footerDesignation.textContent = settings.designation || '';
        
        // 사업자등록번호
        const footerBizNumber = document.getElementById('footerBizNumber');
        if (footerBizNumber) footerBizNumber.textContent = settings.bizNumber || '';
        
        // 주소
        const footerAddress = document.getElementById('footerAddress');
        if (footerAddress) footerAddress.textContent = settings.address || '';
        
        // 전화번호
        const phone = settings.phone || '02-1234-5678';
        const headerPhone = document.querySelector('#headerPhone span');
        if (headerPhone) headerPhone.textContent = phone;
        
        const headerPhoneLink = document.getElementById('headerPhone');
        if (headerPhoneLink) headerPhoneLink.setAttribute('href', phone ? 'tel:' + phone : '#');
        
        const footerPhone = document.getElementById('footerPhone');
        if (footerPhone) footerPhone.textContent = phone;
        
        const floatingCall = document.getElementById('floatingCall');
        if (floatingCall) floatingCall.setAttribute('href', phone ? 'tel:' + phone : '#');

        // 브랜드 슬로건
        const footerSlogan = document.getElementById('footerSlogan');
        if (footerSlogan) footerSlogan.textContent = settings.slogan || '내 부모님처럼, 사랑과 정성을 더해 어르신의 따뜻한 내일에 동행합니다.';
        
        // SNS 링크
        const footerSnsBlog = document.getElementById('footerSnsBlog');
        if (footerSnsBlog) footerSnsBlog.setAttribute('href', settings.snsBlog || '#');
        
        const footerSnsKakao = document.getElementById('footerSnsKakao');
        if (footerSnsKakao) footerSnsKakao.setAttribute('href', settings.snsKakao || '#');
        
        const footerSnsYoutube = document.getElementById('footerSnsYoutube');
        if (footerSnsYoutube) footerSnsYoutube.setAttribute('href', settings.snsYoutube || '#');
        
        // 평일 운영시간
        const footerHoursWeekday = document.getElementById('footerHoursWeekday');
        if (footerHoursWeekday) footerHoursWeekday.textContent = settings.hoursWeekday || '09:00 ~ 17:00 (이후 기관장 번호로 연결)';
        
        // 주말/공휴일 운영시간
        const footerHoursWeekend = document.getElementById('footerHoursWeekend');
        if (footerHoursWeekend) footerHoursWeekend.textContent = settings.hoursWeekend || '24시간 전화 상담 대기';
        
        // 팩스
        const footerFax = document.getElementById('footerFax');
        if (footerFax) footerFax.textContent = settings.fax || '02-1234-5679';
        
        // 이메일
        const footerEmail = document.getElementById('footerEmail');
        if (footerEmail) footerEmail.textContent = settings.email || 'gaoncare@email.com';

        // 기관장 인사말 설정 로드
        const greetingTitle = document.getElementById('greetingTitle');
        let titleText = settings.greetingTitle || '어르신의 행복한 노후<br>가온복지센터가 든든한 동반자가 되겠습니다.';
        if (titleText === '어르신의 행복한 노후, 가온복지센터가 든든한 동반자가 되겠습니다.') {
            titleText = '어르신의 행복한 노후<br>가온복지센터가 든든한 동반자가 되겠습니다.';
        }
        if (greetingTitle) greetingTitle.innerHTML = titleText.replace(/\n/g, '<br>');
        
        const greetingPosition = document.getElementById('greetingPosition');
        if (greetingPosition) greetingPosition.textContent = settings.greetingPosition || '센터장';
        
        const greetingDirectorName = document.getElementById('greetingDirectorName');
        if (greetingDirectorName) greetingDirectorName.textContent = settings.greetingDirectorName || settings.owner || '홍길동';
        
        const greetingText = document.getElementById('greetingText');
        if (greetingText) {
            const defaultGreeting = `안녕하십니까?\n가온복지센터 홈페이지를 찾아주신 어르신과 보호자 가족 여러분께 진심으로 감사드립니다.\n\n우리의 부모님들은 한평생 가족을 위해 헌신하며 땀 흘려 오셨습니다. 이제 그 따뜻한 헌신에 보답하고자, 가온복지센터는 내 부모님을 모시는 정성스러운 마음과 존경의 예를 더해 어르신들의 손을 잡고 동행하고자 합니다.\n\n단순한 신체활동과 가사 지원을 넘어, 어르신들이 살아가시는 삶의 터전에서 주체적이고 편안한 노후를 보내실 수 있도록 전문성과 정성을 담아 돌봄을 제공하겠습니다. 또한 돌봄의 무게로 지친 보호자님들의 마음에 깊은 위로가 되고 든든한 휴식처가 되어 드릴 것을 약속드립니다.\n\n어르신의 미소가 가온복지센터의 보람입니다. 늘 한결같은 정성과 신뢰로 곁에 머물겠습니다. 감사합니다.`;
            const rawContent = settings.greetingContent !== undefined ? settings.greetingContent : defaultGreeting;
            const paragraphs = rawContent.split(/\n+/).filter(p => p.trim() !== '');
            greetingText.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
        }

        // 기관 연혁 로드 및 렌더링
        const historyTimeline = document.getElementById('historyTimeline');
        if (historyTimeline) {
            const defaultHistory = `2026.03 - 가온복지센터 설립\n2026.05 - 국민건강보험공단 노인장기요양기관 지정\n2026.08 - 어르신 밀착 정서 케어 및 복지용구 연계 서비스 도입`;
            const rawHistory = settings.historyText !== undefined ? settings.historyText : defaultHistory;
            const lines = rawHistory.split('\n').filter(line => line.trim() !== '');
            

            let html = '';
            lines.forEach(line => {
                const separatorIdx = line.indexOf('-');
                let dateStr = '';
                let descStr = line;
                
                if (separatorIdx !== -1) {
                    dateStr = line.substring(0, separatorIdx).trim();
                    descStr = line.substring(separatorIdx + 1).trim();
                }
                
                html += `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            ${dateStr ? `<span class="timeline-date">${escapeHtml(dateStr)}</span>` : ''}
                            <span class="timeline-desc">${escapeHtml(descStr)}</span>
                        </div>
                    </div>
                `;
            });
            historyTimeline.innerHTML = html;
        }

        // ① 이용자 후기 렌더링
        const reviewsGrid = document.getElementById('reviewsGrid');
        if (reviewsGrid) {
            const defaultReviews = [];
            let reviewsData;
            try { reviewsData = settings.reviews ? JSON.parse(settings.reviews) : defaultReviews; }
            catch (e) { reviewsData = defaultReviews; }

            const reviewsSection = document.getElementById('reviews');
            const reviewsNavLink = document.querySelector('a[href="#reviews"]');

            if (reviewsData.length === 0) {
                if (reviewsSection) reviewsSection.style.display = 'none';
                if (reviewsNavLink) {
                    const li = reviewsNavLink.closest('li');
                    if (li) li.style.display = 'none';
                }
            } else {
                if (reviewsSection) reviewsSection.style.display = 'block';
                if (reviewsNavLink) {
                    const li = reviewsNavLink.closest('li');
                    if (li) li.style.display = 'block';
                }

                reviewsGrid.innerHTML = reviewsData.map(r => {
                    const stars = parseInt(r.stars) || 5;
                    const starsHtml = Array.from({length: 5}, (_, i) =>
                        `<i class="fa-solid fa-star${i >= stars ? ' empty' : ''}"></i>`).join('');
                    return `
                        <div class="review-card">
                            <span class="review-quote">"</span>
                            <div class="review-stars">${starsHtml}</div>
                            <p class="review-text">${escapeHtml(r.text || '')}</p>
                            <div class="review-author">
                                <div class="review-avatar"><i class="fa-solid fa-user"></i></div>
                                <div>
                                    <div class="review-name">${escapeHtml(r.name || '')}</div>
                                    <div class="review-relation">${escapeHtml(r.relation || '')}</div>
                                </div>
                            </div>
                        </div>`;
                }).join('');
            }
        }

        // ② 갤러리 렌더링
        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid) {
            const defaultGallery = [];
            let galleryData;
            try { galleryData = settings.gallery ? JSON.parse(settings.gallery) : defaultGallery; }
            catch (e) { galleryData = defaultGallery; }

            const gallerySection = document.getElementById('gallery');
            const galleryNavLink = document.querySelector('a[href="#gallery"]');

            if (galleryData.length === 0) {
                if (gallerySection) gallerySection.style.display = 'none';
                if (galleryNavLink) {
                    const li = galleryNavLink.closest('li');
                    if (li) li.style.display = 'none';
                }
            } else {
                if (gallerySection) gallerySection.style.display = 'block';
                if (galleryNavLink) {
                    const li = galleryNavLink.closest('li');
                    if (li) li.style.display = 'block';
                }

                galleryGrid.innerHTML = galleryData.map(g => {
                    if (g.url && g.url.trim()) {
                        return `
                            <div class="gallery-item">
                                <img src="${escapeHtml(g.url)}" alt="${escapeHtml(g.caption || '갤러리 사진')}" loading="lazy"
                                     onerror="this.parentElement.innerHTML='<div class=\\'gallery-placeholder\\'><i class=\\'fa-solid fa-image\\'></i><span>이미지 로드 실패</span></div>'">
                                <div class="gallery-overlay">
                                    <span class="gallery-caption">${escapeHtml(g.caption || '')}</span>
                                </div>
                            </div>`;
                    } else {
                        return `
                            <div class="gallery-item">
                                <div class="gallery-placeholder">
                                    <i class="fa-solid fa-image"></i>
                                    <span>${escapeHtml(g.caption || '사진')}</span>
                                </div>
                            </div>`;
                    }
                }).join('');
            }
        }

        // ③ 지도 및 서비스 지역 렌더링
        const mapEmbed = document.getElementById('mapEmbed');
        const mapAddressText = document.getElementById('mapAddressText');
        const serviceAreaTags = document.getElementById('serviceAreaTags');
        const defaultAddress = '전북특별자치도 부안군 부안읍 용계길 13번지 2호';
        const mapAddress = settings.mapAddress || defaultAddress;
        if (mapAddressText) mapAddressText.textContent = mapAddress;
        if (mapEmbed) {
            const encodedAddr = encodeURIComponent(mapAddress);
            mapEmbed.src = `https://maps.google.com/maps?q=${encodedAddr}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }
        if (serviceAreaTags) {
            const defaultAreas = '부안읍\n주산면\n동진면\n행안면\n계화면\n보안면\n변산면\n진서면\n백산면\n상서면\n하서면\n줄포면';
            const rawAreas = settings.serviceAreas || defaultAreas;
            serviceAreaTags.innerHTML = rawAreas.split('\n')
                .map(a => a.trim()).filter(a => a)
                .map(a => `<span class="area-tag">${escapeHtml(a)}</span>`).join('');
        }

        // ④ FAQ 렌더링
        window.renderFaqList = function() {
            const faqList = document.getElementById('faqList');
            if (!faqList) return;
            const currentSettings = JSON.parse(localStorage.getItem('gaon_settings')) || {};

            const defaultFaq = [
                { 
                    q: '요양보호사 선생님이 어르신과 맞지 않으면 변경이 가능한가요?', 
                    a: '네, 물론입니다. 가온복지센터는 어르신과 요양보호사 간의 정서적 유대감과 매칭 상태를 가장 중요하게 생각합니다. 서비스를 이용하시다가 불편하시거나 성향이 맞지 않는다고 판단되시면, 언제든 센터의 담당 사회복지사에게 말씀해 주세요. 추가 비용 없이 신속하고 원만하게 다른 요양보호사 선생님으로 재매칭해 드립니다.' 
                },
                { 
                    q: '요양 서비스 도중 사고나 부상이 발생하면 어떻게 처리되나요?', 
                    a: '가온복지센터의 모든 요양보호사 선생님들은 100% 전문인 배상책임보험에 가입되어 있습니다. 혹시라도 돌봄 서비스 진행 중 어르신께 안전사고나 재산상 손해가 발생할 경우, 책임지고 가입된 보험을 통해 전액 신속히 보상 및 처리해 드립니다. 안심하고 신뢰하며 서비스를 맡기셔도 좋습니다.' 
                },
                { 
                    q: '남성 어르신인데 남성 요양보호사 선생님께 서비스를 받을 수 있나요?', 
                    a: '현재 전국의 요양보호사 인력 중 남성 요양보호사의 비율이 매우 낮아, 남성 요양보호사 매칭은 현실적으로 쉽지 않으며 대기 시간이 오래 걸리거나 즉각적인 매칭이 어려울 수 있습니다. 사전에 센터로 문의해 주시면 당시 인력 현황을 확인하여 최대한 안내와 조정을 도와드리겠습니다.' 
                },
                { 
                    q: '요양등급이 아직 없는데 가온복지센터 서비스를 즉시 이용할 수 있나요?', 
                    a: '국가지원(노인장기요양보험)을 통한 방문요양 및 방문목욕 서비스는 장기요양등급을 판정받으신 어르신만 이용이 가능하므로, 등급 없이는 즉각적인 국가지원 서비스 이용이 불가능합니다. 다만, 가온복지센터에서 등급 신청 서류 준비 및 신청 상담 등을 상세히 지원해 드리고 있으니, 등급이 없으시더라도 먼저 센터로 연락 주시면 등급 신청 절차를 친절히 안내해 드리겠습니다.' 
                },
                { 
                    q: '방문요양 한 달 예상 서비스 비용은 대략 어떻게 되나요?', 
                    a: '국민건강보험공단 지원을 통해 본인부담금을 크게 줄일 수 있으며, 어르신의 장기요양 등급과 소득 수준(감경 여부)에 따라 본인이 실제 부담하시는 금액이 달라집니다. 홈페이지 하단의 지원금 계산기를 통해 모의 조회를 해보시거나, 정확한 비용은 센터로 전화 문의 주시면 맞춤 안내해 드리겠습니다.' 
                }
            ];

            let faqData;
            try { 
                let storedFaq = currentSettings.faq ? JSON.parse(currentSettings.faq) : defaultFaq; 
                faqData = storedFaq
                    .filter(item => !item.q.includes('주말') && !item.q.includes('공휴일'))
                    .map(item => {
                        if (item.q.includes('남성 요양보호사')) {
                            item.a = '현재 전국의 요양보호사 인력 중 남성 요양보호사의 비율이 매우 낮아, 남성 요양보호사 매칭은 현실적으로 쉽지 않으며 대기 시간이 오래 걸리거나 즉각적인 매칭이 어려울 수 있습니다. 사전에 센터로 문의해 주시면 당시 인력 현황을 확인하여 최대한 안내와 조정을 도와드리겠습니다.';
                        }
                        if (item.q.includes('요양등급이 아직 없는데')) {
                            item.a = '국가지원(노인장기요양보험)을 통한 방문요양 및 방문목욕 서비스는 장기요양등급을 판정받으신 어르신만 이용이 가능하므로, 등급 없이는 즉각적인 국가지원 서비스 이용이 불가능합니다. 다만, 가온복지센터에서 등급 신청 서류 준비 및 신청 상담 등을 상세히 지원해 드리고 있으니, 등급이 없으시더라도 먼저 센터로 연락 주시면 등급 신청 절차를 친절히 안내해 드리겠습니다.';
                        }
                        return item;
                    });
            } catch (e) { 
                faqData = defaultFaq; 
            }

            faqList.innerHTML = faqData.map((item, i) => {
                let badgeHtml = '';
                if (item.isUserCreated) {
                    const isAnswered = item.a && item.a !== '답변을 준비 중입니다.' && item.a.trim() !== '';
                    badgeHtml = isAnswered 
                        ? `<span class="qna-user-badge completed">답변완료</span>` 
                        : `<span class="qna-user-badge waiting">답변대기</span>`;
                    
                    const writerName = item.writer || '보호자';
                    const maskedWriter = writerName.length > 2 
                        ? writerName.charAt(0) + '○' + writerName.charAt(writerName.length - 1) 
                        : writerName.charAt(0) + '○';
                    badgeHtml += `<span class="qna-writer-tag">${escapeHtml(maskedWriter)} 님</span>`;
                }

                return `
                <div class="faq-item" id="faqItem${i}">
                    <button class="faq-question" onclick="toggleFaq(${i})" aria-expanded="false">
                        <span class="faq-q-text">
                            <span class="faq-q-badge">Q</span>
                            <span class="faq-q-label">${escapeHtml(item.q || '')} ${badgeHtml}</span>
                        </span>
                        <i class="fa-solid fa-chevron-down faq-toggle-icon"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-a-text">
                            <span class="faq-a-badge">A</span>
                            <span class="faq-a-label">${escapeHtml(item.a || '답변을 준비 중입니다.').replace(/\n/g, '<br>')}</span>
                        </div>
                    </div>
                </div>`;
            }).join('');

            // Open first FAQ by default
            const firstItem = document.getElementById('faqItem0');
            if (firstItem) {
                document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
                firstItem.classList.add('active');
            }
        };
        renderFaqList();
    }
    loadSiteSettings();

    // FAQ Accordion Toggle
    window.toggleFaq = function(index) {
        const item = document.getElementById(`faqItem${index}`);
        if (!item) return;
        const isActive = item.classList.contains('active');
        // Close all
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
        // Open clicked if it was closed
        if (!isActive) item.classList.add('active');
    };


    /* ==========================================================================
       1. Mobile Navigation & Header Scroll Behavior
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const header = document.querySelector('.main-header');
    const navLinks = document.querySelectorAll('.nav-link, .nav-link-btn');

    // Menu Toggle Action
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Hamburger Animation
            const spans = menuToggle.querySelectorAll('span');
            if (menuToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
                document.body.style.overflow = 'hidden'; // Lock background scroll
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
                document.body.style.overflow = 'initial';
            }
        });

        // Close menu when clicking link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
                document.body.style.overflow = 'initial';
            });
        });
    }

    // Header Shadow on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.height = '70px';
            header.style.boxShadow = '0 10px 30px rgba(58, 155, 125, 0.12)';
        } else {
            header.style.height = '80px';
            header.style.boxShadow = 'var(--shadow-sm)';
        }
    });


    /* ==========================================================================
       2. Scroll-Triggered Animations & Back to Top
       ========================================================================== */
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Intersection Observer for Animation
    const animatedElements = document.querySelectorAll('.service-card, .process-step, .strength-card, .calculator-box, .consultation-form-box');
    
    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // If it is the process roadmap, fill the connecting line
                if (entry.target.classList.contains('process-step')) {
                    const line = document.querySelector('.process-line');
                    if (line) line.classList.add('active');
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        // Set initial style for animation
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
        observer.observe(el);
    });


    /* ==========================================================================
       3. Government Subsidy Calculator Logic
       ========================================================================== */
    const levelSelect = document.getElementById('elderlyLevel');
    const ratioSelect = document.getElementById('subsidyRatio');
    const daysSlider = document.getElementById('weeklyDays');
    const daysValueDisplay = document.getElementById('weeklyDaysValue');

    const totalLimitDisplay = document.getElementById('totalLimitVal');
    const govSupportDisplay = document.getElementById('govSupportVal');
    const outOfPocketDisplay = document.getElementById('outOfPocketVal');

    // 2026 Standard Korean Home Care limits by level (Load from LocalStorage if exists)
    let limitRates = {
        '1': 1885000,
        '2': 1690000,
        '3': 1417200,
        '4': 1306200,
        '5': 1121400,
        '0': 0
    };
    let baseDailyCost = 55000;

    const calcSettings = JSON.parse(localStorage.getItem('gaon_calculator_settings'));
    if (calcSettings) {
        if (calcSettings.rates) limitRates = { ...limitRates, ...calcSettings.rates };
        if (calcSettings.baseDailyCost) baseDailyCost = parseInt(calcSettings.baseDailyCost);
    }
    const avgWeeksPerMonth = 4.34;

    function calculateSubsidy() {
        const level = levelSelect.value;
        const ratio = parseFloat(ratioSelect.value) / 100;
        const days = parseInt(daysSlider.value);

        daysValueDisplay.textContent = `주 ${days}일`;

        const maxLimit = limitRates[level];
        
        if (level === '0') {
            // No class/level yet
            totalLimitDisplay.textContent = '등급 미보유';
            govSupportDisplay.textContent = '0원';
            outOfPocketDisplay.innerHTML = '<span style="color: #e53e3e; font-size: 0.95rem; font-weight: 600; display: block; line-height: 1.4;">등급 없이는 국가지원 불가<br>(등급 신청 상담 필요)</span>';
            return;
        }

        outOfPocketDisplay.style.fontSize = '1.45rem';

        // Calculate expected cost: Days/week * Weeks/month * Daily Cost
        const calculatedCost = Math.round(days * avgWeeksPerMonth * baseDailyCost);
        
        // Final service cost can't exceed the monthly government limit
        const finalCost = Math.min(calculatedCost, maxLimit);

        // Out-of-pocket & Government support
        const outOfPocket = Math.round(finalCost * ratio);
        const govSupport = finalCost - outOfPocket;

        // Display with comma formatting
        totalLimitDisplay.textContent = maxLimit.toLocaleString() + '원';
        govSupportDisplay.textContent = govSupport.toLocaleString() + '원';
        outOfPocketDisplay.textContent = outOfPocket.toLocaleString() + '원';
    }

    if (levelSelect && ratioSelect && daysSlider) {
        levelSelect.addEventListener('change', calculateSubsidy);
        ratioSelect.addEventListener('change', calculateSubsidy);
        daysSlider.addEventListener('input', calculateSubsidy);
        
        // Initial Calculation
        calculateSubsidy();
    }


    /* ==========================================================================
       4. Consultation Form Auto-Formatting & Verification
       ========================================================================== */
    const form = document.getElementById('careConsultForm');
    const inputPhone = document.getElementById('userPhone');
    const inputName = document.getElementById('userName');
    const selectAge = document.getElementById('elderlyAge');
    const checkboxAgree = document.getElementById('privacyAgree');

    // Auto-Format Phone Input (e.g., 010-1234-5678)
    if (inputPhone) {
        inputPhone.addEventListener('input', (e) => {
            let number = e.target.value.replace(/[^0-9]/g, '');
            let formatted = '';

            if (number.length < 4) {
                formatted = number;
            } else if (number.length < 7) {
                formatted = number.substr(0, 3) + '-' + number.substr(3);
            } else if (number.length < 11) {
                formatted = number.substr(0, 3) + '-' + number.substr(3, 3) + '-' + number.substr(6);
            } else {
                formatted = number.substr(0, 3) + '-' + number.substr(3, 4) + '-' + number.substr(7, 4);
            }

            e.target.value = formatted.substr(0, 13); // Maximum size limit
        });
    }

    // Input-specific verification states
    function showValidationError(element, errorId, show) {
        const parent = element.closest('.form-group');
        if (show) {
            parent.classList.add('has-error');
        } else {
            parent.classList.remove('has-error');
        }
    }

    // Live validation when inputs change
    if (inputName) {
        inputName.addEventListener('blur', () => {
            showValidationError(inputName, 'nameError', inputName.value.trim().length < 2);
        });
    }

    if (inputPhone) {
        inputPhone.addEventListener('blur', () => {
            const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
            showValidationError(inputPhone, 'phoneError', !phoneRegex.test(inputPhone.value));
        });
    }

    if (selectAge) {
        selectAge.addEventListener('change', () => {
            showValidationError(selectAge, 'ageError', selectAge.value === '');
        });
    }

    if (checkboxAgree) {
        checkboxAgree.addEventListener('change', () => {
            showValidationError(checkboxAgree, 'privacyError', !checkboxAgree.checked);
        });
    }


    /* ==========================================================================
       5. Form Submission Simulation & Modal Dialog
       ========================================================================== */
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate all inputs before submitting
            const isNameValid = inputName.value.trim().length >= 2;
            const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
            const isPhoneValid = phoneRegex.test(inputPhone.value);
            const isAgeValid = selectAge.value !== '';
            const isPrivacyValid = checkboxAgree.checked;

            showValidationError(inputName, 'nameError', !isNameValid);
            showValidationError(inputPhone, 'phoneError', !isPhoneValid);
            showValidationError(selectAge, 'ageError', !isAgeValid);
            showValidationError(checkboxAgree, 'privacyError', !isPrivacyValid);

            if (!isNameValid || !isPhoneValid || !isAgeValid || !isPrivacyValid) {
                // Focus on first invalid element
                if (!isNameValid) inputName.focus();
                else if (!isPhoneValid) inputPhone.focus();
                else if (!isAgeValid) selectAge.focus();
                return;
            }

            // If validated, show loader button
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.classList.add('loading');

            // Gather check list
            const checkedServices = [];
            const checkboxes = form.querySelectorAll('input[name="services"]:checked');
            checkboxes.forEach(cb => {
                checkedServices.push(cb.value);
            });

            // Simulate server request delay
            setTimeout(() => {
                submitBtn.classList.remove('loading');

                // Save to LocalStorage
                const leadData = {
                    id: Date.now(),
                    name: inputName.value,
                    phone: inputPhone.value,
                    age: selectAge.value,
                    services: checkedServices,
                    message: document.getElementById('userMessage').value || '',
                    status: '대기중',
                    date: new Date().toLocaleString('ko-KR')
                };
                const existingLeads = JSON.parse(localStorage.getItem('gaon_consultations')) || [];
                existingLeads.unshift(leadData);
                localStorage.setItem('gaon_consultations', JSON.stringify(existingLeads));

                // Set response content in success modal
                document.getElementById('modalResName').textContent = inputName.value;
                document.getElementById('modalResPhone').textContent = inputPhone.value;
                document.getElementById('modalResServices').textContent = checkedServices.join(', ') || '없음';

                // Display success modal
                successModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Stop background scroll

                // Reset form values
                form.reset();
                calculateSubsidy(); // Reset calculator values to default
            }, 1200);
        });
    }

    // Close Modal Handler
    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
            document.body.style.overflow = 'initial';
        });

        // Close on background overlay click
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
                document.body.style.overflow = 'initial';
            }
        });
    }

    /* ==========================================================================
       6. Admin Redirect Verification Modal Dialog
       ========================================================================== */
    const adminLink = document.getElementById('adminLink');
    const adminPasswordModal = document.getElementById('adminPasswordModal');
    const cancelAdminBtn = document.getElementById('cancelAdminBtn');
    const submitAdminBtn = document.getElementById('submitAdminBtn');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const adminPasswordError = document.getElementById('adminPasswordError');

    if (adminLink && adminPasswordModal) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            adminPasswordInput.value = '';
            adminPasswordError.style.display = 'none';
            adminPasswordModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            adminPasswordInput.focus();
        });
    }

    function verifyAdminPassword() {
        const password = adminPasswordInput.value;
        if (password === '1234') {
            adminPasswordModal.classList.remove('active');
            document.body.style.overflow = 'initial';
            window.location.href = 'admin.html';
        } else {
            adminPasswordError.style.display = 'block';
            adminPasswordInput.focus();
            adminPasswordInput.select();
        }
    }

    if (submitAdminBtn) {
        submitAdminBtn.addEventListener('click', verifyAdminPassword);
    }

    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyAdminPassword();
            }
        });
    }

    if (cancelAdminBtn && adminPasswordModal) {
        cancelAdminBtn.addEventListener('click', () => {
            adminPasswordModal.classList.remove('active');
            document.body.style.overflow = 'initial';
        });

        adminPasswordModal.addEventListener('click', (e) => {
            if (e.target === adminPasswordModal) {
                adminPasswordModal.classList.remove('active');
                document.body.style.overflow = 'initial';
            }
        });
    }

});
