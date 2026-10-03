let accounts = [
    { id: "acc_bank1", name: "กสิกรไทย", type: "BANK", balance: 25000, accountNumber: "...4582" },
    { id: "acc_bank2", name: "ไทยพาณิชย์ (SCB)", type: "BANK", balance: 15000, accountNumber: "...9123" },
    { id: "acc_cash1", name: "เงินสดติดตัว", type: "CASH", balance: 1500 },
    { id: "acc_credit1", name: "บัตร KTC Visa", type: "CREDIT", balance: 5000, limit: 50000, dueDate: 10 },
    { id: "acc_invest1", name: "กองทุน S&P500", type: "INVESTMENT", balance: 50000 }
];

let goals = [
    { id: "g_food", name: "ค่าอาหารรายเดือน", type: "BUDGET", targetAmount: 8000, currentAmount: 5200 },
    { id: "g_travel", name: "ค่าเดินทาง", type: "BUDGET", targetAmount: 3000, currentAmount: 1200 },
    { id: "g_trip", name: "ทริปญี่ปุ่นปีหน้า", type: "PROJECT", targetAmount: 50000, currentAmount: 25000 }
];

let transactions = [
    { id: "tx_001", date: "วันนี้, 12:30", type: "EXPENSE", amount: 250, note: "กินชาบู", category: "ค่าอาหารรายเดือน" }
];