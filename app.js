// ==========================================
// 1. ระบบจัดการแท็บและการแสดงผล (Tabs & Views)
// ==========================================
let currentTab = 'dashboard';

function switchTab(tabName) {
    currentTab = tabName;
    ['dashboard', 'cash', 'bank', 'credit', 'investment', 'goals'].forEach(t => {
        const btn = document.getElementById(`nav-${t}`);
        if(btn) {
            btn.className = t === tabName 
                ? "w-full text-left py-2.5 px-4 rounded-lg bg-blue-900/30 text-blue-400 font-medium transition flex items-center cursor-pointer"
                : "w-full text-left py-2.5 px-4 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition flex items-center cursor-pointer";
        }
    });
    renderCurrentView();
}

function renderCurrentView() {
    const main = document.getElementById('mainContent');
    if (!main) return;
    main.innerHTML = '';
    
    if (currentTab === 'dashboard' && typeof renderDashboardView === 'function') {
        renderDashboardView(main);
    } else if (currentTab === 'cash' && typeof renderBankCashView === 'function') {
        renderBankCashView(main, 'CASH', 'รายการเงินสด', 'fa-money-bill', 'text-green-500');
    } else if (currentTab === 'bank' && typeof renderBankView === 'function') {
        renderBankView(main, 'BANK', 'รายการเงินฝากธนาคาร', 'fa-building-columns', 'text-blue-500');
    } else if (currentTab === 'credit' && typeof renderCreditCardView === 'function') {
        renderCreditCardView(main);
    } else if (currentTab === 'investment' && typeof renderInvestmentView === 'function') {
        renderInvestmentView(main);
    } else if (currentTab === 'goals' && typeof renderGoalsView === 'function') {
        renderGoalsView(main);
    }
}

// ==========================================
// 2. ควบคุม Modal เพิ่มข้อมูลแบบ Dynamic
// ==========================================
function openModal(type) {
    const modalTypeEl = document.getElementById('modalType');
    if (modalTypeEl) modalTypeEl.value = type;

    const title = document.getElementById('accountModalTitle');
    const label1 = document.getElementById('labelText1');
    const label2 = document.getElementById('labelText2');
    const field1 = document.getElementById('extraField1');
    const field2 = document.getElementById('extraField2');
    const goalTypeWrapper = document.getElementById('goalTypeWrapper');
    
    if(goalTypeWrapper) goalTypeWrapper.style.display = 'none';

    if(type === 'CASH') {
        if(title) title.innerText = "เพิ่มกระเป๋าเงินสด";
        if(document.getElementById('labelName')) document.getElementById('labelName').innerText = "ชื่อกระเป๋าเงินสด";
        if(field1) field1.style.display = 'none';
        if(field2) field2.style.display = 'none';
        if(document.getElementById('labelAmount')) document.getElementById('labelAmount').innerText = "ยอดเงินเริ่มต้น (บาท)";
    } else if(type === 'BANK') {
        if(title) title.innerText = "เพิ่มบัญชีธนาคาร";
        if(document.getElementById('labelName')) document.getElementById('labelName').innerText = "ชื่อธนาคาร";
        if(field1) field1.style.display = 'block';
        if(label1) label1.innerText = "เลขที่บัญชี (4 ตัวท้าย)";
        if(field2) field2.style.display = 'none';
        if(document.getElementById('labelAmount')) document.getElementById('labelAmount').innerText = "ยอดเงินเริ่มต้น (บาท)";
    } else if(type === 'CREDIT') {
        if(title) title.innerText = "เพิ่มบัตรเครดิต";
        if(document.getElementById('labelName')) document.getElementById('labelName').innerText = "ชื่อบัตรเครดิต";
        if(field1) field1.style.display = 'block';
        if(label1) label1.innerText = "วันสรุปยอด (วันที่ 1-31)";
        if(field2) field2.style.display = 'block';
        if(label2) label2.innerText = "วันครบกำหนดจ่าย (วันที่ 1-31)";
        if(document.getElementById('labelAmount')) document.getElementById('labelAmount').innerText = "วงเงินรวมของบัตร (บาท)";
    } else if(type === 'INVESTMENT') {
        if(title) title.innerText = "เพิ่มพอร์ตลงทุน";
        if(document.getElementById('labelName')) document.getElementById('labelName').innerText = "ชื่อพอร์ต / กองทุน";
        if(field1) field1.style.display = 'none';
        if(field2) field2.style.display = 'none';
        if(document.getElementById('labelAmount')) document.getElementById('labelAmount').innerText = "มูลค่าเริ่มต้นพอร์ต (บาท)";
    } else if(type === 'GOAL') {
        if(title) title.innerText = "สร้างเป้าหมาย / งบประมาณใหม่";
        if(goalTypeWrapper) goalTypeWrapper.style.display = 'block';
        if(document.getElementById('labelName')) document.getElementById('labelName').innerText = "ชื่อเป้าหมาย / งบประมาณ";
        if(field1) field1.style.display = 'block';
        if(label1) label1.innerText = "เป้าหมายสูงสุด / วงเงินงบประมาณ (บาท)";
        if(field2) field2.style.display = 'none';
        if(document.getElementById('labelAmount')) document.getElementById('labelAmount').innerText = "ยอดเงินสะสมเริ่มต้น (บาท)";
    }
    
    const accountModal = document.getElementById('accountModal');
    if(accountModal) accountModal.classList.remove('hidden');
}

function closeAccountModal() {
    const accountModal = document.getElementById('accountModal');
    if(accountModal) accountModal.classList.add('hidden');
    
    const accountForm = document.getElementById('accountForm');
    if(accountForm) accountForm.reset();
}

async function saveDynamicData(e) {
    if (e && e.preventDefault) e.preventDefault();
    
    const typeField = document.getElementById('modalType');
    const nameField = document.getElementById('inputName');
    const amountField = document.getElementById('inputAmount');

    if (!typeField || !nameField || !amountField) return;

    const type = typeField.value;
    const name = nameField.value;
    const amount = parseFloat(amountField.value) || 0;
    
    const categorySelect = document.getElementById('inputCategory');
    const category = categorySelect ? categorySelect.value : 'General';

    const extra1 = document.getElementById('inputExtra1') ? parseInt(document.getElementById('inputExtra1').value) || 0 : null;
    const extra2 = document.getElementById('inputExtra2') ? parseInt(document.getElementById('inputExtra2').value) || 0 : null;
    const goalType = document.getElementById('inputGoalType') ? document.getElementById('inputGoalType').value : null;

    let extraData = { category };
    
    if (type === 'CREDIT') {
        extraData.limit = amount;
        extraData.statement_date = extra1;
        extraData.due_date = extra2;
    } else if (type === 'GOAL') {
        extraData.target_amount = extra1;
        extraData.goal_type = goalType;
    }

    if (typeof addTransaction === 'function') {
        const success = await addTransaction(name, amount, type, category, extraData);
        if (success) {
            closeAccountModal();
            renderCurrentView();
        }
    } else {
        console.warn("ยังไม่ได้ประกาศฟังก์ชัน addTransaction สำหรับบันทึกข้อมูลลง Supabase");
        closeAccountModal();
    }
}

// ==========================================
// 3. ระบบตรวจสอบสถานะผู้ใช้งาน (Auth & Session)
// ==========================================
let isSignUpMode = false;

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('authToggleText');

    if (isSignUpMode) {
        if(title) title.innerText = "สร้างบัญชีผู้ใช้งานใหม่";
        if(btn) btn.innerText = "สมัครสมาชิก";
        if(toggleText) toggleText.innerText = "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ";
    } else {
        if(title) title.innerText = "กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูลการเงินของคุณ";
        if(btn) btn.innerText = "เข้าสู่ระบบ";
        if(toggleText) toggleText.innerText = "ยังไม่มีบัญชีใช่หรือไม่? สมัครสมาชิก";
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    if (isSignUpMode) {
        if (typeof signUp === 'function') {
            const success = await signUp(email, password);
            if (success) toggleAuthMode();
        }
    } else {
        if (typeof signIn === 'function') {
            const success = await signIn(email, password);
            if (success) {
                const authModal = document.getElementById('authModal');
                if (authModal) authModal.classList.add('hidden');
                checkUserSession();
            }
        }
    }
}

async function checkUserSession() {
    if (typeof getCurrentUser !== 'function') {
        console.warn("ยังไม่ได้ประกาศฟังก์ชัน getCurrentUser ใน supabase.js");
        return;
    }

    const user = await getCurrentUser();
    const authModal = document.getElementById('authModal');

    if (!user) {
        if (authModal) authModal.classList.remove('hidden');
    } else {
        if (authModal) authModal.classList.add('hidden');
        console.log('👤 ผู้ใช้งานปัจจุบัน:', user.email);
        
        const emailDisplay = document.getElementById('userEmailDisplay');
        if (emailDisplay) emailDisplay.innerText = user.email;

        renderCurrentView();
    }
}

// ==========================================
// 4. ระบบจัดการออกจากระบบ (Logout)
// ==========================================
function handleLogout() {
    if (typeof db !== 'undefined' && db.auth) {
        db.auth.signOut().then(() => {
            window.location.href = 'login.html';
        }).catch(err => {
            console.error("Logout error:", err.message);
            window.location.href = 'login.html';
        });
    } else {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
});