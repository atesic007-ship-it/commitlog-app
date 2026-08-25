# COMMIT.LOG

## 1. Opis projekta

**COMMIT.LOG** je lični dnevnik za praćenje vremena uloženog u učenje **front-end tehnologija**, kao što su JavaScript, React, TypeScript, CSS i druge povezane tehnologije.

Problem koji aplikacija rešava jeste nedostatak preglednog načina da osoba koja uči programiranje prati sopstveni napredak — **koliko vremena je uložila, koje tehnologije uči i kakva je dinamika njenog učenja**.

---

# 2. Funkcionalnosti

### 2.1. Unos sesije učenja

Korisnik može da doda novu sesiju učenja putem forme koja sadrži:

- tehnologiju — izbor iz unapred definisane liste ili ručni unos
- temu koja je učena
- trajanje u minutima
- datum učenja

Pre čuvanja podataka vrši se validacija:

- tema ne sme biti prazna
- trajanje mora biti veće od nule

---

### 2.2. Pregled ukupnih statistika

Aplikacija automatski izračunava i prikazuje pet osnovnih statistika:

- **Ukupno vreme učenja**
- **Vreme učenja ove nedelje**
- **Broj uzastopnih dana učenja — streak**
- **Ukupan broj sesija**
- **Prosečno trajanje sesije**

Na ovaj način korisnik dobija brz pregled svog napretka bez potrebe za ručnim računanjem.

---

### 2.3. Heatmap aktivnosti

Aplikacija prikazuje aktivnost učenja kroz **heatmap**, odnosno mrežu kvadratića gde svaki kvadratić predstavlja jedan dan.

Intenzitet boje zavisi od količine vremena provedenog u učenju tog dana.

Ovaj prikaz omogućava korisniku da lako uoči:

- kontinuitet učenja
- dane sa najviše aktivnosti
- periode sa manjom aktivnošću

---

### 2.4. Trend aktivnosti

Linijski grafikon prikazuje **ukupno vreme učenja po danima u poslednjih 14 dana**.

Na ovaj način korisnik može da prati kratkoročnu dinamiku učenja i vidi da li njegova aktivnost:

- raste
- opada
- ostaje stabilna

---

### 2.5. Raspodela vremena po tehnologijama

Aplikacija prikazuje koliko je vremena korisnik uložio u svaku tehnologiju.

Podaci su predstavljeni pomoću horizontalnih traka sa procentualnim vrednostima i sortirani su od tehnologije u koju je uloženo najviše vremena.

---

### 2.6. Pregled i upravljanje sesijama

Sve sesije učenja prikazane su u hronološkom redosledu.

Korisnik može da:

- pregleda prethodne sesije
- vidi tehnologiju, temu, trajanje i datum
- obriše pojedinačnu sesiju

---

### 2.7. Trajno čuvanje podataka

Podaci se čuvaju u browseru pomoću **`localStorage` API-ja**.

Zahvaljujući tome, podaci ostaju dostupni i nakon:

- zatvaranja browsera
- ponovnog pokretanja aplikacije

Aplikacija ne koristi server ni bazu podataka.

---

### 2.8. Demonstracioni podaci

Prilikom prvog pokretanja, ukoliko ne postoje prethodno sačuvani podaci, aplikacija automatski generiše približno **30 demonstracionih sesija**.

Na ovaj način korisnik odmah može da vidi kako funkcionalnosti aplikacije izgledaju sa stvarnim podacima.

Demonstracioni podaci mogu se ukloniti i zameniti sopstvenim sesijama.

---

# 3. Korišćene tehnologije

### React 18

Biblioteka za izradu korisničkog interfejsa i upravljanje komponentama.

### TypeScript

Programski jezik zasnovan na JavaScript-u koji uvodi statičko tipiziranje i omogućava otkrivanje određenih grešaka pre pokretanja aplikacije.

### Vite

Alat za razvoj React aplikacije, lokalni development server i kreiranje produkcione verzije aplikacije.

### Recharts

Biblioteka korišćena za kreiranje linijskog grafikona za prikaz trenda učenja.

### Lucide React

Biblioteka gotovih SVG ikonica korišćenih u korisničkom interfejsu.

### localStorage

Browser API koji omogućava lokalno čuvanje podataka bez potrebe za serverom i bazom podataka.

---

# 4. Obrazloženje tehničkih odluka

## Zašto `localStorage`, a ne backend?

COMMIT.LOG je namenjen **pojedinačnom korisniku na jednom uređaju**.

Zbog toga nije bilo potrebe za:

- korisničkim nalozima
- autentifikacijom
- serverom
- bazom podataka
- sinhronizacijom između uređaja

`localStorage` je u ovom slučaju jednostavno i dovoljno rešenje.

Ukoliko bi aplikacija u budućnosti podržavala više korisnika i sinhronizaciju između uređaja, podaci bi mogli da se prebace na backend i bazu podataka.

---

## Zašto nije korišćen Redux?

Aplikacija ima relativno jednostavno stanje.

Glavni izvor podataka je:

**lista sesija učenja**

Ostali podaci, poput ukupnog vremena, streak-a, heatmap-a i statistike po tehnologijama, predstavljaju podatke koji se izračunavaju na osnovu te liste.

Zbog toga su React-ovi `useState`, `useEffect` i `useMemo` dovoljni i nema potrebe za dodatnom state-management bibliotekom poput Redux-a.

---

## Zašto je aplikacija organizovana u jednom glavnom fajlu?

Projekat je manjeg obima, zbog čega je `App.tsx` organizovan po logičkim celinama.

Kod veće aplikacije bilo bi bolje razdvojiti:

- komponente
- tipove
- pomoćne funkcije
- podatke
- logiku
- stilove

u zasebne fajlove i foldere.

---

# 5. Struktura `App.tsx`

Glavni fajl aplikacije je `src/App.tsx`.

Logika je organizovana odozgo nadole.

### 5.1. Design tokens

Na početku fajla definisane su boje koje se koriste kroz aplikaciju.

Prednost ovog pristupa je što se boje nalaze na jednom mestu i mogu lako da se promene bez traženja kroz ceo kod.

---

### 5.2. `TECH_PRESETS`

`TECH_PRESETS` je niz unapred definisanih front-end tehnologija.

Sadrži, između ostalog:

- JavaScript
- TypeScript
- HTML
- CSS
- Sass/Less
- Bootstrap
- React
- Redux
- Tailwind CSS
- Next.js
- Vue.js
- Ostalo

Svaka tehnologija ima definisanu boju koja se koristi u vizuelnom prikazu aplikacije.

---

### 5.3. TypeScript tipovi

Definisan je `Session` interface koji određuje strukturu jedne sesije učenja.

On definiše:

- koja polja sesija ima
- kog su tipa podaci
- kakav oblik objekat mora da ima

Na taj način TypeScript može da upozori na greške prilikom rada sa podacima.

---

### 5.4. Pomoćne funkcije

U aplikaciji se nalaze manje funkcije koje obavljaju ponavljajuće zadatke.

Na primer:

- `fmtDuration()` — formatira trajanje, npr. `90` minuta pretvara u `1h 30m`
- `fmtDate()` — formatira datum
- `techColor()` — vraća boju određene tehnologije
- `startOfWeek()` — određuje početak nedelje
- `isoDaysAgo()` — određuje datum određenog broja dana unazad

Izdvajanjem ovih funkcija iz glavne logike izbegava se nepotrebno ponavljanje koda.

---

# 6. Komponente

### `StatCard`

Predstavlja jednu statističku karticu.

Umesto da se isti JSX kod ponavlja pet puta, komponenta se koristi kao reusable komponenta sa različitim podacima.

---

### `Heatmap`

Zasebna komponenta za prikaz aktivnosti kroz dane.

Sadrži složeniju logiku za generisanje mreže i određivanje intenziteta aktivnosti.

---

### `Panel`

Predstavlja zajednički vizuelni kontejner za različite sekcije aplikacije.

---

### `Field`

Komponenta koja predstavlja polje forme i omogućava konzistentan izgled input elemenata.

---

# 7. Demonstracioni podaci

Funkcija `buildSeedSessions()` generiše približno 30 izmišljenih sesija.

Ona se koristi samo kada aplikacija nema prethodno sačuvane podatke.

Na taj način aplikacija odmah nakon prvog pokretanja ima sadržaj koji omogućava demonstraciju svih glavnih funkcionalnosti.

---

# 8. Glavna komponenta `App`

`App` komponenta povezuje sve delove aplikacije.

## `useState`

`useState` predstavlja lokalno stanje aplikacije.

Koristi se, između ostalog, za:

- listu sesija
- stanje forme
- vrednosti unete u formu
- kontrolu prikaza određenih elemenata

---

## `useEffect`

U aplikaciji postoje efekti koji se automatski izvršavaju kada se ispune određeni uslovi.

Prvi efekat:

**učitava podatke iz `localStorage` prilikom pokretanja aplikacije.**

Drugi efekat:

**čuva listu sesija u `localStorage` svaki put kada se lista promeni.**

---

## `useMemo`

`useMemo` se koristi za izračunavanje izvedenih podataka na osnovu liste sesija.

Na primer:

- ukupno vreme
- vreme ove nedelje
- streak
- podaci za heatmap
- podaci za grafikon
- raspodela vremena po tehnologijama

Na ovaj način se izračunavanja mogu ponovo koristiti bez nepotrebnog ponavljanja kada se osnovni podaci nisu promenili.

---

# 9. Funkcije za akcije

### `submitSession()`

Obrađuje slanje forme i kreiranje nove sesije.

Pre dodavanja proverava validnost podataka.

---

### `deleteSession()`

Briše određenu sesiju iz liste.

---

### `clearDemo()`

Koristi se za uklanjanje demonstracionih podataka kako bi korisnik mogao da počne sa sopstvenim podacima.

---

# 10. Prikaz korisničkog interfejsa

Na kraju `App` komponente nalazi se `return (...)`, odnosno JSX koji opisuje strukturu korisničkog interfejsa.

Tu se povezuju:

- statističke kartice
- forma
- heatmap
- grafikon
- raspodela po tehnologijama
- lista sesija
- akcije za upravljanje podacima

---

# 11. Konfiguracioni fajlovi

### `package.json`

Sadrži:

- informacije o projektu
- instalirane pakete
- dostupne npm skripte

Na primer:

```
npm run dev
npm run build
```

### `package-lock.json`

Automatski generisan fajl koji zaključava konkretne verzije instaliranih paketa i njihovih zavisnosti.

### `vite.config.ts`

Konfiguracioni fajl za Vite, uključujući React podršku.

### `tsconfig.json`

Glavna TypeScript konfiguracija projekta.

### `tsconfig.node.json`

TypeScript konfiguracija koja se koristi za Node/Vite konfiguracione fajlove.

### `index.html`

Osnovni HTML dokument koji browser prvo učitava.

Sadrži root element u koji React ubacuje aplikaciju.

### `README.md`

Sadrži osnovne informacije o projektu, instalaciji i pokretanju aplikacije.

---

# 12. Ulazna tačka aplikacije

### `src/main.tsx`

`main.tsx` predstavlja ulaznu tačku React aplikacije.

Njegova glavna uloga je da poveže React aplikaciju sa `index.html` dokumentom i renderuje glavnu `App` komponentu unutar root elementa.

---

# 13. Ograničenja

Trenutna verzija aplikacije ima nekoliko ograničenja:

- podaci se čuvaju samo lokalno
- podaci se ne sinhronizuju između uređaja
- nema korisničkih naloga
- nema autentifikacije
- nema backend-a
- nema baze podataka
- nema izvoza podataka u PDF ili Excel

---

# 14. Mogući dalji razvoj

U budućnosti aplikacija bi mogla da dobije:

### Backend i bazu podataka

Omogućavanje čuvanja podataka na serveru.

### Korisničke naloge

Registracija, prijava i odvojeni podaci za svakog korisnika.

### Sinhronizaciju

Pristup podacima sa različitih uređaja.

### Izvoz podataka

Izvoz istorije učenja u:

- PDF
- Excel
- CSV

### Ciljeve učenja

Korisnik bi mogao da postavi cilj, na primer:

**20 sati JavaScript-a mesečno**

i prati ostvarenje cilja kroz aplikaciju.

---

# 15. Pokretanje projekta

Instalacija zavisnosti:

```
npm install
```

Pokretanje development servera:

```
npm run dev
```

Kreiranje produkcione verzije:

```
npm run build
```
