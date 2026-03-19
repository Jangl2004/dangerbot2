/**
 * PLUGIN: .linkqr (Versione Debug Avanzata)
 * SCOPO: Capire perché il comando non viene letto sulla VPS
 */

const handler = async (m, { sock, isGroup, isAdmins, isBotAdmins, participants }) => {
    // 1. LOG DI ENTRATA: Se vedi questo nel terminale, il plugin è caricato!
    console.log("--- [DEBUG] Comando .linkqr attivato ---");

    try {
        // 2. Controllo Gruppo
        if (!isGroup) {
            console.log("--- [DEBUG] Fallito: Non è un gruppo");
            return await sock.sendMessage(m.chat, { text: "❌ Usa questo comando in un gruppo!" }, { quoted: m });
        }

        // 3. Controllo se il Bot è Admin
        console.log("--- [DEBUG] Verifica permessi Bot Admin...");
        if (!isBotAdmins) {
            console.log("--- [DEBUG] Fallito: Il bot non è admin");
            return await sock.sendMessage(m.chat, { text: "⚠️ Promuovi il bot ad Admin per avere il link!" }, { quoted: m });
        }

        // 4. Recupero Codice d'Invito
        console.log("--- [DEBUG] Tentativo recupero codice da WhatsApp...");
        const code = await sock.groupInviteCode(m.chat);
        
        if (!code) {
            console.log("--- [DEBUG] Fallito: WhatsApp non ha restituito il codice");
            return await sock.sendMessage(m.chat, { text: "❌ Impossibile generare il codice." }, { quoted: m });
        }

        const link = `https://chat.whatsapp.com/${code}`;
        console.log(`--- [DEBUG] Link generato con successo: ${link}`);

        // 5. Costruzione Messaggio Estetico Lungo
        let longMessage = `*╭───────────────╮*\n`;
        longMessage += `*│ 🔗 LINK DEL GRUPPO*\n`;
        longMessage += `*╰───────────────╯*\n\n`;
        longMessage += `*📢 Info Gruppo:* ${m.chat}\n`;
        longMessage += `*👥 Totale Membri:* ${participants.length}\n\n`;
        longMessage += `*🔗 Link d'invito:*\n${link}\n\n`;
        longMessage += `_Il link è stato generato su richiesta di: @${m.sender.split('@')[0]}_\n`;
        longMessage += `_Assicurati di non inviarlo a sconosciuti._`;

        // 6. Invio
        await sock.sendMessage(m.chat, { 
            text: longMessage,
            mentions: [m.sender] 
        }, { quoted: m });

        console.log("--- [DEBUG] Messaggio inviato correttamente! ---");

    } catch (e) {
        // 7. LOG ERRORE CRITICO
        console.log("--- [DEBUG] ERRORE NEL PLUGIN: ---");
        console.error(e);
        await sock.sendMessage(m.chat, { text: "❗ Errore durante l'esecuzione del comando." }, { quoted: m });
    }
};

// Configurazione per far capire al bot quando attivarsi
handler.help = ['linkqr'];
handler.tags = ['group'];
handler.command = /^(linkqr|link)$/i; // Risponde a .linkqr e .link
handler.group = true; // Forza il comando solo nei gruppi
handler.admin = false; // Metti true se vuoi che solo gli admin possano usarlo

export default handler;
