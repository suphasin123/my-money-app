(function() {
    const URL_VAL = 'https://ikwfevfzksurkiiuqdet.supabase.co';
    const KEY_VAL = 'sb_publishable_gLwKi76OAbw083XMwGDCCQ_i8pKSRl9';

    // เช็คว่ามี window.supabase หรือยัง ถ้ามีให้สร้าง Client ทันที
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.dbClient = window.supabase.createClient(URL_VAL, KEY_VAL);
        console.log('✅ เชื่อมต่อกับ Supabase สำเร็จแล้ว!');
    } else {
        // ถ้าจังหวะแรกยังไม่มา ให้ดึงผ่านตัวแปรหลักโดยตรง
        try {
            window.dbClient = supabase.createClient(URL_VAL, KEY_VAL);
            console.log('✅ เชื่อมต่อกับ Supabase สำเร็จแล้ว!');
        } catch (e) {
            console.error('❌ ไม่พบไลบรารี Supabase');
        }
    }
})();

// ==========================================
// ฟังก์ชันจัดการข้อมูล Transactions
// ==========================================
async function fetchTransactions() {
    if (!window.dbClient) return [];
    const { data, error } = await window.dbClient
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ ดึงข้อมูลไม่สำเร็จ:', error.message);
        return [];
    }
    return data;
}

async function addTransaction(name, amount, type, category = 'General') {
    if (!window.dbClient) {
        alert('ยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase');
        return false;
    }
    const { data, error } = await window.dbClient
        .from('transactions')
        .insert([
            { 
                title: name,           
                amount: parseFloat(amount), 
                type: type,            
                category: category     
            }
        ]);

    if (error) {
        console.error('❌ บันทึกข้อมูลไม่สำเร็จ:', error.message);
        alert('บันทึกข้อมูลไม่สำเร็จ: ' + error.message);
        return false;
    }
    
    console.log('✅ บันทึกข้อมูลสำเร็จ!', data);
    return true;
}

async function fetchTransactionsByType(type) {
    if (!window.dbClient) return [];
    const { data, error } = await window.dbClient
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

async function deleteTransaction(id) {
    if (!window.dbClient) return false;
    const { error } = await window.dbClient
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('❌ ลบข้อมูลไม่สำเร็จ:', error.message);
        alert('ลบข้อมูลไม่สำเร็จ: ' + error.message);
        return false;
    }
    return true;
}

async function updateTransaction(id, updatedData) {
    if (!window.dbClient) return false;
    const { data, error } = await window.dbClient
        .from('transactions')
        .update(updatedData)
        .eq('id', id);

    if (error) {
        console.error('❌ แก้ไขข้อมูลไม่สำเร็จ:', error.message);
        alert('แก้ไขข้อมูลไม่สำเร็จ: ' + error.message);
        return false;
    }
    return true;
}

// ==========================================
// ระบบจัดการผู้ใช้งาน (Auth) - อัปเดตใช้ window.dbClient
// ==========================================
async function signUp(email, password) {
    if (!window.dbClient) return false;
    const { data, error } = await window.dbClient.auth.signUp({ email, password });
    if (error) {
        alert('สมัครสมาชิกไม่สำเร็จ: ' + error.message);
        return false;
    }
    alert('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน');
    return true;
}

async function signIn(email, password) {
    if (!window.dbClient) return false;
    const { data, error } = await window.dbClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
        return false;
    }
    console.log('✅ เข้าสู่ระบบสำเร็จ:', data.user);
    return true;
}

async function signOut() {
    if (!window.dbClient) return;
    const { error } = await window.dbClient.auth.signOut();
    if (error) {
        console.error('❌ ออกจากระบบไม่สำเร็จ:', error.message);
        return;
    }
    window.location.reload();
}

async function getCurrentUser() {
    if (!window.dbClient) return null;
    const { data: { session }, error } = await window.dbClient.auth.getSession();
    if (error) {
        console.error('❌ ดึง Session ไม่สำเร็จ:', error.message);
        return null;
    }
    return session ? session.user : null;
}