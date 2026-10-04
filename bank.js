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
    const transactions = allTransactions.filter(item => item.type === 'BANK_EXPENSE' || item.type === 'BANK_INCOME' || item.type === 'BANK').map(item => ({
        id: item.id,
        date: new Date(item.created_at).toLocaleDateString('th-TH'),
        type: item.type.includes('EXPENSE') ? 'EXPENSE' : item.type.includes('INCOME') ? 'INCOME' : 'TRANSFER',
        amount: parseFloat(item.amount),
        note: item.title,
        category: 'ทั่วไป'
    }));

    container.innerHTML = `
        <!-- หัวข้อหน้าจอ -->
        <div class="mb-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 ${color} flex items-center justify-center text-lg">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div>
                    <h2 class="text-base font-bold text-gray-800">${title}</h2>
                    <p class="text-xs text-gray-400">จัดการบัญชีเงินฝากธนาคารและประวัติรายการ</p>
                </div>
            </div>
            <button onclick="openModal('BANK')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-xl font-medium transition cursor-pointer flex items-center gap-1 shadow-sm">
                <i class="fa-solid fa-plus"></i> เพิ่มบัญชีธนาคาร
            </button>
        </div>

        <!-- รายการบัญชีธนาคารทั้งหมด -->
        <div class="grid grid-cols-1 gap-4 mb-6">
            ${bankAccounts.length > 0 ? bankAccounts.map(acc => `
                <div class="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col justify-between relative">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">บัญชีธนาคาร</span>
                            <h4 class="text-sm font-semibold text-gray-800 mt-1">${acc.name}</h4>
                            <p class="text-[10px] text-gray-400">เลขบัญชี: ${acc.accountNumber}</p>
                        </div>
                        <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                            <!-- แก้ไขจุดเว้นวรรคคลาสสีให้ถูกต้อง -->
                            <i class="fa-solid ${icon} text-xs${color}"></i>
                        </div>
                    </div>
                    <div class="my-2">
                        <p class="text-[10px] text-gray-400 mb-0.5">ยอดเงินคงเหลือ</p>
                        <h3 class="text-xl font-bold text-blue-600">฿${acc.balance.toLocaleString()}</h3>
                    </div>
                    <!-- ปุ่มจัดการบัญชี / โอนเงิน -->
                    <button onclick="openBankDetailModal('${acc.id}')" class="w-full mt-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-2 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1">
                        <i class="fa-solid fa-right-left"></i> จัดการบัญชี / ทำรายการ
                    </button>
                </div>
            `).join('') : '<p class="text-gray-400 text-xs text-center py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">ยังไม่มีบัญชีธนาคารในระบบ กดเพิ่มด้านบนได้เลยครับ</p>'}
        </div>

        <!-- รายละเอียดประวัติรายการของธนาคาร -->
        <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"><i class="fa-solid fa-receipt mr-1 text-blue-500"></i>ประวัติการเคลื่อนไหวบัญชีธนาคาร</h3>
            <div class="space-y-2">
                ${transactions.length > 0 ? transactions.map(tx => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                        <div class="flex items-center space-x-2.5">
                            <div class="w-7 h-7 rounded-full ${tx.type==='EXPENSE'?'bg-rose-50 text-rose-500':tx.type==='INCOME'?'bg-emerald-50 text-emerald-600':'bg-blue-50 text-blue-600'} flex items-center justify-center">
                                <i class="fa-solid ${tx.type==='EXPENSE'?'fa-arrow-down':tx.type==='INCOME'?'fa-arrow-up':'fa-right-left'} text-[10px]"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-800">${tx.note}</p>
                                <p class="text-[10px] text-gray-400">${tx.date} • หมวดหมู่: <span class="text-blue-500">${tx.category}</span></p>
                            </div>
                        </div>
                        <div class="font-bold ${tx.type==='EXPENSE'?'text-rose-500':tx.type==='INCOME'?'text-emerald-600':'text-blue-600'} text-sm">
                            ${tx.type==='EXPENSE'?'-':tx.type==='INCOME'?'+':''}${tx.amount.toLocaleString()} ฿
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-400 text-xs text-center py-4">ยังไม่มีประวัติรายการ</p>'}
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
        <div id="bankDetailModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="font-bold text-lg text-gray-800">จัดการบัญชี: ${acc.title}</h3>
                    <button onclick="document.getElementById('bankDetailModal').remove()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div class="mb-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p class="text-[10px] text-gray-400">ยอดเงินปัจจุบันในบัญชี</p>
                    <p class="text-xl font-bold text-gray-800">฿${parseFloat(acc.amount).toLocaleString()}</p>
                </div>

                <form onsubmit="submitBankTransaction(event, '${accountId}')" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">ประเภทรายการ</label>
                        <select id="bankTxType" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500">
                            <option value="EXPENSE">รายจ่ายทั่วไป (Expense)</option>
                            <option value="INCOME">รายรับเข้าบัญชี (Income)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="bankTxAmount" step="any" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>

                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">รายละเอียด (Note)</label>
                        <input type="text" id="bankTxNote" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500" placeholder="เช่น กดเงินสด, ซื้อของ">
                    </div>

                    <div class="flex space-x-2 pt-2">
                        <button type="button" onclick="document.getElementById('bankDetailModal').remove()" class="w-1/2 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold transition cursor-pointer hover:bg-gray-200">ยกเลิก</button>
                        <button type="submit" class="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition cursor-pointer shadow-md">บันทึกรายการ</button>
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