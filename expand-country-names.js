const fs = require('fs');

const STREAMS_DB = 'streams-database.json';

// Mapping of country codes to full names
const countryCodeMap = {
  'MA': 'Morocco',
  'SN': 'Senegal',
  'UG': 'Uganda',
  'CR': 'Costa Rica',
  'PY': 'Paraguay',
  'IQ': 'Iraq',
  'BO': 'Bolivia',
  'DO': 'Dominican Republic',
  'PR': 'Puerto Rico',
  'TG': 'Togo',
  'LB': 'Lebanon',
  'PS': 'Palestine',
  'SD': 'Sudan',
  'SY': 'Syria',
  'QA': 'Qatar',
  'JO': 'Jordan',
  'HN': 'Honduras',
  'OM': 'Oman',
  'LY': 'Libya',
  'YE': 'Yemen',
  'AZ': 'Azerbaijan',
  'AM': 'Armenia',
  'AW': 'Aruba',
  'GT': 'Guatemala',
  'DZ': 'Algeria',
  'SV': 'El Salvador',
  'CD': 'Democratic Republic of the Congo',
  'PA': 'Panama',
  'SO': 'Somalia',
  'GN': 'Guinea',
  'MN': 'Mongolia',
  'BH': 'Bahrain',
  'KW': 'Kuwait',
  'BZ': 'Belize',
  'CG': 'Republic of the Congo',
  'JM': 'Jamaica',
  'BQ': 'Caribbean Netherlands',
  'CW': 'Curacao',
  'RW': 'Rwanda',
  'LA': 'Laos',
  'BF': 'Burkina Faso',
  'NI': 'Nicaragua',
  'HT': 'Haiti',
  'NP': 'Nepal',
  'LC': 'Saint Lucia',
  'BB': 'Barbados',
  'VG': 'British Virgin Islands',
  'CU': 'Cuba',
  'NE': 'Niger',
  'MR': 'Mauritania',
  'ER': 'Eritrea',
  'GP': 'Guadeloupe',
  'MQ': 'Martinique',
  'BS': 'Bahamas',
  'GY': 'Guyana',
  'TN': 'Tunisia',
  'AO': 'Angola',
  'FO': 'Faroe Islands',
  'NA': 'Namibia',
  'PG': 'Papua New Guinea',
  'GM': 'Gambia',
  'CV': 'Cape Verde',
  'EH': 'Western Sahara',
  'BN': 'Brunei',
  'DJ': 'Djibouti',
  'TT': 'Trinidad and Tobago',
  'SR': 'Suriname',
  'GQ': 'Equatorial Guinea',
  'GU': 'Guam',
  'GF': 'French Guiana',
  'TD': 'Chad',
  'KN': 'Saint Kitts and Nevis',
  'PF': 'French Polynesia',
  'WS': 'Samoa',
  'MZ': 'Mozambique',
  'ZW': 'Zimbabwe',
  'CI': 'Ivory Coast',
  'CM': 'Cameroon',
  'ET': 'Ethiopia',
  'GH': 'Ghana',
  'BJ': 'Benin',
  'ML': 'Mali',
  'TZ': 'Tanzania',
};

function expandCountryNames() {
  try {
    console.log('[Loading database...]');
    let db = JSON.parse(fs.readFileSync(STREAMS_DB, 'utf8'));

    let expanded = {};
    let changedCount = 0;
    const expandedCountries = [];

    Object.entries(db).forEach(([country, streams]) => {
      const fullName = countryCodeMap[country] || country;
      
      if (fullName !== country) {
        changedCount++;
        expandedCountries.push(`${country} → ${fullName}`);
      }
      
      expanded[fullName] = streams;
    });

    // Sort alphabetically
    const sorted = {};
    Object.keys(expanded)
      .sort()
      .forEach((key) => {
        sorted[key] = expanded[key];
      });

    // Save updated database
    fs.writeFileSync(STREAMS_DB, JSON.stringify(sorted, null, 2));

    console.log(`\n[Database Updated]`);
    console.log(`   Total countries: ${Object.keys(sorted).length}`);
    console.log(`   Abbreviations expanded: ${changedCount}`);
    
    if (expandedCountries.length > 0) {
      console.log(`\n[Expanded Countries]`);
      expandedCountries.forEach(expansion => {
        console.log(`   ${expansion}`);
      });
    }

    console.log(`\n[Complete] Database saved with full country names.`);
  } catch (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }
}

expandCountryNames();
