/**
 * PLUGIN: .linkqr (Versione Fixata per il tuo Bot)
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // In molti bot moderni, l'oggetto per inviare messaggi si chiama 'conn', non 'sock'
    
    if (!m.isGroup) return m.reply('❌ Questo comando può essere usato solo nei gruppi!')
    
    // Controlliamo se il bot è admin
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants
    let bot = participants.find(u => conn.decodeJid(u.id) === conn.user.jid)
    
    if (!bot || !bot.admin) return m.reply('⚠️ Ho bisogno di essere *Amministratore* per generare il link!')

    try {
        // Generiamo il codice
        let code = await conn.groupInviteCode(m.chat)
        let link = 'https://chat.whatsapp.com/' + code
        
        let caption = `*🔗 LINK D'INVITO GRUPPO*\n\n`
        caption += `📌 *Nome:* ${groupMetadata.subject}\n`
        caption += `👥 *Membri:* ${participants.length}\n\n`
        caption += `🚀 *Link:* ${link}\n\n`
        caption += `_Richiesto da: ${m.name}_`

        // Usiamo conn.sendMessage o m.reply
        await conn.sendMessage(m.chat, { 
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "Link Ufficiale",
                    body: groupMetadata.subject,
                    thumbnailUrl: await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://i.imgur.com/6hS7L6v.png'),
                    sourceUrl: link,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❗ Errore nel recupero del link. Riprova più tardi.')
    }
}

handler.help = ['linkqr']
handler.tags = ['group']
handler.command = /^(linkqr|linkgc)$/i
handler.group = true // Questo blocca in automatico se non è un gruppo

export default handler
