const handler = async (message, { conn, usedPrefix = '.' }) => {

    const menuText = `
☣️ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 – 𝐀𝐃𝐌𝐈𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 ☣️

════════════════════
👑 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐑𝐔𝐎𝐋𝐈
➤ ${usedPrefix}admins 🛡️ Lista admin

════════════════════
⚠️ 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐋𝐎 𝐃𝐈𝐒𝐂𝐈𝐏𝐋𝐈𝐍𝐀
➤ ${usedPrefix}warn 🚨 Avvisa utente
➤ ${usedPrefix}listwarn 📋 Registro avvisi
➤ ${usedPrefix}unwarn 🔓 Rimuovi avviso
➤ ${usedPrefix}delwarn ❌ Elimina avviso
➤ ${usedPrefix}clearwarn 🔄 Reset totale

════════════════════
🔇 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐋𝐎 𝐂𝐇𝐀𝐓
➤ ${usedPrefix}muta 🤐 Silenzia utente
➤ ${usedPrefix}smuta 🔊 Ripristina utente
➤ ${usedPrefix}tag 🎯 Tagga membri
➤ ${usedPrefix}setname 🏷️ Cambia nome gruppo

════════════════════
🔒 𝐒𝐈𝐂𝐔𝐑𝐄𝐙𝐙𝐀 𝐆𝐑𝐔𝐏𝐏𝐎
➤ ${usedPrefix}aperto 🟢 Apri gruppo
➤ ${usedPrefix}chiuso 🔐 Chiudi gruppo
➤ ${usedPrefix}modlist 📡 Lista moderatori

════════════════════
👥 𝐀𝐙𝐈𝐎𝐍𝐈 𝐔𝐓𝐄𝐍𝐓𝐄
➤ ${usedPrefix}kick 🪓 Espelli utente

════════════════════
🔗 𝐀𝐂𝐂𝐄𝐒𝐒𝐎
➤ ${usedPrefix}link 🌐 Link gruppo

════════════════════
 Sistema sotto controllo.
`.trim();

    const buttons = [
        { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🏠 Menu Principale' }, type: 1 },
        { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: '👑 Menu Owner' }, type: 1 },
        { buttonId: `${usedPrefix}menumod`, buttonText: { displayText: '🫅🏻 Moderazione' }, type: 1 },
        { buttonId: `${usedPrefix}menugiochi`, buttonText: { displayText: '🎮 Giochi' }, type: 1 },
        { buttonId: `${usedPrefix}menufunzioni`, buttonText: { displayText: '🚨 Funzioni' }, type: 1 }
    ];

    await conn.sendMessage(message.chat, {
        text: menuText,
        footer: '⚡ Danger Bot • Navigazione',
        buttons: buttons,
        headerType: 1
    });
};

handler.help = ['menuadmin'];
handler.tags = ['menu'];
handler.command = /^(menuadmin)$/i;

export default handler;
