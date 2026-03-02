// Plugin fatto da Luxifer   
let handler = async () => {}

handler.before = async function (m, { conn }) {
  try {
    if (!m) return
    if (!m.isGroup) return

    const botJidRaw = conn.user?.jid
    if (!botJidRaw) return
    const decode = conn.decodeJid ? conn.decodeJid.bind(conn) : (j) => j

    const chatId = m.chat
    const prefixDefault = "."

    // =========================
    // 0) AUTO-INTRO al primo messaggio visto nel gruppo (non serve admin)
    // =========================
    // usa un flag per gruppo: se non esiste, lo creiamo
    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.groupIntro = global.db.data.groupIntro || {}

    // se non ho ancora fatto la presentazione in questo gruppo
    if (!global.db.data.groupIntro[chatId]) {
      // aspetta un messaggio "normale" (non di sistema), per evitare falsi trigger
      if (m.message && !m.isBaileys && !m.fromMe) {
        global.db.data.groupIntro[chatId] = true
        await sendIntro(conn, chatId, prefixDefault, m)
        return
      }
    }

    // =========================
    // 1) Presentazione su menzione + keyword (come già avevi)
    // =========================
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return

    const textRaw = (m.text || "").trim()
    if (!textRaw) return

    const prefix = getPrefix(textRaw) || prefixDefault

    const botJid = decode(botJidRaw)
    const mentioned = getMentionedJids(m).map(decode)
    if (!mentioned.includes(botJid)) return

    const text = textRaw.toLowerCase()
    const wantIntro =
      text.includes("presentati") ||
      text.includes("chi sei") ||
      text.includes("info") ||
      text.includes("funzioni") ||
      text.includes("comandi")

    if (!wantIntro) return

    await sendIntro(conn, chatId, prefix, m)

  } catch (e) {
    console.error("Errore presentazione:", e)
  }
}

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

  if (quotedMsg) await conn.sendMessage(chatId, payload, { quoted: quotedMsg })
  else await conn.sendMessage(chatId, payload)
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
