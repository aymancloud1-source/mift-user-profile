// ===========================
// Firebase Initialization
// ===========================
const firebaseConfig = {
    apiKey: "AIzaSyCjEidXDDCx511IjaUFtClI6vEVYShjE0U",
    authDomain: "mift-user-profile.firebaseapp.com",
    projectId: "mift-user-profile",
    storageBucket: "mift-user-profile.firebasestorage.app",
    messagingSenderId: "263537598178",
    appId: "1:263537598178:web:ade168e9ca1b3ab54188bb"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


// ===========================
// UI: Tabs switching
// ===========================
btnLoginTab.onclick = () => {
    loginFormBox.style.display = "block";
    registerFormBox.style.display = "none";
};
btnRegisterTab.onclick = () => {
    loginFormBox.style.display = "none";
    registerFormBox.style.display = "block";
};


// ===========================
// REGISTER NEW USER
// ===========================
registerButton.onclick = async () => {

    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const role = registerRole.value;

    if (!name || !email || !password || !role) {
        authMessage.innerText = "من فضلك أكمل كل الحقول";
        authMessage.style.color = "red";
        return;
    }

    try {
        // تسجيل حساب جديد على Firebase Auth
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        const uid = cred.user.uid;

        // حفظ بيانات الحساب في Firestore
        await db.collection("users").doc(uid).set({
            name,
            email,
            role,
            status: "pending" // في انتظار الموافقة
        });

        authMessage.innerText = "تم إنشاء الحساب — بانتظار اعتماد المدير";
        authMessage.style.color = "green";

        // تسجيل الخروج مباشرة حتى لا يدخل قبل الموافقة
        await auth.signOut();

    } catch (err) {
        authMessage.innerText = "خطأ: " + err.message;
        authMessage.style.color = "red";
    }
};


// ===========================
// LOGIN USER
// ===========================
loginButton.onclick = async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // باقي الخطوات تتم تلقائيًا في onAuthStateChanged
    } catch (err) {
        authMessage.innerText = err.message;
        authMessage.style.color = "red";
    }
};


// ===========================
// REAL-TIME AUTH MANAGER
// هذا أهم جزء — يدير الجلسات تلقائيًا
// ===========================
auth.onAuthStateChanged(async (user) => {

    if (!user) {
        // لا يوجد مستخدم مسجّل دخول
        dashboardSection.style.display = "none";
        authSection.style.display = "block";
        return;
    }

    // يوجد مستخدم — جلب بياناته من Firestore
    const doc = await db.collection("users").doc(user.uid).get();

    if (!doc.exists) {
        authMessage.innerText = "لا توجد بيانات لهذا المستخدم!";
        authMessage.style.color = "red";
        return;
    }

    const data = doc.data();

    // التأكد من حالة الحساب
    if (data.status !== "approved") {
        authMessage.innerText = "لم يتم اعتماد حسابك بعد!";
        authMessage.style.color = "red";

        await auth.signOut();
        return;
    }

    // 🔥 المستخدم معتمد — أظهر لوحة التحكم
    authSection.style.display = "none";
    dashboardSection.style.display = "block";

    currentUserName.innerText = "الاسم: " + data.name;
    currentUserRole.innerText = "الدور: " + data.role;

    // لو المستخدم مدير → اعرض جدول المستخدمين
    if (data.role === "admin") {
        loadUsersList();
    } else {
        document.getElementById("usersAdminScreen").style.display = "none";
    }
});


// ===========================
// LOAD USERS (Admin Only)
// ===========================
async function loadUsersList() {

    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";

    const snapshot = await db.collection("users").get();

    snapshot.forEach(doc => {
        const u = doc.data();
        const uid = doc.id;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.status}</td>
            <td>
                <button onclick="approveUser('${uid}')">اعتماد</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


// ===========================
// APPROVE USER (ADMIN)
// ===========================
window.approveUser = async (uid) => {
    await db.collection("users").doc(uid).update({
        status: "approved"
    });

    loadUsersList();
};


// ===========================
// LOGOUT
// ===========================
logoutButton.onclick = async () => {
    await auth.signOut(); // ينهي الجلسة بالكامل
};
