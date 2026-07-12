function renderMaintenance(){


const content =
document.getElementById("manualContent");



if(!manualMaintenance.length){

content.innerHTML = `

<div class="empty-state">

Maintenance data loading...

</div>

`;

return;

}



content.innerHTML = `


<div class="maintenance-note">

⚠️ Maintenance intervals may vary depending on riding conditions.
<br>
Shorten service intervals for heavy traffic, dusty roads,
frequent uphill riding, or long-distance use.

</div>



<div class="maintenance-list">


${

manualMaintenance.map(item=>`


<div class="maintenance-card">


<div class="maintenance-header">

<h3>
${item["Item"]}
</h3>


<span class="maintenance-category">

${item["Category"]}

</span>


</div>



<div class="maintenance-row">

<strong>
Interval
</strong>

<p>
${item["Interval"]}
</p>

</div>



<div class="maintenance-row">

<strong>
Specification / Procedure
</strong>

<p>
${item["Specification / Procedure"]}
</p>

</div>



<div class="maintenance-row">

<strong>
Notes
</strong>

<p>
${item["Notes"] || ""}
</p>

</div>



</div>


`).join("")

}



</div>


`;

}