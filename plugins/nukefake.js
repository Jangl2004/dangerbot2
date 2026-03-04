let handler = async (m, { conn, command, usedPrefix }) => {
    const chat = global.db.data.chats[m.chat] || {}
    
    // Funzione NUKE
    if (command === 'sparisci') {
        const groupMetadata = await conn.groupMetadata(m.chat)
        
        // Salvataggio dati originali per il ripristino
        chat.oldName = groupMetadata.subject
        chat.oldDesc = groupMetadata.desc || "Nessuna descrizione"
        global.db.data.chats[m.chat] = chat

        // 1. Cambia Nome (Font Stylized)
        let newName = `${chat.oldName} | SVT BY DANGER BOT`
        await conn.groupUpdateSubject(m.chat, newName)

        // 2. Cambia Descrizione
        await conn.groupUpdateDescription(m.chat, "DANGER BOT DOMINA SUI VOSTRI GRUPPI 🛡️")

        // 3. Chiude il gruppo (Solo Admin)
        await conn.groupSettingUpdate(m.chat, 'announcement')

        // 4. Genera Link e Tag All Invisibile
        let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
        const participants = groupMetadata.participants.map(u => u.id)
        
        let nukeMsg = `
┏━━━━━━━━━━━━━━━━━━┓
┃  ☣️  *𝐆𝐑𝐔𝐏𝐏𝐎 𝐒𝐕𝐔𝐎𝐓𝐀𝐓𝐎* ☣️
┗━━━━━━━━━━━━━━━━━━┛

📢 *𝐃𝐀𝐋 𝐁𝐎𝐓 𝐌𝐈𝐆𝐋𝐈𝐎𝐑𝐄 𝐃𝐈 𝐙𝐎𝐙𝐙𝐀𝐏*

🔗 *𝐄𝐍𝐓𝐑𝐀𝐓𝐄 𝐓𝐔𝐓𝐓𝐈 𝐐𝐔𝐈:*
${link}

⚡ _Powered by Danger Bot_
`.trim()

        await conn.sendMessage(m.chat, {
            text: nukeMsg,
            mentions: participants
        }, { quoted: m })
    }

    // Funzione RESUSCITA
    if (command === 'resuscita') {
        if (!chat.oldName) return m.reply("⚠️ *Non ho dati salvati per il ripristino!*")

        // 1. Ripristina Nome
        await conn.groupUpdateSubject(m.chat, chat.oldName)

        // 2. Ripristina Descrizione
        await conn.groupUpdateDescription(m.chat, chat.oldDesc)

        // 3. Apre il gruppo
        await conn.groupSettingUpdate(m.chat, 'not_announcement')

        let resMsg = `
✨ *𝐑𝐈𝐏𝐑𝐈𝐒𝐓𝐈𝐍𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎* ✨
━━━━━━━━━━━━━━━━━━━━
✅ _Nome e descrizione tornati alla normalità._
🔓 _Chat aperta a tutti i partecipanti._
`.trim()

        m.reply(resMsg)
    }
}

handler.help = ['sparisci', 'resuscita']
handler.tags = ['owner', 'group']
handler.command = ['sparisci', 'resuscita']

handler.group = true
handler.admin = true
handler.botAdmin = true 

export default handler
