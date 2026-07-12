
function renderDashboard(){

const content =
document.getElementById("manualContent");


if(!manualDashboard || manualDashboard.length === 0){

    content.innerHTML = `
    <div class="empty-state">
        Dashboard data loading...
    </div>
    `;

    return;

}


content.innerHTML = `

<div class="dashboard-guide">


<div class="dashboard-image-container">


<img 
src="assets/images/er175-dash.png"
class="dashboard-image"
>

<div class="dashboard-hint">
👆 Tap the highlighted area to view information
</div>


${
manualDashboard.map(item=>`

<div
class="dashboard-marker"

style="
left:${item["X Position"]}%;
top:${item["Y Position"]}%;
width:${(Number(item["Width"]) / 1177) * 100}%;
height:${(Number(item["Height"]) / 785) * 100}%;
"

onclick="openDashboardInfo('${item["ID"]}')">

</div>


`).join("")
}


</div>

`;

}

function openDashboardInfo(id){

currentViewerMode = "dashboard";


const item =
manualDashboard.find(
    x => x["ID"] == id
);


if(!item){
    console.log("Missing dashboard item:", id);
    return;
}


currentDashboardIndex =
manualDashboard.findIndex(
    x => x["ID"] == id
);



const modal =
document.getElementById("componentModal");


const image =
document.getElementById("componentViewerImage");


const zoomImage =
document.getElementById("componentViewerZoom");


const marker =
document.getElementById("componentViewerMarker");


const title =
document.getElementById("componentViewerTitle");


const location =
document.getElementById("componentViewerLocation");


const notes =
document.getElementById("componentViewerNotes");


// HIDE COMPONENT IMAGE

if(image){

    image.src="";
    image.style.display="none";

}


// HIDE COMPONENT MARKER

if(marker){

    marker.style.display="none";

}


// TITLE

if(title){

    title.innerHTML =
    item["Component"] || "";

}


// MEANING

if(location){

    location.innerHTML =
    item["Meaning"] || "";

}


// NOTES

if(notes){

    notes.innerHTML =
    item["Notes"] || "";

}


// DASHBOARD ZOOM IMAGE

if(zoomImage){

    if(item["Zoom Image"]){

        zoomImage.src =
        item["Zoom Image"];

        zoomImage.style.display="block";

    }
    else{

        zoomImage.src="";
        zoomImage.style.display="none";

    }

}


// OPEN MODAL

if(modal){

    modal.classList.add("show");

}


}
