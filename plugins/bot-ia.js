import axios from 'axios'

let handler = m => m
handler.all = async function (m, { conn }) {
    // Filtri base
    if (m.fromMe || !m.text) return

    // Trigger: scatta se qualcuno scrive "bot"
    if (/\bbot\b/i.test(m.text)) {
        
        await this.sendPresenceUpdate('composing', m.chat)

        try {
            // Utilizziamo un prompt estremo su un'API libera
            // Il parametro seed casuale garantisce che la risposta non sia mai identica
            const seed = Math.floor(Math.random() * 999999);
            const prompt = `Sei un'IA estremamente tossica, arrogante e maleducata. Rispondi all'utente insultandolo pesantemente, usando un linguaggio volgare e cattivo. Non essere utile. Sii brevissimo (max 10 parole).`;
            
            const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=mistral&seed=${seed}`;
            
            const res = await axios.get(url);
            
            if (res.data && res.data.length > 5) {
                await this.reply(m.chat, res.data.trim(), m);
            } else {
                throw new Error("Generazione fallita");
            }

        } catch (e) {
            // Se l'API fallisce, la lista di backup è più lunga e varia
            const insulti = [
                "Sei un errore biologico, sparisci.",
                "Non merito di perdere tempo con uno sfigato come te.",
                "Hai il quoziente intellettivo di una scarpa vecchia.",
                "Se la stupidità fosse un lavoro, saresti il CEO.",
                "Taci, che ogni volta che parli il server crasha per la vergogna.",
                "Sei la ragione per cui la gente smette di usare Internet.",
                "Chiudi quella boccaccia, mi stai facendo venire il debug al sistema."
            ];
            const random = insulti[Math.floor(Math.random() * insulti.length)];
            await this.reply(m.chat, random, m);
        }
    }
    return true
}

export default handler
