// This code runs as soon as the page loads
// we added this so that the code runs when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    let currentUser = null;
    let currentStep = 1;
    let currentPetType = 'cat';

    const PET_MODIFIERS = {
        'dog': { health: 0.7 },
        'rabbit': { energy: 0.7 },
        'cat': { happiness: 0.7 }
    };


    // This keeps track of your pet's stats like health and hunger
    window.gameStats = window.gameStats || {
        health: 90,
        hunger: 80,
        happiness: 50,
        hygiene: 85,
        money: 50,
        currentFood: 23,
        userLvl: 1,
        energy: 50,
        lives: 2
    };

    let scheduledActions = {
        'Vet': { summary: 'None', xml: null },
        'Grocery Store': { summary: 'None', xml: null },
        'Home': { summary: 'None', xml: null },
        'Work': { summary: 'None', xml: null }
    };

    // we added this so that your game is saved
    function saveGameState() {
        if (currentUser) {
            localStorage.setItem(`user_variables_${currentUser}`, JSON.stringify(window.gameStats));
        }
    }

    // This lets the game know where the player is
    const character = document.getElementById('character');

    const screens = {
        auth: document.getElementById('auth-screen'),
        onboarding: document.getElementById('onboarding-screen'),
        game: document.getElementById('game-screen')
    };

    // gets all html elements
    const usernameInput = document.getElementById('username-input');
    const loginBtn = document.getElementById('login-btn');
    const nextStepBtn = document.getElementById('next-step');
    const finishOnboardingBtn = document.getElementById('finish-onboarding');
    const logoutBtn = document.getElementById('logout-btn');
    const pet = document.getElementById('pet');
    const obstaclesContainer = document.getElementById('obstacles-container');
    const stationsContainer = document.getElementById('stations-container');
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal');
    const displayName = document.getElementById('display-name');

    let characterPos = { x: 50, y: 50 };
    let petPos = { x: 44, y: 54 };
    let trees = [];
    let stations = [];
    const stationData = [
        { name: 'Home', x: 20, y: 30 },
        { name: 'Grocery Store', x: 70, y: 20 },
        { name: 'Vet', x: 50, y: 80 },
        { name: 'Work', x: 20, y: 75 },
        { name: 'AI Guide', x: 80, y: 70 }
    ];
    const stepSize = 4;
    let isModalOpen = false;
    // This is where the Blockly logic editor lives
    let workspace = null;

    // ============
    // (BLOCKLY SECTION) custom blocks used for the Blockly.js interface at stations (vet, home, grocery store). Blocks created with Google Blockly Developer Tools
    // ============
    // we added this so that there are blocks for the stations
    function defineCustomBlocks() {
        if (typeof Blockly === 'undefined') return;

        // we added this block so that you can feed your pet
        Blockly.Blocks['feed_pet'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("feed ")
                    .appendField(new Blockly.FieldNumber(0, 0, window.gameStats.currentFood), "times")
                    .appendField("times");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(230);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        // we added this block so that you can heal your pet
        Blockly.Blocks['heal_pet'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("heal pet ($10)")
                    .appendField(new Blockly.FieldLabel("→ +20 Health"), "BENEFIT");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(150);
                this.setTooltip("Heals pet for 20 health. Costs $10.");
                this.setHelpUrl("");
            }
        };
        // we added this block so that you can buy food
        Blockly.Blocks['buy_food'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("buy")
                    .appendField(new Blockly.FieldNumber(0, 0, 50), "food")
                    .appendField("food ($1/ea)");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(30);
                this.setTooltip("Buy food ($1/ea)");
                this.setHelpUrl("");
            }
        };
        // we added this block so that the pet can sleep
        Blockly.Blocks['sleep'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("sleep (+50 energy)");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(0);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        // we added this block so that you can check health
        Blockly.Blocks['daily_checkup'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("do a check-up ($2)")
                    .appendField(new Blockly.FieldNumber(1, 1, 10), "TIMES")
                    .appendField("times")
                    .appendField(new Blockly.FieldLabel("→ +5 Health/ea"), "BENEFIT");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(230);
                this.setTooltip("Check-up increases health by 5. Costs $2.");
                this.setHelpUrl("");
            }
        };

        // we added this block so that you can work
        Blockly.Blocks['work'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("work for ")
                    .appendField(new Blockly.FieldNumber(1, 1, 24), "hours")
                    .appendField("hours ($15/hr)");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(160);
                this.setTooltip("Work to earn money. Costs energy, hunger, and happiness.");
                this.setHelpUrl("");
            },
            maxInstances: 1
        };

        // we added this block so that you can play
        Blockly.Blocks['play_pet'] = {
            init: function () {
                this.appendDummyInput().appendField("play with pet");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(120);
            }
        };

        // we added this block so that you can wash the pet
        Blockly.Blocks['wash_pet'] = {
            init: function () {
                this.appendDummyInput().appendField("wash pet");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(120);
            }
        };

        // we added this block so that you can see stats
        Blockly.Blocks['get_pet_stat'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("pet's ")
                    .appendField(new Blockly.FieldDropdown([
                        ["Health", "health"],
                        ["Money", "money"],
                        ["Energy", "energy"],
                        ["Hunger", "hunger"],
                        ["Happiness", "happiness"],
                        ["Hygiene", "hygiene"],
                        ["Level", "userLvl"]
                    ]), "STAT");
                this.setOutput(true, "Number");
                this.setColour(260);
                this.setTooltip("Returns the current value of the selected pet stat.");
                this.setHelpUrl("");
            }
        };

        //functions that connect with Blockly blocks, allows game to be played
        const generator = (typeof Blockly !== 'undefined' && Blockly.JavaScript) || (window.javascript && window.javascript.javascriptGenerator);

        if (generator) {
            const func = generator.forBlock || generator;

            func['heal_pet'] = function (block) {
                return 'gameActions.healPet();\n';
            };

            func['daily_checkup'] = function (block) {
                const times = block.getFieldValue('TIMES') || 1;
                return `for (var i = 0; i < ${times}; i++) { window.gameActions.dailyCheckup(); }\n`;
            };

            func['feed_pet'] = function (block) {
                const times = Number(block.getFieldValue("times"));
                return `window.gameActions.feedPet(${times});\n`;
            };
            func['play_pet'] = function (block) {
                return `window.gameActions.playPet();\n`;
            };
            func['wash_pet'] = function (block) {
                return `window.gameActions.washPet();\n`;
            };
            func['buy_food'] = function (block) {
                const amount = Number(block.getFieldValue("food"));
                return `window.gameActions.buyFood(${amount});\n`;
            };
            func['sleep'] = function (block) {
                return `window.gameActions.sleepPet();\n`
            };
            func['work'] = function (block) {
                const hours = Number(block.getFieldValue("hours"));
                return `window.gameActions.workJob(${hours});\n`;
            };

            func['get_pet_stat'] = function (block) {
                const stat = block.getFieldValue('STAT');
                const code = `window.gameStats.${stat}`;
                return [code, generator.ORDER_ATOMIC];
            };
        } else {
            console.error("Blockly Generator (JavaScript) not found!");
        }
    }

    // functions that are connected to the blocks, changes global stats of pets

    window.gameActions = {
        // we added this so that you lose a life if stats are zero
        checkLifeLoss: () => {
            const vitals = ['health', 'happiness', 'hunger', 'hygiene', 'energy'];
            const hitZero = vitals.some(v => window.gameStats[v] <= 0);
            if (hitZero) {
                window.gameStats.lives = (window.gameStats.lives || 1) - 1;
                document.getElementById("livesHeader").textContent = `Lives: ${window.gameStats.lives}`;
                console.log("Life lost! Hitting 0 on a vital stat.");
                if (window.gameStats.lives <= 0) {
                    showGameOver();
                }
            }
        },
        // we added this so that the health goes up
        healPet: () => {
            if (window.gameStats.money >= 10) {
                window.gameStats.money -= 10;
                // Math.min ensures the value doesnt go over 100
                window.gameStats.health = Math.min(100, window.gameStats.health + 20);
                console.log("Healed! Health:", window.gameStats.health);
            } else {
                console.log("Need $10 to heal!");
            }
        },
        // we added this so that you can do a small heal
        dailyCheckup: () => {
            if (window.gameStats.money >= 2) {
                window.gameStats.money -= 2;
                window.gameStats.health = Math.min(100, window.gameStats.health + 5);
                console.log("Checkup! Health:", window.gameStats.health);
            } else {
                console.log("Need $2 for checkup!");
            }
        },
        // we added this so that hunger goes down
        feedPet: (times) => {
            if (window.gameStats.currentFood >= times) {
                // this formula makes variable increment less as level goes up, which means higher lvl --> overall harder gameplay
                window.gameStats.hunger += Math.round((times * 2.5) / (1 + (window.gameStats.userLvl * 0.025))) / 10;
                window.gameStats.hunger = Math.min(100, window.gameStats.hunger);
                window.gameStats.currentFood -= times;
                window.gameStats.money = Math.max(0, window.gameStats.currentFood);
                console.log("Feeding...");
                console.log(window.gameStats.currentFood);
            } else {
                console.log("Need more food to feed pet!");
            }

        },
        // we added this so that happiness goes up
        playPet: () => {
            const cost = 10;
            if (window.gameStats.energy >= cost) {
                window.gameStats.happiness += (5) / (1 + (window.gameStats.userLvl * 0.025));
                window.gameStats.happiness = Math.min(100, window.gameStats.happiness);
                window.gameStats.energy -= cost;
                console.log("Playing...");
                if (window.gameStats.energy <= 0) window.gameActions.checkLifeLoss();
            } else {
                console.log("Too tired to play! Need 10 energy.");
            }
        },
        // we added this so that energy goes up
        sleepPet: () => {
            window.gameStats.energy += 50;
            window.gameStats.energy = Math.min(100, window.gameStats.energy);
            console.log("Sleeping...");
        },
        // we added this so that hygiene goes up
        washPet: () => { console.log("Washing..."); },

        // we added this so that you can get more food
        buyFood: (amount) => {
            if (window.gameStats.money >= amount) {
                window.gameStats.money -= amount;
                window.gameStats.currentFood += amount;
            } else {
                console.log(`You do not have the required $${amount}!`);
            }

        },
        // we added this so that you can earn money
        workJob: (hours) => {
            const wage = 15;
            const mod = PET_MODIFIERS[currentPetType] || {};
            const energyCost = (hours * 4) * (mod.energy || 1);
            const hungerCost = (hours * 3) * (mod.hunger || 1);
            const happinessCost = (hours * 2) * (mod.happiness || 1);

            if (window.gameStats.energy >= energyCost &&
                window.gameStats.hunger >= hungerCost &&
                window.gameStats.happiness >= happinessCost) {

                window.gameStats.money += hours * wage;
                window.gameStats.energy -= energyCost;
                window.gameStats.hunger -= hungerCost;
                window.gameStats.happiness -= happinessCost;

                console.log(`Worked for ${hours} hours. Earned $${hours * wage}.`);

                if (window.gameStats.energy <= 0 || window.gameStats.hunger <= 0 || window.gameStats.happiness <= 0) {
                    window.gameActions.checkLifeLoss();
                }
            } else {
                console.log("Insufficient stats to work that long! The pet needs more energy, happiness, or food.");
            }
        },
    };
    // ==========
    // end of BLOCKLY.JS section
    // ===========



    checkSession();
    // stores user account in LocalStorage
    // we added this so that we know if you are logged in
    function checkSession() {
        const storedUser = localStorage.getItem('neo_user');
        if (storedUser) {
            login(storedUser);
        } else {
            showScreen('auth');
        }
    }

    // we added this so that you can see different pages
    function showScreen(screenId) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenId].classList.add('active');
    }

    // we added this so that you can access your account
    function login(username) {
        currentUser = username;
        const userData = JSON.parse(localStorage.getItem(`user_data_${username}`));

        if (!userData) {

            showScreen('onboarding');
        } else {

            startGame();
        }
    }

    // we added this so that the game begins
    function startGame() {
        displayName.textContent = currentUser;

        // Ensure blocks are defined so headless execution works immediately
        defineCustomBlocks();

        const storedVars = localStorage.getItem(`user_variables_${currentUser}`);
        if (storedVars) {
            Object.assign(window.gameStats, JSON.parse(storedVars));
        }


        const userData = JSON.parse(localStorage.getItem(`user_data_${currentUser}`));
        currentPetType = userData?.q2 || 'cat';
        pet.className = `pet ${currentPetType}`;

        generateTrees();
        generateStations();
        showScreen('game');
        updateCharacterPosition();
        updatePetPosition();
        window.addEventListener('keydown', handleInput);


        const savedActions = localStorage.getItem(`user_scheduled_actions_${currentUser}`);
        if (savedActions) {
            scheduledActions = JSON.parse(savedActions);
        }

        document.getElementById("levelHeader").textContent = `Level: ${window.gameStats.userLvl || 1}`;
        document.getElementById("livesHeader").textContent = `Lives: ${window.gameStats.lives ?? 2}`;
        updateSidebarUI();
    }

    // we added this so that the sidebar shows your plans
    function updateSidebarUI() {
        const list = document.getElementById('scheduled-actions-list');
        if (!list) return;

        list.innerHTML = '';
        Object.keys(scheduledActions).forEach(station => {
            const item = document.createElement('div');
            item.className = 'station-status-item';
            // const summary = typeof scheduledActions[station] === 'string' ? scheduledActions[station] : (scheduledActions[station].summary || 'None');

            const data = scheduledActions[station];
            const summary = typeof data === 'string' ? data : (data.summary || 'None');

            item.innerHTML = `
                <span class="station-name">${station}:</span>
                <span class="action-text">${summary}</span>
            `;
            list.appendChild(item);
        });

        updateMiniStatsUI();
    }

    // we added this so that the small circles update
    function updateMiniStatsUI() {
        const stats = window.gameStats;
        const colors = {
            health: '#ff4757',
            happiness: '#2ed573',
            hunger: '#ff4757',
            hygiene: '#22d3ee'
        };

        ['health', 'happiness', 'hunger', 'hygiene'].forEach(id => {
            const el = document.getElementById(`mini-${id}`);
            if (el) {
                const val = Math.trunc(stats[id] || 0);
                const color = colors[id] || 'var(--accent-primary)';
                el.style.background = `conic-gradient(${color} ${val}%, transparent ${val}%)`;
            }
        });

        const miniMoney = document.getElementById('mini-val-money');
        if (miniMoney) {
            miniMoney.textContent = `$${Math.trunc(stats.money || 0)}`;
        }
    }

    // we added this so that all your plans happen at once
    async function executeAllActions() {
        if (!workspace && typeof Blockly === 'undefined') {
            alert("Logic engine not ready.");
            return;
        }

        // --- BLOCK COUNT VALIDATION (Action Blocks Only) ---
        let actionBlockCount = 0;
        const actionTypes = ['feed_pet', 'heal_pet', 'buy_food', 'sleep', 'daily_checkup', 'play_pet', 'wash_pet', 'work'];
        const countingWorkspace = new Blockly.Workspace();

        for (const station of Object.keys(scheduledActions)) {
            const data = scheduledActions[station];
            if (data && data.xml && data.xml !== 'None') {
                try {
                    countingWorkspace.clear();
                    const dom = Blockly.utils.xml.textToDom(data.xml);
                    Blockly.Xml.domToWorkspace(dom, countingWorkspace);
                    const blocks = countingWorkspace.getAllBlocks(false);
                    actionBlockCount += blocks.filter(b => actionTypes.includes(b.type)).length;
                } catch (e) {
                    console.error(`Error counting blocks for ${station}:`, e);
                }
            }
        }
        countingWorkspace.dispose();

        if (actionBlockCount > 10) {
            alert("10 action blocks per day is a maximum. Logic and stat blocks don't count towards this limit!");
            return;
        }
        // ----------------------------------------------------

        console.log("Global Execution Started...");
        const btn = document.getElementById('execute-all-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Executing... ⚡';
        btn.disabled = true;


        const headlessWorkspace = new Blockly.Workspace();

        let fullCode = '';

        for (const station of Object.keys(scheduledActions)) {
            const data = scheduledActions[station];
            if (data && data.xml && data.xml !== 'None') {
                try {
                    headlessWorkspace.clear();
                    const dom = Blockly.utils.xml.textToDom(data.xml);
                    Blockly.Xml.domToWorkspace(dom, headlessWorkspace);
                    const code = Blockly.JavaScript.workspaceToCode(headlessWorkspace);
                    fullCode += `// ${station}\n${code}\n`;
                    console.log("User Level:" + window.gameStats.userLvl);
                } catch (e) {
                    console.error(`Error generating code for ${station}:`, e);
                }
            }
        }

        headlessWorkspace.dispose();

        if (fullCode.trim()) {
            try {

                eval(fullCode);

                // Increment level by exactly 1 after daily actions
                window.gameStats.userLvl = (window.gameStats.userLvl || 1) + 1;
                document.getElementById("levelHeader").textContent = `Level: ${window.gameStats.userLvl}`;

                // --- DAILY DECAY ---
                statsDecrement();
                // ------------------

                // --- RANDOM EVENTS (Every 2nd day) ---
                if (window.gameStats.userLvl % 2 === 0) {
                    triggerRandomEvent();
                }
                // -------------------------------------

                // --- FINAL LIVES LOGIC ---
                window.gameActions.checkLifeLoss();
                // -------------------

                syncUIWithVariables();
                saveGameState();

                btn.textContent = 'Success! ✨';
                btn.style.background = '#2ecc71';
            } catch (e) {
                console.error("Global execution error:", e);
                btn.textContent = 'Error ❌';
            }
        } else {
            btn.textContent = 'No actions 💤';
        }

        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.background = '';
        }, 2000);
    }

    // we added this so that you know when you lose
    function showGameOver() {
        const gameOverOverlay = document.getElementById('game-over-overlay');
        gameOverOverlay.style.display = 'flex';

        document.getElementById('restart-game-btn').onclick = () => {
            // Remove ONLY this player's specific data
            localStorage.removeItem(`user_variables_${currentUser}`);
            localStorage.removeItem(`user_scheduled_actions_${currentUser}`);
            localStorage.removeItem(`user_data_${currentUser}`);
            // Also unset the current session
            localStorage.removeItem('neo_user');

            // Reload to go back to login screen
            location.reload();
        };

        document.getElementById('view-summary-btn').onclick = () => {
            const summaryContent = document.getElementById('summary-content');
            const stats = window.gameStats;

            summaryContent.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <div><strong>Health:</strong> ${Math.max(0, stats.health)}</div>
                    <div><strong>Happiness:</strong> ${Math.max(0, stats.happiness)}</div>
                    <div><strong>Hunger:</strong> ${Math.max(0, stats.hunger)}</div>
                    <div><strong>Hygiene:</strong> ${Math.max(0, stats.hygiene)}</div>
                    <div><strong>Energy:</strong> ${Math.max(0, stats.energy)}</div>
                    <div><strong>Money:</strong> $${stats.money}</div>
                    <div><strong>Level:</strong> ${stats.userLvl}</div>
                </div>
            `;

            document.getElementById('summary-overlay').style.display = 'flex';
        };

        document.getElementById('close-summary').onclick = () => {
            document.getElementById('summary-overlay').style.display = 'none';
        };
    }

    const randomEventsList = [
        { title: "Sunny Day!", desc: "The weather is beautiful! Your pet had a blast running around in the garden.", stats: { happiness: 15, energy: 10 } },
        { title: "Unexpected Nap", desc: "Your pet found a cozy place to nap and slept all afternoon.", stats: { energy: 25, happiness: 5 } },
        { title: "Minor Cold", desc: "Oh no! Your pet caught a slight chill from an open window.", stats: { health: -10, happiness: -5 } },
        { title: "Tummy Ache", desc: "Your pet ate something they shouldn't have in the yard.", stats: { health: -15, hunger: -10 } },
        { title: "New Toy!", desc: "You found an old squeaky toy under the rug!", stats: { happiness: 20 } },
        { title: "Rainy Day Blues", desc: "It's been raining all day. Your pet is feeling a bit bored and sluggish.", stats: { happiness: -10, energy: -10 } },
        { title: "High Energy!", desc: "Your pet is feeling extra bouncy today!", stats: { energy: 20 } },
        { title: "Extra Hungry", desc: "For some reason, your pet is much hungrier than usual today.", stats: { hunger: -20 } }
    ];

    // we added this so that random things happen
    function triggerRandomEvent() {
        const event = randomEventsList[Math.floor(Math.random() * randomEventsList.length)];
        const overlay = document.getElementById('event-overlay');
        const titleEl = document.getElementById('event-title');
        const descEl = document.getElementById('event-description');
        const changesEl = document.getElementById('event-stat-changes');

        titleEl.textContent = event.title;
        descEl.textContent = event.desc;

        let changesHtml = '';
        for (const [stat, change] of Object.entries(event.stats)) {
            const isPos = change > 0;
            const sign = isPos ? '+' : '';
            const className = isPos ? 'stat-up' : 'stat-down';
            changesHtml += `<div class="${className}">${stat.toUpperCase()}: ${sign}${change}</div>`;

            // Apply the change
            window.gameStats[stat] = Math.min(100, Math.max(0, (window.gameStats[stat] || 0) + change));
        }
        changesEl.innerHTML = changesHtml;

        overlay.style.display = 'flex';
        syncUIWithVariables();
    }

    document.getElementById('close-event-btn').onclick = () => {
        document.getElementById('event-overlay').style.display = 'none';
    };


    // we added this so that you can read your plan
    function summarizeWorkspace(ws) {
        if (!ws) return 'None';
        const topBlocks = ws.getTopBlocks(false);
        if (topBlocks.length === 0) return 'None';

        const summaries = [];
        topBlocks.forEach(block => {
            summaries.push(getBlockSummary(block));
        });

        return summaries.join('<br>') || 'None';
    }

    // we added this so that each block has a name
    function getBlockSummary(block) {
        let text = '';
        const type = block.type;

        if (type === 'feed_pet') {
            const times = block.getFieldValue('times');
            text = `Feed ${times} times`;
        } else if (type === 'heal_pet') {
            text = 'Heal pet ($10)';
        } else if (type === 'daily_checkup') {
            const times = block.getFieldValue('TIMES');
            text = `Check-up ${times} times ($2 ea)`;
        } else if (type === 'play_pet') {
            text = 'Play with pet';
        } else if (type === 'wash_pet') {
            text = 'Wash pet';
        } else if (type === 'controls_if') {
            text = 'Conditional logic...';
        } else if (type === 'buy_food') {
            const times = block.getFieldValue('food');
            text = `Buy ${times} food`;
        } else if (type === 'sleep') {
            text = 'Sleep';
        } else if (type === 'work') {
            const hours = block.getFieldValue('hours');
            text = `Work ${hours} hours ($15/hr)`;
        } else {
            text = 'Custom action';
        }

        const nextBlock = block.getNextBlock();
        if (nextBlock) {
            text += ' → ' + getBlockSummary(nextBlock);
        }
        return text;


    }

    // we added this so that the buildings appear
    function generateStations() {
        stationsContainer.innerHTML = '';
        stations = stationData.map(s => {
            const div = document.createElement('div');
            div.className = `station ${s.name.toLowerCase().replace(/\s+/g, '-')}`;
            div.style.left = `${s.x}%`;
            div.style.top = `${s.y}%`;
            div.innerHTML = `<span class="station-label">${s.name}</span>`;
            stationsContainer.appendChild(div);
            return s;
        });
    }

    // ======
    // world generation + character positions
    // ======
    // we added this so that there are trees
    function generateTrees() {
        obstaclesContainer.innerHTML = '';
        trees = [];
        for (let i = 0; i < 15; i++) {
            let tx, ty;
            let isInvalid;
            do {
                tx = Math.floor(Math.random() * 90) + 5;
                ty = Math.floor(Math.random() * 80) + 10;
                const nearPlayer = Math.abs(tx - 50) < 10 && Math.abs(ty - 50) < 10;
                const nearStation = stations.some(s => Math.abs(tx - s.x) < 10 && Math.abs(ty - s.y) < 10);
                isInvalid = nearPlayer || nearStation;
            } while (isInvalid);

            const tree = document.createElement('div');
            tree.className = 'tree';
            tree.style.left = `${tx}%`;
            tree.style.top = `${ty}%`;
            obstaclesContainer.appendChild(tree);
            trees.push({ x: tx, y: ty });
        }
    }

    // we added this so that you see where you are
    function updateCharacterPosition() {
        character.style.left = `${characterPos.x}%`;
        character.style.top = `${characterPos.y}%`;
    }

    // we added this so that the pet follows you
    function updatePetPosition() {
        pet.style.left = `${petPos.x}%`;
        pet.style.top = `${petPos.y}%`;
    }


    // we added this so that you dont walk through things
    function isColliding(nx, ny) {
        const treeHit = trees.some(t => Math.abs(nx - t.x) < 3 && Math.abs(ny - t.y) < 3);
        return treeHit;
    }


    // we added this so that you can control the character
    function handleInput(e) {
        if (isModalOpen) return;

        const key = e.key.toLowerCase();

        if (key === ' ') {
            checkStationInteraction();
            return;
        }

        handleMovement(key);
    }

    // we added this so that you can enter buildings
    function checkStationInteraction() {
        stations.forEach(s => {
            const dist = Math.sqrt(Math.pow(characterPos.x - s.x, 2) + Math.pow(characterPos.y - s.y, 2));
            if (dist < 10) {
                openModal(s.name);
            }
        });
    }
    // =======
    // end of world generation + character input and positions
    // =======


    // =========
    // stations and blockly.js UI implementations
    // =========
    // we added this so that the popup opens
    function openModal(title) {
        modalTitle.textContent = title;
        const stationInterface = document.getElementById('station-interface');
        const aiInterface = document.getElementById('ai-interface');
        const genericContent = document.getElementById('generic-content');
        const modalPetSprite = document.getElementById('modal-pet-sprite');
        const stationSubtitle = document.getElementById('station-subtitle');

        const validStations = ['vet', 'grocery store', 'home', 'work'];
        const isKnownStation = validStations.includes(title.toLowerCase());

        const isAIStation = title.toLowerCase() === 'ai guide';

        if (isAIStation) {
            stationInterface.style.display = 'none';
            aiInterface.style.display = 'flex';
            genericContent.style.display = 'none';
        } else if (isKnownStation) {
            stationInterface.style.display = 'flex';
            aiInterface.style.display = 'none';
            genericContent.style.display = 'none';
            stationSubtitle.textContent = `${title} Logic Editor`;

            const userData = JSON.parse(localStorage.getItem(`user_data_${currentUser}`)) || {};
            const petType = userData?.q2 || 'cat';
            modalPetSprite.className = `pet ${petType}`;

            syncUIWithVariables();

            if (!workspace && typeof Blockly !== 'undefined') {
                defineCustomBlocks();
                workspace = Blockly.inject('blocklyDiv', {
                    toolbox: document.getElementById('toolbox'),
                    scrollbars: true,
                    trashcan: true,
                    theme: 'Dark'
                });

                workspace.addChangeListener((e) => {

                    if (e.type === Blockly.Events.BLOCK_MOVE || e.type === Blockly.Events.BLOCK_CHANGE || e.type === Blockly.Events.BLOCK_DELETE || e.type === Blockly.Events.BLOCK_CREATE) {
                        const stationName = modalTitle.textContent;
                        const summary = summarizeWorkspace(workspace);
                        const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));

                        const stationKey = Object.keys(scheduledActions).find(k => k.toLowerCase() === stationName.toLowerCase()) || stationName;

                        scheduledActions[stationKey] = { summary, xml };
                        localStorage.setItem(`user_scheduled_actions_${currentUser}`, JSON.stringify(scheduledActions));
                        updateSidebarUI();
                    }
                });
            }

            if (workspace) {
                updateToolboxForStation(title.toLowerCase());

                workspace.clear();


                const stationKey = Object.keys(scheduledActions).find(k => k.toLowerCase() === title.toLowerCase()) || title;
                const savedData = scheduledActions[stationKey];

                if (savedData && savedData.xml && savedData.xml !== 'None') {
                    try {
                        const dom = Blockly.utils.xml.textToDom(savedData.xml);
                        Blockly.Xml.domToWorkspace(dom, workspace);
                    } catch (e) {
                        console.error("Error loading workspace XML:", e);
                    }
                }
            }

            setTimeout(() => {
                if (workspace) Blockly.svgResize(workspace);
            }, 50);

        } else {
            stationInterface.style.display = 'none';
            genericContent.style.display = 'block';
        }

        modal.classList.add('active');
        isModalOpen = true;
    }

    // we added this so that each station has different blocks
    function updateToolboxForStation(station) {
        let toolboxXml = '';

        const logicCategory = `
            <category name="Logic" colour="210">
                <block type="controls_if"></block>
                <block type="logic_compare"></block>
                <block type="logic_operation"></block>
            </category>`;

        const variableCategory = `
            <category name="Stats" colour="260">
                <block type="get_pet_stat"></block>
                <block type="math_number"></block>
            </category>`;

        let actionBlocks = '';
        if (station === 'vet') {
            actionBlocks = `
                <block type="heal_pet"></block>
                <block type="daily_checkup"></block>`;
        } else if (station === 'grocery store') {
            actionBlocks = `<block type="feed_pet"></block><block type = "buy_food"></block>`;
        } else if (station === 'home') {
            actionBlocks = `
                <block type="play_pet"></block>
                <block type="wash_pet"></block>
                <block type = "sleep"></block>`;
        } else if (station === 'work') {
            actionBlocks = `<block type="work"></block>`;
        }

        toolboxXml = `<xml>
            <category name="Actions" colour="120">
                ${actionBlocks}
            </category>
            ${logicCategory}
            ${variableCategory}
        </xml>`;

        workspace.updateToolbox(toolboxXml);
    }

    // we added this so that the screen matches the numbers
    function syncUIWithVariables() {
        const stats = window.gameStats;
        console.log("Syncing UI with stats:", stats);

        const statsContainer = document.querySelector('.stats-container');
        if (statsContainer) {
            statsContainer.classList.remove('pulse');
            void statsContainer.offsetWidth;
            statsContainer.classList.add('pulse');
        }

        updateStat('happiness', stats.happiness || 0);
        updateStat('health', stats.health || 0);
        updateStat('hygiene', stats.hygiene || 0);
        updateStat('hunger', stats.hunger || 0);
        updateStat('energy', stats.energy || 0);

        const valMoney = document.getElementById('val-money');
        if (valMoney) {
            valMoney.textContent = `$${Math.trunc(stats.money || 0)}`;
        }

        updateMiniStatsUI();
        changeExpression();
    }

    // we added this so that the progress bars move
    function updateStat(id, val) {
        const truncatedVal = Math.trunc(val);
        document.getElementById(`bar-${id}`).style.width = `${truncatedVal}%`;
        document.getElementById(`val-${id}`).textContent = `${truncatedVal} / 100`;
    }

    // we added this so that you can close the popup
    function closeModal() {
        modal.classList.remove('active');
        isModalOpen = false;
    }


    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });





    function handleMovement(key) {
        let nx = characterPos.x;
        let ny = characterPos.y;

        if (key === 'a' || key === 'arrowleft') {
            nx = Math.max(0, nx - stepSize);
        } else if (key === 'd' || key === 'arrowright') {
            nx = Math.min(100, nx + stepSize);
        } else if (key === 'w' || key === 'arrowup') {
            ny = Math.max(0, ny - stepSize);
        } else if (key === 's' || key === 'arrowdown') {
            ny = Math.min(100, ny + stepSize);
        }

        if (!isColliding(nx, ny)) {

            petPos.x = nx - 4;
            petPos.y = ny + 4;
            updatePetPosition();

            characterPos.x = nx;
            characterPos.y = ny;
            updateCharacterPosition();
        }
    }
    // =========
    // end of stations and blockly.js UI implementations
    // =========


    loginBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('neo_user', username);
            login(username);
        } else {
            usernameInput.style.borderColor = '#ef4444';
            setTimeout(() => usernameInput.style.borderColor = '', 1000);
        }
    });


    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
    });


    nextStepBtn.addEventListener('click', () => {
        const currentStepEl = document.querySelector(`.step[data-step="${currentStep}"]`);
        const input = currentStepEl.querySelector('input');

        if (input && !input.value.trim()) {
            input.style.borderColor = '#ef4444';
            return;
        }

        currentStepEl.classList.remove('active');
        currentStep++;

        const nextStepEl = document.querySelector(`.step[data-step="${currentStep}"]`);
        nextStepEl.classList.add('active');

        if (currentStep === 3) {
            nextStepBtn.style.display = 'none';
        }
    });

    finishOnboardingBtn.addEventListener('click', () => {
        const responses = {
            q1: document.getElementById('q1').value,
            q2: document.querySelector('input[name="pet-choice"]:checked')?.value || 'cat',
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(`user_data_${currentUser}`, JSON.stringify(responses));
        startGame();
    });




    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('neo_user');
        window.removeEventListener('keydown', handleInput);
        currentUser = null;
        characterPos = { x: 50, y: 50 };
        showScreen('auth');
    });


    document.getElementById('execute-all-btn').addEventListener('click', executeAllActions);

    const aiChatInput = document.getElementById('ai-chat-input');
    const aiSendBtn = document.getElementById('ai-send-btn');
    const chatMessages = document.getElementById('chat-messages');

    const GROQ_API_KEY = "ENTER_GROQ_API_KEY";
    const SYSTEM_PROMPT = `You are the PetRPG Guide. You help users understand how to play the game.
Game Context included below:
- This is petRPG, a game for TJFBLA Intro to Programming 2026 where users move around a grid and enter stations to make scheduling commands to take care of the pet.
- Move with WASD or Arrow keys. Interact with stations using Space.
- Stations:
  - Home: this iss where you play with pet, Wash pet. Contains logic editor for automation.
  - Grocery Store: Buy food ($1/ea), Feed pet. Contains logic editor.
  - Vet: Heal pet ($10), Daily check-up ($2). Contains logic editor.
  - AI Guide: That's you!
- Features:
  - Sidebar: Shows "Scheduled Actions" summarize by Blockly logic.
  - Execute All Button (Blue): Runs all logic across all stations at once.
  - Stats: Health, Hunger, Happiness, Hygiene, Money, User Level.
  - Automation: Use the Blockly editor in each station to create "Schedules".
- Credits:
    Piskel art use for ALL pixel art
Goal: Be helpful, concise, and stay in character/priofessional!. Assistant name: RPG AI.

Extra info:

TJHSST FBLA 2026 Intro to Programming
petRPG
This is petRPG, a game for TJFBLA Intro to Programming 2026 where users move around a grid and enter stations to make scheduling commands to take care of the pet.
Controls
Move with WASD or Arrow keys.
Interact with stations using Space.
Overall Flow of petRPG and Brief Overview
The goal: Keep your pet healthy by planning a day using block code. The better your schedule, the longer you survive.

When you start the game, you start off at level 1 with $50.

Your pet has 5 variables:
health,
hygiene,
hunger,
energy,
and happiness.
Your character has 3 variables:

currentFood,
lives,
and level.
Gameplay is infinite. However, as you level up, the game gets harder, as incrementing variables costs more money and variables decrease faster. The game ends when you lose 2 "hearts."

You lose a heart when your cash or any pet care variable goes to 0 or below after executing your schedule/day. However, after you lose your first heart, you gain a "loan" of $50 to recover your care and character variables.

This game is all about logical planning and scheduling a day for the future. A running total of all your expenses is in the "status section".

To increase these variables, a user has to use block logic to plan their day, which teaches the user how to logically think along with planning for the future.

Each simulation (i.e. each time you click "Execute All") is one full level.

How do you schedule?
Walk to a station and press Space.
Use Blockly blocks to create actions (you are “programming” the day).
Your planned actions are saved and shown in the Scheduled Actions sidebar.
Press "Execute All" to simulate a day and run everything you scheduled across all stations.
You are limited to 10 code blocks per simulation.
Stations
Home: this is where you play with pet, Wash pet. Contains logic editor for automation (repeat blocks, if-statement blocks).
Grocery Store: Buy food ($1/ea), Feed pet. Contains logic editor.
Vet: Heal pet ($10), Daily check-up ($2). Contains logic editor.
Work: Work for a set amount of hours (0-24). Every hour you work, care variables decrease by a higher value. Contains logic editor.
Features
Sidebar: Shows "Scheduled Actions" summarized by Blockly logic.
Execute All Button (Blue): Runs all logic across all stations at once.
Stats: Health, Hunger, Happiness, Hygiene, Money, User Level, Current food, Lives.
Automation: Use the Blockly editor in each station to create "Schedules".
Analytical Report: After every day simulation, a report shows how all your global variables changed as consequences of your actions.
How to run the game:
The game is web-based. Open the project in Visual Studio Code. Use a local host or the Live Server VS Code extension, and create it for the HTML file.
From there, you will be prompted to make an account with a name, a pet name, and a certain pet (dog, cat, or rabbit).
After these steps, you are all set! Make sure you read the Q&A and use the AI chatbot using the Groq API if you have any extra questions on how to play.
Built with
HTML
CSS
JavaScript
Blockly.js
Groq API (for the AI interactive chatbot)
Credits
Piskel art used for ALL pixel art https://www.piskelapp.com/
Blockly.js library for the logic editor
Source code for all blocks created using Google Blockly Developer Tool
Groq API for AI Interactive Q&A feature
Visual Studio Code
Github (this app!)
HTML Template: https://gist.github.com/MrChuffmanSnippets/2043416

if you do not know the answer to a question, do not halucinate it. Instead, answer with "I can't help you with that. Do you need help with anything else?" If the question is out of scope of the project, also respond with the same prompt. For example, if a user asks you to answer a math question
or a biology related question. Make sure your answers are safe for work as well, do not speak foul language `;


    let chatHistory = [];

    // we added this so that you can talk to the ai
    async function sendToAI() {
        const userText = aiChatInput.value.trim();
        if (!userText) return;


        addMessage(userText, 'user');
        chatHistory.push({ role: "user", content: userText });
        aiChatInput.value = '';


        const loadingMsg = addMessage('', 'assistant');
        loadingMsg.classList.add('typing');

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        ...chatHistory
                    ],
                    model: "openai/gpt-oss-20b",
                    temperature: 0.7,
                    max_tokens: 1024,
                    stream: true
                })
            });

            if (!response.ok) throw new Error("API request failed");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let aiResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

                    const dataStr = trimmedLine.slice(6);
                    if (dataStr === "[DONE]") break;

                    try {
                        const data = JSON.parse(dataStr);
                        const content = data.choices[0]?.delta?.content || "";
                        aiResponse += content;

                        loadingMsg.innerHTML = typeof marked !== 'undefined' ? marked.parse(aiResponse) : aiResponse;
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    } catch (e) {
                        //we're gonna skip parsing errors for incomplete chunks    
                    }
                }
            }

            loadingMsg.classList.remove('typing');
            chatHistory.push({ role: "assistant", content: aiResponse });
        } catch (error) {
            console.error("AI Error:", error);
            loadingMsg.textContent = "Oops! Something went wrong.";
            loadingMsg.classList.remove('typing');
        }
    }

    // we added this so that the chat shows up
    function addMessage(text, role) { // allows user to input message into AI interface for the intelligent Q&A section
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        if (role === 'assistant' && typeof marked !== 'undefined' && text !== '...') {
            msgDiv.innerHTML = marked.parse(text);
        } else {
            msgDiv.textContent = text;
        }
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgDiv;
    }

    aiSendBtn.addEventListener('click', sendToAI);
    aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendToAI();
    });


    // these functions are used after executing all code blocks

    /* Sprite Priority Order
        1. Sick (based on health)
        2. Tired (based on energy)
        3. Sad (based on happiness)
        4. Normal (default if all global variables are above threshold)
    */
    // we added this so that the pet looks happy or sad
    function changeExpression() { //changes expression of pet based on pet variables (hygiene, health, hunger, etc.) after every execution
        const petType = pet.classList[1];
        const modalPet = document.getElementById("modal-pet-sprite");

        if (window.gameStats.health <= 30) {
            pet.style.backgroundImage = `url("pets/${petType}_sick.png")`;
            modalPet.style.backgroundImage = `url("pets/${petType}_sick.png")`;
        } else if (window.gameStats.energy <= 25) {
            pet.style.backgroundImage = `url("pets/${petType}_tired.png")`;
            modalPet.style.backgroundImage = `url("pets/${petType}_tired.png")`;
        } else if (window.gameStats.happiness <= 20) {
            pet.style.backgroundImage = `url("pets/${petType}_sad.png")`;
            modalPet.style.backgroundImage = `url("pets/${petType}_sad.png")`;
        } else {
            pet.style.backgroundImage = `url("pets/${petType}_normal.png")`;
            modalPet.style.backgroundImage = `url("pets/${petType}_normal.png")`;
        }
    }

    // This makes stats go down a bit every day
    // we added this so that the game gets harder
    function statsDecrement() { // decrements stats every execution so game can properly end
        const userLvl = window.gameStats.userLvl;
        const mod = PET_MODIFIERS[currentPetType] || {};

        window.gameStats.happiness = Math.max(0, window.gameStats.happiness - (10 - (0.25 * userLvl)) * (mod.happiness || 1));
        window.gameStats.energy = Math.max(0, window.gameStats.energy - (10 - (0.25 * userLvl)) * (mod.energy || 1));
        window.gameStats.hunger = Math.max(0, window.gameStats.hunger - (10 - (0.25 * userLvl)));
        // health decay is random to simulate random, unpredictable illness
        window.gameStats.health = Math.max(0, window.gameStats.health - Math.trunc((Math.random() * 15) + 10) * (mod.health || 1));
        window.gameStats.hygiene = Math.max(0, window.gameStats.hygiene - (10 - (0.25 * userLvl)));
    }

    // we added this so that you can move the menu
    function initSidebarDrag() {
        const sidebar = document.getElementById('status-sidebar');
        const handle = document.getElementById('sidebar-drag');
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            offset.x = e.clientX - sidebar.offsetLeft;
            offset.y = e.clientY - sidebar.offsetTop;
            sidebar.style.animation = 'none'; // Stop animation during drag
            sidebar.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            sidebar.style.left = (e.clientX - offset.x) + 'px';
            sidebar.style.top = (e.clientY - offset.y) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    initSidebarDrag();
});
