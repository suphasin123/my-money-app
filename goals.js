async function renderGoalsView(container) {
    // 1. ดึงข้อมูลเป้าหมายและงบประมาณจริงจาก Supabase (ประเภท GOAL)
    const rawGoals = await fetchTransactionsByType('GOAL');
    const goals = rawGoals.map(item => ({
        id: item.id,
        name: item.title,
        type: 'PROJECT', // สามารถปรับตั้งค่าตามประเภทได้
        targetAmount: 10000, // ค่าเป้าหมายตั้งต้น
        currentAmount: parseFloat(item.amount)
    }));

    // ตรวจสอบแจ้งเตือนสถานะเป้าหมาย/งบประมาณ
    let alertMessages = [];
    goals.forEach(g => {
        if (g.type === "BUDGET" && g.currentAmount > g.targetAmount) {
            alertMessages.push(`⚠️ งบประมาณ "${g.name}" ถูกใช้เกินวงเงินแล้ว! (ใช้ไป ฿${g.currentAmount.toLocaleString()} / งบ ฿${g.targetAmount.toLocaleString()})`);
        } else if (g.type === "PROJECT" && g.currentAmount >= g.targetAmount) {
            alertMessages.push(`🎉 ยินดีด้วย! เป้าหมายการออม "${g.name}" สำเร็จลุล่วงแล้ว! (เก็บได้ ฿${g.currentAmount.toLocaleString()})`);
        }
    });

    container.innerHTML = `
        <!-- แถบแจ้งเตือนสถานะเป้าหมายและงบประมาณ -->
        ${alertMessages.length > 0 ? `
            <div class="mb-6 space-y-2">
                ${alertMessages.map(msg => `
                    <div class="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center space-x-3 text-xs text-rose-700">
                        <i class="fa-solid fa-triangle-exclamation text-base shrink-0 text-rose-600"></i>
                        <span class="font-semibold">${msg}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <!-- หัวข้อหน้าจอ -->
        <div class="mb-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg">
                    <i class="fa-solid fa-bullseye"></i>
                </div>
                <div>
                    <h2 class="text-base font-bold text-gray-800">รายการเป้าหมาย & งบประมาณ</h2>
                    <p class="text-xs text-gray-400">ติดตามการออมและคุมงบประมาณรายจ่าย</p>
                </div>
            </div>
            <button onclick="openModal('GOAL')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-xl font-medium transition cursor-pointer flex items-center gap-1 shadow-sm">
                <i class="fa-solid fa-plus"></i> สร้างเป้าหมาย
            </button>
        </div>

        <!-- รายการเป้าหมายทั้งหมด -->
        <div class="grid grid-cols-1 gap-4 mb-6">
            ${goals.length > 0 ? goals.map(g => {
                const percent = ((g.currentAmount / g.targetAmount) * 100).toFixed(1);
                const isBudget = g.type === "BUDGET";
                const isOverBudget = isBudget && g.currentAmount > g.targetAmount;
                const isGoalCompleted = !isBudget && g.currentAmount >= g.targetAmount;

                // กำหนดสีตามสถานะ
                let barColor = isBudget ? "bg-orange-500" : "bg-indigo-500";
                if (isOverBudget) barColor = "bg-rose-500";
                if (isGoalCompleted) barColor = "bg-emerald-500";

                const badgeColor = isBudget 
                    ? (isOverBudget ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-orange-50 text-orange-600") 
                    : (isGoalCompleted ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-indigo-50 text-indigo-600");
                
                const badgeText = isBudget 
                    ? (isOverBudget ? "🚨 งบประมาณ (เกินงบแล้ว!)" : "📉 งบประมาณรายจ่าย") 
                    : (isGoalCompleted ? "🎯 เป้าหมายการออม (สำเร็จแล้ว!)" : "💰 เป้าหมายการออม");

                const label = isBudget ? "ใช้ไปแล้ว" : "เก็บได้แล้ว";

                return `
                    <div class="bg-white border ${isOverBudget ? 'border-rose-200' : isGoalCompleted ? 'border-emerald-200' : 'border-gray-100'} p-4 rounded-2xl shadow-sm flex flex-col justify-between relative transition">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeColor} inline-block mb-1.5">${badgeText}</span>
                                    <h4 class="text-sm font-semibold text-gray-800">${g.name}</h4>
                                </div>
                                <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-orange-500">
                                    <i class="fa-solid fa-bullseye text-xs"></i>
                                </div>
                            </div>
                        </div>

                        <div class="my-3 text-xs">
                            <div class="flex justify-between text-gray-400 mb-1.5">
                                <span>${label} <strong class="${isOverBudget ? 'text-rose-600' : isGoalCompleted ? 'text-emerald-600' : 'text-gray-800'}">฿${g.currentAmount.toLocaleString()}</strong></span>
                                <span>เป้าหมายสูงสุด: ฿${g.targetAmount.toLocaleString()} (${percent}%)</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div class="${barColor} h-2 rounded-full transition-all duration-500" style="width: ${Math.min(percent, 100)}%"></div>
                            </div>
                            ${isOverBudget ? `<p class="text-[10px] text-rose-600 mt-1 font-semibold">⚠️ ใช้เกินงบไป ฿${(g.currentAmount - g.targetAmount).toLocaleString()}</p>` : ''}
                            ${isGoalCompleted ? `<p class="text-[10px] text-emerald-600 mt-1 font-semibold">🎉 บรรลุเป้าหมายการออมเรียบร้อยแล้ว!</p>` : ''}
                        </div>

                        <button onclick="openAddGoalFundModal('${g.id}')" class="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs py-2 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1">
                            <i class="fa-solid fa-plus-circle"></i> ทำรายการเพิ่มเติม / เติมเงิน
                        </button>
                    </div>
                `;
            }).join('') : '<p class="text-gray-400 text-xs text-center py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">ยังไม่มีเป้าหมายในระบบ กดสร้างด้านบนได้เลยครับ</p>'}
        </div>
    `;
}

// Modal เติมเงินเข้าเป้าหมาย
async function openAddGoalFundModal(goalId) {
    const rawGoals = await fetchTransactionsByType('GOAL');
    const goal = rawGoals.find(g => g.id == goalId);
    if(!goal) return;

    let existingModal = document.getElementById('addGoalFundModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div id="addGoalFundModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="font-bold text-lg text-gray-800">จัดการเป้าหมาย: ${goal.title}</h3>
                    <button onclick="document.getElementById('addGoalFundModal').remove()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <form onsubmit="submitGoalFund(event, '${goalId}')" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="goalFundAmount" step="any" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-500 mb-1">บันทึกช่วยจำ (Note)</label>
                        <input type="text" id="goalFundNote" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500" placeholder="เช่น ออมเงินสะสม, เติมงบประมาณ">
                    </div>
                    <div class="flex space-x-2 pt-2">
                        <button type="button" onclick="document.getElementById('addGoalFundModal').remove()" class="w-1/2 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold transition cursor-pointer hover:bg-gray-200">ยกเลิก</button>
                        <button type="submit" class="w-1/2 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition cursor-pointer shadow-md">ยืนยัน</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function submitGoalFund(e, goalId) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('goalFundAmount').value);
    const note = document.getElementById('goalFundNote').value;

    const success = await addTransaction(`[เป้าหมาย] ${note}`, amount, 'GOAL');

    if (success) {
        document.getElementById('addGoalFundModal').remove();
        renderCurrentView();
    }
}