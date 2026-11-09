document.addEventListener('DOMContentLoaded', async function() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    // Adresse laden
    try {
        const adresse = await getRechnungsadresse();
        document.getElementById('rechnung_vorname').value = adresse.rechnung_vorname || '';
        document.getElementById('rechnung_nachname').value = adresse.rechnung_nachname || '';
        document.getElementById('rechnung_strasse').value = adresse.rechnung_strasse || '';
        document.getElementById('rechnung_plz').value = adresse.rechnung_plz || '';
        document.getElementById('rechnung_ort').value = adresse.rechnung_ort || '';
    } catch (error) {
        console.error("Fehler beim Laden der Adresse:", error);
    }

    // Formular absenden
    document.getElementById('rechnungsadresseForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const plz = document.getElementById('rechnung_plz').value;
        if (plz && !/^\d{5}$/.test(plz)) {
            alert("Bitte geben Sie eine gültige 5-stellige Postleitzahl ein.");
            return;
        }

        const daten = {
            rechnung_vorname: document.getElementById('rechnung_vorname').value,
            rechnung_nachname: document.getElementById('rechnung_nachname').value,
            rechnung_strasse: document.getElementById('rechnung_strasse').value,
            rechnung_plz: plz,
            rechnung_ort: document.getElementById('rechnung_ort').value
        };

        try {
            await updateRechnungsadresse(daten);
            alert("Adresse erfolgreich gespeichert!");
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Fehler beim Speichern der Adresse.");
        }
    });
});