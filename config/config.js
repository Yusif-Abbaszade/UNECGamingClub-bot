// ============================================
//  UNEC GAMING CLUB BOT — Konfiqurasiya
// ============================================
// Bu fayldakı ID-ləri öz serverinə uyğun dəyişdirməlisən.
// Kanal ID-sini almaq üçün: Discord Settings → Advanced → Developer Mode aç,
// sonra kanala sağ klik → "Copy Channel ID"

module.exports = {
  // Əmr prefiksi (ugc!help, ugc!ban və s.)
  PREFIX: 'ugc!',

  // Uğurlu əmrlər üçün reaksiya: custom emoji ID-si və ya Unicode emoji
  SUCCESS_REACTION: '1528126777388699678',

  // Rol etiketləri zamanı istifadə olunacaq reaksiya və öncədən müəyyənləşdirilmiş rol adları
  ROLE_MENTION_REACTION: '1551180942536609863',
  ROLE_FORWARD_ROLE_NAMES: ['Admin', 'Zarzigle'],

  // Bot hazır olduqda avtomatik qoşulacağı səs kanalının ID-si
  AUTO_VOICE_CHANNEL_ID: '1547924314316083281',

  // Universitet rollarının veriləcəyi kanalın ID-si
  ROLE_CHANNEL_ID: '1548827326505156718',

  // Tweet-lərin paylaşılacağı kanalın ID-si
  TWEET_CHANNEL_ID: '1549415625107963957',

  // Aktivlik statistikalarının toplanacağı ümumi söhbət kanalı
  GENERAL_CHAT_CHANNEL_ID: process.env.GENERAL_CHAT_CHANNEL_ID || '1515810214962663445',
  GENERAL_CHAT_CHANNEL_NAME: 'umumi-sohbet',

  // Yeni üzvlərə qarşılama mesajlarının göndəriləcəyi kanal
  WELCOME_CHANNEL_ID: '1551171380224069632',

  // Bir istifadəçinin bu müddət ərzində göndərdiyi mesajlar spam sayılır
  SPAM_WINDOW_MS: 5000,
  SPAM_MESSAGE_LIMIT: 4,
  SPAM_TIMEOUT_MS: 30 * 1000,

  // Log kanalları
  LOG_CHANNELS: {
    VOICE: '1547750106399383673',      // #ses-log — səs kanalı giriş/çıxış logları
    COMMAND: '1547750145725038693', // #komanda-log — ban/mute/kick və s. moderasiya logları
  },

  // Rənglər (embed üçün)
  COLORS: {
    SUCCESS: 0x57F287, // yaşıl
    ERROR: 0xED4245,   // qırmızı
    WARN: 0xFEE75C,    // sarı
    INFO: 0x5865F2,    // Discord bənövşəyi-mavi
    JOIN: 0x57F287,
    LEAVE: 0xED4245,
  },

  // Standart mute (timeout) müddəti (millisaniyə) — əmrdə vaxt göstərilməzsə istifadə olunur
  DEFAULT_MUTE_MS: 10 * 60 * 1000, // 10 dəqiqə

  // Botun "footer" imzası
  FOOTER_TEXT: 'Created by Zarzigle',
};
