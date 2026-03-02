import OpenAI from "openai"
import dotenv from "dotenv"

dotenv.config()

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const COOLDOWN = 2500
const MAX_HISTORY = 10

function ensureStore() {
  if (!global.db.data.aiReal) {
    global.db.data.aiReal = {
      enabled: {},
      history: {},
      cooldown: {}
    }
  }
}

function pushHistory(chat, role, content) {
  ensureStore()
  if (!global.db.data.aiReal.history[chat])
    global.db.data.aiReal.history[chat] = []

  global.db.data.aiReal.history[chat].push({
    role,
    content: String(content).slice(0, 1200)
  })

  const h = global.db.data.aiReal.history[chat]
  if (h.length > MAX_HISTORY)
    h.splice(0, h.length - MAX_HISTORY)
}

function getHistory(chat) {
  ensureStore()
  return global.db.data.aiReal.history[chat] || []
}

let handler = async () => {}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return
    if (!m.isGroup) return

    ensureStore()

    const text = (m.text || "").trim()
    if (!text) return

    // 🔥 Attivazione .1 ia / .0 ia
    if (/^\.(1|0)\s+ia$/i.test(text)) {
      const on = text.startsWith(".1")
      global.db.data.aiReal.enabled[m.chat] = on
      return conn.reply(
        m.chat,
        on
          ? "🤖 IA attivata nel gruppo."
          : "🛑 IA disattivata.",
        m
      )
    }

    if (!global.db.data.aiReal.enabled[m.chat]) return

    const botJid = conn.user.jid
    const mentioned = m.mentionedJid || []
    const isMentioned = mentioned.includes(botJid)

    const isReplyToBot =
      m.quoted &&
      m.quoted.sender === botJid

    if (!isMentioned && !isReplyToBot) return

    const now = Date.now()
    const last = global.db.data.aiReal.cooldown[m.chat] || 0
    if (now - last < COOLDOWN) return

    global.db.data.aiReal.cooldown[m.chat] = now

    pushHistory(m.chat, "user", text)

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "Sei DANGER BOT su WhatsApp. Intelligente ma sarcastico. Risposte brevi e brillanti."
        },
        ...getHistory(m.chat)
      ],
      max_output_tokens: 200
    })

    const reply = response.output_text || "Hmm... riprova."

    pushHistory(m.chat, "assistant", reply)

    await conn.reply(m.chat, reply.trim(), m)

  } catch (e) {
    console.error("AI ERROR:", e)
    conn.reply(m.chat, "❌ Errore IA. Controlla VPS.", m)
  }
}

export default handler
