// gp-admins.cjs
const cooldowns = new Map();

module.exports = async (client, msg) => {
    if (!msg.body.startsWith('.admins')) return;

    const chat = await msg.getChat();
    if (!chat.isGroup) return;

    // Cooldown
    if (cooldowns.has(chat.id._serialized)) {
        if (Date.now() - cooldowns.get(chat.id._serialized) < 60000) return;
    }
    cooldowns.set(chat.id._serialized, Date.now());

    const participants = await chat.participants;
    const admins = participants.filter(p => p.isAdmin || p.isSuperAdmin);

    if (admins.length === 0) return;

    const text = msg.body.slice(7).trim();
    let mentionText = `📢 *Richiesta Admin:*\n${text || 'Urgente!'}\n\n`;
    let mentions = [];

    admins.forEach(admin => {
        mentions.push(admin.id._serialized);
        mentionText += `@${admin.id.user} `;
    });

    await chat.sendMessage(mentionText, { mentions });
};
