import './style.css';
import { initGame } from './game/GameEngine';
import { petState } from './logic/PetState';
import { initBlockly, runSimulation } from './logic/BlocklyManager';

document.addEventListener('DOMContentLoaded', () => {
  // 1. System Init (Workspace and Flag)
  const workspace = initBlockly('blockly-div');
  let gameStarted = false;

  // 2. Cinematic Boot Sequence
  const splash = document.getElementById('splash-screen');

  setTimeout(() => {
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
      checkInitialState();
    }, 1000);
  }, 2500);

  function checkInitialState() {
    petState.load();
    if (!petState.onboarded) {
      document.getElementById('onboarding-overlay').style.display = 'flex';
    } else {
      document.getElementById('onboarding-overlay').style.display = 'none';
      petState.updateUI();
      syncPetName();
      startGame();
    }
  }

  function startGame() {
    if (gameStarted) return;
    initGame();
    gameStarted = true;
  }


  // 3. UI Event Bindings

  document.getElementById('gear-btn')?.addEventListener('click', toggleSettings);
  document.getElementById('close-settings')?.addEventListener('click', toggleSettings);
  document.getElementById('reset-data-btn')?.addEventListener('click', () => {
    localStorage.removeItem('petRPG_pro_state');
    window.location.reload();
  });

  // 4. Onboarding Interactions
  let selectedType = 'dog';

  document.querySelectorAll('.preview-item').forEach(item => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.preview-item').forEach(i => i.classList.remove('selected'));
      const target = e.currentTarget;
      target.classList.add('selected');
      selectedType = target.dataset.type;
    });
  });

  document.getElementById('next-step-1')?.addEventListener('click', () => {
    const name = document.getElementById('setup-pet-name').value;
    if (!name) {
      alert("PET_ID REQUIRED");
      return;
    }
    document.getElementById('intro-step-1').classList.remove('active');
    document.getElementById('intro-step-2').classList.add('active');
  });

  document.getElementById('next-step-2')?.addEventListener('click', () => {
    finishOnboarding();
  });

  function finishOnboarding() {
    petState.onboarded = true;
    petState.name = document.getElementById('setup-pet-name').value;
    petState.type = selectedType;

    // Finalize state
    petState.save();
    petState.updateUI();
    syncPetName();
    startGame();

    // Transition Sequence
    const overlay = document.getElementById('onboarding-overlay');
    overlay.style.opacity = '0';

    // Zoom Cinematic
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.transition = 'transform 1.2s ease-out';
    gameContainer.style.transform = 'scale(1.3)';

    setTimeout(() => {
      overlay.style.display = 'none';
      gameContainer.style.transform = 'scale(1)';
    }, 800);
  }

  function syncPetName() {
    const nameDisplay = document.getElementById('pet-name-display');
    if (nameDisplay) nameDisplay.innerText = petState.name;
  }

  // 5. World Interactivity
  const exitBtn = document.getElementById('exit-station-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', exitStation);
  }

  window.addEventListener('enter-station', (e) => {
    const stationOverlay = document.getElementById('station-overlay');
    stationOverlay.classList.add('active');
    document.getElementById('location-tag').innerText = `STATION_${e.detail.name}`;

    // Signal Phaser to show interior
    window.dispatchEvent(new CustomEvent('show-interior', { detail: { name: e.detail.name } }));

    // Exit Handler (Space)
    const exitHandler = (ev) => {
      if (ev.code === 'Space' && petState.currentLocation === 'BUILDING') {
        exitStation();
        window.removeEventListener('keydown', exitHandler);
      }
    };
    setTimeout(() => window.addEventListener('keydown', exitHandler), 100);
  });

  function exitStation() {
    document.getElementById('station-overlay').classList.remove('active');
    document.getElementById('location-tag').innerText = "WORLD_MAP";
    petState.currentLocation = 'WORLD';
    petState.currentBuilding = null;

    // Signal Phaser to hide interior
    window.dispatchEvent(new CustomEvent('hide-interior'));
  }


  document.getElementById('run-btn')?.addEventListener('click', () => {
    runSimulation(workspace);
    petState.save();
  });

  function toggleSettings() {
    const settings = document.getElementById('settings-overlay');
    if (settings.style.display === 'none' || !settings.style.display) {
      settings.style.display = 'flex';
      setTimeout(() => settings.style.opacity = '1', 10);
    } else {
      settings.style.opacity = '0';
      setTimeout(() => settings.style.display = 'none', 500);
    }
  }
});
