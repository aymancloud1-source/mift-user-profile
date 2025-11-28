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
const currentUserName = document.getElementById("currentUserName");
const currentUserRole = document.getElementById("currentUserRole");

const logoutButton = document.getElementById("logoutButton");

// Navigation
const navItems = document.querySelectorAll(".nav-item[data-screen]");
const screens = document.querySelectorAll(".screen");

// Admin users
const usersTableBody = document.querySelector("#usersTable tbody");

// Employees
const employeeForm = document.getElementById("employeeForm");
const employeesTableBody = document.querySelector("#employeesTable tbody");
const employeeSearchInput = document.getElementById("employeeSearch");

// ASSETS SCREEN ELEMENTS
const employeeSelect = document.getElementById("employeeSelect");
const selectedEmployeeInfo = document.getElementById("selectedEmployeeInfo");
const assetsForms = document.getElementById("assetsForms");
const assetSearchNationalId = document.getElementById("assetSearchNationalId");
const assetSearchName = document.getElementById("assetSearchName");
const assetSearchButton = document.getElementById("assetSearchButton");
const employeeAssetsList = document.getElementById("employeeAssetsList");
const saveCurrentAssetButton = document.getElementById("saveCurrentAssetButton");

// SEARCH SCREEN ELEMENTS
const searchNationalId = document.getElementById("searchNationalId");
const searchName = document.getElementById("searchName");
const searchResult = document.getElementById("searchResult");
const searchEmployeeInfo = document.getElementById("searchEmployeeInfo");
const searchAssetsInfo = document.getElementById("searchAssetsInfo");
const searchEmployeeButton = document.getElementById("searchEmployeeButton");

// STORES ELEMENTS
const storeForm = document.getElementById("storeForm");
const storesTableBody = document.querySelector("#storesTable tbody");

/********************************************
 * Helper — Show Message
 ********************************************/
function showMessage(el, type, text) {
  if (!el) return;
  el.textContent = text;
  el.className = `message visible ${type}`;
}

/********************************************
 * TABS
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
 * REGISTER USER
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

  currentUserName.textContent = u.name;
  currentUserRole.textContent = u.isSuperAdmin ? "مدير النظام الرئيسي" : u.role;

  setupNav(u);
});

/********************************************
 * ROLE-BASED NAVIGATION  🔥 (التعديل الأساسي)
 ********************************************/
function setupNav(user) {
  const adminScreenBtn = document.querySelector('[data-screen="usersAdminScreen"]');
  const employeesBtn = document.querySelector('[data-screen="employeesScreen"]');
  const assetsBtn = document.querySelector('[data-screen="assetsScreen"]');
  const searchBtn = document.querySelector('[data-screen="searchScreen"]');
  const storesBtn = document.querySelector('[data-screen="storesScreen"]');

  navItems.forEach(btn => btn.style.display = "none");

  if (user.isSuperAdmin) {
    navItems.forEach(btn => btn.style.display = "block");
  }
  else if (user.role === "admin") {
    navItems.forEach(btn => btn.style.display = "block");
    if (adminScreenBtn) adminScreenBtn.style.display = "none";
  }
  else if (user.role === "store") {
    if (storesBtn) storesBtn.style.display = "block";
  }
  else if (user.role === "user") {
    if (searchBtn) searchBtn.style.display = "block";
  }

  screens.forEach(s => s.classList.add("hidden"));

  if (user.isSuperAdmin || user.role === "admin") {
    employeesBtn.click();
  } else if (user.role === "store") {
    storesBtn.click();
  } else if (user.role === "user") {
    searchBtn.click();
  }

  if (user.isSuperAdmin) loadUsersList();
}
/********************************************
 * SUPER ADMIN — MANAGE USERS
 ********************************************/
async function loadUsersList() {
  const tbody = usersTableBody;
  if (!tbody) return;

  tbody.innerHTML = "";

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
              <option value="admin" ${u.role === "admin" ? "selected" : ""}>مدير نظام</option>
              <option value="store" ${u.role === "store" ? "selected" : ""}>مسؤول مخازن</option>
              <option value="user" ${u.role === "user" ? "selected" : ""}>مستخدم</option>
          </select>
      </td>
      <td>
          <button class="btn success" onclick="setStatus('${u.uid}','approved')">اعتماد</button>
          <button class="btn" style="background:#eab308;color:#fff" onclick="setStatus('${u.uid}','pending')">تعليق</button>
          <button class="btn danger" onclick="setStatus('${u.uid}','blocked')">إيقاف</button>
      </td>
    `;

    tbody.appendChild(tr);
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

employeeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nid = document.getElementById("empNationalId").value.trim();
  const name = document.getElementById("empName").value.trim();

  if (!nid || !name) {
    alert("برجاء إدخال الاسم والرقم القومي");
    return;
  }

  await db.collection("employees").doc(nid).set({
    nationalId: nid,
    name,
    job: document.getElementById("empJob").value.trim(),
    sector: document.getElementById("empSector").value.trim(),
    centralAdmin: document.getElementById("empCentralAdmin").value.trim(),
    generalAdmin: document.getElementById("empGeneralAdmin").value.trim(),
    subAdmin: document.getElementById("empSubAdmin").value.trim(),
    phone: document.getElementById("empPhone").value.trim(),
    location: document.getElementById("empLocation").value.trim(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  alert("تم حفظ بيانات الموظف");
  employeeForm.reset();

  loadEmployees();
  loadEmployeesSelect();
});

/********************************************
 * LOAD EMPLOYEE LIST
 ********************************************/
async function loadEmployees() {
  const tbody = employeesTableBody;
  if (!tbody) return;

  tbody.innerHTML = "";
  employeesCache = [];

  const snap = await db.collection("employees").orderBy("name").get();

  snap.forEach(doc => {
    const e = doc.data();
    employeesCache.push(e);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.name}</td>
      <td>${e.nationalId}</td>
      <td>${e.job || ""}</td>
      <td>${e.sector || ""}</td>
    `;

    tbody.appendChild(tr);
  });
}

/********************************************
 * EMPLOYEE SEARCH (client-side)
 ********************************************/
if (employeeSearchInput) {
  employeeSearchInput.addEventListener("input", () => {
    const term = employeeSearchInput.value.trim();
    const tbody = employeesTableBody;
    tbody.innerHTML = "";

    employeesCache
      .filter(emp => {
        if (!term) return true;
        return (
          (emp.name && emp.name.includes(term)) ||
          (emp.nationalId && emp.nationalId.includes(term))
        );
      })
      .forEach(e => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${e.name}</td>
          <td>${e.nationalId}</td>
          <td>${e.job || ""}</td>
          <td>${e.sector || ""}</td>
        `;
        tbody.appendChild(tr);
      });
  });
}

/********************************************
 * LOAD EMPLOYEES IN ASSETS DROPDOWN
 ********************************************/
async function loadEmployeesSelect() {
  const snap = await db.collection("employees").orderBy("name").get();

  employeeSelect.innerHTML = `<option value="">اختر موظفًا</option>`;

  snap.forEach(doc => {
    const e = doc.data();
    const opt = document.createElement("option");
    opt.value = e.nationalId;
    opt.textContent = `${e.name} — ${e.nationalId}`;
    employeeSelect.appendChild(opt);
  });
}

/********************************************
 * SELECT EMPLOYEE FOR ASSETS
 ********************************************/
let currentAssetEmployee = null;

employeeSelect.addEventListener("change", async () => {
  const nid = employeeSelect.value;
  if (!nid) return;

  const doc = await db.collection("employees").doc(nid).get();
  if (!doc.exists) return;

  currentAssetEmployee = doc.data();

  selectedEmployeeInfo.className = "message visible info";
  selectedEmployeeInfo.style.display = "block";
  selectedEmployeeInfo.innerHTML =
    `<strong>${currentAssetEmployee.name}</strong> — ${currentAssetEmployee.nationalId}`;

  assetsForms.style.display = "block";
  assetsForms.classList.remove("hidden");

  loadEmployeeAssets(nid);
});

/********************************************
 * SEARCH EMPLOYEE IN ASSETS SCREEN
 ********************************************/
assetSearchButton.onclick = async () => {
  const nid = assetSearchNationalId.value.trim();
  const name = assetSearchName.value.trim();

  let emp = null;

  if (nid) {
    const d = await db.collection("employees").doc(nid).get();
    if (d.exists) emp = d.data();
  } else if (name) {
    const snap = await db.collection("employees")
      .where("name", "==", name).limit(1).get();
    if (!snap.empty) emp = snap.docs[0].data();
  }

  if (!emp) {
    alert("الموظف غير موجود");
    return;
  }

  currentAssetEmployee = emp;

  selectedEmployeeInfo.className = "message visible info";
  selectedEmployeeInfo.style.display = "block";
  selectedEmployeeInfo.innerHTML =
    `<strong>${emp.name}</strong> — ${emp.nationalId}`;

  assetsForms.style.display = "block";
  assetsForms.classList.remove("hidden");

  loadEmployeeAssets(emp.nationalId);
};

/********************************************
 * ADD ASSET — إضافة UUID لكل عنصر جديد
 ********************************************/
document.querySelectorAll(".asset-form").forEach(form => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentAssetEmployee) {
      alert("اختر موظف أولاً");
      return;
    }

    const nid = currentAssetEmployee.nationalId;
    const type = form.getAttribute("data-asset-type");
    const fd = new FormData(form);

    const assetId = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : (`asset_${Date.now()}_${Math.random().toString(36).slice(2)}`);

    let asset = {
      id: assetId,
      type,
      createdAt: Date.now()
    };

    fd.forEach((v, k) => {
      if (k !== "pdf" && v && v.toString().trim() !== "") {
        asset[k] = v.toString().trim();
      }
    });

    const pdf = fd.get("pdf");
    if (pdf && pdf.size > 0) {
      const ref = storage.ref(`assets/${nid}/${assetId}.pdf`);
      await ref.put(pdf);
      asset.pdfUrl = await ref.getDownloadURL();
    }

    await db.collection("assets").doc(nid).set({
      items: FieldValue.arrayUnion(asset)
    }, { merge: true });

    alert("تم إضافة العهدة بنجاح ✔");
    form.reset();

    loadEmployeeAssets(nid);
  });
});
/********************************************
 * زر: حفظ العهدة الحالية (النموذج المفتوح)
 ********************************************/
if (saveCurrentAssetButton) {
  saveCurrentAssetButton.addEventListener("click", () => {
    const openDetails = document.querySelector("#assetsForms details[open]");
    if (!openDetails) {
      alert("برجاء فتح نوع العهدة الذي تريد حفظه أولاً");
      return;
    }
    const form = openDetails.querySelector("form.asset-form");
    if (!form) {
      alert("تعذر العثور على نموذج العهدة في هذا القسم");
      return;
    }
    form.requestSubmit();
  });
}

/********************************************
 * DELETE ASSET (مع دعم البيانات القديمة)
 ********************************************/
async function deleteAssetInternal(nid, assetId) {
  const doc = await db.collection("assets").doc(nid).get();
  if (!doc.exists) return;

  let items = doc.data().items || [];

  let needFixIds = false;
  items = items.map((a, index) => {
    if (!a.id) {
      needFixIds = true;
      return {
        ...a,
        id: `legacy_${index}_${a.type || "asset"}`
      };
    }
    return a;
  });

  if (needFixIds) {
    await db.collection("assets").doc(nid).set({ items }, { merge: false });
  }

  const filtered = items.filter(a => a.id !== assetId);

  await db.collection("assets").doc(nid).set({ items: filtered }, { merge: false });

  alert("تم حذف العهدة ✔");
  loadEmployeeAssets(nid);
}

/********************************************
 * EDIT ASSET
 ********************************************/
async function editAssetInternal(nid, assetId) {
  const doc = await db.collection("assets").doc(nid).get();
  if (!doc.exists) return;

  let items = doc.data().items || [];

  let needFixIds = false;
  items = items.map((a, index) => {
    if (!a.id) {
      needFixIds = true;
      return {
        ...a,
        id: `legacy_${index}_${a.type || "asset"}`
      };
    }
    return a;
  });

  if (needFixIds) {
    await db.collection("assets").doc(nid).set({ items }, { merge: false });
  }

  const asset = items.find(a => a.id === assetId);
  if (!asset) {
    alert("العهدة غير موجودة");
    return;
  }

  const newValues = {};

  for (let key in asset) {
    if (["id", "type", "createdAt", "pdfUrl"].includes(key)) continue;
    const val = prompt(`تعديل ${key}`, asset[key] || "");
    if (val !== null) newValues[key] = val;
  }

  const updatedItem = { ...asset, ...newValues };

  const updatedArray = items.map(a => (a.id === assetId ? updatedItem : a));

  await db.collection("assets").doc(nid).set({ items: updatedArray }, { merge: false });

  alert("تم تعديل العهدة ✔");
  loadEmployeeAssets(nid);
}

window.deleteAsset = deleteAssetInternal;
window.editAsset = editAssetInternal;

/********************************************
 * LOAD EMPLOYEE ASSETS — عرض + أزرار
 ********************************************/
async function loadEmployeeAssets(nid) {
  employeeAssetsList.innerHTML = "";

  const snap = await db.collection("assets").doc(nid).get();

  if (!snap.exists) {
    employeeAssetsList.textContent = "لا توجد عهد مسجلة";
    return;
  }

  let items = snap.data().items || [];
  if (items.length === 0) {
    employeeAssetsList.textContent = "لا توجد عهد";
    return;
  }

  let needFixIds = false;
  items = items.map((a, index) => {
    if (!a.id) {
      needFixIds = true;
      return {
        ...a,
        id: `legacy_${index}_${a.type || "asset"}`
      };
    }
    return a;
  });

  if (needFixIds) {
    await db.collection("assets").doc(nid).set({ items }, { merge: false });
  }

  const types = {
    "desktop": "حاسب مكتبي",
    "g-dell": "جهاز العاصمة (G-DELL)",
    "p-hp": "جهاز العاصمة (P-HP)",
    "laptop": "حاسب محمول",
    "printer": "طابعة",
    "copier": "ماكينة تصوير",
    "other": "عهد أخرى"
  };

  let grouped = {};
  items.forEach(a => {
    if (!grouped[a.type]) grouped[a.type] = [];
    grouped[a.type].push(a);
  });

  for (let t in grouped) {
    const div = document.createElement("div");
    div.innerHTML = `<h4>${types[t] || t}</h4>`;

    grouped[t].forEach(a => {
      const row = document.createElement("div");
      row.className = "asset-row";

      let infoHtml = `<div class="asset-info">`;
      for (let k in a) {
        if (["id", "type", "pdfUrl", "createdAt"].includes(k)) continue;
        infoHtml += `${k}: ${a[k]}<br>`;
      }
      if (a.pdfUrl) {
        infoHtml += `<a href="${a.pdfUrl}" target="_blank">عرض PDF</a>`;
      }
      infoHtml += `</div>`;

      const actionsHtml = `
        <div class="asset-actions">
          <button class="asset-edit-btn" onclick="editAsset('${nid}', '${a.id}')">تعديل</button>
          <button class="asset-delete-btn" onclick="deleteAsset('${nid}', '${a.id}')">حذف</button>
        </div>
      `;

      row.innerHTML = infoHtml + actionsHtml;
      div.appendChild(row);
    });

    employeeAssetsList.appendChild(div);
  }
}

/********************************************
 * SEARCH SCREEN — Search Employee + Assets
 ********************************************/
searchEmployeeButton.onclick = async () => {
  const nid = searchNationalId.value.trim();
  const name = searchName.value.trim();

  let emp = null;

  if (nid) {
    const doc = await db.collection("employees").doc(nid).get();
    if (doc.exists) emp = doc.data();
  } else if (name) {
    const snap = await db.collection("employees").where("name", "==", name).limit(1).get();
    if (!snap.empty) emp = snap.docs[0].data();
  }

  searchResult.classList.remove("hidden");

  if (!emp) {
    searchEmployeeInfo.innerHTML = `<span style='color:red'>لا يوجد موظف بهذه البيانات</span>`;
    searchAssetsInfo.innerHTML = "";
    return;
  }

  searchEmployeeInfo.innerHTML = `
    <strong>${emp.name}</strong><br>
    الرقم القومي: ${emp.nationalId}<br>
    الوظيفة: ${emp.job || "—"}<br>
    القطاع: ${emp.sector || "—"}<br>
  `;

  const snap = await db.collection("assets").doc(emp.nationalId).get();

  if (!snap.exists) {
    searchAssetsInfo.innerHTML = "لا توجد عهد";
    return;
  }

  const items = snap.data().items || [];
  if (items.length === 0) {
    searchAssetsInfo.innerHTML = "لا توجد عهد";
    return;
  }

  const types = {
    "desktop": "حاسب مكتبي",
    "g-dell": "جهاز العاصمة (G-DELL)",
    "p-hp": "جهاز العاصمة (P-HP)",
    "laptop": "حاسب محمول",
    "printer": "طابعة",
    "copier": "ماكينة تصوير",
    "other": "عهد أخرى"
  };

  let grouped = {};

  items.forEach(a => {
    if (!grouped[a.type]) grouped[a.type] = [];
    grouped[a.type].push(a);
  });

  let html = "";

  for (let t in grouped) {
    html += `<h4>${types[t] || t}</h4><ul>`;

    grouped[t].forEach(a => {
      let line = "<li>";
      for (let k in a) {
        if (["id", "type", "pdfUrl", "createdAt"].includes(k)) continue;
        line += `${k}: ${a[k]} — `;
      }
      if (a.pdfUrl) line += `<a href="${a.pdfUrl}" target="_blank">عرض PDF</a>`;
      line += "</li>";
      html += line;
    });

    html += "</ul>";
  }

  searchAssetsInfo.innerHTML = html;
};

/********************************************
 * STORES — ADD RECORD
 ********************************************/
storeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dept = storeDeptName.value.trim();
  const st = storeName.value.trim();
  const type = storeAssetType.value;
  const perm = storePermissionNo.value.trim();

  if (!dept || !st || !type || !perm) {
    alert("برجاء إدخال البيانات الأساسية");
    return;
  }

  let pdfUrl = "";
  const pdfFile = storePdf.files[0];

  if (pdfFile) {
    const ref = storage.ref(`stores/${perm}_${Date.now()}.pdf`);
    await ref.put(pdfFile);
    pdfUrl = await ref.getDownloadURL();
  }

  await db.collection("stores").add({
    dept,
    store: st,
    type,
    perm,
    date: storeRequestDate.value,
    reqType: storeRequestType.value,
    rName: storeRequesterName.value.trim(),
    rNid: storeRequesterNid.value.trim(),
    recName: storeReceiverName.value.trim(),
    recNid: storeReceiverNid.value.trim(),
    desc: storeDescription.value.trim(),
    pdfUrl,
    createdAt: FieldValue.serverTimestamp()
  });

  alert("تم حفظ بيانات المخازن ✔");
  storeForm.reset();

  loadStores();
});

/********************************************
 * LOAD STORES
 ********************************************/
async function loadStores() {
  const tbody = storesTableBody;
  if (!tbody) return;

  tbody.innerHTML = "";

  const snap = await db.collection("stores")
    .orderBy("createdAt", "desc")
    .get();

  snap.forEach(doc => {
    const s = doc.data();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.dept}</td>
      <td>${s.store}</td>
      <td>${s.type}</td>
      <td>${s.perm}</td>
      <td>${s.date}</td>
    `;

    tbody.appendChild(tr);
  });
}
