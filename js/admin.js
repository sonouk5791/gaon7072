document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Tab Navigation Logic
       ========================================================================== */
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContent = document.getElementById(tab.getAttribute('data-tab'));
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       2. Consultation Requests Table Management
       ========================================================================== */
    function loadConsultations() {
        const tableBody = document.getElementById('consultationTableBody');
        if (!tableBody) return;

        const consultations = JSON.parse(localStorage.getItem('gaon_consultations')) || [];

        if (consultations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>접수된 상담 신청 내역이 없습니다.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = consultations.map((item, index) => {
            const dateStr = item.date || '-';
            const nameStr = item.name || '-';
            const phoneStr = item.phone || '-';
            const ageStr = item.age ? `${item.age}세 이상` : '-';
            const servicesStr = Array.isArray(item.services) ? item.services.join(', ') : (item.services || '-');
            const messageStr = item.message || '-';
            const statusStr = item.status || '대기중';

            const statusClass = statusStr === '상담완료' ? 'completed' : 'waiting';

            return `
                <tr>
                    <td style="font-size: 0.85rem; color: #64748b;">${escapeHtml(dateStr)}</td>
                    <td style="font-weight: 700; color: #1e293b;">${escapeHtml(nameStr)}</td>
                    <td><a href="tel:${escapeHtml(phoneStr)}" style="color: #2563eb; font-weight: 600;">${escapeHtml(phoneStr)}</a></td>
                    <td>${escapeHtml(ageStr)}</td>
                    <td><span class="status-badge progress">${escapeHtml(servicesStr)}</span></td>
                    <td style="max-width: 200px; word-break: break-all; font-size: 0.88rem; color: #475569;">${escapeHtml(messageStr)}</td>
                    <td>
                        <select class="admin-select-sm" onchange="updateConsultStatus(${item.id}, this.value)">
                            <option value="대기중" ${statusStr === '대기중' ? 'selected' : ''}>⏳ 대기중</option>
                            <option value="상담완료" ${statusStr === '상담완료' ? 'selected' : ''}>✅ 상담완료</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn-admin-action btn-admin-danger" onclick="deleteConsultation(${item.id})">
                            <i class="fa-solid fa-trash"></i> 삭제
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Status Change
    window.updateConsultStatus = function(id, newStatus) {
        let consultations = JSON.parse(localStorage.getItem('gaon_consultations')) || [];
        consultations = consultations.map(item => {
            if (item.id === id) {
                item.status = newStatus;
            }
            return item;
        });
        localStorage.setItem('gaon_consultations', JSON.stringify(consultations));
        loadConsultations();
    };

    // Delete Consultation
    window.deleteConsultation = function(id) {
        if (!confirm('해당 상담 신청 기록을 삭제하시겠습니까?')) return;
        let consultations = JSON.parse(localStorage.getItem('gaon_consultations')) || [];
        consultations = consultations.filter(item => item.id !== id);
        localStorage.setItem('gaon_consultations', JSON.stringify(consultations));
        loadConsultations();
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    loadConsultations();


    /* ==========================================================================
       3. Calculator Settings Management (150분 이상 50,640원 및 210분 단가 포함)
       ========================================================================== */
    const DEFAULT_CALC_SETTINGS = {
        unitCosts: {
            visit30:  17450,
            visit60:  25320,
            visit90:  34120,
            visit120: 43430,
            visit150: 50640,
            visit180: 57020,
            visit210: 63530,
            visit240: 70080,
            bath:     88990
        },
        rates: {
            '1': 2512900,
            '2': 2331200,
            '3': 1528200,
            '4': 1409700,
            '5': 1208900,
            'cognitive': 658900
        }
    };

    function loadCalcSettings() {
        const saved = JSON.parse(localStorage.getItem('gaon_calculator_settings')) || DEFAULT_CALC_SETTINGS;
        const unitCosts = saved.unitCosts || DEFAULT_CALC_SETTINGS.unitCosts;
        const rates = saved.rates || DEFAULT_CALC_SETTINGS.rates;

        // Visit unit costs
        if (document.getElementById('costVisit30'))  document.getElementById('costVisit30').value  = unitCosts.visit30  || 17450;
        if (document.getElementById('costVisit60'))  document.getElementById('costVisit60').value  = unitCosts.visit60  || 25320;
        if (document.getElementById('costVisit90'))  document.getElementById('costVisit90').value  = unitCosts.visit90  || 34120;
        if (document.getElementById('costVisit120')) document.getElementById('costVisit120').value = unitCosts.visit120 || 43430;
        if (document.getElementById('costVisit150')) document.getElementById('costVisit150').value = unitCosts.visit150 || 50640; // 150분 이상
        if (document.getElementById('costVisit180')) document.getElementById('costVisit180').value = unitCosts.visit180 || 57020;
        if (document.getElementById('costVisit210')) document.getElementById('costVisit210').value = unitCosts.visit210 || 63530; // 210분 이상
        if (document.getElementById('costVisit240')) document.getElementById('costVisit240').value = unitCosts.visit240 || 70080;

        // Bath unit cost
        if (document.getElementById('costBath')) document.getElementById('costBath').value = unitCosts.bath || 88990;

        // Monthly limits
        if (document.getElementById('rateGrade1')) document.getElementById('rateGrade1').value = rates['1'] || 2512900;
        if (document.getElementById('rateGrade2')) document.getElementById('rateGrade2').value = rates['2'] || 2331200;
        if (document.getElementById('rateGrade3')) document.getElementById('rateGrade3').value = rates['3'] || 1528200;
        if (document.getElementById('rateGrade4')) document.getElementById('rateGrade4').value = rates['4'] || 1409700;
        if (document.getElementById('rateGrade5')) document.getElementById('rateGrade5').value = rates['5'] || 1208900;
        if (document.getElementById('rateGradeCognitive')) document.getElementById('rateGradeCognitive').value = rates['cognitive'] || 658900;
    }

    loadCalcSettings();

    // Save Calculator Settings
    const calcForm = document.getElementById('calcSettingsForm');
    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const settings = {
                unitCosts: {
                    visit30:  parseInt(document.getElementById('costVisit30')?.value)  || 17450,
                    visit60:  parseInt(document.getElementById('costVisit60')?.value)  || 25320,
                    visit90:  parseInt(document.getElementById('costVisit90')?.value)  || 34120,
                    visit120: parseInt(document.getElementById('costVisit120')?.value) || 43430,
                    visit150: parseInt(document.getElementById('costVisit150')?.value) || 50640, // 150분 저장
                    visit180: parseInt(document.getElementById('costVisit180')?.value) || 57020,
                    visit210: parseInt(document.getElementById('costVisit210')?.value) || 63530, // 210분 저장
                    visit240: parseInt(document.getElementById('costVisit240')?.value) || 70080,
                    bath:     parseInt(document.getElementById('costBath')?.value)     || 88990
                },
                rates: {
                    '1': parseInt(document.getElementById('rateGrade1')?.value) || 2512900,
                    '2': parseInt(document.getElementById('rateGrade2')?.value) || 2331200,
                    '3': parseInt(document.getElementById('rateGrade3')?.value) || 1528200,
                    '4': parseInt(document.getElementById('rateGrade4')?.value) || 1409700,
                    '5': parseInt(document.getElementById('rateGrade5')?.value) || 1208900,
                    'cognitive': parseInt(document.getElementById('rateGradeCognitive')?.value) || 658900
                }
            };

            localStorage.setItem('gaon_calculator_settings', JSON.stringify(settings));
            alert('✅ 이용료 계산기 단가 및 한도액 설정이 성공적으로 저장되었습니다!');
        });
    }

    // Reset Calculator Settings
    const resetCalcBtn = document.getElementById('resetCalcBtn');
    if (resetCalcBtn) {
        resetCalcBtn.addEventListener('click', () => {
            if (!confirm('이용료 계산기 설정을 2026년 표준 국민건강보험공단 고시 단가로 초기화하시겠습니까?')) return;
            localStorage.setItem('gaon_calculator_settings', JSON.stringify(DEFAULT_CALC_SETTINGS));
            loadCalcSettings();
            alert('🔄 기본 고시 단가로 초기화되었습니다.');
        });
    }


    /* ==========================================================================
       4. Agency Site Settings Management
       ========================================================================== */
    function loadSiteSettings() {
        const settings = JSON.parse(localStorage.getItem('gaon_settings')) || {};
        if (document.getElementById('agencyName')) document.getElementById('agencyName').value = settings.agencyName || '가온복지센터';
        if (document.getElementById('ownerName'))  document.getElementById('ownerName').value  = settings.owner || '최대웅';
        if (document.getElementById('phoneNum'))   document.getElementById('phoneNum').value   = settings.phone || '063-584-7072';
        if (document.getElementById('faxNum'))     document.getElementById('faxNum').value     = settings.fax || '063-584-7073';
        if (document.getElementById('emailAddr'))  document.getElementById('emailAddr').value  = settings.email || 'gaon7072@naver.com';
        if (document.getElementById('agencyAddress')) document.getElementById('agencyAddress').value = settings.address || '전북특별자치도 부안군 부안읍 용계길 13';
        if (document.getElementById('hoursWeekday')) document.getElementById('hoursWeekday').value = settings.hoursWeekday || '08:00 ~ 17:00 (17:00 이후 센터장 연결)';
    }

    loadSiteSettings();

    const siteForm = document.getElementById('siteSettingsForm');
    if (siteForm) {
        siteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let settings = JSON.parse(localStorage.getItem('gaon_settings')) || {};

            settings.agencyName = document.getElementById('agencyName').value;
            settings.owner      = document.getElementById('ownerName').value;
            settings.phone      = document.getElementById('phoneNum').value;
            settings.fax        = document.getElementById('faxNum').value;
            settings.email      = document.getElementById('emailAddr').value;
            settings.address    = document.getElementById('agencyAddress').value;
            settings.hoursWeekday = document.getElementById('hoursWeekday').value;

            localStorage.setItem('gaon_settings', JSON.stringify(settings));
            alert('✅ 기관 기본 설정이 성공적으로 저장되었습니다!');
        });
    }

});
