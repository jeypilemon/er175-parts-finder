let currentTab = "aftermarket";
let currentCategory = "All";
let globalKeyword = "";

/* =========================
DATA STORAGE
========================= */
let manualData = [];
let aftermarketParts = [];
let oemParts = [];
let troubleshootData = [];

/* =========================
DOM
========================= */
const products = document.getElementById("products");

/* =========================
HELPERS
========================= */
function normalizeText(text) {
    return (text || "").toLowerCase().replace(/\s+/g, "").trim();
}

/* =========================
LOAD DATA (FAST + SAFE)
========================= */
function loadManual(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: (res) => {
            manualData = (res.data || []).filter(x => x["Category"]);
            renderChips();
            render();
        }
    });
}

function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: (res) => {
            aftermarketParts = (res.data || [])
                .filter(p => p["Parts Name"])
                .map(p => ({
                    ...p,
                    _name: normalizeText(p["Parts Name"]),
                    _cat: normalizeText(p["Parts Category"])
                }));

            renderChips();
            render();
        }
    });
}

function loadOEM(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: (res) => {
            oemParts = (res.data || [])
                .filter(p => p["Parts Name"])
                .map(p => ({
                    ...p,
                    _name: normalizeText(p["Parts Name"]),
                    _cat: normalizeText(p["Parts Category"])
                }));

            renderChips();
            render();
        }
    });
}

function loadTroubleshoot(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: (res) => {
            troubleshootData = (res.data || [])
                .filter(p => p["Known Issue"])
                .map(p => ({
                    ...p,
                    _issue: normalizeText(p["Known Issue"]),
                    _solution: normalizeText(p["Possible Solution"] || ""),
                    _tags: normalizeText(p["Tags"] || "")
                }));

            renderChips();
            render();
        }
    });
}

/* =========================
RESET
========================= */
function resetFilters() {
    globalKeyword = "";
    currentCategory = "All";

    const search = document.getElementById("search");
    if (search) search.value = "";

    renderChips();
    render();
}

/* =========================
RENDER MAIN
========================= */
function render() {
    if (!products) return;

    products.innerHTML = "";

    if (currentTab === "troubleshoot") {
        renderTroubleshoot();
        return;
    }

    if (currentTab === "manual") {
        renderManual();
        return;
    }

    const data = currentTab === "aftermarket" ? aftermarketParts : oemParts;

    const filtered = data.filter(p => {
        return (
            (p._name?.includes(globalKeyword) || p._cat?.includes(globalKeyword)) &&
            (currentCategory === "All" || p["Parts Category"] === currentCategory)
        );
    });

    let html = "";

    for (const part of filtered) {

        let extraHTML = "";

        if (currentTab === "aftermarket") {
            extraHTML = `
                <div class="meta">
                    ${part["Brand"] ? `<div><b>Brand:</b> ${part["Brand"]}</div>` : ""}
                    ${part["Compatibility"] ? `<div><b>Compat:</b> ${part["Compatibility"]}</div>` : ""}
                    ${part["Spec Size"] ? `<div><b>Size:</b> ${part["Spec Size"]}</div>` : ""}
                </div>
            `;
        }

        if (currentTab === "oem") {
            const isFairing = (part["Parts Category"] || "").toLowerCase().includes("fairing");
            if (isFairing && part["Color"]) {
                extraHTML = `<div class="meta"><b>Color:</b> ${part["Color"]}</div>`;
            }
        }

        html += `
            <div class="card ${currentTab === "oem" ? "oem-card" : ""}">
                <img src="${part["Preview"] || ""}">
                <h3>${part["Parts Name"]}</h3>
                <p>${part["Parts Category"]}</p>
                ${extraHTML}
                <a class="button" href="${part["Shopee"]}" target="_blank">Buy on Shopee</a>
            </div>
        `;
    }

    products.innerHTML = html;
}

/* =========================
TROUBLESHOOT (FIXED)
========================= */
function renderTroubleshoot() {
    let html = "";

    const filtered = troubleshootData.filter(item => {
        return (
            (item._issue?.includes(globalKeyword) || item._solution?.includes(globalKeyword)) &&
            (currentCategory === "All" || item._tags?.includes(currentCategory.toLowerCase()))
        );
    });

    filtered.forEach((item, index) => {
        html += `
        <div class="help-card">
            <div class="help-header" onclick="toggleCard(${index})">
                ⚠️ ${item["Known Issue"]}
            </div>

            <div class="help-body" id="card-${index}">
                <div class="help-solution">
                    ${item["Possible Solution"] || ""}
                </div>
            </div>
        </div>
        `;
    });

    products.innerHTML = html;
}

/* =========================
MANUAL (SAFE)
========================= */
function renderManual() {

    let html = "";

    const filtered = (manualData || []).filter(item => {
        return (
            normalizeText(item["Category"] || "").includes(globalKeyword) ||
            normalizeText(item["Specification"] || "").includes(globalKeyword) ||
            normalizeText(item["Value"] || "").includes(globalKeyword)
        );
    });

    const grouped = {};

    for (const item of filtered) {
        const cat = item["Category"] || "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    }

    html += `
        <div class="manual-download">
            <a class="manual-download-btn" target="_blank" href="#">
                📄 Download Manual
            </a>
        </div>
    `;

    for (const cat in grouped) {
        html += `
        <details class="manual-section">
            <summary>${cat}</summary>
            <div class="manual-card">
        `;

        grouped[cat].forEach(item => {
            html += `
                <div class="manual-row">
                    <div class="manual-spec">${item["Specification"]}</div>
                    <div class="manual-value">${item["Value"]}</div>
                </div>
            `;
        });

        html += `</div></details>`;
    }

    products.innerHTML = html;
}

/* =========================
CATEGORIES
========================= */
function getCategories(data) {
    return ["All", ...new Set(data.map(p => p["Parts Category"]).filter(Boolean))];
}

function getTroubleCategories(data) {
    return ["All", ...new Set(data.flatMap(i =>
        (i["Tags"] || "").split(",").map(t => t.trim())
    ).filter(Boolean))];
}

function renderChips() {
    const chips = document.getElementById("chips");
    if (!chips) return;

    let categories = [];

    if (currentTab === "aftermarket") categories = getCategories(aftermarketParts);
    else if (currentTab === "oem") categories = getCategories(oemParts);
    else if (currentTab === "troubleshoot") categories = getTroubleCategories(troubleshootData);
    else return (chips.innerHTML = "");

    chips.innerHTML = categories.map(cat => `
        <button class="${currentCategory === cat ? "active" : ""}"
        onclick="setCategory('${cat}')">${cat}</button>
    `).join("");
}

function setCategory(cat) {
    currentCategory = cat;
    renderChips();
    render();
}

/* =========================
TAB SWITCH
========================= */
function switchTab(tab) {
    currentTab = tab;
    currentCategory = "All";
    updateTabUI();
    renderChips();
    render();
}

function updateTabUI() {
    ["aftermarket", "oem", "troubleshoot", "manual"].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if (el) el.classList.remove("active");
    });

    const active = document.getElementById(`tab-${currentTab}`);
    if (active) active.classList.add("active");
}

/* =========================
SEARCH
========================= */
document.getElementById("search").addEventListener("input", e => {
    globalKeyword = normalizeText(e.target.value);
    render();
});

/* =========================
DATA URLS (PUT YOUR SHEETS HERE)
========================= */

loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");

loadTroubleshoot("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=557855511&single=true&output=csv");

loadManual("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=56637698&single=true&output=csv");