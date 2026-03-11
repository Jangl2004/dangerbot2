import { createCanvas, loadImage } from 'canvas';

// --- DICHIARAZIONI GLOBALI PER PERSISTENZA E VISIBILITÀ ---
global.games = global.games || new Map();
global.timeoutMap = global.timeoutMap || new Map();
global.playerStats = global.playerStats || new Map();

// --- CLASSE PRINCIPALE DEL GIOCO TRIS ---
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
        if (pos < 0 || pos > 8 || this.board[pos] || this.isFinished) {
            return false;
        }
        this.board[pos] = this.turn === this.p1 ? 'X' : 'O';
        this.turn = this.turn === this.p1 ? this.p2 : this.p1;
        return true;
    }

    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Righe
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonne
            [0, 4, 8], [2, 4, 6]             // Diagonali
        ];
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return { winner: this.board[a], line: pattern };
            }
        }
        if (!this.board.includes(null)) {
            return { winner: 'draw', line: null };
        }
        return null;
    }
}

// --- FUN
