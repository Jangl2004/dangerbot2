import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { watchFile } from 'fs'
import fs from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage } from '@realvare/baileys'
import { canLevelUp } from './lib/levelling.js'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) {
  global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
}
if (!global.jidCache) {
  global.jidCache = new NodeCache({ stdTTL: 900, useClones: false })
}
if (!global.nameCache) {
  global.nameCache = new NodeCache({ stdTTL: 900, useClones: false })
}

let PRINT_MODULE = null
let PRINT_MODULE_PROMISE = null

async function getPrintModule() {
  if (PRINT_MODULE) return PRINT_MODULE
  if (!PRINT_MODULE_PROMISE) {
    PRINT_MODULE_PROMISE = import('./lib/print.js')
      .then(m => (PRINT_MODULE = m))
      .finally(() => {
        PRINT_MODULE_PROMISE = null
      })
  }
  return PRINT_MODULE_PROMISE
}

const delay = ms =>
  typeof ms === 'number' && !isNaN(ms)
    ? new Promise(resolve => setTimeout(resolve, ms))
    : Promise.resolve()

const defchat = {
  isBanned: false,
  welcome: false,
  goodbye: false,
  ai: false,
  vocali: false,
  antiporno: false,
  antiBot: false,
  antitrava: false,
  antimedia: false,
  antioneview: false,
  antitagall: false,
  autotrascrizione: false,
  autotraduzione: false,
  autolevelup: false,
  antivoip: false,
  rileva: false,
  modoadmin: false,
  antiLink: false,
  antiLinkUni: false,
  antiLink2: false,
  reaction: false,
  antispam: false,
  antisondaggi: false,
  antiparolacce: false,
  expired: 0,
  users: {}
}

const defsettings = {
  autoread: false,
  antiprivato: false,
  soloCreatore: false,
  antispambot: false,
  anticall: true,
  multiprefix: false,
  registrazioni: false,
  status: 0,
  prefix: '.'
}

const defuser = {
  exp: 0,
  euro: 10,
  muto: false,
  registered: false,
  name: '?',
  age: -1,
  regTime: -1,
  banned: false,
  bank: 0,
  level: 0,
  firstTime: 0,
  spam: 0,
  messages: 0,
  callWarn: 0
}

function chatz(chatId) {
  if (!global.db?.data) return null
  if (!global.db.data.chats) global.db.data.chats = {}
  const existing = global.db.data.chats[chatId]
  const base = existing && typeof existing === 'object' ? existing : {}
  global.db.data.chats[chatId] = Object.assign({}, defchat, base)
  return global.db.data.chats[chatId]
}

function settingz(jid) {
  if (!global.db?.data) return null
  if (!global.db.data.settings) global.db.data.settings = {}
  const existing = global.db.data.settings[jid]
  const base = existing && typeof existing === 'object' ? existing : {}
  global.db.data.settings[jid] = Object.assign({}, defsettings, base)
  return global.db.data.settings[jid]
}

function userz(jid, pushName = '?') {
  if (!global.db?.data) return null
  if (!global.db.data.users) global.db.data.users = {}
  const existing = global.db.data.users[jid]
  const base = existing && typeof existing === 'object' ? existing : {}
  global.db.data.users[jid] = Object.assign({}, defuser, base)

  if (!global.db.data.users[jid].firstTime) {
    global.db.data.users[jid].firstTime = Date.now()
  }
  if (!global.db.data.users[jid].name || global.db.data.users[jid].name === '?') {
    global.db.data.users[jid].name = pushName || '?'
  }

  return global.db.data.users[jid]
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeParticipants(conn, participants = []) {
  return participants.map(u => {
    const normalizedId = conn.decodeJid(u.id)
    return {
      ...u,
      id: normalizedId,
      jid: u.jid ? conn.decodeJid(u.jid) : normalizedId
    }
  })
}

function checkAdminStatus(conn, participants = [], targetJid) {
  return participants.some(u => {
    const ids = [
      u.id ? conn.decodeJid(u.id) : null,
      u.jid ? conn.decodeJid(u.jid) : null,
      u.lid ? conn.decodeJid(u.lid) : null
    ].filter(Boolean)

    return (
      ids.includes(targetJid) &&
      (
        u.admin === 'admin' ||
        u.admin === 'superadmin' ||
        u.isAdmin === true ||
        u.admin === true
      )
    )
  })
}

function applyPrefixFromSettings(settings) {
  try {
    const defaultPrefix = '.'
    const raw = typeof settings?.prefix === 'string' ? settings.prefix.trim() : ''

    if (settings?.multiprefix === true) {
      const chars = raw || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.-@'
      global.prefix = new RegExp(`^[${escapeRegex(chars)}]`)
    } else {
      const c = String(raw || defaultPrefix)[0] || '.'
      global.prefix = new RegExp(`^${escapeRegex(c)}`)
    }
  } catch {
    global.prefix = /^\./
  }
}

async function fetchGroupMetadataWithRetry(conn, chatId, retries = 3, wait = 1000, force = false) {
  const cached = global.groupCache.get(chatId)
  if (!force && cached && Date.now() - (cached.fetchTime || 0) < 60000) {
    return cached
  }

  for (let i = 0; i < retries; i++) {
    try {
      const metadata = await conn.groupMetadata(chatId)
      if (metadata) {
        metadata.fetchTime = Date.now()
        global.groupCache.set(chatId, metadata, 300)
        return metadata
      }
    } catch (e) {
      if (i === retries - 1) throw e
      await delay(wait * (i + 1))
    }
  }

  return null
}

if (!global.cacheListenersSet) {
  const conn = global.conn
  if (conn) {
    conn.ev.on('groups.update', async updates => {
      for (const update of updates) {
        if (!update?.id) continue

        try {
          const metadata = await fetchGroupMetadataWithRetry(conn, update.id, 3, 1000, true)
          if (!metadata) continue

          global.groupCache.set(update.id, metadata, 300)

          if (!global.db.data) await global.loadDatabase()

          const chat = chatz(update.id)
          chat.name = metadata.subject

          try {
            chat.pfp = await conn.profilePictureUrl(update.id, 'image')
          } catch {
            chat.pfp = null
          }

          chat.membersCount = metadata.participants?.length || 0
        } catch (e) {
          if (
            !e.message?.includes('not authorized') &&
            !e.message?.includes('chat not found') &&
            !e.message?.includes('not in group')
          ) {
            console.error(`[ERRORE] groups.update ${update.id}:`, e)
          }
        }
      }
    })

    global.cacheListenersSet = true
  }
}

if (!global.pollListenerSet) {
  const conn = global.conn
  if (conn) {
    conn.ev.on('messages.update', async chatUpdate => {
      for (const { key, update } of chatUpdate) {
        if (!update?.pollUpdates) continue

        try {
          const pollCreation = await global.store.getMessage(key)
          if (pollCreation) {
            await getAggregateVotesInPollMessage({
              message: pollCreation,
              pollUpdates: update.pollUpdates
            })
          }
        } catch (e) {
          console.error('[ERRORE] poll update:', e)
        }
      }
    })

    global.pollListenerSet = true
  }
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function getCommandData(text = '', prefixRegex = /^\./) {
  const match = text.match(prefixRegex)
  if (!match) return null

  const usedPrefix = match[0]
  const noPrefix = text.slice(usedPrefix.length).trim()
  if (!noPrefix) return null

  const parts = noPrefix.split(/\s+/)
  const command = (parts.shift() || '').toLowerCase()
  const args = parts
  const textArgs = args.join(' ')

  return {
    usedPrefix,
    noPrefix,
    command,
    args,
    text: textArgs
  }
}

function pluginMatchesCommand(plugin, command) {
  if (!plugin || !plugin.command) return false

  if (Array.isArray(plugin.command)) {
    return plugin.command.some(cmd =>
      cmd instanceof RegExp ? cmd.test(command) : String(cmd).toLowerCase() === command
    )
  }

  if (plugin.command instanceof RegExp) {
    return plugin.command.test(command)
  }

  if (typeof plugin.command === 'string') {
    return plugin.command.toLowerCase() === command
  }

  return false
}

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return

  if (Array.isArray(chatUpdate.messages) && chatUpdate.messages.length > 1) {
    for (const msg of chatUpdate.messages) {
      try {
        await handler.call(this, { ...chatUpdate, messages: [msg] })
      } catch (e) {
        console.error('[ERRORE] batch messages.upsert:', e)
      }
    }
    return
  }

  let m = chatUpdate.messages?.[chatUpdate.messages.length - 1]
  if (!m) return

  try {
    const printer = await getPrintModule()
    if (typeof printer?.ensureMessageUpdateListener === 'function') {
      printer.ensureMessageUpdateListener(this)
    }
  } catch {}

  this.pushMessage(chatUpdate.messages).catch(console.error)
  m = smsg(this, m)

  if (!m || !m.key || !m.chat || !m.sender) return
  if (m.isBaileys) return
  if (m.key.participant && m.key.participant.includes(':') && m.key.participant.split(':')[1]?.includes('@')) return

  if (m.key) {
    m.key.remoteJid = this.decodeJid(m.key.remoteJid)
    if (m.key.participant) m.key.participant = this.decodeJid(m.key.participant)
  }

  if (!global.db.data) await global.loadDatabase()

  m.exp = 0
  m.euro = 0
  m.isCommand = false

  let user = null
  let chat = null
  let settings = null
  let normalizedSender = null
  let normalizedBot = null
  let groupMetadata = null
  let participants = []
  let normalizedParticipants = []
  let isAdmin = false
  let isBotAdmin = false
  let isOwner = false
  let isSam = false
  let isPrems = false
  let usedPrefix = null

  try {
    normalizedSender = this.decodeJid(m.sender)
    normalizedBot = this.decodeJid(this.user.jid)

    if (!normalizedSender || normalizedSender.endsWith('@lid')) return

    user = userz(normalizedSender, m.pushName || '?')
    chat = chatz(m.chat)
    settings = settingz(normalizedBot)

    applyPrefixFromSettings(settings)

    if (m.mtype === 'pollUpdateMessage') return
    if (m.mtype === 'reactionMessage') return

    isSam = Array.isArray(global.owner) &&
      global.owner.some(([num]) => `${num}@s.whatsapp.net` === normalizedSender)

    isOwner = isSam || m.fromMe
    isPrems = isSam || (Array.isArray(global.prems) && global.prems.includes(normalizedSender))

    if (m.isGroup) {
      groupMetadata = global.groupCache.get(m.chat)

      if (!groupMetadata) {
        groupMetadata = await fetchGroupMetadataWithRetry(this, m.chat, 3, 1000)
        if (groupMetadata) {
          global.groupCache.set(m.chat, groupMetadata, 300)
        }
      }

      if (groupMetadata) {
        participants = groupMetadata.participants || []
        normalizedParticipants = normalizeParticipants(this, participants)
        isAdmin = checkAdminStatus(this, participants, normalizedSender)

        const ownerJid = groupMetadata.owner ? this.decodeJid(groupMetadata.owner) : null
        const ownerLid = groupMetadata.ownerLid ? this.decodeJid(groupMetadata.ownerLid) : null

        isBotAdmin =
          checkAdminStatus(this, participants, normalizedBot) ||
          normalizedBot === ownerJid ||
          normalizedBot === ownerLid
      }
    }

    if (user.muto && !isOwner && !isSam) {
      await this.sendMessage(m.chat, {
        text: '🚫 Sei stato mutato, non puoi usare i comandi.'
      }, { quoted: m })
      return
    }

    if (m.chat in global.db.data.chats) {
      let chatData = global.db.data.chats[m.chat]
      if (chatData?.isBanned) return
    }

    if (chat?.modoadmin && m.isGroup && !isOwner && !isSam && !isAdmin) return
    if (settings?.soloCreatore && !isSam) return

    const cmd = getCommandData(m.text || '', global.prefix || /^\./)

    if (cmd) {
      m.isCommand = true
      usedPrefix = cmd.usedPrefix

      const COMMAND_SPAM_WINDOW_MS = 60000
      const COMMAND_SPAM_MAX = 8
      const COMMAND_SPAM_SUSPEND_MS = 15000

      if (m.isGroup && !isOwner && !isSam && !isAdmin && (settings.antispambot || chat.antispam)) {
        const groupData = global.groupSpam[m.chat] || (global.groupSpam[m.chat] = {
          count: 0,
          firstCommandTimestamp: 0,
          isSuspended: false
        })

        const now = Date.now()

        if (groupData.isSuspended) return

        if (now - groupData.firstCommandTimestamp > COMMAND_SPAM_WINDOW_MS) {
          groupData.count = 1
          groupData.firstCommandTimestamp = now
        } else {
          groupData.count++
        }

        if (groupData.count > COMMAND_SPAM_MAX) {
          groupData.isSuspended = true

          await this.sendMessage(m.chat, {
            text: '『 ⚠️ 』 *Anti-spam comandi*\n\nTroppi comandi in un minuto. Aspettate 15 secondi prima di riutilizzarli.\n\n*Gli admin sono esenti.*'
          }, { quoted: m }).catch(() => {})

          setTimeout(() => {
            delete global.groupSpam[m.chat]
          }, COMMAND_SPAM_SUSPEND_MS)

          return
        }
      }

      for (const name in global.plugins) {
        const plugin = global.plugins[name]
        if (!plugin) continue
        if (typeof plugin.execute !== 'function') continue
        if (!pluginMatchesCommand(plugin, cmd.command)) continue

        const extra = {
          conn: this,
          command: cmd.command,
          args: cmd.args,
          text: cmd.text,
          usedPrefix: cmd.usedPrefix,
          noPrefix: cmd.noPrefix,
          participants: normalizedParticipants,
          groupMetadata,
          isOwner,
          isAdmin,
          isBotAdmin,
          isPrems,
          chat,
          user,
          settings,
          chatUpdate,
          __dirname: join(path.dirname(fileURLToPath(import.meta.url)), './plugins'),
          __filename: join(join(path.dirname(fileURLToPath(import.meta.url)), './plugins'), name)
        }

        try {
          await plugin.execute(m, extra)
        } catch (e) {
          m.error = e
          console.error(`[ERRORE] Plugin ${name}:`, e)

          if (e?.message?.includes('rate-overlimit')) {
            console.warn('[AVVISO] Rate limit raggiunto, ritento dopo 2 secondi...')
            await delay(2000)
          }

          await this.sendMessage(m.chat, {
            text: `❌ Errore:\n${format(e)}`
          }, { quoted: m }).catch(console.error)
        }

        break
      }
    }
  } catch (e) {
    console.error(`[ERRORE] handler chat ${m.chat}, sender ${m.sender}:`, e)
  } finally {
    if (m && user && user.muto && !m.fromMe) {
      await this.sendMessage(m.chat, { delete: m.key }).catch(console.error)
    }

    if (m && user) {
      user.exp = Number(user.exp)
      if (!Number.isFinite(user.exp) || user.exp < 0) user.exp = 0

      user.euro = Number(user.euro)
      if (!Number.isFinite(user.euro)) user.euro = 0

      if (chat && chat.autolevelup && !m.fromMe && !m.isCommand) {
        const earned = 1 + Math.floor(Math.random() * 3)
        user.exp += earned
      }

      user.exp += Number(m.exp) || 0
      user.euro -= Number(m.euro) || 0
      user.messages = (user.messages || 0) + 1

      user.level = Number(user.level)
      if (!Number.isFinite(user.level) || user.level < 0) user.level = 0

      while (chat && chat.autolevelup && canLevelUp(user.level, user.exp, global.multiplier)) {
        user.level++
      }

      if (m.isGroup) {
        if (!chat.users) chat.users = {}
        if (!chat.users[normalizedSender]) {
          chat.users[normalizedSender] = { messages: 0 }
        }
        chat.users[normalizedSender].messages++
      }
    }

    try {
      if (!global.opts?.noprint && m) {
        const printer = await getPrintModule()
        if (typeof printer?.default === 'function') {
          await printer.default(m, this)
        }
      }
    } catch (e) {
      console.error('[ERRORE] print:', e)
    }

    const settingsREAD = global.db.data.settings?.[this.decodeJid(this.user.jid)] || {}
    if ((global.opts?.autoread || settingsREAD.autoread || settingsREAD.autoread2) && m) {
      await this.readMessages([m.key]).catch(console.error)
    }

    if (
      chat &&
      chat.reaction &&
      m?.text?.match(/(mente|zione|tà|ivo|osa|issimo|ma|però|eppure|anche|ma|no|se|ai|ciao|si)/gi) &&
      !m.fromMe
    ) {
      const emot = pickRandom([
        '🍟', '😃', '😄', '😁', '😆', '🍓', '😅', '😂', '🤣', '🥲',
        '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'
      ])

      await this.sendMessage(m.chat, {
        react: { text: emot, key: m.key }
      }).catch(console.error)
    }
  }
}

let file = typeof global.__filename === 'function'
  ? global.__filename(import.meta.url, true)
  : fileURLToPath(import.meta.url)

watchFile(file, () => {
  console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato")))
})
