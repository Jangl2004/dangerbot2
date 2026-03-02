import OpenAI from "openai"
import dotenv from "dotenv"
dotenv.config()

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const COOLDOWN_MS = 2500
const MAX_HISTORY = 12

function ensureStore() {
  if (!global.db.data.aiReal) {
    global.db.data.aiReal = {
      enabled: {},    // { chatId: true/false }
      history: {},    // { chatId: [{role, content}] }
      cooldown: {}    // { chatId: timestamp }
    }
  }
}

function pushHistory(chat, role, content) {
  ensureStore()
  if (!global.db.data.aiReal.history[chat]) global.db.data.aiReal.history[chat] = []
  global.db.data.aiReal.history[chat].push({
    role,
    content: String(content || "").slice(0, 1500)
  })
  const h = global.db.data.aiReal.history[chat]
  if (h.length > MAX_HISTORY) h.splice(0, h.length - MAX_HISTORY)
}

function getHistory(chat) {
  ensureStore()
  return global.db.data.aiReal.history[chat] || []
}

// ✅ Legge menzioni in modo robusto (m.mentionedJid + contextInfo.mentionedJid)
function getMentionedJids(m) {
  const a = m.mentionedJid || []
  const b =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    m.message?.conversation?.contextInfo?.mentionedJid ||
    []
  return [...new Set([...a, ...b])]
}

function isReplyToBot(m, botJid) {
  const q = m.quoted
  return !!(q && q.sender && q.sender === botJid)
}

async function askAI(chatId, userText) {
  const messages = [
    {
      role: "system",
      content:
        "Sei DANGER BOT su WhatsApp: intelligente ma sarcastico (non tossico). " +
        "Risposte brevi (max 5 righe). Se manca contesto, fai 1 domanda di chiarimento."
    },
    ...getHistory(chatId),
    { role: "user", content: userText }
  ]

  // ✅ Chat Completions = compatibile al 99% con tutte le versioni
  const out = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 220
  })

  return (out.choices?.[0]?.message?.content || "").trim()
}

/**
 * ✅ COMANDI REALI: .1 ia / .0 ia
 * Così il bot non li considera "sconosciuti" => niente doppio messaggio.
 */
let handler = async (m, { conn, command, args }) => {
  if (!m.isGroup) return

  ensureStore()

  // Funzionano SOLO se scrivi: ".1 ia" o ".0 ia"
  if ((args?.[0] || "").toLowerCase() !== "ia") return

  const on = command === "1"
  global.db.data.aiReal.enabled[m.chat] = on

  return conn.reply(
    m.chat,
    on ? "🤖 IA attivata nel gruppo." : "🛑 IA disattivata nel gruppo.",
    m
  )
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return
    if (!m.isGroup) return

    ensureStore()
    if (!global.db.data.aiReal.enabled[m.chat]) return

    const text = (m.text || "").trim()
    if (!text) return

    const botJid = conn.user?.jid
    const mentioned = getMentionedJids(m)
    const mentionedBot = botJid && mentioned.includes(botJid)
    const repliedBot = botJid && isReplyToBot(m, botJid)

    // Risponde SOLO se taggato o se reply a un suo messaggio
    if (!mentionedBot && !repliedBot) return

    // Anti spam
    const now = Date.now()
    const last = global.db.data.aiReal.cooldown[m.chat] || 0
    if (now - last < COOLDOWN_MS) return
    global.db.data.aiReal.cooldown[m.chat] = now

    pushHistory(m.chat, "user", text)
    const reply = await askAI(m.chat, text)
    const finalReply = reply || "Dimmi meglio cosa vuoi, che oggi sono in modalità selettiva 😌"

    pushHistory(m.chat, "assistant", finalReply)
    await conn.sendMessage(m.chat, { text: finalReply }, { quoted: m })
  } catch (e) {
    console.error("AI REAL error:", e)
    try {
      await conn.reply(m.chat, "❌ Errore IA. Guarda i log del VPS.", m)
    } catch {}
  }
}

handler.help = ["1 ia", "0 ia"]
handler.tags = ["group"]
handler.command = /^(1|0)$/i
handler.group = true

export default handler
