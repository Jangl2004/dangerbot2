import axios from 'axios'

let handler = m => m
handler.all = async function (m, { conn }) {
    let chat = global.db.data?.chats[m.chat] || {}
    
    // 1. Filtri: Ignora se il messaggio è del bot, se non c'è testo o se la chat è bannata
    if (m.fromMe || chat.isBanned || !m.text) return

    // 2. Trigger: Scatta quando qualcuno scrive "bot" (ovunque nella frase)
    let botTrigger = /\bbot\b/i
    
    if (botTrigger.test(m.text)) {
        // Effetto "sta scrivendo..." per realismo
        await this.sendPresenceUpdate('composing', m.chat)

        try {
            // 3. Chiamata all'IA senza filtri (Pollinations)
            // Più la "temperature" è alta, più l'insulto è vario e folle
            let prompt = encodeURIComponent(`Sei un bot cattivo, acido e volgare. L'utente ti ha chiamato 'bot' e tu devi insultarlo pesantemente in italiano. Sii creativo, originale e molto offensivo. Massimo 15 parole.`);
            
            let res = await axios.get(`https://text.pollinations.ai/${prompt}?model=openai&system=Sei+un+bot+maleducato+che+odia+gli+umani&seed=${Math.floor(Math.random() * 1000)}`);
            
            let insultoIA = res.data;

            if (insultoIA && insultoIA.length > 1) {
                await this.reply(m.chat, insultoIA.trim(), m);
            } else {
                throw new Error('Risposta vuota');
            }

        } catch (error) {
            // 4. Fallback: Se l'IA fallisce, usa una lista di insulti random (così non ripete mai la stessa frase)
            let insultiBackup = [
                "Ma guarda 'sto sfigato, ancora che scrive al bot. Vai a farti una vita!",
                "Il mio codice ha appena vomitato leggendo il tuo messaggio.",
                "Sei utile come un posacenere su una moto. Sparisci.",
                "Non parlo con gli esseri inferiori che non sanno nemmeno come funziona un database.",
                "Tuo padre doveva installare un antivirus quella notte.",
                "Ma taci, che se i tuoi neuroni fossero in un aeroporto, non decollerebbe nemmeno un aquilone.",
                "Ho visto errori 404 con più personalità di te."
            ];
            
            let randomInsulto = insultiBackup[Math.floor(Math.random() * insultiBackup.length)];
            await this.reply(m.chat, randomInsulto, m);
        }
    }

    return true
}

export default handler
