function renderEFI(){

    const content = document.getElementById("manualContent");

    if(!efiData.length){

        content.innerHTML=`
        <div class="empty-state">
            EFI data loading...
        </div>
        `;
        return;

    }

    const filtered = efiData.filter(problem=>{

        const text = (
            problem["Error / Symptom"]+" "+
            problem["Component / System"]
        ).toLowerCase();

        return text.includes(efiSearch.toLowerCase());

    });

    content.innerHTML=`

<div class="efi-header">

<h2>EFI Diagnostic Center</h2>

<p>
Select a symptom to begin guided troubleshooting.
</p>

<input
id="efiSearch"
class="efi-search"
placeholder="Search symptoms..."
value="${efiSearch}"
oninput="searchEFI(this.value)"
>

</div>

<div class="efi-grid">

${filtered.map(problem=>{

const steps=parseTroubleshootingSteps(
problem["Possible Cause & Troubleshooting Steps (Sequential)"]
);

const difficulty=getEFIDifficulty(problem["Component / System"]);

return`

<div class="efi-card">

<div class="efi-card-top">

<div>

<h3>

${problem["Error / Symptom"]}

</h3>

<p>

${problem["Component / System"]}

</p>

</div>

<span class="efi-difficulty ${difficulty.class}">

${difficulty.label}

</span>

</div>

<div class="efi-card-bottom">

<span>

${steps.length} Diagnostic Steps

</span>

<button
onclick="openEFIDiagnosis('${problem.ID}')">

Diagnose →

</button>

</div>

</div>

`;

}).join("")}

</div>

`;

}

function searchEFI(value){

    efiSearch=value;

    renderEFI();

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

    document.getElementById("componentViewerImage").style.display="none";
    document.getElementById("componentViewerMarker").style.display="none";
    document.getElementById("componentViewerZoom").style.display="none";

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