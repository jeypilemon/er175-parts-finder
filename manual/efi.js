function renderEFI() {
    const content = document.getElementById("diagnosticsContent") || document.getElementById("manualContent");
    if (!content) return;

    // 1. Array Dataset Safety Verification
    const dataset = window.efiData || efiData || [];

    // ==========================================
    // 2. PERSISTENT RENDERING ANCHOR LAYOUT
    // ==========================================
    let dashboardWrapper = content.querySelector(".efi-dashboard-wrapper");
    if (!dashboardWrapper) {
        content.innerHTML = `
        <div class="efi-dashboard-wrapper">
            <div class="efi-header">
                <h2>EFI Diagnostic Center</h2>
                <div class="efi-tip">
                    <span class="efi-tip-icon">ℹ️</span>
                    <div>
                        <strong>How to use</strong><br>
                        Select a symptom below, then tap <b>Diagnose →</b> to follow the step-by-step troubleshooting guide.
                    </div>
                </div>
            </div>
            
            <div class="efi-guide-grid">
                <div class="efi-guide-card" onclick="openImageModal('assets/images/component/mil-flash-example.png')">
                    <img src="assets/images/component/mil-flash-example.png" alt="MIL Pattern Reference">
                    <div class="efi-guide-info">
                        <h3>MIL Flash Example</h3>
                        <p>Understand long and short MIL flashes.</p>
                    </div>
                </div>
                <div class="efi-guide-card" onclick="openImageModal('assets/images/component/obd-manual-ecu-clearing.png')">
                    <img src="assets/images/component/obd-manual-ecu-clearing.png" alt="ECU Clear Manual">
                    <div class="efi-guide-info">
                        <h3>Manual OBD Query & Clearing</h3>
                        <p>Read and erase EFI fault codes manually.</p>
                    </div>
                </div>
            </div>

            <div class="efi-grid"></div>
        </div>
        `;
        dashboardWrapper = content.querySelector(".efi-dashboard-wrapper");
    }

    const gridContainer = dashboardWrapper.querySelector(".efi-grid");

    // Handling early data loading states
    if (!dataset || !dataset.length) {
        gridContainer.innerHTML = `<div class="empty-state">EFI diagnostic database loading...</div>`;
        return;
    }

    // 3. String Query Normalization Filtering
    const cleanSearch = typeof normalizeText === 'function' ? normalizeText(searchQuery || "") : (searchQuery || "").toLowerCase();

    const filtered = dataset.filter(problem => {
        const sym = problem["Error / Symptom"] || "";
        const comp = problem["Component / System"] || "";
        
        const targetText = typeof normalizeText === 'function'
            ? normalizeText(`${sym} ${comp}`)
            : `${sym} ${comp}`.toLowerCase();

        return targetText.includes(cleanSearch);
    });

    if (!filtered.length) {
        gridContainer.innerHTML = `<div class="empty-state">No diagnostic entries found matching "${searchQuery}".</div>`;
        return;
    }

    // ==========================================
    // 4. ATOMIC GRID DOM UPDATE (PREVENTS JUMPING)
    // ==========================================
    gridContainer.innerHTML = filtered.map(problem => {
        const rawSteps = problem["Possible Cause & Troubleshooting Steps (Sequential)"] || "";
        const steps = typeof parseTroubleshootingSteps === 'function' ? parseTroubleshootingSteps(rawSteps) : rawSteps.split("\n").filter(Boolean);
        const difficulty = typeof getEFIDifficulty === 'function' ? getEFIDifficulty(problem["Component / System"]) : { class: "warning", label: "Standard" };
        const symptom = problem["Error / Symptom"] || "Unknown Malfunction";
        const component = problem["Component / System"] || "EFI System";

        return `
        <div class="efi-card">
            <div class="efi-card-top">
                <div class="efi-card-title-group">
                    <h3>${typeof safeHighlight === 'function' ? safeHighlight(symptom) : symptom}</h3>
                    <p>${typeof safeHighlight === 'function' ? safeHighlight(component) : component}</p>
                </div>
                <span class="efi-difficulty ${difficulty.class}">${difficulty.label}</span>
            </div>
            <div class="efi-card-bottom">
                <span class="efi-step-counter">📋 ${steps.length} Diagnostic Steps</span>
                <button type="button" class="efi-btn" onclick="openEFIDiagnosis('${problem.ID}')">Diagnose →</button>
            </div>
        </div>
        `;
    }).join("");
}


function renderEFIModal() {
    window.currentViewerMode = "efi";
    if (typeof setViewerMode === 'function') setViewerMode("efi");

    const modal = document.getElementById("componentModal");
    if (!modal) return;

    // Safety checks for active object models
    const activeProblem = window.currentEFIProblem || currentEFIProblem || {};
    const stepIndex = typeof currentEFIStepIndex !== 'undefined' ? currentEFIStepIndex : 0;
    const stepsArray = window.currentEFIExtractedSteps || window.currentEFISteps || currentEFISteps || [];

    document.getElementById("componentViewerTitle").innerHTML = activeProblem["Error / Symptom"] || "Diagnostic View";
    document.getElementById("componentViewerLocation").innerHTML = activeProblem["Component / System"] || "System Location";

    // Injection of interactive compact step layout controls
    document.getElementById("componentViewerNotes").innerHTML = `
    <div class="efi-progress">Step ${stepIndex + 1} of ${Math.max(1, stepsArray.length)}</div>
    <div class="efi-step-box">
        <p>${stepsArray[stepIndex] || "No steps configured for this issue entry."}</p>
    </div>
    <div class="efi-nav">
        <button type="button" class="efi-nav-btn" onclick="previousEFIStep()" ${stepIndex === 0 ? "disabled" : ""}>◀ Previous</button>
        <button type="button" class="efi-nav-btn" onclick="nextEFIStep()" ${stepIndex >= stepsArray.length - 1 ? "disabled" : ""}>Next ▶</button>
    </div>
    `;

    const zoomImg = (activeProblem["Zoom Image"] || "").trim();
    const image = document.getElementById("componentViewerImage");
    const marker = document.getElementById("componentViewerMarker");
    const zoom = document.getElementById("componentViewerZoom");

    if (marker) marker.style.display = "none";

    if (zoomImg) {
        if (image) image.style.display = "none";
        if (zoom) {
            zoom.src = zoomImg;
            zoom.style.display = "block";
            zoom.onclick = () => window.open(zoomImg, "_blank");
        }
    } else {
        if (zoom) {
            zoom.src = "";
            zoom.style.display = "none";
        }
        if (image) image.style.display = "none";
    }

    modal.classList.add("show");
}

function openGuideImage(title, image){

    currentViewerMode = "guide";
    setViewerMode("guide");

    const modal = document.getElementById("componentModal");

    document.getElementById("componentViewerTitle").innerHTML = title;

    document.getElementById("componentViewerLocation").innerHTML = "";

    document.getElementById("componentViewerNotes").innerHTML = "";

    document.getElementById("componentViewerMarker").style.display = "none";

    document.getElementById("componentViewerImage").style.display = "none";

    const zoom = document.getElementById("componentViewerZoom");

    zoom.src = image;
    zoom.style.display = "block";

    modal.classList.add("show");

}


function openEFIDiagnosis(id){

    currentEFIProblem = efiData.find(x=>x.ID==id);

    if(!currentEFIProblem) return;

    currentEFISteps = parseTroubleshootingSteps(
        currentEFIProblem["Possible Cause & Troubleshooting Steps (Sequential)"]
    );

    currentEFIStepIndex = 0;

    renderEFIModal();

}

function renderEFIModal(){

    currentViewerMode = "efi";
    setViewerMode("efi");

    const modal = document.getElementById("componentModal");

    document.getElementById("componentViewerTitle").innerHTML =
        currentEFIProblem["Error / Symptom"];

    document.getElementById("componentViewerLocation").innerHTML =
        currentEFIProblem["Component / System"];

    document.getElementById("componentViewerNotes").innerHTML = `

<div class="efi-progress">

Step ${currentEFIStepIndex+1}
of
${currentEFISteps.length}

</div>

<div class="efi-step-box">

${currentEFISteps[currentEFIStepIndex]}

</div>

<div class="efi-nav">

<button
onclick="previousEFIStep()"
${currentEFIStepIndex==0?"disabled":""}>

◀ Previous

</button>

<button
onclick="nextEFIStep()"
${currentEFIStepIndex==currentEFISteps.length-1?"disabled":""}>

Next ▶

</button>

</div>

`;
const zoomImg = currentEFIProblem["Zoom Image"]?.trim();

const image = document.getElementById("componentViewerImage");
const marker = document.getElementById("componentViewerMarker");
const zoom = document.getElementById("componentViewerZoom");

// Hide marker (EFI doesn't use map markers)
marker.style.display = "none";

if (zoomImg) {

    image.style.display = "none";

    zoom.src = zoomImg;
    zoom.style.display = "block";

    zoom.onclick = () => {
        window.open(zoomImg, "_blank");
    };

} else {

    zoom.src = "";
    zoom.style.display = "none";

    image.style.display = "none";

}

    modal.classList.add("show");

}

function getEFIDifficulty(component){

    const c=component.toLowerCase();

    if(c.includes("ecu")){

        return{
            label:"Advanced",
            class:"danger"
        };

    }

    if(
        c.includes("pump")||
        c.includes("injector")||
        c.includes("sensor")
    ){

        return{
            label:"Moderate",
            class:"warning"
        };

    }

    return{

        label:"Easy",
        class:"success"

    };

}

function getEFICategory(component){

    const c = component.toLowerCase();

    if(c.includes("mil"))
        return "MIL";

    if(c.includes("fuel") || c.includes("injector") || c.includes("pump"))
        return "Fuel";

    if(c.includes("sensor") || c.includes("tps"))
        return "Sensors";

    if(c.includes("battery") || c.includes("fuse") || c.includes("starter"))
        return "Electrical";

    if(c.includes("ecu"))
        return "ECU";

    return "Starting";

}

function nextEFIStep(){

    if(currentEFIStepIndex<currentEFISteps.length-1){

        currentEFIStepIndex++;

        renderEFIModal();

    }

}

function previousEFIStep(){

    if(currentEFIStepIndex>0){

        currentEFIStepIndex--;

        renderEFIModal();

    }

}

function parseTroubleshootingSteps(text){

    if(!text) return [];

    const matches = text.match(/(?:^|\n)\d+\.\s[\s\S]*?(?=(?:\n\d+\.\s)|$)/g);

    if(!matches) return [text];

    return matches.map(step=>{

        return step
            .replace(/^\s*\d+\.\s*/,"")
            .trim();

    });

}