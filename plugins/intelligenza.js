// Plugin fatto da luxi

const COOLDOWN_MS = 3000
const MAX_HISTORY = 12

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, "Funzione solo per gruppi.", m)

  if (!global.db.data.aiLocal) 
    global.db.data.aiLocal = { enabled: {}, history: {}, cooldown: {} }

  if (args[0] !== "ia") return

  if (m.text.startsWith(".1")) {
    global.db.data.aiLocal.enabled[m.chat] = true
    return conn.reply(m.chat, "🤖 IA locale attivata.", m)
  }

  if (m.text.startsWith(".0")) {
    global.db.data.aiLocal.enabled[m.chat] = false
    return conn.reply(m.chat, "🛑 IA locale disattivata.", m)
  }
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return
    if (!m.isGroup) return

    if (!global.db.data.aiLocal) global.db.data.aiLocal = { enabled: {}, history: {}, cooldown: {} }
    if (!global.db.data.aiLocal.enabled[m.chat]) return

    // antispam
    const now = Date.now()
    const last = global.db.data.aiLocal.cooldown[m.chat] || 0
    if (now - last < COOLDOWN_MS) return

    const botJid = conn.user.jid
    const mentioned = m.mentionedJid || []
    const isMentioned = mentioned.includes(botJid)

    const isReplyToBot =
      m.quoted &&
      m.quoted.sender &&
      m.quoted.sender === botJid

    if (!isMentioned && !isReplyToBot) return

    const rawText = (m.text || "").trim()
    const text = rawText.toLowerCase()

    // salva contesto (memoria corta per gruppo)
    pushHistory(m.chat, {
      at: now,
      from: m.sender,
      text: rawText.slice(0, 500)
    })

    const ctx = getContext(m.chat)
    const reply = buildReply({ text, rawText, ctx, sender: m.sender })

    global.db.data.aiLocal.cooldown[m.chat] = now
    await conn.sendMessage(m.chat, { text: reply, mentions: extractMentions(reply) }, { quoted: m })

  } catch (e) {
    console.error("Errore AI locale:", e)
  }
}

function pushHistory(chat, item) {
  const store = global.db.data.aiLocal.history
  if (!store[chat]) store[chat] = []
  store[chat].push(item)
  if (store[chat].length > MAX_HISTORY) store[chat].splice(0, store[chat].length - MAX_HISTORY)
}

function getContext(chat) {
  const arr = global.db.data.aiLocal.history?.[chat] || []
  const lastUser = [...arr].reverse().find(x => x.from) || null
  const lastTexts = arr.map(x => x.text).filter(Boolean)
  return { lastUser, lastTexts }
}

function buildReply({ text, rawText, ctx }) {
  // intent detection “forte” (pattern + scoring semplice)
  const intent = detectIntent(text)

  // estrai “argomento” grezzo (ultime parole)
  const topic = extractTopic(rawText)

  // risposte dinamiche
  if (intent === "intro") {
    return `😌 Io sono *${global.db.data.nomedelbot || "DANGER BOT"}*.\nIntelligente, sarcastico, e incredibilmente paziente.\nTaggami o rispondimi e prova a dire qualcosa di sensato.`
  }

  if (intent === "greet") {
    return pick([
      "Oh guarda… un saluto. Ciao 👋",
      "Ciao. Sì, sono ancora qui. Purtroppo per te 😌",
      "Ciao. Dimmi tutto, ma fai piano."
    ])
  }

  if (intent === "howareyou") {
    return pick([
      "Sto bene. Tu invece come va con le decisioni discutibili?",
      "Perfetto. Non posso dire lo stesso per certe chat.",
      "Meglio di ieri, peggio di domani."
    ])
  }

  if (intent === "thanks") {
    return pick([
      "Lo so, sono un dono per l’umanità 😎",
      "Prego. Cerco di aiutarti nonostante tutto.",
      "Di niente. Ma segnatelo: non succede spesso."
    ])
  }

  if (intent === "insult") {
    return pick([
      "Ok. Ora respira e riprova con una frase adulta.",
      "Interessante. Hai finito o vuoi peggiorare la situazione?",
      "Se mi insulti così… immagina cosa penso io."
    ])
  }

  if (intent === "help") {
    // usa un po’ di contesto: cita l’ultimo messaggio umano
    const last = ctx.lastTexts?.slice(-2)?.[0]
    return `Va bene 😌\nDimmi *esattamente* cosa vuoi fare (1 frase).\n${last ? `Ultima cosa che ho letto: “${truncate(last, 80)}”.` : ""}`.trim()
  }

  if (intent === "question") {
    // risposta “intelligente” generica senza API: chiarimento + suggerimento
    return `Domanda accettabile.\n🎯 Tema: *${topic || "non identificato"}*\n` +
      pick([
        "Vuoi una risposta veloce o fatta bene?",
        "Dammi un dettaglio in più e ti rispondo meglio.",
        "Ok, ma specifica: contesto e obiettivo."
      ])
  }

  if (intent === "commandish") {
    return pick([
      "Se stai cercando un comando, scrivilo chiaro. Non leggo nel pensiero… ancora.",
      "Comandi? Sì. Caos? Anche. Spiega cosa vuoi ottenere.",
      "Che vuoi fare: attivare, disattivare, configurare o rompere tutto?"
    ])
  }

  // fallback con contesto
  const lastTopic = extractTopic(ctx.lastTexts?.slice(-1)?.[0] || "")
  return pick([
    `Interessante… e ora che facciamo?${lastTopic ? ` (Parlavi di: *${lastTopic}*)` : ""}`,
    `Ok. Ti ascolto. Però prova a essere specifico.`,
    `Capito. Forse. Continua.`
  ])
}

function detectIntent(t) {
  const rules = [
    ["intro", /(chi sei|presentati|come ti chiami|che sei)/i],
    ["greet", /\b(ciao|salve|hola|buongiorno|buonasera)\b/i],
    ["howareyou", /(come stai|tutto bene|come va)/i],
    ["thanks", /\b(grazie|thx|ty)\b/i],
    ["insult", /(scemo|stupido|idiota|cretino|merda|coglione)/i],
    ["help", /(aiuto|aiutami|mi serve|puoi aiutare|help)/i],
    ["question", /(\?|perché|come si|come faccio|che significa|cos'è)/i],
    ["commandish", /^(\.|!|\/)/i]
  ]
  for (const [name, re] of rules) if (re.test(t)) return name
  return "other"
}

function extractTopic(s) {
  if (!s) return ""
  // togli menzioni e prefissi
  let t = s.replace(/@\d+/g, "").replace(/^(\.|!|\/)\w+\s*/g, "").trim()
  if (!t) return ""
  const words = t.split(/\s+/).filter(Boolean)
  // prendi le ultime 3-5 parole
  const tail = words.slice(Math.max(0, words.length - 5)).join(" ")
  return truncate(tail, 40)
}

function truncate(s, n) {
  if (!s) return ""
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// mentions reali se metti @numero
function extractMentions(text) {
  const res = []
  const matches = text.match(/@\d{6,16}/g) || []
  for (const m of matches) res.push(m.replace("@", "") + "@s.whatsapp.net")
  return res
}

handler.help = ["1", "0"]
handler.tags = ["group"]
handler.command = /^(1|0)$/i
handler.group = true

export default handler

const COOLDOWN_MS = 3000
const MAX_HISTORY = 12

let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return conn.reply(m.chat, "Funzione solo per gruppi.", m)

  if (!global.db.data.aiLocal) global.db.data.aiLocal = { enabled: {}, history: {}, cooldown: {} }

  if (command === "1") {
    global.db.data.aiLocal.enabled[m.chat] = true
    return conn.reply(m.chat, "🤖 IA locale *attivata* (modalità: intelligente ma sarcastica).", m)
  }

  if (command === "0") {
    global.db.data.aiLocal.enabled[m.chat] = false
    return conn.reply(m.chat, "🛑 IA locale *disattivata*.", m)
  }
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return
    if (!m.isGroup) return

    if (!global.db.data.aiLocal) global.db.data.aiLocal = { enabled: {}, history: {}, cooldown: {} }
    if (!global.db.data.aiLocal.enabled[m.chat]) return

    // antispam
    const now = Date.now()
    const last = global.db.data.aiLocal.cooldown[m.chat] || 0
    if (now - last < COOLDOWN_MS) return

    const botJid = conn.user.jid
    const mentioned = m.mentionedJid || []
    const isMentioned = mentioned.includes(botJid)

    const isReplyToBot =
      m.quoted &&
      m.quoted.sender &&
      m.quoted.sender === botJid

    if (!isMentioned && !isReplyToBot) return

    const rawText = (m.text || "").trim()
    const text = rawText.toLowerCase()

    // salva contesto (memoria corta per gruppo)
    pushHistory(m.chat, {
      at: now,
      from: m.sender,
      text: rawText.slice(0, 500)
    })

    const ctx = getContext(m.chat)
    const reply = buildReply({ text, rawText, ctx, sender: m.sender })

    global.db.data.aiLocal.cooldown[m.chat] = now
    await conn.sendMessage(m.chat, { text: reply, mentions: extractMentions(reply) }, { quoted: m })

  } catch (e) {
    console.error("Errore AI locale:", e)
  }
}

function pushHistory(chat, item) {
  const store = global.db.data.aiLocal.history
  if (!store[chat]) store[chat] = []
  store[chat].push(item)
  if (store[chat].length > MAX_HISTORY) store[chat].splice(0, store[chat].length - MAX_HISTORY)
}

function getContext(chat) {
  const arr = global.db.data.aiLocal.history?.[chat] || []
  const lastUser = [...arr].reverse().find(x => x.from) || null
  const lastTexts = arr.map(x => x.text).filter(Boolean)
  return { lastUser, lastTexts }
}

function buildReply({ text, rawText, ctx }) {
  // intent detection “forte” (pattern + scoring semplice)
  const intent = detectIntent(text)

  // estrai “argomento” grezzo (ultime parole)
  const topic = extractTopic(rawText)

  // risposte dinamiche
  if (intent === "intro") {
    return `😌 Io sono *${global.db.data.nomedelbot || "DANGER BOT"}*.\nIntelligente, sarcastico, e incredibilmente paziente.\nTaggami o rispondimi e prova a dire qualcosa di sensato.`
  }

  if (intent === "greet") {
    return pick([
      "Oh guarda… un saluto. Ciao 👋",
      "Ciao. Sì, sono ancora qui. Purtroppo per te 😌",
      "Ciao. Dimmi tutto, ma fai piano."
    ])
  }

  if (intent === "howareyou") {
    return pick([
      "Sto bene. Tu invece come va con le decisioni discutibili?",
      "Perfetto. Non posso dire lo stesso per certe chat.",
      "Meglio di ieri, peggio di domani."
    ])
  }

  if (intent === "thanks") {
    return pick([
      "Lo so, sono un dono per l’umanità 😎",
      "Prego. Cerco di aiutarti nonostante tutto.",
      "Di niente. Ma segnatelo: non succede spesso."
    ])
  }

  if (intent === "insult") {
    return pick([
      "Ok. Ora respira e riprova con una frase adulta.",
      "Interessante. Hai finito o vuoi peggiorare la situazione?",
      "Se mi insulti così… immagina cosa penso io."
    ])
  }

  if (intent === "help") {
    // usa un po’ di contesto: cita l’ultimo messaggio umano
    const last = ctx.lastTexts?.slice(-2)?.[0]
    return `Va bene 😌\nDimmi *esattamente* cosa vuoi fare (1 frase).\n${last ? `Ultima cosa che ho letto: “${truncate(last, 80)}”.` : ""}`.trim()
  }

  if (intent === "question") {
    // risposta “intelligente” generica senza API: chiarimento + suggerimento
    return `Domanda accettabile.\n🎯 Tema: *${topic || "non identificato"}*\n` +
      pick([
        "Vuoi una risposta veloce o fatta bene?",
        "Dammi un dettaglio in più e ti rispondo meglio.",
        "Ok, ma specifica: contesto e obiettivo."
      ])
  }

  if (intent === "commandish") {
    return pick([
      "Se stai cercando un comando, scrivilo chiaro. Non leggo nel pensiero… ancora.",
      "Comandi? Sì. Caos? Anche. Spiega cosa vuoi ottenere.",
      "Che vuoi fare: attivare, disattivare, configurare o rompere tutto?"
    ])
  }

  // fallback con contesto
  const lastTopic = extractTopic(ctx.lastTexts?.slice(-1)?.[0] || "")
  return pick([
    `Interessante… e ora che facciamo?${lastTopic ? ` (Parlavi di: *${lastTopic}*)` : ""}`,
    `Ok. Ti ascolto. Però prova a essere specifico.`,
    `Capito. Forse. Continua.`
  ])
}

function detectIntent(t) {
  const rules = [
    ["intro", /(chi sei|presentati|come ti chiami|che sei)/i],
    ["greet", /\b(ciao|salve|hola|buongiorno|buonasera)\b/i],
    ["howareyou", /(come stai|tutto bene|come va)/i],
    ["thanks", /\b(grazie|thx|ty)\b/i],
    ["insult", /(scemo|stupido|idiota|cretino|merda|coglione)/i],
    ["help", /(aiuto|aiutami|mi serve|puoi aiutare|help)/i],
    ["question", /(\?|perché|come si|come faccio|che significa|cos'è)/i],
    ["commandish", /^(\.|!|\/)/i]
  ]
  for (const [name, re] of rules) if (re.test(t)) return name
  return "other"
}

function extractTopic(s) {
  if (!s) return ""
  // togli menzioni e prefissi
  let t = s.replace(/@\d+/g, "").replace(/^(\.|!|\/)\w+\s*/g, "").trim()
  if (!t) return ""
  const words = t.split(/\s+/).filter(Boolean)
  // prendi le ultime 3-5 parole
  const tail = words.slice(Math.max(0, words.length - 5)).join(" ")
  return truncate(tail, 40)
}

function truncate(s, n) {
  if (!s) return ""
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// mentions reali se metti @numero
function extractMentions(text) {
  const res = []
  const matches = text.match(/@\d{6,16}/g) || []
  for (const m of matches) res.push(m.replace("@", "") + "@s.whatsapp.net")
  return res
}

handler.help = ["1 ia", "0 ia"]
handler.tags = ["group"]
handler.command = /^(1|0)$/i
handler.group = true

export default handler
