#!/usr/bin/env node

// Script to generate static SEO pages for programmatic SEO
const fs = require('fs');
const path = require('path');

// Shared navigation component
function getNavigation() {
    return `
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/protein-hunter/" class="text-xl font-bold text-primary">🥩 Protein Hunter</a>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/protein-hunter/produkty/" class="text-gray-700 hover:text-primary">Produkty</a>
                    <a href="/protein-hunter/lean-proteins/" class="text-gray-700 hover:text-primary">Lean Proteiny</a>
                    <a href="/protein-hunter/recepty/" class="text-gray-700 hover:text-primary">Recepty</a>
                    <a href="/protein-hunter/slovnik/" class="text-gray-700 hover:text-primary">Slovník</a>
                    <a href="/protein-hunter/porovnani/" class="text-gray-700 hover:text-primary">Porovnání</a>
                    <a href="/protein-hunter/blog/" class="text-gray-700 hover:text-primary">Blog</a>
                    <a href="/protein-hunter/kalkulacka.html" class="text-gray-700 hover:text-primary">Kalkulačka</a>
                </div>
            </div>
        </div>
    </nav>`;
}

// Shared footer component
function getFooter() {
    return `
    <footer class="bg-gray-800 text-white mt-16 py-8">
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid md:grid-cols-4 gap-8 mb-6">
                <div>
                    <h3 class="font-bold text-lg mb-3">🥩 Protein Hunter</h3>
                    <p class="text-gray-400 text-sm">Databáze proteinových potravin a receptů pro fitness nadšence.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-3">Produkty</h4>
                    <ul class="space-y-2 text-sm">
                        <li><a href="/protein-hunter/produkty/" class="text-gray-400 hover:text-white">Všechny produkty</a></li>
                        <li><a href="/protein-hunter/lean-proteins/" class="text-gray-400 hover:text-white">Lean Proteiny</a></li>
                        <li><a href="/protein-hunter/kategorie/meat.html" class="text-gray-400 hover:text-white">Maso</a></li>
                        <li><a href="/protein-hunter/kategorie/fish.html" class="text-gray-400 hover:text-white">Ryby</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-3">Obsah</h4>
                    <ul class="space-y-2 text-sm">
                        <li><a href="/protein-hunter/recepty/" class="text-gray-400 hover:text-white">Recepty</a></li>
                        <li><a href="/protein-hunter/slovnik/" class="text-gray-400 hover:text-white">Slovník</a></li>
                        <li><a href="/protein-hunter/porovnani/" class="text-gray-400 hover:text-white">Porovnání</a></li>
                        <li><a href="/protein-hunter/blog/" class="text-gray-400 hover:text-white">Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-3">Nástroje</h4>
                    <ul class="space-y-2 text-sm">
                        <li><a href="/protein-hunter/kalkulacka.html" class="text-gray-400 hover:text-white">Kalkulačka proteinu</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
                <p>&copy; 2025 Protein Hunter. Všechna práva vyhrazena.</p>
            </div>
        </div>
    </footer>`;
}

// Shared HTML head (returns only DOCTYPE and opening tags, NO closing </head> or <body>)
function getHtmlHeadStart(title, description) {
    return `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#dc2626'
                    }
                }
            }
        }
    </script>`;
}

// Simplified HTML head for pages without extra meta tags
function getHtmlHead(title, description) {
    return getHtmlHeadStart(title, description) + `
</head>
<body class="bg-gray-50">`;
}

// Products database with full nutrition
const productsDatabase = [
    // ✅ Mléčné výrobky - Lean proteins
    { id: 1, name: "Tvaroh polotučný Pilos", price: 36.90, weight: 250, proteinPer100g: 12.5, caloriesPer100g: 125, fatPer100g: 4.5, carbsPer100g: 3.5, category: "dairy", slug: "tvaroh-polotucny-pilos", description: "Polotučný tvaroh s 12.5g proteinu na 100g" },
    { id: 3, name: "Řecký jogurt 0% Milko", price: 24.90, weight: 140, proteinPer100g: 10.0, caloriesPer100g: 59, fatPer100g: 0.2, carbsPer100g: 4.0, category: "dairy", slug: "recky-jogurt-0-milko", description: "Řecký jogurt bez tuku s 10g proteinu" },
    { id: 4, name: "Cottage cheese Pribináček", price: 29.90, weight: 200, proteinPer100g: 11.0, caloriesPer100g: 81, fatPer100g: 1.5, carbsPer100g: 3.3, category: "dairy", slug: "cottage-cheese-pribinacek", description: "Cottage cheese s 11g proteinu na 100g" },
    { id: 21, name: "Proteinový jogurt Danone", price: 34.90, weight: 160, proteinPer100g: 15.0, caloriesPer100g: 103, fatPer100g: 0.1, carbsPer100g: 10.4, category: "dairy", slug: "proteinovy-jogurt-danone", description: "Vysokoproteinový jogurt s 15g proteinu" },
    { id: 24, name: "Čerstvý tvaroh 0%", price: 19.90, weight: 250, proteinPer100g: 11.0, caloriesPer100g: 72, fatPer100g: 0.3, carbsPer100g: 4.0, category: "dairy", slug: "cerstva-tvaroh-0", description: "Odtučněný tvaroh 0% tuku" },
    { id: 22, name: "Mozzarella di bufala", price: 89.90, weight: 125, proteinPer100g: 18.1, caloriesPer100g: 280, fatPer100g: 22.0, carbsPer100g: 3.1, category: "dairy", slug: "mozzarella-di-bufala", description: "Italská mozzarella z buvolího mléka" },
    { id: 23, name: "Feta sýr", price: 69.90, weight: 200, proteinPer100g: 14.2, caloriesPer100g: 264, fatPer100g: 21.3, carbsPer100g: 4.1, category: "dairy", slug: "feta-syr", description: "Řecký feta sýr ve slaném nálevu" },

    // 🥩 Maso - Lean proteins ⭐
    { id: 2, name: "Kuřecí prsa", price: 159.90, weight: 500, proteinPer100g: 23.0, caloriesPer100g: 165, fatPer100g: 3.6, carbsPer100g: 0, category: "meat", slug: "kureci-prsa", description: "Čerstvá kuřecí prsa s vysokým obsahem proteinu" },
    { id: 10, name: "Krůtí prsa", price: 189.90, weight: 500, proteinPer100g: 24.6, caloriesPer100g: 135, fatPer100g: 1.7, carbsPer100g: 0, category: "meat", slug: "kruti-prsa", description: "Čerstvá krůtí prsa s nízkým obsahem tuku" },
    { id: 11, name: "Hovězí mleté 5%", price: 149.90, weight: 400, proteinPer100g: 21.8, caloriesPer100g: 137, fatPer100g: 5.0, carbsPer100g: 0, category: "meat", slug: "hovezi-mlete-5", description: "Hovězí mleté maso s 5% tuku" },
    { id: 12, name: "Vepřová panenka", price: 299.90, weight: 600, proteinPer100g: 22.2, caloriesPer100g: 143, fatPer100g: 5.6, carbsPer100g: 0, category: "meat", slug: "veprova-panenka", description: "Nejšťavnatější část vepřového masa" },
    { id: 54, name: "Králičí maso", price: 349.90, weight: 800, proteinPer100g: 21.8, caloriesPer100g: 136, fatPer100g: 5.0, carbsPer100g: 0, category: "meat", slug: "kralici-maso", description: "Dietní králičí maso s nízkým tukem" },
    { id: 55, name: "Zvěřina - srnčí", price: 599.90, weight: 500, proteinPer100g: 22.5, caloriesPer100g: 120, fatPer100g: 2.4, carbsPer100g: 0, category: "meat", slug: "zverina-srnci", description: "Divoké srnčí maso bez antibiotik" },
    { id: 56, name: "Kančí klobása", price: 179.90, weight: 300, proteinPer100g: 16.8, caloriesPer100g: 301, fatPer100g: 25.0, carbsPer100g: 1.2, category: "meat", slug: "kanci-klobasa", description: "Tradiční kančí klobása bez konzervantů" },

    // 🐟 Ryby - Lean kings ⭐⭐
    { id: 8, name: "Treska filé mražená", price: 189.90, weight: 400, proteinPer100g: 18.2, caloriesPer100g: 82, fatPer100g: 0.7, carbsPer100g: 0, category: "fish", slug: "treska-file-mrazena", description: "Mražené treščí filé bez kostí" },
    { id: 9, name: "Krevety tygří", price: 249.90, weight: 300, proteinPer100g: 24.0, caloriesPer100g: 106, fatPer100g: 1.7, carbsPer100g: 0.9, category: "fish", slug: "krevety-tygri", description: "Mražené tygří krevety bez hlavy" },
    { id: 7, name: "Tuňák v oleji", price: 45.90, weight: 160, proteinPer100g: 29.1, caloriesPer100g: 198, fatPer100g: 8.2, carbsPer100g: 0, category: "fish", slug: "tunak-v-oleji", description: "Konzervovaný tuňák - výborný zdroj proteinu" },
    { id: 6, name: "Losos norský filet", price: 299.90, weight: 500, proteinPer100g: 25.4, caloriesPer100g: 206, fatPer100g: 13.4, carbsPer100g: 0, category: "fish", slug: "losos-norsky-filet", description: "Čerstvý lososový filet s omega-3 a vysokým proteinem" },
    { id: 51, name: "Sardiny v olivovém oleji", price: 89.90, weight: 120, proteinPer100g: 24.6, caloriesPer100g: 208, fatPer100g: 11.5, carbsPer100g: 0, category: "fish", slug: "sardiny-v-olivovem-oleji", description: "Portugalské sardiny v olivovém oleji" },
    { id: 52, name: "Makrela uzená", price: 129.90, weight: 300, proteinPer100g: 23.8, caloriesPer100g: 262, fatPer100g: 18.0, carbsPer100g: 0, category: "fish", slug: "makrela-uzena", description: "Tradičně uzená makrela" },
    { id: 53, name: "Krab aljašský", price: 299.90, weight: 200, proteinPer100g: 19.4, caloriesPer100g: 97, fatPer100g: 1.5, carbsPer100g: 0, category: "fish", slug: "krab-aljasky", description: "Mražené krabí maso z Aljašky" },

    // 🌱 Rostlinné proteiny
    { id: 13, name: "Tofu Lunter", price: 39.90, weight: 200, proteinPer100g: 15.7, caloriesPer100g: 144, fatPer100g: 8.7, carbsPer100g: 1.9, category: "plant", slug: "tofu-lunter", description: "Klasické tofu z českých sójových bobů" },
    { id: 14, name: "Tempeh", price: 89.90, weight: 200, proteinPer100g: 20.3, caloriesPer100g: 193, fatPer100g: 10.8, carbsPer100g: 7.6, category: "plant", slug: "tempeh", description: "Fermentované sójové boby - probiotika a protein" },
    { id: 15, name: "Seitan", price: 79.90, weight: 200, proteinPer100g: 25.0, caloriesPer100g: 370, fatPer100g: 1.9, carbsPer100g: 14.0, category: "plant", slug: "seitan", description: "Pšeničný protein - masová náhrada" },
    { id: 57, name: "Edamame mražené", price: 79.90, weight: 400, proteinPer100g: 11.9, caloriesPer100g: 122, fatPer100g: 5.2, carbsPer100g: 8.9, category: "vegan", slug: "edamame-mrazene", description: "Mladé sójové lusky - kompletní protein" },
    { id: 62, name: "TVP granulát", price: 39.90, weight: 200, proteinPer100g: 52.0, caloriesPer100g: 315, fatPer100g: 0.8, carbsPer100g: 30.0, category: "vegan", slug: "tvp-granulat", description: "Texturovaný rostlinný protein" },
    { id: 63, name: "Rostlinný burger Beyond", price: 89.90, weight: 226, proteinPer100g: 17.7, caloriesPer100g: 250, fatPer100g: 18.0, carbsPer100g: 3.0, category: "vegan", slug: "rostlinny-burger-beyond", description: "Veganský burger připomínající maso" },

    // 🌾 Luštěniny - Budget kings
    { id: 5, name: "Červená čočka", price: 39.90, weight: 500, proteinPer100g: 25.0, caloriesPer100g: 352, fatPer100g: 1.1, carbsPer100g: 60.0, category: "legumes", slug: "cervena-cocka", description: "Červená čočka suchá s 25g proteinu" },
    { id: 16, name: "Černé fazole", price: 29.90, weight: 400, proteinPer100g: 21.6, caloriesPer100g: 341, fatPer100g: 1.4, carbsPer100g: 62.0, category: "legumes", slug: "cerne-fazole", description: "Konzervované černé fazole" },
    { id: 58, name: "Hummus klasický", price: 39.90, weight: 200, proteinPer100g: 7.9, caloriesPer100g: 166, fatPer100g: 9.6, carbsPer100g: 14.3, category: "vegan", slug: "hummus-klasicky", description: "Krémová cizrnová pomazánka s tahini" },
    { id: 59, name: "Falafel mix", price: 49.90, weight: 200, proteinPer100g: 13.3, caloriesPer100g: 333, fatPer100g: 17.8, carbsPer100g: 31.8, category: "vegan", slug: "falafel-mix", description: "Směs na přípravu cizrnových kuliček" },

    // 🥜 Ořechy - High fat but tasty
    { id: 17, name: "Mandle blanšírované", price: 199.90, weight: 500, proteinPer100g: 21.2, caloriesPer100g: 579, fatPer100g: 49.9, carbsPer100g: 21.6, category: "nuts", slug: "mandle-blanstirovane", description: "Loupaná mandle bez slupky" },
    { id: 18, name: "Vlašské ořechy", price: 169.90, weight: 500, proteinPer100g: 15.2, caloriesPer100g: 654, fatPer100g: 65.2, carbsPer100g: 13.7, category: "nuts", slug: "vlasske-orechy", description: "Kvalitní vlašské ořechy - zdroj omega-3" },
    { id: 19, name: "Chia semínka", price: 149.90, weight: 250, proteinPer100g: 16.5, caloriesPer100g: 486, fatPer100g: 30.7, carbsPer100g: 42.1, category: "nuts", slug: "chia-seminko", description: "Superfood chia semínka s proteinem a vlákninou" },
    { id: 20, name: "Arašídové máslo", price: 89.90, weight: 340, proteinPer100g: 25.8, caloriesPer100g: 588, fatPer100g: 50.0, carbsPer100g: 20.0, category: "nuts", slug: "arasidove-maslo", description: "100% arašídové máslo bez přidaného cukru" },
    { id: 46, name: "Konopná semínka", price: 179.90, weight: 250, proteinPer100g: 31.6, caloriesPer100g: 553, fatPer100g: 48.8, carbsPer100g: 8.7, category: "nuts", slug: "konopna-seminko", description: "Konopná semínka s kompletním profilem aminokyselin" },
    { id: 47, name: "Lněná semínka", price: 69.90, weight: 500, proteinPer100g: 18.3, caloriesPer100g: 534, fatPer100g: 42.2, carbsPer100g: 28.9, category: "nuts", slug: "lnena-seminko", description: "Lněná semínka bohatá na omega-3" },
    { id: 48, name: "Slunečnicová semínka", price: 89.90, weight: 500, proteinPer100g: 20.8, caloriesPer100g: 584, fatPer100g: 51.5, carbsPer100g: 20.0, category: "nuts", slug: "slunecnicova-seminko", description: "Pražená slunečnicová semínka" },
    { id: 49, name: "Dýňová semínka", price: 199.90, weight: 500, proteinPer100g: 30.2, caloriesPer100g: 559, fatPer100g: 49.1, carbsPer100g: 10.7, category: "nuts", slug: "dynova-seminko", description: "Dýňová semínka s vysokým obsahem zinku a proteinu" },
    { id: 60, name: "Tahini pasta", price: 89.90, weight: 340, proteinPer100g: 17.0, caloriesPer100g: 595, fatPer100g: 53.8, carbsPer100g: 21.2, category: "vegan", slug: "tahini-pasta", description: "Sezamová pasta bohatá na protein" },
    
    // 🥛 Další mléčné výrobky
    { id: 21, name: "Proteinový jogurt Danone", price: 34.90, weight: 160, proteinPer100g: 15.0, category: "dairy", slug: "proteinovy-jogurt-danone", description: "Vysokoproteinový jogurt s 15g proteinu" },
    { id: 22, name: "Mozzarella di bufala", price: 89.90, weight: 125, proteinPer100g: 18.1, category: "dairy", slug: "mozzarella-di-bufala", description: "Italská mozzarella z buvolího mléka" },
    { id: 23, name: "Feta sýr", price: 69.90, weight: 200, proteinPer100g: 14.2, category: "dairy", slug: "feta-syr", description: "Řecký feta sýr ve slaném nálevu" },
    { id: 24, name: "Čerstvý tvaroh 0%", price: 19.90, weight: 250, proteinPer100g: 11.0, category: "dairy", slug: "cerstva-tvaroh-0", description: "Odtučněný tvaroh 0% tuku" },
    
    // 💊 Doplňky stravy
    { id: 25, name: "Whey protein Nutrend", price: 899.90, weight: 1000, proteinPer100g: 78.0, category: "supplements", slug: "whey-protein-nutrend", description: "Syrovátkový protein s vanilkovou příchutí" },
    { id: 26, name: "Kasein protein", price: 1099.90, weight: 1000, proteinPer100g: 85.0, category: "supplements", slug: "kasein-protein", description: "Pomalý kaseinový protein na noc" },
    { id: 27, name: "Rostlinný protein Blend", price: 799.90, weight: 1000, proteinPer100g: 75.0, category: "supplements", slug: "rostlinny-protein-blend", description: "Mix hráškového a rýžového proteinu" },
    { id: 28, name: "BCAA powder", price: 449.90, weight: 500, proteinPer100g: 0.0, category: "supplements", slug: "bcaa-powder", description: "Aminokyseliny s rozvětveným řetězcem" },
    { id: 29, name: "Protein bar čokoládový", price: 45.90, weight: 60, proteinPer100g: 30.0, category: "supplements", slug: "protein-bar-cokoladovy", description: "Čokoládová proteinová tyčinka s 18g proteinu" },
    { id: 30, name: "Kreatin monohydrát", price: 299.90, weight: 500, proteinPer100g: 0.0, category: "supplements", slug: "kreatin-monohydrat", description: "Čistý kreatin pro sílu a objem svalů" },
    
    // 🌾 Obiloviny a pseudocereálie
    { id: 31, name: "Quinoa bílá", price: 149.90, weight: 500, proteinPer100g: 14.1, category: "grains", slug: "quinoa-bila", description: "Andské quinoa s kompletním profilem aminokyselin" },
    { id: 32, name: "Ovesné vločky jemné", price: 35.90, weight: 500, proteinPer100g: 13.2, category: "grains", slug: "ovesne-vlocky-jemne", description: "Jemné ovesné vločky pro snídaně a pečení" },
    { id: 33, name: "Pohanková krupice", price: 69.90, weight: 500, proteinPer100g: 13.3, category: "grains", slug: "pohankova-krupice", description: "Bezlepková pohanka s vysokým obsahem proteinu" },
    { id: 34, name: "Amarant", price: 89.90, weight: 400, proteinPer100g: 13.6, category: "grains", slug: "amarant", description: "Starobylá plodina s kompletními proteiny" },
    { id: 35, name: "Bulgur", price: 49.90, weight: 500, proteinPer100g: 12.3, category: "grains", slug: "bulgur", description: "Předvařená pšenice s ořechovou chutí" },
    { id: 36, name: "Rýže basmati hnědá", price: 79.90, weight: 1000, proteinPer100g: 7.9, category: "grains", slug: "ryze-basmati-hneda", description: "Aromatická hnědá rýže s vlákninou" },
    
    // 🥚 Vejce a vaječné produkty
    { id: 37, name: "Vejce slepičí M", price: 45.90, weight: 600, proteinPer100g: 13.0, category: "eggs", slug: "vejce-slepici-m", description: "Čerstvá slepičí vejce velikost M" },
    { id: 38, name: "Vejce přepelčí", price: 79.90, weight: 180, proteinPer100g: 13.1, category: "eggs", slug: "vejce-prepelci", description: "Delikátní přepelčí vejce s vysokou nutriční hodnotou" },
    { id: 39, name: "Vaječný bílek v prášku", price: 299.90, weight: 250, proteinPer100g: 82.0, category: "supplements", slug: "vajjecny-bilek-v-prasku", description: "Sušený vaječný bílek bez cholesterolu" },
    
    // 🍄 Houby
    { id: 40, name: "Žampiony čerstvé", price: 59.90, weight: 500, proteinPer100g: 3.1, category: "vegetables", slug: "zampiony-cerstve", description: "Čerstvé žampiony pěstované v ČR" },
    { id: 41, name: "Shiitake sušené", price: 199.90, weight: 100, proteinPer100g: 9.6, category: "vegetables", slug: "shiitake-susene", description: "Sušené shiitake houby - umami a protein" },
    
    // 🥛 Alternativní mléka a jogurty
    { id: 42, name: "Sójové mléko neslazené", price: 29.90, weight: 1000, proteinPer100g: 3.3, category: "dairy", slug: "sojove-mleko-neslazene", description: "Rostlinné sójové mléko bez cukru" },
    { id: 43, name: "Mandlové mléko", price: 39.90, weight: 1000, proteinPer100g: 0.5, category: "dairy", slug: "mandlove-mleko", description: "Jemné mandlové mléko pro smoothie" },
    { id: 44, name: "Kokosové mléko", price: 49.90, weight: 400, proteinPer100g: 2.3, category: "dairy", slug: "kokosove-mleko", description: "Husté kokosové mléko pro kari a dezerty" },
    { id: 45, name: "Ovesný jogurt Alpro", price: 34.90, weight: 500, proteinPer100g: 3.0, category: "dairy", slug: "ovesny-jogurt-alpro", description: "Rostlinný jogurt z ovsa" },
    
    // 🌿 Semena a superfoods
    { id: 46, name: "Konopná semínka", price: 179.90, weight: 250, proteinPer100g: 31.6, category: "nuts", slug: "konopna-seminko", description: "Konopná semínka s kompletním profilem aminokyselin" },
    { id: 47, name: "Lněná semínka", price: 69.90, weight: 500, proteinPer100g: 18.3, category: "nuts", slug: "lnena-seminko", description: "Lněná semínka bohatá na omega-3" },
    { id: 48, name: "Slunečnicová semínka", price: 89.90, weight: 500, proteinPer100g: 20.8, category: "nuts", slug: "slunecnicova-seminko", description: "Pražená slunečnicová semínka" },
    { id: 49, name: "Dýňová semínka", price: 199.90, weight: 500, proteinPer100g: 30.2, category: "nuts", slug: "dynova-seminko", description: "Dýňová semínka s vysokým obsahem zinku a proteinu" },
    { id: 50, name: "Spirulina prášek", price: 299.90, weight: 100, proteinPer100g: 57.5, category: "supplements", slug: "spirulina-prasek", description: "Modrozelená řasa s 57% proteinem" },
    
    // 🐟 Další ryby a mořské plody
    { id: 51, name: "Sardiny v olivovém oleji", price: 89.90, weight: 120, proteinPer100g: 24.6, category: "fish", slug: "sardiny-v-olivovem-oleji", description: "Portugalské sardiny v olivovém oleji" },
    { id: 52, name: "Makrela uzená", price: 129.90, weight: 300, proteinPer100g: 23.8, category: "fish", slug: "makrela-uzena", description: "Tradičně uzená makrela" },
    { id: 53, name: "Krab aljašský", price: 299.90, weight: 200, proteinPer100g: 19.4, category: "fish", slug: "krab-aljasky", description: "Mražené krabí maso z Aljašky" },
    
    // 🥩 Specialty maso
    { id: 54, name: "Králičí maso", price: 349.90, weight: 800, proteinPer100g: 21.8, category: "meat", slug: "kralici-maso", description: "Dietní králičí maso s nízkým tukem" },
    { id: 55, name: "Zvěřina - srnčí", price: 599.90, weight: 500, proteinPer100g: 22.5, category: "meat", slug: "zverina-srnci", description: "Divoké srnčí maso bez antibiotik" },
    { id: 56, name: "Kančí klobása", price: 179.90, weight: 300, proteinPer100g: 16.8, category: "meat", slug: "kanci-klobasa", description: "Tradiční kančí klobása bez konzervantů" },
    
    // 🌱 Veganské produkty (100% rostlinné)
    { id: 57, name: "Edamame mražené", price: 79.90, weight: 400, proteinPer100g: 11.9, category: "vegan", slug: "edamame-mrazene", description: "Mladé sójové lusky - kompletní protein" },
    { id: 58, name: "Hummus klasický", price: 39.90, weight: 200, proteinPer100g: 7.9, category: "vegan", slug: "hummus-klasicky", description: "Krémová cizrnová pomazánka s tahini" },
    { id: 59, name: "Falafel mix", price: 49.90, weight: 200, proteinPer100g: 13.3, category: "vegan", slug: "falafel-mix", description: "Směs na přípravu cizrnových kuliček" },
    { id: 60, name: "Tahini pasta", price: 89.90, weight: 340, proteinPer100g: 17.0, category: "vegan", slug: "tahini-pasta", description: "Sezamová pasta bohatá na protein" },
    { id: 61, name: "Jackfruit v nálevu", price: 69.90, weight: 565, proteinPer100g: 1.7, category: "vegan", slug: "jackfruit-v-nalevu", description: "Mladý jackfruit - náhrada trhané masa" },
    { id: 62, name: "TVP granulát", price: 39.90, weight: 200, proteinPer100g: 52.0, category: "vegan", slug: "tvp-granulat", description: "Texturovaný rostlinný protein" },
    { id: 63, name: "Rostlinný burger Beyond", price: 89.90, weight: 226, proteinPer100g: 17.7, category: "vegan", slug: "rostlinny-burger-beyond", description: "Veganský burger připomínající maso" },
    { id: 64, name: "Veganská šunka", price: 59.90, weight: 100, proteinPer100g: 14.5, category: "vegan", slug: "veganska-sunka", description: "Rostlinná alternativa šunky" },
    { id: 65, name: "Luštěninové těstoviny", price: 69.90, weight: 250, proteinPer100g: 21.0, category: "vegan", slug: "lusteninove-testoviny", description: "Těstoviny z červené čočky" },
    { id: 66, name: "Nutritional yeast", price: 149.90, weight: 200, proteinPer100g: 45.0, category: "vegan", slug: "nutritional-yeast", description: "Lahůdkové droždí s B12 vitamínem" },
    { id: 67, name: "Aquafaba (cizrnová voda)", price: 29.90, weight: 400, proteinPer100g: 1.0, category: "vegan", slug: "aquafaba", description: "Náhrada vaječných bílků pro pečení" },
    { id: 68, name: "Veganské párky", price: 79.90, weight: 200, proteinPer100g: 18.0, category: "vegan", slug: "veganske-parky", description: "Rostlinné párky s kouřovou příchutí" },
    { id: 69, name: "Oatly Barista", price: 49.90, weight: 1000, proteinPer100g: 1.0, category: "vegan", slug: "oatly-barista", description: "Ovesné mléko pro kávové speciality" },
    { id: 70, name: "Veganský sýr na pizzu", price: 69.90, weight: 200, proteinPer100g: 0.9, category: "vegan", slug: "vegansky-syr-pizza", description: "Tavící se rostlinný sýr na pizzu" },
    { id: 71, name: "Hemp tofu", price: 89.90, weight: 200, proteinPer100g: 17.0, category: "vegan", slug: "hemp-tofu", description: "Tofu z konopných semínek" },
    { id: 72, name: "Veganská majonéza", price: 39.90, weight: 240, proteinPer100g: 0.3, category: "vegan", slug: "veganska-majoneza", description: "Rostlinná majonéza bez vajec" },
    { id: 73, name: "Miso pasta", price: 79.90, weight: 300, proteinPer100g: 12.8, category: "vegan", slug: "miso-pasta", description: "Fermentovaná sójová pasta - umami" },
    { id: 74, name: "Wakame řasy", price: 149.90, weight: 100, proteinPer100g: 3.0, category: "vegan", slug: "wakame-rasy", description: "Mořské řasy s minerály a proteinem" },
    { id: 75, name: "Nori listy", price: 89.90, weight: 50, proteinPer100g: 41.4, category: "vegan", slug: "nori-listy", description: "Lisované mořské řasy na sushi" },
    { id: 76, name: "Veganský protein shake", price: 59.90, weight: 330, proteinPer100g: 6.1, category: "vegan", slug: "vegansky-protein-shake", description: "Hotový proteinový nápoj z hrachu" },
    
    // 🥑 Low Carb produkty (nízký obsah sacharidů)
    { id: 77, name: "Keto chléb proteinový", price: 89.90, weight: 300, proteinPer100g: 19.5, category: "lowcarb", slug: "keto-chleb-proteinovy", description: "Nízkosacharidový chléb s vysokým proteinem" },
    { id: 78, name: "Shirataki nudle", price: 49.90, weight: 200, proteinPer100g: 0.2, category: "lowcarb", slug: "shirataki-nudle", description: "Konjakové nudle bez kalorií a sacharidů" },
    { id: 79, name: "MCT olej", price: 399.90, weight: 500, proteinPer100g: 0.0, category: "keto", slug: "mct-olej", description: "Kokosový MCT olej pro ketózu" },
    { id: 80, name: "Mandlová mouka", price: 129.90, weight: 500, proteinPer100g: 21.2, category: "lowcarb", slug: "mandlova-mouka", description: "Bezlepková mouka pro low carb pečení" },
    { id: 81, name: "Psyllium vláknina", price: 149.90, weight: 300, proteinPer100g: 1.5, category: "lowcarb", slug: "psyllium-vlaknina", description: "Rozpustná vláknina pro keto pečení" },
    { id: 82, name: "Erythritol sladidlo", price: 99.90, weight: 500, proteinPer100g: 0.0, category: "lowcarb", slug: "erythritol-sladidlo", description: "Přírodní sladidlo bez kalorií" },
    { id: 83, name: "Kokosová mouka", price: 89.90, weight: 500, proteinPer100g: 19.3, category: "lowcarb", slug: "kokosova-mouka", description: "Low carb mouka s vlákninou" },
    { id: 84, name: "Avokádo", price: 39.90, weight: 200, proteinPer100g: 2.0, category: "keto", slug: "avokado", description: "Zdravé tuky pro keto dietu" },
    { id: 85, name: "Ghee přepuštěné máslo", price: 189.90, weight: 450, proteinPer100g: 0.3, category: "keto", slug: "ghee-prepustene-maslo", description: "Čisté máslo pro vysokoteplotní vaření" },
    { id: 86, name: "Bone broth protein", price: 899.90, weight: 500, proteinPer100g: 90.0, category: "paleo", slug: "bone-broth-protein", description: "Protein z kostního vývaru" },
    
    // 🐃 High Protein produkty (extra vysoký protein)
    { id: 87, name: "Isolate 95", price: 1199.90, weight: 1000, proteinPer100g: 95.0, category: "highprotein", slug: "isolate-95", description: "Čistý izolát s 95% proteinu" },
    { id: 88, name: "Beef protein", price: 999.90, weight: 1000, proteinPer100g: 87.0, category: "highprotein", slug: "beef-protein", description: "Hovězí protein bez laktózy" },
    { id: 89, name: "Egg white protein", price: 1099.90, weight: 1000, proteinPer100g: 85.0, category: "highprotein", slug: "egg-white-protein", description: "Vaječný protein s BCAA" },
    { id: 90, name: "Protein pancake mix", price: 149.90, weight: 500, proteinPer100g: 35.0, category: "highprotein", slug: "protein-pancake-mix", description: "Směs na proteinové palačinky" },
    { id: 91, name: "Quest bar", price: 69.90, weight: 60, proteinPer100g: 33.3, category: "highprotein", slug: "quest-bar", description: "Proteinová tyčinka s vlákninou" },
    
    // 🌾 Slow Carb produkty (pomalé sacharidy)
    { id: 92, name: "Batáty", price: 39.90, weight: 1000, proteinPer100g: 1.6, category: "slowcarb", slug: "bataty", description: "Sladké brambory s nízkým GI" },
    { id: 93, name: "Černá rýže", price: 99.90, weight: 500, proteinPer100g: 8.9, category: "slowcarb", slug: "cerna-ryze", description: "Antioxidační rýže s vlákninou" },
    { id: 94, name: "Steel cut oats", price: 79.90, weight: 500, proteinPer100g: 12.5, category: "slowcarb", slug: "steel-cut-oats", description: "Sekané ovesné vločky - pomalé vstřebávání" },
    { id: 95, name: "Teff mouka", price: 149.90, weight: 500, proteinPer100g: 13.3, category: "slowcarb", slug: "teff-mouka", description: "Etiopská mouka s nízkým GI" },
    
    // 🌾 Bez lepku produkty
    { id: 96, name: "Rýžové těstoviny", price: 59.90, weight: 400, proteinPer100g: 7.5, category: "glutenfree", slug: "ryzove-testoviny", description: "Bezlepkové těstoviny z rýže" },
    { id: 97, name: "Amarantové lupínky", price: 69.90, weight: 300, proteinPer100g: 13.6, category: "glutenfree", slug: "amarantove-lupinky", description: "Křupavé bezlepkové lupínky" },
    { id: 98, name: "Kukuřičné tortily", price: 39.90, weight: 320, proteinPer100g: 5.7, category: "glutenfree", slug: "kukuricne-tortily", description: "Měkké kukuřičné tortily" },
    { id: 99, name: "Bezlepkový chléb", price: 79.90, weight: 400, proteinPer100g: 4.5, category: "glutenfree", slug: "bezlepkovy-chleb", description: "Chléb bez lepku s semínky" },
    
    // 🦖 Paleo produkty
    { id: 100, name: "Kokosový nektar", price: 149.90, weight: 350, proteinPer100g: 0.1, category: "paleo", slug: "kokosovy-nektar", description: "Přírodní sladidlo z kokosové palmy" },
    { id: 101, name: "Tygří ořechy", price: 119.90, weight: 200, proteinPer100g: 4.6, category: "paleo", slug: "tygri-orechy", description: "Hlízy s prebiotiky (tiger nuts)" },
    { id: 102, name: "Cassava mouka", price: 89.90, weight: 500, proteinPer100g: 1.4, category: "paleo", slug: "cassava-mouka", description: "Paleo mouka z manioku" },
    { id: 103, name: "Plantain chips", price: 69.90, weight: 100, proteinPer100g: 2.3, category: "paleo", slug: "plantain-chips", description: "Křupavé chipsy z plantainů" }
];

// Process products
// Default nutrition values by category (estimated if missing)
const defaultNutrition = {
    dairy: { calories: 100, fat: 3, carbs: 5 },
    meat: { calories: 150, fat: 5, carbs: 0 },
    fish: { calories: 120, fat: 3, carbs: 0 },
    legumes: { calories: 340, fat: 2, carbs: 60 },
    nuts: { calories: 600, fat: 50, carbs: 20 },
    plant: { calories: 150, fat: 8, carbs: 8 },
    supplements: { calories: 380, fat: 5, carbs: 10 },
    grains: { calories: 350, fat: 3, carbs: 70 },
    eggs: { calories: 150, fat: 11, carbs: 1 },
    vegetables: { calories: 30, fat: 0.5, carbs: 6 },
    vegan: { calories: 200, fat: 10, carbs: 15 }
};

const productsData = productsDatabase.map(product => {
    const totalProtein = (product.weight / 100) * product.proteinPer100g;
    const pricePerGramProtein = product.price / totalProtein;

    // Fill missing nutrition data with defaults
    const categoryDefaults = defaultNutrition[product.category] || defaultNutrition.plant;
    const calories = product.caloriesPer100g || categoryDefaults.calories;
    const fat = product.fatPer100g !== undefined ? product.fatPer100g : categoryDefaults.fat;
    const carbs = product.carbsPer100g !== undefined ? product.carbsPer100g : categoryDefaults.carbs;

    // Calculate protein/kcal ratio (key metric for lean proteins)
    const proteinPerKcal = calories > 0 ? product.proteinPer100g / calories : 0;

    // Determine protein density category
    let proteinDensity = 'low';
    if (proteinPerKcal >= 0.15) proteinDensity = 'excellent'; // Treska, krevety
    else if (proteinPerKcal >= 0.12) proteinDensity = 'high';   // Lean meats
    else if (proteinPerKcal >= 0.08) proteinDensity = 'good';   // Normal meats, fish
    else if (proteinPerKcal >= 0.05) proteinDensity = 'medium'; // Tofu, some dairy

    // Calculate macro percentages
    const proteinCals = product.proteinPer100g * 4;
    const fatCals = fat * 9;
    const carbsCals = carbs * 4;
    const totalCals = proteinCals + fatCals + carbsCals;

    const proteinPercent = totalCals > 0 ? Math.round((proteinCals / totalCals) * 100) : 0;
    const fatPercent = totalCals > 0 ? Math.round((fatCals / totalCals) * 100) : 0;
    const carbsPercent = totalCals > 0 ? Math.round((carbsCals / totalCals) * 100) : 0;

    return {
        ...product,
        caloriesPer100g: calories,
        fatPer100g: fat,
        carbsPer100g: carbs,
        totalProtein: Math.round(totalProtein * 10) / 10,
        pricePerGramProtein: Math.round(pricePerGramProtein * 100) / 100,
        proteinPerKcal: Math.round(proteinPerKcal * 1000) / 1000,
        proteinDensity,
        proteinPercent,
        fatPercent,
        carbsPercent
    };
});

const categoryNames = {
    'dairy': 'Mléčné výrobky',
    'meat': 'Maso',
    'fish': 'Ryby a mořské plody',
    'legumes': 'Luštěniny',
    'nuts': 'Ořechy a semena',
    'plant': 'Rostlinné proteiny',
    'supplements': 'Doplňky stravy',
    'grains': 'Obiloviny',
    'eggs': 'Vejce',
    'vegetables': 'Zelenina a houby',
    'vegan': 'Veganské',
    'lowcarb': 'Low Carb',
    'slowcarb': 'Slow Carb',
    'keto': 'Keto',
    'paleo': 'Paleo',
    'highprotein': 'High Protein',
    'glutenfree': 'Bez lepku',
    'other': 'Ostatní'
};

// HTML template for product pages
function generateProductPage(product) {
    const rankPosition = productsData.sort((a, b) => a.pricePerGramProtein - b.pricePerGramProtein).findIndex(p => p.id === product.id) + 1;
    const similarProducts = productsData.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

    // Comparisons that will be created later - hardcoded for now
    const comparisonPairs = [
        { product1: 'tvaroh-polotucny-pilos', product2: 'cottage-cheese-pribinacek' },
        { product1: 'kureci-prsa', product2: 'kruti-prsa' },
        { product1: 'whey-protein-nutrend', product2: 'beef-protein' },
        { product1: 'tofu-lunter', product2: 'tempeh' },
        { product1: 'cerne-fazole', product2: 'quinoa-bila' },
        { product1: 'losos-norsky-filet', product2: 'tunak-v-oleji' },
        { product1: 'recky-jogurt-0-milko', product2: 'proteinovy-jogurt-danone' },
        { product1: 'arasidove-maslo', product2: 'tahini-pasta' },
        { product1: 'ovesne-vlocky-jemne', product2: 'quinoa-bila' },
        { product1: 'mandlova-mouka', product2: 'kokosova-mouka' }
    ];

    // Find comparisons involving this product
    const productComparisons = comparisonPairs.filter(comp =>
        comp.product1 === product.slug || comp.product2 === product.slug
    ).map(comp => {
        const otherProductSlug = comp.product1 === product.slug ? comp.product2 : comp.product1;
        const otherProduct = productsData.find(p => p.slug === otherProductSlug);
        return {
            otherProduct,
            comparisonSlug: `${comp.product1}-vs-${comp.product2}`
        };
    }).filter(comp => comp.otherProduct);

    return `${getHtmlHeadStart(
        `${product.name} - Protein ${product.proteinPer100g}g/100g za ${product.pricePerGramProtein.toFixed(2)} Kč/g`,
        `${product.name}: ${product.proteinPer100g}g proteinu na 100g, celkem ${product.totalProtein}g za ${product.price} Kč. Cena ${product.pricePerGramProtein.toFixed(2)} Kč za gram proteinu.`
    )}
    <meta name="keywords" content="${product.name}, protein, cena proteinu, ${categoryNames[product.category].toLowerCase()}, fitness potraviny">

    <!-- Open Graph -->
    <meta property="og:title" content="${product.name} - Protein ${product.proteinPer100g}g/100g">
    <meta property="og:description" content="${product.description}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="http://46.62.166.240/protein-hunter/produkty/${product.slug}.html">

    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "${product.name}",
        "description": "${product.description}",
        "category": "${categoryNames[product.category]}",
        "offers": {
            "@type": "Offer",
            "price": "${product.price}",
            "priceCurrency": "CZK"
        },
        "nutrition": {
            "@type": "NutritionInformation",
            "proteinContent": "${product.proteinPer100g}g"
        }
    }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="text-sm">
            <a href="/protein-hunter/" class="text-gray-500 hover:text-primary">Domů</a>
            <span class="mx-2 text-gray-400">/</span>
            <a href="/protein-hunter/produkty/" class="text-gray-500 hover:text-primary">Produkty</a>
            <span class="mx-2 text-gray-400">/</span>
            <a href="/protein-hunter/kategorie/${product.category}.html" class="text-gray-500 hover:text-primary">${categoryNames[product.category]}</a>
            <span class="mx-2 text-gray-400">/</span>
            <span class="text-gray-900 font-medium">${product.name}</span>
        </nav>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Product Header -->
        <div class="bg-white rounded-lg shadow p-8 mb-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div class="mb-4">
                        <span class="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                            #${rankPosition} nejlevnější protein
                        </span>
                    </div>
                    
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">${product.name}</h1>
                    <p class="text-lg text-gray-600 mb-6">${product.description}</p>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-green-50 p-4 rounded-lg text-center">
                            <div class="text-2xl font-bold text-green-600">${product.pricePerGramProtein.toFixed(2)} Kč</div>
                            <div class="text-sm text-green-700">za 1g proteinu</div>
                            <div class="text-xs text-green-600 mt-1">${rankPosition <= 5 ? '🏆 TOP 5' : rankPosition <= 10 ? '⭐ TOP 10' : '📊 Hodnocení'}</div>
                        </div>
                        <div class="bg-blue-50 p-4 rounded-lg text-center">
                            <div class="text-2xl font-bold text-blue-600">${product.proteinPer100g}g</div>
                            <div class="text-sm text-blue-700">protein/100g</div>
                            <div class="text-xs text-blue-600 mt-1">${product.proteinPer100g >= 25 ? '💪 Vysoký' : product.proteinPer100g >= 15 ? '✓ Střední' : '📊 Základní'}</div>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-lg text-center">
                            <div class="text-2xl font-bold text-purple-600">${product.price} Kč</div>
                            <div class="text-sm text-purple-700">celková cena</div>
                            <div class="text-xs text-purple-600 mt-1">${(product.totalProtein / product.price).toFixed(1)}g/Kč</div>
                        </div>
                        <div class="bg-orange-50 p-4 rounded-lg text-center">
                            <div class="text-2xl font-bold text-orange-600">${product.weight >= 1000 ? (product.weight/1000).toFixed(1) + 'kg' : product.weight + 'g'}</div>
                            <div class="text-sm text-orange-700">hmotnost</div>
                            <div class="text-xs text-orange-600 mt-1">${(product.weight / 100).toFixed(1)} porcí</div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h2 class="text-xl font-semibold mb-4">📊 Nutriční profil (100g)</h2>

                    <!-- Protein/Kcal Metric - NEW ⭐ -->
                    <div class="mb-4 p-4 rounded-lg ${
                        product.proteinDensity === 'excellent' ? 'bg-green-100 border-2 border-green-400' :
                        product.proteinDensity === 'high' ? 'bg-green-50 border-2 border-green-300' :
                        product.proteinDensity === 'good' ? 'bg-blue-50 border border-blue-300' :
                        product.proteinDensity === 'medium' ? 'bg-yellow-50 border border-yellow-300' :
                        'bg-gray-50 border border-gray-300'
                    }">
                        <div class="text-center">
                            <div class="text-sm font-medium text-gray-600 mb-1">Protein/kcal ratio</div>
                            <div class="text-3xl font-bold ${
                                product.proteinDensity === 'excellent' || product.proteinDensity === 'high' ? 'text-green-600' :
                                product.proteinDensity === 'good' ? 'text-blue-600' :
                                'text-gray-600'
                            }">${product.proteinPerKcal.toFixed(3)}</div>
                            <div class="text-xs mt-1 font-semibold ${
                                product.proteinDensity === 'excellent' ? 'text-green-700' :
                                product.proteinDensity === 'high' ? 'text-green-600' :
                                product.proteinDensity === 'good' ? 'text-blue-600' :
                                'text-gray-600'
                            }">
                                ${
                                    product.proteinDensity === 'excellent' ? '🏆 EXCELLENT - Lean protein king!' :
                                    product.proteinDensity === 'high' ? '⭐ HIGH - Great for cutting' :
                                    product.proteinDensity === 'good' ? '✓ GOOD - Solid choice' :
                                    product.proteinDensity === 'medium' ? '📊 MEDIUM' :
                                    '📉 LOW - High in fat/carbs'
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Makro složení -->
                    <div class="p-4 bg-white border rounded-lg mb-4">
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-medium">Protein</span>
                                    <span class="font-bold text-green-600">${product.proteinPer100g}g (${product.proteinPercent}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: ${product.proteinPercent}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-medium">Tuky</span>
                                    <span class="font-bold text-orange-600">${product.fatPer100g}g (${product.fatPercent}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-orange-500 h-2 rounded-full" style="width: ${product.fatPercent}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-medium">Sacharidy</span>
                                    <span class="font-bold text-blue-600">${product.carbsPer100g}g (${product.carbsPercent}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${product.carbsPercent}%"></div>
                                </div>
                            </div>
                            <div class="pt-2 border-t">
                                <div class="flex justify-between text-sm">
                                    <span class="font-medium">Kalorie celkem</span>
                                    <span class="font-bold">${product.caloriesPer100g} kcal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Statistiky -->
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span>Celkem proteinu v balení:</span>
                                <span class="font-bold text-primary">${product.totalProtein}g</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Pozice v žebříčku:</span>
                                <span class="font-bold text-primary">#${rankPosition} z ${productsData.length}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Protein na korunu:</span>
                                <span class="font-semibold">${(product.totalProtein / product.price).toFixed(2)}g/Kč</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 space-y-3">
                        <a href="/protein-hunter/kategorie/${product.category}.html" class="block w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors text-center">
                            🔍 Porovnat s podobnými produkty
                        </a>
                        <a href="/protein-hunter/kalkulacka.html" class="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors text-center">
                            🧮 Spočítat denní potřebu
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- FAQ Section -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-6">❓ Často kladené otázky o ${product.name}</h2>
            <div class="space-y-4">
                <div class="border-l-4 border-primary pl-4">
                    <h3 class="font-semibold text-gray-900 mb-2">Kolik proteinu obsahuje ${product.name}?</h3>
                    <p class="text-gray-600">${product.name} obsahuje ${product.proteinPer100g}g proteinu na 100g produktu. V celém balení (${product.weight}g) je celkem ${product.totalProtein}g proteinu.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                    <h3 class="font-semibold text-gray-900 mb-2">Jaká je cena za gram proteinu u ${product.name}?</h3>
                    <p class="text-gray-600">Cena za gram proteinu u ${product.name} je ${product.pricePerGramProtein.toFixed(2)} Kč. To je ${rankPosition <= 10 ? 'velmi dobrá' : rankPosition <= 20 ? 'průměrná' : 'vyšší'} cena ve srovnání s ostatními produkty.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                    <h3 class="font-semibold text-gray-900 mb-2">Je ${product.name} vhodný pro fitness?</h3>
                    <p class="text-gray-600">Ano, ${product.name} s ${product.proteinPer100g}g proteinu na 100g je ${product.proteinPer100g >= 20 ? 'vynikajícím' : product.proteinPer100g >= 15 ? 'dobrým' : 'základním'} zdrojem bílkovin pro sportovce a fitness.</p>
                </div>
            </div>
        </div>

        ${productComparisons.length > 0 ? `
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">⚖️ Porovnání s jinými produkty</h2>
            <p class="text-gray-600 mb-4">Podívejte se, jak si ${product.name} vede v přímém souboji s konkurencí:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${productComparisons.map(comp => {
                    const other = comp.otherProduct;
                    const isBetter = product.pricePerGramProtein < other.pricePerGramProtein;
                    return `
                    <a href="/protein-hunter/porovnani/${comp.comparisonSlug}.html" class="border rounded-lg p-4 hover:shadow-lg transition-shadow ${isBetter ? 'border-green-300 bg-green-50' : 'border-gray-200'}">
                        <div class="flex items-center justify-between mb-3">
                            <div class="font-semibold text-gray-900">
                                ${product.name}
                            </div>
                            <div class="text-2xl">VS</div>
                            <div class="font-semibold text-gray-900">
                                ${other.name}
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div class="text-center">
                                <div class="text-2xl font-bold ${isBetter ? 'text-green-600' : 'text-gray-600'}">${product.pricePerGramProtein.toFixed(2)} Kč</div>
                                <div class="text-xs text-gray-600">za 1g proteinu</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold ${!isBetter ? 'text-green-600' : 'text-gray-600'}">${other.pricePerGramProtein.toFixed(2)} Kč</div>
                                <div class="text-xs text-gray-600">za 1g proteinu</div>
                            </div>
                        </div>
                        <div class="mt-3 text-center">
                            <span class="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs">
                                ${isBetter ? '🏆 ' + product.name + ' vítězí!' : '👀 Detailní srovnání →'}
                            </span>
                        </div>
                    </a>
                `;
                }).join('')}
            </div>
        </div>
        ` : ''}

        ${similarProducts.length > 0 ? `
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">🔗 Podobné produkty v kategorii "${categoryNames[product.category]}"</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${similarProducts.map(similar => `
                    <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 class="font-semibold text-primary mb-2">
                            <a href="/protein-hunter/produkty/${similar.slug}.html" class="hover:underline">${similar.name}</a>
                        </h3>
                        <div class="text-sm text-gray-600 space-y-1">
                            <div>Protein: ${similar.proteinPer100g}g/100g</div>
                            <div>Cena: ${similar.price} Kč</div>
                            <div class="font-semibold text-primary">${similar.pricePerGramProtein.toFixed(2)} Kč/g</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </main>

    ${getFooter()}
</body>
</html>`;
}

// Generate product pages
console.log('Generating product pages...');
if (!fs.existsSync('produkty')) {
    fs.mkdirSync('produkty', { recursive: true });
}

productsData.forEach(product => {
    const filename = `produkty/${product.slug}.html`;
    const html = generateProductPage(product);
    fs.writeFileSync(filename, html);
    console.log(`Generated: ${filename}`);
});

// Generate products index page
const productsIndexHtml = `${getHtmlHead(
    `Všechny proteinové potraviny - databáze ${productsData.length} produktů s cenami`,
    'Kompletní databáze proteinových potravin s porovnáním cen za gram proteinu. Mléčné výrobky, maso, ryby, luštěniny a doplňky stravy.'
)}
    <meta name="keywords" content="proteinové potraviny, databáze potravin, cena proteinu, nejlevnější protein">
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Všechny proteinové potraviny</h1>
            <p class="text-xl text-gray-600">
                Databáze ${productsData.length} produktů seřazených podle nejlepšího poměru cena/protein. 
                Najděte nejlevnější zdroje bílkovin pro vaši stravu.
            </p>
        </div>
        
        <!-- All products list -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-xl font-semibold">📊 Všechny produkty seřazené podle ceny</h2>
            </div>
            <div class="divide-y divide-gray-100">
                ${productsData
                    .sort((a, b) => a.pricePerGramProtein - b.pricePerGramProtein)
                    .map((product, index) => `
                        <div class="p-4 hover:bg-gray-50 transition-colors">
                            <a href="/protein-hunter/produkty/${product.slug}.html" class="block">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-4">
                                        <div class="text-center">
                                            <div class="text-xl">${index < 3 ? ['🏆', '🥈', '🥉'][index] : `#${index + 1}`}</div>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-primary hover:underline">${product.name}</h3>
                                            <div class="text-sm text-gray-600">
                                                <span class="bg-gray-100 px-2 py-1 rounded text-xs">${categoryNames[product.category]}</span>
                                                <span class="ml-2">${product.price} Kč • ${product.weight >= 1000 ? (product.weight/1000).toFixed(1) + ' kg' : product.weight + ' g'}</span>
                                                <span class="mx-1">•</span>
                                                <span>${product.proteinPer100g}g protein/100g</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-2xl font-bold text-primary">${product.pricePerGramProtein.toFixed(2)} Kč</div>
                                        <div class="text-xs text-gray-500">za 1g proteinu</div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `).join('')}
            </div>
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

fs.writeFileSync('produkty/index.html', productsIndexHtml);
console.log('Generated: produkty/index.html');

// Generate Lean Proteins ranking page
const leanProteinsHtml = `${getHtmlHead(
    'Lean Proteiny - Nejlepší poměr protein/kalorie | Protein Hunter',
    `Databáze ${productsData.length} potravin seřazených podle protein/kcal ratio. Najděte nejlepší lean proteiny pro hubnoucí a definici - vysoký protein, nízké kalorie.`
)}
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">🏆 Lean Proteiny - Protein/Kalorie Ranking</h1>
            <p class="text-xl text-gray-600 mb-4">
                Databáze ${productsData.length} potravin seřazených podle <strong>protein/kcal ratio</strong>.
                Čím vyšší číslo, tím více proteinu dostanete na kalorie - ideální pro cutting, hubnutí a definici.
            </p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 class="font-semibold text-blue-900 mb-2">💡 Co je Lean Protein?</h2>
                <p class="text-blue-800 text-sm mb-2">
                    <strong>Lean protein</strong> = potravina s vysokým obsahem proteinu, ale nízkými kaloriemi.
                    Dokonalé pro kalorický deficit - najedíte se, naberete sval, ale nepřiberete tuk.
                </p>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 text-xs">
                    <div class="bg-green-100 border border-green-300 rounded p-2">
                        <div class="font-bold text-green-800">🏆 EXCELLENT</div>
                        <div class="text-green-700">≥0.15 protein/kcal</div>
                    </div>
                    <div class="bg-green-50 border border-green-200 rounded p-2">
                        <div class="font-bold text-green-700">⭐ HIGH</div>
                        <div class="text-green-600">≥0.12 protein/kcal</div>
                    </div>
                    <div class="bg-blue-50 border border-blue-200 rounded p-2">
                        <div class="font-bold text-blue-700">✓ GOOD</div>
                        <div class="text-blue-600">≥0.08 protein/kcal</div>
                    </div>
                    <div class="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <div class="font-bold text-yellow-700">📊 MEDIUM</div>
                        <div class="text-yellow-600">≥0.05 protein/kcal</div>
                    </div>
                    <div class="bg-gray-50 border border-gray-200 rounded p-2">
                        <div class="font-bold text-gray-700">📉 LOW</div>
                        <div class="text-gray-600">&lt;0.05 protein/kcal</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter buttons -->
        <div class="mb-6 flex gap-2 flex-wrap">
            <button onclick="filterByDensity('all')" class="filter-btn px-4 py-2 bg-primary text-white rounded-lg font-semibold">Všechny</button>
            <button onclick="filterByDensity('excellent')" class="filter-btn px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">🏆 Excellent</button>
            <button onclick="filterByDensity('high')" class="filter-btn px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">⭐ High</button>
            <button onclick="filterByDensity('good')" class="filter-btn px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">✓ Good</button>
            <button onclick="filterByDensity('medium')" class="filter-btn px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">📊 Medium</button>
            <button onclick="filterByDensity('low')" class="filter-btn px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200">📉 Low</button>
        </div>

        <!-- Lean proteins ranking -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-xl font-semibold">📊 Ranking podle Protein/Kcal Ratio</h2>
            </div>
            <div id="products-list" class="divide-y divide-gray-100">
                ${productsData
                    .sort((a, b) => b.proteinPerKcal - a.proteinPerKcal)
                    .map((product, index) => {
                        const densityClass =
                            product.proteinDensity === 'excellent' ? 'bg-green-50 border-l-4 border-green-400' :
                            product.proteinDensity === 'high' ? 'bg-green-50/50 border-l-4 border-green-300' :
                            product.proteinDensity === 'good' ? 'bg-blue-50/50 border-l-4 border-blue-300' :
                            product.proteinDensity === 'medium' ? 'bg-yellow-50/50 border-l-4 border-yellow-300' :
                            'bg-gray-50/50 border-l-4 border-gray-300';

                        const densityLabel =
                            product.proteinDensity === 'excellent' ? '🏆 EXCELLENT' :
                            product.proteinDensity === 'high' ? '⭐ HIGH' :
                            product.proteinDensity === 'good' ? '✓ GOOD' :
                            product.proteinDensity === 'medium' ? '📊 MEDIUM' :
                            '📉 LOW';

                        return `
                        <div class="product-item p-4 hover:bg-gray-50 transition-colors ${densityClass}" data-density="${product.proteinDensity}">
                            <a href="/protein-hunter/produkty/${product.slug}.html" class="block">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-4">
                                        <div class="text-center min-w-[50px]">
                                            <div class="text-xl">${index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}</div>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-primary hover:underline">${product.name}</h3>
                                            <div class="text-sm text-gray-600 mt-1">
                                                <span class="bg-gray-100 px-2 py-1 rounded text-xs">${categoryNames[product.category]}</span>
                                                <span class="ml-2">${product.proteinPer100g}g protein</span>
                                                <span class="mx-1">•</span>
                                                <span>${product.caloriesPer100g} kcal/100g</span>
                                            </div>
                                            <div class="mt-1">
                                                <span class="text-xs font-semibold ${
                                                    product.proteinDensity === 'excellent' ? 'text-green-700' :
                                                    product.proteinDensity === 'high' ? 'text-green-600' :
                                                    product.proteinDensity === 'good' ? 'text-blue-600' :
                                                    product.proteinDensity === 'medium' ? 'text-yellow-700' :
                                                    'text-gray-600'
                                                }">${densityLabel}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-3xl font-bold ${
                                            product.proteinDensity === 'excellent' ? 'text-green-600' :
                                            product.proteinDensity === 'high' ? 'text-green-500' :
                                            product.proteinDensity === 'good' ? 'text-blue-500' :
                                            product.proteinDensity === 'medium' ? 'text-yellow-600' :
                                            'text-gray-500'
                                        }">${product.proteinPerKcal.toFixed(3)}</div>
                                        <div class="text-xs text-gray-500">protein/kcal</div>
                                        <div class="text-xs text-gray-400 mt-1">${product.pricePerGramProtein.toFixed(2)} Kč/g protein</div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `;
                    }).join('')}
            </div>
        </div>

        <!-- Info section -->
        <div class="mt-8 bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-bold mb-4">❓ Proč je Protein/Kcal ratio důležité?</h2>
            <div class="prose max-w-none">
                <p class="mb-3">
                    Při <strong>hubnoucí dietě (cutting)</strong> potřebujete být v <strong>kalorickém deficitu</strong>,
                    ale zároveň musíte dodávat tělu dostatek <strong>proteinu pro udržení svalové hmoty</strong>.
                </p>
                <p class="mb-3">
                    <strong>Lean proteiny</strong> (s vysokým protein/kcal ratio) vám umožní:
                </p>
                <ul class="list-disc pl-6 mb-3 space-y-1">
                    <li>Být syti při nízkém kalorické příjmu</li>
                    <li>Udržet nebo nabrat svaly i v deficitu</li>
                    <li>Mít energii a necítit se hladoví</li>
                    <li>Efektivně budovat definici a spalovat tuk</li>
                </ul>
                <h3 class="text-xl font-bold mt-6 mb-3">Příklady:</h3>
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="border border-green-300 bg-green-50 rounded-lg p-4">
                        <div class="font-bold text-green-800 mb-2">✅ DOBRÁ VOLBA - Treska (cod)</div>
                        <div class="text-sm">
                            <div>18.2g protein / 82 kcal = <strong>0.222 ratio</strong></div>
                            <div class="text-green-700 mt-1">→ Hodně proteinu, málo kalorií = ideální pro cutting!</div>
                        </div>
                    </div>
                    <div class="border border-red-300 bg-red-50 rounded-lg p-4">
                        <div class="font-bold text-red-800 mb-2">❌ ŠPATNÁ VOLBA - Mandle (almonds)</div>
                        <div class="text-sm">
                            <div>21.2g protein / 579 kcal = <strong>0.037 ratio</strong></div>
                            <div class="text-red-700 mt-1">→ Hodně kalorií kvůli tukům, náročné na deficit!</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    ${getFooter()}

    <script>
        function filterByDensity(density) {
            const items = document.querySelectorAll('.product-item');
            items.forEach(item => {
                if (density === 'all' || item.dataset.density === density) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            // Update button styles
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
            });
            event.target.classList.add('bg-primary', 'text-white');
        }
    </script>
</body>
</html>`;

if (!fs.existsSync('lean-proteins')) {
    fs.mkdirSync('lean-proteins');
}
fs.writeFileSync('lean-proteins/index.html', leanProteinsHtml);
console.log('Generated: lean-proteins/index.html');

// Generate recepty (recipes) pages
console.log('Generating recipes pages...');
if (!fs.existsSync('recepty')) {
    fs.mkdirSync('recepty', { recursive: true });
}

// Recipes database
const recipesData = [
    // ✅ Původní recepty
    {
        id: 1,
        name: "Proteinový tvarohový koláč",
        slug: "proteinovy-tvarohovy-kolac",
        category: "breakfast",
        protein: "28g",
        description: "Výživný tvarohový koláč s vysokým obsahem proteinu. Ideální pro snídani nebo svačinu.",
        ingredients: ["500g tvaroh", "3 vejce", "50g protein powder", "2 lžíce medu"],
        difficulty: "Snadná",
        time: "45 minut"
    },
    {
        id: 2,
        name: "Kuřecí salát s quinoou",
        slug: "kureci-salat-s-quinoou", 
        category: "lunch",
        protein: "35g",
        description: "Zdravý oběd plný proteinu s quinoou a kuřecími prsy.",
        ingredients: ["200g kuřecí prsa", "100g quinoa", "zelenina", "olivový olej"],
        difficulty: "Střední",
        time: "30 minut"
    },
    {
        id: 3,
        name: "Lososové filé s brokolicí",
        slug: "lososove-file-s-brokoli",
        category: "dinner",
        protein: "42g",
        description: "Výživná večeře s vysokým obsahem omega-3 mastných kyselin a proteinu.",
        ingredients: ["200g losos", "300g brokolice", "citrón", "olivový olej"],
        difficulty: "Snadná",
        time: "25 minut"
    },
    {
        id: 4,
        name: "Proteinový shake s banánem",
        slug: "proteinovy-shake-s-bananem",
        category: "beverages",
        protein: "25g",
        description: "Rychlý proteinový nápoj po tréninku pro regeneraci svalů.",
        ingredients: ["30g protein powder", "1 banán", "250ml mléko", "led"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    
    // 🌅 Nové snídaně (5-14)
    {
        id: 5,
        name: "Nadýchané tvarohové lívance s ovocem",
        slug: "nadychane-tvarohove-livance-s-ovocem",
        category: "breakfast",
        protein: "22g",
        description: "Nadýchané lívance s tvarohem a čerstvým ovocem. Perfektní proteinová snídaně.",
        ingredients: ["250g tvaroh", "2 vejce", "3 lžíce ovesných vloček", "1 banán", "100g borůvek"],
        difficulty: "Snadná",
        time: "15 minut"
    },
    {
        id: 6,
        name: "Snídaňová proteinová cookie s ovocem",
        slug: "snidankova-proteinova-cookie-s-ovocem",
        category: "breakfast",
        protein: "18g",
        description: "Zdravá proteinová sušenka s ovocem a ořechy. Ideální snídaně na cesty.",
        ingredients: ["40g protein powder", "50g mletých mandlí", "30g rozinek", "2 lžíce medu", "2 lžíce kokosového oleje"],
        difficulty: "Snadná",
        time: "20 minut"
    },
    {
        id: 7,
        name: "Řecký jogurt s ořechy a medem",
        slug: "recky-jogurt-s-orechy-a-medem",
        category: "breakfast",
        protein: "20g",
        description: "Jednoduchá a rychlá proteinová snídaně s řeckým jogurtem a ořechy.",
        ingredients: ["200g řecký jogurt", "30g vlašských ořechů", "1 lžíce medu", "1 lžíce chia semínek"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 8,
        name: "Proteinové ovesné vločky overnight",
        slug: "proteinove-ovesne-vlocky-overnight",
        category: "breakfast",
        protein: "25g",
        description: "Overnight oats s proteinem připravené večer. Ráno jen vyndejte z lednice.",
        ingredients: ["50g ovesných vloček", "30g protein powder", "200ml mléka", "1 banán"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 9,
        name: "Scrambled eggs s avokádem",
        slug: "scrambled-eggs-s-avokadem",
        category: "breakfast",
        protein: "24g",
        description: "Klasická míchaná vajíčka s avokádem a čerstvou zeleninou.",
        ingredients: ["3 vejce", "1/2 avokáda", "100g cherry rajčat", "50g čerstvého špenátu"],
        difficulty: "Snadná",
        time: "10 minut"
    },
    {
        id: 10,
        name: "Proteinový smoothie bowl",
        slug: "proteinovy-smoothie-bowl",
        category: "breakfast",
        protein: "30g",
        description: "Hustý smoothie bowl s proteinem a čerstvým ovocem. Instagramová snídaně.",
        ingredients: ["40g protein powder", "1 banán", "100g jahod", "30g granoly"],
        difficulty: "Snadná",
        time: "10 minut"
    },
    {
        id: 11,
        name: "Cottage cheese s ovocem",
        slug: "cottage-cheese-s-ovocem",
        category: "breakfast",
        protein: "22g",
        description: "Jednoduchý cottage cheese s čerstvým ovocem a ořechy.",
        ingredients: ["150g cottage cheese", "1 broskev", "1 lžíce medu", "20g vlašských ořechů"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 12,
        name: "Vajíčková omeleta se šunkou",
        slug: "vajickova-omeleta-se-sunkou",
        category: "breakfast",
        protein: "26g",
        description: "Klasická omeleta se šunkou, sýrem a zeleninou.",
        ingredients: ["3 vejce", "50g šunky", "30g sýra", "1/2 papriky", "1/4 cibule"],
        difficulty: "Snadná",
        time: "12 minut"
    },
    {
        id: 13,
        name: "Proteinové palačinky",
        slug: "proteinove-palacinky",
        category: "breakfast",
        protein: "28g",
        description: "Fitness palačinky s vysokým obsahem proteinu. Bez mouky a cukru.",
        ingredients: ["2 vejce", "100g tvarohu", "30g ovesných vloček", "20g protein powder"],
        difficulty: "Střední",
        time: "20 minut"
    },
    {
        id: 14,
        name: "Quinoa breakfast bowl",
        slug: "quinoa-breakfast-bowl",
        category: "breakfast",
        protein: "21g",
        description: "Výživný quinoa bowl s jogurtem, ovocem a ořechy.",
        ingredients: ["60g quinoa", "100g řeckého jogurtu", "1 jablko", "30g mandlí"],
        difficulty: "Střední",
        time: "15 minut"
    },
    
    // 🥤 Nové nápoje (15-19)
    {
        id: 15,
        name: "Čokoládový protein smoothie",
        slug: "cokoladovy-protein-smoothie",
        category: "beverages",
        protein: "28g",
        description: "Lahodný čokoládový smoothie s proteinem. Chuť jako milkshake.",
        ingredients: ["40g čokoládového proteinu", "1 banán", "250ml mandlového mléka", "1 lžíce kakaa"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 16,
        name: "Green goddess smoothie",
        slug: "green-goddess-smoothie",
        category: "beverages",
        protein: "24g",
        description: "Zelený smoothie plný vitamínů a proteinu. Detox a síla v jednom.",
        ingredients: ["50g špenátu", "30g vanilkového proteinu", "100g ananásu", "200ml kokosové vody"],
        difficulty: "Snadná",
        time: "8 minut"
    },
    {
        id: 17,
        name: "Vanilla protein latte",
        slug: "vanilla-protein-latte",
        category: "beverages",
        protein: "22g",
        description: "Proteinové kávové latte s vanilkovou chutí. Energii na celé dopoledne.",
        ingredients: ["30g vanilkového proteinu", "200ml kávy", "100ml mandlového mléka", "špetka skořice"],
        difficulty: "Snadná",
        time: "10 minut"
    },
    {
        id: 18,
        name: "Berry protein blast",
        slug: "berry-protein-blast",
        category: "beverages",
        protein: "26g",
        description: "Smoothie s mixem bobulí a proteinem. Antioxidanty a síla.",
        ingredients: ["150g mix bobulovin", "35g vanilkového proteinu", "150ml řeckého jogurtu"],
        difficulty: "Velmi snadná",
        time: "6 minut"
    },
    {
        id: 19,
        name: "Tropical protein paradise",
        slug: "tropical-protein-paradise",
        category: "beverages",
        protein: "25g",
        description: "Tropický smoothie s mangem, ananasem a proteinem. Dovolená v sklenici.",
        ingredients: ["100g manga", "100g ananásu", "30g vanilkového proteinu", "150ml kokosového mléka"],
        difficulty: "Snadná",
        time: "7 minut"
    },

    // 🌅 Snídaně pokračování (20-25)
    {
        id: 20,
        name: "Chia pudding s proteinem",
        slug: "chia-pudding-s-proteinem",
        category: "breakfast",
        protein: "19g",
        description: "Chia pudink připravený přes noc s proteinem. Zdravá a výživná snídaně.",
        ingredients: ["3 lžíce chia semínek", "20g protein powder", "200ml mandlového mléka", "1 lžíce medu"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 21,
        name: "Tofu scramble",
        slug: "tofu-scramble",
        category: "breakfast",
        protein: "23g",
        description: "Veganská alternativa míchaných vajec z tofu. Stejná chuť, žádná vejce.",
        ingredients: ["200g tofu", "50g špenátu", "100g rajčat", "1/2 lžičky kurkumy", "1/4 cibule"],
        difficulty: "Střední",
        time: "15 minut"
    },
    {
        id: 22,
        name: "Proteinové muffiny",
        slug: "proteinove-muffiny",
        category: "breakfast",
        protein: "16g",
        description: "Fitness muffiny s proteinem a banánem. Snídaně nebo svačina na cesty.",
        ingredients: ["40g protein powder", "2 banány", "2 vejce", "50g ovesné mouky"],
        difficulty: "Snadná",
        time: "25 minut"
    },
    {
        id: 23,
        name: "Smoked salmon bagel",
        slug: "smoked-salmon-bagel",
        category: "breakfast",
        protein: "27g",
        description: "Luxusní snídaně s uzeným lososem a vejcem. Víkendový favorit.",
        ingredients: ["100g uzený losos", "50g cream cheese", "1 vejce", "30g rukoly", "1 bagel"],
        difficulty: "Snadná",
        time: "8 minut"
    },
    {
        id: 24,
        name: "Proteinový pudink",
        slug: "proteinovy-pudink",
        category: "breakfast",
        protein: "24g",
        description: "Hustý proteinový pudink s chia a kakaem. Čokoládová snídaně bez výčitek.",
        ingredients: ["30g protein powder", "2 lžíce chia", "150g jogurtu", "1 lžíce kakaa"],
        difficulty: "Snadná",
        time: "10 minut"
    },
    {
        id: 25,
        name: "Eggs Benedict fitness verze",
        slug: "eggs-benedict-fitness-verze",
        category: "breakfast",
        protein: "29g",
        description: "Fitness verze klasických Eggs Benedict s kuřecí šunkou a avokádem.",
        ingredients: ["2 vejce", "50g kuřecí šunky", "100g špenátu", "1/2 avokáda"],
        difficulty: "Střední",
        time: "20 minut"
    },

    // 🍽️ Obědy (26-50)
    {
        id: 26,
        name: "Zapečené těstoviny s trhaným kuřecím masem",
        slug: "zapecene-testoviny-s-trhanym-kurecim-masem",
        category: "lunch",
        protein: "32g",
        description: "Zapečené těstoviny s trhaným kuřecím masem a sýrem. Comfort food plný proteinu.",
        ingredients: ["150g kuřecího masa", "100g těstovin", "50g sýra", "200g rajčat", "bylinky"],
        difficulty: "Střední",
        time: "65 minut"
    },
    {
        id: 27,
        name: "Losos s batáty a brokolicí",
        slug: "losos-s-bataty-a-brokoli",
        category: "lunch",
        protein: "38g",
        description: "Pečený losos s batáty a brokolicí. Omega-3 a vitamíny v jednom jídle.",
        ingredients: ["200g losos", "150g batátů", "200g brokolice", "citron", "olivový olej"],
        difficulty: "Střední",
        time: "35 minut"
    },
    {
        id: 28,
        name: "Fitness wrap s tuňákem",
        slug: "fitness-wrap-s-tunakem",
        category: "lunch",
        protein: "28g",
        description: "Rychlý wrap s tuňákem a zeleninou. Oběd na cesty za 12 minut.",
        ingredients: ["1 plechovka tuňáka", "1 tortilla", "1/2 avokáda", "100g rajčat", "salát"],
        difficulty: "Velmi snadná",
        time: "12 minut"
    },
    {
        id: 29,
        name: "Kuřecí curry s rýží",
        slug: "kureci-curry-s-ryzi",
        category: "lunch",
        protein: "36g",
        description: "Aromatické kuřecí curry s rýží a kokosovým mlékem.",
        ingredients: ["200g kuřecího masa", "100g rýže", "150ml kokosmléka", "2 lžíce kari koření"],
        difficulty: "Střední",
        time: "40 minut"
    },
    {
        id: 30,
        name: "Tofu bowl s vejcem",
        slug: "tofu-bowl-s-vejcem",
        category: "lunch",
        protein: "30g",
        description: "Asijský bowl s tofu, vejcem a zeleninou. Kompletní oběd v jedné misce.",
        ingredients: ["150g tofu", "2 vejce", "100g rýže", "mix zeleniny", "1 lžíce sezamu"],
        difficulty: "Střední",
        time: "25 minut"
    },
    {
        id: 31,
        name: "Čočková polévka s klobásou",
        slug: "cockova-polevka-s-klobasou",
        category: "lunch",
        protein: "24g",
        description: "Vydatná čočková polévka s klobásou. Klasika plná proteinu.",
        ingredients: ["100g červené čočky", "100g klobásy", "2 mrkve", "1 celer"],
        difficulty: "Snadná",
        time: "45 minut"
    },
    {
        id: 32,
        name: "Grilovaná kuřecí prsa s quinoou",
        slug: "grilovana-kureci-prsa-s-quinoou",
        category: "lunch",
        protein: "42g",
        description: "Šťavnatá grilovaná kuřecí prsa s quinoou a zeleninou.",
        ingredients: ["200g kuřecích prsou", "80g quinoy", "mix zeleniny", "bylinkový olej"],
        difficulty: "Střední",
        time: "30 minut"
    },
    {
        id: 33,
        name: "Poke bowl s tuňákem",
        slug: "poke-bowl-s-tunakem",
        category: "lunch",
        protein: "34g",
        description: "Havajský poke bowl s čerstvým tuňákem a avokádem.",
        ingredients: ["150g tuňáka", "100g rýže", "1/2 avokáda", "okurek", "nori řasy"],
        difficulty: "Střední",
        time: "20 minut"
    },
    {
        id: 34,
        name: "Kuřecí souvlaki s řeckým salátem",
        slug: "kureci-souvlaki-s-reckym-salatem",
        category: "lunch",
        protein: "39g",
        description: "Řecké kuřecí špízy s čerstvým salátem a feta sýrem.",
        ingredients: ["200g kuřecího masa", "50g feta sýru", "olivy", "rajčata", "okurek"],
        difficulty: "Střední",
        time: "30 minut"
    },
    {
        id: 35,
        name: "Fitness burger s batátovými hranolky",
        slug: "fitness-burger-s-batatovymi-hranolky",
        category: "lunch",
        protein: "33g",
        description: "Domácí fitness burger s pečenými batátovými hranolky.",
        ingredients: ["150g mletého masa", "150g batátů", "salát", "rajčata", "celozrnná žemle"],
        difficulty: "Střední",
        time: "25 minut"
    },

    // 🌙 Večeře (36-55)
    {
        id: 36,
        name: "Špenátové noky s balkánským sýrem",
        slug: "spenatove-noky-s-balkanskym-syrem",
        category: "dinner",
        protein: "24g",
        description: "Špenátové noky s balkánským sýrem a česnekem. Rychlá večeře za 15 minut.",
        ingredients: ["200g špenátu", "150g noků", "80g balkánského sýra", "2 stroužky česneku"],
        difficulty: "Snadná",
        time: "15 minut"
    },
    {
        id: 37,
        name: "Tofu kuličky na kari s rýží",
        slug: "tofu-kulicky-na-kari-s-ryzi",
        category: "dinner",
        protein: "28g",
        description: "Veganské tofu kuličky v kari omáčce s jasmínovou rýží.",
        ingredients: ["200g tofu", "100g rýže", "2 lžíce kari", "150ml kokosmléka"],
        difficulty: "Střední",
        time: "50 minut"
    },
    {
        id: 38,
        name: "Grilovaná kuřecí prsa s restovanou zeleninou",
        slug: "grilovana-kureci-prsa-s-restovanou-zeleninou",
        category: "dinner",
        protein: "40g",
        description: "Šťavnatá grilovaná kuřecí prsa s křupavou restovanou zeleninou.",
        ingredients: ["200g kuřecích prsou", "150g cukety", "1 paprika", "olivy"],
        difficulty: "Snadná",
        time: "20 minut"
    },
    {
        id: 39,
        name: "Fitness pizza s cottage cheese",
        slug: "fitness-pizza-s-cottage-cheese",
        category: "dinner",
        protein: "32g",
        description: "Domácí fitness pizza s cottage cheese jako základ. Zdravá večeře bez výčitek.",
        ingredients: ["150g cottage cheese", "100g žampionů", "50g šunky", "rajčata", "celozrnné těsto"],
        difficulty: "Střední",
        time: "30 minut"
    },
    {
        id: 40,
        name: "Pečený losos s quinoou",
        slug: "peceny-losos-s-quinoou",
        category: "dinner",
        protein: "38g",
        description: "Pečený losos s quinoou a špenátem. Omega-3 a kompletní proteiny.",
        ingredients: ["200g lososa", "80g quinoy", "100g špenátu", "citron"],
        difficulty: "Střední",
        time: "35 minut"
    },
    {
        id: 41,
        name: "Krůtí sekaná s bramborovým pyré",
        slug: "kruti-sekana-s-bramborovym-pyre",
        category: "dinner",
        protein: "35g",
        description: "Domácí krůtí sekaná s nadýchaným bramborovým pyré.",
        ingredients: ["200g krůtího masa", "200g brambor", "1 vejce", "bylinky"],
        difficulty: "Střední",
        time: "45 minut"
    },
    {
        id: 42,
        name: "Plněné papriky s krůtím masem",
        slug: "plnene-papriky-s-krutim-masem",
        category: "dinner",
        protein: "33g",
        description: "Pečené papriky plněné krůtím masem a rýží. Klasika, která nechybí.",
        ingredients: ["3 papriky", "150g krůtího masa", "60g rýže", "50g sýra"],
        difficulty: "Střední",
        time: "40 minut"
    },
    {
        id: 43,
        name: "Fitness carbonara s kuřecím masem",
        slug: "fitness-carbonara-s-kurecim-masem",
        category: "dinner",
        protein: "36g",
        description: "Fitness verze klasické carbonary s kuřecím masem místo slaniny.",
        ingredients: ["150g kuřecího masa", "100g těstovin", "2 vajíčka", "30g parmazánu"],
        difficulty: "Snadná",
        time: "20 minut"
    },
    {
        id: 44,
        name: "Pečené kuře s bylinkami",
        slug: "pecene-kure-s-bylinkami",
        category: "dinner",
        protein: "45g",
        description: "Celé pečené kuře s bylinkami a pečenými brambory. Neděle jako z filmů.",
        ingredients: ["1/2 kuřete", "300g brambor", "bylinkové koření", "česnek"],
        difficulty: "Střední",
        time: "60 minut"
    },
    {
        id: 45,
        name: "Tempeh stir-fry",
        slug: "tempeh-stir-fry",
        category: "dinner",
        protein: "26g",
        description: "Rychlý asijský stir-fry s tempeh a čerstvou zeleninou.",
        ingredients: ["150g tempeh", "150g brokolice", "1 mrkev", "2 lžíce sojové omáčky"],
        difficulty: "Snadná",
        time: "15 minut"
    },

    // 🥤 Nápoje pokračování (46-60)
    {
        id: 46,
        name: "Post-workout recovery drink",
        slug: "post-workout-recovery-drink",
        category: "beverages",
        protein: "30g",
        description: "Regenerační nápoj po tréninku s proteinem a BCAA.",
        ingredients: ["35g protein powder", "1 banán", "1 lžíce chia semínek", "5g BCAA"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 47,
        name: "Chocolate peanut butter smoothie",
        slug: "chocolate-peanut-butter-smoothie",
        category: "beverages",
        protein: "32g",
        description: "Čokoládový smoothie s arašídovým máslem. Jako dezert, ale zdravý.",
        ingredients: ["40g čokoládového proteinu", "2 lžíce arašídového másla", "1 banán", "250ml mléka"],
        difficulty: "Velmi snadná",
        time: "6 minut"
    },
    {
        id: 48,
        name: "Matcha protein latte",
        slug: "matcha-protein-latte",
        category: "beverages",
        protein: "20g",
        description: "Energizující matcha latte s proteinem. Antioxidanty a síla v jednom.",
        ingredients: ["1 lžička matcha", "25g vanilkového proteinu", "200ml ovesného mléka"],
        difficulty: "Snadná",
        time: "8 minut"
    },
    {
        id: 49,
        name: "Protein iced coffee",
        slug: "protein-iced-coffee",
        category: "beverages",
        protein: "24g",
        description: "Ledová káva s proteinem. Perfektní letní osvěžení s kofeinem.",
        ingredients: ["250ml studené kávy", "30g vanilkového proteinu", "led", "špetka skořice"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 50,
        name: "Strawberry protein milkshake",
        slug: "strawberry-protein-milkshake",
        category: "beverages",
        protein: "27g",
        description: "Jahodový proteinový milkshake. Lahodný a výživný.",
        ingredients: ["150g jahod", "35g vanilkového proteinu", "200ml mandlového mléka", "led"],
        difficulty: "Velmi snadná",
        time: "6 minut"
    },
    {
        id: 51,
        name: "Orange creamsicle smoothie",
        slug: "orange-creamsicle-smoothie",
        category: "beverages",
        protein: "23g",
        description: "Pomerančovo-vanilkový smoothie jako zmrzlinová tyčinka.",
        ingredients: ["1 pomeranč", "30g vanilkového proteinu", "100g jogurtu", "led"],
        difficulty: "Snadná",
        time: "7 minut"
    },
    {
        id: 52,
        name: "Blueberry pie smoothie",
        slug: "blueberry-pie-smoothie",
        category: "beverages",
        protein: "25g",
        description: "Borůvkový smoothie jako koláč. Chuť dezерtu, výživa šampiona.",
        ingredients: ["150g borůvek", "30g vanilkového proteinu", "2 lžíce ovesných vloček", "200ml mléka"],
        difficulty: "Snadná",
        time: "8 minut"
    },
    {
        id: 53,
        name: "Cookies & cream protein shake",
        slug: "cookies-cream-protein-shake",
        category: "beverages",
        protein: "29g",
        description: "Shake s chutí cookies & cream. Jako dezert z dětství.",
        ingredients: ["35g vanilkového proteinu", "1 lžíce kakaa", "2 sušenky", "250ml mléka"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 54,
        name: "Mango lassi protein",
        slug: "mango-lassi-protein",
        category: "beverages",
        protein: "21g",
        description: "Indický mango lassi obohacený o protein. Exotika a síla.",
        ingredients: ["100g manga", "100g řeckého jogurtu", "20g vanilkového proteinu", "kardamom"],
        difficulty: "Snadná",
        time: "6 minut"
    },
    {
        id: 55,
        name: "Mint chocolate chip smoothie",
        slug: "mint-chocolate-chip-smoothie",
        category: "beverages",
        protein: "26g",
        description: "Mátovo-čokoládový smoothie se špenátem. Zelený, ale chutná jako dezert.",
        ingredients: ["35g čokoládového proteinu", "5 lístků máty", "50g špenátu", "250ml mléka"],
        difficulty: "Snadná",
        time: "6 minut"
    },
    {
        id: 56,
        name: "Banana bread protein shake",
        slug: "banana-bread-protein-shake",
        category: "beverages",
        protein: "28g",
        description: "Shake s chutí banánového chleba. Snídaně v sklenici.",
        ingredients: ["1 banán", "35g vanilkového proteinu", "2 lžíce ovesných vloček", "špetka skořice"],
        difficulty: "Velmi snadná",
        time: "5 minut"
    },
    {
        id: 57,
        name: "Cherry vanilla protein smoothie",
        slug: "cherry-vanilla-protein-smoothie",
        category: "beverages",
        protein: "24g",
        description: "Třešňovo-vanilkový smoothie. Antioxidanty a protein.",
        ingredients: ["150g třešní", "30g vanilkového proteinu", "200ml mandlového mléka", "led"],
        difficulty: "Snadná",
        time: "7 minut"
    },
    {
        id: 58,
        name: "Pumpkin spice protein latte",
        slug: "pumpkin-spice-protein-latte",
        category: "beverages",
        protein: "23g",
        description: "Dýňové latte s proteinem. Podzimní klasika plná vitamínů.",
        ingredients: ["3 lžíce dýňového pyré", "25g vanilkového proteinu", "200ml kávy", "pumpkin spice koření"],
        difficulty: "Snadná",
        time: "9 minut"
    },
    {
        id: 59,
        name: "Protein horká čokoláda",
        slug: "protein-horka-cokolada",
        category: "beverages",
        protein: "20g",
        description: "Horká čokoláda s proteinem. Zimní radost bez výčitek.",
        ingredients: ["30g čokoládového proteinu", "250ml teplého mléka", "1 lžíce kakaa"],
        difficulty: "Velmi snadná",
        time: "10 minut"
    },
    {
        id: 60,
        name: "Coconut protein smoothie",
        slug: "coconut-protein-smoothie",
        category: "beverages",
        protein: "25g",
        description: "Kokosový smoothie s proteinem. Tropický ráj v sklenici.",
        ingredients: ["150ml kokosového mléka", "30g vanilkového proteinu", "2 lžíce kokosových vloček", "led"],
        difficulty: "Snadná",
        time: "6 minut"
    }
];

// Blog articles database
const blogArticles = [
    {
        id: 1,
        title: "Nejlevnější zdroje proteinu v roce 2025: Kompletní průvodce",
        slug: "nejlevnejsi-zdroje-proteinu-2025",
        excerpt: "Objevte 10 nejlevnějších zdrojů proteinu podle aktuálních cen. Porovnání cen za gram proteinu napříč všemi kategoriemi potravin.",
        content: `
<p>V roce 2025 se ceny potravin neustále mění, ale protein zůstává klíčovou součástí zdravé stravy. Které potraviny nabízejí nejlepší poměr ceny a kvality proteinu?</p>

<h2>🏆 TOP 10 nejlevnějších proteinů</h2>

<p>Na základě aktuální analýzy 56+ potravin jsme sestavili žebříček nejlevnějších zdrojů proteinu:</p>

<ol>
<li><strong>Červená čočka</strong> - 0.32 Kč/g proteinu</li>
<li><strong>Tvaroh polotučný</strong> - 1.18 Kč/g proteinu</li>
<li><strong>Dýňová semínka</strong> - 1.32 Kč/g proteinu</li>
<li><strong>Cottage cheese</strong> - 1.36 Kč/g proteinu</li>
<li><strong>Kuřecí prsa</strong> - 1.39 Kč/g proteinu</li>
</ol>

<h2>💡 Tipy pro úsporu</h2>

<p><strong>Luštěniny jsou král:</strong> Červená čočka, černé fazole a další luštěniny nabízejí neporazitelný poměr cena/protein.</p>

<p><strong>Mléčné výrobky:</strong> Tvaroh a cottage cheese jsou dostupné a nutričně vynikající volby.</p>

<p><strong>Kupujte ve větším:</strong> Větší balení často znamenají lepší cenu za gram proteinu.</p>

<h2>🔍 Srovnání kategorií</h2>

<p>Různé kategorie potravin nabízejí různé cenové úrovně:</p>

<ul>
<li><strong>Luštěniny:</strong> 0.30-0.50 Kč/g (nejlevnější)</li>
<li><strong>Mléčné výrobky:</strong> 1.00-2.00 Kč/g (střední)</li>
<li><strong>Maso:</strong> 1.30-2.50 Kč/g (vyšší)</li>
<li><strong>Doplňky stravy:</strong> 3.00-6.00 Kč/g (nejdražší)</li>
</ul>

<h2>📊 Praktické rady</h2>

<p>Pro optimální výživu kombinujte různé zdroje proteinu. Nekompletní rostlinné proteiny lze doplnit kombinací (fazole + rýže = kompletní protein).</p>
        `,
        author: "Protein Hunter tým",
        publishDate: "2025-01-03",
        category: "analyze",
        tags: ["ceny", "porovnání", "úspora", "luštěniny", "ekonomie"],
        readTime: "5 min",
        featured: true
    },
    {
        id: 2,
        title: "Protein pro začátečníky: Vše, co potřebujete vědět",
        slug: "protein-pro-zacatecniky-pruvodce",
        excerpt: "Kompletní průvodce proteinem pro začátečníky. Kolik proteinu potřebujete, nejlepší zdroje a časté mýty vyvrácené.",
        content: `
<p>Začínáte s fitness nebo chcete zlepšit svou výživu? Protein je základ, ale kolem něj koluje spousta mýtů. Pojďme si vše vyjasnit.</p>

<h2>🤔 Co je to protein?</h2>

<p>Protein je makroživina složená z aminokyselin - stavebních kamenů našich svalů, orgánů a tkání. Tělo potřebuje 20 různých aminokyselin, z nichž 9 je esenciálních (tělo si je nedokáže vyrobit).</p>

<h2>📏 Kolik proteinu potřebujete?</h2>

<p>Obecné doporučení podle aktivity:</p>

<ul>
<li><strong>Sedavý způsob života:</strong> 0.8g/kg tělesné hmotnosti</li>
<li><strong>Rekreační sport:</strong> 1.2-1.6g/kg</li>
<li><strong>Silový trénink:</strong> 1.6-2.2g/kg</li>
<li><strong>Vrcholový sport:</strong> 2.0-2.5g/kg</li>
</ul>

<p><em>Příklad: Člověk s hmotností 70 kg a rekreačním sportem potřebuje 84-112g proteinu denně.</em></p>

<h2>🥩 Nejlepší zdroje proteinu</h2>

<h3>Kompletní proteiny (obsahují všechny esenciální aminokyseliny):</h3>
<ul>
<li>Maso, ryby, drůbež</li>
<li>Vejce</li>
<li>Mléčné výrobky</li>
<li>Quinoa</li>
<li>Sója</li>
</ul>

<h3>Nekompletní proteiny (lze kombinovat):</h3>
<ul>
<li>Luštěniny + obiloviny</li>
<li>Ořechy a semena</li>
<li>Zelenina</li>
</ul>

<h2>💡 Praktické tipy</h2>

<p><strong>Rozložte protein během dne:</strong> 20-30g proteinu každé 3-4 hodiny je optimální pro syntézu svalových bílkovin.</p>

<p><strong>Protein po tréninku:</strong> Do 2 hodin po cvičení pro optimální regeneraci.</p>

<p><strong>Snídaně je klíčová:</strong> 20-25g proteinu na snídani nastartuje metabolismus.</p>

<h2>❌ Časté mýty</h2>

<p><strong>Mýtus:</strong> "Příliš mnoho proteinu poškodí ledviny."<br>
<strong>Pravda:</strong> U zdravých lidí není nadměrný protein problém.</p>

<p><strong>Mýtus:</strong> "Rostlinné proteiny jsou horší."<br>
<strong>Pravda:</strong> Při správné kombinaci jsou stejně kvalitní.</p>

<p><strong>Mýtus:</strong> "Protein jen pro kulturisty."<br>
<strong>Pravda:</strong> Protein potřebuje každý pro zdraví a vitalitu.</p>
        `,
        author: "Protein Hunter tým",
        publishDate: "2025-01-02",
        category: "guide",
        tags: ["začátečníci", "výživa", "základy", "zdraví", "fitness"],
        readTime: "7 min",
        featured: true
    },
    {
        id: 3,
        title: "Rostlinné vs. živočišné proteiny: Vědecké srovnání 2025",
        slug: "rostlinne-vs-zivocisne-proteiny-srovnani",
        excerpt: "Objektivní porovnání rostlinných a živočišných proteinů. Biologická hodnota, aminokyselinový profil a praktické rady pro výběr.",
        content: `
<p>Diskuse o rostlinných vs. živočišných proteinech je stále aktuální. Co říká věda a jak se rozhodnout pro svou stravu?</p>

<h2>🧬 Biologická hodnota proteinů</h2>

<p>Biologická hodnota udává, jak efektivně tělo dokáže využít protein z potraviny:</p>

<table class="w-full border-collapse border border-gray-300 my-4">
<thead>
<tr class="bg-gray-100">
<th class="border border-gray-300 p-2">Potravina</th>
<th class="border border-gray-300 p-2">Biologická hodnota</th>
<th class="border border-gray-300 p-2">Typ</th>
</tr>
</thead>
<tbody>
<tr>
<td class="border border-gray-300 p-2">Vejce</td>
<td class="border border-gray-300 p-2">100</td>
<td class="border border-gray-300 p-2">Živočišný</td>
</tr>
<tr>
<td class="border border-gray-300 p-2">Whey protein</td>
<td class="border border-gray-300 p-2">96</td>
<td class="border border-gray-300 p-2">Živočišný</td>
</tr>
<tr>
<td class="border border-gray-300 p-2">Kuřecí maso</td>
<td class="border border-gray-300 p-2">79</td>
<td class="border border-gray-300 p-2">Živočišný</td>
</tr>
<tr>
<td class="border border-gray-300 p-2">Sója</td>
<td class="border border-gray-300 p-2">74</td>
<td class="border border-gray-300 p-2">Rostlinný</td>
</tr>
<tr>
<td class="border border-gray-300 p-2">Quinoa</td>
<td class="border border-gray-300 p-2">73</td>
<td class="border border-gray-300 p-2">Rostlinný</td>
</tr>
</tbody>
</table>

<h2>🌱 Výhody rostlinných proteinů</h2>

<ul>
<li><strong>Nižší cena:</strong> Luštěniny a obiloviny jsou ekonomicky výhodné</li>
<li><strong>Vláknina:</strong> Podporuje trávení a zdraví střev</li>
<li><strong>Antioxidanty:</strong> Ochrana před volnými radikály</li>
<li><strong>Udržitelnost:</strong> Menší ekologická stopa</li>
<li><strong>Nižší nasycené tuky:</strong> Lepší pro kardiovaskulární zdraví</li>
</ul>

<h2>🥩 Výhody živočišných proteinů</h2>

<ul>
<li><strong>Kompletní aminokyselinový profil:</strong> Všechny esenciální aminokyseliny</li>
<li><strong>Vyšší biologická hodnota:</strong> Lepší využitelnost tělem</li>
<li><strong>B12 a železo:</strong> Snadno vstřebatelné formy</li>
<li><strong>Kreatin:</strong> Pro výkon a sílu</li>
<li><strong>Hustota živin:</strong> Více proteinu na gram</li>
</ul>

<h2>🔬 Co říká věda?</h2>

<p><strong>Studie z roku 2024:</strong> Kombinace rostlinných a živočišných proteinů poskytuje optimální výsledky pro syntézu svalových bílkovin.</p>

<p><strong>Klíčové pozorování:</strong></p>
<ul>
<li>Rostlinné proteiny potřebují vyšší dávky (+ 20-30%)</li>
<li>Kombinace různých rostlinných zdrojů = kompletní protein</li>
<li>Timing je důležitější než zdroj proteinu</li>
</ul>

<h2>💡 Praktické doporučení</h2>

<h3>Pro omnivory (všežravce):</h3>
<p>70% živočišné + 30% rostlinné proteiny pro optimální výživu a udržitelnost.</p>

<h3>Pro vegetariány:</h3>
<p>Kombinujte: luštěniny + obiloviny, ořechy + semena, mléčné výrobky + rostlinné zdroje.</p>

<h3>Pro vegany:</h3>
<p>Zaměřte se na: quinoa, amarant, konopná semínka, tofu + fazole + rýže kombinace.</p>

<h2>📊 Cenové srovnání (Kč/g proteinu)</h2>

<p><strong>Nejlevnější rostlinné:</strong></p>
<ul>
<li>Červená čočka: 0.32 Kč/g</li>
<li>Dýňová semínka: 1.32 Kč/g</li>
<li>Quinoa: 2.13 Kč/g</li>
</ul>

<p><strong>Nejlevnější živočišné:</strong></p>
<ul>
<li>Tvaroh: 1.18 Kč/g</li>
<li>Cottage cheese: 1.36 Kč/g</li>
<li>Kuřecí prsa: 1.39 Kč/g</li>
</ul>

<h2>🎯 Závěr</h2>

<p>Neexistuje "lepší" typ proteinu. Záleží na vašich cílech, rozpočtu, etických preferencích a zdravotním stavu. Nejlepší strategie je kombinace obou typů s důrazem na rozmanitost a kvalitu.</p>
        `,
        author: "Protein Hunter tým",
        publishDate: "2025-01-01",
        category: "comparison",
        tags: ["rostlinné", "živočišné", "věda", "srovnání", "biologie"],
        readTime: "8 min",
        featured: false
    }
];

// Generate recipe category pages
const recipeCategories = {
    'breakfast': 'Proteinové snídaně',
    'lunch': 'Fitness obědy', 
    'dinner': 'Zdravé večeře',
    'beverages': 'Proteinové nápoje'
};

// Recipes index page
const recipesIndexHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recepty s vysokým proteinem - Fitness recepty pro zdravou stravu</title>
    <meta name="description" content="Kolekce ${recipesData.length} receptů s vysokým obsahem proteinu. Snídaně, obědy, večeře a nápoje pro fitness a zdravou stravu.">
    <meta name="keywords" content="proteinové recepty, fitness recepty, zdravá strava, vysoký protein, sportovní výživa">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">🍽️ Recepty s vysokým proteinem</h1>
            <p class="text-xl text-gray-600">
                ${recipesData.length} receptů pro fitness a zdravou stravu. Snídaně, obědy, večeře a nápoje s vysokým obsahem proteinu.
            </p>
        </div>
        
        <!-- Recipe categories -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            ${Object.entries(recipeCategories).map(([category, name]) => `
                <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 class="text-lg font-semibold mb-3">${name}</h3>
                    <div class="text-sm text-gray-600 mb-4">
                        ${recipesData.filter(r => r.category === category).length} receptů
                    </div>
                    <a href="/protein-hunter/recepty/${category}/" class="text-primary hover:underline font-medium">
                        Zobrazit recepty →
                    </a>
                </div>
            `).join('')}
        </div>
        
        <!-- All recipes list -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-xl font-semibold">📋 Všechny recepty</h2>
            </div>
            <div class="divide-y divide-gray-100">
                ${recipesData.map(recipe => `
                    <div class="p-6 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h3 class="text-lg font-semibold text-primary">
                                        <a href="/protein-hunter/recepty/${recipe.category}/${recipe.slug}.html" class="hover:underline">${recipe.name}</a>
                                    </h3>
                                    <span class="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">${recipe.protein}</span>
                                </div>
                                <p class="text-gray-600 mb-3">${recipe.description}</p>
                                <div class="flex items-center gap-4 text-sm text-gray-500">
                                    <span class="bg-gray-100 px-2 py-1 rounded">${recipeCategories[recipe.category]}</span>
                                    <span>⏱️ ${recipe.time}</span>
                                    <span>👨‍🍳 ${recipe.difficulty}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

fs.writeFileSync('recepty/index.html', recipesIndexHtml);
console.log('Generated: recepty/index.html');

// Generate recipe category pages
Object.entries(recipeCategories).forEach(([category, categoryName]) => {
    const categoryRecipes = recipesData.filter(r => r.category === category);
    
    if (!fs.existsSync(`recepty/${category}`)) {
        fs.mkdirSync(`recepty/${category}`, { recursive: true });
    }
    
    const categoryHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${categoryName} - ${categoryRecipes.length} receptů s vysokým proteinem</title>
    <meta name="description" content="${categoryName}: ${categoryRecipes.length} receptů s vysokým obsahem proteinu. Zdravá strava pro fitness a sport.">
    <meta name="keywords" content="${categoryName.toLowerCase()}, proteinové recepty, fitness recepty, zdravá strava">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="text-sm">
            <a href="/protein-hunter/" class="text-gray-500 hover:text-primary">Domů</a>
            <span class="mx-2 text-gray-400">/</span>
            <a href="/protein-hunter/recepty/" class="text-gray-500 hover:text-primary">Recepty</a>
            <span class="mx-2 text-gray-400">/</span>
            <span class="text-gray-900 font-medium">${categoryName}</span>
        </nav>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">${categoryName}</h1>
            <p class="text-xl text-gray-600">
                ${categoryRecipes.length} receptů s vysokým obsahem proteinu. Ideální pro fitness a zdravou stravu.
            </p>
        </div>
        
        <!-- Category recipes -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${categoryRecipes.map(recipe => `
                <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-lg font-semibold text-primary">
                                <a href="/protein-hunter/recepty/${recipe.category}/${recipe.slug}.html" class="hover:underline">${recipe.name}</a>
                            </h3>
                            <span class="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">${recipe.protein}</span>
                        </div>
                        <p class="text-gray-600 mb-4">${recipe.description}</p>
                        <div class="space-y-2 text-sm text-gray-500">
                            <div class="flex items-center gap-2">
                                <span>⏱️</span>
                                <span>${recipe.time}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span>👨‍🍳</span>
                                <span>${recipe.difficulty}</span>
                            </div>
                        </div>
                        <div class="mt-4">
                            <a href="/protein-hunter/recepty/${recipe.category}/${recipe.slug}.html" class="text-primary hover:underline font-medium">
                                Zobrazit recept →
                            </a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

    fs.writeFileSync(`recepty/${category}/index.html`, categoryHtml);
    console.log(`Generated: recepty/${category}/index.html`);
});

// Generate individual recipe pages
recipesData.forEach(recipe => {
    const recipeHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${recipe.name} - ${recipe.protein} proteinu - ${recipe.time}</title>
    <meta name="description" content="${recipe.description} Obsahuje ${recipe.protein} proteinu. Obtížnost: ${recipe.difficulty}, doba přípravy: ${recipe.time}.">
    <meta name="keywords" content="${recipe.name}, proteinový recept, ${recipeCategories[recipe.category].toLowerCase()}, fitness recepty, ${recipe.difficulty.toLowerCase()}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${recipe.name} - ${recipe.protein} proteinu">
    <meta property="og:description" content="${recipe.description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="http://46.62.166.240/protein-hunter/recepty/${recipe.category}/${recipe.slug}.html">
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": "${recipe.name}",
        "description": "${recipe.description}",
        "recipeCategory": "${recipeCategories[recipe.category]}",
        "prepTime": "PT${recipe.time.replace(' minut', 'M')}",
        "recipeYield": "1 porce",
        "nutrition": {
            "@type": "NutritionInformation",
            "proteinContent": "${recipe.protein}"
        },
        "recipeIngredient": ${JSON.stringify(recipe.ingredients)},
        "difficulty": "${recipe.difficulty}"
    }
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="text-sm">
            <a href="/protein-hunter/" class="text-gray-500 hover:text-primary">Domů</a>
            <span class="mx-2 text-gray-400">/</span>
            <a href="/protein-hunter/recepty/" class="text-gray-500 hover:text-primary">Recepty</a>
            <span class="mx-2 text-gray-400">/</span>
            <a href="/protein-hunter/recepty/${recipe.category}/" class="text-gray-500 hover:text-primary">${recipeCategories[recipe.category]}</a>
            <span class="mx-2 text-gray-400">/</span>
            <span class="text-gray-900 font-medium">${recipe.name}</span>
        </nav>
    </div>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Recipe Header -->
        <div class="bg-white rounded-lg shadow p-8 mb-8">
            <div class="mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">${recipeCategories[recipe.category]}</span>
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">${recipe.protein}</span>
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">${recipe.name}</h1>
                <p class="text-xl text-gray-600 mb-6">${recipe.description}</p>
            </div>
            
            <!-- Recipe Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-blue-600">⏱️</div>
                    <div class="text-lg font-semibold text-blue-800">${recipe.time}</div>
                    <div class="text-sm text-blue-600">doba přípravy</div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-green-600">💪</div>
                    <div class="text-lg font-semibold text-green-800">${recipe.protein}</div>
                    <div class="text-sm text-green-600">proteinu</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-purple-600">👨‍🍳</div>
                    <div class="text-lg font-semibold text-purple-800">${recipe.difficulty}</div>
                    <div class="text-sm text-purple-600">obtížnost</div>
                </div>
            </div>
        </div>
        
        <!-- Ingredients -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-4">🛒 Ingredience</h2>
            <ul class="space-y-3">
                ${recipe.ingredients.map(ingredient => `
                    <li class="flex items-center">
                        <span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        <span class="text-gray-700">${ingredient}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <!-- Instructions placeholder -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-4">👩‍🍳 Postup přípravy</h2>
            <div class="space-y-4">
                <div class="flex gap-4">
                    <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">1</span>
                    <p class="text-gray-700 pt-1">Připravte si všechny ingredience podle seznamu výše.</p>
                </div>
                <div class="flex gap-4">
                    <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">2</span>
                    <p class="text-gray-700 pt-1">Postupujte podle základních pravidel přípravy pro kategorii "${recipeCategories[recipe.category]}".</p>
                </div>
                <div class="flex gap-4">
                    <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">3</span>
                    <p class="text-gray-700 pt-1">Servírujte čerstvé a vychutnejte si vysoký obsah proteinu (${recipe.protein}).</p>
                </div>
            </div>
        </div>
        
        <!-- Nutrition Info -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-4">📊 Nutriční hodnoty</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="font-semibold text-lg mb-3">Klíčové hodnoty</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-600">Protein:</span>
                            <span class="font-semibold text-primary">${recipe.protein}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-600">Kategorie:</span>
                            <span class="font-semibold">${recipeCategories[recipe.category]}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-600">Obtížnost:</span>
                            <span class="font-semibold">${recipe.difficulty}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="font-semibold text-lg mb-3">Doporučení</h3>
                    <div class="space-y-2 text-sm text-gray-600">
                        <p>• Ideální ${recipe.category === 'breakfast' ? 'na snídani' : recipe.category === 'lunch' ? 'k obědu' : recipe.category === 'dinner' ? 'k večeři' : 'jako nápoj'}</p>
                        <p>• Vysoký obsah kvalitních bílkovin</p>
                        <p>• Vhodné pro fitness a zdravou stravu</p>
                        <p>• Doba přípravy pouze ${recipe.time}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Related recipes -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">🔗 Podobné recepty</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${recipesData.filter(r => r.category === recipe.category && r.id !== recipe.id).slice(0, 2).map(similar => `
                    <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 class="font-semibold text-primary mb-2">
                            <a href="/protein-hunter/recepty/${similar.category}/${similar.slug}.html" class="hover:underline">${similar.name}</a>
                        </h3>
                        <div class="text-sm text-gray-600 space-y-1">
                            <div>Protein: ${similar.protein}</div>
                            <div>Doba: ${similar.time}</div>
                            <div class="font-semibold text-primary">${similar.difficulty}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

    const recipeFilePath = `recepty/${recipe.category}/${recipe.slug}.html`;
    fs.writeFileSync(recipeFilePath, recipeHtml);
    console.log(`Generated: ${recipeFilePath}`);
});

// Generate slovnik (dictionary) pages
console.log('Generating dictionary pages...');
if (!fs.existsSync('slovnik')) {
    fs.mkdirSync('slovnik', { recursive: true });
}

// Dictionary terms database
const dictionaryTerms = [
    {
        id: 1,
        term: "Protein",
        slug: "protein",
        definition: "Bílkovina je složitá organická sloučenina složená z aminokyselin. Je nezbytná pro růst, opravy a funkce všech buněk v těle.",
        category: "basics",
        relatedTerms: ["aminokyseliny", "biologická hodnota", "kompletní protein"]
    },
    {
        id: 2,
        term: "Aminokyseliny",
        slug: "aminokyseliny", 
        definition: "Stavební kameny bílkovin. Existuje 20 aminokyselin, z nichž 9 je esenciálních (tělo si je nedokáže vyrobit).",
        category: "basics",
        relatedTerms: ["esenciální aminokyseliny", "BCAA", "protein"]
    },
    {
        id: 3,
        term: "BCAA",
        slug: "bcaa",
        definition: "Branched-Chain Amino Acids - aminokyseliny s rozvětveným řetězcem (leucin, isoleucin, valin). Důležité pro regeneraci svalů.",
        category: "supplements",
        relatedTerms: ["leucin", "aminokyseliny", "regenerace"]
    },
    {
        id: 4,
        term: "Biologická hodnota",
        slug: "biologicka-hodnota",
        definition: "Míra kvality proteinu - jak efektivně tělo dokáže využít protein z potraviny pro syntézu vlastních bílkovin.",
        category: "basics", 
        relatedTerms: ["kompletní protein", "aminokyseliny", "kvalita proteinu"]
    },
    {
        id: 5,
        term: "Whey protein",
        slug: "whey-protein",
        definition: "Syrovátkový protein získaný při výrobě sýra. Rychle se vstřebává a má vysokou biologickou hodnotu.",
        category: "supplements",
        relatedTerms: ["kasein", "protein powder", "biologická hodnota"]
    },
    {
        id: 6,
        term: "Kasein",
        slug: "kasein",
        definition: "Pomalu se vstřebávající protein z mléka. Ideální před spaním pro dlouhodobé zásobování svalů aminokyselinami.",
        category: "supplements",
        relatedTerms: ["whey protein", "mléčný protein", "noční regenerace"]
    },
    {
        id: 7,
        term: "Kompletní protein",
        slug: "kompletni-protein",
        definition: "Protein obsahující všech 9 esenciálních aminokyselin v dostatečném množství. Typicky živočišné zdroje a quinoa, sója.",
        category: "basics",
        relatedTerms: ["aminokyseliny", "biologická hodnota", "esenciální aminokyseliny"]
    },
    {
        id: 8,
        term: "Esenciální aminokyseliny",
        slug: "esencialni-aminokyseliny",
        definition: "9 aminokyselin, které si tělo nedokáže samo vyrobit a musí je získat z potravy: leucin, isoleucin, valin, lysin, methionin, fenylalanin, threonin, tryptofan, histidin.",
        category: "basics",
        relatedTerms: ["aminokyseliny", "BCAA", "kompletní protein"]
    },
    {
        id: 9,
        term: "Leucin",
        slug: "leucin",
        definition: "Nejdůležitější aminokyselina pro růst svalů. Aktivuje mTOR dráhu, která spouští syntézu svalových bílkovin.",
        category: "supplements",
        relatedTerms: ["BCAA", "syntéza proteinu", "svalový růst"]
    },
    {
        id: 10,
        term: "Syntéza svalových bílkovin (MPS)",
        slug: "synteza-svalovych-bilkovin",
        definition: "Muscle Protein Synthesis - proces tvorby nových svalových bílkovin. Stimulován proteinem, především leucinem a tréninkem.",
        category: "training",
        relatedTerms: ["leucin", "protein", "regenerace"]
    },
    {
        id: 11,
        term: "Denní doporučený příjem proteinu",
        slug: "denni-doporuceny-prijem-proteinu",
        definition: "Pro sedavý životní styl 0.8g/kg, rekreační sport 1.2-1.6g/kg, silový trénink 1.6-2.2g/kg tělesné hmotnosti.",
        category: "nutrition",
        relatedTerms: ["protein", "výživa", "trénink"]
    },
    {
        id: 12,
        term: "Protein powder",
        slug: "protein-powder",
        definition: "Sušený proteinový prášek - nejčastěji whey, kasein nebo rostlinné proteiny. Praktický způsob doplnění proteinu.",
        category: "supplements",
        relatedTerms: ["whey protein", "kasein", "doplňky"]
    },
    {
        id: 13,
        term: "Anabolické okno",
        slug: "anabolicke-okno",
        definition: "Období po tréninku, kdy tělo nejvíce potřebuje protein pro regeneraci. Moderní výzkum ukazuje, že je méně kritické než se myslelo.",
        category: "training",
        relatedTerms: ["regenerace", "protein timing", "post-workout"]
    },
    {
        id: 14,
        term: "Rostlinný protein",
        slug: "rostlinny-protein",
        definition: "Protein z rostlinných zdrojů jako jsou luštěniny, ořechy, sója, tofu. Často nekompletní, ale kombinací lze získat všechny aminokyseliny.",
        category: "nutrition",
        relatedTerms: ["kompletní protein", "vegan", "luštěniny"]
    },
    {
        id: 15,
        term: "Izolát",
        slug: "izolat",
        definition: "Whey protein isolate - nejčistší forma syrovátkového proteinu (90-95% proteinu), minimální laktóza a tuky.",
        category: "supplements",
        relatedTerms: ["whey protein", "koncentrát", "čistota proteinu"]
    }
];

const dictionaryCategories = {
    'basics': 'Základní pojmy',
    'supplements': 'Doplňky stravy',
    'nutrition': 'Výživa',
    'training': 'Trénink'
};

// Dictionary index page
const dictionaryIndexHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slovník proteinových pojmů - ${dictionaryTerms.length} definic pro fitness a výživu</title>
    <meta name="description" content="Kompletní slovník proteinových a fitness pojmů. ${dictionaryTerms.length} definic aminokyselin, doplňků stravy a výživy.">
    <meta name="keywords" content="slovník proteinů, fitness pojmy, aminokyseliny, doplňky stravy, sportovní výživa">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">📚 Slovník proteinových pojmů</h1>
            <p class="text-xl text-gray-600">
                ${dictionaryTerms.length} definic a vysvětlení pojmů z oblasti proteinů, fitness a sportovní výživy.
            </p>
        </div>
        
        <!-- Search box -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="relative">
                <input type="text" id="searchBox" placeholder="Hledat v slovníku..." 
                       class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span class="text-gray-400">🔍</span>
                </div>
            </div>
        </div>
        
        <!-- Alphabet navigation -->
        <div class="bg-white rounded-lg shadow p-4 mb-8">
            <div class="flex flex-wrap gap-2 justify-center">
                ${Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => `
                    <a href="#${letter}" class="px-3 py-1 text-sm border rounded hover:bg-primary hover:text-white transition-colors">${letter}</a>
                `).join('')}
            </div>
        </div>
        
        <!-- Terms list -->
        <div class="bg-white rounded-lg shadow" id="termsList">
            <div class="px-6 py-4 border-b">
                <h2 class="text-xl font-semibold">📋 Všechny pojmy</h2>
            </div>
            <div class="divide-y divide-gray-100">
                ${dictionaryTerms.sort((a, b) => a.term.localeCompare(b.term)).map(term => `
                    <div class="p-6 hover:bg-gray-50 transition-colors" data-term="${term.term.toLowerCase()}">
                        <div class="mb-3">
                            <h3 class="text-lg font-semibold text-primary mb-1" id="${term.term.charAt(0).toUpperCase()}">
                                <a href="/protein-hunter/slovnik/${term.slug}.html" class="hover:underline">${term.term}</a>
                            </h3>
                            <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">${dictionaryCategories[term.category]}</span>
                        </div>
                        <p class="text-gray-700 mb-3">${term.definition}</p>
                        <div class="flex items-center gap-2 text-sm">
                            <span class="text-gray-500">Související:</span>
                            ${term.relatedTerms.map(related => `
                                <span class="text-primary hover:underline cursor-pointer">${related}</span>
                            `).join(', ')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </main>

    ${getFooter()}

    <script>
        // Simple search functionality
        document.getElementById('searchBox').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const terms = document.querySelectorAll('[data-term]');
            
            terms.forEach(term => {
                const termText = term.getAttribute('data-term');
                if (termText.includes(searchTerm)) {
                    term.style.display = 'block';
                } else {
                    term.style.display = 'none';
                }
            });
        });
    </script>
</body>
</html>`;

fs.writeFileSync('slovnik/index.html', dictionaryIndexHtml);
console.log('Generated: slovnik/index.html');

// Generate individual dictionary term pages
dictionaryTerms.forEach(term => {
    const relatedTermsHtml = term.relatedTerms.map(relatedTerm => {
        const relatedSlug = relatedTerm.toLowerCase().replace(/\s+/g, '-').replace(/[áčďéěíňóřšťúůýž]/g, match => {
            const map = {'á':'a','č':'c','ď':'d','é':'e','ě':'e','í':'i','ň':'n','ó':'o','ř':'r','š':'s','ť':'t','ú':'u','ů':'u','ý':'y','ž':'z'};
            return map[match] || match;
        });
        return `<a href="/protein-hunter/slovnik/${relatedSlug}.html" class="text-primary hover:underline">${relatedTerm}</a>`;
    }).join(', ');

    const termHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${term.term} - definice a význam v fitness a výživě</title>
    <meta name="description" content="${term.term}: ${term.definition} Kompletní vysvětlení pojmu z oblasti proteinů a sportovní výživy.">
    <meta name="keywords" content="${term.term}, ${dictionaryCategories[term.category].toLowerCase()}, fitness pojmy, sportovní výživa, protein">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${term.term} - definice a význam">
    <meta property="og:description" content="${term.definition}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="http://46.62.166.240/protein-hunter/slovnik/${term.slug}.html">
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        "name": "${term.term}",
        "description": "${term.definition}",
        "inDefinedTermSet": {
            "@type": "DefinedTermSet",
            "name": "Slovník proteinových pojmů",
            "description": "Kompletní slovník pojmů z oblasti proteinů a fitness"
        },
        "termCode": "${term.slug}"
    }
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="text-sm">
            <a href="/protein-hunter/" class="text-gray-500 hover:text-primary">Domů</a>
            <span class="mx-2 text-gray-400">/</span>
            <a href="/protein-hunter/slovnik/" class="text-gray-500 hover:text-primary">Slovník</a>
            <span class="mx-2 text-gray-400">/</span>
            <span class="text-gray-900 font-medium">${term.term}</span>
        </nav>
    </div>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Term Header -->
        <div class="bg-white rounded-lg shadow p-8 mb-8">
            <div class="mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">${dictionaryCategories[term.category]}</span>
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">${term.term.charAt(0).toUpperCase()}</span>
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">${term.term}</h1>
                <p class="text-xl text-gray-700 leading-relaxed">${term.definition}</p>
            </div>
        </div>
        
        <!-- Detailed Information -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-4">📖 Podrobné vysvětlení</h2>
            <div class="prose max-w-none">
                <p class="text-gray-700 mb-4">
                    ${term.term} je důležitý pojem v oblasti ${dictionaryCategories[term.category].toLowerCase()}. 
                    ${term.definition}
                </p>
                
                ${term.term === 'Protein' ? `
                <h3 class="text-lg font-semibold mb-3 text-gray-900">Typy proteinů:</h3>
                <ul class="list-disc pl-6 mb-4 text-gray-700">
                    <li><strong>Kompletní proteiny:</strong> Obsahují všechny esenciální aminokyseliny (maso, ryby, vejce)</li>
                    <li><strong>Nekompletní proteiny:</strong> Chybí některé esenciální aminokyseliny (většina rostlinných zdrojů)</li>
                    <li><strong>Rychlé proteiny:</strong> Rychle se vstřebávají (whey protein)</li>
                    <li><strong>Pomalé proteiny:</strong> Postupně uvolňují aminokyseliny (kasein)</li>
                </ul>
                ` : ''}
                
                ${term.term === 'Aminokyseliny' ? `
                <h3 class="text-lg font-semibold mb-3 text-gray-900">Rozdělení aminokyselin:</h3>
                <ul class="list-disc pl-6 mb-4 text-gray-700">
                    <li><strong>Esenciální (9):</strong> Tělo si je nedokáže vyrobit - musí být přijímány potravou</li>
                    <li><strong>Neesenciální (11):</strong> Tělo si je dokáže vyrobit samo</li>
                    <li><strong>Podmíněně esenciální:</strong> Za určitých podmínek se stávají esenciálními</li>
                </ul>
                ` : ''}
                
                ${term.term === 'BCAA' ? `
                <h3 class="text-lg font-semibold mb-3 text-gray-900">Složení BCAA:</h3>
                <ul class="list-disc pl-6 mb-4 text-gray-700">
                    <li><strong>Leucin:</strong> Nejdůležitější pro syntézu svalových bílkovin</li>
                    <li><strong>Isoleucin:</strong> Pomáhá při energetickém metabolismu</li>
                    <li><strong>Valin:</strong> Podporuje regeneraci a růst svalů</li>
                </ul>
                ` : ''}
                
                <h3 class="text-lg font-semibold mb-3 text-gray-900">Praktické využití:</h3>
                <p class="text-gray-700 mb-4">
                    ${term.term} je zejména důležitý pro sportovce, fitness nadšence a osoby, které chtějí zlepšit svou výživu. 
                    Pochopení tohoto pojmu vám pomůže lépe vybírat potraviny a doplňky stravy.
                </p>
            </div>
        </div>
        
        <!-- Related Terms -->
        ${term.relatedTerms.length > 0 ? `
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">🔗 Související pojmy</h2>
            <div class="flex flex-wrap gap-2">
                ${relatedTermsHtml}
            </div>
        </div>
        ` : ''}
        
        <!-- Recommended Products -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">🛒 Doporučené produkty</h2>
            <p class="text-gray-600 mb-4">Produkty z naší databáze související s pojmem "${term.term}":</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${productsData.filter(p => 
                    p.category === 'supplements' || 
                    (term.term === 'Protein' && p.proteinPer100g > 20) ||
                    (term.term === 'Aminokyseliny' && p.category === 'supplements') ||
                    (term.term === 'BCAA' && p.category === 'supplements')
                ).slice(0, 4).map(product => `
                    <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 class="font-semibold text-primary mb-2">
                            <a href="/protein-hunter/produkty/${product.slug}.html" class="hover:underline">${product.name}</a>
                        </h3>
                        <div class="text-sm text-gray-600 space-y-1">
                            <div>Protein: ${product.proteinPer100g}g/100g</div>
                            <div>Cena: ${product.price} Kč</div>
                            <div class="font-semibold text-primary">${product.pricePerGramProtein.toFixed(2)} Kč/g</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4">
                <a href="/protein-hunter/produkty/" class="text-primary hover:underline font-medium">
                    Prohlédnout všechny produkty →
                </a>
            </div>
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

    fs.writeFileSync(`slovnik/${term.slug}.html`, termHtml);
    console.log(`Generated: slovnik/${term.slug}.html`);
});

// Generate blog pages
console.log('Generating blog pages...');
if (!fs.existsSync('blog')) {
    fs.mkdirSync('blog', { recursive: true });
}

// Blog categories
const blogCategories = {
    'analyze': 'Analýzy a porovnání',
    'guide': 'Průvodci',
    'comparison': 'Srovnání',
    'tips': 'Tipy a triky'
};

// Generate blog index page
const blogIndexHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog o proteinech - ${blogArticles.length} článků o výživě a fitness</title>
    <meta name="description" content="Odborné články o proteinech, výživě a fitness. Analýzy cen, průvodci pro začátečníky a vědecká srovnání.">
    <meta name="keywords" content="blog, proteiny, výživa, fitness, články, analýzy, průvodci">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Blog o proteinech - odborné články">
    <meta property="og:description" content="${blogArticles.length} článků o proteinech, výživě a fitness">
    <meta property="og:type" content="website">
    <meta property="og:url" content="http://46.62.166.240/protein-hunter/blog/">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">📝 Blog o proteinech</h1>
            <p class="text-xl text-gray-600">
                ${blogArticles.length} odborných článků o proteinech, výživě a fitness. Analýzy, průvodci a vědecká srovnání.
            </p>
        </div>
        
        <!-- Featured articles -->
        ${blogArticles.filter(article => article.featured).length > 0 ? `
        <div class="mb-12">
            <h2 class="text-2xl font-semibold mb-6">⭐ Doporučené články</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${blogArticles.filter(article => article.featured).map(article => `
                    <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-3">
                                <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">${blogCategories[article.category]}</span>
                                <span class="text-sm text-gray-500">${article.readTime}</span>
                            </div>
                            <h3 class="text-xl font-bold mb-3">
                                <a href="/protein-hunter/blog/${article.slug}.html" class="text-gray-900 hover:text-primary transition-colors">${article.title}</a>
                            </h3>
                            <p class="text-gray-600 mb-4">${article.excerpt}</p>
                            <div class="flex items-center justify-between text-sm text-gray-500">
                                <span>📅 ${new Date(article.publishDate).toLocaleDateString('cs-CZ')}</span>
                                <span>✍️ ${article.author}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- All articles -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-xl font-semibold">📄 Všechny články</h2>
            </div>
            <div class="divide-y divide-gray-100">
                ${blogArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)).map(article => `
                    <div class="p-6 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">${blogCategories[article.category]}</span>
                                    <span class="text-sm text-gray-500">${article.readTime}</span>
                                    ${article.featured ? '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">⭐ Doporučeno</span>' : ''}
                                </div>
                                <h3 class="text-lg font-semibold text-primary mb-2">
                                    <a href="/protein-hunter/blog/${article.slug}.html" class="hover:underline">${article.title}</a>
                                </h3>
                                <p class="text-gray-600 mb-3">${article.excerpt}</p>
                                <div class="flex items-center gap-4 text-sm text-gray-500">
                                    <span>📅 ${new Date(article.publishDate).toLocaleDateString('cs-CZ')}</span>
                                    <span>✍️ ${article.author}</span>
                                    <div class="flex gap-1">
                                        ${article.tags.slice(0, 3).map(tag => `<span class="bg-gray-100 px-2 py-1 rounded text-xs">${tag}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Categories -->
        <div class="mt-12 bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">🗂️ Kategorie článků</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${Object.entries(blogCategories).map(([category, name]) => `
                    <div class="p-3 border rounded-lg text-center">
                        <div class="font-medium text-primary">${name}</div>
                        <div class="text-sm text-gray-500">${blogArticles.filter(a => a.category === category).length} článků</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

fs.writeFileSync('blog/index.html', blogIndexHtml);
console.log('Generated: blog/index.html');

// Generate individual blog article pages
blogArticles.forEach(article => {
    const relatedArticles = blogArticles.filter(a => 
        a.id !== article.id && 
        (a.category === article.category || a.tags.some(tag => article.tags.includes(tag)))
    ).slice(0, 2);

    const articleHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Protein Hunter Blog</title>
    <meta name="description" content="${article.excerpt}">
    <meta name="keywords" content="${article.tags.join(', ')}, protein, blog, výživa">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.excerpt}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="http://46.62.166.240/protein-hunter/blog/${article.slug}.html">
    <meta property="article:published_time" content="${article.publishDate}">
    <meta property="article:author" content="${article.author}">
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${article.title}",
        "description": "${article.excerpt}",
        "author": {
            "@type": "Organization",
            "name": "${article.author}"
        },
        "datePublished": "${article.publishDate}",
        "dateModified": "${article.publishDate}",
        "publisher": {
            "@type": "Organization",
            "name": "Protein Hunter",
            "url": "http://46.62.166.240/protein-hunter/"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "http://46.62.166.240/protein-hunter/blog/${article.slug}.html"
        }
    }
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="text-sm">
            <a href="/protein-hunter/" class="text-gray-500 hover:text-primary">Domů</a>
            <span class="mx-2 text-gray-400">/</span>
            <a href="/protein-hunter/blog/" class="text-gray-500 hover:text-primary">Blog</a>
            <span class="mx-2 text-gray-400">/</span>
            <span class="text-gray-900 font-medium">${article.title}</span>
        </nav>
    </div>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Article Header -->
        <div class="bg-white rounded-lg shadow p-8 mb-8">
            <div class="mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">${blogCategories[article.category]}</span>
                    <span class="text-sm text-gray-500">${article.readTime}</span>
                    ${article.featured ? '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">⭐ Doporučeno</span>' : ''}
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">${article.title}</h1>
                <p class="text-xl text-gray-600 leading-relaxed mb-6">${article.excerpt}</p>
                <div class="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                    <div class="flex items-center gap-4">
                        <span>📅 ${new Date(article.publishDate).toLocaleDateString('cs-CZ')}</span>
                        <span>✍️ ${article.author}</span>
                    </div>
                    <div class="flex gap-1">
                        ${article.tags.map(tag => `<span class="bg-gray-100 px-2 py-1 rounded text-xs">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Article Content -->
        <div class="bg-white rounded-lg shadow p-8 mb-8">
            <div class="prose max-w-none">
                ${article.content}
            </div>
        </div>
        
        <!-- Related Articles -->
        ${relatedArticles.length > 0 ? `
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">📖 Související články</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${relatedArticles.map(related => `
                    <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">${blogCategories[related.category]}</span>
                            <span class="text-xs text-gray-500">${related.readTime}</span>
                        </div>
                        <h3 class="font-semibold text-primary mb-2">
                            <a href="/protein-hunter/blog/${related.slug}.html" class="hover:underline">${related.title}</a>
                        </h3>
                        <p class="text-sm text-gray-600 mb-2">${related.excerpt}</p>
                        <div class="text-xs text-gray-500">📅 ${new Date(related.publishDate).toLocaleDateString('cs-CZ')}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </main>

    ${getFooter()}
</body>
</html>`;

    fs.writeFileSync(`blog/${article.slug}.html`, articleHtml);
    console.log(`Generated: blog/${article.slug}.html`);
});

// Generate category pages
console.log('Generating category pages...');
if (!fs.existsSync('kategorie')) {
    fs.mkdirSync('kategorie', { recursive: true });
}

Object.entries(categoryNames).forEach(([categorySlug, categoryName]) => {
    if (categorySlug === 'other') return; // Skip 'other' category
    
    const categoryProducts = productsData.filter(p => p.category === categorySlug)
        .sort((a, b) => a.pricePerGramProtein - b.pricePerGramProtein);
    
    const categoryHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${categoryName} - ${categoryProducts.length} produktů s cenami za protein</title>
    <meta name="description" content="${categoryName}: ${categoryProducts.length} produktů seřazených podle ceny za gram proteinu. Porovnejte nejlevnější zdroje proteinu v kategorii ${categoryName.toLowerCase()}.">
    <meta name="keywords" content="${categoryName.toLowerCase()}, protein, cena proteinu, nejlevnější protein, ${categorySlug}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${categoryName} - ${categoryProducts.length} produktů">
    <meta property="og:description" content="Porovnejte ceny za gram proteinu v kategorii ${categoryName.toLowerCase()}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="http://46.62.166.240/protein-hunter/kategorie/${categorySlug}.html">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="text-sm">
            <a href="/protein-hunter/" class="text-gray-500 hover:text-primary">Domů</a>
            <span class="mx-2 text-gray-400">/</span>
            <a href="/protein-hunter/produkty/" class="text-gray-500 hover:text-primary">Produkty</a>
            <span class="mx-2 text-gray-400">/</span>
            <span class="text-gray-900 font-medium">${categoryName}</span>
        </nav>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">${categoryName}</h1>
            <p class="text-xl text-gray-600">
                ${categoryProducts.length} produktů v kategorii ${categoryName.toLowerCase()} seřazených podle nejlepšího poměru cena/protein.
                ${categoryProducts.length > 0 ? `Nejlevnější protein: ${categoryProducts[0].pricePerGramProtein.toFixed(2)} Kč/g.` : ''}
            </p>
        </div>
        
        ${categoryProducts.length > 0 ? `
        <!-- Category stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-4 rounded-lg shadow text-center">
                <div class="text-2xl font-bold text-primary">${categoryProducts.length}</div>
                <div class="text-sm text-gray-600">Produktů</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow text-center">
                <div class="text-2xl font-bold text-green-600">${categoryProducts[0].pricePerGramProtein.toFixed(2)} Kč</div>
                <div class="text-sm text-gray-600">Nejlevnější protein/g</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow text-center">
                <div class="text-2xl font-bold text-blue-600">${Math.max(...categoryProducts.map(p => p.proteinPer100g)).toFixed(1)}g</div>
                <div class="text-sm text-gray-600">Nejvíce protein/100g</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow text-center">
                <div class="text-2xl font-bold text-purple-600">${(categoryProducts.reduce((sum, p) => sum + p.pricePerGramProtein, 0) / categoryProducts.length).toFixed(2)} Kč</div>
                <div class="text-sm text-gray-600">Průměr Kč/g</div>
            </div>
        </div>
        
        <!-- Products list -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
                <h2 class="text-xl font-semibold">📊 Všechny produkty seřazené podle ceny</h2>
            </div>
            <div class="divide-y divide-gray-100">
                ${categoryProducts.map((product, index) => `
                    <div class="p-4 hover:bg-gray-50 transition-colors">
                        <a href="/protein-hunter/produkty/${product.slug}.html" class="block">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="text-center">
                                        <div class="text-xl">${index < 3 ? ['🏆', '🥈', '🥉'][index] : `#${index + 1}`}</div>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-primary hover:underline">${product.name}</h3>
                                        <div class="text-sm text-gray-600">
                                            <span>${product.price} Kč • ${product.weight >= 1000 ? (product.weight/1000).toFixed(1) + ' kg' : product.weight + ' g'}</span>
                                            <span class="mx-1">•</span>
                                            <span>${product.proteinPer100g}g protein/100g</span>
                                            <span class="mx-1">•</span>
                                            <span class="font-medium">${product.totalProtein}g celkem</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-primary">${product.pricePerGramProtein.toFixed(2)} Kč</div>
                                    <div class="text-xs text-gray-500">za 1g proteinu</div>
                                </div>
                            </div>
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : `
        <div class="bg-white rounded-lg shadow p-8 text-center">
            <div class="text-gray-400 text-6xl mb-4">📭</div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Zatím žádné produkty</h2>
            <p class="text-gray-600">V kategorii ${categoryName.toLowerCase()} zatím nemáme žádné produkty.</p>
            <a href="/protein-hunter/produkty/" class="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                Prohlédnout všechny produkty
            </a>
        </div>
        `}
        
        <!-- Related categories -->
        <div class="mt-12 bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">🔗 Další kategorie</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${Object.entries(categoryNames).filter(([slug]) => slug !== categorySlug && slug !== 'other').map(([slug, name]) => `
                    <a href="/protein-hunter/kategorie/${slug}.html" class="p-3 border rounded-lg hover:shadow-md transition-shadow text-center">
                        <div class="font-medium text-primary">${name}</div>
                        <div class="text-sm text-gray-500">${productsData.filter(p => p.category === slug).length} produktů</div>
                    </a>
                `).join('')}
            </div>
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

    fs.writeFileSync(`kategorie/${categorySlug}.html`, categoryHtml);
    console.log(`Generated: kategorie/${categorySlug}.html`);
});

// Generate comparison pages
console.log('Generating comparison pages...');
if (!fs.existsSync('porovnani')) {
    fs.mkdirSync('porovnani', { recursive: true });
}

// Generate top 20 comparisons (most interesting product pairs)
const topComparisons = [
    { product1: 'tvaroh-polotucny-pilos', product2: 'cottage-cheese-pribinacek', reason: 'Porovnání dvou nejlevnějších mléčných proteinů' },
    { product1: 'kureci-prsa', product2: 'kruti-prsa', reason: 'Kuřecí vs krůtí - co je lepší?' },
    { product1: 'whey-protein-nutrend', product2: 'beef-protein', reason: 'Syrovátkový vs hovězí protein' },
    { product1: 'tofu-lunter', product2: 'tempeh', reason: 'Tofu vs tempeh - rostlinné proteiny' },
    { product1: 'cerne-fazole', product2: 'quinoa-bila', reason: 'Fazole vs quinoa - který je lepší?' },
    { product1: 'losos-norsky-filet', product2: 'tunak-v-oleji', reason: 'Losos vs tuňák - omega-3 souboj' },
    { product1: 'recky-jogurt-0-milko', product2: 'proteinovy-jogurt-danone', reason: 'Řecký jogurt vs proteinový jogurt' },
    { product1: 'arasidove-maslo', product2: 'tahini-pasta', reason: 'Arašídové máslo vs tahini' },
    { product1: 'ovesne-vlocky-jemne', product2: 'quinoa-bila', reason: 'Ovesné vločky vs quinoa' },
    { product1: 'mandlova-mouka', product2: 'kokosova-mouka', reason: 'Mandlová vs kokosová mouka' }
];

topComparisons.forEach(comp => {
    const prod1 = productsData.find(p => p.slug === comp.product1);
    const prod2 = productsData.find(p => p.slug === comp.product2);

    if (!prod1 || !prod2) return;

    const compSlug = `${prod1.slug}-vs-${prod2.slug}`;
    const protein1Per100 = prod1.proteinPer100g;
    const protein2Per100 = prod2.proteinPer100g;
    const price1PerProtein = (prod1.price / prod1.weight / protein1Per100 * 100).toFixed(2);
    const price2PerProtein = (prod2.price / prod2.weight / protein2Per100 * 100).toFixed(2);

    const comparisonHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prod1.name} vs ${prod2.name} - Porovnání proteinu a ceny | Protein Hunter</title>
    <meta name="description" content="${comp.reason}. Detailní porovnání obsahu proteinu, ceny za gram a nutriční hodnoty mezi ${prod1.name} a ${prod2.name}.">
    <meta name="keywords" content="${prod1.name}, ${prod2.name}, porovnání, protein, cena, nutriční hodnoty">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <main class="max-w-7xl mx-auto px-4 py-12">
        <!-- Header -->
        <div class="mb-8">
            <nav class="text-sm text-gray-500 mb-4">
                <a href="/protein-hunter/" class="hover:text-primary">Domů</a>
                <span class="mx-2">/</span>
                <a href="/protein-hunter/porovnani/" class="hover:text-primary">Porovnání</a>
                <span class="mx-2">/</span>
                <span>${prod1.name} vs ${prod2.name}</span>
            </nav>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">⚖️ ${prod1.name} vs ${prod2.name}</h1>
            <p class="text-xl text-gray-600">${comp.reason}</p>
        </div>

        <!-- Quick Comparison -->
        <div class="grid md:grid-cols-2 gap-6 mb-12">
            <!-- Product 1 -->
            <div class="bg-white rounded-lg shadow-lg p-6 ${protein1Per100 > protein2Per100 ? 'ring-2 ring-primary' : ''}">
                ${protein1Per100 > protein2Per100 ? '<div class="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">🏆 Více proteinu</div>' : ''}
                <h2 class="text-2xl font-bold mb-4">${prod1.name}</h2>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Protein na 100g:</span>
                        <span class="font-bold text-lg">${protein1Per100}g</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cena:</span>
                        <span class="font-bold">${prod1.price} Kč</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Hmotnost:</span>
                        <span class="font-bold">${prod1.weight}g</span>
                    </div>
                    <div class="flex justify-between border-t pt-3">
                        <span class="text-gray-600">Cena za 1g proteinu:</span>
                        <span class="font-bold text-primary">${price1PerProtein} Kč</span>
                    </div>
                </div>
                <a href="/protein-hunter/produkty/${prod1.slug}.html" class="block mt-6 text-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                    Detail produktu →
                </a>
            </div>

            <!-- Product 2 -->
            <div class="bg-white rounded-lg shadow-lg p-6 ${protein2Per100 > protein1Per100 ? 'ring-2 ring-primary' : ''}">
                ${protein2Per100 > protein1Per100 ? '<div class="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">🏆 Více proteinu</div>' : ''}
                <h2 class="text-2xl font-bold mb-4">${prod2.name}</h2>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Protein na 100g:</span>
                        <span class="font-bold text-lg">${protein2Per100}g</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cena:</span>
                        <span class="font-bold">${prod2.price} Kč</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Hmotnost:</span>
                        <span class="font-bold">${prod2.weight}g</span>
                    </div>
                    <div class="flex justify-between border-t pt-3">
                        <span class="text-gray-600">Cena za 1g proteinu:</span>
                        <span class="font-bold text-primary">${price2PerProtein} Kč</span>
                    </div>
                </div>
                <a href="/protein-hunter/produkty/${prod2.slug}.html" class="block mt-6 text-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                    Detail produktu →
                </a>
            </div>
        </div>

        <!-- Winner -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 mb-12">
            <h2 class="text-2xl font-bold mb-4">🏆 Verdikt</h2>
            <div class="prose max-w-none">
                <p class="text-lg mb-4">
                    <strong>${parseFloat(price1PerProtein) < parseFloat(price2PerProtein) ? prod1.name : prod2.name}</strong>
                    vyhrává v poměru cena/protein s hodnotou
                    <strong>${Math.min(parseFloat(price1PerProtein), parseFloat(price2PerProtein)).toFixed(2)} Kč za gram proteinu</strong>.
                </p>
                <p class="text-gray-700">
                    ${protein1Per100 > protein2Per100 ?
                        `${prod1.name} obsahuje více proteinu (${protein1Per100}g vs ${protein2Per100}g na 100g).` :
                        `${prod2.name} obsahuje více proteinu (${protein2Per100}g vs ${protein1Per100}g na 100g).`
                    }
                </p>
            </div>
        </div>

        <!-- More Comparisons -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">🔍 Další porovnání</h2>
            <div class="grid md:grid-cols-2 gap-4">
                ${topComparisons.filter(c => c.product1 !== comp.product1 && c.product2 !== comp.product2).slice(0, 4).map(c => {
                    const p1 = productsData.find(p => p.slug === c.product1);
                    const p2 = productsData.find(p => p.slug === c.product2);
                    if (!p1 || !p2) return '';
                    return `<a href="/protein-hunter/porovnani/${p1.slug}-vs-${p2.slug}.html" class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div class="font-medium">${p1.name} vs ${p2.name}</div>
                        <div class="text-sm text-gray-500">${c.reason}</div>
                    </a>`;
                }).join('')}
            </div>
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

    fs.writeFileSync(`porovnani/${compSlug}.html`, comparisonHtml);
    console.log(`Generated: porovnani/${compSlug}.html`);
});

// Generate comparison index page
const comparisonIndexHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Porovnání proteinových potravin - ${topComparisons.length} detailních srovnání | Protein Hunter</title>
    <meta name="description" content="Přímá porovnání ${topComparisons.length} nejoblíbenějších proteinových potravin. Zjistěte, který produkt nabízí nejlepší poměr cena/protein.">
    <meta name="keywords" content="porovnání proteinů, srovnání cen, protein, fitness, výživa">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    ${getNavigation()}

    <main class="max-w-7xl mx-auto px-4 py-12">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">⚖️ Porovnání proteinových potravin</h1>
            <p class="text-xl text-gray-600">
                Přímá souboje nejoblíbenějších proteinových potravin. Zjistěte, který produkt vítězí v poměru cena/protein.
            </p>
        </div>

        <!-- Comparisons Grid -->
        <div class="grid md:grid-cols-2 gap-6">
            ${topComparisons.map(comp => {
                const prod1 = productsData.find(p => p.slug === comp.product1);
                const prod2 = productsData.find(p => p.slug === comp.product2);
                if (!prod1 || !prod2) return '';

                const winner = prod1.pricePerGramProtein < prod2.pricePerGramProtein ? prod1 : prod2;

                return `
                <a href="/protein-hunter/porovnani/${comp.product1}-vs-${comp.product2}.html" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="mb-4">
                        <span class="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                            ${comp.reason}
                        </span>
                    </div>

                    <div class="flex items-center justify-between mb-4">
                        <div class="text-center flex-1">
                            <h3 class="font-bold text-lg mb-2">${prod1.name}</h3>
                            <div class="text-2xl font-bold ${prod1.pricePerGramProtein < prod2.pricePerGramProtein ? 'text-green-600' : 'text-gray-600'}">
                                ${prod1.pricePerGramProtein.toFixed(2)} Kč
                            </div>
                            <div class="text-sm text-gray-500">za 1g proteinu</div>
                        </div>

                        <div class="text-3xl font-bold mx-4 text-gray-400">VS</div>

                        <div class="text-center flex-1">
                            <h3 class="font-bold text-lg mb-2">${prod2.name}</h3>
                            <div class="text-2xl font-bold ${prod2.pricePerGramProtein < prod1.pricePerGramProtein ? 'text-green-600' : 'text-gray-600'}">
                                ${prod2.pricePerGramProtein.toFixed(2)} Kč
                            </div>
                            <div class="text-sm text-gray-500">za 1g proteinu</div>
                        </div>
                    </div>

                    <div class="text-center pt-4 border-t">
                        <div class="text-sm font-medium text-gray-700">
                            🏆 Vítěz: <span class="text-primary">${winner.name}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            Úspora: ${Math.abs(prod1.pricePerGramProtein - prod2.pricePerGramProtein).toFixed(2)} Kč/g
                        </div>
                    </div>
                </a>
                `;
            }).join('')}
        </div>

        <!-- CTA Section -->
        <div class="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 text-center">
            <h2 class="text-2xl font-bold mb-4">💡 Chcete porovnat jiné produkty?</h2>
            <p class="text-gray-700 mb-6">Prohlédněte si celou databázi produktů a najděte nejlepší zdroje proteinu pro vaše potřeby.</p>
            <a href="/protein-hunter/produkty/" class="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors">
                📊 Všechny produkty
            </a>
        </div>
    </main>

    ${getFooter()}
</body>
</html>`;

fs.writeFileSync('porovnani/index.html', comparisonIndexHtml);
console.log('Generated: porovnani/index.html');

console.log('✅ Programmatic SEO pages generated successfully!');
console.log(`📊 Generated ${productsData.length} product pages + 1 index page`);
console.log(`🍽️ Generated ${recipesData.length + Object.keys(recipeCategories).length} recipe pages`);
console.log(`📚 Generated ${dictionaryTerms.length + 1} dictionary pages (${dictionaryTerms.length} terms + 1 index)`);
console.log(`📝 Generated ${blogArticles.length + 1} blog pages (${blogArticles.length} articles + 1 index)`);
console.log(`⚖️ Generated ${topComparisons.length} comparison pages`);
console.log(`🗂️ Generated ${Object.keys(categoryNames).length - 1} category pages`);
console.log('🌐 Each page has unique URLs, meta tags, and Schema.org markup');

// Calculate total pages
const totalPages = productsData.length + 1 + // products + index
                  recipesData.length + Object.keys(recipeCategories).length + 1 + // recipes + categories + index
                  dictionaryTerms.length + 1 + // dictionary terms + index
                  blogArticles.length + 1 + // blog articles + index
                  topComparisons.length + 1 + // comparison pages + index
                  Object.keys(categoryNames).length - 1; // categories (excluding 'other')

console.log(`🚀 TOTAL: ${totalPages} SEO-optimized pages generated!`);