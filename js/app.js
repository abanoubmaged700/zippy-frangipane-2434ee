/* ============================================================
   app.js — منطق الموقع (بدون مكتبات ولا Backend)
   يقرأ البيانات من config.js ونصوص الواجهة من i18n.js
   ============================================================ */
(function () {
  "use strict";

  var R = window.RESTAURANT;
  var D = window.I18N;
  var LANGS = ["en", "de", "ar"];
  var LOCALES = { en: "en-GB", de: "de-DE", ar: "ar-EG-u-nu-latn" };
  var state = { lang: "en", cat: "all", lastReservation: null, galleryIndex: 0, notReady: false, readiness: null };
  function showDemo() { return R.demoMode || state.notReady; }

  /* ---------- helpers ---------- */
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  function t(key, vars) {
    var s = (D[state.lang] && D[state.lang][key]) || D.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function tr(obj) { return obj ? (obj[state.lang] || obj.en || "") : ""; }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function safeStore(op, key, val) {
    try { if (op === "get") return window.localStorage.getItem(key); window.localStorage.setItem(key, val); } catch (e) { return null; }
    return null;
  }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var waNumber = /^\d{8,15}$/.test(String(R.whatsappNumber || "").replace(/\D/g, "")) ? String(R.whatsappNumber).replace(/\D/g, "") : "";

  /* ---------- language ---------- */
  function applyStatic() {
    $$("[data-i18n]").forEach(function (n) { n.textContent = t(n.getAttribute("data-i18n")); });
    $$("[data-i18n-attr]").forEach(function (n) {
      n.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":"); if (p.length === 2) n.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    document.title = t("meta.title");
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", t("meta.desc"));
    var ot = $('meta[property="og:title"]'); if (ot) ot.setAttribute("content", t("meta.title"));
    var od = $('meta[property="og:description"]'); if (od) od.setAttribute("content", t("meta.desc"));
  }

  function setLang(lang, persist) {
    if (LANGS.indexOf(lang) < 0) lang = "en";
    state.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    if (persist) safeStore("set", "ct_lang", lang);
    $$(".lang-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    applyStatic();
    renderAll();
  }

  /* ---------- rendering ---------- */
  function fmtPrice(n) {
    var num = new Intl.NumberFormat(LOCALES[state.lang], { maximumFractionDigits: 0 }).format(n);
    if (state.lang === "ar") return num + " ج.م";
    if (state.lang === "de") return num + " EGP";
    return "EGP " + num;
  }

  function renderFilters() {
    var box = $("#menuFilters"); box.textContent = "";
    var cats = [{ id: "all", label: { en: D.en["menu.all"], de: D.de["menu.all"], ar: D.ar["menu.all"] } }].concat(R.menu.categories);
    cats.forEach(function (c) {
      var b = el("button", { type: "button", class: "chip", "data-cat": c.id, "aria-pressed": String(state.cat === c.id), text: tr(c.label) });
      b.addEventListener("click", function () { state.cat = c.id; renderFilters(); renderMenu(); });
      box.appendChild(b);
    });
  }

  function renderMenu() {
    var grid = $("#menuGrid"); grid.textContent = "";
    var items = R.menu.items.filter(function (i) { return state.cat === "all" || i.cat === state.cat; });
    if (!items.length) { grid.appendChild(el("p", { text: t("menu.empty") })); return; }
    items.forEach(function (i) {
      var meta = el("div", { class: "dish-meta" });
      (i.dietary || []).forEach(function (d) { meta.appendChild(el("abbr", { class: "tag", title: t("diet." + d), text: d })); });
      if (showDemo()) meta.appendChild(el("span", { class: "tag tag-sample", text: t("menu.sample") }));
      var top = el("div", { class: "dish-top" }, [el("h3", { text: tr(i.name) }), el("span", { class: "price", text: fmtPrice(i.price) })]);
      grid.appendChild(el("article", { class: "dish" }, [top, el("p", { text: tr(i.desc) }), meta]));
    });
  }

  var slotSvg = '<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true" focusable="false"><rect x="6" y="9" width="36" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="17" cy="20" r="3.5" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M8 35l10-9 7 6 6-5 9 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>';
  function slotNode(i) {
    var s = el("div", { class: "g-slot" });
    s.innerHTML = slotSvg;
    s.appendChild(el("span", { text: t("gallery.slot") + " " + (i + 1) }));
    return s;
  }

  function renderGallery() {
    var g = $("#galleryGrid"); g.textContent = "";
    R.images.gallery.forEach(function (im, i) {
      var inner = im.src
        ? el("img", { src: im.src, alt: "", loading: "lazy", decoding: "async" })
        : slotNode(i);
      var b = el("button", { type: "button", class: "g-item", "aria-label": t("gallery.open") + ": " + tr(im.alt) }, [inner]);
      b.addEventListener("click", function () { openLightbox(i); });
      g.appendChild(b);
    });
  }

  function renderReviews() {
    var box = $("#reviewsBox"); box.textContent = "";
    var allowed = (R.reviews || []).filter(function (rv) { return rv && rv.permission === true && rv.source && tr(rv.text); });
    if (allowed.length) {
      allowed.forEach(function (rv) {
        box.appendChild(el("figure", { class: "review-placeholder" }, [el("blockquote", { text: tr(rv.text) }), el("figcaption", { text: [rv.author, rv.source].filter(Boolean).join(" · ") })]));
      });
      return;
    }
    box.appendChild(el("div", { class: "review-placeholder" }, [el("h3", { text: t("rev.placeholder.t") }), el("p", { text: t("rev.placeholder.d") })]));
  }

  function setLinkOrNotSet(node, value, href, label) {
    node.textContent = "";
    if (value) node.appendChild(el("a", { class: "link", href: href, text: label || value }));
    else node.appendChild(el("span", { class: "not-set", text: t("contact.notSet") }));
  }

  function renderContact() {
    var c = R.contact;
    $("#cAddress").textContent = tr(c.address);
    var map = $("#cMap"); map.setAttribute("href", c.mapsUrl || "#");
    $("#cHoursNote").textContent = showDemo() ? tr(R.hours.note) : "";
    var hours = $("#cHours"); hours.textContent = "";
    R.hours.rows.forEach(function (r) {
      hours.appendChild(el("div", {}, [el("dt", { text: tr(r.days) }), el("dd", { text: r.time })]));
    });
    setLinkOrNotSet($("#cPhone"), c.phone, "tel:" + String(c.phone || "").replace(/[^\d+]/g, ""), c.phone);
    var wa = $("#cWhatsapp"); wa.textContent = "";
    if (waNumber) wa.appendChild(el("a", { class: "link", href: "https://wa.me/" + waNumber, target: "_blank", rel: "noopener noreferrer", text: "+" + waNumber }));
    else { wa.appendChild(el("span", { class: "not-set", text: t("contact.notSet") })); wa.appendChild(document.createTextNode(" ")); wa.appendChild(el("a", { class: "link", href: "#reservations", text: t("contact.waAction") })); }
    setLinkOrNotSet($("#cEmail"), c.email, "mailto:" + c.email, c.email);
    var soc = $("#cSocial"); soc.textContent = "";
    var any = false;
    ["facebook", "instagram", "tiktok"].forEach(function (k) {
      if (c.social && c.social[k]) { any = true; soc.appendChild(el("li", {}, [el("a", { href: c.social[k], target: "_blank", rel: "noopener noreferrer", text: t("social." + k) })])); }
    });
    $("#cSocialWrap").hidden = !any;
  }

  function renderTimeOptions() {
    var sel = $("#fTime"); var prev = sel.value; sel.textContent = "";
    sel.appendChild(el("option", { value: "", text: t("res.timePick") }));
    R.hours.slots.forEach(function (s) { sel.appendChild(el("option", { value: s, text: s })); });
    if (prev) sel.value = prev;
  }

  function renderBrand() {
    $("#brandName").textContent = R.name; $("#footerBrand").textContent = R.name; $("#footerName").textContent = R.name;
    $(".brand").setAttribute("aria-label", R.name);
    var credit = $("#credit");
    credit.textContent = tr(showDemo() && R.agency.labelDemo ? R.agency.labelDemo : R.agency.label);
    if (R.agency.url) credit.setAttribute("href", R.agency.url); else credit.removeAttribute("href");
    $("#demoBanner").hidden = !showDemo(); $("#footerDemo").hidden = !showDemo(); $("#demoFormNote").hidden = !showDemo();
    renderSetupBar();
    $("#year").textContent = String(new Date().getFullYear());
    var bg = $("#heroBg"); if (R.images.hero) bg.style.backgroundImage = "url('" + R.images.hero + "')";
  }

  function renderSetupBar() {
    var bar = $("#setupBar"), r = state.readiness;
    if (!state.notReady || !r) { bar.hidden = true; return; }
    bar.textContent = "";
    bar.appendChild(el("p", { text: t("setup.title"), style: "margin:0" }));
    var ul = el("ul");
    r.errors.forEach(function (e) { ul.appendChild(el("li", { text: "• " + e, lang: "en", dir: "ltr" })); });
    bar.appendChild(ul); bar.hidden = false;
  }

  function renderAll() {
    renderBrand(); renderFilters(); renderMenu(); renderGallery(); renderReviews(); renderContact(); renderTimeOptions();
    if (state.lastReservation) showPreview(state.lastReservation);
    if (!$("#lightbox").open) return;
    renderLightbox();
  }

  /* ---------- header / nav ---------- */
  function initNav() {
    var header = $(".site-header"), nav = $("#mainNav"), toggle = $("#navToggle");
    function close() { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("scroll", function () { header.classList.toggle("is-scrolled", window.scrollY > 8); }, { passive: true });
    // تمييز القسم الحالي
    if ("IntersectionObserver" in window) {
      var links = {}; $$("a[href^='#']", nav).forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && links[en.target.id]) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove("is-active"); links[k].removeAttribute("aria-current"); });
            links[en.target.id].classList.add("is-active"); links[en.target.id].setAttribute("aria-current", "true");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) obs.observe(s); });
    }
    $$(".lang-btn").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-lang"), true); }); });
  }

  /* ---------- lightbox ---------- */
  function renderLightbox() {
    var i = state.galleryIndex, im = R.images.gallery[i], fig = $("#lbFigure");
    fig.textContent = "";
    fig.appendChild(im.src ? el("img", { src: im.src, alt: tr(im.alt) }) : slotNode(i));
    fig.appendChild(el("figcaption", { text: tr(im.alt) + "  (" + (i + 1) + "/" + R.images.gallery.length + ")" }));
  }
  function openLightbox(i) {
    state.galleryIndex = i; renderLightbox();
    var dlg = $("#lightbox");
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function stepLightbox(dir) {
    var n = R.images.gallery.length; state.galleryIndex = (state.galleryIndex + dir + n) % n; renderLightbox();
  }
  function initLightbox() {
    var dlg = $("#lightbox");
    $("#lbClose").addEventListener("click", function () { dlg.close(); });
    $("#lbPrev").addEventListener("click", function () { stepLightbox(-1); });
    $("#lbNext").addEventListener("click", function () { stepLightbox(1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      var rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowRight") stepLightbox(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") stepLightbox(rtl ? 1 : -1);
    });
  }

  /* ---------- reservation ---------- */
  function todayISO() {
    var d = new Date(); var m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function clean(s, max) { return String(s || "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
  function setErr(id, inputId, msg) {
    var p = $("#" + id), i = $("#" + inputId);
    p.textContent = msg || "";
    if (i) { if (msg) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid"); }
    return !msg;
  }

  function validate() {
    var name = clean($("#fName").value, 80);
    var phoneRaw = $("#fPhone").value.replace(/[\s\-().]/g, "");
    var date = $("#fDate").value, time = $("#fTime").value;
    var guests = Number($("#fGuests").value);
    var max = R.maxGuests || 30;
    var ok = true, first = null;
    function mark(valid, inputId) { if (!valid) { ok = false; if (!first) first = $("#" + inputId); } }

    var nameOk = name.length >= 2 && /\p{L}/u.test(name);
    mark(setErr("eName", "fName", nameOk ? "" : t("res.err.name")), "fName");
    var phoneOk = /^\+?\d{8,15}$/.test(phoneRaw);
    mark(setErr("ePhone", "fPhone", phoneOk ? "" : t("res.err.phone")), "fPhone");
    var dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= todayISO();
    mark(setErr("eDate", "fDate", dateOk ? "" : t("res.err.date")), "fDate");
    var timeOk = R.hours.slots.indexOf(time) >= 0, timeMsg = timeOk ? "" : t("res.err.time");
    if (timeOk && date === todayISO()) {
      var now = new Date(), hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      if (time <= hm) { timeOk = false; timeMsg = t("res.err.timePast"); }
    }
    mark(setErr("eTime", "fTime", timeMsg), "fTime");
    var guestsOk = Number.isInteger(guests) && guests >= 1 && guests <= max;
    mark(setErr("eGuests", "fGuests", guestsOk ? "" : t("res.err.guests", { max: max })), "fGuests");

    $("#formStatus").textContent = ok ? "" : t("res.fix");
    if (!ok && first) first.focus();
    return ok ? { name: name, phone: phoneRaw, date: date, time: time, guests: guests, notes: clean($("#fNotes").value, 300) } : null;
  }

  function formatDate(iso) {
    var p = iso.split("-"); var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12);
    try { return new Intl.DateTimeFormat(LOCALES[state.lang], { dateStyle: "full" }).format(d); } catch (e) { return iso; }
  }

  function buildMessage(r) {
    var lines = [
      t("res.msg.title"), "",
      t("res.msg.restaurant") + ": " + R.name,
      t("res.msg.name") + ": " + r.name,
      t("res.msg.phone") + ": " + r.phone,
      t("res.msg.date") + ": " + formatDate(r.date),
      t("res.msg.time") + ": " + r.time,
      t("res.msg.guests") + ": " + r.guests
    ];
    if (r.notes) lines.push(t("res.msg.notes") + ": " + r.notes);
    lines.push("", t("res.msg.footer"));
    return lines.join("\n");
  }

  function showPreview(r) {
    var msg = buildMessage(r);
    $("#preview").hidden = false;
    $("#previewText").textContent = msg;
    var send = $("#sendBtn"), note = $("#previewNote");
    if (waNumber) {
      send.hidden = false; send.setAttribute("href", "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(msg));
      note.hidden = true; note.textContent = "";
    } else {
      send.hidden = true; send.setAttribute("href", "#");
      note.hidden = false; note.textContent = t("res.demoNotConfigured");
    }
  }

  function copyText(text) {
    var status = $("#copyStatus");
    function ok() { status.textContent = t("res.copied"); showToast(t("res.copied")); }
    function fail() { status.textContent = t("res.copyFail"); showToast(t("res.copyFail")); }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(ok, fail); return; }
    try {
      var ta = el("textarea", { "aria-hidden": "true", style: "position:fixed;opacity:0;top:0" }); ta.value = text;
      document.body.appendChild(ta); ta.select(); var done = document.execCommand("copy"); document.body.removeChild(ta);
      done ? ok() : fail();
    } catch (e) { fail(); }
  }

  var toastTimer;
  function showToast(msg) {
    var tt = $("#toast"); tt.textContent = msg; tt.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { tt.hidden = true; }, 4500);
  }

  function initReservation() {
    var form = $("#resForm"), date = $("#fDate");
    date.min = todayISO();
    $("#fGuests").max = String(R.maxGuests || 30);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = validate(); if (!r) return;
      state.lastReservation = r; showPreview(r);
      $("#preview").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
    ["fName", "fPhone", "fDate", "fTime", "fGuests"].forEach(function (id) {
      $("#" + id).addEventListener("input", function () { var e = $("#e" + id.slice(1)); if (e) { e.textContent = ""; this.removeAttribute("aria-invalid"); } });
    });
    $("#copyBtn").addEventListener("click", function () { copyText($("#previewText").textContent); });

    var float = $("#waFloat");
    if (waNumber) {
      float.setAttribute("href", "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(R.name)); float.setAttribute("target", "_blank"); float.setAttribute("rel", "noopener noreferrer");
    } else {
      float.addEventListener("click", function () { showToast(t("wa.demoToast")); });
    }
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var targets = $$(".section-head, .features li, .contact-card, .res-form, .about-copy");
    targets.forEach(function (n) { n.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    targets.forEach(function (n) { io.observe(n); });
  }

  /* ---------- init ---------- */
  function init() {
    if (!R.demoMode && typeof window.checkRestaurantReadiness === "function") {
      state.readiness = window.checkRestaurantReadiness(R);
      state.notReady = state.readiness.errors.length > 0;
      state.readiness.errors.forEach(function (e) { console.error("[readiness] " + e); });
      state.readiness.warnings.forEach(function (w) { console.warn("[readiness] " + w); });
    }
    var saved = safeStore("get", "ct_lang");
    initNav(); initLightbox(); initReservation();
    setLang(LANGS.indexOf(saved) >= 0 ? saved : "en", false);
    initReveal();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
