(() => {
  const config = window.SUPABASE_CONFIG;
  if (!config || config.url.includes("YOUR_PROJECT") || config.publishableKey.includes("REPLACE_ME")) {
    console.error("Complete supabase-config.js before using authentication.");
    return;
  }

  const db = window.supabase.createClient(config.url, config.publishableKey);
  window.supabaseDb = db;

  const element = (id) => document.getElementById(id);
  const loginDialog = element("loginDialog");
  const accountDialog = element("accountDialog");

  function showMessage(message, isError = false) {
    const output = element("authMessage");
    output.textContent = message;
    output.classList.toggle("error-message", isError);
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
      if (!loginDialog.open) loginDialog.showModal();
      return;
    }

    if (loginDialog.open) loginDialog.close();
    await loadProfile(session.user);
  }

  element("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const action = event.submitter?.dataset.action || "signin";
    const email = element("authEmail").value.trim();
    const password = element("authPassword").value;
    const displayName = element("authDisplayName").value.trim();
    showMessage("Working…");

    const result = action === "signup"
      ? await db.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
      : await db.auth.signInWithPassword({ email, password });

    if (result.error) {
      showMessage(result.error.message, true);
      return;
    }

    if (action === "signup" && !result.data.session) {
      showMessage("Account created. Check your email to confirm it, then sign in.");
      return;
    }

    showMessage("");
    await showAuthenticatedUser(result.data.session);
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
    if (error) return alert(error.message);
    event.target.reset();
    alert("Password updated.");
  });

  element("togglePassword").addEventListener("click", () => {
    const input = element("authPassword");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    element("togglePassword").textContent = show ? "Hide" : "Show";
    element("togglePassword").setAttribute("aria-label", `${show ? "Hide" : "Show"} password`);
  });

  element("profileButton").addEventListener("click", () => accountDialog.showModal());
  element("closeAccount").addEventListener("click", () => accountDialog.close());
  element("signOutButton").addEventListener("click", async () => {
    await db.auth.signOut();
    accountDialog.close();
    loginDialog.showModal();
  });

  db.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => showAuthenticatedUser(session).catch(console.error), 0);
  });

  db.auth.getSession().then(({ data }) => showAuthenticatedUser(data.session)).catch(console.error);
})();
