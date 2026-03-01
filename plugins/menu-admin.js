const handler = async (message, { conn, usedPrefix = '.' }) => {

    const args = message.text.split(' ')[1] || '1';

    const sezioni = {
        1: `
🛡️ 𝐍𝚵𝑿𝐒𝐔𝐒 – 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌𝐈𝐍 ⚙️
════════════════════

👑 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 
➤ ${usedPrefix}admins 🛡️ Lista admin
➤ ${usedPrefix}accetta ✅ Accetta tutte le richieste 

⚠️ 𝐖𝐀𝐑𝐍 & 𝐃𝐈𝐒𝐂𝐈𝐏𝐋𝐈𝐍𝐀
➤ ${usedPrefix}warn ⚠️ Avvisa utente
➤ ${usedPrefix}listwarn 📄 Lista avvisi
➤ ${usedPrefix}unwarn ✅ Rimuovi avviso
➤ ${usedPrefix}delwarn ❌ Cancella avviso
➤ ${usedPrefix}resetwarn 🔄 Reset avvisi

`.trim(),

        2: `
🛡️ 𝐍𝚵𝑿𝐒𝐔𝐒 – 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌𝐈𝐍 ⚙️
════════════════════

🔇 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐋𝐎 𝐂𝐇𝐀𝐓
➤ ${usedPrefix}muta 🤫 Muta la persona 
➤ ${usedPrefix}smuta 🔊 Smuta la persona
➤ ${usedPrefix}tag 🏹 Tagga utenti
➤ ${usedPrefix}setname 🚨 Cambia nome al Gruppo
`.trim(),

        3: `
🛡️ 𝐍𝚵𝑿𝐒𝐔𝐒 – 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌𝐈𝐍 ⚙️
════════════════════

🔒 𝐈𝐌𝐏𝐎𝐒𝐓𝐀𝐙𝐈𝐎𝐍𝐈 𝐆𝐑𝐔𝐏𝐏𝐎
➤ ${usedPrefix}aperto 🌙 Apri gruppo
➤ ${usedPrefix}chiuso 🔐 Chiudi gruppo
➤ ${usedPrefix}modlist 📳 Lista moderatori

👋 𝐔𝐓𝐄𝐍𝐓𝐈
➤ ${usedPrefix}kick ⚔️ Espelle utente
➤ ${usedPrefix}nuke 🚨 Nuke fake
➤ ${usedPrefix}resucita 🔮 Torna come prima

🔗 𝐋𝐈𝐍𝐊
➤ ${usedPrefix}link 🔗 Link gruppo
➤ ${usedPrefix}prendilink 🚨 Prende link dal qr

════════════════════
🔖 Versione: *1.0*
`.trim()
    };

    const sezioneAttuale = parseInt(args);
    const testo = sezioni[sezioneAttuale];

    if (!testo) return;

    let buttons = [];

    if (sezioneAttuale < 3) {
        buttons.push({
            buttonId: `${usedPrefix}admin ${sezioneAttuale + 1}`,
            buttonText: { displayText: "➡️ Prossima Sezione" },
            type: 1
        });
    }

    if (sezioneAttuale > 1) {
        buttons.push({
            buttonId: `${usedPrefix}admin ${sezioneAttuale - 1}`,
            buttonText: { displayText: "⬅️ Sezione Precedente" },
            type: 1
        });
    }

    await conn.sendMessage(message.chat, {
        text: testo,
        footer: "MENU ADMIN",
        buttons: buttons,
        headerType: 1
    });
};

handler.help = ['admin'];
handler.tags = ['menu'];
handler.command = /^(admin)(\s\d+)?$/i;

export default handler;