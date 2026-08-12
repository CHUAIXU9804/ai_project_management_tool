// User Authentication Logic stays in the file
(() => {
  const config = window.SUPABASE_CONFIG;
  if (!config || config.url.includes("YOUR_PROJECT") || config.publishableKey.includes("REPLACE_ME")) {
    document.body.classList.remove("auth-pending");
    console.error("Complete supabase-config.js before using authentication.");
    return;
  }

  const db = window.supabase.createClient(config.url, config.publishableKey);
  window.supabaseDb = db;

  const element = (id) => document.getElementById(id);
  const loginDialog = element("loginDialog");
  const signupDialog = element("signupDialog");
  const accountDialog = element("accountDialog");
  let creatingAccount = false;

  function showMessage(message, isError = false) {
    const output = element("authMessage");
    output.textContent = message;
    output.classList.toggle("error-message", isError);
  }

  function clearSensitiveFields() {
    ["authPassword", "signupPassword", "signupPasswordConfirm", "newPassword"]
      .forEach((id) => {
        const input = element(id);
        if (input) input.value = "";
      });
    const loginPassword = element("authPassword");
    if (loginPassword) loginPassword.type = "password";
    const toggle = element("togglePassword");
    if (toggle) {
      toggle.textContent = "Show";
      toggle.setAttribute("aria-label", "Show password");
    }
  }

  function initials(name) {
    return (name || "User")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function authDisplayName(user) {
    const metadataName =
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name;

    if (metadataName?.trim()) return metadataName.trim();

    const emailName = user.email?.split("@")[0] || "User";
    return emailName
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  async function loadProfile(user) {
    // Update the UI immediately, even if the profile row is missing or unavailable.
    const fallbackName = authDisplayName(user);
    window.updateCurrentUserUI?.(fallbackName);
    element("profileInitials").textContent = initials(fallbackName);
    element("profileName").textContent = fallbackName;
    element("profileTitle").textContent = "Project manager";
    element("accountEmail").textContent = user.email || "";

    const { data, error } = await db
      .from("profiles")
      .select("display_name, job_title")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Unable to load profile; using Supabase Auth name instead.", error);
      return;
    }

    const displayName = data?.display_name?.trim() || fallbackName;
    const jobTitle = data?.job_title || "Project manager";
    element("profileInitials").textContent = initials(displayName);
    element("profileName").textContent = displayName;
    element("profileTitle").textContent = jobTitle;
    element("profileDisplayName").value = data?.display_name || fallbackName;
    element("profileJobTitle").value = data?.job_title || "";
    element("accountEmail").textContent = user.email;
    window.updateCurrentUserUI?.(displayName);
  }

  async function showAuthenticatedUser(session) {
    if (!session?.user) {
      clearSensitiveFields();
      if (!loginDialog.open) loginDialog.showModal();
      document.body.classList.remove("auth-pending");
      return;
    }

    if (loginDialog.open) loginDialog.close();
    document.body.classList.remove("auth-pending");
    await loadProfile(session.user);
    await loadSourceConnections(session.user);
    await loadProjectData(session.user);
  }

  async function loadSourceConnections(user) {
    const { data, error } = await db
      .from("source_connections")
      .select("provider, status, account_email, last_synced_at")
      .eq("user_id", user.id);
    if (error) {
      console.error("Unable to load source connections.", error);
      return;
    }
    window.setSourceConnections?.(data);
  }

  // Stage 7: load the user's real projects, timeline events, and actions from
  // Supabase and hand them to the dashboard renderer (window.setDashboardData).
  async function loadProjectData(user) {
    const esc = (value = "") => {
      const el = document.createElement("div");
      el.textContent = value;
      return el.innerHTML;
    };
    const cap = (s = "") => (s ? s[0].toUpperCase() + s.slice(1) : "");
    const fmtShort = (d) =>
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const fmtDateTime = (ts) =>
      ts
        ? new Date(ts).toLocaleString(undefined, {
            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
          })
        : "";
    const dayLabel = (dateStr) => {
      if (!dateStr) return { label: "No date", days: 9999 };
      const d = new Date(`${dateStr}T00:00:00`);
      const days = Math.ceil((d - new Date()) / 86400000);
      if (days < 0) return { label: "Overdue", days };
      if (days === 0) return { label: "Today", days };
      if (days === 1) return { label: "Tomorrow", days };
      return { label: fmtShort(d), days };
    };
    const relTime = (ts) => {
      const s = Math.max(1, Math.floor((Date.now() - new Date(ts).getTime()) / 1000));
      if (s < 60) return `${s} sec`;
      if (s < 3600) return `${Math.floor(s / 60)} min`;
      if (s < 86400) return `${Math.floor(s / 3600)} hr`;
      return `${Math.floor(s / 86400)} days`;
    };

    try {
      const [projRes, evRes, acRes, linkRes, itemRes] = await Promise.all([
        db.from("projects").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
        db.from("project_events").select("*").eq("user_id", user.id).order("event_date", { ascending: false }),
        db.from("project_actions").select("*").eq("user_id", user.id).order("due_date", { ascending: true, nullsFirst: false }),
        db.from("project_source_links").select("project_id, source_item_id, source_items(source_type)").eq("user_id", user.id),
        db.from("source_items").select("id, source_type, sender, title, occurred_at, external_thread_id, source_url, text_excerpt, include_in_grouping").eq("user_id", user.id).order("occurred_at", { ascending: false, nullsFirst: false }),
      ]);
      const failed = [projRes, evRes, acRes, linkRes, itemRes].find((r) => r.error);
      if (failed) {
        console.error("Unable to load dashboard data.", failed.error);
        return;
      }

      const projectRows = projRes.data || [];
      const events = evRes.data || [];
      const actionRows = acRes.data || [];

      const sourcesByProject = {};
      for (const link of linkRes.data || []) {
        const type = link.source_items?.source_type;
        if (!type) continue;
        const chip = type === "google_calendar" ? "calendar" : type;
        (sourcesByProject[link.project_id] ||= new Set()).add(chip);
      }

      const nameById = {};
      const projects = projectRows.map((p) => {
        nameById[p.id] = p.name;
        const { label: deadline, days } = dayLabel(p.deadline);
        return {
          id: p.id,
          name: p.name,
          symbol: p.symbol || "P",
          summary: p.summary || "",
          deadline,
          days,
          progress: p.progress || 0,
          risk: p.risk || "",
          color: p.color || "#4263eb",
          soft: p.soft_color || "#eef2ff",
          members: p.members || [],
          sources: [...(sourcesByProject[p.id] || [])],
          events: events
            .filter((e) => e.project_id === p.id)
            .map((e) => ({
              id: e.id,
              date: fmtDateTime(e.event_date),
              type: cap(e.event_type),
              title: e.title,
              body: e.body || "",
              person: e.person || "",
              color: e.color || p.color,
            })),
          files: [],
        };
      });

      const actions = actionRows.map((a) => {
        const overdue =
          a.due_date && !a.completed &&
          new Date(`${a.due_date}T23:59:59`) < new Date();
        return {
          id: a.id,
          title: a.title,
          project: nameById[a.project_id] || "Project",
          projectId: a.project_id,
          due: dayLabel(a.due_date).label,
          overdue: !!overdue,
          done: !!a.completed,
          color: a.color || "#4263eb",
        };
      });

      const activity = events.slice(0, 8).map((e) => ({
        icon: e.event_type === "meeting" ? "31" : "M",
        text: `<b>${esc(e.person || "Someone")}</b> ${esc((e.title || "").slice(0, 120))}`,
        meta: `${esc(nameById[e.project_id] || "Project")} · ${cap(e.event_type)}`,
        time: relTime(e.event_date),
        color: e.color || "#4263eb",
        soft: "#eef2ff",
      }));

      window.setDashboardData?.({ projects, actions, activity });

      // Chronological timeline of the actual emails/events, newest first.
      // `all` includes every item (for full thread reconstruction); `feed`
      // shows the kept (non-noise) items.
      const itemProject = {};
      for (const link of linkRes.data || []) {
        if (link.source_item_id && !itemProject[link.source_item_id]) {
          itemProject[link.source_item_id] = nameById[link.project_id] || "";
        }
      }
      const all = (itemRes.data || []).map((it) => ({
        id: it.id,
        source_type: it.source_type,
        sender: it.sender || "Unknown",
        title: it.title || "",
        occurred_at: it.occurred_at,
        external_thread_id: it.external_thread_id,
        source_url: it.source_url,
        when: fmtDateTime(it.occurred_at),
        snippet: (it.text_excerpt || "").slice(0, 240),
        project: itemProject[it.id] || "",
        include: it.include_in_grouping,
      }));
      const feed = all.filter((it) => it.include);
      window.setTimelineData?.({ feed, all });
    } catch (err) {
      console.error("Failed to load project data.", err);
    }
  }

  window.startSourceConnection = async (provider) => {
    const { data: { session } } = await db.auth.getSession();
    if (!session) throw new Error("Sign in before connecting a source.");

    const oauthBaseUrl = config.oauthBaseUrl;
    if (!oauthBaseUrl) {
      throw new Error("Set oauthBaseUrl in supabase-config.js to the Stage 0 OAuth server.");
    }

    // Hand off to the local Stage 0 OAuth server (backend/auth/server.py). It
    // runs Google consent, stores the encrypted token, writes the connection
    // row, then redirects back here. A full-page redirect avoids CORS.
    const startUrl = new URL("/auth/google/start", oauthBaseUrl);
    startUrl.searchParams.set("providers", provider);
    startUrl.searchParams.set("user_id", session.user.id);
    startUrl.searchParams.set("return_to", `${window.location.origin}/`);
    window.location.assign(startUrl.toString());
  };

  element("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = element("authEmail").value.trim();
    const password = element("authPassword").value;
    showMessage("Working…");

    const result = await db.auth.signInWithPassword({ email, password });
    clearSensitiveFields();

    if (result.error) {
      showMessage(result.error.message, true);
      return;
    }

    showMessage("");
    await showAuthenticatedUser(result.data.session);
  });

  function openLogin() {
    clearSensitiveFields();
    if (signupDialog.open) signupDialog.close();
    element("signupFormView").hidden = false;
    element("signupSuccess").hidden = true;
    element("signupForm").reset();
    element("signupMessage").textContent = "";
    if (!loginDialog.open) loginDialog.showModal();
  }

  element("openSignup").addEventListener("click", () => {
    loginDialog.close();
    signupDialog.showModal();
    element("signupName").focus();
  });
  element("backToLogin").addEventListener("click", openLogin);
  element("returnToLogin").addEventListener("click", openLogin);

  element("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = element("signupName").value.trim();
    const email = element("signupEmail").value.trim();
    const password = element("signupPassword").value;
    const confirmation = element("signupPasswordConfirm").value;
    const message = element("signupMessage");

    if (password !== confirmation) {
      message.textContent = "Passwords do not match.";
      message.classList.add("error-message");
      return;
    }

    creatingAccount = true;
    message.classList.remove("error-message");
    message.textContent = "Creating your account…";
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    clearSensitiveFields();

    if (error) {
      creatingAccount = false;
      message.textContent = error.message;
      message.classList.add("error-message");
      return;
    }

    if (data.session) await db.auth.signOut();
    creatingAccount = false;
    element("signupFormView").hidden = true;
    element("signupSuccess").hidden = false;
    element("signupSuccessText").textContent = data.session
      ? "You will be redirected back to the sign-in page…"
      : "Check your email to verify the account. You will be redirected back to sign in…";
    setTimeout(openLogin, 3500);
  });

  element("profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    const { error } = await db.from("profiles").upsert({
      id: user.id,
      display_name: element("profileDisplayName").value.trim(),
      job_title: element("profileJobTitle").value.trim(),
      updated_at: new Date().toISOString(),
    });

    if (error) return alert(error.message);
    await loadProfile(user);
    accountDialog.close();
  });

  element("passwordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = element("newPassword").value;
    const { error } = await db.auth.updateUser({ password });
    clearSensitiveFields();
    if (error) return alert(error.message);
    alert("Password updated.");
  });

  element("togglePassword").addEventListener("click", () => {
    const input = element("authPassword");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    element("togglePassword").textContent = show ? "Hide" : "Show";
    element("togglePassword").setAttribute("aria-label", `${show ? "Hide" : "Show"} password`);
  });

  element("forgotPassword").addEventListener("click", async () => {
    const email = element("authEmail").value.trim();
    if (!email) {
      showMessage("Enter your email address first, then select Forgot your password.", true);
      element("authEmail").focus();
      return;
    }
    showMessage("Sending password reset email…");
    const { error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    showMessage(error ? error.message : "Password reset email sent. Check your inbox.", Boolean(error));
  });

  element("profileButton").addEventListener("click", () => accountDialog.showModal());
  element("closeAccount").addEventListener("click", () => accountDialog.close());
  element("signOutButton").addEventListener("click", async () => {
    clearSensitiveFields();
    await db.auth.signOut();
    accountDialog.close();
    loginDialog.showModal();
  });

  db.auth.onAuthStateChange((_event, session) => {
    if (creatingAccount) return;
    setTimeout(() => showAuthenticatedUser(session).catch(console.error), 0);
  });

  db.auth.getSession().then(({ data }) => showAuthenticatedUser(data.session)).catch(console.error);

  // When the Stage 0 OAuth server redirects back with ?connected=<providers>,
  // confirm it and clean the URL. loadSourceConnections (run on session load)
  // refreshes the "Connected" state from the source_connections table.
  const connectedParam = new URLSearchParams(window.location.search).get("connected");
  if (connectedParam) {
    const names = connectedParam.replace(/_/g, " ");
    window.toast?.("Source connected", `${names} is now importing (read-only).`);
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
})();
