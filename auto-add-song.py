import os
import shutil
import json
from pymongo import MongoClient
import re
import logging
from bson import ObjectId
import argparse

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 連接到MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['taiko']  # 替換為你的數據庫名稱

# 插入類別
categories = [
    {"id": 1, "title": "Pop", "title_lang": {"en": "Pop", "ja": "ポップス"}},
    {"id": 2, "title": "Anime", "title_lang": {"en": "Anime", "ja": "アニメ"}},
    {"id": 3, "title": "Vocaloid", "title_lang": {"en": "Vocaloid", "ja": "ボーカロイド"}},
    {"id": 4, "title": "Variety", "title_lang": {"en": "Variety", "ja": "バラエティ"}},
    {"id": 5, "title": "Classical", "title_lang": {"en": "Classical", "ja": "クラシック"}},
    {"id": 6, "title": "Game Music", "title_lang": {"en": "Game Music", "ja": "ゲームミュージック"}},
    {"id": 7, "title": "Namco Original", "title_lang": {"en": "Namco Original", "ja": "ナムコオリジナル"}}
]

# 創建類別映射
category_map = {cat['title']: cat['id'] for cat in categories}

def get_song_info(directory):
    files = os.listdir(directory)
    song_info = {
        'title': '',
        'title_lang': {},
        'subtitle': '',
        'subtitle_lang': {},
        'courses': {
            'easy': {'stars': 0, 'branch': False},
            'normal': {'stars': 0, 'branch': False},
            'hard': {'stars': 0, 'branch': False},
            'oni': {'stars': 0, 'branch': False},
            'ura': {'stars': 0, 'branch': False}
        },
        'enabled': True,
        'offset': 0,
        'skin_id': None,
        'preview': 0,
        'volume': 1.0,
        'maker_id': None,
        'lyrics': False,
        'hash': None,
        'bpm': 0
    }

    tja_files = [f for f in files if f.endswith('.tja')]
    if tja_files:
        song_info['type'] = 'tja'
        song_info['music_type'] = 'ogg'  # 假設音樂文件是.ogg格式

        with open(os.path.join(directory, tja_files[0]), 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

            # 提取日語標題 (TITLEJA)
            title_ja_match = re.search(r'TITLEJA:(.+)', content)
            if title_ja_match:
                song_info['title'] = title_ja_match.group(1).strip()
                song_info['title_lang']['ja'] = song_info['title']
            else:
                # 如果沒有 TITLEJA，則使用一般的 TITLE
                title_match = re.search(r'TITLE:(.+)', content)
                if title_match:
                    song_info['title'] = title_match.group(1).strip()
                    song_info['title_lang']['ja'] = song_info['title']

            # 提取其他語言的標題
            for lang in ['EN', 'CN', 'TW', 'KO']:
                title_lang_match = re.search(rf'TITLE{lang}:(.+)', content)
                if title_lang_match:
                    song_info['title_lang'][lang.lower()] = title_lang_match.group(1).strip()

            # 提取副標題
            subtitle_match = re.search(r'SUBTITLE:(.+)', content)
            if subtitle_match:
                song_info['subtitle'] = subtitle_match.group(1).strip()

            # 提取多語言副標題
            for lang in ['JA', 'EN', 'CN', 'TW', 'KO']:
                subtitle_lang_match = re.search(rf'SUBTITLE{lang}:(.+)', content)
                if subtitle_lang_match:
                    song_info['subtitle_lang'][lang.lower()] = subtitle_lang_match.group(1).strip()

            # 提取 BPM
            bpm_match = re.search(r'BPM:(\d+(\.\d+)?)', content)
            if bpm_match:
                song_info['bpm'] = float(bpm_match.group(1))

            # 提取 OFFSET
            offset_match = re.search(r'OFFSET:(-?\d+(\.\d+)?)', content)
            if offset_match:
                song_info['offset'] = float(offset_match.group(1))

            # 提取難度和等級
            for course in ['EASY', 'NORMAL', 'HARD', 'ONI', 'URA']:
                course_match = re.search(rf'COURSE:{course}\s*\nLEVEL:(\d+)', content, re.IGNORECASE)
                if course_match:
                    level = int(course_match.group(1))
                    song_info['courses'][course.lower()] = {'stars': level, 'branch': False}

            # 檢查是否有分支
            if 'BRANCH' in content.upper():
                for course in song_info['courses']:
                    song_info['courses'][course]['branch'] = True

    # 確保 'ja' 鍵存在於 title_lang 中
    if 'ja' not in song_info['title_lang']:
        song_info['title_lang']['ja'] = song_info['title']

    return song_info

def generate_hash(song_id, song_info):
    # 這裡應該實現你的哈希生成邏輯
    # 暫時返回一個假的哈希值
    return f"fake_hash_{song_id}"

def reorganize_songs(base_directory, dev_mode=False):
    for category_folder in os.listdir(base_directory):
        category_path = os.path.join(base_directory, category_folder)
        if os.path.isdir(category_path):
            # 忽略類別文件夾名的前三個字符
            category = category_folder[3:] if len(category_folder) > 3 else category_folder
            for song in os.listdir(category_path):
                song_path = os.path.join(category_path, song)
                if os.path.isdir(song_path):
                    try:
                        song_info = get_song_info(song_path)
                        if song_info:
                            # 獲取新的song_id
                            seq = db.seq.find_one_and_update(
                                {'name': 'songs'},
                                {'$inc': {'value': 1}},
                                upsert=True,
                                return_document=True
                            )
                            song_id = seq['value']

                            # 設置其他必要的字段
                            song_info['id'] = song_id
                            song_info['order'] = song_id
                            song_info['category_id'] = category_map.get(category)

                            # 生成哈希
                            song_info['hash'] = generate_hash(song_id, song_info)

                            # 複製文件（而不是移動）
                            new_song_path = os.path.join(base_directory, str(song_id))
                            os.makedirs(new_song_path, exist_ok=True)

                            for file in os.listdir(song_path):
                                if file.endswith('.ogg'):
                                    shutil.copy2(os.path.join(song_path, file),
                                                 os.path.join(new_song_path, 'main.ogg'))
                                elif file.endswith('.tja'):
                                    shutil.copy2(os.path.join(song_path, file),
                                                 os.path.join(new_song_path, 'main.tja'))

                            # 插入到數據庫
                            db.songs.insert_one(song_info)
                            logging.info(f"Imported and copied: {song_info['title']} (ID: {song_id})")

                            # 如果不是開發模式，則刪除原目錄
                            if not dev_mode:
                                shutil.rmtree(song_path)
                    except Exception as e:
                        logging.error(f"Error processing song {song}: {str(e)}")

    # 清理空的類別目錄（如果不是開發模式）
    if not dev_mode:
        for category_folder in os.listdir(base_directory):
            category_path = os.path.join(base_directory, category_folder)
            if os.path.isdir(category_path) and not os.listdir(category_path):
                os.rmdir(category_path)
def update_existing_songs():
    for song in db.songs.find():
        updates = {}
        if 'maker_id' not in song:
            updates['maker_id'] = None
        if 'skin_id' not in song:
            updates['skin_id'] = None
        if 'hash' not in song:
            updates['hash'] = generate_hash(song['id'], song)
        if updates:
            db.songs.update_one({'_id': song['_id']}, {'$set': updates})
            logging.info(f"Updated song {song['id']} with {updates.keys()}")

def clear_database():
    db.songs.delete_many({})
    db.seq.delete_many({})
    logging.info("Cleared all songs and sequence data from the database.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import and organize songs for Taiko game.")
    parser.add_argument('--dev', action='store_true', help="Run in development mode")
    args = parser.parse_args()

    base_directory = "./public/songs"  # 替換為你的歌曲基礎目錄

    if args.dev:
        logging.info("Running in development mode")
        clear_database()

    db.categories.delete_many({})  # 清除現有類別
    db.categories.insert_many(categories)

    reorganize_songs(base_directory, dev_mode=args.dev)
    update_existing_songs()
    logging.info("Reorganization and import completed.")