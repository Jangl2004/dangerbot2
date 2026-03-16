const { List } = require('whatsapp-web.js');

// --- ESEMPIO FUNZIONE DATABASE (Sostituisci con il tuo DB reale) ---
function getTop(n) {
    // Esempio fittizio di dati ordinati
    const dati = [
        { nome: "Mario", count: 120 }, { nome: "Luigi", count: 110 },
        { nome: "Peach", count: 100 }, { nome: "Bowser", count: 90 },
        { nome: "Toad", count: 80 }, { nome: "Yoshi", count: 70 },
        { nome: "Wario", count: 60 }, { nome: "Waluigi", count: 50 },
        { nome: "Daisy", count: 40 }, { nome: "Rosalinda", count: 30 }
    ];
    return dati.slice(0, n)
        .map((u, i) => `${i + 1}. ${u.nome} - *${u.count} messaggi*`)
        .join('\n');
}

// --- LOGICA DEL BOT ---
client.on('message', async msg => {
    
    // 1. Comando iniziale .top
    if (msg.body === '.top') {
        const top3 = getTop(3);

        const list = new List(
            `🏆 *Classifica Messaggi (Top 3)*\n\n${top3}\n\n*Usa il menù sotto per vedere più posizioni:*`,
            '📊 Vedi Classifica',
            [{
                title: 'Opzioni Classifica',
                rows: [
                    { title: 'Top 3', id: 'top3', description: 'Vedi i primi 3' },
                    { title: 'Top 5', id: 'top5', description: 'Vedi i primi 5' },
                    { title: 'Top 10', id: 'top10', description: 'Vedi i primi 10' }
                ]
            }],
            'Seleziona il numero di utenti',
            'Bot Footer'
        );

        await client.sendMessage(msg.from, list);
    }

    // 2. Gestione della risposta ai bottoni (List Response)
    if (msg.type === 'list_response') {
        const id = msg.selectedRowId; // Questo recupera 'top3', 'top5' o 'top10'

        if (id === 'top3') {
            await msg.reply(`🏆 *Top 3:*\n\n${getTop(3)}`);
        } else if (id === 'top5') {
            await msg.reply(`📊 *Top 5:*\n\n${getTop(5)}`);
        } else if (id === 'top10') {
            await msg.reply(`📈 *Top 10:*\n\n${getTop(10)}`);
        }
    }
});
