const { List } = require('whatsapp-web.js');

client.on('message', async msg => {
    // Comando .top
    if (msg.body.trim().toLowerCase() === '.top') {
        
        // 1. Definiamo la lista dei bottoni (stile "Mostra Top 10")
        const listaBottoni = new List(
            '🏆 *TOP 5 ATTIVITÀ (MESSAGGI) OGGI*\n📅 2026-03-16\n\n1. Mario - 50 msg\n2. Luigi - 45 msg\n3. Peach - 40 msg\n4. Bowser - 35 msg\n5. Toad - 30 msg\n\nClicca sotto per la classifica estesa',
            '📊 Mostra Top 10', // Testo del bottone principale
            [{
                title: 'Opzioni Classifica',
                rows: [
                    { title: 'Mostra Top 10', id: 'top10', description: 'Vedi i primi 10 membri' }
                ]
            }],
            'Classifica Messaggi', // Titolo del menù
            'Footer del Bot' // Testo in basso
        );

        await client.sendMessage(msg.from, listaBottoni);
    }

    // 2. Gestione al click del bottone "Mostra Top 10"
    if (msg.type === 'list_response') {
        if (msg.selectedRowId === 'top10') {
            await msg.reply('📈 *Ecco la Top 10 estesa:* ... (qui metti la tua lista)');
        }
    }
});
