const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");
// lourity?
module.exports = {
    name: "davetlerim",
    description: 'Toplam davet sayısını gösterir.',
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Kimin davet sayısına bakmak istersin?",
            type: 6,
            required: false
        },
    ],
    run: async (client, interaction) => {

        const invite_user = interaction.options.getUser("kullanıcı")

        if (!invite_user) {
            const inviteCount = db.get(`inviteCount_${interaction.user.id}_${interaction.guild.id}`) || "0"
            const inviteRemoveCount = db.get(`inviteRemoveCount_${interaction.user.id}_${interaction.guild.id}`) || "0"

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${interaction.user.username} davet verileri`, iconURL: interaction.user.avatarURL() })
                .setDescription(`> Davet Verileri;`)
                .addFields(
                    { name: "Toplam Davet:", value: `\`\`\`${Number(inviteCount) + Number(inviteRemoveCount)}\`\`\``, inline: true },
                    { name: "Toplam Gerçek Davet:", value: `\`\`\`${inviteCount}\`\`\``, inline: true },
                    { name: "Toplam Fake Davet:", value: `\`\`\`${inviteRemoveCount}\`\`\``, inline: true },
                )

            return interaction.reply({ embeds: [invite_embed] })
        } else {
            const inviteCount = db.get(`inviteCount_${invite_user.id}_${interaction.guild.id}`) || "0"
            const inviteRemoveCount = db.get(`inviteRemoveCount_${invite_user.id}_${interaction.guild.id}`) || "0"

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${invite_user.username} davet verileri`, iconURL: invite_user.avatarURL() })
                .setDescription(`> Davet Verileri;`)
                .addFields(
                    { name: "Toplam Davet:", value: `\`\`\`${Number(inviteCount) + Number(inviteRemoveCount)}\`\`\``, inline: true },
                    { name: "Toplam Gerçek Davet:", value: `\`\`\`${inviteCount}\`\`\``, inline: true },
                    { name: "Toplam Fake Davet:", value: `\`\`\`${inviteRemoveCount}\`\`\``, inline: true },
                )
                .setFooter({ text: `${interaction.user.username} tarafından istendi`, iconURL: interaction.user.avatarURL() })

            return interaction.reply({ embeds: [invite_embed] })
        }
    }
}