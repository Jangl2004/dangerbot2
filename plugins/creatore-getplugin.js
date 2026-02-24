import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, text, isOwner }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      '📦 Usa:\n.pl <nome-plugin>\n\nEsempio:\n.getpl info-ping.js',
      m
    )
  }

  // se vuoi SOLO owner, lascia questo
  if (!isOwner) {
    return conn.reply(m.chat, '🔒 Solo il creatore può usare questo comando', m)
  }

  let pluginName = text.endsWith('.js') ? text : text + '.js'
  let pluginPath = path.join(__dirname, pluginName)

  if (!fs.existsSync(pluginPath)) {
    return conn.reply(m.chat, `❌ Plugin *${pluginName}* non trovato`, m)
  }

  let code = fs.readFileSync(pluginPath, 'utf-8')

  // limite messaggio WhatsApp (~65k)
  if (code.length > 60000) {
    return conn.reply(
      m.chat,
      '⚠️ Plugin troppo grande per essere inviato in un solo messaggio',
      m
    )
  }

  let msg = `
📦 *PLUGIN:* ${pluginName}

${code}
`.trim()

  await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
}

handler.help = ['pl']
handler.tags = ['tools']
handler.command = /^getpl$/i
handler.owner = true 

export default handler
