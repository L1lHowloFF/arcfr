/*
  Источники. Ключ — короткий id, на него ссылаются разделы через data-src="id1,id2".
  k: official | db | guide
*/
window.FT = window.FT || {};

FT.sources = {
  // Официальное
  notes:     { k: 'official', t: 'Patch Notes: Frozen Trail 2.0 Update (Embark Studios)', u: 'https://arcraiders.com/news/frozen-trail-2-0-update' },
  preview:   { k: 'official', t: 'Frozen Trail First Look (Embark Studios)', u: 'https://arcraiders.com/news/frozen-trail-content-preview' },
  live:      { k: 'official', t: 'Frozen Trail is live! (Embark Studios)', u: 'https://arcraiders.com/news/frozen-trail-is-live' },

  // Базы данных и вики
  'at-research':  { k: 'db', t: 'ARC Tracker: все исследования', u: 'https://arctracker.io/research' },
  'at-station':   { k: 'db', t: 'ARC Tracker: Research Station', u: 'https://arctracker.io/hideout/research_station' },
  'at-inductor':  { k: 'db', t: 'ARC Tracker: Frigate Inductor', u: 'https://arctracker.io/items/frigate_inductor' },
  'at-hook':      { k: 'db', t: 'ARC Tracker: Grappling Hook', u: 'https://arctracker.io/items/grappling_hook' },
  'at-q-board':   { k: 'db', t: 'ARC Tracker: квест Boarding the Frigate', u: 'https://arctracker.io/quests/boarding-the-frigate' },
  'at-q-disrupt': { k: 'db', t: 'ARC Tracker: квест Disrupting the Frigate', u: 'https://arctracker.io/quests/disrupting-the-frigate' },
  'at-q-explore': { k: 'db', t: 'ARC Tracker: квест Exploring Pendola Pass', u: 'https://arctracker.io/quests/exploring-pendola-pass' },
  'at-q-sizing':  { k: 'db', t: 'ARC Tracker: квест Sizing Things Up', u: 'https://arctracker.io/quests/sizing-things-up' },
  'at-q-tracks':  { k: 'db', t: 'ARC Tracker: квест Tracks of the Beast', u: 'https://arctracker.io/quests/tracks-of-the-beast' },
  'at-q-belly':   { k: 'db', t: 'ARC Tracker: квест Belly of the Beast', u: 'https://arctracker.io/quests/belly-of-the-beast' },
  'wiki-frigate': { k: 'db', t: 'ARC Raiders Wiki: Frigate', u: 'https://arcraiders.wiki/wiki/Frigate' },
  'wiki-outpost': { k: 'db', t: 'ARC Raiders Wiki: Outpost', u: 'https://arcraiders.wiki/wiki/Outpost' },
  'rb-bully':     { k: 'db', t: 'RaiderBuddy: Bully', u: 'https://raiderbuddy.com/arc/bully' },
  'rb-skulker':   { k: 'db', t: 'RaiderBuddy: Skulker', u: 'https://raiderbuddy.com/arc/skulker' },
  'rb-hydra':     { k: 'db', t: 'RaiderBuddy: Hydra', u: 'https://raiderbuddy.com/arc/hydra' },
  'rb-modulator': { k: 'db', t: 'RaiderBuddy: Emperor Modulator', u: 'https://raiderbuddy.com/items/emperor-modulator' },
  'mf-node':      { k: 'db', t: 'MetaForge: Frigate Diagnostic Node', u: 'https://metaforge.app/arc-raiders/database/item/frigate-diagnostic-node' },
  'mf-detector':  { k: 'db', t: "MetaForge: Mountaineer's Detector", u: 'https://metaforge.app/arc-raiders/database/item/mountaineers-detector' },
  'mf-map':       { k: 'db', t: 'MetaForge: интерактивная карта Pendola Pass', u: 'https://metaforge.app/arc-raiders/map/pendola-pass' },
  'arh-map':      { k: 'db', t: 'ArcRaidersHub: интерактивная карта Pendola Pass', u: 'https://arcraidershub.com/maps/pendola-pass' },

  // Гайды и разборы
  'kg-frigate':   { k: 'guide', t: 'KeenGamer: Frigate и Amplification Modules', u: 'https://www.keengamer.com/articles/guides/arc-raiders-frigate-guide-farming-amplification-modules/' },
  'gg-frigate':   { k: 'guide', t: 'games.gg: как взять Фрегат', u: 'https://games.gg/arc-raiders/guides/arc-raiders-frigate-guide/' },
  'mf-frigate':   { k: 'guide', t: 'MetaForge: посадка на Фрегат и Гидра', u: 'https://metaforge.app/arc-raiders/how-to-board-the-arc-raiders-frigate-and-beat-the-hydra' },
  'ph-frigate':   { k: 'guide', t: 'PlayHub: Frigate Guide', u: 'https://playhub.com/blog/arc-raiders/frigate-guide-570775' },
  'ig-frigate':   { k: 'guide', t: 'Insider Gaming: Complete ARC Frigate Guide', u: 'https://insider-gaming.com/complete-arc-frigate-guide-for-arc-raiders-how-to-board-sabotage-escape/' },
  'arh-frigate':  { k: 'guide', t: 'ArcRaidersHub: Frigate Guide', u: 'https://arcraidershub.com/guides/frigate-guide' },
  'dt-board':     { k: 'guide', t: 'Destructoid: Boarding the Frigate', u: 'https://tech.yahoo.com/gaming/articles/complete-boarding-frigate-arc-raiders-134000064.html' },
  'arh-amp':      { k: 'guide', t: 'ArcRaidersHub: Amplified Weapons', u: 'https://arcraidershub.com/guides/amplified-weapons-guide' },
  'arh-modules':  { k: 'guide', t: 'ArcRaidersHub: где искать Amplification Modules', u: 'https://arcraidershub.com/guides/amplification-module-guide' },
  'egw-amp':      { k: 'guide', t: 'eGamersWorld: все 15 амплифицируемых пушек', u: 'https://egamersworld.com/blog/arc-raiders-weapon-amplifications-guide-how-to-unl-vY8nMsKzdn' },
  'gh-amp':       { k: 'guide', t: 'GamesHorizon: как открыть амплификацию', u: 'https://gameshorizon.com/guides/how-to-unlock-upgrade-amplified-weapons-in-arc-raiders-frozen-trail/' },
  'arh-emperor':  { k: 'guide', t: 'ArcRaidersHub: Emperor Dungeon', u: 'https://arcraidershub.com/guides/fallen-emperor-guide' },
  'mf-emperor':   { k: 'guide', t: 'MetaForge: как попасть в Императора', u: 'https://metaforge.app/arc-raiders/how-to-get-into-the-emperor-in-arc-raiders-emperor-gateway-conduit-and-couplers' },
  'mf-redirect':  { k: 'guide', t: 'MetaForge: условие Redirection', u: 'https://metaforge.app/arc-raiders/arc-raiders-redirection-map-condition-guide-emperor-relays-beacons-and-payload-loot' },
  'dot-conduit':  { k: 'guide', t: 'Dot Esports: Emperor Gateway Conduit', u: 'https://dotesports.com/arc-raiders/guides/arc-raiders-emperor-gateway-conduit' },
  'ath-outpost':  { k: 'guide', t: 'AllThings.How: Outpost и Research Workstation', u: 'https://allthings.how/arc-raiders-outpost-how-to-unlock-upgrade-and-use-the-research-workstation/' },
  'arh-gondola':  { k: 'guide', t: 'ArcRaidersHub: эвакуация на гондоле', u: 'https://arcraidershub.com/guides/ballistic-gondola-extraction-guide' },
  'arh-notes':    { k: 'guide', t: 'ArcRaidersHub: разбор патча 2.0', u: 'https://arcraidershub.com/blog/frozen-trail-2-0-patch-notes' },
  'bb-pendola':   { k: 'guide', t: 'Beebom: гайд по карте Pendola Pass', u: 'https://beebom.com/arc-raiders-pendola-pass-map-guide/' },
  'ts-pendola':   { k: 'guide', t: 'Timesaver: Pendola Pass по условиям карты', u: 'https://timesaver.gg/blog/arc-raiders-pendola-pass-map-guide' },
  'esg-ft':       { k: 'guide', t: 'esports.gg: обзор Frozen Trail', u: 'https://esports.gg/news/arc-raiders/arc-raiders-frozen-trail-update/' },
  'bb-stiletto':  { k: 'guide', t: 'Beebom: как получить Stiletto', u: 'https://beebom.com/how-to-get-stiletto-in-arc-raiders/' },
  'bb-bantam':    { k: 'guide', t: 'Beebom: как получить Bantam', u: 'https://beebom.com/how-to-get-bantam-in-arc-raiders/' },
  'bb-weapons':   { k: 'guide', t: 'Beebom: все пушки и их редкость', u: 'https://beebom.com/all-arc-raiders-weapons/' },
  'ig-skulker':   { k: 'guide', t: 'Insider Gaming: Skulker и Skulker Targeter', u: 'https://insider-gaming.com/how-to-get-skulker-targeter-destroy-skulker-in-arc-raiders/' },
  'tar-skills':   { k: 'guide', t: 'TheArcRaiders: дерево навыков 2.0', u: 'https://thearcraiders.com/guides/skill-tree/' },
  'argg-skills':  { k: 'guide', t: 'ArcRaiders.gg: новое дерево навыков', u: 'https://arcraiders.gg/blog/arc-raiders-frozen-trail-skill-tree/' }
};
