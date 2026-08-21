"use client";

import { useState, useCallback } from "react";
import {
  BookOpen,
  Check,
  Shield,
  Zap,
  Copy,
  Download,
  Globe,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

type Unit = "paragraphs" | "sentences" | "words";

type LanguageConfig = {
  name: string;
  words: string[];
  startPhrase: string;
  rtl?: boolean;
};

const LANGUAGES: Record<string, LanguageConfig> = {
  latin: {
    name: "Latin (Classic)",
    words: [
      "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
      "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
      "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
      "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
      "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
      "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
      "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
      "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
      "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
      "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores",
      "quas", "molestias", "excepturi", "occaecati", "cupiditate", "provident",
      "similique", "perspiciatis", "unde", "omnis", "iste", "natus", "error",
      "voluptatem", "accusantium", "doloremque", "laudantium", "totam", "rem",
      "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis",
      "quasi", "architecto", "beatae", "vitae", "dicta", "explicabo", "nemo",
      "ipsam", "voluptas", "aspernatur", "aut", "odit", "fugit",
    ],
    startPhrase: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  english: {
    name: "English",
    words: [
      "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
      "for", "not", "on", "with", "as", "you", "do", "at", "this", "but",
      "by", "from", "they", "we", "say", "she", "or", "an", "will", "my",
      "one", "all", "would", "there", "their", "what", "so", "up", "out",
      "if", "about", "who", "get", "which", "go", "when", "make", "can",
      "like", "time", "just", "know", "take", "people", "into", "year",
      "good", "some", "could", "them", "see", "other", "than", "then",
      "now", "look", "only", "come", "over", "think", "also", "back",
      "after", "use", "how", "our", "work", "first", "well", "way", "even",
      "new", "want", "because", "any", "these", "give", "day", "most",
      "great", "between", "need", "large", "often", "hand", "high", "place",
      "hold", "turn", "always", "world", "life", "never", "find", "still",
      "real", "long", "every", "form", "part", "child", "last", "point",
    ],
    startPhrase: "The quick brown fox jumps over the lazy dog.",
  },
  spanish: {
    name: "Spanish",
    words: [
      "el", "la", "los", "las", "un", "una", "y", "en", "que", "de",
      "se", "no", "por", "con", "su", "para", "al", "del", "como", "le",
      "más", "pero", "sus", "o", "si", "sobre", "también", "me", "hasta",
      "hay", "donde", "quien", "desde", "todo", "nos", "durante", "todos",
      "contra", "otros", "ese", "esto", "antes", "algunos", "hacia", "era",
      "siempre", "dar", "entonces", "vida", "bien", "mismo", "entre", "así",
      "primero", "después", "aunque", "fue", "ser", "estar", "hacer", "querer",
      "gran", "tiempo", "solo", "cada", "manera", "nunca", "nuestro", "vez",
      "otra", "tanto", "misma", "ahora", "pueblo", "mundo", "nuevo", "año",
      "decir", "saber", "tener", "llegar", "pasar", "deber", "poner", "venir",
      "ciudad", "país", "gente", "hombre", "mujer", "niño", "casa", "libro",
    ],
    startPhrase: "En un lugar de la Mancha, de cuyo nombre no quiero acordarme.",
  },
  french: {
    name: "French",
    words: [
      "le", "la", "les", "un", "une", "des", "de", "du", "et", "en",
      "il", "elle", "que", "qui", "ne", "pas", "je", "nous", "vous",
      "ils", "elles", "on", "mon", "ma", "mes", "son", "sa", "ses",
      "notre", "votre", "leur", "leurs", "ce", "cette", "ces", "au", "aux",
      "y", "lui", "me", "te", "se", "pour", "par", "sur", "sous", "dans",
      "avec", "sans", "entre", "vers", "contre", "après", "avant", "aussi",
      "mais", "ou", "donc", "or", "ni", "car", "quand", "comment", "pourquoi",
      "très", "bien", "tout", "plus", "moins", "être", "avoir", "faire",
      "aller", "dire", "voir", "vouloir", "pouvoir", "devoir", "savoir",
      "prendre", "venir", "tenir", "partir", "sortir", "monde", "temps",
      "homme", "femme", "enfant", "pays", "vie", "travail", "maison", "jour",
    ],
    startPhrase: "Il était une fois, dans un pays très lointain, une histoire.",
  },
  german: {
    name: "German",
    words: [
      "der", "die", "das", "ein", "eine", "und", "in", "ist", "von", "mit",
      "zu", "den", "dem", "des", "sich", "auf", "für", "nicht", "an", "bei",
      "noch", "aus", "durch", "man", "auch", "im", "wenn", "wie", "so", "es",
      "aber", "nach", "als", "um", "oder", "hier", "wir", "sehr", "nur",
      "werden", "haben", "sein", "machen", "können", "müssen", "sagen",
      "wollen", "kommen", "gehen", "sehen", "geben", "nehmen", "halten",
      "Zeit", "Leben", "Welt", "Jahr", "Tag", "Mensch", "Land", "Haus",
      "Kind", "Arbeit", "Frage", "Frau", "Mann", "Stadt", "Nacht", "Hand",
      "Weg", "groß", "gut", "neu", "alt", "jung", "lang", "kurz", "hoch",
      "tief", "weit", "nah", "schnell", "langsam", "stark", "schwach",
      "wichtig", "möglich", "einfach", "schwer", "richtig", "falsch",
    ],
    startPhrase: "Am Anfang war das Wort, und alle Wesen hörten zu schweigen.",
  },
  portuguese: {
    name: "Portuguese",
    words: [
      "o", "a", "os", "as", "um", "uma", "e", "em", "de", "do", "da",
      "dos", "das", "que", "se", "não", "por", "com", "sua", "para", "ao",
      "ele", "ela", "como", "mais", "mas", "seu", "ou", "já", "sobre",
      "há", "também", "me", "até", "onde", "quem", "desde", "todo", "nos",
      "durante", "todos", "lhes", "nem", "contra", "outros", "esse", "isso",
      "antes", "alguns", "vida", "bem", "mesmo", "entre", "assim", "depois",
      "embora", "foi", "ser", "estar", "fazer", "parte", "homem", "grande",
      "tempo", "apenas", "cada", "maneira", "nunca", "nosso", "vez", "outro",
      "tanto", "mesma", "agora", "mundo", "novo", "ano", "dizer", "saber",
      "ter", "cidade", "país", "pessoa", "mulher", "criança", "casa", "dia",
    ],
    startPhrase: "No princípio era o Verbo, e o mundo foi feito por ele.",
  },
  arabic: {
    name: "Arabic",
    rtl: true,
    words: [
      "في", "من", "إلى", "على", "عن", "مع", "هذا", "هذه", "التي", "الذي",
      "كان", "كانت", "أن", "لا", "ما", "قد", "ولا", "وقد", "فهو", "فهي",
      "ثم", "بين", "حتى", "كل", "هم", "نحن", "أنا", "أنت", "هو", "هي",
      "نعم", "لكن", "أيضا", "بعد", "قبل", "تحت", "فوق", "أمام", "خلف",
      "كبير", "صغير", "جديد", "قديم", "حسن", "جميل", "الحياة", "الزمن",
      "العالم", "الإنسان", "المكان", "الوقت", "القلب", "البيت", "الأرض",
      "السماء", "الماء", "النور", "الحق", "الخير", "يعمل", "يذهب", "يجيء",
      "يرى", "يعرف", "يريد", "يمكن", "يجب", "تعمل", "تذهب", "تجيء",
      "ترى", "تعرف", "تريد", "علم", "قلم", "كتاب", "باب", "مدرسة", "طريق",
    ],
    startPhrase: "في البداية كانت الكلمة، والكلمة كانت تملأ الكون بالمعنى.",
  },
  chinese: {
    name: "Chinese",
    words: [
      "的", "一", "是", "在", "不", "了", "有", "和", "人", "这",
      "中", "大", "为", "上", "个", "国", "我", "以", "要", "他",
      "时", "来", "用", "们", "生", "到", "作", "地", "于", "出",
      "就", "分", "对", "成", "会", "可", "主", "发", "年", "动",
      "同", "工", "也", "能", "下", "过", "子", "说", "产", "种",
      "面", "而", "方", "后", "多", "定", "行", "学", "法", "所",
      "民", "得", "经", "三", "之", "进", "着", "等", "部", "度",
      "家", "电", "力", "里", "如", "水", "化", "高", "自", "理",
      "起", "小", "物", "现", "实", "加", "量", "都", "两", "体",
      "制", "机", "当", "使", "点", "从", "业", "本", "去", "把",
    ],
    startPhrase: "天地玄黄，宇宙洪荒，日月盈昃，辰宿列张。",
  },
  japanese: {
    name: "Japanese",
    words: [
      "の", "に", "は", "を", "が", "で", "と", "て", "も", "た",
      "し", "から", "する", "いる", "その", "ある", "この", "あの",
      "ので", "ながら", "よう", "なる", "こと", "もの", "ところ", "まで",
      "それ", "しかし", "また", "そして", "人", "日", "年", "月", "時",
      "今", "何", "大", "中", "新", "本", "分", "前", "手", "国",
      "見", "来", "思", "子", "生", "使", "行", "言", "気", "長",
      "部", "自", "後", "多", "間", "話", "同", "彼", "女", "意",
      "力", "書", "動", "水", "火", "空", "地", "風", "光", "声",
      "心", "体", "愛", "夢", "道", "世界", "時間", "人生", "未来",
      "希望", "言葉", "物語", "知識", "自然", "音楽", "空間", "記憶",
    ],
    startPhrase: "吾輩は猫である。名前はまだ無い。どこで生まれたか見当がつかぬ。",
  },
  russian: {
    name: "Russian",
    words: [
      "в", "и", "не", "на", "что", "тот", "быть", "он", "с", "а",
      "весь", "это", "как", "она", "по", "но", "они", "к", "у", "ты",
      "из", "мы", "за", "бы", "только", "её", "мне", "было", "вот",
      "от", "меня", "ещё", "нет", "о", "ему", "теперь", "когда", "даже",
      "ну", "вдруг", "ли", "если", "уже", "или", "ни", "будто", "очень",
      "ах", "вас", "нас", "без", "будет", "человек", "время", "жизнь",
      "мир", "год", "день", "рука", "место", "слово", "дело", "глаз",
      "сам", "свой", "часть", "лицо", "сила", "большой", "новый", "старый",
      "молодой", "добрый", "хороший", "идти", "говорить", "знать", "видеть",
      "думать", "хотеть", "мочь", "город", "страна", "дом", "книга", "путь",
    ],
    startPhrase: "В начале было Слово, и Слово наполняло мир своим смыслом.",
  },
  italian: {
    name: "Italian",
    words: [
      "il", "la", "i", "le", "un", "una", "e", "in", "di", "che",
      "è", "non", "per", "con", "si", "su", "del", "della", "dei", "delle",
      "al", "alla", "ai", "alle", "nel", "nella", "nei", "nelle", "da", "dal",
      "ma", "o", "se", "come", "più", "questo", "questa", "questi", "queste",
      "anche", "già", "così", "quando", "dove", "chi", "tutto", "tutti",
      "molto", "bene", "poi", "ancora", "sempre", "mai", "qui", "lì",
      "essere", "avere", "fare", "dire", "andare", "vedere", "sapere", "potere",
      "volere", "venire", "dare", "stare", "tempo", "vita", "mondo", "uomo",
      "donna", "casa", "anno", "giorno", "lavoro", "paese", "città", "modo",
      "grande", "piccolo", "nuovo", "vecchio", "buono", "primo", "altro",
    ],
    startPhrase: "Nel mezzo del cammin di nostra vita mi ritrovai in una selva oscura.",
  },
  korean: {
    name: "Korean",
    words: [
      "의", "이", "가", "을", "를", "은", "는", "에", "에서", "로",
      "으로", "와", "과", "한", "하다", "있다", "없다", "되다", "보다", "같다",
      "그", "이", "저", "것", "수", "들", "안", "위", "아래", "앞",
      "뒤", "속", "밖", "때", "사람", "나", "우리", "너", "그들", "모두",
      "많다", "크다", "작다", "좋다", "나쁘다", "빠르다", "느리다", "새롭다",
      "오다", "가다", "먹다", "마시다", "읽다", "쓰다", "말하다", "듣다",
      "시간", "세계", "나라", "도시", "집", "학교", "일", "물", "하늘",
      "땅", "바람", "빛", "마음", "생각", "사랑", "꿈", "희망", "자연",
      "오늘", "내일", "어제", "지금", "항상", "절대", "함께", "혼자",
    ],
    startPhrase: "하늘이 열리고 땅이 나뉘던 그 태초의 순간부터 이야기는 시작되었다.",
  },
  hindi: {
    name: "Hindi",
    words: [
      "का", "की", "के", "में", "से", "को", "पर", "और", "है", "हैं",
      "था", "थी", "थे", "यह", "वह", "वे", "मैं", "हम", "तुम", "आप",
      "एक", "दो", "तीन", "सब", "कुछ", "जो", "जब", "कि", "तो", "भी",
      "नहीं", "हाँ", "बहुत", "अब", "यहाँ", "वहाँ", "कैसे", "क्यों", "कौन",
      "बड़ा", "छोटा", "नया", "पुराना", "अच्छा", "बुरा", "सुंदर", "लंबा",
      "जाना", "आना", "करना", "होना", "देना", "लेना", "कहना", "सुनना",
      "समय", "दिन", "रात", "साल", "दुनिया", "देश", "घर", "पानी", "आकाश",
      "मन", "दिल", "जीवन", "प्रेम", "सत्य", "शक्ति", "ज्ञान", "शांति",
      "लोग", "बच्चा", "माँ", "पिता", "मित्र", "मार्ग", "प्रकृति", "रंग",
    ],
    startPhrase: "सत्यम शिवम सुंदरम, यही जीवन का परम सत्य है और यही मार्ग है।",
  },
  turkish: {
    name: "Turkish",
    words: [
      "bir", "ve", "bu", "da", "de", "ile", "için", "ki", "mi", "ne",
      "o", "ben", "sen", "biz", "siz", "onlar", "var", "yok", "çok", "az",
      "büyük", "küçük", "yeni", "eski", "iyi", "kötü", "güzel", "hızlı",
      "gel", "git", "yap", "ol", "ver", "al", "bak", "bil", "söyle", "duy",
      "zaman", "gün", "yıl", "yer", "ev", "okul", "iş", "su", "gökyüzü",
      "dünya", "ülke", "şehir", "insan", "hayat", "sevgi", "umut", "doğa",
      "ama", "veya", "eğer", "artık", "hep", "hiç", "belki", "sadece",
      "nasıl", "neden", "nerede", "ne zaman", "kim", "hangi", "kaç", "her",
      "şimdi", "bugün", "yarın", "dün", "önce", "sonra", "burada", "orada",
    ],
    startPhrase: "Bir varmış bir yokmuş, zamanın başında bir hikaye başlamış.",
  },
  dutch: {
    name: "Dutch",
    words: [
      "de", "het", "een", "en", "van", "in", "is", "dat", "op", "te",
      "zijn", "met", "voor", "aan", "niet", "ook", "er", "maar", "om", "had",
      "hij", "zij", "wij", "ik", "ze", "dit", "als", "bij", "uit", "nog",
      "al", "wel", "zo", "door", "naar", "dan", "over", "kan", "zijn", "heeft",
      "groot", "klein", "nieuw", "oud", "goed", "mooi", "snel", "lang", "hoog",
      "gaan", "doen", "zien", "weten", "kunnen", "willen", "komen", "zeggen",
      "tijd", "dag", "jaar", "wereld", "land", "stad", "huis", "water", "leven",
      "mens", "werk", "liefde", "hoop", "natuur", "licht", "weg", "deur",
      "nu", "hier", "daar", "altijd", "nooit", "soms", "samen", "alleen",
    ],
    startPhrase: "In het begin was er het woord, en de wereld werd gevuld met betekenis.",
  },
  polish: {
    name: "Polish",
    words: [
      "w", "i", "nie", "na", "to", "się", "z", "do", "jest", "że",
      "a", "jak", "co", "jego", "jej", "ich", "już", "ale", "by", "go",
      "o", "tak", "mi", "ten", "ta", "te", "przez", "po", "dla", "przy",
      "on", "ona", "oni", "my", "wy", "ja", "tu", "tam", "tu", "nigdy",
      "duży", "mały", "nowy", "stary", "dobry", "piękny", "szybki", "długi",
      "iść", "robić", "mieć", "być", "widzieć", "znać", "mówić", "słuchać",
      "czas", "dzień", "rok", "świat", "kraj", "miasto", "dom", "woda", "niebo",
      "człowiek", "życie", "miłość", "nadzieja", "natura", "serce", "droga",
      "teraz", "tu", "zawsze", "razem", "sam", "każdy", "wszystko", "bardzo",
    ],
    startPhrase: "Na początku było Słowo, a Słowo wypełniało świat swoim znaczeniem.",
  },
  swedish: {
    name: "Swedish",
    words: [
      "och", "i", "att", "det", "en", "är", "som", "på", "för", "av",
      "med", "till", "den", "har", "inte", "om", "ett", "var", "kan", "man",
      "men", "jag", "vi", "de", "du", "han", "hon", "sig", "från", "när",
      "efter", "nu", "redan", "bara", "eller", "alla", "lite", "mycket", "igen",
      "stor", "liten", "ny", "gammal", "bra", "vacker", "snabb", "lång", "hög",
      "gå", "göra", "se", "veta", "kunna", "vilja", "komma", "säga", "höra",
      "tid", "dag", "år", "värld", "land", "stad", "hus", "vatten", "himmel",
      "människa", "liv", "kärlek", "hopp", "natur", "ljus", "väg", "hjärta",
      "här", "där", "alltid", "aldrig", "ibland", "tillsammans", "ensam",
    ],
    startPhrase: "I begynnelsen var ordet, och ordet fyllde världen med mening och ljus.",
  },
  greek: {
    name: "Greek",
    words: [
      "και", "το", "η", "τα", "ο", "οι", "ένα", "μια", "με", "στο",
      "στη", "από", "για", "που", "είναι", "δεν", "θα", "να", "έχω", "έχει",
      "αυτό", "αυτή", "αυτός", "εγώ", "εσύ", "εμείς", "αυτοί", "πολύ", "λίγο",
      "τώρα", "εδώ", "εκεί", "πάντα", "ποτέ", "μαζί", "μόνο", "καλά", "σωστά",
      "μεγάλος", "μικρός", "νέος", "παλιός", "καλός", "ωραίος", "γρήγορος",
      "πηγαίνω", "κάνω", "βλέπω", "ξέρω", "μπορώ", "θέλω", "έρχομαι", "λέω",
      "χρόνος", "μέρα", "χρόνος", "κόσμος", "χώρα", "πόλη", "σπίτι", "νερό",
      "ουρανός", "άνθρωπος", "ζωή", "αγάπη", "ελπίδα", "φύση", "φως", "δρόμος",
      "καρδιά", "σκέψη", "όνειρο", "ψυχή", "γνώση", "δύναμη", "ειρήνη",
    ],
    startPhrase: "Εν αρχή ην ο Λόγος, και ο Λόγος ήν προς τον Θεόν.",
  },
  hebrew: {
    name: "Hebrew",
    rtl: true,
    words: [
      "של", "את", "הוא", "זה", "לא", "על", "עם", "כי", "אל", "גם",
      "אחד", "יש", "הם", "היה", "אבל", "כן", "אם", "עוד", "רק", "כבר",
      "מה", "כל", "כך", "אני", "הוא", "היא", "אנחנו", "אתם", "הם", "מי",
      "ב", "ל", "מ", "ו", "כ", "ה", "א", "ש", "ר", "ת",
      "גדול", "קטן", "חדש", "ישן", "טוב", "יפה", "מהיר", "ארוך",
      "ללכת", "לעשות", "לראות", "לדעת", "לכתוב", "לקרוא", "לאהוב", "לחשוב",
      "זמן", "יום", "שנה", "עולם", "ארץ", "עיר", "בית", "מים", "שמים",
      "אדם", "חיים", "אהבה", "תקווה", "טבע", "אור", "דרך", "לב", "נשמה",
    ],
    startPhrase: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ.",
  },
  indonesian: {
    name: "Indonesian",
    words: [
      "dan", "di", "yang", "ini", "itu", "dari", "ke", "dengan", "untuk", "pada",
      "adalah", "tidak", "juga", "ada", "atau", "oleh", "saya", "kita", "mereka",
      "kami", "anda", "dia", "ia", "aku", "kamu", "sudah", "akan", "bisa", "harus",
      "besar", "kecil", "baru", "lama", "baik", "indah", "cepat", "panjang", "tinggi",
      "pergi", "lakukan", "lihat", "tahu", "mau", "datang", "bicara", "dengar",
      "waktu", "hari", "tahun", "dunia", "negara", "kota", "rumah", "air", "langit",
      "manusia", "hidup", "cinta", "harapan", "alam", "cahaya", "jalan", "hati",
      "sekarang", "di sini", "di sana", "selalu", "tidak pernah", "bersama",
      "pikiran", "mimpi", "jiwa", "pengetahuan", "kekuatan", "damai", "karya",
    ],
    startPhrase: "Pada mulanya adalah kata, dan kata itu memenuhi dunia dengan makna.",
  },
};

const LANGUAGE_KEYS = Object.keys(LANGUAGES);

function getWordFromList(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

function getSentenceFromList(words: string[], wordCount?: number): string {
  const count = wordCount ?? (8 + Math.floor(Math.random() * 10));
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(getWordFromList(words));
  }
  const first = picked[0];
  picked[0] = first.charAt(0).toUpperCase() + first.slice(1);
  if (count > 6) {
    const commaIdx = 3 + Math.floor(Math.random() * (count - 4));
    picked[commaIdx] = picked[commaIdx] + ",";
  }
  return picked.join(" ") + ".";
}

function getParagraphFromList(words: string[], sentenceCount?: number): string {
  const count = sentenceCount ?? (4 + Math.floor(Math.random() * 4));
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(getSentenceFromList(words));
  }
  return sentences.join(" ");
}

function generate(unit: Unit, count: number, startWithPhrase: boolean, lang: LanguageConfig): string {
  const { words, startPhrase } = lang;
  let result = "";
  switch (unit) {
    case "paragraphs": {
      const paras: string[] = [];
      for (let i = 0; i < count; i++) {
        paras.push(getParagraphFromList(words));
      }
      if (startWithPhrase && paras.length > 0) {
        const rest = paras[0].split(". ").slice(1).join(". ");
        paras[0] = startPhrase + (rest ? " " + rest : "");
      }
      result = paras.join("\n\n");
      break;
    }
    case "sentences": {
      const sents: string[] = [];
      for (let i = 0; i < count; i++) {
        sents.push(getSentenceFromList(words));
      }
      if (startWithPhrase && sents.length > 0) {
        sents[0] = startPhrase;
      }
      result = sents.join(" ");
      break;
    }
    case "words": {
      const wordList: string[] = [];
      for (let i = 0; i < count; i++) {
        wordList.push(getWordFromList(words));
      }
      result = wordList.join(" ");
      break;
    }
  }
  return result;
}

export default function LoremIpsumPage() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithPhrase, setStartWithPhrase] = useState(true);
  const [langKey, setLangKey] = useState("latin");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentLang = LANGUAGES[langKey];

  const handleGenerate = useCallback(() => {
    setOutput(generate(unit, count, startWithPhrase, currentLang));
  }, [unit, count, startWithPhrase, currentLang]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lorem-ipsum.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;
  const charCount = output.length;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={BookOpen}
          title="Lorem Ipsum Generator"
          description="Generate placeholder text in multiple languages as paragraphs, sentences, or words. Free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">

          {/* Language Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
              <Globe className="w-3.5 h-3.5" />
              Language
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setLangKey(key)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    langKey === key
                      ? "bg-primary-muted border-primary-border text-primary"
                      : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                  }`}
                >
                  {LANGUAGES[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">Generate</label>
            <div className="flex gap-2">
              {(["paragraphs", "sentences", "words"] as Unit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-4 py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                    unit === u
                      ? "bg-primary-muted border-primary-border text-primary"
                      : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Count: {count} {unit}
            </label>
            <input
              type="range"
              min={1}
              max={unit === "words" ? 500 : unit === "sentences" ? 50 : 20}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Start with classic phrase */}
          {unit !== "words" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithPhrase}
                onChange={(e) => setStartWithPhrase(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary"
              />
              <span className="text-sm text-foreground">
                Start with classic phrase
              </span>
              {startWithPhrase && (
                <span
                  className="text-xs text-foreground-muted italic truncate max-w-60"
                  dir={currentLang.rtl ? "rtl" : undefined}
                >
                  &ldquo;{currentLang.startPhrase}&rdquo;
                </span>
              )}
            </label>
          )}

          {/* Generate */}
          <button
            onClick={handleGenerate}
            className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Generate Text
          </button>

          {/* Output */}
          {output && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-foreground-muted">
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                </div>
                <span className="text-xs text-foreground-muted">{currentLang.name}</span>
              </div>
              <textarea
                value={output}
                readOnly
                dir={currentLang.rtl ? "rtl" : "ltr"}
                className="w-full h-64 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground leading-relaxed resize-y focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .txt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">20 Languages</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Generate placeholder text in Latin, English, Spanish, French, German, Portuguese, Italian, Dutch, Swedish, Polish, Turkish, Indonesian, Arabic, Hebrew, Hindi, Greek, Chinese, Japanese, Korean, or Russian — with RTL support for Arabic and Hebrew.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Copy & Download</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                One-click copy to clipboard or download as .txt. Shows word and character counts for reference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
