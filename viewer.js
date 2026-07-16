function openImageModal(image){

    const modal = document.getElementById("imageModal");
    const img = document.getElementById("imageModalImg");
    const download = document.getElementById("imageDownload");

    if(!modal || !img) return;

    img.onerror = () => {
        img.src = "assets/images/image-error.png";
    };

    img.src = image;

    if(download){
        download.href = image;
    }

    modal.classList.add("show");

}


function closeImageModal(){

    const modal = document.getElementById("imageModal");
    const img = document.getElementById("imageModalImg");

    if(modal){
        modal.classList.remove("show");
    }

    if(img){
        img.src = "";
    }

}


function setViewerMode(mode){

    const prev =
    document.getElementById("viewerPrev");

    const next =
    document.getElementById("viewerNext");


    if(!prev || !next) return;


    if(mode === "component"){

        prev.style.display = "";
        next.style.display = "";

    }else{

        prev.style.display = "none";
        next.style.display = "none";

    }

}

function closeComponentViewer(){

    const modal =
    document.getElementById("componentModal");


    if(modal){

        modal.classList.remove("show");

    }


    currentViewerMode = "";

}

function previousComponent(){


    if(!manualComponents || manualComponents.length === 0)
        return;



    currentViewerIndex--;



    if(currentViewerIndex < 0){

        currentViewerIndex =
        manualComponents.length - 1;

    }



    openComponentViewer(
        manualComponents[currentViewerIndex]["ID"]
    );


}





function openNextComponent(){


    if(!manualComponents || manualComponents.length === 0)
        return;



    currentViewerIndex++;



    if(currentViewerIndex >= manualComponents.length){

        currentViewerIndex = 0;

    }



    openComponentViewer(
        manualComponents[currentViewerIndex]["ID"]
    );


}


function openComponentViewer(id){

    const item = manualComponents.find(
    x => x["ID"] == id
    );

    if(!item){
    console.error("Component not found:", id);
    return;
    }

    currentViewerComponent = item;


    currentViewerIndex =
    manualComponents.findIndex(
        x => x["ID"] == id
    );



    const modal =
    document.getElementById("componentModal");


    const title =
    document.getElementById("componentViewerTitle");


    const location =
    document.getElementById("componentViewerLocation");


    const notes =
    document.getElementById("componentViewerNotes");



    if(title){

        title.innerHTML =
        item["Component"] || "";

    }


    if(location){

        location.innerHTML =
        item["Location"] || "";

    }


    if(notes){

        notes.innerHTML =
        item["Access / Notes"] || "";

    }



    if(modal){

        modal.classList.add("show");

    }


}