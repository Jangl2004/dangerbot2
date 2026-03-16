import { Sticker } from "wa-sticker-formatter"
import petPet from "pet-pet-gif"

let handler = async (m, { conn }) => {
  // Identifica chi deve essere "accarezzato"
  let who =
    m.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.sender

  let ppUrl
  try {
    // Tenta di ottenere l'immagine del profilo
    ppUrl = await conn.profilePictureUrl(who, "image")
  } catch (e) {
    // URL di fallback in caso di errore
    ppUrl = "https://i.ibb.co/4pDNDk1/avatar-contact.png"
  }

  try {
    // Download dell'immagine tramite fetch nativa
    const res = await fetch(ppUrl)
    if (!res.ok) throw new Error("Errore nel download dell'immagine")
    
    // Conversione in buffer per le librerie di manipolazione
    const arrayBuffer = await res.arrayBuffer()
    const imgBuffer = Buffer.from(arrayBuffer)

    // Generazione GIF Pet-Pet con impostazioni bilanciate (Qualità/Peso)
    const gifBuffer = await petPet(imgBuffer, {
      resolution: 128, // Risoluzione ottimale per leggibilità senza pesare troppo
      delay: 15,       // Velocità fluida che rispetta i limiti di invio di WhatsApp
    })

    // Creazione dello sticker con parametri equilibrati
    const sticker = new Sticker(gifBuffer, {
      pack: "Danger Bot",
      author: "petpet",
      type: "full",
      quality: 80,     // Compressione minima per mantenere alta la nitidezza
    })

    // Conversione e invio dello sticker
    const stickerBuffer = await sticker.toMessage()
    await conn.sendMessage(m.chat, stickerBuffer, { quoted: m })

  } catch (err) {
    console.error("Errore nel modulo PetPet:", err)
    m.reply("⚠️ Non sono riuscito a creare lo sticker. Assicurati che l'utente abbia una foto profilo valida.")
  }
}

handler.help = ["petpet (@tag o reply)"]
handler.tags = ["fun"]
handler.command = ["petpet"]

export default handler
