async function renderCreditCardView(container) {
    // 1. ดึงข้อมูลบัตรเครดิตจริงจาก Supabase (ประเภท CREDIT)
    const rawCredits = await fetchTransactionsByType('CREDIT');
    const credits = rawCredits.map(item => ({
        id: item.id,
        name: item.title,
        type: item.type,
        balance: parseFloat(item.amount),
        limit: 50000, // ค่าวงเงินตั้งต้น (สามารถปรับเปลี่ยนได้ตามต้องการ)
        statementDate: 25,
        dueDate: 10
    }));

    const today = new Date().getDate(); // ดึงวันที่ปัจจุบัน (1-31)

    // ค้นหาบัตรที่ใกล้ครบกำหนดชำระ (เช่น เหลืออีกไม่เกิน 5 วัน หรือถึงกำหนดแล้ว)
    const alertCards = credits.filter(c => {
        if (!c.dueDate) return false;
        const diff = c.dueDate - today;
        return diff >= 0 && diff <= 5; // แจ้งเตือนล่วงหน้า 5 วัน
    });

    container.innerHTML = `
        <!-- แถบแจ้งเตือนความเร่งด่วน (Alert Banner) ถ้ามีบัตรใกล้ครบกำหนด -->
        ${alertCards.length > 0 ? `
            <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-center space-x-4">
                <div class="bg-red-500/20 p-3 rounded-xl text-red-400 text-xl"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div>
                    <h4 class="text-sm font-bold text-red-400">⚠️ แจ้งเตือนกำหนดชำระเงินบัตรเครดิต!</h4>
                    <p class="text-xs text-gray-300 mt-0.5">มีบัตรเครดิต ${alertCards.length} ใบที่ใกล้ถึงวันครบกำหนดชำระเร็วๆ นี้ กรุณาตรวจสอบและเตรียมชำระเงิน</p>
                </div>
            </div>
        ` : ''}

        <!-- หัวข้อหน้าจอ -->
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fa-solid fa-credit-card mr-3 text-red-500"></i>รายการบัตรเครดิต
                </h2>
                <p class="text-sm text-gray-400 mt-1">จัดการวงเงิน หนี้ค้างชำระ และวันสรุปยอด/ครบกำหนดจ่ายเงิน</p>
            </div>
            <button onclick="openModal('CREDIT')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition shadow-lg cursor-pointer flex items-center">
                <i class="fa-solid fa-plus mr-2"></i> เพิ่มบัตรเครดิต
            </button>
        </div>

        <!-- รายการบัตรเครดิตทั้งหมด -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            ${credits.length > 0 ? credits.map(c => {
                const availableLimit = (c.limit || 0) - c.balance;
                const percentUsed = c.limit ? Math.min((c.balance / c.limit) * 100, 100) : 0;
                
                return `
                    <div class="card-bg border border-gray-700/60 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-red-500/50 transition">
                        <div class="absolute -right-3 -bottom-3 opacity-5 text-white text-8xl"><i class="fa-solid fa-credit-card"></i></div>
                        <div>
                            <div class="flex justify-between items-start mb-3">
                                <h4 class="text-lg font-bold text-white">${c.name}</h4>
                                <div class="bg-gray-900 p-2.5 rounded-xl border border-gray-700"><i class="fa-solid fa-credit-card text-red-500"></i></div>
                            </div>
                            
                            <!-- วันสรุปยอด และ วันครบกำหนด -->
                            <div class="grid grid-cols-2 gap-2 bg-gray-900/50 p-3 rounded-xl border border-gray-800 mb-4 text-xs">
                                <div>
                                    <span class="text-gray-400 block">วันสรุปยอด (Stmt)</span>
                                    <span class="text-white font-bold">วันที่ ${c.statementDate} ของเดือน</span>
                                </div>
                                <div>
                                    <span class="text-gray-400 block">ครบกำหนดจ่าย</span>
                                    <span class="text-red-400 font-bold">วันที่ ${c.dueDate} ของเดือน</span>
                                </div>
                            </div>
                        </div>

                        <!-- ยอดหนี้และวงเงิน -->
                        <div class="mb-4">
                            <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>ยอดหนี้ค้างชำระ</span>
                                <span>วงเงิน: ฿${(c.limit || 0).toLocaleString()}</span>
                            </div>
                            <h3 class="text-3xl font-bold text-red-400 mb-2">฿${c.balance.toLocaleString()}</h3>
                            
                            <div class="w-full bg-gray-800 rounded-full h-2 mt-2">
                                <div class="bg-red-500 h-2 rounded-full" style="width: ${percentUsed}%"></div>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">คงเหลือให้ใช้ได้อีก: ฿${availableLimit.toLocaleString()}</p>
                        </div>

                        <button onclick="openCreditActionModal('${c.id}')" class="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs py-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center">
                            <i class="fa-solid fa-cart-shopping mr-1.5"></i> บันทึกรูดใช้บัตร
                        </button>
                    </div>
                `;
            }).join('') : '<p class="text-gray-500">ยังไม่มีบัตรเครดิตในระบบ กดเพิ่มด้านบนได้เลย</p>'}
        </div>
    `;
}

// Modal บันทึกรูดบัตร
async function openCreditActionModal(cardId) {
    const rawCredits = await fetchTransactionsByType('CREDIT');
    const card = rawCredits.find(a => a.id == cardId);
    if(!card) return;

    let existingModal = document.getElementById('creditActionModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div id="creditActionModal" class="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="card-bg border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">บันทึกรูดซื้อสินค้า: ${card.title}</h3>
                    <button onclick="document.getElementById('creditActionModal').remove()" class="text-gray-400 hover:text-white cursor-pointer"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                
                <form onsubmit="submitCreditExpense(event, '${cardId}')" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="creditAmount" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">รายละเอียดการใช้จ่าย</label>
                        <input type="text" id="creditNote" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="เช่น ซื้อของห้าง, เติมน้ำมัน">
                    </div>
                    <div class="flex space-x-3 mt-6">
                        <button type="button" onclick="document.getElementById('creditActionModal').remove()" class="w-1/2 bg-gray-700 text-white py-2.5 rounded-xl cursor-pointer">ยกเลิก</button>
                        <button type="submit" class="w-1/2 bg-red-600 text-white py-2.5 rounded-xl cursor-pointer font-bold">บันทึกยอดหนี้</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ฟังก์ชันบันทึกยอดรูดบัตรเครดิตลง Supabase
async function submitCreditExpense(e, cardId) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('creditAmount').value);
    const note = document.getElementById('creditNote').value;

    const success = await addTransaction(`[บัตรเครดิต] ${note}`, amount, 'CREDIT_EXPENSE');

    if (success) {
        document.getElementById('creditActionModal').remove();
        renderCurrentView();
    }
}