let currentTab = "aftermarket";
let currentCategory = "All";
let aftermarketParts = [];
let oemParts = [];
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

const synonymMap = {
    "break": "brake",
    "brakepad": "brake pad",
    "brakepads": "brake pad",
    "pads": "pad"
};

const products = document.getElementById("products");

/* ---------------------------
LOAD AFTERMARKET SHEET
----------------------------*/
function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(res) {
            aftermarketParts = res.data.filter(p => p["Parts Name"]);
            renderChips();
            render();
        }
    });
}

/* ---------------------------
LOAD OEM SHEET
----------------------------*/
function loadOEM(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(res) {
            oemParts = res.data.filter(p => p["Parts Name"]);
            renderChips();
            render();
        }
    });
}

/* ---------------------------
RENDER FUNCTION
----------------------------*/
function render() {

    let data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const rawKeyword = document.getElementById("search")?.value || "";
    const keyword = normalizeText(rawKeyword);

    let filtered = data.filter(p => {

        const name = normalizeText(p["Parts Name"] || "");
        const category = normalizeText(p["Parts Category"] || "");

        const matchSearch =
            name.includes(keyword) ||
            category.includes(keyword);

        const matchCategory =
            currentCategory === "All" ||
            p["Parts Category"] === currentCategory;

        return matchSearch && matchCategory;
    });

    products.innerHTML = "";

    if (filtered.length === 0) {
        products.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No parts found</h3>
                <p>Try different keywords or category</p>
                <button onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
        return;
    }

    filtered.forEach(part => {

        let extra = "";

/* AFTERMARKET */
if (currentTab === "aftermarket") {
    extra += `
        <div class="meta">
            <span>🏷 Brand: ${part["Brand"] || "-"}</span>
            <span>🔧 Compatibility: ${part["Compatibility"] || "-"}</span>
            <span>📏 Specs/Size: ${part["Spec Size"] || "-"}</span>
        </div>
    `;
}

/* OEM FAIRINGS ONLY */
const category = (part["Parts Category"] || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const isFairing = category.includes("fairing");
const color = (part["Color"] || "").trim();

if (currentTab === "oem" && category.includes("fairing")) {
    extra += `
        <div class="meta">
            <span>🎨 Color: ${part["Color"] || "No color listed"}</span>
        </div>
    `;
}


        products.innerHTML += `
            <div class="card">
                <img src="${part["Preview"] || ''}" loading="lazy">
                <h3>${part["Parts Name"] || ""}</h3>
                <p><b>Category:</b> ${part["Parts Category"] || ""}</p>
                ${extra}

                <a class="button"
                   href="${part["Shopee"] || "#"}"
                   target="_blank"
                   onclick="trackClick('${part["Parts Name"] || ""}')">
                   Buy on Shopee
                </a>
            </div>
        `;
    });
}


/* tab logic */
function updateTabUI() {

    document.getElementById("tab-aftermarket")
        .classList.remove("active");

    document.getElementById("tab-oem")
        .classList.remove("active");

    if (currentTab === "aftermarket") {
        document.getElementById("tab-aftermarket")
            .classList.add("active");
    }

    if (currentTab === "oem") {
        document.getElementById("tab-oem")
            .classList.add("active");
    }
}

/* ---------------------------
TAB SWITCH
----------------------------*/
function switchTab(tab) {
    currentTab = tab;
    currentCategory = "All";

    updateTabUI();   // 🔥 highlight tabs
    renderChips();
    render();
}

/* ---------------------------
Search Listeners
----------------------------*/
document.addEventListener("input", (e) => {

    if (e.target.id === "search") {

        clearTimeout(window.searchTimeout);

        window.searchTimeout = setTimeout(() => {

            const keyword = (e.target.value || "").toLowerCase();

            saveSearch(keyword);
            renderSuggestions(keyword);
            render();

        }, 150);
    }
});


//category logic    
function setCategory(cat) {
    currentCategory = cat;
    renderChips();   // 🔥 IMPORTANT: refresh chips UI
    render();
}


//Category filter
function getCategories(data) {

    const cats = data
        .map(p => p["Parts Category"])
        .filter(Boolean);

    return ["All", ...new Set(cats)];
}

//Render category chips
function renderChips() {

    const chips = document.getElementById("chips");

    let data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const categories = getCategories(data);

    chips.innerHTML = "";

    categories.forEach(cat => {

        chips.innerHTML += `
        <button class="chip ${currentCategory === cat ? 'active' : ''}"
        onclick="setCategory('${cat}')">
            ${cat}
        </button>
        `;
    });
}


/*Search suggestions*/
function renderSuggestions(keyword) {

    const box = document.getElementById("suggestions");
    

    if (!keyword) {
        box.innerHTML = "";
        return;
    }

    const data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const suggestions = data
    .filter(p => {
        const name = normalizeText(p["Parts Name"]);
        return name.includes(keyword);
    })
    .slice(0, 5);

    box.innerHTML = suggestions.map(p => `
    <div class="suggestion-item"
     data-name="${p["Parts Name"]}"
     onclick="selectSuggestion(this.dataset.name)">
    🔍 ${p["Parts Name"]}
</div>
`).join("");
}

/*Select suggestion*/
function selectSuggestion(name) {
    const input = document.getElementById("search");

    input.value = name;

    document.getElementById("suggestions").innerHTML = "";

    currentCategory = "All"; // 🔥 reset filter so results don’t get blocked

    render();
}

/*Reset filters*/

function resetFilters() {
    currentCategory = "All";
    document.getElementById("search").value = "";

    renderChips();
    render();
}

/*FeaturedProducts Logic*/
function renderFeatured() {

    const data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    if (!data || data.length === 0) return;

    const featured = data.slice(0, 3);

    document.getElementById("featured").innerHTML = `
        <h3>🔥 Featured Parts</h3>
        <div class="featured-grid">
            ${featured.map(p => `
                <div class="featured-card">
                    <img src="${p["Preview"] || ''}">
                    <p>${p["Parts Name"] || ''}</p>
                </div>
            `).join("")}
        </div>
    `;
}

/*Save recent searches to local storage*/

function saveSearch(keyword) {

    if (!keyword) return;

    recentSearches.unshift(keyword);

    recentSearches = [...new Set(recentSearches)].slice(0, 5);

    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
}


/*Track clicks on Shopee links*/
function trackClick(name) {

    let clicks = JSON.parse(localStorage.getItem("clicks")) || {};

    clicks[name] = (clicks[name] || 0) + 1;

    localStorage.setItem("clicks", JSON.stringify(clicks));
}

/*Top Clicked Parts*/
function getTopClicked() {

    let clicks = JSON.parse(localStorage.getItem("clicks")) || {};

    return Object.entries(clicks)
        .sort((a,b) => b[1]-a[1])
        .slice(0,3);
}

/*Open Featured Product in new tab and track clicks*/
function openProduct(link, name) {
    trackClick(name);
    window.open(link, "_blank");
}



function closeBanner() {
    document.querySelector(".support-banner").style.display = "none";
}

function normalizeText(text) {
    return applySynonyms((text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim());
}


function applySynonyms(text) {
    let t = text;

    Object.keys(synonymMap).forEach(key => {
        const regex = new RegExp(key, "g");
        t = t.replace(regex, synonymMap[key]);
    });

    return t;
}

/*helper show color for fairings*/
function showColor(part) {
    return currentTab === "aftermarket" ||
           (currentTab === "oem" && (part["Parts Category"] || "").toLowerCase() === "fairings");
}

/*Loads Category Chips on page load*/

window.addEventListener("load", () => {
    updateTabUI();
    render();
});


/* Database URLs */

loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");


updateTabUI();