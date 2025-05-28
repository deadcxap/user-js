// ==UserScript==
// @name         Hide Premium Games (v0.4)
// @namespace    http://tampermonkey.net/
// @version      0.4
// @updateURL    https://raw.githubusercontent.com/deadcxap/user-js/refs/heads/main/BGA-hide-premium-games.js
// @downloadURL  https://raw.githubusercontent.com/deadcxap/user-js/refs/heads/main/BGA-hide-premium-games.js
// @description  Надёжно скрывает премиум-игры на BoardGameArena, даже при динамической подгрузке
// @author       deadcxap and chatgpt
// @match        https://boardgamearena.com/gamelist*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let hidden = false;
    const showText = 'скрыть премиум игры';
    const hideText = 'премиум игры скрыты';

    // кнопка
    const btn = document.createElement('button');
    btn.textContent = showText;
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: '10000',
        padding: '8px 12px',
        backgroundColor: '#fff',
        border: '1px solid #000',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    });
    btn.addEventListener('click', togglePremium);
    document.body.appendChild(btn);

    // прячет/показывает одну карточку
    function processCard(wrapper) {
        if (wrapper.querySelector('[style*="premium.svg"]')) {
            wrapper.style.display = hidden ? 'none' : '';
        }
    }

    // сканируем все карточки в гриде
    function processAllCards() {
        const grid = document.querySelector('.bga-game-grid.bga-game-grid--small');
        if (!grid) return;
        grid.querySelectorAll(':scope > div').forEach(processCard);
    }

    // переключаем режим и сразу перескрываем
    function togglePremium() {
        hidden = !hidden;
        btn.textContent = hidden ? hideText : showText;
        processAllCards();
    }

    // ловим любые добавления внутри грида и при hidden=true пересканируем
    const observer = new MutationObserver(muts => {
        if (!hidden) return;
        for (let m of muts) {
            if (m.type === 'childList' && m.addedNodes.length) {
                processAllCards();
                break;
            }
        }
    });

    // ждём появление грида и стартуем
    const readyCheck = setInterval(() => {
        const grid = document.querySelector('.bga-game-grid.bga-game-grid--small');
        if (grid) {
            observer.observe(grid, { childList: true, subtree: true });
            processAllCards();
            clearInterval(readyCheck);
        }
    }, 500);

})();
