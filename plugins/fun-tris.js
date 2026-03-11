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
        if (!mention) return m.reply(`⚠️ *ERRORE*: Devi menzionare qualcuno!`);

        const myNumber = getPhoneNumber(m.sender);
        const theirNumber = getPhoneNumber(mention);

        if (myNumber === theirNumber) return m.reply('❌ Non puoi sfidare te stesso!');
        if (games[chatId]) return m.reply('❌ C\'è già una partita in corso!');

        games[chatId] = {
            board: [['','',''],['','',''],['','','']],
            players: [myNumber, theirNumber],
            jids: [m.sender, mention],
            turn: 0,
            timer: null,
            symbols: ['X', 'O']
        };

        await sendCanvasBoard(chatId, conn, games[chatId], `🎮 *TRIS HD INIZIATO!*`);
        startTurnTimer(chatId, conn);
    }

    // ===== MOVE (.putris) =====
    else if (command === 'putris') {
        const game = games[chatId];
        if (!game) return m.reply('❌ Nessuna partita attiva.');

        const myNumber = getPhoneNumber(m.sender);
        if (myNumber !== game.players[game.turn]) return m.reply('❌ Non è il tuo turno!');

        const move = text.trim().toUpperCase();
        const map = { A: 0, B: 1, C: 2 };
        const row = map[move[0]];
        const col = parseInt(move[1]) - 1;

        if (row === undefined || isNaN(col) || game.board[row][col] !== '') return m.reply('⚠️ Mossa non valida.');

        game.board[row][col] = game.symbols[game.turn];

        if (checkWinner(game.board)) {
            clearTimeout(game.timer);
            await sendCanvasBoard(chatId, conn, game, `🎉 *VITTORIA!* Ha vinto @${m.sender.split('@')[0]}`, true);
            delete games[chatId];
        } else if (game.board.flat().every(c => c !== '')) {
            clearTimeout(game.timer);
            await sendCanvasBoard(chatId, conn, game, `🤝 *PAREGGIO!*`, true);
            delete games[chatId];
        } else {
            game.turn = 1 - game.turn;
            await sendCanvasBoard(chatId, conn, game, `✅ Mossa registrata! Tocca a @${game.jids[game.turn].split('@')[0]}`);
            startTurnTimer(chatId, conn);
        }
    }
};

// --- FUNZIONE CANVAS CON LIST MESSAGE ---
async function sendCanvasBoard(chatId, conn, game, msg = '', isGameOver = false) {
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');
    
    // Disegno base
    ctx.fillStyle = '#1e1e2e'; ctx.fillRect(0, 0, 500, 500);
    ctx.strokeStyle = '#89b4fa'; ctx.lineWidth = 10;
    for (let i = 1; i < 3; i++) {
        let pos = i * 166;
        ctx.beginPath(); ctx.moveTo(pos, 50); ctx.lineTo(pos, 450); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(50, pos); ctx.lineTo(450, pos); ctx.stroke();
    }
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let s = game.board[r][c];
            let x = 83 + c * 166; let y = 100 + r * 166;
            if (s === 'X') { ctx.strokeStyle = '#f38ba8'; ctx.beginPath(); ctx.moveTo(x-40,y-40); ctx.lineTo(x+40,y+40); ctx.moveTo(x+40,y-40); ctx.lineTo(x-40,y+40); ctx.stroke(); }
            else if (s === 'O') { ctx.strokeStyle = '#f9e2af'; ctx.beginPath(); ctx.arc(x,y,45,0,Math.PI*2); ctx.stroke(); }
        }
    }

    if (isGameOver) {
        await conn.sendMessage(chatId, { image: canvas.toBuffer(), caption: msg, mentions: game.jids });
        return;
    }

    // Creazione del MENU A TENDINA (List Message)
    const rows = [];
    const labels = ['A', 'B', 'C'];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (game.board[r][c] === '') {
                rows.push({ title: `Casella ${labels[r]}${c + 1}`, rowId: `.putris ${labels[r]}${c + 1}`, description: 'Clicca per occupare' });
            }
        }
    }

    await conn.sendMessage(chatId, {
        image: canvas.toBuffer(),
        caption: msg,
        footer: 'Clicca sotto per muovere',
        buttonText: '👉 VEDI MOSSE DISPONIBILI',
        sections: [{ title: "Griglia di gioco", rows: rows }],
        mentions: game.jids
    });
}

function checkWinner(board) {
    const lines = [[[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],[[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],[[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]];
    return lines.some(line => {
        const [a, b, c] = line;
        return board[a[0]][a[1]] !== '' && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]];
    });
}

function startTurnTimer(chatId, conn) {
    const game = games[chatId];
    if (game?.timer) clearTimeout(game.timer);
    game.timer = setTimeout(() => {
        if (games[chatId]) {
            conn.sendMessage(chatId, { text: '⏱️ *Tempo scaduto! Partita chiusa.*' });
            delete games[chatId];
        }
    }, 120000);
}

handler.command = /^(tris|putris)$/i;
handler.group = true;
export default handler;
