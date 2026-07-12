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



const grouped = manualComponents.reduce((groups,item)=>{


const category = item["Category"] || "Other";


if(!groups[category]){

    groups[category] = [];

}


groups[category].push(item);


return groups;


},{});


content.innerHTML = `

<div class="component-list">


${
Object.entries(grouped)
.map(([category,items])=>`


<section class="component-category">


<h3 class="component-category-title">

${category}

</h3>



${

items.map(item=>`

<div
class="component-item"
id="component-${item["ID"]}"
onclick="openComponentViewer('${item["ID"]}')"
>


<div class="component-details">


<h3>
${item["Component"]}
</h3>

</div>


</div>


`).join("")

}


</section>


`).join("")
}


</div>

`;

}