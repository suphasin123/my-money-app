async function renderDashboardView(container) {
    // 1. ดึงข้อมูลจริงจากตาราง transactions ใน Supabase
    const transactions = await fetchTransactions();

    // ดึงข้อมูล User ปัจจุบันมาแสดงผล
    const user = await getCurrentUser();
    const userEmail = user ? user.email : 'ผู้ใช้งานทั่วไป';

    // 2. แปลงข้อมูลจาก transactions มาจำลองเป็นโครงสร้าง accounts เพื่อให้หน้าเว็บเดิมแสดงผลต่อได้ทันที
    const accounts = transactions.map(item => ({
        id: item.id,
        name: item.title,
        type: item.type, // เช่น 'CASH', 'BANK', 'CREDIT', ฯลฯ
        balance: parseFloat(item.amount)
    }));

    let totalAssets = 0;
    let totalLiabilities = 0;
    accounts.forEach(acc => {
        if (acc.type === "CREDIT") totalLiabilities += acc.balance;
        else totalAssets += acc.balance;
    });

    const creditCards = accounts.filter(acc => acc.type === "CREDIT");

    container.innerHTML = `
        <!-- ส่วนต้อนรับและแสดงอีเมลผู้ใช้งาน -->
        <div class="mb-6 flex justify-between items-center bg-gray-800/40 border border-gray-700/50 p-4 rounded-2xl">
            <div>
                <h2 class="text-xl font-bold text-white flex items-center">
                    <i class="fa-solid fa-user-circle mr-2 text-blue-400"></i>ยินดีต้อนรับกลับมาครับ!
                </h2>
                <p class="text-xs text-gray-400 mt-0.5">บัญชีผู้ใช้: <span class="text-blue-400 font-semibold">${userEmail}</span></p>
            </div>
            <button onclick="signOut()" class="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs py-2 px-4 rounded-xl font-medium transition cursor-pointer flex items-center">
                <i class="fa-solid fa-right-from-bracket mr-1.5"></i> ออกจากระบบ
            </button>
        </div>

        <!-- แถบเตือนบิลบัตรเครดิตที่หน้า Dashboard -->
        ${creditCards.length > 0 ? `
            <div class="card-bg border border-red-500/30 p-5 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center space-x-3">
                    <div class="bg-red-500/20 p-3 rounded-xl text-red-400 text-xl"><i class="fa-solid fa-credit-card"></i></div>
                    <div>
                        <h4 class="text-base font-bold text-white">สถานะบัตรเครดิต & วันครบกำหนดชำระ</h4>
                        <p class="text-xs text-gray-400">ตรวจสอบวันตัดรอบบิลและวันจ่ายเงินเพื่อความคล่องตัวทางการเงิน</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-3">
                    ${creditCards.map(c => `
                        <div class="bg-gray-900/80 border border-gray-800 px-4 py-2 rounded-xl text-xs">
                            <span class="text-gray-300 font-bold block">${c.name}</span>
                            <span class="text-red-400">ครบกำหนด: วันที่ ${c.dueDate || '-'} </span> | <span class="text-white">หนี้: ฿${c.balance.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gradient-to-br from-indigo-900/50 to-blue-900/20 border border-indigo-500/30 p-6 rounded-2xl">
                <p class="text-gray-300 text-sm font-semibold mb-1">ความมั่งคั่งสุทธิ (NET WORTH)</p>
                <h2 class="text-4xl font-bold text-white mb-2">฿${(totalAssets - totalLiabilities).toLocaleString()}</h2>
                <p class="text-xs text-blue-400">คำนวณเรียลไทม์จาก Supabase</p>
            </div>
            <div class="card-bg border border-gray-800 p-6 rounded-2xl">
                <p class="text-gray-400 text-sm font-semibold mb-1">สินทรัพย์รวม (ASSETS)</p>
                <h2 class="text-3xl font-bold text-green-400 mb-2">฿${totalAssets.toLocaleString()}</h2>
                <p class="text-xs text-gray-500">เงินสด, ธนาคาร, ลงทุน</p>
            </div>
            <div class="card-bg border border-gray-800 p-6 rounded-2xl">
                <p class="text-gray-400 text-sm font-semibold mb-1">หนี้สินรวม (LIABILITIES)</p>
                <h2 class="text-3xl font-bold text-red-400 mb-2">฿${totalLiabilities.toLocaleString()}</h2>
                <p class="text-xs text-gray-500">ยอดค้างชำระบัตรเครดิต</p>
            </div>
        </div>

        <div class="card-bg border border-gray-800 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-4"><i class="fa-solid fa-wallet mr-2 text-blue-500"></i>ภาพรวมบัญชีทั้งหมดในระบบ</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${accounts.length > 0 ? accounts.map(acc => `
                    <div class="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start">
                                <p class="text-xs text-gray-400">${acc.type}</p>
                                <div class="flex space-x-1">
                                    <!-- ปุ่มแก้ไขรายการ -->
                                    <button onclick="openEditModal('${acc.id}', '${acc.name}', ${acc.balance}, '${acc.type}')" class="text-blue-400 hover:text-blue-300 text-xs cursor-pointer bg-blue-500/10 px-2 py-1 rounded-lg transition" title="แก้ไขรายการ">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <!-- ปุ่มลบรายการ -->
                                    <button onclick="handleDelete('${acc.id}')" class="text-red-400 hover:text-red-300 text-xs cursor-pointer bg-red-500/10 px-2 py-1 rounded-lg transition" title="ลบรายการนี้">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <h4 class="text-base font-bold text-white mt-1">${acc.name}</h4>
                            <p class="text-xl font-bold ${acc.type==='CREDIT'?'text-red-400':'text-green-400'} mt-2">฿${acc.balance.toLocaleString()}</p>
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-500 text-sm col-span-full">ยังไม่มีข้อมูลในระบบ ลองกดเพิ่มข้อมูลดูกครับ</p>'}
            </div>
        </div>
    `;
}

// ฟังก์ชันสั่งการลบและรีเฟรชหน้าจอ
async function handleDelete(id) {
    if (confirm('คุณต้องการลบรายการนี้จากระบบใช่หรือไม่?')) {
        const success = await deleteTransaction(id);
        if (success) {
            renderCurrentView(); // รีเฟรชหน้าจออัปเดตข้อมูลอัตโนมัติ
        }
    }
}

// ฟังก์ชันเปิด Modal แก้ไขข้อมูล
async function openEditModal(id, title, amount, type) {
    let existingModal = document.getElementById('editTransactionModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div id="editTransactionModal" class="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="card-bg border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">แก้ไขข้อมูลรายการ</h3>
                    <button onclick="document.getElementById('editTransactionModal').remove()" class="text-gray-400 hover:text-white cursor-pointer"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                
                <form onsubmit="submitEditTransaction(event, '${id}')" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">ชื่อรายการ / บัญชี</label>
                        <input type="text" id="editTitle" value="${title}" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="editAmount" value="${amount}" step="any" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">ประเภท</label>
                        <select id="editType" class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500">
                            <option value="CASH" ${type === 'CASH' ? 'selected' : ''}>เงินสด (CASH)</option>
                            <option value="BANK" ${type === 'BANK' ? 'selected' : ''}>ธนาคาร (BANK)</option>
                            <option value="CREDIT" ${type === 'CREDIT' ? 'selected' : ''}>บัตรเครดิต (CREDIT)</option>
                            <option value="INVESTMENT" ${type === 'INVESTMENT' ? 'selected' : ''}>ลงทุน (INVESTMENT)</option>
                            <option value="GOAL" ${type === 'GOAL' ? 'selected' : ''}>เป้าหมาย (GOAL)</option>
                        </select>
                    </div>

                    <div class="flex space-x-3 mt-6">
                        <button type="button" onclick="document.getElementById('editTransactionModal').remove()" class="w-1/2 bg-gray-700 text-white py-2.5 rounded-xl cursor-pointer">ยกเลิก</button>
                        <button type="submit" class="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl cursor-pointer font-bold">บันทึกการแก้ไข</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ฟังก์ชันส่งข้อมูลอัปเดตไปที่ Supabase
async function submitEditTransaction(event, id) {
    event.preventDefault();
    const title = document.getElementById('editTitle').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const type = document.getElementById('editType').value;

    const success = await updateTransaction(id, { title, amount, type });

    if (success) {
        document.getElementById('editTransactionModal').remove();
        renderCurrentView(); // รีเฟรชหน้าจอแสดงผลข้อมูลใหม่ทันที
    }
}