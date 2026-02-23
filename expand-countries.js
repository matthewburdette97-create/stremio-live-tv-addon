const fs = require('fs');
const path = require('path');

// Read the current database
const dbPath = path.join(__dirname, 'streams-database.json');
const currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// The full DEFAULT_STREAMS from index.js
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
  ]
};

// Merge: keep current, add missing ones
const merged = { ...DEFAULT_STREAMS, ...currentDb };

console.log(`Current countries: ${Object.keys(currentDb).length}`);
console.log(`After merge: ${Object.keys(merged).length}`);
console.log(`Added: ${Object.keys(merged).length - Object.keys(currentDb).length}`);

// Save
fs.writeFileSync(dbPath, JSON.stringify(merged, null, 2));
console.log('✓ Updated streams-database.json');
