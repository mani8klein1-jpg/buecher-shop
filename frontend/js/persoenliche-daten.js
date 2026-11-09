document.addEventListener('DOMContentLoaded', async function() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    // Benutzerdaten laden
    try {
        const benutzer = await getBenutzer();
        document.getElementById('name').value = benutzer.name;
        document.getElementById('email').value = benutzer.email;
    } catch (error) {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
    }

    // Formular absenden
    document.getElementById('persoenlicheDatenForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const daten = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value
        };

        try {
            await updateBenutzer(daten);
            alert("Daten erfolgreich gespeichert!");
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Fehler beim Speichern der Daten.");
        }
    });
});