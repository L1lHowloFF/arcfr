/*
  Pendola Pass: районы, ключевые места и метки для интерактивной карты.

  КАК ВКЛЮЧИТЬ КАРТУ
  1. Сделай скриншот карты Pendola Pass в игре.
  2. Сохрани его в папку assets/maps/ под именем pendola-pass.jpg (подойдут также .png и .webp).
  3. Открой сайт, включи «Режим разметки» и кликай по карте, чтобы ставить метки.
  4. Нажми «Экспорт меток», скопируй JSON и вставь его вместо массива markers ниже.

  Координаты меток задаются в процентах от ширины и высоты картинки (0–100),
  так что метки не съедут, если заменить скриншот на другой того же кадра.
*/
window.FT = window.FT || {};

FT.pendola = {
  mapImages: ['assets/maps/pendola-pass.webp', 'assets/maps/pendola-pass.jpg', 'assets/maps/pendola-pass.png'],

  markerTypes: {
    poi:     { label: 'Локация' },
    extract: { label: 'Эвакуация' },
    key:     { label: 'Ключевая комната' },
    relay:   { label: 'Emperor Relay' },
    arc:     { label: 'ARC' },
    quest:   { label: 'Квест' },
    loot:    { label: 'Лут' }
  },

  // Сюда вставляется экспорт из «Режима разметки».
  // Формат: { x: 42.1, y: 63.5, type: 'poi', name: 'Railyard', note: 'Лучший лут, Nomad Camp под ним' }
  markers: [],

  regions: [
    { name: 'Northern Tracks', places: ['Researcher Lodgings', 'Dispatch Tower', 'Frozen River', 'Deep Space Telescope', 'Cielo Sereno Observatory'] },
    { name: 'Almatera Village', places: ['Fallen Emperor', 'Old Town', 'Piazza della Rupe', 'Almatera Station', 'Porta Benvenuti'] },
    { name: 'Freight Terminal', places: ['Railyard', 'Commissary Supermarket', 'Railroad Junction', 'Weather Station', 'Loading Platforms'] },
    { name: 'Southern Pass', places: ['Old Hamlet', 'Truck Stop', 'Electrical Substation', 'Frozen River'] }
  ],

  places: [
    {
      name: 'Railyard', region: 'Freight Terminal', loot: 'Промышленный, механика',
      text: 'Одно из лучших мест карты: большой комплекс, много контейнеров и шкафчиков, ящики с аугментами и оружием. Под ним Nomad Camp. Рядом Glacial Transceiver для вызова гондолы.',
      tags: ['Glacial Transceiver', 'Nomad Camp'], src: ['bb-pendola', 'ts-pendola']
    },
    {
      name: 'Commissary Supermarket', region: 'Freight Terminal', loot: 'Коммерческий, медицина',
      text: 'Много шкафчиков и контейнеров, хорошо для медицины. Плотная застройка, удобно пережидать заморозку. Свой Supermarket Transceiver.',
      tags: ['Supermarket Transceiver', 'Укрытие от Flash Freeze'], src: ['bb-pendola', 'ts-pendola']
    },
    {
      name: 'Almatera Station', region: 'Almatera Village', loot: 'Промышленный, механика',
      text: 'Ценный лут и ключевая комната вокзала (Train Station Key, редкий). Рядом Reckless Transceiver.',
      tags: ['Train Station Key', 'Reckless Transceiver'], src: ['bb-pendola', 'arh-notes']
    },
    {
      name: 'Old Town', region: 'Almatera Village', loot: 'Жилой',
      text: 'Много маленьких домов, которые быстро лутаются. Лучшее место для предметов под исследования. Много укрытий, но в комнатах любят сидеть рейдеры. Есть Old Town Key (необычный).',
      tags: ['Old Town Key', 'Предметы для исследований'], src: ['bb-pendola', 'arh-notes']
    },
    {
      name: 'Cielo Sereno Observatory', region: 'Northern Tracks', loot: 'Промышленный, механика',
      text: 'Взламываемые контейнеры и ящики с аугментами. Закрытая комната в главном здании открывается Observatory Key (эпический). При условии Frigate эта дверь открыта бесплатно.',
      tags: ['Observatory Key', 'Квест Exploring Pendola Pass'], src: ['bb-pendola', 'ts-pendola', 'at-q-explore']
    },
    {
      name: 'Fallen Emperor', region: 'Almatera Village', loot: 'ARC-технологии, Amplification Modules',
      text: 'Упавший гигант-ARC, главный ориентир карты. Дверь у основания открывается Emperor Gateway Conduit, внутри первый в игре «данж». Рядом Reckless Transceiver: ближайший выход, но самый открытый.',
      tags: ['Emperor Gateway Conduit', 'Reckless Transceiver', 'Hydra'], src: ['arh-emperor', 'mf-emperor']
    },
    {
      name: 'Electrical Substation', region: 'Southern Pass', loot: null,
      text: 'Сюда нужно просто дойти, чтобы выполнить задание исследования Mobile-Fire Grip Fittings (Sprint Shooting для амплифицированного оружия).',
      tags: ['Задание исследования'], src: ['at-research']
    }
  ]
};
