document.addEventListener("DOMContentLoaded", function() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const sidebarList = document.getElementById("sidebar-list");
    const toggleIcon = document.getElementById("toggle-icon");

    if (toggleBtn && sidebarList && toggleIcon) {
        
        toggleBtn.addEventListener("click", function() {
            sidebarList.classList.toggle("open");
            
            if (sidebarList.classList.contains("open")) {
                toggleIcon.classList.remove("fa-chevron-down");
                toggleIcon.classList.add("fa-times");

                // Sanft nach oben scrollen
                setTimeout(function() {
                    // Wir suchen die Sidebar (die auf allen Hilfe-Seiten existiert)
                    const sidebar = document.querySelector(".hilfe-sidebar");
                    
                    if (sidebar) {
                        // Der Wert -300 hat bei dir funktioniert, um "TOHFA'S" zu verstecken
                        const yOffset = -300; 
                        const y = sidebar.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        
                        window.scrollTo({ 
                            top: y, 
                            behavior: 'smooth' 
                        });
                    }
                }, 150);
            } else {
                toggleIcon.classList.remove("fa-times");
                toggleIcon.classList.add("fa-chevron-down");
            }
        });

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