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
       3. Calculator Settings Management (150분 이상 50,640원 단가 포함)
       ========================================================================== */
    const DEFAULT_CALC_SETTINGS = {
        unitCosts: {
            visit30:  17450,
            visit60:  25320,
            visit90:  34120,
            visit120: 43430,
            visit150: 50640,
            visit180: 57020,
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
       4. FAQ / Q&A Management
       ========================================================================== */
    const DEFAULT_FAQ = [
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
            a: '국민건강보험공단 지원을 통해 본인부담금을 크게 줄일 수 있으며, 어르신의 장기요양 등급과 소득 수준(감경 여부)에 따라 본인이 실제 부담하시는 금액이 달라집니다. 홈페이지 하단의 이용료 계산기를 통해 모의 조회를 해보시거나, 정확한 비용은 센터로 전화 문의 주시면 맞춤 안내해 드리겠습니다.' 
        }
    ];

    let currentFaqList = [];
    let editingFaqIndex = null;

    function getStoredFaq() {
        const settings = JSON.parse(localStorage.getItem('gaon_settings')) || {};
        if (!settings.faq) return JSON.parse(JSON.stringify(DEFAULT_FAQ));
        try {
            return typeof settings.faq === 'string' ? JSON.parse(settings.faq) : settings.faq;
        } catch (e) {
            return JSON.parse(JSON.stringify(DEFAULT_FAQ));
        }
    }

    function saveFaqToStorage(list) {
        let settings = JSON.parse(localStorage.getItem('gaon_settings')) || {};
        settings.faq = JSON.stringify(list);
        localStorage.setItem('gaon_settings', JSON.stringify(settings));
    }

    function renderAdminFaq() {
        const container = document.getElementById('adminFaqContainer');
        const countBadge = document.getElementById('adminFaqCount');
        if (!container) return;

        if (countBadge) {
            countBadge.textContent = `총 ${currentFaqList.length}개 항목`;
        }

        if (currentFaqList.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; color: #94a3b8;">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; display: block; color: #cbd5e1;"></i>
                    <p style="font-weight: 600; font-size: 1rem;">등록된 질문이 없습니다. 상단에서 새로운 Q&A를 추가해 보세요.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = currentFaqList.map((item, idx) => {
            const isEditing = (editingFaqIndex === idx);

            if (isEditing) {
                return `
                <div class="admin-faq-item editing" style="background: #fff; border: 2px solid var(--color-primary); border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-weight: 800; color: var(--color-primary); font-size: 0.95rem;">
                            <i class="fa-solid fa-pen-to-square"></i> 항목 #${idx + 1} 수정 중
                        </span>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="btn-primary" onclick="saveEditFaq(${idx})" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 6px;">
                                <i class="fa-solid fa-check"></i> 수정 완료
                            </button>
                            <button type="button" class="btn-admin-action" onclick="cancelEditFaq()" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; background: #e2e8f0; color: #475569;">
                                취소
                            </button>
                        </div>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">질문 (Q)</label>
                        <input type="text" id="editFaqQ_${idx}" class="form-input" value="${escapeHtml(item.q || '')}" style="font-weight: 600;">
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">답변 (A)</label>
                        <textarea id="editFaqA_${idx}" class="form-input" rows="4" style="resize: vertical; font-family: inherit;">${escapeHtml(item.a || '')}</textarea>
                    </div>
                </div>`;
            }

            return `
            <div class="admin-faq-item" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; transition: all 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span style="background: var(--color-primary-light); color: var(--color-primary-dark); font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: 20px;">
                            #${idx + 1}
                        </span>
                        <strong style="font-size: 1.05rem; color: #1e293b; line-height: 1.4;">
                            <span style="color: #2563eb; margin-right: 4px;">Q.</span>${escapeHtml(item.q || '')}
                        </strong>
                    </div>
                    <div style="display: flex; gap: 6px; flex-shrink: 0;">
                        <button type="button" class="btn-admin-action" onclick="moveFaq(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} title="위로 이동" style="padding: 6px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px;">
                            <i class="fa-solid fa-arrow-up"></i>
                        </button>
                        <button type="button" class="btn-admin-action" onclick="moveFaq(${idx}, 1)" ${idx === currentFaqList.length - 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} title="아래로 이동" style="padding: 6px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px;">
                            <i class="fa-solid fa-arrow-down"></i>
                        </button>
                        <button type="button" class="btn-admin-action btn-admin-edit" onclick="startEditFaq(${idx})" title="수정" style="padding: 6px 12px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 6px; font-weight: 700;">
                            <i class="fa-solid fa-pen"></i> 수정
                        </button>
                        <button type="button" class="btn-admin-action btn-admin-danger" onclick="deleteFaq(${idx})" title="삭제" style="padding: 6px 10px; border-radius: 6px;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div style="background: #f8fafc; border-left: 3px solid var(--color-primary); padding: 12px 16px; border-radius: 0 8px 8px 0; color: #475569; font-size: 0.95rem; line-height: 1.6; margin-top: 8px;">
                    <span style="color: var(--color-primary); font-weight: 800; margin-right: 6px;">A.</span>${escapeHtml(item.a || '').replace(/\n/g, '<br>')}
                </div>
            </div>`;
        }).join('');
    }

    // Initialize FAQ List
    currentFaqList = getStoredFaq();
    renderAdminFaq();

    // Add FAQ Handler
    const addFaqForm = document.getElementById('addFaqForm');
    if (addFaqForm) {
        addFaqForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const qInput = document.getElementById('newFaqQ');
            const aInput = document.getElementById('newFaqA');

            const qVal = qInput?.value.trim();
            const aVal = aInput?.value.trim();

            if (!qVal || !aVal) {
                alert('질문과 답변 내용을 모두 입력해 주세요.');
                return;
            }

            currentFaqList.unshift({ q: qVal, a: aVal });
            saveFaqToStorage(currentFaqList);
            renderAdminFaq();

            qInput.value = '';
            aInput.value = '';
            alert('✅ 새로운 Q&A 질문이 성공적으로 등록되었습니다!');
        });
    }

    // Global Action Helpers for FAQ
    window.startEditFaq = function(index) {
        editingFaqIndex = index;
        renderAdminFaq();
    };

    window.cancelEditFaq = function() {
        editingFaqIndex = null;
        renderAdminFaq();
    };

    window.saveEditFaq = function(index) {
        const qVal = document.getElementById(`editFaqQ_${index}`)?.value.trim();
        const aVal = document.getElementById(`editFaqA_${index}`)?.value.trim();

        if (!qVal || !aVal) {
            alert('질문과 답변 내용을 모두 입력해 주세요.');
            return;
        }

        currentFaqList[index].q = qVal;
        currentFaqList[index].a = aVal;
        editingFaqIndex = null;

        saveFaqToStorage(currentFaqList);
        renderAdminFaq();
        alert('✅ 질문 내용이 수정되었습니다.');
    };

    window.deleteFaq = function(index) {
        if (!confirm(`'${currentFaqList[index].q}' 질문을 삭제하시겠습니까?`)) return;
        currentFaqList.splice(index, 1);
        if (editingFaqIndex === index) editingFaqIndex = null;
        saveFaqToStorage(currentFaqList);
        renderAdminFaq();
        alert('🗑️ 해당 질문이 삭제되었습니다.');
    };

    window.moveFaq = function(index, direction) {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= currentFaqList.length) return;

        const temp = currentFaqList[index];
        currentFaqList[index] = currentFaqList[targetIndex];
        currentFaqList[targetIndex] = temp;

        if (editingFaqIndex !== null) editingFaqIndex = null;
        saveFaqToStorage(currentFaqList);
        renderAdminFaq();
    };

    // Save All FAQ Button
    const saveAllFaqBtn = document.getElementById('saveAllFaqBtn');
    if (saveAllFaqBtn) {
        saveAllFaqBtn.addEventListener('click', () => {
            saveFaqToStorage(currentFaqList);
            alert('✅ Q&A 설정이 성공적으로 저장되었습니다! 홈페이지에 즉시 반영됩니다.');
        });
    }

    // Reset FAQ Button
    const resetFaqBtn = document.getElementById('resetFaqBtn');
    if (resetFaqBtn) {
        resetFaqBtn.addEventListener('click', () => {
            if (!confirm('자주 묻는 질문(Q&A)을 기본 추천 질문 5가지로 복원하시겠습니까?')) return;
            currentFaqList = JSON.parse(JSON.stringify(DEFAULT_FAQ));
            editingFaqIndex = null;
            saveFaqToStorage(currentFaqList);
            renderAdminFaq();
            alert('🔄 기본 Q&A 목록으로 복원되었습니다.');
        });
    }


    /* ==========================================================================
       5. Agency Site Settings Management
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
