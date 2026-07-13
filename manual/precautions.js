function renderPrecautions() {
    const content = document.getElementById("manualContent");
    if (!content) return;

    const dataset = window.manualPrecautions || manualPrecautions || [];

    // ==========================================
    // 1. PERSISTENT LAYOUT WRAPPER ENGINE
    // ==========================================
    // Initializes the structure once. This stops the text field 
    // from losing focus or glitching while typing a search query.
    let gridContainer = content.querySelector(".precaution-grid");
    if (!gridContainer) {
        content.innerHTML = `
        <div class="manual-tip">
            ⚠️ Always follow these precautions before servicing your ER175A.
        </div>
        <div class="precaution-grid"></div>
        `;
        gridContainer = content.querySelector(".precaution-grid");
    }

    // ==========================================
    // 2. DATA FILTERING
    // ==========================================
    if (!dataset || !dataset.length) {
        gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            Precautions loading...
        </div>
        `;
        return;
    }

    const filtered = dataset.filter(item => {
        if (!searchQuery) return true;

        const text = typeof normalizeText === 'function' ? normalizeText(
            `${item["Category"] || ""} ${item["Topic"] || ""} ${item["Instruction"] || ""} ${item["Notes"] || ""}`
        ) : `${item["Category"] || ""} ${item["Topic"] || ""} ${item["Instruction"] || ""} ${item["Notes"] || ""}`.toLowerCase();

        return text.includes(searchQuery);
    });

    if (!filtered.length) {
        gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            No precautions found matching "${searchQuery}".
        </div>
        `;
        return;
    }

    // ==========================================
    // 3. TARGETED DOM PLACEMENT (SMOOTH UX)
    // ==========================================
    gridContainer.innerHTML = filtered.map(item => {
        const category = item["Category"] || "General";
        const topic = item["Topic"] || "Safety Notice";
        const instruction = item["Instruction"] || "";
        const notes = item["Notes"] || "";

        const negative = instruction.toLowerCase().startsWith("avoid") ||
                         instruction.toLowerCase().startsWith("do not") ||
                         instruction.toLowerCase().startsWith("never");

        return `
        <div class="precaution-card ${negative ? "danger" : "success"}">
            <div class="precaution-header">
                <span class="precaution-category">${category}</span>
                <span class="precaution-badge">
                    ${negative ? "🚫 Avoid" : "✅ Recommended"}
                </span>
            </div>
            
            <div class="precaution-body">
                <h3>${typeof safeHighlight === 'function' ? safeHighlight(topic) : topic}</h3>
                <p>${typeof safeHighlight === 'function' ? safeHighlight(instruction) : instruction}</p>
            </div>

            ${notes ? `
            <div class="precaution-notes">
                📝 ${typeof safeHighlight === 'function' ? safeHighlight(notes) : notes}
            </div>
            ` : ''}
        </div>
        `;
    }).join("");
}