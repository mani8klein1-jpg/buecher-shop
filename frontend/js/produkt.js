// ========================================
// PRODUKT-DETAILSEITE
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    // 1. ID aus der URL lesen (z.B. produkt.html?id=10)
    const params = new URLSearchParams(window.location.search);
    const produktId = params.get('id');

    const wrapper = document.getElementById('produktDetail');

    if (!produktId) {
        wrapper.innerHTML = "<p>Kein Produkt ausgewählt.</p>";
        return;
    }

    try {
        // 2. Produkt vom Backend laden
        const produkt = await getProdukt(produktId);

        // 3. HTML zusammenbauen (Layout wie Blackwell's)
        wrapper.innerHTML = `
            <div class="produkt-detail-bild">
                <img src="${produkt.bild_url}" alt="${produkt.name}">
            </div>
            
                        <div class="produkt-detail-info">
                                <h1>${produkt.name}</h1>
                
                <div class="autor-bereich">
                    <p class="autor" style="margin-bottom: ${produkt.kategorie_id === 10 ? '8px' : '20px'};">
                        von ${produkt.autor || 'Unbekannter Autor'}
                    </p>
                    ${produkt.kategorie_id === 10 ? '<span class="badge-unterschrieben">Unterschrieben vom Autor</span>' : ''}
                </div>
                
                <div class="buch-details">
                    <p><strong>Verlag:</strong> ${produkt.verlag || '-'}</p>
                    <p><strong>Erscheinungsjahr:</strong> ${produkt.erscheinungsjahr || '-'}</p>
                    <p><strong>ISBN:</strong> ${produkt.isbn || '-'}</p>
                    <p><strong>Format:</strong> Taschenbuch</p>
                </div>

                <p class="beschreibung">${produkt.beschreibung || 'Keine Beschreibung vorhanden.'}</p>
                
                 ${produkt.rabatt_prozent ? `
                    <div class="preis-rabatt-wrapper" style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px;">
                        <p class="preis" style="margin: 0;">
                            <span style="text-decoration: line-through; color: #888; font-size: 20px;">${produkt.preis.toFixed(2).replace('.', ',')} €</span>
                            <span style="color: var(--primary-color); font-weight: bold; margin-left: 10px;">${(produkt.preis * (1 - produkt.rabatt_prozent / 100)).toFixed(2).replace('.', ',')} €</span>
                        </p>
                        <span style="background-color: #4caf50; color: white; font-size: 14px; padding: 4px 8px; border-radius: 4px; width: fit-content;">${produkt.rabatt_prozent} % Rabatt</span>
                    </div>
                ` : `
                    <p class="preis">${produkt.preis.toFixed(2).replace('.', ',')} €</p>
                `}
                
                <div class="liefer-info">
                    <p>✓ Auf Lager (${produkt.lagerbestand} Stück)</p>
                    <p>✓ Kostenlose Lieferung nach Deutschland</p>
                </div>                

                <!-- NEU: Buttons innerhalb der Info-Spalte -->
                <div class="action-buttons">
                    <button
                        class="btn btn-primary produkt-button"
                        onclick="addToCart(${produkt.id})">
                        Hinzufügen zum Korb
                    </button>

                <button
                    class="btn btn-wishlist produkt-button"
                    type="button"
                    onclick="zurWunschliste(${produkt.id})">
                    Zur Wunschliste hinzufügen
                </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Fehler beim Laden des Produkts:', error);
        wrapper.innerHTML = "<p>Produkt konnte nicht geladen werden.</p>";
    }
});

// Menge ändern (falls du es später brauchst)
function aendereMenge(wert) {
    const mengeElement = document.getElementById('menge');
    if (!mengeElement) return;
    let aktuelleMenge = parseInt(mengeElement.textContent);
    aktuelleMenge += wert;
    if (aktuelleMenge < 1) aktuelleMenge = 1;
    mengeElement.textContent = aktuelleMenge;
}


async function zurWunschliste(produktId) {
    if (!isLoggedIn()) {
        alert("Bitte melde dich an, um Produkte auf die Wunschliste zu setzen.");
        window.location.href = "login.html";
        return;
    }
    
    try {
        await addWunschliste(produktId);
        alert("Buch wurde zur Wunschliste hinzugefügt!");
    } catch (error) {
        console.error("Fehler beim Hinzufügen zur Wunschliste:", error);
        alert(error.message || "Das Buch konnte nicht hinzugefügt werden.");
    }
}