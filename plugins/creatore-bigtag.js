let handler = async (m, { conn, text, participants, isROwner }) => {
    if (!isROwner) return; 

    let customMessage = text.trim();
    if (!customMessage) return m.reply("𝐒𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐢𝐧𝐬𝐢𝐞𝐦𝐞 𝐚𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨!");

    // Ottieni tutti i membri del gruppo
    let users = participants.map((u) => u.id);

    // Funzione ultra-rapida per inviare
    const send = async (msg) => {
        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: msg,
                contextInfo: { mentionedJid: users },
            },
        }, {});
    };

    // Velocità aumentata: 300ms invece di 2000ms
    const delay = (time) => new Promise((res) => setTimeout(res, time));

    try {
        // Eseguire il ciclo più rapidamente
        for (let i = 0; i < 10; i++) {
            await send(customMessage);
            await delay(300); // Ridotto a 0.3 secondi per una raffica velocissima
        }
    } catch (e) {
        console.error(e);
        m.reply("Errore durante l'invio.");
    }
};

handler.command = /^(bigtag)$/i;
handler.group = true;
handler.rowner = true;

export default handler;
