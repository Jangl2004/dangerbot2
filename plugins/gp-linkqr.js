const linkGroupPlugin = async (sock, m, isGroup, isAdmins, isBotAdmins) => {
    // 1. Identificazione del comando
    const prefix = '.'; 
    const budy = (typeof m.text == 'string' ? m.text : '');
    const command = budy.toLowerCase().split(' ')[0] || '';

    if (command === prefix + 'linkqr' || command === prefix + 'link') {
        
        console.log(`[COMMAND] Richiesta link gruppo da: ${m.pushName}`);

        // --- INIZIO CONTROLLI DI SICUREZZA ---
        
        // Controllo se siamo in un gruppo
        if (!isGroup) {
            return sock.sendMessage(m.chat, { 
                text: "❌ *ERRORE CRITICO*\n\nQuesto comando è progettato per funzionare esclusivamente all'interno di un gruppo WhatsApp." 
            }, { quoted: m });
        }

        // Controllo se l'utente che scrive è un amministratore
        if (!isAdmins) {
            return sock.sendMessage(m.chat, { 
                text: "⚠️ *ACCESSO NEGATO*\n\nSolo gli amministratori del gruppo possono generare il link d'invito ufficiale." 
            }, { quoted: m });
        }

        // Controllo se il BOT è amministratore
        if (!isBotAdmins) {
            return sock.sendMessage(m.chat, { 
                text: "🚫 *BOT NON AUTORIZZATO*\n\nPer generare il link, il bot deve essere promosso ad *Amministratore*. Senza i permessi di sistema, WhatsApp blocca la richiesta." 
            }, { quoted: m });
        }

        // --- GENERAZIONE DEL LINK ---

        try {
            // Recupero dati del gruppo per rendere il messaggio più bello
            const groupMetadata = await sock.groupMetadata(m.chat);
            const participants = groupMetadata.participants;
            const groupName = groupMetadata.subject;
            const owner = groupMetadata.owner || "Non disponibile";

            // Richiesta codice d'invito a WhatsApp
            const responseCode = await sock.groupInviteCode(m.chat);
            const fullLink = `https://chat.whatsapp.com/${responseCode}`;

            // Costruzione del messaggio finale (Lungo ed estetico)
            let messageText = `┏━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            messageText += `┃ 🛡️ *GESTORE LINK GRUPPO*\n`;
            messageText += `┃━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            messageText += `┃ 📝 *Nome:* ${groupName}\n`;
            messageText += `┃ 👥 *Membri:* ${participants.length}\n`;
            messageText += `┃ 👑 *Creatore:* ${owner.split('@')[0]}\n`;
            messageText += `┃ 🔗 *Link:* ${fullLink}\n`;
            messageText += `┗━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            messageText += `> _Generato automaticamente dal sistema di gestione bot._`;

            // Invio del messaggio con anteprima
            await sock.sendMessage(m.chat, {
                text: messageText,
                contextInfo: {
                    externalAdReply: {
                        title: "LINK D'INVITO DISPONIBILE",
                        body: groupName,
                        mediaType: 1,
                        sourceUrl: fullLink,
                        thumbnailUrl: "https://i.imgur.com/6hS7L6v.png", // Immagine generica se non hai FFmpeg
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error("ERRORE GENERAZIONE LINK:", err);
            await sock.sendMessage(m.chat, { 
                text: "❗ *ERRORE TECNICO*\n\nNon è stato possibile recuperare il link. Il gruppo potrebbe avere restrizioni di privacy elevate o il server WhatsApp è temporaneamente sovraccarico." 
            }, { quoted: m });
        }
    }
};

export default linkGroupPlugin;
