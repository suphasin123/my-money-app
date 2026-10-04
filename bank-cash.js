async function renderBankCashView(container, type, title, icon, color) {
    if (type !== 'CASH') return;

    // 1. ดึงข้อมูลจริงจาก Supabase (แยกตามประเภท CASH และรายการใช้จ่ายเงินสด)
    const rawTransactions = await fetchTransactionsByType('CASH');
    
    // แปลงข้อมูลกระเป๋าเงินสด
    const cashAccounts = rawTransactions.map(item => ({
        id: item.id,
        name: item.title,
        type: item.type,
        balance: parseFloat(item.amount)
    }));

    // ดึงประวัติรายการทั้งหมดมาคัดกรองแสดงผล
    const allTransactions = await fetchTransactions();
    const cashTransactions = allTransactions.filter(item => item.type === 'CASH_EXPENSE' || item.type === 'CASH_INCOME' || item.type === 'CASH');

    container.innerHTML = `
        <!-- ส่วนหัวของหน้าจอ -->
        <div class="mb-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 ${color} flex items-center justify-center text-lg">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div>
                    <h2 class="text-base font-bold text-gray-800">${title}</h2>
                    <p class="text-xs text-gray-400">จัดการกระเป๋าเงินสดและบันทึกรายรับ-รายจ่าย</p>
                </div>
            </div>
            <button onclick="openModal('CASH')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-xl font-medium transition cursor-pointer flex items-center gap-1 shadow-sm">
                <i class="fa-solid fa-plus"></i> เพิ่มกระเป๋าเงินสด
            </button>
        </div>

        <!-- รายการกระเป๋าเงินสดทั้งหมด (แสดงผลเป็นการ์ด) -->
        <div class="grid grid-cols-1 gap-4 mb-6">
            ${cashAccounts.length > 0 ? cashAccounts.map(acc => `
                <div class="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col justify-between relative">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">กระเป๋าเงินสด</span>
                            <h4 class="text-sm font-semibold text-gray-800 mt-1">${acc.name}</h4>
                        </div>
                        <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                            <i class="fa-solid ${icon} text-xs"></i>
                        </div>
                    </div>
                    <div class="my-2">
                        <p class="text-[10px] text-gray-400 mb-0.5">ยอดเงินคงเหลือ</p>
                        <h3 class="text-xl font-bold text-emerald-600">฿${acc.balance.toLocaleString()}</h3>
                    </div>
                    <!-- ปุ่มคลิกจัดการกระเป๋าโดยตรง -->
                    <button onclick="openWalletDetailModal('${acc.id}')" class="w-full mt-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-2 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1">
                        <i class="fa-solid fa-wallet"></i> จัดการกระเป๋า / ทำรายการ
                    </button>
                </div>
            `).join('') : '<p class="text-gray-400 text-xs text-center py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">ยังไม่มีกระเป๋าเงินสดในระบบ กดสร้างด้านบนได้เลยครับ</p>'}
        </div>

        <!-- รายละเอียดการใช้จ่ายเงินสด (Transaction History) -->
        <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"><i class="fa-solid fa-receipt mr-1 text-blue-500"></i>ประวัติรายการเงินสด</h3>
            <div class="space-y-2">
                ${cashTransactions.length > 0 ? cashTransactions.map(tx => {
                    const isExpense = tx.type === 'CASH_EXPENSE';
                    return `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                            <div class="flex items-center space-x-2.5">
                                <div class="w-7 h-7 rounded-full ${isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center">
                                    <i class="fa-solid ${isExpense ? 'fa-arrow-down' : 'fa-arrow-up'} text-[10px]"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-800">${tx.title}</p>
                                    <p class="text-[10px] text-gray-400">${new Date(tx.created_at).toLocaleDateString('th-TH')} • หมวดหมู่: <span class="text-blue-500">${tx.category || 'ทั่วไป'}</span></p>
                                </div>
                            </div>
                            <div class="font-bold ${isExpense ? 'text-rose-500' : 'text-emerald-600'} text-sm">
                                ${isExpense ? '-' : '+'}฿${parseFloat(tx.amount).toLocaleString()}
                            </div>
                        </div>
                    `;
                }).join('') : '<p class="text-gray-400 text-xs text-center py-4">ยังไม่มีประวัติรายการใช้จ่ายเงินสด</p>'}
            </div>
        </div>
    `;
}

// หน้าต่าง Modal สำหรับทำรายการเฉพาะกระเป๋าที่คลิก
async function openWalletDetailModal(accountId) {
    const transactions = await fetchTransactions();
    const acc = transactions.find(a => a.id == accountId);
    if(!acc) return;

    let existingModal = document.getElementById('walletDetailModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div id="walletDetailModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="font-bold text-lg text-gray-800">จัดการกระเป๋า: ${acc.title}</h3>
                    <button onclick="document.getElementById('walletDetailModal').remove()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div class="mb-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p class="text-[10px] text-gray-400">ยอดเงินปัจจุบันในกระเป๋า</p>
                    <p class="text-xl font-bold text-gray-800">฿${parseFloat(acc.amount).toLocaleString()}</p>
                </div>

                <form onsubmit="submitWalletTransaction(event, '${accountId}')" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">ประเภทรายการ</label>
                        <select id="walletTxType" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500">
                            <option value="EXPENSE">รายจ่าย (Expense)</option>
                            <option value="INCOME">รายรับ (Income)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="walletTxAmount" step="any" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">รายละเอียดการใช้จ่าย (Note)</label>
                        <input type="text" id="walletTxNote" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500" placeholder="เช่น ค่าข้าวกลางวัน, ซื้อของเข้าบ้าน">
                    </div>
                    <div class="flex space-x-2 pt-2">
                        <button type="button" onclick="document.getElementById('walletDetailModal').remove()" class="w-1/2 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold transition cursor-pointer hover:bg-gray-200">ยกเลิก</button>
                        <button type="submit" class="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition cursor-pointer shadow-md">บันทึกรายการ</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ฟังก์ชันบันทึกรายการและบันทึกลง Supabase
async function submitWalletTransaction(e, accountId) {
    e.preventDefault();
    const type = document.getElementById('walletTxType').value;
    const amount = parseFloat(document.getElementById('walletTxAmount').value);
    const note = document.getElementById('walletTxNote').value;

    const success = await addTransaction(note, amount, type === 'EXPENSE' ? 'CASH_EXPENSE' : 'CASH_INCOME');

    if (success) {
        document.getElementById('walletDetailModal').remove();
        renderCurrentView();
    }
}