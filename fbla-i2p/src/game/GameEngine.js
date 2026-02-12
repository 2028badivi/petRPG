import Phaser from 'phaser';
import { petState } from '../logic/PetState';
import { AssetLibrary } from './AssetLibrary';

/**
 * GameEngine.js - PURE_SOURCE EDITION
 * NO EXTERNAL FILES. Everything generated via AssetLibrary.js
 */

class WorldScene extends Phaser.Scene {
    constructor() { super('WorldScene'); }

    preload() {
        // Load Dynamic Patterns from AssetLibrary using the correct Phaser loader
        const types = ['dog', 'cat', 'robot'];
        types.forEach(t => {
            this.load.image(`${t}_IDLE`, AssetLibrary.getPetSVG(t, 'IDLE'));
            this.load.image(`${t}_FEED`, AssetLibrary.getPetSVG(t, 'FEED'));
            this.load.image(`${t}_PLAY`, AssetLibrary.getPetSVG(t, 'PLAY'));
            this.load.image(`${t}_WORK`, AssetLibrary.getPetSVG(t, 'WORK'));
        });

        this.load.image('env_tree', AssetLibrary.getWorldItemSVG('tree'));
        this.load.image('env_node', AssetLibrary.getWorldItemSVG('node'));
    }

    create() {
        this.worldWidth = 3000; this.worldHeight = 3000;
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // Background Grid
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x111111, 1);
        for (let i = 0; i < this.worldWidth; i += 150) {
            graphics.moveTo(i, 0); graphics.lineTo(i, this.worldHeight);
            graphics.moveTo(0, i); graphics.lineTo(this.worldWidth, i);
        }
        graphics.strokePath();

        // Environment Decor (Hand-Coded Trees/Nodes)
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(100, 2900);
            const y = Phaser.Math.Between(100, 2900);
            this.add.image(x, y, 'env_tree').setScale(1.5).setAlpha(0.6);
            if (i % 5 === 0) this.add.image(x + 50, y + 50, 'env_node').setScale(1.2);
        }

        // Player (Industrial Shape)
        this.player = this.add.container(800, 800);
        const core = this.add.rectangle(0, 0, 36, 50, 0x2d2d2d).setStrokeStyle(2, 0xffffff);
        const visor = this.add.rectangle(0, -10, 28, 6, 0xff9900);
        this.player.add([core, visor]);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Pet (SVG Dynamic)
        this.pet = this.add.sprite(750, 800, `${petState.type}_IDLE`).setScale(1.2);
        this.physics.add.existing(this.pet);
        this.petTrail = [];

        // Facilities
        this.facilities = this.physics.add.staticGroup();
        this.addFacility(1000, 1000, 'CORE_HUB', 0x252526);
        this.addFacility(2000, 1500, 'DIAG_STATION', 0x252526);
        this.addFacility(600, 2200, 'RESOURCE_NODE', 0x252526);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        window.addEventListener('pet-action', (e) => {
            const key = `${petState.type}_${e.detail.action.toUpperCase()}`;
            if (this.textures.exists(key)) this.pet.setTexture(key);
            setTimeout(() => this.pet.setTexture(`${petState.type}_IDLE`), 1000);
        });
    }

    addFacility(x, y, label, color) {
        const b = this.add.rectangle(x, y, 220, 220, color).setStrokeStyle(3, 0xffffff);
        this.add.text(x, y - 130, `// ${label}`, { fontFamily: 'Roboto Mono', fontSize: '18px', color: '#ff9900' }).setOrigin(0.5);
        this.facilities.add(b);
        b.stationName = label;
    }

    update() {
        if (petState.currentLocation !== 'WORLD') {
            this.player.body.setVelocity(0, 0);
            return;
        }

        const speed = 450;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.keys.A.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.keys.D.isDown) vx = 1;
        if (this.cursors.up.isDown || this.keys.W.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.keys.S.isDown) vy = 1;

        if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }
        this.player.body.setVelocity(vx * speed, vy * speed);

        this.petTrail.push({ x: this.player.x, y: this.player.y });
        if (this.petTrail.length > 15) {
            const p = this.petTrail.shift();
            this.pet.x = p.x; this.pet.y = p.y;
        }

        let near = null;
        this.facilities.children.iterate(f => {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, f.x, f.y) < 180) near = f;
        });

        if (near && Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            petState.currentLocation = 'BUILDING';
            petState.currentBuilding = near.stationName;
            window.dispatchEvent(new CustomEvent('enter-station', { detail: { name: near.stationName } }));
        }
    }
}

class InteriorScene extends Phaser.Scene {
    constructor() { super('InteriorScene'); }
    preload() {
        const types = ['dog', 'cat', 'robot'];
        types.forEach(t => {
            this.load.image(`${t}_IDLE`, AssetLibrary.getPetSVG(t, 'IDLE'));
            this.load.image(`${t}_FEED`, AssetLibrary.getPetSVG(t, 'FEED'));
            this.load.image(`${t}_PLAY`, AssetLibrary.getPetSVG(t, 'PLAY'));
            this.load.image(`${t}_WORK`, AssetLibrary.getPetSVG(t, 'WORK'));
        });
        this.load.image('floor_wood', AssetLibrary.getWorldItemSVG('floor_wood'));
        this.load.image('mat', AssetLibrary.getWorldItemSVG('mat'));
        this.load.image('statue', AssetLibrary.getWorldItemSVG('statue'));
    }
    create() {
        this.cameras.main.setBackgroundColor('#2d2d2d');

        // Create Room (Grid of floor tiles)
        for (let x = 0; x < 600; x += 64) {
            for (let y = 0; y < 700; y += 64) {
                this.add.image(x, y, 'floor_wood').setOrigin(0);
            }
        }

        // Wall
        this.add.rectangle(0, 0, 600, 100, 0x3E2723).setOrigin(0);
        this.add.rectangle(0, 95, 600, 5, 0x000000, 0.3).setOrigin(0); // Shadow


        // Interior Decor inspired by Champion Island
        this.add.image(250, 300, 'mat').setScale(4);
        this.add.image(100, 150, 'statue').setScale(1.5);
        this.add.image(400, 150, 'statue').setScale(1.5);

        // Player Avatar in Interior
        this.player = this.add.container(250, 450);
        const core = this.add.rectangle(0, 0, 36, 50, 0x2d2d2d).setStrokeStyle(2, 0xffffff);
        const visor = this.add.rectangle(0, -10, 28, 6, 0xff9900);
        this.player.add([core, visor]);
        this.physics.add.existing(this.player);

        // Pet Entity in Interior
        const petTex = `${petState.type}_IDLE`;
        this.pet = this.add.sprite(200, 450, petTex).setScale(1.5);
        this.physics.add.existing(this.pet);
        this.petTrail = [];

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W, A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S, D: Phaser.Input.Keyboard.KeyCodes.D
        });

        window.addEventListener('pet-action', (e) => {
            const action = e.detail.action.toUpperCase();
            const key = `${petState.type}_${action}`;
            if (this.textures.exists(key)) this.pet.setTexture(key);
            this.tweens.add({ targets: this.pet, y: '-=20', duration: 150, yoyo: true });
            setTimeout(() => this.pet.setTexture(`${petState.type}_IDLE`), 1000);
        });

        this.events.on('update-decor', () => {
            const name = this.data.get('name') || 'FACILITY';
            if (this.titleText) this.titleText.destroy();
            this.titleText = this.add.text(250, 50, `// ${name}`, {
                fontFamily: 'Roboto Mono', fontSize: '24px', color: '#ff9900'
            }).setOrigin(0.5);
        });
    }

    update() {

        const speed = 300;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.keys.A.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.keys.D.isDown) vx = 1;
        if (this.cursors.up.isDown || this.keys.W.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.keys.S.isDown) vy = 1;

        if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }
        this.player.body.setVelocity(vx * speed, vy * speed);

        // Pet Following Logic (Internal)
        this.petTrail.push({ x: this.player.x, y: this.player.y });
        if (this.petTrail.length > 15) {
            const p = this.petTrail.shift();
            this.pet.x = p.x; this.pet.y = p.y;
        }
    }
}


export const initGame = () => {
    const world = new Phaser.Game({
        type: Phaser.AUTO, parent: 'game-container', width: window.innerWidth, height: window.innerHeight,
        physics: { default: 'arcade' }, scene: WorldScene, pixelArt: true, transparent: true
    });

    let interior = null;
    window.addEventListener('enter-station', (e) => {

        if (!interior) {
            interior = new Phaser.Game({
                type: Phaser.AUTO, parent: 'pet-interaction-render', width: 500, height: 600,
                scene: InteriorScene, transparent: true, pixelArt: true
            });
            // Pass data to scene after start
            setTimeout(() => {
                interior.scene.getScene('InteriorScene').data.set('name', e.detail.name);
                interior.scene.getScene('InteriorScene').events.emit('update-decor');
            }, 100);
        } else {
            interior.scene.getScene('InteriorScene').data.set('name', e.detail.name);
            interior.scene.getScene('InteriorScene').events.emit('update-decor');
        }
    });

    window.addEventListener('resize', () => world.scale.resize(window.innerWidth, window.innerHeight));
    return world;
};

