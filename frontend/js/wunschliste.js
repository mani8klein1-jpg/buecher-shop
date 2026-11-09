document.addEventListener('DOMContentLoaded', async function() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }
    
    await ladeWunschliste();
});

async function ladeWunschliste() {
    const container = document.getElementById('wunschlisteInhalt');
    container.innerHTML = '<p>Lade Wunschliste...</p>';
    
    try {
        const wunschliste = await getWunschliste();
        
        if (wunschliste.length === 0) {
            container.innerHTML = `
                <p>Deine Wunschliste ist noch leer.</p>
                <div style="margin-top: 20px;">
                    <a href="index.html" class="btn btn-primary">Jetzt stöbern</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        wunschliste.forEach(eintrag => {
            const card = document.createElement('div');
            card.className = 'wunschliste-item';
            card.innerHTML = `
                <img src="${eintrag.produkt_bild}" alt="${eintrag.produkt_name}" style="width: 80px; border-radius: 4px;">
                <div style="flex: 1; margin-left: 15px;">
                    <h3>${eintrag.produkt_name}</h3>
                    <p style="color: var(--primary-color); font-weight: bold;">${eintrag.produkt_preis.toFixed(2).replace('.', ',')} €</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="produkt.html?id=${eintrag.produkt_id}" class="btn" style="background-color: #0d47a1;">Ansehen</a>
                    <button class="btn" style="background-color: #d32f2f;" onclick="entferneVonWunschliste(${eintrag.id})">Entfernen</button>
                </div>
            `;
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error("Fehler beim Laden der Wunschliste:", error);
        container.innerHTML = '<p>Fehler beim Laden der Wunschliste.</p>';
    }
}

async function entferneVonWunschliste(eintragId) {
    if (!confirm("Möchtest du dieses Buch von der Wunschliste entfernen?")) return;
    
    try {
        await deleteWunschliste(eintragId);
        await ladeWunschliste();
    } catch (error) {
        console.error("Fehler beim Entfernen:", error);
        alert("Das Buch konnte nicht entfernt werden.");
    }
}