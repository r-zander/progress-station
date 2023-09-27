'use strict';

// TODO replace with requestAnimationFrame for smoothest experience
const updateSpeed = 20;

const baseLifespan = 365 * 70;
const dangerColors = [
    new Color([0, 128, 0], 'RGB'),    // 0% color: dark green
    new Color([255, 255, 0], 'RGB'),  // 50% color: yellow
    new Color([128, 0, 0], 'RGB'),    // 100% color: dark red
];

const defaultStationName = 'USS Progressor';
const emptyStationName = 'Unknown Station';

// Not const to allow easy game speed increase
// TODO change before release
let baseGameSpeed = 4;

const magnitudes = ['', 'k', 'M', 'B', 'T', 'q', 'Q', 'Sx', 'Sp', 'Oc'];
const metricPrefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R'];
const units = {
    energy: 'W',
    storedEnergy: 'Wh'
};

const battleBaseData = {
    Destroyer: {name: 'Destroyer', maxXp: 50, maxLayers: 5, progressBarId: 'battleProgressBar'},
};

const moduleBaseData = {
    Diesel: {name: 'Diesel', effects: [{effectType: EffectType.Population, baseValue: 5 }, {effectType: EffectType.Energy, baseValue: 5 }], maxXp: 50, energyConsumption: 3, energyGeneration: 5},
    Plastics: {name: 'Plastics', effects: [{effectType: EffectType.Population, baseValue: 5 }, {effectType: EffectType.Energy, baseValue: 5 }], maxXp: 100, energyConsumption: 3, energyGeneration: 5},
    Steel: {name: 'Steel', effects: [{effectType: EffectType.Population, baseValue: 5 }, {effectType: EffectType.Energy, baseValue: 5 }], maxXp: 200, energyConsumption: 3, energyGeneration: 5},
    Garbage: {name: 'Garbage', effects: [{effectType: EffectType.Population, baseValue: 5 }, {effectType: EffectType.Energy, baseValue: 5 }], maxXp: 400, energyConsumption: 3, energyGeneration: 5},
};

const skillBaseData = {
    Concentration: {name: 'Concentration', maxXp: 100, effects: [{effectType: EffectType.Population, baseValue: 5 }, {effectType: EffectType.Energy, baseValue: 5 }], description: 'Research xp'},
    Productivity: {name: 'Productivity', maxXp: 100, effects: [{effectType: EffectType.Population, baseValue: 5 }, {effectType: EffectType.Energy, baseValue: 5 }], description: 'Module xp'},
};

const itemBaseData = {
    Homeless: {name: 'Homeless', expense: 0, effects: [{effectType: EffectType.Population, baseValue: 5 }, {effectType: EffectType.Energy, baseValue: 5 }]},
    Book: {name: 'Book', expense: 10, effects: [{effectType: EffectType.Population, baseValue: 5 }, {effectType: EffectType.Energy, baseValue: 5 }], description: 'Research xp'},
};

//TODO: split all in baseData
const moduleOperations = {
    Garbage: new ModuleOperation(moduleBaseData.Garbage),
    Diesel: new ModuleOperation(moduleBaseData.Diesel),
    Plastics: new ModuleOperation(moduleBaseData.Plastics),
    Steel: new ModuleOperation(moduleBaseData.Steel),
}

const moduleComponents = {
    Fuel: new ModuleComponent({name: 'Fuel', operations: [moduleOperations.Garbage, moduleOperations.Diesel]}),
    Products: new ModuleComponent({name: 'Products', operations: [moduleOperations.Plastics, moduleOperations.Steel]})
}

const modules = {
    Furnace: new Module({name:'Furnace', components: [moduleComponents.Fuel, moduleComponents.Products]}),
}

/*
const moduleCategories = {
    Fundamentals: new ModuleCategory ({name: 'Fundamentals', headerRowColor: '#55A630', modules: [modules.Furnace]})
}*/

const moduleCategories = {
    Fundamentals: [modules.Furnace],
};

const skillCategories = {
    Fundamentals: [skillBaseData.Concentration, skillBaseData.Productivity],
};

const itemCategories = {
    Properties: [itemBaseData.Homeless],
    Misc: [itemBaseData.Book]
};

const permanentUnlocks = ['Scheduling', 'Shop', 'Automation', 'Quick task display'];

const headerRowColors = {
    'Common generators': '#55A630',
    'Military grade': '#E63946',
    'Arcane energy': '#C71585',
    'Fundamentals': '#4A4E69',
    'Combat': '#FF704D',
    'Magic': '#875F9A',
    'Dark magic': '#73000F',
    'Properties': '#219EBC',
    'Misc': '#B56576',
};

const tooltips = {
    'Beggar': 'Struggle day and night for a couple of copper coins. It feels like you are at the brink of death each day.',
    'Farmer': 'Plow the fields and grow the crops. It\'s not much but it\'s honest work.',
    'Fisherman': 'Reel in various fish and sell them for a handful of coins. A relaxing but still a poor paying job.',
    'Miner': 'Delve into dangerous caverns and mine valuable ores. The pay is quite meager compared to the risk involved.',
    'Blacksmith': 'Smelt ores and carefully forge weapons for the military. A respectable and OK paying commoner job.',
    'Merchant': 'Travel from town to town, bartering fine goods. The job pays decently well and is a lot less manually-intensive.',

    'Squire': 'Carry around your knight\'s shield and sword along the battlefield. Very meager pay but the work experience is quite valuable.',
    'Footman': 'Put down your life to battle with enemy soldiers. A courageous, respectable job but you are still worthless in the grand scheme of things.',
    'Veteran footman': 'More experienced and useful than the average footman, take out the enemy forces in battle with your might. The pay is not that bad.',
    'Knight': 'Slash and pierce through enemy soldiers with ease, while covered in steel from head to toe. A decently paying and very respectable job.',
    'Veteran knight': 'Utilising your unmatched combat ability, slaugher enemies effortlessly. Most footmen in the military would never be able to acquire such a well paying job like this.',
    'Elite knight': 'Obliterate squadrons of enemy soldiers in one go with extraordinary proficiency, while equipped with the finest gear. Such a feared unit on the battlefield is paid extremely well.',
    'Holy knight': 'Collapse entire armies in mere seconds with your magically imbued blade. The handful of elite knights who attain this level of power are showered with coins.',
    'Legendary knight': 'Feared worldwide, obliterate entire nations in a blink of an eye. Roughly every century, only one holy knight is worthy of receiving such an esteemed title.',

    'Student': 'Study the theory of mana and practice basic spells. There is minor pay to cover living costs, however, this is a necessary stage in becoming a mage.',
    'Apprentice mage': 'Under the supervision of a mage, perform basic spells against enemies in battle. Generous pay will be provided to cover living costs.',
    'Mage': 'Turn the tides of battle through casting intermediate spells and mentor other apprentices. The pay for this particular job is extremely high.',
    'Wizard': 'Utilise advanced spells to ravage and destroy entire legions of enemy soldiers. Only a small percentage of mages deserve to attain this role and are rewarded with an insanely high pay.',
    'Master wizard': 'Blessed with unparalleled talent, perform unbelievable feats with magic at will. It is said that a master wizard has enough destructive power to wipe an empire off the map.',
    'Chairman': 'Spend your days administrating The Arcane Association and investigate the concepts of true immortality. The chairman receives ludicrous amounts of pay daily.',

    'Concentration': 'Improve your learning speed through practising intense concentration activities.',
    'Productivity': 'Learn to procrastinate less at work and receive more job experience per day.',
    'Bargaining': 'Study the tricks of the trade and persuasive skills to lower any type of expense.',
    'Meditation': 'Fill your mind with peace and tranquility to tap into greater happiness from within.',

    'Strength': 'Condition your body and strength through harsh training. Stronger individuals are paid more in the military.',
    'Battle tactics': 'Create and revise battle strategies, improving experience gained in the military.',
    'Muscle memory': 'Strengthen your neurons through habit and repetition, improving strength gains throughout the body.',

    'Mana control': 'Strengthen your mana channels throughout your body, aiding you in becoming a more powerful magical user.',
    'Immortality': 'Lengthen your lifespan through the means of magic. However, is this truly the immortality you have tried seeking for...?',
    'Time warping': 'Bend space and time through forbidden techniques, resulting in a faster gamespeed.',
    'Super immortality': 'Through harnessing ancient, forbidden techniques, lengthen your lifespan drastically beyond comprehension.',

    'Dark influence': 'Encompass yourself with formidable power bestowed upon you by evil, allowing you to pick up and absorb any job or skill with ease.',
    'Evil control': 'Tame the raging and growing evil within you, improving evil gain in-between rebirths.',
    'Intimidation': 'Learn to emit a devilish aura which strikes extreme fear into other merchants, forcing them to give you heavy discounts.',
    'Demon training': 'A mere human body is too feeble and weak to withstand evil. Train with forbidden methods to slowly manifest into a demon, capable of absorbing knowledge rapidly.',
    'Blood meditation': 'Grow and culture the evil within you through the sacrifise of other living beings, drastically increasing evil gain.',
    'Demon\'s wealth': 'Through the means of dark magic, multiply the raw matter of the coins you receive from your job.',

    'Homeless': 'Sleep on the uncomfortable, filthy streets while almost freezing to death every night. It cannot get any worse than this.',
    'Tent': 'A thin sheet of tattered cloth held up by a couple of feeble, wooden sticks. Horrible living conditions but at least you have a roof over your head.',
    'Wooden hut': 'Shabby logs and dirty hay glued together with horse manure. Much more sturdy than a tent, however, the stench isn\'t very pleasant.',
    'Cottage': 'Structured with a timber frame and a thatched roof. Provides decent living conditions for a fair price.',
    'House': 'A building formed from stone bricks and sturdy timber, which contains a few rooms. Although quite expensive, it is a comfortable abode.',
    'Large house': 'Much larger than a regular house, which boasts even more rooms and multiple floors. The building is quite spacious but comes with a hefty price tag.',
    'Small palace': 'A very rich and meticulously built structure rimmed with fine metals such as silver. Extremely high expenses to maintain for a lavish lifestyle.',
    'Grand palace': 'A grand residence completely composed of gold and silver. Provides the utmost luxurious and comfortable living conditions possible for a ludicrous price.',

    'Book': 'A place to write down all your thoughts and discoveries, allowing you to learn a lot more quickly.',
    'Dumbbells': 'Heavy tools used in strenuous exercise to toughen up and accumulate strength even faster than before. ',
    'Personal squire': 'Assists you in completing day to day activities, giving you more time to be productive at work.',
    'Steel longsword': 'A fine blade used to slay enemies even quicker in combat and therefore gain more experience.',
    'Butler': 'Keeps your household clean at all times and also prepares three delicious meals per day, leaving you in a happier, stress-free mood.',
    'Sapphire charm': 'Embedded with a rare sapphire, this charm activates more mana channels within your body, providing a much easier time learning magic.',
    'Study desk': 'A dedicated area which provides many fine stationary and equipment designed for furthering your progress in research.',
    'Library': 'Stores a collection of books, each containing vast amounts of information from basic life skills to complex magic spells.',
};

const layerData = [
    new LayerData('#ffe119'),
    new LayerData('#f58231'),
    new LayerData('#e6194B'),
    new LayerData('#911eb4'),
    new LayerData('#4363d8'),
    new LayerData('#47ff00'),
];

const lastLayerData= new LayerData('#000000');

function createRequirements(getElementsByClass, getTaskElement, getItemElement) {
    return {
        /*
        //Other
        'Arcane energy': new TaskRequirement(getElementsByClass('Arcane energy'), [{task: 'Concentration', requirement: 200}, {task: 'Meditation', requirement: 200}]),
        'Dark magic': new EvilRequirement(getElementsByClass('Dark magic'), [{requirement: 1}]),
        'Shop': new StoredEnergyRequirement([Dom.get().byId('shopTabButton')], [{requirement: gameData.itemData['Tent'].getEnergyUsage() * 50}]),
        'Rebirth tab': new AgeRequirement([Dom.get().byId('rebirthTabButton')], [{requirement: 25}]),
        'Rebirth note 1': new AgeRequirement([Dom.get().byId('rebirthNote1')], [{requirement: 45}]),
        'Rebirth note 2': new AgeRequirement([Dom.get().byId('rebirthNote2')], [{requirement: 65}]),
        'Rebirth note 3': new AgeRequirement([Dom.get().byId('rebirthNote3')], [{requirement: 200}]),
        'Battle tab': new AgeRequirement([Dom.get().byId('battleTabButton')], [{requirement: 0}]),
        'Evil info': new EvilRequirement([Dom.get().byId('evilInfo')], [{requirement: 1}]),
        'Time warping info': new TaskRequirement([Dom.get().byId('timeWarping')], [{task: 'Mage', requirement: 10}]),
        'Automation': new AgeRequirement([Dom.get().byId('automation')], [{requirement: 20}]),
        'Quick task display': new AgeRequirement(getElementsByClass('quickTaskDisplay'), [{requirement: 20}]),
        */

        //Common generators
        //'Beggar': new TaskRequirement([getTaskElement('Beggar')], []),
        //'Farmer': new TaskRequirement([getTaskElement('Farmer')], [{task: 'Beggar', requirement: 10}]),
        /*
        'Fisherman': new TaskRequirement([getTaskElement('Fisherman')], [{task: 'Farmer', requirement: 10}]),
        'Miner': new TaskRequirement([getTaskElement('Miner')], [{task: 'Strength', requirement: 10}, {task: 'Fisherman', requirement: 10}]),
        'Blacksmith': new TaskRequirement([getTaskElement('Blacksmith')], [{task: 'Strength', requirement: 30}, {task: 'Miner', requirement: 10}]),
        'Merchant': new TaskRequirement([getTaskElement('Merchant')], [{task: 'Bargaining', requirement: 50}, {task: 'Blacksmith', requirement: 10}]),
*/
        //Military
        /*
        'Squire': new TaskRequirement([getTaskElement('Squire')], [{task: 'Strength', requirement: 5}]),
        'Footman': new TaskRequirement([getTaskElement('Footman')], [{task: 'Strength', requirement: 20}, {task: 'Squire', requirement: 10}]),
        'Veteran footman': new TaskRequirement([getTaskElement('Veteran footman')], [{task: 'Battle tactics', requirement: 40}, {task: 'Footman', requirement: 10}]),
        'Knight': new TaskRequirement([getTaskElement('Knight')], [{task: 'Strength', requirement: 100}, {task: 'Veteran footman', requirement: 10}]),
        'Veteran knight': new TaskRequirement([getTaskElement('Veteran knight')], [{task: 'Battle tactics', requirement: 150}, {task: 'Knight', requirement: 10}]),
        'Elite knight': new TaskRequirement([getTaskElement('Elite knight')], [{task: 'Strength', requirement: 300}, {task: 'Veteran knight', requirement: 10}]),
        'Holy knight': new TaskRequirement([getTaskElement('Holy knight')], [{task: 'Mana control', requirement: 500}, {task: 'Elite knight', requirement: 10}]),
        'Legendary knight': new TaskRequirement([getTaskElement('Legendary knight')], [{task: 'Mana control', requirement: 1000}, {task: 'Battle tactics', requirement: 1000}, {task: 'Holy knight', requirement: 10}]),
/*
        //The Arcane Association
        'Student': new TaskRequirement([getTaskElement('Student')], [{task: 'Concentration', requirement: 200}, {task: 'Meditation', requirement: 200}]),
        'Apprentice mage': new TaskRequirement([getTaskElement('Apprentice mage')], [{task: 'Mana control', requirement: 400}, {task: 'Student', requirement: 10}]),
        'Mage': new TaskRequirement([getTaskElement('Mage')], [{task: 'Mana control', requirement: 700}, {task: 'Apprentice mage', requirement: 10}]),
        'Wizard': new TaskRequirement([getTaskElement('Wizard')], [{task: 'Mana control', requirement: 1000}, {task: 'Mage', requirement: 10}]),
        'Master wizard': new TaskRequirement([getTaskElement('Master wizard')], [{task: 'Mana control', requirement: 1500}, {task: 'Wizard', requirement: 10}]),
        'Chairman': new TaskRequirement([getTaskElement('Chairman')], [{task: 'Mana control', requirement: 2000}, {task: 'Master wizard', requirement: 10}]),
*/
        //Fundamentals
        Concentration : new TaskRequirement([getTaskElement('Concentration')], []),
        Productivity: new TaskRequirement([getTaskElement('Productivity')], [{task: 'Concentration', requirement: 5}]),
        //'Bargaining': new TaskRequirement([getTaskElement('Bargaining')], [{task: 'Concentration', requirement: 20}]),
        /*
        'Meditation': new TaskRequirement([getTaskElement('Meditation')], [{task: 'Concentration', requirement: 30}, {task: 'Productivity', requirement: 20}]),

        //Combat
        'Strength': new TaskRequirement([getTaskElement('Strength')], []),
        'Battle tactics': new TaskRequirement([getTaskElement('Battle tactics')], [{task: 'Concentration', requirement: 20}]),
        'Muscle memory': new TaskRequirement([getTaskElement('Muscle memory')], [{task: 'Concentration', requirement: 30}, {task: 'Strength', requirement: 30}]),

        //Magic
        'Mana control': new TaskRequirement([getTaskElement('Mana control')], [{task: 'Concentration', requirement: 200}, {task: 'Meditation', requirement: 200}]),
        'Immortality': new TaskRequirement([getTaskElement('Immortality')], [{task: 'Apprentice mage', requirement: 10}]),
        'Time warping': new TaskRequirement([getTaskElement('Time warping')], [{task: 'Mage', requirement: 10}]),
        'Super immortality': new TaskRequirement([getTaskElement('Super immortality')], [{task: 'Chairman', requirement: 1000}]),

        //Dark magic
        'Dark influence': new EvilRequirement([getTaskElement('Dark influence')], [{requirement: 1}]),
        'Evil control': new EvilRequirement([getTaskElement('Evil control')], [{requirement: 1}]),
        'Intimidation': new EvilRequirement([getTaskElement('Intimidation')], [{requirement: 1}]),
        'Demon training': new EvilRequirement([getTaskElement('Demon training')], [{requirement: 25}]),
        'Blood meditation': new EvilRequirement([getTaskElement('Blood meditation')], [{requirement: 75}]),
        'Demon\'s wealth': new EvilRequirement([getTaskElement('Demon\'s wealth')], [{requirement: 500}]),
*/
        //Properties
        Homeless: new StoredEnergyRequirement([getItemElement('Homeless')], [{requirement: 0}]),
        /*
        'Tent': new StoredEnergyRequirement([getItemElement('Tent')], [{requirement: 0}]),
        'Wooden hut': new StoredEnergyRequirement([getItemElement('Wooden hut')], [{requirement: gameData.itemData['Wooden hut'].getEnergyUsage() * 100}]),
        'Cottage': new StoredEnergyRequirement([getItemElement('Cottage')], [{requirement: gameData.itemData['Cottage'].getEnergyUsage() * 100}]),
        'House': new StoredEnergyRequirement([getItemElement('House')], [{requirement: gameData.itemData['House'].getEnergyUsage() * 100}]),
        'Large house': new StoredEnergyRequirement([getItemElement('Large house')], [{requirement: gameData.itemData['Large house'].getEnergyUsage() * 100}]),
        'Small palace': new StoredEnergyRequirement([getItemElement('Small palace')], [{requirement: gameData.itemData['Small palace'].getEnergyUsage() * 100}]),
        'Grand palace': new StoredEnergyRequirement([getItemElement('Grand palace')], [{requirement: gameData.itemData['Grand palace'].getEnergyUsage() * 100}]),
*/
        //Misc
        Book: new StoredEnergyRequirement([getItemElement('Book')], [{requirement: 0}]),
        /*
        'Dumbbells': new StoredEnergyRequirement([getItemElement('Dumbbells')], [{requirement: gameData.itemData['Dumbbells'].getEnergyUsage() * 100}]),
        'Personal squire': new StoredEnergyRequirement([getItemElement('Personal squire')], [{requirement: gameData.itemData['Personal squire'].getEnergyUsage() * 100}]),
        'Steel longsword': new StoredEnergyRequirement([getItemElement('Steel longsword')], [{requirement: gameData.itemData['Steel longsword'].getEnergyUsage() * 100}]),
        'Butler': new StoredEnergyRequirement([getItemElement('Butler')], [{requirement: gameData.itemData['Butler'].getEnergyUsage() * 100}]),
        'Sapphire charm': new StoredEnergyRequirement([getItemElement('Sapphire charm')], [{requirement: gameData.itemData['Sapphire charm'].getEnergyUsage() * 100}]),
        'Study desk': new StoredEnergyRequirement([getItemElement('Study desk')], [{requirement: gameData.itemData['Study desk'].getEnergyUsage() * 100}]),
        'Library': new StoredEnergyRequirement([getItemElement('Library')], [{requirement: gameData.itemData['Library'].getEnergyUsage() * 100}]),
   */
    };
}

function addMultipliers() {
    for (let taskName in gameData.taskData) {
        const task = gameData.taskData[taskName];

        task.xpMultipliers = [];
        if (task instanceof Job) {
            task.energyGenerationMultipliers = [];
        }

        task.pushDefaultMultipliers();
    }

    for (let itemName in gameData.itemData) {
        const item = gameData.itemData[itemName];
        item.expenseMultipliers = [];
        item.pushDefaultMultipliers();
    }
}

function setCustomEffects() {
    const bargaining = gameData.taskData['Bargaining'];
    bargaining.getEffect = function () {
        let multiplier = 1 - getBaseLog(7, bargaining.level + 1) / 10;
        if (multiplier < 0.1) {
            multiplier = 0.1;
        }
        return multiplier;
    };

    const intimidation = gameData.taskData['Intimidation'];
    intimidation.getEffect = function () {
        let multiplier = 1 - getBaseLog(7, intimidation.level + 1) / 10;
        if (multiplier < 0.1) {
            multiplier = 0.1;
        }
        return multiplier;
    };

    const timeWarping = gameData.taskData['Time warping'];
    timeWarping.getEffect = function () {
        return 1 + getBaseLog(13, timeWarping.level + 1);
    };

    const immortality = gameData.taskData['Immortality'];
    immortality.getEffect = function () {
        return 1 + getBaseLog(33, immortality.level + 1);
    };
}
