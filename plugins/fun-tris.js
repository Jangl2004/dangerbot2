import { createCanvas, loadImage } from 'canvas';

// --- MANTENIAMO TUTTE LE TUE FUNZIONI GRAFICHE E DI LOGICA ---
// (Includi qui: TrisGame, getSafeName, updatePlayerStats, 
// createPlaceholderImage, drawX, drawO, renderBoard, sendGameMessage, ecc.)
// ... [Il tuo codice precedente da riga 1 a 380 circa] ...

// --- VERSIONE CORRETTA DELL'HANDLER ---
let handler = async (m, { conn }) => {
    const { chat, sender, mentionedJid, quoted, text } = m;
    
    // Se è un tentativo di giocare una mossa (numero 1-9) in un gruppo dove c'è una partita
    if (games.has(chat) && /^[1-9]$/.test(text?.trim())) {
        return; // Lasciamo che sia il 'before' a gestire la mossa
    }

    // Se è il comando .tris
    if (text?.startsWith('.tris')) {
        let opponent = mentionedJid?.[0] || quoted?.sender;
        if (!opponent) return m.reply('❌ *Menziona qualcuno o rispondi a un messaggio per sfidare!*');
        if (opponent === sender) return m.reply('❌ *Non puoi sfidare te stesso!*');
        if (games.has(chat)) return m.reply('⚠️ *Partita già in corso!*');

        const game = new TrisGame(sender, opponent);
        games.set(chat, game);
        await sendGameMessage(conn, chat, game, `🔄 Turno di: ${await getSafeName(conn, sender)}`, true);
        return;
    }
};

// --- IL "CUORE" CORRETTO ---
handler.before = async (m, { conn }) => {
    const { chat, sender, text, isButtonResponse } = m;
    if (!games.has(chat)) return;

    const game = games.get(chat);
    if (sender !== game.turn || game.isFinished) return;

    let pos;
    // Intercettazione flessibile: accetta bottoni OPPURE numeri scritti in chat
    if (isButtonResponse) {
        const buttonId = m.buttonId;
        if (buttonId?.startsWith('tris_move_')) {
            pos = parseInt(buttonId.replace('tris_move_', '')) - 1;
        }
    } else if (/^[1-9]$/.test(text?.trim())) {
        pos = parseInt(text.trim()) - 1;
    } else {
        return;
    }

    // Esecuzione mossa
    if (pos !== undefined && game.move(pos)) {
        let result = game.checkWin();
        // ... [Qui mantieni tutta la tua logica di checkWin e invio messaggi finale] ...
        // Assicurati di chiamare sendGameMessage dopo ogni mossa valida
    }
};

handler.command = ['tris'];
export default handler;
