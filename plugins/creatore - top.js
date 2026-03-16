// --- DEBUG TOTALE: Inseriscilo subito dopo la creazione del client ---

client.on('message_create', (msg) => {
    // Questo evento cattura TUTTI i messaggi, inclusi quelli inviati dal bot stesso
    console.log(`[DEBUG EVENTO] Ricevuto messaggio da: ${msg.fromMe ? 'ME' : msg.author}`);
    console.log(`[DEBUG EVENTO] Contenuto: ${msg.body}`);
});

client.on('message', async msg => {
    console.log(`[DEBUG EVENTO] Messaggio normale ricevuto: ${msg.body}`);
    
    // Proviamo a forzare la risposta a QUALSIASI messaggio per testare
    if (msg.body === '.test') {
        await msg.reply('Il bot funziona!');
        console.log("[DEBUG] Test riuscito!");
    }
});
