# 🥩 Protein Hunter

Programmatic SEO website pro porovnání proteinových potravin podle ceny a nutriční hodnoty.

## 📊 Statistiky

- **238 SEO optimalizovaných stránek**
- **123 produktů** s kompletními nutričními údaji
- **64 receptů** s vysokým obsahem proteinu
- **16 slovníkových hesel**
- **10 porovnání** produktů
- **17 kategorií** potravin
- **4 blog články**

## 🎯 Hlavní funkce

### 🏆 Lean Protein Ranking
- Seřazení produktů podle **protein/kcal ratio**
- Kategorizace: Excellent, High, Good, Medium, Low
- Ideální pro cutting a hubnutí
- Filtry podle kvality proteinu

### 📈 Nutriční analýza
- Kompletní makro profil (protein, tuky, sacharidy)
- Vizuální grafy a bary
- Kalorie na 100g
- Protein/kcal ratio pro každý produkt

### 💰 Cenové porovnání
- Cena za gram proteinu
- Ranking nejlevnějších zdrojů
- Srovnání podobných produktů
- Kategorizace podle typu

## 🛠️ Technologie

- **Statické HTML stránky** (ultra rychlé načítání)
- **Tailwind CSS** (moderní design)
- **Schema.org markup** (SEO optimalizace)
- **Programmatic SEO** (automatické generování obsahu)
- **Node.js** generátor stránek

## 🚀 Jak spustit

### Generování stránek

```bash
node generate-pages.js
```

Vygeneruje všechny stránky do složek:
- `produkty/` - 123 produktových stránek
- `lean-proteins/` - Lean protein ranking
- `recepty/` - 64 receptů
- `slovnik/` - 16 slovníkových hesel
- `blog/` - 4 články
- `porovnani/` - 10 porovnání
- `kategorie/` - 17 kategorií

### Deploy

Web je připraven pro statický hosting (GitHub Pages, Netlify, Vercel, atd.)

```bash
# Nastavit nginx
location /protein-hunter {
    alias /path/to/protein-hunter-web;
    index index.html;
    try_files $uri $uri/ /protein-hunter/index.html;
}
```

## 📁 Struktura projektu

```
protein-hunter-web/
├── generate-pages.js      # Hlavní generátor stránek
├── index.html            # Úvodní stránka
├── kalkulacka.html       # Protein kalkulačka
├── produkty/             # 123 produktových stránek
├── lean-proteins/        # Lean protein ranking
├── recepty/              # 64 receptů
├── slovnik/              # Slovník pojmů
├── blog/                 # Blog články
├── porovnani/            # Porovnání produktů
└── kategorie/            # Kategorie potravin
```

## 🎨 Design

- **Jednotné menu a footer** na všech stránkách
- **Responzivní design** (mobile-first)
- **Barevné kategorie** pro snadnou orientaci
- **Vizuální makro grafy**
- **SEO optimalizované** (meta tagy, Schema.org)

## 📝 Editace obsahu

### Přidání nového produktu

1. Otevři `generate-pages.js`
2. Přidej produkt do `productsDatabase` pole:

```javascript
{
    id: 124,
    name: "Název produktu",
    price: 99.90,
    weight: 500,
    proteinPer100g: 20.0,
    caloriesPer100g: 150,
    fatPer100g: 5.0,
    carbsPer100g: 10.0,
    category: "meat",
    slug: "nazev-produktu",
    description: "Popis produktu"
}
```

3. Spusť `node generate-pages.js`

### Přidání nového receptu

1. Přidej recept do `recipesData` pole
2. Regeneruj stránky

## 🔧 Konfigurace

### Sdílené komponenty

Menu a footer jsou definované jako funkce v `generate-pages.js`:

- `getNavigation()` - Hlavní menu
- `getFooter()` - Footer
- `getHtmlHead()` - HTML head

Změna v těchto funkcích se projeví na všech stránkách.

## 📈 SEO Features

- ✅ Unique title a description pro každou stránku
- ✅ Schema.org markup (Product, Recipe, Article)
- ✅ Open Graph tagy
- ✅ Semantic HTML
- ✅ Internal linking
- ✅ Breadcrumbs
- ✅ Optimalizované URL slugy

## 🌐 Live verze

Web běží na: `http://46.62.166.240/protein-hunter/`

## 📊 Metriky

- **Protein/kcal ratio**: Klíčová metrika pro lean proteiny
- **Cena/g proteinu**: Nejlevnější zdroje
- **Makro profil**: Protein %, Tuky %, Sacharidy %
- **Protein density**: 5 kategorií kvality

## 🤝 Příspěvky

Chceš přidat další produkty nebo recepty? Pull requesty jsou vítány!

## 📄 Licence

MIT License

---

**🥩 Protein Hunter** - Najdi nejlepší proteiny pro tvé fitness cíle!
