/*
  Амплифицированное оружие (Amplified Weapons).
  rarity: common | uncommon | rare | epic | legendary — определяет марку модуля (Mk. I…V).
  perks[].fx   — эффект (если известен). Значения сняты с превью-билдов, в игре могут отличаться.
  perks[].path — номер ветки (если известен), exclusive — выбор закрывает конкурирующие ветки.
*/
window.FT = window.FT || {};

FT.amplified = {
  modules: [
    { mk: 'Mk. I',   rarity: 'common' },
    { mk: 'Mk. II',  rarity: 'uncommon' },
    { mk: 'Mk. III', rarity: 'rare' },
    { mk: 'Mk. IV',  rarity: 'epic' },
    { mk: 'Mk. V',   rarity: 'legendary' }
  ],

  weapons: [
    {
      id: 'kettle', name: 'Kettle', cls: 'Полуавтоматическая штурмовая винтовка', ammo: 'light', rarity: 'common',
      perks: [
        { name: 'Shield Damage' },
        { name: 'Full-Auto' },
        { name: 'X Rounds', fx: 'Взрывные патроны с оглушающим эффектом.' }
      ]
    },
    {
      id: 'rattler', name: 'Rattler', cls: 'Штурмовая винтовка', ammo: 'medium', rarity: 'common',
      perks: [
        { name: 'More Reload', path: 1, fx: '+2 патрона за шаг перезарядки, заряжает по 4.' },
        { name: 'Drum Mag', path: 1, fx: 'Магазин 64 (+40). Отдача +50% по вертикали и горизонтали, разброс +30%, прицеливание на 10% медленнее.' },
        { name: 'Incendiary Rounds', path: 2, exclusive: true, fx: '+5 урона огнём в секунду, горение дольше на 2 с. Магазин остаётся 24.' }
      ]
    },
    {
      id: 'hairpin', name: 'Hairpin', cls: 'Пистолет с продольным затвором', ammo: 'light', rarity: 'common',
      perks: [
        { name: 'Incendiary Rounds', path: 1, exclusive: true, fx: '+5 урона огнём в секунду, горение дольше на 2 с. Закрывает ветки Semi-Automatic, Sprint Shooting и Tracker Rounds.' },
        { name: 'Semi-Automatic', path: 2, fx: 'Скорострельность +150%, множитель хедшота −20%, разброс за выстрел +40%.' },
        { name: 'Sprint Shooting', path: 2, fx: 'Стрельба на бегу.' },
        { name: 'Tracker Rounds', path: 3, exclusive: true, fx: 'Подсвечивает поражённые цели на 5 секунд.' }
      ]
    },
    {
      id: 'iltoro', name: 'Il Toro', cls: 'Помповый дробовик', ammo: 'shotgun', rarity: 'uncommon',
      perks: [ { name: 'Mag Reload' }, { name: 'Slug Rounds' } ]
    },
    {
      id: 'burletta', name: 'Burletta', cls: 'Пистолет', ammo: 'light', rarity: 'uncommon',
      perks: [
        { name: 'Burst Fire', path: 1, exclusive: true, fx: '+2 снаряда за очередь (очередь по 3). Закрывает ветки Full Auto и Sprint Shooting.' },
        { name: 'Increased Burst', path: 1, fx: 'Ещё +2 снаряда (очередь по 5) и +3 к магазину.' },
        { name: 'Full Auto', path: 2, exclusive: true, fx: 'Скорострельность +60%, базовый урон −2, множитель хедшота −60%, отдача и разброс +50%, разброс восстанавливается вдвое дольше.' },
        { name: 'Sprint Shooting', path: 3, fx: 'Стрельба на бегу.' }
      ]
    },
    {
      id: 'anvil', name: 'Anvil', cls: 'Ручная пушка', ammo: 'heavy', rarity: 'rare',
      note: 'С патча 2.0 Anvil стал редким (синим), поэтому ему нужен Mk. III. Слот Tech Mod у Anvil убрали, а старый мод Splitter теперь работает только как улучшение Amplified Anvil.',
      perks: [
        { name: 'X Rounds', fx: 'Немного больше урона по рейдерам и намного больше по броне ARC.' },
        { name: 'Anvil Splitter', exclusive: true, fx: 'Пуля делится на 4 снаряда (+3 за выстрел). Урон снаряда −70%, хедшот −40%, базовый разброс −30%, восстановление разброса −90%, разброс в прицеле +40%.' }
      ]
    },
    {
      id: 'renegade', name: 'Renegade', cls: 'Рычажная винтовка', ammo: 'medium', rarity: 'rare',
      perks: [
        { name: 'More Reload', path: 1, fx: '+1 патрон за шаг перезарядки.' },
        { name: 'Scoped', path: 2, fx: 'Снайперский прицел. Слота под магазин больше нет.' }
      ]
    },
    {
      id: 'canto', name: 'Canto', cls: 'Пистолет-пулемёт', ammo: 'medium', rarity: 'rare',
      perks: [
        { name: 'Carbine Conversion', fx: 'Стабильнее и точнее, но менее подвижный.' },
        { name: 'Sprint Shooting', fx: 'Стрельба на бегу.' },
        { name: 'Incendiary Rounds', fx: 'Поджигает цели.' }
      ]
    },
    {
      id: 'osprey', name: 'Osprey', cls: 'Снайперская винтовка с прицелом', ammo: 'medium', rarity: 'rare',
      perks: [ { name: 'Tracker Rounds' }, { name: 'Straight Bolt' }, { name: 'Weakpoint Damage' } ]
    },
    {
      id: 'rascal', name: 'Rascal', cls: 'Переломный гранатомёт', ammo: 'launcher', rarity: 'rare',
      perks: [ { name: 'High-Velocity Rounds' }, { name: 'Sprint Shooting' }, { name: 'Incendiary Grenade' } ]
    },
    {
      id: 'bettina', name: 'Bettina', cls: 'Штурмовая винтовка', ammo: 'heavy', rarity: 'epic',
      perks: [
        { name: 'Bigger Mag', fx: '+15 к магазину.' },
        { name: 'Semi-Auto', fx: 'Полуавтоматический огонь, +3 к базовому урону.' },
        { name: 'X Rounds', fx: 'Взрывные патроны.' }
      ]
    },
    {
      id: 'hullcracker', name: 'Hullcracker', cls: 'Помповый гранатомёт', ammo: 'launcher', rarity: 'epic',
      perks: [
        { name: 'Incendiary Grenade', fx: 'Взрывы поджигают.' },
        { name: 'Mag Reload', fx: 'Перезаряжает весь магазин за раз.' }
      ]
    },
    {
      id: 'aphelion', name: 'Aphelion', cls: 'Энергетическая боевая винтовка', ammo: 'energy', rarity: 'legendary',
      perks: [ { name: 'Bigger Mag' }, { name: 'Charged Shot' }, { name: 'Increased Burst' }, { name: 'Incendiary Rounds' } ]
    },
    {
      id: 'equalizer', name: 'Equalizer', cls: 'Автоматическая лучевая пушка', ammo: 'energy', rarity: 'legendary',
      perks: [ { name: 'Ramping Damage' }, { name: 'Weakpoint Damage' }, { name: 'Bigger Mag' } ]
    },
    {
      id: 'jupiter', name: 'Jupiter', cls: 'Энергетическая снайперская винтовка', ammo: 'energy', rarity: 'legendary',
      perks: [ { name: 'Bigger Mag' }, { name: 'Scoped' }, { name: 'Straight Bolt' } ]
    }
  ],

  /*
    Исследования Research Station уровня 4 (weapon perks).
    Каждое стоит 5 000 очков исследования + материалы + задание в рейде.
    usedBy — id оружия из списка выше. Данные ARC Tracker (версия игры 2.00), 12 из 15.
  */
  research: [
    { name: 'Action Economy', mats: [['Sentinel Firing Core', 8]], task: 'Нанести 1 000 урона из Hairpin', usedBy: ['jupiter', 'osprey'] },
    { name: 'Beam Resonance Tech', mats: [['Queen Reactor', 2]], task: 'Нанести 1 500 урона по Vaporizer из Equalizer за один рейд', usedBy: ['equalizer'] },
    { name: 'Burst Assembly Recovery', mats: [['Pop Trigger', 20]], task: 'Уничтожить 3 Shredder с помощью Raider Tool', usedBy: ['burletta'] },
    { name: 'Compact Combustion Charges', mats: [['Bombardier Cell', 5]], task: 'Нанести 3 000 урона гранатами Blaze Grenade', usedBy: ['hullcracker', 'rascal'] },
    { name: 'Embedded Blast Engineering', mats: [['Rocketeer Driver', 5]], task: 'Нанести 1 000 урона по Firefly гранатами Light Impact Grenade', usedBy: ['anvil', 'bettina', 'kettle'] },
    { name: 'Extended Burst Cycles', mats: [['Comet Igniter', 10]], task: 'Нанести 10 000 урона из Burletta с Burst или Aphelion с Charged Burst', usedBy: ['aphelion', 'burletta'] },
    { name: 'High-Voltage Exposure', mats: [['Leaper Pulse Unit', 5]], task: 'Уничтожить 5 ARC Turbine', usedBy: ['aphelion'] },
    { name: 'Magazine Geometry 101', mats: [['Bastion Cell', 5]], task: 'Нанести 15 000 урона по Bastion из Rattler', usedBy: ['rattler'] },
    { name: 'Mobile-Fire Grip Fittings', mats: [['Skulker Driver', 20]], task: 'Посетить Electrical Substation на Pendola Pass', usedBy: ['burletta', 'canto', 'hairpin', 'rascal'], note: 'открывает Sprint Shooting' },
    { name: 'Shield Stress Testing', mats: [['Matriarch Reactor', 2]], task: 'Нанести 700 урона встреченным рейдерам', usedBy: ['kettle'] },
    { name: 'Solid-Core Casting Tech', mats: [['Tick Pod', 20]], task: 'Уничтожить 50 летающих ARC из дробовиков', usedBy: ['iltoro'] },
    { name: 'Targeted Component Trial', mats: [['Fireball Burner', 20]], task: null, usedBy: [], partial: true }
  ]
};
