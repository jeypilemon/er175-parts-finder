let currentTab = "aftermarket";
let currentCategory = "All";
let globalKeyword = "";

let manualData = [];
let aftermarketParts = [];
let oemParts = [];
let troubleshootData = [];


const ownersManualPDF =
"https://drive.google.com/file/d/1xJyf7sNn1Nlo7X4r0a3X6W_R5pUabHbQ/view";

const products = document.getElementById("products");


function loadManual(url){

    Papa.parse(url,{
        download:true,
        header:true,

        complete:(res)=>{

            manualData = res.data.filter(x => x["Category"]);

            renderChips();   // IMPORTANT
            render();        // IMPORTANT
        }

    });
}

/* =========================
LOAD SHEETS
========================= */
function resetFilters() {

    // Reset filter variables
    globalKeyword = "";
    currentCategory = "All";

    // Clear search input
    const search = document.getElementById("search");
    if (search) {
        search.value = "";
    }

    // Rebuild chips so "All" becomes active
    renderChips();

    // Render the current tab
    render();
}

function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            aftermarketParts = res.data.filter(p => p["Parts Name"]);
            renderChips();
            render();
        }
    });
}

function loadOEM(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            oemParts = res.data.filter(p => p["Parts Name"]);
            renderChips();
            render();
        }
    });
}

function loadTroubleshoot(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            troubleshootData = res.data.filter(p => p["Known Issue"]);
            renderChips();
            render();
        }
    });
}

/* =========================
MAIN RENDER
========================= */

function render() {
    const container = document.getElementById("products");
    container.classList.remove("manual-mode");
    container.innerHTML = "";


    if(currentTab==="manual"){
    renderManual();
    return;
}

    if (currentTab === "troubleshoot") {
        renderTroubleshoot();
        return;
    }

    const data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const keyword = globalKeyword;

    const filtered = data.filter(p => {
        const name = normalizeText(p["Parts Name"] || "");
        const category = normalizeText(p["Parts Category"] || "");

        return (
            (name.includes(keyword) || category.includes(keyword)) &&
            (currentCategory === "All" || p["Parts Category"] === currentCategory)
        );
    });

    filtered.forEach(part => {

        let extraHTML = "";

if (currentTab === "aftermarket") {

    const brand = part["Brand"];
    const compat = part["Compatibility"];
    const size = part["Spec Size"];

    extraHTML = `
        <div class="meta">

            ${brand ? `
            <div class="meta-row">
                <span class="meta-label"><span class="icon"></span> <b>Brand:</b></span>
                <span class="meta-value">${brand}</span>
            </div>` : ""}

            ${compat ? `
            <div class="meta-row">
                <span class="meta-label"><span class="icon"></span><b>Compatibility:</b></span>
                <span class="meta-value">${compat}</span>
            </div>` : ""}

            ${size ? `
            <div class="meta-row">
                <span class="meta-label"><span class="icon"></span> <b>Spec Size:</b></span>
                <span class="meta-value">${size}</span>
            </div>` : ""}

        </div>
    `;
}

        // OEM ONLY COLOR LOGIC
        if (currentTab === "oem") {
            const isFairing = (part["Parts Category"] || "")
                .toLowerCase()
                .includes("fairing");

            if (isFairing && part["Color"]) {
                extraHTML = `
                    <div class="meta">
                        <span> <b>Color:</b> ${part["Color"]}</span>
                    </div>
                `;
            }
        }

        container.innerHTML += `
            <div class="card ${currentTab === "oem" ? "oem-card" : ""}">

                <img src="${part["Preview"] || ""}">

                <h3>${part["Parts Name"]}</h3>

                <p>${part["Parts Category"]}</p>

                ${extraHTML}

                <a class="button" href="${part["Shopee"]}" target="_blank">
                    Buy on Shopee
                </a>

            </div>
        `;
    });
}

/* =========================
TROUBLESHOOT RENDER (FIXED)
========================= */

function renderTroubleshoot() {
    const container = document.getElementById("products");
    container.innerHTML = "";

    const filtered = troubleshootData.filter(item => {
        const issue = normalizeText(item["Known Issue"] || "");
        const solution = normalizeText(item["Possible Solution"] || "");
        const tags = (item["Tags"] || "").toLowerCase();

        return (
            (issue.includes(globalKeyword) || solution.includes(globalKeyword)) &&
            (currentCategory === "All" || tags.includes(currentCategory.toLowerCase()))
        );
    });

    filtered.forEach((item, index) => {

        const issue = item["Known Issue"] || "";
        const solutionRaw = item["Possible Solution"] || "";

        const youtubeLinks = extractLinks(solutionRaw, "youtube.com");
        const tiktokLinks = extractLinks(solutionRaw, "tiktok.com");
        const fbLinks = extractLinks(solutionRaw, "facebook.com");

        const cleanText = linkifySolution(solutionRaw);

        container.innerHTML += `
        <div class="help-card">

            <div class="help-header" onclick="toggleCard(${index})">
                ⚠️ ${issue}
            </div>

            <div class="help-body" id="card-${index}">

                <div class="help-solution">
                    ${cleanText}
                </div>

                ${renderButtons(youtubeLinks, "youtube")}
                ${renderButtons(tiktokLinks, "tiktok")}
                ${renderButtons(fbLinks, "facebook")}

            </div>
        </div>`;
    });
}

function getCategoryIcon() {
    return "";
}

function renderManual() {

    const container = document.getElementById("products");
    container.classList.add("manual-mode");
    container.innerHTML = "";

    const filtered = (manualData || []).filter(item => {

    return (
        normalizeText(item["Category"] || "").includes(globalKeyword) ||
        normalizeText(item["Specification"] || "").includes(globalKeyword) ||
        normalizeText(item["Value"] || "").includes(globalKeyword)
    );

});

    // Group categories
    const grouped = {};

    filtered.forEach(item => {

        const category = item["Category"] || "Other";

        if (!grouped[category]) grouped[category] = [];

        grouped[category].push(item);

    });

    let html = `
    <div class="manual-download">
        <a href="${ownersManualPDF}"
           target="_blank"
           class="manual-download-btn">

            📄 Download Official Owner's Manual (PDF)

        </a>
    </div>
    `;

    Object.keys(grouped).forEach(category => {

        const open = category === "Quick Specifications" ? "open" : "";

        html += `

        <details class="manual-section" ${open}>

            <summary>

                <span>

                    ${getCategoryIcon(category)}

                    ${category}

                </span>

            </summary>

            <div class="manual-card">
        `;

        grouped[category].forEach(item => {

            html += `

            <div class="manual-row">

                <div class="manual-spec">

                    ${highlight(item["Specification"])}

                </div>

                <div class="manual-value">

                    ${highlight(item["Value"])}

                </div>

            </div>

            `;

        });

        html += `
            </div>

        </details>
        `;

        if (Object.keys(grouped).length === 0) {
    html += `
        <div style="padding:20px;text-align:center;color:#777;">
            No manual data found
        </div>
    `;
}

    });

    container.innerHTML = html;

}

/* =========================
LINK EXTRACTOR
========================= */


function extractLinks(text, keyword) {
    if (!text) return [];
    return (text.match(/https?:\/\/[^\s]+/g) || [])
        .filter(link => link.includes(keyword));
}

/* =========================
UI HELPERS
========================= */

function linkifySolution(text) {
    if (!text) return "";

    let formatted = text.replace(/\n/g, "<br>");

    // YouTube
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?youtube\.com\/[^\s<]+)/g,
        `<a class="inline-link youtube" href="$1" target="_blank" rel="noopener noreferrer">
            ▶ Watch YouTube
        </a>`
    );

    // TikTok
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?tiktok\.com\/[^\s<]+)/g,
        `<a class="inline-link tiktok" href="$1" target="_blank" rel="noopener noreferrer">
            🎵 Watch TikTok
        </a>`
    );

    // Facebook
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?facebook\.com\/[^\s<]+)/g,
        `<a class="inline-link facebook" href="$1" target="_blank" rel="noopener noreferrer">
            📘 View in Facebook
        </a>`
    );

    return formatted;
}
/*Helper function to highlight search keywords in the text*/

function highlight(text){

    if(!globalKeyword) return text;

    const reg = new RegExp(`(${globalKeyword})`, "ig");

    return text.replace(reg,"<mark>$1</mark>");
}

function toggleCard(index) {
    const el = document.getElementById(`card-${index}`);
    if (el) el.classList.toggle("open");
}

function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();
}

/* =========================
TABS
========================= */

function switchTab(tab) {
    currentTab = tab;
    currentCategory = "All";
    

    updateTabUI();

    renderChips();
    render();
}

/* =========================
CATEGORIES (FIXED - NO DUPLICATES)
========================= */

function getCategories(data) {
    const categories = [...new Set(
        data.map(p => p["Parts Category"]).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    return ["All", ...categories];
}

function getTroubleCategories(data) {
    const tags = [...new Set(
        data.flatMap(item =>
            (item["Tags"] || "")
                .split(",")
                .map(t => t.trim())
                .filter(Boolean)
        )
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    return ["All", ...tags];
}

function renderChips() {

    const chips = document.getElementById("chips");

    let categories = [];

    if (currentTab === "manual") {
        chips.innerHTML = "";
        return;
    }

    if (currentTab === "troubleshoot") {
        categories = getTroubleCategories(troubleshootData);
    }
    else if (currentTab === "aftermarket") {
        categories = getCategories(aftermarketParts);
    }
    else if (currentTab === "oem") {
        categories = getCategories(oemParts);
    }

    chips.innerHTML = categories.map(cat => `
        <button class="${currentCategory === cat ? "active" : ""}"
            onclick="setCategory('${cat}')">
            ${cat}
        </button>
    `).join("");
}

function setCategory(cat){
    currentCategory = cat;
    renderChips();
    render();
}

/* =========================
INIT
========================= */

document.getElementById("search").addEventListener("input", (e) => {
    globalKeyword = normalizeText(e.target.value);
    render();
});


function updateTabUI() {
    document.getElementById("tab-aftermarket").classList.remove("active");
    document.getElementById("tab-oem").classList.remove("active");
    document.getElementById("tab-troubleshoot").classList.remove("active");
    document.getElementById("tab-manual").classList.remove("active");

    document.getElementById(`tab-${currentTab}`).classList.add("active");
}

/* =========================
DATA URLS (PUT YOUR SHEETS HERE)
========================= */

loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");

loadTroubleshoot("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=557855511&single=true&output=csv");

loadManual("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=56637698&single=true&output=csv");