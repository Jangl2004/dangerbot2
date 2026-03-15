/**
 * Plugin: .admins <testo>
 * Descrizione: Notifica tutti gli amministratori del gruppo.
 */

const cooldowns = new Map(); // Per gestire l'anti-spam

module.exports = async (client, msg) => {
    const chat = await msg.getChat();
    const command = ".admins";

    // 1. Validazione base
    if (!msg.body.startsWith(command)) return;
    if (!chat.isGroup) return msg.reply('❌ Comando disponibile solo nei gruppi.');

    // 2. Anti-Spam (1 minuto di cooldown)
    const now = Date.now();
    const cooldownTime = 60000;
    if (cooldowns.has(chat.id._serialized)) {
        const expiration = cooldowns.get(chat.id._serialized) + cooldownTime;
        if (now < expiration) return; // Ignora in silenzio se è troppo presto
    }
    cooldowns.set(chat.id._serialized, now);

    // 3. Estrazione testo e validazione
    const text = msg.body.slice(command.length).trim();
    if (!text) return msg.reply('⚠️ *Sintassi errata.*\nUsa: `.admins <il tuo messaggio>`');

    try {
        // 4. Recupero Admin
        const participants = await chat.participants;
        const admins = participants.filter(p => p.isAdmin || p.isSuperAdmin);

        if (admins.length === 0) return msg.reply('❌ Non ho trovato admin in questo gruppo.');

        // 5. Creazione menzioni
        let mentionText = `🔔 *Richiesta agli Admin*\n\n`;
        mentionText += `📝 *Messaggio:* ${text}\n\n`;
        
        let mentions = [];
        admins.forEach(admin => {
            mentionText += `@${admin.id.user} `;
            mentions.push(admin.id._serialized);
        });

        // 6. Invio
        await chat.sendMessage(mentionText, { mentions });
        
    } catch (error) {
        console.error('Errore nel plugin admins:', error);
        msg.reply('⚠️ Si è verificato un errore durante l\'invio della notifica.');
    }
};
