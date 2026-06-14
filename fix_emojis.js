const fs = require('fs');
const path = require('path');

const reactMappings = {
  '⚠️': 'AlertTriangle',
  '⚠': 'AlertTriangle',
  '✅': 'CheckCircle2',
  '🔒': 'Lock',
  '🔐': 'Lock',
  '⚡': 'Zap',
  '🚑': 'Ambulance',
  '✈️': 'Plane',
  '✈': 'Plane',
  '🌐': 'Globe2',
  '🌡️': 'Thermometer',
  '🌡': 'Thermometer',
  '⏳': 'Hourglass',
  '📡': 'Radio',
  '🏥': 'Building2',
  '✕': 'X',
  '🚨': 'AlertOctagon',
  '✓': 'Check',
  '📋': 'ClipboardList',
  '⏱️': 'Timer',
  '⏱': 'Timer',
  '🌍': 'Globe2',
  '📄': 'FileText',
  '📊': 'BarChart',
  '🔪': 'Scissors',
  '📦': 'Package',
  '🧊': 'Snowflake',
  '🟢': 'Activity',
  '🧬': 'Dna',
  '🪪': 'IdCard',
  '🩸': 'Droplet',
  '🫀': 'Heart',
  '✂️': 'Scissors',
  '✂': 'Scissors',
  '📤': 'Upload',
  '○': 'Circle',
  '🛡️': 'ShieldCheck',
  '🛡': 'ShieldCheck',
  '➕': 'Plus',
  '🎯': 'Target',
  '🔄': 'RefreshCw',
  '▶': 'Play'
};

const pyMappings = {
  '⚠️': '[WARNING]',
  '⚠': '[WARNING]',
  '✅': '[SUCCESS]',
  '✈️': '[FLIGHT]',
  '✈': '[FLIGHT]',
  '🚑': '[AMBULANCE]',
  '🚨': '[CRITICAL]',
  '🧊': '[COLD]',
  '⏱️': '[TIME]',
  '⏱': '[TIME]'
};

function processJsxFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let addedIcons = new Set();

  // Handle flags
  content = content.replace(/['"](?:🇮🇳|🇫🇷|🇧🇷|🇬🇧|🇦🇪)['"]/g, 'null');

  // Replace emojis
  for (const [emoji, iconName] of Object.entries(reactMappings)) {
    if (content.includes(emoji)) {
      addedIcons.add(iconName);
      // We will replace the emoji with the icon component
      // Some emojis are inside quotes, some are inside JSX text.
      // A simple regex might be dangerous if inside strings like '{ icon: "🟢" }',
      // We will replace "🟢" with <Activity size={16} />
      
      const regex = new RegExp(emoji, 'g');
      content = content.replace(regex, `<${iconName} size={16} style={{display: 'inline-block', verticalAlign: 'middle'}}/>`);
    }
  }

  // Fix up specific messy replacements
  content = content.replace(/['"`]<([A-Za-z0-9]+) size=\{16\} style=\{\{display: 'inline-block', verticalAlign: 'middle'\}\}\/>['"`]/g, "<$1 size={16} />");
  content = content.replace(/\{ icon: <([A-Za-z0-9]+) size=\{16\} \/>/g, "{ icon: <$1 size={24} />");

  if (addedIcons.size > 0 && content !== originalContent) {
    // Inject import
    const iconsArray = Array.from(addedIcons).join(', ');
    
    // Check if lucide-react import already exists
    if (content.includes('lucide-react')) {
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
        const existing = p1.split(',').map(s => s.trim());
        const newIcons = Array.from(addedIcons).filter(i => !existing.includes(i));
        if (newIcons.length === 0) return match;
        return `import { ${existing.join(', ')}, ${newIcons.join(', ')} } from 'lucide-react';`;
      });
    } else {
      content = `import { ${iconsArray} } from 'lucide-react';\n` + content;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath, 'added', iconsArray);
  }
}

function processPyFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  for (const [emoji, text] of Object.entries(pyMappings)) {
    const regex = new RegExp(emoji, 'g');
    content = content.replace(regex, text);
  }
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules') {
        walkDir(fullPath);
      }
    } else {
      if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
        processJsxFile(fullPath);
      } else if (fullPath.endsWith('.py')) {
        processPyFile(fullPath);
      }
    }
  }
}

walkDir('frontend/src');
walkDir('backend');
