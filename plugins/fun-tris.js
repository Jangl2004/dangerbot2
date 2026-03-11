import { createCanvas } from 'canvas'

// Usiamo global per evitare che le partite si perdano al ricaricamento del plugin
global.trisGames = global.trisGames || {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    // Comando di emergenza per sbloccare il bot
    if (command === 'endtris') {
        global.trisGames[chatId] = null;
        delete global.trisGames[chatId];
        return m.reply('🛑 Partita terminata.');
    }

    // ===== START (.tris) =====
    if (command === 'tris') {
        let mention = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
        if (!mention) return m.reply(`⚠️ Devi menzionare qualcuno!`);
        if (global.trisGames[chatId]) return m.reply('❌ Partita già in corso! Usa .endtris per resettare.');

        global.trisGames[chatId] = {
            board: [['','',''],['','',''],['','','']],
            players: [m.sender, mention],
            jids: [m.sender, mention],
            turn: 0,
            symbols: ['X', 'O']
        };

        await sendCanvasBoard(chatId, conn, global.trisGames[chatId], `🎮 *TRIS HD Iniziato!*`);
    }

    // ===== MOVE (.putris) =====
    else if (command === 'putris') {
        const game = global.trisGames[chatId];
        if (!game) return m.reply('❌ Nessuna partita attiva.');
        if (m.sender !== game.jids[game.turn]) return m.reply('❌ Non è il tuo turno!');

        const move = parseInt(text.trim());
        const row = Math.floor((move - 1) / 3);
        const col = (move - 1) % 3;

        if (isNaN(move) || move < 1 || move > 9 || game.board[row][col] !== '') 
            return m.reply('⚠️ Mossa non valida. Inserisci un numero da 1 a 9.');

        game.board[row][col] = game.symbols[game.turn];

        if (checkWinner(game.board)) {
            await sendCanvasBoard(chatId, conn, game, `🎉 *VITTORIA!* Ha vinto @${m.sender.split('@')[0]}`, true);
            delete global.trisGames[chatId];
        } else if (game.board.flat().every(c => c !== '')) {
            await sendCanvasBoard(chatId, conn, game, `🤝 *PAREGGIO!*`, true);
            delete global.trisGames[chatId];
        } else {
            game.turn = 1 - game.turn;
            await sendCanvasBoard(chatId, conn, game, `✅ Mossa ${move} registrata! Tocca a @${game.jids[game.turn].split('@')[0]}`);
        }
    }
};

async function sendCanvasBoard(chatId, conn, game, msg = '', isEnd = false) {
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');
    
    // Disegno Griglia
    ctx.fillStyle = '#1e1e2e'; ctx.fillRect(0, 0, 500, 500);
    ctx.strokeStyle = '#89b4fa'; ctx.lineWidth = 10;
    for (let i = 1; i < 3; i++) {
        let pos = i * 166;
        ctx.beginPath(); ctx.moveTo(pos, 50); ctx.lineTo(pos, 450); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(50, pos); ctx.lineTo(450, pos); ctx.stroke();
    }
    
    // Numeri nelle caselle per riferimento visivo
    ctx.fillStyle = '#44475a'; ctx.font = 'bold 50px Arial';
    for (let i = 0; i < 9; i++) {
        let r = Math.floor(i / 3), c = i % 3;
        if(game.board[r][c] === '') ctx.fillText((i + 1).toString(), 83 + c*166, 120 + r*166);
    }

    // Segni X e O
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let s = game.board[r][c], x = 83 + c * 166, y = 100 + r * 166;
            if (s === 'X') { ctx.strokeStyle = '#f38ba8'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(x-40,y-40); ctx.lineTo(x+40,y+40); ctx.moveTo(x+40,y-40); ctx.lineTo(x-40,y+40); ctx.stroke(); }
            else if (s === 'O') { ctx.strokeStyle = '#f9e2af'; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(x,y,45,0,Math.PI*2); ctx.stroke(); }
        }
    }

    if (isEnd) return await conn.sendMessage(chatId, { image: canvas.toBuffer(), caption: msg, mentions: game.jids });

    // Menu a tendina numerato
    const rows = [];
    for (let i = 0; i < 9; i++) {
        let r = Math.floor(i / 3), c = i % 3;
        if (game.board[r][c] === '') {
            rows.push({ title: `Casella ${i + 1}`, rowId: `.putris ${i + 1}`, description: `Occupare posizione ${i + 1}` });
        }
    }

    await conn.sendMessage(chatId, {
        image: canvas.toBuffer(),
        caption: msg,
        footer: 'Clicca sotto per muovere',
        buttonText: '👉 VEDI MOSSE',
        sections: [{ title: "Griglia Numerata", rows: rows }],
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

handler.command = /^(tris|putris|endtris)$/i;
handler.group = true;
export default handler;
