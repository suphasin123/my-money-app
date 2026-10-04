async function renderDashboardView(container) {
    const transactions = await fetchTransactions();

    const user = await getCurrentUser();
    const userEmail = user ? user.email : 'ผู้ใช้งานทั่วไป';

    const accounts = transactions.map(item => ({
        id: item.id,
        name: item.title,
        type: item.type,
        balance: parseFloat(item.amount) || 0
    }));

    let totalAssets = 0;
    let totalLiabilities = 0;
    accounts.forEach(acc => {
        if (acc.type === "CREDIT") totalLiabilities += Math.abs(acc.balance);
        else totalAssets += acc.balance;
    });

    const creditCards = accounts.filter(acc => acc.type === "CREDIT");

    container.innerHTML = `
        <div class="mb-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <div>
                <h2 class="text-base font-bold text-gray-800 flex items-center">
                    <i class="fa-solid fa-user-circle mr-2 text-blue-600"></i>ยินดีต้อนรับกลับมาครับ!
                </h2>
                <p class="text-xs text-gray-400 mt-0.5">บัญชีผู้ใช้: <span class="text-blue-600 font-semibold">${userEmail}</span></p>
            </div>
            <button onclick="signOut()" class="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs py-2 px-3 rounded-xl font-medium transition cursor-pointer flex items-center">
                <i class="fa-solid fa-right-from-bracket mr-1.5"></i> ออกจากระบบ
            </button>
        </div>

        ${creditCards.length > 0 ? `
            <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 shadow-sm flex flex-col gap-3">
                <div class="flex items-center space-x-2 text-amber-800 font-semibold text-xs">
                    <i class="fa-solid fa-credit-card text-amber-600"></i>
                    <span>สถานะบัตรเครดิต & รอบบิลชำระ</span>
                </div>
                <div class="space-y-2">
                    ${creditCards.map(c => `
                        <div class="bg-white/80 px-3 py-2 rounded-xl text-xs flex justify-between items-center">
                            <span class="text-gray-700 font-bold">${c.name}</span>
                            <div>
                                <span class="text-rose-600 font-semibold">หนี้: ฿${Math.abs(c.balance).toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <div class="space-y-4 mb-6">
            <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md">
                <p class="text-xs text-gray-400 mb-1">ความมั่งคั่งสุทธิ (NET WORTH)</p>
                <h2 class="text-2xl font-bold mb-3">฿${(totalAssets - totalLiabilities).toLocaleString()}</h2>
                <div class="flex justify-between border-t border-slate-700/60 pt-3 text-xs">
                    <div>
                        <span class="text-gray-400 block">สินทรัพย์รวม</span>
                        <span class="font-semibold text-emerald-400">฿${totalAssets.toLocaleString()}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-gray-400 block">หนี้สินรวม</span>
                        <span class="font-semibold text-rose-400">฿${totalLiabilities.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"><i class="fa-solid fa-wallet mr-1 text-blue-500"></i>ภาพรวมบัญชีทั้งหมดในระบบ</h3>
            <div class="space-y-2">
                ${accounts.length > 0 ? accounts.map(acc => `
                    <div class="bg-gray-50 border border-gray-100 p-3 rounded-xl flex justify-between items-center">
                        <div>
                            <span class="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">${acc.type}</span>
                            <h4 class="text-sm font-semibold text-gray-800 mt-1">${acc.name}</h4>
                            <p class="text-sm font-bold ${acc.type==='CREDIT'?'text-rose-500':'text-emerald-600'}">฿${acc.balance.toLocaleString()}</p>
                        </div>
                        <div class="flex space-x-1">
                            <button onclick="openEditModal('${acc.id}', '${acc.name}', ${acc.balance}, '${acc.type}')" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition text-xs" title="แก้ไขรายการ">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="handleDelete('${acc.id}')" class="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition text-xs" title="ลบรายการนี้">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-400 text-xs text-center py-4">ยังไม่มีข้อมูลในระบบ ลองกดเพิ่มข้อมูลดูกครับ</p>'}
            </div>
        </div>
    `;
}

async function handleDelete(id) {
    if (confirm('คุณต้องการลบรายการนี้จากระบบใช่หรือไม่?')) {
        const success = await deleteTransaction(id);
        if (success) {
            renderCurrentView();
        }
    }
}

async function openEditModal(id, title, amount, type) {
    let existingModal = document.getElementById('editTransactionModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div id="editTransactionModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="font-bold text-lg text-gray-800">แก้ไขข้อมูลรายการ</h3>
                    <button onclick="document.getElementById('editTransactionModal').remove()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <form onsubmit="submitEditTransaction(event, '${id}')" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">ชื่อรายการ / บัญชี</label>
                        <input type="text" id="editTitle" value="${title}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="editAmount" value="${amount}" step="any" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">ประเภท</label>
                        <select id="editType" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500">
                            <option value="CASH" ${type === 'CASH' ? 'selected' : ''}>เงินสด (CASH)</option>
                            <option value="BANK" ${type === 'BANK' ? 'selected' : ''}>ธนาคาร (BANK)</option>
                            <option value="CREDIT" ${type === 'CREDIT' ? 'selected' : ''}>บัตรเครดิต (CREDIT)</option>
                            <option value="INVESTMENT" ${type === 'INVESTMENT' ? 'selected' : ''}>ลงทุน (INVESTMENT)</option>
                            <option value="GOAL" ${type === 'GOAL' ? 'selected' : ''}>เป้าหมาย (GOAL)</option>
                        </select>
                    </div>

                    <div class="flex space-x-2 pt-2">
                        <button type="button" onclick="document.getElementById('editTransactionModal').remove()" class="w-1/2 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold transition cursor-pointer hover:bg-gray-200">ยกเลิก</button>
                        <button type="submit" class="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition cursor-pointer shadow-md">บันทึกการแก้ไข</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function submitEditTransaction(event, id) {
    event.preventDefault();
    const title = document.getElementById('editTitle').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const type = document.getElementById('editType').value;

    const success = await updateTransaction(id, { title, amount, type });

    if (success) {
        document.getElementById('editTransactionModal').remove();
        renderCurrentView();
    }
}