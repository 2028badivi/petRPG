document.addEventListener('DOMContentLoaded', () => {

    let currentUser = null;
    let currentStep = 1;


    const screens = {
        auth: document.getElementById('auth-screen'),
        onboarding: document.getElementById('onboarding-screen'),
        game: document.getElementById('game-screen')
    };

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
        { name: 'Vet', x: 50, y: 80 }
    ];
    const stepSize = 4;
    let isModalOpen = false;
    let workspace = null;

    function defineCustomBlocks() {
        if (typeof Blockly === 'undefined') return;

        Blockly.Blocks['move_forward'] = {
            init: function () {
                this.appendDummyInput().appendField("move forward");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(210);
            }
        };
        Blockly.Blocks['turn_left'] = {
            init: function () {
                this.appendDummyInput().appendField("turn left");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(210);
            }
        };
        Blockly.Blocks['turn_right'] = {
            init: function () {
                this.appendDummyInput().appendField("turn right");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(210);
            }
        };
        Blockly.Blocks['feed_pet'] = {
            init: function () {
                this.appendDummyInput().appendField("feed pet");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(120);
            }
        };
        Blockly.Blocks['play_pet'] = {
            init: function () {
                this.appendDummyInput().appendField("play with pet");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(120);
            }
        };
        Blockly.Blocks['wash_pet'] = {
            init: function () {
                this.appendDummyInput().appendField("wash pet");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(120);
            }
        };
    }
    checkSession();

    function checkSession() {
        const storedUser = localStorage.getItem('neo_user');
        if (storedUser) {
            login(storedUser);
        } else {
            showScreen('auth');
        }
    }

    function showScreen(screenId) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenId].classList.add('active');
    }

    function login(username) {
        currentUser = username;
        const userData = JSON.parse(localStorage.getItem(`user_data_${username}`));

        if (!userData) {

            showScreen('onboarding');
        } else {

            startGame();
        }
    }

    function startGame() {
        displayName.textContent = currentUser;


        const userData = JSON.parse(localStorage.getItem(`user_data_${currentUser}`));
        const petType = userData?.q2 || 'cat';
        pet.className = `pet ${petType}`;

        generateTrees();
        generateStations();
        showScreen('game');
        updateCharacterPosition();
        updatePetPosition();
        window.addEventListener('keydown', handleInput);
    }

    function generateStations() {
        stationsContainer.innerHTML = '';
        stations = stationData.map(s => {
            const div = document.createElement('div');
            div.className = 'station';
            div.style.left = `${s.x}%`;
            div.style.top = `${s.y}%`;
            div.innerHTML = `<span class="station-label">${s.name}</span>`;
            stationsContainer.appendChild(div);
            return s;
        });
    }


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

    function updateCharacterPosition() {
        character.style.left = `${characterPos.x}%`;
        character.style.top = `${characterPos.y}%`;
    }

    function updatePetPosition() {
        pet.style.left = `${petPos.x}%`;
        pet.style.top = `${petPos.y}%`;
    }


    function isColliding(nx, ny) {
        const treeHit = trees.some(t => Math.abs(nx - t.x) < 3 && Math.abs(ny - t.y) < 3);
        return treeHit;
    }


    function handleInput(e) {
        if (isModalOpen) return;

        const key = e.key.toLowerCase();

        if (key === ' ') {
            checkStationInteraction();
            return;
        }

        handleMovement(key);
    }

    function checkStationInteraction() {
        stations.forEach(s => {
            const dist = Math.sqrt(Math.pow(characterPos.x - s.x, 2) + Math.pow(characterPos.y - s.y, 2));
            if (dist < 10) {
                openModal(s.name);
            }
        });
    }

    function openModal(title) {
        modalTitle.textContent = title;
        const vetContent = document.getElementById('vet-content');
        const genericContent = document.getElementById('generic-content');
        const modalPetSprite = document.getElementById('modal-pet-sprite');

        if (['vet', 'home', 'grocery store'].includes(title.toLowerCase())) {
            vetContent.style.display = 'flex';
            genericContent.style.display = 'none';


            const userData = JSON.parse(localStorage.getItem(`user_data_${currentUser}`)) || {};
            const petType = userData?.q2 || 'cat';
            modalPetSprite.className = `pet ${petType}`;


            const stats = {
                happiness: 75,
                hunger: 40,
                hygiene: 90,
                money: 150
            };

            updateStat('happiness', stats.happiness);
            updateStat('hunger', stats.hunger);
            updateStat('hygiene', stats.hygiene);
            document.getElementById('bar-money').style.width = '100%';
            document.getElementById('val-money').textContent = `$${stats.money}`;


            if (!workspace && typeof Blockly !== 'undefined') {
                defineCustomBlocks();
                workspace = Blockly.inject('blocklyDiv', {
                    toolbox: document.getElementById('toolbox'),
                    scrollbars: true,
                    trashcan: true
                });
            }


            setTimeout(() => {
                if (workspace) Blockly.svgResize(workspace);
            }, 50);

        } else {
            vetContent.style.display = 'none';
            genericContent.style.display = 'block';
        }

        modal.classList.add('active');
        isModalOpen = true;
    }

    function updateStat(id, val) {
        document.getElementById(`bar-${id}`).style.width = `${val}%`;
        document.getElementById(`val-${id}`).textContent = `${val} / 100`;
    }

    function closeModal() {
        modal.classList.remove('active');
        isModalOpen = false;
    }


    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });


    document.getElementById('execute-btn').addEventListener('click', () => {
        if (workspace && typeof Blockly !== 'undefined') {
            const code = Blockly.JavaScript.workspaceToCode(workspace);
            alert('Generated Code:\n' + (code || '// No blocks yet!'));
        } else {
            alert('we gotta update the code execution stuffs');
        }
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
            q2: document.getElementById('q2').value,
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

});
