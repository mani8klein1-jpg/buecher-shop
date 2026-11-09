document.addEventListener('DOMContentLoaded', async function() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Benutzerdaten laden
        const benutzer = await getBenutzer();
        const nameElement = document.getElementById('dashboardName');
        if (nameElement) nameElement.textContent = benutzer.name;

        // Bestellungen laden
        await ladeDashboardBestellungen();

        // Wunschliste laden
        await ladeDashboardWunschliste();

    } catch (error) {
        console.error("Fehler beim Laden des Dashboards:", error);
    }
});

async function ladeDashboardBestellungen() {
    const container = document.getElementById('dashboardBestellungen');
    if (!container) return;

    try {
        const bestellungen = await getBestellungen();
        
        if (bestellungen.length === 0) {
            container.innerHTML = '<p>Du hast noch keine Bestellungen.</p>';
            return;
        }

        // Die letzten 3 Bestellungen anzeigen
        const letzte = bestellungen.slice(0, 3);
        let html = '<ul style="list-style: none; padding: 0;">';
        letzte.forEach(b => {
            const datum = new Date(b.erstellt_am).toLocaleDateString('de-DE');
            html += `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                <strong>#${b.id}</strong> - ${datum} - ${b.gesamtpreis.toFixed(2).replace('.', ',')} €
                <span style="color: #ff9800; font-size: 12px; margin-left: 10px;">${b.status.toUpperCase()}</span>
            </li>`;
        });
        html += '</ul>';
        container.innerHTML = html;

    } catch (error) {
        console.error("Fehler beim Laden der Bestellungen:", error);
        container.innerHTML = '<p>Fehler beim Laden der Bestellungen.</p>';
    }
}

async function ladeDashboardWunschliste() {
    const container = document.getElementById('dashboardWunschliste');
    if (!container) return;

    try {
        const wunschliste = await getWunschliste();
        const anzahl = wunschliste.length;
        
        if (anzahl === 0) {
            container.textContent = "Du hast noch keine Bücher auf der Wunschliste.";
        } else {
            container.textContent = `Du hast ${anzahl} Buch${anzahl > 1 ? 'er' : ''} auf deiner Wunschliste.`;
        }
    } catch (error) {
        console.error("Fehler beim Laden der Wunschliste:", error);
        container.textContent = "Fehler beim Laden der Wunschliste.";
    }
}