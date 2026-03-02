import fetch from "node-fetch"
import { Sticker } from "wa-sticker-formatter"
import petPet from "pet-pet-gif"

let handler = async (m, { conn }) => {
  let who =
    m.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.sender

  let ppUrl
  try {
    ppUrl = await conn.profilePictureUrl(who, "image")
  } catch {
    ppUrl = "https://i.ibb.co/4pDNDk1/avatar-contact.png"
  }

  const res = await fetch(ppUrl)
  const imgBuffer = await res.buffer()

  const gifBuffer = await petPet(imgBuffer, {
    resolution: 112,
    delay: 20,
  })

  const sticker = new Sticker(gifBuffer, {
    pack: "Il Mio Bot",
    author: "petpet",
    type: "full",
    quality: 60,
  })

  await conn.sendMessage(m.chat, await sticker.toMessage(), { quoted: m })
}

handler.help = ["petpet (@tag o reply)"]
handler.tags = ["fun"]
handler.command = ["petpet"]

export default handler
