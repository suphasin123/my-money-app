async function renderBankView(container, type, title, icon, color) {
    if (type !== 'BANK') return;

    // 1. ดึงข้อมูลบัญชีธนาคารจริงจาก Supabase (แยกตามประเภท BANK)
    const rawBankAccounts = await fetchTransactionsByType('BANK');
    const bankAccounts = rawBankAccounts.map(item => ({
        id: item.id,
        name: item.title,
        type: item.type,
        balance: parseFloat(item.amount),
        accountNumber: '...0000'
    }));

    // 2. ดึงประวัติรายการเคลื่อนไหวทั้งหมดจาก Supabase มาแสดง
    const allTransactions = await fetchTransactions();
    const transactions = allTransactions.map(item => ({
        id: item.id,
        date: new Date(item.created_at).toLocaleDateString('th-TH'),
        type: item.type.includes('EXPENSE') ? 'EXPENSE' : item.type.includes('INCOME') ? 'INCOME' : 'TRANSFER',
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
                    <i class="fa-solid ${icon} mr-3 ${color}"></i>${title}
                </h2>
                <p class="text-sm text-gray-400 mt-1">จัดการบัญชีเงินฝากธนาคาร และทำรายการโอนเงิน / ชำระบัตร / ลงทุน</p>
            </div>
            <button onclick="openModal('BANK')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition shadow-lg cursor-pointer flex items-center">
                <i class="fa-solid fa-plus mr-2"></i> เพิ่มบัญชีธนาคารใหม่
            </button>
        </div>

        <!-- รายการบัญชีธนาคารทั้งหมด -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            ${bankAccounts.length > 0 ? bankAccounts.map(acc => `
                <div class="card-bg border border-gray-700/60 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition">
                    <div class="absolute -right-3 -bottom-3 opacity-5 text-white text-8xl"><i class="fa-solid fa-building-columns"></i></div>
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="text-lg font-bold text-white">${acc.name}</h4>
                                <p class="text-xs text-gray-400">เลขบัญชี: ${acc.accountNumber}</p>
                            </div>
                            <div class="bg-gray-900 p-2.5 rounded-xl border border-gray-700"><i class="fa-solid ${icon}${color}"></i></div>
                        </div>
                    </div>
                    <div class="mt-6 mb-4">
                        <p class="text-xs text-gray-500 mb-1">ยอดเงินคงเหลือ</p>
                        <h3 class="text-3xl font-bold text-white">฿${acc.balance.toLocaleString()}</h3>
                    </div>
                    <!-- ปุ่มจัดการบัญชี / โอนเงิน -->
                    <button onclick="openBankDetailModal('${acc.id}')" class="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center">
                        <i class="fa-solid fa-right-left mr-1.5"></i> จัดการบัญชี / โอนเงิน
                    </button>
                </div>
            `).join('') : '<p class="text-gray-500">ยังไม่มีบัญชีธนาคารในระบบ กดเพิ่มด้านบนได้เลย</p>'}
        </div>

        <!-- รายละเอียดประวัติรายการของธนาคาร -->
        <div class="card-bg border border-gray-800 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-4"><i class="fa-solid fa-receipt mr-2 text-gray-400"></i>ประวัติการเคลื่อนไหวบัญชีธนาคาร</h3>
            <div class="space-y-3">
                ${transactions.length > 0 ? transactions.map(tx => `
                    <div class="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-800">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 rounded-full ${tx.type==='EXPENSE'?'bg-red-500/20 text-red-400':tx.type==='INCOME'?'bg-green-500/20 text-green-400':'bg-blue-500/20 text-blue-400'} flex items-center justify-center">
                                <i class="fa-solid ${tx.type==='EXPENSE'?'fa-arrow-down':tx.type==='INCOME'?'fa-arrow-up':'fa-right-left'} text-xs"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-200 text-sm">${tx.note}</p>
                                <p class="text-xs text-gray-500">${tx.date} • หมวดหมู่: <span class="text-blue-400">${tx.category}</span></p>
                            </div>
                        </div>
                        <div class="font-bold ${tx.type==='EXPENSE'?'text-red-400':tx.type==='INCOME'?'text-green-400':'text-blue-400'} text-sm">
                            ${tx.type==='EXPENSE'?'-':tx.type==='INCOME'?'+':''}${tx.amount.toLocaleString()} ฿
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-500 text-sm">ยังไม่มีประวัติรายการ</p>'}
            </div>
        </div>
    `;
}

// Modal ทำรายการบัญชีธนาคาร
async function openBankDetailModal(accountId) {
    const rawBankAccounts = await fetchTransactionsByType('BANK');
    const acc = rawBankAccounts.find(a => a.id == accountId);
    if(!acc) return;

    let existingModal = document.getElementById('bankDetailModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div id="bankDetailModal" class="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="card-bg border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">จัดการบัญชี: ${acc.title}</h3>
                    <button onclick="document.getElementById('bankDetailModal').remove()" class="text-gray-400 hover:text-white cursor-pointer"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                
                <div class="mb-4 bg-gray-800/60 p-3 rounded-xl border border-gray-700">
                    <p class="text-xs text-gray-400">ยอดเงินปัจจุบันในบัญชี</p>
                    <p class="text-2xl font-bold text-white">฿${parseFloat(acc.amount).toLocaleString()}</p>
                </div>

                <form onsubmit="submitBankTransaction(event, '${accountId}')" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">ประเภทรายการ</label>
                        <select id="bankTxType" class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500">
                            <option value="EXPENSE">รายจ่ายทั่วไป (Expense)</option>
                            <option value="INCOME">รายรับเข้าบัญชี (Income)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="bankTxAmount" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">รายละเอียด (Note)</label>
                        <input type="text" id="bankTxNote" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="เช่น กดเงินสด, ซื้อของ">
                    </div>

                    <div class="flex space-x-3 mt-6">
                        <button type="button" onclick="document.getElementById('bankDetailModal').remove()" class="w-1/2 bg-gray-700 text-white py-2.5 rounded-xl cursor-pointer">ยกเลิก</button>
                        <button type="submit" class="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl cursor-pointer font-bold">บันทึกรายการ</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ฟังก์ชันบันทึกรายการธนาคารลง Supabase
async function submitBankTransaction(e, accountId) {
    e.preventDefault();
    const type = document.getElementById('bankTxType').value;
    const amount = parseFloat(document.getElementById('bankTxAmount').value);
    const note = document.getElementById('bankTxNote').value;

    const success = await addTransaction(note, amount, type === 'EXPENSE' ? 'BANK_EXPENSE' : 'BANK_INCOME');

    if (success) {
        document.getElementById('bankDetailModal').remove();
        renderCurrentView();
    }
}