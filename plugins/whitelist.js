// Plugin Blacklist - Corretto per Baileys
import { WAMessageStubType } from '@whiskeysockets/baileys'

function estraiJid(m, text = '') {
  let who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)
  if (who) return who

  let numero = text.replace(/[^0-9]/g, '')
  if (!numero) return null

  return numero + '@s.whatsapp.net'
}

let handler = async (m, { conn, command, text, isAdmin, isOwner, isROwner, participants }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')
  if (!isAdmin && !isOwner && !isROwner) {
    return m.reply('❌ Solo admin e owner possono usare questo comando.')
  }

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  let chat = global.db.data.chats[m.chat]
  chat.blacklist = chat.blacklist || []

  const who = estraiJid(m, text)
  const botJid = conn.user?.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : ''
  const owners = (global.owner || []).map(v => {
    if (Array.isArray(v)) return v[0] + '@s.whatsapp.net'
    return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  })

  const admins = (participants || [])
    .filter(p => p.admin)
    .map(p => p.id)

  if (/^(blacklist|listanera)$/i.test(command)) {
    if (!who) return m.reply('✳️ Tagga, rispondi o scrivi un numero.')
    if (who === botJid) return m.reply('❌ Non puoi mettere il bot in blacklist.')
    if (owners.includes(who)) return m.reply('❌ Non puoi mettere un owner in blacklist.')
    if (admins.includes(who)) return m.reply('❌ Non puoi mettere un amministratore del gruppo in blacklist.')
    if (chat.blacklist.includes(who)) return m.reply('⚠️ Questo numero è già in blacklist.')

    chat.blacklist.push(who)
    return conn.sendMessage(m.chat, { text: `🚫 Utente aggiunto alla blacklist.\n\n@${who.split('@')[0]}`, mentions: [who] }, { quoted: m })
  }

  if (/^(whitelist|unblacklist)$/i.test(command)) {
    if (!who) return m.reply('✳️ Tagga, rispondi o scrivi un numero.')
    if (!chat.blacklist.includes(who)) return m.reply('⚠️ Questo numero non è in blacklist.')

    chat.blacklist = chat.blacklist.filter(v => v !== who)
    return conn.sendMessage(m.chat, { text: `✅ Utente rimosso dalla blacklist.\n\n@${who.split('@')[0]}`, mentions: [who] }, { quoted: m })
  }

  if (/^(blacklistlist|listablack|listaneraall)$/i.test(command)) {
    if (!chat.blacklist.length) return m.reply('✅ La blacklist del gruppo è vuota.')
    let testo = `🚫 *BLACKLIST DEL GRUPPO*\n\n` + chat.blacklist.map((u, i) => `${i + 1}. @${u.split('@')[0]}`).join('\n')
    return conn.sendMessage(m.chat, { text: testo, mentions: chat.blacklist }, { quoted: m })
  }
}

handler.before = async function (m, { conn, isBotAdmin, participants }) {
  if (!m.isGroup || !isBotAdmin) return
  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  let chat = global.db.data.chats[m.chat]
  chat.blacklist = chat.blacklist || []

  if (!chat.blacklist.length) return
  
  const STUB_TYPES = {
    ADD: WAMessageStubType.GROUP_PARTICIPANT_ADD,
    LEAVE: WAMessageStubType.GROUP_PARTICIPANT_LEAVE,
    REMOVE: WAMessageStubType.GROUP_PARTICIPANT_REMOVE,
  }

  if (!m.messageStubType || !Object.values(STUB_TYPES).includes(m.messageStubType)) return

  let users = m.messageStubParameters || []
  if (!users.length) return

  const botJid = conn.user?.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : ''
  const owners = (global.owner || []).map(v => Array.isArray(v) ? v[0] + '@s.whatsapp.net' : String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net')
  const admins = (participants || []).filter(p => p.admin).map(p => p.id)

  let daRimuovere = users.filter(user => chat.blacklist.includes(user) && user !== botJid && !owners.includes(user) && !admins.includes(user))

  for (let user of daRimuovere) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      await conn.sendMessage(m.chat, { text: `🚫 @${user.split('@')[0]} era in blacklist ed è stato rimosso.`, mentions: [user] }, { quoted: m })
    } catch (e) { console.error(e) }
  }
}

handler.help = ['blacklist', 'whitelist', 'blacklistlist']
handler.tags = ['gruppo']
handler.command = /^(blacklist|listanera|whitelist|unblacklist|blacklistlist|listablack|listaneraall)$/i
handler.group = true

export default handler
