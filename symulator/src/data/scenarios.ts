// src/data/scenarios.ts
// Kompletna baza wiedzy i scenariuszy do egzaminu z fizykoterapii
// Zawiera wszystkie 8 działów zabiegowych z PDF-a + notatek (Sollux, Laser, Światło spolaryzowane, Krioterapia, Ciepłolecznictwo, Ultradźwięki/Ultrafonoforeza, Magnetoterapia, Magnetostymulacja)
// oraz wszystkie 20 okolic anatomicznych z pozycjami ułożeniowymi, topografią palpacyjną i strefami omijania.

export type PhaseType = 'ostry' | 'podostry' | 'przewlekly';

export interface ModalityData {
  id: string;
  name: string;
  category: string;
  mechanismsAndLaws: string[];
  parameters: {
    label: string;
    values: string;
  }[];
  methodology: string[];
  indications: string[];
  contraindications: string[];
  specialRules?: string[];
}

export interface AnatomicalLocation {
  id: string;
  name: string;
  regionGroup: 'głowa_szyja' | 'kregoslup' | 'konczyna_gorna' | 'konczyna_dolna';
  svgView: 'front' | 'back' | 'side';
  svgCoords: { x: number; y: number; pathType: 'point' | 'c-arc' | 'paraspinal' | 'stripes' | 'area' };
  commonPathologies: {
    name: string;
    typicalPhases: PhaseType[];
  }[];
  patientPosition: string;
  palpationLandmarks: string;
  applicationTechnique: string;
  zonesToAvoid: string[];
}

export interface PatientScenario {
  id: string;
  patientName: string;
  age: number;
  gender: 'K' | 'M';
  modalityId: string;
  locationId: string;
  diagnosis: string;
  phase: PhaseType;
  daysSinceOnset: string;
  medicalHistory: string;
  isContraindicated: boolean;
  contraindicationReason?: string;
  requiresDoseModification?: boolean;
  modificationReason?: string;
}

export const MODALITIES_DB: Record<string, ModalityData> = {
  sollux: {
    id: 'sollux',
    name: 'Promieniowanie IR / Lampa Sollux',
    category: 'Światłolecznictwo',
    mechanismsAndLaws: [
      'Prawo Grotthusa-Drapera: skutki biologiczne w tkankach wywołuje tylko energia pochłoniętego promieniowania.',
      'Prawo Dastre-Morata: bodźce termiczne działające na dużą powierzchnię skóry (≥50%) powodują przeciwne do naczyń skóry zachowanie dużych naczyń klatki piersiowej i jamy brzusznej (nerki, śledziona, mózg reagują tak samo jak skóra).',
      'Rumień cieplny: pojawia się w trakcie naświetlania, narasta z czasem, jest nierównomierny i plamisty (rozszerzenie głębszych naczyń), znika po 1–2 godzinach.',
      'Im krótsza fala, tym głębsza penetracja (krótkofalowe 770–1500 nm do 10 mm; długofalowe 4000–15000 nm od 0,5 do 3 mm). Im wyższa temperatura źródła, tym krótsza fala.',
      'Efekty miejscowe: rozszerzenie naczyń włosowatych, obniżenie napięcia mięśni, podwyższenie progu bólu, pobudzenie receptorów cieplnych skóry i reakcje odruchowe w narządach wewnętrznych. Na odczyn wpływają: intensywność źródła, czas, wielkość powierzchni, tolerancja miejscowa i osobnicza.',
      'Odczyny ogólne (IR na dużą powierzchnię skóry): przyspieszone tętno, wzrost ciepłoty ciała, przejściowa utrata masy (pocenie), usprawnienie obiegu krwi, obniżenie napięcia mięśni, przyspieszenie oddechu; przy przegrzaniu spada czynność nerek.',
      'Generatory: nieświetlne (długo- i średniofalowe) oraz świetlne – żarówki węglowe (do 70 W, promień długofalowy) i wolframowe (200–1500 W, promień krótkofalowy, np. lampa Sollux).'
    ],
    parameters: [
      { label: 'Zakres długości fali IR', values: '770 – 15 000 nm (żarówki wolframowe 200–1500 W – promień krótkofalowy; węglowe do 70 W – długofalowy)' },
      { label: 'Filtr niebieski', values: 'Obkurcza naczynia, płytka penetracja (do 3 mm), łagodzi ból. Wskazany w: zaburzeniach naczynioruchowych, nerwobólach, przeczulicy, odmrożeniach, stanach pourazowych, I okresie porażenia n. VII.' },
      { label: 'Filtr czerwony', values: 'Ogranicza skutek biologiczny, rozgrzewa. Wskazany w: przewlekłych stanach zapalnych tkanek miękkich, trudno gojących się ranach, po UV, przed kinezyterapią, w II okresie porażenia n. VII.' },
      { label: 'Odległość i czas – miejscowo', values: '30 – 60 cm od ciała, czas 10 – 15 min (codziennie)' },
      { label: 'Odległość i czas – ogólnie', values: '100 – 120 cm od ciała, czas 20 – 30 min (codziennie)' },
      { label: 'Odległość i czas – twarz (porażenie n. VII)', values: '10 – 20 cm od ciała, czas 10 – 15 min, codziennie, seria 10 – 20 zabiegów' },
      { label: 'Kąt padania', values: '90° w stosunku do pola zabiegowego (maksymalne natężenie)' },
      { label: 'Faza procesu chorobowego', values: 'Stan ostry (do 3–4 dni po urazie) = ostry stan zapalny – PRZECIWWSKAZANIE (wyjątek: I okres porażenia n. VII – filtr niebieski). Stan podostry (po 3–4 dniach) i przewlekły – naświetlanie wskazane: filtr czerwony w przewlekłych stanach zapalnych, niebieski przy bólu, przeczulicy, odmrożeniach. Dawka zawsze subiektywna (przyjemne ciepło).' },
      { label: 'Zagrożenia', values: 'Uszkodzenie wzroku oraz oparzenia cieplne (nierównomierne rozproszenie światła, nieprzestrzeganie BHP, zwiększona wrażliwość tkanek)' }
    ],
    methodology: [
      'Wygodna, stała pozycja pacjenta, okolica naświetlana całkowicie odsłonięta.',
      'Skóra czysta, bez maści i zanieczyszczeń.',
      'Obowiązkowe okulary ochronne przy naświetlaniu twarzy, górnej części klatki piersiowej, barku i szyi z przodu.',
      'Dawkę określamy subiektywnie (odczucie przyjemnego ciepła); pacjent musi zgłaszać wszelkie dolegliwości (ryzyko oparzeń cieplnych i uszkodzenia wzroku).',
      'Kwalifikacja stanu: pytamy pacjenta, ile czasu minęło od urazu – stan ostry trwa do 3–4 dni, później przechodzi w podostry.',
      'Porażenie nerwu twarzowego: w I okresie filtr niebieski, w II okresie filtr czerwony; odległość 10–20 cm, 10–15 min codziennie, seria 10–20 zabiegów (poprawa trofiki tkanek).'
    ],
    indications: [
      'Przewlekłe stany zapalne zatok, stawów, tkanek okołostawowych i tkanek miękkich',
      'Stany po urazach narządu ruchu',
      'Zespoły bólowe i nerwobóle (np. porażenie nerwu twarzowego)',
      'Oparzenia, odmrożenia, stany po przebytym bakteryjnym zapaleniu skóry',
      'Przygotowanie (ogrzanie tkanek) przed masażem, ćwiczeniami lub innymi zabiegami fizykalnymi'
    ],
    contraindications: [
      'Ostry stan zapalny, obrzęki',
      'Skłonność do krwawień',
      'Gorączka, gruźlica',
      'Żylaki, choroby układu krążenia, nadciśnienie tętnicze II stopnia',
      'Zarostowe schorzenia naczyń, zakrzepowe zapalenie żył, rozszerzone naczynia krwionośne, zaburzenia ukrwienia naczyń obwodowych',
      'Choroby nerek, wątroby, niedokrwistość',
      'Choroby nowotworowe, choroba wrzodowa',
      'Stan ogólnego wyniszczenia organizmu'
    ]
  },

  laser: {
    id: 'laser',
    name: 'Laseroterapia niskoenergetyczna (LLLT)',
    category: 'Światłolecznictwo',
    mechanismsAndLaws: [
      'Cechy promieniowania laserowego: monochromatyczność (jedna długość fali), spójność (koherencja w przestrzeni i czasie), równoległość (mała rozbieżność), intensywność.',
      'Reguła Arndta-Schultza: słabe bodźce podtrzymują procesy życiowe, średnie pobudzają, silne hamują lub wywołują reakcje paradoksalne, bardzo silne znoszą procesy życiowe.',
      'Działanie: wzrost syntezy DNA/RNA, wzrost liczby mitochondriów, wzrost zawartości wapnia i gęstości beleczek kostnych, usprawnienie odpływu limfy, aktywacja limfocytów T, wyrzut endorfin.'
    ],
    parameters: [
      { label: 'Sonda czerwona (R)', values: 'Długość fali 500 – 760 nm, moc 30 – 60 mW (płytka penetracja – skóra i błony śluzowe)' },
      { label: 'Sonda podczerwona (IR)', values: 'Długość fali 800 – 950 nm, moc 50, 100, 200, 300, 400 lub 500 mW (głęboka penetracja – mięśnie, stawy, ścięgna, nerwy; w LLLT nie przekracza się 500 mW)' },
      { label: 'Dawka – stan ostry (do 3–4 dni)', values: '0,1 – 3 J/cm²' },
      { label: 'Dawka – stan podostry', values: '3 – 6 J/cm²' },
      { label: 'Dawka – stan przewlekły', values: '6 – 12 J/cm²' },
      { label: 'Limit dawki i modyfikacja wiekowa', values: 'Ogólna dawka jednorazowa max 200 J. U dzieci i osób w podeszłym wieku dawkę zmniejszamy o 30 – 60%!' },
      { label: 'Częstotliwość impulsów', values: '1 – 10 000 Hz (w stanach ostrych niższe częstotliwości; w przewlekłych wyższe, szczególnie do 5000 Hz, lub fala ciągła – constans)' },
      { label: 'Wzór na energię / czas', values: 'Ep = (P × t) / S (im większa moc P, tym krótszy czas zabiegu t)' },
      { label: 'Podział laserów', values: 'Wg mocy: małej mocy 1–6 mW, średniej mocy 7–500 mW, dużej mocy >500 mW (LLLT nie przekracza 500 mW). Wg długości fali: UV (<400 nm), światło widzialne (400–780 nm), podczerwień (>780 nm).' }
    ],
    methodology: [
      'Metoda kontaktowa (bezpośredni dotyk odtłuszczoną i zdezynfekowaną sondą pod kątem 90° – ogranicza straty energii) lub bezkontaktowa (odległość 5–10 mm od skóry).',
      'Technika stabilna (punktowa – punkty spustowe, motoryczne, akupunkturowe) lub labilna (skaning / przemiatanie ręczne lub automatyczne – część energii ulega odbiciu). Pole musi być suche.',
      'BHP: zdezynfekowane okulary ochronne z osłonkami bocznymi (ochrona przed świerzbem) dla wszystkich w pomieszczeniu; nie nakładać na okulary korekcyjne. Terapeuta bez metalowych ozdób. Ściany matowe, jasne.'
    ],
    indications: [
      'Ostre, podostre i przewlekłe stany zapalne tkanek miękkich, stawów i tkanek okołostawowych',
      'Obrzęki, trudno gojące się rany, odleżyny, blizny',
      'Porażenie nerwu twarzowego, nerwobóle',
      'Uszkodzenia tkanki kostnej (pęknięcia, złamania – przyspieszenie zrostu)'
    ],
    contraindications: [
      'Choroba nowotworowa',
      'Ciąża',
      'Nadczynność tarczycy',
      'Naświetlanie gałek ocznych',
      'Gorączka',
      'Stosowanie leków sterydowych (ryzyko odbarwień i reakcji niepożądanych)',
      'Ostre choroby bakteryjne, wirusowe i grzybicze'
    ],
    specialRules: ['U dzieci i osób starszych redukcja dawki o 30–60%.']
  },

  polarized_light: {
    id: 'polarized_light',
    name: 'Światło spolaryzowane (np. Bioptron)',
    category: 'Światłolecznictwo',
    mechanismsAndLaws: [
      'Światło polichromatyczne (480 – 3400 nm – widzialne i część podczerwieni, bez UV), niekoherentne (niezsynchronizowane), o niskiej gęstości energii.',
      'Łagodna biostymulacja biologiczna: odnowa komórek, poprawa mikrokrążenia, wzmocnienie komórek odpornościowych.'
    ],
    parameters: [
      { label: 'Zakres widma', values: '480 – 3400 nm (brak promieniowania UV)' },
      { label: 'Odległość i kąt padania', values: '10 cm od ciała, strumień prostopadle (90°) do pola zabiegowego' },
      { label: 'Czas i częstotliwość', values: '4 – 10 min na punkt, 1x lub 2x dziennie (duże powierzchnie naświetlamy punkt po punkcie)' },
      { label: 'Faza procesu chorobowego', values: 'Metoda łagodna (biostymulacja, niska gęstość energii) – w bazie bez ograniczeń fazowych; jedyne przeciwwskazania to gorączka i choroba nowotworowa. Stosowana w stanach po urazach i operacjach (rany pooperacyjne, blizny) oraz w dolegliwościach przewlekłych (kręgosłup, stawy).' },
      { label: 'Efekty biologiczne', values: 'Odnowa komórek, poprawa mikrokrążenia i krążenia, wzmocnienie pracy komórek odpornościowych' }
    ],
    methodology: [
      'Skóra dokładnie oczyszczona.',
      'Lampa ustawiona w odległości 10 cm pod kątem 90°.',
      'Przy dużych obszarach opracowujemy pole punkt po punkcie aż do pokrycia całej powierzchni.'
    ],
    indications: [
      'Bliznowce, rany pooperacyjne, oparzenia, odmrożenia, odleżyny, dermatozy, opryszczka, półpasiec, starzenie się skóry',
      'Ból kręgosłupa, dyskopatia, zapalenie korzeni nerwowych, bóle neuralgiczne i mięśniowe',
      'Choroby stawów, choroba Buergera, żylaki, stopa cukrzycowa, depresja sezonowa'
    ],
    contraindications: [
      'Gorączka',
      'Choroba nowotworowa'
    ]
  },

  cryotherapy: {
    id: 'cryotherapy',
    name: 'Krioterapia (miejscowa i ogólna)',
    category: 'Termoterapia – zimno',
    mechanismsAndLaws: [
      'Dwufazowa reakcja naczyniowa: początkowy skurcz naczyń skóry i tkanki podskórnej (przesunięcie krwi do głębszych struktur), następnie wtórne miejscowe przekrwienie czynne.',
      'Zwolnienie i pogłębienie oddechu, wzrost przemiany materii, wzmożenie czynności nerek, zahamowanie pocenia, zmniejszenie obrzęków, wyrzut endorfin, obniżenie napięcia mięśniowego.'
    ],
    parameters: [
      { label: 'Ciekły azot (suche zimno – świetne w RZS)', values: 'Temp. par (-100°C do -180°C), odległość dyszy 10–15 cm, ruchy okrężne/omiatające, czas 30 s – 3 min (stawy 3 min; max 12 min łącznie przy kilku okolicach)' },
      { label: 'Nawiew zimnym powietrzem (wilgotne zimno)', values: 'Temp. gazu -30°C, odległość dyszy 5–20 cm, ciągły ruch dyszą, czas nieco dłuższy niż przy azocie' },
      { label: 'Ciekły CO2', values: 'Temp. wylotu dyszy -70°C, ruch dynamiczny dyszą' },
      { label: 'Zabiegi z lodem i zimną wodą', values: 'Woreczki z lodem na bawełnianym podkładzie (1 min do rozpuszczenia); masaż lodem – zamrożona woda w plastikowym pojemniku (3–5 min); częściowa kąpiel w wodzie z lodem (1–3 min, wielokrotne zanurzanie); kompresy żelowe typu Coldpack; polewanie wodą 15–20°C (3–5 min; ostre stany zapalne, użądlenia)' },
      { label: 'Kriokomora (krioterapia ogólna)', values: 'Temp. lecznicza -70°C do -110°C (max -176°C). Kwalifikacja lekarska, ubiór ochronny (trepy, strój bawełniany, skarpety, czapka/opaska, rękawice, maska), ciągły ruch w komorze, po wyjściu obowiązkowe 30 min kinezyterapii!' },
      { label: 'Faza procesu chorobowego', values: 'Stan ostry i podostry (do 5 dni po urazie): wskazana – zmniejsza obrzęk i stan zapalny (urazy, skręcenia, zwichnięcia, złamania, świeże oparzenia). Stan przewlekły: stany bólowe w chorobie zwyrodnieniowej, RZS, artropatii łuszczycowej, dyskopatie, nerwobóle obwodowe, wzmożone napięcie mięśniowe i SM. Przy kilku okolicach łączny czas nawiewu azotem max 12 min.' }
    ],
    methodology: [
      'Nie wykonujemy zabiegu u pacjenta zziębniętego ani ze złym samopoczuciem; w gabinecie temp. pokojowa.',
      'Unikamy aplikacji bezpośrednio nad wystającymi elementami kostnymi.',
      'OBJAWY PRZERWANIA ZABIEGU: zblednięcie skóry, silne plamy, objaw „pomarańczowej skórki”, zaszronienie skóry, skargi na ból/pieczenie.'
    ],
    indications: [
      'Stany po urazach i przeciążeniach (do 5 dni po urazie), złamania, skręcenia, zwichnięcia i obrzęki pourazowe',
      'Oparzenia (świeże)',
      'Dyskopatie, nerwobóle nerwów obwodowych, wzmożone napięcie mięśniowe, stwardnienie rozsiane (SM)',
      'Choroby zwyrodnieniowe stawów, RZS, artropatia łuszczycowa'
    ],
    contraindications: [
      'Nadwrażliwość na zimno oraz choroby wywoływane przez zimno (np. zespół Raynauda)',
      'Zespół Sudecka',
      'Zmiany skórne popromienne, uszkodzenia skóry, odmrożenia',
      'Nadczynność tarczycy',
      'Miażdżyca zaawansowana',
      'Zapalenie pęcherza moczowego i zapalenie miedniczek nerkowych',
      'Stany ogólnego wyniszczenia i osłabienia',
      'DLA KRIOKOMORY BEZWZGLĘDNIE: wysokie / nieustabilizowane ciśnienie tętnicze krwi'
    ]
  },

  thermotherapy: {
    id: 'thermotherapy',
    name: 'Ciepłolecznictwo (parafina, piasek, termofor, fango, sauna)',
    category: 'Termoterapia – ciepło',
    mechanismsAndLaws: [
      'Podział zabiegów: ciepło suche (suche ogrzane powietrze – suszarka, grzałka, termofor), ciepło wilgotne (para wodna – sauna, wapozon) oraz zabiegi cieplne (parafina, maski rozgrzewające, fango, parafango, gorący piasek).',
      'Prawo Dastre-Morata: rozszerzenie naczyń skóry na dużej powierzchni powoduje zwężenie dużych naczyń klatki piersiowej i jamy brzusznej (nerki, śledziona, mózg reagują jak skóra).',
      'Drogi wymiany ciepła: promieniowanie 60%, parowanie 35%, przewodzenie (kondukcja) 12%, przenoszenie (konwekcja) 12%.',
      'Poprawa ukrwienia, rozciągliwości kolagenu, lepkości mazi stawowej (wzrost ruchomości), obniżenie napięcia mięśni, działanie przeciwbólowe i przeciwzapalne w stanach przewlekłych.'
    ],
    parameters: [
      { label: 'Parafina – kąpiel częściowa (ręce/stopy)', values: 'Temp. ok. 53–54°C, czas 30–40 min (pacjent cały czas porusza kończyną)' },
      { label: 'Parafina – okłady pędzlem i zawijania', values: 'Temp. do 60°C (nakładamy warstwami do 1–2 cm; przy zawijaniu kompresy gazowe 12×50 cm, 2–3 warstwy), okrywamy ceratą i flanelą, czas 20–30 min' },
      { label: 'Parafina – rękawiczki / skarpety', values: 'Temp. 54°C (zanurzanie na 0,5–1 s wielokrotnie do grubości 2 cm), czas 30 min' },
      { label: 'Maseczka parafinowa (porażenie n. VII)', values: 'Temp. poniżej 45°C! Nakładana na kilka warstw gazy; oczy i uszy zabezpieczone grubą warstwą gazy' },
      { label: 'Termofor', values: 'Woda do 2/3 objętości, usunięte powietrze znad wody, szczelnie zakręcony, kontrola temperatury przez przyłożenie do policzka, okolicę przykrywamy suchym bawełnianym ręcznikiem, a całość wełnianą tkaniną' },
      { label: 'Gorący piasek', values: 'Miejscowo: piasek wydezynfekowany w 100°C, do zabiegu podgrzany do 40–46°C, w woreczku na pole zabiegowe. Kąpiele całkowite: wanna drewniana lub z tworzywa, 40–45°C, zanurzenie do łuków żebrowych (duża siła działania – tylko zdrowe serce i układ krążenia!)' },
      { label: 'Fango i parafango', values: 'Fango – szlam wulkaniczny; parafango – mieszanka parafiny i sproszkowanego fango. Stosowane jako okłady częściowe lub kąpiele' },
      { label: 'Parafina – temperatura wg okolicy', values: 'Kończyny 53–54°C; tułów / ciało max 60°C; twarz poniżej 45°C. Parafina biała: temp. topnienia 40–50°C, wrzenia 250°C' },
      { label: 'Sauna', values: 'Temp. 40°C przy posadzce, 40–50°C poziom I, 60°C poziom II, 70–80°C poziom III. Przed wejściem: opróżnić pęcherz, umyć i dokładnie osuszyć ciało' }
    ],
    methodology: [
      'Przed zabiegiem zawsze sprawdzamy czucie powierzchowne (temperatura) u pacjenta!',
      'Skóra umyta i osuszona; miejsca owłosione smarujemy wazeliną.',
      'Parafinę zabiegową przygotowujemy dodając 20–40 g parafiny płynnej na 1 kg parafiny stałej białej.',
      'Fazy procesu: ciepło stosujemy w stanach przewlekłych i po ustąpieniu okresu ostrego (RZS w okresie przewlekłym, zmiany zwyrodnieniowe, stany pourazowe po okresie ostrym, po ustąpieniu ostrego zapalenia nerwów obwodowych). W stanie ostrym – obrzęki i ostre stany zapalne – ciepło jest PRZECIWWSKAZANE.'
    ],
    indications: [
      'Przewlekłe choroby narządu ruchu (RZS w okresie przewlekłym, choroba zwyrodnieniowa stawów, stany pourazowe po okresie ostrym)',
      'Choroby układu nerwowego (rwa kulszowa, rwa ramienna, porażenie nerwu twarzowego – maseczki parafinowe, po ustąpieniu okresu ostrego zapalenia nerwów obwodowych)',
      'Choroby układu oddechowego (nieżyt gardła, oskrzeli, krtani), trawiennego (przewlekłe zapalenie pęcherzyka żółciowego, spastyczne zapalenie jelita grubego) i dróg moczowych (kamica nerkowa, przewlekłe zapalenia)',
      'Przewlekłe stany zapalne narządów rodnych, dna moczanowa, otyłość, trądzik, czyraczność, przykurcze stawowe i blizny'
    ],
    contraindications: [
      'Ostre stany zapalne, obrzęki niezależnie od etiologii',
      'Niewydolność krążenia, stany pozawałowe, choroba nadciśnieniowa, rozszerzone naczynka',
      'Gruźlica',
      'Ciąża',
      'Nadczynność tarczycy',
      'Choroby psychiczne, uczulenie na ciepło',
      'Wyniszczenie lub osłabienie organizmu, wiek starczy',
      'Choroba wrzodowa dróg pokarmowych'
    ]
  },

  ultrasound: {
    id: 'ultrasound',
    name: 'Sonoterapia (Ultradźwięki i Ultrafonoforeza)',
    category: 'Sonoterapia',
    mechanismsAndLaws: [
      'Drgania mechaniczne >20 kHz (słyszalne 16 Hz – 20 kHz). Prawo Grotthusa-Drapera.',
      'Działanie pierwotne (miejscowe): mechaniczne (mikromasaż), termiczne (najmocniej przegrzewa się tkanka nerwowa i granica mięsień–kość; najsłabiej pochłania tkanka tłuszczowa, najsilniej kostna), fizykochemiczne (przemiana żel–zol).',
      'Działanie wtórne (ogólne): podczas nadźwiękawiania splotów, zwojów i korzeni nerwowych – hamowanie układu współczulnego, działanie przeciwbólowe, rozluźniające, przeciwzapalne.'
    ],
    parameters: [
      { label: 'Częstotliwość fali', values: '1 MHz (głęboka penetracja) vs 3 MHz (płytka penetracja)' },
      { label: 'Natężenie wg Bauera i Wiecheć', values: 'Słabe: 0,05–0,4 W/cm² | Średnie: 0,5–0,7 W/cm² | Silne: 0,8–1,2 W/cm² (w praktyce głównie słabe i średnie)' },
      { label: 'Natężenie wg Miki i Kasprzaka', values: 'Słabe: 0,05–0,5 W/cm² | Średnie: 0,5–1,5 W/cm² | Silne: 1,5–2,0 W/cm²' },
      { label: 'Współczynnik wypełnienia impulsu', values: 'Ciągły 1:1 (100% – głębokie przegrzanie) | Impulsowy 1:2 (50%) i 1:4 (25%) – delikatny efekt cieplny | Impulsowy 1:8 (12,5%) i 1:16 (6,25%) – brak efektu cieplnego (stany ostre!)' },
      { label: 'Czas trwania zabiegu', values: 'Krótki: 1–3 min | Średni: 4–9 min | Długi: 10–15 min. Segmentarnie: 2 min. Metoda stabilna: max 5 min (do 0,4–0,5 W/cm², wyłącznie impulsowo!)' },
      { label: 'Seria zabiegów', values: 'Stany ostre: ≤6 zabiegów codziennie | Stany przewlekłe: ok. 10 zabiegów z przerwą 1–2 dni' },
      { label: 'Metody specjalne', values: 'Segmentarna (2 cm od wyrostków kolczystych, max do C3); Schemat odgłowowy (Th8/krzyżowa -> C3 + m. karku, 0,1–0,2 W/cm²); Schemat odogonowy (kość krzyżowa -> S-I -> 1/3 pasma B-P + grzebień -> Th8, min. 50% czasu przykręgosłupowo); Środowisko wodne (ręce, stopy, przykurcz łokcia – odgazowana woda 37°C, naczynie plastikowe/porcelanowe)' },
      { label: 'Dobór parametrów wg fazy (wniosek z zasad bazy)', values: 'Stan ostry: tryb impulsowy 1:8 / 1:16 (bez efektu cieplnego), natężenie słabe 0,05–0,4 W/cm², czas krótki, do 6 zabiegów codziennie (urazy, przykurcze). Stan podostry: impulsowy 1:2 – 1:8, natężenie 0,2–0,7 W/cm², czas średni. Stan przewlekły: tryb ciągły lub impulsowy 1:2 / 1:4, natężenie słabe–średnie do ok. 1,0 W/cm², czas średni–długi, ok. 10 zabiegów z przerwą 1–2 dni. Skóra, blizny i twarz: 0,1–0,2 W/cm².' }
    ],
    methodology: [
      'Środki sprzęgające: żel, olej parafinowy, wazelina, woda. W ULTRAFONOFOREZIE głębokość penetracji leku zależy od czasu zabiegu (nie od natężenia); ZAKAZ stosowania maści (grozi oparzeniem!).',
      'Metoda labilna: 3 pasy o szerokości głowicy i dł. 10–12 cm (30 s na pas) lub kółka (2–3 s na okrążenie), mały nacisk.',
      'Przygotowanie pola: wcześniejsze schłodzenie zwiększa głęboką penetrację UD; ogrzanie (IR/parafina) zatrzymuje energię w powierzchownych warstwach skóry.',
      'Bezwzględny zakaz samodzielnej aplikacji przez pacjenta; po zabiegu osuszenie skóry i odkażenie głowicy; głowica stale w ruchu.',
      'Skóra i blizny: obszar zabiegowy maksymalnie rozciągnięty, natężenie 0,1–0,2 W/cm² (dawkujemy słabo). Mięśnie: wzdłuż włókien, w przegrodach, na przejściu brzuśca w ścięgno i przyczepach, mięśnie rozluźnione.',
      'Kości i stawy: zmieniamy ułożenie stawu dla lepszego wnikania fali; przy przykurczach staw w pozycji maksymalnego rozciągnięcia. Okolica przykręgosłupowa: głowica 2 cm od linii wyrostków kolczystych, zabieg ograniczamy do wysokości C3 (rdzeń przedłużony!).',
      'Technika stabilna (zwoje nerwowe, złogi wapniowe): max 5 min, max 0,4–0,5 W/cm², WYŁĄCZNIE tryb impulsowy. Zabiegi w środowisku wodnym: woda odgazowana 37°C, naczynie plastikowe lub porcelanowe (unikamy fali stojącej), szczelna głowica, jednakowa odległość od ścianek i dna.'
    ],
    indications: [
      'Choroba zwyrodnieniowa kręgosłupa i stawów, zespoły bólowe (rwa kulszowa, ramienna)',
      'Zmiany zapalno-zwyrodnieniowe (np. ostroga piętowa, łokieć tenisisty/golfisty)',
      'Blizny, przykurcz Dupuytrena, przykurcze stawowe, zwłókniałe mięśnie i torebki stawowe',
      'Nerwobóle, bóle poamputacyjne'
    ],
    contraindications: [
      'Nowotwory',
      'Ostre stany zapalne przebiegające z gorączką',
      'Zaawansowane zwapnienie naczyń, zakrzepowe zapalenie żył, żylaki, zakrzepica, zaburzenia krzepnięcia krwi',
      'Wyniszczenie organizmu',
      'Wszczepiony rozrusznik serca, niewydolność krążenia, zaburzenia rytmu serca',
      'Metalowe implanty w polu zabiegowym (np. endoproteza, zespolenia)',
      'Okolica nasad kości u dzieci',
      'Ciąża',
      'Zaawansowana osteoporoza',
      'Nerwica wegetatywna',
      'Przerwanie ciągłości tkanki w miejscu zabiegu'
    ]
  },

  magnetotherapy: {
    id: 'magnetotherapy',
    name: 'Magnetoterapia (pulsujące PM małej częstotliwości)',
    category: 'Magnetoterapia',
    mechanismsAndLaws: [
      'Wolnozmienne pole magnetyczne o częstotliwości <100 Hz (0–50/60 Hz) i indukcji 0,1–10 mT (1 Gaus = 0,1 mT = 0,0001 T).',
      'Przenika w całości przez ciało, gips, bandaż, odzież oraz przy metalowych implantach nieelektronicznych (można wykonywać u dzieci!).',
      'Rytmiczne przemieszczanie jonów -> hiperpolaryzacja błony komórkowej, wzrost utylizacji tlenu i ATP, pobudzenie osteogenezy i angiogenezy, wazodilatacja (spadek ciśnienia), działanie przeciwbólowe i przeciwzapalne.'
    ],
    parameters: [
      { label: 'Kształt impulsów PM', values: 'Prostokątne – kości (złamania, osteoporoza) | Trójkątne – chrząstka stawowa, ścięgna, więzadła | Sinusoidalne – tkanka nerwowa i mięśniowa (najbardziej uniwersalne)' },
      { label: 'Częstotliwość (Hz)', values: 'Stan ostry: 1–5 Hz | Stan podostry: 5–20 Hz | Stan przewlekły: 20–50 Hz' },
      { label: 'Indukcja magnetyczna (mT / Gs)', values: 'Stan ostry: 0,5–3 mT (5–30 Gs) | Stan podostry: 3–5 mT (30–50 Gs) | Stan przewlekły: 6–10 mT (60–100 Gs)' },
      { label: 'Progresja dawki w serii!', values: '1. zabieg: 40% przyjętej dawki | 2. zabieg: 70% dawki | 3. zabieg i kolejne: 100% pełnej dawki!' },
      { label: 'Dobór solenoidu (średnica)', values: '500 mm – tułów (100% = 2,5 mT) | 315 mm – kończyny dolne (100% = 5,0 mT) | 200 mm – kończyny górne (100% = 10 mT). Aplikatory dyskowe – działanie miejscowe bez wpływu na terapeutę.' },
      { label: 'Przerwa (puls) i czas', values: 'Tryb impulsowy lub ciągły (przerwę zaczynamy od 3 s i skracamy do 0,5 s). Czas: 15–30 min. Seria: 15 zabiegów (pierwsze 5–10 codziennie, potem co 2–3 dni).' }
    ],
    methodology: [
      'Wykonywać o stałej porze dnia, NIE w godzinach wieczornych (ryzyko bezsenności, szczególnie u osób starszych).',
      'Pacjent zdejmuje zegarek, telefon komórkowy, aparat słuchowy i luźne przedmioty metalowe.',
      'Przed zabiegiem sprawdzamy sprawność aparatu wkładając magnes do wnętrza cewki (powinien drgać).',
      'Metoda nietermiczna – można ją stosować także w stanie ostrym; zabieg wykonujemy przez ubranie (najlepiej bawełniane), gips i bandaż, u dzieci oraz przy implantach nieelektronicznych (metalowych).'
    ],
    indications: [
      'Choroba zwyrodnieniowa stawów kończyn i kręgosłupa, zapalenie stawów i tkanek okołostawowych',
      'Pourazowe choroby narządu ruchu: złamania (również w opatrunku gipsowym!), skręcenia, zwichnięcia',
      'Osteoporoza, stawy rzekome, utrudnione gojenie ran, owrzodzenia troficzne',
      'Zaburzenia krążenia obwodowego, stany zapalne nerwów, zaburzenia przemiany materii, zapalenie oskrzeli i zatok obocznych nosa'
    ],
    contraindications: [
      'Ciąża',
      'Choroba nowotworowa',
      'Elektroniczne implanty (np. rozrusznik serca, pompa insulinowa, implant ślimakowy)',
      'Czynna gruźlica',
      'Ostre infekcje bakteryjne i wirusowe, grzybica',
      'Zarostowe / zakrzepowe zapalenie żył, skłonność do krwawień',
      'Gorączka',
      'Ciężkie choroby serca i układu krążenia'
    ]
  },

  magnetostimulation: {
    id: 'magnetostimulation',
    name: 'Magnetostymulacja (np. Viofor JPS)',
    category: 'Magnetoterapia',
    mechanismsAndLaws: [
      'Pola magnetyczne o bardzo niskich wartościach indukcji (<100 µT) i częstotliwości od kilku do 3000 Hz (przebiegi modulowane).',
      'Wzbudza w organizmie siły elektromotoryczne zbliżone do powstających podczas wysiłku fizycznego – wspiera homeostazę i odnowę biologiczną.',
      'Działanie: analgetyczne, regeneracyjne, restytucyjne, przeciwzapalne, antyspastyczne, wazodilatacyjne, stabilizujące błony komórkowe, relaksacyjne.'
    ],
    parameters: [
      { label: 'Indukcja i częstotliwość', values: 'Indukcja <100 µT, częstotliwość kilka – 3000 Hz' },
      { label: 'Czas zabiegu', values: 'Ustawiony fabrycznie: 8, 10 lub 12 min' },
      { label: 'Dobór Programu (P)', values: 'P2 – podstawowy program terapeutyczny | P1 – dla osób nadwrażliwych na pole magnetyczne | P3 – przy niskiej wrażliwości / słabych efektach' },
      { label: 'Sposób aplikacji (M) i Intensywność (I)', values: '1. tydzień: M2, intensywność do 6 | 2. tydzień: M3, intensywność do 9 | 3. tydzień: M1, intensywność do 12' },
      { label: 'Aplikatory', values: 'Całe ciało: mata, aplikator kliniczny | Miejscowo: aplikatory pierścieniowe, eliptyczne, poduszka' }
    ],
    methodology: [
      'Dobór programu P oraz stopniowanie M i I w kolejnych tygodniach terapii.',
      'Możliwość stosowania ogólnoustrojowego (mata) lub miejscowego.',
      'Kluczowy parametr zabiegu: stosunek indukcji do częstotliwości. Czas zabiegu ustawiony fabrycznie (8, 10 lub 12 min).',
      'Aplikatory: całe ciało (schorzenia ogólnoustrojowe) – aplikator kliniczny, mata; wybrane części ciała – aplikatory pierścieniowe, eliptyczne, poduszka.'
    ],
    indications: [
      'Przeciwbólowe: bóle migrenowe, zmiany zwyrodnieniowe kręgosłupa i stawów, urazy stawów',
      'Regeneracyjne i naczyniowe: odleżyny, oparzenia, stawy rzekome, angiopatia cukrzycowa, przyspieszenie wchłaniania krwiaków, owrzodzenia podudzi',
      'Antyspastyczne: stany po udarach mózgu, choroby zwyrodnieniowe układu nerwowego ze spastycznością',
      'Relaksacyjne i restytucyjne: nerwice, zaburzenia snu i koncentracji, restytucja powysiłkowa po treningu sportowym i odnowa biologiczna, stomatologia (zmiany okołowierzchołkowe, uszkodzenia nerwu po znieczuleniu, powikłania po zabiegach chirurgicznych)'
    ],
    contraindications: [
      'Ciąża',
      'Choroba nowotworowa',
      'Nadczynność tarczycy',
      'Krwawienia z przewodu pokarmowego',
      'Stany po przeszczepach narządów',
      'Implanty elektroniczne (np. rozrusznik serca)',
      'Infekcje pochodzenia wirusowego, bakteryjnego i grzybiczego'
    ]
  }
};

export const ANATOMICAL_LOCATIONS: AnatomicalLocation[] = [
  {
    id: 'nerw_twarzowy',
    name: 'Nerw twarzowy',
    regionGroup: 'głowa_szyja',
    svgView: 'front',
    svgCoords: { x: 47, y: 12, pathType: 'point' },
    commonPathologies: [
      { name: 'Porażenie nerwu twarzowego (okres I – wczesny)', typicalPhases: ['ostry', 'podostry'] },
      { name: 'Porażenie nerwu twarzowego (okres II – regeneracji)', typicalPhases: ['podostry', 'przewlekly'] }
    ],
    patientPosition: 'Leżenie tyłem lub pozycja półsiedząca z podparciem i stabilizacją głowy.',
    palpationLandmarks: 'Dół zażuchwowy – tuż poniżej i do przodu od płatka ucha oraz wyrostka sutkowatego (wyjście nerwu z otworu rylcowo-sutkowego), skąd gałęzie promieniują na policzek (gęsia stopka przyusznicza).',
    applicationTechnique: 'Aplikacja na pień nerwu przed uchem oraz odgałęzienia na policzku po stronie porażonej. Przy Solluxie odległość 10–20 cm (okres I filtr niebieski, okres II filtr czerwony). Przy maseczce parafinowej: parafinę <45°C nakładamy na kilka warstw gazy.',
    zonesToAvoid: ['Gałki oczne (bezwzględna ochrona okularami lub grubą warstwą gazy!)', 'Przewód słuchowy zewnętrzny / ucho (zabezpieczyć gazą)']
  },
  {
    id: 'nerw_trojdzielny',
    name: 'Nerw trójdzielny',
    regionGroup: 'głowa_szyja',
    svgView: 'front',
    svgCoords: { x: 48, y: 10, pathType: 'point' },
    commonPathologies: [
      { name: 'Neuralgia (nerwoból) nerwu trójdzielnego', typicalPhases: ['ostry', 'podostry', 'przewlekly'] }
    ],
    patientPosition: 'Leżenie tyłem lub pozycja półsiedząca ze stabilizacją głowy.',
    palpationLandmarks: 'Punkty Valleixa (wyjścia gałęzi): I gałąź – wcięcie nadoczodołowe (przyśrodkowa 1/3 górnego brzegu oczodołu); II gałąź – otwór podoczodołowy (ok. 1 cm poniżej dolnego brzegu oczodołu w linii źrenicy); III gałąź – otwór bródkowy (trzon żuchwy na wysokości 2. zęba przedtrzonowego).',
    applicationTechnique: 'Aplikacja punktowa / lokalna w rzucie bolesnych punktów wyjścia poszczególnych gałęzi nerwu.',
    zonesToAvoid: ['Gałki oczne (bezwzględny zakaz naświetlania i nadźwiękawiania oczu!)', 'Usta / błony śluzowe bez osłony przy zabiegach cieplnych']
  },
  {
    id: 'kregoslup_szyjny_zwoj',
    name: 'Kręgosłup szyjny i zwój gwiaździsty',
    regionGroup: 'kregoslup',
    svgView: 'back',
    svgCoords: { x: 50, y: 17, pathType: 'paraspinal' },
    commonPathologies: [
      { name: 'Rwa ramienna (cervicobrachialgia)', typicalPhases: ['ostry', 'podostry', 'przewlekly'] },
      { name: 'Zmiany zwyrodnieniowe kręgosłupa szyjnego', typicalPhases: ['przewlekly'] },
      { name: 'Przestrojenie układu współczulnego – schemat odgłowowy (UD)', typicalPhases: ['podostry', 'przewlekly'] }
    ],
    patientPosition: 'Kręgosłup szyjny: pozycja siedząca (okrakiem na krześle z czołem opartym o przedramiona na oparciu) lub leżenie przodem z wałkiem pod klatką piersiową (zniesienie lordozy). Zwój gwiaździsty: leżenie tyłem z głową lekko odgiętą i skręconą w stronę przeciwną.',
    palpationLandmarks: 'Wyznaczamy kręg wystający (vertebra prominens – C7), który przy zgięciu głowy pozostaje nieruchomy (C6 chowa się do przodu). Od C7 odliczamy 4 wyrostki kolczyste w górę do kręgu C3. Zwój gwiaździsty (C7–Th1): ok. 2–3 cm nad obojczykiem, przyśrodkowo od m. MOS.',
    applicationTechnique: 'Przykręgosłupowo 2 cm bocznie od linii wyrostków kolczystych. W schemacie odgłowowym (UD): przesuwamy głowicę od Th8 (lub kości krzyżowej) w stronę C3 oraz obejmujemy mięśnie karku (0,1–0,2 W/cm²).',
    zonesToAvoid: ['Powyżej kręgu C3 w ultradźwiękach (bliskość rdzenia przedłużonego!)', 'Linia wyrostków kolczystych', 'Okolica tarczycy (przednia strona szyi)']
  },
  {
    id: 'kregoslup_piersiowy',
    name: 'Kręgosłup piersiowy',
    regionGroup: 'kregoslup',
    svgView: 'back',
    svgCoords: { x: 50, y: 28, pathType: 'paraspinal' },
    commonPathologies: [
      { name: 'Zespół bólowy i wzmożone napięcie mięśni przykręgosłupowych odcinka Th', typicalPhases: ['podostry', 'przewlekly'] },
      { name: 'Dyskopatia piersiowa / choroba zwyrodnieniowa Th', typicalPhases: ['przewlekly'] }
    ],
    patientPosition: 'Leżenie przodem z poduszką pod brzuchem i ramionami odwiedzionymi (w celu rozsunięcia łopatek i odsłonięcia przestrzeni międzyłopatkowej).',
    palpationLandmarks: 'Odliczamy w dół od C7; grzebień łopatki odpowiada wysokości Th3, a linia łącząca dolne kąty łopatek wyznacza wyrostek kolczysty Th7 (poniżej Th8 – granica schematów w UD).',
    applicationTechnique: 'Prowadzenie głowicy/lasera przykręgosłupowo 2 cm bocznie od wyrostków kolczystych lub pasami 10–12 cm wzdłuż włókien prostownika grzbietu i mięśni równoległobocznych.',
    zonesToAvoid: ['Wyrostki kolczyste kręgów', 'Grzebień i kąt dolny łopatki (wystające elementy kostne przy UD i krioterapii)']
  },
  {
    id: 'kregoslup_ledzwiowy',
    name: 'Kręgosłup lędźwiowy',
    regionGroup: 'kregoslup',
    svgView: 'back',
    svgCoords: { x: 50, y: 41, pathType: 'paraspinal' },
    commonPathologies: [
      { name: 'Rwa kulszowa / dyskopatia L4–L5 / L5–S1', typicalPhases: ['ostry', 'podostry', 'przewlekly'] },
      { name: 'Choroba zwyrodnieniowa kręgosłupa L-S (schemat odogonowy UD)', typicalPhases: ['przewlekly'] }
    ],
    patientPosition: 'Leżenie przodem z wałkiem lub poduszką pod podbrzuszem w celu zniesienia lordozy lędźwiowej, otwarcia przestrzeni międzykręgowych i pełnego rozluźnienia mięśni.',
    palpationLandmarks: 'Linia łącząca najwyższe punkty grzebieni talerzy biodrowych (linia Tuffiera) wyznacza przestrzeń L4–L5 / wyrostek kolczysty L4. Kolce biodrowe tylne górne (KBTG) wyznaczają poziom S2 i stawy krzyżowo-biodrowe.',
    applicationTechnique: 'Przykręgosłupowo 2 cm od wyrostków kolczystych. Schemat odogonowy (UD): od dolnej krawędzi kości krzyżowej wzdłuż zewnętrznego brzegu stawu S-I, pod grzebieniem miednicy, 1/3 bliższa pasma B-P + od grzebienia biodrowego do Th8 (min. 50% czasu przykręgosłupowo).',
    zonesToAvoid: ['Wyrostki kolczyste kręgów L1–L5', 'Grzebień kości biodrowej bezpośrednio nad kością (przy UD i krio)']
  },
  {
    id: 'staw_ramienny_przod',
    name: 'Staw ramienny – przód',
    regionGroup: 'konczyna_gorna',
    svgView: 'front',
    svgCoords: { x: 35, y: 22, pathType: 'point' },
    commonPathologies: [
      { name: 'Zapalenie ścięgna głowy długiej mięśnia dwugłowego ramienia', typicalPhases: ['ostry', 'podostry', 'przewlekly'] },
      { name: 'Uszkodzenie / przeciążenie mięśnia podłopatkowego', typicalPhases: ['podostry', 'przewlekly'] }
    ],
    patientPosition: 'Pozycja siedząca, kończyna górna zgięta w łokciu do 90° i ustawiona w rotacji zewnętrznej (otwarcie przedniego przedziału stawu ramiennego).',
    palpationLandmarks: 'Bocznie od wyrostka kruczego łopatki wyczuwamy bruzdę międzyguzkową (między guzkiem większym a mniejszym kości ramiennej – przebieg ścięgna głowy długiej bicepsa).',
    applicationTechnique: 'Aplikacja punktowa lub krótkimi pasami w rzucie bruzdy międzyguzkowej i przedniej torebki stawowej.',
    zonesToAvoid: ['Wyrostek barkowy łopatki', 'Koniec barkowy obojczyka', 'Guzek większy i mniejszy bezpośrednio na szczycie kości']
  },
  {
    id: 'staw_ramienny_bok',
    name: 'Staw ramienny – bok / mięsień nadgrzebieniowy',
    regionGroup: 'konczyna_gorna',
    svgView: 'side',
    svgCoords: { x: 50, y: 21, pathType: 'point' },
    commonPathologies: [
      { name: 'Zespół ciasnoty podbarkowej / zapalenie kaletki podbarkowej', typicalPhases: ['ostry', 'podostry', 'przewlekly'] },
      { name: 'Tendinopatia / uszkodzenie mięśnia nadgrzebieniowego', typicalPhases: ['podostry', 'przewlekly'] }
    ],
    patientPosition: 'Pozycja siedząca, ramię swobodnie opuszczone luźno wzdłuż tułowia (lub z lekkim wyprostem i przywiedzeniem dla wysunięcia przyczepu m. nadgrzebieniowego spod wyrostka barkowego).',
    palpationLandmarks: 'Tuż poniżej bocznej krawędzi wyrostka barkowego łopatki (przestrzeń podbarkowa / przyczep na guzku większym).',
    applicationTechnique: 'Aplikacja lokalna bezpośrednio pod boczną krawędzią wyrostka barkowego.',
    zonesToAvoid: ['Wyrostek barkowy łopatki (wyniosłość kostna – omijamy przy UD i krio!)']
  },
  {
    id: 'staw_ramienny_tyl',
    name: 'Staw ramienny – tył',
    regionGroup: 'konczyna_gorna',
    svgView: 'back',
    svgCoords: { x: 65, y: 22, pathType: 'point' },
    commonPathologies: [
      { name: 'Tendinopatia mięśnia podgrzebieniowego i obłego mniejszego', typicalPhases: ['podostry', 'przewlekly'] },
      { name: 'Przykurcz tylnej torebki stawu ramiennego / zespół bolesnego barku', typicalPhases: ['przewlekly'] }
    ],
    patientPosition: 'Pozycja siedząca, kończyna górna w rotacji wewnętrznej i przywiedzeniu – dłoń pacjenta oparta na przeciwległym kolanie lub przeciwległym barku (aby otworzyć i odsłonić tylny przedział stawu).',
    palpationLandmarks: 'Ok. 2 cm poniżej i przyśrodkowo od tylnego kąta wyrostka barkowego łopatki (tzw. soft spot – miękki punkt wejścia do tylnego przedziału stawu) oraz dół podgrzebieniowy.',
    applicationTechnique: 'Aplikacja na otwarty tylny przedział stawu oraz wzdłuż brzuśca m. podgrzebieniowego.',
    zonesToAvoid: ['Grzebień łopatki', 'Tylny kąt wyrostka barkowego łopatki']
  },
  {
    id: 'staw_lokciowy_tenisista',
    name: 'Staw łokciowy – łokieć tenisisty',
    regionGroup: 'konczyna_gorna',
    svgView: 'front',
    svgCoords: { x: 28, y: 36, pathType: 'point' },
    commonPathologies: [
      { name: 'Entezopatia nadkłykcia bocznego kości ramiennej (łokieć tenisisty)', typicalPhases: ['ostry', 'podostry', 'przewlekly'] }
    ],
    patientPosition: 'Pozycja siedząca, przedramię oparte wygodnie na stoliku/kozetce w lekkim zgięciu łokcia (ok. 30°) i pronacji, mięśnie przedramienia rozluźnione.',
    palpationLandmarks: 'Najbardziej wystający punkt kostny po bocznej stronie łokcia – nadkłykieć boczny kości ramiennej oraz 1–2 cm dystalnie od niego na przyczepie prostowników nadgarstka (m. prostownik promieniowy krótki nadgarstka).',
    applicationTechnique: 'Punktowo na okolicę nadkłykcia bocznego oraz pasami wzdłuż brzuśców mięśni prostowników przedramienia.',
    zonesToAvoid: ['Wyrostek łokciowy (olecranon)', 'Głowa kości promieniowej (bezpośrednio nad kością)']
  },
  {
    id: 'staw_lokciowy_golfista',
    name: 'Staw łokciowy – łokieć golfisty',
    regionGroup: 'konczyna_gorna',
    svgView: 'front',
    svgCoords: { x: 33, y: 36, pathType: 'point' },
    commonPathologies: [
      { name: 'Entezopatia nadkłykcia przyśrodkowego kości ramiennej (łokieć golfisty)', typicalPhases: ['ostry', 'podostry', 'przewlekly'] }
    ],
    patientPosition: 'Pozycja siedząca, ramię w lekkim odwiedzeniu i rotacji zewnętrznej, przedramię oparte na stoliku w supinacji (odsłonięcie przyśrodkowej strony łokcia).',
    palpationLandmarks: 'Wydatny nadkłykieć przyśrodkowy kości ramiennej i przyczep wspólny zginaczy nadgarstka tuż dystalnie od niego.',
    applicationTechnique: 'Aplikacja na przyczep zginaczy przy nadkłykciu przyśrodkowym i wzdłuż brzuśca zginaczy przedramienia.',
    zonesToAvoid: ['Bruzda nerwu łokciowego (leżąca tuż ku tyłowi od nadkłykcia przyśrodkowego!)', 'Wyrostek łokciowy']
  },
  {
    id: 'staw_lokciowy_przykurcz',
    name: 'Staw łokciowy – przykurcz',
    regionGroup: 'konczyna_gorna',
    svgView: 'front',
    svgCoords: { x: 30, y: 36, pathType: 'area' },
    commonPathologies: [
      { name: 'Przykurcz torebkowo-więzadłowy stawu łokciowego po unieruchomieniu / złamaniu', typicalPhases: ['przewlekly'] }
    ],
    patientPosition: 'Pozycja siedząca, staw łokciowy ustawiony w pozycji maksymalnego bezpiecznego rozciągnięcia przykurczonych tkanek (zgodnie z PDF przy leczeniu przykurczów).',
    palpationLandmarks: 'Dół łokciowy (przednia torebka stawowa, ścięgno m. dwugłowego i m. ramiennego) oraz więzadła poboczne.',
    applicationTechnique: 'Aplikacja na rozciągniętą przednią torebkę stawową. W ultradźwiękach możliwy zabieg w środowisku wodnym (odgazowana woda 37°C w plastikowym/porcelanowym naczyniu, równa odległość od ścianek i dna).',
    zonesToAvoid: ['Wyrostek łokciowy', 'Bruzda nerwu łokciowego', 'Nadkłykcie kości ramiennej bezpośrednio nad kością']
  },
  {
    id: 'nadgarstek_reka_dloniowa',
    name: 'Nadgarstek i ręka – strona dłoniowa',
    regionGroup: 'konczyna_gorna',
    svgView: 'front',
    svgCoords: { x: 24, y: 49, pathType: 'area' },
    commonPathologies: [
      { name: 'Zespół cieśni kanału nadgarstka', typicalPhases: ['podostry', 'przewlekly'] },
      { name: 'Przykurcz Dupuytrena (rozcięgna dłoniowego)', typicalPhases: ['przewlekly'] }
    ],
    patientPosition: 'Pozycja siedząca, przedramię i ręka oparte wygodnie na stoliku w pełnej supinacji (strona dłoniowa ku górze). Przy przykurczu Dupuytrena palce ustawione w maksymalnym rozciągnięciu.',
    palpationLandmarks: 'Dystalnie od fałdu zgięciowego nadgarstka, między wyniosłością kłębu a kłębika (między kością grochowatą a guzkiem kości łódeczkowatej – troczek zginaczy).',
    applicationTechnique: 'Aplikacja lokalna na kanał nadgarstka lub rozciągnięte rozcięgno dłoniowe. Możliwy zabieg UD w kąpieli wodnej 37°C lub kąpiel parafinowa 53–54°C (pacjent porusza ręką w wannie).',
    zonesToAvoid: ['Kość grochowata i haczyk kości haczykowatej (wyniosłości kostne)']
  },
  {
    id: 'nadgarstek_reka_grzbietowa',
    name: 'Nadgarstek i ręka – strona grzbietowa',
    regionGroup: 'konczyna_gorna',
    svgView: 'back',
    svgCoords: { x: 76, y: 49, pathType: 'area' },
    commonPathologies: [
      { name: 'Reumatoidalne zapalenie stawów (RZS) rąk', typicalPhases: ['podostry', 'przewlekly'] },
      { name: 'Zmiany zwyrodnieniowe stawów ręki i nadgarstka', typicalPhases: ['przewlekly'] }
    ],
    patientPosition: 'Pozycja siedząca, przedramię i dłoń oparte płasko na podkładzie w pronacji (strona grzbietowa ku górze).',
    palpationLandmarks: 'Wyrostek rylcowaty kości promieniowej (bocznie) i wyrostek rylcowaty kości łokciowej (przyśrodkowo) – pole zabiegowe znajduje się w przestrzeni między nimi oraz nad stawami MCP i PIP.',
    applicationTechnique: 'Naświetlanie grzbietu ręki, rękawiczki parafinowe (54°C, zanurzanie na 0,5–1 s do uzyskania warstwy 2 cm, 30 min) lub ultradźwięki w środowisku wodnym 37°C.',
    zonesToAvoid: ['Wyrostki rylcowate kości promieniowej i łokciowej bezpośrednio nad kością (przy UD/krio)']
  },
  {
    id: 'staw_biodrowy_bok',
    name: 'Staw biodrowy – okolica boczna / krętarz większy',
    regionGroup: 'konczyna_dolna',
    svgView: 'side',
    svgCoords: { x: 50, y: 52, pathType: 'c-arc' },
    commonPathologies: [
      { name: 'Zapalenie kaletki krętarzowej / zespół bólowy krętarza większego', typicalPhases: ['ostry', 'podostry', 'przewlekly'] },
      { name: 'Przeciążenie pasma biodrowo-piszczelowego (1/3 bliższa)', typicalPhases: ['podostry', 'przewlekly'] }
    ],
    patientPosition: 'Leżenie na zdrowym boku z poduszką lub wałkiem między kolanami dla ustabilizowania miednicy i rozluźnienia odwodzicieli biodra.',
    palpationLandmarks: 'Palpujemy najbardziej wystający bocznie punkt kostny w górnej części uda – krętarz większy kości udowej (łatwo wyczuwalny podczas delikatnych ruchów rotacyjnych kończyny).',
    applicationTechnique: 'W ultradźwiękach prowadzimy głowicę płynnym łukiem w kształcie litery „C” WOKÓŁ krętarza większego (od tyłu, od góry i od przodu) oraz wzdłuż 1/3 bliższej pasma biodrowo-piszczelowego.',
    zonesToAvoid: ['Szczyt krętarza większego kości udowej (BEZWZGLĘDNIE omijamy samą wyniosłość kostną – ryzyko bólu okostnowego i przegrzania!)']
  },
  {
    id: 'staw_biodrowy_przod',
    name: 'Staw biodrowy – okolica przednia',
    regionGroup: 'konczyna_dolna',
    svgView: 'front',
    svgCoords: { x: 43, y: 49, pathType: 'point' },
    commonPathologies: [
      { name: 'Choroba zwyrodnieniowa stawu biodrowego (koksartroza)', typicalPhases: ['przewlekly'] },
      { name: 'Przeciążenie mięśnia biodrowo-lędźwiowego / prostego uda', typicalPhases: ['podostry', 'przewlekly'] }
    ],
    patientPosition: 'Leżenie tyłem z kończyną dolną w lekkiej rotacji zewnętrznej i wałkiem pod kolanem (rozluźnienie m. biodrowo-lędźwiowego).',
    palpationLandmarks: '2–3 cm poniżej środka więzadła pachwinowego (linia łącząca kolec biodrowy przedni górny KBP i guzek łonowy), bocznie od wyczuwalnego tętna tętnicy udowej.',
    applicationTechnique: 'Aplikacja na przedni przedział torebki stawu biodrowego bocznie od pęczka naczyniowo-nerwowego.',
    zonesToAvoid: ['Kolec biodrowy przedni górny (KBP)', 'Bezpośredni ucisk na tętnicę i nerw udowy w trójkącie udowym']
  },
  {
    id: 'staw_biodrowy_tyl',
    name: 'Staw biodrowy – okolica tylna',
    regionGroup: 'konczyna_dolna',
    svgView: 'back',
    svgCoords: { x: 57, y: 50, pathType: 'stripes' },
    commonPathologies: [
      { name: 'Zespół mięśnia gruszkowatego / rwa gruszkowata', typicalPhases: ['podostry', 'przewlekly'] },
      { name: 'Bóle tylnego przedziału stawu biodrowego', typicalPhases: ['przewlekly'] }
    ],
    patientPosition: 'Leżenie przodem z wałkiem pod stawami skokowymi (lekka rotacja wewnętrzna bioder rozluźnia rotatory zewnętrzne i mięśnie pośladkowe).',
    palpationLandmarks: 'Linia łącząca kolec biodrowy tylny górny (KBTG) z krętarzem większym – rzut mięśnia gruszkowatego (poniżej niego wychodzi nerw kulszowy).',
    applicationTechnique: 'Aplikacja labilna (3 pasy 10–12 cm lub okręgi) wzdłuż przebiegu włókien mięśnia gruszkowatego i pośladkowego.',
    zonesToAvoid: ['Guz kulszowy (wyniosłość kostna u dołu pośladka)', 'Krętarz większy']
  },
  {
    id: 'staw_kolanowy_szpara',
    name: 'Staw kolanowy – szpara stawowa',
    regionGroup: 'konczyna_dolna',
    svgView: 'front',
    svgCoords: { x: 44, y: 69, pathType: 'point' },
    commonPathologies: [
      { name: 'Choroba zwyrodnieniowa stawu kolanowego (gonartroza)', typicalPhases: ['przewlekly'] },
      { name: 'Skręcenie stawu kolanowego / uszkodzenie więzadła pobocznego (MCL/LCL)', typicalPhases: ['ostry', 'podostry'] }
    ],
    patientPosition: 'Leżenie tyłem z wałkiem pod dołem podkolanowym (zgięcie kolana ok. 20–30° dla otwarcia szpary stawowej i rozluźnienia więzadeł) lub leżenie na boku przy dojściu bocznym/przyśrodkowym.',
    palpationLandmarks: 'Po obu stronach więzadła rzepki, tuż poniżej dolnego bieguna rzepki (wyraźne wgłębienia przyśrodkowej i bocznej szpary stawu udowo-piszczelowego).',
    applicationTechnique: 'Aplikacja wzdłuż przyśrodkowej i bocznej szpary stawowej lub pasami wzdłuż więzadeł pobocznych.',
    zonesToAvoid: ['Rzepka i guzowatość kości piszczelowej', 'Głowa kości strzałkowej po stronie bocznej (powierzchowny przebieg nerwu strzałkowego wspólnego!)']
  },
  {
    id: 'staw_kolanowy_blizna',
    name: 'Staw kolanowy – blizna pooperacyjna',
    regionGroup: 'konczyna_dolna',
    svgView: 'front',
    svgCoords: { x: 56, y: 68, pathType: 'stripes' },
    commonPathologies: [
      { name: 'Blizna pooperacyjna (np. po rekonstrukcji ACL / artroskopii / zabiegu chirurgicznym)', typicalPhases: ['podostry', 'przewlekly'] }
    ],
    patientPosition: 'Ustawienie stawu kolanowego wymuszające maksymalne bezpieczne rozciągnięcie blizny (np. zgięcie kolana) – zgodnie z PDF podczas nadźwiękawiania blizn obszar musi być maksymalnie rozciągnięty.',
    palpationLandmarks: 'Przebieg wygojonej (zamkniętej!) blizny skórnej w okolicy przedniej lub przyśrodkowej stawu kolanowego.',
    applicationTechnique: 'Prowadzenie sondy/głowicy bezpośrednio wzdłuż rozciągniętej blizny (w UD niskie natężenia 0,1–0,2 W/cm² lub 3 MHz – płytka penetracja). Warunek: całkowite wygojenie i ciągłość naskórka!',
    zonesToAvoid: ['Niezagojone rany / przerwanie ciągłości skóry (bezwzględne przeciwwskazanie w UD i krio!)', 'Rzepka bezpośrednio pod blizną przy dużym nacisku']
  },
  {
    id: 'staw_skokowy_kostka',
    name: 'Staw skokowy i stopa – kostka boczna',
    regionGroup: 'konczyna_dolna',
    svgView: 'side',
    svgCoords: { x: 52, y: 89, pathType: 'point' },
    commonPathologies: [
      { name: 'Skręcenie stawu skokowego (uszkodzenie więzadła skokowo-strzałkowego przedniego ATFL)', typicalPhases: ['ostry', 'podostry', 'przewlekly'] }
    ],
    patientPosition: 'Leżenie tyłem lub na zdrowym boku ze stopą podpartą na wałku w lekkim odwróceniu (inwersji) i zgięciu podeszwowym (odsłonięcie okolicy przednio-bocznej kostki).',
    palpationLandmarks: 'Zagłębienie do przodu i nieco ku dołowi od szczytu kostki bocznej (między kostką boczną a szyjką kości skokowej – przebieg więzadła ATFL).',
    applicationTechnique: 'Aplikacja punktowa/lokalna w zatokę stępu i rzut więzadła ATFL (w stanie ostrym do 3–5 dni krioterapia, laser ostry lub UD impulsowe 1:8 / 1:16, 3 MHz).',
    zonesToAvoid: ['Kostka boczna i kostka przyśrodkowa (wystające elementy kostne – omijamy przy UD i krioterapii!)']
  },
  {
    id: 'staw_skokowy_ostroga',
    name: 'Staw skokowy i stopa – ostroga piętowa / rozcięgno podeszwowe',
    regionGroup: 'konczyna_dolna',
    svgView: 'back',
    svgCoords: { x: 44, y: 94, pathType: 'point' },
    commonPathologies: [
      { name: 'Ostroga piętowa / zapalenie rozcięgna podeszwowego', typicalPhases: ['podostry', 'przewlekly'] }
    ],
    patientPosition: 'Leżenie przodem ze stopami wystającymi poza krawędź kozetki (podeszwa skierowana pionowo do góry, ułatwiająca prostopadłe przyłożenie głowicy/sondy).',
    palpationLandmarks: 'Przyśrodkowa część guza piętowego na powierzchni podeszwowej stopy (miejsce przyczepu bliższego rozcięgna podeszwowego – punkt największej tkliwości).',
    applicationTechnique: 'Aplikacja punktowa/lokalna na przyczep rozcięgna na guzie piętowym i wzdłuż pasma podeszwowego (lub zabieg UD w środowisku wodnym 37°C).',
    zonesToAvoid: ['Bezpośredni silny docisk nad ostrym wyrostkiem kostnym guza piętowego']
  }
];

export const PATIENT_SCENARIOS: PatientScenario[] = [
  {
    id: 'scen_01',
    patientName: 'Marek Kowalski',
    age: 38,
    gender: 'M',
    modalityId: 'laser',
    locationId: 'staw_lokciowy_tenisista',
    diagnosis: 'Entezopatia nadkłykcia bocznego kości ramiennej (łokieć tenisisty)',
    phase: 'przewlekly',
    daysSinceOnset: 'Dolegliwości utrzymują się od 5 miesięcy',
    medicalHistory: 'Pacjent ogólnie zdrowy, nie przyjmuje żadnych leków na stałe, brak zmian skórnych w okolicy łokcia.',
    isContraindicated: false
  },
  {
    id: 'scen_02',
    patientName: 'Anna Nowak',
    age: 29,
    gender: 'K',
    modalityId: 'laser',
    locationId: 'staw_lokciowy_golfista',
    diagnosis: 'Łokieć golfisty (entezopatia nadkłykcia przyśrodkowego)',
    phase: 'podostry',
    daysSinceOnset: 'Ból od 3 tygodni po intensywnym treningu tenisa',
    medicalHistory: 'W wywiadzie: pacjentka jest w 8. tygodniu ciąży.',
    isContraindicated: true,
    contraindicationReason: 'Ciąża jest bezwzględnym przeciwwskazaniem do laseroterapii (wg PDF).'
  },
  {
    id: 'scen_03',
    patientName: 'Janina Wiśniewska',
    age: 78,
    gender: 'K',
    modalityId: 'laser',
    locationId: 'staw_kolanowy_szpara',
    diagnosis: 'Zaostrzenie choroby zwyrodnieniowej prawego stawu kolanowego',
    phase: 'podostry',
    daysSinceOnset: 'Nasilenie bólu od 10 dni',
    medicalHistory: 'Nadciśnienie tętnicze dobrze kontrolowane lekami, brak nowotworów i chorób tarczycy. Wiek podeszły (78 lat).',
    isContraindicated: false,
    requiresDoseModification: true,
    modificationReason: 'Wiek podeszły (78 lat) – zgodnie z PDF u dzieci i osób w podeszłym wieku dawkę promieniowania laserowego należy zmniejszyć o 30–60%!'
  },
  {
    id: 'scen_04',
    patientName: 'Piotr Zieliński',
    age: 45,
    gender: 'M',
    modalityId: 'ultrasound',
    locationId: 'staw_biodrowy_bok',
    diagnosis: 'Zapalenie kaletki krętarzowej prawego stawu biodrowego',
    phase: 'przewlekly',
    daysSinceOnset: 'Ból bocznej strony biodra od 4 miesięcy',
    medicalHistory: 'Brak metalowych implantów, brak rozrusznika serca, układ krążenia wydolny, skóra nienaruszona.',
    isContraindicated: false
  },
  {
    id: 'scen_05',
    patientName: 'Kazimierz Wójcik',
    age: 71,
    gender: 'M',
    modalityId: 'ultrasound',
    locationId: 'kregoslup_ledzwiowy',
    diagnosis: 'Przewlekły zespół bólowy kręgosłupa lędźwiowego (rwa kulszowa)',
    phase: 'przewlekly',
    daysSinceOnset: 'Dolegliwości od ponad roku',
    medicalHistory: 'Pacjent 3 lata temu miał wszczepiony kardiostymulator (rozrusznik serca) z powodu bloku przedsionkowo-komorowego.',
    isContraindicated: true,
    contraindicationReason: 'Wszczepiony rozrusznik serca jest bezwzględnym przeciwwskazaniem do zabiegów ultradźwiękowych (wg PDF).'
  },
  {
    id: 'scen_06',
    patientName: 'Katarzyna Kamińska',
    age: 34,
    gender: 'K',
    modalityId: 'sollux',
    locationId: 'nerw_twarzowy',
    diagnosis: 'Obwodowe porażenie nerwu twarzowego po stronie lewej – okres I (wczesny)',
    phase: 'ostry',
    daysSinceOnset: '3. doba od wystąpienia objawów',
    medicalHistory: 'Brak gorączki, ciśnienie tętnicze w normie, brak zmian skórnych i chorób układu krążenia.',
    isContraindicated: false
  },
  {
    id: 'scen_07',
    patientName: 'Tomasz Lewandowski',
    age: 24,
    gender: 'M',
    modalityId: 'sollux',
    locationId: 'staw_skokowy_kostka',
    diagnosis: 'Skręcenie stawu skokowego prawego z dużym obrzękiem i krwiakiem',
    phase: 'ostry',
    daysSinceOnset: '2 dni po urazie na boisku',
    medicalHistory: 'Widoczny świeży obrzęk pourazowy i ocieplenie okolicy kostki bocznej (ostry stan zapalny).',
    isContraindicated: true,
    contraindicationReason: 'Ostry stan zapalny oraz obrzęki są przeciwwskazaniem do naświetlania lampą Sollux / ciepłolecznictwa (wg PDF).'
  },
  {
    id: 'scen_08',
    patientName: 'Magdalena Dąbrowska',
    age: 26,
    gender: 'K',
    modalityId: 'cryotherapy',
    locationId: 'staw_skokowy_kostka',
    diagnosis: 'Świeże skręcenie stawu skokowego (uszkodzenie więzadła ATFL)',
    phase: 'ostry',
    daysSinceOnset: '2 dni po urazie (kwalifikacja do 5 dni po urazie)',
    medicalHistory: 'Pacjentka wypoczęta, dobrze toleruje zimno, brak chorób tarczycy i naczyń, skóra nieuszkodzona.',
    isContraindicated: false
  },
  {
    id: 'scen_09',
    patientName: 'Aleksandra Szymańska',
    age: 31,
    gender: 'K',
    modalityId: 'cryotherapy',
    locationId: 'nadgarstek_reka_grzbietowa',
    diagnosis: 'Reumatoidalne zapalenie stawów (RZS) – bolesność drobnych stawów rąk',
    phase: 'podostry',
    daysSinceOnset: 'Zaostrzenie od 2 tygodni',
    medicalHistory: 'W wywiadzie zdiagnozowany Zespół Raynauda (napadowe blednięcie i sinienie palców pod wpływem zimna).',
    isContraindicated: true,
    contraindicationReason: 'Choroby, w których głównym czynnikiem wywoławczym jest zimno (np. zespół Raynauda), są bezwzględnym przeciwwskazaniem do krioterapii (wg PDF).'
  },
  {
    id: 'scen_10',
    patientName: 'Robert Woźniak',
    age: 49,
    gender: 'M',
    modalityId: 'ultrasound',
    locationId: 'staw_ramienny_tyl',
    diagnosis: 'Przykurcz tylnej torebki stawu ramiennego i tendinopatia m. podgrzebieniowego',
    phase: 'przewlekly',
    daysSinceOnset: 'Ograniczenie rotacji wewnętrznej od 6 miesięcy',
    medicalHistory: 'Brak implantów w barku, układ krążenia prawidłowy, brak przeciwwskazań internistycznych.',
    isContraindicated: false
  },
  {
    id: 'scen_11',
    patientName: 'Zofia Kozłowska',
    age: 52,
    gender: 'K',
    modalityId: 'thermotherapy',
    locationId: 'nadgarstek_reka_grzbietowa',
    diagnosis: 'Sztywność poranna i zmiany zwyrodnieniowe stawów rąk (okres przewlekły)',
    phase: 'przewlekly',
    daysSinceOnset: 'Objawy od 2 lat, bez aktualnego obrzęku',
    medicalHistory: 'Czucie temperatury prawidłowe, ciśnienie 125/80 mmHg, brak żylaków, obrzęków i chorób tarczycy.',
    isContraindicated: false
  },
  {
    id: 'scen_12',
    patientName: 'Stanisław Jankowski',
    age: 83,
    gender: 'M',
    modalityId: 'thermotherapy',
    locationId: 'kregoslup_ledzwiowy',
    diagnosis: 'Przewlekłe bóle krzyża na tle zmian zwyrodnieniowych',
    phase: 'przewlekly',
    daysSinceOnset: 'Bóle od kilku lat',
    medicalHistory: 'Wiek starczy (83 lata) oraz przebyty zawał mięśnia sercowego i niewydolność krążenia.',
    isContraindicated: true,
    contraindicationReason: 'Wiek starczy, stany pozawałowe oraz niewydolność krążenia są przeciwwskazaniami do zabiegów ciepłoleczniczych (wg PDF).'
  },
  {
    id: 'scen_13',
    patientName: 'Michał Mazur',
    age: 41,
    gender: 'M',
    modalityId: 'ultrasound',
    locationId: 'kregoslup_szyjny_zwoj',
    diagnosis: 'Zespół szyjno-ramienny – zakwalifikowany do schematu odgłowowego UD',
    phase: 'przewlekly',
    daysSinceOnset: 'Ból karku i drętwienie ręki od 3 miesięcy',
    medicalHistory: 'Brak implantów, układ krążenia i tarczyca zdrowe.',
    isContraindicated: false
  },
  {
    id: 'scen_14',
    patientName: 'Ewa Krawczyk',
    age: 36,
    gender: 'K',
    modalityId: 'ultrasound',
    locationId: 'staw_kolanowy_blizna',
    diagnosis: 'Blizna pooperacyjna po rekonstrukcji więzadła krzyżowego przedniego (ACL)',
    phase: 'przewlekly',
    daysSinceOnset: '8 tygodni po operacji – rana całkowicie wygojona, blizna zaciągająca',
    medicalHistory: 'Brak metalowych śrub (zastosowano śruby biowchłanialne), ciągłość naskórka w pełni zachowana.',
    isContraindicated: false
  },
  {
    id: 'scen_15',
    patientName: 'Jakub Piotrowski',
    age: 13,
    gender: 'M',
    modalityId: 'ultrasound',
    locationId: 'staw_kolanowy_szpara',
    diagnosis: 'Ból kolana po przeciążeniu treningowym (choroba Osgood-Schlattera)',
    phase: 'podostry',
    daysSinceOnset: 'Ból od 3 tygodni',
    medicalHistory: 'Pacjent w wieku rozwojowym (13 lat) – niezakończony wzrost kostny (chrząstki nasadowe).',
    isContraindicated: true,
    contraindicationReason: 'Okolica nasad kości u dzieci jest bezwzględnym przeciwwskazaniem do zabiegów ultradźwiękowych (wg PDF).'
  },
  {
    id: 'scen_16',
    patientName: 'Grzegorz Grabowski',
    age: 55,
    gender: 'M',
    modalityId: 'ultrasound',
    locationId: 'staw_skokowy_ostroga',
    diagnosis: 'Ostroga piętowa lewa / zapalenie rozcięgna podeszwowego',
    phase: 'przewlekly',
    daysSinceOnset: 'Ból pięty przy pierwszych krokach rano od 7 miesięcy',
    medicalHistory: 'Ogólnie zdrowy, brak zaburzeń krzepnięcia, żylaków i zakrzepicy.',
    isContraindicated: false
  },
  {
    id: 'scen_17',
    patientName: 'Natalia Pawlak',
    age: 33,
    gender: 'K',
    modalityId: 'laser',
    locationId: 'staw_ramienny_bok',
    diagnosis: 'Tendinopatia mięśnia nadgrzebieniowego prawego barku',
    phase: 'podostry',
    daysSinceOnset: 'Ból przy odwodzeniu ramienia od 3 tygodni',
    medicalHistory: 'Pacjentka 4 dni temu otrzymała iniekcję dostawową ze sterydu (Diprophos) w ten sam bark.',
    isContraindicated: true,
    contraindicationReason: 'Stosowanie leków sterydowych jest przeciwwskazaniem do laseroterapii (grozi odbarwieniami i reakcjami niepożądanymi wg PDF).'
  },
  {
    id: 'scen_18',
    patientName: 'Paweł Michalski',
    age: 27,
    gender: 'M',
    modalityId: 'magnetotherapy',
    locationId: 'nadgarstek_reka_grzbietowa',
    diagnosis: 'Stan po złamaniu kości łódeczkowatej – ręka unieruchomiona w opatrunku gipsowym',
    phase: 'ostry',
    daysSinceOnset: '5 dni po założeniu opatrunku gipsowego',
    medicalHistory: 'Brak implantów elektronicznych, bez gorączki i infekcji. Opatrunek gipsowy na przedramieniu i ręce.',
    isContraindicated: false
  },
  {
    id: 'scen_19',
    patientName: 'Dorota Nowakowska',
    age: 44,
    gender: 'K',
    modalityId: 'magnetostimulation',
    locationId: 'kregoslup_piersiowy',
    diagnosis: 'Przewlekłe bóle kręgosłupa piersiowego i wzmożone napięcie mięśniowe',
    phase: 'przewlekly',
    daysSinceOnset: 'Dolegliwości od 6 miesięcy (pacjentka nadwrażliwa na bodźce fizykalne)',
    medicalHistory: 'Brak implantów elektronicznych, bez chorób tarczycy i nowotworów.',
    isContraindicated: false
  },
  {
    id: 'scen_20',
    patientName: 'Andrzej Król',
    age: 62,
    gender: 'M',
    modalityId: 'polarized_light',
    locationId: 'nerw_trojdzielny',
    diagnosis: 'Nerwoból II gałęzi nerwu trójdzielnego',
    phase: 'podostry',
    daysSinceOnset: 'Napady bólu od 2 tygodni',
    medicalHistory: 'Brak gorączki i choroby nowotworowej, skóra czysta.',
    isContraindicated: false
  }
];
