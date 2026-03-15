client.on('message', async (msg) => {
    const chat = await msg.getChat();

    // Controlla se è un comando
    if (msg.body.startsWith('.admins ')) {
        // Verifica che sia un gruppo
        if (!chat.isGroup) {
            return msg.reply('Questo comando funziona solo nei gruppi!');
        }

        const args = msg.body.slice(8).trim(); // Prende il testo dopo ".admins "
        const admins = chat.participants.filter(p => p.isAdmin || p.isSuperAdmin);

        let mentionText = `📢 *Richiesta Admin:*\n${args}\n\n`;
        let mentions = [];

        // Crea la lista delle menzioni
        for (let admin of admins) {
            mentionText += `@${admin.id.user} `;
            mentions.push(admin.id._serialized);
        }

        // Invia il messaggio con le menzioni
        await chat.sendMessage(mentionText, { mentions });
    }
});
