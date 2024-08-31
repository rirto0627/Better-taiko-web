db = db.getSiblingDB('taiko');

db.createCollection('users');
db.createCollection('songs');

db.categories.insertMany([
    {"title": "Pop", "title_lang": {"en": "Pop", "ja": "ポップス"}},
    {"title": "Anime", "title_lang": {"en": "Anime", "ja": "アニメ"}},
    {"title": "Vocaloid", "title_lang": {"en": "Vocaloid", "ja": "ボーカロイド"}},
    {"title": "Variety", "title_lang": {"en": "Variety", "ja": "バラエティ"}},
    {"title": "Classical", "title_lang": {"en": "Classical", "ja": "クラシック"}},
    {"title": "Game Music", "title_lang": {"en": "Game Music", "ja": "ゲームミュージック"}},
    {"title": "Namco Original", "title_lang": {"en": "Namco Original", "ja": "ナムコオリジナル"}}
]);
