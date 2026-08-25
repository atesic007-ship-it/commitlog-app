COMMIT.LOG

commit.log je lični dnevnik za praćenje vremena koje uložiš u učenje front-end tehnologija (JavaScript, React, TypeScript, CSS...) — sve tehnologije vezane isključivo za front-end.

Problem koji aplikacija rešava jeste nedostatak preglednog načina da osoba koja uči programiranje prati sopstveni napredak — koliko vremena je uložila, u koje tehnologije, i kojom dinamikom.

Funkcionalnosti

1. Unos sesije učenja Korisnik dodaje novi zapis o učenju kroz formu koja sadrži: tehnologiju (izbor iz unapred definisane liste ili ručni unos), temu koja je učena, trajanje u minutima i datum. Uneti podaci se validiraju pre snimanja (tema ne sme biti prazna, trajanje mora biti veće od nule).

2. Pregled ukupnih statistika Aplikacija na vrhu prikazuje pet brojeva koji se automatski računaju iz unetih sesija: ukupno vreme učenja, vreme ove nedelje, broj uzastopnih dana učenja (niz), ukupan broj sesija i prosečno trajanje po sesiji. Svaki broj daje brz uvid u jedan aspekt napretka, bez potrebe da korisnik sam nešto sabira ili računa.

3. Prikaz aktivnosti kroz vreme (heatmap) Vizuelni prikaz u obliku mreže, gde svaki kvadratić predstavlja jedan dan, a intenzitet boje odgovara količini vremena provedenog u učenju tog dana. Omogućava uvid u kontinuitet učenja kroz duži vremenski period.

4. Prikaz trenda aktivnosti Linijski grafikon koji prikazuje ukupno vreme učenja po danima u poslednjih 14 dana, omogućavajući uvid u kratkoročnu dinamiku učenja (rast ili pad aktivnosti).

5. Raspodela vremena po tehnologijama Prikaz udela svake pojedinačne tehnologije u ukupnom vremenu učenja, u obliku horizontalnih traka sa procentualnim vrednostima, sortiranih od tehnologije sa najviše uloženog vremena.

6. Pregled i upravljanje unetim sesijama Lista svih unetih sesija, hronološki sortirana, sa mogućnošću brisanja pojedinačnog zapisa.

7. Trajno čuvanje podataka Svi uneti podaci se automatski čuvaju lokalno u pregledaču korisnika (localStorage), tako da ostaju dostupni i nakon zatvaranja i ponovnog pokretanja aplikacije.

8. Demonstracioni podaci Prilikom prvog pokretanja, ukoliko ne postoje prethodno sačuvani podaci, aplikacija automatski generiše primer skupa podataka radi prikaza funkcionalnosti, koji korisnik može ukloniti unosom sopstvenih podataka.

Korišćene tehnologije

React 18 — biblioteka za izradu korisničkog interfejsa
TypeScript — programski jezik, proširenje JavaScript-a koje dodaje tipove i hvata greške u kodu pre pokretanja
Vite — alat za pokretanje aplikacije u razvoju i pravljenje finalne verzije
recharts — biblioteka za crtanje grafikona (trend linija)
lucide-react — biblioteka gotovih ikonica
localStorage — čuvanje podataka lokalno u pregledaču, bez servera i baze podataka

Zašto ovakvi izbori
Bez servera/baze — aplikacija je namenjena pojedinačnom korisniku na jednom uređaju, pa je localStorage dovoljno i jednostavnije rešenje od punog backend-a.
Bez state-management biblioteke (Redux i sl.) — postoji samo jedan izvor podataka (lista sesija), pa su React-ovi ugrađeni useState/useMemo dovoljni.
Sve u jednom fajlu — projekat je manjeg obima, pa je jedan fajl podeljen na logičke celine (podaci, pomoćne funkcije, komponente, glavna logika) dovoljno pregledan; kod veće aplikacije bi se ovo razdvojilo u više fajlova/foldera.

Struktura projekta
commitlog-app/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
└── src/
    ├── main.tsx
    └── App.tsx        ← sva logika i dizajn

Konfiguracioni fajlovi
package.json — spisak svih paketa koje aplikacija koristi i komande za pokretanje (npm run dev, npm run build)
package-lock.json — automatski generisan fajl koji zaključava tačne verzije instaliranih paketa
vite.config.ts — podešavanje Vite alata, uključuje React podršku
tsconfig.json / tsconfig.node.json — podešavanja TypeScript provere tipova
index.html — osnovni HTML koji browser prvo učita; sadrži samo prazan <div id="root">, sve ostalo ubacuje React
README.md — kratko uputstvo za instalaciju i pokretanje

src/main.tsx — ulazna tačka

Poveže React aplikaciju sa index.html-om — kaže "ubaci komponentu App u onaj prazan <div id="root">". Ovo se ne menja praktično nikad, standardna forma za svaki React projekat.

src/App.tsx — glavni fajl, sva logika je ovde

Podeljen je na logičke celine, odozgo nadole:

Tokeni dizajna (boje, na vrhu fajla) — sve boje koje se koriste kroz aplikaciju definisane su na jednom mestu, da se ne ponavljaju posvuda i da se lako menjaju.
Lista tehnologija (TECH_PRESETS) — niz od 11 tehnologija (JavaScript, TypeScript, HTML, CSS, Sass/Less, Bootstrap, React, Redux, Tailwind CSS, Next.js, Vue.js) plus "Ostalo" — svaka sa svojom bojom.
TypeScript tipovi (interface Session) — definiše tačan oblik jedne sesije (koja polja ima, kog su tipa); TypeScript upozorava ako se negde u kodu pokuša napraviti sesija sa pogrešnim oblikom podataka.
Pomoćne funkcije (fmtDuration, fmtDate, techColor, startOfWeek, isoDaysAgo) — male funkcije za ponavljajuće zadatke, npr. fmtDuration(90) vraća tekst "1h 30m". Odvojene su da se ista logika ne piše na više mesta.
Manje UI komponente (StatCard, Heatmap, Panel, Field) — delovi interfejsa koji se ponavljaju izdvojeni su kao posebne funkcije, npr. StatCard je "kalup" za jednu statističku karticu, pa se poziva 5 puta sa različitim podacima umesto da se isti kod kopira. Heatmap je zaseban jer ima najsloženiju logiku (crtanje mreže kvadratića).
Primer podaci (buildSeedSessions) — funkcija koja generiše ~30 izmišljenih sesija za prikaz pri prvom pokretanju.
Glavna komponenta App — ovde se sve spaja:
useState linije — "memorija" aplikacije dok radi (lista sesija, da li je forma otvorena, šta je upisano u poljima forme...)
useEffect blokovi — kod koji se pokreće automatski: jedan učitava podatke iz localStorage kad se aplikacija prvi put otvori, drugi upisuje podatke u localStorage svaki put kad se lista sesija promeni
useMemo blokovi — izračunavanja koja se automatski osvežavaju kad se sesije promene (ukupno vreme, streak, podaci za heatmap, trend, raspodelu po tehnologiji...)
Funkcije za akcije (submitSession, deleteSession, clearDemo) — šta se dešava kad korisnik nešto klikne
Na kraju: return (...) — sam HTML/JSX koji opisuje kako sve to izgleda na ekranu (kartice, grafikon, forma, lista sesija)

Ograničenja
Podaci se čuvaju samo lokalno, u jednom pregledaču — ne sinhronizuju se između uređaja
Nema korisničkih naloga ni prijave
Nema izvoza podataka (npr. u PDF ili Excel)

Mogući dalji razvoj
Sinhronizacija podataka preko servera/baze
Izvoz istorije učenja u fajl
Poređenje ostvarenog vremena sa postavljenim ciljevima

Pokretanje
npm install
npm run dev