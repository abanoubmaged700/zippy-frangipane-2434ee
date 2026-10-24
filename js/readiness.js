/* ============================================================
   readiness.js — فحص جاهزية بيانات المطعم قبل التسليم
   يعمل في المتصفح (app.js) وفي الطرفية (tools/check_restaurant_site.js).
   الهدف: لا تظهر بيانات Sample أبدًا كأنها بيانات مطعم حقيقي.
   errors   = يمنع التسليم (يظهر شريط أحمر لو demoMode = false)
   warnings = راجعها مع العميل
   ============================================================ */
(function (root) {
  "use strict";

  // قيم القالب الافتراضية. وجود أي منها في موقع عميل = بيانات لم تُستبدل.
  var TEMPLATE = {
    name: "Coastal Table",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hurghada",
    heroImage: "assets/img/hero.jpg",
    dishNames: ["Hummus & Warm Bread", "Burrata & Tomato", "Calamari Fritti", "Mediterranean Pasta", "Herb-Grilled Chicken", "Grilled Beef Fillet", "Grilled Sea Bass", "Garlic Butter Prawns", "Seafood Platter for Two", "Mango Cheesecake", "Warm Chocolate Fondant", "Fresh Lemon & Mint", "Specialty Coffee"]
  };
  var SAMPLE_WORDS = /\b(sample|demo|beispiel)\b|تجريبي|مثال|placeholder/i;

  function texts(obj) { return obj && typeof obj === "object" ? Object.keys(obj).map(function (k) { return String(obj[k] || ""); }) : [String(obj || "")]; }

  function check(R) {
    var errors = [], warnings = [];
    if (!R || typeof R !== "object") return { errors: ["config.js did not load (window.RESTAURANT is missing)."], warnings: [] };

    // 1) الاسم
    if (!R.name || !String(R.name).trim()) errors.push("name is empty.");
    else if (R.name === TEMPLATE.name) errors.push('name is still the template name "Coastal Table".');

    // 2) واتساب
    var wa = String(R.whatsappNumber || "").replace(/\D/g, "");
    if (!wa) errors.push("whatsappNumber is empty: reservation requests cannot be sent.");
    else if (!/^\d{8,15}$/.test(wa)) errors.push("whatsappNumber must be 8–15 digits in international format without +.");
    else if (/^(\d)\1+$/.test(wa.slice(2)) || /0{6,}/.test(wa)) errors.push("whatsappNumber looks like a placeholder (" + wa + ").");

    // 3) التواصل والعنوان
    var c = R.contact || {};
    if (texts(c.address).some(function (s) { return !s.trim() || SAMPLE_WORDS.test(s); })) errors.push("contact.address is empty or still says Sample in at least one language.");
    if (!c.mapsUrl || c.mapsUrl === TEMPLATE.mapsUrl) errors.push("contact.mapsUrl is still the generic Hurghada search, not the restaurant's own map link.");
    if (c.phone && /0{6,}|\b(\d)\1{7,}\b/.test(String(c.phone).replace(/\D/g, ""))) errors.push("contact.phone looks like a placeholder.");
    if (c.verified !== true) errors.push("contact.verified is not true: confirm address, phone and map link with the restaurant.");

    // 4) المواعيد
    var h = R.hours || {};
    if (h.verified !== true) errors.push("hours.verified is not true: confirm opening hours and reservation slots with the restaurant.");
    if (!h.slots || !h.slots.length) errors.push("hours.slots is empty: the reservation form has no times.");

    // 5) المنيو
    var m = R.menu || {}, items = m.items || [];
    if (!items.length) errors.push("menu.items is empty.");
    var leftover = items.filter(function (i) { return i && i.name && TEMPLATE.dishNames.indexOf(i.name.en) >= 0; }).length;
    if (leftover) errors.push(leftover + " menu item(s) are still template sample dishes.");
    if (m.verified !== true) errors.push("menu.verified is not true: confirm dishes, prices and dietary labels with the restaurant.");
    items.forEach(function (i, n) { if (i && (typeof i.price !== "number" || !(i.price > 0))) errors.push("menu item " + (n + 1) + " has no valid price."); });

    // 6) الصور
    var img = R.images || {};
    if (img.hero === TEMPLATE.heroImage) warnings.push("images.hero is still the template stock photo (Unsplash). Replace it with the restaurant's own photo.");
    var emptySlots = (img.gallery || []).filter(function (g) { return !g.src; }).length;
    if (emptySlots) warnings.push(emptySlots + " gallery slot(s) have no photo and will show a placeholder tile.");
    if (img.verified !== true) errors.push("images.verified is not true: confirm the restaurant owns or has licensed every photo.");

    // 7) الآراء: تُعرض فقط بإذن ومصدر
    (R.reviews || []).forEach(function (r, n) {
      if (r.permission !== true || !r.source) errors.push("review " + (n + 1) + " has no permission:true and source; it will not be shown.");
    });

    return { errors: errors, warnings: warnings };
  }

  root.checkRestaurantReadiness = check;
})(typeof window !== "undefined" ? window : this);
