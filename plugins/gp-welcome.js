import { WAMessageStubType } from '@realvare/baileys'
import axios from 'axios'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let puppeteer = null
let browser = null

async function initPuppeteer() {
  if (puppeteer) return
  puppeteer = await import('puppeteer')
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
}

async function createImage(html) {
  if (!browser) await initPuppeteer()
  const page = await browser.newPage()
  await page.setViewport({ width: 1600, height: 900 })
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const buffer = await page.screenshot({ type: 'jpeg', quality: 90 })
  await page.close()
  return buffer
}

async function getProfilePic(conn, jid) {
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    const res = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(res.data)
  } catch {
    return null
  }
}

/* CARD SOLO FOTO + TITOLO */
const WelcomeCard = ({ pfpUrl, isGoodbye }) => {
  const styles = `
    body {
      margin:0;
      width:1600px;
      height:900px;
      display:flex;
      justify-content:center;
      align-items:center;
      background:#000;
      font-family:sans-serif;
    }
    .card{
      width:90%;
      height:85%;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      background:rgba(255,255,255,0.05);
      backdrop-filter:blur(20px);
      border-radius:50px;
      color:white;
    }
    .pfp{
      width:500px;
      height:500px;
      border-radius:50%;
      border:10px solid white;
      object-fit:cover;
      box-shadow:0 0 60px rgba(255,255,255,0.7);
      margin-bottom:40px;
    }
    .title{
      font-size:120px;
      font-weight:bold;
    }
  `

  return React.createElement('html', {},
    React.createElement('head', {},
      React.createElement('style', { dangerouslySetInnerHTML: { __html: styles } })
    ),
    React.createElement('body', {},
      React.createElement('div', { className: 'card' },
        React.createElement('img', { src: pfpUrl, className: 'pfp' }),
        React.createElement('div', { className: 'title' },
          isGoodbye ? '𐍉' : '𐍉'
        )
      )
    )
  )
}

let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return false

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat || (!chat.welcome && !chat.goodbye)) return false

  const isAdd = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
  const isRemove =
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE

  if (!isAdd && !isRemove) return false

  const who = m.messageStubParameters?.[0]
  if (!who) return false

  const jid = conn.decodeJid(who)
  const cleanUserId = jid.split('@')[0]
  const groupName = groupMetadata?.subject || 'Gruppo'

  const pfp = await getProfilePic(conn, jid)
  if (!pfp) return false

  const base64 = `data:image/jpeg;base64,${pfp.toString('base64')}`

  const element = React.createElement(WelcomeCard, {
    pfpUrl: base64,
    isGoodbye: isRemove
  })

  const html = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`
  const image = await createImage(html)

  const caption = isRemove
    ? `@${cleanUserId} 𝐌𝐢 𝐬𝐚 𝐜𝐡𝐞 𝐡𝐚 𝐪𝐮𝐢𝐭𝐭𝐚𝐭𝐨`
    : `@${cleanUserId} 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐬𝐮 ${groupName}`

  await conn.sendMessage(
    m.chat,
    {
      text: caption,
      mentions: [jid],
      contextInfo: {
        externalAdReply: {
          title: isRemove ? 'ADDIO 👋' : 'BENVENUTO 🎉',
          body: '',
          previewType: 'PHOTO',
          thumbnail: image,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    },
    { quoted: m }
  )

  return true
}

export default handler