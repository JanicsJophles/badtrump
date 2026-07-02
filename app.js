(function () {
  const entries = (window.ENTRIES || []).slice();
  const timeline = document.getElementById("timeline");
  const chipsEl = document.getElementById("chips");
  const searchEl = document.getElementById("search");
  const sortBtn = document.getElementById("sort-btn");
  const expandBtn = document.getElementById("expand-btn");
  const randomBtn = document.getElementById("random-btn");
  const emptyEl = document.getElementById("empty");
  const resultCount = document.getElementById("result-count");

  const CAT_COLORS = {
    "Crypto & Personal Profit": "#f5b942",
    "Pardons & Rule of Law": "#e8493a",
    "Immigration & Enforcement": "#ff8c42",
    "Government, Health & Science": "#3ecfb2",
    "Economy, Tariffs & Foreign Policy": "#5b9cff",
    "Press, Speech & Democracy": "#b78bff",
    "Promises vs. Reality": "#ff6bb5",
    "Civil Rights & Culture": "#58d68d",
    "Military & National Security": "#aab4c4",
    "The Personal File": "#6ad4e0"
  };
  const catColor = c => CAT_COLORS[c] || "#e8493a";

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  let activeCat = null;
  let query = "";
  let newestFirst = true;
  let allExpanded = false;

  entries.forEach(e => { e.id = slug(e.date + "-" + e.title); });

  // ── header stats ──
  document.getElementById("stat-count").textContent = entries.length;
  const newest = entries.map(e => e.date).sort().at(-1) || "";
  document.getElementById("stat-updated").textContent = formatDate(newest);

  // day-of-term counter (term began Jan 20, 2025)
  const dayNum = Math.max(1, Math.floor((Date.now() - new Date("2025-01-20T12:00:00-05:00")) / 86400000) + 1);
  document.getElementById("day-num").textContent = dayNum;

  // ── ticker: shuffle titles through the chyron ──
  const tickerInner = document.getElementById("ticker-inner");
  if (tickerInner && entries.length) {
    const titles = entries.map(e => e.title).sort(() => Math.random() - 0.5);
    tickerInner.innerHTML = titles.map(t => `<span>${escapeHtml(t)}</span>`).join("");
    // pace the crawl at a constant speed no matter how many headlines are loaded
    requestAnimationFrame(() => {
      const SPEED = 45; // pixels per second
      tickerInner.style.animationDuration = Math.round(tickerInner.scrollWidth / SPEED) + "s";
    });
  }

  // ── category chips ──
  const counts = {};
  entries.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
  const cats = Object.keys(counts).sort();

  const allChip = makeChip(`ALL <span class="n">${entries.length}</span>`, null, "#e8493a");
  allChip.classList.add("active");
  chipsEl.appendChild(allChip);
  cats.forEach(cat => chipsEl.appendChild(makeChip(`${escapeHtml(cat)} <span class="n">${counts[cat]}</span>`, cat, catColor(cat))));

  function makeChip(html, cat, color) {
    const b = document.createElement("button");
    b.className = "chip";
    b.style.setProperty("--chip-color", color);
    b.innerHTML = html;
    b.addEventListener("click", () => {
      activeCat = cat;
      chipsEl.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      b.classList.add("active");
      render();
    });
    return b;
  }

  // ── controls ──
  searchEl.addEventListener("input", () => { query = searchEl.value.trim().toLowerCase(); render(); });

  sortBtn.addEventListener("click", () => {
    newestFirst = !newestFirst;
    sortBtn.textContent = newestFirst ? "newest first ↓" : "oldest first ↑";
    render();
  });

  expandBtn.addEventListener("click", () => {
    allExpanded = !allExpanded;
    expandBtn.textContent = allExpanded ? "collapse all" : "expand all";
    timeline.querySelectorAll("details").forEach(d => { d.open = allExpanded; });
  });

  randomBtn.addEventListener("click", () => {
    const pick = entries[Math.floor(Math.random() * entries.length)];
    if (pick) revealEntry(pick.id);
  });

  // ── rendering ──
  function matches(e) {
    if (activeCat && e.category !== activeCat) return false;
    if (!query) return true;
    return (e.title + " " + e.summary + " " + e.details + " " + e.category).toLowerCase().includes(query);
  }

  function render() {
    const visible = entries.filter(matches).sort((a, b) =>
      newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );

    timeline.innerHTML = "";
    emptyEl.hidden = visible.length > 0;
    resultCount.textContent = query || activeCat ? `${visible.length} shown` : "";

    const frag = document.createDocumentFragment();
    let lastMonth = "";
    visible.forEach(e => {
      const monthKey = e.date.slice(0, 7);
      if (monthKey !== lastMonth) {
        lastMonth = monthKey;
        const [y, m] = monthKey.split("-");
        const marker = document.createElement("li");
        marker.className = "month-marker";
        marker.textContent = `${MONTHS_FULL[+m - 1]} ${y}`;
        frag.appendChild(marker);
      }

      const li = document.createElement("li");
      const sources = (e.sources || [])
        .map(s => `<a href="${escapeAttr(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.name)}</a>`)
        .join("");
      li.innerHTML = `
        <details class="entry" id="${e.id}" style="--cat-color:${catColor(e.category)}"${allExpanded ? " open" : ""}>
          <summary>
            <span class="entry-date">${formatDate(e.date)}</span>
            <span class="entry-title">${escapeHtml(e.title)}</span>
            <span class="entry-summary">${escapeHtml(e.summary)}</span>
            <span class="entry-cat">${escapeHtml(e.category)}</span>
          </summary>
          <div class="entry-body">
            <p>${escapeHtml(e.details)}</p>
            <div class="entry-foot">
              <div class="entry-sources">${sources}</div>
              <button class="copy-link" data-id="${e.id}" title="Copy a direct link to this receipt">copy link</button>
            </div>
          </div>
        </details>`;
      frag.appendChild(li);
    });
    timeline.appendChild(frag);
  }

  // copy-link buttons (event delegation)
  timeline.addEventListener("click", ev => {
    const btn = ev.target.closest(".copy-link");
    if (!btn) return;
    const url = location.origin + location.pathname + "#" + btn.dataset.id;
    navigator.clipboard.writeText(url).then(() => {
      btn.textContent = "copied ✓";
      setTimeout(() => { btn.textContent = "copy link"; }, 1500);
    });
  });

  function revealEntry(id) {
    // clear filters so the entry is present in the DOM
    if (activeCat || query) {
      activeCat = null;
      query = "";
      searchEl.value = "";
      chipsEl.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chipsEl.querySelector(".chip").classList.add("active");
      render();
    }
    const el = document.getElementById(id);
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("flash");
    void el.offsetWidth; // restart animation
    el.classList.add("flash");
  }

  // deep links: #slug opens that entry on load
  if (location.hash.length > 1) {
    setTimeout(() => revealEntry(location.hash.slice(1)), 50);
  }

  // keyboard: "/" focuses search, Escape clears it
  document.addEventListener("keydown", ev => {
    if (ev.key === "/" && document.activeElement !== searchEl) {
      ev.preventDefault();
      searchEl.focus();
    } else if (ev.key === "Escape" && document.activeElement === searchEl) {
      searchEl.value = "";
      query = "";
      render();
      searchEl.blur();
    }
  });

  // ── helpers ──
  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  }

  function formatDate(d) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return day ? `${MONTHS[+m - 1]} ${+day}, ${y}` : `${MONTHS[+m - 1]} ${y}`;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function escapeAttr(s) {
    const url = String(s ?? "");
    return /^https?:\/\//i.test(url) ? escapeHtml(url) : "#";
  }

  render();
})();
