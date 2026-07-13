function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();
}

function safeHighlight(text) {

    if (!searchQuery) return text || "";

    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const reg = new RegExp(escaped, "gi");

    return (text || "").replace(
        reg,
        m => `<mark>${m}</mark>`
    );
}

function matchWords(text, query){

    if(!query) return true;

    const normalizedText = normalizeText(text);

    const words = normalizeText(query).split(" ");

    return words.every(word =>
        normalizedText.includes(word)
    );

}


function getSuggestion(query) {
    const q = normalizeText(query);

    return suggestionMap[q] || null;
}

function renderSuggestion() {
    const suggestionBox = document.getElementById("suggestions");

    const suggestion = getSuggestion(searchQuery);

    if (!searchQuery || !suggestion) {
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
    searchQuery = normalizeText(text);
    render();
    renderSuggestion();
}

/*fuzzy suggestion*/

function getEmptyStateMessage() {
    if (searchQuery) {
        return `No results found for "<b>${searchQuery}</b>"`;
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

function handleGlobalSearch(value){

    searchQuery = normalizeText(value);

    renderSuggestion();

    if(currentTab === "manual"){

        if(searchQuery){

            renderManualSearch();

        }else{

            openManualSection(currentManualSection);

        }

        return;

    }

    if(
        currentTab === "troubleshoot" ||
        currentTab === "diagnostics"
    ){

        render();
        return;

    }

    render();

}