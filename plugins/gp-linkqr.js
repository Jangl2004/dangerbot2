const handler = async (m, { sock, args, isGroup, isAdmins, isBotAdmins, participants }) => {
    try {
        // 1. Controllo se il comando è usato in un gruppo
        if (!isGroup) {
            return await sock.sendMessage(m.chat, { 
                text: "❌ *Errore:* Questo comando può essere utilizzato esclusivamente all'interno di un gruppo." 
            }, { quoted: m });
        }

        // 2. Controllo se il Bot è amministratore (obbligatorio per generare il link)
        if (!isBotAdmins) {
            return await sock.sendMessage(m.chat, { 
                text: "⚠️ *Attenzione:* Non posso generare il link perché non sono un *Amministratore* di questo gruppo." 
            }, { quoted: m });
        }

        // 3. (Opzionale) Controllo se chi invia il comando è un admin
        // Se vuoi che chiunque possa usarlo, rimuovi queste 3 righe sotto
        if (!isAdmins) {
            return await sock.sendMessage(m.chat, { 
                text: "🔒 *Accesso Negato:* Solo gli amministratori possono richiedere il link del gruppo." 
            }, { quoted: m });
        }

        // 4. Recupero del codice d'invito dai server WhatsApp
        // Nota: sock.groupInviteCode restituisce solo la parte finale (es: JkL123...)
        const inviteCode = await sock.groupInviteCode(m.chat);
        const groupMetadata = await sock.groupMetadata(m.chat);
        const groupName = groupMetadata.subject;

        // 5. Costruzione del messaggio estetico
        const responseLink = `https://chat.whatsapp.com/${inviteCode}`;
        
        let caption = `*🔗 LINK D'INVITO GRUPPO*\n\n`;
        caption += `📌 *Nome:* ${groupName}\n`;
        caption += `👥 *Membri:* ${participants.length}\n`;
        caption += `🚀 *Link:* ${responseLink}\n\n`;
        caption += `_Condividi questo link con cautela!_`;

        // 6. Invio del messaggio finale
        await sock.sendMessage(m.chat, { 
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "Link d'invito ufficiale",
                    body: groupName,
                    thumbnailUrl: await sock.profilePictureUrl(m.chat, 'image').catch(_ => 'https://i.imgur.com/6hS7L6v.png'),
                    sourceUrl: responseLink,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error("Errore nel plugin linkqr:", error);
        await sock.sendMessage(m.chat, { 
            text: "❗ *Errore Interno:* Si è verificato un problema tecnico durante la generazione del link." 
        }, { quoted: m });
    }
};

handler.help = ['linkqr'];
handler.tags = ['group'];
handler.command = /^(linkqr|linkgc|link)$/i; // Risponde a .linkqr, .linkgc o .link

export default handler;
