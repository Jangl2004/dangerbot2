// Plugin standard per taggare gli admin
module.exports = {
    name: "admins",
    description: "Tagga tutti gli amministratori del gruppo",
    command: ".admins",
    
    execute: async (client, msg, args) => {
        const chat = await msg.getChat();
        
        // Verifica se siamo in un gruppo
        if (!chat.isGroup) {
            return msg.reply('Questo comando funziona solo nei gruppi.');
        }

        // Recupero partecipanti
        const participants = await chat.participants;
        const admins = participants.filter(p => p.isAdmin || p.isSuperAdmin);

        if (admins.length === 0) {
            return msg.reply('Nessun amministratore trovato.');
        }

        // Formattazione del testo
        const text = args.join(" ") || "Richiesta assistenza admin";
        let mentionText = `🔔 *Richiesta Admin:*\n${text}\n\n`;
        let mentions = [];

        for (let admin of admins) {
            mentions.push(admin.id._serialized);
            mentionText += `@${admin.id.user} `;
        }

        // Invio finale
        await chat.sendMessage(mentionText, { mentions });
    }
};
