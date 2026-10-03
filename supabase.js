const SUPABASE_URL = 'https://ikwfevfzksurkiiuqdet.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gLwKi76OAbw083XMwGDCCQ_i8pKSRl9';

// เปลี่ยนมาใช้ตัวแปรชื่อ db แทน จะได้ไม่ซ้ำกับระบบอื่น
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// โค้ดทดสอบการเชื่อมต่อ (ปิดจบตรงนี้ให้เรียบร้อย)
db.from('_not_exists_table').select('*').then(({ error }) => {
    if (error && error.code === 'PGRST116') {
        console.log('✅ เชื่อมต่อกับ Supabase สำเร็จแล้ว!');
    } else if (error) {
        console.log('⚠️ เชื่อมต่อได้ แต่มีข้อความแจ้งเตือน:', error.message);
    } else {
        console.log('✅ เชื่อมต่อกับ Supabase สำเร็จแล้ว!');
    }
});

// ==========================================
// ฟังก์ชันจัดการข้อมูล Transactions กับ Supabase (วางไว้นอกวงเล็บทดสอบ)
// ==========================================

// 1. ฟังก์ชันดึงข้อมูลทั้งหมดของ user คนนั้นๆ
async function fetchTransactions() {
    const { data, error } = await db
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ ดึงข้อมูลไม่สำเร็จ:', error.message);
        return [];
    }
    return data;
}

// 2. ฟังก์ชันเพิ่มรายการใหม่ (รายรับ/รายจ่าย)
async function addTransaction(title, amount, type) {
    const { data, error } = await db
        .from('transactions')
        .insert([
            { title: title, amount: parseFloat(amount), type: type }
        ]);

    if (error) {
        console.error('❌ บันทึกข้อมูลไม่สำเร็จ:', error.message);
        alert('บันทึกข้อมูลไม่สำเร็จ: ' + error.message);
        return false;
    }
    
    console.log('✅ บันทึกข้อมูลสำเร็จ!', data);
    return true;
}
// 3. ฟังก์ชันดึงข้อมูลเฉพาะประเภทที่ต้องการ (เช่น เฉพาะ BANK หรือ CREDIT)
async function fetchTransactionsByType(type) {
    const { data, error } = await db
        .from('transactions')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`❌ ดึงข้อมูลประเภท ${type} ไม่สำเร็จ:`, error.message);
        return [];
    }
    return data;
}
// 4. ฟังก์ชันสำหรับลบรายการออกจากตาราง transactions ตาม ID
async function deleteTransaction(id) {
    const { error } = await db
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('❌ ลบข้อมูลไม่สำเร็จ:', error.message);
        alert('ลบข้อมูลไม่สำเร็จ: ' + error.message);
        return false;
    }
    
    console.log('✅ ลบข้อมูลสำเร็จ!');
    return true;
}
// 5. ฟังก์ชันสำหรับแก้ไข/อัปเดตข้อมูลในตาราง transactions ตาม ID
async function updateTransaction(id, updatedData) {
    const { data, error } = await db
        .from('transactions')
        .update(updatedData)
        .eq('id', id);

    if (error) {
        console.error('❌ แก้ไขข้อมูลไม่สำเร็จ:', error.message);
        alert('แก้ไขข้อมูลไม่สำเร็จ: ' + error.message);
        return false;
    }
    
    console.log('✅ แก้ไขข้อมูลสำเร็จ!', data);
    return true;
}
// 6. ฟังก์ชันสมัครสมาชิกด้วย Email / Password
async function signUp(email, password) {
    const { data, error } = await db.auth.signUp({ email, password });
    if (error) {
        alert('สมัครสมาชิกไม่สำเร็จ: ' + error.message);
        return false;
    }
    alert('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน หรือเข้าสู่ระบบได้เลย');
    return true;
}

// 7. ฟังก์ชันเข้าสู่ระบบด้วย Email / Password
async function signIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
        alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
        return false;
    }
    console.log('✅ เข้าสู่ระบบสำเร็จ:', data.user);
    return true;
}

// 8. ฟังก์ชันออกจากระบบ
async function signOut() {
    const { error } = await db.auth.signOut();
    if (error) {
        console.error('❌ ออกจากระบบไม่สำเร็จ:', error.message);
        return;
    }
    window.location.reload(); // รีเฟรชหน้าจอเพื่อกลับไปหน้า Login
}

// 9. ฟังก์ชันตรวจสอบผู้ใช้งานปัจจุบัน
async function getCurrentUser() {
    const { data: { session } } = await db.auth.getSession();
    return session ? session.user : null;
}