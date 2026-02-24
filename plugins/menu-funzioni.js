const handler = async (m, { conn, usedPrefix = '.' }) => {

  const chat = global.db.data.chats[m.chat] || {}
  const bot = global.db.data.settings[conn.user.jid] || {}

  const stato = (v) => v ? '🟢 ATTIVO' : '🔴 DISATTIVO'

  const menuText = `
☣️ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 – 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐋𝐎 𝐒𝐈𝐂𝐔𝐑𝐄𝐙𝐙𝐀 ☣️
════════════════════

⚙️ 𝐀𝐓𝐓𝐈𝐕𝐀𝐙𝐈𝐎𝐍𝐄 𝐌𝐎𝐃𝐔𝐋𝐈
➤ ${usedPrefix}1 <funzione> 🟢
➤ ${usedPrefix}0 <funzione> 🔴

════════════════════
🛡️ 𝐒𝐂𝐔𝐃𝐎 𝐏𝐑𝐎𝐓𝐄𝐙𝐈𝐎𝐍𝐄
➤ 🔗 AntiLink       → ${stato(chat.antiLink)}
➤ 🧱 AntiTrava      → ${stato(chat.antitrava)}
➤ 💣 AntiNuke       → ${stato(chat.antiNuke)}
➤ 🛑 AntiSpam       → ${stato(chat.antispam)}
➤ 🤖 AntiBot        → ${stato(chat.antiBot)}
➤ 📸 AntiInsta      → ${stato(chat.antiInsta)}
➤ ✈️ AntiTelegram   → ${stato(chat.antiTelegram)}
➤ 🎵 AntiTiktok     → ${stato(chat.antiTiktok)}
➤ 🏷️ AntiTag        → ${stato(chat.antiTag)}
➤ 🚫 AntiGore       → ${stato(chat.antigore)}
➤ 🔞 AntiPorno      → ${stato(chat.antiporno)}

════════════════════
🔒 𝐌𝐎𝐃𝐀𝐋𝐈𝐓À 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐋𝐎
➤ 🛡️ SoloAdmin      → ${stato(chat.modoadmin)}

════════════════════
📡 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐀𝐔𝐓𝐎𝐌𝐀𝐓𝐈𝐂𝐈
➤ 👋 Benvenuto      → ${stato(chat.welcome)}
➤ 🚪 Addio          → ${stato(chat.goodbye)}

════════════════════
👑 𝐋𝐈𝐕𝐄𝐋𝐋𝐎 𝐒𝐔𝐏𝐑𝐄𝐌𝐎
➤ 🔒 AntiPrivato    → ${stato(bot.antiprivato)}

════════════════════
⚠️ Sistema monitorato.
🔻 Livello sicurezza dinamico.
`.trim()

  const buttons = [
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🏠 Menu Principale' }, type: 1 },
    { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: '🛡 Menu Admin' }, type: 1 },
    { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: '👑 Menu Owner' }, type: 1 },
    { buttonId: `${usedPrefix}menumod`, buttonText: { displayText: '🫅🏻 Moderazione' }, type: 1 },
    { buttonId: `${usedPrefix}menugiochi`, buttonText: { displayText: '🎮 Giochi' }, type: 1 },
    { buttonId: `${usedPrefix}menuludopatici`, buttonText: { displayText: '📱 Area Digitale' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text: menuText,
    footer: '⚡ Danger Bot • Pannello Sicurezza',
    buttons,
    headerType: 1
  })
}

handler.help = ['menufunzioni']
handler.tags = ['menu']
handler.command = /^(menufunzioni)$/i

export default handler
