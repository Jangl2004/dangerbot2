const handler = async (message, { conn, usedPrefix = '.' }) => {

    const userCount = Object.keys(global.db?.data?.users || {}).length;

    const header = `
🩸 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓 *MENU GIOCHI* 🩸
════════════════════
👥 Utenti registrati: *${userCount}*
════════════════════
`.trim();

    const sezione1 = `
🎮 𝐆𝐀𝐌𝐄 𝐌𝐄𝐓𝐑𝐈𝐂𝐈 & DIVERTIMENTO (1)
➤ ${usedPrefix}bellometro 🥰
➤ ${usedPrefix}gaymetro 🌈
➤ ${usedPrefix}lesbiometro 💖
➤ ${usedPrefix}masturbometro 🍆
➤ ${usedPrefix}fortunometro 🍀
➤ ${usedPrefix}intelligiometro 🧠
➤ ${usedPrefix}sborra 💦
➤ ${usedPrefix}il 🤔
➤ ${usedPrefix}wasted 🕴🏻
➤ ${usedPrefix}comunista 💂🏻
➤ ${usedPrefix}bisex 👙
➤ ${usedPrefix}gay 🏳️‍🌈
➤ ${usedPrefix}simpcard 🃏
➤ ${usedPrefix}trans 🏳️‍⚧️
➤ ${usedPrefix}tris ❌⭕
➤ ${usedPrefix}meme 🤣
`.trim();

    const sezione2 = `
🎮 𝐆𝐀𝐌𝐄 𝐌𝐄𝐓𝐑𝐈𝐂𝐈 & DIVERTIMENTO (2)
➤ ${usedPrefix}cibo 🍣 
➤ ${usedPrefix}bandiera 🚩
➤ ${usedPrefix}classificabandiera 🏆
➤ ${usedPrefix}impiccato 🪢
➤ ${usedPrefix}s / sticker 🏷️
➤ ${usedPrefix}wm 🔮
➤ ${usedPrefix}cur 🎶
➤ ${usedPrefix}sposa 👰🏻
➤ ${usedPrefix}divorzia 💔
➤ ${usedPrefix}amante 🫂
➤ ${usedPrefix}adotta 👶🏻
➤ ${usedPrefix}famiglia 🧑‍🧑‍🧒‍🧒
➤ ${usedPrefix}toglifiglio 👣
➤ ${usedPrefix}togliamante 💔
════════════════════
`.trim();

    // Invia messaggi separati
    await conn.sendMessage(message.chat, { text: header });
    await conn.sendMessage(message.chat, { text: sezione1 });
    await conn.sendMessage(message.chat, { text: sezione2 });
};

handler.help = ['menugiochi'];
handler.tags = ['menu'];
handler.command = /^(menugiochi|giochi)$/i;

export default handler;