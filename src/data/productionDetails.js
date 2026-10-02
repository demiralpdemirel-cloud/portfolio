// Public metadata researched 2026-10-02. Ratings are indexed IMDb snapshots,
// not a live API; missing/blocked values remain null. Work credits come ONLY
// from experience.js and the user's existing credit audit, never public cast data.
const researchedAt = '2026-10-02'
const imdb = (id, rating = null) => ({ imdbTitleId: id, imdbUrl: `https://www.imdb.com/title/${id}/`, imdbRating: rating, imdbRatingAsOf: rating === null ? null : researchedAt, imdbRatingSource: rating === null ? null : `https://www.imdb.com/title/${id}/ratings/`, ratingMethod: 'static indexed IMDb snapshot', researchedAt })
const image = (name, width, height, source, sourceUrl, assetUrl) => ({ image: `/media/productions/${name}.webp`, imageWidth: width, imageHeight: height, imageSource: source, imageSourceUrl: sourceUrl, imageAssetUrl: assetUrl })

export const productionDetails = {
  'EŞREF RÜYA': {
    ...imdb('tt35069642', 6.7), type: 'TV SERIES', firstReleaseYear: 2025, releaseStart: '2025-03-19', releaseEnd: '2026-06-10', status: 'ENDED', seasons: 2,
    ...image('esref-ruya', 1200, 586, 'Kanal D — official key art', 'https://www.kanald.com.tr/esref-ruya', 'https://image.kanald.com.tr/i/kanald/100/1200x0/691366006b2d104147cf6e89.jpg'),
    sources: ['https://www.kanald.com.tr/esref-ruya/bolumler/esref-ruya-son-bolum', 'https://www.turkiyegazetesi.com.tr/haberler/esref-ruya-1bolum-ozeti-esref-ruya-2-yeni-bolum-fragmani-yayinlandi-mi-1102883'],
  },
  'KARDEŞ TAKIMI 1–3': {
    researchedAt, type: 'FILM GROUP',
    ...image('kardes-takimi', 1600, 900, 'Med Yapım — official first-film key art', 'https://medyapim.com/filmler/kardes-takimi/', 'https://medyapim.com/wp-content/uploads/2024/02/kardes-takimi.jpg'),
    creditNote: 'Personal work applies to Kardeş Takımı and Kardeş Takımı 3. Kardeş Takımı 2 is listed for series context only, not as a personal credit.',
    films: [
      { title: 'KARDEŞ TAKIMI', ...imdb('tt28350395'), type: 'FILM', firstReleaseYear: 2024, releaseStart: '2024-01-19', releaseTerritory: 'Turkey', personalCredit: true, sources: ['https://boxofficeturkiye.com/film/kardes-takimi--2016791/box-office'] },
      { title: 'KARDEŞ TAKIMI 2', ...imdb('tt32777683', 3.9), type: 'FILM', firstReleaseYear: 2025, releaseStart: '2025-01-10', releaseTerritory: 'Turkey', personalCredit: false, sources: ['https://www.imdb.com/title/tt32777683/releaseinfo/'] },
      { title: 'KARDEŞ TAKIMI 3', ...imdb('tt39105901', 4.2), type: 'FILM', firstReleaseYear: 2026, releaseStart: '2026-01-09', releaseTerritory: 'Turkey', personalCredit: true, sources: ['https://www.imdb.com/title/tt39105901/releaseinfo/'] },
    ],
  },
  'BİR SEVDADIR': {
    ...imdb('tt30959036', 4.9), type: 'TV SERIES', firstReleaseYear: 2024, releaseStart: '2024-01-31', releaseEnd: '2024-05-08', status: 'ENDED', seasons: 1,
    ...image('bir-sevdadir', 1600, 1067, 'TRT 1 — official production still', 'https://www.trt1.com.tr/diziler/bir-sevdadir/fotogaleri/13bolum', 'https://cdn-i.pr.trt.com.tr/trt1/ftp-trt1-trt1-public-dm_upload-modul12-bfa2ad02-8f89-4ae6-8df2-b89bd042679djpg-21310902.jpeg'),
    sources: ['https://www.trt1.com.tr/haber/diziler/yeni-dizi-bir-sevdadir-izleyiciyle-bulustu-26427169', 'https://cdn-o.pr.trt.com.tr/trtportal/pdf/21066960.pdf'],
  },
  'ZAFERİN RENGİ': {
    ...imdb('tt29808429'), type: 'FILM', firstReleaseYear: 2024, releaseStart: '2024-02-16', releaseTerritory: 'Turkey',
    ...image('zaferin-rengi', 1600, 670, 'ANSProduksiyon publicity still / Beyazperde', 'https://www.beyazperde.com/filmler/film-319350/fotolar/detay/?cmediafile=22069544', 'https://tr.web.img3.acsta.net/pictures/24/02/07/08/10/4954814.jpg'),
    sources: ['https://www.marsmedia.com.tr/filmler/zaferin-rengi'],
  },
  'TEŞKİLAT': {
    ...imdb('tt13562418'), type: 'TV SERIES', firstReleaseYear: 2021, releaseStart: '2021-03-07', releaseEnd: null, status: 'ONGOING', seasons: 7,
    ...image('teskilat', 1439, 1080, 'TRT 1 — official key art', 'https://www.trt1.com.tr/diziler/teskilat', 'https://cdn-i.pr.trt.com.tr/trt1/teskilat_1440x1080-21753292-0-0-1439-1080.jpeg'),
    sources: ['https://www.trt1.com.tr/diziler/teskilat', 'https://www.trt1.com.tr/haber/diziler/teskilatin-7-sezonundan-ilk-tanitim-yayinlandi-33157698'],
  },
  'KURULUŞ OSMAN': {
    ...imdb('tt11093718', 7.4), type: 'TV SERIES', firstReleaseYear: 2019, releaseStart: '2019-11-20', releaseEnd: '2025-06-04', status: 'ENDED', seasons: 6,
    ...image('kurulus-osman', 1600, 1020, 'atv — official season-six production still', 'https://www.atv.com.tr/kurulus-osman/galeri/100-karede-kurulus-osman-6-sezon', 'https://iatv.tmgrup.com.tr/album/2025/05/26/100-karede-kurulus-osman-6-sezon-1748248046666.jpg'),
    sources: ['https://www.atv.com.tr/kurulus-osman/194-bolum/izle', 'https://pro.imdb.com/title/tt11256554/'],
  },
}

// Additional existing rows stay interactive without inventing missing metadata.
export function getProductionDetail(item) {
  return { type: null, firstReleaseYear: null, releaseStart: null, releaseEnd: null, seasons: null, imdbRating: null, imdbUrl: null, image: null, ...productionDetails[item.title], ...item, role: item.highlights || [], disciplines: item.highlights || [], description: item.summary }
}
