// --- 1. FUNZIONE PER RECUPERARE I DATI ---
function getTop5() {
    try {
        // Qui simulo i dati. Se usi un file JSON, assicurati di leggere il file correttamente
        const dati = [
            { nome: "Mario", count: 120 }, { nome: "Luigi", count: 110 },
            { nome: "Peach", count: 100 }, { nome: "Bowser", count: 90 },
            { nome: "Toad", count: 80 }
        ];
        
        return "🏆 *Classifica Top 5 Membri:*\n\n" + 
               dati.map((u, i) => `${i + 1}. ${u.nome} - *${u.count} messaggi*`).join('\n');
    } catch (err) {
        console.error("[DEBUG] Errore nella funzione getTop5:", err);
        return "❌ Errore nel caricamento della classifica.";
    }
}

// --- 2. LISTENER CON DEBUG ---
client.on('message', async msg => {
    // Debug iniziale: vediamo cosa arriva al bot
    console.log(`[DEBUG] Ricevuto: "${msg.body}" da: ${msg.from}`);

    // Pulizia stringa: rimuove spazi extra e converte in minuscolo
    const comando = msg.body.trim().toLowerCase();

    if (comando === '.top') {
        console.log("[DEBUG] Comando .top rilevato. Elaborazione...");
        
        try {
            const classifica = getTop5();
            await msg.reply(classifica);
            console.log("[DEBUG] Messaggio di risposta inviato con successo.");
        } catch (error) {
            console.error("[DEBUG] Errore nell'invio della risposta:", error);
        }
    } else {
        // Log utile per capire se il bot ignora il comando perché non coincide
        console.log(`[DEBUG] Messaggio ignorato: non corrisponde a '.top'`);
    }
});
