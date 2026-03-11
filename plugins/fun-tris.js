import { createCanvas, loadImage } from 'canvas';

// --- DEFINIZIONE GLOBALE (Per evitare il ReferenceError) ---
global.games = global.games || new Map();
global.timeoutMap = global.timeoutMap || new Map();
global.playerStats = global.playerStats || new Map();

// --- LOGICA DI GIOCO (Mantenuta come l'originale) ---
class TrisGame {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.board = Array(9).fill(null);
        this.turn = p1;
        this.isFinished = false;
        this.winningLine = null;
    }
    move(pos) {
        if (pos < 0 || pos > 8 || this.board[pos] || this.isFinished) return false;
        this.board[pos] = this.turn === this.p1 ? 'X' : 'O';
        this.turn = this.turn === this.p1 ? this.p2 : this.p1;
        return true;
    }
    checkWin() {
        const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) return { winner: this.board[a], line: pattern };
        }
        return !this.board.includes(null) ? { winner: 'draw', line: null } : null;
    }
}

// ... [Inserisci qui le tue funzioni grafiche esistenti: renderBoard, drawX, drawO, sendGameMessage, ecc.] ...
// Assicurati che sendGameMessage usi global.games invece di games locale!

let handler = async (m, { conn }) => {
    const { chat, sender, mentionedJid, quoted } = m;
    
    // Comando .tris
    if (!m.text.startsWith('.tris')) return;
    
    let opponent = mentionedJid[0] || quoted?.sender;
    if (!opponent) return m.reply('❌ Menziona qualcuno per sfidarlo!');
    if (opponent === sender) return m.reply('❌ Non puoi sfidare te stesso!');
    if (global.games.has(chat)) return m.reply('⚠️ Partita già in corso.');

    const game = new TrisGame(sender, opponent);
    global.games.set(chat, game);
    await sendGameMessage(conn, chat, game, `🔄 Turno di: @${sender.split('@')[0]}`, true);
};

// --- HANDLER BEFORE (Intercettatore) ---
handler.before = async (m, { conn }) => {
    const { chat, sender, text, isButtonResponse } = m;
    if (!global.games.has(chat)) return;

    const game = global.games.get(chat);
    if (sender !== game.turn || game.isFinished) return;

    let pos;
    if (isButtonResponse) {
        pos = parseInt(m.buttonId.replace('tris_move_', '')) - 1;
    } else if (/^[1-9]$/.test(text?.trim())) {
        pos = parseInt(text.trim()) - 1;
    } else return;

    if (!game.move(pos)) return m.reply('❌ Mossa non valida!');

    let result = game.checkWin();
    if (result) {
        game.isFinished = true;
        // ... (Logica finale che avevi) ...
        global.games.delete(chat);
    } else {
        await sendGameMessage(conn, chat, game, `🔄 Turno di: @${game.turn.split('@')[0]}`);
    }
};

handler.command = ['tris'];
export default handler;
