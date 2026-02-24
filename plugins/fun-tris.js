let games = {}; 

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    // FUNZIONE PER OTTENERE IL NUMERO DI TELEFONO
    const getPhoneNumber = (jid) => {
        if (!jid) return '';
        // Prende tutto prima di @ e poi solo numeri
        const user = jid.split('@')[0];
        return user.replace(/\D/g, '');
    };

    // ===== START (.tris) =====
    if (command === 'tris') {
        let mention = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);

        if (!mention) 
            return conn.sendMessage(chatId, { text: `⚠️ Devi menzionare qualcuno o rispondere a un suo messaggio!\nEsempio: ${usedPrefix}tris @utente` }, { quoted: m });

        const myNumber = getPhoneNumber(m.sender);
        const theirNumber = getPhoneNumber(mention);

        if (myNumber === theirNumber)
            return conn.sendMessage(chatId, { text: '❌ Non puoi giocare contro te stesso!' }, { quoted: m });

        if (games[chatId])
            return conn.sendMessage(chatId, { text: '❌ C\'è già una partita in corso in questa chat!' }, { quoted: m });

        // Memorizza i numeri e gli JID completi
        games[chatId] = {
            board: [['A1','A2','A3'],['B1','B2','B3'],['C1','C2','C3']],
            players: [myNumber, theirNumber], // Numeri di telefono
            jids: [m.sender, mention], // JID completi per le menzioni
            turn: 0,
            timer: null,
            symbols: ['❌', '⭕']
        };

        await sendBoard(chatId, conn, games[chatId], 
            `🎮 *TRIS - PARTITA INIZIATA!*\n\n` +
            `❌ Giocatore 1: @${games[chatId].jids[0].split('@')[0]}\n` +
            `⭕ Giocatore 2: @${games[chatId].jids[1].split('@')[0]}\n\n` +
            `▶️ Tocca a: @${games[chatId].jids[0].split('@')[0]}\n` +
            `📝 Scrivi: \`${usedPrefix}putris A1\` (o B2, C3, ecc.)`
        );
        startTurnTimer(chatId, conn);
    }

    // ===== MOVE (.putris) =====
    else if (command === 'putris') {
        const game = games[chatId];
        if (!game) return conn.sendMessage(chatId, { text: '❌ Nessuna partita attiva. Iniziane una con .tris' }, { quoted: m });

        const myNumber = getPhoneNumber(m.sender);
        const currentNumber = game.players[game.turn];

        // DEBUG: Stampa informazioni
        console.log('=== DEBUG TRIS ===');
        console.log('Mio numero:', myNumber);
        console.log('Numero turno:', currentNumber);
        console.log('Turno attuale:', game.turn);
        console.log('Sono uguali?', myNumber === currentNumber);
        console.log('=================');

        // Confronta SOLO i numeri di telefono
        if (myNumber !== currentNumber) {
            const currentPlayerJid = game.jids[game.turn];
            return conn.sendMessage(chatId, { 
                text: `❌ *NON È IL TUO TURNO!*\n\nDeve muovere: @${currentPlayerJid.split('@')[0]}\nSimbolo: ${game.symbols[game.turn]}`,
                mentions: [currentPlayerJid]
            }, { quoted: m });
        }

        const move = text.trim().toUpperCase();
        const map = { A: 0, B: 1, C: 2 };
        const row = map[move[0]];
        const col = parseInt(move[1]) - 1;

        if (row === undefined || isNaN(col) || col < 0 || col > 2)
            return conn.sendMessage(chatId, { 
                text: `⚠️ *MOSSA NON VALIDA!*\n\nUsa una mossa come:\n\`${usedPrefix}putris A1\`\n\`${usedPrefix}putris B2\`\n\`${usedPrefix}putris C3\`\n\n📋 Celle disponibili: A1, A2, A3, B1, B2, B3, C1, C2, C3` 
            }, { quoted: m });

        if (['❌','⭕'].includes(game.board[row][col]))
            return conn.sendMessage(chatId, { text: '❌ Casella già occupata! Scegline un\'altra.' }, { quoted: m });

        // Fai la mossa
        game.board[row][col] = game.symbols[game.turn];

        // Controlla vittoria
        if (checkWinner(game.board)) {
            clearTimeout(game.timer);
            await sendBoard(chatId, conn, game, 
                `🎉 *VITTORIA!*\n\n@${m.sender.split('@')[0]} ha vinto la partita!\nSimbolo: ${game.symbols[game.turn]}`
            );
            delete games[chatId];
        } 
        // Controlla pareggio
        else if (game.board.flat().every(cell => ['❌','⭕'].includes(cell))) {
            clearTimeout(game.timer);
            await sendBoard(chatId, conn, game, 
                `🤝 *PAREGGIO!*\n\nLa griglia è piena, nessun vincitore.`
            );
            delete games[chatId];
        } 
        // Cambia turno
        else {
            game.turn = 1 - game.turn; // Alterna tra 0 e 1
            const nextPlayerJid = game.jids[game.turn];
            const nextSymbol = game.symbols[game.turn];

            await sendBoard(chatId, conn, game, 
                `✅ *MOSSA EFFETTUATA!*\n\n` +
                `▶️ Prossimo turno: @${nextPlayerJid.split('@')[0]}\n` +
                `🎯 Simbolo: ${nextSymbol}\n` +
                `📝 Scrivi: \`${usedPrefix}putris [casella]\``
            );
            startTurnTimer(chatId, conn);
        }
    }

    // ===== END (.endtris) =====
    else if (command === 'endtris') {
        if (games[chatId]) {
            clearTimeout(games[chatId].timer);
            const players = games[chatId].jids;
            delete games[chatId];
            await conn.sendMessage(chatId, { 
                text: '🛑 La partita è stata annullata.',
                mentions: players
            });
        } else {
            await conn.sendMessage(chatId, { text: '❌ Non c\'è nessuna partita attiva in questa chat.' });
        }
    }

    // ===== HELP (.trishelp) =====
    else if (command === 'trishelp' || command === 'trishelp') {
        await conn.sendMessage(chatId, {
            text: `🎮 *GUIDA AL GIOCO DEL TRIS*\n\n` +
                  `*Comandi:*\n` +
                  `\`${usedPrefix}tris @utente\` - Inizia una partita\n` +
                  `\`${usedPrefix}putris A1\` - Metti il tuo simbolo (A1, B2, C3, ecc.)\n` +
                  `\`${usedPrefix}endtris\` - Termina la partita corrente\n\n` +
                  `*Come giocare:*\n` +
                  `1. Inizia una partita menzionando un amico\n` +
                  `2. A turno, usate \`${usedPrefix}putris\` seguito da una cella\n` +
                  `3. Vince chi fa 3 simboli in linea\n\n` +
                  `📋 *Griglia:*\n` +
                  `\`\`\`\n` +
                  `    A1 │ A2 │ A3\n` +
                  `   ───┼────┼───\n` +
                  `    B1 │ B2 │ B3\n` +
                  `   ───┼────┼───\n` +
                  `    C1 │ C2 │ C3\n` +
                  `\`\`\`\n\n` +
                  `⏱️ Ogni turno ha 2 minuti di tempo!`
        }, { quoted: m });
    }
};

// --- FUNZIONI UTILITY ---

async function sendBoard(chatId, conn, game, msg = '') {
    const s = (cell) => {
        if (cell === '❌' || cell === '⭕') return cell;
        return '⬜';
    };

    const boardStr = 
        `      1️⃣   2️⃣   3️⃣\n` +
        `   ┌────┬────┬────┐\n` +
        `A  │ ${s(game.board[0][0])} │ ${s(game.board[0][1])} │ ${s(game.board[0][2])} │\n` +
        `   ├────┼────┼────┤\n` +
        `B  │ ${s(game.board[1][0])} │ ${s(game.board[1][1])} │ ${s(game.board[1][2])} │\n` +
        `   ├────┼────┼────┤\n` +
        `C  │ ${s(game.board[2][0])} │ ${s(game.board[2][1])} │ ${s(game.board[2][2])} │\n` +
        `   └────┴────┴────┘`;

    await conn.sendMessage(chatId, { 
        text: `${boardStr}\n\n${msg}`,
        mentions: game.jids
    });
}

function startTurnTimer(chatId, conn) {
    const game = games[chatId];
    if (!game) return;

    if (game.timer) clearTimeout(game.timer);

    game.timer = setTimeout(async () => {
        if (games[chatId]) {
            await conn.sendMessage(chatId, { 
                text: `⏱️ *TEMPO SCADUTO!*\n\nLa partita è stata chiusa per inattività.`,
                mentions: game.jids
            });
            delete games[chatId];
        }
    }, 120000); // 2 minuti
}

function checkWinner(board) {
    // Controlla righe
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === board[i][1] && 
            board[i][1] === board[i][2] && 
            ['❌','⭕'].includes(board[i][0])) {
            return true;
        }
    }

    // Controlla colonne
    for (let i = 0; i < 3; i++) {
        if (board[0][i] === board[1][i] && 
            board[1][i] === board[2][i] && 
            ['❌','⭕'].includes(board[0][i])) {
            return true;
        }
    }

    // Controlla diagonale \
    if (board[0][0] === board[1][1] && 
        board[1][1] === board[2][2] && 
        ['❌','⭕'].includes(board[0][0])) {
        return true;
    }

    // Controlla diagonale /
    if (board[0][2] === board[1][1] && 
        board[1][1] === board[2][0] && 
        ['❌','⭕'].includes(board[0][2])) {
        return true;
    }

    return false;
}

// Registra i comandi
handler.command = /^(tris|putris|endtris|trishelp)$/i;

// Info per la help command globale
handler.help = ['tris', 'putris', 'endtris'];
handler.tags = ['game'];
handler.description = 'Gioco del Tris multiplayer';

export default handler;
