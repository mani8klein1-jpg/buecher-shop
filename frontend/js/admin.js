// ========================================
// ADMIN-BEREICH
// ========================================

let bearbeitungsModus = false;
let alleAdminProdukte = [];
let zuBearbeitendeId = null;

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Prüfen, ob der Benutzer eingeloggt und Admin ist
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    try {
        const benutzer = await getBenutzer();
        if (!benutzer.ist_admin) {
            alert("Kein Zugriff. Du bist kein Admin.");
            window.location.href = "index.html";
            return;
        }
    } catch (error) {
        window.location.href = "login.html";
        return;
    }

    // 2. Kategorien laden
    await ladeKategorienInsDropdown();

    // 3. Bücher laden
    await ladeAdminProdukte();

    // 4. Formular absenden
    document.getElementById('buchForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const neuesBuch = {
            name: document.getElementById('name').value,
            autor: document.getElementById('autor').value,
            isbn: document.getElementById('isbn').value,
            verlag: document.getElementById('verlag').value,
            erscheinungsjahr: parseInt(document.getElementById('erscheinungsjahr').value) || null,
            preis: parseFloat(document.getElementById('preis').value),
            lagerbestand: parseInt(document.getElementById('lagerbestand').value),
            beschreibung: document.getElementById('beschreibung').value,
            bild_url: document.getElementById('bild_url').value,
            kategorie_id: parseInt(document.getElementById('kategorie').value),
            rabatt_prozent: parseInt(document.getElementById('rabatt_prozent').value) || null
        };

        try {
            if (bearbeitungsModus && zuBearbeitendeId) {
                await updateProdukt(zuBearbeitendeId, neuesBuch);
                alert("Buch erfolgreich aktualisiert!");
                bearbeitungsModus = false;
                zuBearbeitendeId = null;
                document.querySelector('#buchForm button[type="submit"]').textContent = 'Buch anlegen';
            } else {
                await createProdukt(neuesBuch);
                alert("Buch erfolgreich angelegt!");
            }
            document.getElementById('buchForm').reset();
            await ladeAdminProdukte();
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Fehler beim Speichern des Buches.");
        }
    });
});

async function ladeKategorienInsDropdown() {
    try {
        const kategorien = await getKategorien();
        const select = document.getElementById('kategorie');
        
        kategorien.forEach(kat => {
            const option = document.createElement('option');
            option.value = kat.id;
            option.textContent = kat.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Kategorien:", error);
    }
}

async function ladeAdminProdukte() {
    const liste = document.getElementById('adminProduktListe');
    liste.innerHTML = '<p>Lade Bücher...</p>';

    try {
        // 1. Produkte vom Backend laden und in der globalen Variable speichern
        alleAdminProdukte = await getProdukte();
        
        // 2. Die neue Anzeige-Funktion aufrufen (die baut die Liste auf)
        zeigeAdminProdukte(alleAdminProdukte);
        
    } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
        liste.innerHTML = '<p>Fehler beim Laden der Bücher.</p>';
    }
}

function zeigeAdminProdukte(produkte) {
    const liste = document.getElementById('adminProduktListe');
    liste.innerHTML = '';

    if (produkte.length === 0) {
        liste.innerHTML = '<p>Keine Bücher gefunden.</p>';
        return;
    }

    produkte.forEach(produkt => {
        const item = document.createElement('div');
        item.className = 'admin-produkt';
        
            item.innerHTML = `
                <img src="${produkt.bild_url || 'https://via.placeholder.com/80'}" alt="${produkt.name}" class="admin-produkt-img">
                <div class="admin-produkt-info">
                    <h3>${produkt.name} <span style="font-size: 12px; color: #888;">(ID: ${produkt.id})</span></h3>
                    <p class="admin-produkt-beschreibung">${produkt.autor || 'Unbekannter Autor'}</p>
                    <p class="admin-produkt-details">
                        <strong>${produkt.preis.toFixed(2).replace('.', ',')} €</strong> | 
                        Bestand: ${produkt.lagerbestand} | 
                        ISBN: ${produkt.isbn || '-'}
                        ${produkt.rabatt_prozent ? `| <span style="color: #4caf50; font-weight: bold; white-space: nowrap;">${produkt.rabatt_prozent} % Rabatt</span>` : ''}
                    </p>
                </div>
                <div class="admin-produkt-actions">
                    <button class="btn" onclick="bearbeiteProdukt(${produkt.id})" style="background-color: #0d47a1; margin-right: 5px;">Bearbeiten</button>
                    <button class="btn" onclick="loescheProdukt(${produkt.id})" style="background-color: #d32f2f;">Löschen</button>
                </div>
            `;
        
        liste.appendChild(item);
    });
}

async function bearbeiteProdukt(id) {
    try {
        const produkt = await getProdukt(id);
        
        document.getElementById('name').value = produkt.name;
        document.getElementById('autor').value = produkt.autor || '';
        document.getElementById('isbn').value = produkt.isbn || '';
        document.getElementById('verlag').value = produkt.verlag || '';
        document.getElementById('erscheinungsjahr').value = produkt.erscheinungsjahr || '';
        document.getElementById('preis').value = produkt.preis;
        document.getElementById('lagerbestand').value = produkt.lagerbestand;
        document.getElementById('bild_url').value = produkt.bild_url || '';
        document.getElementById('beschreibung').value = produkt.beschreibung || '';
        document.getElementById('kategorie').value = produkt.kategorie_id;
        document.getElementById('originalpreis').value = produkt.originalpreis || '';
        document.getElementById('rabatt_prozent').value = produkt.rabatt_prozent || '';

        bearbeitungsModus = true;
        zuBearbeitendeId = id;

        document.querySelector('#buchForm button[type="submit"]').textContent = 'Änderungen speichern';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Fehler beim Laden des Produkts:", error);
        alert("Produkt konnte nicht geladen werden.");
    }
}

async function loescheProdukt(id) {
    if (!confirm("Möchtest du dieses Buch wirklich löschen?")) return;

    try {
        await deleteProdukt(id);
        alert("Buch gelöscht.");
        await ladeAdminProdukte();
    } catch (error) {
        console.error("Fehler beim Löschen:", error);
        alert("Fehler beim Löschen des Buches.");
    }
}

// ========================================
// SUCHE IM ADMIN-BEREICH
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const suchInput = document.getElementById('adminSuchInput');
    if (suchInput) {
        suchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query === '') {
                zeigeAdminProdukte(alleAdminProdukte);
            } else {
                const gefiltert = alleAdminProdukte.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    (p.autor && p.autor.toLowerCase().includes(query)) ||
                    (p.isbn && p.isbn.includes(query))
                );
                zeigeAdminProdukte(gefiltert);
            }
        });
    }
});