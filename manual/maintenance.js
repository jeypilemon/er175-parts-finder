function renderMaintenance() {
    const content = document.getElementById("manualContent") || document.getElementById("products");
    if (!content) return;

    // 1. Asynchronous Timing Check (Supports global window lookup)
    const dataset = window.manualMaintenance || manualMaintenance || [];

    // ==========================================
    // 2. PERSISTENT LAYOUT WRAPPER ENGINE
    // ==========================================
    let gridContainer = content.querySelector(".maintenance-grid");
    if (!gridContainer) {
        content.innerHTML = `
        <div class="manual-tip">
            ⚠️ <strong>Note:</strong> Adjust service intervals for extreme riding environments (heavy traffic, dust, long-distance).
        </div>
        <div class="maintenance-grid"></div>
        `;
        gridContainer = content.querySelector(".maintenance-grid");
    }

    // ==========================================
    // 3. DATA FILTERING & LOADING STATES
    // ==========================================
    if (!dataset || !dataset.length) {
        gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            Maintenance schedule database loading...
        </div>
        `;
        return;
    }

    const filtered = dataset.filter(item => {
        if (!searchQuery) return true;

        const targetText = typeof normalizeText === 'function' ? normalizeText(
            `${item["Item"] || ""} ${item["Category"] || ""} ${item["Interval"] || ""} ${item["Specification / Procedure"] || ""} ${item["Notes"] || ""}`
        ) : `${item["Item"] || ""} ${item["Category"] || ""} ${item["Interval"] || ""} ${item["Specification / Procedure"] || ""} ${item["Notes"] || ""}`.toLowerCase();

        return targetText.includes(searchQuery);
    });

    if (!filtered.length) {
        gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            No matching maintenance tasks found matching "${searchQuery}".
        </div>
        `;
        return;
    }

    // ==========================================
    // 4. TARGETED DOM PLACEMENT (SMOOTH UX)
    // ==========================================
    gridContainer.innerHTML = filtered.map(item => {
        const name = item["Item"] || "Routine Service";
        const cat = item["Category"] || "General";
        const interval = item["Interval"] || "Inspect regularly";
        const proc = item["Specification / Procedure"] || "No specific details provided.";
        const notes = item["Notes"] || "";

        return `
        <div class="maintenance-card">
            <div class="maintenance-card-header">
                <span class="maintenance-category" data-cat="${cat}">${cat}</span>
                <span class="maintenance-interval-badge">⏱️ ${interval}</span>
            </div>
            
            <div class="maintenance-card-body">
                <h3>${typeof safeHighlight === 'function' ? safeHighlight(name) : name}</h3>
                
                <div class="maintenance-spec-box">
                    <span class="spec-label">🛠️ Spec / Procedure:</span>
                    <p>${typeof safeHighlight === 'function' ? safeHighlight(proc) : proc}</p>
                </div>
                
                ${notes ? `
                <div class="maintenance-notes-box">
                    <p>📝 ${typeof safeHighlight === 'function' ? safeHighlight(notes) : notes}</p>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    }).join("");
}