// Plugin fatto da Luxifer 

let handler = async () => {}

// ✅ Presentazione quando il bot viene menzionato + keyword
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

    const prefix = getPrefix(textRaw) || "."

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

    await sendIntro(conn, m.chat, prefix, m)

  } catch (e) {
    console.error("Errore presentazione:", e)
  }
}

// ✅ Presentazione automatica quando il bot entra nel gruppo
handler.groupParticipantsUpdate = async function (update, { conn }) {
  try {
    const botJid = conn.user?.jid
    if (!botJid) return

    // update: { id, participants, action }
    if (update.action !== "add") return

    const added = update.participants || []
    const botJustAdded = added.includes(botJid)
    if (!botJustAdded) return

    const prefix = "." // qui puoi fissarlo oppure recuperarlo dal DB se lo gestisci lì

    // non hai un messaggio "m" da quotare, quindi niente quoted
    await sendIntro(conn, update.id, prefix, null)

  } catch (e) {
    console.error("Errore auto-presentazione:", e)
  }
}

// 🔁 Funzione riutilizzabile per mandare la presentazione
async function sendIntro(conn, chatId, prefix, quotedMsg) {
  const botName = global.db?.data?.nomedelbot || "DANGER BOT"

  const introText = `
⟦ 𝐈𝐍𝐅𝐎 𝐁𝐎𝐓 ⟧

👋 Ciao! Sono *${botName}* 🤖
Sono un bot per gruppi WhatsApp: offro una maggiore sicurezza al gruppo e a intrattenere la chat

📌 Premi il bottone sotto e ti fornirò tutti i miei comandi.
`.trim()

  const payload = {
    text: introText,
    footer: "PRESENTAZIONE BOT",
    buttons: [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 },
    ],
    headerType: 1
  }

  // quoted solo se esiste
  if (quotedMsg) {
    await conn.sendMessage(chatId, payload, { quoted: quotedMsg })
  } else {
    await conn.sendMessage(chatId, payload)
  }
}

function getPrefix(text) {
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
