document.addEventListener("DOMContentLoaded", function() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const sidebarList = document.getElementById("sidebar-list");
    const toggleIcon = document.getElementById("toggle-icon"); // Das neue Icon

    if (toggleBtn && sidebarList && toggleIcon) {
        
        toggleBtn.addEventListener("click", function() {
            // Menü auf- und zuklappen
            sidebarList.classList.toggle("open");
            
            // Icon austauschen
            if (sidebarList.classList.contains("open")) {
                // Wenn offen: Zeige das X
                toggleIcon.classList.remove("fa-chevron-down");
                toggleIcon.classList.add("fa-times");
            } else {
                // Wenn geschlossen: Zeige den Pfeil nach unten
                toggleIcon.classList.remove("fa-times");
                toggleIcon.classList.add("fa-chevron-down");
            }
        });

        // Menü schließen und Icon zurücksetzen, wenn man auf einen Link klickt
        const links = sidebarList.querySelectorAll("a");
        links.forEach(function(link) {
            link.addEventListener("click", function() {
                sidebarList.classList.remove("open");
                toggleIcon.classList.remove("fa-times");
                toggleIcon.classList.add("fa-chevron-down");
            });
        });
    }
});