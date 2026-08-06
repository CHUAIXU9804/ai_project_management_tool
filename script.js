const projects = [
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
    members: ["JM", "AK", "SL"],
    sources: ["gmail", "slack", "drive"],
    events: [
      {
        id: 1,
        date: "Today, 11:24 AM",
        type: "Slack",
        title: "Mobile navigation fix is ready for review",
        body: "Alex shared the updated build and asked Jordan to approve it before deployment.",
        person: "Alex Kim",
        color: "#7950c8",
      },
      {
        id: 2,
        date: "Yesterday, 3:10 PM",
        type: "Decision",
        title: "Launch moved to Friday at 4:00 PM",
        body: "The team agreed to allow one additional QA cycle. This supersedes the Wednesday launch plan.",
        person: "Jordan + 4 teammates",
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
    members: ["JM", "TN", "RC"],
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
    members: ["JM", "MB", "KW"],
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
    members: ["JM", "ET", "NP"],
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
    members: ["JM", "DL", "PS"],
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
const activity = [
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
  ["gmail", "Gmail", "Messages, threads, and attachments", "M", true],
  ["slack", "Slack", "Channels and direct messages", "S", true],
  ["drive", "Google Drive", "Documents and shared files", "D", true],
  ["calendar", "Google Calendar", "Meetings, attendees, and dates", "31", true],
  ["chat", "Google Chat", "Spaces and direct conversations", "G", false],
];
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
function renderProjects(filter = "all") {
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
        `<div class="connector"><i class="source ${c[0]}">${c[3]}</i><div><strong>${c[1]}</strong><small>${c[2]}</small></div><button type="button" data-id="${c[0]}" class="${c[4] ? "connected" : ""}">${c[4] ? "Connected" : "Connect"}</button></div>`,
    )
    .join("");
  $$(".connector button").forEach(
    (b) =>
      (b.onclick = () => {
        const c = connectors.find((c) => c[0] === b.dataset.id);
        c[4] = !c[4];
        renderConnectors();
        toast(
          `${c[1]} ${c[4] ? "connected" : "disconnected"}`,
          c[4]
            ? "Ready to scan selected content."
            : "No new content will be scanned.",
        );
      }),
  );
}
function toast(title, detail) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<i>✓</i><div><strong>${title}</strong><small>${detail}</small></div>`;
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 3300);
}
renderProjects();
renderActions();
renderActivity();
renderConnectors();
const opts = projects
  .map((p) => `<option value="${p.id}">${p.name}</option>`)
  .join("");
$("#updateProject").innerHTML = opts;
$("#uploadProject").insertAdjacentHTML("beforeend", opts);
$("#projectFilter").onchange = (e) => renderProjects(e.target.value);
$("#gridBtn").onclick = () => {
  $("#projectGrid").classList.remove("list");
  $("#gridBtn").classList.add("active");
  $("#listBtn").classList.remove("active");
};
$("#listBtn").onclick = () => {
  $("#projectGrid").classList.add("list");
  $("#listBtn").classList.add("active");
  $("#gridBtn").classList.remove("active");
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
$("#addBtn").onclick = () => $("#updateDialog").showModal();
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
    person: "Added by Jordan",
    color: p.color,
  });
  e.target.reset();
  $("#updateDialog").close();
  toast("Update added", `Added to ${p.name}'s timeline.`);
  if (activeProject?.id === p.id) renderDrawer();
};
$("#scanBtn").onclick = () => {
  const b = $("#syncBox");
  b.classList.add("loading");
  $("#scanBtn").textContent = "Scanning…";
  setTimeout(() => {
    b.classList.remove("loading");
    $("#scanBtn").textContent = "Scan for updates";
    $("#syncBox small").textContent = "Last scan just now";
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
$("#reviewBtn").onclick = () =>
  toast(
    "18 items reviewed",
    "All source links and confidence labels were preserved.",
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
