const parts= [

{
    name:"Faito Knuckle Bearing",
    category:"Bearing",
    link:"https://s.shopee.ph/2LS5PeSS3R"
},

{
    name:"Daytona Clutch Spring",
    category:"CVT",
    link:"https://s.shopee.ph/2qQ8Y6nVGC"
},

{
    name:"Bendix Rear Brake Pads",
    category:"Brake System",
    link:"https://s.shopee.ph/AUmcWYYDwo"
},

];

const products = document.getElementById("products");

function displayParts(list){

    products.innerHTML = "";

    list.forEach(part=>{

        products.innerHTML +=`
    
    <div class="card">

    <h3>${part.name}</h3>

    <p>${part.category}</p>

    <a
    class="button"
    href="${part.link}"
    target="_blank">
    Buy on Shopee
    <a/>

    </div>
`;
    });
}

displayParts(parts);

document
.getElementById("search")
.addEventListener("input",(e)=>{

    const keyword = 
    e.target.value.toLowerCase();

    const filtered =
    parts.filter(part=>

        part.name
        .toLowerCase
        .includes(keyword)
    );


    displayParts(filtered);

});