'''
Date: 2024-06-06 18:19:04
LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
LastEditTime: 2024-06-06 18:19:30
'''
import json

file_path = './build/wechatgame/game.json'

with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

for subpackage in data.get('subpackages', []):
    root = subpackage.get('root', '')
    if not root.startswith('/'):
        subpackage['root'] = '/' + root

with open(file_path, 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print(f"Updated 'root' fields in {file_path}")
