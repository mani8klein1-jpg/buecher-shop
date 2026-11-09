// ========================================
// CHECKOUT-SEITE
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    // 1. Bestellübersicht laden
    await ladeCheckoutUebersicht();

    // 2. Formular absenden
    document.getElementById('checkoutForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // PLZ-Validierung
        const plz = document.getElementById('plz').value;
        if (!/^\d{5}$/.test(plz)) {
            alert("Bitte geben Sie eine gültige 5-stellige Postleitzahl ein.");
            return;
        }

        // Adresse zusammenbauen
        const adresse = {
            vorname: document.getElementById('vorname').value,
            nachname: document.getElementById('nachname').value,
            strasse: document.getElementById('strasse').value,
            plz: plz,
            ort: document.getElementById('ort').value
        };

        // Bestellung absenden
        try {
            await createBestellung(adresse);
            alert("Bestellung erfolgreich aufgegeben!");
            window.location.href = "index.html";
        } catch (error) {
            console.error("Fehler beim Bestellen:", error);
            const errorMsg = document.getElementById('fehlerMeldung');
            if (errorMsg) {
                errorMsg.textContent = "Fehler beim Aufgeben der Bestellung.";
                errorMsg.style.display = 'block';
            }
        }
    });
}); // <-- WICHTIG: Diese Klammer schließt den DOMContentLoaded-Block

async function ladeCheckoutUebersicht() {
    const container = document.getElementById('checkoutItems');
    const gesamtElement = document.getElementById('checkoutGesamt');

    try {
        const warenkorb = await getWarenkorb();
        const alleProdukte = await getProdukte();

        if (warenkorb.length === 0) {
            container.innerHTML = '<p>Dein Warenkorb ist leer.</p>';
            return;
        }

        let gesamt = 0;
        container.innerHTML = '';

        warenkorb.forEach(item => {
            const produkt = alleProdukte.find(p => p.id === item.produkt_id);
            if (produkt) {
                const zwischensumme = produkt.preis * item.menge;
                gesamt += zwischensumme;

                const div = document.createElement('div');
                div.className = 'item';
                div.innerHTML = `
                    <span>${produkt.name} × ${item.menge}</span>
                    <span>${zwischensumme.toFixed(2).replace('.', ',')} €</span>
                `;
                container.appendChild(div);
            }
        });

        if (gesamtElement) {
            gesamtElement.textContent = gesamt.toFixed(2).replace('.', ',') + ' €';
        }

    } catch (error) {
        console.error("Fehler beim Laden der Übersicht:", error);
    }
}