# UNEC Gaming Club — Discord Botu

## Qovluq strukturu

```
unec-bot/
├── index.js                  ← Ana giriş nöqtəsi (əmr/event-ləri avtomatik yükləyir)
├── package.json
├── .env.example               ← Bunu .env-ə köçür və tokeni yaz
├── config/
│   └── config.js              ← Prefix, log kanal ID-ləri, rənglər BURADA dəyişilir
├── commands/
│   ├── moderation/             ← ban, unban, mute, unmute, kick, warn, warnings, clear
│   └── general/                 ← help, ping, userinfo, serverinfo
├── events/
│   ├── ready.js                 ← Bot işə düşəndə
│   ├── messageCreate.js         ← Əmrləri oxuyur və icra edir
│   └── voiceStateUpdate.js      ← Səs kanalı logları (#ses-log)
├── utils/
│   ├── embeds.js                ← Standart embed şablonları
│   ├── permissions.js           ← İcazə/rol yoxlamaları
│   ├── commandLogger.js         ← Moderasiya loglarını #komanda-log-a göndərir
│   └── warnStorage.js           ← Warn-ları JSON faylda saxlayır
└── data/
    └── warns.json                ← Avtomatik yaranır, warn-lar burada saxlanılır
```

**Niyə bu struktur?** Yeni əmr əlavə etmək üçün sadəcə `commands/moderation/` və ya
`commands/general/` qovluğuna yeni `.js` faylı əlavə etmək kifayətdir — `index.js`-i
dəyişmək lazım deyil, avtomatik yüklənəcək.

## Quraşdırma addımları

### 1. Asılılıqları quraşdır
```bash
npm install
```

### 2. `.env` faylını yarat
```bash
cp .env.example .env
```
Sonra `.env` faylını aç və **YENİ** tokeni (köhnəsini artıq ləğv etməlisən!) yapışdır:
```
DISCORD_TOKEN=sənin_yeni_tokenin
```

### 3. Log kanal ID-lərini `config/config.js`-də təyin et

Discord-da Developer Mode aç (Settings → Advanced → Developer Mode), sonra:
- `#ses-log` kanalına sağ klik → **Copy Channel ID** → `config.js`-də `LOG_CHANNELS.VOICE`-ə yapışdır
- `#komanda-log` kanalına sağ klik → **Copy Channel ID** → `config.js`-də `LOG_CHANNELS.COMMAND`-a yapışdır
- Universitet rollarının veriləcəyi `#rol-al` kanalına sağ klik → **Copy Channel ID** → `config.js`-də `ROLE_CHANNEL_ID`-yə yapışdır

```javascript
LOG_CHANNELS: {
  VOICE: '1234567890123456789',
  COMMAND: '9876543210987654321',
},
ROLE_CHANNEL_ID: '1234567890123456789',
```

`ROLE_CHANNEL_ID` doldurulduqdan sonra bot yenidən başladıqda menyu mesajını yaradacaq və
universitet rolları yoxdursa özü yaradacaq. Botda **Manage Roles** icazəsi olmalı və bot rolu
yaradılan universitet rollarından yuxarıda yerləşməlidir.

### 4. Botu işə sal
```bash
npm start
```
Uzun müddət arxa planda işləməsi üçün (Termux-da tövsiyə olunur):
```bash
npm install -g pm2
pm2 start index.js --name unec-bot
pm2 save
```

## Mövcud əmrlər (həm `ugc!` prefix, həm `/` slash)

| Əmr | Təsvir | Prefix | Slash |
|---|---|---|---|
| `help` | Bütün əmrləri göstərir | `ugc!help [əmr]` | `/help [əmr]` |
| `ping` | Bot gecikməsini göstərir | `ugc!ping` | `/ping` |
| `userinfo` | İstifadəçi məlumatı | `ugc!userinfo [@istifadəçi]` | `/userinfo [istifadəçi]` |
| `serverinfo` | Server məlumatı | `ugc!serverinfo` | `/serverinfo` |
| `ban` | Banlayır | `ugc!ban @istifadəçi [səbəb]` | `/ban istifadəçi [səbəb]` |
| `unban` | Banı götürür | `ugc!unban <ID> [səbəb]` | `/unban istifadeci_id [səbəb]` |
| `kick` | Serverdən çıxarır | `ugc!kick @istifadəçi [səbəb]` | `/kick istifadəçi [səbəb]` |
| `mute` | Susdurur (timeout) | `ugc!mute @istifadəçi [10m/1h/2d] [səbəb]` | `/mute istifadəçi [müddət] [səbəb]` |
| `unmute` | Susdurmanı ləğv edir | `ugc!unmute @istifadəçi [səbəb]` | `/unmute istifadəçi [səbəb]` |
| `warn` | Xəbərdarlıq verir | `ugc!warn @istifadəçi <səbəb>` | `/warn istifadəçi səbəb` |
| `warnings` | Xəbərdarlıq tarixçəsi | `ugc!warnings [@istifadəçi]` | `/warnings [istifadəçi]` |
| `clear` / `purge` | Mesajları silir | `ugc!clear <say>` | `/clear say` |

## Slash əmrləri necə aktivləşdirmək olar?

Slash (`/`) əmrlər Discord-a əvvəlcədən **qeydiyyatdan keçirilməlidir** — bu, prefix
əmrlərdən fərqli olaraq avtomatik olmur. Bunu **bir dəfə** (və hər dəfə yeni əmr
əlavə edəndə) işlətməlisən:

### 1. `.env`-ə əlavə lazımdır
```
CLIENT_ID=sənin_application_id (Developer Portal -> General Information -> Application ID)
GUILD_ID=sənin_server_id (test üçün tövsiyə olunur, dərhal aktivləşir)
```
`GUILD_ID`-ni boş buraxsan əmrlər QLOBAL qeydiyyatdan keçir (bütün serverlərdə işləyər,
amma yayılması Discord tərəfindən ~1 saata qədər çəkə bilər). Test zamanı `GUILD_ID`
yazmaq daha rahatdır, çünki dəyişikliklər saniyələr içində görünür.

### 2. Qeydiyyat skriptini işlət
```bash
node deploy-commands.js
```
Uğurlu olarsa, terminalda bütün qeydiyyatdan keçən əmrlərin siyahısını görəcəksən.

### 3. Botu (yenidən) başlat
```bash
npm start
```
Discord-da `/` yazanda indi əmrlər görünəcək.

## Yeni əmr necə əlavə edilir?

`commands/moderation/` və ya `commands/general/` qovluğuna yeni fayl yarat, məsələn `commands/moderation/softban.js`:

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'softban',
  category: 'Moderasiya',
  description: 'Təsvir buraya',
  usage: 'softban @istifadəçi [səbəb]',

  // Slash əmr üçün (istəyə bağlı — silsən əmr yalnız prefix ilə işləyər)
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Təsvir buraya')
    .addUserOption((o) => o.setName('istifadeci').setDescription('...').setRequired(true)),

  // Prefix (ugc!softban)
  async execute(message, args, client) {
    // məntiq buraya
  },

  // Slash (/softban)
  async executeSlash(interaction, client) {
    // məntiq buraya
  },
};
```

Botu yenidən başlat (`pm2 restart unec-bot`) — prefix versiyası dərhal işləyəcək və `help`-də
görünəcək. Slash versiyası üçün əlavə olaraq `node deploy-commands.js` işlətməlisən (yeni
əmrin Discord-a bildirilməsi üçün).

## Təhlükəsizlik qeydləri

- `.env` faylını **heç vaxt** GitHub-a və ya başqa yerə yükləmə (`.gitignore`-da artıq istisna edilib)
- Əgər token təsadüfən kiməsə göstərilib/paylaşılıbsa, dərhal Developer Portal → Bot → **Reset Token** et
- Moderasiya əmrləri yalnız müvafiq Discord icazələrinə (Ban Members, Kick Members, Moderate Members) malik rollar tərəfindən istifadə oluna bilər — bu, Discord-un öz icazə sistemi ilə tənzimlənir, əlavə kod lazım deyil
