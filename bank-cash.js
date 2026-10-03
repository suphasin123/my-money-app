async function renderBankCashView(container, type, title, icon, color) {
    if (type !== 'CASH') return;

    // 1. ดึงข้อมูลจริงจาก Supabase (แยกตามประเภท CASH)
    const rawTransactions = await fetchTransactionsByType('CASH');
    
    // แปลงข้อมูลให้เป็นรูปแบบ accounts
    const cashAccounts = rawTransactions.map(item => ({
        id: item.id,
        name: item.title,
        type: item.type,
        balance: parseFloat(item.amount)
    }));

    // ดึงประวัติรายการใช้จ่ายทั้งหมดมาแสดง (สมมติแยกเก็บหรือดึงทั้งหมดมาโชว์)
    const allTransactions = await fetchTransactions();
    const transactions = allTransactions.map(item => ({
        id: item.id,
        date: new Date(item.created_at).toLocaleDateString('th-TH'),
        type: item.type === 'CASH_EXPENSE' ? 'EXPENSE' : 'INCOME',
        amount: parseFloat(item.amount),
        note: item.title,
        category: 'ทั่วไป',
        accountId: item.user_id
    }));

    container.innerHTML = `
        <!-- หัวข้อหน้าจอ -->
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fa-solid ${icon} mr-3 ${color}">​${title}</i>
                </h2>
                <p class="text-sm text-gray-400 mt-1">จัดการกระเป๋าเงินสดหลายใบ บันทึกรายรับ-รายจ่าย และเชื่อมโยงเป้าหมาย</p>
            </div>
            <button onclick="openModal('CASH')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition shadow-lg cursor-pointer flex items-center">
                <i class="fa-solid fa-plus mr-2"></i> สร้างกระเป๋าเงินสดใหม่
            </button>
        </div>

        <!-- รายการกระเป๋าเงินสดทั้งหมด -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            ${cashAccounts.length > 0 ? cashAccounts.map(acc => `
                <div class="card-bg border border-gray-700/60 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition">
                    <div class="absolute -right-3 -bottom-3 opacity-5 text-white text-8xl"><i class="fa-solid fa-money-bill"></i></div>
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="text-lg font-bold text-white">${acc.name}</h4>
                                <p class="text-xs text-gray-400">กระเป๋าเงินสดส่วนตัว</p>
                            </div>
                            <div class="bg-gray-900 p-2.5 rounded-xl border border-gray-700"><i class="fa-solid ${icon}${color}"></i></div>
                        </div>
                    </div>
                    <div class="mt-6 mb-4">
                        <p class="text-xs text-gray-500 mb-1">ยอดเงินคงเหลือ</p>
                        <h3 class="text-3xl font-bold text-white">฿${acc.balance.toLocaleString()}</h3>
                    </div>
                    <!-- ปุ่มคลิกจัดการกระเป๋าโดยตรง -->
                    <button onclick="openWalletDetailModal('${acc.id}')" class="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center">
                        <i class="fa-solid fa-wallet mr-1.5"></i> จัดการกระเป๋า / ทำรายการ
                    </button>
                </div>
            `).join('') : '<p class="text-gray-500">ยังไม่มีกระเป๋าเงินสดในระบบ กดสร้างด้านบนได้เลย</p>'}
        </div>

        <!-- รายละเอียดการใช้จ่ายเงินสด (Transaction History) -->
        <div class="card-bg border border-gray-800 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-4"><i class="fa-solid fa-receipt mr-2 text-gray-400"></i>รายละเอียดการใช้จ่ายเงินสด</h3>
            <div class="space-y-3">
                ${transactions.length > 0 ? transactions.map(tx => `
                    <div class="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-800">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 rounded-full ${tx.type==='EXPENSE'?'bg-red-500/20 text-red-400':'bg-green-500/20 text-green-400'} flex items-center justify-center">
                                <i class="fa-solid ${tx.type==='EXPENSE'?'fa-arrow-down':'fa-arrow-up'} text-xs"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-200 text-sm">${tx.note}</p>
                                <p class="text-xs text-gray-500">${tx.date} • หมวดหมู่: <span class="text-blue-400">${tx.category}</span></p>
                            </div>
                        </div>
                        <div class="font-bold ${tx.type==='EXPENSE'?'text-red-400':'text-green-400'} text-sm">
                            ${tx.type==='EXPENSE'?'-':'+'}฿${tx.amount.toLocaleString()}
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-500 text-sm">ยังไม่มีประวัติรายการใช้จ่าย</p>'}
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
        <div id="walletDetailModal" class="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="card-bg border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">จัดการกระเป๋า: ${acc.title}</h3>
                    <button onclick="document.getElementById('walletDetailModal').remove()" class="text-gray-400 hover:text-white cursor-pointer"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                
                <div class="mb-4 bg-gray-800/60 p-3 rounded-xl border border-gray-700">
                    <p class="text-xs text-gray-400">ยอดเงินปัจจุบันในกระเป๋า</p>
                    <p class="text-2xl font-bold text-white">฿${parseFloat(acc.amount).toLocaleString()}</p>
                </div>

                <form onsubmit="submitWalletTransaction(event, '${accountId}')" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">ประเภทรายการ</label>
                        <select id="walletTxType" class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500">
                            <option value="EXPENSE">รายจ่าย (Expense)</option>
                            <option value="INCOME">รายรับ (Income)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="walletTxAmount" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">รายละเอียดการใช้จ่าย (Note)</label>
                        <input type="text" id="walletTxNote" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="เช่น ค่าข้าวกลางวัน, ซื้อของเข้าบ้าน">
                    </div>
                    <div class="flex space-x-3 mt-6">
                        <button type="button" onclick="document.getElementById('walletDetailModal').remove()" class="w-1/2 bg-gray-700 text-white py-2.5 rounded-xl cursor-pointer">ยกเลิก</button>
                        <button type="submit" class="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl cursor-pointer font-bold">บันทึกรายการ</button>
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

    // บันทึกรายการลง Supabase ผ่านฟังก์ชันกลาง
    const success = await addTransaction(note, amount, type === 'EXPENSE' ? 'CASH_EXPENSE' : 'CASH_INCOME');

    if (success) {
        document.getElementById('walletDetailModal').remove();
        renderCurrentView();
    }
}