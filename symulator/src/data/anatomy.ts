// Geometria mapy anatomicznej (układ współrzędnych SVG 1000 x 1400 – pliki Muscular_system*.svg)
// + pozycje ułożeniowe i punkty palpacyjne (dystraktory) dla 20 okolic z scenarios.ts.
// Współrzędne podane są dla PRAWEJ strony pacjenta (w widoku z przodu = lewa strona ekranu,
// w widoku z tyłu = prawa strona ekranu); dla strony lewej odbijamy je względem osi ciała.

export type View = 'front' | 'back' | 'side'
export type Side = 'P' | 'L'

export interface Pt {
  x: number
  y: number
}

export interface Target {
  x: number
  y: number
  r?: number
  rx?: number
  ry?: number
}

export interface PathDef {
  id: string
  label: string
  pts: Pt[]
  /** tylko dla wybranych modalności (id z MODALITIES_DB); brak = wszystkie */
  mods?: string[]
  /** rysuj również odbicie względem osi ciała (kręgosłup – obie strony przykręgosłupowo) */
  sym?: boolean
  smooth?: boolean
  /** jeżeli ustawione – ścieżka widoczna tylko dla wybranej metody UD w kręgosłupie */
  usMethod?: string
}

export interface Zone {
  id: string
  label: string
  x: number
  y: number
  r?: number
  rx?: number
  ry?: number
  /** linia (np. granica C3) */
  x2?: number
  y2?: number
}

export interface Landmark {
  id: string
  label: string
  x: number
  y: number
}

export interface Geom {
  view: View
  /** struktura w linii pośrodkowej – nie odbijamy dla strony lewej */
  mid?: boolean
  targets: Target[]
  zoom: { cx: number; cy: number; w: number }
  paths: PathDef[]
  avoid: Zone[]
  marks: Landmark[]
}

export const CENTER: Record<View, number> = { front: 488, back: 492, side: 500 }

// -------------------------------------------------------------------------------------------
// GEOMETRIA 20 OKOLIC
// -------------------------------------------------------------------------------------------
const G: Record<string, Geom> = {
  nerw_twarzowy: {
    view: 'front',
    targets: [{ x: 440, y: 148, r: 24 }],
    zoom: { cx: 485, cy: 125, w: 280 },
    paths: [
      {
        id: 'vii',
        label: 'Pień n. VII przed uchem → odgałęzienia na policzku (gęsia stopka)',
        pts: [
          { x: 433, y: 141 },
          { x: 442, y: 148 },
          { x: 452, y: 156 },
          { x: 462, y: 164 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'eye', label: 'Gałka oczna – bezwzględna ochrona', x: 460, y: 121, rx: 13, ry: 9 },
      { id: 'ear', label: 'Przewód słuchowy / ucho – zabezpieczyć gazą', x: 425, y: 127, rx: 8, ry: 19 },
    ],
    marks: [
      { id: 'fossa', label: 'Dół zażuchwowy', x: 434, y: 146 },
      { id: 'mastoid', label: 'Wyrostek sutkowaty', x: 419, y: 142 },
    ],
  },
  nerw_trojdzielny: {
    view: 'front',
    targets: [
      { x: 462, y: 108, r: 13 },
      { x: 460, y: 134, r: 13 },
      { x: 460, y: 184, r: 13 },
    ],
    zoom: { cx: 485, cy: 125, w: 280 },
    paths: [
      {
        id: 'v-pts',
        label: 'Aplikacja punktowa w rzucie punktów Valleixa (V1 – V2 – V3)',
        pts: [
          { x: 462, y: 108 },
          { x: 460, y: 134 },
          { x: 460, y: 184 },
        ],
        smooth: false,
      },
    ],
    avoid: [{ id: 'eye', label: 'Gałki oczne – zakaz naświetlania / nadźwiękawiania', x: 460, y: 121, rx: 13, ry: 8 }],
    marks: [
      { id: 'v1', label: 'V1 – wcięcie nadoczodołowe', x: 462, y: 108 },
      { id: 'v2', label: 'V2 – otwór podoczodołowy', x: 460, y: 134 },
      { id: 'v3', label: 'V3 – otwór bródkowy', x: 460, y: 184 },
    ],
  },
  kregoslup_szyjny_zwoj: {
    view: 'back',
    mid: true,
    targets: [
      { x: 508, y: 212, rx: 24, ry: 48 },
      { x: 476, y: 212, rx: 24, ry: 48 },
    ],
    zoom: { cx: 492, cy: 250, w: 360 },
    paths: [
      {
        id: 'para-c',
        label: 'Pasy 2 cm bocznie od wyrostków kolczystych – stop na linii C3',
        pts: [
          { x: 508, y: 262 },
          { x: 508, y: 182 },
        ],
        sym: true,
        usMethod: 'segmentarna',
      },
      {
        id: 'odglow',
        label: 'Schemat odgłowowy: od Th8 w stronę C3 + mięśnie karku (0,1–0,2 W/cm²)',
        pts: [
          { x: 510, y: 470 },
          { x: 512, y: 390 },
          { x: 510, y: 310 },
          { x: 508, y: 250 },
          { x: 508, y: 184 },
        ],
        sym: true,
        smooth: true,
        mods: ['ultrasound'],
        usMethod: 'odgłowowy',
      },
      {
        id: 'para-c-other',
        label: 'Aplikacja przykręgosłupowa 2 cm od linii wyrostków kolczystych',
        pts: [
          { x: 508, y: 262 },
          { x: 508, y: 186 },
        ],
        sym: true,
        mods: ['laser', 'sollux', 'polarized_light', 'thermotherapy', 'cryotherapy', 'magnetotherapy', 'magnetostimulation'],
      },
    ],
    avoid: [
      { id: 'c3', label: 'Granica C3 – NIE przekraczać w UD (rdzeń przedłużony)', x: 450, y: 176, x2: 534, y2: 176 },
      { id: 'spinous', label: 'Linia wyrostków kolczystych', x: 492, y: 178, x2: 492, y2: 262 },
    ],
    marks: [
      { id: 'c7', label: 'C7 – vertebra prominens', x: 492, y: 250 },
      { id: 'c3', label: 'C3', x: 492, y: 183 },
    ],
  },
  kregoslup_piersiowy: {
    view: 'back',
    mid: true,
    targets: [
      { x: 510, y: 430, rx: 28, ry: 105 },
      { x: 474, y: 430, rx: 28, ry: 105 },
    ],
    zoom: { cx: 515, cy: 400, w: 400 },
    paths: [
      {
        id: 'para-th',
        label: 'Pasy przykręgosłupowe 2 cm od wyrostków kolczystych wzdłuż prostownika grzbietu',
        pts: [
          { x: 510, y: 330 },
          { x: 510, y: 530 },
        ],
        sym: true,
      },
    ],
    avoid: [
      { id: 'spinous', label: 'Wyrostki kolczyste kręgów', x: 492, y: 270, x2: 492, y2: 560 },
      { id: 'scap', label: 'Kąt dolny łopatki (wystający element kostny)', x: 546, y: 398, r: 14 },
    ],
    marks: [
      { id: 'c7', label: 'C7', x: 492, y: 250 },
      { id: 'th3', label: 'Grzebień łopatki = Th3', x: 492, y: 316 },
      { id: 'th7', label: 'Linia dolnych kątów łopatek = Th7', x: 492, y: 398 },
    ],
  },
  kregoslup_ledzwiowy: {
    view: 'back',
    mid: true,
    targets: [
      { x: 510, y: 590, rx: 28, ry: 70 },
      { x: 474, y: 590, rx: 28, ry: 70 },
    ],
    zoom: { cx: 530, cy: 590, w: 340 },
    paths: [
      {
        id: 'para-l',
        label: 'Pasy przykręgosłupowe 2 cm od wyrostków kolczystych L1–L5',
        pts: [
          { x: 510, y: 530 },
          { x: 510, y: 640 },
        ],
        sym: true,
        usMethod: 'segmentarna',
      },
      {
        id: 'odogon',
        label: 'Schemat odogonowy: kość krzyżowa → brzeg S-I → pod grzebieniem → wzdłuż kręgosłupa do Th8',
        pts: [
          { x: 505, y: 672 },
          { x: 548, y: 662 },
          { x: 580, y: 640 },
          { x: 560, y: 600 },
          { x: 512, y: 560 },
          { x: 512, y: 500 },
          { x: 510, y: 468 },
        ],
        smooth: true,
        mods: ['ultrasound'],
        usMethod: 'odogonowy',
      },
      {
        id: 'para-l-other',
        label: 'Aplikacja przykręgosłupowa 2 cm od wyrostków kolczystych',
        pts: [
          { x: 510, y: 530 },
          { x: 510, y: 650 },
        ],
        sym: true,
        mods: ['laser', 'sollux', 'polarized_light', 'thermotherapy', 'cryotherapy', 'magnetotherapy', 'magnetostimulation'],
      },
    ],
    avoid: [
      { id: 'spinous', label: 'Wyrostki kolczyste L1–L5', x: 492, y: 520, x2: 492, y2: 650 },
      { id: 'crest', label: 'Grzebień kości biodrowej – bezpośrednio nad kością', x: 590, y: 610, r: 18 },
    ],
    marks: [
      { id: 'tuffier', label: 'Linia Tuffiera (grzebienie biodrowe) = L4', x: 492, y: 598 },
      { id: 'psis', label: 'KBTG ≈ S2 / stawy krzyżowo-biodrowe', x: 530, y: 648 },
    ],
  },
  staw_ramienny_przod: {
    view: 'front',
    targets: [{ x: 346, y: 312, r: 30 }],
    zoom: { cx: 360, cy: 310, w: 330 },
    paths: [
      {
        id: 'groove',
        label: 'Krótkie pasy w rzucie bruzdy międzyguzkowej i przedniej torebki',
        pts: [
          { x: 336, y: 296 },
          { x: 342, y: 314 },
          { x: 348, y: 334 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'acromion', label: 'Wyrostek barkowy łopatki', x: 320, y: 278, r: 16 },
      { id: 'ac', label: 'Koniec barkowy obojczyka', x: 342, y: 266, r: 11 },
    ],
    marks: [
      { id: 'coracoid', label: 'Wyrostek kruczy', x: 362, y: 300 },
      { id: 'groove', label: 'Bruzda międzyguzkowa', x: 342, y: 320 },
    ],
  },
  staw_ramienny_bok: {
    view: 'front',
    targets: [{ x: 316, y: 298, r: 28 }],
    zoom: { cx: 340, cy: 300, w: 330 },
    paths: [
      {
        id: 'supra',
        label: 'Aplikacja lokalna tuż pod boczną krawędzią wyrostka barkowego',
        pts: [
          { x: 304, y: 294 },
          { x: 318, y: 300 },
          { x: 332, y: 304 },
        ],
        smooth: true,
      },
    ],
    avoid: [{ id: 'acromion', label: 'Wyrostek barkowy (wyniosłość kostna)', x: 320, y: 278, r: 18 }],
    marks: [{ id: 'acr-lat', label: 'Boczna krawędź wyrostka barkowego', x: 311, y: 284 }],
  },
  staw_ramienny_tyl: {
    view: 'back',
    targets: [{ x: 636, y: 308, r: 30 }],
    zoom: { cx: 615, cy: 320, w: 330 },
    paths: [
      {
        id: 'infra',
        label: 'Aplikacja na otwarty tylny przedział i wzdłuż brzuśca m. podgrzebieniowego',
        pts: [
          { x: 578, y: 352 },
          { x: 608, y: 330 },
          { x: 638, y: 309 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'spine-scap', label: 'Grzebień łopatki', x: 548, y: 318, x2: 648, y2: 286 },
      { id: 'acr-post', label: 'Tylny kąt wyrostka barkowego', x: 654, y: 284, r: 16 },
    ],
    marks: [
      { id: 'acr-post', label: 'Tylny kąt wyrostka barkowego', x: 654, y: 284 },
      { id: 'soft', label: 'Soft spot (2 cm poniżej i przyśrodkowo)', x: 637, y: 303 },
    ],
  },
  staw_lokciowy_tenisista: {
    view: 'front',
    targets: [{ x: 294, y: 515, r: 20 }],
    zoom: { cx: 315, cy: 520, w: 260 },
    paths: [
      {
        id: 'ext',
        label: 'Punktowo na nadkłykieć boczny, dalej pasami wzdłuż brzuśców prostowników',
        pts: [
          { x: 293, y: 514 },
          { x: 286, y: 548 },
          { x: 274, y: 590 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'olecranon', label: 'Wyrostek łokciowy (olecranon) – tylna powierzchnia łokcia, wyniosłość kostna', x: 350, y: 532, r: 11 },
      { id: 'radial-head', label: 'Głowa kości promieniowej (bezpośrednio nad kością)', x: 300, y: 538, r: 12 },
    ],
    marks: [
      { id: 'lat-ep', label: 'Nadkłykieć boczny', x: 294, y: 515 },
      { id: 'ecrb', label: 'Przyczep prostowników (1–2 cm dystalnie)', x: 285, y: 528 },
    ],
  },
  staw_lokciowy_golfista: {
    view: 'front',
    targets: [{ x: 349, y: 511, r: 20 }],
    zoom: { cx: 325, cy: 520, w: 260 },
    paths: [
      {
        id: 'flex',
        label: 'Przyczep zginaczy przy nadkłykciu przyśrodkowym i wzdłuż brzuśca zginaczy',
        pts: [
          { x: 348, y: 514 },
          { x: 324, y: 546 },
          { x: 298, y: 586 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'ulnar', label: 'Bruzda nerwu łokciowego (tuż ku tyłowi od nadkłykcia przyśrodkowego)', x: 354, y: 507, r: 10 },
      { id: 'olecranon', label: 'Wyrostek łokciowy (tylna powierzchnia łokcia)', x: 350, y: 532, r: 11 },
    ],
    marks: [
      { id: 'med-ep', label: 'Nadkłykieć przyśrodkowy', x: 349, y: 511 },
      { id: 'flex', label: 'Przyczep wspólny zginaczy', x: 340, y: 528 },
    ],
  },
  staw_lokciowy_przykurcz: {
    view: 'front',
    targets: [{ x: 326, y: 528, r: 34 }],
    zoom: { cx: 320, cy: 520, w: 260 },
    paths: [
      {
        id: 'cubital',
        label: 'Aplikacja na rozciągniętą przednią torebkę stawową (dół łokciowy)',
        pts: [
          { x: 302, y: 530 },
          { x: 326, y: 524 },
          { x: 346, y: 530 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'lat', label: 'Nadkłykieć boczny (bezpośrednio nad kością)', x: 294, y: 515, r: 11 },
      { id: 'med', label: 'Nadkłykieć przyśrodkowy', x: 349, y: 511, r: 11 },
      { id: 'ulnar', label: 'Bruzda nerwu łokciowego', x: 354, y: 507, r: 9 },
    ],
    marks: [
      { id: 'cubital', label: 'Dół łokciowy', x: 326, y: 529 },
    ],
  },
  nadgarstek_reka_dloniowa: {
    view: 'front',
    targets: [{ x: 230, y: 712, r: 34 }],
    zoom: { cx: 230, cy: 720, w: 280 },
    paths: [
      {
        id: 'carpal',
        label: 'Aplikacja lokalna na kanał nadgarstka / rozciągnięte rozcięgno dłoniowe',
        pts: [
          { x: 212, y: 704 },
          { x: 230, y: 711 },
          { x: 247, y: 715 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'pisiform', label: 'Kość grochowata / haczyk kości haczykowatej', x: 240, y: 708, r: 9 },
    ],
    marks: [
      { id: 'crease', label: 'Fałd zgięciowy nadgarstka', x: 232, y: 702 },
      { id: 'flexret', label: 'Troczek zginaczy (między kłębem a kłębikiem)', x: 232, y: 724 },
    ],
  },
  nadgarstek_reka_grzbietowa: {
    view: 'back',
    targets: [{ x: 752, y: 714, r: 36 }],
    zoom: { cx: 760, cy: 730, w: 280 },
    paths: [
      {
        id: 'dorsal',
        label: 'Naświetlanie / zabieg na grzbiecie ręki – nad stawami MCP i PIP',
        pts: [
          { x: 736, y: 722 },
          { x: 754, y: 714 },
          { x: 772, y: 724 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'sty-r', label: 'Wyrostek rylcowaty k. promieniowej', x: 771, y: 704, r: 10 },
      { id: 'sty-u', label: 'Wyrostek rylcowaty k. łokciowej', x: 738, y: 706, r: 10 },
    ],
    marks: [
      { id: 'sty-r', label: 'Wyrostek rylcowaty k. promieniowej', x: 771, y: 704 },
      { id: 'sty-u', label: 'Wyrostek rylcowaty k. łokciowej', x: 738, y: 706 },
    ],
  },
  staw_biodrowy_bok: {
    view: 'front',
    targets: [{ x: 372, y: 690, r: 44 }],
    zoom: { cx: 402, cy: 700, w: 330 },
    paths: [
      {
        id: 'c-arc',
        label: 'Łuk w kształcie litery „C” WOKÓŁ krętarza większego (od tyłu, od góry, od przodu)',
        pts: [
          { x: 394, y: 664 },
          { x: 376, y: 656 },
          { x: 358, y: 668 },
          { x: 352, y: 690 },
          { x: 360, y: 712 },
          { x: 378, y: 722 },
          { x: 396, y: 714 },
        ],
        smooth: true,
        mods: ['ultrasound'],
      },
      {
        id: 'itb',
        label: '1/3 bliższa pasma biodrowo-piszczelowego',
        pts: [
          { x: 376, y: 730 },
          { x: 375, y: 780 },
          { x: 374, y: 830 },
        ],
        smooth: true,
        mods: ['ultrasound'],
      },
      {
        id: 'around',
        label: 'Aplikacja dookoła krętarza większego (nie na szczycie kości)',
        pts: [
          { x: 394, y: 664 },
          { x: 376, y: 656 },
          { x: 358, y: 668 },
          { x: 352, y: 690 },
          { x: 360, y: 712 },
          { x: 378, y: 722 },
        ],
        smooth: true,
        mods: ['laser', 'sollux', 'polarized_light', 'thermotherapy', 'cryotherapy', 'magnetotherapy', 'magnetostimulation'],
      },
    ],
    avoid: [{ id: 'troch', label: 'Szczyt krętarza większego – wyniosłość kostna (ból okostnowy, przegrzanie)', x: 372, y: 690, r: 14 }],
    marks: [{ id: 'troch', label: 'Krętarz większy', x: 372, y: 690 }],
  },
  staw_biodrowy_przod: {
    view: 'front',
    targets: [{ x: 432, y: 706, r: 30 }],
    zoom: { cx: 440, cy: 690, w: 340 },
    paths: [
      {
        id: 'ant',
        label: 'Aplikacja na przedni przedział torebki bocznie od pęczka naczyniowo-nerwowego',
        pts: [
          { x: 414, y: 700 },
          { x: 432, y: 708 },
          { x: 448, y: 716 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'asis', label: 'Kolec biodrowy przedni górny (KBP)', x: 402, y: 640, r: 14 },
      { id: 'nv', label: 'Pęczek naczyniowo-nerwowy (tętnica i nerw udowy)', x: 462, y: 712, r: 14 },
    ],
    marks: [
      { id: 'asis', label: 'KBP', x: 402, y: 640 },
      { id: 'pubic', label: 'Guzek łonowy', x: 476, y: 716 },
      { id: 'ing', label: 'Środek więzadła pachwinowego', x: 440, y: 678 },
    ],
  },
  staw_biodrowy_tyl: {
    view: 'back',
    targets: [{ x: 566, y: 690, r: 48 }],
    zoom: { cx: 570, cy: 690, w: 380 },
    paths: [
      {
        id: 's1',
        label: 'Pas 1 (10–12 cm) wzdłuż włókien m. gruszkowatego',
        pts: [
          { x: 524, y: 660 },
          { x: 608, y: 690 },
        ],
      },
      {
        id: 's2',
        label: 'Pas 2',
        pts: [
          { x: 520, y: 676 },
          { x: 606, y: 707 },
        ],
      },
      {
        id: 's3',
        label: 'Pas 3',
        pts: [
          { x: 518, y: 692 },
          { x: 604, y: 724 },
        ],
      },
    ],
    avoid: [
      { id: 'ischial', label: 'Guz kulszowy (wyniosłość kostna)', x: 534, y: 748, r: 14 },
      { id: 'troch', label: 'Krętarz większy', x: 616, y: 704, r: 14 },
    ],
    marks: [
      { id: 'psis', label: 'KBTG', x: 524, y: 646 },
      { id: 'troch', label: 'Krętarz większy', x: 616, y: 704 },
    ],
  },
  staw_kolanowy_szpara: {
    view: 'front',
    targets: [
      { x: 447, y: 1011, r: 19 },
      { x: 409, y: 1011, r: 19 },
    ],
    zoom: { cx: 428, cy: 1008, w: 280 },
    paths: [
      {
        id: 'med',
        label: 'Pas wzdłuż przyśrodkowej szpary stawowej',
        pts: [
          { x: 434, y: 1011 },
          { x: 458, y: 1011 },
        ],
      },
      {
        id: 'lat',
        label: 'Pas wzdłuż bocznej szpary stawowej',
        pts: [
          { x: 398, y: 1011 },
          { x: 421, y: 1011 },
        ],
      },
    ],
    avoid: [
      { id: 'patella', label: 'Rzepka', x: 431, y: 975, r: 24 },
      { id: 'tuber', label: 'Guzowatość piszczeli', x: 430, y: 1038, r: 10 },
      { id: 'fib', label: 'Głowa k. strzałkowej – n. strzałkowy wspólny', x: 400, y: 1031, r: 12 },
    ],
    marks: [
      { id: 'ligpat', label: 'Więzadło rzepki', x: 430, y: 1020 },
      { id: 'med-gap', label: 'Przyśrodkowa szpara stawu', x: 450, y: 1011 },
      { id: 'lat-gap', label: 'Boczna szpara stawu', x: 404, y: 1011 },
    ],
  },
  staw_kolanowy_blizna: {
    view: 'front',
    targets: [
      { x: 456, y: 962, r: 28 },
      { x: 459, y: 995, r: 28 },
      { x: 456, y: 1030, r: 28 },
    ],
    zoom: { cx: 440, cy: 995, w: 280 },
    paths: [
      {
        id: 'scar',
        label: 'Prowadzenie głowicy / sondy wzdłuż rozciągniętej, wygojonej blizny (3 MHz, 0,1–0,2 W/cm²)',
        pts: [
          { x: 453, y: 940 },
          { x: 459, y: 995 },
          { x: 455, y: 1050 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'patella', label: 'Rzepka – bez dużego nacisku pod blizną', x: 431, y: 975, r: 22 },
    ],
    marks: [{ id: 'scar', label: 'Przebieg wygojonej blizny', x: 459, y: 995 }],
  },
  staw_skokowy_kostka: {
    view: 'front',
    targets: [{ x: 432, y: 1287, r: 22 }],
    zoom: { cx: 438, cy: 1290, w: 280 },
    paths: [
      {
        id: 'atfl',
        label: 'Aplikacja w zatokę stępu i rzut więzadła ATFL',
        pts: [
          { x: 424, y: 1280 },
          { x: 433, y: 1288 },
          { x: 443, y: 1297 },
        ],
        smooth: true,
      },
    ],
    avoid: [
      { id: 'lat-mal', label: 'Kostka boczna (wyniosłość kostna)', x: 424, y: 1274, r: 12 },
      { id: 'med-mal', label: 'Kostka przyśrodkowa', x: 454, y: 1276, r: 12 },
    ],
    marks: [
      { id: 'lat-mal', label: 'Szczyt kostki bocznej', x: 424, y: 1274 },
      { id: 'sinus', label: 'Zatoka stępu / ATFL', x: 434, y: 1291 },
    ],
  },
  staw_skokowy_ostroga: {
    view: 'back',
    targets: [{ x: 527, y: 1344, r: 26 }],
    zoom: { cx: 535, cy: 1320, w: 280 },
    paths: [
      {
        id: 'heel',
        label: 'Aplikacja punktowa na przyczep rozcięgna podeszwowego (guz piętowy)',
        pts: [
          { x: 514, y: 1342 },
          { x: 526, y: 1348 },
          { x: 538, y: 1352 },
        ],
        smooth: true,
      },
    ],
    avoid: [{ id: 'calc', label: 'Silny docisk nad ostrym wyrostkiem guza piętowego', x: 544, y: 1356, r: 10 }],
    marks: [{ id: 'calc', label: 'Przyśrodkowa część guza piętowego (podeszwa)', x: 524, y: 1350 }],
  },
}

export function getBaseGeom(locId: string): Geom {
  return G[locId]
}

export function mirrorX(x: number, view: View): number {
  return 2 * CENTER[view] - x
}

/** Zwraca geometrię z uwzględnieniem strony pacjenta (P = prawa, L = lewa). */
export function resolveGeom(locId: string, side: Side): Geom {
  const g = G[locId]
  if (!g || g.mid || side === 'P') return g
  const m = (x: number) => mirrorX(x, g.view)
  return {
    ...g,
    targets: g.targets.map((t) => ({ ...t, x: m(t.x) })),
    zoom: { ...g.zoom, cx: m(g.zoom.cx) },
    paths: g.paths.map((p) => ({ ...p, pts: p.pts.map((q) => ({ x: m(q.x), y: q.y })) })),
    avoid: g.avoid.map((z) => ({ ...z, x: m(z.x), x2: z.x2 !== undefined ? m(z.x2) : undefined })),
    marks: g.marks.map((l) => ({ ...l, x: m(l.x) })),
  }
}

// -------------------------------------------------------------------------------------------
// WIDOK BOCZNY (side profile muscles.webp, 900×1200 px → w układzie 1000×1400: X = 1.111·px, Y = 33.3 + 1.111·py)
// Grafika przedstawia LEWĄ stronę pacjenta (twarz zwrócona w lewo). Dla strony prawej obraz i
// geometrię odbijamy względem CENTER.side = 500.
// -------------------------------------------------------------------------------------------
export type AltGeom = Omit<Geom, 'view' | 'mid'>

const ALT: Record<string, AltGeom> = {
  staw_biodrowy_bok: {
    targets: [{ x: 492, y: 709, r: 46 }],
    zoom: { cx: 492, cy: 770, w: 340 },
    paths: [
      {
        id: 'c-arc',
        label: 'Łuk w kształcie litery „C” WOKÓŁ krętarza większego (od tyłu, od góry, od przodu)',
        pts: [
          { x: 528, y: 672 },
          { x: 500, y: 660 },
          { x: 470, y: 672 },
          { x: 458, y: 709 },
          { x: 472, y: 745 },
          { x: 502, y: 758 },
          { x: 530, y: 744 },
        ],
        smooth: true,
        mods: ['ultrasound'],
      },
      {
        id: 'itb',
        label: '1/3 bliższa pasma biodrowo-piszczelowego',
        pts: [
          { x: 486, y: 765 },
          { x: 486, y: 820 },
          { x: 487, y: 880 },
        ],
        smooth: true,
        mods: ['ultrasound'],
      },
      {
        id: 'around',
        label: 'Aplikacja dookoła krętarza większego (nie na szczycie kości)',
        pts: [
          { x: 528, y: 672 },
          { x: 500, y: 660 },
          { x: 470, y: 672 },
          { x: 458, y: 709 },
          { x: 472, y: 745 },
          { x: 502, y: 758 },
        ],
        smooth: true,
        mods: ['laser', 'sollux', 'polarized_light', 'thermotherapy', 'cryotherapy', 'magnetotherapy', 'magnetostimulation'],
      },
    ],
    avoid: [{ id: 'troch', label: 'Szczyt krętarza większego – wyniosłość kostna (ból okostnowy, przegrzanie)', x: 492, y: 709, r: 13 }],
    marks: [{ id: 'troch', label: 'Krętarz większy', x: 492, y: 709 }],
  },
  staw_ramienny_bok: {
    targets: [{ x: 500, y: 340, r: 26 }],
    zoom: { cx: 500, cy: 340, w: 300 },
    paths: [
      {
        id: 'supra',
        label: 'Aplikacja lokalna tuż pod boczną krawędzią wyrostka barkowego',
        pts: [
          { x: 494, y: 334 },
          { x: 500, y: 341 },
          { x: 507, y: 348 },
        ],
        smooth: true,
      },
    ],
    avoid: [{ id: 'acromion', label: 'Wyrostek barkowy (wyniosłość kostna)', x: 502, y: 302, rx: 20, ry: 13 }],
    marks: [{ id: 'acr-lat', label: 'Boczna krawędź wyrostka barkowego', x: 502, y: 302 }],
  },
  staw_skokowy_kostka: {
    targets: [{ x: 495, y: 1283, r: 20 }],
    zoom: { cx: 500, cy: 1260, w: 260 },
    paths: [
      {
        id: 'atfl',
        label: 'Aplikacja w zatokę stępu i rzut więzadła ATFL (do przodu i ku dołowi od kostki)',
        pts: [
          { x: 506, y: 1274 },
          { x: 497, y: 1283 },
          { x: 487, y: 1292 },
        ],
        smooth: true,
      },
    ],
    avoid: [{ id: 'lat-mal', label: 'Kostka boczna (wyniosłość kostna)', x: 513, y: 1264, r: 12 }],
    marks: [
      { id: 'lat-mal', label: 'Szczyt kostki bocznej', x: 513, y: 1264 },
      { id: 'sinus', label: 'Zatoka stępu / ATFL', x: 490, y: 1288 },
    ],
  },
}

/** Czy okolica ma geometrię w widoku bocznym. */
export function hasSideView(locId: string): boolean {
  return !!ALT[locId]
}

export function getSideZoom(locId: string, side: Side): { cx: number; cy: number; w: number } | null {
  const a = ALT[locId]
  if (!a) return null
  return side === 'P' ? { ...a.zoom, cx: 2 * CENTER.side - a.zoom.cx } : a.zoom
}

/**
 * Geometria okolicy w żądanym widoku (null – okolica nie ma opisu w tym widoku).
 * Widok boczny: obraz przedstawia lewą stronę pacjenta; dla strony prawej wszystko odbijamy.
 */
export function resolveViewGeom(locId: string, side: Side, view: View): Geom | null {
  const g = G[locId]
  if (!g) return null
  if (view === g.view) return resolveGeom(locId, side)
  if (view === 'side' && ALT[locId]) {
    const a = ALT[locId]
    if (side === 'L') return { ...a, view: 'side' }
    const m = (x: number) => 2 * CENTER.side - x
    return {
      view: 'side',
      targets: a.targets.map((t) => ({ ...t, x: m(t.x) })),
      zoom: { ...a.zoom, cx: m(a.zoom.cx) },
      paths: a.paths.map((p) => ({ ...p, pts: p.pts.map((q) => ({ x: m(q.x), y: q.y })) })),
      avoid: a.avoid.map((z) => ({ ...z, x: m(z.x), x2: z.x2 !== undefined ? m(z.x2) : undefined })),
      marks: a.marks.map((l) => ({ ...l, x: m(l.x) })),
    }
  }
  return null
}

export function inTarget(t: Target, x: number, y: number): boolean {
  if (t.r !== undefined) return Math.hypot(x - t.x, y - t.y) <= t.r
  const rx = t.rx ?? 20
  const ry = t.ry ?? 20
  return ((x - t.x) / rx) ** 2 + ((y - t.y) / ry) ** 2 <= 1
}

// -------------------------------------------------------------------------------------------
// PRESETY ZBLIŻENIA (wybór odcinka / stawu przez studenta)
// -------------------------------------------------------------------------------------------
export interface ZoomPreset {
  id: string
  label: string
  front: { cx: number; cy: number; w: number }
  back: { cx: number; cy: number; w: number }
  /** widok boczny (obraz = lewa strona pacjenta; dla prawej odbijamy względem CENTER.side) */
  side: { cx: number; cy: number; w: number }
  /** czy dotyczy jednej strony (wtedy odbijamy dla lewej) */
  paired: boolean
}

export const ZOOM_PRESETS: ZoomPreset[] = [
  { id: 'all', label: 'Całe ciało', front: { cx: 500, cy: 700, w: 1000 }, back: { cx: 500, cy: 700, w: 1000 }, side: { cx: 500, cy: 700, w: 1000 }, paired: false },
  { id: 'head', label: 'Głowa i szyja', front: { cx: 493, cy: 130, w: 300 }, back: { cx: 492, cy: 170, w: 320 }, side: { cx: 478, cy: 215, w: 300 }, paired: false },
  { id: 'trunk', label: 'Kręgosłup / tułów', front: { cx: 493, cy: 430, w: 560 }, back: { cx: 492, cy: 450, w: 560 }, side: { cx: 490, cy: 470, w: 560 }, paired: false },
  { id: 'shoulder', label: 'Bark', front: { cx: 345, cy: 310, w: 320 }, back: { cx: 640, cy: 330, w: 320 }, side: { cx: 505, cy: 340, w: 320 }, paired: true },
  { id: 'elbow', label: 'Łokieć', front: { cx: 318, cy: 520, w: 280 }, back: { cx: 668, cy: 520, w: 280 }, side: { cx: 492, cy: 560, w: 280 }, paired: true },
  { id: 'wrist', label: 'Nadgarstek i ręka', front: { cx: 232, cy: 730, w: 300 }, back: { cx: 756, cy: 730, w: 300 }, side: { cx: 470, cy: 720, w: 300 }, paired: true },
  { id: 'hip', label: 'Biodro / miednica', front: { cx: 410, cy: 690, w: 420 }, back: { cx: 570, cy: 690, w: 420 }, side: { cx: 500, cy: 740, w: 420 }, paired: true },
  { id: 'knee', label: 'Kolano', front: { cx: 428, cy: 1005, w: 300 }, back: { cx: 560, cy: 1005, w: 300 }, side: { cx: 495, cy: 1000, w: 300 }, paired: true },
  { id: 'ankle', label: 'Staw skokowy i stopa', front: { cx: 435, cy: 1300, w: 300 }, back: { cx: 555, cy: 1300, w: 300 }, side: { cx: 490, cy: 1260, w: 300 }, paired: true },
]

// -------------------------------------------------------------------------------------------
// POZYCJE UŁOŻENIOWE (1. opcja = zgodna z scenarios.ts; pozostałe – dystraktory)
// -------------------------------------------------------------------------------------------
export interface Choice {
  id: string
  label: string
  correct: boolean
  why?: string
}

type PosDef = { ok: [string, ...string[]]; bad: [string, string][] }

const POS: Record<string, PosDef> = {
  nerw_twarzowy: {
    ok: ['Leżenie tyłem lub pozycja półsiedząca z podparciem i stabilizacją głowy'],
    bad: [
      ['Leżenie przodem z głową skręconą w stronę zdrową, bez podparcia', 'Brak stabilizacji głowy i dostępu do pola zabiegowego.'],
      ['Stanie z głową odchyloną maksymalnie do tyłu', 'Pozycja niestabilna i niekomfortowa – pacjent nie utrzyma jej przez 10–15 min.'],
      ['Leżenie na boku porażonym, twarz przyciśnięta do kozetki', 'Pole zabiegowe (twarz po stronie porażonej) jest niedostępne.'],
    ],
  },
  nerw_trojdzielny: {
    ok: ['Leżenie tyłem lub pozycja półsiedząca ze stabilizacją głowy'],
    bad: [
      ['Leżenie przodem z twarzą w otworze kozetki, bez stabilizacji', 'Utrudniony dostęp do punktów Valleixa i brak kontroli bezpieczeństwa oczu.'],
      ['Siedzenie z głową zwisającą do przodu', 'Nie ma stabilizacji głowy; punkty wyjścia gałęzi są ukryte.'],
      ['Leżenie na boku z głową zgiętą do klatki piersiowej', 'Pozycja nie otwiera dostępu do punktów wyjścia gałęzi nerwu.'],
    ],
  },
  kregoslup_szyjny_zwoj: {
    ok: [
      'Siedzenie okrakiem na krześle, czoło oparte o przedramiona na oparciu (lub leżenie przodem z wałkiem pod klatką piersiową)',
      'Zwój gwiaździsty: leżenie tyłem, głowa lekko odgięta i skręcona w stronę przeciwną',
    ],
    bad: [
      ['Leżenie tyłem z wałkiem pod karkiem (pogłębienie lordozy szyjnej)', 'Pogłębia lordozę i ukrywa wyrostki kolczyste – brak dostępu do odcinka przykręgosłupowego.'],
      ['Stanie ze wzniesionymi ramionami splecionymi za głową', 'Napięte mięśnie karku, niestabilna pozycja.'],
      ['Leżenie na boku z głową zgiętą do klatki piersiowej, ręce pod głową', 'Brak symetrycznego dostępu do obu stron kręgosłupa.'],
    ],
  },
  kregoslup_piersiowy: {
    ok: ['Leżenie przodem z poduszką pod brzuchem i ramionami odwiedzionymi (rozsunięcie łopatek)'],
    bad: [
      ['Leżenie przodem z rękami wzdłuż tułowia, bez podkładki, ramiona przywiedzione', 'Łopatki zbliżone – przestrzeń międzyłopatkowa niedostępna.'],
      ['Leżenie tyłem z rękami pod głową', 'Plecy są niedostępne.'],
      ['Siedzenie ze splecionymi rękami na karku, tułów zgięty', 'Łopatki zbliżone, napięte mięśnie przykręgosłupowe.'],
    ],
  },
  kregoslup_ledzwiowy: {
    ok: ['Leżenie przodem z wałkiem lub poduszką pod podbrzuszem (zniesienie lordozy lędźwiowej)'],
    bad: [
      ['Leżenie przodem bez podkładki, wałek pod czołem', 'Lordoza lędźwiowa utrzymana – mięśnie napięte, przestrzenie międzykręgowe zamknięte.'],
      ['Leżenie tyłem z wałkiem pod lędźwiami', 'Plecy niedostępne; wałek pogłębia lordozę.'],
      ['Stanie w wyproście z odchyleniem tułowia do tyłu', 'Maksymalna lordoza, napięte mięśnie – odwrotnie niż wymagane rozluźnienie.'],
    ],
  },
  staw_ramienny_przod: {
    ok: ['Siedzenie, kończyna górna zgięta w łokciu do 90° i ustawiona w rotacji zewnętrznej'],
    bad: [
      ['Siedzenie, kończyna w rotacji wewnętrznej z dłonią za plecami', 'Rotacja wewnętrzna zamyka przedni przedział (bruzdę międzyguzkową) i odsłania tylny.'],
      ['Leżenie przodem, ramię odwiedzione 90° w rotacji wewnętrznej', 'Przód stawu niedostępny.'],
      ['Siedzenie, kończyna uniesiona maksymalnie w górę (zgięcie 180°)', 'Bruzda międzyguzkowa przesuwa się pod wyrostek barkowy.'],
    ],
  },
  staw_ramienny_bok: {
    ok: ['Siedzenie, ramię swobodnie opuszczone luźno wzdłuż tułowia (ew. lekki wyprost i przywiedzenie)'],
    bad: [
      ['Siedzenie, ramię odwiedzione do 90° w rotacji wewnętrznej', 'Odwiedzenie chowa przyczep m. nadgrzebieniowego pod wyrostek barkowy.'],
      ['Siedzenie, kończyna w rotacji zewnętrznej z łokciem 90°', 'To pozycja dla przedniego przedziału stawu (bruzda międzyguzkowa).'],
      ['Leżenie na zdrowym boku, ramię uniesione nad głowę', 'Maksymalne zgięcie ukrywa przestrzeń podbarkową.'],
    ],
  },
  staw_ramienny_tyl: {
    ok: ['Siedzenie, kończyna w rotacji wewnętrznej i przywiedzeniu – dłoń na przeciwległym kolanie lub barku'],
    bad: [
      ['Siedzenie, kończyna w rotacji zewnętrznej, łokieć zgięty 90°', 'Pozycja otwierająca przód stawu, nie tył.'],
      ['Siedzenie, ramię luźno wzdłuż tułowia bez rotacji', 'Nie otwiera tylnego przedziału stawu.'],
      ['Leżenie tyłem, ramię w pełnym odwiedzeniu', 'Tył stawu przylega do podłoża i jest niedostępny.'],
    ],
  },
  staw_lokciowy_tenisista: {
    ok: ['Siedzenie, przedramię oparte na stoliku, łokieć lekko zgięty (ok. 30°), pronacja, mięśnie rozluźnione'],
    bad: [
      ['Siedzenie, łokieć zgięty 90°, przedramię w supinacji, pięść zaciśnięta', 'Napięcie prostowników i odsłonięcie strony przyśrodkowej – zła strona.'],
      ['Siedzenie, łokieć w pełnym wyproście, przedramię w supinacji', 'Supinacja chowa przyczep prostowników; pozycja dla łokcia golfisty.'],
      ['Leżenie przodem z kończyną w odwiedzeniu 90° i rotacji zewnętrznej', 'Niestabilna pozycja, napięte mięśnie.'],
    ],
  },
  staw_lokciowy_golfista: {
    ok: ['Siedzenie, ramię w lekkim odwiedzeniu i rotacji zewnętrznej, przedramię na stoliku w supinacji'],
    bad: [
      ['Siedzenie, przedramię w pronacji, łokieć zgięty ok. 30°', 'Pronacja pozwala dostępu do nadkłykcia bocznego (łokieć tenisisty).'],
      ['Siedzenie, ramię w rotacji wewnętrznej, łokieć wyprostowany', 'Nadkłykieć przyśrodkowy jest ukryty od strony tułowia.'],
      ['Leżenie przodem, przedramię zwisa poza kozetkę w pronacji', 'Brak podparcia i rozluźnienia zginaczy.'],
    ],
  },
  staw_lokciowy_przykurcz: {
    ok: ['Siedzenie, staw łokciowy ustawiony w pozycji maksymalnego bezpiecznego rozciągnięcia przykurczonych tkanek'],
    bad: [
      ['Staw łokciowy w pozycji maksymalnego rozluźnienia torebki (zgięcie ok. 90°)', 'Przy przykurczach tkanki muszą być rozciągnięte, nie zwolnione.'],
      ['Łokieć unieruchomiony w ortezie podczas zabiegu', 'Orteza uniemożliwia dostęp i rozciągnięcie torebki.'],
      ['Leżenie przodem, ręka zwisa swobodnie z kozetki', 'Brak kontrolowanego rozciągnięcia.'],
    ],
  },
  nadgarstek_reka_dloniowa: {
    ok: ['Siedzenie, przedramię i ręka na stoliku w pełnej supinacji (dłonią ku górze); przy Dupuytrenie palce maksymalnie rozciągnięte'],
    bad: [
      ['Siedzenie, ręka w pronacji, grzbietem do góry', 'Strona dłoniowa niedostępna.'],
      ['Siedzenie, dłoń zaciśnięta w pięść w supinacji', 'Rozcięgno dłoniowe rozluźnione – przy przykurczu ma być rozciągnięte.'],
      ['Ręka zwisa swobodnie poza krawędź stołu w zgięciu dłoniowym', 'Brak stabilizacji, zła pozycja dla kanału nadgarstka.'],
    ],
  },
  nadgarstek_reka_grzbietowa: {
    ok: ['Siedzenie, przedramię i dłoń oparte płasko na podkładzie w pronacji (grzbietem ku górze)'],
    bad: [
      ['Siedzenie, ręka w supinacji dłonią do góry', 'Grzbiet ręki niedostępny.'],
      ['Siedzenie, pięść zaciśnięta ustawiona pionowo (pozycja młotkowa)', 'Niestabilna pozycja, napięte ścięgna.'],
      ['Ręka uniesiona nad głowę, dłoń w zgięciu grzbietowym', 'Pozycja bez podparcia.'],
    ],
  },
  staw_biodrowy_bok: {
    ok: ['Leżenie na zdrowym boku z poduszką lub wałkiem między kolanami'],
    bad: [
      ['Leżenie na chorym boku z kończynami wyprostowanymi', 'Nacisk na krętarz i brak dostępu do pola zabiegowego.'],
      ['Leżenie przodem z kończynami w rotacji zewnętrznej', 'Okolica boczna jest ukryta; napięte rotatory.'],
      ['Leżenie tyłem z kończyną w odwiedzeniu 45°', 'Krętarz większy niedostępny od boku.'],
    ],
  },
  staw_biodrowy_przod: {
    ok: ['Leżenie tyłem z kończyną dolną w lekkiej rotacji zewnętrznej i wałkiem pod kolanem'],
    bad: [
      ['Leżenie przodem z wałkiem pod podbrzuszem', 'Przód stawu przylega do kozetki – brak dostępu.'],
      ['Leżenie tyłem z biodrem w maksymalnym zgięciu i przywiedzeniu', 'Zamyka okolicę pachwinową, napina m. biodrowo-lędźwiowy.'],
      ['Leżenie na zdrowym boku z kończyną odwiedzioną', 'Nie otwiera przedniego przedziału stawu.'],
    ],
  },
  staw_biodrowy_tyl: {
    ok: ['Leżenie przodem z wałkiem pod stawami skokowymi (lekka rotacja wewnętrzna bioder)'],
    bad: [
      ['Leżenie przodem, kończyny w rotacji zewnętrznej, brzuch bez podkładki', 'Rotacja zewnętrzna napina m. gruszkowaty i pośladkowe.'],
      ['Leżenie tyłem z kończynami skrzyżowanymi', 'Tył miednicy niedostępny.'],
      ['Leżenie na boku z biodrem zgiętym do 90°', 'Napięte rotatory, trudny dostęp do przebiegu m. gruszkowatego.'],
    ],
  },
  staw_kolanowy_szpara: {
    ok: ['Leżenie tyłem z wałkiem pod dołem podkolanowym (zgięcie 20–30°) lub leżenie na boku przy dojściu bocznym/przyśrodkowym'],
    bad: [
      ['Leżenie tyłem, kolano w pełnym wyproście i hiperekstensji, bez podkładki', 'Napięte więzadła, szpara stawu zamknięta.'],
      ['Siedzenie z kolanem zgiętym do 120°', 'Szpara przesłonięta przez rzepkę i więzadło rzepki.'],
      ['Leżenie przodem z kolanem zgiętym do 90°', 'Przód stawu (szpara) przylega do kozetki.'],
    ],
  },
  staw_kolanowy_blizna: {
    ok: ['Staw kolanowy ustawiony tak, by blizna była maksymalnie, bezpiecznie rozciągnięta (np. zgięcie kolana)'],
    bad: [
      ['Kolano w pełnym wyproście – blizna zluzowana', 'Blizna ma być maksymalnie rozciągnięta podczas nadźwiękawiania.'],
      ['Kolano zgięte 20–30° z wałkiem pod dołem podkolanowym', 'To pozycja dla szpary stawowej, nie rozciąga blizny.'],
      ['Leżenie przodem, blizna zasłonięta opatrunkiem', 'Brak kontaktu głowicy ze skórą; opatrunek zaburza przewodzenie.'],
    ],
  },
  staw_skokowy_kostka: {
    ok: ['Leżenie tyłem lub na zdrowym boku, stopa na wałku w lekkiej inwersji i zgięciu podeszwowym'],
    bad: [
      ['Stanie na palcach (obciążenie stawu)', 'Pozycja obciążona; nie otwiera okolicy przednio-bocznej.'],
      ['Stopa w maksymalnej dorsalfleksji i eversji', 'Napina i zamyka ATFL – brak dostępu do zatoki stępu.'],
      ['Siedzenie, stopa opuszczona na podłodze (zwis)', 'Narasta obrzęk, brak rozluźnienia więzadeł.'],
    ],
  },
  staw_skokowy_ostroga: {
    ok: ['Leżenie przodem, stopy wystają poza krawędź kozetki (podeszwa pionowo do góry)'],
    bad: [
      ['Leżenie tyłem, stopa w zgięciu grzbietowym', 'Podeszwa jest niedostępna dla głowicy.'],
      ['Stanie na jednej nodze', 'Pozycja niestabilna; obciążenie pięty.'],
      ['Siedzenie, stopa postawiona na podłodze', 'Podeszwa przylega do podłoża.'],
    ],
  },
}

export function getPositionChoices(locId: string): Choice[] {
  const d = POS[locId]
  const ok: Choice[] = d.ok.map((l, i) => ({ id: `p-ok-${i}`, label: l, correct: true }))
  const bad: Choice[] = d.bad.map(([l, w], i) => ({ id: `p-bad-${i}`, label: l, correct: false, why: w }))
  return [...ok, ...bad]
}

// -------------------------------------------------------------------------------------------
// PUNKTY ORIENTACYJNE PALPACJI
// -------------------------------------------------------------------------------------------
type LmDef = { ok: string[]; bad: string[] }

const LM: Record<string, LmDef> = {
  nerw_twarzowy: {
    ok: ['Dół zażuchwowy – tuż poniżej i do przodu od płatka ucha / wyrostka sutkowatego', 'Gęsia stopka przyusznicza – odgałęzienia na policzku'],
    bad: ['Otwór podoczodołowy (1 cm pod dolnym brzegiem oczodołu)', 'Wcięcie nadoczodołowe', 'Wyrostek barkowy łopatki'],
  },
  nerw_trojdzielny: {
    ok: ['Wcięcie nadoczodołowe (I gałąź – przyśrodkowa 1/3 górnego brzegu oczodołu)', 'Otwór podoczodołowy (II gałąź – ok. 1 cm pod dolnym brzegiem oczodołu)', 'Otwór bródkowy (III gałąź – na wysokości 2. zęba przedtrzonowego)'],
    bad: ['Dół zażuchwowy przed płatkiem ucha', 'Wyrostek sutkowaty'],
  },
  kregoslup_szyjny_zwoj: {
    ok: ['C7 (vertebra prominens) – nieruchomy przy zgięciu głowy, C6 chowa się do przodu', 'Odliczenie 4 wyrostków kolczystych od C7 w górę do C3', 'Zwój gwiaździsty: 2–3 cm nad obojczykiem, przyśrodkowo od m. MOS'],
    bad: ['Linia dolnych kątów łopatek = Th7', 'Linia grzebieni biodrowych = L4', 'Kolec biodrowy tylny górny = S2'],
  },
  kregoslup_piersiowy: {
    ok: ['Wyznaczenie C7 i odliczanie wyrostków w dół', 'Grzebień łopatki = poziom Th3', 'Linia łącząca dolne kąty łopatek = wyrostek kolczysty Th7'],
    bad: ['Linia grzebieni biodrowych = Th12', 'Wyrostek kruczy łopatki', 'Linia Tuffiera = Th8'],
  },
  kregoslup_ledzwiowy: {
    ok: ['Linia łącząca szczyty grzebieni biodrowych (Tuffiera) = L4 / przestrzeń L4–L5', 'Kolce biodrowe tylne górne (KBTG) = S2 i stawy krzyżowo-biodrowe'],
    bad: ['Linia dolnych kątów łopatek = L1', 'Kolec biodrowy przedni górny = S2', 'C7 = L5'],
  },
  staw_ramienny_przod: {
    ok: ['Wyrostek kruczy łopatki', 'Bruzda międzyguzkowa (bocznie od wyrostka kruczego) – ścięgno głowy długiej bicepsa'],
    bad: ['Soft spot 2 cm poniżej tylnego kąta wyrostka barkowego', 'Przestrzeń podbarkowa tuż pod boczną krawędzią wyrostka barkowego'],
  },
  staw_ramienny_bok: {
    ok: ['Boczna krawędź wyrostka barkowego łopatki', 'Przestrzeń podbarkowa – przyczep m. nadgrzebieniowego na guzku większym'],
    bad: ['Bruzda międzyguzkowa', 'Wyrostek kruczy łopatki', 'Soft spot tylnego przedziału stawu'],
  },
  staw_ramienny_tyl: {
    ok: ['Tylny kąt wyrostka barkowego łopatki', 'Soft spot – ok. 2 cm poniżej i przyśrodkowo od tylnego kąta wyrostka barkowego', 'Dół podgrzebieniowy'],
    bad: ['Wyrostek kruczy łopatki', 'Bruzda międzyguzkowa'],
  },
  staw_lokciowy_tenisista: {
    ok: ['Nadkłykieć boczny kości ramiennej (najbardziej wystający punkt po stronie bocznej)', 'Przyczep prostowników nadgarstka 1–2 cm dystalnie od nadkłykcia'],
    bad: ['Nadkłykieć przyśrodkowy kości ramiennej', 'Bruzda nerwu łokciowego', 'Wyrostek łokciowy'],
  },
  staw_lokciowy_golfista: {
    ok: ['Wydatny nadkłykieć przyśrodkowy kości ramiennej', 'Przyczep wspólny zginaczy nadgarstka tuż dystalnie od nadkłykcia'],
    bad: ['Nadkłykieć boczny kości ramiennej', 'Bruzda nerwu łokciowego jako miejsce aplikacji', 'Głowa kości promieniowej'],
  },
  staw_lokciowy_przykurcz: {
    ok: ['Dół łokciowy – przednia torebka stawowa, ścięgna m. dwugłowego i ramiennego', 'Więzadła poboczne stawu łokciowego'],
    bad: ['Wyrostek łokciowy (olecranon)', 'Bruzda nerwu łokciowego', 'Nadkłykcie kości ramiennej bezpośrednio nad kością'],
  },
  nadgarstek_reka_dloniowa: {
    ok: ['Fałd zgięciowy nadgarstka – punkt wyjścia do wyznaczenia pola dystalnie', 'Przestrzeń między kością grochowatą a guzkiem kości łódeczkowatej (troczek zginaczy)'],
    bad: ['Wyrostki rylcowate kości promieniowej i łokciowej', 'Nadkłykcie kości ramiennej', 'Głowa kości łokciowej'],
  },
  nadgarstek_reka_grzbietowa: {
    ok: ['Wyrostek rylcowaty kości promieniowej (bocznie)', 'Wyrostek rylcowaty kości łokciowej (przyśrodkowo)', 'Stawy MCP i PIP na grzbiecie ręki'],
    bad: ['Kość grochowata', 'Haczyk kości haczykowatej', 'Nadkłykieć boczny'],
  },
  staw_biodrowy_bok: {
    ok: ['Krętarz większy kości udowej – najbardziej wystający bocznie punkt kostny uda (wyczuwalny przy ruchach rotacyjnych)'],
    bad: ['Guz kulszowy', 'Kolec biodrowy przedni górny', 'Linia Tuffiera (L4)'],
  },
  staw_biodrowy_przod: {
    ok: ['Środek więzadła pachwinowego (KBP – guzek łonowy); pole 2–3 cm poniżej', 'Tętno tętnicy udowej – pole zabiegowe leży bocznie od niego'],
    bad: ['Linia KBTG – krętarz większy', 'Guz kulszowy', 'Linia dolnych kątów łopatek'],
  },
  staw_biodrowy_tyl: {
    ok: ['Linia łącząca KBTG z krętarzem większym = rzut mięśnia gruszkowatego', 'Nerw kulszowy wychodzi poniżej m. gruszkowatego'],
    bad: ['Środek więzadła pachwinowego', 'Linia 2 cm od wyrostków kolczystych L1–L5', 'Kolec biodrowy przedni górny jako cel zabiegu'],
  },
  staw_kolanowy_szpara: {
    ok: ['Po obu stronach więzadła rzepki, tuż poniżej dolnego bieguna rzepki', 'Przyśrodkowa i boczna szpara stawu udowo-piszczelowego'],
    bad: ['Głowa kości strzałkowej jako punkt aplikacji', 'Guzowatość kości piszczelowej', 'Środek rzepki'],
  },
  staw_kolanowy_blizna: {
    ok: ['Przebieg wygojonej (zamkniętej!) blizny skórnej w okolicy przedniej/przyśrodkowej', 'Ciągłość naskórka – brak niezagojonych ran'],
    bad: ['Rzepka jako pole aplikacji z dużym naciskiem', 'Sącząca rana pooperacyjna w obrębie blizny', 'Głowa kości strzałkowej'],
  },
  staw_skokowy_kostka: {
    ok: ['Zagłębienie do przodu i ku dołowi od szczytu kostki bocznej (przebieg ATFL)', 'Zatoka stępu – między kostką boczną a szyjką kości skokowej'],
    bad: ['Szczyt kostki bocznej jako punkt aplikacji', 'Kostka przyśrodkowa', 'Ścięgno Achillesa'],
  },
  staw_skokowy_ostroga: {
    ok: ['Przyśrodkowa część guza piętowego na powierzchni podeszwowej – punkt największej tkliwości', 'Przyczep bliższy rozcięgna podeszwowego'],
    bad: ['Kostka boczna', 'Ścięgno Achillesa', 'Głowa V kości śródstopia'],
  },
}

export function getLandmarkChoices(locId: string): Choice[] {
  const d = LM[locId]
  return [
    ...d.ok.map((l, i) => ({ id: `l-ok-${i}`, label: l, correct: true })),
    ...d.bad.map((l, i) => ({ id: `l-bad-${i}`, label: l, correct: false })),
  ]
}

// -------------------------------------------------------------------------------------------
// Pomocnicze rysowanie ścieżek SVG
// -------------------------------------------------------------------------------------------
export function polyPath(pts: Pt[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

/** Catmull-Rom → Bézier */
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 3) return polyPath(pts)
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}
