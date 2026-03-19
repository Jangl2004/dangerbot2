let handler = async (m, { conn, isBotAdmin, isGroup }) => {
    // 1. Log di controllo nel terminale VPS
    console.log(`[LINKQR] Richiesta in: ${m.chat} - Bot Admin: ${isBotAdmin}`);

    // 2. Controllo se è un gruppo
    if (!isGroup) return m.reply('❌ Comando disponibile solo nei gruppi.');

    // 3. Controllo se il bot è admin (usando la variabile diretta del sistema)
    if (!isBotAdmin) return m.reply('⚠️ Errore di sistema: Non rilevo i permessi di Admin. Per favore, togli e rimetti il bot come amministratore.');

    try {
        // 4. Generazione del link
        let code = await conn.groupInviteCode(m.chat);
        let link = 'https://chat.whatsapp.com/' + code;
        
        // 5. Recupero info gruppo per estetica
        let groupMetadata = await conn.groupMetadata(m.chat);
        
        let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃ 🔗 *LINK DEL GRUPPO* 🔗\n`
        txt += `┗━━━━━━━━━━━━━━━━━━┛\n\n`
        txt += `📌 *Nome:* ${groupMetadata.subject}\n`
        txt += `🚀 *Link:* ${link}\n\n`
        txt += `_Usa questo link per invitare nuovi membri._`

        // 6. Invio del messaggio con anteprima cliccabile
        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                externalAdReply: {
                    title: "INVITO AL GRUPPO",
                    body: groupMetadata.subject,
                    thumbnailUrl: await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://i.imgur.com/6hS7L6v.png'),
                    sourceUrl: link,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        // Se il comando fallisce ancora, proviamo un metodo alternativo più grezzo
        try {
            let res = await conn.groupInviteCode(m.chat);
            m.reply('https://chat.whatsapp.com/' + res);
        } catch (err) {
            m.reply('❗ Errore fatale: Non riesco a generare il link. Assicurati che il bot non sia limitato da WhatsApp.');
        }
    }
}

handler.help = ['linkqr']
handler.tags = ['group']
handler.command = /^linkqr$/i
handler.group = true
handler.botAdmin = true // Questa riga dice al bot di controllare l'admin PRIMA di avviare il plugin

export default handler
