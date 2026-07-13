function renderMistakes() {
    const content = document.getElementById("manualContent");
    if (!content) return;

    const dataset = window.manualMistakes || manualMistakes || [];

    // ==========================================
    // 1. PERSISTENT LAYOUT WRAPPER ENGINE
    // ==========================================
    let gridContainer = content.querySelector(".mistake-grid");
    if (!gridContainer) {
        content.innerHTML = `
        <div class="manual-tip">
            🚫 Learn from common servicing mistakes to avoid costly repairs.
        </div>
        <div class="mistake-grid"></div>
        `;
        gridContainer = content.querySelector(".mistake-grid");
    }

    // ==========================================
    // 2. DATA FILTERING
    // ==========================================
    if (!dataset || !dataset.length) {
        gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            Common mistakes loading...
        </div>
        `;
        return;
    }

    const filtered = dataset.filter(item => {
        if (!searchQuery) return true;

        const text = typeof normalizeText === 'function' ? normalizeText(
            `${item["Category"] || ""} ${item["Mistake"] || ""} ${item["Why It Happens"] || ""} ${item["Possible Result"] || ""} ${item["Recommendation"] || ""}`
        ) : `${item["Category"] || ""} ${item["Mistake"] || ""} ${item["Why It Happens"] || ""} ${item["Possible Result"] || ""} ${item["Recommendation"] || ""}`.toLowerCase();

        return text.includes(searchQuery);
    });

    if (!filtered.length) {
        gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            No common mistakes found matching "${searchQuery}".
        </div>
        `;
        return;
    }

    // ==========================================
    // 3. TARGETED DOM PLACEMENT (SMOOTH UX)
    // ==========================================
    gridContainer.innerHTML = filtered.map(item => {
        const category = item["Category"] || "General";
        const mistake = item["Mistake"] || "Improper Procedure";
        const why = item["Why It Happens"] || "";
        const result = item["Possible Result"] || "";
        const recommendation = item["Recommendation"] || "";

        return `
        <div class="mistake-card">
            <!-- Header Container -->
            <div class="mistake-header">
                <span class="mistake-category">${category}</span>
                <span class="mistake-badge">⚠️ Risk Warning</span>
            </div>
            
            <!-- Card Body / Core Content Stack -->
            <div class="mistake-body">
                <div class="mistake-box">
                    <strong>❌ ${typeof safeHighlight === 'function' ? safeHighlight(mistake) : mistake}</strong>
                    ${why ? `<p>${typeof safeHighlight === 'function' ? safeHighlight(why) : why}</p>` : ""}
                </div>

                ${result ? `
                <div class="cause-box">
                    <span class="box-label">⚠️ Possible Result:</span>
                    <p>${typeof safeHighlight === 'function' ? safeHighlight(result) : result}</p>
                </div>
                ` : ""}

                ${recommendation ? `
                <div class="correct-box">
                    <span class="box-label">✅ Recommendation:</span>
                    <p>${typeof safeHighlight === 'function' ? safeHighlight(recommendation) : recommendation}</p>
                </div>
                ` : ""}
            </div>
        </div>
        `;
    }).join("");
}