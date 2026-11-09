// ========================================
// REGISTRIERUNG
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrierenForm');
    const errorMsg = document.getElementById('fehlerMeldung');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const vorname = document.getElementById('vorname').value;
        const nachname = document.getElementById('nachname').value;
        const email = document.getElementById('email').value;
        const passwort = document.getElementById('passwort').value;
        const passwortBestaetigen = document.getElementById('passwort_bestaetigen').value;

        if (errorMsg) errorMsg.style.display = 'none';

        // NEU: Prüfen, ob das Passwort lang genug ist
        if (passwort.length < 6) {
            if (errorMsg) {
                errorMsg.textContent = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
                errorMsg.style.display = 'block';
            }
            return;
        }

        // 1. Prüfen, ob Passwörter übereinstimmen
        if (passwort !== passwortBestaetigen) {
            if (errorMsg) {
                errorMsg.textContent = 'Die Passwörter stimmen nicht überein.';
                errorMsg.style.display = 'block';
            }
            return;
        }

        // Name aus Vor- und Nachname zusammenbauen (wie das Backend es erwartet)
        const name = `${vorname} ${nachname}`;

        try {
            // 2. Benutzer registrieren
            await registrieren(name, email, passwort);
            
            // 3. Direkt einloggen
            const data = await login(email, passwort);
            
            // 4. Token speichern
            setToken(data.access_token);
            
            // 5. Weiterleitung zur Startseite
            window.location.href = 'index.html';
            
        } catch (error) {
            if (errorMsg) {
                errorMsg.textContent = error.message || 'Fehler bei der Registrierung.';
                errorMsg.style.display = 'block';
            } else {
                alert('Fehler bei der Registrierung.');
            }
        }
    });
});