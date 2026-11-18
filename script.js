/* =========================================================
   Altavía Drones — lógica interactiva
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const eur = (n) => {
    const v = Math.round(n * 100) / 100, [i, d] = v.toFixed(Number.isInteger(v) ? 0 : 2).split(".");
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? "," + d : "") + " €";
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
  };

  /* ---------------------------------------------------------
     Ilustraciones SVG (drones y accesorios) generadas en código
     --------------------------------------------------------- */
  function droneSVG(color = "#22d3ee", arms = 4, { body = "#1e293b", big = false } = {}) {
    const cx = 100, cy = 100, L = arms === 4 ? 62 : 66;
    const offset = arms === 4 ? 45 : arms === 6 ? 30 : 22.5;
    const propR = arms === 4 ? 30 : arms === 6 ? 24 : 19;
    let armsSvg = "", props = "";
    for (let i = 0; i < arms; i++) {
      const a = ((360 / arms) * i + offset) * Math.PI / 180;
      const x = cx + Math.cos(a) * L, y = cy + Math.sin(a) * L;
      armsSvg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${body}" stroke-width="${big ? 9 : 8}" stroke-linecap="round"/>`;
      props += `
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${propR}" fill="${color}" opacity=".13"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${propR}" fill="none" stroke="${color}" stroke-opacity=".35" stroke-dasharray="3 5"/>
        <g class="prop" style="animation-duration:${(0.1 + i * 0.015).toFixed(3)}s">
          <ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${propR - 2}" ry="3.2" fill="${body}" opacity=".55"/>
        </g>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${body}"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${color}"/>`;
    }
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${armsSvg}${props}
      <rect x="${cx - 22}" y="${cy - 30}" width="44" height="60" rx="16" fill="${body}"/>
      <rect x="${cx - 16}" y="${cy - 24}" width="32" height="30" rx="10" fill="${color}" opacity=".9"/>
      <circle cx="${cx}" cy="${cy + 16}" r="8" fill="#0b1220" stroke="${color}" stroke-width="2"/>
      <circle cx="${cx + 2}" cy="${cy + 14}" r="2.4" fill="#fff" opacity=".8"/>
      <circle cx="${cx - 10}" cy="${cy - 28}" r="2" fill="#ef4444"/><circle cx="${cx + 10}" cy="${cy - 28}" r="2" fill="#10b981"/>
    </svg>`;
  }

  const accessorySVG = {
    battery: (c) => `<svg viewBox="0 0 200 200"><rect x="40" y="60" width="110" height="80" rx="14" fill="#1e293b"/><rect x="150" y="84" width="12" height="32" rx="4" fill="#1e293b"/><rect x="52" y="72" width="22" height="56" rx="5" fill="${c}"/><rect x="80" y="72" width="22" height="56" rx="5" fill="${c}"/><rect x="108" y="72" width="22" height="56" rx="5" fill="${c}" opacity=".35"/></svg>`,
    controller: (c) => `<svg viewBox="0 0 200 200"><path d="M40 80q0-20 20-20h80q20 0 20 20v40q0 26-22 26-12 0-20-14H82q-8 14-20 14-22 0-22-26z" fill="#1e293b"/><circle cx="72" cy="98" r="14" fill="#334155"/><circle cx="72" cy="98" r="6" fill="${c}"/><circle cx="128" cy="98" r="14" fill="#334155"/><circle cx="128" cy="98" r="6" fill="${c}"/><rect x="88" y="70" width="24" height="14" rx="3" fill="${c}" opacity=".6"/><line x1="70" y1="60" x2="62" y2="34" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/><line x1="130" y1="60" x2="138" y2="34" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/></svg>`,
    goggles: (c) => `<svg viewBox="0 0 200 200"><path d="M30 80q0-14 14-14h112q14 0 14 14v34q0 16-16 16h-30q-10 0-16-12-4-8-8-8t-8 8q-6 12-16 12H46q-16 0-16-16z" fill="#1e293b"/><ellipse cx="70" cy="98" rx="22" ry="16" fill="${c}" opacity=".85"/><ellipse cx="130" cy="98" rx="22" ry="16" fill="${c}" opacity=".85"/><path d="M30 92H14M170 92h16" stroke="#334155" stroke-width="8" stroke-linecap="round"/></svg>`,
    case: (c) => `<svg viewBox="0 0 200 200"><rect x="78" y="44" width="44" height="22" rx="8" fill="none" stroke="#1e293b" stroke-width="8"/><rect x="30" y="62" width="140" height="94" rx="14" fill="#1e293b"/><rect x="30" y="98" width="140" height="8" fill="${c}"/><rect x="60" y="92" width="16" height="20" rx="3" fill="#475569"/><rect x="124" y="92" width="16" height="20" rx="3" fill="#475569"/></svg>`,
    props: (c) => `<svg viewBox="0 0 200 200"><g transform="rotate(-20 100 100)"><path d="M100 92C70 86 36 90 22 100c14 6 48 10 78 8z" fill="${c}"/><path d="M100 108c30 6 64 2 78-8-14-6-48-10-78-8z" fill="${c}" opacity=".8"/><circle cx="100" cy="100" r="12" fill="#1e293b"/><circle cx="100" cy="100" r="4" fill="#94a3b8"/></g></svg>`,
    filters: (c) => `<svg viewBox="0 0 200 200"><circle cx="78" cy="100" r="44" fill="#1e293b"/><circle cx="78" cy="100" r="34" fill="${c}" opacity=".55"/><circle cx="130" cy="100" r="44" fill="#1e293b" opacity=".9"/><circle cx="130" cy="100" r="34" fill="${c}" opacity=".3"/><path d="M114 84q10-6 20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/></svg>`,
  };

  /* ---------------------------------------------------------
     Datos (ficticios)
     --------------------------------------------------------- */
  const ICONS = {
    camera: '<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    thermo: '<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 9v7"/>',
    leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/>',
    grad: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  };

  const SERVICES = [
    { id: "foto", sector: "media", icon: "camera", title: "Fotografía y vídeo aéreo",
      desc: "Producción audiovisual 4K/8K para publicidad, inmobiliaria, eventos y cine con pilotos y operadores de cámara dedicados.",
      from: 290, unit: "Horas de vuelo", min: 1, max: 12, step: 1, base: 150, per: 120,
      includes: ["Piloto + operador de cámara", "Grabación 4K/8K y RAW", "Edición y color básico", "Música libre de derechos"],
      use: ["Spots publicitarios", "Promociones inmobiliarias", "Eventos y bodas", "Turismo y hostelería"] },
    { id: "topo", sector: "industria", icon: "map", title: "Topografía y fotogrametría",
      desc: "Ortofotos, modelos digitales del terreno y nubes de puntos con precisión centimétrica mediante RTK/PPK.",
      from: 480, unit: "Hectáreas", min: 1, max: 500, step: 1, base: 300, per: 18,
      includes: ["Ortomosaico georreferenciado", "MDT / MDS y curvas de nivel", "Nube de puntos LAS", "Cálculo de volúmenes"],
      use: ["Obra civil y canteras", "Catastro y urbanismo", "Seguimiento de obra", "Minería"] },
    { id: "inspeccion", sector: "industria", icon: "thermo", title: "Inspección termográfica",
      desc: "Detección de puntos calientes en plantas solares, líneas eléctricas, cubiertas y aerogeneradores sin paradas.",
      from: 700, unit: "MWp / estructuras", min: 1, max: 200, step: 1, base: 250, per: 45,
      includes: ["Cámara radiométrica 640×512", "Informe IEC 62446-3", "Geolocalización de defectos", "Priorización de incidencias"],
      use: ["Plantas fotovoltaicas", "Líneas de alta tensión", "Eólica", "Edificación"] },
    { id: "agro", sector: "campo", icon: "leaf", title: "Agricultura de precisión",
      desc: "Mapas NDVI multiespectrales, conteo de plantas y pulverización con drones para optimizar insumos hasta un 30%.",
      from: 320, unit: "Hectáreas", min: 1, max: 1000, step: 5, base: 200, per: 12,
      includes: ["Vuelo multiespectral", "Índices NDVI / NDRE", "Mapas de prescripción", "Asesoría agronómica"],
      use: ["Viñedo y cítricos", "Cereal extensivo", "Olivar", "Invernaderos"] },
    { id: "formacion", sector: "formacion", icon: "grad", title: "Formación y licencias",
      desc: "Cursos oficiales A1/A3, A2 y STS en nuestra ATO homologada. Teoría online y prácticas en campo propio.",
      from: 390, unit: "Alumnos", min: 1, max: 20, step: 1, base: 0, per: 390,
      includes: ["Plataforma online 24/7", "Prácticas en campo de vuelo", "Examen oficial", "Bolsa de empleo"],
      use: ["Pilotos profesionales", "Empresas y cuerpos de seguridad", "Aficionados", "Reciclaje"] },
    { id: "mant", sector: "industria", icon: "tool", title: "Mantenimiento y reparación",
      desc: "Servicio técnico oficial: diagnóstico, calibración, sustitución de piezas y revisiones periódicas de flota.",
      from: 95, unit: "Drones", min: 1, max: 30, step: 1, base: 0, per: 95,
      includes: ["Diagnóstico en 48 h", "Repuestos originales", "Calibración de sensores", "Garantía de 6 meses"],
      use: ["Flotas corporativas", "Particulares", "Contratos anuales", "Peritajes"] },
  ];

  const PRODUCTS = [
    { id: "nimbus", name: "Altavía Nimbus Mini", cat: "consumo", price: 549, old: 649, rating: 4.7, reviews: 312, arms: 4, colors: ["#22d3ee", "#f43f5e", "#a3e635"], tag: "sale",
      desc: "Menos de 249 g, sin licencia en categoría A1. Ideal para viajes y contenido para redes.",
      specs: { Peso: "245 g", Autonomía: "34 min", Alcance: "10 km", Cámara: "4K/60 fps", Velocidad: "57 km/h", Viento: "Nivel 5" } },
    { id: "horizon", name: "Altavía Horizon 4K Pro", cat: "profesional", price: 1290, rating: 4.8, reviews: 204, arms: 4, colors: ["#3b82f6", "#f59e0b", "#94a3b8"], tag: "top",
      desc: "Sensor de 1\" y detección de obstáculos omnidireccional. El favorito de creadores y profesionales.",
      specs: { Peso: "895 g", Autonomía: "43 min", Alcance: "15 km", Cámara: "5.1K 1\" CMOS", Velocidad: "75 km/h", Viento: "Nivel 6" } },
    { id: "cineo", name: "Altavía Cineo X8", cat: "profesional", price: 4890, rating: 4.9, reviews: 58, arms: 8, colors: ["#e11d48", "#22d3ee"], tag: "new",
      desc: "Octocóptero de cine con gimbal intercambiable y carga útil de 6 kg para cámaras Full Frame.",
      specs: { Peso: "7,9 kg", Autonomía: "28 min", Alcance: "12 km", Cámara: "Gimbal intercambiable", Velocidad: "90 km/h", Viento: "Nivel 7" } },
    { id: "thermis", name: "Altavía Thermis T2", cat: "industrial", price: 6450, rating: 4.8, reviews: 41, arms: 4, colors: ["#f97316", "#22d3ee"],
      desc: "Cámara dual térmica radiométrica + zoom 56x. IP55 para inspección y emergencias.",
      specs: { Peso: "1,9 kg", Autonomía: "45 min", Alcance: "15 km", Cámara: "Térmica 640 + zoom 56x", Velocidad: "82 km/h", Viento: "Nivel 7" } },
    { id: "agro", name: "Altavía Agro S20", cat: "industrial", price: 12900, rating: 4.6, reviews: 27, arms: 6, colors: ["#16a34a", "#eab308"],
      desc: "Pulverizador con depósito de 20 L y radar de seguimiento del terreno. Hasta 15 ha/hora.",
      specs: { Peso: "24 kg", Autonomía: "18 min", Alcance: "5 km", Cámara: "FPV + radar", Velocidad: "36 km/h", Viento: "Nivel 5" } },
    { id: "cargo", name: "Altavía Cargo L40", cat: "industrial", price: 18500, rating: 4.5, reviews: 12, arms: 6, colors: ["#a855f7", "#64748b"], tag: "new",
      desc: "Dron logístico con 40 kg de carga y cabrestante. Para rescate, obra y zonas de difícil acceso.",
      specs: { Peso: "38 kg", Autonomía: "22 min", Alcance: "8 km", Cámara: "FPV dual", Velocidad: "65 km/h", Viento: "Nivel 6" } },
    { id: "racer", name: "Altavía Racer R7 FPV", cat: "fpv", price: 389, rating: 4.6, reviews: 189, arms: 4, colors: ["#ef4444", "#facc15", "#22d3ee"],
      desc: "Quad FPV de 5\" listo para volar. Chasis de carbono y vídeo digital de baja latencia.",
      specs: { Peso: "590 g", Autonomía: "8 min", Alcance: "4 km", Cámara: "Digital 1080p", Velocidad: "140 km/h", Viento: "Nivel 6" } },
    { id: "cinewhoop", name: "Altavía Whoop C3", cat: "fpv", price: 459, old: 499, rating: 4.4, reviews: 96, arms: 4, colors: ["#10b981", "#f472b6"], tag: "sale",
      desc: "Cinewhoop con protectores para planos interiores fluidos y seguros cerca de personas.",
      specs: { Peso: "280 g", Autonomía: "9 min", Alcance: "2 km", Cámara: "4K estabilizada", Velocidad: "70 km/h", Viento: "Nivel 4" } },
    { id: "bat", name: "Batería Inteligente HX 5000", cat: "accesorios", acc: "battery", price: 159, rating: 4.8, reviews: 420, colors: ["#22c55e"],
      desc: "Batería de alta densidad compatible con Horizon 4K. Autodescarga para almacenamiento.",
      specs: { Capacidad: "5000 mAh", Tensión: "15,4 V", Ciclos: "400+", Peso: "335 g" } },
    { id: "rc", name: "Mando Pro RC-Vision", cat: "accesorios", acc: "controller", price: 699, rating: 4.7, reviews: 133, colors: ["#3b82f6"],
      desc: "Radiocontrol con pantalla de 7\" y 1500 nits. Compatible con toda la gama Altavía.",
      specs: { Pantalla: "7\" 1500 nits", Autonomía: "4 h", Alcance: "15 km", Peso: "680 g" } },
    { id: "goggles", name: "Gafas FPV Vision 3", cat: "accesorios", acc: "goggles", price: 499, rating: 4.6, reviews: 88, colors: ["#a855f7"],
      desc: "Micro-OLED 1080p a 100 fps con latencia de 28 ms y seguimiento de cabeza.",
      specs: { Pantalla: "Micro-OLED", Latencia: "28 ms", Autonomía: "2 h", Peso: "290 g" } },
    { id: "case", name: "Maleta rígida Altavía", cat: "accesorios", acc: "case", price: 129, rating: 4.9, reviews: 251, colors: ["#f59e0b"],
      desc: "Maleta estanca IP67 con espuma a medida para dron, mando y 4 baterías.",
      specs: { Protección: "IP67", Material: "Polipropileno", Peso: "3,1 kg", Garantía: "De por vida" } },
    { id: "props", name: "Hélices de bajo ruido (x4 pares)", cat: "accesorios", acc: "props", price: 29, rating: 4.5, reviews: 512, colors: ["#64748b"],
      desc: "Reducen el ruido hasta 4 dB. Montaje rápido sin herramientas.",
      specs: { Unidades: "8", Material: "Nylon + fibra", Ruido: "-4 dB", Peso: "16 g" } },
    { id: "nd", name: "Kit filtros ND/PL x6", cat: "accesorios", acc: "filters", price: 89, rating: 4.7, reviews: 176, colors: ["#0ea5e9"],
      desc: "ND8, ND16, ND32, ND64 y polarizadores para vídeo cinematográfico.",
      specs: { Filtros: "6", Cristal: "Óptico multicapa", Montura: "Magnética", Peso: "12 g" } },
  ];
  const CAT_LABEL = { consumo: "Consumo", profesional: "Profesional", industrial: "Industrial", fpv: "FPV", accesorios: "Accesorios" };

  const TESTIMONIALS = [
    { text: "La inspección termográfica de nuestras 6 plantas solares detectó un 3% de módulos defectuosos que no habíamos visto. Recuperamos la inversión en dos meses.", name: "Laura Gómez", role: "Directora de O&M · IBERSOLAR" },
    { text: "Con los mapas NDVI ajustamos el riego y el abonado por sectores. Hemos ahorrado un 27% en fertilizantes en la última campaña.", name: "Ramón Ferrer", role: "Gerente · VitiValencia" },
    { text: "Compramos tres Horizon 4K Pro y la formación A2 para el equipo. Atención impecable y el soporte técnico responde en horas.", name: "Marta Ruiz", role: "Jefa de obra · CONSTRUMED" },
    { text: "Grabaron la campaña de verano del puerto con una calidad de cine. Profesionales, puntuales y con todos los permisos gestionados.", name: "Daniel Ortega", role: "Marketing · Puerto Norte" },
  ];

  const FAQS = [
    ["¿Necesito licencia para volar un dron?", "Depende del peso y del uso. Los drones de menos de 250 g (como el Nimbus Mini) pueden volarse en categoría A1 solo con registro de operador. Para equipos mayores necesitarás el certificado A1/A3 o A2, que puedes obtener en nuestra escuela."],
    ["¿Gestionáis los permisos de vuelo?", "Sí. En todos nuestros servicios incluimos la coordinación con AESA, ENAIRE y, si es necesario, con aeropuertos o ayuntamientos. Tú solo nos indicas la zona y la fecha."],
    ["¿Qué garantía tienen los drones que vendéis?", "Todos los drones tienen 2 años de garantía oficial. Además puedes contratar Altavía Care, que cubre daños accidentales con dos sustituciones al año."],
    ["¿Hacéis envíos a toda España?", "Sí. Enviamos a península en 24–48 h (gratis a partir de 300 €) y a Baleares y Canarias en 3–5 días laborables."],
    ["¿Puedo financiar la compra?", "Ofrecemos financiación al 0% TAE hasta 12 meses en compras superiores a 400 €, y renting para empresas desde 24 meses."],
    ["¿En cuánto tiempo recibo los datos de un servicio?", "El plazo estándar es de 72 horas tras el vuelo. Con la opción urgente lo reducimos a 24 horas."],
  ];

  /* ---------------------------------------------------------
     Tema claro / oscuro
     --------------------------------------------------------- */
  const root = document.documentElement;
  const savedTheme = store.get("theme", null);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = savedTheme || (prefersDark ? "dark" : "light");
  $("#themeToggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("theme", root.dataset.theme);
  });

  /* ---------------------------------------------------------
     Header, menú móvil, enlace activo, volver arriba
     --------------------------------------------------------- */
  const header = $("#header"), toTop = $("#toTop"), navLinks = $("#navLinks"), menuBtn = $("#menuToggle");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }));
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        $$("a", navLinks).forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => sectionObs.observe(s));

  /* ---------------------------------------------------------
     Hero: dron animado, HUD y parallax
     --------------------------------------------------------- */
  const heroDrone = $("#heroDrone");
  heroDrone.innerHTML = droneSVG("#22d3ee", 4, { big: true });
  const heroVisual = $("#heroVisual");
  heroVisual.addEventListener("mousemove", (e) => {
    const r = heroVisual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    heroDrone.style.transform = `translate(${x * 30}px, ${y * 30}px) rotate(${x * 14}deg)`;
  });
  heroVisual.addEventListener("mouseleave", () => { heroDrone.style.transform = ""; });
  let alt = 120, bat = 87;
  setInterval(() => {
    alt = Math.max(80, Math.min(150, alt + (Math.random() - 0.5) * 3));
    bat = bat <= 20 ? 100 : bat - 0.2;
    $("#hudAlt").textContent = `${alt.toFixed(1)} m`;
    $("#hudSpd").textContent = `${Math.round(38 + Math.random() * 8)} km/h`;
    $("#hudBat").textContent = `${Math.round(bat)}%`;
  }, 900);

  /* ---------------------------------------------------------
     Animaciones al hacer scroll y contadores
     --------------------------------------------------------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; revealObs.observe(el); });

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
      const t0 = performance.now(), dur = 1600;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString("es-ES") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => countObs.observe(el));

  /* ---------------------------------------------------------
     Toasts y modal
     --------------------------------------------------------- */
  function toast(msg, icon = "✓") {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); t.addEventListener("animationend", () => t.remove()); }, 2600);
  }

  const modal = $("#modal"), modalContent = $("#modalContent");
  let lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    modalContent.innerHTML = html;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#modalClose").focus(), 50);
  }
  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    if (!cartEl.classList.contains("open")) document.body.style.overflow = "";
    lastFocus?.focus?.();
  }
  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal.classList.contains("show")) closeModal();
    else if (cartEl.classList.contains("open")) closeCart();
  });

  /* ---------------------------------------------------------
     Servicios
     --------------------------------------------------------- */
  const icon = (k) => `<svg viewBox="0 0 24 24">${ICONS[k]}</svg>`;
  const servicesGrid = $("#servicesGrid");
  servicesGrid.innerHTML = SERVICES.map((s) => `
    <article class="service reveal" data-id="${s.id}" data-sector="${s.sector}" tabindex="0" role="button" aria-label="Ver detalle de ${s.title}">
      <div class="service-icon">${icon(s.icon)}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
      <div class="service-meta"><span>Desde <b>${eur(s.from)}</b></span><span class="more">Ver más →</span></div>
    </article>`).join("");
  $$(".service", servicesGrid).forEach((el) => {
    revealObs.observe(el);
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
    const open = () => openService(el.dataset.id);
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  $("#serviceFilter").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    $$("#serviceFilter .chip").forEach((c) => c.classList.toggle("active", c === btn));
    $$(".service", servicesGrid).forEach((el) => {
      el.classList.toggle("hidden", btn.dataset.sector !== "all" && el.dataset.sector !== btn.dataset.sector);
    });
  });

  function openService(id) {
    const s = SERVICES.find((x) => x.id === id);
    openModal(`
      <div class="sd">
        <div class="sd-head"><div class="service-icon">${icon(s.icon)}</div><h3>${s.title}</h3></div>
        <p style="color:var(--muted)">${s.desc}</p>
        <div class="sd-cols">
          <div><h4>Qué incluye</h4><ul>${s.includes.map((i) => `<li>${i}</li>`).join("")}</ul></div>
          <div><h4>Aplicaciones</h4><ul>${s.use.map((i) => `<li>${i}</li>`).join("")}</ul></div>
        </div>
        <div class="sd-foot">
          <div><small style="color:var(--muted)">Precio desde</small><div class="price">${eur(s.from)}</div></div>
          <button class="btn btn-primary" data-quote="${s.id}">Calcular presupuesto</button>
        </div>
      </div>`);
    $("[data-quote]", modalContent).addEventListener("click", () => {
      closeModal();
      qService.value = s.id;
      qService.dispatchEvent(new Event("change"));
      $("#presupuesto").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------
     Calculadora de presupuesto
     --------------------------------------------------------- */
  const qService = $("#qService"), qAmount = $("#qAmount"), qAmountOut = $("#qAmountOut"), qTotal = $("#qTotal");
  qService.innerHTML = SERVICES.map((s) => `<option value="${s.id}">${s.title}</option>`).join("");
  let shownTotal = 0;
  function animateTotal(to) {
    const from = shownTotal, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 400);
      qTotal.textContent = eur(Math.round(from + (to - from) * p));
      if (p < 1) requestAnimationFrame(step);
    };
    shownTotal = to;
    requestAnimationFrame(step);
  }
  function calcQuote() {
    const s = SERVICES.find((x) => x.id === qService.value);
    const n = +qAmount.value;
    qAmountOut.textContent = `${n} ${s.unit.toLowerCase().split(" ")[0]}`;
    let mult = 1, add = 0;
    $$("#quoteForm .check input:checked").forEach((c) => { mult += +(c.dataset.mult || 0); add += +(c.dataset.add || 0); });
    const total = Math.max(s.from, s.base + s.per * n) * mult + add + +$("#qZone").value;
    animateTotal(Math.round(total));
  }
  qService.addEventListener("change", () => {
    const s = SERVICES.find((x) => x.id === qService.value);
    $("#qUnitLabel").textContent = s.unit;
    Object.assign(qAmount, { min: s.min, max: s.max, step: s.step });
    qAmount.value = Math.min(s.max, Math.max(s.min, Math.round(s.max / 5)));
    calcQuote();
  });
  $("#quoteForm").addEventListener("input", calcQuote);
  qService.dispatchEvent(new Event("change"));
  $("#qRequest").addEventListener("click", () => {
    const s = SERVICES.find((x) => x.id === qService.value);
    $("#contactTopic").value = s.id === "formacion" ? "Formación y licencias" : "Solicitar servicio";
    $("#contactForm textarea").value = `Hola, me interesa el servicio "${s.title}" (${qAmountOut.textContent}). Presupuesto estimado: ${qTotal.textContent}.`;
    $("#contacto").scrollIntoView({ behavior: "smooth" });
    toast("Hemos rellenado el formulario con tu estimación");
  });

  /* ---------------------------------------------------------
     Tienda: filtros, búsqueda, orden
     --------------------------------------------------------- */
  const productArt = (p, color = p.colors[0]) => p.acc ? accessorySVG[p.acc](color) : droneSVG(color, p.arms);
  const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
  const shop = { cat: "all", q: "", max: 20000, sort: "featured" };
  let compare = [];
  const grid = $("#productsGrid");

  function renderProducts() {
    let list = PRODUCTS.filter((p) =>
      (shop.cat === "all" || p.cat === shop.cat) &&
      p.price <= shop.max &&
      (p.name + p.desc + CAT_LABEL[p.cat]).toLowerCase().includes(shop.q));
    if (shop.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (shop.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (shop.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    $("#resultsCount").textContent = `${list.length} producto${list.length === 1 ? "" : "s"}`;
    if (!list.length) {
      grid.innerHTML = `<div class="empty"><h3>Sin resultados</h3><p>Prueba con otra búsqueda o amplía el rango de precio.</p></div>`;
      return;
    }
    grid.innerHTML = list.map((p, i) => {
      const keySpecs = Object.values(p.specs).slice(0, 3);
      const tag = p.tag === "sale" ? `<span class="tag sale">-${Math.round((1 - p.price / p.old) * 100)}%</span>`
        : p.tag === "new" ? `<span class="tag new">Nuevo</span>` : p.tag === "top" ? `<span class="tag">Más vendido</span>` : "";
      return `
      <article class="product" style="--pc:${p.colors[0]};animation-delay:${i * 40}ms" data-id="${p.id}">
        <div class="product-img" data-open="${p.id}">
          ${tag}
          ${p.acc ? "" : `<label class="compare-toggle" onclick="event.stopPropagation()"><input type="checkbox" data-compare="${p.id}" ${compare.includes(p.id) ? "checked" : ""}/> Comparar</label>`}
          ${productArt(p)}
        </div>
        <div class="product-body">
          <span class="product-cat">${CAT_LABEL[p.cat]}</span>
          <h3>${p.name}</h3>
          <div class="rating">${stars(p.rating)}<small>${p.rating} (${p.reviews})</small></div>
          <p class="product-desc">${p.desc}</p>
          <div class="product-specs">${keySpecs.map((s) => `<span>${s}</span>`).join("")}</div>
          <div class="product-foot">
            <span class="price">${eur(p.price)}${p.old ? `<del>${eur(p.old)}</del>` : ""}</span>
            <button class="add-btn" data-add="${p.id}" aria-label="Añadir ${p.name} al carrito">+</button>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  $("#shopCats").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    $$("#shopCats .chip").forEach((c) => c.classList.toggle("active", c === btn));
    shop.cat = btn.dataset.cat;
    renderProducts();
  });
  let searchT;
  $("#shopSearch").addEventListener("input", (e) => {
    clearTimeout(searchT);
    searchT = setTimeout(() => { shop.q = e.target.value.trim().toLowerCase(); renderProducts(); }, 150);
  });
  $("#priceMax").addEventListener("input", (e) => {
    shop.max = +e.target.value;
    $("#priceOut").textContent = eur(shop.max);
    renderProducts();
  });
  $("#shopSort").addEventListener("change", (e) => { shop.sort = e.target.value; renderProducts(); });

  grid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      addToCart(add.dataset.add);
      add.classList.add("added"); add.textContent = "✓";
      setTimeout(() => { add.classList.remove("added"); add.textContent = "+"; }, 1200);
      return;
    }
    const open = e.target.closest("[data-open]");
    if (open) openProduct(open.dataset.open);
  });
  grid.addEventListener("change", (e) => {
    const c = e.target.closest("[data-compare]");
    if (!c) return;
    const id = c.dataset.compare;
    if (c.checked) {
      if (compare.length >= 3) { c.checked = false; toast("Puedes comparar hasta 3 drones", "ℹ"); return; }
      compare.push(id);
    } else compare = compare.filter((x) => x !== id);
    renderCompareBar();
  });

  function openProduct(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    let color = p.colors[0];
    openModal(`
      <div class="pd">
        <div class="pd-visual" id="pdVisual" style="--pc:${color}">
          <div id="pdArt">${productArt(p, color)}</div>
          ${p.colors.length > 1 ? `<div class="colors">${p.colors.map((c, i) => `<button style="background:${c}" data-color="${c}" class="${i ? "" : "active"}" aria-label="Color ${i + 1}"></button>`).join("")}</div>` : ""}
        </div>
        <div class="pd-info">
          <span class="product-cat">${CAT_LABEL[p.cat]}</span>
          <h3>${p.name}</h3>
          <div class="rating">${stars(p.rating)}<small>${p.rating} · ${p.reviews} opiniones</small></div>
          <p>${p.desc}</p>
          <table class="spec-table">${Object.entries(p.specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>
          <div class="pd-buy">
            <div><span class="price">${eur(p.price)}${p.old ? `<del>${eur(p.old)}</del>` : ""}</span>
            ${p.price >= 400 ? `<div class="finance">o ${eur(Math.ceil(p.price / 12))}/mes en 12 meses al 0%</div>` : ""}</div>
            <button class="btn btn-primary" id="pdAdd">Añadir al carrito</button>
          </div>
        </div>
      </div>`);
    $$("[data-color]", modalContent).forEach((b) => b.addEventListener("click", () => {
      color = b.dataset.color;
      $$("[data-color]", modalContent).forEach((x) => x.classList.toggle("active", x === b));
      $("#pdArt").innerHTML = productArt(p, color);
      $("#pdVisual").style.setProperty("--pc", color);
    }));
    $("#pdAdd").addEventListener("click", () => { addToCart(p.id, color); closeModal(); });
  }

  /* ---------------------------------------------------------
     Comparador
     --------------------------------------------------------- */
  function renderCompareBar() {
    const bar = $("#compareBar");
    bar.classList.toggle("show", compare.length > 0);
    document.body.classList.toggle("compare-open", compare.length > 0);
    $("#compareItems").innerHTML = compare.map((id) => {
      const p = PRODUCTS.find((x) => x.id === id);
      return `<span class="ci">${p.name}<button data-uncompare="${id}" aria-label="Quitar">✕</button></span>`;
    }).join("") + (compare.length < 2 ? `<span class="hint">Selecciona al menos 2 drones</span>` : "");
    $("#compareOpen").disabled = compare.length < 2;
  }
  $("#compareItems").addEventListener("click", (e) => {
    const b = e.target.closest("[data-uncompare]");
    if (!b) return;
    compare = compare.filter((x) => x !== b.dataset.uncompare);
    const cb = $(`[data-compare="${b.dataset.uncompare}"]`);
    if (cb) cb.checked = false;
    renderCompareBar();
  });
  $("#compareClear").addEventListener("click", () => {
    compare = [];
    $$("[data-compare]").forEach((c) => (c.checked = false));
    renderCompareBar();
  });
  $("#compareOpen").addEventListener("click", () => {
    const items = compare.map((id) => PRODUCTS.find((x) => x.id === id));
    const keys = Object.keys(items[0].specs);
    const num = (v) => parseFloat(String(v).replace(",", "."));
    const higherBetter = { Autonomía: true, Alcance: true, Velocidad: true };
    const best = (k) => (higherBetter[k] ? Math.max(...items.map((p) => num(p.specs[k]))) : null);
    openModal(`
      <div class="cmp">
        <h3>Comparativa</h3>
        <div class="cmp-wrap"><table>
          <thead><tr><th></th>${items.map((p) => `<th>${droneSVG(p.colors[0], p.arms)}${p.name}</th>`).join("")}</tr></thead>
          <tbody>
            <tr><td>Precio</td>${items.map((p) => `<td class="${p.price === Math.min(...items.map((i) => i.price)) ? "best" : ""}">${eur(p.price)}</td>`).join("")}</tr>
            <tr><td>Valoración</td>${items.map((p) => `<td class="${p.rating === Math.max(...items.map((i) => i.rating)) ? "best" : ""}">${p.rating} ★</td>`).join("")}</tr>
            ${keys.map((k) => { const b = best(k); return `<tr><td>${k}</td>${items.map((p) => `<td class="${b !== null && num(p.specs[k]) === b ? "best" : ""}">${p.specs[k]}</td>`).join("")}</tr>`; }).join("")}
            <tr><td></td>${items.map((p) => `<td><button class="btn btn-primary sm" data-cmp-add="${p.id}">Añadir</button></td>`).join("")}</tr>
          </tbody>
        </table></div>
      </div>`);
    $$("[data-cmp-add]", modalContent).forEach((b) => b.addEventListener("click", () => addToCart(b.dataset.cmpAdd)));
  });

  /* ---------------------------------------------------------
     Carrito
     --------------------------------------------------------- */
  const FREE_SHIP = 300, SHIP_COST = 9.9;
  let cart = store.get("altavia-cart", []).filter((i) => PRODUCTS.some((p) => p.id === i.id));
  const cartEl = $("#cart"), overlay = $("#overlay");

  function addToCart(id, color) {
    const p = PRODUCTS.find((x) => x.id === id);
    color = color || p.colors[0];
    const line = cart.find((i) => i.id === id && i.color === color);
    if (line) line.qty++; else cart.push({ id, color, qty: 1 });
    saveCart();
    toast(`${p.name} añadido al carrito`);
    const badge = $("#cartCount");
    badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
  }
  function saveCart() { store.set("altavia-cart", cart); renderCart(); }
  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const badge = $("#cartCount");
    badge.textContent = count;
    badge.classList.toggle("show", count > 0);
    const body = $("#cartItems");
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty"><div>🛸</div><p>Tu carrito está vacío</p><a href="#tienda" class="btn btn-ghost sm" id="goShop">Ir a la tienda</a></div>`;
      $("#goShop").addEventListener("click", closeCart);
    } else {
      body.innerHTML = cart.map((i, idx) => {
        const p = PRODUCTS.find((x) => x.id === i.id);
        return `<div class="cart-item">
          <div class="cart-thumb">${productArt(p, i.color)}</div>
          <div><h4>${p.name}</h4><span class="unit">${eur(p.price)}</span>
            <div class="qty"><button data-dec="${idx}" aria-label="Menos">−</button><span>${i.qty}</span><button data-inc="${idx}" aria-label="Más">+</button></div></div>
          <div class="right"><b>${eur(p.price * i.qty)}</b><button class="remove" data-rm="${idx}">Eliminar</button></div>
        </div>`;
      }).join("");
    }
    const sub = cart.reduce((s, i) => s + PRODUCTS.find((p) => p.id === i.id).price * i.qty, 0);
    const ship = sub === 0 || sub >= FREE_SHIP ? 0 : SHIP_COST;
    $("#cartSubtotal").textContent = eur(sub);
    $("#cartShipping").textContent = ship ? eur(ship) : "Gratis";
    $("#cartTotal").textContent = eur(sub + ship);
    $("#shipProgress").style.width = `${Math.min(100, (sub / FREE_SHIP) * 100)}%`;
    $("#shipMsg").textContent = sub >= FREE_SHIP ? "🎉 ¡Tienes envío gratuito!" : `Te faltan ${eur(FREE_SHIP - sub)} para el envío gratuito`;
    $("#checkoutBtn").disabled = !cart.length;
  }
  $("#cartItems").addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.inc) cart[+t.dataset.inc].qty++;
    else if (t.dataset.dec) { const i = cart[+t.dataset.dec]; i.qty--; if (!i.qty) cart.splice(+t.dataset.dec, 1); }
    else if (t.dataset.rm) cart.splice(+t.dataset.rm, 1);
    else return;
    saveCart();
  });
  function openCart() {
    cartEl.classList.add("open"); overlay.classList.add("show");
    cartEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    cartEl.classList.remove("open"); overlay.classList.remove("show");
    cartEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  $("#cartOpen").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  $("#checkoutBtn").addEventListener("click", () => {
    const total = $("#cartTotal").textContent;
    const order = "ALT-" + Math.floor(100000 + Math.random() * 900000);
    cart = []; saveCart(); closeCart();
    openModal(`<div class="success"><div class="tick">✓</div><h3>¡Pedido confirmado!</h3>
      <p>Número de pedido <b>${order}</b> · Total ${total}</p>
      <p>Recibirás un email con el seguimiento. Entrega estimada en 24–48 h.</p>
      <p style="font-size:.8rem">(Demostración: no se ha realizado ningún cargo.)</p></div>`);
  });

  /* ---------------------------------------------------------
     Testimonios (carrusel)
     --------------------------------------------------------- */
  const slides = $("#slides"), dots = $("#dots");
  slides.innerHTML = TESTIMONIALS.map((t) => `
    <div class="slide"><blockquote>
      <div class="stars">★★★★★</div><p>“${t.text}”</p>
      <footer><span class="avatar">${t.name.split(" ").map((w) => w[0]).join("")}</span><div><b>${t.name}</b><small>${t.role}</small></div></footer>
    </blockquote></div>`).join("");
  dots.innerHTML = TESTIMONIALS.map((_, i) => `<button aria-label="Testimonio ${i + 1}"></button>`).join("");
  let slide = 0, slideTimer;
  const goSlide = (n) => {
    slide = (n + TESTIMONIALS.length) % TESTIMONIALS.length;
    slides.style.transform = `translateX(-${slide * 100}%)`;
    $$("button", dots).forEach((d, i) => d.classList.toggle("active", i === slide));
  };
  const autoSlide = () => { clearInterval(slideTimer); slideTimer = setInterval(() => goSlide(slide + 1), 6000); };
  $("#prevSlide").addEventListener("click", () => { goSlide(slide - 1); autoSlide(); });
  $("#nextSlide").addEventListener("click", () => { goSlide(slide + 1); autoSlide(); });
  dots.addEventListener("click", (e) => { const i = $$("button", dots).indexOf(e.target); if (i >= 0) { goSlide(i); autoSlide(); } });
  let touchX = null;
  slides.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  slides.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { goSlide(slide + (dx < 0 ? 1 : -1)); autoSlide(); }
    touchX = null;
  });
  $("#slider").addEventListener("mouseenter", () => clearInterval(slideTimer));
  $("#slider").addEventListener("mouseleave", autoSlide);
  goSlide(0); autoSlide();

  /* ---------------------------------------------------------
     FAQ (acordeón)
     --------------------------------------------------------- */
  const faqList = $("#faqList");
  faqList.innerHTML = FAQS.map(([q, a], i) => `
    <div class="faq-item reveal">
      <button class="faq-q" aria-expanded="false" aria-controls="faq${i}">${q}<i>+</i></button>
      <div class="faq-a" id="faq${i}" role="region"><div><p>${a}</p></div></div>
    </div>`).join("");
  $$(".faq-item", faqList).forEach((el) => revealObs.observe(el));
  faqList.addEventListener("click", (e) => {
    const q = e.target.closest(".faq-q");
    if (!q) return;
    const item = q.parentElement, open = !item.classList.contains("open");
    $$(".faq-item", faqList).forEach((x) => { x.classList.remove("open"); $(".faq-q", x).setAttribute("aria-expanded", "false"); });
    if (open) { item.classList.add("open"); q.setAttribute("aria-expanded", "true"); }
  });

  /* ---------------------------------------------------------
     Formularios
     --------------------------------------------------------- */
  const form = $("#contactForm");
  const messages = {
    valueMissing: "Este campo es obligatorio",
    typeMismatch: "Introduce un email válido",
    tooShort: "Es demasiado corto",
    patternMismatch: "Formato no válido",
  };
  function validateField(input) {
    const field = input.closest(".field");
    if (!field) return input.checkValidity();
    const small = $("small", field);
    let msg = "";
    for (const k in messages) if (input.validity[k]) { msg = messages[k]; break; }
    field.classList.toggle("invalid", !!msg);
    if (small) small.textContent = msg;
    return !msg;
  }
  $$("input, textarea", form).forEach((i) => i.addEventListener("blur", () => validateField(i)));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = $$("input, textarea", form);
    const ok = fields.map(validateField).every(Boolean);
    if (!ok) {
      if (!form.elements["privacy"].checked) toast("Debes aceptar la política de privacidad", "!");
      fields.find((f) => !f.checkValidity())?.focus();
      return;
    }
    const name = form.elements["name"].value.trim().split(" ")[0];
    const btn = $("button[type=submit]", form);
    btn.disabled = true; btn.textContent = "Enviando…";
    setTimeout(() => {
      btn.disabled = false; btn.textContent = "Enviar mensaje";
      form.reset();
      openModal(`<div class="success"><div class="tick">✓</div><h3>¡Gracias, ${name.replace(/[<>&"]/g, "")}!</h3>
        <p>Hemos recibido tu mensaje. Un especialista te contactará en menos de 4 horas laborables.</p></div>`);
    }, 900);
  });
  $("#newsletter").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    toast("¡Suscripción confirmada! Revisa tu correo 📬");
  });

  /* ---------------------------------------------------------
     Inicio
     --------------------------------------------------------- */
  $("#year").textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
  renderCompareBar();
})();
