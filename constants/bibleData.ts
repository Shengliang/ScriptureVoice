
export interface BibleBook {
  en: string;
  zh: string; // Traditional
  zhCN: string; // Simplified
  ja: string; // Japanese
  hi: string; // Hindi
  es: string; // Spanish
  fr: string; // French
  pt: string; // Portuguese
  it: string; // Italian
  de: string; // German
  ko: string; // Korean
  chapters: number;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { en: "Genesis", zh: "創世記", zhCN: "创世记", ja: "創世記", hi: "उत्पत्ति", es: "Génesis", fr: "Genèse", pt: "Gênesis", it: "Genesi", de: "Genesis", ko: "창세기", chapters: 50 },
  { en: "Exodus", zh: "出埃及記", zhCN: "出埃及记", ja: "出エジプト記", hi: "निर्गमन", es: "Éxodo", fr: "Exode", pt: "Êxodo", it: "Esodo", de: "Exodus", ko: "출애굽기", chapters: 40 },
  { en: "Leviticus", zh: "利未記", zhCN: "利未记", ja: "レビ記", hi: "लैव्यव्यवस्था", es: "Levítico", fr: "Lévitique", pt: "Levítico", it: "Levitico", de: "Levitikus", ko: "레위기", chapters: 27 },
  { en: "Numbers", zh: "民數記", zhCN: "民数记", ja: "民数記", hi: "गिनती", es: "Números", fr: "Nombres", pt: "Números", it: "Numeri", de: "Numeri", ko: "민수기", chapters: 36 },
  { en: "Deuteronomy", zh: "申命記", zhCN: "申命记", ja: "申命記", hi: "व्यवस्थाविवरण", es: "Deuteronomio", fr: "Deutéronome", pt: "Deuteronômio", it: "Deuteronomio", de: "Deuteronomium", ko: "신명기", chapters: 34 },
  { en: "Joshua", zh: "約書亞記", zhCN: "约书亚记", ja: "ヨシュア記", hi: "यहोशू", es: "Josué", fr: "Josué", pt: "Josué", it: "Giosuè", de: "Josua", ko: "여호수아", chapters: 24 },
  { en: "Judges", zh: "士師記", zhCN: "士师记", ja: "士師記", hi: "न्यायियों", es: "Jueces", fr: "Juges", pt: "Juízes", it: "Giudici", de: "Richter", ko: "사사기", chapters: 21 },
  { en: "Ruth", zh: "路得記", zhCN: "路得记", ja: "ルツ記", hi: "रूत", es: "Rut", fr: "Ruth", pt: "Rute", it: "Rut", de: "Rut", ko: "룻기", chapters: 4 },
  { en: "1 Samuel", zh: "撒母耳記上", zhCN: "撒母耳记上", ja: "サムエル記上", hi: "1 शमूएल", es: "1 Samuel", fr: "1 Samuel", pt: "1 Samuel", it: "1 Samuele", de: "1 Samuel", ko: "사무엘상", chapters: 31 },
  { en: "2 Samuel", zh: "撒母耳記下", zhCN: "撒母耳记下", ja: "サムエル記下", hi: "2 शमूएल", es: "2 Samuel", fr: "2 Samuel", pt: "2 Samuel", it: "2 Samuele", de: "2 Samuel", ko: "사무엘하", chapters: 24 },
  { en: "1 Kings", zh: "列王紀上", zhCN: "列王纪上", ja: "列王記上", hi: "1 राजा", es: "1 Reyes", fr: "1 Rois", pt: "1 Reis", it: "1 Re", de: "1 Könige", ko: "열왕기상", chapters: 22 },
  { en: "2 Kings", zh: "列王紀下", zhCN: "列王纪下", ja: "列王記下", hi: "2 राजा", es: "2 Reyes", fr: "2 Rois", pt: "2 Reis", it: "2 Re", de: "2 Könige", ko: "열왕기하", chapters: 25 },
  { en: "1 Chronicles", zh: "歷代志上", zhCN: "历代志上", ja: "歴代誌上", hi: "1 इतिहास", es: "1 Crónicas", fr: "1 Chroniques", pt: "1 Crônicas", it: "1 Cronache", de: "1 Chronik", ko: "역대상", chapters: 29 },
  { en: "2 Chronicles", zh: "歷代志下", zhCN: "历代志下", ja: "歴代誌下", hi: "2 इतिहास", es: "2 Crónicas", fr: "2 Chroniques", pt: "2 Crônicas", it: "2 Cronache", de: "2 Chronik", ko: "역대하", chapters: 36 },
  { en: "Ezra", zh: "以斯拉記", zhCN: "以斯拉记", ja: "エズラ記", hi: "एज्रा", es: "Esdras", fr: "Esdras", pt: "Esdras", it: "Esdra", de: "Esra", ko: "에스라", chapters: 10 },
  { en: "Nehemiah", zh: "尼希米記", zhCN: "尼希米记", ja: "ネヘミヤ記", hi: "नहेमायाह", es: "Nehemías", fr: "Néhémie", pt: "Neemias", it: "Neemia", de: "Nehemia", ko: "느헤미야", chapters: 13 },
  { en: "Esther", zh: "以斯帖記", zhCN: "以斯帖记", ja: "エステル記", hi: "एस्तेर", es: "Ester", fr: "Esther", pt: "Ester", it: "Ester", de: "Ester", ko: "에스더", chapters: 10 },
  { en: "Job", zh: "約伯記", zhCN: "约伯记", ja: "ヨブ記", hi: "अय्यूब", es: "Job", fr: "Job", pt: "Jó", it: "Giobbe", de: "Iob", ko: "욥기", chapters: 42 },
  { en: "Psalm", zh: "詩篇", zhCN: "诗篇", ja: "詩篇", hi: "भजन संहिता", es: "Salmos", fr: "Psaumes", pt: "Salmos", it: "Salmi", de: "Psalmen", ko: "시편", chapters: 150 },
  { en: "Proverbs", zh: "箴言", zhCN: "箴言", ja: "箴言", hi: "नीतिवचन", es: "Proverbios", fr: "Proverbes", pt: "Provérbios", it: "Proverbi", de: "Sprüche", ko: "잠언", chapters: 31 },
  { en: "Ecclesiastes", zh: "傳道書", zhCN: "传道书", ja: "コヘレトの言葉", hi: "सभोपदेशक", es: "Eclesiastés", fr: "Ecclésiaste", pt: "Eclesiastes", it: "Ecclesiaste", de: "Prediger", ko: "전도서", chapters: 12 },
  { en: "Song of Songs", zh: "雅歌", zhCN: "雅歌", ja: "雅歌", hi: "श्रेष्ठगीत", es: "Cantares", fr: "Cantique des Cantiques", pt: "Cânticos", it: "Cantico dei Cantici", de: "Hohelied", ko: "아가", chapters: 8 },
  { en: "Isaiah", zh: "以賽亞書", zhCN: "以赛亚书", ja: "イザヤ書", hi: "यशायाह", es: "Isaías", fr: "Ésaïe", pt: "Isaías", it: "Isaia", de: "Jesaja", ko: "이사야", chapters: 66 },
  { en: "Jeremiah", zh: "耶利米書", zhCN: "耶利米书", ja: "エレミヤ書", hi: "यिर्मयाह", es: "Jeremías", fr: "Jérémie", pt: "Jeremias", it: "Geremia", de: "Jeremia", ko: "예레미야", chapters: 52 },
  { en: "Lamentations", zh: "耶利米哀歌", zhCN: "耶利米哀歌", ja: "哀歌", hi: "विलापगीत", es: "Lamentaciones", fr: "Lamentations", pt: "Lamentações", it: "Lamentazioni", de: "Klagelieder", ko: "예레미야애가", chapters: 5 },
  { en: "Ezekiel", zh: "以西結書", zhCN: "以西结书", ja: "エゼキエル書", hi: "यहेजकेल", es: "Ezequiel", fr: "Ézéchiel", pt: "Ezequiel", it: "Ezechiele", de: "Ezechiel", ko: "에스겔", chapters: 48 },
  { en: "Daniel", zh: "但以理書", zhCN: "但以理书", ja: "ダニエル書", hi: "दानिय्येल", es: "Daniel", fr: "Daniel", pt: "Daniel", it: "Daniele", de: "Daniel", ko: "다니엘", chapters: 12 },
  { en: "Hosea", zh: "何西阿書", zhCN: "何西阿书", ja: "ホセア書", hi: "होशे", es: "Oseas", fr: "Osée", pt: "Oseias", it: "Osea", de: "Hosea", ko: "호세아", chapters: 14 },
  { en: "Joel", zh: "約珥書", zhCN: "约珥书", ja: "ヨエル書", hi: "योएल", es: "Joel", fr: "Joël", pt: "Joel", it: "Gioele", de: "Joel", ko: "요엘", chapters: 3 },
  { en: "Amos", zh: "阿摩司書", zhCN: "阿摩司书", ja: "アモス書", hi: "आमोस", es: "Amós", fr: "Amos", pt: "Amós", it: "Amos", de: "Amos", ko: "아모스", chapters: 9 },
  { en: "Obadiah", zh: "俄巴底亞書", zhCN: "俄巴底亚书", ja: "オバデヤ書", hi: "ओबद्याह", es: "Abdías", fr: "Abdias", pt: "Obadias", it: "Abdia", de: "Obadja", ko: "오바댜", chapters: 1 },
  { en: "Jonah", zh: "約拿書", zhCN: "约拿书", ja: "ヨナ書", hi: "योना", es: "Jonás", fr: "Jonas", pt: "Jonas", it: "Giona", de: "Jona", ko: "요나", chapters: 4 },
  { en: "Micah", zh: "彌迦書", zhCN: "弥迦书", ja: "ミカ書", hi: "मीका", es: "Miqueas", fr: "Michée", pt: "Miqueias", it: "Michea", de: "Micha", ko: "미가", chapters: 7 },
  { en: "Nahum", zh: "那鴻書", zhCN: "那鸿书", ja: "ナホム書", hi: "नहूम", es: "Nahum", fr: "Nahum", pt: "Naum", it: "Naum", de: "Nahum", ko: "나훔", chapters: 3 },
  { en: "Habakkuk", zh: "哈巴谷書", zhCN: "哈巴谷书", ja: "ハバクク書", hi: "हबक्कूक", es: "Habacuc", fr: "Habacuc", pt: "Habacuque", it: "Abacuc", de: "Habakuk", ko: "하박국", chapters: 3 },
  { en: "Zephaniah", zh: "西番雅書", zhCN: "西番雅书", ja: "ゼパニヤ書", hi: "सपन्याह", es: "Sofonías", fr: "Sophonie", pt: "Sofonias", it: "Sofonia", de: "Zefanja", ko: "스바냐", chapters: 3 },
  { en: "Haggai", zh: "哈該書", zhCN: "哈该书", ja: "ハガイ書", hi: "हाग्गै", es: "Hageo", fr: "Aggée", pt: "Ageu", it: "Aggeo", de: "Haggai", ko: "학개", chapters: 2 },
  { en: "Zechariah", zh: "撒迦利亞書", zhCN: "撒迦利亚书", ja: "ゼカリヤ書", hi: "जकर्याह", es: "Zacarías", fr: "Zacharie", pt: "Zacarias", it: "Zaccaria", de: "Sacharja", ko: "스가랴", chapters: 14 },
  { en: "Malachi", zh: "瑪拉基書", zhCN: "玛拉基书", ja: "マラキ書", hi: "मलाकी", es: "Malaquías", fr: "Malachie", pt: "Malaquias", it: "Malachia", de: "Maleachi", ko: "말라기", chapters: 4 },
  // New Testament
  { en: "Matthew", zh: "馬太福音", zhCN: "马太福音", ja: "マタイによる福音書", hi: "मत्ती", es: "Mateo", fr: "Matthieu", pt: "Mateus", it: "Matteo", de: "Matthäus", ko: "마태복음", chapters: 28 },
  { en: "Mark", zh: "馬可福音", zhCN: "马可福音", ja: "マルコによる福音書", hi: "मरकुस", es: "Marcos", fr: "Marc", pt: "Marcos", it: "Marco", de: "Markus", ko: "마가복음", chapters: 16 },
  { en: "Luke", zh: "路加福音", zhCN: "路加福音", ja: "ルカによる福音書", hi: "लूका", es: "Lucas", fr: "Luc", pt: "Lucas", it: "Luca", de: "Lukas", ko: "누가복음", chapters: 24 },
  { en: "John", zh: "約翰福音", zhCN: "约翰福音", ja: "ヨハネによる福音書", hi: "यूहन्ना", es: "Juan", fr: "Jean", pt: "João", it: "Giovanni", de: "Johannes", ko: "요한복음", chapters: 21 },
  { en: "Acts", zh: "使徒行傳", zhCN: "使徒行传", ja: "使徒言行録", hi: "प्रेरितों के काम", es: "Hechos", fr: "Actes", pt: "Atos", it: "Atti", de: "Apostelgeschichte", ko: "사도행전", chapters: 28 },
  { en: "Romans", zh: "羅馬書", zhCN: "罗马书", ja: "ローマの信徒への手紙", hi: "रोमियों", es: "Romanos", fr: "Romains", pt: "Romanos", it: "Romani", de: "Römer", ko: "로마서", chapters: 16 },
  { en: "1 Corinthians", zh: "哥林多前書", zhCN: "哥林多前书", ja: "コリントの信徒への手紙一", hi: "1 कुरिन्थियों", es: "1 Corintios", fr: "1 Corinthiens", pt: "1 Coríntios", it: "1 Corinzi", de: "1 Korinther", ko: "고린도전서", chapters: 16 },
  { en: "2 Corinthians", zh: "哥林多後書", zhCN: "哥林多后书", ja: "コリントの信徒への手紙二", hi: "2 कुरिन्थियों", es: "2 Corintios", fr: "2 Corinthiens", pt: "2 Coríntios", it: "2 Corinzi", de: "2 Korinther", ko: "고린도후서", chapters: 13 },
  { en: "Galatians", zh: "加拉太書", zhCN: "加拉太书", ja: "ガラテヤの信徒への手紙", hi: "गलातियों", es: "Gálatas", fr: "Galates", pt: "Gálatas", it: "Galati", de: "Galater", ko: "갈라디아서", chapters: 6 },
  { en: "Ephesians", zh: "以弗所書", zhCN: "以弗所书", ja: "エフェソの信徒への手紙", hi: "इफिसियों", es: "Efesios", fr: "Éphésiens", pt: "Efésios", it: "Efesini", de: "Epheser", ko: "에베소서", chapters: 6 },
  { en: "Philippians", zh: "腓立比書", zhCN: "腓立比书", ja: "フィリピの信徒への手紙", hi: "फिलिप्पियों", es: "Filipenses", fr: "Philippiens", pt: "Filipenses", it: "Filippesi", de: "Philipper", ko: "빌립보서", chapters: 4 },
  { en: "Colossians", zh: "歌羅西書", zhCN: "歌罗西书", ja: "コロサイの信徒への手紙", hi: "कुलुस्सियों", es: "Colosenses", fr: "Colossiens", pt: "Colossenses", it: "Colossesi", de: "Kolosser", ko: "골로새서", chapters: 4 },
  { en: "1 Thessalonians", zh: "帖撒羅尼迦前書", zhCN: "帖撒罗尼迦前书", ja: "テサロニケの信徒への手紙一", hi: "1 थिस्सलुनीकियों", es: "1 Tesalonicenses", fr: "1 Thessaloniciens", pt: "1 Tessalonicenses", it: "1 Tessalonicesi", de: "1 Thessalonicher", ko: "데살로니가전서", chapters: 5 },
  { en: "2 Thessalonians", zh: "帖撒羅尼迦後書", zhCN: "帖撒罗尼迦后书", ja: "テサロニケの信徒への手紙二", hi: "2 थिस्सलुनीकियों", es: "2 Tesalonicenses", fr: "2 Thessaloniciens", pt: "2 Tessalonicenses", it: "2 Tessalonicesi", de: "2 Thessalonicher", ko: "데살로니가후서", chapters: 3 },
  { en: "1 Timothy", zh: "提摩太前書", zhCN: "提摩太前书", ja: "テモテへの手紙一", hi: "1 तीमुथियुस", es: "1 Timoteo", fr: "1 Timothée", pt: "1 Timóteo", it: "1 Timoteo", de: "1 Timotheus", ko: "디모데전서", chapters: 6 },
  { en: "2 Timothy", zh: "提摩太後書", zhCN: "提摩太后书", ja: "テモテへの手紙二", hi: "2 तीमुथियुस", es: "2 Timoteo", fr: "2 Timothée", pt: "2 Timóteo", it: "2 Timoteo", de: "2 Timotheus", ko: "디모데후서", chapters: 4 },
  { en: "Titus", zh: "提多書", zhCN: "提多书", ja: "テトスへの手紙", hi: "तीतुस", es: "Tito", fr: "Tite", pt: "Tito", it: "Tito", de: "Titus", ko: "디도서", chapters: 3 },
  { en: "Philemon", zh: "腓利門書", zhCN: "腓利门书", ja: "フィレモンへの手紙", hi: "फिलेमोन", es: "Filemón", fr: "Philémon", pt: "Filemom", it: "Filemone", de: "Philemon", ko: "빌레몬서", chapters: 1 },
  { en: "Hebrews", zh: "希伯來書", zhCN: "希伯来书", ja: "ヘブライ人への手紙", hi: "इब्रानियों", es: "Hebreos", fr: "Hébreux", pt: "Hebreus", it: "Ebrei", de: "Hebräer", ko: "히브리서", chapters: 13 },
  { en: "James", zh: "雅各書", zhCN: "雅各书", ja: "ヤコブの手紙", hi: "याकूब", es: "Santiago", fr: "Jacques", pt: "Tiago", it: "Giacomo", de: "Jakobus", ko: "야고보서", chapters: 5 },
  { en: "1 Peter", zh: "彼得前書", zhCN: "彼得前书", ja: "ペトロの手紙一", hi: "1 पतरस", es: "1 Pedro", fr: "1 Pierre", pt: "1 Pedro", it: "1 Pietro", de: "1 Petrus", ko: "베드로전서", chapters: 5 },
  { en: "2 Peter", zh: "彼得後書", zhCN: "彼得后书", ja: "ペトロの手紙二", hi: "2 पतरस", es: "2 Pedro", fr: "2 Pierre", pt: "2 Pedro", it: "2 Pietro", de: "2 Petrus", ko: "베드로후서", chapters: 3 },
  { en: "1 John", zh: "約翰一書", zhCN: "约翰一书", ja: "ヨハネの手紙一", hi: "1 यूहन्ना", es: "1 Juan", fr: "1 Jean", pt: "1 João", it: "1 Giovanni", de: "1 Johannes", ko: "요한일서", chapters: 5 },
  { en: "2 John", zh: "約翰二書", zhCN: "约翰二书", ja: "ヨハネの手紙二", hi: "2 यूहन्ना", es: "2 Juan", fr: "2 Jean", pt: "2 João", it: "2 Giovanni", de: "2 Johannes", ko: "요한이서", chapters: 1 },
  { en: "3 John", zh: "約翰三書", zhCN: "约翰三书", ja: "ヨハネの手紙三", hi: "3 यूहन्ना", es: "3 Juan", fr: "3 Jean", pt: "3 João", it: "3 Giovanni", de: "3 Johannes", ko: "요한삼서", chapters: 1 },
  { en: "Jude", zh: "猶大書", zhCN: "犹大书", ja: "ユダの手紙", hi: "यहूदा", es: "Judas", fr: "Jude", pt: "Judas", it: "Giuda", de: "Judas", ko: "유다서", chapters: 1 },
  { en: "Revelation", zh: "啟示錄", zhCN: "启示录", ja: "ヨハネの黙示録", hi: "प्रकाशितवाक्य", es: "Apocalipsis", fr: "Apocalypse", pt: "Apocalipse", it: "Apocalisse", de: "Offenbarung", ko: "요한계시록", chapters: 22 },
];
