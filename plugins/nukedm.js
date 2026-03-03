/*
  =============================================================
  PLUGIN: .nuke (Nuke con Messaggio Personalizzato)
  DESCRIZIONE: Un comando riservato all'Owner, da usare in DM.
               1. L'Owner invia ".nuke <messaggio>"
               2. Il bot salva il messaggio e mostra i gruppi.
               3. L'Owner clicca un gruppo.
               4. Il bot invia il messaggio e nukka il gruppo.
  =============================================================
*/

// Stato in memoria per memorizzare il messaggio personalizzato
// (Proprio come 'sceltaPizza' in pizza.js)
const nukeQueue = {}; // Cache: { 'user_jid': 'messaggio da inviare' }

const delay = time => new Promise(res => setTimeout(res, time));

let handler = async (m, { conn, text: rawText, usedPrefix, isOwner, isBotAdmin }) => {
    
    // --- 1. Parsing Input (Stile Pizza.js) ---
    const btnId = m?.message?.buttonsResponseMessage?.selectedButtonId || "";
    const text = m.text || btnId || rawText || "";
    
    // Estrai il comando base (dovrebbe essere 'nuke')
    const [command, ...args] = text.replace(usedPrefix, "").trim().split(/\s+/);

    // Se non è il comando nuke, ignora
    if (command !== 'nuke') return; 

    // --- 2. Controlli Iniziali (Fondamentali) ---
    if (!isOwner) return m.reply("Questo comando è riservato al mio Owner.");
    if (m.isGroup) return m.reply("Questo comando deve essere usato nella mia chat privata (DM).");

    const action = (args[0] || 'menu').toLowerCase();
    const value = args[1] || "";
    const message = args.join(' '); // Messaggio o "confirm <group_id>"

    // --- 3. Logica di Esecuzione (Fase 2: Conferma Nuke) ---
    // Questo blocco si attiva quando l'Owner clicca un pulsante
    if (action === 'confirm' && value) {
        const groupJid = value; // Questo è l'ID del gruppo
        const storedMessage = nukeQueue[m.sender]; // Recupera il messaggio

        if (!storedMessage) {
            return m.reply("Errore. Il tuo messaggio personalizzato è scaduto. Riprova da capo con `.nuke <messaggio>`.");
        }
        
        await m.reply(`✅ *Ordine ricevuto.* Sto inviando il messaggio e avviando la procedura Nuke per il gruppo ${groupJid}.`);

        // 1. Invia il messaggio personalizzato nel gruppo target
        try {
            await conn.sendMessage(groupJid, { text: storedMessage });
        } catch (e) {
            await m.reply(`Non sono riuscito a inviare il messaggio al gruppo. Abortisco. (Errore: ${e.message})`);
            delete nukeQueue[m.sender]; // Pulisci la coda
            return;
        }

        // 2. Attendi 3 secondi per dare il tempo di leggere
        await delay(3000); 
        
        // 3. Esegui il Nuke (Stile Aggressivo)
        let participants;
        try {
            const groupMeta = await conn.groupMetadata(groupJid);
            // Logica aggressiva: rimuovi TUTTI tranne il bot stesso
            participants = groupMeta.participants
                .filter(p => p.id !== conn.user.jid)
                .map(p => p.id);

            if (participants.length === 0) {
                await m.reply("Nuke completato (o non c'erano membri da rimuovere).");
                delete nukeQueue[m.sender];
                return;
            }

            // Esegui la rimozione di massa (come nel tuo codice originale)
            await conn.groupParticipantsUpdate(groupJid, participants, 'remove');
            await m.reply(`*Nuke eseguito con successo.* Tentativo di rimozione di ${participants.length} membri.`);

        } catch (e) {
            await m.reply(`*Nuke fallito.* Il tentativo di rimozione di massa è stato bloccato (probabilmente perché ho cercato di rimuovere un admin). Errore: ${e.message}`);
        }
        
        // Pulisci la coda
        delete nukeQueue[m.sender];
        return;
    }

    // --- 4. Logica di Avvio (Fase 1: Invio .nuke <messaggio>) ---
    
    // Se l'azione non è 'confirm' e il messaggio è vuoto, chiedi il messaggio.
    if (!message || action === 'menu') {
        return m.reply(`Sintassi errata. Devi specificare il messaggio da inviare prima del Nuke.\n\nEsempio:\n*${usedPrefix}nuke Ashley ti amo*`);
    }

    // Se siamo qui, l'utente ha inviato ".nuke <messaggio>"
    const customMessage = message;
    nukeQueue[m.sender] = customMessage; // Salva il messaggio nello "stato"
    
    // Recupera la lista dei gruppi
    let groups;
    try {
        groups = Object.values(await conn.groupFetchAllParticipating());
    } catch (e) {
        return m.reply("Impossibile recuperare la lista dei gruppi. Riprova.");
    }

    // Filtra solo i gruppi dove il bot è admin
    const adminGroups = groups.filter(g => g.participants.find(p => p.id === conn.user.jid)?.admin);

    if (adminGroups.length === 0) {
        delete nukeQueue[m.sender];
        return m.reply("Non sono admin in nessun gruppo. Impossibile procedere.");
    }
    
    await m.reply(`Messaggio salvato: "*${customMessage}*"\n\n🚨 *ATTENZIONE OWNER* 🚨\nSeleziona il gruppo da Nukkare. Questa azione è irreversibile. Il messaggio verrà inviato 3 secondi prima della rimozione.`);

    // Crea i pulsanti (Stile Pizza.js)
    const buttons = adminGroups.map(group => ({
        // L'ID del pulsante ora invia un comando valido che l'handler può ri-catturare
        buttonId: `${usedPrefix}nuke confirm ${group.id}`, 
        buttonText: { displayText: `💥 ${group.subject.substring(0, 20)}... (${group.participants.length} membri)` }, 
        type: 1
    }));
    
    // Limita i pulsanti se sono troppi (limite di WhatsApp)
    if (buttons.length > 10) {
         await conn.sendMessage(m.chat, { 
            text: `Sono admin in ${buttons.length} gruppi. Mostro solo i primi 10.`, 
            buttons: buttons.slice(0, 10), 
            headerType: 1 
        }, { quoted: m });
    } else {
         await conn.sendMessage(m.chat, { 
            text: "Seleziona un gruppo target dalla lista:", 
            buttons: buttons, 
            headerType: 1 
        }, { quoted: m });
    }
}

handler.command = /^(nuke|nukeall)$/i; // Cattura .nuke e alias
handler.owner = true; // Solo Owner
handler.private = true; // Solo in DM (il check m.isGroup lo rafforza)
handler.tags = ['owner'];
handler.help = ['nuke <messaggio>'];

export default handler;
