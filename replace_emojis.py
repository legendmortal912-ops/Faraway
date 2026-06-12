import os
import re

EMOJI_MAP = {
    '📊': 'BarChart', '🌐': 'Globe', '➕': 'Plus', '🔍': 'Search', '🚚': 'Truck',
    '🏥': 'Building2', '🛡': 'Shield', '📜': 'ScrollText', '🏛': 'Landmark',
    '⚙': 'Settings', '📦': 'Package', '📍': 'MapPin', '🔄': 'RefreshCw',
    '📋': 'ClipboardList', '🔒': 'Lock', '✈': 'Plane', '🚨': 'AlertTriangle',
    '🚑': 'Ambulance', '✅': 'CheckCircle2', '⚡': 'Zap', '🔐': 'LockKeyhole',
    '📡': 'RadioTower', '🌡': 'Thermometer', '🧊': 'Snowflake', '🌍': 'Globe2',
    '📄': 'FileText', '⚠': 'AlertTriangle', '🫀': 'HeartPulse'
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    found_icons = set()
    for emoji, icon_name in EMOJI_MAP.items():
        if emoji in content:
            found_icons.add(icon_name)
            # Safe replacement for JSX
            content = content.replace(emoji, f"<{icon_name} size={{14}} style={{display:'inline-block', verticalAlign:'middle', margin:'0 4px'}} />")

    # Clean flags
    for flag in ['🇬', '🇦', '🇮', '🇳', '🇪', '🇧', '🇫', '🇷']:
        content = content.replace(flag, "")

    if not found_icons:
        return

    # Add imports
    import_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"];?", content)
    if import_match:
        existing_icons = [i.strip() for i in import_match.group(1).split(',')]
        all_icons = sorted(list(set(existing_icons + list(found_icons))))
        new_import = f"import {{ {', '.join(all_icons)} }} from 'lucide-react';"
        content = content[:import_match.start()] + new_import + content[import_match.end():]
    else:
        new_import = f"import {{ {', '.join(sorted(list(found_icons)))} }} from 'lucide-react';\n"
        imports = list(re.finditer(r"^import\s+.*$", content, re.MULTILINE))
        if imports:
            last_import = imports[-1]
            content = content[:last_import.end()] + '\n' + new_import + content[last_import.end():]
        else:
            content = new_import + content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('frontend/src'):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            process_file(os.path.join(root, f))
print("Emojis replaced!")
