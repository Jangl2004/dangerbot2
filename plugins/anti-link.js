
import { downloadContentFromMessage } from '@realvare/baileys'
import ffmpeg from 'fluent-ffmpeg'
import { createWriteStream, readFile } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { unlink } from 'fs/promises'
import Jimp from 'jimp'
import jsQR from 'jsqr'
import fetch from 'node-fetch'
import { FormData } from 'formdata-node'

const WHATSAPP_GROUP_REGEX = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
const WHATSAPP_CHANNEL_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i
const GENERAL_URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi

const SHORT_URL_DOMAINS = [
  'bit.ly','tinyurl.com','t.co','short.link','shorturl.at',
  'is.gd','v.gd','goo.gl','ow.ly','buff.ly','tiny.cc',
  'shorte.st','adf.ly','linktr.ee','rebrand.ly',
  'bitly.com','cutt.ly','short.io','links.new',
  'link.ly','ur.ly','shrinkme.io','clck.ru',
  'short.gy','lnk.to','sh.st','ouo.io','bc.vc',
  'adfoc.us','linkvertise.com','exe.io','linkbucks.com'
]

const SHORT_URL_REGEX = new RegExp(
  `https?:\\/\\/(?:www\\.)?(?:${SHORT_URL_DOMAINS.map(d => d.replace('.', '\\.')).join('|')})\\/[^\\s]*`,
  'gi'
)

function isWhatsAppLink(url) {
  return WHATSAPP_GROUP_REGEX.test(url) || WHATSAPP_CHANNEL_REGEX.test(url)
}

async function containsSuspiciousLink(text) {
  if (!text) return false
  if (isWhatsAppLink(text)) return true
  if (SHORT_URL_REGEX.test(text)) return true
  return false
}

function extractTextFromMessage(m) {
  return (
    m.text ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''
  ).trim()
}

async function handleViolation(conn, m, reason, isBotAdmin) {
  const username = m.sender.split('@')[0]

  const fullMessage = `
『 ⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 』
${reason}

🛡️ L'utente @${username} è stato rimosso.

⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓
`.trim()

  if (!isBotAdmin) {
    return conn.sendMessage(
      m.chat,
      {
        text: `
『 ⚠️ PERMESSI INSUFFICIENTI 』
Rendimi amministratore per eseguire il protocollo.

⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓
`.trim()
      },
      { quoted: m }
    )
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    await conn.sendMessage(m.chat, {
      text: fullMessage,
      mentions: [m.sender]
    })
  } catch {
    await conn.sendMessage(m.chat, {
      text: fullMessage,
      mentions: [m.sender]
    })
  }
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (!m.isGroup || isAdmin || isOwner || isROwner || m.fromMe) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiLink) return false

  try {
    const text = extractTextFromMessage(m)
    if (await containsSuspiciousLink(text)) {
      const reason = 'Link WhatsApp o URL sospetto rilevato.'
      await handleViolation(
        conn,
        m,
        `🚫 ${reason}`,
        isBotAdmin
      )
      return true
    }
  } catch (err) {
    console.error('Errore AntiLink:', err)
  }

  return false
}
