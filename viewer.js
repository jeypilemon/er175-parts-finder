function openImageModal(image){

    const modal = document.getElementById("imageModal");

    const img = document.getElementById("imageModalImg");

    const download = document.getElementById("imageDownload");

    img.src = image;

    download.href = image;

    modal.classList.add("show");

}

function closeImageModal(){

    document
        .getElementById("imageModal")
        .classList.remove("show");

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