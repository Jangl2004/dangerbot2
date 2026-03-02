// Presentazione bot (offline) - risponde solo se menzionato + "presentati"

let handler = async () => {}

handler.before = async function (m, { conn, usedPrefix }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return
    if (!m.isGroup) return

    const botJid = conn.user?.jid
    if (!botJid) return

    const textRaw = (m.text || "").trim()
    if (!textRaw) return

    // ✅ controlla se il bot è menzionato (robusto)
    const mentioned = getMentionedJids(m)
    const isMentioned = mentioned.includes(botJid)
    if (!isMentioned) return

    const text = textRaw.toLowerCase()

    // trigger
    const wantIntro =
      text.includes("presentati") ||
      text.includes("chi sei") ||
      text.includes("info") ||
      text.includes("funzioni") ||
      text.includes("comandi")

    if (!wantIntro) return

    const botName = global.db?.data?.nomedelbot || "DANGER BOT"

    // 🧠 QUI personalizzi le funzioni che vuoi mostrare
    const features = [
      "📡 *Ping/Stato bot* → `.ping`",
      "🏆 *Top messaggi giornaliero* → `.top`",
      "👋 *Welcome/Bye* (se lo hai)",
      "🛡️ *Anti-link / Anti-spam* (se lo hai)",
      "👑 *Comandi admin* (promote/demote, ecc.)",
      "🎛️ *Menu comandi* → `.menu`",
    ]

    const introText = `
👋 *Ciao!* Sono *${botName}* 🤖

Sono un bot per gruppi WhatsApp: moderazione, utility e comandi rapidi.
Se mi tagghi posso guidarti nei comandi.

✨ *Cosa so fare:*
${features.map(x => `• ${x}`).join("\n")}

🧭 *Suggerimento:*
Scrivi *.menu* per vedere tutto il pannello completo.

Vuoi che ti spieghi una funzione in particolare? 🙂
`.trim()

    // ✅ invio con bottoni (se la tua base li supporta)
    await conn.sendMessage(m.chat, {
      text: introText,
      footer: "INFO BOT",
      buttons: [
        { buttonId: usedPrefix + "menu", buttonText: { displayText: "📋 Menu" }, type: 1 },
        { buttonId: usedPrefix + "ping", buttonText: { displayText: "📡 Ping" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

  } catch (e) {
    console.error("Errore presentazione:", e)
  }
}

function getMentionedJids(m) {
  const a = m.mentionedJid || []
  const b = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  return [...new Set([...a, ...b])]
}

export default handler
