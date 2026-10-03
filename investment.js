async function renderInvestmentView(container) {
    // 1. ดึงข้อมูลพอร์ตลงทุนจริงจาก Supabase (ประเภท INVESTMENT)
    const rawInvests = await fetchTransactionsByType('INVESTMENT');
    const invests = rawInvests.map(item => ({
        id: item.id,
        name: item.title,
        type: 'INVESTMENT',
        balance: parseFloat(item.amount)
    }));

    let totalInvestmentValue = invests.reduce((sum, inv) => sum + inv.balance, 0);

    container.innerHTML = `
        <!-- หัวข้อหน้าจอ -->
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fa-solid fa-chart-line mr-3 text-yellow-500"></i>รายการเงินลงทุน
                </h2>
                <p class="text-sm text-gray-400 mt-1">จัดการพอร์ตหุ้น กองทุนรวม และเชื่อมโยงแหล่งเงินทุนกับเป้าหมาย</p>
            </div>
            <button onclick="openModal('INVESTMENT')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition shadow-lg cursor-pointer flex items-center">
                <i class="fa-solid fa-plus mr-2"></i> เพิ่มพอร์ตลงทุน
            </button>
        </div>

        <!-- การ์ดสรุปมูลค่าพอร์ตลงทุนรวม -->
        <div class="bg-gradient-to-br from-yellow-900/30 to-amber-900/10 border border-yellow-500/30 p-6 rounded-2xl mb-8 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 opacity-10 text-white text-9xl"><i class="fa-solid fa-chart-pie"></i></div>
            <p class="text-gray-300 text-sm font-semibold mb-1 relative z-10">มูลค่าพอร์ตลงทุนรวมทั้งหมด (TOTAL PORTFOLIO)</p>
            <h2 class="text-4xl font-bold text-yellow-400 mb-2 relative z-10">฿${totalInvestmentValue.toLocaleString()}</h2>
            <p class="text-xs text-gray-400 relative z-10">รวมสินทรัพย์ลงทุนทุกพอร์ตในระบบเรียลไทม์ผ่าน Supabase</p>
        </div>

        <!-- รายการพอร์ตลงทุน -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            ${invests.length > 0 ? invests.map(inv => `
                <div class="card-bg border border-gray-700/60 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-yellow-500/50 transition">
                    <div class="absolute -right-3 -bottom-3 opacity-5 text-white text-8xl"><i class="fa-solid fa-chart-line"></i></div>
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="text-lg font-bold text-white">${inv.name}</h4>
                                <p class="text-xs text-gray-400">พอร์ตลงทุน / กองทุน</p>
                            </div>
                            <div class="bg-gray-900 p-2.5 rounded-xl border border-gray-700"><i class="fa-solid fa-chart-line text-yellow-500"></i></div>
                        </div>
                    </div>
                    
                    <div class="mt-6 mb-4">
                        <p class="text-xs text-gray-500 mb-1">มูลค่าปัจจุบัน</p>
                        <h3 class="text-3xl font-bold text-white">฿${inv.balance.toLocaleString()}</h3>
                    </div>

                    <button onclick="openInvestmentActionModal('${inv.id}')" class="w-full bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs py-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center">
                        <i class="fa-solid fa-sliders mr-1.5"></i> จัดการพอร์ต / ซื้อ-ขาย
                    </button>
                </div>
            `).join('') : '<p class="text-gray-500">ยังไม่มีพอร์ตลงทุนในระบบ กดเพิ่มด้านบนได้เลย</p>'}
        </div>
    `;
}

// Modal ทำรายการพอร์ตลงทุน
async function openInvestmentActionModal(invId) {
    const rawInvests = await fetchTransactionsByType('INVESTMENT');
    const inv = rawInvests.find(a => a.id == invId);
    if(!inv) return;

    let existingModal = document.getElementById('investmentActionModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div id="investmentActionModal" class="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="card-bg border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">จัดการพอร์ต: ${inv.title}</h3>
                    <button onclick="document.getElementById('investmentActionModal').remove()" class="text-gray-400 hover:text-white cursor-pointer"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                
                <div class="mb-4 bg-gray-800/60 p-3 rounded-xl border border-gray-700">
                    <p class="text-xs text-gray-400">มูลค่าพอร์ตปัจจุบัน</p>
                    <p class="text-2xl font-bold text-yellow-400">฿${parseFloat(inv.amount).toLocaleString()}</p>
                </div>

                <form onsubmit="submitInvestmentAction(event, '${invId}')" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">ประเภทการทำรายการ</label>
                        <select id="invActionType" class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500">
                            <option value="BUY">ซื้อเพิ่ม / เติมเงินลงทุน</option>
                            <option value="SELL">ขายออก / ถอนเงิน</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="invActionAmount" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">บันทึกช่วยจำ (Note)</label>
                        <input type="text" id="invActionNote" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="เช่น DCA หุ้นประจำเดือน, ขายกองทุน">
                    </div>

                    <div class="flex space-x-3 mt-6">
                        <button type="button" onclick="document.getElementById('investmentActionModal').remove()" class="w-1/2 bg-gray-700 text-white py-2.5 rounded-xl cursor-pointer">ยกเลิก</button>
                        <button type="submit" class="w-1/2 bg-yellow-600 text-white py-2.5 rounded-xl cursor-pointer font-bold">ยืนยัน</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function submitInvestmentAction(e, invId) {
    e.preventDefault();
    const actionType = document.getElementById('invActionType').value;
    const amount = parseFloat(document.getElementById('invActionAmount').value);
    const note = document.getElementById('invActionNote').value;

    const success = await addTransaction(`[ลงทุน] ${note}`, amount, actionType === 'BUY' ? 'INVESTMENT_BUY' : 'INVESTMENT_SELL');

    if (success) {
        document.getElementById('investmentActionModal').remove();
        renderCurrentView();
    }
}