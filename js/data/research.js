/*
  Research Station (в Outpost). Чертежи и предметы по уровням станции.
  Мебель (Outpost designs) не включена, только то, что влияет на рейды.
  t (тип): weapon, mod, gadget, grenade, mine, augment, med, mat, gear
  rp — очки исследования, mats — [название, количество]
  new: true — предмет появился в Frozen Trail
  Источник: ARC Tracker, версия игры 2.00.
*/
window.FT = window.FT || {};

FT.research = {
  levels: [
    { lvl: 1, cost: '35 Planks, 5 Battered Paperback, 3 Mini Pump', req: 'Построена 1 комната Outpost', unlocks: '14 чертежей, 20 дизайнов мебели' },
    { lvl: 2, cost: null, req: null, unlocks: '31 чертёж, 1 предмет, 18 дизайнов' },
    { lvl: 3, cost: null, req: null, unlocks: '14 чертежей, 1 предмет, 14 дизайнов' },
    { lvl: 4, cost: null, req: null, unlocks: '15 перков для амплификации оружия', note: 'По описанию предмета для улучшения станции нужен Frigate Inductor.' }
  ],
  items: [
    // Уровень 1
    { lvl: 1, name: 'Bantam', t: 'weapon', rp: 3000, mats: [['Hornet Driver', 8]], new: true },
    { lvl: 1, name: 'Stiletto', t: 'weapon', rp: 3000, mats: [['Wasp Driver', 15]], new: true },
    { lvl: 1, name: 'Grappling Hook', t: 'gadget', rp: 2000, mats: [['Rope', 10]], new: true },
    { lvl: 1, name: 'Yank Grenade', t: 'grenade', rp: 1000, mats: [['Steel Cable', 8]], new: true },
    { lvl: 1, name: 'Burletta', t: 'weapon', rp: 2000, mats: [['Simple Gun Parts', 8]] },
    { lvl: 1, name: 'Il Toro', t: 'weapon', rp: 1500, mats: [['Shredder Gyro', 5]] },
    { lvl: 1, name: 'Barricade Kit', t: 'gadget', rp: 1000, mats: [['Rusty ARC Steel', 3]] },
    { lvl: 1, name: 'Crash Mat', t: 'gadget', rp: 1000, mats: [['Durable Cloth', 5]] },
    { lvl: 1, name: 'Gas Mine', t: 'mine', rp: 1000, mats: [['Household Cleaner', 3]] },
    { lvl: 1, name: 'Pulse Mine', t: 'mine', rp: 1000, mats: [['Industrial Battery', 3]] },
    { lvl: 1, name: 'Lure Grenade', t: 'grenade', rp: 1000, mats: [['ARC Circuitry', 6]] },
    { lvl: 1, name: 'Seeker Grenade', t: 'grenade', rp: 1000, mats: [['Rocketeer Driver', 1]] },
    { lvl: 1, name: 'Remote Raider Flare', t: 'gadget', rp: 500, mats: [['Chemicals', 25]] },
    { lvl: 1, name: 'White Flag', t: 'gadget', rp: 500, mats: [['Planks', 5]] },

    // Уровень 2
    { lvl: 2, name: 'Tether Launcher', t: 'gadget', rp: 2000, mats: [['Steel Cable', 3], ['Unusable Weapon', 1]], new: true },
    { lvl: 2, name: 'Anvil', t: 'weapon', rp: 3000, mats: [['Bully Fragmenter', 5], ['Rusted Tools', 1]] },
    { lvl: 2, name: 'Canto', t: 'weapon', rp: 2000, mats: [['Skulker Targeter', 10], ['Steel Spring', 5]] },
    { lvl: 2, name: 'Osprey', t: 'weapon', rp: 3000, mats: [['Camera Lens', 1], ['Sentinel Firing Core', 3]] },
    { lvl: 2, name: 'Rascal', t: 'weapon', rp: 3000, mats: [['ARC Alloy', 15], ['Bombardier Cell', 2]] },
    { lvl: 2, name: 'Torrente', t: 'weapon', rp: 3000, mats: [['Bastion Cell', 3], ['Cooling Fan', 1]] },
    { lvl: 2, name: 'Venator', t: 'weapon', rp: 3000, mats: [['Leaper Pulse Unit', 3], ['Mechanical Components', 1]] },
    { lvl: 2, name: 'Defibrillator', t: 'med', rp: 2000, mats: [['Adrenaline Shot', 5], ['Syringe', 3]] },
    { lvl: 2, name: 'Vita Shot', t: 'med', rp: 2000, mats: [['Microscope', 2], ['Syringe', 2]] },
    { lvl: 2, name: 'Blaze Grenade', t: 'grenade', rp: 2000, mats: [['Fireball Burner', 3], ['Impure ARC Coolant', 5]] },
    { lvl: 2, name: 'Smoke Grenade', t: 'grenade', rp: 2000, mats: [['Gas Grenade', 3], ['Household Cleaner', 1]] },
    { lvl: 2, name: 'Tagging Grenade', t: 'grenade', rp: 2000, mats: [['Broken Guidance System', 2], ['Sensors', 2]] },
    { lvl: 2, name: 'Trigger Nade', t: 'grenade', rp: 2000, mats: [['Pop Trigger', 2], ['Radio', 2]] },
    { lvl: 2, name: 'Explosive Mine', t: 'mine', rp: 2000, mats: [['Comet Igniter', 3], ['Sensors', 2]] },
    { lvl: 2, name: 'Jolt Mine', t: 'mine', rp: 2000, mats: [['Advanced ARC Powercell', 3], ['Industrial Battery', 1]] },
    { lvl: 2, name: 'Showstopper', t: 'gear', rp: 2000, mats: [['Hornet Driver', 5], ['Industrial Battery', 3]] },
    { lvl: 2, name: 'Surge Coil', t: 'gear', rp: 2000, mats: [['Battery', 10], ['Hornet Driver', 3]] },
    { lvl: 2, name: 'Trailblazer', t: 'gear', rp: 2000, mats: [['Crude Explosives', 5], ['Turbine Compressor', 1]] },
    { lvl: 2, name: 'Heavy Gun Parts', t: 'mat', rp: 2000, mats: [['Simple Gun Parts', 5], ['Unusable Weapon', 1]] },
    { lvl: 2, name: 'Medium Gun Parts', t: 'mat', rp: 2000, mats: [['Simple Gun Parts', 5], ['Unusable Weapon', 1]] },
    { lvl: 2, name: 'Light Gun Parts', t: 'mat', rp: 2000, mats: [['Simple Gun Parts', 5], ['Unusable Weapon', 1]] },
    { lvl: 2, name: 'Angled Grip II', t: 'mod', rp: 3000, mats: [['ARC Flex Rubber', 5], ['Mechanical Components', 1]] },
    { lvl: 2, name: 'Vertical Grip II', t: 'mod', rp: 2000, mats: [['ARC Flex Rubber', 5], ['Mechanical Components', 1]] },
    { lvl: 2, name: 'Stable Stock II', t: 'mod', rp: 2000, mats: [['ARC Flex Rubber', 5], ['Rubber Pad', 1]] },
    { lvl: 2, name: 'Compensator II', t: 'mod', rp: 2000, mats: [['Cooling Coil', 1], ['Rusty ARC Steel', 5]] },
    { lvl: 2, name: 'Muzzle Brake II', t: 'mod', rp: 2000, mats: [['Rusty ARC Steel', 5], ['Steel Cable', 1]] },
    { lvl: 2, name: 'Extended Barrel II', t: 'mod', rp: 2000, mats: [['Rusty ARC Steel', 5], ['Steel Cable', 1]] },
    { lvl: 2, name: 'Shotgun Choke II', t: 'mod', rp: 2000, mats: [['Heavy Gun Parts', 1], ['Rusty ARC Steel', 5]] },
    { lvl: 2, name: 'Silencer I', t: 'mod', rp: 2000, mats: [['Cooling Coil', 1], ['Rusty ARC Steel', 5]] },
    { lvl: 2, name: 'Extended Light Mag II', t: 'mod', rp: 2000, mats: [['Dried-Out ARC Resin', 5], ['Wires', 5]] },
    { lvl: 2, name: 'Extended Medium Mag II', t: 'mod', rp: 2000, mats: [['Canister', 3], ['Dried-Out ARC Resin', 5]] },
    { lvl: 2, name: 'Extended Shotgun Mag II', t: 'mod', rp: 2000, mats: [['Dried-Out ARC Resin', 5], ['Mechanical Components', 1]] },

    // Уровень 3
    { lvl: 3, name: 'Bettina', t: 'weapon', rp: 4500, mats: [['Complex Gun Parts', 1], ['Rocketeer Driver', 5]] },
    { lvl: 3, name: 'Hullcracker', t: 'weapon', rp: 4500, mats: [['Bombardier Cell', 5], ['Complex Gun Parts', 1]] },
    { lvl: 3, name: 'Powered Descender', t: 'gadget', rp: 3000, mats: [['Advanced Electrical Components', 1], ['Cooling Fan', 2]] },
    { lvl: 3, name: 'Deadline', t: 'gear', rp: 3000, mats: [['Comet Igniter', 5], ['Fossilized Lightning', 1]] },
    { lvl: 3, name: 'Vita Spray', t: 'med', rp: 3000, mats: [['Antiseptic', 5], ['Chemicals', 50]] },
    { lvl: 3, name: 'Complex Gun Parts', t: 'mat', rp: 3000, mats: [['Advanced Mechanical Components', 1], ['Complex Gun Parts', 2]] },
    { lvl: 3, name: 'Silencer II', t: 'mod', rp: 3000, mats: [['Advanced Mechanical Components', 1], ['ARC Performance Steel', 5]] },
    { lvl: 3, name: 'Vertical Grip III', t: 'mod', rp: 3000, mats: [['Advanced Mechanical Components', 1], ['ARC Motion Core', 6]] },
    { lvl: 3, name: 'Combat Mk. 3 (Flanking)', t: 'augment', rp: 3000, mats: [['ARC Circuitry', 5], ['Mechanical Components', 3]] },
    { lvl: 3, name: 'Looting Mk. 3 (Safekeeper)', t: 'augment', rp: 3000, mats: [['ARC Circuitry', 5], ['Canister', 5]] },
    { lvl: 3, name: 'Looting Mk. 3 (Survivor)', t: 'augment', rp: 3000, mats: [['ARC Circuitry', 5], ['Syringe', 2]] },
    { lvl: 3, name: 'Tactical Mk. 3 (Defensive)', t: 'augment', rp: 3000, mats: [['Advanced ARC Powercell', 2], ['ARC Circuitry', 5]] },
    { lvl: 3, name: 'Tactical Mk. 3 (Revival)', t: 'augment', rp: 3000, mats: [['Antiseptic', 3], ['ARC Circuitry', 5]] },
    { lvl: 3, name: 'Tactical Mk. 3 (Smoke)', t: 'augment', rp: 3000, mats: [['ARC Circuitry', 5], ['Smoke Grenade', 5]] }
  ]
};
