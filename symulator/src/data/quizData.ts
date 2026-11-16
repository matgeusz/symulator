// Dane quizu „Wskazania i przeciwwskazania” – pozycje wzorcowe rozbite na „atomy” (pojedyncze pojęcia)
// z synonimami do inteligentnego dopasowania. Źródło treści: MODALITIES_DB (scenarios.ts).
//
// Składnia wzorców (pole k):
//   'rozruszn'          – dowolne słowo zaczynające się od „rozruszn” (po normalizacji: małe litery, bez ogonków)
//   'ostr+zapal'        – oba rdzenie muszą wystąpić (w dowolnej kolejności)
//   'zapalen+zyl+!zarostow' – rdzeń z „!” NIE może wystąpić
//   rdzenie ≤3 znaków (np. 'rak', 'sm', 'dna') dopasowujemy tylko jako całe słowo.

export interface Atom {
  id: string
  label: string
  /** indeks pozycji w tablicy indications / contraindications w MODALITIES_DB */
  src: number
  k: string[]
}

export interface QuizModality {
  id: string
  ind: Atom[]
  con: Atom[]
}

const a = (id: string, label: string, src: number, ...k: string[]): Atom => ({ id, label, src, k })

const RAW: QuizModality[] = [
  // ------------------------------------------------------------------ SOLLUX
  {
    id: 'sollux',
    ind: [
      a('i-zapal', 'Przewlekłe stany zapalne tkanek miękkich, stawów i tkanek okołostawowych', 0, 'przewlekl+zapal+!zatok', 'zapal+staw+!zatok', 'zapal+miekk', 'zapal+okolostaw'),
      a('i-zatoki', 'Przewlekłe stany zapalne zatok', 0, 'zatok'),
      a('i-uraz', 'Stany po urazach narządu ruchu', 1, 'uraz', 'pourazow', 'skrecen', 'stluczen', 'zwichn', 'zlaman'),
      a('i-bol', 'Zespoły bólowe', 2, 'bol', 'przeciwbol'),
      a('i-nerwobol', 'Nerwobóle (np. porażenie nerwu twarzowego)', 2, 'nerwobol', 'neuralg', 'twarzow', 'porazen'),
      a('i-oparz', 'Oparzenia', 3, 'oparzen'),
      a('i-odmroz', 'Odmrożenia', 3, 'odmrozen'),
      a('i-skora', 'Stany po przebytym bakteryjnym zapaleniu skóry', 3, 'bakteryj+skor', 'zapalen+skor', 'skor+zapal'),
      a('i-przyg', 'Przygotowanie (ogrzanie tkanek) przed masażem, ćwiczeniami lub innymi zabiegami', 4, 'przygotowan', 'ogrzan', 'rozgrzew', 'rozgrzan', 'przed+masaz', 'przed+cwiczen', 'przed+zabieg', 'przed+kinezyter'),
    ],
    con: [
      a('c-ostry', 'Ostry stan zapalny', 0, 'ostr+zapal', 'ostr+stan+!okres+!pourazow', 'zapalen+ostr'),
      a('c-obrzek', 'Obrzęki', 0, 'obrzek', 'obrzm'),
      a('c-krwaw', 'Skłonność do krwawień', 1, 'krwawi', 'krwotok', 'krzep', 'hemofil', 'skaza'),
      a('c-gorac', 'Gorączka', 2, 'goraczk', 'podgoraczk'),
      a('c-gruz', 'Gruźlica', 2, 'gruzlic', 'tbc'),
      a('c-zylaki', 'Żylaki', 3, 'zylak'),
      a('c-krazen', 'Choroby układu krążenia', 3, 'krazen+!obwod', 'serc', 'kardiolog', 'niewydoln'),
      a('c-nadcisn', 'Nadciśnienie tętnicze II stopnia', 3, 'nadcisn', 'cisnien+wysok', 'wysok+cisnien'),
      a('c-zarost', 'Zarostowe schorzenia naczyń', 4, 'zarostow'),
      a('c-zakrzep', 'Zakrzepowe zapalenie żył', 4, 'zakrzep', 'zapalen+zyl'),
      a('c-rozszerz', 'Rozszerzone naczynia krwionośne', 4, 'rozszerz', 'naczynk', 'teleangiek', 'pajaczk'),
      a('c-ukrwien', 'Zaburzenia ukrwienia naczyń obwodowych', 4, 'ukrwien', 'krazen+obwod', 'naczyn+obwod', 'obwodow'),
      a('c-nerki', 'Choroby nerek', 5, 'nerek', 'nerk', 'nefrolog'),
      a('c-watroba', 'Choroby wątroby', 5, 'watrob', 'hepat'),
      a('c-niedokrw', 'Niedokrwistość', 5, 'niedokrwist', 'anemi', 'malokrwist'),
      a('c-nowotw', 'Choroby nowotworowe', 6, 'nowotw', 'rak', 'onkolog'),
      a('c-wrzod', 'Choroba wrzodowa', 6, 'wrzod'),
      a('c-wyniszcz', 'Stan ogólnego wyniszczenia organizmu', 7, 'wyniszcz', 'kacheks'),
    ],
  },
  // ------------------------------------------------------------------ LASER
  {
    id: 'laser',
    ind: [
      a('i-zapal', 'Ostre, podostre i przewlekłe stany zapalne tkanek miękkich, stawów i tkanek okołostawowych', 0, 'zapal', 'zapaln'),
      a('i-obrzek', 'Obrzęki', 1, 'obrzek'),
      a('i-rany', 'Trudno gojące się rany', 1, 'rany', 'rana', 'gojen', 'gojac', 'owrzodz'),
      a('i-odlez', 'Odleżyny', 1, 'odlez'),
      a('i-blizny', 'Blizny', 1, 'blizn'),
      a('i-n7', 'Porażenie nerwu twarzowego', 2, 'porazen', 'twarzow', 'vii'),
      a('i-nerwobol', 'Nerwobóle', 2, 'nerwobol', 'neuralg', 'bol+nerw'),
      a('i-kosci', 'Uszkodzenia tkanki kostnej (pęknięcia, złamania – przyspieszenie zrostu)', 3, 'kost', 'zlaman', 'peknie', 'zrost'),
    ],
    con: [
      a('c-nowotw', 'Choroba nowotworowa', 0, 'nowotw', 'rak', 'onkolog'),
      a('c-ciaza', 'Ciąża', 1, 'ciaz'),
      a('c-tarczyca', 'Nadczynność tarczycy', 2, 'nadczynnosc', 'tarczyc', 'hipertyreoz'),
      a('c-oczy', 'Naświetlanie gałek ocznych', 3, 'galk', 'oczn', 'oczu', 'oczy', 'oko', 'wzrok'),
      a('c-gorac', 'Gorączka', 4, 'goraczk', 'podgoraczk'),
      a('c-steryd', 'Stosowanie leków sterydowych (ryzyko odbarwień i reakcji niepożądanych)', 5, 'steryd', 'kortykoster', 'steroid', 'glikokortyko', 'kortyzon', 'kortyzol'),
      a('c-infekcje', 'Ostre choroby bakteryjne, wirusowe i grzybicze', 6, 'bakteri', 'wirus', 'grzyb', 'zakazn', 'infekcj'),
    ],
  },
  // ------------------------------------------------------------------ ŚWIATŁO SPOLARYZOWANE
  {
    id: 'polarized_light',
    ind: [
      a('i-blizny', 'Bliznowce', 0, 'blizn'),
      a('i-rany', 'Rany pooperacyjne', 0, 'pooperac', 'rany', 'rana'),
      a('i-oparz', 'Oparzenia', 0, 'oparzen'),
      a('i-odmroz', 'Odmrożenia', 0, 'odmrozen'),
      a('i-odlez', 'Odleżyny', 0, 'odlez'),
      a('i-dermat', 'Dermatozy', 0, 'dermatoz', 'skorn', 'wyprysk'),
      a('i-opryszcz', 'Opryszczka', 0, 'opryszcz', 'herpes'),
      a('i-polpas', 'Półpasiec', 0, 'polpas'),
      a('i-starzenie', 'Starzenie się skóry', 0, 'starzen', 'zmarszcz', 'odmlodz'),
      a('i-kregoslup', 'Ból kręgosłupa', 1, 'kregosl', 'plecow', 'plecy'),
      a('i-dysk', 'Dyskopatia', 1, 'dyskopat', 'dysk', 'przepukl'),
      a('i-korzenie', 'Zapalenie korzeni nerwowych', 1, 'korzen', 'korzonk', 'rwa'),
      a('i-neuralg', 'Bóle neuralgiczne', 1, 'neuralg', 'nerwobol'),
      a('i-miesn', 'Bóle mięśniowe', 1, 'miesn', 'mialg'),
      a('i-stawy', 'Choroby stawów', 2, 'staw', 'artroz', 'zwyrodnien', 'reumat'),
      a('i-buerger', 'Choroba Buergera', 2, 'buerger', 'zakrzepow+zarostow'),
      a('i-zylaki', 'Żylaki', 2, 'zylak'),
      a('i-stopa', 'Stopa cukrzycowa', 2, 'cukrzyc'),
      a('i-depres', 'Depresja sezonowa', 2, 'depres', 'sezonow'),
    ],
    con: [a('c-gorac', 'Gorączka', 0, 'goraczk', 'podgoraczk'), a('c-nowotw', 'Choroba nowotworowa', 1, 'nowotw', 'rak', 'onkolog')],
  },
  // ------------------------------------------------------------------ KRIOTERAPIA
  {
    id: 'cryotherapy',
    ind: [
      a('i-uraz', 'Stany po urazach i przeciążeniach (do 5 dni po urazie)', 0, 'uraz', 'przeciaz'),
      a('i-zlam', 'Złamania', 0, 'zlaman'),
      a('i-skrec', 'Skręcenia', 0, 'skrecen'),
      a('i-zwich', 'Zwichnięcia', 0, 'zwichn'),
      a('i-obrzek', 'Obrzęki pourazowe', 0, 'obrzek'),
      a('i-oparz', 'Oparzenia (świeże)', 1, 'oparzen'),
      a('i-dysk', 'Dyskopatie', 2, 'dyskopat', 'dysk', 'przepukl'),
      a('i-nerwobol', 'Nerwobóle nerwów obwodowych', 2, 'nerwobol', 'neuralg', 'nerw+obwod'),
      a('i-napiecie', 'Wzmożone napięcie mięśniowe', 2, 'napiec', 'spastycz', 'wzmozon'),
      a('i-sm', 'Stwardnienie rozsiane (SM)', 2, 'sm', 'stwardnien', 'rozsian'),
      a('i-zwyrod', 'Choroby zwyrodnieniowe stawów', 3, 'zwyrodnien', 'artroz'),
      a('i-rzs', 'RZS (reumatoidalne zapalenie stawów)', 3, 'rzs', 'reumatoid', 'reumatycz'),
      a('i-lusz', 'Artropatia łuszczycowa', 3, 'luszcz', 'psoriat', 'artropat'),
    ],
    con: [
      a('c-zimno', 'Nadwrażliwość na zimno', 0, 'zimn', 'chlod'),
      a('c-raynaud', 'Zespół Raynauda', 0, 'raynaud', 'rejno'),
      a('c-sudeck', 'Zespół Sudecka', 1, 'sudeck'),
      a('c-popromien', 'Zmiany skórne popromienne', 2, 'popromien', 'radioterap'),
      a('c-skora', 'Uszkodzenia skóry', 2, 'uszkodzen+skor', 'skor+uszkodz', 'rany', 'rana'),
      a('c-odmroz', 'Odmrożenia', 2, 'odmrozen'),
      a('c-tarczyca', 'Nadczynność tarczycy', 3, 'nadczynnosc', 'tarczyc', 'hipertyreoz'),
      a('c-miazdz', 'Miażdżyca zaawansowana', 4, 'miazdzyc', 'arterioskler'),
      a('c-pecherz', 'Zapalenie pęcherza moczowego', 5, 'pecherz', 'cystit'),
      a('c-miednicz', 'Zapalenie miedniczek nerkowych', 5, 'miedniczk', 'pielonefr', 'nerk'),
      a('c-wyniszcz', 'Stany ogólnego wyniszczenia i osłabienia', 6, 'wyniszcz', 'oslabien', 'kacheks'),
      a('c-cisnienie', 'KRIOKOMORA: wysokie / nieustabilizowane ciśnienie tętnicze', 7, 'cisnien', 'nadcisn'),
    ],
  },
  // ------------------------------------------------------------------ CIEPŁOLECZNICTWO
  {
    id: 'thermotherapy',
    ind: [
      a('i-rzs', 'RZS w okresie przewlekłym', 0, 'rzs', 'reumatoid', 'reumatycz', 'remisj'),
      a('i-zwyrod', 'Choroba zwyrodnieniowa stawów', 0, 'zwyrodnien', 'artroz'),
      a('i-uraz', 'Stany pourazowe po okresie ostrym', 0, 'uraz', 'pourazow'),
      a('i-kulszowa', 'Rwa kulszowa', 1, 'kulszow'),
      a('i-ramienna', 'Rwa ramienna', 1, 'ramienn'),
      a('i-nerwy-ob', 'Zapalenia nerwów obwodowych (po ustąpieniu okresu ostrego)', 1, 'zapalen+nerw+obwod', 'nerw+obwod', 'nerwow+obwod'),
      a('i-n7', 'Porażenie nerwu twarzowego (maseczki parafinowe)', 1, 'twarzow', 'porazen', 'maseczk', 'vii'),
      a('i-oddech', 'Przewlekłe nieżyty dróg oddechowych', 2, 'oddech', 'niezyt', 'oskrzel', 'krtan', 'gardl'),
      a('i-zolc', 'Przewlekłe zapalenie pęcherzyka żółciowego', 2, 'zolci', 'zolcz', 'pecherzyk'),
      a('i-mocz', 'Przewlekłe zapalenia dróg moczowych', 2, 'moczow'),
      a('i-jelito', 'Spastyczne zapalenie jelita grubego', 2, 'jelit', 'spastycz+jelit'),
      a('i-kamica', 'Kamica nerkowa', 2, 'kamic', 'nerkow'),
      a('i-kobiec', 'Schorzenia kobiece', 2, 'kobiec', 'ginekolog', 'przydatk', 'rodn', 'macic', 'jajnik'),
      a('i-dna', 'Dna (zaburzenia przemiany materii)', 3, 'dna', 'dnawy', 'podagr'),
      a('i-otyl', 'Otyłość', 3, 'otyl'),
      a('i-tradzik', 'Trądzik i czyraczność', 3, 'tradzik', 'czyrak', 'czyraczk'),
      a('i-przykurcz', 'Przykurcze stawowe', 3, 'przykurcz'),
      a('i-blizny', 'Blizny', 3, 'blizn'),
    ],
    con: [
      a('c-ostry', 'Ostre stany zapalne', 0, 'ostr+zapal', 'ostr+stan+!okres+!pourazow', 'zapalen+ostr'),
      a('c-obrzek', 'Obrzęki niezależnie od etiologii', 0, 'obrzek'),
      a('c-niewydoln', 'Niewydolność krążenia', 1, 'niewydoln', 'krazen'),
      a('c-pozawal', 'Stany pozawałowe', 1, 'pozawal', 'zawal'),
      a('c-nadcisn', 'Choroba nadciśnieniowa', 1, 'nadcisn', 'cisnien'),
      a('c-naczynka', 'Rozszerzone naczynka', 1, 'naczynk', 'rozszerz', 'teleangiek', 'pajaczk'),
      a('c-gruz', 'Gruźlica', 2, 'gruzlic', 'tbc'),
      a('c-ciaza', 'Ciąża', 3, 'ciaz'),
      a('c-tarczyca', 'Nadczynność tarczycy', 4, 'nadczynnosc', 'tarczyc', 'hipertyreoz'),
      a('c-psych', 'Choroby psychiczne', 5, 'psychicz', 'psychiatr'),
      a('c-uczul', 'Uczulenie na ciepło', 5, 'uczulen', 'alergi', 'nadwrazliw'),
      a('c-wyniszcz', 'Wyniszczenie lub osłabienie organizmu', 6, 'wyniszcz', 'oslab'),
      a('c-wiek', 'Wiek starczy', 6, 'starcz', 'wiek', 'podeszl', 'senior', 'starsz'),
      a('c-wrzod', 'Choroba wrzodowa dróg pokarmowych', 7, 'wrzod'),
    ],
  },
  // ------------------------------------------------------------------ ULTRADŹWIĘKI
  {
    id: 'ultrasound',
    ind: [
      a('i-zwyrod', 'Choroba zwyrodnieniowa kręgosłupa i stawów', 0, 'zwyrodnien+!zapalno', 'artroz'),
      a('i-bol', 'Zespoły bólowe (rwa kulszowa, ramienna)', 0, 'bol', 'kulszow', 'ramienn', 'rwa'),
      a('i-zapalno', 'Zmiany zapalno-zwyrodnieniowe', 1, 'zapalno', 'zapaln+zwyrodn'),
      a('i-ostroga', 'Ostroga piętowa', 1, 'ostrog', 'pietow'),
      a('i-lokiec', 'Łokieć tenisisty / golfisty', 1, 'lokiec', 'tenisist', 'golfist'),
      a('i-blizny', 'Blizny', 2, 'blizn'),
      a('i-dupuytren', 'Przykurcz Dupuytrena', 2, 'dupuytren', 'dupuitren', 'przykurcz', 'kontraktur'),
      a('i-przykurcz-staw', 'Przykurcze stawowe', 2, 'przykurcz+staw', 'staw+przykurcz', 'przykurcz+ruchomosc'),
      a('i-zwlokn', 'Zwłókniałe mięśnie i torebki stawowe', 2, 'zwlokni', 'torebk'),
      a('i-nerwobol', 'Nerwobóle', 3, 'nerwobol', 'neuralg'),
      a('i-poamput', 'Bóle poamputacyjne', 3, 'amputac', 'poamput', 'fantom'),
    ],
    con: [
      a('c-nowotw', 'Nowotwory', 0, 'nowotw', 'rak', 'onkolog'),
      a('c-ostry', 'Ostre stany zapalne przebiegające z gorączką', 1, 'ostr+zapal', 'ostr+stan+!okres+!pourazow', 'goraczk'),
      a('c-zwapn', 'Zaawansowane zwapnienie naczyń', 2, 'zwapnien', 'miazdzyc'),
      a('c-zakrzep', 'Zakrzepowe zapalenie żył', 2, 'zakrzepow', 'zapalen+zyl'),
      a('c-zylaki', 'Żylaki', 2, 'zylak'),
      a('c-zakrzepica', 'Zakrzepica', 2, 'zakrzepic', 'zakrzep+!zapalen'),
      a('c-krzep', 'Zaburzenia krzepnięcia krwi', 2, 'krzep', 'skaza', 'hemofil'),
      a('c-wyniszcz', 'Wyniszczenie organizmu', 3, 'wyniszcz', 'kacheks'),
      a('c-rozruszn', 'Wszczepiony rozrusznik serca', 4, 'rozruszn', 'stymulator', 'kardiostym'),
      a('c-niewydoln', 'Niewydolność krążenia', 4, 'niewydoln', 'krazen'),
      a('c-rytm', 'Zaburzenia rytmu serca', 4, 'rytm', 'arytmi'),
      a('c-metal', 'Metalowe implanty w polu zabiegowym (np. endoproteza, zespolenia)', 5, 'metal', 'implant', 'endoprotez', 'zespoleni', 'srub', 'plytk'),
      a('c-nasady', 'Okolica nasad kości u dzieci', 6, 'nasad', 'dziec', 'epifiz', 'chrzestn'),
      a('c-ciaza', 'Ciąża', 7, 'ciaz'),
      a('c-osteopor', 'Zaawansowana osteoporoza', 8, 'osteopor'),
      a('c-nerwica', 'Nerwica wegetatywna', 9, 'nerwic', 'wegetat'),
      a('c-ciaglosc', 'Przerwanie ciągłości tkanki w miejscu zabiegu', 10, 'przerwan', 'ciaglosc', 'rana', 'rany', 'owrzodz'),
    ],
  },
  // ------------------------------------------------------------------ MAGNETOTERAPIA
  {
    id: 'magnetotherapy',
    ind: [
      a('i-zwyrod', 'Choroba zwyrodnieniowa stawów kończyn i kręgosłupa', 0, 'zwyrodnien', 'artroz'),
      a('i-zapstaw', 'Zapalenie stawów i tkanek okołostawowych', 0, 'zapalen+staw', 'okolostaw', 'reumat', 'zapal+!nerw+!oskrzel+!zatok+!pourazow'),
      a('i-zlaman', 'Złamania (również w opatrunku gipsowym!)', 1, 'zlaman', 'gips'),
      a('i-skrec', 'Skręcenia', 1, 'skrecen'),
      a('i-zwichn', 'Zwichnięcia', 1, 'zwichn'),
      a('i-uraz', 'Pourazowe choroby narządu ruchu', 1, 'uraz', 'pourazow'),
      a('i-osteopor', 'Osteoporoza', 2, 'osteopor'),
      a('i-rzekome', 'Stawy rzekome', 2, 'rzekom'),
      a('i-gojenie', 'Utrudnione gojenie ran', 2, 'gojen', 'rany', 'rana', 'trudno'),
      a('i-owrzodz', 'Owrzodzenia troficzne', 2, 'owrzodz', 'troficz'),
      a('i-krazen', 'Zaburzenia krążenia obwodowego', 3, 'krazen', 'ukrwien', 'obwodow'),
      a('i-nerwy', 'Stany zapalne nerwów', 3, 'nerw', 'nerwobol', 'neuralg'),
      a('i-przemiana', 'Zaburzenia przemiany materii', 3, 'przemian+materi', 'metabol'),
      a('i-oskrzela', 'Zapalenie oskrzeli', 3, 'oskrzel'),
      a('i-zatoki', 'Zapalenie zatok', 3, 'zatok'),
    ],
    con: [
      a('c-ciaza', 'Ciąża', 0, 'ciaz'),
      a('c-nowotw', 'Choroba nowotworowa', 1, 'nowotw', 'rak', 'onkolog'),
      a('c-implant', 'Elektroniczne implanty (np. rozrusznik serca, pompa insulinowa, implant ślimakowy)', 2, 'rozruszn', 'implant', 'pomp', 'insulin', 'slimak', 'stymulator', 'elektroniczn', 'kardiostym'),
      a('c-gruz', 'Czynna gruźlica', 3, 'gruzlic', 'tbc'),
      a('c-infekcje', 'Ostre infekcje bakteryjne i wirusowe, grzybica', 4, 'infekcj', 'bakteri', 'wirus', 'grzyb', 'zakazn'),
      a('c-zarost', 'Zarostowe zapalenie żył', 5, 'zarostow'),
      a('c-zakrzep', 'Zakrzepowe zapalenie żył', 5, 'zakrzep', 'zapalen+zyl+!zarostow'),
      a('c-krwaw', 'Skłonność do krwawień', 5, 'krwawi', 'krzep', 'krwotok', 'skaza'),
      a('c-gorac', 'Gorączka', 6, 'goraczk', 'podgoraczk'),
      a('c-serce', 'Ciężkie choroby serca i układu krążenia', 7, 'serc', 'krazen', 'kardiolog', 'niewydoln'),
    ],
  },
  // ------------------------------------------------------------------ MAGNETOSTYMULACJA
  {
    id: 'magnetostimulation',
    ind: [
      a('i-migrena', 'Bóle migrenowe', 0, 'migren', 'bol+glow'),
      a('i-zwyrod', 'Zmiany zwyrodnieniowe kręgosłupa i stawów', 0, 'zwyrodnien', 'artroz'),
      a('i-uraz', 'Urazy', 0, 'uraz'),
      a('i-odlez', 'Odleżyny', 1, 'odlez'),
      a('i-oparz', 'Oparzenia', 1, 'oparzen'),
      a('i-rzekome', 'Stawy rzekome', 1, 'rzekom'),
      a('i-angiopat', 'Angiopatia cukrzycowa', 1, 'angiopat', 'cukrzyc'),
      a('i-krwiak', 'Krwiaki', 1, 'krwiak'),
      a('i-owrzodz', 'Owrzodzenia podudzi', 1, 'owrzodz', 'podudz', 'goleni'),
      a('i-udar', 'Stany po udarach mózgu', 2, 'udar', 'mozg'),
      a('i-spast', 'Schorzenia neurologiczne ze spastycznością', 2, 'spastycz', 'neurolog', 'napiec'),
      a('i-nerwica', 'Nerwice', 3, 'nerwic'),
      a('i-sen', 'Zaburzenia snu i koncentracji', 3, 'snu', 'sen', 'bezsenn', 'koncentr'),
      a('i-restyt', 'Restytucja powysiłkowa po treningu sportowym', 3, 'restytuc', 'powysilk', 'trening', 'sport', 'regeneracj', 'odnow+biolog'),
      a('i-stomat', 'Stomatologia', 3, 'stomatolog', 'zeb', 'zeby', 'okolowierzcholk', 'znieczulen', 'chirurg'),
    ],
    con: [
      a('c-ciaza', 'Ciąża', 0, 'ciaz'),
      a('c-nowotw', 'Choroba nowotworowa', 1, 'nowotw', 'rak', 'onkolog'),
      a('c-tarczyca', 'Nadczynność tarczycy', 2, 'nadczynnosc', 'tarczyc', 'hipertyreoz'),
      a('c-krwaw', 'Krwawienia z przewodu pokarmowego', 3, 'krwawi', 'pokarm', 'jelit', 'zoladk', 'krwotok'),
      a('c-przeszczep', 'Stany po przeszczepach narządów', 4, 'przeszczep', 'transplant'),
      a('c-implant', 'Implanty elektroniczne (np. rozrusznik serca)', 5, 'rozruszn', 'implant', 'elektroniczn', 'stymulator', 'kardiostym'),
      a('c-infekcje', 'Infekcje pochodzenia wirusowego, bakteryjnego i grzybiczego', 6, 'infekcj', 'bakteri', 'wirus', 'grzyb', 'zakazn'),
    ],
  },
]

// ---------------------------------------------------------------------------------------------
// Dodatkowe synonimy / skróty kliniczne dopisywane do atomów, które zawierają dany wzorzec-wyzwalacz.
// ---------------------------------------------------------------------------------------------
const EXTRA_BY_TRIGGER: [string, string[]][] = [
  ['ciaz', ['ciezarn', 'brzemienn']],
  ['nowotw', ['guz', 'rak', 'onkolog', 'nowotwor', 'czerniak', 'miesak', 'bialaczk', 'chloniak', 'przerzut', 'neoplazj']],
  ['rozruszn', ['kardiostym', 'defibrylator', 'pomp+insulin', 'implant+elektroniczn', 'stymulator+serc', 'stymulator+elektr', 'elektroniczn+implant']],
  ['ostr+zapal', ['ostr+faz', 'faz+ostr']],
  ['obrzek', ['opuchl', 'puchn', 'opuch']],
  ['goraczk', ['podwyzsz+temperatur', 'temperatur+podwyzsz', 'wysok+temperatur', 'stan+podgoraczk', 'goraczkow']],
  ['nadczynnosc', ['tarczyc', 'hipertyreoz', 'tyreotoksyk', 'nadczynn+tarczyc']],
  ['steryd', ['glikokortykosteroid', 'kortykosteroid', 'blokad+steryd', 'sterydow', 'kortyzon', 'encorton', 'prednizon', 'dexamet']],
  ['zakrzep', ['zator', 'zatory', 'zatorow', 'zakrzepic', 'zakrzepow']],
  ['zakrzepic', ['zator', 'zatory', 'zatorow']],
  ['krwawi', ['krwotok', 'sklonnosc+krwaw', 'zaburzen+krzep', 'krzep', 'skaza', 'hemofil', 'wybroczyn', 'siniak']],
  ['nasad', ['chrzastk+wzrost', 'wzrostow', 'dzieci+nasad', 'nasad+kost', 'epifiz']],
  ['przerwan', ['uszkodzen+skor', 'skor+uszkodz', 'otwart+ran', 'ran+otwart', 'rana', 'rany', 'ciaglosc+tkank']],
  ['starcz', ['starosc', 'podeszl', 'podeszl+wiek', 'starsz+wiek', 'wiek+zaawansowan']],
  ['reumatoid', ['reumatoidaln', 'rzs', 'reumatyzm']],
  ['artroz', ['gonartroz', 'koksartroz', 'osteoartroz', 'spondyloz']],
  ['blizn', ['keloid', 'bliznow', 'bliznowc']],
  ['przykurcz', ['dupuytren', 'dupuitren', 'kontraktur']],
  ['zylak', ['niewydoln+zyl', 'zyln+niewydoln']],
]

const EXTRA_BY_ID: Record<string, string[]> = {
  'ultrasound:i-bol': ['rwa', 'korzonk', 'korzen', 'dyskopat', 'dysk', 'przepukl', 'lumbago', 'lumbalg', 'ischias', 'kulszow'],
  'polarized_light:i-korzenie': ['rwa', 'korzonk', 'rwa+kulszow', 'rwa+ramienn', 'ischias'],
  'polarized_light:i-dysk': ['dyskopat', 'dysk', 'przepukl'],
  'cryotherapy:i-dysk': ['dyskopat', 'dysk', 'przepukl'],
  'ultrasound:i-zwyrod': ['spondyloz'],
  'magnetotherapy:i-zwyrod': ['zwyrodnien', 'artroz', 'gonartroz', 'koksartroz', 'spondyloz'],
}

export const QUIZ: QuizModality[] = RAW.map((m) => {
  const patch = (atoms: Atom[]): Atom[] =>
    atoms.map((at) => {
      const extra = new Set<string>(at.k)
      for (const [trig, syn] of EXTRA_BY_TRIGGER) if (at.k.includes(trig)) syn.forEach((s) => extra.add(s))
      ;(EXTRA_BY_ID[m.id + ':' + at.id] ?? []).forEach((s) => extra.add(s))
      return { ...at, k: [...extra] }
    })
  return { id: m.id, ind: patch(m.ind), con: patch(m.con) }
})

export const QUIZ_BY_ID: Record<string, QuizModality> = Object.fromEntries(QUIZ.map((m) => [m.id, m]))