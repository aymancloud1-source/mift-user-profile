import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjEidXDDCx511IjaUFtClI6vEVYShjE0U",
  authDomain: "mift-user-profile.firebaseapp.com",
  projectId: "mift-user-profile",
  storageBucket: "mift-user-profile.firebasestorage.app",
  messagingSenderId: "263537598178",
  appId: "1:263537598178:web:ade168e9ca1b3ab54188bb",
  measurementId: "G-GQKEKZYZHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
try { analytics = getAnalytics(app); } catch (e) {}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper
const $ = (id) => document.getElementById(id);

// Sections
const authSection = $("authSection");
const dashboardSection = $("dashboardSection");
const authMessage = $("authMessage");
const globalMessage = $("globalMessage");

const currentUserNameEl = $("currentUserName");
const currentUserRoleEl = $("currentUserRole");

let currentUser = null;
let currentUserProfile = null;
let selectedEmployeeId = null;
let selectedEmployeeData = null;

// Messages
function showMessage(el, type, text) {
    if (!el) return;
    el.classList.remove("error", "success", "info", "visible");
    if (!text) return;
    el.textContent = text;
    el.classList.add(type, "visible");
}

// Tabs
document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const tabId = btn.dataset.tab;
        document.querySelectorAll(".tab-content").forEach(tab => {
            tab.classList.toggle("active", tab.id === tabId);
        });
    });
});

// Navigation
const navItems = document.querySelectorAll(".nav-item[data-screen]");
const screens = document.querySelectorAll(".screen");

navItems.forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.screen;

        navItems.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        screens.forEach(s => {
            s.classList.toggle("active", s.id === target);
            s.classList.toggle("hidden", s.id !== target);
        });
    });
});

// Apply permissions
function applyRoleVisibility() {
    if (!currentUserProfile) return;
    const role = currentUserProfile.role;

    navItems.forEach(btn => btn.classList.remove("hidden"));

    if (role === "admin") {
        // See everything
    }

    else if (role === "store") {
        navItems.forEach(btn => {
            if (btn.dataset.screen !== "storesScreen") {
                btn.classList.add("hidden");
            }
        });
    }

    else if (role === "user") {
        navItems.forEach(btn => {
            if (btn.dataset.screen !== "searchScreen") {
                btn.classList.add("hidden");
            }
        });
    }

    const firstVisible = Array.from(navItems)
        .find(btn => !btn.classList.contains("hidden") && btn.dataset.screen);

    if (firstVisible) firstVisible.click();
}

// Register
$("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(authMessage, "info", "جاري إنشاء الحساب...");

    const name = $("registerName").value.trim();
    const email = $("registerEmail").value.trim();
    const password = $("registerPassword").value.trim();
    const role = $("registerRole").value;
    const master = $("systemMasterPassword").value.trim();

    if (master !== "MIFTsuper@dmin123") {
        showMessage(authMessage, "error", "كلمة السر الخاصة بمسؤول النظام غير صحيحة.");
        return;
    }

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            name,
            email,
            role
        });

        showMessage(authMessage, "success", "تم إنشاء الحساب بنجاح.");
    } catch (err) {
        showMessage(authMessage, "error", "خطأ: " + err.message);
    }
});

// Login
$("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(authMessage, "info", "جاري تسجيل الدخول...");

    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage(authMessage, "success", "تم تسجيل الدخول.");
    } catch (err) {
        showMessage(authMessage, "error", "خطأ تسجيل الدخول: " + err.message);
    }
});

// Logout
$("logoutButton").addEventListener("click", async () => {
    await signOut(auth);
});

// Auth state
onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        currentUserProfile = userDoc.exists() ? userDoc.data() : null;

        authSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");

        currentUserNameEl.textContent = currentUserProfile?.name || user.email;

        currentUserRoleEl.textContent =
            currentUserProfile?.role === "admin" ? "مدير النظام" :
            currentUserProfile?.role === "store" ? "مسؤول المخازن" :
            "مستخدم";

        applyRoleVisibility();
        await loadEmployeesList();
        await loadStoresList();
        populateEmployeeSelect();
    }

    else {
        authSection.classList.remove("hidden");
        dashboardSection.classList.add("hidden");
    }
});

// --------------------------
// Employees
// --------------------------

$("employeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const emp = {
        name: $("empName").value.trim(),
        national_id: $("empNationalId").value.trim(),
        job_title: $("empJob").value.trim(),
        sector: $("empSector").value.trim(),
        central_admin: $("empCentralAdmin").value.trim(),
        general_admin: $("empGeneralAdmin").value.trim(),
        sub_admin: $("empSubAdmin").value.trim(),
        phone: $("empPhone").value.trim(),
        location: $("empLocation").value.trim()
    };

    if (!emp.name || !emp.national_id) {
        showMessage(globalMessage, "error", "الاسم والرقم القومي مطلوبان.");
        return;
    }

    try {
        await setDoc(doc(db, "employees", emp.national_id), emp, { merge: true });
        showMessage(globalMessage, "success", "تم حفظ بيانات الموظف.");
        await loadEmployeesList();
        populateEmployeeSelect();
    } catch (err) {
        showMessage(globalMessage, "error", "خطأ: " + err.message);
    }
});

async function loadEmployeesList() {
    const tbody = document.querySelector("#employeesTable tbody");
    tbody.innerHTML = "";

    const snap = await getDocs(collection(db, "employees"));

    snap.forEach(docSnap => {
        const emp = docSnap.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.national_id}</td>
            <td>${emp.job_title || ""}</td>
            <td>${emp.sector || ""}</td>
        `;

        tbody.appendChild(tr);
    });
}

// Search employees table
$("employeeSearch").addEventListener("input", (e) => {
    const value = e.target.value.trim();
    const rows = document.querySelectorAll("#employeesTable tbody tr");

    rows.forEach(row => {
        const text = row.textContent;
        row.style.display = text.includes(value) ? "" : "none";
    });
});

// --------------------------
// Assets
// --------------------------

async function populateEmployeeSelect() {
    const select = $("employeeSelect");
    select.innerHTML = `<option value="">اختر موظفًا</option>`;

    const snap = await getDocs(collection(db, "employees"));

    snap.forEach(docSnap => {
        const emp = docSnap.data();
        const opt = document.createElement("option");
        opt.value = docSnap.id;
        opt.textContent = `${emp.name} - ${emp.national_id}`;
        select.appendChild(opt);
    });
}

$("employeeSelect").addEventListener("change", (e) => {
    const id = e.target.value;
    setSelectedEmployee(id);
});

async function setSelectedEmployee(id) {
    if (!id) return;

    const empDoc = await getDoc(doc(db, "employees", id));
    if (!empDoc.exists()) return;

    selectedEmployeeId = id;
    selectedEmployeeData = empDoc.data();

    const info = $("selectedEmployeeInfo");
    info.textContent =
        `الموظف المحدد: ${selectedEmployeeData.name} - ${selectedEmployeeData.national_id}`;
    info.classList.remove("hidden");
    info.classList.add("visible");

    $("assetsForms").classList.remove("hidden");
}

// Search by NID/Name
$("assetSearchButton").addEventListener("click", async () => {
    const nid = $("assetSearchNationalId").value.trim();
    const name = $("assetSearchName").value.trim();

    let foundId = null;

    if (nid) {
        const docSnap = await getDoc(doc(db, "employees", nid));
        if (docSnap.exists()) foundId = docSnap.id;
    }

    else if (name) {
        const qRef = query(collection(db, "employees"), where("name", "==", name));
        const snap = await getDocs(qRef);

        snap.forEach(d => {
            if (!foundId) foundId = d.id;
        });
    }

    if (foundId) {
        $("employeeSelect").value = foundId;
        setSelectedEmployee(foundId);
    } else {
        showMessage(globalMessage, "error", "لم يتم العثور على الموظف.");
    }
});

// Handle asset save
async function handleAssetFormSubmit(e) {
    e.preventDefault();

    if (!selectedEmployeeId) {
        showMessage($("assetsMessage"), "error", "اختر الموظف أولاً.");
        return;
    }

    const form = e.target;
    const type = form.dataset.assetType;

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        if (key !== "pdf") data[key] = value;
    });

    let pdfUrl = null;
    const pdfFile = form.querySelector('input[name="pdf"]')?.files[0];

    if (pdfFile) {
        const path = `assets/${selectedEmployeeId}/${type}/${Date.now()}_${pdfFile.name}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, pdfFile);
        pdfUrl = await getDownloadURL(storageRef);
    }

    const assetDoc = {
        employee_id: selectedEmployeeId,
        type,
        ...data
    };

    if (pdfUrl) assetDoc.pdfUrl = pdfUrl;

    await addDoc(collection(db, "employees", selectedEmployeeId, "assets"), assetDoc);

    showMessage($("assetsMessage"), "success", "تم إضافة العهدة.");
    form.reset();
}

document.querySelectorAll(".asset-form")
    .forEach(f => f.addEventListener("submit", handleAssetFormSubmit));

// --------------------------
// Search Screen
// --------------------------

$("searchEmployeeButton").addEventListener("click", async () => {
    const nid = $("searchNationalId").value.trim();
    const name = $("searchName").value.trim();

    let empDocSnap = null;

    if (nid) {
        const snap = await getDoc(doc(db, "employees", nid));
        if (snap.exists()) empDocSnap = snap;
    }

    else if (name) {
        const qRef = query(collection(db, "employees"), where("name", "==", name));
        const snap = await getDocs(qRef);

        snap.forEach(d => { if (!empDocSnap) empDocSnap = d; });
    }

    if (!empDocSnap) {
        showMessage(globalMessage, "error", "لا يوجد موظف بهذه البيانات.");
        return;
    }

    const emp = empDocSnap.data();
    const empId = empDocSnap.id;

    $("searchEmployeeInfo").innerHTML = `
        <p><strong>الاسم:</strong> ${emp.name}</p>
        <p><strong>الرقم القومي:</strong> ${emp.national_id}</p>
        <p><strong>الوظيفة:</strong> ${emp.job_title || ""}</p>
        <p><strong>القطاع:</strong> ${emp.sector || ""}</p>
    `;

    const assetsDiv = $("searchAssetsInfo");
    assetsDiv.innerHTML = "جاري التحميل...";

    const assetsSnap = await getDocs(collection(db, "employees", empId, "assets"));

    if (assetsSnap.empty) {
        assetsDiv.textContent = "لا توجد عهد مسجلة.";
    } else {
        const list = document.createElement("ul");

        assetsSnap.forEach(a => {
            const asset = a.data();
            const li = document.createElement("li");

            li.innerHTML = `
                <strong>النوع:</strong> ${asset.type}
                — <strong>بيانات:</strong> ${JSON.stringify(asset)}
                — ${
                    asset.pdfUrl
                        ? `<a href="${asset.pdfUrl}" target="_blank">PDF</a>`
                        : "بدون استمارة"
                }
            `;

            list.appendChild(li);
        });

        assetsDiv.innerHTML = "";
        assetsDiv.appendChild(list);
    }

    $("searchResult").classList.remove("hidden");
});

// --------------------------
// Stores Screen
// --------------------------

$("storeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(globalMessage, "info", "جارٍ الحفظ...");

    let pdfUrl = null;
    const pdfFile = $("storePdf").files[0];

    if (pdfFile) {
        const path = `stores/${Date.now()}_${pdfFile.name}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, pdfFile);
        pdfUrl = await getDownloadURL(storageRef);
    }

    const store = {
        dept_name: $("storeDeptName").value.trim(),
        store_name: $("storeName").value.trim(),
        asset_type: $("storeAssetType").value.trim(),
        permission_no: $("storePermissionNo").value.trim(),
        request_date: $("storeRequestDate").value.trim(),
        request_type: $("storeRequestType").value.trim(),
        requester_name: $("storeRequesterName").value.trim(),
        requester_nid: $("storeRequesterNid").value.trim(),
        receiver_name: $("storeReceiverName").value.trim(),
        receiver_nid: $("storeReceiverNid").value.trim(),
        description: $("storeDescription").value.trim()
    };

    if (pdfUrl) store.pdfUrl = pdfUrl;

    await addDoc(collection(db, "stores"), store);

    showMessage(globalMessage, "success", "تم الحفظ بنجاح.");
    loadStoresList();
    e.target.reset();
});

async function loadStoresList() {
    const tbody = document.querySelector("#storesTable tbody");
    tbody.innerHTML = "";

    const snap = await getDocs(collection(db, "stores"));

    snap.forEach(docSnap => {
        const s = docSnap.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${s.dept_name || ""}</td>
            <td>${s.store_name || ""}</td>
            <td>${s.asset_type || ""}</td>
            <td>${s.permission_no || ""}</td>
            <td>${s.request_date || ""}</td>
        `;

        tbody.appendChild(tr);
    });
}
