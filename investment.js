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
        <div class="mb-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                    <i class="fa-solid fa-chart-line"></i>
                </div>
                <div>
                    <h2 class="text-base font-bold text-gray-800">รายการเงินลงทุน</h2>
                    <p class="text-xs text-gray-400">จัดการพอร์ตหุ้น กองทุนรวม และแหล่งเงินทุน</p>
                </div>
            </div>
            <button onclick="openModal('INVESTMENT')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-xl font-medium transition cursor-pointer flex items-center gap-1 shadow-sm">
                <i class="fa-solid fa-plus"></i> เพิ่มพอร์ตลงทุน
            </button>
        </div>

        <!-- การ์ดสรุปมูลค่าพอร์ตลงทุนรวม -->
        <div class="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-5 rounded-2xl shadow-md mb-6 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 opacity-10 text-white text-8xl"><i class="fa-solid fa-chart-pie"></i></div>
            <p class="text-xs text-amber-100 mb-1 relative z-10">มูลค่าพอร์ตลงทุนรวมทั้งหมด</p>
            <h2 class="text-3xl font-bold mb-1 relative z-10">฿${totalInvestmentValue.toLocaleString()}</h2>
            <p class="text-[11px] text-amber-200 relative z-10">รวมสินทรัพย์ลงทุนทุกพอร์ตในระบบแบบเรียลไทม์</p>
        </div>

        <!-- รายการพอร์ตลงทุน -->
        <div class="grid grid-cols-1 gap-4 mb-6">
            ${invests.length > 0 ? invests.map(inv => `
                <div class="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col justify-between relative">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">พอร์ตลงทุน</span>
                            <h4 class="text-sm font-semibold text-gray-800 mt-1">${inv.name}</h4>
                        </div>
                        <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-amber-500">
                            <i class="fa-solid fa-chart-line text-xs"></i>
                        </div>
                    </div>
                    
                    <div class="my-2">
                        <p class="text-[10px] text-gray-400 mb-0.5">มูลค่าปัจจุบัน</p>
                        <h3 class="text-xl font-bold text-amber-600">฿${inv.balance.toLocaleString()}</h3>
                    </div>

                    <button onclick="openInvestmentActionModal('${inv.id}')" class="w-full mt-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs py-2 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1">
                        <i class="fa-solid fa-sliders"></i> จัดการพอร์ต / ซื้อ-ขาย
                    </button>
                </div>
            `).join('') : '<p class="text-gray-400 text-xs text-center py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">ยังไม่มีพอร์ตลงทุนในระบบ กดเพิ่มด้านบนได้เลยครับ</p>'}
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
        <div id="investmentActionModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="font-bold text-lg text-gray-800">จัดการพอร์ต: ${inv.title}</h3>
                    <button onclick="document.getElementById('investmentActionModal').remove()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div class="mb-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p class="text-[10px] text-gray-400">มูลค่าพอร์ตปัจจุบัน</p>
                    <p class="text-xl font-bold text-gray-800">฿${parseFloat(inv.amount).toLocaleString()}</p>
                </div>

                <form onsubmit="submitInvestmentAction(event, '${invId}')" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">ประเภทการทำรายการ</label>
                        <select id="invActionType" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500">
                            <option value="BUY">ซื้อเพิ่ม / เติมเงินลงทุน</option>
                            <option value="SELL">ขายออก / ถอนเงิน</option>
                        </select>
                    </div>

                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="invActionAmount" step="any" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>

                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">บันทึกช่วยจำ (Note)</label>
                        <input type="text" id="invActionNote" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500" placeholder="เช่น DCA หุ้นประจำเดือน, ขายกองทุน">
                    </div>

                    <div class="flex space-x-2 pt-2">
                        <button type="button" onclick="document.getElementById('investmentActionModal').remove()" class="w-1/2 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold transition cursor-pointer hover:bg-gray-200">ยกเลิก</button>
                        <button type="submit" class="w-1/2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition cursor-pointer shadow-md">ยืนยัน</button>
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