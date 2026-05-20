const fs = require('fs')
require('dotenv').config();
const token = process.env.BOT_TOKEN;
const {Client, Events, GatewayIntentBits } = require('discord.js');


const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]

});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Bot ${readyClient.user.tag} telah aktif!!`);
})

//Menghapus pesan toxic
function normalizeText(text){
    if (/^\d+$/.test(text.replace(/\s/g, ''))) {
        return text; 
    }
    return text
        .toLowerCase()
        .replace(/1/g, 'i')
        .replace(/3/g, 'e','b')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/9/g, 'g')
        .replace(/0/g, '0')
        .replace(/8/g, 'b')
        .replace(/7/g, 't')
        .replace(/[^a-z]/gi, '')
        .replace(/(.)\1+/g, '$1')
}

client.on('messageCreate', async (message)=> {
    if (message.author.bot) return

    let katakasar = [];
    try {
        const rawData = fs.readFileSync('./katakasar.json', 'utf8');
        const parsedData = JSON.parse(rawData);
        // Hanya ambil kata yang panjangnya minimal 2 huruf untuk menghindari salah hapus
        katakasar = parsedData.katakasar.filter(w => w.trim().length > 2);
    } catch (err) {
        return console.error("Gagal membaca words.json:", err.message);
    }


    const original_message = message.content.toLowerCase();
    const clean_message = normalizeText(original_message)
    const kata_buruk = katakasar.find(word => { 
        const target = word.toLowerCase().trim()
        const regexOri = new RegExp(`\\b${target}\\b`, 'i')
        const regexNormalized = new RegExp(target, 'i')
        return regexOri.test(original_message) || regexNormalized.test(clean_message)
    })

    if (kata_buruk) {
        try {
            // Hapus pesan tersebut
            await message.delete();

            // Beri peringatan ke user (opsional)
            const warning = await message.channel.send(`⚠️ ${message.author}, tolong berkata lebih sopan!!!.`);
            
            // Hapus pesan peringatan bot setelah 5 detik agar channel tetap bersih
            setTimeout(() => warning.delete(), 5000);
            
        } catch (error) {
            console.error('Gagal menghapus pesan:', error);
        }
    }
})

client.login(token);