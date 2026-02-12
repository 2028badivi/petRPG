/**
 * AssetLibrary.js
 * 100% Hand-Coded Visual Primitives.
 * Generates dynamic SVG Data URIs for world assets and pet expressions.
 */

const COLORS = {
    ORANGE: '#ff9900',
    BG: '#1e1e1e',
    DARK: '#111111',
    CAT_PRIMARY: '#616161',
    DOG_PRIMARY: '#8B4513',
    BOT_PRIMARY: '#444444',
    SUCCESS: '#89ca78',
};

export const AssetLibrary = {
    /**
     * Generates a Data URI for a pet sprite based on type and current expression.
     */
    getPetSVG: (type, expression = 'IDLE') => {
        let content = '';
        if (type === 'dog') content = AssetLibrary.drawDog(expression);
        else if (type === 'cat') content = AssetLibrary.drawCat(expression);
        else content = AssetLibrary.drawBot(expression);

        const svg = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            ${content}
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    },

    drawDog: (exp) => `
        <rect x="16" y="28" width="32" height="24" fill="${COLORS.DOG_PRIMARY}"/>
        <rect x="36" y="20" width="20" height="20" fill="#A0522D"/>
        <!-- Ears -->
        <rect x="36" y="16" width="8" height="8" fill="#5D2E0A"/>
        <rect x="48" y="16" width="8" height="8" fill="#5D2E0A"/>
        <!-- Eyes -->
        <rect x="40" y="24" width="4" height="4" fill="white"/>
        <rect x="48" y="24" width="4" height="4" fill="white"/>
        <rect x="${exp === 'FEED' ? 40 : 41}" y="24" width="2" height="2" fill="black"/>
        <rect x="${exp === 'FEED' ? 48 : 49}" y="24" width="2" height="2" fill="black"/>
        <!-- Action: Feeding -->
        ${exp === 'FEED' ? '<rect x="44" y="32" width="8" height="4" fill="#600"/>' : '<rect x="44" y="34" width="8" height="2" fill="black"/>'}
        <!-- Tail -->
        <rect x="12" y="28" width="8" height="8" fill="${COLORS.DOG_PRIMARY}"/>
    `,

    drawCat: (exp) => `
        <rect x="16" y="28" width="32" height="20" fill="${COLORS.CAT_PRIMARY}"/>
        <rect x="36" y="16" width="20" height="20" fill="#757575"/>
        <!-- Ears (Triangular Sharp) -->
        <path d="M38 16 L44 8 L44 16 Z" fill="#212121"/>
        <path d="M50 16 L56 8 L56 16 Z" fill="#212121"/>
        <!-- Eyes -->
        <rect x="40" y="22" width="4" height="4" fill="${exp === 'PLAY' ? '#ff9900' : '#89ca78'}"/>
        <rect x="50" y="22" width="4" height="4" fill="${exp === 'PLAY' ? '#ff9900' : '#89ca78'}"/>
        <rect x="41" y="23" width="2" height="2" fill="black"/>
        <rect x="51" y="23" width="2" height="2" fill="black"/>
        <!-- Action: Expression -->
        ${exp === 'PLAY' ? '<path d="M44 30 L48 26 L52 30" fill="none" stroke="black" stroke-width="2"/>' : '<rect x="44" y="30" width="8" height="1" fill="black"/>'}
    `,

    drawBot: (exp) => `
        <rect x="16" y="20" width="32" height="32" fill="#2d2d2d" stroke="${COLORS.ORANGE}" stroke-width="2"/>
        <rect x="20" y="24" width="24" height="20" fill="#000"/>
        <!-- Matrix Eyes -->
        <rect x="24" y="30" width="4" height="4" fill="${exp === 'WORK' ? COLORS.ORANGE : '#00ffff'}">
            ${exp === 'WORK' ? '<animate attributeName="opacity" values="1;0;1" dur="0.2s" repeatCount="indefinite"/>' : ''}
        </rect>
        <rect x="36" y="30" width="4" height="4" fill="${exp === 'WORK' ? COLORS.ORANGE : '#00ffff'}">
            ${exp === 'WORK' ? '<animate attributeName="opacity" values="1;0;1" dur="0.2s" repeatCount="indefinite"/>' : ''}
        </rect>
        <!-- Antenna -->
        <rect x="30" y="10" width="4" height="10" fill="#666"/>
        <rect x="30" y="8" width="4" height="4" fill="${exp === 'WORK' ? '#f00' : COLORS.ORANGE}"/>
    `,

    getWorldItemSVG: (name) => {
        let content = '';
        if (name === 'tree') content = `
            <rect x="24" y="40" width="16" height="20" fill="#3E2723"/>
            <rect x="12" y="12" width="40" height="36" fill="#1B5E20"/>
            <rect x="16" y="16" width="4" height="4" fill="#ff9900" opacity="0.3"/>
        `;
        else if (name === 'node') content = `
            <rect x="24" y="24" width="16" height="16" fill="none" stroke="#ff9900" stroke-width="1"/>
            <rect x="28" y="28" width="8" height="8" fill="#ff9900">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite"/>
            </rect>
        `;
        else if (name === 'floor_wood') content = `
            <rect x="0" y="0" width="64" height="64" fill="#5D4037" />
            <rect x="0" y="30" width="64" height="2" fill="#3E2723" opacity="0.5"/>
            <rect x="30" y="0" width="2" height="64" fill="#3E2723" opacity="0.5"/>
        `;
        else if (name === 'mat') content = `
            <rect x="4" y="4" width="56" height="56" fill="#D7CCC8" stroke="#A1887F" stroke-width="2"/>
            <rect x="10" y="10" width="44" height="44" fill="none" stroke="#A1887F" stroke-dasharray="2,2"/>
        `;
        else if (name === 'statue') content = `
            <rect x="20" y="40" width="24" height="8" fill="#333"/>
            <rect x="24" y="10" width="16" height="30" fill="#BDBDBD" stroke="#757575" stroke-width="2"/>
            <rect x="28" y="15" width="8" height="2" fill="#ff9900"/>
        `;

        const svg = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            ${content}
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
};

