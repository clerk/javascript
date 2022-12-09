export type CountryCodeData = typeof data;
export type CountryName = CountryCodeData[number][0];
export type CountryIso = CountryCodeData[number][1];
export type DialingCode = CountryCodeData[number][2];
export type PhonePattern = CountryCodeData[number][3] | '';

const data = [
  ['United States', 'us', '1', '(...) ...-....', 100],
  ['United Kingdom', 'gb', '44', '.... ......'],
  ['India', 'in', '91', '.....-.....'],
  ['Canada', 'ca', '1', '(...) ...-....'],
  ['Germany', 'de', '49', '... .......'],
  ['France', 'fr', '33', '. .. .. .. ..'],
  ['Russia', 'ru', '7', '... ...-..-..'],
  ['Afghanistan', 'af', '93'],
  ['Albania', 'al', '355'],
  ['Algeria ', 'dz', '213'],
  ['American Samoa', 'as', '1684'],
  ['Andorra', 'ad', '376'],
  ['Angola', 'ao', '244'],
  ['Anguilla', 'ai', '1264'],
  ['Antigua and Barbuda', 'ag', '1268'],
  ['Argentina', 'ar', '54'],
  ['Armenia', 'am', '374'],
  ['Aruba', 'aw', '297'],
  ['Australia', 'au', '61', '... ... ...'],
  ['Austria', 'at', '43'],
  ['Azerbaijan', 'az', '994'],
  ['Bahamas', 'bs', '1242'],
  ['Bahrain', 'bh', '973'],
  ['Bangladesh', 'bd', '880'],
  ['Barbados', 'bb', '1246'],
  ['Belarus', 'by', '375'],
  ['Belgium', 'be', '32', '... .. .. ..'],
  ['Belize', 'bz', '501'],
  ['Benin', 'bj', '229'],
  ['Bermuda', 'bm', '1441'],
  ['Bhutan', 'bt', '975'],
  ['Bolivia', 'bo', '591'],
  ['Bosnia and Herzegovina', 'ba', '387'],
  ['Botswana', 'bw', '267'],
  ['Brazil', 'br', '55'],
  ['British Indian Ocean Territory', 'io', '246'],
  ['British Virgin Islands', 'vg', '1284'],
  ['Brunei', 'bn', '673'],
  ['Bulgaria', 'bg', '359'],
  ['Burkina Faso', 'bf', '226'],
  ['Burundi', 'bi', '257'],
  ['Cambodia', 'kh', '855'],
  ['Cameroon', 'cm', '237'],
  ['Cape Verde', 'cv', '238'],
  ['Caribbean Netherlands', 'bq', '599'],
  ['Cayman Islands', 'ky', '1345'],
  ['Central African Republic', 'cf', '236'],
  ['Chad', 'td', '235'],
  ['Chile', 'cl', '56'],
  ['China', 'cn', '86', '..-........'],
  ['Colombia', 'co', '57'],
  ['Comoros', 'km', '269'],
  ['Congo', 'cd', '243'],
  ['Congo', 'cg', '242'],
  ['Cook Islands', 'ck', '682'],
  ['Costa Rica', 'cr', '506', '....-....'],
  ['Côte d’Ivoire', 'ci', '225'],
  ['Croatia', 'hr', '385'],
  ['Cuba', 'cu', '53'],
  ['Curaçao', 'cw', '599'],
  ['Cyprus', 'cy', '357'],
  ['Czech Republic', 'cz', '420'],
  ['Denmark', 'dk', '45', '.. .. .. ..'],
  ['Djibouti', 'dj', '253'],
  ['Dominica', 'dm', '1767'],
  ['Dominican Republic', 'do', '1'],
  ['Ecuador', 'ec', '593'],
  ['Egypt', 'eg', '20'],
  ['El Salvador', 'sv', '503', '....-....'],
  ['Equatorial Guinea', 'gq', '240'],
  ['Eritrea', 'er', '291'],
  ['Estonia', 'ee', '372'],
  ['Ethiopia', 'et', '251'],
  ['Falkland Islands', 'fk', '500'],
  ['Faroe Islands', 'fo', '298'],
  ['Fiji', 'fj', '679'],
  ['Finland', 'fi', '358', '.. ... .. ..'],
  ['French Guiana', 'gf', '594'],
  ['French Polynesia', 'pf', '689'],
  ['Gabon', 'ga', '241'],
  ['Gambia', 'gm', '220'],
  ['Georgia', 'ge', '995'],
  ['Ghana', 'gh', '233'],
  ['Gibraltar', 'gi', '350'],
  ['Greece', 'gr', '30', '... .......'],
  ['Greenland', 'gl', '299'],
  ['Grenada', 'gd', '1473'],
  ['Guadeloupe', 'gp', '590'],
  ['Guam', 'gu', '1671'],
  ['Guatemala', 'gt', '502', '....-....'],
  ['Guinea', 'gn', '224'],
  ['Guinea-Bissau', 'gw', '245'],
  ['Guyana', 'gy', '592'],
  ['Haiti', 'ht', '509', '....-....'],
  ['Honduras', 'hn', '504'],
  ['Hong Kong', 'hk', '852', '.... ....'],
  ['Hungary', 'hu', '36'],
  ['Iceland', 'is', '354', '... ....'],
  ['Indonesia', 'id', '62'],
  ['Iran', 'ir', '98'],
  ['Iraq', 'iq', '964'],
  ['Ireland', 'ie', '353', '.. .......'],
  ['Israel', 'il', '972'],
  ['Italy', 'it', '39', '... ......'],
  ['Jamaica', 'jm', '1876'],
  ['Japan', 'jp', '81', '... .. ....'],
  ['Jordan', 'jo', '962'],
  ['Kazakhstan', 'kz', '7', '... ...-..-..'],
  ['Kenya', 'ke', '254'],
  ['Kiribati', 'ki', '686'],
  ['Kuwait', 'kw', '965'],
  ['Kyrgyzstan', 'kg', '996'],
  ['Laos', 'la', '856'],
  ['Latvia', 'lv', '371'],
  ['Lebanon', 'lb', '961'],
  ['Lesotho', 'ls', '266'],
  ['Liberia', 'lr', '231'],
  ['Libya', 'ly', '218'],
  ['Liechtenstein', 'li', '423'],
  ['Lithuania', 'lt', '370'],
  ['Luxembourg', 'lu', '352'],
  ['Macau', 'mo', '853'],
  ['Macedonia', 'mk', '389'],
  ['Madagascar', 'mg', '261'],
  ['Malawi', 'mw', '265'],
  ['Malaysia', 'my', '60', '..-....-....'],
  ['Maldives', 'mv', '960'],
  ['Mali', 'ml', '223'],
  ['Malta', 'mt', '356'],
  ['Marshall Islands', 'mh', '692'],
  ['Martinique', 'mq', '596'],
  ['Mauritania', 'mr', '222'],
  ['Mauritius', 'mu', '230'],
  ['Mexico', 'mx', '52'],
  ['Micronesia', 'fm', '691'],
  ['Moldova', 'md', '373'],
  ['Monaco', 'mc', '377'],
  ['Mongolia', 'mn', '976'],
  ['Montenegro', 'me', '382'],
  ['Montserrat', 'ms', '1664'],
  ['Morocco', 'ma', '212'],
  ['Mozambique', 'mz', '258'],
  ['Myanmar', 'mm', '95'],
  ['Namibia', 'na', '264'],
  ['Nauru', 'nr', '674'],
  ['Nepal', 'np', '977'],
  ['Netherlands', 'nl', '31', '.. ........'],
  ['New Caledonia', 'nc', '687'],
  ['New Zealand', 'nz', '64', '...-...-....'],
  ['Nicaragua', 'ni', '505'],
  ['Niger', 'ne', '227'],
  ['Nigeria', 'ng', '234'],
  ['Niue', 'nu', '683'],
  ['Norfolk Island', 'nf', '672'],
  ['North Korea', 'kp', '850'],
  ['Northern Mariana Islands', 'mp', '1670'],
  ['Norway', 'no', '47', '... .. ...'],
  ['Oman', 'om', '968'],
  ['Pakistan', 'pk', '92', '...-.......'],
  ['Palau', 'pw', '680'],
  ['Palestine', 'ps', '970'],
  ['Panama', 'pa', '507'],
  ['Papua New Guinea', 'pg', '675'],
  ['Paraguay', 'py', '595'],
  ['Peru', 'pe', '51'],
  ['Philippines', 'ph', '63', '... ....'],
  ['Poland', 'pl', '48', '...-...-...'],
  ['Portugal', 'pt', '351'],
  ['Puerto Rico', 'pr', '1'],
  ['Qatar', 'qa', '974'],
  ['Réunion', 're', '262'],
  ['Romania', 'ro', '40'],
  ['Rwanda', 'rw', '250'],
  ['Saint Barthélemy', 'bl', '590'],
  ['Saint Helena', 'sh', '290'],
  ['Saint Kitts and Nevis', 'kn', '1869'],
  ['Saint Lucia', 'lc', '1758'],
  ['Saint Martin', 'mf', '590'],
  ['Saint Pierre and Miquelon', 'pm', '508'],
  ['Saint Vincent and the Grenadines', 'vc', '1784'],
  ['Samoa', 'ws', '685'],
  ['San Marino', 'sm', '378'],
  ['São Tomé and Príncipe', 'st', '239'],
  ['Saudi Arabia', 'sa', '966'],
  ['Senegal', 'sn', '221'],
  ['Serbia', 'rs', '381'],
  ['Seychelles', 'sc', '248'],
  ['Sierra Leone', 'sl', '232'],
  ['Singapore', 'sg', '65', '....-....'],
  ['Sint Maarten', 'sx', '1721'],
  ['Slovakia', 'sk', '421'],
  ['Slovenia', 'si', '386'],
  ['Solomon Islands', 'sb', '677'],
  ['Somalia', 'so', '252'],
  ['South Africa', 'za', '27'],
  ['South Korea', 'kr', '82'],
  ['South Sudan', 'ss', '211'],
  ['Spain', 'es', '34', '... ... ...'],
  ['Sri Lanka', 'lk', '94'],
  ['Sudan', 'sd', '249'],
  ['Suriname', 'sr', '597'],
  ['Swaziland', 'sz', '268'],
  ['Sweden', 'se', '46', '.. ... .. ..'],
  ['Switzerland', 'ch', '41', '.. ... .. ..'],
  ['Syria', 'sy', '963'],
  ['Taiwan', 'tw', '886'],
  ['Tajikistan', 'tj', '992'],
  ['Tanzania', 'tz', '255'],
  ['Thailand', 'th', '66'],
  ['Timor-Leste', 'tl', '670'],
  ['Togo', 'tg', '228'],
  ['Tokelau', 'tk', '690'],
  ['Tonga', 'to', '676'],
  ['Trinidad and Tobago', 'tt', '1868'],
  ['Tunisia', 'tn', '216'],
  ['Turkey', 'tr', '90', '... ... .. ..'],
  ['Turkmenistan', 'tm', '993'],
  ['Turks and Caicos Islands', 'tc', '1649'],
  ['Tuvalu', 'tv', '688'],
  ['U.S. Virgin Islands', 'vi', '1340'],
  ['Uganda', 'ug', '256'],
  ['Ukraine', 'ua', '380'],
  ['United Arab Emirates', 'ae', '971'],
  ['Uruguay', 'uy', '598'],
  ['Uzbekistan', 'uz', '998'],
  ['Vanuatu', 'vu', '678'],
  ['Vatican City', 'va', '39', '.. .... ....'],
  ['Venezuela', 've', '58'],
  ['Vietnam', 'vn', '84'],
  ['Wallis and Futuna', 'wf', '681'],
  ['Yemen', 'ye', '967'],
  ['Zambia', 'zm', '260'],
  ['Zimbabwe', 'zw', '263'],
] as const;

const UnitedStatesSubAreasSet: ReadonlySet<string> = new Set([
  '907',
  '205',
  '251',
  '256',
  '334',
  '479',
  '501',
  '870',
  '480',
  '520',
  '602',
  '623',
  '928',
  '209',
  '213',
  '310',
  '323',
  '408',
  '415',
  '510',
  '530',
  '559',
  '562',
  '619',
  '626',
  '650',
  '661',
  '707',
  '714',
  '760',
  '805',
  '818',
  '831',
  '858',
  '909',
  '916',
  '925',
  '949',
  '951',
  '303',
  '719',
  '970',
  '203',
  '860',
  '202',
  '302',
  '239',
  '305',
  '321',
  '352',
  '386',
  '407',
  '561',
  '727',
  '772',
  '813',
  '850',
  '863',
  '904',
  '941',
  '954',
  '229',
  '404',
  '478',
  '706',
  '770',
  '912',
  '808',
  '319',
  '515',
  '563',
  '641',
  '712',
  '208',
  '217',
  '309',
  '312',
  '618',
  '630',
  '708',
  '773',
  '815',
  '847',
  '219',
  '260',
  '317',
  '574',
  '765',
  '812',
  '316',
  '620',
  '785',
  '913',
  '270',
  '502',
  '606',
  '859',
  '225',
  '318',
  '337',
  '504',
  '985',
  '413',
  '508',
  '617',
  '781',
  '978',
  '301',
  '410',
  '207',
  '231',
  '248',
  '269',
  '313',
  '517',
  '586',
  '616',
  '734',
  '810',
  '906',
  '989',
  '218',
  '320',
  '507',
  '612',
  '651',
  '763',
  '952',
  '314',
  '417',
  '573',
  '636',
  '660',
  '816',
  '228',
  '601',
  '662',
  '406',
  '252',
  '336',
  '704',
  '828',
  '910',
  '919',
  '701',
  '308',
  '402',
  '603',
  '201',
  '609',
  '732',
  '856',
  '908',
  '973',
  '505',
  '575',
  '702',
  '775',
  '212',
  '315',
  '516',
  '518',
  '585',
  '607',
  '631',
  '716',
  '718',
  '845',
  '914',
  '216',
  '330',
  '419',
  '440',
  '513',
  '614',
  '740',
  '937',
  '405',
  '580',
  '918',
  '503',
  '541',
  '215',
  '412',
  '570',
  '610',
  '717',
  '724',
  '814',
  '401',
  '803',
  '843',
  '864',
  '605',
  '423',
  '615',
  '731',
  '865',
  '901',
  '931',
  '210',
  '214',
  '254',
  '281',
  '325',
  '361',
  '409',
  '432',
  '512',
  '713',
  '806',
  '817',
  '830',
  '903',
  '915',
  '936',
  '940',
  '956',
  '972',
  '979',
  '435',
  '801',
  '276',
  '434',
  '540',
  '703',
  '757',
  '804',
  '802',
  '206',
  '253',
  '360',
  '425',
  '509',
  '262',
  '414',
  '608',
  '715',
  '920',
  '304',
  '307',
]);

const CanadaSubAreaSet: ReadonlySet<string> = new Set([
  '204',
  '226',
  '236',
  '249',
  '250',
  '289',
  '306',
  '343',
  '365',
  '387',
  '403',
  '416',
  '418',
  '431',
  '437',
  '438',
  '450',
  '506',
  '514',
  '519',
  '548',
  '579',
  '581',
  '587',
  '604',
  '613',
  '639',
  '647',
  '672',
  '705',
  '709',
  '742',
  '778',
  '780',
  '782',
  '807',
  '819',
  '825',
  '867',
  '873',
  '902',
  '905',
]);

export const SubAreaCodeSets = {
  us: UnitedStatesSubAreasSet,
  ca: CanadaSubAreaSet,
};

export interface CountryEntry {
  name: CountryName;
  iso: CountryIso;
  code: DialingCode;
  pattern: PhonePattern;
  priority: number;
}

const createEntry = ([
  name,
  iso,
  code,
  pattern = '' as any,
  priority = 0 as any,
]: CountryCodeData[number]): CountryEntry => ({
  name,
  iso,
  code,
  pattern,
  priority,
});

export type IsoToCountryMapType = ReadonlyMap<CountryIso, CountryEntry>;

export const IsoToCountryMap: IsoToCountryMapType = data.reduce(
  (acc, cur) => acc.set(cur[1], createEntry(cur)),
  new Map<CountryIso, CountryEntry>(),
);

export type CodeToCountryIsoMapType = ReadonlyMap<DialingCode, CountryIso>;

export const CodeToCountryIsoMap: CodeToCountryIsoMapType = data.reduce(
  (acc, cur) => acc.set(cur[2], cur[1]),
  new Map<DialingCode, CountryIso>(),
);
