const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");
// lourity?
module.exports = {
    name: "davet-sıfırla",
    description: 'Davet sistemini sıfırlarsın.',
    type: 1,
    options: [],
    run: async (client, interaction) => {

        const permission_embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Davet sistemini ayarlayabilmek için **Yönetici** yetkisine sahip olmalısın!")

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [permission_embed], ephemeral: true })

        const nodata_embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Davet log sistemi zaten sıfırlanmış!")

        if (!db.get(`davetLog_${interaction.guild.id}`)) return interaction.reply({ embeds: [nodata_embed], ephemeral: true })

        const deleted_embed = new EmbedBuilder()
            .setColor("Red")
            .setAuthor({ name: `${interaction.user.username} tarafından`, iconURL: interaction.user.avatarURL() })
            .setDescription(`> Davet log sistemi başarıyla sıfırlandı!`)
            .setThumbnail(interaction.user.avatarURL())

        db.delete(`davetLog_${interaction.guild.id}`)
        return interaction.reply({ embeds: [deleted_embed] })
    }
}