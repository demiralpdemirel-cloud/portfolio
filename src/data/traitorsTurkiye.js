// Official facts checked 2026-10-15. Personal role comes only from the artist's brief.
export const traitorsCredit = {
  title: 'THE TRAITORS TÜRKİYE', period: '2026',
  role: ['COMPOSITING ARTIST'], highlights: ['COMPOSITING'],
  summary: { en: 'I worked as a Compositing Artist on the production’s post-production team.', tr: 'Bu yapımın post-prodüksiyon sürecinde Compositing Artist olarak görev aldım.' },
}

const officialArtwork = 'https://shinemedya.com/uploads/traitors-hero.png'
const sizedArtwork = width => `https://shinemedya.com/_next/image?url=%2Fuploads%2Ftraitors-hero.png&w=${width}&q=75`
export const traitorsDetails = {
  type: 'REALITY COMPETITION', firstReleaseYear: 2026, broadcastYears: '2026',
  // Television premiere, not an assertion of the digital platform's earliest date.
  releaseStart: '2026-03-26', premiereLabel: 'KANAL D PREMIERE',
  country: 'Türkiye', language: 'Turkish', genre: 'REALITY / STRATEGY',
  broadcaster: 'Kanal D', platform: 'Prime Video', host: 'Giray Altınok',
  director: 'Tamer İpek', producers: ['Adil Şentekin', 'Timuçin Güner'],
  productionCompany: 'Shine Medya', studio: 'IDTV ant RTL',
  contestants: ['Yaren Alaca', 'Yiğit Poyraz', 'Pascal Nouma', 'Saadet Özsırkıntı', 'İlkay Buharalı', 'Cem Avnayim', 'Mert Öztürk', 'Selim Yuhay', 'Ayliz Yaşar', 'Özgür Balakar', 'Öykü Berkan', 'Hülya Uğur', 'Emre Uzunboy', 'Emir Elidemir', 'Yusuf Güney', 'Yasemin Yılmaz', 'Yasemin Yürük', 'Melih Kunukçu', 'Tara de Vries'],
  productionDescription: {
    en: 'The Traitors Türkiye brings familiar personalities to a secluded castle for a reality competition built around strategy and trust. Shared missions grow a communal prize fund, while the group tries to identify the hidden Traitors. Giray Altınok hosts the Turkish adaptation, shown on Kanal D and available on Prime Video.',
    tr: 'The Traitors Türkiye, farklı alanlarda tanınan yarışmacıları gizemli bir kalede buluşturan strateji ve güven odaklı bir reality yarışmasıdır. Yarışmacılar ortak görevlerle ödül havuzunu büyütürken aralarındaki hainleri bulmaya çalışır. Giray Altınok’un sunduğu Türkiye uyarlaması Kanal D’de yayınlanmış ve Prime Video’da izleyiciyle buluşmuştur.',
  },
  image: officialArtwork, imageWidth: 1920, imageHeight: 1080,
  imageAlt: 'The Traitors Türkiye — official Shine Medya promotional artwork with Giray Altınok and the contestants',
  imageSource: 'Shine Medya — official promotional artwork (external source)',
  imageSourceUrl: 'https://shinemedya.com/programlar',
  imageSrcSet: [640, 1080, 1920].map(width => `${sizedArtwork(width)} ${width}w`).join(', '),
  // No local redistribution: permission for a local poster/derivative is not established.
  remoteArtwork: true, thumbnail: sizedArtwork(640), thumbnailLarge: sizedArtwork(1080),
  artworkRights: 'External official-source reference only; local redistribution permission not verified. No separate vertical poster verified.',
  officialTrailer: { youtubeId: 'KvXFaC8L7H4', watchUrl: 'https://www.youtube.com/watch?v=KvXFaC8L7H4', poster: officialArtwork },
  officialLinks: [
    { label: 'KANAL D — OFFICIAL PROJECT ↗', url: 'https://www.kanald.com.tr/the-traitors-turkiye' },
    { label: 'PRIME VIDEO — OFFICIAL PROJECT ↗', url: 'https://www.primevideo.com/-/cs/detail/0GLLJ8FCA3CD8UWC34CVDJ660Q' },
    { label: 'WATCH OFFICIAL TRAILER ↗', url: 'https://www.youtube.com/watch?v=KvXFaC8L7H4' },
  ],
  researchedAt: '2026-10-15', hideUnknownFields: true, creditSource: 'USER VERIFIED',
  sourceNotes: [
    { fields: ['director', 'producers', 'studio', 'year'], url: 'https://www.primevideo.com/-/cs/detail/0GLLJ8FCA3CD8UWC34CVDJ660Q' },
    { fields: ['host', 'contestants', 'television premiere', 'format'], url: 'https://www.kanald.com.tr/the-traitors-turkiye/haber/the-traitors-turkiyenin-lansmani-yapildi' },
    { fields: ['productionCompany', 'broadcaster', 'platform'], url: 'https://www.kanald.com.tr/the-traitors-turkiye/haber/girayin-bu-yuzunu-hic-gormediniz' },
    { fields: ['official artwork', 'productionCompany', 'host'], url: 'https://shinemedya.com/programlar' },
    { fields: ['official trailer', 'KanalD channel identity'], url: 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=KvXFaC8L7H4&format=json' },
  ],
}
