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
                    <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center space-x-3 text-red-400">
                        <i class="fa-solid fa-triangle-exclamation text-xl shrink-0"></i>
                        <span class="text-sm font-semibold">${msg}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <!-- หัวข้อหน้าจอ -->
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fa-solid fa-bullseye mr-3 text-orange-500"></i>รายการเป้าหมาย & งบประมาณ
                </h2>
                <p class="text-sm text-gray-400 mt-1">ติดตามการออม คุมงบประมาณรายจ่าย และแจ้งเตือนอัตโนมัติเมื่อถึงเป้าหรือเกินงบ</p>
            </div>
            <button onclick="openModal('GOAL')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition shadow-lg cursor-pointer flex items-center">
                <i class="fa-solid fa-plus mr-2"></i> สร้างเป้าหมาย / งบประมาณ
            </button>
        </div>

        <!-- รายการเป้าหมายทั้งหมด -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            ${goals.length > 0 ? goals.map(g => {
                const percent = ((g.currentAmount / g.targetAmount) * 100).toFixed(1);
                const isBudget = g.type === "BUDGET";
                const isOverBudget = isBudget && g.currentAmount > g.targetAmount;
                const isGoalCompleted = !isBudget && g.currentAmount >= g.targetAmount;

                // กำหนดสีตามสถานะ
                let barColor = isBudget ? "bg-orange-500" : "bg-indigo-500";
                if (isOverBudget) barColor = "bg-red-500";
                if (isGoalCompleted) barColor = "bg-green-500";

                const badgeColor = isBudget ? (isOverBudget ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-orange-500/20 text-orange-400") : (isGoalCompleted ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-indigo-500/20 text-indigo-400");
                
                const badgeText = isBudget 
                    ? (isOverBudget ? "🚨 งบประมาณ (เกินงบแล้ว!)" : "📉 งบประมาณรายจ่าย (Budget)") 
                    : (isGoalCompleted ? "🎯 เป้าหมายการออม (สำเร็จแล้ว!)" : "💰 เป้าหมายการออม (Project)");

                const label = isBudget ? "ใช้ไปแล้ว" : "เก็บได้แล้ว";

                return `
                    <div class="card-bg border ${isOverBudget ? 'border-red-500/60' : isGoalCompleted ? 'border-green-500/60' : 'border-gray-700/60'} p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden transition">
                        <div>
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <span class="text-xs px-2.5 py-1 rounded-lg font-medium ${badgeColor} inline-block mb-2">${badgeText}</span>
                                    <h4 class="text-lg font-bold text-white">${g.name}</h4>
                                </div>
                                <div class="bg-gray-900 p-2.5 rounded-xl border border-gray-700"><i class="fa-solid fa-bullseye text-orange-500"></i></div>
                            </div>
                        </div>

                        <div class="my-4">
                            <div class="flex justify-between text-xs text-gray-400 mb-2">
                                <span>${label} <strong class="${isOverBudget ? 'text-red-400' : isGoalCompleted ? 'text-green-400' : 'text-white'}">฿${g.currentAmount.toLocaleString()}</strong></span>
                                <span>เป้าหมายสูงสุด: ฿${g.targetAmount.toLocaleString()} (${percent}%)</span>
                            </div>
                            <div class="w-full bg-gray-800 rounded-full h-3 shadow-inner border border-gray-700/50 overflow-hidden">
                                <div class="${barColor} h-full rounded-full transition-all duration-1000" style="width: ${Math.min(percent, 100)}%"></div>
                            </div>
                            ${isOverBudget ? `<p class="text-xs text-red-400 mt-1.5 font-semibold">⚠️ ใช้เกินงบไป ฿${(g.currentAmount - g.targetAmount).toLocaleString()}</p>` : ''}
                            ${isGoalCompleted ? `<p class="text-xs text-green-400 mt-1.5 font-semibold">🎉 บรรลุเป้าหมายการออมเรียบร้อยแล้ว!</p>` : ''}
                        </div>

                        <button onclick="openAddGoalFundModal('${g.id}')" class="w-full bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 text-xs py-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center">
                            <i class="fa-solid fa-plus-circle mr-1.5"></i> ทำรายการเพิ่มเติม / เติมเงิน
                        </button>
                    </div>
                `;
            }).join('') : '<p class="text-gray-500">ยังไม่มีเป้าหมายในระบบ กดสร้างด้านบนได้เลย</p>'}
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
        <div id="addGoalFundModal" class="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="card-bg border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">จัดการเป้าหมาย: ${goal.title}</h3>
                    <button onclick="document.getElementById('addGoalFundModal').remove()" class="text-gray-400 hover:text-white cursor-pointer"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                
                <form onsubmit="submitGoalFund(event, '${goalId}')" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="goalFundAmount" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="0.00">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">บันทึกช่วยจำ (Note)</label>
                        <input type="text" id="goalFundNote" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500" placeholder="เช่น ออมเงินสะสม, เติมงบประมาณ">
                    </div>
                    <div class="flex space-x-3 mt-6">
                        <button type="button" onclick="document.getElementById('addGoalFundModal').remove()" class="w-1/2 bg-gray-700 text-white py-2.5 rounded-xl cursor-pointer">ยกเลิก</button>
                        <button type="submit" class="w-1/2 bg-orange-600 text-white py-2.5 rounded-xl cursor-pointer font-bold">ยืนยัน</button>
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