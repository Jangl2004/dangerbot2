// IA OFFLINE (senza API) — Assistente serio con sarcasmo leggero
// Comandi: .1 ia (on) | .0 ia (off)
// Risponde SOLO se taggato o se reply a un suo messaggio.

const COOLDOWN_MS = 2500
const MAX_HISTORY = 14
const SARCASM_RATE = 0.18 // 18% delle volte una battuta leggera

let handler = async (m, { conn, command, args }) => {
  if (!m.isGroup) return

  initStore()

  // toggle solo con ".1 ia" e ".0 ia"
  if ((args?.[0] || "").toLowerCase() !== "ia") return

  const on = command === "1"
  global.db.data.iaOffline.enabled[m.chat] = on

  return conn.reply(
    m.chat,
    on ? "🤖 IA offline attivata nel gruppo." : "🛑 IA offline disattivata.",
    m
  )
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message || m.isBaileys || m.fromMe || !m.isGroup) return

    initStore()
    if (!global.db.data.iaOffline.enabled[m.chat]) return

    const textRaw = (m.text || "").trim()
    if (!textRaw) return

    const botJid = conn.user?.jid
    if (!botJid) return

    // Risponde solo se menzionato o se reply a un suo messaggio
    const mentionedBot = getMentionedJids(m).includes(botJid)
    const repliedBot = isReplyToBot(m, botJid)
    if (!mentionedBot && !repliedBot) {
      // comunque salva contesto “silenzioso” per memoria (facoltativo)
      pushHistory(m.chat, { from: m.sender, text: textRaw, at: Date.now() }, false)
      return
    }

    // cooldown antispam per chat
    const now = Date.now()
    const last = global.db.data.iaOffline.cooldown[m.chat] || 0
    if (now - last < COOLDOWN_MS) return
    global.db.data.iaOffline.cooldown[m.chat] = now

    // salva contesto
    pushHistory(m.chat, { from: m.sender, text: textRaw, at: now }, true)

    const ctx = buildContext(m.chat, m.sender)
    const reply = generateReply(textRaw, ctx)

    await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
  } catch (e) {
    console.error("IA OFFLINE error:", e)
  }
}

function initStore() {
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.iaOffline) {
    global.db.data.iaOffline = {
      enabled: {},
      cooldown: {},
      history: {},   // { chatId: [ {from,text,at,isDirect} ] }
      users: {}      // { jid: { lastSeen, toneScore } }
    }
  }
}

function pushHistory(chatId, item, isDirect) {
  const store = global.db.data.iaOffline.history
  if (!store[chatId]) store[chatId] = []
  store[chatId].push({ ...item, isDirect: !!isDirect })
  if (store[chatId].length > MAX_HISTORY) {
    store[chatId].splice(0, store[chatId].length - MAX_HISTORY)
  }

  // user profile lightweight
  const users = global.db.data.iaOffline.users
  if (!users[item.from]) users[item.from] = { lastSeen: Date.now(), toneScore: 0 }
  users[item.from].lastSeen = Date.now()
  users[item.from].toneScore = clamp(users[item.from].toneScore + estimateTone(item.text), -5, 5)
}

function buildContext(chatId, senderJid) {
  const arr = global.db.data.iaOffline.history[chatId] || []
  const last = arr[arr.length - 1]
  const last5 = arr.slice(-5).map(x => x.text)

  const u = global.db.data.iaOffline.users[senderJid] || { toneScore: 0 }
  return {
    lastMessage: last?.text || "",
    last5,
    toneScore: u.toneScore,
  }
}

function generateReply(textRaw, ctx) {
  const text = textRaw.toLowerCase()
  const intent = detectIntent(text)

  const sarcasm = Math.random() < SARCASM_RATE
  const softSarcasm = sarcasm ? pick([
    " (Sì, sto lavorando anche di notte 😅)",
    " (Ok, niente panico.)",
    " (Prometto che non giudico… troppo.)",
    " (Domanda lecita.)"
  ]) : ""

  // Presentazione
  if (/(chi sei|presentati|come ti chiami|che sei)/i.test(text)) {
    return `Ciao 👋 sono *${global.db.data.nomedelbot || "DANGER BOT"}*.\n` +
      `Modalità: assistente (con un pizzico di sarcasmo controllato).\n` +
      `Taggami o rispondimi e dimmi cosa ti serve.${softSarcasm}`
  }

  if (intent === "greet") {
    return pick([
      "Ciao! Dimmi pure 🙂",
      "Eccomi. Come posso aiutarti?",
      "Ciao 👋 di cosa hai bisogno?"
    ]) + softSarcasm
  }

  if (intent === "thanks") {
    return pick([
      "Prego 🙂",
      "Di nulla. Se serve altro sono qui.",
      "Sempre disponibile."
    ]) + (sarcasm ? " (Ogni tanto.)" : "")
  }

  if (intent === "help") {
    return `Va bene. Scrivimi in *1 frase* cosa vuoi ottenere.\n` +
      `Esempio: “Voglio un plugin che …” oppure “Mi dà errore X quando …”.${softSarcasm}`
  }

  if (intent === "error") {
    return `Ok, sembra un errore.\n` +
      `Incollami qui:\n` +
      `1) la riga dell’errore\n` +
      `2) cosa stavi facendo subito prima\n` +
      `3) che comando hai usato\n` +
      `Così ti dico dove mettere le mani.${softSarcasm}`
  }

  if (intent === "howto") {
    // risposta “assistente”: chiarisco + mini checklist
    const topic = extractTopic(textRaw)
    return `Capito. Tema: *${topic || "non chiarissimo"}*.\n` +
      `Per aiutarti bene mi servono 2 cose:\n` +
      `• che bot/base usi\n` +
      `• cosa vuoi ottenere (esempio pratico)\n` +
      `Poi ti do i passaggi precisi.${softSarcasm}`
  }

  if (intent === "question") {
    const topic = extractTopic(textRaw)
    return `Domanda ricevuta.\n` +
      `🎯 Argomento: *${topic || "generico"}*\n` +
      `Vuoi una risposta *veloce* o *fatta bene con passaggi*?${softSarcasm}`
  }

  if (intent === "insult") {
    // serio ma con sarcasmo minimo
    return pick([
      "Ok. Se vuoi aiuto, abbassiamo i toni e ripartiamo 🙂",
      "Capito. Ora dimmi cosa ti serve davvero.",
      "Se scarichi la frustrazione su di me non cambia l’errore… però possiamo risolverlo 😅"
    ])
  }

  // fallback “smart”: usa contesto
  const prev = ctx.last5?.filter(Boolean).slice(-2).join(" | ")
  return `Ho capito.\n` +
    `Dimmi solo *che risultato vuoi* (1 riga).\n` +
    `${prev ? `Contesto recente: “${truncate(prev, 90)}”.\n` : ""}` +
    `Poi ti guido passo passo.${softSarcasm}`.trim()
}

function detectIntent(t) {
  if (/\b(ciao|salve|buongiorno|buonasera|yo|hola)\b/i.test(t)) return "greet"
  if (/\b(grazie|thx|ty)\b/i.test(t)) return "thanks"
  if (/(aiuto|aiutami|help|mi serve)/i.test(t)) return "help"
  if (/(errore|error|crash|stack|trace|non va|non funziona)/i.test(t)) return "error"
  if (/(come faccio|come si|come devo|tutorial|passo passo)/i.test(t)) return "howto"
  if (/\?/.test(t) || /(perché|come mai|cos'è|che significa)/i.test(t)) return "question"
  if (/(scemo|stupido|idiota|cretino|vaff|merda)/i.test(t)) return "insult"
  return "other"
}

function getMentionedJids(m) {
  const a = m.mentionedJid || []
  const b = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  return [...new Set([...a, ...b])]
}

function isReplyToBot(m, botJid) {
  return !!(m.quoted && m.quoted.sender && m.quoted.sender === botJid)
}

function estimateTone(text) {
  const t = (text || "").toLowerCase()
  let score = 0
  if (/(grazie|per favore|pls|gentilmente)/i.test(t)) score += 1
  if (/(scemo|stupido|idiota|vaff|merda)/i.test(t)) score -= 2
  if (t.length > 120) score += 0.3
  return score
}

function extractTopic(s) {
  if (!s) return ""
  let t = s.replace(/@\d+/g, "").replace(/^(\.|!|\/)\S+\s*/g, "").trim()
  if (!t) return ""
  const words = t.split(/\s+/).filter(Boolean)
  return truncate(words.slice(-6).join(" "), 48)
}

function truncate(s, n) {
  if (!s) return ""
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x))
}

handler.help = ["1 ia", "0 ia"]
handler.tags = ["group"]
handler.command = /^(1|0)$/i
handler.group = true

export default handler
