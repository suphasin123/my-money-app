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
    if (currentTab === 'dashboard') renderDashboardView(main);
    else if (currentTab === 'cash') renderBankCashView(main, 'CASH', 'รายการเงินสด', 'fa-money-bill', 'text-green-500');
    else if (currentTab === 'bank') renderBankView(main, 'BANK', 'รายการเงินฝากธนาคาร', 'fa-building-columns', 'text-blue-500');
    else if (currentTab === 'credit') renderCreditCardView(main);
    else if (currentTab === 'investment') renderInvestmentView(main);
    else if (currentTab === 'goals') renderGoalsView(main);
}

// ควบคุม Modal เพิ่มข้อมูลแบบ Dynamic แยกตามแต่ละระบบ
function openModal(type) {
    document.getElementById('modalType').value = type;
    const title = document.getElementById('accountModalTitle');
    const label1 = document.getElementById('labelText1');
    const label2 = document.getElementById('labelText2');
    const field1 = document.getElementById('extraField1');
    const field2 = document.getElementById('extraField2');
    const goalTypeWrapper = document.getElementById('goalTypeWrapper');
    
    if(goalTypeWrapper) goalTypeWrapper.style.display = 'none';

    if(type === 'CASH') {
        title.innerText = "เพิ่มกระเป๋าเงินสด";
        document.getElementById('labelName').innerText = "ชื่อกระเป๋าเงินสด";
        field1.style.display = 'none';
        field2.style.display = 'none';
        document.getElementById('labelAmount').innerText = "ยอดเงินเริ่มต้น (บาท)";
    } else if(type === 'BANK') {
        title.innerText = "เพิ่มบัญชีธนาคาร";
        document.getElementById('labelName').innerText = "ชื่อธนาคาร";
        field1.style.display = 'block';
        label1.innerText = "เลขที่บัญชี (4 ตัวท้าย)";
        field2.style.display = 'none';
        document.getElementById('labelAmount').innerText = "ยอดเงินเริ่มต้น (บาท)";
    } else if(type === 'CREDIT') {
        title.innerText = "เพิ่มบัตรเครดิต";
        document.getElementById('labelName').innerText = "ชื่อบัตรเครดิต";
        field1.style.display = 'block';
        label1.innerText = "วันสรุปยอด (วันที่ 1-31)";
        field2.style.display = 'block';
        label2.innerText = "วันครบกำหนดจ่าย (วันที่ 1-31)";
        document.getElementById('labelAmount').innerText = "วงเงินรวมของบัตร (บาท)";
    } else if(type === 'INVESTMENT') {
        title.innerText = "เพิ่มพอร์ตลงทุน";
        document.getElementById('labelName').innerText = "ชื่อพอร์ต / กองทุน";
        field1.style.display = 'none';
        field2.style.display = 'none';
        document.getElementById('labelAmount').innerText = "มูลค่าเริ่มต้นพอร์ต (บาท)";
    } else if(type === 'GOAL') {
        title.innerText = "สร้างเป้าหมาย / งบประมาณใหม่";
        if(goalTypeWrapper) goalTypeWrapper.style.display = 'block';
        document.getElementById('labelName').innerText = "ชื่อเป้าหมาย / งบประมาณ";
        field1.style.display = 'block';
        label1.innerText = "เป้าหมายสูงสุด / วงเงินงบประมาณ (บาท)";
        field2.style.display = 'none';
        document.getElementById('labelAmount').innerText = "ยอดเงินสะสมเริ่มต้น (บาท)";
    }
    
    document.getElementById('accountModal').classList.remove('hidden');
}

function closeAccountModal() {
    document.getElementById('accountModal').classList.add('hidden');
    document.getElementById('accountForm').reset();
}

// บันทึกข้อมูลที่เพิ่มจาก Modal กลาง (เชื่อมต่อกับ Supabase แล้ว)
async function saveDynamicData(e) {
    e.preventDefault();
    const type = document.getElementById('modalType').value;
    const name = document.getElementById('inputName').value;
    const amount = parseFloat(document.getElementById('inputAmount').value);
    
    // ดึงค่าหมวดหมู่จาก Dropdown (ถ้ามี) ถ้าไม่มีให้ใช้ General
    const categorySelect = document.getElementById('inputCategory');
    const category = categorySelect ? categorySelect.value : 'General';

    // ส่งข้อมูลบันทึกเข้า Supabase (ยังคงใช้โครงสร้างเดิมเพื่อไม่ให้พัง)
    const success = await addTransaction(name, amount, type, category);

    if (success) {
        closeAccountModal();
        renderCurrentView();
    }
}

// ---------------------------------------------------------
// ระบบตรวจสอบสถานะผู้ใช้งาน (Authentication Control)
// ---------------------------------------------------------
let isSignUpMode = false;

// สลับโหมดระหว่าง "เข้าสู่ระบบ" กับ "สมัครสมาชิก"
function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('authToggleText');

    if (isSignUpMode) {
        title.innerText = "สร้างบัญชีผู้ใช้งานใหม่";
        btn.innerText = "สมัครสมาชิก";
        toggleText.innerText = "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ";
    } else {
        title.innerText = "กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูลการเงินของคุณ";
        btn.innerText = "เข้าสู่ระบบ";
        toggleText.innerText = "ยังไม่มีบัญชีใช่หรือไม่? สมัครสมาชิก";
    }
}

// จัดการเมื่อกดปุ่ม Submit ในฟอร์ม Auth
async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (isSignUpMode) {
        const success = await signUp(email, password);
        if (success) toggleAuthMode(); // สลับกลับมาหน้า Login
    } else {
        const success = await signIn(email, password);
        if (success) {
            const authModal = document.getElementById('authModal');
            if (authModal) authModal.classList.add('hidden');
            checkUserSession(); // ตรวจสอบ session และโหลดหน้าจอใหม่
        }
    }
}

// ฟังก์ชันตรวจสอบตอนเปิดเว็บครั้งแรก
async function checkUserSession() {
    const user = await getCurrentUser();
    const authModal = document.getElementById('authModal');

    if (!user) {
        if (authModal) authModal.classList.remove('hidden'); // ถ้ายังไม่ล็อกอิน ให้แสดง Modal
    } else {
        if (authModal) authModal.classList.add('hidden'); // ถ้าล็อกอินแล้ว ซ่อน Modal
        console.log('👤 ผู้ใช้งานปัจจุบัน:', user.email);
        
        // แสดงอีเมลที่ Sidebar ด้านซ้าย
        const emailDisplay = document.getElementById('userEmailDisplay');
        if (emailDisplay) emailDisplay.innerText = user.email;

        renderCurrentView(); // โหลดหน้าเว็บหลักเมื่อผ่านการตรวจสอบ
    }
}

// เริ่มต้นรันตรวจสอบผู้ใช้ทันทีที่เปิดเว็บ
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
});