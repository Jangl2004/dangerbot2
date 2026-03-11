import { createCanvas } from 'canvas'

// Usiamo una variabile globale sicura per evitare che si resettino le sessioni
global.trisGames = global.trisGames || {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    // Comando di emergenza per sbloccare il bot
    if (command === 'resettris') {
        global.trisGames[chatId] = null;
        delete global.trisGames[chatId];
        return m.reply('✅ Memoria tris pulita. Ora puoi iniziare una nuova partita con .tris');
    }

    // ===== START (.tris) =====
    if (command === 'tris') {
        let mention = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
        if (!mention) return m.reply(`⚠️ Devi menzionare qualcuno! Esempio: ${usedPrefix}tris @utente`);

        if (global.trisGames[chatId]) return m.reply('❌ C\'è già una partita attiva! Usa .resettris se è bloccata.');

        global.trisGames[chatId] = {
            board: [['','',''],['','',''],['','','']],
            players: [m.sender, mention], // Salviamo i JID completi
            turn: 0,
            symbols: ['X', 'O']
        };

        await sendCanvasBoard(chatId, conn, global.trisGames[chatId], `🎮 *TRIS HD Iniziato!*`);
    }

    // ===== MOVE (.putris) =====
    else if (command === 'putris') {
        const game = global.trisGames[chatId];
        if (!game) return m.reply('❌ Nessuna partita attiva. Usa .tris per iniziare.');
        if (m.sender !== game.players[game.turn]) return m.reply('❌ Non è il tuo turno!');

        const move = text.trim().toUpperCase();
        const map = { A: 0, B: 1, C: 2 };
        const row = map[move[0]];
        const col = parseInt(move[1]) - 1;

        if (row === undefined || isNaN(col) || game.board[row][col] !== '') return m.reply('⚠️ Mossa non valida o casella occupata.');

        game.board[row][col] = game.symbols[game.turn];

        if (checkWinner(game.board)) {
            await sendCanvasBoard(chatId, conn, game, `🎉 *VITTORIA!* Ha vinto @${m.sender.split('@')[0]}`, true);
            delete global.trisGames[chatId];
        } else if (game.board.flat().every(c => c !== '')) {
            await sendCanvasBoard(chatId, conn, game, `🤝 *PAREGGIO!*`, true);
            delete global.trisGames[chatId];
        } else {
            game.turn = 1 - game.turn;
            await sendCanvasBoard(chatId, conn, game, `✅ Mossa fatta! Tocca a @${game.players[game.turn].split('@')[0]}`);
        }
    }
};

async function sendCanvasBoard(chatId, conn, game, msg = '', isEnd = false) {
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');
    
    // Disegno Canvas (omesso per brevità, usa quello di prima)
    // ... [Inserisci qui il tuo codice di disegno canvas] ...

    if (isEnd) return await conn.sendMessage(chatId, { image: canvas.toBuffer(), caption: msg, mentions: game.players });

    // MENU LISTA (Il formato più solido)
    const rows = [];
    const labels = ['A', 'B', 'C'];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (game.board[r][c] === '') {
                rows.push({ title: `Casella ${labels[r]}${c + 1}`, rowId: `.putris ${labels[r]}${c + 1}` });
            }
        }
    }

    await conn.sendMessage(chatId, {
        image: canvas.toBuffer(),
        caption: msg,
        footer: 'Clicca sotto per muovere',
        buttonText: '👉 VEDI MOSSE',
        sections: [{ title: "Mosse disponibili", rows: rows }],
        mentions: game.players
    });
}

function checkWinner(board) {
    const wins = [[[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],[[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],[[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]];
    return wins.some(line => {
        const [a, b, c] = line;
        return board[a[0]][a[1]] !== '' && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]];
    });
}

handler.command = /^(tris|putris|resettris)$/i;
export default handler;
