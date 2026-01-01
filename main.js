/********************************************
 * Firebase Initialization
 ********************************************/
const firebaseConfig = {
  apiKey: "AIzaSyCjEidXDDCx511IjaUFtClI6vEVYShjE0U",
  authDomain: "mift-user-profile.firebaseapp.com",
  projectId: "mift-user-profile",
  storageBucket: "mift-user-profile.appspot.com",
  messagingSenderId: "263537598178",
  appId: "1:263537598178:web:ade168e9ca1b3ab54188bb",
  measurementId: "G-GQKEKZYZHY"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const FieldValue = firebase.firestore.FieldValue;

/********************************************
 * التحقق من تحميل المكتبات - jsPDF + QRCode + html2canvas
 ********************************************/
window.addEventListener('load', () => {
  console.log("🔍 فحص المكتبات...");
  
  // فحص QRCode
  if (typeof QRCode === 'undefined') {
    console.error("❌ مكتبة QRCode لم تحمل!");
  } else {
    console.log("✅ مكتبة QRCode جاهزة");
  }

  // فحص jsPDF
  if (typeof window.jspdf === 'undefined') {
    console.error("❌ مكتبة jsPDF لم تحمل!");
  } else {
    console.log("✅ مكتبة jsPDF جاهزة");
  }

  // فحص html2canvas
  if (typeof html2canvas === 'undefined') {
    console.error("❌ مكتبة html2canvas لم تحمل!");
  } else {
    console.log("✅ مكتبة html2canvas جاهزة");
  }
});

/********************************************
 * ELEMENTS
 ********************************************/

// Sections
const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

// Auth
const authMessage = document.getElementById("authMessage");
const btnLoginTab = document.getElementById("btnLoginTab");
const btnRegisterTab = document.getElementById("btnRegisterTab");
const loginFormBox = document.getElementById("loginFormBox");
const registerFormBox = document.getElementById("registerFormBox");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerRole = document.getElementById("registerRole");

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

// Header (current user)
const currentUserNameTop = document.getElementById("currentUserNameTop");
const currentUserRoleTop = document.getElementById("currentUserRoleTop");
const logoutButtonTop = document.getElementById("logoutButtonTop");
const logoutButton = document.getElementById("logoutButton");
const backupDatabaseButton = document.getElementById("backupDatabaseButton");

// Navigation
const navItems = document.querySelectorAll(".nav-item[data-screen]");
const screens = document.querySelectorAll(".screen");

// Admin users
const usersTableBody = document.querySelector("#usersTable tbody");

// Employees
const employeeForm = document.getElementById("employeeForm");
const employeesTableBody = document.querySelector("#employeesTable tbody");
const employeeSearchInput = document.getElementById("employeeSearch");

// Edit Employee Modal
const employeeEditModal = document.getElementById("employeeEditModal");
const employeeEditForm = document.getElementById("employeeEditForm");
const employeeEditClose = document.getElementById("employeeEditClose");
const editEmpName = document.getElementById("editEmpName");
const editEmpEmail = document.getElementById("editEmpEmail");
const editEmpNationalId = document.getElementById("editEmpNationalId");
const editEmpJob = document.getElementById("editEmpJob");
const editEmpSector = document.getElementById("editEmpSector");
const editEmpCentralAdmin = document.getElementById("editEmpCentralAdmin");
const editEmpGeneralAdmin = document.getElementById("editEmpGeneralAdmin");
const editEmpSubAdmin = document.getElementById("editEmpSubAdmin");
const editEmpPhone = document.getElementById("editEmpPhone");
const editEmpLocation = document.getElementById("editEmpLocation");

// ASSETS SCREEN
const employeeSelect = document.getElementById("employeeSelect");
const selectedEmployeeInfo = document.getElementById("selectedEmployeeInfo");
const assetsForms = document.getElementById("assetsForms");
const assetSearchNationalId = document.getElementById("assetSearchNationalId");
const assetSearchName = document.getElementById("assetSearchName");
const assetSearchSerial = document.getElementById("assetSearchSerial");
const assetSearchButton = document.getElementById("assetSearchButton");
const assetsTableBody = document.querySelector("#assetsTable tbody");
const saveCurrentAssetButton = document.getElementById("saveCurrentAssetButton");

// Serial Search Results (Assets Screen)
const assetSerialSearchResults = document.getElementById("assetSerialSearchResults");
const assetSerialSearchCount = document.getElementById("assetSerialSearchCount");
const assetSerialResultsTableBody = document.querySelector("#assetSerialResultsTable tbody");


// Asset Edit Modal
const assetEditModal = document.getElementById("assetEditModal");
const assetEditForm = document.getElementById("assetEditForm");
const assetEditClose = document.getElementById("assetEditClose");
const assetEditFieldsContainer = document.getElementById("assetEditFieldsContainer");

// QR Code Elements
const generateQRAssets = document.getElementById("generateQRAssets");
const generateQRSearch = document.getElementById("generateQRSearch");
const qrCodeModal = document.getElementById("qrCodeModal");
const qrCodeClose = document.getElementById("qrCodeClose");
const qrCodeContainer = document.getElementById("qrCodeContainer");
const qrEmployeeName = document.getElementById("qrEmployeeName");
const downloadQRButton = document.getElementById("downloadQRButton");

// SEARCH SCREEN
const searchNationalId = document.getElementById("searchNationalId");
const searchName = document.getElementById("searchName");
const searchResult = document.getElementById("searchResult");
const searchEmployeeInfo = document.getElementById("searchEmployeeInfo");
const searchAssetsInfo = document.getElementById("searchAssetsInfo");
const searchEmployeeButton = document.getElementById("searchEmployeeButton");

// Serial Search (Search Screen)
const searchSerialNo = document.getElementById("searchSerialNo");
const searchSerialResults = document.getElementById("searchSerialResults");
const searchSerialCount = document.getElementById("searchSerialCount");
const searchSerialResultsTableBody = document.querySelector("#searchSerialResultsTable tbody");

// STORES
const storeForm = document.getElementById("storeForm");
const storesTableBody = document.querySelector("#storesTable tbody");

const storeDeptName = document.getElementById("storeDeptName");
const storeType = document.getElementById("storeType");
const storeMovementType = document.getElementById("storeMovementType");
const storePermissionNo = document.getElementById("storePermissionNo");
const storeRequestDate = document.getElementById("storeRequestDate");
const storeRequesterName = document.getElementById("storeRequesterName");
const storeRequesterNid = document.getElementById("storeRequesterNid");
const storeReceiverName = document.getElementById("storeReceiverName");
const storeReceiverNid = document.getElementById("storeReceiverNid");
const storeAssetCategory = document.getElementById("storeAssetCategory");
const storeDescription = document.getElementById("storeDescription");
const storePdf = document.getElementById("storePdf");

/********************************************
 * Global Variables for QR & PDF
 ********************************************/
let currentQREmployee = null;
let currentQRAssets = [];
let currentQRNationalId = null;
let currentEmployeeFullData = null;

/********************************************
 * Helper — Show Message
 ********************************************/
function showMessage(el, type, text) {
  if (!el) return;
  el.textContent = text;
  el.className = `message visible ${type}`;
}

/********************************************
 * Helper — Convert PDF to Base64
 ********************************************/
function pdfToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/********************************************
 * LOGIN / REGISTER TABS
 ********************************************/
btnLoginTab.onclick = () => {
  btnLoginTab.classList.add("active");
  btnRegisterTab.classList.remove("active");
  loginFormBox.classList.add("active");
  registerFormBox.classList.remove("active");
};

btnRegisterTab.onclick = () => {
  btnRegisterTab.classList.add("active");
  btnLoginTab.classList.remove("active");
  registerFormBox.classList.add("active");
  loginFormBox.classList.remove("active");
};

/********************************************
 * REGISTER USER (with Super Admin logic)
 ********************************************/
registerButton.onclick = async () => {
  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const roleInput = registerRole.value;

  if (!name || !email || !password || !roleInput) {
    showMessage(authMessage, "error", "برجاء إدخال جميع البيانات");
    return;
  }

  try {
    registerButton.disabled = true;

    const existing = await db.collection("users").limit(1).get();

    let status = "pending";
    let role = roleInput;
    let isSuperAdmin = false;

    if (existing.empty) {
      status = "approved";
      role = "admin";
      isSuperAdmin = true;
    }

    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    await auth.signOut();

    await db.collection("users").doc(uid).set({
      uid,
      name,
      email,
      role,
      status,
      isSuperAdmin
    });

    if (isSuperAdmin) {
      showMessage(authMessage, "success", "تم إنشاء حساب مدير النظام الرئيسي ✔");
    } else {
      showMessage(authMessage, "success", "تم إنشاء الحساب وفي انتظار الاعتماد");
    }

  } catch (e) {
    showMessage(authMessage, "error", e.message);
  } finally {
    registerButton.disabled = false;
  }
};

/********************************************
 * LOGIN
 ********************************************/
loginButton.onclick = async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showMessage(authMessage, "error", "برجاء إدخال البريد وكلمة المرور");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    showMessage(authMessage, "error", e.message);
  }
};

/********************************************
 * LOGOUT
 ********************************************/
logoutButton.onclick = async () => {
  await auth.signOut();
};

if (logoutButtonTop) {
  logoutButtonTop.onclick = async () => {
    await auth.signOut();
  };
}

/********************************************
 * AUTH STATE LISTENER
 ********************************************/
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    authSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
    return;
  }

  const snap = await db.collection("users").doc(user.uid).get();
  if (!snap.exists) {
    await auth.signOut();
    return;
  }

  const u = snap.data();

  if (u.status === "blocked") {
    showMessage(authMessage, "error", "تم إيقاف حسابك");
    await auth.signOut();
    return;
  }

  if (u.status !== "approved") {
    showMessage(authMessage, "error", "حسابك غير معتمد بعد");
    await auth.signOut();
    return;
  }

  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  // عرض الاسم والدور في الهيدر
  const roleText = u.isSuperAdmin ? "مدير النظام الرئيسي" : u.role;
  if (currentUserNameTop) currentUserNameTop.textContent = u.name;
  if (currentUserRoleTop) currentUserRoleTop.textContent = roleText;

  setupNav(u);
});

/********************************************
 * DATABASE BACKUP
 ********************************************/
if (backupDatabaseButton) {
  backupDatabaseButton.onclick = async () => {
    const progressDiv = document.getElementById('backupProgress');
    const progressText = document.getElementById('backupProgressText');
    const button = backupDatabaseButton;

    try {
      progressDiv.classList.remove('hidden');
      button.disabled = true;
      button.style.opacity = '0.5';

      progressText.textContent = 'جاري تأمين بيانات المستخدمين...';
      const usersSnap = await db.collection('users').get();
      const usersData = [];
      usersSnap.forEach(doc => usersData.push({ id: doc.id, ...doc.data() }));

      progressText.textContent = 'جاري تأمين بيانات العاملين...';
      const employeesSnap = await db.collection('employees').get();
      const employeesData = [];
      employeesSnap.forEach(doc => employeesData.push({ id: doc.id, ...doc.data() }));

      progressText.textContent = 'جاري تأمين بيانات العهد...';
      const assetsSnap = await db.collection('assets').get();
      const assetsData = [];
      assetsSnap.forEach(doc => assetsData.push({ id: doc.id, ...doc.data() }));

      progressText.textContent = 'جاري تأمين بيانات المخازن...';
      const storesSnap = await db.collection('stores').get();
      const storesData = [];
      storesSnap.forEach(doc => storesData.push({ id: doc.id, ...doc.data() }));

      progressText.textContent = 'جاري إنشاء ملف النسخة الاحتياطية...';
      const backupData = {
        backupDate: new Date().toISOString(),
        backupBy: auth.currentUser.email,
        users: usersData,
        employees: employeesData,
        assets: assetsData,
        stores: storesData,
        summary: {
          totalUsers: usersData.length,
          totalEmployees: employeesData.length,
          totalAssets: assetsData.length,
          totalStores: storesData.length
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      link.href = URL.createObjectURL(blob);
      link.download = `MIFT_Database_Backup_${timestamp}.json`;
      link.click();

      progressDiv.classList.add('hidden');
      button.disabled = false;
      button.style.opacity = '1';

      alert(`✅ تم تأمين قاعدة البيانات بنجاح!\n\n📊 الإحصائيات:\n- المستخدمين: ${usersData.length}\n- العاملين: ${employeesData.length}\n- العهد: ${assetsData.length}\n- المخازن: ${storesData.length}`);

    } catch (error) {
      console.error('خطأ في تأمين البيانات:', error);
      progressDiv.classList.add('hidden');
      button.disabled = false;
      button.style.opacity = '1';
      alert('❌ حدث خطأ أثناء تأمين البيانات: ' + error.message);
    }
  };
}


/********************************************
 * GLOBAL SCREEN NAVIGATION
 ********************************************/
function openScreen(screenId) {
  screens.forEach(s => s.classList.add("hidden"));
  navItems.forEach(btn => btn.classList.remove("active"));

  const screenEl = document.getElementById(screenId);
  if (screenEl) screenEl.classList.remove("hidden");

  const btn = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
  if (btn) btn.classList.add("active");

  switch (screenId) {
    case "usersAdminScreen":
      loadUsersList();
      break;
    case "employeesScreen":
      loadEmployees();
      loadEmployeesSelect();
      break;
    case "assetsScreen":
      loadEmployeesSelect();
      break;
    case "storesScreen":
      loadStores();
      break;
    case "searchScreen":
      break;
  }
}

/********************************************
 * ROLE-BASED NAVIGATION
 ********************************************/
function setupNav(user) {
  const roleEffective = user.isSuperAdmin ? "superadmin" : user.role;

  const roleScreens = {
    superadmin: ["usersAdminScreen", "employeesScreen", "assetsScreen", "searchScreen", "storesScreen"],
    admin: ["employeesScreen", "assetsScreen", "searchScreen", "storesScreen"],
    store: ["storesScreen"],
    user: ["searchScreen"]
  };

  const allowedScreens = roleScreens[roleEffective] || [];

  navItems.forEach(btn => {
    const scr = btn.dataset.screen;
    if (allowedScreens.includes(scr)) {
      btn.style.display = "block";
    } else {
      btn.style.display = "none";
    }
    btn.classList.remove("active");
  });

  if (allowedScreens.length === 0) {
    console.warn("No screens allowed for this role:", roleEffective);
    return;
  }

  navItems.forEach(btn => {
    btn.onclick = () => {
      const screenId = btn.dataset.screen;
      if (!allowedScreens.includes(screenId)) return;
      openScreen(screenId);
    };
  });

  let defaultScreen = "searchScreen";
  if (roleEffective === "superadmin") {
    defaultScreen = "usersAdminScreen";
  } else if (roleEffective === "admin") {
    defaultScreen = "employeesScreen";
  } else if (roleEffective === "store") {
    defaultScreen = "storesScreen";
  } else if (roleEffective === "user") {
    defaultScreen = "searchScreen";
  }

  openScreen(defaultScreen);
}

/********************************************
 * SUPER ADMIN — MANAGE USERS
 ********************************************/
async function loadUsersList() {
  if (!usersTableBody) return;
  usersTableBody.innerHTML = "";

  const snap = await db.collection("users").get();
  snap.forEach(doc => {
    const u = doc.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.status}</td>
      <td>
        <select onchange="changeRole('${u.uid}', this.value)">
          <option value="admin" ${u.role === "admin" ? "selected" : ""}>مدير</option>
          <option value="store" ${u.role === "store" ? "selected" : ""}>مخازن</option>
          <option value="user" ${u.role === "user" ? "selected" : ""}>مستخدم</option>
        </select>
      </td>
      <td>
        <button class="btn success" onclick="setStatus('${u.uid}','approved')">✔ اعتماد</button>
        <button class="btn" style="background:#eab308;color:#fff" onclick="setStatus('${u.uid}','pending')">⏳ انتظار</button>
        <button class="btn danger" onclick="setStatus('${u.uid}','blocked')">✖ إيقاف</button>
      </td>
    `;
    usersTableBody.appendChild(tr);
  });
}

window.setStatus = async (uid, status) => {
  await db.collection("users").doc(uid).update({ status });
  loadUsersList();
};

window.changeRole = async (uid, role) => {
  await db.collection("users").doc(uid).update({ role });
  loadUsersList();
};

/********************************************
 * EMPLOYEES — ADD / UPDATE
 ********************************************/
let employeesCache = [];

if (employeeForm) {
  employeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nid = document.getElementById("empNationalId").value.trim();
    const name = document.getElementById("empName").value.trim();
    const email = document.getElementById("empEmail").value.trim();

    if (!nid || !name) {
      alert("الرقم القومي والاسم مطلوبان");
      return;
    }

    await db.collection("employees").doc(nid).set({
      nationalId: nid,
      name,
      email,
      job: document.getElementById("empJob").value.trim(),
      sector: document.getElementById("empSector").value.trim(),
      centralAdmin: document.getElementById("empCentralAdmin").value.trim(),
      generalAdmin: document.getElementById("empGeneralAdmin").value.trim(),
      subAdmin: document.getElementById("empSubAdmin").value.trim(),
      phone: document.getElementById("empPhone").value.trim(),
      location: document.getElementById("empLocation").value.trim(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    alert("✅ تم حفظ الموظف بنجاح");
    employeeForm.reset();
    loadEmployees();
    loadEmployeesSelect();
  });
}

/********************************************
 * Helper — Render Employees Table
 ********************************************/
function renderEmployeesTable(list) {
  if (!employeesTableBody) return;
  employeesTableBody.innerHTML = "";

  if (!list || list.length === 0) {
    employeesTableBody.innerHTML = '<tr><td colspan="11" style="text-align:center;">لا يوجد عاملين مسجلين</td></tr>';
    return;
  }

  list.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.nationalId || ""}</td>
      <td>${e.name || ""}</td>
      <td>${e.email || ""}</td>
      <td>${e.job || ""}</td>
      <td>${e.sector || ""}</td>
      <td>${e.centralAdmin || ""}</td>
      <td>${e.generalAdmin || ""}</td>
      <td>${e.subAdmin || ""}</td>
      <td>${e.phone || ""}</td>
      <td>${e.location || ""}</td>
      <td>
        <button class="btn primary small" onclick="openEmployeeEditModal('${e.nationalId}')">✏️ تعديل</button>
        <button class="btn danger small" onclick="deleteEmployee('${e.nationalId}')">🗑️ حذف</button>
      </td>
    `;
    employeesTableBody.appendChild(tr);
  });
}

/********************************************
 * LOAD EMPLOYEE LIST
 ********************************************/
async function loadEmployees() {
  if (!employeesTableBody) return;

  employeesTableBody.innerHTML = "";
  employeesCache = [];

  const snap = await db.collection("employees").orderBy("name").get();
  snap.forEach(doc => {
    const e = doc.data();
    employeesCache.push(e);
  });

  renderEmployeesTable(employeesCache);
}

/********************************************
 * EMPLOYEE SEARCH
 ********************************************/
if (employeeSearchInput) {
  employeeSearchInput.addEventListener("input", () => {
    const term = employeeSearchInput.value.trim();
    if (!employeesTableBody) return;

    if (!term) {
      renderEmployeesTable(employeesCache);
      return;
    }

    const t = term.toLowerCase();
    const filtered = employeesCache.filter(emp => {
      return (
        (emp.name && emp.name.toLowerCase().includes(t)) ||
        (emp.nationalId && emp.nationalId.includes(term)) ||
        (emp.email && emp.email.toLowerCase().includes(t))
      );
    });

    renderEmployeesTable(filtered);
  });
}

/********************************************
 * EMPLOYEE EDIT MODAL
 ********************************************/
let editingEmployeeId = null;

function openEmployeeEditModal(nid) {
  if (!employeeEditModal) return;

  const emp = employeesCache.find(e => e.nationalId === nid);
  if (!emp) {
    alert("الموظف غير موجود!");
    return;
  }

  editingEmployeeId = nid;
  editEmpName.value = emp.name || "";
  editEmpEmail.value = emp.email || "";
  editEmpNationalId.value = emp.nationalId || "";
  editEmpJob.value = emp.job || "";
  editEmpSector.value = emp.sector || "";
  editEmpCentralAdmin.value = emp.centralAdmin || "";
  editEmpGeneralAdmin.value = emp.generalAdmin || "";
  editEmpSubAdmin.value = emp.subAdmin || "";
  editEmpPhone.value = emp.phone || "";
  editEmpLocation.value = emp.location || "";

  employeeEditModal.classList.remove("hidden");
}
window.openEmployeeEditModal = openEmployeeEditModal;

function closeEmployeeEditModal() {
  if (!employeeEditModal) return;
  employeeEditModal.classList.add("hidden");
  editingEmployeeId = null;
}

if (employeeEditClose) {
  employeeEditClose.addEventListener("click", closeEmployeeEditModal);
}

if (employeeEditModal) {
  employeeEditModal.addEventListener("click", (e) => {
    if (e.target === employeeEditModal) closeEmployeeEditModal();
  });
}

if (employeeEditForm) {
  employeeEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!editingEmployeeId) {
      alert("لم يتم تحديد موظف للتعديل");
      return;
    }

    const updated = {
      name: editEmpName.value.trim(),
      email: editEmpEmail.value.trim(),
      job: editEmpJob.value.trim(),
      sector: editEmpSector.value.trim(),
      centralAdmin: editEmpCentralAdmin.value.trim(),
      generalAdmin: editEmpGeneralAdmin.value.trim(),
      subAdmin: editEmpSubAdmin.value.trim(),
      phone: editEmpPhone.value.trim(),
      location: editEmpLocation.value.trim(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection("employees").doc(editingEmployeeId).set(updated, { merge: true });
    alert("✅ تم تحديث بيانات الموظف بنجاح");
    closeEmployeeEditModal();
    loadEmployees();
    loadEmployeesSelect();
  });
}

/********************************************
 * DELETE EMPLOYEE
 ********************************************/
async function deleteEmployee(nid) {
  if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;

  await db.collection("employees").doc(nid).delete();
  alert("✅ تم حذف الموظف بنجاح");
  loadEmployees();
  loadEmployeesSelect();
}
window.deleteEmployee = deleteEmployee;

/********************************************
 * LOAD EMPLOYEES SELECT
 ********************************************/
async function loadEmployeesSelect() {
  if (!employeeSelect) return;
  employeeSelect.innerHTML = '<option value="">-- اختر موظف --</option>';

  const snap = await db.collection("employees").orderBy("name").get();
  snap.forEach(doc => {
    const e = doc.data();
    const opt = document.createElement("option");
    opt.value = e.nationalId;
    opt.textContent = `${e.name} (${e.nationalId})`;
    employeeSelect.appendChild(opt);
  });
}

/********************************************
 * ASSETS SCREEN — SELECT EMPLOYEE
 ********************************************/
let currentAssetEmployee = null;

if (employeeSelect) {
  employeeSelect.addEventListener("change", async () => {
    const nid = employeeSelect.value;
    if (!nid) {
      currentAssetEmployee = null;
      selectedEmployeeInfo.style.display = "none";
      assetsForms.style.display = "none";
      return;
    }

    const doc = await db.collection("employees").doc(nid).get();
    if (!doc.exists) {
      alert("الموظف غير موجود");
      return;
    }

    currentAssetEmployee = doc.data();
    selectedEmployeeInfo.className = "message visible info";
    selectedEmployeeInfo.style.display = "block";
    selectedEmployeeInfo.innerHTML = `تم اختيار: <strong>${currentAssetEmployee.name}</strong> (${currentAssetEmployee.nationalId})`;
    assetsForms.style.display = "block";
    assetsForms.classList.remove("hidden");

    loadEmployeeAssets(nid);
  });
}


/********************************************
 * ASSETS SCREEN — SEARCH BY SERIAL (GLOBAL)
 ********************************************/

// Simple debounce
function debounce(fn, delay = 400) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// Convert asset object to "details" string (for rendering)
function buildAssetDetailsHTML(asset) {
  let details = "";
  for (let k in asset) {
    if (["id", "type", "pdfData", "pdfName", "createdAt"].includes(k)) continue;
    details += `<strong>${k}:</strong> ${asset[k]}<br>`;
  }
  return details || "—";
}

// Serial match across all asset fields that look like serial numbers
function assetMatchesSerial(asset, term) {
  const t = (term || "").toString().trim().toLowerCase();
  if (!t) return false;

  for (let k in asset) {
    if (["id", "type", "pdfData", "pdfName", "createdAt"].includes(k)) continue;

    const key = (k || "").toString().toLowerCase();
    const val = (asset[k] || "").toString().toLowerCase();

    // Keys that likely represent serial numbers
    const looksLikeSerialKey =
      key.includes("serial") ||
      key.includes("مسلسل") ||
      key.includes("سيريال");

    // If key looks like serial OR value contains the term (safe fallback)
    if ((looksLikeSerialKey && val.includes(t)) || (!looksLikeSerialKey && val === t)) {
      return true;
    }

    // Also allow partial match across all fields (users often type part of serial)
    if (val.includes(t)) return true;
  }

  return false;
}

// Cache employees for faster lookup during serial search
let employeesMapCache = null;
async function getEmployeesMap() {
  if (employeesMapCache) return employeesMapCache;

  const map = new Map();
  const snap = await db.collection("employees").get();
  snap.forEach(d => {
    const e = d.data() || {};
    if (e.nationalId) map.set(e.nationalId, e);
  });

  employeesMapCache = map;
  return map;
}

// Render serial search results
function renderSerialSearchResults(results, totalDocsScanned) {
  if (!assetSerialSearchResults || !assetSerialResultsTableBody) return;

  assetSerialResultsTableBody.innerHTML = "";

  const countText = `عدد النتائج: ${results.length}${typeof totalDocsScanned === "number" ? ` (تم فحص ${totalDocsScanned} موظف)` : ""}`;
  if (assetSerialSearchCount) assetSerialSearchCount.textContent = countText;

  if (results.length === 0) {
    assetSerialResultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#6b7280;">لا توجد نتائج مطابقة</td></tr>`;
    return;
  }

  results.forEach(r => {
    const tr = document.createElement("tr");

    const pdfLink = r.pdfData
      ? `<a href="${r.pdfData}" download="${r.pdfName || 'document.pdf'}" class="btn primary small">📄 تحميل</a>`
      : "—";

    tr.innerHTML = `
      <td>${r.employeeName || "—"}</td>
      <td>${r.nationalId || "—"}</td>
      <td>${r.typeLabel || "—"}</td>
      <td style="text-align:right;">${r.detailsHTML || "—"}</td>
      <td style="text-align:center;">${pdfLink}</td>
      <td>
        <button class="btn primary small" onclick="openEmployeeFromSerialSearchToAssets('${r.nationalId}')">فتح</button>
      </td>
    `;

    assetSerialResultsTableBody.appendChild(tr);
  });
}

// Open employee from serial search results
window.openEmployeeFromSerialSearchToAssets = async (nid) => {
  if (!nid) return;

  // Ensure Assets Screen is visible so employee selection UI updates properly
  try {
    openScreen("assetsScreen");
  } catch (e) {
    // ignore
  }

  if (employeeSelect) {
    employeeSelect.value = nid;
    employeeSelect.dispatchEvent(new Event("change"));

    // Hide results cards after opening employee to reduce clutter
    if (assetSerialSearchResults) assetSerialSearchResults.classList.add("hidden");
    if (searchSerialResults) searchSerialResults.classList.add("hidden");
  }
};

// Open employee from serial search results (SEARCH SCREEN) — show data in Search screen (no navigation)
window.openEmployeeFromSerialSearchInSearch = async (nid) => {
  if (!nid) return;

  // Ensure Search Screen is visible
  try {
    openScreen("searchScreen");
  } catch (e) {
    // ignore
  }

  // Put NID in the search input and trigger the normal search flow
  if (searchNationalId) searchNationalId.value = nid;
  if (searchName) searchName.value = "";

  if (searchEmployeeButton) {
    // this will render employee + assets in the Search screen result area
    searchEmployeeButton.click();
  } else {
    // fallback: do the same logic if button not found
    const doc = await db.collection("employees").doc(nid).get();
    searchResult.classList.remove("hidden");
    if (!doc.exists) {
      if (searchEmployeeInfo) searchEmployeeInfo.innerHTML = '<span style="color:red;">لم يتم العثور على الموظف</span>';
      if (searchAssetsInfo) searchAssetsInfo.innerHTML = "";
      return;
    }
    const emp = doc.data();
    currentQREmployee = emp.name;
    currentQRNationalId = emp.nationalId;
    currentEmployeeFullData = emp;

    if (searchEmployeeInfo) {
      searchEmployeeInfo.innerHTML = `
        <p><strong>الاسم:</strong> ${emp.name}</p>
        <p><strong>الرقم القومي:</strong> ${emp.nationalId}</p>
        <p><strong>البريد:</strong> ${emp.email || "—"}</p>
        <p><strong>الوظيفة:</strong> ${emp.job || "—"}</p>
        <p><strong>القطاع:</strong> ${emp.sector || "—"}</p>
        <p><strong>الإدارة المركزية:</strong> ${emp.centralAdmin || "—"}</p>
        <p><strong>الإدارة العامة:</strong> ${emp.generalAdmin || "—"}</p>
        <p><strong>الإدارة الفرعية:</strong> ${emp.subAdmin || "—"}</p>
        <p><strong>التليفون:</strong> ${emp.phone || "—"}</p>
        <p><strong>العنوان:</strong> ${emp.location || "—"}</p>
      `;
    }

    const aSnap = await db.collection("assets").doc(emp.nationalId).get();
    if (!aSnap.exists) {
      if (searchAssetsInfo) searchAssetsInfo.innerHTML = "<p>لا توجد عهد مسجلة</p>";
      currentQRAssets = [];
      return;
    }
    const items = aSnap.data().items || [];
    currentQRAssets = items;

    if (!items.length) {
      if (searchAssetsInfo) searchAssetsInfo.innerHTML = "<p>لا توجد عهد</p>";
      return;
    }

    const typesLabels = {
      "monitor": "📺 شاشات عرض",
      "desk-phone": "📞 هاتف مكتبى",
      "desktop": "🖥️ جهاز كمبيوتر مكتبى (PC)",
      "g-dell": "💻 أجهزة G-Dell",
      "p-hp": "💻 أجهزة P-HP",
      "laptop": "💼 جهاز حاسب آلي محمول (LAPTOP)",
      "printer": "🖨️ طابعة",
      "copier": "📠 ماكينة تصوير",
      "other": "📋 أصول أخرى"
    };

    let html = "<ul style='list-style:none; padding:0;'>";
    items.forEach(a => {
      let line = "<li style='background:#f9fafb; padding:1rem; margin:0.5rem 0; border-radius:0.5rem; border:1px solid #e5e7eb;'>";
      if (a.type) line += `<strong style='color:var(--blue-dark);'>${typesLabels[a.type] || a.type}</strong><br>`;
      for (let k in a) {
        if (["id", "type", "pdfData", "pdfName", "createdAt"].includes(k)) continue;
        line += `<strong>${k}:</strong> ${a[k]}<br>`;
      }
      if (a.pdfData) {
        line += `<a href="${a.pdfData}" download="${a.pdfName || 'document.pdf'}" style="color:#2563eb; text-decoration:none; font-weight:600;">📄 تحميل PDF</a>`;
      }
      line += "</li>";
      html += line;
    });
    html += "</ul>";
    if (searchAssetsInfo) searchAssetsInfo.innerHTML = html;
  }
};


// Main search function
async function searchAssetsBySerial(term) {
  const q = (term || "").trim();
  if (!assetSerialSearchResults || !assetSerialResultsTableBody) return;

  if (!q) {
    assetSerialSearchResults.classList.add("hidden");
    if (assetSerialSearchCount) assetSerialSearchCount.textContent = "";
    assetSerialResultsTableBody.innerHTML = "";
    return;
  }

  // Show results card + loading state
  assetSerialSearchResults.classList.remove("hidden");
  if (assetSerialSearchCount) assetSerialSearchCount.textContent = "جاري البحث...";
  assetSerialResultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">جاري البحث...</td></tr>`;

  try {
    const typesLabels = {
      "monitor": "📺 شاشات عرض",
      "desk-phone": "📞 هاتف مكتبى",
      "desktop": "🖥️ جهاز كمبيوتر مكتبى (PC)",
      "g-dell": "💻 أجهزة G-Dell",
      "p-hp": "💻 أجهزة P-HP",
      "laptop": "💼 جهاز حاسب آلي محمول (LAPTOP)",
      "printer": "🖨️ طابعة",
      "copier": "📠 ماكينة تصوير",
      "other": "📋 أصول أخرى"
    };

    const empMap = await getEmployeesMap();
    const assetsSnap = await db.collection("assets").get();

    const results = [];

    assetsSnap.forEach(doc => {
      const nid = doc.id;
      const data = doc.data() || {};
      const items = data.items || [];
      if (!Array.isArray(items) || items.length === 0) return;

      const emp = empMap.get(nid) || {};
      const employeeName = emp.name || "—";

      items.forEach(asset => {
        if (!asset || typeof asset !== "object") return;
        if (!assetMatchesSerial(asset, q)) return;

        results.push({
          employeeName,
          nationalId: nid,
          typeLabel: typesLabels[asset.type] || asset.type || "غير محدد",
          detailsHTML: buildAssetDetailsHTML(asset),
          pdfData: asset.pdfData || null,
          pdfName: asset.pdfName || null
        });
      });
    });

    renderSerialSearchResults(results, assetsSnap.size);

  } catch (err) {
    console.error("Serial search error:", err);
    if (assetSerialSearchCount) assetSerialSearchCount.textContent = "";
    assetSerialResultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">حدث خطأ أثناء البحث</td></tr>`;
  }
}

// Live search on input
if (assetSearchSerial) {
  const debounced = debounce(() => searchAssetsBySerial(assetSearchSerial.value), 450);
  assetSearchSerial.addEventListener("input", () => {
    // Avoid interfering with existing employee selection UI
    debounced();
  });
}



/********************************************
 * SEARCH SCREEN — GLOBAL SERIAL SEARCH
 ********************************************/
function renderSearchSerialResults(results, totalDocsScanned) {
  if (!searchSerialResults || !searchSerialResultsTableBody) return;

  searchSerialResultsTableBody.innerHTML = "";

  const countText = `عدد النتائج: ${results.length}${typeof totalDocsScanned === "number" ? ` (تم فحص ${totalDocsScanned} موظف)` : ""}`;
  if (searchSerialCount) searchSerialCount.textContent = countText;

  if (results.length === 0) {
    searchSerialResultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#6b7280;">لا توجد نتائج مطابقة</td></tr>`;
    return;
  }

  results.forEach(r => {
    const tr = document.createElement("tr");

    const pdfLink = r.pdfData
      ? `<a href="${r.pdfData}" download="${r.pdfName || 'document.pdf'}" style="color:#2563eb; text-decoration:none; font-weight:600;">📄 تحميل</a>`
      : "—";

    tr.innerHTML = `
      <td style="font-weight:600;">${r.employeeName || "—"}</td>
      <td>${r.nationalId || "—"}</td>
      <td style="font-weight:600; color:var(--blue-dark);">${r.typeLabel || "—"}</td>
      <td style="text-align:right; line-height:1.6;">${r.detailsHTML || "—"}</td>
      <td style="text-align:center;">${pdfLink}</td>
      <td style="text-align:center;">
        <button class="btn primary small" onclick="openEmployeeFromSerialSearchInSearch('${r.nationalId}')">فتح</button>
      </td>
    `;

    searchSerialResultsTableBody.appendChild(tr);
  });
}

async function searchAssetsBySerialInSearchScreen(term) {
  const q = (term || "").trim();
  if (!searchSerialResults || !searchSerialResultsTableBody) return;

  if (!q) {
    searchSerialResults.classList.add("hidden");
    if (searchSerialCount) searchSerialCount.textContent = "";
    searchSerialResultsTableBody.innerHTML = "";
    return;
  }

  searchSerialResults.classList.remove("hidden");
  if (searchSerialCount) searchSerialCount.textContent = "جاري البحث...";
  searchSerialResultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">جاري البحث...</td></tr>`;

  // نفس منطق البحث الشامل الموجود في شاشة العهد الشخصية
  const qLower = q.toLowerCase();

  const serialKeys = [
    "deviceSerial",
    "monitorSerial",
    "monitor1Serial",
    "monitor2Serial"
  ];

  const typesLabels = {
    "monitor": "📺 شاشات عرض",
    "desk-phone": "📞 هاتف مكتبى",
    "desktop": "🖥️ جهاز كمبيوتر مكتبى (PC)",
    "g-dell": "💻 أجهزة G-Dell",
    "p-hp": "💻 أجهزة P-HP",
    "laptop": "💼 جهاز حاسب آلي محمول (LAPTOP)",
    "printer": "🖨️ طابعة",
    "copier": "📠 ماكينة تصوير",
    "other": "📋 أصول أخرى"
  };

  try {
    const assetsSnap = await db.collection("assets").get();
    const results = [];

    // To map NID -> employee name quickly, scan employees once (cached per call)
    const empSnap = await db.collection("employees").get();
    const empMap = {};
    empSnap.forEach(d => {
      const e = d.data() || {};
      if (e.nationalId) empMap[e.nationalId] = e.name || "";
    });

    assetsSnap.forEach(doc => {
      const nid = doc.id;
      const data = doc.data() || {};
      const items = data.items || [];

      items.forEach(asset => {
        // find if any serial-like field matches term (partial, case-insensitive)
        let matched = false;

        // check known serial keys
        for (const k of serialKeys) {
          if (asset && asset[k] && asset[k].toString().toLowerCase().includes(qLower)) {
            matched = true;
            break;
          }
        }

        // also check any field name containing "serial" (future proof)
        if (!matched && asset) {
          for (const k in asset) {
            if (!k) continue;
            if (["id", "type", "pdfData", "pdfName", "createdAt"].includes(k)) continue;
            if (k.toLowerCase().includes("serial")) {
              const v = asset[k];
              if (v && v.toString().toLowerCase().includes(qLower)) {
                matched = true;
                break;
              }
            }
          }
        }

        if (!matched) return;

        results.push({
          employeeName: empMap[nid] || "—",
          nationalId: nid,
          typeLabel: typesLabels[asset.type] || asset.type || "غير محدد",
          detailsHTML: buildAssetDetailsHTML(asset),
          pdfData: asset.pdfData || null,
          pdfName: asset.pdfName || null
        });
      });
    });

    renderSearchSerialResults(results, assetsSnap.size);

  } catch (err) {
    console.error("Search screen serial search error:", err);
    if (searchSerialCount) searchSerialCount.textContent = "";
    searchSerialResultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">حدث خطأ أثناء البحث</td></tr>`;
  }
}

// Live search (debounced)
if (searchSerialNo) {
  const debouncedSearchScreenSerial = debounce(() => {
    const term = searchSerialNo.value.trim();
    searchAssetsBySerialInSearchScreen(term);
  }, 500);

  searchSerialNo.addEventListener("input", debouncedSearchScreenSerial);
}

/********************************************
 * ASSETS SCREEN — SEARCH BY NID/NAME
 ********************************************/
if (assetSearchButton) {
  assetSearchButton.onclick = async () => {
    const serial = assetSearchSerial ? assetSearchSerial.value.trim() : "";

    // إذا تم إدخال رقم مسلسل، يتم البحث في كل العهد لجميع الموظفين
    if (serial) {
      await searchAssetsBySerial(serial);
      return;
    }

    const nid = assetSearchNationalId.value.trim();
    const name = assetSearchName.value.trim();

    let emp = null;

    if (nid) {
      const d = await db.collection("employees").doc(nid).get();
      if (d.exists) emp = d.data();
    } else if (name) {
      // ✅ تحسين البحث بالاسم: Prefix search بدلاً من المطابقة الحرفية (==)
      // Firestore لا يدعم contains بسهولة، لذلك نستخدم startAt/endAt لبحث يبدأ بالاسم
      const normName = name.replace(/\s+/g, " ").trim();
      const snap = await db.collection("employees")
        .orderBy("name")
        .startAt(normName)
        .endAt(normName + "\uf8ff")
        .limit(10)
        .get();

      if (!snap.empty) {
        // إذا أكثر من نتيجة، نأخذ أول نتيجة (الأقرب) مع تنبيه بسيط
        emp = snap.docs[0].data();
        if (snap.size > 1) {
          console.warn("More than one employee matched name search:", snap.size);
        }
      }
    }

    if (!emp) {
      alert("لم يتم العثور على الموظف");
      return;
    }

    currentAssetEmployee = emp;
    selectedEmployeeInfo.className = "message visible info";
    selectedEmployeeInfo.style.display = "block";
    selectedEmployeeInfo.innerHTML = `تم اختيار: <strong>${emp.name}</strong> (${emp.nationalId})`;
    assetsForms.style.display = "block";
    assetsForms.classList.remove("hidden");

    loadEmployeeAssets(emp.nationalId);
  };
}

/********************************************
 * ADD ASSET - المحدث مع Base64
 ********************************************/
document.querySelectorAll(".asset-form").forEach(form => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentAssetEmployee) {
      alert("برجاء اختيار موظف أولاً");
      return;
    }

    const nid = currentAssetEmployee.nationalId;
    const type = form.getAttribute("data-asset-type");

    const fd = new FormData(form);
    const assetId = window.crypto && crypto.randomUUID ? 
      crypto.randomUUID() : 
      `asset-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let asset = {
      id: assetId,
      type: type || "other",
      createdAt: Date.now()
    };

    // جمع البيانات
    fd.forEach((v, k) => {
      if (k !== "pdf" && v && v.toString().trim() !== "") {
        asset[k] = v.toString().trim();
      }
    });

    // معالجة PDF - حفظ كـ Base64
    const pdf = fd.get("pdf");
    if (pdf && pdf.size > 0) {
      try {
        const base64 = await pdfToBase64(pdf);
        asset.pdfData = base64;
        asset.pdfName = pdf.name;
      } catch (error) {
        console.error("خطأ في تحويل PDF:", error);
        alert("حدث خطأ في رفع ملف PDF");
        return;
      }
    }

    // حفظ في Firestore
    try {
      await db.collection("assets").doc(nid).set({
        items: FieldValue.arrayUnion(asset)
      }, { merge: true });

      alert("✅ تم إضافة العهدة بنجاح");
      form.reset();
      loadEmployeeAssets(nid);
    } catch (error) {
      console.error("خطأ في الحفظ:", error);
      alert("حدث خطأ أثناء حفظ العهدة");
    }
  });
});

/********************************************
 * SAVE CURRENT ASSET BUTTON
 ********************************************/
if (saveCurrentAssetButton) {
  saveCurrentAssetButton.addEventListener("click", () => {
    const openDetails = document.querySelectorAll("#assetsForms details[open]");
    if (!openDetails || openDetails.length === 0) {
      alert("لا توجد نماذج مفتوحة");
      return;
    }

    const form = openDetails[0].querySelector("form.asset-form");
    if (!form) {
      alert("لم يتم العثور على نموذج");
      return;
    }

    form.requestSubmit();
  });
}

/********************************************
 * LOAD EMPLOYEE ASSETS - محدث بجدول عصري
 ********************************************/
async function loadEmployeeAssets(nid) {
  if (!assetsTableBody) return;

  assetsTableBody.innerHTML = "";

  const snap = await db.collection("assets").doc(nid).get();

  if (!snap.exists) {
    assetsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#6b7280;">لا توجد عهد مسجلة لهذا الموظف</td></tr>';
    return;
  }

  const items = snap.data().items || [];
  if (items.length === 0) {
    assetsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#6b7280;">لا توجد عهد مسجلة</td></tr>';
    return;
  }

  const typesLabels = {
    "monitor": "📺 شاشات عرض",
    "desk-phone": "📞 هاتف مكتبى",
    "desktop": "🖥️ جهاز كمبيوتر مكتبى (PC)",
    "g-dell": "💻 أجهزة G-Dell",
    "p-hp": "💻 أجهزة P-HP",
    "laptop": "💼 جهاز حاسب آلي محمول (LAPTOP)",
    "printer": "🖨️ طابعة",
    "copier": "📠 ماكينة تصوير",
    "other": "📋 أصول أخرى"
  };

  items.forEach(a => {
    const tr = document.createElement("tr");
    
    // نوع العهدة
    const typeCell = typesLabels[a.type] || a.type || "غير محدد";
    
    // التفاصيل
    let details = "";
    for (let k in a) {
      if (["id", "type", "pdfData", "pdfName", "createdAt"].includes(k)) continue;
      details += `<strong>${k}:</strong> ${a[k]}<br>`;
    }
    if (!details) details = "—";
    
    // PDF
    let pdfLink = "—";
    if (a.pdfData) {
      pdfLink = `<a href="${a.pdfData}" download="${a.pdfName || 'document.pdf'}" style="color:#2563eb; text-decoration:none; font-weight:600;">📄 تحميل</a>`;
    }
    
    tr.innerHTML = `
      <td style="font-weight:600;">${typeCell}</td>
      <td style="text-align:right;">${details}</td>
      <td style="text-align:center;">${pdfLink}</td>
      <td>
        <button class="btn primary small" onclick="openAssetEditModal('${nid}', '${a.id}')">✏️ تعديل</button>
        <button class="btn danger small" onclick="deleteAsset('${nid}', '${a.id}')">🗑️ حذف</button>
      </td>
    `;
    
    assetsTableBody.appendChild(tr);
  });
}

/********************************************
 * ASSET EDIT MODAL
 ********************************************/
let editingAssetNid = null;
let editingAssetId = null;

async function openAssetEditModal(nid, assetId) {
  if (!assetEditModal) return;

  const doc = await db.collection("assets").doc(nid).get();
  if (!doc.exists) {
    alert("لا توجد عهد لهذا الموظف");
    return;
  }

  const items = doc.data().items || [];
  const asset = items.find(a => a.id === assetId);

  if (!asset) {
    alert("العهدة غير موجودة");
    return;
  }

  editingAssetNid = nid;
  editingAssetId = assetId;

  // بناء الحقول ديناميكياً
  assetEditFieldsContainer.innerHTML = "";

  for (let key in asset) {
    if (["id", "type", "createdAt", "pdfData", "pdfName"].includes(key)) continue;

    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    const label = document.createElement("label");
    label.textContent = key;

    let input;
    if (key === "notes" || key.includes("ملاحظات")) {
      input = document.createElement("textarea");
      input.rows = 3;
    } else {
      input = document.createElement("input");
      input.type = "text";
    }
    
    input.name = key;
    input.value = asset[key] || "";
    input.className = "form-control";

    formGroup.appendChild(label);
    formGroup.appendChild(input);
    assetEditFieldsContainer.appendChild(formGroup);
  }

  assetEditModal.classList.remove("hidden");
}
window.openAssetEditModal = openAssetEditModal;

function closeAssetEditModal() {
  if (!assetEditModal) return;
  assetEditModal.classList.add("hidden");
  editingAssetNid = null;
  editingAssetId = null;
}

if (assetEditClose) {
  assetEditClose.addEventListener("click", closeAssetEditModal);
}

if (assetEditModal) {
  assetEditModal.addEventListener("click", (e) => {
    if (e.target === assetEditModal) closeAssetEditModal();
  });
}

if (assetEditForm) {
  assetEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!editingAssetNid || !editingAssetId) {
      alert("لم يتم تحديد عهدة للتعديل");
      return;
    }

    const doc = await db.collection("assets").doc(editingAssetNid).get();
    if (!doc.exists) return;

    let items = doc.data().items || [];
    const assetIndex = items.findIndex(a => a.id === editingAssetId);

    if (assetIndex === -1) {
      alert("العهدة غير موجودة");
      return;
    }

    // جمع القيم الجديدة
    const formData = new FormData(assetEditForm);
    const updatedFields = {};
    formData.forEach((value, key) => {
      updatedFields[key] = value.trim();
    });

    // تحديث العهدة
    items[assetIndex] = {
      ...items[assetIndex],
      ...updatedFields
    };

    await db.collection("assets").doc(editingAssetNid).set({ items });
    alert("✅ تم تعديل العهدة بنجاح");
    closeAssetEditModal();
    loadEmployeeAssets(editingAssetNid);
  });
}

/********************************************
 * DELETE ASSET
 ********************************************/
async function deleteAsset(nid, assetId) {
  if (!confirm("هل أنت متأكد من حذف هذه العهدة؟")) return;

  const doc = await db.collection("assets").doc(nid).get();
  if (!doc.exists) return;

  let items = doc.data().items || [];
  items = items.filter(a => a.id !== assetId);

  await db.collection("assets").doc(nid).set({ items });
  alert("✅ تم حذف العهدة");
  loadEmployeeAssets(nid);
}
window.deleteAsset = deleteAsset;

/********************************************
 * PDF GENERATOR - الحل النهائي مع DIV بدلاً من H1/H2
 ********************************************/
async function generateAssetsPDF(employeeName, assetsArray, nationalId, employeeData) {
  console.log("📄 بدء إنشاء PDF مع حل مشكلة العنوان...");
  
  // التحقق من المكتبات
  if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
    console.error("❌ المكتبات غير محملة");
    alert("⚠️ مكتبات PDF غير محملة. برجاء تحديث الصفحة.");
    return false;
  }

  const { jsPDF } = window.jspdf;

  try {
    // إنشاء جدول HTML مع DIV بدلاً من H1/H2
    const typesLabels = {
      "monitor": "شاشات عرض",
      "desk-phone": "هاتف مكتبى",
      "desktop": "جهاز كمبيوتر مكتبى (PC)",
      "g-dell": "أجهزة G-Dell",
      "p-hp": "أجهزة P-HP",
      "laptop": "جهاز حاسب آلي محمول (LAPTOP)",
      "printer": "طابعة",
      "copier": "ماكينة تصوير",
      "other": "أصول أخرى"
    };

    let tableHTML = `
      <div style="direction: rtl; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 30px; width: 900px; background: #fff;">
        
        <!-- Header مع اللوجو - استخدام DIV بدلاً من H1/H2 -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin-bottom: 20px;">
          <div style="flex: 1; text-align: right;">
            <div style="margin: 0; font-size: 24px; font-weight: 700; font-family: 'Tajawal', sans-serif;">وزارة الاستثمار والتجارة الخارجية</div>
            <div style="margin: 10px 0 5px 0; font-size: 18px; font-weight: 600; font-family: 'Tajawal', sans-serif;">برنامج ادارة بيانات العاملين والعهد الشخصية</div>
            <div style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; font-family: 'Tajawal', sans-serif;">MIFT USER PROFILE SYSTEM</div>
          </div>
          <div style="width: 100px; height: 100px; margin-left: 20px;">
            <img src="logo.png" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; background: white; border-radius: 50%; padding: 5px;">
          </div>
        </div>

        <!-- عنوان التقرير - استخدام DIV بدلاً من H2 -->
        <div style="background: #eef4ff; border: 2px solid #1e3a8a; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 25px;">
          <div style="margin: 0; font-size: 22px; color: #1e3a8a; font-weight: 700; font-family: 'Tajawal', sans-serif;">تقرير عهدة شخصية</div>
        </div>

        <!-- بيانات الموظف -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border: none; font-size: 15px; font-family: 'Tajawal', sans-serif;">
            <tr>
              <td style="padding: 10px; border: none; width: 50%;"><strong style="color: #1e3a8a;">الاسم:</strong> ${employeeName}</td>
              <td style="padding: 10px; border: none; width: 50%;"><strong style="color: #1e3a8a;">الوظيفة:</strong> ${employeeData.job || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: none;"><strong style="color: #1e3a8a;">الإدارة العامة:</strong> ${employeeData.generalAdmin || "—"}</td>
              <td style="padding: 10px; border: none;"><strong style="color: #1e3a8a;">الإدارة الفرعية:</strong> ${employeeData.subAdmin || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: none;"><strong style="color: #1e3a8a;">التاريخ:</strong> ${new Date().toLocaleDateString('ar-EG')}</td>
              <td style="padding: 10px; border: none;"><strong style="color: #1e3a8a;">عدد العهد:</strong> ${assetsArray.length}</td>
            </tr>
          </table>
        </div>

        <!-- جدول العهد -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; font-family: 'Tajawal', sans-serif;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 50px; font-family: 'Tajawal', sans-serif;">م</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; width: 150px; font-family: 'Tajawal', sans-serif;">نوع العهدة</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-family: 'Tajawal', sans-serif;">التفاصيل</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 100px; font-family: 'Tajawal', sans-serif;">التاريخ</th>
            </tr>
          </thead>
          <tbody>
    `;

    assetsArray.forEach((asset, idx) => {
      const typeCell = typesLabels[asset.type] || asset.type || "غير محدد";
      
      let details = "";
      for (let k in asset) {
        if (["id", "type", "pdfData", "pdfName", "createdAt"].includes(k)) continue;
        details += `<strong>${k}:</strong> ${asset[k]}<br>`;
      }
      if (!details) details = "—";

      const dateCreated = asset.createdAt ? new Date(asset.createdAt).toLocaleDateString('ar-EG') : "—";

      tableHTML += `
        <tr style="border-bottom: 1px solid #ddd; ${idx % 2 === 0 ? 'background: #f9fafb;' : 'background: #fff;'}">
          <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 600; font-family: 'Tajawal', sans-serif;">${idx + 1}</td>
          <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: 600; color: #1e3a8a; font-family: 'Tajawal', sans-serif;">${typeCell}</td>
          <td style="border: 1px solid #ddd; padding: 12px; text-align: right; line-height: 1.6; font-family: 'Tajawal', sans-serif;">${details}</td>
          <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-family: 'Tajawal', sans-serif;">${dateCreated}</td>
        </tr>
      `;
    });

    tableHTML += `
          </tbody>
        </table>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; font-size: 12px; color: #666; font-family: 'Tajawal', sans-serif;">
          <p style="margin: 5px 0;">تم إنشاء هذا التقرير من نظام إدارة العاملين والعهد الشخصية</p>
          <p style="margin: 5px 0; font-weight: 600;">MIFT USER PROFILE SYSTEM</p>
        </div>
      </div>
    `;

    // تحميل خط Tajawal من Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // انتظار تحميل الخط
    await new Promise(resolve => setTimeout(resolve, 1000));

    // إنشاء عنصر مؤقت
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = tableHTML;
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "900px";
    document.body.appendChild(tempDiv);

    console.log("📸 تحويل HTML إلى صورة...");
    
    // تحويل إلى صورة
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      letterRendering: true,
      imageTimeout: 0
    });

    console.log("📝 إنشاء PDF...");
    
    // إنشاء PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // التحقق من الطول وإضافة صفحات إضافية إذا لزم الأمر
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    // تحميل PDF
    pdf.save(`تقرير_عهدة_${employeeName}_${new Date().getTime()}.pdf`);

    console.log("✅ تم إنشاء PDF بنجاح");
    document.body.removeChild(tempDiv);
    return true;
    
  } catch (error) {
    console.error("❌ خطأ في إنشاء PDF:", error);
    alert("⚠️ حدث خطأ في إنشاء PDF. برجاء المحاولة مجدداً");
    return false;
  }
}

/********************************************
 * QR CODE GENERATION - نسخة مُصلحة
 ********************************************/

// إنشاء QR من شاشة العهد الشخصية
if (generateQRAssets) {
  generateQRAssets.addEventListener("click", async () => {
    if (!currentAssetEmployee) {
      alert("برجاء اختيار موظف أولاً");
      return;
    }

    const nid = currentAssetEmployee.nationalId;
    const snap = await db.collection("assets").doc(nid).get();

    let assets = [];
    if (snap.exists) {
      assets = snap.data().items || [];
    }

    showQRModal(currentAssetEmployee.name, assets, nid, currentAssetEmployee);
  });
}

// إنشاء QR من شاشة البحث
if (generateQRSearch) {
  generateQRSearch.addEventListener("click", async () => {
    if (!currentQREmployee || !currentQRNationalId) {
      alert("برجاء البحث عن موظف أولاً");
      return;
    }

    const empDoc = await db.collection("employees").doc(currentQRNationalId).get();
    const empData = empDoc.exists ? empDoc.data() : {};

    showQRModal(currentQREmployee, currentQRAssets, currentQRNationalId, empData);
  });
}

// إظهار QR Modal
function showQRModal(employeeName, assetsArray, nationalId, employeeData) {
  console.log("📱 بدء إنشاء QR Code...");
  
  if (!qrCodeModal || !qrCodeContainer) {
    alert("⚠️ عناصر QR غير موجودة");
    return;
  }

  if (typeof QRCode === 'undefined') {
    alert("⚠️ مكتبة QR Code غير محملة.\nبرجاء تحديث الصفحة (Ctrl+F5)");
    return;
  }

  // حفظ البيانات
  currentQREmployee = employeeName;
  currentQRAssets = assetsArray;
  currentQRNationalId = nationalId;
  currentEmployeeFullData = employeeData;

  if (qrEmployeeName) {
    qrEmployeeName.textContent = `الموظف: ${employeeName}`;
  }

  qrCodeContainer.innerHTML = "";
  
  // بيانات QR مختصرة
  let qrData = `${employeeName} - ${assetsArray.length} assets`;

  try {
    setTimeout(() => {
      try {
        const qr = new QRCode(qrCodeContainer, {
          text: qrData,
          width: 300,
          height: 300,
          colorDark: "#1e3a8a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });

        qrCodeModal.classList.remove("hidden");
        
      } catch (err) {
        console.error("❌ خطأ في QR:", err);
        qrCodeContainer.innerHTML = "";
        
        const qr = new QRCode(qrCodeContainer, {
          text: employeeName,
          width: 300,
          height: 300,
          colorDark: "#1e3a8a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.L
        });
        
        qrCodeModal.classList.remove("hidden");
      }
    }, 200);
    
  } catch (error) {
    console.error("❌ خطأ عام:", error);
    alert("⚠️ حدث خطأ. برجاء تحديث الصفحة.");
  }
}

// إغلاق QR Modal
if (qrCodeClose) {
  qrCodeClose.addEventListener("click", closeQRModal);
}

if (qrCodeModal) {
  qrCodeModal.addEventListener("click", (e) => {
    if (e.target === qrCodeModal) closeQRModal();
  });
}

function closeQRModal() {
  if (!qrCodeModal) return;
  qrCodeModal.classList.add("hidden");
  if (qrCodeContainer) {
    qrCodeContainer.innerHTML = "";
  }
}

// تحميل QR Code + PDF
if (downloadQRButton) {
  downloadQRButton.addEventListener("click", async () => {
    const canvas = qrCodeContainer.querySelector("canvas");
    if (!canvas) {
      alert("لم يتم العثور على QR Code");
      return;
    }

    try {
      // تحميل QR
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `QR_${currentQREmployee}_${Date.now()}.png`;
      link.click();

      alert("✅ تم تحميل QR Code\n⏳ جاري إنشاء PDF...");

      // إنشاء PDF
      const success = await generateAssetsPDF(currentQREmployee, currentQRAssets, currentQRNationalId, currentEmployeeFullData);
      
      if (success) {
        alert("✅ تم تحميل PDF بنجاح");
      }
    } catch (error) {
      console.error("❌ خطأ:", error);
      alert("⚠️ حدث خطأ أثناء التحميل");
    }
  });
}

/********************************************
 * SEARCH SCREEN
 ********************************************/
if (searchEmployeeButton) {
  searchEmployeeButton.onclick = async () => {
    const nid = searchNationalId.value.trim();
    const name = searchName.value.trim();

    let emp = null;

    if (nid) {
      const doc = await db.collection("employees").doc(nid).get();
      if (doc.exists) emp = doc.data();
    } else if (name) {
      // ✅ تحسين البحث بالاسم: دعم البحث الجزئي/Prefix وتقليل مشاكل المسافات
      const normName = name.replace(/\s+/g, " ").trim();
      const normLower = normName.toLowerCase();

      // 1) Prefix search (الأسرع عادةً)
      let snap = await db.collection("employees")
        .orderBy("name")
        .startAt(normName)
        .endAt(normName + "\uf8ff")
        .limit(10)
        .get();

      // 2) Fallback: لو مفيش نتائج (أو المستخدم كتب جزء من منتصف الاسم)
      if (snap.empty) {
        const all = await db.collection("employees").get();
        const matches = [];
        all.forEach(d => {
          const e = d.data() || {};
          const nm = (e.name || "").toString();
          if (nm.toLowerCase().includes(normLower)) {
            matches.push(e);
          }
        });
        if (matches.length) emp = matches[0];
      } else {
        emp = snap.docs[0].data();
      }
    }

    searchResult.classList.remove("hidden");

    if (!emp) {
      searchEmployeeInfo.innerHTML = '<span style="color:red;">لم يتم العثور على الموظف</span>';
      searchAssetsInfo.innerHTML = "";
      currentQREmployee = null;
      currentQRAssets = [];
      currentQRNationalId = null;
      currentEmployeeFullData = null;
      return;
    }

    currentQREmployee = emp.name;
    currentQRNationalId = emp.nationalId;
    currentEmployeeFullData = emp;

    searchEmployeeInfo.innerHTML = `
      <p><strong>الاسم:</strong> ${emp.name}</p>
      <p><strong>الرقم القومي:</strong> ${emp.nationalId}</p>
      <p><strong>البريد:</strong> ${emp.email || "—"}</p>
      <p><strong>الوظيفة:</strong> ${emp.job || "—"}</p>
      <p><strong>القطاع:</strong> ${emp.sector || "—"}</p>
      <p><strong>الإدارة المركزية:</strong> ${emp.centralAdmin || "—"}</p>
      <p><strong>الإدارة العامة:</strong> ${emp.generalAdmin || "—"}</p>
      <p><strong>الإدارة الفرعية:</strong> ${emp.subAdmin || "—"}</p>
      <p><strong>التليفون:</strong> ${emp.phone || "—"}</p>
      <p><strong>العنوان:</strong> ${emp.location || "—"}</p>
    `;

    const snap = await db.collection("assets").doc(emp.nationalId).get();

    if (!snap.exists) {
      searchAssetsInfo.innerHTML = "<p>لا توجد عهد مسجلة</p>";
      currentQRAssets = [];
      return;
    }

    const items = snap.data().items || [];
    currentQRAssets = items;

    if (items.length === 0) {
      searchAssetsInfo.innerHTML = "<p>لا توجد عهد</p>";
      return;
    }

    const typesLabels = {
      "monitor": "📺 شاشات عرض",
      "desk-phone": "📞 هاتف مكتبى",
      "desktop": "🖥️ جهاز كمبيوتر مكتبى (PC)",
      "g-dell": "💻 أجهزة G-Dell",
      "p-hp": "💻 أجهزة P-HP",
      "laptop": "💼 جهاز حاسب آلي محمول (LAPTOP)",
      "printer": "🖨️ طابعة",
      "copier": "📠 ماكينة تصوير",
      "other": "📋 أصول أخرى"
    };

    let html = "<ul style='list-style:none; padding:0;'>";
    items.forEach(a => {
      let line = "<li style='background:#f9fafb; padding:1rem; margin:0.5rem 0; border-radius:0.5rem; border:1px solid #e5e7eb;'>";
      if (a.type) line += `<strong style='color:var(--blue-dark);'>${typesLabels[a.type] || a.type}</strong><br>`;
      for (let k in a) {
        if (["id", "type", "pdfData", "pdfName", "createdAt"].includes(k)) continue;
        line += `<strong>${k}:</strong> ${a[k]}<br>`;
      }
      if (a.pdfData) {
        line += `<a href="${a.pdfData}" download="${a.pdfName || 'document.pdf'}" style="color:#2563eb; text-decoration:none; font-weight:600;">📄 تحميل PDF</a>`;
      }
      line += "</li>";
      html += line;
    });
    html += "</ul>";

    searchAssetsInfo.innerHTML = html;
  };
}

/********************************************
 * STORES
 ********************************************/
if (storeForm) {
  storeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const deptName = storeDeptName.value.trim();
    const type = storeType.value;
    const movementType = storeMovementType.value;
    const requestDate = storeRequestDate.value;
    const permissionNo = storePermissionNo.value.trim();
    const requesterName = storeRequesterName.value.trim();
    const requesterNid = storeRequesterNid.value.trim();
    const receiverName = storeReceiverName.value.trim();
    const receiverNid = storeReceiverNid.value.trim();
    const assetCategory = storeAssetCategory.value;
    const description = storeDescription.value.trim();

    if (!deptName || !type || !movementType || !requestDate || !permissionNo || 
        !requesterName || !requesterNid || !receiverName || !receiverNid || !assetCategory || !description) {
      alert("❌ يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const pdfFile = storePdf.files[0];
    if (!pdfFile) {
      alert("❌ يرجى رفع استمارة العهدة (PDF)");
      return;
    }

    try {
      const pdfData = await pdfToBase64(pdfFile);

      const storeData = {
        deptName,
        type,
        movementType,
        requestDate,
        permissionNo,
        requesterName,
        requesterNid,
        receiverName,
        receiverNid,
        assetCategory,
        description,
        pdfData,
        pdfName: pdfFile.name,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: auth.currentUser.email
      };

      await db.collection("stores").add(storeData);
      alert("✅ تم حفظ الحركة المخزنية بنجاح");
      storeForm.reset();
      loadStores();
    } catch (error) {
      console.error(error);
      alert("❌ خطأ: " + error.message);
    }
  });
}

async function loadStores() {
  if (!storesTableBody) return;
  storesTableBody.innerHTML = "<tr><td colspan='13' style='text-align:center'>جاري التحميل...</td></tr>";

  try {
    const snap = await db.collection("stores").orderBy("createdAt", "desc").get();
    storesTableBody.innerHTML = "";

    if (snap.empty) {
      storesTableBody.innerHTML = "<tr><td colspan='13' style='text-align:center;color:#6b7280'>لا توجد سجلات</td></tr>";
      return;
    }

    snap.forEach(doc => {
      const s = doc.data();
      const tr = document.createElement("tr");

      const pdfLink = s.pdfData 
        ? `<a href="${s.pdfData}" download="${s.pdfName}" class="btn primary small">📄 تحميل</a>`
        : "—";

      tr.innerHTML = `
        <td>${s.deptName || "—"}</td>
        <td>${s.type || "—"}</td>
        <td>${s.movementType || "—"}</td>
        <td>${s.requestDate || "—"}</td>
        <td>${s.permissionNo || "—"}</td>
        <td>${s.requesterName || "—"}</td>
        <td>${s.requesterNid || "—"}</td>
        <td>${s.receiverName || "—"}</td>
        <td>${s.receiverNid || "—"}</td>
        <td>${s.assetCategory || "—"}</td>
        <td>${s.description || "—"}</td>
        <td>${pdfLink}</td>
        <td>
          <button class="btn primary small" onclick="editStore('${doc.id}')">تعديل</button>
          <button class="btn danger small" onclick="deleteStore('${doc.id}')">حذف</button>
        </td>
      `;
      storesTableBody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    storesTableBody.innerHTML = "<tr><td colspan='13' style='text-align:center;color:red'>حدث خطأ في التحميل</td></tr>";
  }
}

window.editStore = async (storeId) => {
  try {
    const doc = await db.collection("stores").doc(storeId).get();
    if (!doc.exists) {
      alert("❌ السجل غير موجود");
      return;
    }

    const s = doc.data();
    storeDeptName.value = s.deptName || "";
    storeType.value = s.type || "";
    storeMovementType.value = s.movementType || "";
    storeRequestDate.value = s.requestDate || "";
    storePermissionNo.value = s.permissionNo || "";
    storeRequesterName.value = s.requesterName || "";
    storeRequesterNid.value = s.requesterNid || "";
    storeReceiverName.value = s.receiverName || "";
    storeReceiverNid.value = s.receiverNid || "";
    storeAssetCategory.value = s.assetCategory || "";
    storeDescription.value = s.description || "";

    const originalSubmit = storeForm.onsubmit;
    storeForm.onsubmit = async (e) => {
      e.preventDefault();

      if (!confirm("هل تريد حفظ التعديلات؟")) return;

      try {
        const pdfFile = storePdf.files[0];
        let updateData = {
          deptName: storeDeptName.value.trim(),
          type: storeType.value,
          movementType: storeMovementType.value,
          requestDate: storeRequestDate.value,
          permissionNo: storePermissionNo.value.trim(),
          requesterName: storeRequesterName.value.trim(),
          requesterNid: storeRequesterNid.value.trim(),
          receiverName: storeReceiverName.value.trim(),
          receiverNid: storeReceiverNid.value.trim(),
          assetCategory: storeAssetCategory.value,
          description: storeDescription.value.trim(),
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: auth.currentUser.email
        };

        if (pdfFile) {
          updateData.pdfData = await pdfToBase64(pdfFile);
          updateData.pdfName = pdfFile.name;
        }

        await db.collection("stores").doc(storeId).update(updateData);
        alert("✅ تم التحديث بنجاح");
        storeForm.reset();
        storeForm.onsubmit = originalSubmit;
        loadStores();
      } catch (error) {
        console.error(error);
        alert("❌ خطأ: " + error.message);
      }
    };

    storeForm.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error(error);
    alert("❌ خطأ: " + error.message);
  }
};

window.deleteStore = async (storeId) => {
  if (!confirm("⚠️ هل أنت متأكد من حذف هذا السجل؟")) return;

  try {
    await db.collection("stores").doc(storeId).delete();
    alert("✅ تم الحذف بنجاح");
    loadStores();
  } catch (error) {
    console.error(error);
    alert("❌ خطأ في الحذف: " + error.message);
  }
};
