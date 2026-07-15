let selectedComponentID = null;
let activeComponentCategory = "All";
let activeComponentSide = "Left";
let componentSearch = "";

function renderManualComponents(){

const content = document.getElementById("manualContent");


if(!manualComponents || manualComponents.length === 0){

    content.innerHTML = `
    <div class="empty-state">
        Component data is loading...
    </div>
    `;

    return;

}



const categories = [
    "All",
    ...new Set(
        manualComponents.map(
            x=>x["Category"]
        )
    )
];



content.innerHTML = `


<div class="component-guide">


<div class="component-toolbar">


<div class="component-search">

<input 
placeholder="Search component..."
value="${componentSearch}"
oninput="searchComponent(this.value)"
>

</div>



<div class="component-side-switch">


<button 
class="${activeComponentSide==="Left"?"active":""}"
onclick="changeComponentSide('Left')">

Left

</button>


<button 
class="${activeComponentSide==="Right"?"active":""}"
onclick="changeComponentSide('Right')">

Right

</button>


</div>


</div>





<div class="component-filters">


${categories.map(cat=>`

<button

class="${cat===activeComponentCategory?"active":""}"

onclick="filterComponentCategory('${cat}')">

${cat}

</button>


`).join("")}


</div>





<div class="component-bike-area">


<div class="bike-image-wrapper">


<img 
id="componentBikeImage"
src="assets/images/er175-sideview-${activeComponentSide.toLowerCase()}.png"
class="bike-image"
>



<div id="componentMarkers"></div>


</div>


</div>




<div id="componentInfo"
class="component-info-panel">


Select a component marker.


</div>


</div>


`;



renderComponentMarkers();

}


function renderComponentMarkers(){


const container =
document.getElementById("componentMarkers");


if(!container) return;



let data =
manualComponents.filter(item=>{


let categoryMatch =
activeComponentCategory==="All" ||
item["Category"]===activeComponentCategory;



let sideMatch =
(item["Image Side"]||"").toLowerCase()
===
activeComponentSide.toLowerCase();



let searchMatch =
(
item["Component"]+
item["Category"]+
item["Location"]
)
.toLowerCase()
.includes(
componentSearch.toLowerCase()
);



return categoryMatch &&
sideMatch &&
searchMatch;


});




container.innerHTML = data.map(item=>`


<button

class="
component-marker
${selectedComponentID==item.ID?"active":""}
"


style="

left:${item["X Position"]}%;

top:${item["Y Position"]}%;

"


onclick="selectComponent('${item.ID}')"


title="${item["Component"]}"

>

</button>


`).join("");



}


function selectComponent(id){


selectedComponentID=id;



const item =
manualComponents.find(
x=>x.ID==id
);



if(!item) return;



const info =
document.getElementById("componentInfo");



info.innerHTML = `


<h3>
${item["Component"]}
</h3>


<span class="component-category-label">

${item["Category"]}

</span>



<p>

<b>Location:</b><br>

${item["Location"]}

</p>



<p>

<b>Access / Notes:</b><br>

${item["Access / Notes"]}

</p>


`;

document
.getElementById("componentInfo")
.scrollIntoView({
behavior:"smooth",
block:"center"
});


renderComponentMarkers();


}


function filterComponentCategory(category){


activeComponentCategory = category;


renderManualComponents();


}


function changeComponentSide(side){

activeComponentSide = side;

renderManualComponents();

}



function searchComponent(value){

componentSearch=value;

renderComponentMarkers();

}