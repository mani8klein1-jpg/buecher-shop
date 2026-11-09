// ========================================
// LOGIN (Einfache Version für login.html)
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const errorMsg = document.getElementById('fehlerMeldung');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const passwort = document.getElementById('passwort').value;

        // Fehlermeldung verstecken (falls sie noch von einem vorherigen Versuch da ist)
        if (errorMsg) errorMsg.style.display = 'none';

        try {
            // Die login-Funktion aus der api.js aufrufen
            const data = await login(email, passwort);
            
            // Token speichern
            setToken(data.access_token);
            
            // Weiterleitung zur Startseite
            window.location.href = 'index.html';
            
        } catch (error) {
            // Fehlermeldung anzeigen
            if (errorMsg) {
                errorMsg.textContent = 'E-Mail oder Passwort falsch.';
                errorMsg.style.display = 'block';
            } else {
                alert('E-Mail oder Passwort falsch.');
            }
        }
    });
});