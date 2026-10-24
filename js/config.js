/* ============================================================
   config.js — كل بيانات المطعم في مكان واحد
   لتحويل الديمو لمطعم حقيقي: عدّل هذا الملف فقط (ولا تعدّل HTML).
   ⚠️ كل القيم هنا "Sample" للعرض. لا تنشر معلومات عميل إلا بعد موافقته.
   ============================================================ */
window.RESTAURANT = {
  // وضع العرض: true = يظهر شريط "Demo" وعلامات Sample. اجعله false عند التسليم لمطعم حقيقي بعد اعتماد البيانات.
  demoMode: true,

  name: "Coastal Table",

  // رقم WhatsApp الخاص بالمطعم بصيغة دولية بدون + أو أصفار: مثال "201XXXXXXXXX".
  // اتركه فارغًا ("") حتى يعطيك المطعم رقمه. لا تخترع رقمًا.
  whatsappNumber: "",

  // بيانات التواصل (placeholders حتى يعتمدها المطعم)
  contact: {
    phone: "",                         // مثال: "+20 65 000 0000"
    email: "",
    address: { en: "Sample address — Hurghada, Red Sea", de: "Beispieladresse — Hurghada, Rotes Meer", ar: "عنوان تجريبي — الغردقة، البحر الأحمر" },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hurghada",   // استبدله برابط موقع المطعم الحقيقي
    social: { facebook: "", instagram: "", tiktok: "" },                   // اتركها فارغة إن لم توجد؛ لا تظهر الأيقونة
    verified: false   // true فقط بعد أن يؤكد المطعم العنوان والهاتف ورابط الخريطة كتابيًا
  },

  // مواعيد العمل (Sample). مفتاح "slots" يحدد أوقات الحجز المتاحة في النموذج.
  hours: {
    note: { en: "Sample hours", de: "Beispiel-Öffnungszeiten", ar: "مواعيد تجريبية" },
    rows: [
      { days: { en: "Monday – Thursday", de: "Montag – Donnerstag", ar: "الاثنين – الخميس" }, time: "12:00 – 23:00" },
      { days: { en: "Friday – Sunday", de: "Freitag – Sonntag", ar: "الجمعة – الأحد" }, time: "12:00 – 00:00" }
    ],
    verified: false,  // true بعد تأكيد المطعم للمواعيد وأوقات الحجز
    slots: ["12:00","12:30","13:00","13:30","14:00","14:30","15:00","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00"]
  },

  maxGuests: 30,

  // الصور: ضع مسارًا في "src" لتظهر. لو "src" فارغة يظهر مكانها بلاطة Photo slot.
  images: {
    verified: false,  // true فقط بعد التأكد أن المطعم يملك كل صورة أو مرخّصة له
    hero: "assets/img/hero.jpg",   // صورة Unsplash (ترخيص Unsplash) — استبدلها بصورة المطعم الحقيقية
    gallery: [
      { src: "assets/img/hero.jpg", alt: { en: "Dining room", de: "Speisesaal", ar: "صالة الطعام" } },
      { src: "", alt: { en: "Signature seafood dish", de: "Signature-Fischgericht", ar: "طبق المأكولات البحرية المميز" } },
      { src: "", alt: { en: "Terrace at sunset", de: "Terrasse bei Sonnenuntergang", ar: "التراس وقت الغروب" } },
      { src: "", alt: { en: "Fresh pasta", de: "Frische Pasta", ar: "باستا طازجة" } },
      { src: "", alt: { en: "Dessert", de: "Dessert", ar: "الحلويات" } },
      { src: "", alt: { en: "Chef at work", de: "Der Küchenchef bei der Arbeit", ar: "الشيف أثناء العمل" } },
      { src: "", alt: { en: "Evening ambience", de: "Abendstimmung", ar: "أجواء المساء" } },
      { src: "", alt: { en: "Table setting", de: "Gedeck", ar: "تجهيز الطاولة" } }
    ]
  },

  // قائمة الطعام (Sample). الأسعار بالجنيه المصري. dietary: V نباتي، VG نباتي صرف، GF بدون جلوتين.
  // ⚠️ علامات التغذية أمثلة فقط — يجب تأكيدها مع مطبخ المطعم قبل النشر.
  menu: {
    verified: false,  // true بعد أن يعتمد المطعم الأطباق والأسعار وعلامات التغذية
    categories: [
      { id: "starters", label: { en: "Starters", de: "Vorspeisen", ar: "المقبلات" } },
      { id: "mains",    label: { en: "Mains",    de: "Hauptgerichte", ar: "الأطباق الرئيسية" } },
      { id: "seafood",  label: { en: "Seafood",  de: "Meeresfrüchte", ar: "المأكولات البحرية" } },
      { id: "desserts", label: { en: "Desserts", de: "Desserts", ar: "الحلويات" } },
      { id: "drinks",   label: { en: "Drinks",   de: "Getränke", ar: "المشروبات" } }
    ],
    items: [
      { cat: "starters", price: 120, dietary: ["V","GF"], name: { en: "Hummus & Warm Bread", de: "Hummus mit warmem Brot", ar: "حمص مع خبز دافئ" }, desc: { en: "Creamy chickpea purée, olive oil, paprika.", de: "Cremiges Kichererbsenpüree, Olivenöl, Paprika.", ar: "حمص كريمي بزيت الزيتون والبابريكا." } },
      { cat: "starters", price: 150, dietary: ["V"], name: { en: "Burrata & Tomato", de: "Burrata mit Tomaten", ar: "بوراتا بالطماطم" }, desc: { en: "Fresh burrata, ripe tomatoes, basil.", de: "Frische Burrata, reife Tomaten, Basilikum.", ar: "بوراتا طازجة وطماطم ناضجة وريحان." } },
      { cat: "starters", price: 135, dietary: [], name: { en: "Calamari Fritti", de: "Calamari fritti", ar: "كالاماري مقلي" }, desc: { en: "Crisp calamari, lemon, house aioli.", de: "Knusprige Calamari, Zitrone, Hausaioli.", ar: "كالاماري مقرمش مع الليمون وصلصة الثوم." } },
      { cat: "mains", price: 290, dietary: ["V"], name: { en: "Mediterranean Pasta", de: "Mediterrane Pasta", ar: "باستا متوسطية" }, desc: { en: "Tomato, basil and parmesan.", de: "Tomate, Basilikum und Parmesan.", ar: "طماطم وريحان وجبن بارميزان." } },
      { cat: "mains", price: 380, dietary: ["GF"], name: { en: "Herb-Grilled Chicken", de: "Kräuter-Grillhähnchen", ar: "دجاج مشوي بالأعشاب" }, desc: { en: "Chicken with herbs and roasted vegetables.", de: "Hähnchen mit Kräutern und geröstetem Gemüse.", ar: "دجاج مشوي بالأعشاب مع خضار محمّصة." } },
      { cat: "mains", price: 520, dietary: ["GF"], name: { en: "Grilled Beef Fillet", de: "Gegrilltes Rinderfilet", ar: "فيليه لحم مشوي" }, desc: { en: "Fillet, pepper sauce, potato gratin.", de: "Filet, Pfeffersauce, Kartoffelgratin.", ar: "فيليه مع صوص الفلفل وبطاطس الجراتان." } },
      { cat: "seafood", price: 450, dietary: ["GF"], name: { en: "Grilled Sea Bass", de: "Gegrillter Wolfsbarsch", ar: "سمك قاروص مشوي" }, desc: { en: "Herbs, lemon and seasonal vegetables.", de: "Kräuter, Zitrone und Saisongemüse.", ar: "أعشاب وليمون وخضار الموسم." } },
      { cat: "seafood", price: 480, dietary: [], name: { en: "Garlic Butter Prawns", de: "Garnelen in Knoblauchbutter", ar: "جمبري بزبدة الثوم" }, desc: { en: "Prawns with garlic butter and parsley.", de: "Garnelen in Knoblauchbutter mit Petersilie.", ar: "جمبري بزبدة الثوم والبقدونس." } },
      { cat: "seafood", price: 620, dietary: [], name: { en: "Seafood Platter for Two", de: "Meeresfrüchteplatte für zwei", ar: "طبق مأكولات بحرية لشخصين" }, desc: { en: "Fish, prawns and calamari, grilled to order.", de: "Fisch, Garnelen und Calamari, frisch gegrillt.", ar: "سمك وجمبري وكالاماري مشوي حسب الطلب." } },
      { cat: "desserts", price: 180, dietary: ["V"], name: { en: "Mango Cheesecake", de: "Mango-Käsekuchen", ar: "تشيز كيك المانجو" }, desc: { en: "A tropical finish.", de: "Ein tropischer Abschluss.", ar: "ختام استوائي منعش." } },
      { cat: "desserts", price: 160, dietary: ["V"], name: { en: "Warm Chocolate Fondant", de: "Warmes Schokoladenfondant", ar: "فوندان شوكولاتة دافئ" }, desc: { en: "Molten centre, vanilla cream.", de: "Flüssiger Kern, Vanillecreme.", ar: "قلب سائل مع كريمة الفانيليا." } },
      { cat: "drinks", price: 70, dietary: ["VG","GF"], name: { en: "Fresh Lemon & Mint", de: "Frische Limonade mit Minze", ar: "ليمون بالنعناع طازج" }, desc: { en: "Squeezed to order.", de: "Frisch gepresst.", ar: "يُحضّر عند الطلب." } },
      { cat: "drinks", price: 55, dietary: ["VG"], name: { en: "Specialty Coffee", de: "Spezialitätenkaffee", ar: "قهوة مختصة" }, desc: { en: "Espresso, served hot or iced.", de: "Espresso, heiß oder eisgekühlt serviert.", ar: "إسبريسو يُقدَّم ساخنًا أو مثلجًا." } }
    ]
  },

  // آراء الضيوف: لا تكتب آراء مخترعة أبدًا. كل رأي يُعرض فقط لو فيه permission: true و source.
  // مثال: { text: { en: "…", ar: "…" }, author: "اسم بإذنه", source: "Google review, Oct 2026", permission: true }
  // اتركها فارغة [] وسيظهر قسم Placeholder واضح.
  reviews: [],

  // إعدادات تسويق
  agency: {
    name: "Marsa Digital",
    url: "https://www.facebook.com/profile.php?id=61595782768864",
    label: { en: "Website by Marsa Digital", de: "Website von Marsa Digital", ar: "تصميم الموقع: مرسى ديجيتال" },
    labelDemo: { en: "Demo website by Marsa Digital", de: "Demo-Website von Marsa Digital", ar: "موقع تجريبي من مرسى ديجيتال" }
  }
};
