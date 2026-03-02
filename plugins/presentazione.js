// Plugin fatto da Luxifer

let handler = async () => {}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return
    if (!m.isGroup) return

    const botJid = conn.user?.jid
    if (!botJid) return

    const textRaw = (m.text || "").trim()
    if (!textRaw) return

    // ✅ prende il prefisso dal messaggio (di solito ".")
    const prefix = getPrefix(textRaw) || "."

    // ✅ menzione robusta
    const mentioned = getMentionedJids(m)
    const isMentioned = mentioned.includes(botJid)
    if (!isMentioned) return

    const text = textRaw.toLowerCase()
    const wantIntro =
      text.includes("presentati") ||
      text.includes("chi sei") ||
      text.includes("info") ||
      text.includes("funzioni") ||
      text.includes("comandi")

    if (!wantIntro) return

    const botName = global.db?.data?.nomedelbot || "DANGER BOT"

    // ✍️ Modifica qui le funzioni reali del tuo bot
    const features = [
      `📡 Ping/Stato: *${prefix}ping*`,
      `📋 Menu: *${prefix}menu*`,
      `🏆 Top giornaliero: *${prefix}top*`,
      `👑 Admin: *${prefix}promote* / *${prefix}demote*`,
      `🛡️ Moderazione: *${prefix}antilink*`
    ]

    const introText = `
⟦ 𝐈𝐍𝐅𝐎 𝐁𝐎𝐓 ⟧

👋 Ciao! Sono *${botName}* 🤖
Sono un bot per gruppi WhatsApp: utility, moderazione e comandi rapidi.

✨ *Cosa posso fare:*
${features.map(x => `• ${x}`).join("\n")}

📌 *Tip:* premi i bottoni sotto oppure scrivi i comandi a mano.
`.trim()

    await conn.sendMessage(m.chat, {
      text: introText,
      footer: "PRESENTAZIONE BOT",
      buttons: [
        { buttonId: `${prefix}menu`, buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 },
        { buttonId: `${prefix}ping`, buttonText: { displayText: "📡 𝐏𝐢𝐧𝐠" }, type: 1 },
        { buttonId: `${prefix}top`,  buttonText: { displayText: "🏆 𝐓𝐨𝐩 𝟓" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

  } catch (e) {
    console.error("Errore presentazione:", e)
  }
}

function getPrefix(text) {
  // prende il primo carattere se è un prefisso classico
  const c = (text || "")[0]
  if ([".", "!", "/", "#"].includes(c)) return c
  return null
}

function getMentionedJids(m) {
  const a = m.mentionedJid || []
  const b = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  return [...new Set([...a, ...b])]
}

export default handler
