
function renderSkeleton(count = 6) {
    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="card skeleton-card">
            <div class="skeleton image"></div>
            <div class="skeleton text short"></div>
            <div class="skeleton text"></div>
            <div class="skeleton text"></div>
        </div>
    `).join("");
}

function render() {

    if (isLoading) {
        renderSkeleton();
        return;
    }

    container.classList.remove("manual-mode", "grid-layout");

    if (currentTab === "aftermarket" || currentTab === "oem") {
        container.classList.add("grid-layout");
    }

    if (currentTab === "manual") {
        container.classList.add("manual-mode");
        return renderManual();
    }

    if (currentTab === "troubleshoot") {
        return renderTroubleshoot();
    }

    const data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const filtered = data.filter(p => {
        const name = normalizeText(p["Parts Name"]);
        const cat = normalizeText(p["Parts Category"]);

        return (
            (name.includes(globalKeyword) || cat.includes(globalKeyword)) &&
            (currentCategory === "All" || p["Parts Category"] === currentCategory)
        );
    });

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state">${getEmptyStateMessage()}</div>`;
        return;
    }

    container.innerHTML = filtered.map(part => `
    <div class="card">

        <img 
            src="${part["Preview"] || ""}" 
            onerror="this.style.display='none'"
        >

        <div class="card-content">

            <h3>${part["Parts Name"]}</h3>

            <span class="category">
                ${part["Parts Category"] || ""}
            </span>

            ${
    part["Spec Size"] 
    ? `<div class="specs ${part["Spec Size"].toLowerCase().includes("plug") ? "plug-fit" : ""}">
        ${part["Spec Size"]}
       </div>`
    : ""
}

        </div>

        <a class="button" href="${part["Shopee"]}" target="_blank">
            View Product
        </a>

    </div>
`).join("");

    updateTabUI();
}

function renderTroubleshoot() {

    const filtered = troubleshootData.filter(item => {
        const issue = normalizeText(item["Known Issue"]);
        const sol = normalizeText(item["Possible Solution"]);
        const tags = (item["Tags"] || "").toLowerCase();

        return (
            (issue.includes(globalKeyword) || sol.includes(globalKeyword)) &&
            (currentCategory === "All" || tags.includes(currentCategory.toLowerCase()))
        );
    });

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state">No results found</div>`;
        return;
    }

    container.innerHTML = filtered.map((item, i) => `
        <div class="help-card">
            <div class="help-header" onclick="toggleCard('card-${i}')">
                ⚠️ ${item["Known Issue"]}
            </div>
            <div class="help-body" id="card-${i}">
                <div class="help-solution">
                 ${linkifySolution(item["Possible Solution"])}
                </div>
            </div>
        </div>
    `).join("");

    updateTabUI();
}

function renderManual() {

    container.innerHTML = `

    <div class="manual-download">

        <a class="manual-download-btn"
        href="https://drive.google.com/file/d/1xJyf7sNn1Nlo7X4r0a3X6W_R5pUabHbQ/view"
        target="_blank">

        Download Owner's Manual PDF (Official)

        </a>

    </div>

    <div id="manualContent">

        <div class="empty-state">
            Select a manual section
        </div>

    </div>


    `;


    updateTabUI();

}

function renderManualSpecs() {

    const filtered = manualData.filter(item => {

    const searchText = normalizeText(
    (item["Category"] || "") +
" " +
(item["Specification"] || "") +
" " +
(item["Value"] || "") +
" " +
(item["Notes"] || "")
);

return searchText.includes(
    normalizeText(globalKeyword)
);
    });


    const grouped = {};

    filtered.forEach(item => {

        const category = item["Category"] || "Other";

        if (!grouped[category]) {
            grouped[category] = [];
        }

        grouped[category].push(item);

    });


    let html = "";


    if(filtered.length === 0){

        document.getElementById("manualContent").innerHTML = `
        <div class="empty-state">
        No manual information found
        </div>
        `;

        return;
    }



    Object.keys(grouped).forEach(category => {


        html += `

        <section class="manual-section">

            <h3 class="manual-section-title">
                ${category}
            </h3>


            <div class="manual-card">

        `;


        grouped[category].forEach(item=>{


            html += `

            <div class="manual-row">

<div>
    <div class="manual-spec">
        ${safeHighlight(item["Specification"])}
    </div>
</div>


<div class="manual-value">
    ${safeHighlight(item["Value"])}
</div>

</div>

            `;


        });



        html += `

            </div>

        </section>

        `;


    });



    document.getElementById("manualContent").innerHTML = html;

    updateTabUI();

}

function updateSearchPlaceholder() {
    const search = document.getElementById("search");

    if (currentTab === "manual") {
        search.placeholder = "What do you want? (e.g. oil capacity, torque spec)";
    } else if (currentTab === "troubleshoot") {
        search.placeholder = "Search issues (e.g. no power, check engine light on, vibration)";
    } else {
        search.placeholder = "Search parts (e.g. bearing, seat cover, brake pads)";
    }
}

function toggleCard(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.toggle("open");
}

function updateTabUI() {
    document.querySelectorAll(".seg").forEach(btn => {
        btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(`[data-tab="${currentTab}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

function switchTab(tab) {

    currentTab = tab;
    currentCategory = "All";

    container.classList.remove("manual-mode");


    if(tab === "manual"){

        renderManualChips();

    }
    else{

        renderChips();

    }


    render();

    updateSearchPlaceholder();

    setTimeout(updateChipArrow,100);
    

}

function setCategory(cat) {
    currentCategory = cat;
    renderChips();
    render();
}

function resetFilters() {

    globalKeyword = "";
    manualSearch = "";
    currentCategory = "All";

    document.getElementById("search").value = "";

    renderChips();
    render();

}

