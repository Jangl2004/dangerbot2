module.exports = async (client, msg) => {
    // 1. Filtro rapido (non sprecare risorse)
    if (!msg.body.startsWith('.admins')) return;

    try {
        const chat = await msg.getChat();
        
        // 2. Verifica se è un gruppo
        if (!chat.isGroup) {
            return msg.reply('❌ Il comando funziona solo nei gruppi.');
        }

        // 3. RECUPERO FORZATO PARTECIPANTI
        // A volte la cache è vuota, forziamo il refresh dal server
        const participants = await chat.participants;
        
        // Debug: vediamo cosa vede il bot
        console.log(`[DEBUG] Trovati ${participants.length} partecipanti nel gruppo ${chat.name}`);

        const admins = participants.filter(p => p.isAdmin || p.isSuperAdmin);

        if (admins.length === 0) {
            return msg.reply('⚠️ Non ho trovato alcun amministratore (o non ho i permessi per vedere la lista).');
        }

        // 4. Costruzione messaggio
        const args = msg.body.slice(7).trim();
        const responseText = args ? `📢 *Richiesta Admin:* ${args}` : '📢 *Richiesta urgente agli amministratori:*';
        
        let mentions = [];
        let mentionText = `${responseText}\n\n`;

        admins.forEach(admin => {
            mentions.push(admin.id._serialized);
            mentionText += `@${admin.id.user} `;
        });

        // 5. Invio
        await chat.sendMessage(mentionText, { mentions });
        console.log('[DEBUG] Messaggio inviato con successo');

    } catch (err) {
        console.error('[ERROR] Errore critico nel plugin:', err);
        msg.reply('❌ Errore interno: impossibile recuperare gli admin.');
    }
};
