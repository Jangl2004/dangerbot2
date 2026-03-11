// Assumiamo che 'userStats' sia l'oggetto visto prima
// userStats[groupId] = { "39xxx": { totalTime: 12345, ... }, "39yyy": { ... } }

client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const groupId = chat.id._serialized;

    if (msg.body === '.timetop') {
        if (!userStats[groupId]) {
            return msg.reply("Nessun dato registrato per questo gruppo.");
        }

        // 1. Convertiamo l'oggetto in un array per poterlo ordinare
        let leaderboard = Object.keys(userStats[groupId]).map(userId => {
            return {
                id: userId,
                time: userStats[groupId][userId].totalTime
            };
        });

        // 2. Ordiniamo dal più attivo al meno attivo
        leaderboard.sort((a, b) => b.time - a.time);

        // 3. Creiamo il messaggio della classifica (Top 10)
        let response = `🏆 *CLASSIFICA TEMPO ONLINE* 🏆\n\n`;
        
        leaderboard.slice(0, 10).forEach((user, index) => {
            const totalSeconds = Math.floor(user.time / 1000);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            
            const timeStr = `${h}h ${m}m`;
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤";
            
            response += `${medal} ${index + 1}. @${user.id.split('@')[0]} - *${timeStr}*\n`;
        });

        // Invio con menzioni per far funzionare i tag
        await chat.sendMessage(response, { 
            mentions: leaderboard.slice(0, 10).map(u => u.id) 
        });
    }
});
