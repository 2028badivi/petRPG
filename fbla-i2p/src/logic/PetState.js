/**
 * PetState.js - INDUSTRIAL EDITION
 * Hardened state management with unified action execution.
 */

export class PetState {
    constructor() {
        this.reset();
    }

    reset() {
        this.onboarded = false;
        this.name = "ID_01";
        this.type = "dog";
        this.color = "#ff9900";
        this.level = 1;
        this.currency = 250.00;
        this.stats = { hunger: 100, happiness: 100, health: 100, hygiene: 100, energy: 100 };
        this.expenses = [];
        this.currentLocation = 'WORLD';
        this.currentBuilding = null;
    }

    // UNIFIED_COMMAND_EXECUTION
    execute(id, cost, stat, gain) {
        if (cost > 0 && this.currency < cost) {
            this.addLog(`ERR: INSUFFICIENT_FUNDS [${id}]`, 0, 'expense');
            return false;
        }

        if (cost > 0) {
            this.currency -= cost;
            this.addLog(`EXE: ${id.toUpperCase()}`, cost, 'expense');
        } else if (cost < 0) {
            const yieldVal = Math.abs(cost);
            this.currency += yieldVal;
            this.addLog(`YLD: ${id.toUpperCase()}`, yieldVal, 'earning');
        }

        if (stat && gain) {
            this.stats[stat] = Math.max(0, Math.min(100, this.stats[stat] + gain));
        }

        this.updateUI();
        return true;
    }

    addLog(desc, val, type) {
        this.expenses.push({ description: desc, cost: val, type, timestamp: Date.now() });
        if (this.expenses.length > 5) this.expenses.shift();
    }

    updateUI() {
        Object.keys(this.stats).forEach(s => {
            const bar = document.getElementById(`${s}-bar`);
            const pct = document.getElementById(`${s}-pct`);
            if (bar) bar.style.width = `${this.stats[s]}%`;
            if (pct) pct.innerText = `${Math.round(this.stats[s])}%`;
        });

        const cur = document.getElementById('currency-display');
        if (cur) cur.innerText = `$${this.currency.toFixed(2)}`;

        const badge = document.getElementById('level-badge');
        if (badge) badge.innerText = `Lv. ${this.level}`;

        const list = document.getElementById('expense-list');
        if (list) {
            list.innerHTML = this.expenses.map(e => `
                <div class="expense-row ${e.type}">
                    <span>${e.description}</span>
                    <span class="val">${e.type === 'earning' ? '+' : '-'}${e.cost.toFixed(2)}</span>
                </div>
            `).reverse().join('');
        }
    }

    save() {
        localStorage.setItem('petRPG_pro_state_industrial', JSON.stringify(this));
    }

    load() {
        const saved = localStorage.getItem('petRPG_pro_state_industrial');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(this, data);
            this.updateUI();
            return true;
        }
        return false;
    }
}

export const petState = new PetState();
