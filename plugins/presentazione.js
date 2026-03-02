// Plugin fatto da Luxifer   
let handler = async () => {}

handler.before = async function (m, { conn }) {
  try {
    if (!m) return
    if (!m.isGroup) return

    const botJidRaw = conn.user?.jid
    if (!botJidRaw) return

    // ✅ normalizza jid (alcune basi hanno decodeJid)
    const decode = conn.decodeJid ? conn.decodeJid.bind(conn) : (j) => j
    const botJid = decode(botJidRaw)

    // =========================
    // 1) AUTO-PRESENTAZIONE: messaggi di sistema (stub)
    // =========================
    const stubType = m.messageStubType
    const stubParams = m.messageStubParameters || []

    // 🔎 DEBUG (lascia 1 minuto per vedere cosa arriva quando aggiungi qualcuno)
    // console.log("STUB DEBUG:", stubType, stubParams)

    // Tipi comuni: add/invite/join-by-link (variano)
    const isJoinStub = typeof stubType === "number" && stubParams.length > 0

    if (isJoinStub) {
      // stubParams spesso contiene i jid coinvolti
      const normalizedParams = stubParams.map(decode)

      if (normalizedParams.includes(botJid)) {
        const prefix = "."
        await sendIntro(conn, m.chat, prefix, null)
        return
      }
    }

    // ✅ ORA puoi filtrare Baileys senza rompere gli stub
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return

    // =========================
    // 2) PRESENTAZIONE su menzione + keyword (come avevi tu)
    // =========================
    const textRaw = (m.text || "").trim()
    if (!textRaw) return

    const prefix = getPrefix(textRaw) || "."
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

    await sendIntro(conn, m.chat, prefix, m)

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
