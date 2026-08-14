let currentUserDisplayName = "You";
let currentUserInitials = "ME";

let projects = [
  {
    id: "website",
    name: "Website Redesign",
    symbol: "W",
    summary: "Customer-facing website refresh and CMS migration",
    deadline: "Tomorrow",
    days: 1,
    progress: 78,
    risk: "At risk",
    color: "#4263eb",
    soft: "#eef2ff",
    members: ["ME", "AK", "SL"],
    sources: ["gmail", "slack", "drive"],
    events: [
      {
        id: 1,
        date: "Today, 11:24 AM",
        type: "Slack",
        title: "Mobile navigation fix is ready for review",
        body: "Alex shared the updated build and asked you to approve it before deployment.",
        person: "Alex Kim",
        color: "#7950c8",
      },
      {
        id: 2,
        date: "Yesterday, 3:10 PM",
        type: "Decision",
        title: "Launch moved to Friday at 4:00 PM",
        body: "The team agreed to allow one additional QA cycle. This supersedes the Wednesday launch plan.",
        person: "Current user + 4 teammates",
        color: "#4263eb",
      },
      {
        id: 3,
        date: "Aug 3, 9:30 AM",
        type: "Meeting",
        title: "Final content review",
        body: "Marketing approved the homepage copy. Legal requested one footer disclosure change.",
        person: "Google Calendar",
        color: "#17865c",
      },
    ],
    files: [
      ["Homepage-copy-final.docx", "Google Drive · yesterday"],
      ["Mobile-QA-results.pdf", "Gmail · 2 days ago"],
      ["Launch-checklist.csv", "Google Drive · Aug 2"],
    ],
  },
  {
    id: "vendor",
    name: "Vendor Migration",
    symbol: "V",
    summary: "Move payment processing to the new enterprise vendor",
    deadline: "Friday",
    days: 2,
    progress: 62,
    risk: "",
    color: "#7950c8",
    soft: "#f3efff",
    members: ["ME", "TN", "RC"],
    sources: ["gmail", "calendar", "drive"],
    events: [
      {
        id: 1,
        date: "Today, 9:05 AM",
        type: "Email",
        title: "Security review approved with conditions",
        body: "Risk requested confirmation of the vendor data-retention setting before production access.",
        person: "Priya Shah",
        color: "#d6584c",
      },
      {
        id: 2,
        date: "Aug 4, 2:00 PM",
        type: "Meeting",
        title: "Migration rehearsal completed",
        body: "All test transactions reconciled. The rollback runbook needs one owner update.",
        person: "Google Meet",
        color: "#17865c",
      },
    ],
    files: [
      ["Migration-runbook-v4.pdf", "Google Drive · today"],
      ["Vendor-risk-review.docx", "Gmail · Aug 4"],
    ],
  },
  {
    id: "campaign",
    name: "Fall Campaign",
    symbol: "F",
    summary: "Cross-channel campaign planning for the fall product launch",
    deadline: "Aug 21",
    days: 15,
    progress: 45,
    risk: "",
    color: "#d76c2c",
    soft: "#fff1e7",
    members: ["ME", "MB", "KW"],
    sources: ["slack", "drive", "calendar"],
    events: [
      {
        id: 1,
        date: "Yesterday, 4:42 PM",
        type: "Slack",
        title: "Creative direction selected",
        body: "The team selected concept B after reviewing research and production cost.",
        person: "Marketing channel",
        color: "#7950c8",
      },
      {
        id: 2,
        date: "Aug 1, 10:00 AM",
        type: "File",
        title: "Audience research added",
        body: "The updated deck was associated with this project at 94% confidence.",
        person: "Google Drive",
        color: "#2c966d",
      },
    ],
    files: [
      ["Fall-campaign-brief.pdf", "Google Drive · yesterday"],
      ["Audience-research.pptx", "Google Drive · Aug 1"],
    ],
  },
  {
    id: "onboarding",
    name: "Client Onboarding",
    symbol: "C",
    summary: "Implementation and training plan for Northstar Health",
    deadline: "Sep 4",
    days: 29,
    progress: 31,
    risk: "Needs input",
    color: "#17865c",
    soft: "#e8f7f0",
    members: ["ME", "ET", "NP"],
    sources: ["gmail", "calendar", "slack"],
    events: [
      {
        id: 1,
        date: "Today, 8:17 AM",
        type: "Email",
        title: "Client requested another training session",
        body: "Northstar asked for a reporting workshop for its operations team.",
        person: "Erin Torres",
        color: "#d6584c",
      },
      {
        id: 2,
        date: "Aug 2, 1:00 PM",
        type: "Meeting",
        title: "Technical kickoff completed",
        body: "SSO and data export responsibilities were assigned.",
        person: "Google Calendar",
        color: "#17865c",
      },
    ],
    files: [["Northstar-onboarding-plan.docx", "Gmail · today"]],
  },
  {
    id: "quarterly",
    name: "Quarterly Planning",
    symbol: "Q",
    summary: "Q4 goals, staffing model, and operating plan",
    deadline: "Oct 2",
    days: 57,
    progress: 18,
    risk: "",
    color: "#2e8aa6",
    soft: "#e8f7fa",
    members: ["ME", "DL", "PS"],
    sources: ["drive", "calendar", "gmail"],
    events: [
      {
        id: 1,
        date: "Aug 4, 11:00 AM",
        type: "Meeting",
        title: "Initial priorities collected",
        body: "Department leads submitted preliminary priorities and staffing constraints.",
        person: "Planning workshop",
        color: "#17865c",
      },
    ],
    files: [["Q4-planning-template.xlsx", "Google Drive · Aug 4"]],
  },
];
let actions = [
  {
    id: 1,
    title: "Approve mobile navigation before deployment",
    project: "Website Redesign",
    projectId: "website",
    due: "Overdue",
    overdue: true,
    color: "#4263eb",
  },
  {
    id: 2,
    title: "Confirm vendor data-retention setting",
    project: "Vendor Migration",
    projectId: "vendor",
    due: "Today",
    color: "#7950c8",
  },
  {
    id: 3,
    title: "Review campaign budget assumptions",
    project: "Fall Campaign",
    projectId: "campaign",
    due: "Tomorrow",
    color: "#d76c2c",
  },
  {
    id: 4,
    title: "Schedule client reporting workshop",
    project: "Client Onboarding",
    projectId: "onboarding",
    due: "Aug 10",
    color: "#17865c",
  },
];
let activity = [
  {
    icon: "M",
    text: "<b>Priya Shah</b> sent “Security review approved”",
    meta: "Vendor Migration · Gmail",
    time: "12 min",
    color: "#d6584c",
    soft: "#fff0ef",
  },
  {
    icon: "S",
    text: "<b>Alex Kim</b> shared a mobile navigation update",
    meta: "Website Redesign · Slack",
    time: "32 min",
    color: "#7950c8",
    soft: "#f3efff",
  },
  {
    icon: "D",
    text: "<b>Fall-campaign-brief.pdf</b> was updated",
    meta: "Fall Campaign · Google Drive",
    time: "1 hr",
    color: "#17865c",
    soft: "#e8f7f0",
  },
  {
    icon: "✦",
    text: "AI connected <b>4 related items</b> to Client Onboarding",
    meta: "Confidence: 91%",
    time: "2 hrs",
    color: "#4263eb",
    soft: "#eef2ff",
  },
];
const connectors = [
  { id: "gmail", name: "Gmail", description: "Import selected messages, threads, and attachment metadata", icon: "M", connected: false },
  { id: "google_calendar", name: "Google Calendar", description: "Import meetings, attendees, dates, and descriptions", icon: "31", connected: false },
  { id: "slack", name: "Slack", description: "Planned after Gmail and Calendar", icon: "S", connected: false, comingSoon: true },
];
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
function renderProjects(filter = "all") {
  return; // Stage 7: the project grid is replaced by the chronological timeline.
  // eslint-disable-next-line no-unreachable
  const shown = projects.filter(
    (p) =>
      filter === "all" ||
      (filter === "urgent" && p.days <= 7) ||
      (filter === "risk" && p.risk),
  );
  $("#projectGrid").innerHTML =
    shown
      .map(
        (p) =>
          `<article class="project-card" tabindex="0" data-id="${p.id}" style="--color:${p.color};--soft:${p.soft}"><div><div class="card-top"><span class="project-symbol">${p.symbol}</span><button class="more" aria-label="More options">•••</button></div><h3>${p.name}</h3><p class="summary">${p.summary}</p></div><div><div class="meta"><span class="${p.days <= 2 ? "urgent" : ""}">◷ Due ${p.deadline}</span>${p.risk ? `<span class="risk">${p.risk}</span>` : ""}</div><div class="track"><i style="width:${p.progress}%"></i></div><div class="progress"><span>Progress</span><b>${p.progress}%</b></div></div><div class="card-foot"><span class="avatars">${p.members.map((m) => `<i>${m}</i>`).join("")}</span><span class="chips">${p.sources.map((s) => `<i class="${s}">${s === "calendar" ? "31" : s[0].toUpperCase()}</i>`).join("")}</span><button class="open-project">→</button></div></article>`,
      )
      .join("") || '<p class="empty">No projects match this filter.</p>';
  $$(".project-card").forEach((c) => {
    c.onclick = (e) => !e.target.closest(".more") && openProject(c.dataset.id);
    c.onkeydown = (e) => e.key === "Enter" && openProject(c.dataset.id);
  });
}
function renderActions() {
  $("#actionList").innerHTML = actions
    .map(
      (a) =>
        `<div class="action ${a.done ? "done" : ""}" data-id="${a.id}"><input type="checkbox" ${a.done ? "checked" : ""} aria-label="Complete ${a.title}"><div><strong>${a.title}</strong><small><i class="dot" style="--dot:${a.color}"></i>${a.project}</small></div><span class="due ${a.overdue ? "overdue" : ""}">${a.due}</span></div>`,
    )
    .join("");
  $$(".action input").forEach(
    (x) =>
      (x.onchange = () => {
        const a = actions.find((a) => a.id == x.closest(".action").dataset.id);
        a.done = x.checked;
        renderActions();
        $("#actionCount").textContent =
          actions.filter((a) => !a.done).length + 4;
        toast(x.checked ? "Action completed" : "Action reopened", a.title);
      }),
  );
}
function renderActivity() {
  $("#activityList").innerHTML = activity
    .map(
      (a) =>
        `<div class="activity"><i style="--color:${a.color};--soft:${a.soft}">${a.icon}</i><div><p>${a.text}</p><small>${a.meta}</small></div><time>${a.time}</time></div>`,
    )
    .join("");
}
let activeProject = null,
  activeTab = "timeline";
function openProject(id) {
  activeProject = projects.find((p) => p.id === id);
  activeTab = "timeline";
  $("#drawerTitle").textContent = activeProject.name;
  $$(".tabs button").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === "timeline"),
  );
  renderDrawer();
  $("#drawer").classList.add("open");
  $("#backdrop").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
}
function closeDrawer() {
  $("#drawer").classList.remove("open");
  $("#backdrop").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden", "true");
}
function renderDrawer() {
  if (activeTab === "timeline")
    $("#drawerBody").innerHTML =
      `<div class="timeline">${activeProject.events.map((e) => `<article class="event" data-event="${e.id}" style="--event:${e.color}"><time>${e.date} · ${e.type}</time><h3>${e.title}</h3><p>${e.body}</p><footer>${e.person}<span><button class="edit">Edit</button><button class="delete">Delete</button></span></footer></article>`).join("")}</div>`;
  if (activeTab === "actions") {
    const a = actions.filter((x) => x.projectId === activeProject.id);
    $("#drawerBody").innerHTML = a.length
      ? a
          .map(
            (x) =>
              `<div class="action"><input type="checkbox" ${x.done ? "checked" : ""}><div><strong>${x.title}</strong><small>${x.project}</small></div><span class="due">${x.due}</span></div>`,
          )
          .join("")
      : '<p class="empty">No open actions for this project.</p>';
  }
  if (activeTab === "files")
    $("#drawerBody").innerHTML = activeProject.files
      .map(
        (f) =>
          `<div class="file-row"><i>${f[0].split(".").pop().toUpperCase()}</i><div><strong>${f[0]}</strong><small>${f[1]}</small></div><button class="link-btn">Open ↗</button></div>`,
      )
      .join("");
  $$(".delete").forEach(
    (b) =>
      (b.onclick = () => {
        activeProject.events = activeProject.events.filter(
          (e) => e.id != b.closest(".event").dataset.event,
        );
        renderDrawer();
        toast("Timeline item deleted", "The project memory was updated.");
      }),
  );
  $$(".edit").forEach(
    (b) =>
      (b.onclick = () => {
        const e = activeProject.events.find(
            (e) => e.id == b.closest(".event").dataset.event,
          ),
          v = prompt("Edit timeline title:", e.title);
        if (v?.trim()) {
          e.title = v.trim();
          renderDrawer();
          toast("Timeline item updated", e.title);
        }
      }),
  );
}
function renderConnectors() {
  $("#connectorList").innerHTML = connectors
    .map(
      (c) =>
        `<div class="connector"><i class="source ${c.id}">${c.icon}</i><div><strong>${c.name}</strong><small>${c.description}</small></div><button type="button" data-connector="${c.id}" class="${c.connected ? "connected" : ""}" ${c.comingSoon ? "disabled" : ""}>${c.comingSoon ? "Coming soon" : c.connected ? "Connected" : "Connect"}</button></div>`,
    )
    .join("");
  renderIntegrationOptions();
  $$('[data-connector]:not([disabled])').forEach((button) => {
    button.onclick = () => connectSource(button.dataset.connector);
  });
}

function renderIntegrationOptions() {
  const target = $("#integrationOptions");
  if (!target) return;
  target.innerHTML = connectors
    .filter((connector) => !connector.comingSoon)
    .map((connector) => `
      <article class="integration-option ${connector.connected ? "is-connected" : ""}">
        <i class="source ${connector.id}">${connector.icon}</i>
        <div><strong>${connector.name}</strong><small>${connector.connected ? "Sync is active" : "Connect to import automatically"}</small></div>
        <button type="button" data-connector="${connector.id}">${connector.connected ? "Manage" : "Connect"}</button>
      </article>`)
    .join("");
}

async function connectSource(provider) {
  const connector = connectors.find((item) => item.id === provider);
  if (!connector) return;
  if (connector.connected) {
    $("#sourcesDialog").showModal();
    return;
  }
  if (!window.startSourceConnection) {
    toast("Integration setup required", "Deploy the Google OAuth Edge Function before connecting this source.");
    return;
  }
  try {
    await window.startSourceConnection(provider);
  } catch (error) {
    toast(`Could not connect ${connector.name}`, error.message);
  }
}

window.setSourceConnections = (rows = []) => {
  connectors.forEach((connector) => {
    connector.connected = rows.some((row) => row.provider === connector.id && row.status === "active");
  });
  const connected = connectors.filter((connector) => connector.connected);
  document.body.classList.toggle("has-integrations", connected.length > 0);
  const welcomeStatus = $("#welcomeStatus");
  const connectionSummary = $("#connectionSummary");
  const integrationDescription = $("#integrationDescription");
  if (connected.length) {
    welcomeStatus.textContent = `${connected.length} source${connected.length === 1 ? " is" : "s are"} connected. ThreadLinePMA will organize imported updates below.`;
    connectionSummary.innerHTML = `<span>✓</span><div><strong>${connected.length} app${connected.length === 1 ? "" : "s"} connected</strong><small>${connected.map((connector) => connector.name).join(" · ")}</small></div>`;
    integrationDescription.textContent = "Your automatic imports are active. Connect another source or manage an existing connection at any time.";
    $("#syncTitle").textContent = "Automatic sync active";
    $("#syncStatus").textContent = "Ready to scan connected sources";
    $("#scanBtn").textContent = "Scan for updates";
  } else {
    welcomeStatus.textContent = "Connect at least one work app to start building your dashboard automatically.";
    connectionSummary.innerHTML = '<span>1</span><div><strong>First, connect your work apps</strong><small>Gmail or Google Calendar takes only a minute</small></div>';
    integrationDescription.textContent = "Connect Gmail or Google Calendar first. ThreadLinePMA imports relevant information, groups it into projects, builds timelines, and extracts action items for you.";
    $("#syncTitle").textContent = "Waiting for a connection";
    $("#syncStatus").textContent = "No automatic imports yet";
    $("#scanBtn").textContent = "Connect apps";
  }
  renderConnectors();
  $$("#sidebarSources li").forEach((row, index) => {
    const connector = connectors[index];
    const state = row.querySelector(".source-state");
    if (connector && state) state.textContent = connector.connected ? "Connected" : "Not connected";
    row.classList.toggle("is-connected", Boolean(connector?.connected));
  });
};
function toast(title, detail) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<i>✓</i><div><strong>${title}</strong><small>${detail}</small></div>`;
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 3300);
}
window.showToast = toast;

// Stage 7: auth.js loads the real projects/events/actions from Supabase and
// hands them here to replace whatever is currently rendered.
function renderAttention(list = []) {
  const host = $("#attentionList");
  if (!host) return;
  host.innerHTML = list.length
    ? list
        .map(
          (a) =>
            `<div class="att-card clickable" data-project="${a.id || ""}" style="--color:${a.color || "#4263eb"}"><strong>${escHtml(a.project)}</strong><p class="att-status">${escHtml(a.status)}</p>${a.suggested ? `<p class="att-suggest">Suggested: ${escHtml(a.suggested)}</p>` : ""}</div>`,
        )
        .join("")
    : '<p class="empty">Nothing needs your attention right now.</p>';
  $$("#attentionList .att-card").forEach((c) => {
    if (c.dataset.project) c.onclick = () => openProjectDrawer(c.dataset.project);
  });
}

function renderActivityFeed(days = []) {
  const host = $("#activityTimeline");
  if (!host) return;
  host.innerHTML = days.length
    ? days
        .map(
          (d) =>
            `<div class="day-group"><h4>${escHtml(d.label)}</h4>${d.items
              .map((it) => {
                const isCal = it.source_type === "google_calendar";
                const icon = isCal ? "📅" : "✉";
                const label = isCal ? "Calendar" : "Gmail";
                return `<div class="act-row clickable" data-item="${it.id || ""}"><span class="act-dot"></span><div class="act-body"><strong>${escHtml(it.project)} — ${escHtml(it.title)}</strong><small><span class="src">${icon}</span>${label}</small></div></div>`;
              })
              .join("")}</div>`,
        )
        .join("")
    : '<p class="empty">No recent activity.</p>';
  $$("#activityTimeline .act-row").forEach((r) => {
    if (r.dataset.item) r.onclick = () => openItem(r.dataset.item);
  });
}

function renderUpcoming(list = []) {
  const host = $("#upcomingList");
  if (!host) return;
  host.innerHTML = list.length
    ? list
        .map(
          (u) =>
            `<div class="up-row clickable" data-item="${u.id || ""}"><span class="up-when">${escHtml(u.when)}</span><span class="up-title">${escHtml(u.title)}</span></div>`,
        )
        .join("")
    : '<p class="empty">Nothing upcoming.</p>';
  $$("#upcomingList .up-row").forEach((r) => {
    if (r.dataset.item) r.onclick = () => openItem(r.dataset.item);
  });
}

window.setDashboardData = ({ attention = [], activityDays = [], upcoming = [], projects: projList = [] } = {}) => {
  renderAttention(attention);
  renderActivityFeed(activityDays);
  renderUpcoming(upcoming);
  const opts = projList
    .map((p) => `<option value="${p.id}">${escHtml(p.name)}</option>`)
    .join("");
  const updateSelect = $("#updateProject");
  if (updateSelect) updateSelect.innerHTML = opts;
};

// ---- Stage 7: chronological timeline of source items + thread drawer ----
let timelineFeed = [];
let allItems = [];
let projectIndex = {};

function escHtml(value = "") {
  const el = document.createElement("div");
  el.textContent = value;
  return el.innerHTML;
}

let _dragMoved = false;

function _startOfWeek(date) {
  const x = new Date(date);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function _bucketFor(dateVal, unit) {
  if (!dateVal) return { key: "undated", label: "Undated", sort: Infinity };
  const d = new Date(dateVal);
  if (unit === "month") {
    const s = new Date(d.getFullYear(), d.getMonth(), 1);
    return { key: `m${s.getTime()}`, label: s.toLocaleDateString(undefined, { month: "short", year: "numeric" }), sort: s.getTime() };
  }
  if (unit === "week") {
    const s = _startOfWeek(d);
    return { key: `w${s.getTime()}`, label: s.toLocaleDateString(undefined, { month: "short", day: "numeric" }), sort: s.getTime() };
  }
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return { key: `d${s.getTime()}`, label: s.toLocaleDateString(undefined, { month: "short", day: "numeric" }), sort: s.getTime() };
}

function _wireDragScroll(el) {
  let down = false, startX = 0, startLeft = 0;
  el.onpointerdown = (e) => {
    down = true; _dragMoved = false; startX = e.clientX; startLeft = el.scrollLeft;
    el.classList.add("dragging");
  };
  el.onpointermove = (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) _dragMoved = true;
    el.scrollLeft = startLeft - dx;
  };
  const up = () => {
    down = false;
    el.classList.remove("dragging");
    setTimeout(() => (_dragMoved = false), 0);
  };
  el.onpointerup = up;
  el.onpointerleave = up;
}

// Draggable swimlane board: rows are projects (categories), columns are time
// buckets, each card is a thread. Click a card -> full thread history.
function renderTimeline(gran = "auto") {
  const host = $("#projectGrid");
  if (!host) return;
  host.className = "tl-board";

  // Group feed items into threads (by email thread, else the item itself).
  const threads = {};
  for (const it of timelineFeed) {
    const key = it.external_thread_id || `i:${it.id}`;
    const t = (threads[key] ||= { key, items: [], project: "Unsorted" });
    t.items.push(it);
    if (it.project) t.project = it.project;
  }
  const threadList = Object.values(threads).map((t) => {
    t.items.sort((a, b) => new Date(b.occurred_at || 0) - new Date(a.occurred_at || 0));
    const rep = t.items[0];
    return {
      repId: rep.id,
      project: t.project,
      title: rep.title || "(no subject)",
      source_type: rep.source_type,
      date: rep.occurred_at,
      count: t.items.length,
    };
  });
  if (!threadList.length) {
    host.innerHTML = '<p class="empty">No items yet. Connect Gmail or Google Calendar, then sync.</p>';
    return;
  }

  // Pick a time unit.
  const times = threadList.map((t) => (t.date ? new Date(t.date).getTime() : null)).filter(Boolean);
  const rangeDays = times.length ? (Math.max(...times) - Math.min(...times)) / 86400000 : 0;
  let unit = gran;
  if (!["day", "week", "month"].includes(gran)) {
    unit = rangeDays <= 45 ? "day" : rangeDays <= 365 ? "week" : "month";
  }

  // Buckets present in the data, oldest -> newest.
  const bucketMap = {};
  for (const t of threadList) {
    const b = _bucketFor(t.date, unit);
    t.bucket = b.key;
    bucketMap[b.key] ||= b;
  }
  const buckets = Object.values(bucketMap).sort((a, b) => a.sort - b.sort);

  // Lanes = projects, busiest first, Unsorted last.
  const laneMap = {};
  for (const t of threadList) (laneMap[t.project] ||= []).push(t);
  const lanes = Object.keys(laneMap).sort((a, b) => {
    if (a === "Unsorted") return 1;
    if (b === "Unsorted") return -1;
    return laneMap[b].length - laneMap[a].length;
  });

  const card = (t) => {
    const cls = t.source_type === "google_calendar" ? "calendar" : "gmail";
    const icon = t.source_type === "google_calendar" ? "31" : "M";
    return `<button class="tl-card" data-item="${t.repId}"><i class="source ${cls}">${icon}</i><span class="tl-card-title">${escHtml(t.title)}</span>${t.count > 1 ? `<span class="tl-count">${t.count}</span>` : ""}</button>`;
  };

  let html = `<div class="tl-grid" style="grid-template-columns:170px repeat(${buckets.length},180px)">`;
  html += `<div class="tl-corner"></div>`;
  for (const b of buckets) html += `<div class="tl-col-head">${escHtml(b.label)}</div>`;
  for (const lane of lanes) {
    html += `<div class="tl-lane-label" title="${escHtml(lane)}">${escHtml(lane)}</div>`;
    const byBucket = {};
    for (const t of laneMap[lane]) (byBucket[t.bucket] ||= []).push(t);
    for (const b of buckets) {
      html += `<div class="tl-cell">${(byBucket[b.key] || []).map(card).join("")}</div>`;
    }
  }
  html += `</div>`;
  host.innerHTML = html;

  $$(".tl-card").forEach((c) => (c.onclick = () => {
    if (_dragMoved) return;
    openThread(c.dataset.item);
  }));
  _wireDragScroll(host);
  host.scrollLeft = host.scrollWidth; // start at the most recent
}

function _projectBlocks(project) {
  if (!project) return "";
  let html = `<div class="dp-head"><span class="dp-symbol" style="--color:${project.color || "#4263eb"}">${escHtml(project.symbol || "P")}</span><div><strong>${escHtml(project.name)}</strong>${project.summary ? `<p>${escHtml(project.summary)}</p>` : ""}</div></div>`;
  const openActs = (project.actions || []).filter((a) => !a.done);
  if (openActs.length) {
    html += `<div class="dp-block"><h4>Open actions</h4>${openActs
      .map((a) => `<div class="dp-action"><span>${escHtml(a.title)}</span><em>${escHtml(a.due || "")}</em></div>`)
      .join("")}</div>`;
  }
  if ((project.events || []).length) {
    html += `<div class="dp-block"><h4>Project timeline</h4>${project.events
      .slice(0, 8)
      .map((e) => `<div class="dp-event"><time>${escHtml(e.date)} · ${escHtml(e.type)}</time><strong>${escHtml(e.title)}</strong>${e.body ? `<p>${escHtml(e.body)}</p>` : ""}</div>`)
      .join("")}</div>`;
  }
  return html;
}

function _threadBlock(items, heading) {
  return `<div class="dp-block"><h4>${escHtml(heading)}</h4><div class="thread">${items
    .map(
      (m) =>
        `<article class="thread-msg"><header><strong>${escHtml(m.sender || "Unknown")}</strong><time>${escHtml(m.when || "")}</time></header>${m.title ? `<div class="tm-subject">${escHtml(m.title)}</div>` : ""}<p>${escHtml(m.snippet || "")}</p>${m.source_url ? `<a class="link-btn" href="${m.source_url}" target="_blank" rel="noopener">Open original ↗</a>` : ""}</article>`,
    )
    .join("")}</div></div>`;
}

function _openDrawer(title, eyebrow, bodyHtml) {
  const eb = $("#drawer .eyebrow");
  if (eb) eb.textContent = eyebrow;
  const tabs = $(".tabs");
  if (tabs) tabs.style.display = "none";
  $("#drawerTitle").textContent = title;
  $("#drawerBody").innerHTML = bodyHtml;
  $("#drawer").classList.add("open");
  $("#backdrop").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
}

// Click an item (activity row / upcoming / timeline card): show its project
// details + the full thread conversation.
function openItem(itemId) {
  const item = allItems.find((i) => String(i.id) === String(itemId));
  if (!item) return;
  const project = item.project_id ? projectIndex[item.project_id] : null;
  const thread = item.external_thread_id
    ? allItems.filter((i) => i.external_thread_id === item.external_thread_id)
    : [item];
  thread.sort((a, b) => new Date(a.occurred_at || 0) - new Date(b.occurred_at || 0));
  _openDrawer(
    item.title || (project && project.name) || "(no subject)",
    project ? "PROJECT & THREAD" : "THREAD",
    _projectBlocks(project) + _threadBlock(thread, "Conversation"),
  );
}

// Click a project (attention card): show the project details + its messages.
function openProjectDrawer(projectId) {
  const project = projectIndex[projectId];
  if (!project) return;
  const items = allItems
    .filter((i) => i.project_id === projectId)
    .sort((a, b) => new Date(b.occurred_at || 0) - new Date(a.occurred_at || 0));
  _openDrawer(project.name, "PROJECT", _projectBlocks(project) + _threadBlock(items, "Related messages"));
}

// Back-compat alias for the swimlane cards.
const openThread = openItem;

window.setTimelineData = ({ feed = [], all = [], projects = {} } = {}) => {
  timelineFeed = feed;
  allItems = all;
  projectIndex = projects || {};
  renderTimeline($("#timelineFilter")?.value || "auto");
};

// Populate the summary tiles + sidebar counts from real data.
window.setMetrics = (m = {}) => {
  const set = (id, val) => {
    const el = $("#" + id);
    if (el) el.textContent = val ?? 0;
  };
  set("statProjects", m.activeProjects);
  set("statDueWeek", m.dueThisWeek);
  set("statAttention", m.needAttention);
  set("statWaiting", m.waiting);
  set("statWeek", m.thisWeek);
  set("navProjectCount", m.activeProjects);
  set("navActionCount", m.openActions);
};

window.updateCurrentUserUI = (displayName) => {
  currentUserDisplayName = displayName || "You";
  currentUserInitials = currentUserDisplayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "ME";

  const welcomeName = document.querySelector("#welcomeUserName");
  if (welcomeName) welcomeName.textContent = currentUserDisplayName;

  projects.forEach((project) => {
    if (project.members.length) project.members[0] = currentUserInitials;
    project.events.forEach((event) => {
      if (event.person === "Current user + 4 teammates" || event.person.endsWith(" + 4 teammates")) {
        event.person = `${currentUserDisplayName} + 4 teammates`;
      }
    });
  });

  renderProjects($("#projectFilter")?.value || "all");
  if (activeProject) {
    activeProject = projects.find((project) => project.id === activeProject.id);
    renderDrawer();
  }
};

// Stage 7: start empty so no fabricated content shows; auth.js fills the
// dashboard from Supabase after sign-in via window.setDashboardData.
projects = [];
actions = [];
activity = [];
renderConnectors();
const timelineFilterEl = $("#timelineFilter");
if (timelineFilterEl)
  timelineFilterEl.onchange = (e) => renderTimeline(e.target.value);
const viewTimelineBtn = $("#viewTimelineBtn");
if (viewTimelineBtn)
  viewTimelineBtn.onclick = () => {
    const wrap = $("#timelineWrap");
    const feed = $("#activityTimeline");
    if (!wrap) return;
    if (wrap.hasAttribute("hidden")) {
      wrap.removeAttribute("hidden");
      if (feed) feed.style.display = "none";
      viewTimelineBtn.textContent = "Hide timeline ◂";
      renderTimeline($("#timelineFilter")?.value || "auto");
    } else {
      wrap.setAttribute("hidden", "");
      if (feed) feed.style.display = "";
      viewTimelineBtn.textContent = "View timeline ▸";
    }
  };
$("#closeDrawer").onclick = $("#backdrop").onclick = closeDrawer;
$$(".tabs button").forEach(
  (b) =>
    (b.onclick = () => {
      $$(".tabs button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      activeTab = b.dataset.tab;
      renderDrawer();
    }),
);
$("#uploadBtn").onclick = () => $("#uploadDialog").showModal();
$("#optionalUploadBtn").onclick = () => $("#uploadDialog").showModal();
$("#addBtn").onclick = () => $("#updateDialog").showModal();
$("#connectAppsBtn").onclick = () => $("#sourcesDialog").showModal();
$("#manageSources").onclick = $("#sourcesNav").onclick = () =>
  $("#sourcesDialog").showModal();
$$(".close-dialog").forEach(
  (b) => (b.onclick = () => b.closest("dialog").close()),
);
let chosen = [];
function filePreview() {
  $("#fileList").innerHTML = chosen
    .map(
      (f, i) =>
        `<div class="file-preview"><span>${f.name} · ${Math.round(f.size / 1024)} KB</span><button type="button" data-i="${i}">Remove</button></div>`,
    )
    .join("");
  $$("[data-i]").forEach(
    (b) =>
      (b.onclick = () => {
        chosen.splice(+b.dataset.i, 1);
        filePreview();
      }),
  );
}
$("#fileInput").onchange = (e) => {
  chosen = [...e.target.files];
  filePreview();
};
["dragenter", "dragover"].forEach((n) =>
  $("#dropZone").addEventListener(n, (e) => {
    e.preventDefault();
    $("#dropZone").classList.add("drag");
  }),
);
["dragleave", "drop"].forEach((n) =>
  $("#dropZone").addEventListener(n, (e) => {
    e.preventDefault();
    $("#dropZone").classList.remove("drag");
  }),
);
$("#dropZone").ondrop = (e) => {
  chosen = [...e.dataTransfer.files];
  filePreview();
};
$("#processBtn").onclick = () => {
  if (!chosen.length)
    return toast("Choose at least one file", "Nothing is selected yet.");
  const n = chosen.length;
  chosen = [];
  filePreview();
  $("#uploadDialog").close();
  toast(
    `${n} file${n > 1 ? "s" : ""} queued`,
    "Ready for your future Python processing API.",
  );
};
$("#updateForm").onsubmit = (e) => {
  e.preventDefault();
  const p = projects.find((p) => p.id === $("#updateProject").value);
  p.events.unshift({
    id: Date.now(),
    date: "Just now",
    type: $("#updateType").value,
    title: $("#updateTitle").value,
    body: $("#updateDetails").value,
    person: `Added by ${currentUserDisplayName}`,
    color: p.color,
  });
  e.target.reset();
  $("#updateDialog").close();
  toast("Update added", `Added to ${p.name}'s timeline.`);
  if (activeProject?.id === p.id) renderDrawer();
};
$("#scanBtn").onclick = () => {
  if (!connectors.some((connector) => connector.connected)) {
    $("#sourcesDialog").showModal();
    return;
  }
  const b = $("#syncBox");
  b.classList.add("loading");
  $("#scanBtn").textContent = "Scanning…";
  setTimeout(() => {
    b.classList.remove("loading");
    $("#scanBtn").textContent = "Scan for updates";
    $("#syncStatus").textContent = "Last scan just now";
    toast(
      "Workspace scan complete",
      "3 new items matched to existing projects.",
    );
  }, 1400);
};
$("#searchInput").oninput = (e) => {
  const q = e.target.value.toLowerCase().trim();
  $$(".project-card").forEach((c) => {
    const p = projects.find((p) => p.id === c.dataset.id),
      hay =
        `${p.name} ${p.summary} ${p.events.map((e) => e.title + " " + e.body).join(" ")}`.toLowerCase();
    c.style.display = !q || hay.includes(q) ? "" : "none";
  });
};
document.onkeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    $("#searchInput").focus();
  }
  if (e.key === "Escape") closeDrawer();
};
$("#menuBtn").onclick = () => $("#sidebar").classList.toggle("open");
$$(".nav[data-target]").forEach(
  (b) =>
    (b.onclick = () => {
      $$(".nav").forEach((n) => n.classList.remove("active"));
      b.classList.add("active");
      $("#" + b.dataset.target)?.scrollIntoView({ behavior: "smooth" });
      if (innerWidth < 800) $("#sidebar").classList.remove("open");
    }),
);
$("#allActionsBtn").onclick = () => {
  if (!actions.some((a) => a.id === 5)) {
    actions.push({
      id: 5,
      title: "Send final analytics requirements",
      project: "Quarterly Planning",
      projectId: "quarterly",
      due: "Aug 14",
      color: "#2e8aa6",
    });
    renderActions();
  }
  toast("Showing all actions", "Additional project actions are now visible.");
};
