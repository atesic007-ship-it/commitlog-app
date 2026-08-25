# commit.log

Aplikacija za praćenje vremena učenja programiranja po tehnologijama, temama i ciljevima.

## Pokretanje

```bash
npm install
npm run dev
```

Otvori adresu koju Vite ispiše u terminalu (obično `http://localhost:5173`).

## Build za produkciju

```bash
npm run build
npm run preview
```

## Napomene

- Podaci se čuvaju lokalno u browseru (`localStorage`), pod ključem `commitlog-data-v1`.
- Pri prvom pokretanju aplikacija učitava primer podataka da odmah vidiš kako dashboard izgleda — čim dodaš svoju prvu sesiju ili klikneš "Obriši primer i počni iznova", primer nestaje.
