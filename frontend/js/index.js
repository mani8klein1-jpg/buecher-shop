// ========================================
// STARTSEITE - PRODUKT-LISTE + KATEGORIE-FILTER
// ========================================

let alleProdukte = [];
let aktiveKategorie = null;

document.addEventListener('DOMContentLoaded', async function() {
    await updateLoginStatus();
    
    // 1. ZUERST die Produkte laden (damit alleProdukte gefüllt ist)
    await loadProdukte();
    await loadKategorien();
    
    // 2. DANN den Warenkorb-Preis aktualisieren
    await updateCartCount();
    
    // 3. Suchbegriff aus URL lesen (falls vorhanden)
    const params = new URLSearchParams(window.location.search);
    const suche = params.get('suche');
    if (suche) {
        const input = document.getElementById('suchInput');
        if (input) input.value = suche;
        await sucheAusfuehren();
    }

    // 4. Kategorie aus URL lesen (falls vorhanden)
    const kategorieParam = params.get('kategorie');
    if (kategorieParam) {
        const kategorieId = parseInt(kategorieParam);
        if (typeof filterKategorie === 'function') {
            filterKategorie(kategorieId, null);
            // Jetzt auch sanft scrollen – wie beim Klick!
            warteAufGridUndScrolle();
        }
    }
});

async function loadKategorien() {
    console.log("Kategorie-Filter-Leiste deaktiviert. Nutze Hauptnavigation.");
}

async function loadProdukte() {
    try {
        alleProdukte = await getProdukte();
        zeigeProdukte(alleProdukte);
    } catch (error) {
        console.error('Fehler beim Laden der Produkte:', error);
    }
}

function zeigeProdukte(produkte) {
    const grid = document.getElementById('produktGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (produkte.length === 0) {
        grid.innerHTML = '<p style="color:#888;">Keine Produkte in dieser Kategorie.</p>';
        return;
    }
    
    produkte.forEach(produkt => {
        const card = document.createElement('div');
        card.className = 'produkt-card';
        card.onclick = () => window.location.href = `produkt.html?id=${produkt.id}`;
        
               let preisHtml = '';
        if (produkt.rabatt_prozent) {
            const rabattPreis = produkt.preis * (1 - produkt.rabatt_prozent / 100);
            preisHtml = `
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <p class="preis" style="margin: 0;">
                        <span style="text-decoration: line-through; color: #888; font-size: 16px;">${produkt.preis.toFixed(2).replace('.', ',')} €</span>
                        <span style="color: var(--primary-color); font-weight: bold; margin-left: 5px;">${rabattPreis.toFixed(2).replace('.', ',')} €</span>
                    </p>
                    <span style="background-color: #4caf50; color: white; font-size: 12px; padding: 2px 6px; border-radius: 4px; width: fit-content;">${produkt.rabatt_prozent} % Rabatt</span>
                </div>
            `;
        } else {
            preisHtml = `<p class="preis">${produkt.preis.toFixed(2).replace('.', ',')} €</p>`;
        }

        card.innerHTML = `
            <img src="${produkt.bild_url || 'https://via.placeholder.com/300x200'}" alt="${produkt.name}">
            <div class="produkt-info">
                <h3>${produkt.name}</h3>
                <p class="autor" style="display: flex; align-items: center; gap: 10px;">
                    ${produkt.autor || 'Unbekannter Autor'}
                    ${produkt.kategorie_id === 10 ? '<span style="background-color: #e94560; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: bold;">Unterschrieben</span>' : ''}
                </p>
                
                <div class="preis-zeile">
                    ${preisHtml}
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${produkt.id})" title="In den Warenkorb">
                        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Einkaufstasche" role="img" style="width: 24px; height: 24px; fill: white;">
                            <path d="M19 24 C19 5 45 5 45 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>
                            <path d="M11 22 H53 L57 59 H7 Z" fill="white" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                            <path d="M17 32 H47" stroke="#1A4D46" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}


function filterKategorie(kategorieId, eventOrButton) {

    if (eventOrButton && typeof eventOrButton.preventDefault === 'function') {
        eventOrButton.preventDefault();
    }

    // Such-Anzeige zurücksetzen
    const anzahlElement = document.getElementById('suchErgebnisAnzahl');
    const untertitelElement = document.getElementById('kategorieUntertitel');

    if (anzahlElement) anzahlElement.style.display = 'none';
    if (untertitelElement) untertitelElement.style.display = 'block';

    aktiveKategorie = kategorieId;

    const titelElement = document.getElementById('kategorieTitel');

    // Produkte filtern und Überschrift setzen
    if (kategorieId === null) {

        if (titelElement) titelElement.textContent = "2026: Eine Welt im Umbruch";

        if (untertitelElement) {
            untertitelElement.textContent =
                "Entdecken Sie unsere Auswahl an spannenden Geschichten";
        }

        zeigeProdukte(alleProdukte);

    } else {

        const gefiltert = alleProdukte.filter(
            p => p.kategorie_id === kategorieId
        );

        let titel = "Bücher";

        if (kategorieId === 1) titel = "Romane";
        if (kategorieId === 2) titel = "Krimis & Thriller";
        if (kategorieId === 3) titel = "Fantasy & Abenteuer";
        if (kategorieId === 4) titel = "Sachbücher & Entwicklung";
        if (kategorieId === 5) titel = "Kinderbücher";
        if (kategorieId === 6) titel = "Geschichte & Kultur";
        if (kategorieId === 7) titel = "Bestseller";
        if (kategorieId === 8) titel = "Spiele";
        if (kategorieId === 9) titel = "Geschenke";
        if (kategorieId === 10) titel = "Unterschrieben";
        if (kategorieId === 11) titel = "Poesie";
        if (kategorieId === 12) titel = "Angebote";
        if (kategorieId === 13) titel = "Neuheiten";

        if (titelElement) titelElement.textContent = titel;
        if (untertitelElement) untertitelElement.textContent = "";

        zeigeProdukte(gefiltert);
    }

}


// ========================================
// LANGSAM ZUR KATEGORIEÜBERSCHRIFT SCROLLEN
// ========================================

function zurKategorieScrollen() {
    const zielElement = document.getElementById('kategorieTitel');
    if (!zielElement) {
        console.warn('[Scroll] #kategorieTitel fehlt');
        return;
    }

    const header = document.querySelector('.site-header');
    const headerHoehe = header ? header.offsetHeight : 0;

    const zielPosition =
        zielElement.getBoundingClientRect().top +
        window.scrollY -
        headerHoehe -
        15;

    const aktuell = window.scrollY;
    const differenz = Math.abs(aktuell - zielPosition);

    console.log('[Scroll] scrollY:', aktuell,
                'ziel:', zielPosition,
                'diff:', differenz,
                'headerHoehe:', headerHoehe);

    if (differenz < 5) {
        // Schon an der Zielposition → kleiner Nudge, damit man den Filterwechsel spürt
        window.scrollTo({ top: aktuell + 60, behavior: 'smooth' });
        setTimeout(() => {
            window.scrollTo({ top: zielPosition, behavior: 'smooth' });
        }, 220);
        return;
    }

    window.scrollTo({ top: zielPosition, behavior: 'smooth' });
}


// ========================================
// LANGSAM ZUR LOGIN-ÜBERSCHRIFT SCROLLEN
// ========================================

function zurLoginUeberschriftScrollen() {

    const zielElement = document.getElementById('loginTitel');

    if (!zielElement) return;

    const header = document.querySelector('.site-header');
    const headerHoehe = header ? header.offsetHeight : 0;

    const startPosition = window.scrollY;

    const zielPosition =
        zielElement.getBoundingClientRect().top +
        window.scrollY -
        headerHoehe -
        15;

    const strecke = zielPosition - startPosition;

    const dauer = 1400;

    let startZeit = null;

    function langsamScrollen(zeit) {

        if (!startZeit) startZeit = zeit;

        const fortschritt = Math.min(
            (zeit - startZeit) / dauer,
            1
        );

        const easing = 1 - Math.pow(1 - fortschritt, 3);

        window.scrollTo(
            0,
            startPosition + strecke * easing
        );

        if (fortschritt < 1) {
            requestAnimationFrame(langsamScrollen);
        }
    }

    requestAnimationFrame(langsamScrollen);
}



// ========================================
// LANGSAM ZUR REGISTRIEREN-ÜBERSCHRIFT SCROLLEN
// ========================================

function zurRegistrierenUeberschriftScrollen() {

    const zielElement = document.getElementById('registrierenTitel');

    if (!zielElement) return;

    const header = document.querySelector('.site-header');
    const headerHoehe = header ? header.offsetHeight : 0;

    const startPosition = window.scrollY;

    const zielPosition =
        zielElement.getBoundingClientRect().top +
        window.scrollY -
        headerHoehe -
        15;

    const strecke = zielPosition - startPosition;

    const dauer = 1400;

    let startZeit = null;

    function langsamScrollen(zeit) {

        if (!startZeit) startZeit = zeit;

        const fortschritt = Math.min(
            (zeit - startZeit) / dauer,
            1
        );

        const easing = 1 - Math.pow(1 - fortschritt, 3);

        window.scrollTo(
            0,
            startPosition + strecke * easing
        );

        if (fortschritt < 1) {
            requestAnimationFrame(langsamScrollen);
        }
    }

    requestAnimationFrame(langsamScrollen);
}


// Nur auf der Registrieren-Seite automatisch scrollen
window.addEventListener('load', function() {

    if (document.getElementById('registrierenTitel')) {

        setTimeout(() => {
            zurRegistrierenUeberschriftScrollen();
        }, 300);

    }

});



// Nur auf der Login-Seite automatisch scrollen
window.addEventListener('load', function() {

    if (document.getElementById('loginTitel')) {

        setTimeout(() => {
            zurLoginUeberschriftScrollen();
        }, 300);

    }

});



async function updateLoginStatus() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const userMenu = document.getElementById('userMenu');
    const adminLink = document.getElementById('adminLink');
    const userNameText = document.getElementById('userNameText');

    if (isLoggedIn()) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';

        try {
            const benutzer = await getBenutzer();
            if (userNameText) userNameText.textContent = benutzer.name;
            if (adminLink) {
                adminLink.style.display = benutzer.ist_admin ? 'block' : 'none';
            }
        } catch (error) {
            console.error("Fehler beim Laden des Benutzers:", error);
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function toggleDropdown(event) {
    event.preventDefault();
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

function logout() {
    removeToken();
    window.location.reload();
}

async function updateCartCount() {
    const countElement = document.getElementById('cartCount');
    const priceElement = document.querySelector('.cart strong');

    if (!isLoggedIn()) {
        if (countElement) countElement.textContent = '0';
        if (priceElement) priceElement.textContent = '0,00 €';
        return;
    }
    
    try {
        const warenkorb = await getWarenkorb();
        
        const count = warenkorb.reduce((sum, item) => sum + item.menge, 0);
        if (countElement) countElement.textContent = count;

        let gesamtpreis = 0;
        if (typeof alleProdukte !== 'undefined' && alleProdukte.length > 0) {
            warenkorb.forEach(item => {
                const produkt = alleProdukte.find(p => p.id === item.produkt_id);
                if (produkt) {
                    gesamtpreis += produkt.preis * item.menge;
                }
            });
        }

        if (priceElement) {
            priceElement.textContent = gesamtpreis.toFixed(2).replace('.', ',') + ' €';
        }

    } catch (error) {
        console.error('Fehler beim Laden des Warenkorbs:', error);
    }
}

async function sucheAusfuehren() {
    const input = document.getElementById('suchInput');
    if (!input) return;
    
    let query = input.value.trim().toLowerCase();
        // Standardmäßig normale Suche (keine Sprachsteuerung)
    let istSprachSuche = false;
    
    // NEU: Ausgewählte Kategorie aus dem Dropdown lesen
    const selectElement = document.getElementById('suchKategorie');
    const ausgewaehlteKategorie = selectElement ? selectElement.value : 'all';
    
    const navigationsBefehle = [
        { woerter: ["anmelden", "einloggen", "login", "konto"], ziel: "login.html" },
        { woerter: ["registrieren", "anlegen", "neues konto"], ziel: "login.html" },
        { woerter: ["warenkorb", "korb", "einkaufswagen"], ziel: "warenkorb.html" },
        { woerter: ["kasse", "bezahlen", "checkout", "bestellen"], ziel: "checkout.html" },
        { woerter: ["bestellungen", "meine bestellung", "bestellübersicht"], ziel: "bestellungen.html" },
        { woerter: ["profil", "mein konto", "meine daten"], ziel: "profil.html" },
        { woerter: ["admin", "verwaltung", "produkte anlegen"], ziel: "admin.html" }
    ];

    for (const befehl of navigationsBefehle) {
        if (befehl.woerter.some(wort => query.includes(wort))) {
            const produktExistiert = alleProdukte.some(p => 
                p.name.toLowerCase().includes(query)
            );
            
            if (!produktExistiert) {
                if (befehl.ziel === "login.html" && isLoggedIn()) {
                    window.location.href = "profil.html";
                } else {
                    window.location.href = befehl.ziel;
                }
                return;
            }
        }
    }
    
    let preisFilter = null;
    let preisModus = 'bis';
    const preisRegex = /(unter|bis|max|maximal|höchstens|über|ab|mindestens|von)\s*(\d+)/i;
    const preisMatch = query.match(preisRegex);
    
    if (preisMatch) {
        preisFilter = parseInt(preisMatch[2]);
        if (/^(über|ab|mindestens|von)$/i.test(preisMatch[1])) {
            preisModus = 'über';
        }
        query = query.replace(preisMatch[0], '').replace(/euro|€/gi, '').trim();
    }

    const fuellwoerter = [
        "suche","ich suche eine", "ich suche einen", "ich suche ein",
        "ich suche", "ich bin auf der suche nach",
        "ich suche nach einer", "ich suche nach einem",
        "ich suche nach einem", "ich suche nach",
        "ich brauche eine", "ich brauche einen",
        "ich brauche ein", "ich brauche",
        "ich benötige eine", "ich benötige einen",
        "ich benötige ein", "ich benötige",
        "ich hätte gerne eine", "ich hätte gerne einen",
        "ich hätte gerne ein", "ich hätte gerne",
        "ich möchte eine", "ich möchte einen",
        "ich möchte ein", "ich möchte",
        "ich will eine", "ich will einen",
        "ich will ein", "ich will",
        "zeig mir bitte eine", "zeig mir bitte einen",
        "zeig mir bitte ein", "zeig mir bitte",
        "zeige mir bitte eine", "zeige mir bitte einen",
        "zeige mir bitte ein", "zeige mir bitte",
        "zeig mir eine", "zeig mir einen",
        "zeig mir ein", "zeig mir",
        "zeige mir eine", "zeige mir einen",
        "zeige mir ein", "zeige mir",
        "kannst du mir zeigen", "kannst du zeigen",
        "können sie mir zeigen", "können sie zeigen",
        "ich möchte sehen", "ich will sehen",
        "zeige mir alle", "zeig mir alle",
        "anzeigen", "zeige", "zeig",
        "hast du eine", "hast du einen", "hast du ein",
        "hast du", "haben sie eine", "haben sie einen",
        "haben sie ein", "haben sie",
        "gibt es eine", "gibt es einen", "gibt es ein",
        "gibt es", "habt ihr eine", "habt ihr einen",
        "habt ihr ein", "habt ihr",
        "finde ich eine", "finde ich einen",
        "finde ich ein", "finde ich",
        "wo finde ich eine", "wo finde ich einen",
        "wo finde ich ein", "wo finde ich",
        "wo gibt es", "wo bekomme ich",
        "kann ich eine kaufen", "kann ich einen kaufen",
        "kann ich ein kaufen", "kann ich kaufen",
        "welche produkte gibt es", "welche produkte habt ihr",
        "was habt ihr", "was gibt es",
        "was kann ich kaufen", "was bietet ihr an",
        "was bieten sie an", "welche artikel gibt es",
        "wie viel kostet eine", "wie viel kostet einen",
        "wie viel kostet ein", "wie viel kostet",
        "wieviel kostet eine", "wieviel kostet einen",
        "wieviel kostet ein", "wieviel kostet",
        "was kostet eine", "was kostet einen",
        "was kostet ein", "was kostet",
        "wie teuer ist eine", "wie teuer ist einen",
        "wie teuer ist ein", "wie teuer ist",
        "wie teuer sind", "wie viel kosten",
        "wieviel kosten", "was kosten",
        "nenne mir den preis", "nenn mir den preis",
        "zeige mir den preis", "preis von",
        "preis für", "zu welchem preis",
        "wie hoch ist der preis", "kostet das",
        "ist eine verfügbar", "ist ein verfügbar",
        "ist eine auf lager", "ist ein auf lager",
        "ist das verfügbar", "ist das vorrätig",
        "habt ihr das auf lager", "haben sie das auf lager",
        "ist noch vorhanden", "noch verfügbar",
        "noch auf lager", "habt ihr noch",
        "gibt es noch", "kann ich bekommen",
        "kann ich bestellen", "sofort lieferbar",
        "welche eigenschaften hat", "welche funktionen hat",
        "wie gut ist", "wie groß ist",
        "wie schwer ist", "wie schnell ist",
        "wie viel speicher hat", "wie viel ram hat",
        "hat das produkt", "hat dieser", "hat diese",
        "hat dieses", "ist dieser", "ist diese",
        "ist dieses", "welcher ist", "welche ist",
        "welches ist", "was ist der unterschied",
        "was sind die unterschiede", "erkläre mir",
        "beschreibe mir", "mehr informationen über",
        "informationen zu", "details zu",
        "technische daten von", "technische daten",
        "produktdetails", "produktbeschreibung",
        "ich suche nach monitoren", "suche monitore",
        "ich suche nach mäusen", "suche mäuse",
        "ich suche nach tastaturen", "suche tastaturen",
        "ich suche nach kabeln", "suche kabel",
        "ich suche nach laptops", "suche laptops",
        "ich suche nach zubehör", "suche zubehör",
        "in der kategorie", "aus der kategorie",
        "aus dem bereich", "im bereich",
        "zeige die kategorie", "kategorie",
        "produkte von", "artikel von",
        "produkte mit", "produkte unter",
        "produkte über", "günstige produkte",
        "billige produkte", "teure produkte",
        "preiswerte produkte", "die günstigsten",
        "die teuersten", "am billigsten",
        "am günstigsten", "unter euro",
        "bis euro", "für weniger als",
        "bitte", "danke", "vielen dank", "wäre schön", "es wäre schön",
        "danke schön", "entschuldigung",
        "entschuldige", "verzeihung",
        "mal bitte", "doch bitte",
        "einmal bitte", "bitte einmal",
        "ich würde gerne", "ich würde gern",
        "ich möchte gerne", "ich möchte gern",
        "ich hätte gern", "ich hätte gerne",
        "wenn möglich", "wenn es geht",
        "könntest du bitte", "könntest du",
        "können sie bitte", "können sie",
        "kannst du bitte", "kannst du",
        "würdest du bitte", "würden sie bitte",
        "für mich", "mir bitte", "mir gerne",
        "also", "äh", "ähm", "hm", "hmm",
        "na ja", "naja", "halt", "eben",
        "eigentlich", "vielleicht", "sozusagen",
        "irgendwie", "einfach", "wirklich",
        "gerade", "jetzt", "denn", "doch",
        "mal", "nur", "noch", "schon", "über",
        "da", "hier", "dort", "einmal",
        "bitte mal", "doch mal", "also bitte",
        "der", "die", "das", "den", "dem",
        "des", "ein", "eine", "einen",
        "einem", "einer", "eines",
        "und", "oder", "aber", "für",
        "mit", "ohne", "von", "vom",
        "zum", "zur", "im", "in der",
        "in dem", "auf dem", "bei den",
        "zu dem", "zu der", "bitte zeige",
        "mir den", "mir die", "mir das"
    ];
    
        // Füllwörter nur entfernen, wenn es eine Sprachsuche ist
    if (istSprachSuche) {
        fuellwoerter.sort((a, b) => b.length - a.length).forEach(wort => {
            query = query.replace(new RegExp(`\\b${wort}\\b`, 'gi'), '');
        });
        query = query.trim().replace(/\s+/g, ' ');
    }

    const synonyme = {
        "maus": "mouse", "mäuse": "mouse", "mouse": "mouse", "mice": "mouse",
        "tastatur": "keyboard", "tastaturen": "keyboard", "keyboard": "keyboard",
        "kabel": "cable", "kabeln": "cable", "cable": "cable",
        "kopfhörer": "headphones", "kopfhörern": "headphones", "headphones": "headphones",
        "laptop": "laptop", "laptops": "laptop", "notebook": "laptop", "notebooks": "laptop",
        "monitor": "monitor", "monitore": "monitor", "monitoren": "monitor",
        "bildschirm": "screen", "bildschirme": "screen", "screen": "screen",
        "festplatte": "ssd", "festplatten": "ssd", "ssd": "ssd",
        "usb": "usb", "usb-kabel": "usb", "usb-c": "usb"
    };

    let singular = query;
    singular = singular.replace(/laptops$/i, 'laptop');
    singular = singular.replace(/monitore$/i, 'monitor');
    singular = singular.replace(/monitoren$/i, 'monitor');
    singular = singular.replace(/mäuse$/i, 'maus');
    singular = singular.replace(/tastaturen$/i, 'tastatur');
    singular = singular.replace(/kabeln$/i, 'kabel');
    singular = singular.replace(/kopfhörern$/i, 'kopfhörer');
    singular = singular.replace(/festplatten$/i, 'festplatte');
    singular = singular.replace(/bildschirme$/i, 'bildschirm');
    
    if (singular.endsWith('s') && singular.length > 3) {
        singular = singular.slice(0, -1);
    }

    if (synonyme[singular]) {
        query = synonyme[singular];
    } else if (synonyme[query]) {
        query = synonyme[query];
    } else {
        query = singular;
    }
    
    let ergebnisse;
    if (query === '') {
        ergebnisse = alleProdukte;
    } else {
        // Suchbegriff in einzelne Wörter aufteilen (z.B. "königreich drachen" -> ["königreich", "drachen"])
        const suchWoerter = query.split(/\s+/).filter(w => w.length > 0);
        
        ergebnisse = alleProdukte.filter(p => {
            // Alle Wörter müssen im Titel, Autor oder ISBN vorkommen (UND-Verknüpfung)
            const passtAlleWoerter = suchWoerter.every(wort => {
                const passtName = p.name.toLowerCase().includes(wort);
                const passtAutor = p.autor && p.autor.toLowerCase().includes(wort);
                const passtISBN = p.isbn && p.isbn.includes(wort);
                return passtName || passtAutor || passtISBN;
            });
            
            // Preis-Filter
            const passtPreis = preisFilter === null || 
            (preisModus === 'über' ? p.preis >= preisFilter : p.preis <= preisFilter);
            
            // Kategorie-Filter
            const passtKategorie = ausgewaehlteKategorie === 'all' || 
                                   p.kategorie_id === parseInt(ausgewaehlteKategorie);
            
            return passtAlleWoerter && passtPreis && passtKategorie;
        });
    }

    zeigeProdukte(ergebnisse);

        // NEU: Überschrift auf "Suche nach ..." setzen
    const titelElement = document.getElementById('kategorieTitel');
    const untertitelElement = document.getElementById('kategorieUntertitel');
    const anzahlElement = document.getElementById('suchErgebnisAnzahl');

    if (query !== '') {
        if (titelElement) titelElement.textContent = `Suche nach "${input.value}"`;
        if (untertitelElement) untertitelElement.style.display = 'none';
        if (anzahlElement) {
            anzahlElement.textContent = `${ergebnisse.length} Ergebnisse`;
            anzahlElement.style.display = 'block';
        }
    } else {
        // Wenn die Suche leer ist, zurücksetzen
        if (titelElement) titelElement.textContent = "2026: Eine Welt im Umbruch";
        if (untertitelElement) {
            untertitelElement.textContent = "Entdecken Sie unsere Auswahl an spannenden Geschichten";
            untertitelElement.style.display = 'block';
        }
        if (anzahlElement) anzahlElement.style.display = 'none';
    }

}



document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    

    if (!menuToggle || !mainNav) return;

    function toggleMainMenu(open) {
        mainNav.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Navigation schließen' : 'Navigation öffnen');
        if (!open) {
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        }
        document.body.classList.toggle('menu-open', open);
    }

    // Hamburger öffnen/schließen
    menuToggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = mainNav.classList.contains('is-open');
        toggleMainMenu(!isOpen);
    });

    // X-Button
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            toggleMainMenu(false);
        });
    }

    

    // Klick außerhalb schließt das Hauptmenü
    document.addEventListener('click', function (event) {
        if (window.innerWidth > 768) return;
        if (mainNav.contains(event.target) || menuToggle.contains(event.target)) return;

        if (mainNav.classList.contains('is-open')) {
            toggleMainMenu(false);
        }
    });

    // Normale Links schließen das Menü
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                toggleMainMenu(false);
            }
        });
    });

    // Bei Fenstergröße > 768px zurücksetzen
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            toggleMainMenu(false);
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        }
    });
});
    

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('suchInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sucheAusfuehren();
            }
        });
    }
});

async function addToCart(produktId) {
    if (!isLoggedIn()) {
        alert("Bitte melde dich an, um Produkte in den Warenkorb zu legen.");
        window.location.href = "login.html";
        return;
    }

    try {
        await addWarenkorb(produktId, 1);
        await updateCartCount();
        alert("Buch wurde zum Warenkorb hinzugefügt!");
    } catch (error) {
        console.error("Fehler beim Hinzufügen zum Warenkorb:", error);
        alert("Das Buch konnte nicht hinzugefügt werden. Bitte versuche es später noch einmal.");
    }
}



function navigiereZuKategorie(kategorieId, event) {
    if (event) event.preventDefault();

    // Menü schließen
    const mainNav = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    if (mainNav) mainNav.classList.remove('is-open');
    if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Navigation öffnen');
    }
    document.body.classList.remove('menu-open');
    document.querySelector('.dropdown')?.classList.remove('open');

    // 1. Kategorie filtern und Produkte anzeigen
    filterKategorie(kategorieId, null);

    // 2. Dem Browser 100ms Zeit geben, das Grid neu zu zeichnen, DANN scrollen
    setTimeout(() => {
        zurKategorieScrollen();
    }, 100);
}

function warteAufGridUndScrolle() {
    const grid = document.getElementById('produktGrid');
    if (!grid) {
        zurKategorieScrollen();
        return;
    }

    let letzteHoehe = -1;
    let stabileFrames = 0;
    let versuche = 0;

    function pruefen() {
        versuche++;
        const hoehe = grid.scrollHeight;

        if (hoehe === letzteHoehe) {
            stabileFrames++;
        } else {
            stabileFrames = 0;
            letzteHoehe = hoehe;
        }

        // Grid 3 Frames stabil → fertig gerendert
        if (stabileFrames >= 3 || versuche > 60) {
            zurKategorieScrollen();
            return;
        }
        requestAnimationFrame(pruefen);
    }
    requestAnimationFrame(pruefen);
}



function toggleMiniCart() {
    const miniCart = document.getElementById('miniCartInfo');
    if (miniCart) {
        miniCart.classList.toggle('show');
    }
}



function scrolleZuUeberschrift() {
    const ueberschrift = document.getElementById('kategorieTitel');
    const header = document.querySelector('.site-header');

    if (!ueberschrift || !header) return;

    // 1. Die exakte Höhe des Headers inklusive Sticky-Verhalten messen
    const headerHoehe = header.offsetHeight;

    // 2. Die Position der Überschrift relativ zum Dokument berechnen
    const elementPosition = ueberschrift.getBoundingClientRect().top + window.scrollY;

    // 3. Die Zielposition berechnen: Element-Position minus Header-Höhe minus 20px Puffer
    const zielPosition = elementPosition - headerHoehe - 20;

    // 4. Sanft dorthin scrollen
    window.scrollTo({
        top: zielPosition,
        behavior: 'smooth'
    });
}


// ========================================
// GLOBALE SUCHE (funktioniert auf jeder Seite)
// ========================================
function sucheAusfuehrenGlobal() {
    const input = document.getElementById('suchInput');
    if (!input) return;
    
    const suchbegriff = input.value.trim();
    if (suchbegriff === '') return;
    
    // Leite zur Startseite weiter und übergebe den Suchbegriff als URL-Parameter
    window.location.href = `index.html?suche=${encodeURIComponent(suchbegriff)}`;
}