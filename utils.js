function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();
}

function safeHighlight(text) {

    if (!globalKeyword) return text || "";

    const escaped = globalKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const reg = new RegExp(escaped, "gi");

    return (text || "").replace(
        reg,
        m => `<mark>${m}</mark>`
    );
}

function matchWords(text, query) {
    if (!query) return true;

    const words = text.split(" ");
    const q = query.trim();

    return words.includes(q);
}


function getSuggestion(query) {
    const q = normalizeText(query);

    return suggestionMap[q] || null;
}

function renderSuggestion() {
    const suggestionBox = document.getElementById("suggestions");

    const suggestion = getSuggestion(globalKeyword);

    if (!globalKeyword || !suggestion) {
        suggestionBox.innerHTML = "";
        return;
    }

    suggestionBox.innerHTML = `
        <div class="suggestion-item" onclick="applySuggestion('${suggestion}')">
            💡 Do you mean: <b>${suggestion}</b>?
        </div>
    `;
}


function applySuggestion(text) {
    document.getElementById("search").value = text;
    globalKeyword = normalizeText(text);
    render();
    renderSuggestion();
}

/*fuzzy suggestion*/

function getEmptyStateMessage() {
    if (globalKeyword) {
        return `No results found for "<b>${globalKeyword}</b>"`;
    }
    return "No items available";
}


/* Dictionary*/

const suggestionMap = {
    breakpads: "brake pads",
    brakepad: "brake pads",
    oilfilter: "oil filter",
    sparkpluggs: "spark plug",
    clutchshoe: "clutch shoe"
};