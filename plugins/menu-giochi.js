const handler = async (message, { conn, usedPrefix = '.' }) => {

    const userCount = Object.keys(global.db?.data?.users || {}).length;
    const args = message.text.split(' ')[1] || '1';

    const sezioni = {
        1: `
🩸 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓 *MENU GIOCHI* 🩸
════════════════════
👥 Utenti registrati: *${userCount}*
════════════════════

🎮 SEZIONE 1/3
➤ ${usedPrefix}bellometro 🥰
➤ ${usedPrefix}gaymetro 🌈
➤ ${usedPrefix}lesbiometro 💖
➤ ${usedPrefix}masturbometro 🍆
➤ ${usedPrefix}fortunometro 🍀
➤ ${usedPrefix}intelligiometro 🧠
➤ ${usedPrefix}sborra 💦
➤ ${usedPrefix}il ♥️
➤ ${usedPrefix}wasted 🕴🏻
`.trim(),

        2: `
🎮 SEZIONE 2/3
➤ ${usedPrefix}comunista 💂🏻
➤ ${usedPrefix}bisex 👙
➤ ${usedPrefix}gay 🏳️‍🌈
➤ ${usedPrefix}simpcard 🃏
➤ ${usedPrefix}trans 🏳️‍⚧️
➤ ${usedPrefix}tris ❌⭕
➤ ${usedPrefix}meme 🤣
➤ ${usedPrefix}cibo 🍣
➤ ${usedPrefix}bandiera 🚩
➤ ${usedPrefix}classificabandiera 🏆
`.trim(),

        3: `
🎮 SEZIONE 3/3
➤ ${usedPrefix}impiccato 🪢
➤ ${usedPrefix}random <reply/tag> 🔮
➤ ${usedPrefix}s / sticker 🏷️
➤ ${usedPrefix}wm 🔮
➤ ${usedPrefix}cur 🎶
➤ ${usedPrefix}onlyfans <nome> 🩵🤍
➤ ${usedPrefix}curriculum 💼
➤ ${usedPrefix}shop 🏬
➤ ${usedPrefix}sposa 👰🏻
➤ ${usedPrefix}divorzia 💔
➤ ${usedPrefix}amante 🫂
➤ ${usedPrefix}adotta 👶🏻
➤ ${usedPrefix}famiglia 🧑‍🧑‍🧒‍🧒
➤ ${usedPrefix}toglifiglio 👣
➤ ${usedPrefix}togliamante 💔
════════════════════
`.trim()
    };

    const sezioneAttuale = parseInt(args);
    const testo = sezioni[sezioneAttuale];

    if (!testo) return;

    let buttons = [];

    if (sezioneAttuale < 3) {
        buttons.push({
            buttonId: `${usedPrefix}giochi ${sezioneAttuale + 1}`,
            buttonText: { displayText: "➡️ Prossima Sezione" },
            type: 1
        });
    }

    if (sezioneAttuale > 1) {
        buttons.push({
            buttonId: `${usedPrefix}giochi ${sezioneAttuale - 1}`,
            buttonText: { displayText: "⬅️ Sezione Precedente" },
            type: 1
        });
    }

    await conn.sendMessage(message.chat, {
        text: testo,
        footer: "MENU GIOCHI",
        buttons: buttons,
        headerType: 1
    });
};

handler.help = ['menugiochi', 'giochi'];
handler.tags = ['menu'];
handler.command = /^(menugiochi|giochi)(\s\d+)?$/i;

export default handler;