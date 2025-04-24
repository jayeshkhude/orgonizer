// Enhanced file type mapping with subcategories
export const fileTypeFolders: { [key: string]: { [key: string]: string[] } } = {
  'code': {
    'javascript': ['.js', '.jsx', '.ts', '.tsx'],
    'python': ['.py', '.pyw', '.pyc', '.pyo', '.pyd'],
    'java': ['.java', '.class', '.jar'],
    'cpp': ['.cpp', '.h', '.hpp', '.cxx', '.hxx'],
    'c': ['.c', '.h'],
    'php': ['.php', '.phtml', '.php3', '.php4', '.php5', '.phps'],
    'ruby': ['.rb', '.rbw'],
    'go': ['.go'],
    'rust': ['.rs'],
    'swift': ['.swift'],
    'kotlin': ['.kt', '.kts'],
    'html': ['.html', '.htm', '.xhtml'],
    'css': ['.css', '.scss', '.sass', '.less'],
    'json': ['.json'],
    'xml': ['.xml', '.xsd', '.xsl', '.xslt'],
    'yaml': ['.yaml', '.yml'],
    'sql': ['.sql', '.psql', '.pgsql'],
    'shell': ['.sh', '.bash', '.zsh', '.fish'],
    'batch': ['.bat', '.cmd'],
    'powershell': ['.ps1', '.psm1', '.psd1'],
    'other': ['.lua', '.r', '.matlab', '.scala', '.groovy']
  },
  'images': {
    'jpeg': ['.jpg', '.jpeg', '.jpe', '.jif', '.jfif', '.jfi'],
    'png': ['.png'],
    'gif': ['.gif'],
    'svg': ['.svg', '.svgz'],
    'webp': ['.webp'],
    'bmp': ['.bmp', '.dib'],
    'tiff': ['.tiff', '.tif'],
    'ico': ['.ico'],
    'heic': ['.heic', '.heif'],
    'raw': ['.raw', '.cr2', '.nef', '.dng', '.arw', '.sr2', '.rw2'],
    'psd': ['.psd', '.psb'],
    'ai': ['.ai'],
    'other': ['.eps', '.indd', '.cdr']
  },
  'videos': {
    'mp4': ['.mp4', '.m4v', '.m4p'],
    'mov': ['.mov', '.qt'],
    'avi': ['.avi'],
    'mkv': ['.mkv'],
    'wmv': ['.wmv'],
    'flv': ['.flv', '.f4v', '.f4p', '.f4a', '.f4b'],
    'webm': ['.webm'],
    'mpeg': ['.mpeg', '.mpg', '.mpe', '.m1v', '.m2v'],
    'other': ['.3gp', '.3g2', '.mxf', '.roq', '.nsv', '.flv', '.f4v']
  },
  'audio': {
    'mp3': ['.mp3'],
    'wav': ['.wav'],
    'aac': ['.aac', '.m4a'],
    'flac': ['.flac'],
    'ogg': ['.ogg', '.oga'],
    'wma': ['.wma'],
    'aiff': ['.aiff', '.aif'],
    'alac': ['.alac'],
    'opus': ['.opus'],
    'other': ['.mid', '.midi', '.kar']
  },
  'documents': {
    'pdf': ['.pdf'],
    'word': ['.doc', '.docx', '.docm', '.dot', '.dotx', '.dotm'],
    'excel': ['.xls', '.xlsx', '.xlsm', '.xlt', '.xltx', '.xltm'],
    'powerpoint': ['.ppt', '.pptx', '.pptm', '.pot', '.potx', '.potm'],
    'text': ['.txt', '.rtf', '.md', '.markdown', '.mdown'],
    'ebook': ['.epub', '.mobi', '.azw', '.azw3', '.fb2'],
    'other': ['.odt', '.ods', '.odp', '.odg', '.odf']
  },
  'archives': {
    'zip': ['.zip'],
    'rar': ['.rar'],
    '7z': ['.7z'],
    'tar': ['.tar'],
    'gz': ['.gz', '.gzip'],
    'bz2': ['.bz2', '.bzip2'],
    'xz': ['.xz'],
    'iso': ['.iso'],
    'dmg': ['.dmg'],
    'other': ['.cab', '.arj', '.lzh', '.lha', '.z', '.zipx']
  },
  'executables': {
    'windows': ['.exe', '.msi', '.bat', '.cmd', '.ps1'],
    'mac': ['.dmg', '.app', '.pkg'],
    'linux': ['.deb', '.rpm', '.AppImage'],
    'android': ['.apk'],
    'java': ['.jar'],
    'other': ['.bin', '.run', '.sh']
  },
  'fonts': {
    'ttf': ['.ttf', '.ttc'],
    'otf': ['.otf'],
    'woff': ['.woff'],
    'woff2': ['.woff2'],
    'other': ['.eot', '.svg']
  },
  'data': {
    'csv': ['.csv'],
    'tsv': ['.tsv'],
    'dat': ['.dat'],
    'db': ['.db', '.sqlite', '.sqlite3'],
    'access': ['.mdb', '.accdb'],
    'other': ['.dbf', '.mdf', '.ndf']
  }
}; 