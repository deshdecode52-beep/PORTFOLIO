
(() => {
  const nav = document.getElementById("site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const year = document.getElementById("year");
  const filter = document.getElementById("project-filter");
  const search = document.getElementById("project-search");
  const cards = [...document.querySelectorAll(".project-card")];
  const projectCount = document.getElementById("project-count");
  const noProjects = document.getElementById("no-projects");
  const themeToggle = document.getElementById("theme-toggle");

  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // Mobile navigation
  function setMenu(open) {
    if (!nav || !navToggle) return;

    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  navToggle?.addEventListener("click", () => {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // Live project search and category filtering
  function applyProjectFilters() {
    const query = (search?.value || "").trim().toLowerCase();
    const category = filter?.value || "all";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = (
        card.innerText + " " +
        (card.dataset.search || "") + " " +
        (card.dataset.category || "")
      ).toLowerCase();

      const matchesQuery = !query || haystack.includes(query);
      const categories = (card.dataset.category || "").split(/\s+/);
      const matchesCategory =
        category === "all" || categories.includes(category);

      const show = matchesQuery && matchesCategory;

      card.hidden = !show;

      if (show) visible++;
    });

    if (projectCount) {
      projectCount.textContent = `Showing ${visible} of ${cards.length} projects`;
    }

    if (noProjects) {
      noProjects.hidden = visible !== 0;
    }
  }

  search?.addEventListener("input", applyProjectFilters);
  filter?.addEventListener("change", applyProjectFilters);
  applyProjectFilters();

  // Light/dark mode
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;

    const dark = theme === "dark";

    if (themeToggle) {
      themeToggle.innerHTML = dark
        ? "☀️ <span>Light mode</span>"
        : "🌙 <span>Dark mode</span>";

      themeToggle.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#0c1420" : "#f4f8fc");

    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch (_) {
      // Theme still works when storage is unavailable.
    }
  }

  let initialTheme = "light";

  try {
    const saved = localStorage.getItem("portfolio-theme");

    if (saved === "light" || saved === "dark") {
      initialTheme = saved;
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      initialTheme = "dark";
    }
  } catch (_) { }

  setTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
  });

  // Active navigation section
  if ("IntersectionObserver" in window) {
    const sections = ["about", "skills", "projects", "contact", "chatbot"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }

  // Portfolio chatbot
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const chatSend = document.getElementById("chat-send");

  const conversation = [];

  function addMessage(text, role, isError = false) {
    const bubble = document.createElement("div");

    bubble.className =
      `chat-message ${role === "user" ? "user-message" : "assistant-message"}`;

    if (isError) {
      bubble.classList.add("chat-error");
    }

    // textContent prevents response text from being interpreted as HTML.
    bubble.textContent = text;

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return bubble;
  }

  async function sendMessage(text) {
    const clean = text.trim();

    if (!clean || chatInput.disabled) return;

    addMessage(clean, "user");

    chatInput.value = "";
    chatInput.disabled = true;
    chatSend.disabled = true;
    chatSend.textContent = "Thinking…";

    const pending = addMessage("Thinking…", "assistant");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history: conversation.slice(-8)
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || `The assistant request failed (${response.status}).`
        );
      }

      const answer =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : "I couldn't create a response. Please try asking another question.";

      pending.textContent = answer;

      conversation.push(
        { role: "user", content: clean },
        { role: "assistant", content: answer }
      );

      // Keep only the latest conversation turns.
      if (conversation.length > 8) {
        conversation.splice(0, conversation.length - 8);
      }
    } catch (error) {
      pending.textContent =
        `Sorry, I couldn't reach the portfolio assistant. ${error.message || "Please try again shortly."
        }`;

      pending.classList.add("chat-error");
    } finally {
      chatInput.disabled = false;
      chatSend.disabled = false;
      chatSend.textContent = "Send ↗";
      chatInput.focus();
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
  });

  document.querySelectorAll(".suggestion").forEach((button) => {
    button.addEventListener("click", () => sendMessage(button.textContent));
  });
})();

