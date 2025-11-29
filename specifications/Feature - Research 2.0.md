# Motivation

* Aktuell (v1.1.x) fühlt sich Research nutzlos an  
* Spieler wundern sich, warum es als eigenes Attribute getrackt wird

# Recap Version 1 (Aktueller Stand Pre-Release)

Wie funktioniert Research in v1.1.x des Spiels (aktuell)? 

* 10 Research unlocken den Attributes Tab und offenbaren damit alle Formeln der Attribute  
  * Ursprünglich war geplant, dass erst der Tab und dann die Formeln unlocked werden, doch dies wurde aus Zeitgründen gestrichen  
* Bestimmte (ToDo welche?) Grenzwerte an Research machen bis zu 4 Battles gleichzeitig sichtbar  
  * Das erlaubt krasse Battles zu überspringen  
  * Das erlaubt, mehrere Battles gleichzeitig zu progressen  
  * Es hat eine Menge Edge Cases, wenn Research wieder unter den Grenzwert fällt  
    * Es führt zu merkwürdigen Verhalten, wenn man weniger als 4 Battles sehen kann, wenn der Boss sich nähert  
  * Eigentlich wäre dieses Verhalten cooler als Unlockable/Permanent Reward

# Übersicht der Änderungen zum Release

* Requirements unlocken **später im Spiel** **nicht mehr** instant bestimmte Teile des Spiels, sondern müssen über **Technologies** eingelöst werden  
* **Technologies** \= Entities wie Galactic Secrets die mit einem Long Press **Data** verbrauchen um dann bestimmte Spielelemente zu unlocken  
  * → **Technologies** will stand between **Requirements** and **Unlocks**  
* **Data** wird von einem speziellen Task namens **Analysis Core** generiert, wobei **Research** den Progress Speed festlegt (vgl. Grid Strength task)

# Voraussetzungen

- [x] Requirements System → [\!Progress Station - Game Design Doc & General Information](https://docs.google.com/document/d/18gJM20n-za9PTXWcGJLiiEAo33kdgHSCbG9fB8cGgU8/edit?usp=drivesdk) \#Requirements

# Mechaniken

## Super Short Version *(player facing)*

Increase **Research** to accelerate your **Analysis Core**’s **Data** generation. Spend **Data** on **Technologies** to unlock new game elements.

## Geändertes Attribute: **Research**

* Bestimmt die Menge an XP die für den **Analysis Core** generiert wird (so wie Energy das für Grid Strength macht)

## Neue Entity & Entity Type: **Analysis Core**

* Ein immer laufender Task produziert **Data**. Für jedes produzierte **Data** (während des aktuellen Playthrough), steigt die Menge an benötigten XP für den nächsten Punkt **Data**  
  * Dieser Task ist ganz oben im **Technologies** Tab sichtbar (vergleichbar wie die Grid Strength ganz oben im UI sichtbar ist)  
  * Dieser Task ist ebenfalls im Quick View sichtbar, solange **Research \> 0** ist  
* Progress Speed (aka XP Generation) wird mit **Population** speed modifier multipliziert.  
  * XP/cycle \= **Research** x (Population progress speed multiplier)

➜ Vergleiche: [Grid Strength](https://docs.google.com/document/d/1TzS5X_ADEbjir15_Gy-3Xkhx9SHkHxwgnuOhhGdjkG0/edit?tab=t.0#heading=h.es6bt16zltd3) (der Task, nicht das Attribute)

* Unterschied: Grid Strength Progress Speed ist **nicht** durch Population beeinflusst, der Analysis Core hingegen schon.

## Neues Attribut: **Data**

* Start: 0  
* Maximum: *Keines*  
* Einheit: *Keine*  
* Sind eine Währung die gegen Unlocks im **Technologies** Tab getauscht werden kann  
* Wird vom **Analysis Core** generiert  
* **Verfallen** beim Neustart des Spiels, sprich sie bleiben **NICHT** über **Boss Battles** hinaus erhalten  
* Ausgegebene **Data** bleiben ausgegeben und können nicht zurückgeholt werden. Entsprechend gibt es eine Long Press Mechanik, um versehentliches Ausgeben zu verhindern.  
* **Data** muss nicht im Attributes Tab angezeigt werden, da die Kosten statisch sind und die Historie auch im Technologies Tab sichtbar

➜ Vergleiche: [Essence of Unknown](https://docs.google.com/document/d/18GBImTQYECxy1kYjVDsqtbUiYdqX-scuY7jklFAwJzQ/edit?tab=t.0#heading=h.wprihvkof8nq) 

## Neue Entity Type: **Technology**

* Die Requirements für Unlocks sind dann die Requirements für **Technology** → können nur aktiv sein, während alle Requirements erfüllt sind  
* Wie viele **Technologies** “voraus” kann man schauen?  
  * Exakt so, wie die, die man aktuell sehen kann (also keine blocking requirement im Path und alle Prerequisites erfüllt)  
* Konfigurierbar: Jede gekaufte **Technology** macht alle weiteren Technologies teurer  
  * eigentlich wäre das ein doppelter Drag-Effect (langsamerer Science Gain \+ noch mehr Science ausgeben müssen), daher für den Anfang wird die Steigerung wohl 0 betragen  
* Konfigurierbar: **Technologies** können verschiedene Base Cost haben, zb nach Tier

➜ Vergleiche: [Galactic Secrets](https://docs.google.com/document/d/18GBImTQYECxy1kYjVDsqtbUiYdqX-scuY7jklFAwJzQ/edit?tab=t.0#heading=h.dn1zght03pr)

## Neues Requirement Type: **Technology Requirement**

* Eher eine technische, als design Bedingung  
* Sollte es sehr einfach machen, zwischen Game Elements mit Technologies und Game Elements ohne Technologies zu konfigurieren  
* Könnte, wie bei Galactic Secrets, auch eher implizit sein

# UI

## Geänderter Tab: **Galactic Secrets → Technologies**

* Der **Galactic Secrets** Tab (inklusive seines Buttons und Quick Display) fällt weg  
* Dafür gibt es einen neuen **Technologies** Tab, inklusive Button und Quick Display  
* Jedes dieser Elemente wird im folgenden gezeigt und erklärt

## Quick Display

* The progressing research task  
  * Only if it is progressing  
* Available **Data**  
* Available Essence of Unknown

### Bonus

* Statt einfach **Data** anzuzeigen, zeigen wir  
  * Anzahl Available **Technologies** (alle die ihre Prerequisites erfüllt haben)  
  * Anzahl unlockable **Technologies** (alle die ihre Requirements erfüllt haben)   
  * Anzahl affordable **Technologies** (alle, die auch bezahlbar sind mit dem aktuellen **Data** bzw. **Essence of Unknown**)

## Analysis Core

Looks like the energy bar (inside the grid strength bar). No segmented grid strength elements, instead the current data and generated data in this playthrough are shown. 

## Technologies

In the technologies tab, below the Analysis Core element, there should be a table with the following columns:
- **Technology:** The name of the technology to be unlocked
- **State:** Either "Locked" (aka available), "Missing requirement", "Affordable" or "Unlocked"
- **Type:** The entity.type of the entity that will be unlocked, so "Module", "Operation", "Point of Interest" etc
- **Belongs to:** The parent of the entity, e.g. "Station Core" (if its a module --> the module category name), the name of the parent module component for operations, the name of the sector for points of interest and just "Locations" for sectors
- **Effect:** All effects as displayed currently for galactic secrets, plus grid load for operations

# Numbers & Balancing

[https://trello.com/c/9qm2NW63/370-research-numbers-balancing](https://trello.com/c/9qm2NW63/370-research-numbers-balancing) 

- Wie viele Unlocks gibt es? --> one for each entity that has requirements currently PLUS the html elements with requirements
-  Formel Research x Population Modifier → Data  --> same formula as grid strength uses currently to create grid strength from energy
- Basiskosten pro Unlock-Type/-Tier?  --> 1 per HTML element, 3 per sector, 2 per point of interest, 5 per module, 3 üer operation

---

# Fragen & Antworten

- [x] Technologies sind persistent über runs hinweg? Also Data geht verloren aber bereits abgeschlossene technologies bleiben erhalten? Wenn ich die technology “Auto-Battle” freischalte bleibt die erhalten?  
      * Technologien sind immer playthrough-only. Ausnahme: Galactic Secrets, die sind permanent
