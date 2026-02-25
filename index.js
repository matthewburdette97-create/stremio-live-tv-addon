const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")
const fs = require('fs')
const path = require('path')

// Declare the manifest
const manifest = {
  id: "org.livetv.stremio.addon",
  version: "1.1.0",
  catalogs: [
    {
      type: "tv",
      id: "countries",
      name: "Live TV by Country",
      extra: [
        {
          name: "genre",
          isRequired: false,
          options: ["sports", "news", "music", "movies", "documentary", "kids", "general", "all"]
        },
        {
          name: "search",
          isRequired: false
        }
      ]
    },
    {
      type: "tv",
      id: "genres",
      name: "Live TV by Genre"
    }
  ],
  resources: ["catalog", "stream", "meta"],
  types: ["tv"],
  name: "Live TV",
  description: "2500+ live TV streams from countries worldwide - browse by country or genre"
}

const builder = new addonBuilder(manifest)

// Default hardcoded streams (used as fallback)
const DEFAULT_STREAMS = {
  'Afghanistan': [
    { title: 'TOLO TV', url: 'https://iptv.tolotvnews.com/tolo.m3u8' },
    { title: 'Ariana TV', url: 'https://stream.ariana.tv/ariana.m3u8' },
    { title: 'Shamshad TV', url: 'https://stream.shamshad.tv/shamshad.m3u8' }
  ],
  'Albania': [
    { title: 'RTSH 1', url: 'https://live.rtsh.al/rtsh1.m3u8' },
    { title: 'RTSH 2', url: 'https://live.rtsh.al/rtsh2.m3u8' },
    { title: 'Top Channel', url: 'https://iptv.topchannel.al/topchannel.m3u8' },
    { title: 'Klan', url: 'https://iptv.klan.al/klan.m3u8' }
  ],
  'Algeria': [
    { title: 'ENTV', url: 'https://live.entv.dz/entv.m3u8' },
    { title: 'Echorouk', url: 'https://stream.echorouk.net/echorouk.m3u8' },
    { title: 'El Djazairia', url: 'https://live.eldjazairia.dz/eldjazairia.m3u8' },
    { title: 'Ennahar TV', url: 'https://stream.ennahar.dz/ennahar.m3u8' }
  ],
  'Andorra': [
    { title: 'RTVA', url: 'https://live.rtva.ad/rtva.m3u8' }
  ],
  'Angola': [
    { title: 'TPA', url: 'https://live.tpa.ao/tpa.m3u8' },
    { title: 'ZAPPING', url: 'https://stream.zapping.ao/zapping.m3u8' }
  ],
  'Argentina': [
    { title: 'Telefe', url: 'https://live.telefe.com/telefe.m3u8' },
    { title: 'Canal 9', url: 'https://live.canal9.com.ar/canal9.m3u8' },
    { title: 'America TV', url: 'https://live.americatv.com.ar/americatv.m3u8' },
    { title: 'Todo Noticias', url: 'https://live.todonoticias.com.ar/todonoticias.m3u8' },
    { title: 'Cronica TV', url: 'https://live.cronicatv.com.ar/cronicatv.m3u8' },
    { title: 'El Trece', url: 'https://live.eltrece.com.ar/eltrece.m3u8' }
  ],
  'Armenia': [
    { title: 'Armenian 1', url: 'https://live.1tv.am/arm1.m3u8' },
    { title: 'H1', url: 'https://live.h1.am/h1.m3u8' },
    { title: 'Artn', url: 'https://live.artn.am/artn.m3u8' }
  ],
  'Australia': [
    { title: 'ABC News', url: 'https://live.abc.net.au/abc-live.m3u8' },
    { title: 'SBS', url: 'https://live.sbs.com.au/sbs-live.m3u8' },
    { title: 'Seven', url: 'https://live.7plus.com.au/7plus.m3u8' },
    { title: 'Nine', url: 'https://live.9now.com.au/9now.m3u8' },
    { title: 'Ten', url: 'https://live.10play.com.au/10play.m3u8' }
  ],
  'Austria': [
    { title: 'ORF 1', url: 'https://live.orf.at/orf1.m3u8' },
    { title: 'ORF 2', url: 'https://live.orf.at/orf2.m3u8' },
    { title: 'ATV', url: 'https://live.atv.at/atv.m3u8' },
    { title: 'Puls 4', url: 'https://live.puls4.at/puls4.m3u8' }
  ],
  'Azerbaijan': [
    { title: 'AzTV', url: 'https://live.aztv.az/aztv.m3u8' },
    { title: 'ITV', url: 'https://live.itv.az/itv.m3u8' },
    { title: 'Space TV', url: 'https://live.spacetv.az/spacetv.m3u8' }
  ],
  'Bahamas': [
    { title: 'ZNS Bahamas', url: 'https://live.znsbahamas.bs/zns.m3u8' },
    { title: 'Our Lucaya TV', url: 'https://live.ourlucaya.bs/ourlucaya.m3u8' }
  ],
  'Bahrain': [
    { title: 'BTV', url: 'https://live.bbtv.bh/btv.m3u8' },
    { title: 'Alrai TV', url: 'https://live.alrai.bh/alrai.m3u8' }
  ],
  'Bangladesh': [
    { title: 'BTV', url: 'https://live.btv.gov.bd/btv.m3u8' },
    { title: 'Channel i', url: 'https://live.channeli.net/channeli.m3u8' },
    { title: 'RTV', url: 'https://live.rtv.gov.bd/rtv.m3u8' },
    { title: 'DBC News', url: 'https://live.dbcnews.tv/dbcnews.m3u8' }
  ],
  'Barbados': [
    { title: 'CBC', url: 'https://live.cbc.bb/cbc.m3u8' },
    { title: 'Starcom', url: 'https://live.starcomnetwork.com/starcom.m3u8' }
  ],
  'Belarus': [
    { title: 'ONT', url: 'https://live.ont.by/ont.m3u8' },
    { title: 'TV', url: 'https://live.tvby.by/tvby.m3u8' },
    { title: 'STV', url: 'https://live.stv.by/stv.m3u8' }
  ],
  'Belgium': [
    { title: 'VRT 1', url: 'https://live.vrt.be/vrt1.m3u8' },
    { title: 'VRT 3', url: 'https://live.vrt.be/vrt3.m3u8' },
    { title: 'RTBF', url: 'https://live.rtbf.be/rtbf.m3u8' },
    { title: 'Eurosport', url: 'https://live.eurosport.be/eurosport.m3u8' }
  ],
  'Belize': [
    { title: 'Channel 5', url: 'https://live.channel5bz.com/channel5.m3u8' },
    { title: 'Love TV', url: 'https://live.lovetv.bz/lovetv.m3u8' }
  ],
  'Benin': [
    { title: 'ORTB', url: 'https://live.ortb.bj/ortb.m3u8' }
  ],
  'Bolivia': [
    { title: 'ATB', url: 'https://live.atb.bo/atb.m3u8' },
    { title: 'Unitel', url: 'https://live.unitel.bo/unitel.m3u8' }
  ],
  'Bosnia': [
    { title: 'BHRT 1', url: 'https://live.bhrt.ba/bhrt1.m3u8' },
    { title: 'BHRT 2', url: 'https://live.bhrt.ba/bhrt2.m3u8' },
    { title: 'FTV', url: 'https://live.federalna.ba/ftv.m3u8' }
  ],
  'Botswana': [
    { title: 'BTV', url: 'https://live.btv.bw/btv.m3u8' },
    { title: 'Gabz TV', url: 'https://live.gabztv.bw/gabztv.m3u8' }
  ],
  'Brazil': [
    { title: 'Globo', url: 'https://live.globo.com/globo.m3u8' },
    { title: 'SBT', url: 'https://live.sbt.com.br/sbt.m3u8' },
    { title: 'Record', url: 'https://live.record.com.br/record.m3u8' },
    { title: 'Rede TV', url: 'https://live.redetv.com.br/redetv.m3u8' },
    { title: 'Band', url: 'https://live.band.com.br/band.m3u8' }
  ],
  'Bulgaria': [
    { title: 'BNT 1', url: 'https://live.bnt.bg/bnt1.m3u8' },
    { title: 'bTV', url: 'https://live.btv.bg/btv.m3u8' },
    { title: 'Nova TV', url: 'https://live.novatv.bg/novatv.m3u8' }
  ],
  'Cameroon': [
    { title: 'CRTV', url: 'https://live.crtv.cm/crtv.m3u8' }
  ],
  'Canada': [
    { title: 'CBC', url: 'https://live.cbc.ca/cbc.m3u8' },
    { title: 'CTV', url: 'https://live.ctv.ca/ctv.m3u8' },
    { title: 'Global News', url: 'https://live.globalnews.ca/globalnews.m3u8' },
    { title: 'CityTV', url: 'https://live.citytv.com/citytv.m3u8' }
  ],
  'Chad': [
    { title: 'TN Chad', url: 'https://live.tnchad.com/tnchad.m3u8' }
  ],
  'Chile': [
    { title: 'TVN', url: 'https://live.tvn.cl/tvn.m3u8' },
    { title: 'Mega', url: 'https://live.mega.cl/mega.m3u8' },
    { title: 'Canal 13', url: 'https://live.canal13.cl/canal13.m3u8' }
  ],
  'China': [
    { title: 'CCTV 1', url: 'https://live.cctv.com/cctv1.m3u8' },
    { title: 'CCTV 2', url: 'https://live.cctv.com/cctv2.m3u8' },
    { title: 'CCTV News', url: 'https://live.cctv.com/cctv-news.m3u8' }
  ],
  'Colombia': [
    { title: 'RCN', url: 'https://live.rcn.com.co/rcn.m3u8' },
    { title: 'Caracol', url: 'https://live.caracol.com.co/caracol.m3u8' },
    { title: 'Ecuavisa', url: 'https://live.ecuavisa.com.co/ecuavisa.m3u8' }
  ],
  'Congo': [
    { title: 'ORTC', url: 'https://live.ortc.cg/ortc.m3u8' }
  ],
  'Costa Rica': [
    { title: 'Channel 7', url: 'https://live.canal7.co.cr/canal7.m3u8' },
    { title: 'Extra', url: 'https://live.extra.co.cr/extra.m3u8' }
  ],
  'Croatia': [
    { title: 'HRT 1', url: 'https://live.hrt.hr/hrt1.m3u8' },
    { title: 'HRT 2', url: 'https://live.hrt.hr/hrt2.m3u8' },
    { title: 'HRT 3', url: 'https://live.hrt.hr/hrt3.m3u8' }
  ],
  'Cyprus': [
    { title: 'RIK 1', url: 'https://live.rik.org.cy/rik1.m3u8' },
    { title: 'SIGMA TV', url: 'https://live.sigmatv.com/sigmatv.m3u8' }
  ],
  'Czech Republic': [
    { title: 'CT 1', url: 'https://live.ceskatelevize.cz/ct1.m3u8' },
    { title: 'CT 2', url: 'https://live.ceskatelevize.cz/ct2.m3u8' },
    { title: 'Prima', url: 'https://live.iprima.cz/prima.m3u8' }
  ],
  'Denmark': [
    { title: 'DR 1', url: 'https://live.dr.dk/dr1.m3u8' },
    { title: 'DR 2', url: 'https://live.dr.dk/dr2.m3u8' },
    { title: 'TV 2', url: 'https://live.tv2.dk/tv2.m3u8' }
  ],
  'Egypt': [
    { title: 'ERTU', url: 'https://live.ertu.org/ertu.m3u8' },
    { title: 'ON TV', url: 'https://live.ontv.com.eg/ontv.m3u8' },
    { title: 'ECTV', url: 'https://live.ectv.eg/ectv.m3u8' }
  ],
  'El Salvador': [
    { title: 'Canal 6', url: 'https://live.canal6.com.sv/canal6.m3u8' },
    { title: 'TCS', url: 'https://live.tcs.com.sv/tcs.m3u8' }
  ],
  'Estonia': [
    { title: 'ETV', url: 'https://live.etv.ee/etv.m3u8' },
    { title: 'ETV 2', url: 'https://live.etv.ee/etv2.m3u8' }
  ],
  'Ethiopia': [
    { title: 'EBC', url: 'https://live.ebc.et/ebc.m3u8' }
  ],
  'Fiji': [
    { title: 'FBC TV', url: 'https://live.fbcfiji.com.fj/fbctv.m3u8' }
  ],
  'Finland': [
    { title: 'YLE 1', url: 'https://live.yle.fi/yle1.m3u8' },
    { title: 'YLE 2', url: 'https://live.yle.fi/yle2.m3u8' },
    { title: 'MTV 3', url: 'https://live.mtv3.fi/mtv3.m3u8' }
  ],
  'France': [
    { title: 'France 2', url: 'https://live.francetv.fr/france2.m3u8' },
    { title: 'France 3', url: 'https://live.francetv.fr/france3.m3u8' },
    { title: 'TF1', url: 'https://live.tf1.fr/tf1.m3u8' },
    { title: 'Canal+', url: 'https://live.canalplus.fr/canalplus.m3u8' }
  ],
  'Gabon': [
    { title: 'Gabon TV', url: 'https://live.gabontv.ga/gabontv.m3u8' }
  ],
  'Georgia': [
    { title: 'GPB 1', url: 'https://live.gpb.ge/gpb1.m3u8' },
    { title: 'Imedi', url: 'https://live.imedi.ge/imedi.m3u8' }
  ],
  'Germany': [
    { title: 'ARD', url: 'https://live.ardmediathek.de/ard.m3u8' },
    { title: 'ZDF', url: 'https://live.zdf.de/zdf.m3u8' },
    { title: 'RTL', url: 'https://live.rtl.de/rtl.m3u8' },
    { title: 'SAT 1', url: 'https://live.sat1.de/sat1.m3u8' }
  ],
  'Ghana': [
    { title: 'GTV', url: 'https://live.gtvghana.com/gtv.m3u8' },
    { title: 'TV3', url: 'https://live.tvghana.com/tv3.m3u8' }
  ],
  'Greece': [
    { title: 'ERT 1', url: 'https://live.ert.gr/ert1.m3u8' },
    { title: 'Alpha', url: 'https://live.alphatv.gr/alpha.m3u8' },
    { title: 'Makedonia TV', url: 'https://live.makedonia.tv/makedonia.m3u8' }
  ],
  'Guatemala': [
    { title: 'Canal 3', url: 'https://live.canal3.com.gt/canal3.m3u8' }
  ],
  'Guinea': [
    { title: 'RTG', url: 'https://live.rtguinee.gn/rtg.m3u8' }
  ],
  'Haiti': [
    { title: 'Telemax', url: 'https://live.telemax.ht/telemax.m3u8' }
  ],
  'Honduras': [
    { title: 'Televicentro', url: 'https://live.televicentro.hn/televicentro.m3u8' }
  ],
  'Hong Kong': [
    { title: 'TVB Jade', url: 'https://live.tvb.com/tvb-jade.m3u8' },
    { title: 'TVB Pearl', url: 'https://live.tvb.com/tvb-pearl.m3u8' }
  ],
  'Hungary': [
    { title: 'M1', url: 'https://live.mtva.hu/m1.m3u8' },
    { title: 'RTL Klub', url: 'https://live.rtlklub.hu/rtlklub.m3u8' }
  ],
  'Iceland': [
    { title: 'RUV', url: 'https://live.ruv.is/ruv.m3u8' }
  ],
  'India': [
    { title: 'DD National', url: 'https://live.doordarshan.gov.in/dd-national.m3u8' },
    { title: 'NDTV 24x7', url: 'https://live.ndtv.com/ndtv24x7.m3u8' },
    { title: 'CNN IBN', url: 'https://live.cnnibm.com/cnnibn.m3u8' }
  ],
  'Indonesia': [
    { title: 'TVRI', url: 'https://live.tvri.co.id/tvri.m3u8' },
    { title: 'Indosiar', url: 'https://live.indosiar.com/indosiar.m3u8' },
    { title: 'RCTI', url: 'https://live.rcti.tv/rcti.m3u8' }
  ],
  'Iran': [
    { title: 'IRIB TV 1', url: 'https://live.irib.ir/tv1.m3u8' },
    { title: 'IRIB TV 3', url: 'https://live.irib.ir/tv3.m3u8' }
  ],
  'Iraq': [
    { title: 'IRAQIYA', url: 'https://live.iraqiya.iq/iraqiya.m3u8' }
  ],
  'Ireland': [
    { title: 'RTE 1', url: 'https://live.rte.ie/rte1.m3u8' },
    { title: 'RTE 2', url: 'https://live.rte.ie/rte2.m3u8' }
  ],
  'Israel': [
    { title: 'KNESSET', url: 'https://live.knesset.gov.il/knesset.m3u8' },
    { title: 'Yes STARS', url: 'https://live.yes.co.il/stars.m3u8' }
  ],
  'Italy': [
    { title: 'RAI 1', url: 'https://live.rai.it/rai1.m3u8' },
    { title: 'RAI 2', url: 'https://live.rai.it/rai2.m3u8' },
    { title: 'RAI 3', url: 'https://live.rai.it/rai3.m3u8' },
    { title: 'Canale 5', url: 'https://live.canale5.it/canale5.m3u8' }
  ],
  'Jamaica': [
    { title: 'TVJ', url: 'https://live.tvj.com.jm/tvj.m3u8' }
  ],
  'Japan': [
    { title: 'CGNTV Japan', url: 'https://d2p4mrcwl6ly4.cloudfront.net/out/v1/8d50f69fdbbf411a8d302743e4263716/CGNWebLiveJP.m3u8' },
    { title: 'NHK World-Japan HD', url: 'https://nhk.lls.pbs.org/index.m3u8' },
    { title: 'NHK World-Japan', url: 'https://masterpl.hls.nhkworld.jp/hls/w/live/smarttv.m3u8' },
    { title: 'NHK World-Japan', url: 'https://media-tyo.hls.nhkworld.jp/hls/w/live/master.m3u8' },
    { title: 'NHK World Premium', url: 'https://cdn.skygo.mn/live/disk1/NHK_World_Premium/HLSv3-FTA/NHK_World_Premium.m3u8' },
    { title: 'QVC Japan', url: 'https://cdn-live1.qvc.jp/iPhone/1501/1501.m3u8' },
    { title: 'Shop Channel', url: 'https://stream3.shopch.jp/HLS/master.m3u8' },
    { title: 'NHK Kishou-Saigai', url: 'https://newssimul-stream.nhk.jp/hls/live/2010561/nhknewssimul/master.m3u8' },
    { title: 'ショップチャンネル', url: 'https://stream3.shopch.jp/HLS/master.m3u8' },
    { title: 'NHK WORLD JAPAN', url: 'https://master.nhkworld.jp/nhkworld-tv/playlist/live.m3u8' },
    { title: 'ウェザーニュースLiVE', url: 'https://rch01e-alive-hls.akamaized.net/38fb45b25cdb05a1/out/v1/4e907bfabc684a1dae10df8431a84d21/index.m3u8' },
    { title: 'TOKYO MX チャンネル', url: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01287-rakutentvjapan-tokyomx-cmaf-rakutenjp/playlist.m3u8' },
    { title: 'J SPORTS 1', url: 'https://nl.utako.moe/js1/tracks-v1a1/mono.m3u8' },
    { title: 'Channel Ginga', url: 'https://nl.utako.moe/gingach/tracks-v1a1/mono.m3u8' },
    { title: 'Fighting TV', url: 'https://nl.utako.moe/fighting_tv/tracks-v1a1/mono.m3u8' },
    { title: 'Fuji Next', url: 'https://nl.utako.moe/fuji_next/tracks-v1a1/mono.m3u8' },
    { title: 'EX Ch2', url: 'https://nl.utako.moe/ex_ch2/tracks-v1a1/mono.m3u8' },
    { title: 'Music On', url: 'https://nl.utako.moe/musicon/tracks-v1a1/mono.m3u8' },
    { title: 'Sky A', url: 'https://nl.utako.moe/skya/tracks-v1a1/mono.m3u8' },
    { title: 'Kansai TV', url: 'https://nl.utako.moe/kansaitv/tracks-v1a1/mono.m3u8' },
    { title: 'Fuji TV', url: 'https://nl.utako.moe/Fuji_TV/tracks-v1a1/mono.m3u8' }
  ],
  'Jordan': [
    { title: 'JTV', url: 'https://live.jtv.gov.jo/jtv.m3u8' }
  ],
  'Kazakhstan': [
    { title: 'Khabar', url: 'https://live.khabar.kz/khabar.m3u8' },
    { title: '31 Kanal', url: 'https://live.31kanal.kz/31kanal.m3u8' }
  ],
  'Kenya': [
    { title: 'KTN', url: 'https://live.ktn.co.ke/ktn.m3u8' },
    { title: 'NTV Kenya', url: 'https://live.ntv.co.ke/ntv.m3u8' }
  ],
  'Kosovo': [
    { title: 'RTK 1', url: 'https://live.rtk.rks/rtk1.m3u8' }
  ],
  'Kuwait': [
    { title: 'KTV', url: 'https://live.ktv.com.kw/ktv.m3u8' }
  ],
  'Kyrgyzstan': [
    { title: 'OTRK', url: 'https://live.otrk.kg/otrk.m3u8' }
  ],
  'Laos': [
    { title: 'LNTV', url: 'https://live.lntv.la/lntv.m3u8' }
  ],
  'Latvia': [
    { title: 'LTV1', url: 'https://live.ltv.lv/ltv1.m3u8' },
    { title: 'LTV7', url: 'https://live.ltv.lv/ltv7.m3u8' }
  ],
  'Lebanon': [
    { title: 'Future TV', url: 'https://live.futuretv.com.lb/futuretv.m3u8' },
    { title: 'Lbnana', url: 'https://live.lbtv.com.lb/lbtv.m3u8' }
  ],
  'Lesotho': [
    { title: 'LNBC', url: 'https://live.lnbc.ls/lnbc.m3u8' }
  ],
  'Liberia': [
    { title: 'ELBC', url: 'https://live.elbc.lr/elbc.m3u8' }
  ],
  'Libya': [
    { title: 'LTTV', url: 'https://live.lttv.ly/lttv.m3u8' }
  ],
  'Lithuania': [
    { title: 'LRT 1', url: 'https://live.lrt.lt/lrt1.m3u8' },
    { title: 'TV3', url: 'https://live.tv3.lt/tv3.m3u8' }
  ],
  'Luxembourg': [
    { title: 'RTL Lux', url: 'https://live.rtl.lu/rtl.m3u8' }
  ],
  'Madagascar': [
    { title: 'TVM', url: 'https://live.tvm.mg/tvm.m3u8' }
  ],
  'Malawi': [
    { title: 'MBC', url: 'https://live.mbcmala.co.mw/mbc.m3u8' }
  ],
  'Malaysia': [
    { title: 'RTM 1', url: 'https://live.rtm.gov.my/rtm1.m3u8' },
    { title: 'Astro', url: 'https://live.astro.com.my/astro.m3u8' }
  ],
  'Maldives': [
    { title: 'PSM', url: 'https://live.psm.mv/psm.m3u8' }
  ],
  'Mali': [
    { title: 'ORTM', url: 'https://live.ortm.ml/ortm.m3u8' }
  ],
  'Malta': [
    { title: 'ONE', url: 'https://live.one.com.mt/one.m3u8' },
    { title: 'NET TV', url: 'https://live.nettv.com.mt/nettv.m3u8' }
  ],
  'Mauritania': [
    { title: 'CHINGUITT', url: 'https://live.chinguittv.mr/chinguitt.m3u8' }
  ],
  'Mauritius': [
    { title: 'MBC', url: 'https://live.mbc.mu/mbc.m3u8' }
  ],
  'Mexico': [
    { title: 'Las Estrellas', url: 'https://live.tvazteca.com/estrellas.m3u8' },
    { title: 'Gala TV', url: 'https://live.galatv.com.mx/gala.m3u8' },
    { title: 'TV Azteca', url: 'https://live.tvazteca.com/azteca.m3u8' }
  ],
  'Moldova': [
    { title: 'Moldova 1', url: 'https://live.moldova1.md/moldova1.m3u8' },
    { title: 'Prime TV', url: 'https://live.primetv.md/primetv.m3u8' }
  ],
  'Monaco': [
    { title: 'TMC', url: 'https://live.tmc.mc/tmc.m3u8' }
  ],
  'Mongolia': [
    { title: 'MNB', url: 'https://live.mnb.mn/mnb.m3u8' }
  ],
  'Montenegro': [
    { title: 'RTCG 1', url: 'https://live.rtcg.me/rtcg1.m3u8' }
  ],
  'Morocco': [
    { title: 'Al Oula', url: 'https://live.snrtmaroc.ma/aloula.m3u8' },
    { title: '2M', url: 'https://live.2m.ma/2m.m3u8' }
  ],
  'Mozambique': [
    { title: 'TVM', url: 'https://live.tvm.mz/tvm.m3u8' }
  ],
  'Myanmar': [
    { title: 'MRTV', url: 'https://live.mrtv.gov.mm/mrtv.m3u8' }
  ],
  'Namibia': [
    { title: 'NBC', url: 'https://live.nbc.com.na/nbc.m3u8' }
  ],
  'Nepal': [
    { title: 'NTV Plus', url: 'https://live.nepaltvplus.com/ntvplus.m3u8' },
    { title: 'Kantipur', url: 'https://live.kantipurtv.com/kantipur.m3u8' }
  ],
  'Netherlands': [
    { title: 'NPO 1', url: 'https://live.npoplus.nl/npo1.m3u8' },
    { title: 'RTL 4', url: 'https://live.rtl.nl/rtl4.m3u8' },
    { title: 'SBS 6', url: 'https://live.sbs6.nl/sbs6.m3u8' }
  ],
  'New Zealand': [
    { title: 'One', url: 'https://live.tvnz.co.nz/one.m3u8' },
    { title: 'TV2', url: 'https://live.tvnz.co.nz/tv2.m3u8' }
  ],
  'Nicaragua': [
    { title: 'Canal 2', url: 'https://live.canal2.com.ni/canal2.m3u8' }
  ],
  'Nigeria': [
    { title: 'NTA', url: 'https://live.nta.gov.ng/nta.m3u8' },
    { title: 'Channels', url: 'https://live.channelstv.com/channels.m3u8' }
  ],
  'North Korea': [
    { title: 'KCTV', url: 'https://live.kctv.kp/kctv.m3u8' }
  ],
  'North Macedonia': [
    { title: 'MRT 1', url: 'https://live.mrt.mk/mrt1.m3u8' }
  ],
  'Norway': [
    { title: 'NRK 1', url: 'https://live.nrk.no/nrk1.m3u8' },
    { title: 'TVNorge', url: 'https://live.tvnorge.no/tvnorge.m3u8' }
  ],
  'Oman': [
    { title: 'OTV', url: 'https://live.otv.om/otv.m3u8' }
  ],
  'Pakistan': [
    { title: 'PTV', url: 'https://live.ptv.gov.pk/ptv.m3u8' },
    { title: 'ARY News', url: 'https://live.arynews.tv/arynews.m3u8' }
  ],
  'Palestine': [
    { title: 'PBC', url: 'https://live.pbc.ps/pbc.m3u8' }
  ],
  'Panama': [
    { title: 'Telemetro', url: 'https://live.telemetro.com.pa/telemetro.m3u8' }
  ],
  'Papua New Guinea': [
    { title: 'EMTV', url: 'https://live.emtv.com.pg/emtv.m3u8' }
  ],
  'Paraguay': [
    { title: 'SNT', url: 'https://live.snt.com.py/snt.m3u8' }
  ],
  'Peru': [
    { title: 'ATV', url: 'https://live.atv.pe/atv.m3u8' },
    { title: 'Panamericana', url: 'https://live.panamericana.pe/panamericana.m3u8' }
  ],
  'Philippines': [
    { title: 'GMA', url: 'https://live.gmanetwork.com/gma.m3u8' },
    { title: 'ABS-CBN', url: 'https://live.abs-cbn.com/abscbn.m3u8' }
  ],
  'Poland': [
    { title: 'TVP 1', url: 'https://live.tvp.pl/tvp1.m3u8' },
    { title: 'Polsat', url: 'https://live.polsat.pl/polsat.m3u8' }
  ],
  'Portugal': [
    { title: 'RTP 1', url: 'https://live.rtp.pt/rtp1.m3u8' },
    { title: 'SIC', url: 'https://live.sic.pt/sic.m3u8' }
  ],
  'Qatar': [
    { title: 'QTV', url: 'https://live.qtv.gov.qa/qtv.m3u8' }
  ],
  'Romania': [
    { title: 'TVR 1', url: 'https://live.tvr.ro/tvr1.m3u8' },
    { title: 'PRO TV', url: 'https://live.protv.ro/protv.m3u8' }
  ],
  'Russia': [
    { title: 'Channel One', url: 'https://live.1tv.ru/1tv.m3u8' },
    { title: 'Russia 1', url: 'https://live.russia.tv/russia1.m3u8' }
  ],
  'Rwanda': [
    { title: 'TVM1', url: 'https://live.tvm1.rw/tvm1.m3u8' }
  ],
  'Saint Kitts': [
    { title: 'WINN FM', url: 'https://live.winnfm.com/winnfm.m3u8' }
  ],
  'Saint Lucia': [
    { title: 'Nice', url: 'https://live.nicetv.com.lc/nicetv.m3u8' }
  ],
  'Samoa': [
    { title: 'SMTV', url: 'https://live.smtv.ws/smtv.m3u8' }
  ],
  'San Marino': [
    { title: 'SMTV', url: 'https://live.sanmarinortv.sm/sanmarinortv.m3u8' }
  ],
  'Sao Tome': [
    { title: 'STVM', url: 'https://live.stvm.st/stvm.m3u8' }
  ],
  'Saudi Arabia': [
    { title: 'Al Arabiya', url: 'https://live.alarabiya.net/alarabiya.m3u8' }
  ],
  'Senegal': [
    { title: 'RTS', url: 'https://live.rts.sn/rts.m3u8' }
  ],
  'Serbia': [
    { title: 'RTS 1', url: 'https://live.rts.rs/rts1.m3u8' },
    { title: 'Pink', url: 'https://live.pink.tv/pink.m3u8' }
  ],
  'Seychelles': [
    { title: 'SBC', url: 'https://live.sbc.sc/sbc.m3u8' }
  ],
  'Sierra Leone': [
    { title: 'SLBC', url: 'https://live.slbc.sl/slbc.m3u8' }
  ],
  'Singapore': [
    { title: 'Channel 5', url: 'https://live.mediacorpsingapore.com/channel5.m3u8' }
  ],
  'Slovakia': [
    { title: 'RTVS 1', url: 'https://live.rtvs.sk/rtvs1.m3u8' },
    { title: 'TV Markiza', url: 'https://live.markiza.sk/markiza.m3u8' }
  ],
  'Slovenia': [
    { title: 'RTV SLO 1', url: 'https://live.rtvslo.si/rtvsi1.m3u8' }
  ],
  'Solomon Islands': [
    { title: 'SIBC', url: 'https://live.sibc.com.sb/sibc.m3u8' }
  ],
  'Somalia': [
    { title: 'SLNTV', url: 'https://live.slntv.so/slntv.m3u8' }
  ],
  'South Africa': [
    { title: 'eNews', url: 'https://live.enewschannel.com/enews.m3u8' },
    { title: 'Supersport', url: 'https://live.superbets.com/superbets.m3u8' }
  ],
  'South Korea': [
    { title: 'KBS', url: 'https://live.kbs.co.kr/kbs.m3u8' },
    { title: 'KBS', url: 'https://nl.utako.moe/kbs/tracks-v1a1/mono.m3u8' },
    { title: 'SBS', url: 'https://live.sbs.co.kr/sbs.m3u8' }
  ],
  'South Sudan': [
    { title: 'SSBC', url: 'https://live.ssbc.tv/ssbc.m3u8' }
  ],
  'Spain': [
    { title: 'RTVE', url: 'https://live.rtve.es/rtve.m3u8' },
    { title: 'Telecinco', url: 'https://live.telecinco.es/telecinco.m3u8' },
    { title: 'La Sexta', url: 'https://live.lasexta.com/lasexta.m3u8' }
  ],
  'Sri Lanka': [
    { title: 'Rupavahi', url: 'https://live.rupavahi.lk/rupavahi.m3u8' }
  ],
  'Sudan': [
    { title: 'SUDTV', url: 'https://live.sudtv.sd/sudtv.m3u8' }
  ],
  'Suriname': [
    { title: 'STER', url: 'https://live.stersuriname.com/ster.m3u8' }
  ],
  'Sweden': [
    { title: 'SVT 1', url: 'https://live.svt.se/svt1.m3u8' },
    { title: 'TV 4', url: 'https://live.tv4play.se/tv4.m3u8' }
  ],
  'Switzerland': [
    { title: 'SRF 1', url: 'https://live.srf.ch/srf1.m3u8' },
    { title: 'VSI', url: 'https://live.rsi.ch/vsi.m3u8' }
  ],
  'Syria': [
    { title: 'ORTAS', url: 'https://live.ortas.sy/ortas.m3u8' }
  ],
  'Taiwan': [
    { title: 'TTV', url: 'https://live.ttv.com.tw/ttv.m3u8' },
    { title: 'CTS', url: 'https://live.cts.com.tw/cts.m3u8' }
  ],
  'Tajikistan': [
    { title: 'TRT', url: 'https://live.trt.tj/trt.m3u8' }
  ],
  'Tanzania': [
    { title: 'TBC', url: 'https://live.tbc.co.tz/tbc.m3u8' }
  ],
  'Thailand': [
    { title: 'Channel 3', url: 'https://live.ch3thailand.com/ch3.m3u8' },
    { title: 'Channel 7', url: 'https://live.ch7thailand.com/ch7.m3u8' }
  ],
  'Timor Leste': [
    { title: 'TVTL', url: 'https://live.tvtl.tl/tvtl.m3u8' }
  ],
  'Togo': [
    { title: 'TVT', url: 'https://live.tvt.tg/tvt.m3u8' }
  ],
  'Tonga': [
    { title: 'TVTONGA', url: 'https://live.tvtonga.to/tvtonga.m3u8' }
  ],
  'Trinidad Tobago': [
    { title: 'TVT', url: 'https://live.tvt.tt/tvt.m3u8' }
  ],
  'Tunisia': [
    { title: 'TNTY', url: 'https://live.tunisietelecom.tn/tnty.m3u8' }
  ],
  'Turkey': [
    { title: 'TRT 1', url: 'https://live.trt.gov.tr/trt1.m3u8' },
    { title: 'Kanal D', url: 'https://live.kanald.com.tr/kanald.m3u8' }
  ],
  'Turkmenistan': [
    { title: 'TRM', url: 'https://live.trm.tm/trm.m3u8' }
  ],
  'Turks Caicos': [
    { title: 'TCITV', url: 'https://live.tcitv.tc/tcitv.m3u8' }
  ],
  'Tuvalu': [
    { title: 'Tuvalu TV', url: 'https://live.tuvaluonline.tv/tuvalu.m3u8' }
  ],
  'Uganda': [
    { title: 'NTV Uganda', url: 'https://live.ntvuganda.co.ug/ntv.m3u8' }
  ],
  'Ukraine': [
    { title: '1+1', url: 'https://live.1plus1.ua/1plus1.m3u8' },
    { title: 'STB', url: 'https://live.stb.ua/stb.m3u8' }
  ],
  'UAE': [
    { title: 'Emarat Al-Aan', url: 'https://live.eaa.ae/eaa.m3u8' },
    { title: 'Dubai Sports', url: 'https://live.dsports.ae/dsports.m3u8' }
  ],
  'UK': [
    { title: 'BBC One', url: 'https://live.bbc.co.uk/bbcone.m3u8' },
    { title: 'BBC Two', url: 'https://live.bbc.co.uk/bbctwo.m3u8' },
    { title: 'ITV', url: 'https://live.itv.com/itv.m3u8' },
    { title: 'Channel 4', url: 'https://live.channel4.com/channel4.m3u8' },
    { title: 'Channel 5', url: 'https://live.channel5.com/channel5.m3u8' }
  ],
  'USA': [
    // News & Media
    { title: 'CNN', url: 'https://tve-live-lln.warnermediacdn.com/hls/live/586495/cnngo/cnn_slate/VIDEO_0_3564000.m3u8' },
    { title: 'Bloomberg', url: 'https://bloomberg.com/media-manifest/streams/us.m3u8' },
    { title: 'ABC News', url: 'https://content.uplynk.com/channel/3324f2467c414329b3b0cc5cd987b6be.m3u8' },
    { title: 'CBS News', url: 'https://cbsnews.akamaized.net/hls/live/2020607/cbsnlineup_8/master.m3u8' },
    { title: 'NBC News Now', url: 'http://dai2.xumo.com/xumocdn/p=roku/amagi_hls_data_xumo1212A-xumo-nbcnewsnow/CDN/playlist.m3u8' },
    { title: 'Reuters TV', url: 'https://reuters-reutersnow-1-eu.rakuten.wurl.tv/playlist.m3u8' },
    { title: 'NASA TV Public', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master_2000.m3u8' },
    { title: 'NASA TV Media', url: 'https://ntv2.akamaized.net/hls/live/2013923/NASA-NTV2-HLS/master.m3u8' },
    { title: 'BBC Food', url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5fb5844bf5514d0007945bda/master.m3u8?deviceId=channel&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=channel&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&tags=ROKU_CONTENT_TAGS&coppa=false&content_type=livefeed&rdid=channel&genre=ROKU_ADS_CONTENT_GENRE&content_rating=ROKU_ADS_CONTENT_RATING&studio_id=viacom&channel_id=channel' },
    { title: 'BBC Home', url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5fb5836fe745b600070fc743/master.m3u8?deviceId=channel&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=channel&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&tags=ROKU_CONTENT_TAGS&coppa=false&content_type=livefeed&rdid=channel&genre=ROKU_ADS_CONTENT_GENRE&content_rating=ROKU_ADS_CONTENT_RATING&studio_id=viacom&channel_id=channel' },
    { title: 'PBS12', url: 'https://kbdidt.lls.pbs.org/out/v1/efac0b195304474695a6779fc03051a9/dash-drm.mpd' },
    { title: 'RMPBS', url: 'https://krmadt.lls.pbs.org/out/v1/239e3afea2ad4574a112bd5d8c717353/dash-drm_audio_3_0_7261549.mp4' }
  ],
  'Uruguay': [
    { title: 'Canal 3', url: 'https://live.canal3.com.uy/canal3.m3u8' },
    { title: 'Teledoce', url: 'https://live.teledoce.com.uy/teledoce.m3u8' }
  ],
  'Uzbekistan': [
    { title: 'UzTV', url: 'https://live.uztv.uz/uztv.m3u8' }
  ],
  'Vanuatu': [
    { title: 'VBTC', url: 'https://live.vbtc.vu/vbtc.m3u8' }
  ],
  'Venezuela': [
    { title: 'VTV', url: 'https://live.vtv.gov.ve/vtv.m3u8' },
    { title: 'Globovisión', url: 'https://live.globovision.com/globovision.m3u8' }
  ],
  'Vietnam': [
    { title: 'VTV1', url: 'https://live.vtv.gov.vn/vtv1.m3u8' },
    { title: 'VTV3', url: 'https://live.vtv.gov.vn/vtv3.m3u8' }
  ],
  'Yemen': [
    { title: 'YBC', url: 'https://live.yemenitv.net/ybc.m3u8' }
  ],
  'Zambia': [
    { title: 'ZNBC', url: 'https://live.znbc.co.zm/znbc.m3u8' }
  ],
  'Zimbabwe': [
    { title: 'ZBC', url: 'https://live.zbc.co.zw/zbc.m3u8' }
  ]
}

// Cache for streams
let countriesCache = {}
let streamsCache = {}
let lastCacheUpdate = 0
const CACHE_DURATION = 3600000 // 1 hour

// Try to load scraped streams database, fallback to hardcoded
let COUNTRY_STREAMS_DB = {}

try {
  const streamsDbPath = path.join(__dirname, 'streams-database.json')
  if (fs.existsSync(streamsDbPath)) {
    COUNTRY_STREAMS_DB = JSON.parse(fs.readFileSync(streamsDbPath, 'utf8'))
    console.log(`✓ Loaded ${Object.keys(COUNTRY_STREAMS_DB).length} countries from scraped database`)
  } else {
    console.log('Note: No scraped database found. Using default streams.')
    console.log('Run "npm run scrape" to fetch real streams from Famelack.com')
    COUNTRY_STREAMS_DB = DEFAULT_STREAMS
  }
} catch (error) {
  console.error('Error loading streams database:', error.message)
  COUNTRY_STREAMS_DB = DEFAULT_STREAMS
}

// Enrich all streams with genre information
COUNTRY_STREAMS_DB = enrichStreamsWithGenre(COUNTRY_STREAMS_DB)

// List of all available countries
const ALL_COUNTRIES = Object.keys(COUNTRY_STREAMS_DB).sort()

// Get available genres for the manifest
const AVAILABLE_GENRES = Array.from(
  new Set(
    Object.values(COUNTRY_STREAMS_DB)
      .flat()
      .map(stream => stream.genre)
      .filter(Boolean)
  )
).sort()

// Update manifest with actual available genres
manifest.catalogs[0].extra[0].options = [...AVAILABLE_GENRES, 'all']

console.log(`✓ Available genres: ${AVAILABLE_GENRES.join(', ')}`)

// Get streams for a country
async function getStreamsForCountry(countryName) {
  try {
    const cacheKey = countryName.toLowerCase()
    
    // Return from cache if available
    if (streamsCache[cacheKey]) {
      return streamsCache[cacheKey]
    }
    
    // Get from database
    const streams = COUNTRY_STREAMS_DB[countryName] || []
    
    // Cache the result
    streamsCache[cacheKey] = streams
    
    return streams
  } catch (error) {
    console.error(`Error getting streams for ${countryName}:`, error.message)
    return []
  }
}

// Helper function to categorize streams by genre based on title
function categorizeStreamGenre(stream) {
  const title = (stream.title || '').toLowerCase()
  
  // News channels
  if (/news|cnn|bbc|rtv|ntv|nbc|abc|cbs|dw|france 24|euronews|sky news|channel news/i.test(title)) {
    return 'news'
  }
  
  // Sports channels
  if (/sport|sports|sky sport|espn|nba|nfl|uefa|fifa|nhl|mlb|afc|fox sport|bein sport|dazn/i.test(title)) {
    return 'sports'
  }
  
  // Music channels
  if (/music|mtv|vevo|vh1|tmf|rtl 2|m tv|music box|kiss|capital|absolute/i.test(title)) {
    return 'music'
  }
  
  // Kids channels
  if (/kids|cartoon|nickelodeon|disney|cbeebies|pbs kids|toon|anime|nick jr/i.test(title)) {
    return 'kids'
  }
  
  // Documentary channels
  if (/documentary|bdoc|natgeo|nat geo|discovery|animal|history|bbc|nat wild/i.test(title)) {
    return 'documentary'
  }
  
  // Movies channels
  if (/movie|movies|film|cinema|hbo|showtime|amc|fx|hulu|netflix/i.test(title)) {
    return 'movies'
  }
  
  // Default to general
  return 'general'
}

// Enrich streams with genre information if missing
function enrichStreamsWithGenre(database) {
  const enriched = {}
  
  Object.entries(database).forEach(([country, streams]) => {
    enriched[country] = streams.map(stream => ({
      ...stream,
      genre: stream.genre || categorizeStreamGenre(stream)
    }))
  })
  
  return enriched
}

// Get all available genres from database
function getAvailableGenres() {
  const genres = new Set()
  
  Object.values(COUNTRY_STREAMS_DB).forEach(countryStreams => {
    countryStreams.forEach(stream => {
      if (stream.genre) {
        genres.add(stream.genre)
      }
    })
  })
  
  return Array.from(genres).sort()
}

// Get streams for a specific genre (across all countries)
function getStreamsForGenre(genreName) {
  const streams = []
  
  Object.entries(COUNTRY_STREAMS_DB).forEach(([country, countryStreams]) => {
    countryStreams.forEach(stream => {
      if (stream.genre === genreName) {
        streams.push({
          ...stream,
          country: country
        })
      }
    })
  })
  
  return streams
}

// Handle catalog requests
builder.defineCatalogHandler(async ({ type, id, extra }) => {
  console.log("Catalog request for", type, id, "extra:", extra)
  
  if (type === "tv" && id === "countries") {
    try {
      const selectedGenre = extra?.genre ? extra.genre[0] : null
      const searchQuery = extra?.search ? extra.search[0].toLowerCase() : null
      
      let countries = ALL_COUNTRIES
      
      // Filter by genre if selected
      if (selectedGenre && selectedGenre !== "all") {
        countries = countries.filter(countryName => {
          const countryStreams = COUNTRY_STREAMS_DB[countryName] || []
          return countryStreams.some(stream => stream.genre === selectedGenre)
        })
      }
      
      // Filter by search query if provided
      if (searchQuery) {
        countries = countries.filter(countryName => 
          countryName.toLowerCase().includes(searchQuery)
        )
      }
      
      const metas = countries.map((countryName, index) => {
        // Try to get a logo from the first channel in this country
        let poster = null
        const countryStreams = COUNTRY_STREAMS_DB[countryName] || []
        if (countryStreams.length > 0) {
          // Use first available logo, or fallback
          for (const stream of countryStreams) {
            if (stream.logo) {
              poster = stream.logo
              break
            }
          }
        }
        
        return {
          id: `country_${index}`,
          type: "tv",
          name: countryName,
          poster: poster || `https://via.placeholder.com/350x500?text=${encodeURIComponent(countryName)}`
        }
      })
      
      console.log(`Returning ${metas.length} countries (genre: ${selectedGenre || 'all'})`)
      return { metas }
    } catch (error) {
      console.error("Error in catalog handler:", error.message)
      return { metas: [] }
    }
  }
  
  if (type === "tv" && id === "genres") {
    try {
      const availableGenres = getAvailableGenres()
      const genreEmojis = {
        'sports': '⚽',
        'news': '📰',
        'music': '🎵',
        'movies': '🎬',
        'documentary': '🎥',
        'kids': '👶',
        'general': '📺'
      }
      
      const metas = availableGenres.map((genreName) => {
        const genreStreams = getStreamsForGenre(genreName)
        let poster = null
        
        // Get a logo from first available stream in this genre
        if (genreStreams.length > 0) {
          for (const stream of genreStreams) {
            if (stream.logo) {
              poster = stream.logo
              break
            }
          }
        }
        
        return {
          id: `genre_${genreName}`,
          type: "tv",
          name: `${genreEmojis[genreName] || '📺'} ${genreName.charAt(0).toUpperCase() + genreName.slice(1)}`,
          poster: poster || `https://via.placeholder.com/350x500?text=${encodeURIComponent(genreName)}`
        }
      })
      
      console.log(`Returning ${metas.length} genres`)
      return { metas }
    } catch (error) {
      console.error("Error in genre catalog handler:", error.message)
      return { metas: [] }
    }
  }
  
  return { metas: [] }
})

// Handle meta requests
builder.defineMetaHandler(async ({ type, id }) => {
  console.log("Meta request for", type, id)
  
  // Extract country index from ID
  const countryMatch = id.match(/country_(\d+)/)
  if (countryMatch) {
    const countryIndex = parseInt(countryMatch[1])
    const countryName = ALL_COUNTRIES[countryIndex]
    
    if (countryName) {
      return {
        meta: {
          id: id,
          type: "tv",
          name: countryName,
          description: `Live TV streams from ${countryName}. ${COUNTRY_STREAMS_DB[countryName]?.length || 0} channels available.`
        }
      }
    }
  }
  
  // Extract genre from ID
  const genreMatch = id.match(/genre_(.+)/)
  if (genreMatch) {
    const genreName = genreMatch[1]
    const genreStreams = getStreamsForGenre(genreName)
    const genreEmojis = {
      'sports': '⚽',
      'news': '📰',
      'music': '🎵',
      'movies': '🎬',
      'documentary': '🎥',
      'kids': '👶',
      'general': '📺'
    }
    
    return {
      meta: {
        id: id,
        type: "tv",
        name: `${genreEmojis[genreName] || '📺'} ${genreName.charAt(0).toUpperCase() + genreName.slice(1)}`,
        description: `Live ${genreName} channels from around the world. ${genreStreams.length} channels available.`
      }
    }
  }
  
  return { meta: {} }
})

// Handle stream requests
builder.defineStreamHandler(async ({ type, id }) => {
  console.log("Stream request for", type, id)
  
  // Extract country from ID
  const countryMatch = id.match(/country_(\d+)/)
  if (countryMatch) {
    const countryIndex = parseInt(countryMatch[1])
    const countryName = ALL_COUNTRIES[countryIndex]
    
    if (countryName) {
      const streams = await getStreamsForCountry(countryName)
      console.log(`Returning ${streams.length} streams for ${countryName}`)
      return { streams }
    }
  }
  
  // Extract genre from ID
  const genreMatch = id.match(/genre_(.+)/)
  if (genreMatch) {
    const genreName = genreMatch[1]
    const streams = getStreamsForGenre(genreName)
    console.log(`Returning ${streams.length} streams for genre: ${genreName}`)
    return { streams }
  }
  
  return { streams: [] }
})

// Start server
const PORT = process.env.PORT || 7070
const NODE_ENV = process.env.NODE_ENV || 'development'

try {
  serveHTTP(builder.getInterface(), { port: PORT })
  console.log(`[${NODE_ENV}] Live TV Add-on listening on port ${PORT}`)
} catch (error) {
  console.error('[ERROR] Failed to start server:', error.message)
  process.exit(1)
}
