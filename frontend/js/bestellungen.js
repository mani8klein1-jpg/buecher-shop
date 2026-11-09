// ========================================
// BESTELLUNGEN-SEITE
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    await ladeBestellungen();
});

async function ladeBestellungen() {
    const container = document.getElementById('bestellungenListe');
    container.innerHTML = '<p>Lade Bestellungen...</p>';

    try {
        const bestellungen = await getBestellungen();

        if (bestellungen.length === 0) {
            container.innerHTML = `<p>Du hast noch keine Bestellungen.</p>
                                   <div style="margin-top: 20px;"><a href="index.html" class="btn btn-primary">Jetzt stöbern</a></div>`;
            return;
        }

        container.innerHTML = '';

        for (const bestellung of bestellungen) {
            // Details der Bestellung laden (mit Positionen)
            const details = await getBestellung(bestellung.id);
            
            const datum = new Date(bestellung.erstellt_am).toLocaleDateString('de-DE', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const card = document.createElement('div');
            card.className = 'bestellung-card';
            
            let positionenHtml = '';
            if (details.positionen) {
                details.positionen.forEach(pos => {
                positionenHtml += `<div class="bestell-position">
                    <span>${pos.produkt_name} × ${pos.menge}</span>
                    <span>${(pos.preis * pos.menge).toFixed(2).replace('.', ',')} €</span>
                </div>`;
                });
            }

            card.innerHTML = `
                <div class="bestellung-header">
                    <div>
                        <h3>Bestellung #${bestellung.id}</h3>
                        <p class="bestellung-datum">${datum}</p>
                    </div>
                    <div class="bestellung-status status-${bestellung.status}">
                        ${bestellung.status.toUpperCase()}
                    </div>
                </div>
                
                <div class="bestellung-body">
                    <div class="bestellung-positionen">
                        <strong>Positionen:</strong>
                        ${positionenHtml}
                    </div>
                    <div class="bestellung-gesamt">
                        <span>Gesamt:</span>
                        <strong>${bestellung.gesamtpreis.toFixed(2).replace('.', ',')} €</strong>
                    </div>
                </div>
            `;

            container.appendChild(card);
        }

    } catch (error) {
        console.error("Fehler beim Laden der Bestellungen:", error);
        container.innerHTML = '<p>Fehler beim Laden der Bestellungen.</p>';
    }
}