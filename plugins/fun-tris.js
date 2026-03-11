class TrisGame:
    def __init__(self):
        self.board = [" " for _ in range(9)]
        self.turn = "X"  # X inizia sempre
        self.game_over = False

    def check_winner(self):
        win_coords = [(0,1,2), (3,4,5), (6,7,8), (0,3,6), (1,4,7), (2,5,8), (0,4,8), (2,4,6)]
        for a, b, c in win_coords:
            if self.board[a] == self.board[b] == self.board[c] and self.board[a] != " ":
                return self.board[a]
        if " " not in self.board: return "Pareggio"
        return None

    def get_board_text(self):
        b = self.board
        return f"```\n {b[0]} | {b[1]} | {b[2]} \n---+---+---\n {b[3]} | {b[4]} | {b[5]} \n---+---+---\n {b[6]} | {b[7]} | {b[8]} \n```"

# Esempio di utilizzo nel tuo bot
def handle_move(game, position):
    if game.game_over: return "La partita è finita! Scrivi .tris per ricominciare."
    
    # Esegue la mossa
    game.board[position] = game.turn
    
    # Controlla vittoria
    winner = game.check_winner()
    if winner:
        game.game_over = True
        return f"🎉 Partita finita! Risultato: {winner if winner != 'Pareggio' else 'Pareggio'}"
    
    # Cambia turno
    game.turn = "O" if game.turn == "X" else "X"
    return f"Tocca a: {game.turn}\n{game.get_board_text()}"
