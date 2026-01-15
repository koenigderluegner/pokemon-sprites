import path from 'path';

export const ROOT_DIR = path.join(__dirname, '../../');
export const SPRITES_DIR = path.join(ROOT_DIR, 'sprites');
export const DATA_JSON_PATH = path.join(ROOT_DIR, 'data.json');
export const PREBUILTS_DIR = path.join(ROOT_DIR, 'prebuilts/default');
export const DOCS_DIR = path.join(ROOT_DIR, '../../docs');

export const ICON_CATEGORIES = new Set(['go', 'bonus', 'extra']);
export const ICON_MODIFIERS = new Set(['★', '3-ds', 'switch']);
