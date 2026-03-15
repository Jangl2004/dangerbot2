// Plugin: gp-admins.js (Sintassi ESM)
const cooldowns = new Map();

export default async function (client, msg) {
    // 1. Verifica comando
    if (!msg.body.startsWith('.admins')) return;

    const chat = await msg.getChat();
    if (!chat.isGroup) return msg.reply('❌ Comando solo nei gruppi.');

    // 2. Cooldown (60 secondi)
    if (cooldowns.has(chat.id._serialized)) {
        if (Date.now() - cooldowns.get(chat.id._serialized) < 60000) return;
    }
    cooldowns.set(chat.id._serialized, Date.now());

    // 3. Recupero Admin
    const participants = await chat.participants;
    const admins = participants.filter(p => p.isAdmin || p.isSuperAdmin);

    if (admins.length === 0) return msg.reply('❌ Non ho trovato admin.');

    // 4. Invio messaggio
    const text = msg.body.slice(7).trim();
    let mentionText = `📢 *Richiesta agli Admin:*\n${text || 'Nessun messaggio specificato'}\n\n`;
    let mentions = [];

    admins.forEach(admin => {
        mentions.push(admin.id._serialized);
        mentionText += `@${admin.id.user} `;
    });

    await chat.sendMessage(mentionText, { mentions });
}
