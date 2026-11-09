import os
from database import SessionLocal, engine, Base
import models

# Tabellen erstellen, falls sie noch nicht existieren
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# 1. Alles löschen (für einen sauberen Start)
print("Lösche alte Daten...")
db.query(models.Bestellposition).delete()
db.query(models.Bestellung).delete()
db.query(models.Warenkorb).delete()
db.query(models.Produkt).delete()
db.query(models.Kategorie).delete()
db.commit()
print("Datenbank geleert.")

# 2. Kategorien anlegen (passend zu deinen Büchern)
kategorien_liste = [
    "Romane", 
    "Krimis & Thriller", 
    "Fantasy & Abenteuer", 
    "Sachbücher & Entwicklung", 
    "Kinderbücher", 
    "Geschichte & Kultur"
]
db_kategorien = {}

for k in kategorien_liste:
    neue_kat = models.Kategorie(name=k)
    db.add(neue_kat)
    db.commit()
    db.refresh(neue_kat)
    db_kategorien[k] = neue_kat.id

print("Kategorien angelegt.")

# 3. Die Bücher-Liste (basierend auf deinen 30 Büchern)
buecher_daten = [
    # Kategorie: Romane
    {"name": "Das Licht von Lissabon", "autor": "Sofia Mendes", "preis": 18.90, "lagerbestand": 24, "beschreibung": "Eine bewegende Geschichte über Neuanfänge, verlorene Erinnerungen und die Kraft der Familie. Als Clara nach vielen Jahren in ihre Heimatstadt Lissabon zurückkehrt, entdeckt sie in einem alten Haus Briefe, die das Leben ihrer Familie für immer verändern. Zwischen engen Gassen, kleinen Cafés und dem Licht des Atlantiks muss sie entscheiden, ob sie der Vergangenheit eine zweite Chance gibt.", "kategorie": "Romane"},
    {"name": "Ein Herbst voller Versprechen", "autor": "Daniel Weber", "preis": 16.50, "lagerbestand": 18, "beschreibung": "Nach einer schwierigen Trennung beginnt Jonas in einer kleinen Stadt ein neues Leben. Dort begegnet er einer Buchhändlerin, die ihre eigenen Träume längst aufgegeben hat. Gemeinsame Spaziergänge, unerwartete Begegnungen und ein altes Versprechen führen beide zu der Frage, ob Liebe auch dann entstehen kann, wenn man sie nicht mehr erwartet.", "kategorie": "Romane"},
    {"name": "Wo die Berge schweigen", "autor": "Lena Hartmann", "preis": 21.00, "lagerbestand": 15, "beschreibung": "Ein unerwarteter Brief führt Marie in das abgelegene Bergdorf ihrer Großeltern. Dort stößt sie auf ein Familiengeheimnis, das über Generationen verschwiegen wurde. Während sie alte Tagebücher liest und die Bewohner kennenlernt, erkennt sie, dass manche Wahrheiten schmerzhaft sind, aber auch die Freiheit schenken, endlich den eigenen Weg zu gehen.", "kategorie": "Romane"},
    {"name": "Zwischen gestern und morgen", "autor": "Elias Berger", "preis": 17.90, "lagerbestand": 30, "beschreibung": "Drei Menschen begegnen sich zufällig in einer Großstadt und stehen vor entscheidenden Wendepunkten ihres Lebens. Ein Architekt zweifelt an seinem Erfolg, eine junge Mutter sucht nach neuen Möglichkeiten und ein pensionierter Lehrer versucht, einen alten Fehler wiedergutzumachen. Ihre Geschichten verbinden sich auf unerwartete Weise.", "kategorie": "Romane"},
    {"name": "Der Garten der Erinnerungen", "autor": "Amira Laurent", "preis": 19.50, "lagerbestand": 12, "beschreibung": "Nach dem Tod ihrer Großmutter erbt Nadia ein altes Haus mit einem verwilderten Garten. Bei den Renovierungsarbeiten entdeckt sie Gegenstände und Aufzeichnungen, die Geschichten aus einer längst vergangenen Zeit erzählen. Der Garten wird zu einem Ort der Begegnung, an dem Nadia nicht nur ihre Familiengeschichte, sondern auch sich selbst neu entdeckt.", "kategorie": "Romane"},
    
    # Kategorie: Krimis & Thriller
    {"name": "Schatten über dem Hafen", "autor": "Markus Feld", "preis": 14.90, "lagerbestand": 22, "beschreibung": "Als ein angesehener Geschäftsmann tot im alten Hafen gefunden wird, übernimmt Kommissarin Eva Brandt die Ermittlungen. Die Spuren führen zu einem Netzwerk aus Lügen, Erpressung und verschwundenen Dokumenten. Je näher sie der Wahrheit kommt, desto deutlicher wird, dass jemand ihre Ermittlungen sabotiert.", "kategorie": "Krimis & Thriller"},
    {"name": "Das Haus am Ende der Straße", "autor": "Clara Winter", "preis": 15.90, "lagerbestand": 16, "beschreibung": "Ein neues Zuhause sollte für Familie Sommer einen Neuanfang bedeuten. Doch nachts hören sie Schritte auf dem Dachboden und finden verschlossene Räume, von denen niemand etwas wissen will. Als eine Nachbarin spurlos verschwindet, beginnt eine Suche nach Antworten, die das ruhige Viertel in Angst versetzt.", "kategorie": "Krimis & Thriller"},
    {"name": "Die letzte Stunde", "autor": "Tobias Kern", "preis": 13.90, "lagerbestand": 27, "beschreibung": "Ein Journalist erhält eine Nachricht mit einer rätselhaften Warnung und einer Uhrzeit. Kurz darauf geschehen Ereignisse, die scheinbar keinen Zusammenhang haben. Während die Zeit abläuft, muss er ein jahrzehntealtes Rätsel lösen und herausfinden, wem er noch vertrauen kann.", "kategorie": "Krimis & Thriller"},
    {"name": "Spuren im Regen", "autor": "Miriam Scholz", "preis": 16.90, "lagerbestand": 20, "beschreibung": "Nach einem nächtlichen Unfall widersprechen sich sämtliche Zeugenaussagen. Ermittlerin Jana Wolf findet heraus, dass ein scheinbar unbedeutendes Detail mit einem ungelösten Vermisstenfall verbunden ist. Die Suche nach dem Täter führt sie in eine Welt, in der jeder etwas verbirgt.", "kategorie": "Krimis & Thriller"},
    {"name": "Der Zug nach Mitternacht", "autor": "Vincent Roth", "preis": 17.50, "lagerbestand": 14, "beschreibung": "Ein Nachtzug erreicht seinen Zielbahnhof, doch ein Fahrgast fehlt. Die Zugbegleiterin erinnert sich an eine Begegnung, die zunächst bedeutungslos schien. Gemeinsam mit einem Reisenden beginnt sie nachzuforschen und entdeckt, dass mehrere Passagiere unter falschem Namen unterwegs sind.", "kategorie": "Krimis & Thriller"},

    # Kategorie: Fantasy & Abenteuer
    {"name": "Das Königreich der sieben Sterne", "autor": "Elena Falk", "preis": 22.90, "lagerbestand": 19, "beschreibung": "In einem Königreich, dessen Magie von sieben Sternen abhängt, entdeckt die junge Kartografin Liora eine vergessene Sternenkarte. Gemeinsam mit einem geheimnisvollen Reisenden macht sie sich auf den Weg, die verschwundenen Sternbilder wiederzufinden. Doch eine dunkle Macht versucht, das Gleichgewicht der Welt zu zerstören.", "kategorie": "Fantasy & Abenteuer"},
    {"name": "Der Wald der vergessenen Magie", "autor": "Julian Stern", "preis": 18.90, "lagerbestand": 25, "beschreibung": "Als seltsame Lichter im Wald erscheinen, folgt der junge Leon einem Pfad, den auf keiner Karte jemand kennt. Hinter uralten Bäumen entdeckt er eine verborgene Gemeinschaft magischer Wesen. Um den Wald vor dem Verschwinden zu retten, muss er lernen, dass Mut nicht bedeutet, keine Angst zu haben.", "kategorie": "Fantasy & Abenteuer"},
    {"name": "Die Karte der verlorenen Welt", "autor": "Mara König", "preis": 20.90, "lagerbestand": 11, "beschreibung": "Eine vergilbte Karte führt eine junge Archäologin zu einer vergessenen Stadt in der Wüste. Auf ihrer Expedition stößt sie auf rätselhafte Inschriften, verborgene Kammern und Hinweise auf eine Zivilisation, deren Wissen die Geschichte verändern könnte. Doch sie ist nicht die Einzige, die nach diesem Ort sucht.", "kategorie": "Fantasy & Abenteuer"},
    {"name": "Der letzte Drache von Eldoria", "autor": "Adrian Falken", "preis": 23.90, "lagerbestand": 9, "beschreibung": "Seit Jahrhunderten gelten Drachen als ausgestorben. Als die junge Schmiedin Mira ein geheimnisvolles Ei findet, gerät sie in einen Konflikt zwischen rivalisierenden Königreichen. Mit einem unerwarteten Verbündeten muss sie eine alte Prophezeiung entschlüsseln und verhindern, dass ein neuer Krieg ausbricht.", "kategorie": "Fantasy & Abenteuer"},
    {"name": "Jenseits der letzten Galaxie", "autor": "Nora Stein", "preis": 19.90, "lagerbestand": 17, "beschreibung": "Die junge Raumpilotin Sera empfängt ein Signal aus einer Region, die in allen Sternenkarten als leer verzeichnet ist. Auf ihrer Reise entdeckt die Besatzung ein unbekanntes Sternensystem und Spuren einer fortgeschrittenen Zivilisation. Bald muss Sera entscheiden, ob die Entdeckung mit der Erde geteilt werden darf.", "kategorie": "Fantasy & Abenteuer"},

    # Kategorie: Sachbücher & Entwicklung
    {"name": "Die Kunst, neu anzufangen", "autor": "Helena Brandt", "preis": 17.90, "lagerbestand": 32, "beschreibung": "Dieses praxisorientierte Buch zeigt, wie sich persönliche Veränderungen in überschaubare Schritte aufteilen lassen. Mit Reflexionsfragen, alltagstauglichen Übungen und Methoden zur Zielsetzung unterstützt es Leserinnen und Leser dabei, hinderliche Gewohnheiten zu erkennen, Prioritäten neu zu ordnen und langfristig motiviert zu bleiben.", "kategorie": "Sachbücher & Entwicklung"},
    {"name": "Zeit für das Wesentliche", "autor": "Paul Richter", "preis": 15.90, "lagerbestand": 21, "beschreibung": "Zwischen beruflichen Aufgaben, privaten Verpflichtungen und digitalen Ablenkungen bleibt oft wenig Raum für das wirklich Wichtige. Dieses Buch vermittelt Strategien zur besseren Planung, zum Setzen klarer Grenzen und zum bewussten Umgang mit der eigenen Zeit. Zahlreiche Beispiele zeigen, wie aus kleinen Veränderungen nachhaltige Routinen werden.", "kategorie": "Sachbücher & Entwicklung"},
    {"name": "Geld verstehen, Zukunft gestalten", "autor": "Julia Neumann", "preis": 19.90, "lagerbestand": 28, "beschreibung": "Ein verständlicher Einstieg in den Umgang mit persönlichen Finanzen. Das Buch erklärt Haushaltsplanung, Rücklagen, Zinseszins, Risiken und grundlegende Anlageprinzipien. Anhand fiktiver Alltagsbeispiele lernen Leserinnen und Leser, finanzielle Ziele zu definieren, Kosten zu überblicken und Entscheidungen auf einer soliden Informationsgrundlage zu treffen.", "kategorie": "Sachbücher & Entwicklung"},
    {"name": "Nachhaltig leben im Alltag", "autor": "Felix Sommer", "preis": 16.90, "lagerbestand": 26, "beschreibung": "Von bewusstem Einkaufen über Energiesparen bis zur Vermeidung unnötiger Verpackungen: Dieses Buch stellt konkrete Möglichkeiten für einen umweltbewussteren Alltag vor. Es zeigt, welche Veränderungen leicht umzusetzen sind, wie man Gewohnheiten dauerhaft verändert und worauf es bei nachhaltigen Entscheidungen wirklich ankommt.", "kategorie": "Sachbücher & Entwicklung"},
    {"name": "Die Sprache unserer Gefühle", "autor": "Miriam Vogel", "preis": 18.50, "lagerbestand": 13, "beschreibung": "Gefühle beeinflussen unsere Entscheidungen, Beziehungen und Wahrnehmungen. Dieses allgemeinverständliche Sachbuch erklärt grundlegende psychologische Zusammenhänge und zeigt anhand von Alltagssituationen, wie man Emotionen besser wahrnimmt, Missverständnisse reduziert und konstruktiver kommuniziert.", "kategorie": "Sachbücher & Entwicklung"},

    # Kategorie: Kinderbücher
    {"name": "Fips und das Geheimnis des Waldes", "autor": "Emma Fischer", "preis": 12.90, "lagerbestand": 35, "beschreibung": "Der kleine Fuchs Fips entdeckt eines Morgens geheimnisvolle Spuren vor seiner Höhle. Zusammen mit seiner Freundin Lilli, dem neugierigen Igel, folgt er ihnen durch den Wald. Unterwegs helfen die beiden anderen Tieren und lernen, wie wichtig Freundschaft, Zusammenhalt und der Mut sind, Neues auszuprobieren.", "kategorie": "Kinderbücher"},
    {"name": "Mia reist zu den Sternen", "autor": "Benno Licht", "preis": 13.50, "lagerbestand": 23, "beschreibung": "Mia träumt davon, das Weltall zu erkunden. Mit ihrem selbst gebauten Raumschiff besucht sie fantasievolle Planeten, trifft freundliche Weltraumbewohner und entdeckt die Schönheit der Sterne. Eine warmherzige Geschichte, die Neugier weckt und Kindern spielerisch zeigt, dass Fragen der Anfang jeder Entdeckung sind.", "kategorie": "Kinderbücher"},
    {"name": "Bruno, der kleine Wolkendrache", "autor": "Lisa Morgen", "preis": 11.90, "lagerbestand": 31, "beschreibung": "Bruno ist der einzige Drache im Wolkental, der noch nicht fliegen kann. Während seine Freunde längst durch die Lüfte gleiten, sucht er nach seiner eigenen Stärke. Mit viel Geduld und der Unterstützung seiner Familie entdeckt Bruno, dass jeder sein eigenes Tempo hat und dass Übung und Selbstvertrauen viel bewirken können.", "kategorie": "Kinderbücher"},
    {"name": "Das Abenteuer unter dem Meer", "autor": "Tim Seebach", "preis": 14.50, "lagerbestand": 20, "beschreibung": "Noah entdeckt ein kleines U-Boot am Strand und begibt sich auf eine fantastische Reise durch die Unterwasserwelt. Er begegnet bunten Fischen, einer weisen Meeresschildkröte und einem verspielten Delfin. Gemeinsam finden sie heraus, warum das Korallenriff immer stiller wird, und lernen, wie man das Meer schützen kann.", "kategorie": "Kinderbücher"},
    {"name": "Der Baum, der Geschichten erzählte", "autor": "Paula Grün", "preis": 12.50, "lagerbestand": 29, "beschreibung": "Im Garten ihrer Großeltern entdeckt Amelie einen alten Baum, der ihr jeden Abend eine neue Geschichte erzählt. Die Erzählungen handeln von fernen Ländern, mutigen Kindern und außergewöhnlichen Tieren. Mit jeder Geschichte lernt Amelie etwas über Hilfsbereitschaft, Ehrlichkeit und den achtsamen Umgang mit der Natur.", "kategorie": "Kinderbücher"},

    # Kategorie: Geschichte & Kultur
    {"name": "Spuren einer vergangenen Welt", "autor": "Dr. Leonhard Weiss", "preis": 24.90, "lagerbestand": 10, "beschreibung": "Dieses reichhaltig illustrierte Sachbuch führt in die Welt antiker Zivilisationen. Es behandelt Architektur, Handel, Alltag und politische Strukturen und erklärt, wie archäologische Funde unser Verständnis der Vergangenheit verändern. Karten und anschauliche Beispiele machen historische Zusammenhänge auch ohne Vorkenntnisse verständlich.", "kategorie": "Geschichte & Kultur"},
    {"name": "Portugal: Geschichten und Traditionen", "autor": "Isabel Duarte", "preis": 22.50, "lagerbestand": 18, "beschreibung": "Eine Entdeckungsreise durch Portugals kulturelles Erbe: von traditionellen Azulejos und regionalen Festen bis zu Musik, Literatur und kulinarischen Besonderheiten. Das Buch verbindet historische Hintergründe mit fiktiven Reiseepisoden und vermittelt einen vielseitigen Eindruck davon, wie regionale Traditionen das moderne Leben prägen.", "kategorie": "Geschichte & Kultur"},
    {"name": "Burgen, Ritter und Legenden", "autor": "Matthias Kronberg", "preis": 20.90, "lagerbestand": 16, "beschreibung": "Wie lebten Menschen im Mittelalter wirklich? Dieses Buch beleuchtet das Leben auf Burgen, die Aufgaben von Handwerkern und Händlern sowie die Entstehung bekannter Ritterlegenden. Es trennt historische Tatsachen von späteren Mythen und zeigt, wie sich Vorstellungen vom Mittelalter über die Jahrhunderte verändert haben.", "kategorie": "Geschichte & Kultur"},
    {"name": "Die Farben des Orients", "autor": "Samira El Mansouri", "preis": 23.90, "lagerbestand": 12, "beschreibung": "Dieses kulturgeschichtliche Buch widmet sich den Farben, Mustern und Handwerkstraditionen Nordafrikas. Es erzählt von kunstvollen Mosaiken, traditionellen Textilien, historischen Handelswegen und der Architektur alter Medinas. Die Kapitel zeigen, wie Wissen und Techniken über Generationen weitergegeben werden und unterschiedliche Kulturen miteinander verbunden sind.", "kategorie": "Geschichte & Kultur"},
    {"name": "Eine Welt voller Entdeckungen", "autor": "Alexander Meier", "preis": 21.90, "lagerbestand": 14, "beschreibung": "Von frühen Handelsrouten bis zu den großen wissenschaftlichen Expeditionen erzählt dieses Buch von Menschen, die unbekannte Regionen erkundeten und unser Weltbild veränderten. Es beleuchtet sowohl technische Errungenschaften als auch die Folgen der Entdeckungsreisen für die betroffenen Gesellschaften und Kulturen.", "kategorie": "Geschichte & Kultur"}
]

print(f"{len(buecher_daten)} Bücher in der Liste. Lege sie an...")

# 4. Die Bücher in die Datenbank einfügen
for i, b in enumerate(buecher_daten):
    # Wir gehen davon aus, dass die Bilder buch1.jpg bis buch30.jpg heißen
    bild_dateiname = f"buch{i+1}.jpg"
    
    neues_buch = models.Produkt(
        name=b["name"],
        beschreibung=b["beschreibung"],
        preis=b["preis"],
        lagerbestand=b["lagerbestand"],
        bild_url=f"bilder/{bild_dateiname}",
        kategorie_id=db_kategorien[b["kategorie"]],
        autor=b["autor"],
        isbn=f"978-3-16-148410-{i}", # Platzhalter ISBN
        verlag="Casa do Livro Verlag",
        erscheinungsjahr=2026
    )
    db.add(neues_buch)

db.commit()
db.close()

print("Alle 30 Bücher erfolgreich mit Bildern und Daten angelegt!")