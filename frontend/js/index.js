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
    
    // Wenn keine Produkte da sind, zeigen wir die Meldung an
    if (produkte.length === 0) {
        grid.innerHTML = '<p style="color:#888; text-align: center; width: 100%;">Keine Produkte in dieser Kategorie.</p>';
        return;
    }
    
    // Wir erstellen einen unsichtbaren Container im Arbeitsspeicher
    const neuerInhalt = document.createDocumentFragment();
    
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
        
        neuerInhalt.appendChild(card);
    });
    
    grid.innerHTML = '';
    grid.appendChild(neuerInhalt);
}

function filterKategorie(kategorieId, eventOrButton) {
    if (eventOrButton && typeof eventOrButton.preventDefault === 'function') {
        eventOrButton.preventDefault();
    }

    bannerAusblenden();

    const anzahlElement = document.getElementById('suchErgebnisAnzahl');
    const untertitelElement = document.getElementById('kategorieUntertitel');

    if (anzahlElement) anzahlElement.style.display = 'none';
    if (untertitelElement) untertitelElement.style.display = 'block';

    aktiveKategorie = kategorieId;
    const titelElement = document.getElementById('kategorieTitel');

    if (kategorieId === null) {
        if (titelElement) titelElement.textContent = "2026: Eine Welt im Umbruch";
        if (untertitelElement) {
            untertitelElement.textContent = "Entdecken Sie unsere Auswahl an spannenden Geschichten";
        }
        zeigeProdukte(alleProdukte);
    } else {
        const gefiltert = alleProdukte.filter(p => p.kategorie_id === kategorieId);
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

function bannerAusblenden() {
    const banner = document.getElementById('promoBanner') || document.querySelector('.promo-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}

function zurKategorieScrollen() {
    const zielElement = document.getElementById('kategorieTitel');
    if (!zielElement) return;

    const header = document.querySelector('.site-header');
    const headerHoehe = header ? header.offsetHeight : 0;

    const zielPosition =
        zielElement.getBoundingClientRect().top +
        window.scrollY -
        headerHoehe -
        150; // 150px Abstand, damit der Banner drüber verschwindet

    const startPosition = window.scrollY;
    const strecke = Math.max(0, zielPosition) - startPosition;
    const dauer = 800; // Etwas flotter, damit es knackig wirkt
    let startZeit = null;

    function langsamScrollen(zeit) {
        if (!startZeit) startZeit = zeit;
        const fortschritt = Math.min((zeit - startZeit) / dauer, 1);
        const easing = 1 - Math.pow(1 - fortschritt, 3);
        window.scrollTo(0, startPosition + strecke * easing);
        if (fortschritt < 1) {
            requestAnimationFrame(langsamScrollen);
        }
    }
    requestAnimationFrame(langsamScrollen);
}

function zurLoginUeberschriftScrollen() {
    const zielElement = document.getElementById('loginTitel');
    if (!zielElement) return;
    const header = document.querySelector('.site-header');
    const headerHoehe = header ? header.offsetHeight : 0;
    const zielPosition = zielElement.getBoundingClientRect().top + window.scrollY - headerHoehe - 15;
    const startPosition = window.scrollY;
    const strecke = zielPosition - startPosition;
    const dauer = 1400;
    let startZeit = null;

    function langsamScrollen(zeit) {
        if (!startZeit) startZeit = zeit;
        const fortschritt = Math.min((zeit - startZeit) / dauer, 1);
        const easing = 1 - Math.pow(1 - fortschritt, 3);
        window.scrollTo(0, startPosition + strecke * easing);
        if (fortschritt < 1) {
            requestAnimationFrame(langsamScrollen);
        }
    }
    requestAnimationFrame(langsamScrollen);
}

function zurRegistrierenUeberschriftScrollen() {
    const zielElement = document.getElementById('registrierenTitel');
    if (!zielElement) return;
    const header = document.querySelector('.site-header');
    const headerHoehe = header ? header.offsetHeight : 0;
    const zielPosition = zielElement.getBoundingClientRect().top + window.scrollY - headerHoehe - 15;
    const startPosition = window.scrollY;
    const strecke = zielPosition - startPosition;
    const dauer = 1400;
    let startZeit = null;

    function langsamScrollen(zeit) {
        if (!startZeit) startZeit = zeit;
        const fortschritt = Math.min((zeit - startZeit) / dauer, 1);
        const easing = 1 - Math.pow(1 - fortschritt, 3);
        window.scrollTo(0, startPosition + strecke * easing);
        if (fortschritt < 1) {
            requestAnimationFrame(langsamScrollen);
        }
    }
    requestAnimationFrame(langsamScrollen);
}

window.addEventListener('load', function() {
    if (document.getElementById('registrierenTitel')) {
        setTimeout(() => { zurRegistrierenUeberschriftScrollen(); }, 300);
    }
    if (document.getElementById('loginTitel')) {
        setTimeout(() => { zurLoginUeberschriftScrollen(); }, 300);
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
            if (adminLink) adminLink.style.display = benutzer.ist_admin ? 'block' : 'none';
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
    let istSprachSuche = false;
    
    const selectElement = document.getElementById('suchKategorie');
    const ausgewaehlteKategorie = selectElement ? selectElement.value : 'all';
    
    const navigationsBefehle = [
        { woerter: ["anmelden", "einloggen", "login", "konto"], ziel: "login.html" },
        { woerter: ["registrieren", "anlegen", "neues konto", "registrierung"], ziel: "registrieren.html" },
        { woerter: ["hilfe", "versandkosten",], ziel: "hilfe.html" },
        { woerter: ["warenkorb", "korb", "einkaufswagen"], ziel: "warenkorb.html" },
        { woerter: ["kasse", "bezahlen", "checkout", "bestellen"], ziel: "checkout.html" },
        { woerter: ["bestellungen", "meine bestellung", "bestellübersicht"], ziel: "bestellungen.html" },
        { woerter: ["profil", "mein konto", "meine daten"], ziel: "profil.html" },
        { woerter: ["admin", "verwaltung", "produkte anlegen"], ziel: "admin.html" },
        { woerter: ["weiter einkaufen", "weiter shoppen"], ziel: "index.html" },
        { woerter: ["angebote", "rabatte", "sale"], ziel: "kategorie", kategorieId: 12 },
        { woerter: ["bestseller", "top seller"], ziel: "kategorie", kategorieId: 7 },
        { woerter: ["neuheiten", "neue bücher"], ziel: "kategorie", kategorieId: 13 },
        { woerter: ["kinderbücher", "kinderbuch", "kinder"], ziel: "kategorie", kategorieId: 5 },
        { woerter: ["spiele", "spiel"], ziel: "kategorie", kategorieId: 8 },
        { woerter: ["geschenke", "geschenk"], ziel: "kategorie", kategorieId: 9 },
        { woerter: ["poesie", "gedichte"], ziel: "kategorie", kategorieId: 11 },
        { woerter: ["fachbücher", "fachbuch", "sachbücher"], ziel: "kategorie", kategorieId: 4 }
    ];

    for (const befehl of navigationsBefehle) {
        if (befehl.woerter.some(wort => query.includes(wort))) {
            const produktExistiert = alleProdukte.some(p => p.name.toLowerCase().includes(query));
            if (!produktExistiert) {
                if (befehl.ziel === "kategorie") {
                    filterKategorie(befehl.kategorieId, null);
                    return;
                }
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
        } else {
            preisModus = 'bis';
        }
        query = query.replace(preisMatch[0], '').replace(/\s*(euro|€)\s*/gi, '').trim();
    }

    const fuellwoerter = [ /* gekürzt für Übersicht, deine Liste bleibt hier erhalten */ ];
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
        "laila": "leila", "usb": "usb", "usb-kabel": "usb", "usb-c": "usb"
    };

    let singular = query;
    singular = singular.replace(/laptops$/i, 'laptop').replace(/monitore$/i, 'monitor')
                       .replace(/monitoren$/i, 'monitor').replace(/mäuse$/i, 'maus')
                       .replace(/tastaturen$/i, 'tastatur').replace(/kabeln$/i, 'kabel')
                       .replace(/kopfhörern$/i, 'kopfhörer').replace(/festplatten$/i, 'festplatte')
                       .replace(/bildschirme$/i, 'bildschirm');
    
    if (singular.endsWith('s') && singular.length > 3) { singular = singular.slice(0, -1); }

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
        function istAehnlich(text, suchbegriff) {
            if (!text) return false;
            text = text.toLowerCase();
            suchbegriff = suchbegriff.toLowerCase();
            if (text.includes(suchbegriff)) return true;
            if (suchbegriff.length >= 4) {
                const prefix = suchbegriff.substring(0, 4);
                if (text.includes(prefix)) return true;
            }
            return false;
        }

        ergebnisse = alleProdukte.filter(p => {
            const passtName = istAehnlich(p.name, query);
            const passtAutor = istAehnlich(p.autor, query);
            const passtPreis = preisFilter === null || (preisModus === 'über' ? p.preis >= preisFilter : p.preis <= preisFilter);
            return (passtName || passtAutor) && passtPreis;
        });
    }

    zeigeProdukte(ergebnisse);

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
        if (titelElement) titelElement.textContent = "2026: Eine Welt im Umbruch";
        if (untertitelElement) {
            untertitelElement.textContent = "Entdecken Sie unsere Auswahl an spannenden Geschichten";
            untertitelElement.style.display = 'block';
        }
        if (anzahlElement) anzahlElement.style.display = 'none';
    }

    if (query !== '') {
        if (ergebnisse.length === 0) {
            bannerAusblenden();
        } 
        setTimeout(() => {
            warteAufGridUndScrolle();
        }, 50);
    } else {
        const titelElementOben = document.getElementById('kategorieTitel');
        if (titelElementOben) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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

    menuToggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = mainNav.classList.contains('is-open');
        toggleMainMenu(!isOpen);
    });

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            toggleMainMenu(false);
        });
    }

    document.addEventListener('click', function (event) {
        if (window.innerWidth > 768) return;
        if (mainNav.contains(event.target) || menuToggle.contains(event.target)) return;
        if (mainNav.classList.contains('is-open')) {
            toggleMainMenu(false);
        }
    });

    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                toggleMainMenu(false);
            }
        });
    });

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

    const mainNav = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    if (mainNav) mainNav.classList.remove('is-open');
    if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Navigation öffnen');
    }
    document.body.classList.remove('menu-open');
    document.querySelector('.dropdown')?.classList.remove('open');

    filterKategorie(kategorieId, null);
    warteAufGridUndScrolle();
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

        if (stabileFrames >= 3 || versuche > 60) {
            setTimeout(zurKategorieScrollen, 50);
            return;
        }
        requestAnimationFrame(pruefen);
    }
    requestAnimationFrame(pruefen);
}

function scrolleZumJetztStoebernButton() {
    const button = document.querySelector('.promo-banner .promo-content button');
    if (!button) return;
    const extraPlatz = window.innerHeight;
    document.body.style.paddingBottom = extraPlatz + 'px';
    requestAnimationFrame(() => {
        const buttonPosition = button.getBoundingClientRect().top;
        const zielPosition = window.scrollY + buttonPosition - 30;
        window.scrollTo({ top: zielPosition, behavior: 'smooth' });
    });
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

    const headerHoehe = header.offsetHeight;
    const elementPosition = ueberschrift.getBoundingClientRect().top + window.scrollY;
    const zielPosition = elementPosition - headerHoehe - 20;

    window.scrollTo({ top: zielPosition, behavior: 'smooth' });
}

function sucheAusfuehrenGlobal() {
    const input = document.getElementById('suchInput');
    if (!input) return;
    const suchbegriff = input.value.trim();
    if (suchbegriff === '') return;
    window.location.href = `index.html?suche=${encodeURIComponent(suchbegriff)}`;
}

function handleJetztStoebern() {
    const input = document.getElementById('suchInput');
    if (input) input.value = '';

    const select = document.getElementById('suchKategorie');
    if (select) select.value = 'all';

    const neueUrl = window.location.pathname;
    window.history.replaceState({}, '', neueUrl);

    filterKategorie(null, null);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            zurKategorieScrollen();
        });
    });
}