"use strict";

const API_URL = "http://localhost:8080/api/applications";

/* ---------------------------------------------------------
   DOM REFERENCES
--------------------------------------------------------- */
const $ = id => document.getElementById(id);

const elements = {
  table: $("applicationsTable"),
  emptyState: $("emptyState"),
  resultsCount: $("resultsCount"),
  totalStat: $("totalStat"),
  progressStat: $("progressStat"),
  interviewStat: $("interviewStat"),
  offerStat: $("offerStat"),
  search: $("searchInput"),
  statusFilter: $("statusFilter"),
  modeFilter: $("modeFilter"),
  modal: $("modalBackdrop"),
  form: $("applicationForm"),
  modalTitle: $("modalTitle"),
  modalEyebrow: $("modalEyebrow"),
  applicationId: $("applicationId"),
  companyName: $("companyName"),
  roleTitle: $("roleTitle"),
  workMode: $("workMode"),
  applicationStatus: $("applicationStatus"),
  appliedDate: $("appliedDate"),
  followUpDate: $("followUpDate"),
  jobUrl: $("jobUrl"),
  notes: $("notes"),
  formError: $("formError"),
  toast: $("toast"),
  saveButton: $("saveApplicationBtn"),
  addButton: $("addApplicationBtn"),
  pageEyebrow: $("pageEyebrow"),
  pageTitle: $("pageTitle"),
  pageSubtitle: $("pageSubtitle")
};

let applications = [];
let toastTimer;
let lastFocusedElement = null;

/* ---------------------------------------------------------
   API DATA MAPPING
--------------------------------------------------------- */
function mapApiApplication(app) {
  return {
    id: String(app.id),
    companyName: app.companyName || "",
    roleTitle: app.jobRole || "",
    status: app.applicationStatus || "Applied",
    appliedDate: app.applicationDate || "",
    followUpDate: app.followUpDate || "",
    jobUrl: app.jobLink || "",
    notes: app.notes || "",
    workMode: app.workMode || ""
  };
}

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function localDateString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "—";
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function statusSlug(status) {
  return String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function showToast(message, isError = false) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 3500);
}

function showFormError(message = "") {
  if (!elements.formError) return;
  elements.formError.textContent = message;
  elements.formError.hidden = !message;
}

/* ---------------------------------------------------------
   SEARCH + FILTER
--------------------------------------------------------- */
function getFilteredApplications() {
  const query = (elements.search?.value || "").trim().toLowerCase();
  const status = elements.statusFilter?.value || "";
  const mode = elements.modeFilter?.value || "";

  return applications.filter(app => {
    const textMatch =
      !query ||
      [app.companyName, app.roleTitle, app.notes].some(value =>
        String(value || "").toLowerCase().includes(query)
      );

    return (
      textMatch &&
      (!status || app.status === status) &&
      (!mode || app.workMode === mode)
    );
  });
}

/* ---------------------------------------------------------
   FOLLOW-UP LABEL
   Closed applications (Offer / Rejected) don't need follow-up.
--------------------------------------------------------- */
function getFollowUpInfo(app) {
  if (!app.followUpDate || ["Offer", "Rejected"].includes(app.status)) {
    return { label: "", cls: "" };
  }

  const today = localDateString();

  if (app.followUpDate < today) return { label: "Overdue", cls: "follow-up-overdue" };
  if (app.followUpDate === today) return { label: "Due today", cls: "follow-up-today" };
  return { label: "Upcoming", cls: "follow-up-upcoming" };
}

/* ---------------------------------------------------------
   RENDER
--------------------------------------------------------- */
function renderStats() {
  const count = predicate => applications.filter(predicate).length;

  elements.totalStat.textContent = applications.length;
  elements.progressStat.textContent = count(a => ["Applied", "Assessment"].includes(a.status));
  elements.interviewStat.textContent = count(a => a.status === "Interview");
  elements.offerStat.textContent = count(a => a.status === "Offer");
}

function buildRow(app) {
  const safeId = escapeHTML(app.id);
  const followUp = getFollowUpInfo(app);

  const jobLink =
    app.jobUrl && /^https?:\/\//i.test(app.jobUrl)
      ? `<a class="job-link" href="${escapeHTML(app.jobUrl)}" target="_blank" rel="noopener noreferrer">Open link ↗</a>`
      : `<span class="muted">—</span>`;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>
      <strong>${escapeHTML(app.companyName)}</strong>
      <div class="muted">${escapeHTML(app.roleTitle)}</div>
    </td>
    <td>${escapeHTML(app.workMode || "—")}</td>
    <td>
      <span class="status-badge status-${statusSlug(app.status)}">${escapeHTML(app.status)}</span>
    </td>
    <td>${escapeHTML(formatDate(app.appliedDate))}</td>
    <td>
      ${escapeHTML(formatDate(app.followUpDate))}
      ${followUp.label ? `<div class="follow-up ${followUp.cls}">${followUp.label}</div>` : ""}
    </td>
    <td>${jobLink}</td>
    <td>
      <div class="action-buttons">
        <button class="edit-btn" type="button" data-action="edit" data-id="${safeId}">Edit</button>
        <button class="delete-btn" type="button" data-action="delete" data-id="${safeId}">Delete</button>
      </div>
    </td>
  `;
  return row;
}

function renderApplications() {
  if (!elements.table) return;

  const filtered = getFilteredApplications();
  const fragment = document.createDocumentFragment();
  filtered.forEach(app => fragment.appendChild(buildRow(app)));

  elements.table.innerHTML = "";
  elements.table.appendChild(fragment);

  elements.emptyState.hidden = filtered.length > 0;
  elements.resultsCount.textContent =
    `${filtered.length} application${filtered.length === 1 ? "" : "s"}`;

  renderStats();
}

/* ---------------------------------------------------------
   LOAD FROM BACKEND
--------------------------------------------------------- */
async function fetchApplications() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);

    const data = await response.json();
    applications = data.map(mapApiApplication);
    renderApplications();
  } catch (error) {
    console.error("Could not load applications:", error);
    showToast("Could not connect to the backend. Make sure Spring Boot is running.", true);
    renderApplications();
  }
}

/* ---------------------------------------------------------
   MODAL
--------------------------------------------------------- */
function openModalWith(app = null) {
  lastFocusedElement = document.activeElement;
  elements.form.reset();
  showFormError("");

  if (app) {
    elements.applicationId.value = app.id;
    elements.companyName.value = app.companyName;
    elements.roleTitle.value = app.roleTitle;
    elements.workMode.value = app.workMode;
    elements.applicationStatus.value = app.status;
    elements.appliedDate.value = app.appliedDate;
    elements.followUpDate.value = app.followUpDate;
    elements.jobUrl.value = app.jobUrl;
    elements.notes.value = app.notes;
    elements.modalEyebrow.textContent = "UPDATE OPPORTUNITY";
    elements.modalTitle.textContent = "Edit application";
  } else {
    elements.applicationId.value = "";
    elements.appliedDate.value = localDateString();
    elements.applicationStatus.value = "Applied";
    elements.modalEyebrow.textContent = "NEW OPPORTUNITY";
    elements.modalTitle.textContent = "Add application";
  }

  elements.modal.classList.add("open");
  elements.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  elements.companyName.focus();
}

const openModal = () => openModalWith();
const openEditModal = app => openModalWith(app);

function closeModal() {
  elements.modal.classList.remove("open");
  elements.modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  elements.form.reset();
  showFormError("");

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validateForm(data) {
  if (!data.companyName) return "Please enter the company name.";
  if (!data.roleTitle) return "Please enter the job role.";

  if (data.appliedDate && data.followUpDate && data.followUpDate < data.appliedDate) {
    return "Follow-up date can't be earlier than the date applied.";
  }

  if (data.jobUrl) {
    try {
      const parsed = new URL(data.jobUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return "Use a link beginning with http:// or https://.";
      }
    } catch {
      return "Please enter a valid job link, including https://.";
    }
  }

  return "";
}

/* ---------------------------------------------------------
   SAVE / UPDATE
--------------------------------------------------------- */
async function handleFormSubmit(event) {
  event.preventDefault();

  const data = {
    companyName: elements.companyName.value.trim(),
    roleTitle: elements.roleTitle.value.trim(),
    status: elements.applicationStatus.value,
    appliedDate: elements.appliedDate.value,
    workMode: elements.workMode.value,
    jobUrl: elements.jobUrl.value.trim(),
    notes: elements.notes.value.trim(),
    followUpDate: elements.followUpDate.value
  };

  const error = validateForm(data);
  if (error) {
    showFormError(error);
    return;
  }

  const payload = {
    companyName: data.companyName,
    jobRole: data.roleTitle,
    workMode: data.workMode,
    applicationStatus: data.status,
    applicationDate: data.appliedDate || null,
    followUpDate: data.followUpDate || null,
    jobLink: data.jobUrl,
    notes: data.notes
  };

  const id = elements.applicationId.value.trim();
  const isEditing = id !== "";

  elements.saveButton.disabled = true;
  elements.saveButton.textContent = "Saving…";

  try {
    const response = await fetch(
      isEditing ? `${API_URL}/${encodeURIComponent(id)}` : API_URL,
      {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || `Server returned ${response.status}`);
    }

    closeModal();
    await fetchApplications();
    showToast(isEditing ? "Application updated!" : "Application saved!");
  } catch (err) {
    console.error("Could not save application:", err);
    showFormError("Could not save. Check that Spring Boot and MySQL are running, then try again.");
    showToast(isEditing ? "Application wasn't updated." : "Application wasn't saved.", true);
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = "Save application";
  }
}

/* ---------------------------------------------------------
   EDIT / DELETE BUTTONS
--------------------------------------------------------- */
async function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const app = applications.find(item => item.id === String(id));
  if (!app) return;

  if (button.dataset.action === "edit") {
    openEditModal(app);
    return;
  }

  if (button.dataset.action !== "delete") return;
  if (!window.confirm(`Delete the application for ${app.companyName}?`)) return;

  button.disabled = true;

  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);

    await fetchApplications();
    showToast("Application deleted.");
  } catch (err) {
    console.error("Could not delete application:", err);
    showToast("Could not delete it. Check the backend.", true);
    button.disabled = false;
  }
}

/* ---------------------------------------------------------
   PLACEMENT ELIGIBILITY CHECKER
--------------------------------------------------------- */
const CRITERIA = {
  minTenth: 70,
  minTwelfth: 70,
  minCgpa: 7.0,
  maxBacklogs: 0
};

function checkPlacementEligibility() {
  const result = $("eligibilityResult");
  const inputs = {
    tenth: $("student10th"),
    twelfth: $("student12th"),
    cgpa: $("studentCgpa"),
    backlogs: $("studentBacklogs")
  };

  if (!result || Object.values(inputs).some(input => !input)) return;

  result.classList.remove("result-success", "result-failure", "result-warning");

  const raw = Object.fromEntries(
    Object.entries(inputs).map(([key, input]) => [key, input.value.trim()])
  );

  if (Object.values(raw).some(value => value === "")) {
    result.textContent = "⚠ Please fill in all fields.";
    result.classList.add("result-warning");
    return;
  }

  const n = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Number(value)])
  );

  const invalid =
    !Object.values(n).every(Number.isFinite) ||
    n.tenth < 0 || n.tenth > 100 ||
    n.twelfth < 0 || n.twelfth > 100 ||
    n.cgpa < 0 || n.cgpa > 10 ||
    !Number.isInteger(n.backlogs) || n.backlogs < 0;

  if (invalid) {
    result.textContent =
      "⚠ Enter valid percentages (0–100), a CGPA (0–10) and a whole-number backlog count.";
    result.classList.add("result-warning");
    return;
  }

  const failed = [];
  if (n.tenth < CRITERIA.minTenth) failed.push(`Class 10th (minimum ${CRITERIA.minTenth}%)`);
  if (n.twelfth < CRITERIA.minTwelfth) failed.push(`Class 12th (minimum ${CRITERIA.minTwelfth}%)`);
  if (n.cgpa < CRITERIA.minCgpa) failed.push(`CGPA (minimum ${CRITERIA.minCgpa.toFixed(1)})`);
  if (n.backlogs > CRITERIA.maxBacklogs) failed.push("Active backlogs (none allowed)");

  if (failed.length === 0) {
    result.textContent = "🎉 You meet all the sample placement criteria!";
    result.classList.add("result-success");
  } else {
    result.textContent = "Criteria not met: " + failed.join(", ") + ".";
    result.classList.add("result-failure");
  }
}

/* ---------------------------------------------------------
   SIDEBAR NAVIGATION (single source of truth)
   Each section declares which pages it belongs to using
   data-view="dashboard applications" in the HTML.
--------------------------------------------------------- */
const PAGES = {
  dashboard: {
    eyebrow: "YOUR JOB SEARCH, IN ONE PLACE",
    title: "Application dashboard",
    subtitle: "Track your applications. Celebrate every step.",
    showAdd: true
  },
  applications: {
    eyebrow: "ALL OPPORTUNITIES",
    title: "Applications",
    subtitle: "Search, filter and manage every role you are pursuing.",
    showAdd: true
  },
  eligibility: {
    eyebrow: "PLACEMENT READINESS",
    title: "Eligibility checker",
    subtitle: "See whether you meet common placement criteria.",
    showAdd: false
  }
};

function showPage(page) {
  if (!PAGES[page]) page = "dashboard";
  const config = PAGES[page];

  document.querySelectorAll("[data-view]").forEach(section => {
    const views = section.dataset.view.split(/\s+/);
    section.hidden = !views.includes(page);
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    const active = link.dataset.page === page;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  elements.pageEyebrow.textContent = config.eyebrow;
  elements.pageTitle.textContent = config.title;
  elements.pageSubtitle.textContent = config.subtitle;
  elements.addButton.hidden = !config.showAdd;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupSidebarNavigation() {
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const page = link.dataset.page;
      showPage(page);
      history.replaceState(null, "", `#${page}`);
    });
  });

  const initial = location.hash.replace("#", "");
  showPage(PAGES[initial] ? initial : "dashboard");
}

/* ---------------------------------------------------------
   EVENT LISTENERS
--------------------------------------------------------- */
function setupEventListeners() {
  elements.addButton.addEventListener("click", openModal);
  $("emptyAddBtn")?.addEventListener("click", openModal);
  $("closeModalBtn").addEventListener("click", closeModal);
  $("cancelBtn").addEventListener("click", closeModal);

  elements.form.addEventListener("submit", handleFormSubmit);
  elements.table.addEventListener("click", handleTableClick);
  elements.search.addEventListener("input", renderApplications);
  elements.statusFilter.addEventListener("change", renderApplications);
  elements.modeFilter.addEventListener("change", renderApplications);

  elements.modal.addEventListener("click", event => {
    if (event.target === elements.modal) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && elements.modal.classList.contains("open")) {
      closeModal();
    }
  });

  $("checkEligibilityBtn").addEventListener("click", checkPlacementEligibility);

  // Pressing Enter inside the eligibility inputs also runs the check
  ["student10th", "student12th", "studentCgpa", "studentBacklogs"].forEach(id => {
    $(id)?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        checkPlacementEligibility();
      }
    });
  });
}

/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  setupSidebarNavigation();
  fetchApplications();
});
