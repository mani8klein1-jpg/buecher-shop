// ========================================
// WARENKORB-SEITE
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    await ladeWarenkorb();
});

async function ladeWarenkorb() {
    const container = document.getElementById('warenkorbInhalt');
    
    try {
        const warenkorb = await getWarenkorb();
        // Sortiere den Warenkorb nach der Warenkorb-ID (stabile Reihenfolge)
        warenkorb.sort((a, b) => a.id - b.id);
        
        if (warenkorb.length === 0) {
            container.innerHTML = `<p style="text-align: center; font-size: 18px; margin-top: 40px;">Dein Warenkorb ist leer.</p>
                                   <div style="text-align: center; margin-top: 20px;"><a href="index.html" class="btn btn-primary">Weiter einkaufen</a></div>`;
            return;
        }

        let gesamtpreis = 0;
        let html = `
            <div class="warenkorb-layout">
                <div class="warenkorb-tabelle">
                    <table>
                        <thead>
                            <tr>
                                <th>Artikel</th>
                                <th>Menge</th>
                                <th>Preis</th>
                                <th>Gesamt</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Produkte vom Backend holen, um Namen und Preise zu bekommen
        const alleProdukte = await getProdukte();

        for (const item of warenkorb) {
            const produkt = alleProdukte.find(p => p.id === item.produkt_id);
            if (!produkt) continue;

            const zwischensumme = produkt.preis * item.menge;
            gesamtpreis += zwischensumme;

            html += `
                <tr>
                    <td>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <img src="${produkt.bild_url}" alt="${produkt.name}" style="width: 60px; height: auto; border-radius: 4px;">
                            <div>
                                <strong style="color: var(--primary-color);">${produkt.name}</strong><br>
                                <small style="color: #666; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 3px;">
                                    ${produkt.autor || ''}
                                    ${produkt.kategorie_id === 10 ? '<span style="background-color: #e94560; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: bold;">Unterschrieben</span>' : ''}
                                    ${produkt.rabatt_prozent ? `<span style="background-color: #4caf50; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${produkt.rabatt_prozent} % Rabatt</span>` : ''}
                                </small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="mengen-control">
                            <button onclick="aendereMenge(${item.id}, ${item.menge - 1})">-</button>
                            <span>${item.menge}</span>
                            <button onclick="aendereMenge(${item.id}, ${item.menge + 1})">+</button>
                        </div>
                    </td>
                    <td>${produkt.preis.toFixed(2).replace('.', ',')} €</td>
                    <td><strong>${zwischensumme.toFixed(2).replace('.', ',')} €</strong></td>
                    <td><button onclick="entferneArtikel(${item.id})" style="background: none; border: none; color: #d32f2f; cursor: pointer; font-size: 18px;">🗑️</button></td>
                </tr>
            `;
        }

        // Versandkosten (Frei ab 20€, sonst 3,99€)
        const versand = gesamtpreis >= 20 ? 0 : 3.99;
        const endsumme = gesamtpreis + versand;

        html += `
                        </tbody>
                    </table>
                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <a href="index.html" class="btn">Weiter einkaufen</a>
                    </div>
                </div>

                <div class="warenkorb-summe">
                    <h3>Zusammenfassung</h3>
                    <div class="summe-zeile">
                        <span>Zwischensumme:</span>
                        <span>${gesamtpreis.toFixed(2).replace('.', ',')} €</span>
                    </div>
                    <div class="summe-zeile">
                        <span>Versand:</span>
                        <span>${versand === 0 ? 'Kostenlos' : versand.toFixed(2).replace('.', ',') + ' €'}</span>
                    </div>
                    <hr>
                    <div class="summe-zeile gesamt">
                        <span>Gesamt:</span>
                        <span>${endsumme.toFixed(2).replace('.', ',')} €</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="window.location.href='checkout.html'">Zur Kasse</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        // Warenkorb-Anzahl im Header aktualisieren
        await updateCartCount();

    } catch (error) {
        console.error("Fehler beim Laden des Warenkorbs:", error);
        container.innerHTML = "<p>Fehler beim Laden des Warenkorbs.</p>";
    }
}

// Menge ändern
async function aendereMenge(eintragId, neueMenge) {
    if (neueMenge < 1) {
        await entferneArtikel(eintragId);
        return;
    }
    try {
        await updateWarenkorb(eintragId, neueMenge);
        await ladeWarenkorb();
    } catch (error) {
        console.error("Fehler beim Ändern der Menge:", error);
    }
}

// Artikel entfernen
async function entferneArtikel(eintragId) {
    if (!confirm("Möchtest du diesen Artikel entfernen?")) return;
    try {
        await deleteWarenkorb(eintragId);
        await ladeWarenkorb();
    } catch (error) {
        console.error("Fehler beim Entfernen:", error);
    }
}