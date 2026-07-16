function openModal(url) {
    const modal = document.getElementById("linkModal");
    const frame = document.getElementById("modalFrame");

    const ytId = getYouTubeId(url);

    frame.src = "";

    // YouTube → in-app
    if (ytId) {
        frame.src = `https://www.youtube.com/embed/${ytId}?rel=0`;
        modal.classList.add("show");
        return;
    }

    // TikTok → force app intent (best effort)
    if (url.includes("tiktok.com")) {
        window.location.href = url; 
        return;
    }

    // Facebook → force app / browser fallback
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
        window.location.href = url;
        return;
    }

    window.open(url, "_blank");
}

function closeOutsideModal(e){

    const box =
    document.querySelector(".component-modal-box");


    if(!box.contains(e.target)){

        closeComponentViewer();

    }

}

function closeModal() {
    const modal = document.getElementById("linkModal");
    const frame = document.getElementById("modalFrame");

    modal.classList.remove("show");

    setTimeout(() => {
        frame.src = "";
    }, 300);
}

function getYouTubeId(url) {
    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/
    );
    return match ? match[1] : null;
}

function linkifySolution(text) {
    if (!text) return "";

    const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/g;

    return text
        .replace(/\n/g, "<br>")
        .replace(urlRegex, (url) => {

            const href = url.startsWith("www.") ? "https://" + url : url;

            let label = "🔗 Open Link";

            let className = "inline-link";

            if (/youtu\.?be|youtube\.com/.test(href)) {
                className += " youtube";
                label = "▶ Watch in YouTube";
            }
            else if (/tiktok\.com/.test(href)) {
                className += " tiktok";
                label = "🎵 Watch in TikTok";
            }
            else if (/facebook\.com|fb\.watch/.test(href)) {
                className += " facebook";
                label = "📘 View in Facebook";
            }

            return `
                <div style="margin:6px 0;">
                    <a 
                    class="${className}" 
                    href="javascript:void(0)" 
                    onclick='openModal(${JSON.stringify(href)})'">
                        ${label}
                    </a>
                </div>
            `;
        });
}
