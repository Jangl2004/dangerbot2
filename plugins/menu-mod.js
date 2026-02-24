const handler = async (message, { conn, usedPrefix = '.' }) => {

const menuText = `
🛡️ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 – 𝐔𝐍𝐈𝐓À 𝐌𝐎𝐃 🛡️
════════════════════

⚔️ 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐋𝐎 𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐕𝐎
➤ ${usedPrefix}tagmod 📢 Richiamo totale
➤ ${usedPrefix}pingmod ⚡ Verifica sistema
➤ ${usedPrefix}delm 🗑️ Eliminazione messaggio

════════════════════
☣️ 𝐀𝐙𝐈𝐎𝐍𝐈 𝐃𝐈 𝐈𝐌𝐏𝐀𝐓𝐓𝐎
➤ ${usedPrefix}nukegp 💀 Simulazione nuke
➤ ${usedPrefix}warnmod 🚨 Avviso ufficiale
➤ ${usedPrefix}unwarnmod 🔓 Revoca avviso

════════════════════
🔻 Autorità moderazione attiva
`.trim();

    const buttons = [
        { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🏠 Menu Principale' }, type: 1 },
        { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: '🛡 Menu Admin' }, type: 1 },
        { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: '👑 Menu Owner' }, type: 1 },
        { buttonId: `${usedPrefix}menufunzioni`, buttonText: { displayText: '🚨 Funzioni' }, type: 1 },
        { buttonId: `${usedPrefix}menugiochi`, buttonText: { displayText: '🎮 Giochi' }, type: 1 },
        { buttonId: `${usedPrefix}menuludopatici`, buttonText: { displayText: '📱 Area Digitale' }, type: 1 }
    ];

    await conn.sendMessage(message.chat, {
        text: menuText,
        footer: '⚡ Danger Bot • Unità Moderazione',
        buttons: buttons,
        headerType: 1
    });
};

handler.help = ['menumod'];
handler.tags = ['menu'];
handler.command = /^(menumod)$/i;

export default handler;
