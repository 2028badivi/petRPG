import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { petState } from './PetState';

/**
 * BlocklyManager.js - INDUSTRIAL EDITION
 * Hardened logic planner with refined action dispatching.
 */

export const registerBlocks = () => {
    // FORMAL_COMMANDS
    const defineBlock = (id, label, color, cost, stat, gain) => {
        Blockly.Blocks[id] = {
            init: function () {
                this.appendDummyInput().appendField(label);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(color);
            }
        };
        javascriptGenerator.forBlock[id] = () => `petState.execute("${id}", ${cost}, "${stat}", ${gain});\n`;
    };

    defineBlock('inject_fuel', 'CMD: INJECT_FUEL', 30, 5.00, 'hunger', 25);
    defineBlock('recreation_yield', 'CMD: RECREATION_GEN', 180, 0, 'happiness', 15);
    defineBlock('diag_checkup', 'CMD: RUN_DIAGNOSTIC', 0, 45.00, 'health', 50);
    defineBlock('sanitize_node', 'CMD: SANITIZE_NODE', 200, 2.50, 'hygiene', 30);
    defineBlock('yield_gen', 'CMD: YIELD_GEN_CAP', 120, -100.00, 'energy', -20);
};

export const initBlockly = (containerId) => {
    registerBlocks();
    const toolbox = {
        kind: 'categoryToolbox',
        contents: [
            {
                kind: 'category', name: 'CORE_CMDS', colour: '30', contents: [
                    { kind: 'block', type: 'inject_fuel' }, { kind: 'block', type: 'recreation_yield' }
                ]
            },
            {
                kind: 'category', name: 'SYS_MAINT', colour: '200', contents: [
                    { kind: 'block', type: 'diag_checkup' }, { kind: 'block', type: 'sanitize_node' }
                ]
            },
            {
                kind: 'category', name: 'ECO_OPS', colour: '120', contents: [
                    { kind: 'block', type: 'yield_gen' }
                ]
            },
            {
                kind: 'category', name: 'CONTROL', colour: '210', contents: [
                    { kind: 'block', type: 'controls_repeat_ext' }
                ]
            }
        ]
    };

    const workspace = Blockly.inject(containerId, {
        toolbox,
        theme: Blockly.Themes.Dark,
        trashcan: true,
        grid: { spacing: 20, length: 3, colour: '#333', snap: true }
    });

    workspace.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(workspace);
        let cost = 0;
        const matches = code.matchAll(/execute\(.*?, ([\d.-]+)/g);
        for (const m of matches) cost += parseFloat(m[1]);
        document.getElementById('projected-cost').innerText = `$${Math.max(0, cost).toFixed(2)}`;
    });

    return workspace;
};

export const runSimulation = (workspace) => {
    const code = javascriptGenerator.workspaceToCode(workspace);
    const commands = code.split(';').map(c => c.trim()).filter(c => c !== '');
    const runBtn = document.getElementById('run-btn');
    const status = document.getElementById('animation-status');

    runBtn.disabled = true;
    let i = 0;

    const step = () => {
        if (i >= commands.length) {
            runBtn.disabled = false;
            status.innerText = "STATUS: IDLE";
            return;
        }

        try {
            status.innerText = `STATUS: EXECUTING_${i + 1}`;
            // Safer execution via sandbox-like mapping
            const func = new Function('petState', commands[i] + ';');
            func(petState);

            // Dispatch animation based on command
            const actionMatch = commands[i].match(/execute\("(.*?)"/);
            if (actionMatch) {
                window.dispatchEvent(new CustomEvent('pet-action', { detail: { action: actionMatch[1] } }));
            }

            i++;
            setTimeout(step, 800);
        } catch (e) {
            console.error("Simulation Command Error:", e);
            runBtn.disabled = false;
        }
    };

    step();
};
