/**********************************************
 * 1 — Firebase Initialization (v8 compat mode)
 **********************************************/
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


/**********************************************
 * 2 — DOM ELEMENTS
 **********************************************/

// Sections
const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

// Auth Box
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

// Navigation
const navItems = document.querySelectorAll(".nav-item[data-screen]");
const screens = document.querySelectorAll(".screen");
const logoutButton = document.getElementById("logoutButton");


/**********************************************
 * 3 — Helper: Show Message
 **********************************************/
function showMessage(el, type, text) {
  if (!el) return;
  el.textContent = text;
  el.className = `message visible ${type}`;
}


/**********************************************
 * 4 — Tabs (Login / Register)
 **********************************************/
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


/**********************************************
 * 5 — Register Logic (With Super Admin)
 **********************************************/
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

    // Check if first user → Super Admin
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


/**********************************************
 * 6 — Login Logic
 **********************************************/
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


/**********************************************
 * 7 — Logout
 **********************************************/
logoutButton.onclick = async () => {
  await auth.signOut();
};


/**********************************************
 * 8 — Auth State Listener
 **********************************************/
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

  // Show dashboard
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  currentUserName.textContent = u.name;
  currentUserRole.textContent = u.isSuperAdmin ? "مدير النظام الرئيسي" : u.role;

  setupNavigation(u);
});


/**********************************************
 * 9 — Navigation Controller (Role Based)
 **********************************************/
function setupNavigation(user) {
  const adminBtn = document.querySelector('[data-screen="usersAdminScreen"]');
  const employeesBtn = document.querySelector('[data-screen="employeesScreen"]');
  const searchBtn = document.querySelector('[data-screen="searchScreen"]');
  const storesBtn = document.querySelector('[data-screen="storesScreen"]');
  const assetsBtn = document.querySelector('[data-screen="assetsScreen"]');

  // Reset visibility  
  navItems.forEach(btn => btn.style.display = "none");

  // Super Admin → sees all
  if (user.isSuperAdmin) {
    navItems.forEach(btn => btn.style.display = "block");
  }

  // Admin → sees everything except user management
  else if (user.role === "admin") {
    navItems.forEach(btn => {
      if (btn.dataset.screen !== "usersAdminScreen") {
        btn.style.display = "block";
      }
    });
  }

  // Store Manager → stores only
  else if (user.role === "store") {
    storesBtn.style.display = "block";
  }

  // Normal User → search only
  else if (user.role === "user") {
    searchBtn.style.display = "block";
  }

  // Attach click events
  navItems.forEach(btn => {
    btn.onclick = () => {
      openScreen(btn.dataset.screen);
      navItems.forEach(n => n.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  // Auto-open first allowed screen
  const first = [...navItems].find(b => b.style.display !== "none");
  if (first) first.click();
}


/**********************************************
 * 10 — Function: Open Screen
 **********************************************/
function openScreen(id) {
  screens.forEach(s => s.classList.add("hidden"));
  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
}
/**********************************************
 * 11 — Employees (Add / Update)
 **********************************************/
let employeesCache = [];

const employeeForm = document.getElementById("employeeForm");
const employeesTableBody = document.querySelector("#employeesTable tbody");
const employeeSearchInput = document.getElementById("employeeSearch");

// Add or Update Employee
if (employeeForm) {
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
}


/**********************************************
 * 12 — Load All Employees
 **********************************************/
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


/**********************************************
 * 13 — Employee Search (client-side)
 **********************************************/
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


/**********************************************
 * 14 — Load Employees in Assets Dropdown
 **********************************************/
const employeeSelect = document.getElementById("employeeSelect");

async function loadEmployeesSelect() {
  if (!employeeSelect) return;

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
/**********************************************
 * 15 — ASSETS SYSTEM
 **********************************************/

const selectedEmployeeInfo = document.getElementById("selectedEmployeeInfo");
const assetsForms = document.getElementById("assetsForms");
const assetSearchNationalId = document.getElementById("assetSearchNationalId");
const assetSearchName = document.getElementById("assetSearchName");
const assetSearchButton = document.getElementById("assetSearchButton");
const employeeAssetsList = document.getElementById("employeeAssetsList");
const saveCurrentAssetButton = document.getElementById("saveCurrentAssetButton");

let currentAssetEmployee = null;

/**********************************************
 * 16 — Select Employee From Dropdown
 **********************************************/
if (employeeSelect) {
  employeeSelect.addEventListener("change", async () => {
    const nid = employeeSelect.value;
    if (!nid) return;

    const doc = await db.collection("employees").doc(nid).get();
    if (!doc.exists) return;

    currentAssetEmployee = doc.data();

    selectedEmployeeInfo.className = "message visible info";
    selectedEmployeeInfo.innerHTML =
      `<strong>${currentAssetEmployee.name}</strong> — ${currentAssetEmployee.nationalId}`;

    assetsForms.classList.remove("hidden");

    loadEmployeeAssets(nid);
  });
}


/**********************************************
 * 17 — Search Employee in Assets Screen
 **********************************************/
if (assetSearchButton) {
  assetSearchButton.onclick = async () => {
    const nid = assetSearchNationalId.value.trim();
    const name = assetSearchName.value.trim();

    let emp = null;

    if (nid) {
      const d = await db.collection("employees").doc(nid).get();
      if (d.exists) emp = d.data();
    } else if (name) {
      const snap = await db.collection("employees")
        .where("name", "==", name)
        .limit(1)
        .get();
      if (!snap.empty) emp = snap.docs[0].data();
    }

    if (!emp) {
      alert("الموظف غير موجود");
      return;
    }

    currentAssetEmployee = emp;

    selectedEmployeeInfo.className = "message visible info";
    selectedEmployeeInfo.innerHTML =
      `<strong>${emp.name}</strong> — ${emp.nationalId}`;

    assetsForms.classList.remove("hidden");

    loadEmployeeAssets(emp.nationalId);
  };
}


/**********************************************
 * 18 — Add Asset (with UUID)
 **********************************************/
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

    const assetId = crypto.randomUUID();

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


/**********************************************
 * 19 — Save Current Asset (auto-submit open form)
 **********************************************/
if (saveCurrentAssetButton) {
  saveCurrentAssetButton.addEventListener("click", () => {
    const openDetails = document.querySelector("#assetsForms details[open]");
    if (!openDetails) {
      alert("برجاء فتح نوع العهدة الذي تريد حفظه أولاً");
      return;
    }
    const form = openDetails.querySelector("form.asset-form");
    if (form) form.requestSubmit();
  });
}


/**********************************************
 * 20 — DELETE Asset (Internal)
 **********************************************/
async function deleteAssetInternal(nid, assetId) {
  const doc = await db.collection("assets").doc(nid).get();
  if (!doc.exists) return;

  let items = doc.data().items || [];

  // Fix missing IDs if exist
  items = items.map((a, index) => {
    if (!a.id) {
      return { ...a, id: `legacy_${index}_${a.type || "asset"}` };
    }
    return a;
  });

  const filtered = items.filter(a => a.id !== assetId);

  await db.collection("assets").doc(nid).set({ items: filtered });

  alert("تم حذف العهدة ✔");
  loadEmployeeAssets(nid);
}

window.deleteAsset = deleteAssetInternal;


/**********************************************
 * 21 — MODAL SYSTEM (for editing assets)
 **********************************************/

let modalContainer = null;

function createModal() {
  if (modalContainer) return modalContainer;

  modalContainer = document.createElement("div");
  modalContainer.id = "assetEditModal";
  modalContainer.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(3px);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 999999;
  `;

  modalContainer.innerHTML = `
    <div style="
      background: #fff;
      padding: 20px;
      width: 450px;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0,0,0,0.2);
    ">
      <h3 style="margin-top:0;color:#1e3a8a">تعديل بيانات العهدة</h3>
      <div id="modalFields"></div>

      <div style="margin-top:15px;text-align:left">
        <button id="modalSave" class="btn primary">حفظ</button>
        <button id="modalCancel" class="btn danger" style="margin-right:8px">إغلاق</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  document.getElementById("modalCancel").onclick = () => {
    modalContainer.style.display = "none";
  };

  return modalContainer;
}


/**********************************************
 * 22 — EDIT Asset (Open Modal)
 **********************************************/
async function editAssetInternal(nid, assetId) {
  const snap = await db.collection("assets").doc(nid).get();
  if (!snap.exists) return;

  let items = snap.data().items || [];

  // Fix legacy IDs
  items = items.map((a, index) => {
    if (!a.id) {
      return { ...a, id: `legacy_${index}_${a.type || "asset"}` };
    }
    return a;
  });

  const asset = items.find(a => a.id === assetId);
  if (!asset) {
    alert("العهدة غير موجودة");
    return;
  }

  // Open modal
  const modal = createModal();
  modal.style.display = "flex";

  const modalFields = document.getElementById("modalFields");
  modalFields.innerHTML = "";

  const editableKeys = Object.keys(asset)
    .filter(k => !["id", "type", "createdAt", "pdfUrl"].includes(k));

  editableKeys.forEach(key => {
    modalFields.innerHTML += `
      <label style="font-weight:bold;margin-top:8px">${key}</label>
      <input id="modal_${key}" value="${asset[key] || ""}" style="
        width:100%; padding:8px; margin-top:4px;
        border:1px solid #ccc; border-radius:6px;
      ">
    `;
  });

  document.getElementById("modalSave").onclick = async () => {
    const newValues = {};
    editableKeys.forEach(key => {
      newValues[key] = document.getElementById("modal_" + key).value.trim();
    });

    const updatedItem = { ...asset, ...newValues };

    const updatedArray = items.map(a => (a.id === assetId ? updatedItem : a));

    await db.collection("assets").doc(nid).set({ items: updatedArray });

    modal.style.display = "none";
    alert("تم تعديل العهدة ✔");
    loadEmployeeAssets(nid);
  };
}

window.editAsset = editAssetInternal;


/**********************************************
 * 23 — Load Employee Assets (Display)
 **********************************************/
async function loadEmployeeAssets(nid) {
  employeeAssetsList.innerHTML = "";

  const snap = await db.collection("assets").doc(nid).get();

  if (!snap.exists || !snap.data().items || snap.data().items.length === 0) {
    employeeAssetsList.textContent = "لا توجد عهد مسجلة";
    return;
  }

  let items = snap.data().items || [];

  // Fix legacy
  items = items.map((a, i) => {
    if (!a.id) return { ...a, id: `legacy_${i}_${a.type || "asset"}` };
    return a;
  });

  const types = {
    "desktop": "حاسب مكتبي",
    "g-dell": "جهاز العاصمة (G-DELL)",
    "p-hp": "جهاز العاصمة (P-HP)",
    "laptop": "حاسب محمول",
    "printer": "طابعة",
    "copier": "ماكينة تصوير",
    "other": "عهد أخرى"
  };

  // Group by type
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
/**********************************************
 * 24 — SEARCH SCREEN (Employee + Assets)
 **********************************************/
const searchNationalId = document.getElementById("searchNationalId");
const searchName = document.getElementById("searchName");
const searchEmployeeButton = document.getElementById("searchEmployeeButton");
const searchResult = document.getElementById("searchResult");
const searchEmployeeInfo = document.getElementById("searchEmployeeInfo");
const searchAssetsInfo = document.getElementById("searchAssetsInfo");

if (searchEmployeeButton) {
  searchEmployeeButton.onclick = async () => {
    const nid = searchNationalId.value.trim();
    const name = searchName.value.trim();

    let emp = null;

    if (nid) {
      const doc = await db.collection("employees").doc(nid).get();
      if (doc.exists) emp = doc.data();
    } else if (name) {
      const snap = await db.collection("employees")
        .where("name", "==", name)
        .limit(1)
        .get();
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

    // Load assets
    const snap = await db.collection("assets").doc(emp.nationalId).get();

    if (!snap.exists) {
      searchAssetsInfo.innerHTML = "لا توجد عهد";
      return;
    }

    let items = snap.data().items || [];
    if (items.length === 0) {
      searchAssetsInfo.innerHTML = "لا توجد عهد";
      return;
    }

    // Fix IDs
    items = items.map((a, i) => {
      if (!a.id) return { ...a, id: `legacy_${i}_${a.type || "asset"}` };
      return a;
    });

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
      html += `<h4>${types[t] || t}</h4><ul style="padding-right:20px;">`;

      grouped[t].forEach(a => {
        let line = "<li style='margin-bottom:6px'>";
        for (let k in a) {
          if (["id", "type", "pdfUrl", "createdAt"].includes(k)) continue;
          line += `${k}: ${a[k]} — `;
        }
        if (a.pdfUrl)
          line += `<a href="${a.pdfUrl}" target="_blank">عرض PDF</a>`;
        line += "</li>";
        html += line;
      });

      html += "</ul>";
    }

    searchAssetsInfo.innerHTML = html;
  };
}



/**********************************************
 * 25 — STORES SYSTEM (with Base64 PDF)
 **********************************************/
const storeForm = document.getElementById("storeForm");
const storesTableBody = document.querySelector("#storesTable tbody");

const storeDeptName = document.getElementById("storeDeptName");
const storeNameEl = document.getElementById("storeName");
const storeAssetType = document.getElementById("storeAssetType");
const storePermissionNo = document.getElementById("storePermissionNo");
const storeRequestDate = document.getElementById("storeRequestDate");
const storeRequestType = document.getElementById("storeRequestType");
const storeRequesterName = document.getElementById("storeRequesterName");
const storeRequesterNid = document.getElementById("storeRequesterNid");
const storeReceiverName = document.getElementById("storeReceiverName");
const storeReceiverNid = document.getElementById("storeReceiverNid");
const storeDescription = document.getElementById("storeDescription");
const storePdf = document.getElementById("storePdf");


/**********************************************
 * 26 — Convert PDF → Base64
 **********************************************/
function pdfToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // Base64 string
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


/**********************************************
 * 27 — Save Store Data (with PDF Base64)
 **********************************************/
if (storeForm) {
  storeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dept = storeDeptName.value.trim();
    const storeName = storeNameEl.value.trim();
    const type = storeAssetType.value;
    const perm = storePermissionNo.value.trim();

    if (!dept || !storeName || !type || !perm) {
      alert("برجاء إدخال البيانات الأساسية");
      return;
    }

    // Convert PDF to Base64 (if exists)
    let pdfBase64 = "";
    const pdfFile = storePdf.files[0];

    if (pdfFile) {
      try {
        pdfBase64 = await pdfToBase64(pdfFile);
      } catch (err) {
        console.error("PDF Conversion Error:", err);
      }
    }

    await db.collection("stores").add({
      dept,
      store: storeName,
      type,
      perm,
      date: storeRequestDate.value,
      reqType: storeRequestType.value,
      rName: storeRequesterName.value.trim(),
      rNid: storeRequesterNid.value.trim(),
      recName: storeReceiverName.value.trim(),
      recNid: storeReceiverNid.value.trim(),
      desc: storeDescription.value.trim(),
      pdfBase64, // <— stored directly
      createdAt: FieldValue.serverTimestamp()
    });

    alert("تم حفظ بيانات المخازن ✔");
    storeForm.reset();

    loadStores();
  });
}


/**********************************************
 * 28 — Load Stores Records
 **********************************************/
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
      <td>${s.date || ""}</td>
    `;

    tbody.appendChild(tr);
  });
}
