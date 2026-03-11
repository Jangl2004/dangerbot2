import { createCanvas } from 'canvas'

let games = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    const getPhoneNumber = (jid) => {
        if (!jid) return '';
        return jid.split('@')[0].replace(/\D/g, '');
    };

    // ===== START (.tris) =====
    if (command === 'tris') {
        let mention = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);

        if (!mention) 
            return m.reply(`⚠️ *ERRORE*: Devi menzionare qualcuno!\nEsempio: ${usedPrefix}tris @utente`);

        const myNumber = getPhoneNumber(m.sender);
        const theirNumber = getPhoneNumber(mention);

        if (myNumber === theirNumber) return m.reply('❌ Non puoi sfidare te stesso!');
        if (games[chatId]) return m.reply('❌ C\'è già una partita in corso qui!');

        games[chatId] = {
            board: [['','',''],['','',''],['','','']],
            players: [myNumber, theirNumber],
            jids: [m.sender, mention],
            turn: 0,
            timer: null,
            symbols: ['X', 'O']
        };

        await sendCanvasBoard(chatId, conn, games[chatId], 
            `🎮 *TRIS HD INIZIATO!*\n\n` +
            `❌ @${games[chatId].jids[0].split('@')[0]}\n` +
            `⭕ @${games[chatId].jids[1].split('@')[0]}\n\n` +
            `👉 *Tocca a:* @${games[chatId].jids[0].split('@')[0]}\n` +
            `📝 *Comando:* \`${usedPrefix}putris [riga][colonna]\` (es: A1, B2, C3)`
        );
        startTurnTimer(chatId, conn);
    }

    // ===== MOVE (.putris) =====
    else if (command === 'putris') {
        const game = games[chatId];
        if (!game) return m.reply('❌ Nessuna partita attiva. Usa .tris per iniziare.');

        const myNumber = getPhoneNumber(m.sender);
        if (myNumber !== game.players[game.turn]) {
            return conn.reply(chatId, `❌ *NON È IL TUO TURNO!*\nAttendi @${game.jids[game.turn].split('@')[0]}`, m, { mentions: [game.jids[game.turn]] });
        }

        const move = text.trim().toUpperCase();
        const map = { A: 0, B: 1, C: 2 };
        const row = map[move[0]];
        const col = parseInt(move[1]) - 1;

        if (row === undefined || isNaN(col) || col < 0 || col > 2)
            return m.reply(`⚠️ *MOSSA ERRATA!*\n\nDevi scrivere la riga (A, B, C) e il numero (1, 2, 3).\nEsempio: \`${usedPrefix}putris A1\``);

        if (game.board[row][col] !== '')
            return m.reply('❌ Quella casella è già occupata!');

        game.board[row][col] = game.symbols[game.turn];

        if (checkWinner(game.board)) {
            clearTimeout(game.timer);
            await sendCanvasBoard(chatId, conn, game, `🎉 *VITTORIA!* \n\nComplimenti @${m.sender.split('@')[0]}, hai vinto la sfida! 🏆`);
            delete games[chatId];
        } 
        else if (game.board.flat().every(cell => cell !== '')) {
            clearTimeout(game.timer);
            await sendCanvasBoard(chatId, conn, game, `🤝 *PAREGGIO!* \n\nOttima partita a entrambi.`);
            delete games[chatId];
        } 
        else {
            game.turn = 1 - game.turn;
            await sendCanvasBoard(chatId, conn, game, 
                `✅ *MOSSA REGISTRATA!*\n\n` +
                `👉 *Prossimo turno:* @${game.jids[game.turn].split('@')[0]}\n` +
                `🎯 *Simbolo:* ${game.symbols[game.turn]}\n` +
                `📝 *Usa:* \`${usedPrefix}putris [casella]\``
            );
            startTurnTimer(chatId, conn);
        }
    }

    // ===== END =====
    else if (command === 'endtris') {
        if (games[chatId]) {
            clearTimeout(games[chatId].timer);
            delete games[chatId];
            m.reply('🛑 Partita terminata forzatamente.');
        }
    }
};

// --- FUNZIONE DISEGNO CANVAS CON BOTTONI ---
async function sendCanvasBoard(chatId, conn, game, msg = '') {
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, 500, 500);
    ctx.strokeStyle = '#89b4fa';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    for (let i = 1; i < 3; i++) {
        let pos = i * 166;
        ctx.beginPath(); ctx.moveTo(pos, 50); ctx.lineTo(pos, 450); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(50, pos); ctx.lineTo(450, pos); ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ['1', '2', '3'].forEach((n, i) => ctx.fillText(n, 83 + i * 166, 35));
    ['A', 'B', 'C'].forEach((l, i) => ctx.fillText(l, 25, 100 + i * 166));

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let symbol = game.board[r][c];
            let x = 83 + c * 166;
            let y = 100 + r * 166;
            if (symbol === 'X') {
                ctx.strokeStyle = '#f38ba8'; ctx.lineWidth = 15;
                ctx.beginPath(); ctx.moveTo(x - 40, y - 40); ctx.lineTo(x + 40, y + 40);
                ctx.moveTo(x + 40, y - 40); ctx.lineTo(x - 40, y + 40); ctx.stroke();
            } else if (symbol === 'O') {
                ctx.strokeStyle = '#f9e2af'; ctx.lineWidth = 15;
                ctx.beginPath(); ctx.arc(x, y, 45, 0, Math.PI * 2); ctx.stroke();
            }
        }
    }

    // Creazione bottoni dinamici per le caselle libere
    let buttons = [];
    const labels = ['A', 'B', 'C'];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (game.board[r][c] === '') {
                buttons.push({
                    buttonId: `.putris ${labels[r]}${c + 1}`,
                    buttonText: { displayText: `${labels[r]}${c + 1}` },
                    type: 1
                });
            }
        }
    }

    await conn.sendMessage(chatId, { 
        image: canvas.toBuffer(), 
        caption: msg,
        footer: 'Clicca una casella per muovere:',
        buttons: buttons.slice(0, 3), // Mostra i primi 3 disponibili
        headerType: 4,
        mentions: game.jids 
    });
}

function checkWinner(board) {
    const lines = [
        [[0,0], [0,1], [0,2]], [[1,0], [1,1], [1,2]], [[2,0], [2,1], [2,2]],
        [[0,0], [1,0], [2,0]], [[0,1], [1,1], [2,1]], [[0,2], [1,2], [2,2]],
        [[0,0], [1,1], [2,2]], [[0,2], [1,1], [2,0]] 
    ];
    for (let line of lines) {
        const [[r1,c1], [r2,c2], [r3,c3]] = line;
        if (board[r1][c1] !== '' && board[r1][c1] === board[r2][c2] && board[r1][c1] === board[r3][c3]) return true;
    }
    return false;
}

function startTurnTimer(chatId, conn) {
    const game = games[chatId];
    if (game?.timer) clearTimeout(game.timer);
    game.timer = setTimeout(() => {
        if (games[chatId]) {
            conn.sendMessage(chatId, { text: '⏱️ *TEMPO SCADUTO!*\nLa partita è stata chiusa.' });
            delete games[chatId];
        }
    }, 120000);
}

handler.command = /^(tris|putris|endtris)$/i;
handler.group = true;
export default handler;
