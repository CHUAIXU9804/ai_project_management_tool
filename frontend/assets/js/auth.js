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

  window.startSourceConnection = async (provider) => {
    const { data: { session } } = await db.auth.getSession();
    if (!session) throw new Error("Sign in before connecting a source.");

    const { data, error } = await db.functions.invoke("start-google-integration", {
      body: { provider, redirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
    if (!data?.authorizationUrl) {
      throw new Error("The integration service did not return an authorization URL.");
    }
    window.location.assign(data.authorizationUrl);
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
})();
