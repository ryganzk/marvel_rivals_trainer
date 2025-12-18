// Mapping of hero names to their roles
export const HERO_ROLES: Record<string, 'Vanguard' | 'Duelist' | 'Strategist'> = {
  // Vanguards
  'angela': 'Vanguard',
  'captain america': 'Vanguard',
  'doctor strange': 'Vanguard',
  'emma frost': 'Vanguard',
  'groot': 'Vanguard',
  'hulk': 'Vanguard',
  'magneto': 'Vanguard',
  'peni parker': 'Vanguard',
  'rogue': 'Vanguard',
  'the thing': 'Vanguard',
  'thor': 'Vanguard',
  'venom': 'Vanguard',

  // Duelists
  'black panther': 'Duelist',
  'black widow': 'Duelist',
  'blade': 'Duelist',
  'daredevil': 'Duelist',
  'hawkeye': 'Duelist',
  'hela': 'Duelist',
  'human torch': 'Duelist',
  'iron fist': 'Duelist',
  'iron man': 'Duelist',
  'phoenix': 'Duelist',
  'magik': 'Duelist',
  'mister fantastic': 'Duelist',
  'moon knight': 'Duelist',
  'namor': 'Duelist',
  'psylocke': 'Duelist',
  'scarlet witch': 'Duelist',
  'spider-man': 'Duelist',
  'squirrel girl': 'Duelist',
  'star-lord': 'Duelist',
  'storm': 'Duelist',
  'the punisher': 'Duelist',
  'winter soldier': 'Duelist',
  'wolverine': 'Duelist',

  // Strategists
  'adam warlock': 'Strategist',
  'cloak & dagger': 'Strategist',
  'gambit': 'Strategist',
  'invisible woman': 'Strategist',
  'jeff the land shark': 'Strategist',
  'loki': 'Strategist',
  'luna snow': 'Strategist',
  'mantis': 'Strategist',
  'rocket raccoon': 'Strategist',
  'ultron': 'Strategist',
};

export const ROLE_COLORS = {
  Vanguard: '#3B82F6', // blue
  Duelist: '#EF4444', // red
  Strategist: '#10B981', // green
};

// Hero-specific colors matching their in-game character screens
export const HERO_COLORS: Record<string, string> = {
  // Vanguards
  'angela': '#EB942E',
  'captain america': '#3872B1',
  'doctor strange': '#DB635C',
  'emma frost': '#35ADE4',
  'groot': '#83A862',
  'hulk': '#3E7C59',
  'magneto': '#53747B',
  'peni parker': '#DF5C4F',
  'rogue': '#D5B932',
  'the thing': '#DDA664',
  'thor': '#596BAF',
  'venom': '#2A303E',

  // Duelists
  'black panther': '#674B80',
  'black widow': '#555B6A',
  'blade': '#B2473C',
  'daredevil': '#D32852',
  'hawkeye': '#A06EC7',
  'hela': '#388C8C',
  'human torch': '#C56453',
  'iron fist': '#16948A',
  'iron man': '#E0595F',
  'phoenix': '#DB5D51',
  'magik': '#90625F',
  'mister fantastic': '#2DCCE8',
  'moon knight': '#6F8A9F',
  'namor': '#23948A',
  'psylocke': '#9169AB',
  'scarlet witch': '#D34663',
  'spider-man': '#DF5658',
  'squirrel girl': '#DF9A4E',
  'star-lord': '#4680D8',
  'storm': '#435074',
  'the punisher': '#4A5A6C',
  'winter soldier': '#6D7F41',
  'wolverine': '#BF9729',

  // Strategists
  'adam warlock': '#C28B43',
  'cloak & dagger': '#889BFD',
  'gambit': '#D763A0',
  'invisible woman': '#53C2ED',
  'jeff the land shark': '#5C7AA5',
  'loki': '#4D8961',
  'luna snow': '#0E7EC6',
  'mantis': '#6C8C66',
  'rocket raccoon': '#D47253',
  'ultron': '#6B779F',
};
