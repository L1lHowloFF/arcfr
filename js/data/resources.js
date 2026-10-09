/*
  Ресурсы и ключевые предметы Frozen Trail: где взять и зачем.
  tags: amp (амплификация), emperor (Император), frigate (Фрегат), stations (Outpost и станции), research (исследования), quest (квесты)
  rarity: common | uncommon | rare | epic | legendary | null (если неизвестно)
  tbd: true — данные ещё уточняются
*/
window.FT = window.FT || {};

FT.resources = [
  {
    name: 'Amplification Module (Mk. I–V)', rarity: null, tags: ['amp', 'frigate', 'emperor'],
    where: 'Трюм Фрегата и контейнеры внутри Императора (Pendola Pass). Других источников пока нет, все марки падают с одинаковым шансом.',
    why: 'Вставляется в оружие IV тира и открывает амплификацию. Марка = редкость оружия: Mk. I для обычного … Mk. V для легендарного. Mk. I весит 0,5, стоит 7 000.',
    src: ['kg-frigate', 'arh-modules']
  },
  {
    name: 'Pneumatic Actuator', rarity: 'epic', tags: ['amp', 'emperor'],
    where: 'Emperor Payload при условии Redirection на Pendola Pass.',
    why: 'В подсказке: «используется для крафта амплифицированного оружия». Стак 3, вес 0,5.',
    src: ['arh-amp', 'mf-redirect']
  },
  {
    name: 'Pressure Regulator', rarity: 'epic', tags: ['amp', 'emperor'],
    where: 'Emperor Payload при условии Redirection на Pendola Pass.',
    why: 'В подсказке: «используется для крафта амплифицированного оружия». Стак 3, вес 0,5.',
    src: ['arh-amp', 'mf-redirect']
  },
  {
    name: 'Amplified Fragments', rarity: null, tags: ['amp'],
    where: 'Разбор (recycle) амплифицированного оружия или старого мода Anvil Splitter, который больше не выпадает.',
    why: 'Ремонт амплифицированного оружия (у него до 200 прочности).',
    src: ['arh-amp', 'arh-notes']
  },
  {
    name: 'Emperor Modulator', rarity: 'legendary', tags: ['amp', 'stations', 'emperor', 'quest'],
    where: 'Внутри Императора на Pendola Pass.',
    why: 'Улучшение Gunsmith до 4 уровня (нужен 1). Ещё 1 сдаётся в квесте Belly of the Beast, так что выноси минимум два.',
    src: ['rb-modulator', 'gh-amp', 'at-q-belly']
  },
  {
    name: 'Frigate Inductor', rarity: 'legendary', tags: ['amp', 'stations', 'frigate'],
    where: 'Точный источник пока не подтверждён. Судя по названию, связан с Фрегатом.',
    why: 'Улучшение Research Station (описание предмета). По данным games.gg, нужен для 4 уровня станции. Вес 0,5, стоит 7 000.',
    tbd: true, src: ['at-inductor', 'gg-frigate']
  },
  {
    name: 'Frigate Diagnostic Node', rarity: 'legendary', tags: ['frigate', 'research'],
    where: 'На Фрегате («найден в следе ARC-фрегатов»).',
    why: 'Категория Research Item. Применение пока точно не описано.',
    tbd: true, src: ['mf-node', 'ig-frigate']
  },
  {
    name: 'ARC Conductive Coupler', rarity: 'epic', tags: ['emperor', 'quest'],
    where: 'Emperor Payload (Redirection).',
    why: '1 шт. в рецепт Emperor Gateway Conduit. Ещё 1 сдаётся Celeste в квесте Sizing Things Up. Вес 0,5.',
    src: ['mf-emperor', 'at-q-sizing']
  },
  {
    name: 'ARC Insulated Coupler', rarity: 'epic', tags: ['emperor'],
    where: 'Emperor Payload (Redirection).',
    why: '1 шт. в рецепт Emperor Gateway Conduit. Вес 0,5.',
    src: ['mf-emperor']
  },
  {
    name: 'ARC Plated Coupler', rarity: 'epic', tags: ['emperor'],
    where: 'Emperor Payload (Redirection).',
    why: '1 шт. в рецепт Emperor Gateway Conduit. Вес 0,25.',
    src: ['mf-emperor']
  },
  {
    name: 'Emperor Gateway Conduit', rarity: 'legendary', tags: ['emperor'],
    where: 'Чертёж редко падает из Emperor Payload при Redirection. Крафт на Workbench I.',
    why: 'Ключ от двери у основания Императора. Рецепт: чертёж + по одному Conductive, Insulated и Plated Coupler.',
    src: ['dot-conduit', 'mf-emperor', 'arh-notes']
  },
  {
    name: 'Emperor Beacon', rarity: 'epic', tags: ['emperor'],
    where: 'Damaged Emperor Relay (красный луч в небо) при Redirection.',
    why: 'Используй на открытом месте: с неба падает Emperor Payload. Стак 3, вес 2,0 за штуку.',
    src: ['mf-redirect']
  },
  {
    name: 'Radial Press', rarity: null, tags: ['stations'],
    where: 'Обычный лут (предмет был в игре и раньше).',
    why: 'Gunsmith уровня 4: нужно 3 шт.',
    src: ['gh-amp']
  },
  {
    name: 'Magnetic Accelerator', rarity: null, tags: ['stations'],
    where: 'Обычный лут (предмет был в игре и раньше).',
    why: 'Gunsmith уровня 4: нужно 3 шт.',
    src: ['gh-amp']
  },
  {
    name: 'Bully Fragmenter', rarity: 'epic', tags: ['research'],
    where: 'Только с Bully (Pendola Pass). Продаётся за 3 000.',
    why: 'Исследование чертежа Anvil на Research Station ур. 2: 5 шт. + 1 Rusted Tools.',
    src: ['rb-bully', 'at-research']
  },
  {
    name: 'Skulker Targeter', rarity: 'uncommon', tags: ['research', 'quest'],
    where: 'Со Skulker (Pendola Pass).',
    why: 'Исследование чертежа Canto (ур. 2): 10 шт. + 5 Steel Spring. Сдаётся в квесте Tracks of the Beast.',
    src: ['ig-skulker', 'at-research', 'at-q-tracks']
  },
  {
    name: 'Skulker Driver', rarity: 'rare', tags: ['research', 'amp'],
    where: 'Со Skulker (Pendola Pass).',
    why: 'Исследование Mobile-Fire Grip Fittings (Sprint Shooting для амплифицированного оружия): 20 шт.',
    src: ['rb-skulker', 'at-research']
  },
  {
    name: 'Research Points', rarity: null, tags: ['research'],
    where: 'Некоторые предметы, найденные в рейдах.',
    why: 'Валюта Research Station: чертежи стоят 500–4 500 очков, перки амплификации по 5 000.',
    src: ['ath-outpost', 'at-research']
  },
  {
    name: 'Stencil Parts', rarity: null, tags: ['quest'],
    where: 'Лут в рейдах.',
    why: 'Нанесение изученных Weapon Stencils (скинов) на оружие.',
    src: ['notes']
  },
  {
    name: 'Planks, Battered Paperback, Mini Pump', rarity: null, tags: ['stations'],
    where: 'Planks продаёт Celeste. Остальное обычный лут.',
    why: 'Research Station ур. 1: 35 Planks, 5 Battered Paperback, 3 Mini Pump.',
    src: ['at-station', 'wiki-outpost']
  },
  {
    name: 'Steel Cable, Sheet Metal, Cable Stripper', rarity: null, tags: ['stations'],
    where: 'Обычный лут. Sheet Metal чаще на промышленных локациях.',
    why: 'Каждая комната Outpost: 3 Steel Cable, 20 Sheet Metal, 3 Cable Stripper.',
    src: ['ath-outpost']
  },
  {
    name: 'ARC Alloy, Advanced Electrical Components', rarity: null, tags: ['stations'],
    where: 'ARC Alloy с ARC (Wasp, Hornet). Advanced Electrical Components в электрике.',
    why: 'Этап 2 открытия Outpost: 3 Planks, 5 Sheet Metal, 10 ARC Alloy, 3 Advanced Electrical Components.',
    src: ['wiki-outpost', 'ath-outpost']
  }
];
