/* FizzBite — marketing site interactions */
(() => {
  "use strict";

  // ---- Config -------------------------------------------------------------
  // Where demo requests go. If FORM_ENDPOINT is set (e.g. a Formspree URL),
  // the form POSTs to it. Otherwise it falls back to opening an email.
  const FORM_ENDPOINT = "";
  const CONTACT_EMAIL = "hello@fizzbite.shop";
  const CURRENCY = "£";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Demo venues shown in the phone mockups ----------------------------
  const MENUS = {
    cafe: {
      tagline: "Order ahead · Ready in 5 min",
      tabs: ["Coffee", "Tea", "Bakery", "Brunch"],
      items: [
        { emoji: "☕", name: "Flat White", desc: "Double shot, oat or whole", price: 3.4 },
        { emoji: "🥐", name: "Almond Croissant", desc: "Baked this morning", price: 3.2 },
        { emoji: "🧋", name: "Iced Latte", desc: "Add vanilla or caramel", price: 3.8 },
        { emoji: "🥪", name: "Toasted Sourdough", desc: "Ham, cheddar & pickle", price: 6.5 },
      ],
    },
    shop: {
      tagline: "Click & collect · Open till 7pm",
      tabs: ["Deli", "Hot food", "Bakes", "Pantry"],
      items: [
        { emoji: "🥖", name: "Deli Baguette", desc: "Build your own, 6 fillings", price: 5.9 },
        { emoji: "🍲", name: "Soup of the Day", desc: "With crusty bread", price: 4.5 },
        { emoji: "🧀", name: "Cheese Board Box", desc: "Three local cheeses", price: 12.0 },
        { emoji: "🍰", name: "Carrot Cake Slice", desc: "Cream cheese frosting", price: 3.6 },
      ],
    },
    restaurant: {
      tagline: "Table 12 · Order & pay here",
      tabs: ["Starters", "Mains", "Sides", "Drinks"],
      items: [
        { emoji: "🍝", name: "Nduja Rigatoni", desc: "Tomato, burrata, basil", price: 15.5 },
        { emoji: "🍔", name: "House Smash Burger", desc: "Aged beef, fries", price: 14.0 },
        { emoji: "🥗", name: "Caesar Salad", desc: "Add chicken +3", price: 11.0 },
        { emoji: "🍹", name: "Blood Orange Spritz", desc: "Alcohol-free available", price: 8.5 },
      ],
    },
  };

  const HERO_BRANDS = [
    { name: "Bean & Bloom", type: "cafe", color: "#ff5a36" },
    { name: "Harvest Deli", type: "shop", color: "#1f7a5c" },
    { name: "Nonna's Kitchen", type: "restaurant", color: "#2d4bd8" },
  ];

  // ---- Helpers ------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const money = (n) => CURRENCY + n.toFixed(2);

  const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Pick black or white text for legibility on a given brand colour.
  function textOn(hex) {
    const h = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.4 ? "#1d1512" : "#ffffff";
  }

  const initials = (name) =>
    name.trim().split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "FB";

  // ---- Phone renderer -----------------------------------------------------
  function renderPhone(el, brand, { animate = true } = {}) {
    const menu = MENUS[brand.type];
    const name = brand.name.trim() || "Your Business";

    el.style.setProperty("--b", brand.color);
    el.style.setProperty("--on-b", textOn(brand.color));

    el.innerHTML = `
      <div class="screen">
        <div class="app-bar">
          <div class="app-logo">${escapeHtml(initials(name))}</div>
          <div class="app-title">
            <strong>${escapeHtml(name)}</strong>
            <small>${menu.tagline}</small>
          </div>
        </div>
        <div class="app-tabs">
          ${menu.tabs.map((t, i) => `<span class="${i === 0 ? "active" : ""}">${t}</span>`).join("")}
        </div>
        <ul class="app-items">
          ${menu.items.map((it) => `
            <li>
              <span class="thumb" aria-hidden="true">${it.emoji}</span>
              <div class="item-meta"><b>${it.name}</b><small>${it.desc}</small></div>
              <div class="item-side">
                <span class="item-price">${money(it.price)}</span>
                <button type="button" class="add" data-price="${it.price}" aria-label="Add ${it.name}">+</button>
              </div>
            </li>`).join("")}
        </ul>
        <div class="app-cart">
          <span><span class="count">0</span>View basket</span>
          <span class="total">${money(0)}</span>
        </div>
      </div>`;

    if (animate && !reduceMotion) $(".screen", el).classList.add("swap");
  }

  // Basket interaction inside any phone mockup
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".phone .add");
    if (!btn) return;
    const screen = btn.closest(".screen");
    const cart = $(".app-cart", screen);
    const count = $(".count", cart);
    const total = $(".total", cart);
    count.textContent = Number(count.textContent) + 1;
    screen.dataset.total = (Number(screen.dataset.total || 0) + Number(btn.dataset.price)).toFixed(2);
    total.textContent = money(Number(screen.dataset.total));
    cart.classList.remove("bump");
    void cart.offsetWidth; // restart animation
    cart.classList.add("bump");
  });

  // ---- Hero carousel ------------------------------------------------------
  const heroPhone = $("#hero-phone");
  const heroDots = $("#hero-dots");
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(i) {
    heroIndex = (i + HERO_BRANDS.length) % HERO_BRANDS.length;
    renderPhone(heroPhone, HERO_BRANDS[heroIndex]);
    $$("button", heroDots).forEach((d, j) => d.setAttribute("aria-selected", String(j === heroIndex)));
  }

  function startHero() {
    if (reduceMotion) return;
    stopHero();
    heroTimer = setInterval(() => showHero(heroIndex + 1), 4000);
  }
  const stopHero = () => clearInterval(heroTimer);

  HERO_BRANDS.forEach((b, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", b.name);
    dot.style.setProperty("--dot", b.color);
    dot.addEventListener("click", () => { showHero(i); startHero(); });
    heroDots.appendChild(dot);
  });

  heroPhone.addEventListener("mouseenter", stopHero);
  heroPhone.addEventListener("mouseleave", startHero);
  heroPhone.addEventListener("focusin", stopHero);
  heroPhone.addEventListener("focusout", startHero);

  showHero(0);
  startHero();

  // ---- "Make it yours" builder --------------------------------------------
  const builderPhone = $("#builder-phone");
  const nameInput = $("#b-name");
  const colorInput = $("#b-color");
  const swatches = $$("#b-swatches .swatch[data-color]");
  const builder = { name: "", type: "cafe", color: "#ff5a36" };

  function updateBuilder(animate = false) {
    renderPhone(builderPhone, builder, { animate });
    swatches.forEach((s) => s.setAttribute("aria-pressed", String(s.dataset.color === builder.color)));
  }

  nameInput.addEventListener("input", () => { builder.name = nameInput.value; updateBuilder(); });

  $$('input[name="b-type"]').forEach((r) =>
    r.addEventListener("change", () => { builder.type = r.value; updateBuilder(true); })
  );

  swatches.forEach((s) =>
    s.addEventListener("click", () => {
      builder.color = s.dataset.color;
      colorInput.value = builder.color;
      updateBuilder();
    })
  );

  colorInput.addEventListener("input", () => { builder.color = colorInput.value; updateBuilder(); });

  updateBuilder();

  // ---- Mobile nav -----------------------------------------------------------
  const toggle = $(".nav-toggle");
  const links = $("#nav-links");

  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("open", open);
  }
  toggle.addEventListener("click", () => setNav(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  // Header border once scrolled
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Pricing buttons pre-fill the contact form --------------------------
  const planField = $("#contact-plan");
  $$("[data-plan]").forEach((a) => a.addEventListener("click", () => { planField.value = a.dataset.plan; }));

  // ---- Contact form ---------------------------------------------------------
  const form = $("#contact-form");
  const status = $("#form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    let firstInvalid = null;
    $$("input[required]", form).forEach((input) => {
      const ok = input.checkValidity() && input.value.trim() !== "";
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      status.classList.add("err");
      status.textContent = "Please fill in your name, business and a valid email.";
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));

    if (FORM_ENDPOINT) {
      const submit = $("button[type=submit]", form);
      submit.disabled = true;
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        status.classList.add("ok");
        status.textContent = "Thanks! We'll be in touch within one working day.";
      } catch {
        status.classList.add("err");
        status.textContent = `Something went wrong. Please email us at ${CONTACT_EMAIL}.`;
      } finally {
        submit.disabled = false;
      }
      return;
    }

    const subject = `Demo request: ${data.business}`;
    const lines = [
      `Name: ${data.name}`,
      `Business: ${data.business}`,
      `Email: ${data.email}`,
      `Venue type: ${data.venue}`,
    ];
    if (data.plan) lines.push(`Interested in: ${data.plan} plan`);
    if (data.message) lines.push("", data.message);
    const body = lines.join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.classList.add("ok");
    status.textContent = "Opening your email app to send the request…";
  });

  $$("input[required]", form).forEach((input) =>
    input.addEventListener("input", () => input.removeAttribute("aria-invalid"))
  );

  // ---- Reveal on scroll ----------------------------------------------------
  if ("IntersectionObserver" in window && !reduceMotion) {
    const targets = $$(".step, .feature, .audience, .plan, .faq details, .section-head");
    targets.forEach((t) => t.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -60px 0px" });
    targets.forEach((t) => io.observe(t));
  }

  $("#year").textContent = new Date().getFullYear();
})();
