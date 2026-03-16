// Funzione per calcolare e formattare la Top 5
function getTop5() {
    // Qui andrà la logica che legge i dati dal tuo database/JSON
    const dati = [
        { nome: "Mario", count: 120 }, { nome: "Luigi", count: 110 },
        { nome: "Peach", count: 100 }, { nome: "Bowser", count: 90 },
        { nome: "Toad", count: 80 }
    ];
    
    return "🏆 *Classifica Top 5 Membri:*\n\n" + 
           dati.map((u, i) => `${i + 1}. ${u.nome} - *${u.count} messaggi*`).join('\n');
}

// Listener del messaggio
client.on('message', async msg => {
    if (msg.body === '.top') {
        const classifica = getTop5();
        await client.sendMessage(msg.from, classifica);
    }
});
