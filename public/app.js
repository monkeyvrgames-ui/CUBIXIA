const app = document.querySelector("#app");

let currentUser = null;
let runtime = null;
let THREE_CACHE = null;
let selectedCubbuxPackage = "starter";
let communityState = { groups: [], selectedId: "cubixia-studios", tab: "about" };

const gameCatalog = [
  {
    id: "cubixia-survival",
    title: "Cubixia: Survival",
    genre: "Zombie Survival",
    banner: "survival",
    rating: "96%",
    players: "Live server",
    description: "Spawn in the safe zone, move in 3D, fight zombie waves with a blocky rifle, earn XP and credits, and see other CUBIXIA players in the same server."
  },
  {
    id: "coaster-tycoon",
    title: "Cubixia Coaster Tycoon",
    genre: "Tycoon",
    banner: "tycoon",
    rating: "94%",
    players: "Live server",
    description: "Build a 3D theme park, place rides, set prices, earn money from NPC customers, and keep guest happiness high while friends join your park."
  },
  { id: "gun-game", title: "Cubixia Gun Game", genre: "Shooter", banner: "survival", rating: "92%", players: "Live server", description: "Score points in a 3D arena and upgrade your weapon path." },
  { id: "speed-trials", title: "Speed Trials", genre: "Obby", banner: "tycoon", rating: "91%", players: "Live server", description: "Sprint, jump, and race through timed obstacle courses." },
  { id: "gravity-flip", title: "Gravity Flip", genre: "Platformer", banner: "survival", rating: "88%", players: "Live server", description: "Jump across floating platforms with gravity pads and moving blocks." },
  { id: "base-defense", title: "Base Defense", genre: "Defense", banner: "survival", rating: "93%", players: "Live server", description: "Build a fort and survive enemy waves around a night base." },
  { id: "pet-evolution", title: "Pet Evolution", genre: "Simulator", banner: "tycoon", rating: "95%", players: "Live server", description: "Raise cube pets and collect energy around a bright 3D world." },
  { id: "vehicle-builder", title: "Vehicle Builder", genre: "Building", banner: "tycoon", rating: "90%", players: "Live server", description: "Test block vehicles in a sandbox with ramps and rings." },
  { id: "floor-is-lava", title: "Floor Is Lava", genre: "Survival", banner: "survival", rating: "89%", players: "Live server", description: "Climb platforms before the lava rises across the arena." },
  { id: "hide-seek", title: "Hide & Seek Cubes", genre: "Party", banner: "tycoon", rating: "87%", players: "Live server", description: "Explore hiding spots and chase friends through a toybox map." },
  { id: "fishing-contest", title: "Fishing Contest", genre: "Casual", banner: "tycoon", rating: "94%", players: "Live server", description: "Cast near lakes, collect glowing fish, and relax in 3D." },
  { id: "treasure-hunt", title: "Treasure Hunt", genre: "Adventure", banner: "survival", rating: "90%", players: "Live server", description: "Search ruins for coins and hidden CUBIXIA relics." },
  { id: "factory-tycoon", title: "Factory Tycoon", genre: "Tycoon", banner: "tycoon", rating: "93%", players: "Live server", description: "Walk through machines, conveyors, and upgrade stations." }
];

const communities = [
  ["Survival Squad", "Wave pushing, weapon testing, and safe-zone events."],
  ["Tycoon Builders", "Ride layouts, price experiments, and park showcases."],
  ["Avatar Creators", "Free outfits, launch badges, and CUBIXIA style drops."]
];

const news = [
  ["3D Launch", "Cubixia: Survival and Coaster Tycoon now run as 3D browser games."],
  ["Recovery", "Password recovery can reset an account using the registered Gmail/email."],
  ["Creator Tools", "Tanklyplayz receives CREATOR/OWNER and CUBIXIA badges plus owner-only moderation."]
];

const cubbuxPackages = [
  { id: "creator", amount: 11000, bonus: 1000, price: "$99.99" },
  { id: "universe", amount: 5250, bonus: 750, price: "$49.99" },
  { id: "builder", amount: 1000, bonus: 200, price: "$9.99" },
  { id: "starter", amount: 500, bonus: 100, price: "$4.99" }
];

const itemVisuals = {
  "starter-shirt": { type: "shirt", color: 0x2f5bff, accent: 0xffffff, label: "CX" },
  "cube-cap": { type: "hat", color: 0x36aef3 },
  "tycoon-badge-pin": { type: "pin", color: 0xffcf55 },
  "survivor-vest": { type: "vest", color: 0x182232, accent: 0x44db78 },
  "neon-visor": { type: "visor", color: 0x38aef3 },
  "wing-pack": { type: "wings", color: 0xdfeeff },
  "speed-boots": { type: "boots", color: 0x315cff },
  "creator-crown": { type: "crown", color: 0xffd166 },
  "ban-hammer": { type: "hammer", color: 0xff575f }
};

function api(path, options = {}) {
  return fetch(path, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options
  })
    .catch(() => {
      throw new Error("CUBIXIA server is offline. Restart the server and try again.");
    })
    .then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Something went wrong.");
      error.data = data;
      throw error;
    }
    return data;
  });
}

async function loadThree() {
  if (!THREE_CACHE) THREE_CACHE = await import("/vendor/three/three.module.js");
  return THREE_CACHE;
}

function nav() {
  return `
    <nav class="nav">
      <button class="brand" data-route="home" type="button"><span class="brand-mark"></span>CUBIXIA</button>
      <a href="#" data-route="home">Home</a>
      <a href="#" data-route="games">Games</a>
      <a href="#" data-route="avatar">Avatar</a>
      <a href="#" data-route="marketplace">Marketplace</a>
      <a href="#" data-route="messages">Messages</a>
      <a href="#" data-route="communities">Communities</a>
      <a href="#" data-route="settings">Settings</a>
      <span class="nav-spacer"></span>
      ${currentUser ? `<button class="wallet-pill" data-route="cubbux">${Number(currentUser.cubbux || 0).toLocaleString()} CUBBUX</button>${canModerateUser(currentUser) ? `<button data-route="moderation">${moderationPanelTitle(currentUser)}</button>` : ""}<button class="nav-user" data-route="profile">${avatar(currentUser, "tiny")} ${escapeHtml(currentUser.username)}</button><button class="register-pill" id="logoutBtn">Logout</button>` : `<button data-route="login">Login</button><button class="register-pill" data-route="signup">Register</button>`}
    </nav>
  `;
}

function canModerateUser(user) {
  return Boolean(user && (user.isOwner || ["owner", "admin", "mod"].includes(user.role)));
}

function canTimeoutUser(user) {
  return Boolean(user && (user.isOwner || user.role === "owner" || user.role === "admin"));
}

function moderationPanelTitle(user) {
  if (user?.isOwner || user?.role === "owner") return "Owner Moderation";
  return user?.role === "admin" ? "Admin Panel" : "Moderator Panel";
}

function routeUser(data) {
  currentUser = data.user;
  const moderation = data.moderation || activeClientModeration(data.user);
  if (moderation) return moderationScreen(data.user, moderation);
  return hub(data.user);
}

function activeClientModeration(user) {
  if (!user) return null;
  const now = Date.now();
  const notice = user.moderationNotice && !user.moderationNotice.acknowledged ? user.moderationNotice : null;
  if (user.banned) {
    const until = Number(user.banUntil || notice?.until || 0);
    return {
      action: "ban",
      title: until && until > now ? "Banned" : "Ban Finished",
      reason: user.banReason || notice?.reason || "Banned by CUBIXIA moderation.",
      moderator: notice?.moderator || "CUBIXIA",
      until,
      canAcknowledge: !until || now >= until,
      remainingMs: Math.max(0, until - now)
    };
  }
  if (notice) {
    const until = Number(notice.until || 0);
    return {
      action: notice.action,
      title: notice.action === "warning" ? "Warning" : notice.action === "kick" ? "Kicked From Game" : notice.action.toUpperCase(),
      reason: notice.reason,
      moderator: notice.moderator,
      until,
      canAcknowledge: !until || now >= until,
      remainingMs: Math.max(0, until - now)
    };
  }
  return null;
}

function moderationScreen(user, moderation) {
  stopRuntime();
  currentUser = user;
  const remaining = Math.max(0, Number(moderation.remainingMs || (moderation.until ? moderation.until - Date.now() : 0)));
  app.innerHTML = `
    <section class="moderation-screen">
      <div class="moderation-card">
        <h1>${escapeHtml(moderation.title || moderation.action || "Moderation Action")}</h1>
        <p>Our moderation team reviewed recent activity on this account.</p>
        <div class="moderation-box">
          <strong>Reason:</strong>
          <span>${escapeHtml(moderation.reason || "No reason provided.")}</span>
        </div>
        <p><b>Action:</b> ${escapeHtml(String(moderation.action || "").toUpperCase())}</p>
        <p><b>Moderator:</b> ${escapeHtml(moderation.moderator || "CUBIXIA")}</p>
        ${moderation.until ? `<p><b>Time left:</b> <span id="moderationTimer">${formatRemaining(remaining)}</span></p>` : ""}
        <p>Please read the CUBIXIA community rules before continuing.</p>
        <button id="ackModeration" ${moderation.canAcknowledge ? "" : "disabled"}>I acknowledge / I agree</button>
        <button id="logoutModeration" class="ghost-btn">Logout</button>
        <div class="message" id="moderationAckMessage"></div>
      </div>
    </section>
  `;
  const ackButton = document.querySelector("#ackModeration");
  if (!moderation.canAcknowledge && moderation.until) {
    const timer = setInterval(() => {
      const left = Math.max(0, moderation.until - Date.now());
      const label = document.querySelector("#moderationTimer");
      if (label) label.textContent = formatRemaining(left);
      if (left <= 0) {
        clearInterval(timer);
        ackButton.disabled = false;
      }
    }, 1000);
  }
  ackButton.addEventListener("click", async () => {
    const message = document.querySelector("#moderationAckMessage");
    try {
      const data = await api("/api/moderation/ack", { method: "POST", body: JSON.stringify({}) });
      routeUser(data);
    } catch (error) {
      if (error.data?.moderation) return moderationScreen(user, error.data.moderation);
      message.textContent = error.message;
    }
  });
  document.querySelector("#logoutModeration").addEventListener("click", async () => {
    await api("/api/logout", { method: "POST" }).catch(() => {});
    guestHome();
  });
}

function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [days ? `${days}d` : "", hours ? `${hours}h` : "", minutes ? `${minutes}m` : "", `${seconds}s`].filter(Boolean).join(" ");
}

function durationOptions(selected = "days") {
  return ["seconds", "minutes", "hours", "days", "weeks", "months", "years"]
    .map((unit) => `<option value="${unit}" ${unit === selected ? "selected" : ""}>${unit}</option>`)
    .join("");
}

function guestHome() {
  currentUser = null;
  stopRuntime();
  app.innerHTML = `
    <section class="hero">
      <div class="world-scene"></div>
      ${nav()}
      <div class="home-grid">
        <div class="home-copy">
          <h1>CUBIXIA is your custom digital universe.</h1>
          <p>Register, recover your account with Gmail, customize your avatar, browse games, chat, join friends, and play 3D worlds from the same profile.</p>
          <div class="actions">
            <button class="outline-btn" data-route="signup">Create Account</button>
            <button class="outline-btn blue" data-route="games">Browse Games</button>
          </div>
        </div>
        ${quickRegisterCard()}
      </div>
    </section>
  `;
  bindRoutes();
  bindQuickRegister();
}

function quickRegisterCard() {
  return `
    <form class="auth-card" id="quickRegister">
      <h2>Join CUBIXIA</h2>
      <p>One account for games, friends, avatar, and chat.</p>
      <label class="input-row"><span>@</span><input name="username" autocomplete="username" placeholder="Username" required /></label>
      <button class="primary-btn green" type="submit">Start</button>
      <div class="linkline">Already have an account? <button type="button" data-route="login">Login</button></div>
      <div class="linkline"><button type="button" data-route="recover">Forgot Password or Username?</button></div>
      <div class="message" id="message"></div>
    </form>
  `;
}

function signup(seedName = "") {
  stopRuntime();
  app.innerHTML = `
    <section class="hero signup-page">
      <div class="sector-scene"></div>
      ${nav()}
      <aside class="promo-ribbon">
        <h1>CUBIXIA Launch Gift</h1>
        <p>Every new player gets the free First Play CUBIXIA Shirt for their 3D avatar.</p>
      </aside>
      <div class="signup-layout">
        <form class="auth-card" id="signupForm">
          <h2>Create your CUBIXIA account</h2>
          <p>Your profile follows you across the website and games.</p>
          <div class="avatar-picker">
            <div id="avatarPreview" class="avatar avatar-md">C</div>
            <label class="file-btn">Upload picture<input id="avatarInput" type="file" accept="image/*" /></label>
          </div>
          <label class="input-row"><span>@</span><input name="username" value="${escapeHtml(seedName)}" autocomplete="username" placeholder="Username" required /></label>
          <label class="input-row"><span>#</span><input name="email" type="email" autocomplete="email" placeholder="Gmail or email" required /></label>
          <label class="input-row password-row"><span>*</span><input name="password" type="password" autocomplete="new-password" placeholder="Password" minlength="6" required /><button type="button" data-toggle-password>Show</button></label>
          <div class="date-row">
            <label class="input-row"><select name="birthMonth" required>${option("Month", ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])}</select></label>
            <label class="input-row"><select name="birthDay" required>${option("Day", Array.from({ length: 31 }, (_, i) => String(i + 1)))}</select></label>
            <label class="input-row"><select name="birthYear" required>${option("Year", Array.from({ length: 70 }, (_, i) => String(new Date().getFullYear() - 5 - i)))}</select></label>
          </div>
          <button class="primary-btn" type="submit">Sign up</button>
          <div class="linkline">Already have an account? <button type="button" data-route="login">Login</button></div>
          <div class="message" id="message"></div>
        </form>
      </div>
    </section>
  `;
  bindRoutes();
  bindAvatarPicker();
  bindPasswordToggles();
  document.querySelector("#signupForm").addEventListener("submit", register);
}

function login() {
  stopRuntime();
  app.innerHTML = `
    <section class="hero signup-page">
      <div class="sector-scene"></div>
      ${nav()}
      <div class="signup-layout">
        <form class="auth-card" id="loginForm">
          <h2>Login to CUBIXIA</h2>
          <p>Your friends, progress, avatar, and messages are waiting.</p>
          <label class="input-row"><span>@</span><input name="username" autocomplete="username" placeholder="Username" required /></label>
          <label class="input-row password-row"><span>*</span><input name="password" type="password" autocomplete="current-password" placeholder="Password" required /><button type="button" data-toggle-password>Show</button></label>
          <button class="primary-btn" type="submit">Login</button>
          <div class="linkline"><button type="button" data-route="recover">Forgot Password or Username?</button></div>
          <div class="divider"></div>
          <div class="linkline">Need an account? <button type="button" data-route="signup">Register</button></div>
          <div class="message" id="message"></div>
        </form>
      </div>
    </section>
  `;
  bindRoutes();
  bindPasswordToggles();
  document.querySelector("#loginForm").addEventListener("submit", doLogin);
}

function recover() {
  stopRuntime();
  app.innerHTML = `
    <section class="hero recovery-page">
      ${nav()}
      <div class="center-card">
        <form class="recovery-card" id="recoverStart">
          <h1>CUBIXIA Account Recovery</h1>
          <label>Username/Gmail/Email</label>
          <input name="identity" placeholder="Enter your username or Gmail" required />
          <button class="primary-btn" type="submit">Next</button>
          <div class="message" id="message"></div>
        </form>
        <form class="recovery-card hidden" id="recoverFinish">
          <h1>Set a New Password</h1>
          <label>Recovery Code</label>
          <input name="code" placeholder="6 digit code" required />
          <label>New Password</label>
          <div class="plain-password-wrap"><input name="newPassword" type="password" placeholder="New password" minlength="6" required /><button type="button" data-toggle-password>Show</button></div>
          <button class="primary-btn" type="submit">Change Password</button>
          <div class="message" id="finishMessage"></div>
        </form>
      </div>
    </section>
  `;
  bindRoutes();
  bindRecovery();
  bindPasswordToggles();
}

function hub(user) {
  currentUser = user;
  stopRuntime();
  const greeting = timeGreeting();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <div class="shell">
        ${sideRail()}
        <main class="main-feed">
          <div class="search-bar">
            <input id="globalSearch" placeholder="Search CUBIXIA users" />
            <button id="searchBtn">Search</button>
          </div>
          <header class="hub-top">
            ${avatar(user, "large")}
            <div>
              <h1>${greeting}, ${escapeHtml(user.username)}</h1>
              <p>${escapeHtml(user.bio || "Welcome back to CUBIXIA.")}</p>
              <div class="badge-row left">${user.badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>
            </div>
          </header>

          <section class="panel">
            <div class="section-head"><h2>Friends</h2><span>blue online, green joinable</span></div>
            <div class="friend-row">
              <button class="friend-card add-friend" id="openSearch"><span class="friend-face">+</span><span>Add Friends</span></button>
              ${user.friendProfiles.map(friendCard).join("") || `<p class="empty">Search for a username to start your friends list.</p>`}
            </div>
          </section>

          <div class="hub-grid">
            <section class="panel continue-panel">
              <div class="section-head"><h2>Continue Playing</h2><span>${escapeHtml(user.lastPlayed.progress)}</span></div>
              <button class="continue-card" data-play="${escapeHtml(user.lastPlayed.id || "cubixia-survival")}">
                <div class="game-thumb ${escapeHtml(user.lastPlayed.id || "cubixia-survival")}"><span>${escapeHtml(user.lastPlayed.title)}</span></div>
                <div>
                  <h3>${escapeHtml(user.lastPlayed.title)}</h3>
                  <p>XP ${Number(user.lastPlayed.xp || 0)} | Credits ${Number(user.lastPlayed.currency || 0)}</p>
                </div>
              </button>
            </section>

            <section class="panel">
              <div class="section-head"><h2>Notifications</h2><span>${user.notifications.length}</span></div>
              <div class="notice-list">${notificationList(user)}</div>
            </section>
          </div>

          <section class="panel">
            <div class="section-head"><h2>Recommended For You</h2><span>${gameCatalog.length} working games</span></div>
            <div class="game-strip">${gameCatalog.map(gameTile).join("")}</div>
          </section>

          <section class="panel">
            <div class="section-head"><h2>CUBIXIA News</h2><span>home page messages</span></div>
            <div class="news-grid">${news.map(([title, body]) => `<article><h3>${title}</h3><p>${body}</p></article>`).join("")}</div>
          </section>
        </main>
      </div>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindSocial();
  bindPlayButtons();
  document.querySelector("#searchBtn").addEventListener("click", () => showFriendSearch(document.querySelector("#globalSearch").value));
}

function gamesPage() {
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <div class="shell">
        ${sideRail()}
        <main class="main-feed">
          <div class="section-head"><h1>Games</h1><span>created on CUBIXIA</span></div>
          <div class="charts-filters">
            <button>Computer</button><button>United States</button><button>Top Trending</button>
          </div>
          <h2>Top Trending</h2>
          <div class="game-grid">${gameCatalog.map(gameTile).join("")}</div>
        </main>
      </div>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindPlayButtons();
}

function gameDetail(gameId) {
  const game = gameCatalog.find((entry) => entry.id === gameId) || gameCatalog[0];
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <div class="game-detail">
        <div class="game-hero ${game.id}"><span>${escapeHtml(game.title)}</span></div>
        <div class="game-info">
          <h1>${escapeHtml(game.title)}</h1>
          <p>By CUBIXIA Studios</p>
          <p>Maturity: Mild | Played 1 hr 11 mins</p>
          <button class="play-big" data-play="${game.id}">Play</button>
          <div class="game-actions"><button>Favorite</button><button>Notify</button><button>Like</button><button>Dislike</button></div>
        </div>
        <section class="panel detail-about">
          <div class="tabs"><button class="active">About</button><button>Store</button><button>Servers</button></div>
          <h2>Events</h2>
          <div class="event-row">
            <article><strong>New update</strong><span>Today</span></article>
            <article><strong>Double CUBBUX weekend</strong><span>Upcoming</span></article>
            <article><strong>Creator challenge</strong><span>Live</span></article>
          </div>
          <h2>Description</h2>
          <p>${escapeHtml(game.description)}</p>
          <div class="stats-strip">
            <span><strong>${game.rating}</strong> Rating</span>
            <span><strong>12</strong> Server Size</span>
            <span><strong>${escapeHtml(game.genre)}</strong> Genre</span>
            <span><strong>Live</strong> Voice Chat</span>
          </div>
          <h2>Badges</h2>
          <div class="badge-cards">
            <article><b>Welcome</b><span>Joined for the first time</span></article>
            <article><b>Survivor</b><span>Reached a milestone</span></article>
            <article><b>Builder</b><span>Created something new</span></article>
          </div>
          <h2>People Also Join</h2>
          <div class="game-strip">${gameCatalog.filter((entry) => entry.id !== game.id).map(gameTile).join("")}</div>
        </section>
      </div>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindPlayButtons();
}

function profile(user) {
  currentUser = user;
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <div class="profile-layout">
        <section class="panel profile-card">
          ${avatar(user, "large")}
          <h1>${escapeHtml(user.username)}</h1>
          <p>@${escapeHtml(user.username)}</p>
          <p>Joined ${new Date(user.createdAt).toLocaleDateString()}</p>
          <div class="badge-row">${user.badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>
          ${user.isOwner ? `<button class="danger-lite" id="openBan">Quick Ban Tool</button><button class="primary-btn owner-panel-btn" data-route="owner">Owner Panel</button>` : ""}
          ${canModerateUser(user) ? `<button class="primary-btn owner-panel-btn" data-route="moderation">${moderationPanelTitle(user)}</button>` : ""}
        </section>
        <section class="panel">
          <div class="section-head"><h2>Edit Profile</h2><span>used everywhere</span></div>
          <form id="profileForm">
            <div class="avatar-picker left">
              <div id="avatarPreview" class="avatar avatar-md">${avatarInner(user)}</div>
              <label class="file-btn">Change picture<input id="avatarInput" type="file" accept="image/*" /></label>
            </div>
            <label class="input-row"><span>Bio</span><input name="bio" value="${escapeHtml(user.bio)}" maxlength="160" /></label>
            <button class="primary-btn" type="submit">Save profile</button>
            <div class="message" id="message"></div>
          </form>
          <div class="divider"></div>
          <h2>Achievements</h2>
          <div class="badge-row left">${user.achievements.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        </section>
      </div>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindAvatarPicker(user.avatar);
  document.querySelector("#profileForm").addEventListener("submit", saveProfile);
  document.querySelector("#openBan")?.addEventListener("click", showBanModal);
}

function ownerPanelPage(user) {
  if (!user.isOwner) return hub(user);
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <main class="owner-panel">
        <section class="panel">
          <div class="section-head"><h1>Owner Panel</h1><span>Tanklyplayz only</span></div>
          <div class="owner-tools">
            <form id="ownerBanForm">
              <h2>Ban / Unban</h2>
              <input name="username" placeholder="Username" required />
              <input name="reason" placeholder="Reason" />
              <div class="duration-row"><input name="durationValue" type="number" min="1" value="1" /><select name="durationUnit">${durationOptions("days")}</select></div>
              <div class="split-actions"><button class="danger" name="mode" value="ban">Ban</button><button name="mode" value="unban">Unban</button></div>
            </form>
            <form id="ownerGrantForm">
              <h2>Give CUBBUX</h2>
              <input name="username" placeholder="Username" required />
              <input name="amount" type="number" min="1" max="100000" value="100" required />
              <button class="primary-btn">Grant</button>
            </form>
            <form id="ownerTakeForm">
              <h2>Take CUBBUX</h2>
              <input name="username" placeholder="Username" required />
              <input name="amount" type="number" min="1" max="100000" value="100" required />
              <button class="danger">Take Away</button>
            </form>
            <form id="ownerRoleForm">
              <h2>Role Permissions</h2>
              <input name="username" placeholder="Username" required />
              <select name="role"><option value="user">User</option><option value="mod">Mod</option><option value="admin">Admin</option></select>
              <button class="primary-btn">Set Role</button>
            </form>
            <form id="ownerWarnForm">
              <h2>Warn User</h2>
              <input name="username" placeholder="Username" required />
              <input name="reason" placeholder="Rule reminder" required />
              <div class="duration-row"><input name="durationValue" type="number" min="0" value="0" /><select name="durationUnit">${durationOptions("minutes")}</select></div>
              <button class="primary-btn">Warn</button>
            </form>
          </div>
          <div class="message" id="ownerMessage"></div>
        </section>
      </main>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindOwnerPanel();
}

async function moderationPanelPage(user) {
  if (!canModerateUser(user)) return hub(user);
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <main class="owner-panel moderation-panel">
        <section class="panel">
          <div class="section-head"><h1>${moderationPanelTitle(user)}</h1><span>reports and actions</span></div>
          <div class="mod-layout">
            <section class="mod-reports">
              <h2>Report Notifications</h2>
              <div id="moderationReports"><p class="empty">Loading reports...</p></div>
            </section>
            <section class="mod-actions">
              <h2>Take Action</h2>
              <form id="moderationActionForm">
                <input name="username" placeholder="Username" required />
                <select name="action" required>
                  <option value="warn">Warn</option>
                  <option value="kick">Kick from game</option>
                  <option value="ban">Ban</option>
                  <option value="unban">Unban</option>
                  ${canTimeoutUser(user) ? `<option value="timeout">Timeout</option>` : ""}
                </select>
                <div class="duration-row"><input name="durationValue" type="number" min="0" value="1" /><select name="durationUnit">${durationOptions("days")}</select></div>
                <textarea name="reason" placeholder="Reason shown to the player" required></textarea>
                <button class="primary-btn">Submit Action</button>
              </form>
              <div class="message" id="moderationMessage"></div>
            </section>
          </div>
        </section>
      </main>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  await bindModerationPanel();
}

function publicProfile(user) {
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <main class="public-profile">
        <section class="panel public-hero">
          ${avatar(user, "large")}
          <div>
            <h1>${escapeHtml(user.username)}</h1>
            <p>@${escapeHtml(user.username)} | ${user.currentGame ? `Playing ${escapeHtml(user.currentGame)}` : user.online ? "Online" : "Offline"}</p>
            <div class="badge-row left">${(user.badges || []).map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>
          </div>
          <button class="primary-btn" onclick="history.back()">Join</button>
        </section>
        <section class="panel">
          <div class="section-head"><h2>About</h2><span>identity hub</span></div>
          <p>${escapeHtml(user.bio || "This player is exploring CUBIXIA.")}</p>
          <div class="stats-strip"><span><strong>${user.online ? "Now" : "Away"}</strong> Status</span><span><strong>${new Date(user.lastOnline || Date.now()).toLocaleDateString()}</strong> Last Online</span><span><strong>${(user.equipped || []).length}</strong> Equipped Items</span><span><strong>${(user.badges || []).length}</strong> Badges</span></div>
        </section>
      </main>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
}

function avatarEditor(user) {
  currentUser = user;
  stopRuntime();
  const style = user.avatarStyle || {};
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <div class="avatar-editor">
        <aside>
          <h1>Avatar Editor</h1>
          <div class="avatar-stage">
            ${blockAvatar(user, "preview")}
            <span>3D game avatar</span>
          </div>
          <label>Skin<input type="color" id="skinColor" value="${style.skin || "#f0d0a7"}"></label>
          <label>Shirt<input type="color" id="shirtColor" value="${style.shirt || "#2268d8"}"></label>
          <label>Pants<input type="color" id="pantsColor" value="${style.pants || "#252b35"}"></label>
          <button class="primary-btn" id="saveAvatar">Save Avatar</button>
        </aside>
        <main>
          <div class="market-head"><h2>Owned Items</h2><button data-route="marketplace">Get More</button></div>
          <div class="item-grid">${user.items.filter((item) => user.inventory.includes(item.id)).map((item) => itemCard(item, user)).join("")}</div>
        </main>
      </div>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindAvatarEditor();
}

function marketplacePage(user) {
  currentUser = user;
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <div class="marketplace-page">
        ${sideRail()}
        <main class="main-feed">
          <div class="section-head"><h1>Marketplace</h1><span>${Number(user.cubbux || 0).toLocaleString()} CUBBUX</span></div>
          <div class="charts-filters">
            <button>All</button><button>Clothing</button><button>Accessories</button><button>Hats</button><button>Animations</button><button>Owned</button>
          </div>
          <div class="item-grid marketplace-grid">${user.items.map((item) => itemCard(item, user)).join("")}</div>
        </main>
      </div>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindMarketplace();
}

function cubbuxPage(user) {
  currentUser = user;
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <main class="cubbux-page">
        <h1>Buy CUBBUX</h1>
        <p class="muted-center">Demo checkout for local testing. On Render this page is ready to connect to a real payment provider.</p>
        <section class="cubbux-bonus panel">
          <div class="bonus-art"></div>
          <div>
            <h2>Bonus item we picked for you</h2>
            <strong>First Play CUBIXIA bundle</strong>
            <span>Includes launch shirt, cap, and tycoon pin.</span>
          </div>
        </section>
        <section class="panel package-list">
          ${cubbuxPackages.map((pack) => `
            <button class="package-row ${pack.id === selectedCubbuxPackage ? "selected" : ""}" data-cubbux-pack="${pack.id}">
              <span><strong>${pack.amount.toLocaleString()}</strong> CUBBUX <small>+ ${pack.bonus} more</small></span>
              <b>${pack.price}</b>
            </button>
          `).join("")}
        </section>
        <section class="panel checkout-panel">
          <div class="section-head"><h2>Card Checkout</h2><span>No real card is stored</span></div>
          <form id="checkoutForm" class="checkout-form">
            <input name="name" placeholder="Cardholder name" autocomplete="cc-name" required />
            <input name="number" placeholder="Card number (test: 4242 4242 4242 4242)" autocomplete="cc-number" required />
            <input name="expiry" placeholder="MM/YY" autocomplete="cc-exp" required />
            <input name="cvc" placeholder="CVC" autocomplete="cc-csc" required />
            <input name="zip" placeholder="Billing ZIP" autocomplete="postal-code" required />
            <button class="primary-btn">Purchase Selected Package</button>
            <div class="message" id="checkoutMessage"></div>
          </form>
        </section>
        <section class="panel">
          <div class="section-head"><h2>My Transactions</h2><span>${user.transactions.length}</span></div>
          <div class="transaction-list">${user.transactions.slice(0, 8).map((entry) => `<div><span>${escapeHtml(entry.label)}</span><strong>${Number(entry.amount) > 0 ? "+" : ""}${Number(entry.amount).toLocaleString()}</strong></div>`).join("") || `<p class="empty">No transactions yet.</p>`}</div>
        </section>
      </main>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindCubbuxPage();
}

function messagesPage(user) {
  currentUser = user;
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <div class="chat-layout">
        <section class="panel">
          <div class="section-head"><h2>Chat</h2><span>global CUBIXIA</span></div>
          <div id="chatMessages" class="chat-messages"></div>
          <form id="chatForm" class="chat-form">
            <input name="text" placeholder="Chat with CUBIXIA" maxlength="180" required />
            <button>Send</button>
          </form>
        </section>
        <section class="panel">
          <div class="section-head"><h2>Friends</h2><span>${user.friendProfiles.length}</span></div>
          ${user.friendProfiles.map((friend) => `<button class="chat-friend">${avatar(friend, "tiny")} ${escapeHtml(friend.username)}</button>`).join("") || `<p class="empty">Add friends to direct message them.</p>`}
        </section>
      </div>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindChat();
}

async function communitiesPage(selectedId = communityState.selectedId || "cubixia-studios") {
  stopRuntime();
  const data = await api("/api/groups").catch(() => ({ groups: [], user: currentUser }));
  if (data.user) currentUser = data.user;
  communityState.groups = data.groups || [];
  communityState.selectedId = selectedId;
  const group = communityState.groups.find((entry) => entry.id === selectedId) || communityState.groups[0];
  const myGroups = communityState.groups.filter((entry) => entry.joined || entry.canEdit);
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <main class="communities-shell">
        <section class="community-browser panel">
          <div class="section-head"><h1>Communities</h1><span>See All</span></div>
          <div class="community-search">Search My Communities</div>
          <h3>Primary</h3>
          ${groupListButton(communityState.groups.find((entry) => entry.id === "cubixia-studios") || group)}
          <h3>My Communities</h3>
          <div class="mini-community-list">${myGroups.map(groupListButton).join("") || `<p class="empty">Join a community to see it here.</p>`}</div>
          <div class="tos-bottom"><button id="readTosBtn">Read TOS?</button></div>
        </section>
        <section class="community-detail panel">
          ${group ? communityDetail(group) : `<p class="empty">No communities loaded.</p>`}
        </section>
      </main>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindGroups();
  bindCommunityDetail();
}

function groupListButton(group) {
  if (!group) return "";
  return `
    <button class="mini-community ${group.id === communityState.selectedId ? "active" : ""}" data-group-view="${escapeHtml(group.id)}">
      <span class="mini-logo">${escapeHtml(group.logo || group.name.slice(0, 2).toUpperCase())}</span>
      <span><strong>${escapeHtml(group.name)}</strong><small>${Number(group.members || 0).toLocaleString()} members${group.canEdit ? " - Owned" : ""}</small></span>
    </button>
  `;
}

function communityDetail(group) {
  const tab = communityState.tab || "about";
  return `
    <header class="community-hero">
      <div class="community-logo big">${escapeHtml(group.logo || "CX")}</div>
      <div>
        <h1>${escapeHtml(group.name)}</h1>
        <p>By ${escapeHtml(group.owner)}</p>
      </div>
      ${group.joined ? `<button class="more-btn">...</button>` : `<button class="primary-btn" data-group="${escapeHtml(group.id)}">Join</button>`}
    </header>
    <div class="community-stats">
      <span>${Number(group.members || 0).toLocaleString()} Members</span>
      <span>${escapeHtml(group.rank || "Guest")} Rank</span>
      <span>${group.memberProfiles?.filter((member) => member.online).length || 0} Active</span>
      <span>${Number(group.favorites || 0).toLocaleString()} Favorites</span>
      <span>${Number(group.visits || 0).toLocaleString()} Visits</span>
      <span>${new Date(group.createdAt || Date.now()).toLocaleString()} Created</span>
    </div>
    <p>${escapeHtml(group.description || "No bio yet.")}</p>
    <div class="community-callout"><strong>NEW: Assign multiple roles per member!</strong><span>Layer permissions and custom ranks for your community.</span></div>
    <div class="community-tabs">
      <button class="${tab === "about" ? "active" : ""}" data-community-tab="about">About</button>
      <button class="${tab === "members" ? "active" : ""}" data-community-tab="members">Members</button>
      <button class="${tab === "announcements" ? "active" : ""}" data-community-tab="announcements">Announcements</button>
      ${group.canEdit ? `<button class="${tab === "edit" ? "active" : ""}" data-community-tab="edit">Edit</button>` : ""}
    </div>
    <div class="community-tab-body">${communityTabBody(group, tab)}</div>
  `;
}

function communityTabBody(group, tab) {
  if (tab === "members") {
    return `
      <h2>Members</h2>
      <div class="community-members">${(group.memberProfiles || []).map((member) => `
        <div class="community-member">${avatar(member, "tiny")}<div><strong>${escapeHtml(member.username)}</strong><small>${escapeHtml(member.rank || "Member")} | ${member.online ? "Online" : "Offline"}</small></div></div>
      `).join("") || `<p class="empty">No members yet.</p>`}</div>
    `;
  }
  if (tab === "announcements") {
    return `
      <div class="section-head"><h2>Announcements</h2>${group.canEdit ? `<button class="primary-btn" data-community-tab="edit">Create</button>` : ""}</div>
      <div class="community-announcements">${(group.announcements || []).map((note) => `
        <article><strong>${escapeHtml(note.title)}</strong><small>${new Date(note.createdAt).toLocaleString()}</small><p>${escapeHtml(note.body)}</p></article>
      `).join("") || `<p class="empty">No announcements yet.</p>`}</div>
    `;
  }
  if (tab === "edit" && group.canEdit) {
    return `
      <h2>Edit Community</h2>
      <form id="communityEditForm" class="community-edit-form">
        <input name="name" value="${escapeHtml(group.name)}" placeholder="Community name" required />
        <input name="logo" value="${escapeHtml(group.logo || "CX")}" placeholder="Logo text" maxlength="4" />
        <textarea name="description" placeholder="Community description" required>${escapeHtml(group.description || "")}</textarea>
        <input name="announcementTitle" placeholder="Announcement title" />
        <textarea name="announcementBody" placeholder="Announcement body"></textarea>
        <button class="primary-btn">Save Community</button>
        <div class="message" id="communityEditMessage"></div>
      </form>
    `;
  }
  return `
    <h2>About</h2>
    <p>${escapeHtml(group.description || "No bio yet.")}</p>
    <div class="role-list">${(group.roles || []).map((role) => `<span>${escapeHtml(role)}</span>`).join("")}</div>
  `;
}

function bindCommunityDetail() {
  document.querySelectorAll("[data-group-view]").forEach((button) => {
    button.addEventListener("click", () => {
      communityState.tab = "about";
      communitiesPage(button.dataset.groupView);
    });
  });
  document.querySelectorAll("[data-community-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      communityState.tab = button.dataset.communityTab;
      communitiesPage(communityState.selectedId);
    });
  });
  document.querySelector("#communityEditForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#communityEditMessage");
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      payload.groupId = communityState.selectedId;
      const data = await api("/api/groups/update", { method: "POST", body: JSON.stringify(payload) });
      if (data.user) currentUser = data.user;
      communityState.groups = data.groups || communityState.groups;
      communityState.tab = "announcements";
      communitiesPage(communityState.selectedId);
    } catch (error) {
      message.textContent = error.message;
    }
  });
  document.querySelector("#readTosBtn")?.addEventListener("click", showTosGuide);
}

function showTosGuide() {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop tos-backdrop";
  modal.innerHTML = `
    <section class="modal tos-modal">
      <h2>CUBIXIA Terms Of Service Guide</h2>
      <p>This guide explains the community rules for accounts, chat, games, groups, avatars, CUBBUX, moderation, and safety.</p>
      <ol>
        <li><strong>Respect players.</strong> No harassment, bullying, threats, hate speech, or targeting people for who they are.</li>
        <li><strong>Keep chat safe.</strong> Do not post explicit content, personal information, scams, spam, or bypass filtered words.</li>
        <li><strong>Play fair.</strong> Exploits, cheats, automation, griefing, and bug abuse can lead to warnings, kicks, timeouts, or bans.</li>
        <li><strong>Protect accounts.</strong> Do not share passwords, steal accounts, impersonate staff, or trick users into giving private info.</li>
        <li><strong>Use CUBBUX honestly.</strong> Demo purchases and grants must not be abused. Marketplace items stay tied to the account that bought them.</li>
        <li><strong>Follow group rules.</strong> Owners manage names, announcements, roles, and members. Group names and posts must stay appropriate.</li>
        <li><strong>Report problems.</strong> Reports go to moderators, admins, and the owner. False reports can be moderated too.</li>
        <li><strong>Moderation actions.</strong> Warnings, kicks, timeouts, and bans show the reason and may require acknowledgement before continuing.</li>
        <li><strong>Appeals and timers.</strong> Timed actions must finish before acknowledgement is available. Permanent actions require owner review.</li>
        <li><strong>Platform safety.</strong> CUBIXIA can update rules, remove unsafe content, or restrict accounts to protect players.</li>
      </ol>
      <button class="primary-btn" type="button">I read the TOS</button>
    </section>
  `;
  document.body.appendChild(modal);
  modal.querySelector("button").addEventListener("click", () => modal.remove());
}

function settingsPage(user) {
  currentUser = user;
  stopRuntime();
  app.innerHTML = `
    <section class="dashboard">
      ${nav()}
      <div class="settings-layout">
        <aside class="settings-tabs">
          <button class="active" data-settings-tab="account">Account info</button>
          <button data-settings-tab="security">Security</button>
          <button data-settings-tab="notifications">Notifications</button>
          <button data-settings-tab="privacy">Privacy</button>
          <button data-settings-tab="browser">Browser preferences</button>
        </aside>
        <section class="panel settings-main" id="settingsMain"></section>
      </div>
    </section>
  `;
  bindRoutes();
  bindSessionButtons();
  bindSettingsPage("account");
}

function bindSettingsPage(initialTab) {
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-settings-tab]").forEach((tab) => tab.classList.toggle("active", tab === button));
      renderSettingsTab(button.dataset.settingsTab);
    });
  });
  renderSettingsTab(initialTab);
}

function renderSettingsTab(tab) {
  const settings = currentUser.settings || {};
  const main = document.querySelector("#settingsMain");
  if (!main) return;
  if (tab === "account") {
    main.innerHTML = `
      <h1>Account Info</h1>
      <p><strong>Username:</strong> ${escapeHtml(currentUser.username)}</p>
      <p><strong>Email:</strong> ${maskEmail(currentUser.email)} <span class="verified">Verified</span></p>
      <p><strong>Role:</strong> ${escapeHtml((currentUser.role || "user").toUpperCase())}</p>
      <p><strong>CUBBUX:</strong> ${Number(currentUser.cubbux || 0).toLocaleString()}</p>
    `;
    return;
  }
  if (tab === "security") {
    main.innerHTML = `
      <h1>Security</h1>
      <form id="passwordForm">
        <label>Current Password</label>
        <div class="plain-password-wrap"><input name="currentPassword" type="password" placeholder="Current password" required /><button type="button" data-toggle-password>Show</button></div>
        <label>New Password</label>
        <div class="plain-password-wrap"><input name="newPassword" type="password" placeholder="New password" minlength="6" required /><button type="button" data-toggle-password>Show</button></div>
        <button class="primary-btn">Change Password</button>
        <div class="message" id="message"></div>
      </form>
    `;
    bindPasswordToggles();
    document.querySelector("#passwordForm").addEventListener("submit", changePassword);
    return;
  }
  const groups = {
    notifications: [
      ["friendRequests", "Friend requests"],
      ["messages", "Messages"],
      ["gameUpdates", "Game updates"],
      ["moderation", "Moderation actions"]
    ],
    privacy: [
      ["profileVisible", "Profile visible"],
      ["showOnline", "Show online status"],
      ["allowFriendRequests", "Allow friend requests"],
      ["allowJoin", "Friends can join my game"],
      ["allowMessages", "Allow messages"]
    ],
    browser: [
      ["reduceMotion", "Reduce motion"],
      ["showPerformance", "Show performance stats"]
    ]
  };
  if (tab === "browser") {
    main.innerHTML = `
      <h1>Browser Preferences</h1>
      <form id="settingsForm" class="settings-switch-form">
        ${groups.browser.map(([key, label]) => settingsToggle(`browser.${key}`, label, settings.browser?.[key])).join("")}
        <label class="settings-field">UI scale <input name="browser.uiScale" type="range" min="0.85" max="1.25" step="0.05" value="${settings.browser?.uiScale || 1}" /></label>
        <button class="primary-btn">Save Settings</button>
        <div class="message" id="settingsMessage"></div>
      </form>
    `;
  } else {
    const title = tab === "privacy" ? "Privacy" : "Notifications";
    main.innerHTML = `
      <h1>${title}</h1>
      <form id="settingsForm" class="settings-switch-form">
        ${groups[tab].map(([key, label]) => settingsToggle(`${tab}.${key}`, label, settings[tab]?.[key])).join("")}
        <button class="primary-btn">Save Settings</button>
        <div class="message" id="settingsMessage"></div>
      </form>
    `;
  }
  document.querySelector("#settingsForm").addEventListener("submit", saveAccountSettings);
}

function settingsToggle(name, label, checked) {
  return `<label class="settings-switch"><span>${label}</span><input name="${name}" type="checkbox" ${checked !== false ? "checked" : ""} /></label>`;
}

function gamePage(user, gameId = "cubixia-survival") {
  currentUser = user;
  const game = gameCatalog.find((entry) => entry.id === gameId) || gameCatalog[0];
  stopRuntime();
  app.innerHTML = `
    <section class="game-page">
      <div class="game-hud">
        <button class="brand game-brand" data-route="home"><span class="brand-mark"></span>CUBIXIA</button>
      <div><strong>${escapeHtml(game.title)}</strong><span id="gameStats">Loading 3D server...</span></div>
      <button id="escButton">Menu</button>
      </div>
      <div id="threeMount"></div>
      <div class="control-strip">WASD move | Hold RMB look | Wheel zoom | LMB action | Space jump</div>
      <div class="game-chat hidden" id="gameChat">
        <div id="gameChatMessages"></div>
        <form id="gameChatForm"><input name="text" maxlength="180" placeholder="Chat with players" /><button>Send</button></form>
      </div>
      <div class="esc-menu hidden" id="escMenu">
        <div class="game-menu">
          <div class="menu-tabs"><button class="active" data-menu-tab="people">People</button><button data-menu-tab="settings">Settings</button><button data-menu-tab="captures">Captures</button><button data-menu-tab="report">Report</button><button data-menu-tab="help">Help</button></div>
          <div id="menuContent" class="menu-content">
            <button class="invite-btn">Invite Friends</button>
            <h2>In this server</h2>
            <div id="peopleList" class="people-list"></div>
          </div>
          <div class="menu-bottom">
            <button id="leaveGame">L Leave</button>
            <button id="resetGame">R Respawn</button>
            <button id="resumeGame">ESC Resume</button>
          </div>
        </div>
      </div>
    </section>
  `;
  bindRoutes();
  if (gameId === "coaster-tycoon") startTycoon3D(user, game);
  else if (gameId === "cubixia-survival") startSurvival3D(user, game);
  else startSandbox3D(user, game);
}

function sideRail() {
  return `
    <aside class="side-rail">
      <button data-route="home">Home</button>
      <button data-route="profile">Profile</button>
      <button data-route="messages">Messages</button>
      <button id="sideFriends">Friends</button>
      <button data-route="avatar">Avatar</button>
      <button data-route="marketplace">Marketplace</button>
      <button data-route="cubbux">CUBBUX</button>
      <button data-route="games">Games</button>
      <button data-route="communities">Communities</button>
      ${canModerateUser(currentUser) ? `<button data-route="moderation">${moderationPanelTitle(currentUser)}</button>` : ""}
      <button data-route="settings">Settings</button>
    </aside>
  `;
}

function gameTile(game) {
  return `
    <article class="game-tile">
      <button class="game-thumb ${game.id}" data-detail="${game.id}"><span>${escapeHtml(game.title)}</span></button>
      <h3>${escapeHtml(game.title)}</h3>
      <p>${escapeHtml(game.genre)}</p>
      <div><span>${game.rating} Rating</span><button data-play="${game.id}">Join</button></div>
    </article>
  `;
}

function friendCard(friend) {
  const state = friend.currentGame ? "ingame" : friend.online ? "online" : "offline";
  return `
    <div class="friend-card wide">
      <button class="friend-face-wrap" data-friend-menu="${escapeHtml(friend.username)}">
        ${avatar(friend, "small")}<span class="status-dot ${state}"></span>
      </button>
      <span title="${escapeHtml(friend.username)}">${escapeHtml(friend.username)}</span>
      <small>${friend.currentGame || (friend.online ? "Online" : "Offline")}</small>
      ${friend.currentGame ? `<button class="join-mini" data-join-friend="${escapeHtml(friend.currentGame)}">Join</button>` : ""}
    </div>
  `;
}

function notificationList(user) {
  if (!user.notifications.length) return `<p class="empty">No notifications yet.</p>`;
  return user.notifications.map((note) => `
    <article class="notice">
      <p>${escapeHtml(note.text)}</p>
      ${note.type === "friend_request" ? `<div><button data-respond="accept" data-from="${escapeHtml(note.from)}">Accept</button><button data-respond="decline" data-from="${escapeHtml(note.from)}">Decline</button></div>` : ""}
    </article>
  `).join("");
}

function itemCard(item, user) {
  const isEquipped = user.equipped.includes(item.id);
  const isOwned = user.inventory.includes(item.id);
  return `
    <button class="item-card ${isEquipped ? "equipped" : ""} ${isOwned ? "owned" : ""}" data-item="${item.id}" data-owned="${isOwned}">
      <div class="item-art ${item.type}">${itemIcon(item)}</div>
      <strong>${escapeHtml(item.name)}</strong>
      <small>${escapeHtml(item.creator || "CUBIXIA")}</small>
      <span>${isEquipped ? "Equipped" : isOwned ? "Owned" : item.price === 0 ? "Free" : `${item.price} CUBBUX`}</span>
    </button>
  `;
}

function itemIcon(item) {
  return { shirt: "T", hat: "^", accessory: "*", face: "=", back: "W", shoes: "B", tool: "!" }[item.type] || "*";
}

function blockAvatar(user, id = "") {
  const style = user.avatarStyle || {};
  const equipped = new Set(user.equipped || []);
  return `
    <div class="block-avatar" id="${id}">
      <span class="head" style="background:${style.skin || "#f0d0a7"}"></span>
      <span class="hair" style="background:${style.hair || "#7a4a1d"}"></span>
      <span class="body" style="background:${style.shirt || "#2268d8"}"></span>
      <span class="arm left" style="background:${style.skin || "#f0d0a7"}"></span>
      <span class="arm right" style="background:${style.skin || "#f0d0a7"}"></span>
      <span class="leg left" style="background:${style.pants || "#252b35"}"></span>
      <span class="leg right" style="background:${style.pants || "#252b35"}"></span>
      ${equipped.has("cube-cap") ? `<span class="cube-cap"></span>` : ""}
      ${equipped.has("creator-crown") ? `<span class="creator-crown"></span>` : ""}
      ${equipped.has("survivor-vest") ? `<span class="survivor-vest"></span>` : ""}
      ${equipped.has("tycoon-badge-pin") ? `<span class="tycoon-pin"></span>` : ""}
      ${equipped.has("neon-visor") ? `<span class="neon-visor"></span>` : ""}
      ${equipped.has("wing-pack") ? `<span class="wing-pack left"></span><span class="wing-pack right"></span>` : ""}
      ${equipped.has("speed-boots") ? `<span class="speed-boot left"></span><span class="speed-boot right"></span>` : ""}
      ${equipped.has("ban-hammer") ? `<span class="ban-hammer"></span>` : ""}
    </div>
  `;
}

function showFriendSearch(seed = "") {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <form class="modal" id="friendSearch">
      <h3>Add friend</h3>
      <input name="username" value="${escapeHtml(seed)}" placeholder="Search username" required />
      <button class="save full" type="submit">Search</button>
      <div class="search-result" id="searchResult"></div>
      <div class="modal-actions"><button type="button" class="cancel">Close</button></div>
    </form>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".cancel").addEventListener("click", () => modal.remove());
  modal.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = new FormData(event.currentTarget).get("username");
    const result = modal.querySelector("#searchResult");
    try {
      const data = await api(`/api/users/search?username=${encodeURIComponent(username)}`);
      if (!data.found) {
        result.innerHTML = `<p>No user was found.</p>`;
        return;
      }
      result.innerHTML = `
        <div class="found-user">
          ${avatar(data.user, "small")}
          <div><strong>${escapeHtml(data.user.username)}</strong><small>${data.user.online ? "Online" : "Offline"}</small></div>
          <button id="requestBtn" ${data.relationship !== "none" ? "disabled" : ""}>${relationshipText(data.relationship)}</button>
        </div>
      `;
      const requestBtn = result.querySelector("#requestBtn");
      if (requestBtn && data.relationship === "none") {
        requestBtn.addEventListener("click", async () => {
          await api("/api/friend-request", { method: "POST", body: JSON.stringify({ username: data.user.username }) });
          requestBtn.textContent = "Request Sent";
          requestBtn.disabled = true;
        });
      }
    } catch (error) {
      result.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }
  });
  if (seed) modal.querySelector("form").requestSubmit();
}

function showBanModal() {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <form class="modal" id="banForm">
      <h3>Owner Ban Feature</h3>
      <input name="username" placeholder="Username to ban or unban" required />
      <input name="reason" placeholder="Reason" />
      <div class="modal-actions"><button class="danger" name="mode" value="ban">Ban</button><button name="mode" value="unban">Unban</button><button type="button" class="cancel">Close</button></div>
      <div class="message" id="banMessage"></div>
    </form>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".cancel").addEventListener("click", () => modal.remove());
  modal.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await api("/api/admin/ban", { method: "POST", body: JSON.stringify({ username: form.username, reason: form.reason, banned: submitter.value === "ban" }) });
      modal.querySelector("#banMessage").textContent = submitter.value === "ban" ? "User banned." : "User unbanned.";
    } catch (error) {
      modal.querySelector("#banMessage").textContent = error.message;
    }
  });
}

function bindSocial() {
  document.querySelector("#openSearch")?.addEventListener("click", () => showFriendSearch());
  document.querySelectorAll("[data-respond]").forEach((button) => {
    button.addEventListener("click", () => respondRequest(button.dataset.from, button.dataset.respond));
  });
  document.querySelectorAll("[data-friend-menu]").forEach((button) => {
    button.addEventListener("click", () => showFriendMenu(button.dataset.friendMenu));
  });
}

function showFriendMenu(username) {
  const friend = currentUser.friendProfiles.find((entry) => entry.username === username);
  if (!friend) return;
  const modal = document.createElement("div");
  modal.className = "friend-pop";
  modal.innerHTML = `
    <div>${avatar(friend, "small")}<strong>${escapeHtml(friend.username)}</strong></div>
    ${friend.currentGame ? `<p>${escapeHtml(friend.currentGame)}</p><button data-play="${gameIdFromTitle(friend.currentGame)}">Join</button>` : `<p>${friend.online ? "Online" : "Offline"}</p>`}
    <button data-route="messages">Chat with ${escapeHtml(friend.username)}</button>
    <button data-view-user="${escapeHtml(friend.username)}">View Profile</button>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.remove(), 5000);
  bindRoutes();
  bindPlayButtons();
  modal.querySelector("[data-view-user]")?.addEventListener("click", () => publicProfile(friend));
}

function bindPlayButtons() {
  document.querySelectorAll("[data-play]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!currentUser) return signup();
      gamePage(currentUser, button.dataset.play);
    });
  });
  document.querySelectorAll("[data-detail]").forEach((button) => {
    button.addEventListener("click", () => gameDetail(button.dataset.detail));
  });
}

function bindAvatarPicker(initial = "") {
  const input = document.querySelector("#avatarInput");
  const preview = document.querySelector("#avatarPreview");
  if (!input || !preview) return;
  if (initial) preview.innerHTML = `<img src="${initial}" alt="">`;
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      preview.dataset.avatar = reader.result;
      preview.innerHTML = `<img src="${reader.result}" alt="">`;
    };
    reader.readAsDataURL(file);
  });
}

function bindPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector("input");
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });
}

function bindRecovery() {
  let identity = "";
  document.querySelector("#recoverStart").addEventListener("submit", async (event) => {
    event.preventDefault();
    identity = new FormData(event.currentTarget).get("identity");
    const message = document.querySelector("#message");
    try {
      const data = await api("/api/recover/start", { method: "POST", body: JSON.stringify({ identity }) });
      message.textContent = `${data.message} Demo code: ${data.demoCode}`;
      document.querySelector("#recoverFinish").classList.remove("hidden");
    } catch (error) {
      message.textContent = error.message;
    }
  });
  document.querySelector("#recoverFinish").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.identity = identity;
    const message = document.querySelector("#finishMessage");
    try {
      const data = await api("/api/recover/finish", { method: "POST", body: JSON.stringify(payload) });
      routeUser(data);
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function bindAvatarEditor() {
  const preview = document.querySelector("#preview");
  const sync = () => {
    preview.querySelector(".head").style.background = document.querySelector("#skinColor").value;
    preview.querySelectorAll(".arm").forEach((part) => { part.style.background = document.querySelector("#skinColor").value; });
    preview.querySelector(".body").style.background = document.querySelector("#shirtColor").value;
    preview.querySelectorAll(".leg").forEach((part) => { part.style.background = document.querySelector("#pantsColor").value; });
  };
  document.querySelectorAll("#skinColor,#shirtColor,#pantsColor").forEach((input) => input.addEventListener("input", sync));
  document.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.item;
      currentUser.avatarStyle = {
        ...currentUser.avatarStyle,
        skin: document.querySelector("#skinColor").value,
        shirt: document.querySelector("#shirtColor").value,
        pants: document.querySelector("#pantsColor").value
      };
      toggleEquipped(id);
      avatarEditor(currentUser);
    });
  });
  document.querySelector("#saveAvatar").addEventListener("click", async () => {
    const payload = {
      bio: currentUser.bio,
      equipped: currentUser.equipped,
      avatarStyle: {
        skin: document.querySelector("#skinColor").value,
        shirt: document.querySelector("#shirtColor").value,
        pants: document.querySelector("#pantsColor").value,
        hair: currentUser.avatarStyle.hair
      }
    };
    const data = await api("/api/profile", { method: "POST", body: JSON.stringify(payload) });
    currentUser = data.user;
    avatarEditor(data.user);
  });
}

function bindMarketplace() {
  document.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.item;
      if (button.dataset.owned === "true") {
        toggleEquipped(id);
        const data = await saveEquippedItems();
        marketplacePage(data.user);
        return;
      }
      try {
        const data = await api("/api/marketplace/buy", { method: "POST", body: JSON.stringify({ itemId: id }) });
        currentUser = data.user;
        toggleEquipped(id);
        const saved = await saveEquippedItems();
        marketplacePage(saved.user);
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function bindCubbuxPage() {
  document.querySelectorAll("[data-cubbux-pack]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCubbuxPackage = button.dataset.cubbuxPack;
      cubbuxPage(currentUser);
    });
  });
  document.querySelector("#checkoutForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#checkoutMessage");
    message.textContent = "";
    try {
      const data = await api("/api/cubbux/checkout", {
        method: "POST",
        body: JSON.stringify({ packageId: selectedCubbuxPackage, card: Object.fromEntries(new FormData(event.currentTarget).entries()) })
      });
      currentUser = data.user;
      cubbuxPage(data.user);
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function bindGroups() {
  document.querySelectorAll("[data-group]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const data = await api("/api/groups/join", { method: "POST", body: JSON.stringify({ groupId: button.dataset.group }) });
        currentUser = data.user;
        communitiesPage(button.dataset.group);
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function userJoinedGroup(groupId) {
  return Boolean(currentUser?.groups?.includes(groupId));
}

function bindOwnerPanel() {
  const message = document.querySelector("#ownerMessage");
  document.querySelector("#ownerBanForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await api("/api/admin/ban", { method: "POST", body: JSON.stringify({ username: form.username, reason: form.reason, banned: submitter.value === "ban" }) });
      message.textContent = submitter.value === "ban" ? "User banned." : "User unbanned.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
  document.querySelector("#ownerGrantForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/api/admin/grant-cubbux", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      message.textContent = "CUBBUX granted.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
  document.querySelector("#ownerTakeForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/api/admin/take-cubbux", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      message.textContent = "CUBBUX removed.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
  document.querySelector("#ownerRoleForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/api/admin/role", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      message.textContent = "Role updated.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
  document.querySelector("#ownerWarnForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      payload.action = "warn";
      await api("/api/moderation/action", { method: "POST", body: JSON.stringify(payload) });
      message.textContent = "Warning sent.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

async function bindModerationPanel() {
  const list = document.querySelector("#moderationReports");
  const message = document.querySelector("#moderationMessage");
  const loadReports = async () => {
    const data = await api("/api/moderation/reports").catch((error) => ({ reports: [], error: error.message }));
    if (data.user) currentUser = data.user;
    if (data.error) {
      list.innerHTML = `<p class="empty">${escapeHtml(data.error)}</p>`;
    } else if (!data.reports.length) {
      list.innerHTML = `<p class="empty">No reports yet. When someone submits one, it will appear here with the reason.</p>`;
    } else {
      list.innerHTML = data.reports.map((report) => `
        <article class="report-card">
          <div><strong>${escapeHtml(report.abuseType)}</strong><span>${new Date(report.createdAt).toLocaleString()}</span></div>
          <p><b>Reporter:</b> ${escapeHtml(report.reporter)}</p>
          <p><b>${escapeHtml(report.targetType)}:</b> ${escapeHtml(report.target)}</p>
          <p>${escapeHtml(report.details)}</p>
          <div class="report-actions">
            <button type="button" data-use-report="${escapeHtml(report.target)}" data-reason="${escapeHtml(report.details)}">Use in action form</button>
            <button type="button" class="danger-lite" data-delete-report="${escapeHtml(report.id)}">Delete report</button>
          </div>
        </article>
      `).join("");
    }
    document.querySelectorAll("[data-use-report]").forEach((button) => {
      button.addEventListener("click", () => {
        const form = document.querySelector("#moderationActionForm");
        form.elements.username.value = button.dataset.useReport;
        form.elements.reason.value = button.dataset.reason;
      });
    });
    document.querySelectorAll("[data-delete-report]").forEach((button) => {
      button.addEventListener("click", async () => {
        await api("/api/moderation/reports/delete", { method: "POST", body: JSON.stringify({ reportId: button.dataset.deleteReport }) });
        message.textContent = "Report deleted.";
        await loadReports();
      });
    });
  };
  await loadReports();
  document.querySelector("#moderationActionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    try {
      const action = await api("/api/moderation/action", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      currentUser = action.user;
      message.textContent = `Action sent: ${action.action.toUpperCase()} ${action.target.username}.`;
      await loadReports();
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function toggleEquipped(id) {
  const item = currentUser.items.find((entry) => entry.id === id);
  if (!item || !currentUser.inventory.includes(id)) return;
  if (currentUser.equipped.includes(id)) {
    currentUser.equipped = currentUser.equipped.filter((itemId) => itemId !== id);
    return;
  }
  const singleTypes = ["hat", "face", "back", "shoes", "tool"];
  if (singleTypes.includes(item.type)) {
    currentUser.equipped = currentUser.equipped.filter((itemId) => currentUser.items.find((entry) => entry.id === itemId)?.type !== item.type);
  }
  currentUser.equipped = [...currentUser.equipped, id];
}

function saveEquippedItems() {
  return api("/api/profile", {
    method: "POST",
    body: JSON.stringify({
      bio: currentUser.bio,
      equipped: currentUser.equipped,
      avatarStyle: currentUser.avatarStyle
    })
  }).then((data) => {
    currentUser = data.user;
    return data;
  });
}

async function register(event) {
  event.preventDefault();
  const message = document.querySelector("#message");
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  payload.avatar = document.querySelector("#avatarPreview")?.dataset.avatar || "";
  message.textContent = "";
  try {
    const data = await api("/api/register", { method: "POST", body: JSON.stringify(payload) });
    routeUser(data);
  } catch (error) {
    message.textContent = error.message;
  }
}

async function doLogin(event) {
  event.preventDefault();
  const message = document.querySelector("#message");
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  message.textContent = "";
  try {
    const data = await api("/api/login", { method: "POST", body: JSON.stringify(payload) });
    routeUser(data);
  } catch (error) {
    message.textContent = error.message;
  }
}

async function saveProfile(event) {
  event.preventDefault();
  const message = document.querySelector("#message");
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  const nextAvatar = document.querySelector("#avatarPreview")?.dataset.avatar;
  if (nextAvatar) payload.avatar = nextAvatar;
  try {
    const data = await api("/api/profile", { method: "POST", body: JSON.stringify(payload) });
    message.textContent = "Saved.";
    currentUser = data.user;
  } catch (error) {
    message.textContent = error.message;
  }
}

async function changePassword(event) {
  event.preventDefault();
  const message = document.querySelector("#message");
  try {
    await api("/api/settings/password", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
    message.textContent = "Password changed.";
    event.currentTarget.reset();
  } catch (error) {
    message.textContent = error.message;
  }
}

async function saveAccountSettings(event) {
  event.preventDefault();
  const payload = { notifications: {}, privacy: {}, browser: {} };
  const form = event.currentTarget;
  form.querySelectorAll("input").forEach((input) => {
    const [section, key] = input.name.split(".");
    if (!payload[section]) payload[section] = {};
    payload[section][key] = input.type === "checkbox" ? input.checked : Number(input.value);
  });
  const merged = {
    notifications: { ...(currentUser.settings?.notifications || {}), ...payload.notifications },
    privacy: { ...(currentUser.settings?.privacy || {}), ...payload.privacy },
    browser: { ...(currentUser.settings?.browser || {}), ...payload.browser }
  };
  try {
    const data = await api("/api/settings/account", { method: "POST", body: JSON.stringify(merged) });
    currentUser = data.user;
    document.querySelector("#settingsMessage").textContent = "Settings saved.";
  } catch (error) {
    document.querySelector("#settingsMessage").textContent = error.message;
  }
}

async function submitReport(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector("#reportMessage");
  try {
    const data = await api("/api/report", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
    currentUser = data.user;
    message.textContent = "Report sent to moderators, admins, and Tanklyplayz.";
    const details = form.elements.details;
    if (details) details.value = "";
  } catch (error) {
    message.textContent = error.message;
  }
}

async function respondRequest(from, action) {
  const data = await api("/api/friend-request/respond", { method: "POST", body: JSON.stringify({ from, action }) });
  hub(data.user);
}

function bindRoutes() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const route = button.dataset.route;
      if (route === "signup") return signup();
      if (route === "login") return login();
      if (route === "recover") return recover();
      if (route === "games") return gamesPage();
      if (route === "communities") return communitiesPage();
      if (route === "home") {
        return goHome();
      }
      if (!currentUser) return login();
      if (route === "profile") return profile(currentUser);
      if (route === "avatar") return avatarEditor(currentUser);
      if (route === "marketplace") return marketplacePage(currentUser);
      if (route === "cubbux") return cubbuxPage(currentUser);
      if (route === "owner") return ownerPanelPage(currentUser);
      if (route === "moderation") return moderationPanelPage(currentUser);
      if (route === "messages") return messagesPage(currentUser);
      if (route === "settings") return settingsPage(currentUser);
    });
  });
}

async function goHome() {
  if (!currentUser) return guestHome();
  try {
    const data = await api("/api/me");
    return routeUser(data);
  } catch {
    return hub(currentUser);
  }
}

function bindSessionButtons() {
  const logout = document.querySelector("#logoutBtn");
  if (!logout) return;
  logout.addEventListener("click", async () => {
    if (!confirm("Are you sure you would like to log out")) return;
    await api("/api/logout", { method: "POST" });
    guestHome();
  });
}

function bindQuickRegister() {
  document.querySelector("#quickRegister").addEventListener("submit", (event) => {
    event.preventDefault();
    signup(new FormData(event.currentTarget).get("username"));
  });
}

async function bindChat() {
  const list = document.querySelector("#chatMessages");
  const load = async () => {
    const data = await api("/api/chat?room=global");
    list.innerHTML = data.messages.map((message) => `<div class="chat-line"><strong>${escapeHtml(message.username)}</strong><span>${escapeHtml(message.text)}</span></div>`).join("") || `<p class="empty">No messages yet.</p>`;
    list.scrollTop = list.scrollHeight;
  };
  await load();
  runtime = runtime || {};
  runtime.chatInterval = setInterval(load, 2500);
  document.querySelector("#chatForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get("text");
    await api("/api/chat", { method: "POST", body: JSON.stringify({ room: "global", text }) });
    event.currentTarget.reset();
    await load();
  });
}

async function startSurvival3D(user, game) {
  const THREE = await loadThree();
  const base = createThreeWorld(THREE, game.id, user.gameSettings);
  const stats = document.querySelector("#gameStats");
  const player = createAvatarMesh(THREE, user, true);
  player.position.set(0, 0.8, 0);
  base.scene.add(player);
  const gun = createGun(THREE);
  gun.position.set(0.55, 0.35, -0.25);
  player.add(gun);
  player.userData.heldTool = "gun";
  const zombies = [];
  const bullets = [];
  const effects = [];
  const state = { hp: 100, xp: Number(user.lastPlayed.xp || 0), cash: Number(user.lastPlayed.currency || 0), wave: 1, paused: false, vy: 0 };
  state.spawnPoint = { x: 0, y: 0.8, z: 0 };
  spawnZombies(THREE, base.scene, zombies, state.wave);
  setupGameMenu(base, user, game.id, state, player);
  setupGameChat(base, user, game.id);

  base.mount.addEventListener("click", (event) => {
    if (event.button !== 0 || base.controls?.dragged) return;
    const direction = cameraForward(base.controls);
    const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0x664000 }));
    bullet.position.copy(player.position).add(new THREE.Vector3(0, 1.25, 0)).add(direction.clone().multiplyScalar(0.75));
    bullet.userData.velocity = direction.multiplyScalar(0.72);
    bullet.userData.prev = bullet.position.clone();
    bullet.userData.life = 80;
    bullets.push(bullet);
    base.scene.add(bullet);
    gun.userData.flash.visible = true;
    gun.userData.flashTicks = 4;
    gun.position.z = -0.32;
    playShotSound();
  });

  base.tick = () => {
    if (!state.paused) {
      movePlayer(base, player, state);
      if (Math.abs(player.position.x) > 34 || Math.abs(player.position.z) > 34 || player.position.y < -4) {
        state.hp = 0;
        respawnPlayer(state, player, game.id);
      }
      bullets.forEach((bullet) => {
        bullet.userData.prev = bullet.position.clone();
        bullet.position.add(bullet.userData.velocity);
        bullet.userData.life -= 1;
      });
      zombies.forEach((zombie) => {
        const dir = player.position.clone().sub(zombie.position);
        dir.y = 0;
        dir.normalize();
        zombie.position.add(dir.multiplyScalar(0.025 + state.wave * 0.003));
        zombie.lookAt(player.position.x, zombie.position.y, player.position.z);
        if (zombie.position.distanceTo(player.position) < 0.8) state.hp = Math.max(0, state.hp - 0.22);
        bullets.forEach((bullet) => {
          const center = zombie.position.clone().add(new THREE.Vector3(0, 0.4, 0));
          if (!bullet.userData.dead && distancePointToSegment(center, bullet.userData.prev || bullet.position, bullet.position) < 0.72) {
            zombie.userData.hp -= 50;
            bullet.userData.dead = true;
            spawnHitBurst(THREE, base.scene, effects, zombie.position);
          }
        });
      });
      updateEffects(base.scene, effects);
      if (gun.userData.flashTicks > 0) gun.userData.flashTicks -= 1;
      gun.userData.flash.visible = gun.userData.flashTicks > 0;
      gun.position.z += (-0.25 - gun.position.z) * 0.32;
      cleanupDead(THREE, base.scene, zombies, bullets, state);
      if (!zombies.length) spawnZombies(THREE, base.scene, zombies, ++state.wave);
      if (state.hp <= 0) respawnPlayer(state, player, game.id);
      stats.textContent = `Wave ${state.wave} | HP ${Math.round(state.hp)} | XP ${state.xp} | Credits ${state.cash}`;
      updateCamera(base.camera, player);
    }
    renderOtherPlayers(THREE, base, user, game.id, player, state);
    animateOtherPlayers(base);
  };
  runThree(base);
}

async function startTycoon3D(user, game) {
  const THREE = await loadThree();
  const base = createThreeWorld(THREE, game.id, user.gameSettings);
  const stats = document.querySelector("#gameStats");
  const player = createAvatarMesh(THREE, user, true);
  player.position.set(0, 0.8, 5.5);
  base.scene.add(player);
  const state = { cash: 200, happiness: 88, price: 10, paused: false, vy: 0 };
  const rides = [];
  const customers = [];
  setupGameMenu(base, user, game.id, state, player);
  setupGameChat(base, user, game.id);
  addRide(THREE, base.scene, rides, -6, -2.5, "coaster");
  addRide(THREE, base.scene, rides, 1.8, -3.2, "wheel");
  addRide(THREE, base.scene, rides, 6.5, 1.5, "drop");
  spawnCustomers(THREE, base.scene, customers, 14);
  base.mount.addEventListener("click", (event) => {
    if (event.button !== 0 || base.controls?.dragged) return;
    if (state.cash >= 75) {
      state.cash -= 75;
      const buildSpots = [[-8, 3.5], [-2.5, 3.6], [3.4, 3.7], [8, -3.2], [-9, -6.2]];
      const spot = buildSpots[rides.length % buildSpots.length];
      addRide(THREE, base.scene, rides, spot[0], spot[1], ["coaster", "wheel", "drop"][rides.length % 3]);
    } else {
      state.price += 2;
      state.happiness = Math.max(20, state.happiness - 4);
    }
  });

  base.tick = () => {
    if (!state.paused) {
      movePlayer(base, player, state);
      customers.forEach((guest, index) => {
        const ride = rides[index % rides.length];
        const dir = ride.position.clone().sub(guest.position);
        dir.y = 0;
        guest.userData.bob = (guest.userData.bob || 0) + 0.08;
        guest.children[0].position.y = 0.65 + Math.sin(guest.userData.bob) * 0.04;
        if (dir.length() > 0.45) {
          guest.position.add(dir.normalize().multiplyScalar(0.024));
          guest.lookAt(ride.position.x, guest.position.y, ride.position.z);
        }
        else {
          state.cash += Math.max(1, Math.round(state.price * (state.happiness / 100)));
          guest.position.set(-9 + Math.random() * 18, 0, 7 + Math.random() * 3);
          if (state.price > 18) state.happiness = Math.max(20, state.happiness - 1);
        }
      });
      rides.forEach((ride) => animateRide(ride));
      stats.textContent = `Cash ${state.cash} | Ride price ${state.price} | Happiness ${state.happiness}% | Click to build or raise price`;
      updateCamera(base.camera, player);
    }
    renderOtherPlayers(THREE, base, user, game.id, player, state);
    animateOtherPlayers(base);
  };
  runThree(base);
}

async function startSandbox3D(user, game) {
  const THREE = await loadThree();
  const base = createThreeWorld(THREE, game.id, user.gameSettings);
  const stats = document.querySelector("#gameStats");
  const player = createAvatarMesh(THREE, user, true);
  player.position.set(0, 0.8, 4);
  base.scene.add(player);
  const state = { score: 0, hp: 100, cash: Number(user.lastPlayed.currency || 0), paused: false, vy: 0, respawning: false };
  state.spawnPoint = { x: 0, y: 0.8, z: 4 };
  setupGameMenu(base, user, game.id, state, player);
  setupGameChat(base, user, game.id);
  const scenario = buildSandboxObstacles(THREE, base.scene, game.id, state);
  const collectibles = [];
  for (let i = 0; i < scenario.collectibleCount; i++) {
    const geometry = scenario.collectibleShape === "sphere" ? new THREE.SphereGeometry(0.22, 16, 10) : scenario.collectibleShape === "box" ? new THREE.BoxGeometry(0.28, 0.28, 0.28) : new THREE.OctahedronGeometry(0.22);
    const gem = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: scenario.colors[i % scenario.colors.length], emissive: 0x101010 }));
    const radius = scenario.collectibleRadius || 20;
    gem.position.set(-radius / 2 + Math.random() * radius, 0.6, -radius / 2 + Math.random() * radius);
    collectibles.push(gem);
    base.scene.add(gem);
  }
  base.tick = () => {
    if (!state.paused && !state.respawning) {
      movePlayer(base, player, state);
      collectibles.forEach((gem) => {
        gem.rotation.y += 0.04;
        if (gem.visible && gem.position.distanceTo(player.position) < 0.75) {
          gem.visible = false;
          state.score += scenario.scoreValue;
          state.cash += scenario.cashValue;
        }
      });
      scenario.tick?.({ THREE, base, player, state, collectibles });
      stats.textContent = scenario.stats(state);
      updateCamera(base.camera, player);
    }
    renderOtherPlayers(THREE, base, user, game.id, player, state);
    animateOtherPlayers(base);
  };
  runThree(base);
}

function buildSandboxObstacles(THREE, scene, gameId, state) {
  const scenario = {
    colors: [0x315cff, 0x44db78, 0xffcf55, 0xff575f, 0x38aef3],
    collectibleCount: 12,
    collectibleShape: "oct",
    collectibleRadius: 20,
    scoreValue: 10,
    cashValue: 1,
    stats: (gameState) => `Score ${gameState.score} | CUBBUX earned ${gameState.cash}`,
    tick: null
  };
  const mat = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.65 });
  const addBox = (x, y, z, w, h, d, color) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    box.position.set(x, y + h / 2, z);
    scene.add(box);
    return box;
  };

  if (gameId === "gun-game") {
    scenario.colors = [0xff575f, 0xffcf55];
    scenario.collectibleCount = 6;
    scenario.scoreValue = 25;
    scenario.stats = (gameState) => `Targets ${Math.floor(gameState.score / 25)} | Arena score ${gameState.score} | Click targets`;
    for (let i = 0; i < 12; i++) {
      const target = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.14, 24), mat(i % 2 ? 0xff575f : 0xffcf55));
      target.rotation.x = Math.PI / 2;
      target.position.set(-13 + (i % 4) * 8, 1.2 + (i % 3) * 0.7, -10 + Math.floor(i / 4) * 7);
      scene.add(target);
    }
    addBox(0, 0, -14, 26, 0.2, 0.5, 0x303947);
    addBox(0, 0, 10, 26, 0.2, 0.5, 0x303947);
    return scenario;
  }

  if (gameId === "speed-trials") {
    scenario.colors = [0x38aef3, 0xffffff, 0xffcf55];
    scenario.collectibleCount = 18;
    scenario.scoreValue = 5;
    scenario.stats = (gameState) => `Checkpoints ${gameState.score / 5} | Sprint line ahead | ${gameState.cash} CUBBUX`;
    for (let i = 0; i < 9; i++) {
      addBox(0, i * 0.03, -12 + i * 3.1, 4 + (i % 2) * 3, 0.2, 1.1, i % 2 ? 0x38aef3 : 0xffffff);
      const gate = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.06, 12, 40), mat(0xffcf55));
      gate.position.set((i % 2 ? 4 : -4), 1.4, -12 + i * 3.1);
      scene.add(gate);
    }
    return scenario;
  }

  if (gameId === "gravity-flip") {
    scenario.colors = [0x8b5cf6, 0x38aef3, 0xf7e06e];
    scenario.collectibleShape = "sphere";
    scenario.stats = (gameState) => `Gravity cores ${gameState.score / 10} | Jump between floating pads`;
    for (let i = 0; i < 14; i++) {
      const pad = addBox(Math.cos(i) * 8, 0.5 + (i % 4) * 0.55, Math.sin(i * 1.7) * 8, 2.2, 0.22, 2.2, i % 2 ? 0x8b5cf6 : 0x38aef3);
      pad.rotation.y = i * 0.3;
    }
    return scenario;
  }

  if (gameId === "base-defense") {
    scenario.colors = [0x44db78, 0xff575f];
    scenario.collectibleShape = "box";
    scenario.collectibleCount = 10;
    scenario.stats = (gameState) => `Supplies ${gameState.score / 10} | Base HP ${gameState.hp} | Fortify walls`;
    for (let i = 0; i < 4; i++) addBox([-5, 5, 0, 0][i], 0, [0, 0, -5, 5][i], i < 2 ? 0.5 : 10, 1.4, i < 2 ? 10 : 0.5, 0x263544);
    for (let i = 0; i < 8; i++) addBox(-9 + i * 2.5, 0, -8, 0.7, 1.2, 0.7, 0xff575f);
    return scenario;
  }

  if (gameId === "pet-evolution") {
    scenario.colors = [0xff8ab3, 0x44db78, 0x38aef3];
    scenario.collectibleShape = "sphere";
    scenario.collectibleCount = 16;
    scenario.stats = (gameState) => `Pet energy ${gameState.score} | Mutations ${Math.floor(gameState.score / 60)}`;
    for (let i = 0; i < 5; i++) {
      const pet = new THREE.Mesh(new THREE.SphereGeometry(0.45 + i * 0.05, 16, 12), mat(scenario.colors[i % scenario.colors.length]));
      pet.position.set(-6 + i * 3, 0.55, -3 + Math.sin(i) * 5);
      scene.add(pet);
    }
    return scenario;
  }

  if (gameId === "vehicle-builder") {
    scenario.colors = [0x315cff, 0xffcf55, 0x222831];
    scenario.collectibleShape = "box";
    scenario.collectibleCount = 14;
    scenario.stats = (gameState) => `Parts ${gameState.score / 10} | Test track ready`;
    for (let i = 0; i < 10; i++) addBox(Math.cos(i / 10 * Math.PI * 2) * 8, 0, Math.sin(i / 10 * Math.PI * 2) * 8, 2.4, 0.14, 1.1, i % 2 ? 0xffcf55 : 0x315cff);
    addBox(0, 0, 0, 2.2, 0.5, 4, 0x315cff);
    addBox(-1.3, 0, 1.6, 0.6, 0.6, 0.6, 0x111820);
    addBox(1.3, 0, 1.6, 0.6, 0.6, 0.6, 0x111820);
    return scenario;
  }

  if (gameId === "floor-is-lava") {
    scenario.colors = [0xffcf55, 0xffffff];
    scenario.collectibleCount = 8;
    scenario.stats = (gameState) => `Safe tokens ${gameState.score / 10} | Lava rising`;
    const lava = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 0.08, 64), new THREE.MeshStandardMaterial({ color: 0xff575f, emissive: 0x661111 }));
    lava.position.set(0, 0.09, 0);
    scene.add(lava);
    for (let i = 0; i < 16; i++) addBox(-12 + (i % 4) * 8, 0.3 + (i % 4) * 0.2, -10 + Math.floor(i / 4) * 6, 2.5, 0.22, 2.5, i % 2 ? 0x38aef3 : 0xffcf55);
    scenario.tick = ({ player, state: gameState }) => {
      if (player.position.y <= 0.82 && Math.hypot(player.position.x, player.position.z) < 13) respawnPlayer(gameState, player, gameId);
    };
    return scenario;
  }

  for (let i = 0; i < 18; i++) {
    const h = 0.25 + (i % 4) * 0.35;
    addBox(-14 + (i % 6) * 5.2, 0, -11 + Math.floor(i / 6) * 6, 1.4 + (i % 3), h, 1.4, scenario.colors[i % scenario.colors.length]);
  }
  return scenario;
}

function createThreeWorld(THREE, gameId, gameSettings = {}) {
  const mount = document.querySelector("#threeMount");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(gameId === "coaster-tycoon" ? 0x99d9ff : 0x0b1218);
  const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 2.4));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(6, 10, 4);
  scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: gameId === "coaster-tycoon" ? 0x68b65c : 0x243342, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  if (gameId === "coaster-tycoon") buildTycoonPark(THREE, scene);
  else {
    for (let i = 0; i < 18; i++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1 + Math.random() * 2, 1 + Math.random() * 3, 1 + Math.random() * 2), new THREE.MeshStandardMaterial({ color: 0x32465a }));
      let x = -18 + Math.random() * 36;
      let z = -18 + Math.random() * 36;
      if (Math.hypot(x, z) < 7) {
        x += x < 0 ? -7 : 7;
        z += z < 0 ? -7 : 7;
      }
      box.position.set(x, box.geometry.parameters.height / 2, z);
      scene.add(box);
    }
  }
  const keys = {};
  const controls = {
    yaw: 0,
    pitch: -0.34,
    distance: gameId === "coaster-tycoon" ? 9.5 : 7.8,
    targetDistance: gameId === "coaster-tycoon" ? 9.5 : 7.8,
    sensitivity: Number(gameSettings.cameraSensitivity || 1),
    invertY: gameSettings.cameraInverted !== false,
    smoothZoom: gameSettings.smoothZoom !== false,
    firstPersonZoom: gameSettings.firstPersonZoom !== false,
    cameraFollow: gameSettings.cameraFollow || "free",
    rmb: false,
    pointerLocked: false,
    lastX: 0,
    lastY: 0,
    dragged: false
  };
  mount.addEventListener("contextmenu", (event) => event.preventDefault());
  mount.addEventListener("pointerdown", (event) => {
    if (event.button !== 2) return;
    event.preventDefault();
    controls.rmb = true;
    controls.dragged = false;
    controls.lastX = event.clientX;
    controls.lastY = event.clientY;
    try {
      mount.requestPointerLock?.();
    } catch {
      controls.pointerLocked = false;
    }
    if (document.pointerLockElement !== mount) {
      try {
        mount.setPointerCapture?.(event.pointerId);
      } catch {
        controls.pointerLocked = false;
      }
    }
    mount.classList.add("camera-dragging");
  });
  mount.addEventListener("pointermove", (event) => {
    if (!controls.rmb && document.pointerLockElement !== mount) return;
    const dx = event.movementX || event.clientX - controls.lastX;
    const dy = event.movementY || event.clientY - controls.lastY;
    controls.lastX = event.clientX;
    controls.lastY = event.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 2) controls.dragged = true;
    controls.yaw -= dx * 0.006 * controls.sensitivity;
    controls.pitch = clamp(controls.pitch + (controls.invertY ? -dy : dy) * 0.0045 * controls.sensitivity, -1.15, 0.55);
  });
  const endCameraDrag = (event) => {
    if (event.button !== 2 && event.type !== "pointerleave") return;
    controls.rmb = false;
    try {
      if (document.pointerLockElement === mount) document.exitPointerLock?.();
    } catch {
      controls.pointerLocked = false;
    }
    try {
      mount.releasePointerCapture?.(event.pointerId);
    } catch {
      controls.pointerLocked = false;
    }
    mount.classList.remove("camera-dragging");
    setTimeout(() => { controls.dragged = false; }, 80);
  };
  const pointerLockHandler = () => {
    controls.pointerLocked = document.pointerLockElement === mount;
    controls.rmb = controls.pointerLocked || controls.rmb;
    mount.classList.toggle("camera-dragging", controls.pointerLocked || controls.rmb);
  };
  document.addEventListener("pointerlockchange", pointerLockHandler);
  mount.addEventListener("pointerup", endCameraDrag);
  mount.addEventListener("pointerleave", endCameraDrag);
  mount.addEventListener("wheel", (event) => {
    event.preventDefault();
    controls.targetDistance = clamp(controls.targetDistance + Math.sign(event.deltaY) * 0.75, 0.45, 18);
  }, { passive: false });
  document.onkeydown = (event) => {
    if (event.target?.matches?.("input, textarea, select")) {
      if (event.key === "Escape") event.target.blur();
      return;
    }
    if (event.key === "/") {
      event.preventDefault();
      toggleGameChat(true);
      return;
    }
    keys[event.key.toLowerCase()] = true;
    if (event.key === "Escape") toggleGameMenu(true);
  };
  document.onkeyup = (event) => { keys[event.key.toLowerCase()] = false; };
  window.onresize = () => {
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  };
  runtime = { scene, camera, renderer, mount, keys, controls, pointerLockHandler, otherMeshes: new Map(), frame: 0, pollAt: 0, clock: new THREE.Clock() };
  return runtime;
}

function createAvatarMesh(THREE, user, local = false) {
  const style = user.avatarStyle || {};
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: style.skin || 0xf0d0a7 });
  const shirt = new THREE.MeshStandardMaterial({ color: style.shirt || 0x2268d8 });
  const pants = new THREE.MeshStandardMaterial({ color: style.pants || 0x252b35 });
  const hair = new THREE.MeshStandardMaterial({ color: style.hair || 0x7a4a1d });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111820 });
  const faceMat = new THREE.MeshStandardMaterial({ color: 0x111820 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.39, 24, 16), skin);
  head.position.y = 1.82;
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 0.76), hair);
  hairTop.position.y = 2.22;
  const hairFront = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.22, 0.16), hair);
  hairFront.position.set(0, 2.08, -0.36);
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.025);
  const leftEye = new THREE.Mesh(eyeGeo, faceMat);
  const rightEye = leftEye.clone();
  leftEye.position.set(-0.16, 1.87, -0.355);
  rightEye.position.set(0.16, 1.87, -0.355);
  const smile = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.025), faceMat);
  smile.position.set(0, 1.68, -0.355);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.92, 0.46), shirt);
  body.position.y = 1.08;
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.035), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  chest.position.set(0, 1.34, -0.25);
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.82, 0.28), skin);
  const rightArm = leftArm.clone();
  leftArm.position.set(-0.67, 1.1, 0);
  rightArm.position.set(0.67, 1.1, 0);
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.78, 0.32), pants);
  const rightLeg = leftLeg.clone();
  leftLeg.position.set(-0.24, 0.38, 0);
  rightLeg.position.set(0.24, 0.38, 0);
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.44), shoeMat);
  const rightShoe = leftShoe.clone();
  leftShoe.position.set(-0.24, 0.02, -0.04);
  rightShoe.position.set(0.24, 0.02, -0.04);
  group.userData.parts = { leftArm, rightArm, leftLeg, rightLeg, head, body, chest, leftShoe, rightShoe };
  group.add(head, hairTop, hairFront, leftEye, rightEye, smile, body, chest, leftArm, rightArm, leftLeg, rightLeg, leftShoe, rightShoe);
  applyAvatarItems(THREE, group, user);
  if (!local) {
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 28px Inter"; ctx.fillText(user.username, 8, 40);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    label.position.y = 2.7;
    label.scale.set(2.4, 0.6, 1);
    group.add(label);
  }
  return group;
}

function applyAvatarItems(THREE, group, user) {
  const equipped = new Set(user.equipped || []);
  const parts = group.userData.parts;
  const addBox = (size, color, position, parent = group) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color }));
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  };
  if (equipped.has("starter-shirt")) {
    parts.chest.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    addBox([0.18, 0.08, 0.04], 0x38aef3, [-0.12, 1.34, -0.28]);
    addBox([0.18, 0.08, 0.04], 0x44db78, [0.12, 1.34, -0.28]);
  }
  if (equipped.has("survivor-vest")) {
    addBox([0.98, 0.62, 0.08], 0x151b24, [0, 1.13, -0.28]);
    addBox([0.1, 0.5, 0.09], 0x44db78, [-0.28, 1.12, -0.34]);
    addBox([0.1, 0.5, 0.09], 0x44db78, [0.28, 1.12, -0.34]);
  }
  if (equipped.has("tycoon-badge-pin")) addBox([0.16, 0.16, 0.05], 0xffcf55, [0.32, 1.28, -0.32]);
  if (equipped.has("cube-cap")) {
    addBox([0.82, 0.16, 0.82], 0x38aef3, [0, 2.23, 0]);
    addBox([0.56, 0.08, 0.35], 0x2368d8, [0, 2.16, -0.54]);
  }
  if (equipped.has("creator-crown")) {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.34, 5), new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.25, roughness: 0.35 }));
    crown.position.y = 2.35;
    crown.rotation.y = Math.PI / 5;
    group.add(crown);
  }
  if (equipped.has("neon-visor")) addBox([0.46, 0.09, 0.04], 0x38aef3, [0, 1.87, -0.39]);
  if (equipped.has("wing-pack")) {
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xdfeeff, metalness: 0.12, roughness: 0.42 });
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 0.58), wingMat);
    const rightWing = leftWing.clone();
    leftWing.position.set(-0.54, 1.18, 0.36);
    rightWing.position.set(0.54, 1.18, 0.36);
    leftWing.rotation.z = -0.36;
    rightWing.rotation.z = 0.36;
    group.add(leftWing, rightWing);
  }
  if (equipped.has("speed-boots")) {
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x315cff, emissive: 0x071c66 });
    parts.leftShoe.material = bootMat;
    parts.rightShoe.material = bootMat;
  }
  if (equipped.has("ban-hammer")) {
    const handle = addBox([0.08, 0.68, 0.08], 0x6d4b2d, [0.12, -0.18, -0.08], parts.rightArm);
    handle.rotation.x = -0.55;
    const head = addBox([0.36, 0.18, 0.18], 0xff575f, [0.12, -0.52, -0.28], parts.rightArm);
    head.rotation.x = -0.55;
  }
}

function createGun(THREE) {
  const gun = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x1c232c, metalness: 0.5, roughness: 0.35 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.15, 12), metal);
  barrel.rotation.x = Math.PI / 2;
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.4), metal);
  stock.position.z = 0.55;
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.16), metal);
  grip.position.set(0, -0.25, 0.35);
  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.26), new THREE.MeshStandardMaterial({ color: 0x0c1118, metalness: 0.4 }));
  sight.position.set(0, 0.15, -0.14);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xff8c00 }));
  flash.position.z = -0.72;
  flash.scale.set(1, 1, 1.8);
  flash.visible = false;
  gun.userData.flash = flash;
  gun.add(barrel, stock, grip, sight, flash);
  return gun;
}

function playShotSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = playShotSound.ctx || new AudioContext();
  playShotSound.ctx = ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(95, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

function playRespawnSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = playRespawnSound.ctx || new AudioContext();
  playRespawnSound.ctx = ctx;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
  [220, 330, 440].forEach((freq, index) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
    osc.connect(gain);
    osc.start(ctx.currentTime + index * 0.08);
    osc.stop(ctx.currentTime + 0.72);
  });
  gain.connect(ctx.destination);
}

function spawnHitBurst(THREE, scene, effects, position) {
  for (let i = 0; i < 8; i++) {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0x8b1016, roughness: 0.6 }));
    drop.position.copy(position).add(new THREE.Vector3(0, 0.65, 0));
    drop.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.08, Math.random() * 0.08, (Math.random() - 0.5) * 0.08);
    drop.userData.life = 28;
    effects.push(drop);
    scene.add(drop);
  }
}

function updateEffects(scene, effects) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i];
    effect.position.add(effect.userData.velocity);
    effect.userData.velocity.y -= 0.004;
    effect.userData.life -= 1;
    if (effect.userData.life <= 0) {
      scene.remove(effect);
      effects.splice(i, 1);
    }
  }
}

function buildTycoonPark(THREE, scene) {
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd8c49c, roughness: 0.8 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf6f7fb, roughness: 0.45 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x9a6a40, roughness: 0.75 });
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, 5), pathMat);
  plaza.position.set(0, 0.04, 5.2);
  scene.add(plaza);
  [[0, 0, 4, 18], [-5, -2.7, 8, 2.2], [4, -2.7, 8, 2.2], [5.8, 1.3, 8, 2.2], [-6, 3.6, 7, 2.2]].forEach(([x, z, w, d]) => {
    const path = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), pathMat);
    path.position.set(x, 0.05, z);
    scene.add(path);
  });

  const gate = new THREE.Group();
  const postGeo = new THREE.BoxGeometry(0.25, 2.4, 0.25);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x315cff });
  [-1.8, 1.8].forEach((x) => {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(x, 1.2, 8.4);
    gate.add(post);
  });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.7, 0.2), new THREE.MeshStandardMaterial({ color: 0xffd166 }));
  sign.position.set(0, 2.35, 8.4);
  gate.add(sign);
  scene.add(gate);

  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 2;
    const radius = i % 2 ? 18 : 15;
    addTree(THREE, scene, Math.cos(angle) * radius, Math.sin(angle) * radius);
  }

  [["Tickets", -3.8, 6.5, 0xff575f], ["Snacks", 3.8, 6.5, 0x44db78], ["Shop", 0, 8.7, 0x38aef3]].forEach(([, x, z, color]) => {
    const stall = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.25, 1.4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    base.position.y = 0.65;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.65, 4), new THREE.MeshStandardMaterial({ color }));
    roof.position.y = 1.6;
    roof.rotation.y = Math.PI / 4;
    stall.add(base, roof);
    stall.position.set(x, 0, z);
    scene.add(stall);
  });

  for (let i = -18; i <= 18; i += 2) {
    [[i, -10.5], [i, 10.5], [-18.5, i / 1.1], [18.5, i / 1.1]].forEach(([x, z]) => {
      const fence = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.12), woodMat);
      fence.position.set(x, 0.3, z);
      if (Math.abs(x) > 18) fence.rotation.y = Math.PI / 2;
      scene.add(fence);
    });
  }

  const rail = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.06, 12, 96), railMat);
  rail.position.set(-6, 0.62, -2.5);
  rail.scale.z = 0.58;
  rail.rotation.x = Math.PI / 2;
  scene.add(rail);
}

function addTree(THREE, scene, x, z) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0x8b5a32 }));
  trunk.position.set(x, 0.55, z);
  const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.5, 9), new THREE.MeshStandardMaterial({ color: 0x2f9e55 }));
  leaves.position.set(x, 1.55, z);
  scene.add(trunk, leaves);
}

function movePlayer(base, player, state) {
  const keys = base.keys;
  const Vector3 = THREE_CACHE.Vector3;
  const speed = keys.shift ? 0.14 : 0.085;
  const awayFromCamera = new Vector3(-Math.sin(base.controls.yaw), 0, -Math.cos(base.controls.yaw)).normalize();
  const right = new Vector3().crossVectors(awayFromCamera, new Vector3(0, 1, 0)).normalize();
  const move = new Vector3();
  if (keys.w) move.add(awayFromCamera);
  if (keys.s) move.sub(awayFromCamera);
  if (keys.d) move.add(right);
  if (keys.a) move.sub(right);
  const moving = move.lengthSq() > 0;
  if (moving) {
    move.normalize();
    player.position.add(move.multiplyScalar(speed));
    const targetYaw = Math.atan2(-move.x, -move.z);
    player.rotation.y = lerpAngle(player.rotation.y, targetYaw, 0.25);
    if (base.controls.cameraFollow === "follow") base.controls.yaw = lerpAngle(base.controls.yaw, targetYaw + Math.PI, 0.04);
  }
  if (keys[" "] && player.position.y <= 0.81) state.vy = 0.18;
  state.vy = (state.vy || 0) - 0.01;
  player.position.y = Math.max(0.8, player.position.y + state.vy);
  if (player.position.y <= 0.8) state.vy = 0;
  animateAvatar(player, moving, player.position.y > 0.82);
}

function updateCamera(camera, player) {
  const controls = runtime.controls;
  controls.distance = controls.smoothZoom ? controls.distance + (controls.targetDistance - controls.distance) * 0.16 : controls.targetDistance;
  const firstPerson = controls.firstPersonZoom && controls.distance <= 1.2;
  player.children.forEach((child) => { child.visible = !firstPerson; });
  if (firstPerson) {
    const eye = player.position.clone().add(new THREE_CACHE.Vector3(0, 1.75, 0));
    const look = new THREE_CACHE.Vector3(
      -Math.sin(controls.yaw) * Math.cos(controls.pitch),
      -Math.sin(controls.pitch),
      -Math.cos(controls.yaw) * Math.cos(controls.pitch)
    );
    camera.position.copy(eye);
    camera.lookAt(eye.clone().add(look));
    return;
  }
  const horizontal = Math.cos(controls.pitch) * controls.distance;
  const offset = new THREE_CACHE.Vector3(
    Math.sin(controls.yaw) * horizontal,
    1.4 + Math.sin(controls.pitch) * controls.distance + 2.2,
    Math.cos(controls.yaw) * horizontal
  );
  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);
}

function animateAvatar(player, moving, jumping) {
  const parts = player.userData.parts;
  if (!parts) return;
  player.userData.walkTime = (player.userData.walkTime || 0) + (moving ? 0.22 : 0.08);
  const swing = moving ? Math.sin(player.userData.walkTime) * 0.62 : 0;
  parts.leftArm.rotation.x = swing;
  parts.rightArm.rotation.x = -swing;
  parts.leftLeg.rotation.x = -swing * 0.75;
  parts.rightLeg.rotation.x = swing * 0.75;
  parts.body.rotation.x = jumping ? -0.12 : moving ? Math.sin(player.userData.walkTime * 2) * 0.035 : 0;
  parts.head.rotation.x = jumping ? 0.12 : 0;
  if (player.userData.heldTool === "gun") {
    parts.leftArm.rotation.x = -1.18 + Math.sin(player.userData.walkTime) * 0.05;
    parts.rightArm.rotation.x = -1.28;
    parts.leftArm.rotation.z = -0.18;
    parts.rightArm.rotation.z = 0.14;
  } else {
    parts.leftArm.rotation.z = 0;
    parts.rightArm.rotation.z = 0;
  }
}

function lerpAngle(current, target, amount) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * amount;
}

function cameraForward(controls) {
  return new THREE_CACHE.Vector3(
    -Math.sin(controls.yaw) * Math.cos(controls.pitch),
    -Math.sin(controls.pitch),
    -Math.cos(controls.yaw) * Math.cos(controls.pitch)
  ).normalize();
}

function distancePointToSegment(point, start, end) {
  const segment = end.clone().sub(start);
  const lengthSq = segment.lengthSq();
  if (!lengthSq) return point.distanceTo(start);
  const t = clamp(point.clone().sub(start).dot(segment) / lengthSq, 0, 1);
  return point.distanceTo(start.clone().add(segment.multiplyScalar(t)));
}

function spawnZombies(THREE, scene, zombies, wave) {
  for (let i = 0; i < wave + 5; i++) {
    const zombie = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.5, 0.7), new THREE.MeshStandardMaterial({ color: 0x5cc85c }));
    let x = -14 + Math.random() * 28;
    let z = -14 + Math.random() * 28;
    if (Math.hypot(x, z) < 8) {
      x += x < 0 ? -8 : 8;
      z += z < 0 ? -8 : 8;
    }
    zombie.position.set(x, 0.75, z);
    zombie.userData.hp = 90 + wave * 20;
    zombies.push(zombie);
    scene.add(zombie);
  }
}

function cleanupDead(THREE, scene, zombies, bullets, state) {
  for (let i = zombies.length - 1; i >= 0; i--) {
    if (zombies[i].userData.hp <= 0) {
      scene.remove(zombies[i]);
      zombies.splice(i, 1);
      state.xp += 10;
      state.cash += 4;
    }
  }
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].userData.dead || bullets[i].position.length() > 42 || bullets[i].userData.life <= 0) {
      scene.remove(bullets[i]);
      bullets.splice(i, 1);
    }
  }
}

function addRide(THREE, scene, rides, x, z, type) {
  const group = new THREE.Group();
  group.position.set(x, 0.08, z);
  group.userData.type = type;
  const color = type === "wheel" ? 0xffcf55 : type === "drop" ? 0xff575f : 0x315cff;
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.12, 32), new THREE.MeshStandardMaterial({ color: 0xd8c49c }));
  pad.position.y = 0.03;
  group.add(pad);
  if (type === "wheel") {
    const wheel = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.06, 12, 48), new THREE.MeshStandardMaterial({ color: 0xf8fbff }));
    ring.rotation.y = Math.PI / 2;
    wheel.add(ring);
    for (let i = 0; i < 8; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 2.7), new THREE.MeshStandardMaterial({ color }));
      spoke.rotation.z = (Math.PI / 8) * i;
      spoke.rotation.y = Math.PI / 2;
      wheel.add(spoke);
    }
    wheel.position.y = 1.7;
    group.userData.spin = wheel;
    group.add(wheel);
  } else if (type === "drop") {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.4, 0.35), new THREE.MeshStandardMaterial({ color: 0x263544 }));
    tower.position.y = 1.75;
    const car = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.7), new THREE.MeshStandardMaterial({ color }));
    car.position.y = 1.1;
    group.userData.car = car;
    group.add(tower, car);
  } else {
    const railMat = new THREE.MeshStandardMaterial({ color: 0xf8fbff });
    const cartMat = new THREE.MeshStandardMaterial({ color });
    const railA = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.055, 10, 48), railMat);
    railA.scale.z = 0.45;
    railA.rotation.x = Math.PI / 2;
    const hill = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.12), railMat);
    hill.position.set(0.15, 0.8, 0);
    hill.rotation.z = -0.45;
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.32), cartMat);
    cart.position.set(1.15, 0.62, 0);
    group.userData.cart = cart;
    group.add(railA, hill, cart);
  }
  const queue = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.35), new THREE.MeshStandardMaterial({ color: 0x2f5bff }));
  queue.position.set(0, 0.09, 1.9);
  group.add(queue);
  scene.add(group);
  rides.push(group);
}

function spawnCustomers(THREE, scene, customers, count) {
  for (let i = 0; i < count; i++) {
    const guest = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.68, 0.28), new THREE.MeshStandardMaterial({ color: [0xffd166, 0x38aef3, 0xff8ab3, 0x44db78][i % 4] }));
    body.position.y = 0.65;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), new THREE.MeshStandardMaterial({ color: 0xf0d0a7 }));
    head.position.y = 1.13;
    guest.add(body, head);
    guest.position.set(-8 + Math.random() * 16, 0, 7 + Math.random() * 3);
    customers.push(guest);
    scene.add(guest);
  }
}

function animateRide(ride) {
  ride.userData.phase = (ride.userData.phase || 0) + 0.025;
  if (ride.userData.spin) ride.userData.spin.rotation.z += 0.025;
  if (ride.userData.car) ride.userData.car.position.y = 1.2 + Math.abs(Math.sin(ride.userData.phase * 2.4)) * 2.2;
  if (ride.userData.cart) {
    ride.userData.cart.position.x = Math.cos(ride.userData.phase * 2) * 1.05;
    ride.userData.cart.position.z = Math.sin(ride.userData.phase * 2) * 0.45;
    ride.userData.cart.position.y = 0.62 + Math.max(0, Math.sin(ride.userData.phase * 2)) * 0.35;
  }
}

function setupGameMenu(base, user, gameId, state, player) {
  document.querySelector("#escButton").onclick = () => toggleGameMenu(true);
  document.querySelector("#resumeGame").onclick = () => toggleGameMenu(false);
  document.querySelectorAll("[data-menu-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-menu-tab]").forEach((tab) => tab.classList.toggle("active", tab === button));
      renderMenuTab(button.dataset.menuTab, base, user, gameId, state);
    });
  });
  document.querySelector("#resetGame").onclick = () => {
    respawnPlayer(state, player, gameId);
    toggleGameMenu(false);
  };
  document.querySelector("#leaveGame").onclick = async () => {
    try {
      const data = await api("/api/progress", { method: "POST", body: JSON.stringify({ gameId, playing: false, progress: "Left server", xp: state.xp || 0, currency: state.cash || 0 }) });
      stopRuntime();
      routeUser(data);
    } catch (error) {
      if (error.data?.moderation) return moderationScreen(error.data.user || currentUser, error.data.moderation);
      goHome();
    }
  };
}

function respawnPlayer(state, player, gameId) {
  if (state.respawning) return;
  state.respawning = true;
  state.paused = true;
  playRespawnSound();
  const spawn = state.spawnPoint || { x: 0, y: 0.8, z: gameId === "coaster-tycoon" ? 5.5 : 0 };
  if (player) {
    player.visible = false;
    player.position.set(spawn.x, spawn.y, spawn.z);
  }
  setTimeout(() => {
    state.hp = 100;
    state.vy = 0;
    state.paused = false;
    state.respawning = false;
    if (player) player.visible = true;
  }, 2000);
}

function renderMenuTab(tab, base, user, gameId, state) {
  const content = document.querySelector("#menuContent");
  if (!content) return;
  if (tab === "people") {
    content.innerHTML = `
      <button class="invite-btn">Invite Friends</button>
      <h2>In this server</h2>
      <div id="peopleList" class="people-list"><div class="person-row">${avatar(user, "tiny")}<div><strong>${escapeHtml(user.username)}</strong><small>@${escapeHtml(user.username)}</small></div><button>Me</button></div></div>
    `;
    return;
  }
  if (tab === "settings") {
    const settings = currentUser.gameSettings || {};
    content.innerHTML = `
      <div class="game-settings-panel">
        <h2>Display & Graphics</h2>
        ${menuSlider("Background transparency", 7, "Transparent", "Opaque")}
        ${menuRow("Fullscreen", "Off")}
        ${menuRow("Graphics Mode", "Manual")}
        ${menuSlider("Graphics Quality", 8, "Low", "High")}
        <h2>View & Controls</h2>
        ${menuSelect("Camera Mode", settings.cameraFollow === "follow" ? "Follow" : "Free")}
        ${menuToggle("Camera Inverted", "cameraInverted", settings.cameraInverted !== false)}
        ${menuRange("Camera Sensitivity", "cameraSensitivity", settings.cameraSensitivity || 1)}
        ${menuToggle("Smooth Zoom", "smoothZoom", settings.smoothZoom !== false)}
        ${menuToggle("First-person Zoom", "firstPersonZoom", settings.firstPersonZoom !== false)}
        <button class="save-menu-settings" id="saveGameSettings">Save Settings</button>
      </div>
    `;
    document.querySelector("#saveGameSettings").addEventListener("click", async () => {
      const payload = {
        cameraSensitivity: Number(document.querySelector("[name='cameraSensitivity']").value),
        cameraInverted: document.querySelector("[name='cameraInverted']").checked,
        smoothZoom: document.querySelector("[name='smoothZoom']").checked,
        firstPersonZoom: document.querySelector("[name='firstPersonZoom']").checked,
        cameraFollow: document.querySelector("[name='cameraFollow']").checked ? "follow" : "free"
      };
      const data = await api("/api/settings/game", { method: "POST", body: JSON.stringify(payload) });
      currentUser = data.user;
      Object.assign(base.controls, {
        sensitivity: payload.cameraSensitivity,
        invertY: payload.cameraInverted,
        smoothZoom: payload.smoothZoom,
        firstPersonZoom: payload.firstPersonZoom,
        cameraFollow: payload.cameraFollow
      });
      document.querySelector("#saveGameSettings").textContent = "Saved";
    });
    return;
  }
  if (tab === "report") {
    content.innerHTML = `
      <form class="report-panel" id="reportForm">
        <div class="segmented"><button type="button" class="active">Text mode</button><button type="button">Highlight mode</button></div>
        <label>Experience or Person?<select name="targetType"><option>Person</option><option>Experience</option></select></label>
        <label>Type Of Abuse?<select name="abuseType" required><option value="">Choose One</option><option>Bullying</option><option>Cheating</option><option>Scam</option><option>Bad language</option></select></label>
        <label>Which Person?<select name="target"><option>${escapeHtml(gameTitle(gameId))}</option>${[user, ...(currentUser.friendProfiles || [])].map((entry) => `<option>${escapeHtml(entry.username)}</option>`).join("")}</select></label>
        <textarea name="details" placeholder="In your own words, help us understand what went wrong." required></textarea>
        <button class="save-menu-settings">Submit</button>
        <div class="message" id="reportMessage"></div>
      </form>
    `;
    document.querySelector("#reportForm").addEventListener("submit", submitReport);
    return;
  }
  content.innerHTML = `<div class="game-settings-panel"><h2>${tab === "captures" ? "Captures" : "Help"}</h2><p>${tab === "captures" ? "Capture tools are ready for screenshots and clips." : "WASD moves your avatar. Hold RMB to lock the mouse and rotate the camera. Wheel zooms into first person."}</p></div>`;
}

function menuRow(label, value) {
  return `<div class="settings-row"><span>${label}</span><button>&lsaquo;</button><strong>${value}</strong><button>&rsaquo;</button></div>`;
}

function menuSelect(label, value) {
  return `<label class="settings-row"><span>${label}</span><button>&lsaquo;</button><strong>${value}</strong><input name="cameraFollow" type="checkbox" ${value === "Follow" ? "checked" : ""} /><button>&rsaquo;</button></label>`;
}

function menuToggle(label, name, checked) {
  return `<label class="settings-row"><span>${label}</span><button>&lsaquo;</button><strong>${checked ? "On" : "Off"}</strong><input name="${name}" type="checkbox" ${checked ? "checked" : ""} /><button>&rsaquo;</button></label>`;
}

function menuRange(label, name, value) {
  return `<label class="settings-row"><span>${label}</span><button>-</button><input name="${name}" type="range" min="0.25" max="2.5" step="0.05" value="${value}" /><strong>${Number(value).toFixed(2)}</strong></label>`;
}

function menuSlider(label, fill, low, high) {
  return `<div class="settings-slider"><span>${label}</span><div>${Array.from({ length: 10 }, (_, i) => `<i class="${i < fill ? "filled" : ""}"></i>`).join("")}</div><small>${low}</small><small>${high}</small></div>`;
}

function toggleGameMenu(show) {
  document.querySelector("#escMenu")?.classList.toggle("hidden", !show);
}

function setupGameChat(base, user, gameId) {
  const panel = document.querySelector("#gameChat");
  const list = document.querySelector("#gameChatMessages");
  const form = document.querySelector("#gameChatForm");
  const room = `game:${gameId}`;
  const load = async () => {
    const data = await api(`/api/chat?room=${encodeURIComponent(room)}`).catch(() => ({ messages: [] }));
    base.chatMessages = data.messages;
    list.innerHTML = data.messages.slice(-8).map((message) => `<div><strong>${escapeHtml(message.username)}</strong> ${escapeHtml(message.text)}</div>`).join("");
    list.scrollTop = list.scrollHeight;
  };
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    const text = input.value.trim();
    if (!text) return;
    try {
      await api("/api/chat", { method: "POST", body: JSON.stringify({ room, text }) });
    } catch (error) {
      if (error.data?.moderation) return moderationScreen(error.data.user || currentUser, error.data.moderation);
      return;
    }
    input.value = "";
    await load();
    panel.classList.remove("hidden");
  });
  panel.addEventListener("click", () => form.querySelector("input").focus());
  runtime.chatInterval = setInterval(load, 1800);
  load();
}

function toggleGameChat(show) {
  const panel = document.querySelector("#gameChat");
  if (!panel) return;
  panel.classList.toggle("hidden", !show);
  if (show) setTimeout(() => panel.querySelector("input")?.focus(), 30);
}

function runThree(base) {
  const animate = () => {
    runtime.frame = requestAnimationFrame(animate);
    if (runtime.tick) runtime.tick();
    runtime.renderer.render(runtime.scene, runtime.camera);
  };
  animate();
}

function stopRuntime() {
  if (runtime?.frame) cancelAnimationFrame(runtime.frame);
  if (runtime?.chatInterval) clearInterval(runtime.chatInterval);
  if (runtime?.pointerLockHandler) document.removeEventListener("pointerlockchange", runtime.pointerLockHandler);
  if (document.pointerLockElement === runtime?.mount) document.exitPointerLock?.();
  if (runtime?.renderer) {
    runtime.renderer.dispose();
    runtime.mount.innerHTML = "";
  }
  runtime = null;
  document.onkeydown = null;
  document.onkeyup = null;
  window.onresize = null;
}

async function renderOtherPlayers(THREE, base, user, gameId, player, state) {
  if (Date.now() < base.pollAt) return;
  base.pollAt = Date.now() + 250;
  const data = await api(`/api/world/${gameId}/state`, {
    method: "POST",
    body: JSON.stringify({ x: player.position.x, y: player.position.y, z: player.position.z, rot: player.rotation.y, hp: state.hp || 100, cash: state.cash || 0 })
  }).catch(() => ({ players: [] }));
  if (data.moderation) {
    if (data.user) currentUser = data.user;
    return moderationScreen(data.user || currentUser, data.moderation);
  }
  const people = document.querySelector("#peopleList");
  if (people) {
    people.innerHTML = data.players.map((entry) => `<div class="person-row">${avatar(entry, "tiny")}<div><strong>${escapeHtml(entry.username)}</strong><small>@${escapeHtml(entry.username)} ${entry.role ? `| ${entry.role}` : ""}</small></div><button>Add Friend</button></div>`).join("");
  }
  const seen = new Set(data.players.map((entry) => entry.id));
  base.otherMeshes.forEach((mesh, id) => {
    if (!seen.has(id)) {
      base.scene.remove(mesh);
      base.otherMeshes.delete(id);
    }
  });
  data.players.filter((entry) => entry.id !== user.id).forEach((entry) => {
    let mesh = base.otherMeshes.get(entry.id);
    if (!mesh) {
      mesh = createAvatarMesh(THREE, entry);
      base.otherMeshes.set(entry.id, mesh);
      base.scene.add(mesh);
      mesh.position.set(entry.worldState.x, entry.worldState.y, entry.worldState.z);
    }
    mesh.userData.targetPosition = new THREE.Vector3(entry.worldState.x, entry.worldState.y, entry.worldState.z);
    mesh.userData.targetRot = entry.worldState.rot;
    mesh.userData.lastWorldUpdate = Date.now();
  });
}

function animateOtherPlayers(base) {
  base.otherMeshes?.forEach((mesh) => {
    if (!mesh.userData.targetPosition) return;
    const before = mesh.position.clone();
    mesh.position.lerp(mesh.userData.targetPosition, 0.28);
    mesh.rotation.y = lerpAngle(mesh.rotation.y, mesh.userData.targetRot || 0, 0.28);
    const moving = mesh.position.distanceTo(before) > 0.004;
    animateAvatar(mesh, moving, mesh.position.y > 0.82);
  });
}

function avatar(user, size) {
  return `<div class="avatar avatar-${size}">${avatarInner(user)}</div>`;
}

function avatarInner(user) {
  if (user.avatar) return `<img src="${user.avatar}" alt="">`;
  return escapeHtml((user.username || "C")[0].toUpperCase());
}

function option(label, values) {
  return `<option value="">${label}</option>${values.map((value) => `<option value="${value}">${value}</option>`).join("")}`;
}

function relationshipText(value) {
  return { self: "This is you", friends: "Friends", request_sent: "Request Sent", request_received: "Respond in notifications", none: "Add Friend" }[value] || "Add Friend";
}

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Night";
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

function maskEmail(email) {
  return String(email || "").replace(/^(.).+(@.+)$/, "$1******$2");
}

function gameIdFromTitle(title) {
  return gameCatalog.find((game) => game.title === title)?.id || "cubixia-survival";
}

function gameTitle(gameId) {
  return gameCatalog.find((game) => game.id === gameId)?.title || "CUBIXIA Game";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

api("/api/me")
  .then((data) => routeUser(data))
  .catch(() => guestHome());
