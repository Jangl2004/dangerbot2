import { WAMessageStubType } from '@realvare/baileys'
import axios from 'axios'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CACHE_TTL = 1000 * 60 * 60
const groupBackgroundCache = new Map()
const profilePicCache = new Map()

setInterval(() => {
  groupBackgroundCache.clear()
  profilePicCache.clear()
}, CACHE_TTL)

const DEFAULT_AVATAR_URL =
  'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'

let defaultAvatarBuffer = null
let puppeteer = null
let browser = null

/* =========================
   PUPPETEER INIT
========================= */

async function initPuppeteer() {
  try {
    puppeteer = await import('puppeteer')
    await initBrowser()
  } catch (e) {
    console.error('❌ Puppeteer non installato:', e.message)
  }
}

async function initBrowser() {
  if (!puppeteer) return false

  try {
    if (browser && browser.isConnected()) return true

    if (browser) {
      try { await browser.close() } catch {}
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ]
    })

    browser.on('disconnected', async () => {
      console.warn('⚠️ Browser chiuso, riavvio...')
      browser = null
      await initBrowser()
    })

    return true
  } catch (err) {
    console.error('❌ Errore avvio browser:', err.message)
    browser = null
    return false
  }
}

/* =========================
   UTILS
========================= */

async function preloadDefaultAvatar() {
  if (defaultAvatarBuffer) return
  try {
    const res = await axios.get(DEFAULT_AVATAR_URL, {
      responseType: 'arraybuffer',
      timeout: 5000
    })
    defaultAvatarBuffer = Buffer.from(res.data)
  } catch {
    defaultAvatarBuffer = Buffer.from(
      `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="200" fill="#6B7280"/>
      </svg>`
    )
  }
}

async function getUserProfilePic(conn, jid) {
  if (profilePicCache.has(jid)) return profilePicCache.get(jid)

  let buffer = null
  try {
    const url = await conn.profilePictureUrl(jid, 'image').catch(() => null)
    if (url) {
      const res = await axios.get(url, { responseType: 'arraybuffer' })
      buffer = Buffer.from(res.data)
    }
  } catch {}

  if (!buffer) {
    if (!defaultAvatarBuffer) await preloadDefaultAvatar()
    buffer = defaultAvatarBuffer
  }

  profilePicCache.set(jid, buffer)
  return buffer
}

async function getGroupBackgroundImage(groupJid, conn) {
  if (groupBackgroundCache.has(groupJid))
    return groupBackgroundCache.get(groupJid)

  let buffer = null
  try {
    const url = await conn.profilePictureUrl(groupJid, 'image').catch(() => null)
    if (url) {
      const res = await axios.get(url, { responseType: 'arraybuffer' })
      buffer = Buffer.from(res.data)
    }
  } catch {}

  if (!buffer) {
    try {
      const fallback = path.join(__dirname, '..', 'media', 'benvenuto-addio.jpg')
      await fs.access(fallback)
      buffer = await fs.readFile(fallback)
    } catch {
      buffer = defaultAvatarBuffer
    }
  }

  groupBackgroundCache.set(groupJid, buffer)
  return buffer
}

/* =========================
   CARD HTML
========================= */

const WelcomeCard = ({ backgroundUrl, pfpUrl, isGoodbye, username, groupName }) => {
  const styles = `
    body {
      margin:0;
      width:1600px;
      height:900px;
      font-family:Arial;
      display:flex;
      align-items:center;
      justify-content:center;
      background:url('${backgroundUrl}') center/cover no-repeat;
    }
    .card{
      background:rgba(0,0,0,0.6);
      padding:60px;
      border-radius:40px;
      text-align:center;
      color:white;
      width:85%;
    }
    img{
      width:260px;
      height:260px;
      border-radius:50%;
      border:8px solid white;
      object-fit:cover;
      margin-bottom:30px;
    }
    h1{font-size:90px;margin:0}
    h2{font-size:60px;margin:10px 0}
    p{font-size:45px;margin:0}
  `

  return React.createElement(
    'html',
    null,
    React.createElement(
      'head',
      null,
      React.createElement('style', { dangerouslySetInnerHTML: { __html: styles } })
    ),
    React.createElement(
      'body',
      null,
      React.createElement(
        'div',
        { className: 'card' },
        React.createElement('img', { src: pfpUrl }),
        React.createElement('h1', null, isGoodbye ? 'ADDIO 👋' : 'BENVENUTO 🎉'),
        React.createElement('h2', null, username),
        React.createElement('p', null, groupName)
      )
    )
  )
}

/* =========================
   IMAGE RENDER
========================= */

async function createImage(htmlContent) {
  const ready = await initBrowser()
  if (!ready) throw new Error('Browser non disponibile')

  const page = await browser.newPage()

  try {
    await page.setViewport({ width: 1600, height: 900 })
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    return await page.screenshot({
      type: 'jpeg',
      quality: 82
    })
  } finally {
    await page.close().catch(() => {})
  }
}

/* =========================
   ANTI SPAM
========================= */

const requestCounter = { timestamps: [] }

function checkAntiSpam() {
  const now = Date.now()
  requestCounter.timestamps = requestCounter.timestamps.filter(
    t => now - t < 30000
  )

  if (requestCounter.timestamps.length >= 4) return false

  requestCounter.timestamps.push(now)
  return true
}

/* =========================
   HANDLER
========================= */

await initPuppeteer()
await preloadDefaultAvatar()

let handler = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup || !m.messageStubType) return

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat?.welcome && !chat?.goodbye) return

  const isAdd =
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
  const isRemove =
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE

  if (!isAdd && !isRemove) return
  if (!checkAntiSpam()) return

  const jid = m.messageStubParameters?.[0]
  if (!jid) return

  const username = `@${jid.split('@')[0]}`
  const groupName = groupMetadata?.subject || 'Gruppo'
  const profilePic = await getUserProfilePic(conn, jid)
  const background = await getGroupBackgroundImage(m.chat, conn)

  const toBase64 = (buffer) =>
    `data:image/jpeg;base64,${buffer.toString('base64')}`

  const element = React.createElement(WelcomeCard, {
    backgroundUrl: toBase64(background),
    pfpUrl: toBase64(profilePic),
    isGoodbye: isRemove,
    username,
    groupName
  })

  const html = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`

  try {
    const image = await createImage(html)

    await conn.sendMessage(m.chat, {
      image,
      caption: isRemove
        ? `Addio ${username}`
        : `Benvenuto ${username}`,
      mentions: [jid]
    })
  } catch (err) {
    console.error('❌ Errore rendering:', err.message)

    await conn.sendMessage(m.chat, {
      text: isRemove
        ? `Addio ${username}`
        : `Benvenuto ${username}`,
      mentions: [jid]
    })
  }
}

handler.command = /^$/
handler.before = true

export default handler