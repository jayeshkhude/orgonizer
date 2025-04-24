'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiFolder, FiUpload, FiCheck, FiDownload, FiX, FiFile, FiArchive, FiArrowRight, FiImage, FiMusic, FiVideo, FiFileText, FiUser, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import Link from 'next/link';
import AuthPopup from './components/AuthPopup';
import { supabase } from './lib/supabase';
import HistoryView from './components/HistoryView';

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

// Helper function to get the main category and subcategory for a file
const getFileCategories = (fileName: string): { mainCategory: string; subCategory: string } => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  for (const [mainCategory, subCategories] of Object.entries(fileTypeFolders)) {
    for (const [subCategory, extensions] of Object.entries(subCategories)) {
      if (extensions.includes(`.${extension}`)) {
        return { mainCategory, subCategory };
      }
    }
  }
  
  return { mainCategory: 'others', subCategory: 'other' };
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'text': return <FiFileText className="w-6 h-6" />;
    case 'document': return <FiFile className="w-6 h-6" />;
    case 'image': return <FiImage className="w-6 h-6" />;
    case 'video': return <FiVideo className="w-6 h-6" />;
    case 'audio': return <FiMusic className="w-6 h-6" />;
    case 'archive': return <FiArchive className="w-6 h-6" />;
    case 'code': return <FiFile className="w-6 h-6" />;
    case 'pdf': return <FiFileText className="w-6 h-6 text-red-500" />;
    case 'spreadsheet': return <FiFile className="w-6 h-6 text-green-500" />;
    case 'presentation': return <FiFile className="w-6 h-6 text-orange-500" />;
    case 'database': return <FiFile className="w-6 h-6 text-blue-500" />;
    case 'font': return <FiFile className="w-6 h-6 text-purple-500" />;
    case 'config': return <FiFile className="w-6 h-6 text-gray-500" />;
    case 'log': return <FiFile className="w-6 h-6 text-gray-700" />;
    case 'backup': return <FiArchive className="w-6 h-6 text-yellow-500" />;
    case 'template': return <FiFile className="w-6 h-6 text-teal-500" />;
    default: return <FiFile className="w-6 h-6" />;
  }
};

interface FileAnimation {
  id: number;
  type: 'absorb' | 'burst';
  file: {
    name: string;
    type: string;
  };
  entry?: {
    x: number;
    y: number;
  };
  exit?: {
    x: number;
    y: number;
  };
}

interface FloatingFile {
  id: number;
  x: number;
  y: number;
  type: string;
  direction: 'up-right' | 'up-left' | 'down-right' | 'down-left';
}

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [organizing, setOrganizing] = useState(false);
  const [organized, setOrganized] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{ files: { name: string, type: string }[], summary: string, structure?: { [key: string]: { [key: string]: { name: string, type: string }[] } } } | null>(null);
  const [breathingScale, setBreathingScale] = useState(1);
  const [breathingOpacity, setBreathingOpacity] = useState(1);
  const [fileAnimations, setFileAnimations] = useState<FileAnimation[]>([]);
  const [zipFileVisible, setZipFileVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string, type: string }[]>([]);
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [browseAnimation, setBrowseAnimation] = useState(false);
  const [organizeAnimation, setOrganizeAnimation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [floatingFiles, setFloatingFiles] = useState<FloatingFile[]>([]);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enhanced breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingScale(prev => prev === 1 ? 1.05 : 1);
      setBreathingOpacity(prev => prev === 1 ? 0.9 : 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced file animation effect
  useEffect(() => {
    if (organizing) {
      const interval = setInterval(() => {
        // Generate more random files
        const fileCount = Math.floor(Math.random() * 3) + 2; // 2-4 files at once
        for (let i = 0; i < fileCount; i++) {
          const fileName = `file${Math.floor(Math.random() * 1000)}.${['txt', 'pdf', 'jpg', 'doc', 'mp4', 'mp3', 'zip', 'exe', 'json', 'heic'][Math.floor(Math.random() * 10)]}`;
          const fileType = getFileCategories(fileName).mainCategory;
          
          const randomFile = {
            name: fileName,
            type: fileType
          };
          
          const fileId = Date.now() + i;
          setFileAnimations(prev => [...prev, { 
            id: fileId, 
            type: 'absorb', 
            file: randomFile, 
            entry: { x: -300, y: Math.random() * 200 - 100 }, 
            exit: { x: 300, y: Math.random() * 200 - 100 } 
          }]);
          
          // Ensure files exit after a delay
          setTimeout(() => {
            setFileAnimations(prev => {
              const filtered = prev.filter(anim => anim.id !== fileId);
              setFilesProcessed(prev => prev + 1);
              return [...filtered, { 
                id: fileId + 1000, 
                type: 'burst', 
                file: randomFile, 
                entry: { x: 300, y: Math.random() * 200 - 100 }, 
                exit: { x: -300, y: Math.random() * 200 - 100 } 
              }];
            });
          }, 1500);
        }
      }, 500);

      return () => {
        clearInterval(interval);
        setFilesProcessed(0);
      };
    }
  }, [organizing]);

  // Add floating files animation
  useEffect(() => {
    const directions: FloatingFile['direction'][] = ['up-right', 'up-left', 'down-right', 'down-left'];
    const fileTypes = [
      'text', 'document', 'image', 'video', 'audio', 'archive', 'code',
      'pdf', 'spreadsheet', 'presentation', 'database', 'font', 'config',
      'log', 'backup', 'template'
    ];
    
    const interval = setInterval(() => {
      if (!user) {
        // Create 3-5 files at once
        const fileCount = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < fileCount; i++) {
          const direction = directions[Math.floor(Math.random() * 4)];
          const newFile: FloatingFile = {
            id: Date.now() + i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            type: fileTypes[Math.floor(Math.random() * fileTypes.length)],
            direction
          };
          setFloatingFiles(prev => [...prev, newFile]);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  // Clean up floating files that are too old
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setFloatingFiles(prev => prev.filter(file => Date.now() - file.id < 25000));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const getAnimationValues = (file: FloatingFile) => {
    const distance = 300;
    switch (file.direction) {
      case 'up-right':
        return {
          x: [file.x, file.x + distance, file.x + distance * 2],
          y: [file.y, file.y - distance, file.y - distance * 2]
        };
      case 'up-left':
        return {
          x: [file.x, file.x - distance, file.x - distance * 2],
          y: [file.y, file.y - distance, file.y - distance * 2]
        };
      case 'down-right':
        return {
          x: [file.x, file.x + distance, file.x + distance * 2],
          y: [file.y, file.y + distance, file.y + distance * 2]
        };
      case 'down-left':
        return {
          x: [file.x, file.x - distance, file.x - distance * 2],
          y: [file.y, file.y + distance, file.y + distance * 2]
        };
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    // Handle dropped files
    console.log(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleBrowse = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API is not supported in your browser');
      }
      
      const handle = await window.showDirectoryPicker();
      const files: { name: string, type: string }[] = [];
      
      // Process all files in the directory
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const fileType = getFileCategories(entry.name).mainCategory;
          files.push({ name: entry.name, type: fileType });
        }
      }
      
      setSelectedFiles(files);
      setSelectedPath(handle.name);
      setError('');
      
      // Start browse animation
      setBrowseAnimation(true);
      setTimeout(() => setBrowseAnimation(false), 3000);
    } catch (err) {
      console.error('Failed to select directory:', err);
      setError(err instanceof Error ? err.message : 'Failed to select directory');
    }
  };

  const handleOrganize = async () => {
    if (!selectedFiles.length) return;
    if (!user) {
      setError('Please sign in to organize files');
      return;
    }
    
    setOrganizing(true);
    setError('');
    try {
      // Create a map to track files by their categories
      const filesByCategory: { [key: string]: { [key: string]: { name: string, type: string }[] } } = {};
      
      // Group files by their main category and subcategory
      selectedFiles.forEach(file => {
        const { mainCategory, subCategory } = getFileCategories(file.name);
        
        if (!filesByCategory[mainCategory]) {
          filesByCategory[mainCategory] = {};
        }
        if (!filesByCategory[mainCategory][subCategory]) {
          filesByCategory[mainCategory][subCategory] = [];
        }
        
        filesByCategory[mainCategory][subCategory].push(file);
      });

      // Create summary of organization
      const summary = Object.entries(filesByCategory)
        .map(([mainCategory, subCategories]) => {
          const subCategoryCounts = Object.entries(subCategories)
            .map(([subCategory, files]) => `${subCategory}: ${files.length} files`)
            .join(', ');
          return `${mainCategory} (${subCategoryCounts})`;
        })
        .join('; ');

      // Save to Supabase
      const { error } = await supabase
        .from('organizations')
        .insert([
          {
            files: selectedFiles,
            summary: summary,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      setPreviewData({
        files: selectedFiles,
        summary: summary,
        structure: filesByCategory
      });
      
      setOrganized(true);
      setOrganizeAnimation(true);
      setTimeout(() => setOrganizeAnimation(false), 8000);
    } catch (err: any) {
      console.error('Failed to organize:', err);
      setError(err.message);
    } finally {
      setOrganizing(false);
    }
  };

  const handleDownload = async () => {
    if (!previewData) return;

    try {
      const zip = new JSZip();
      
      // Create main folders for each category
      Object.entries(previewData.structure || {}).forEach(([mainCategory, subCategories]) => {
        const mainFolder = zip.folder(mainCategory);
        
        // Create subfolders for each subcategory
        Object.entries(subCategories).forEach(([subCategory, files]) => {
          const subFolder = mainFolder?.folder(subCategory);
          
          // Add files to their respective subfolders
          files.forEach(file => {
            subFolder?.file(file.name, 'Sample content for ' + file.name);
          });
        });
      });

      // Add summary
      zip.file('summary.txt', previewData.summary);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'organized-files.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
      setError('Failed to create download package');
    }
  };

  // Browse animation - files come in and get absorbed
  useEffect(() => {
    if (browseAnimation) {
      const interval = setInterval(() => {
        setFileAnimations(prev => [
          ...prev,
          {
            id: Math.random(),
            type: 'absorb',
            file: { name: 'file.txt', type: 'text' },
            entry: { x: -300, y: Math.random() * 300 - 150 }
          }
        ]);
      }, 200);

      return () => clearInterval(interval);
    }
  }, [browseAnimation]);

  // Organize animation - files burst out from center
  useEffect(() => {
    if (organizeAnimation) {
      const interval = setInterval(() => {
        setFileAnimations(prev => [
          ...prev,
          {
            id: Math.random(),
            type: 'burst',
            file: { name: 'file.txt', type: 'text' },
            exit: { x: 300, y: Math.random() * 300 - 150 }
          }
        ]);
      }, 200);

      return () => clearInterval(interval);
    }
  }, [organizeAnimation]);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.account-menu') && !target.closest('.account-button')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end gap-4 mb-8">
          {user ? (
            <>
              <motion.button
                className="btn-secondary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(!showHistory)}
              >
                <FiClock />
                {showHistory ? 'Hide History' : 'Show History'}
              </motion.button>
              <Link href="/video-organizer">
                <motion.button
                  className="btn-secondary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiVideo />
                  Video Organizer
                </motion.button>
              </Link>
              <div className="relative">
                <motion.button
                  className="account-button btn-secondary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  <FiUser />
                  Account
                </motion.button>
                {showAccountMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="account-menu absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                          <FiUser className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-500">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <button
                          className="w-full btn-secondary flex items-center gap-2 justify-center"
                          onClick={() => supabase.auth.signOut()}
                        >
                          <FiX />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <motion.button
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAuthOpen(true)}
            >
              <FiUser />
              Sign In
            </motion.button>
          )}
        </div>

        <AuthPopup 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)}
          onAuthChange={setUser}
        />

        {showHistory ? (
          <HistoryView />
        ) : (
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-center mb-12"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
            >
              orgonizer
            </motion.h1>

            {!user ? (
              <div className="relative min-h-[80vh] overflow-hidden">
                {/* Floating files animation */}
                <AnimatePresence>
                  {floatingFiles.map((file) => {
                    const animation = getAnimationValues(file);
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ 
                          x: file.x, 
                          y: file.y, 
                          opacity: 0,
                          scale: 0.8,
                          rotate: -10
                        }}
                        animate={{ 
                          ...animation,
                          opacity: [0, 0.7, 0], // Increased opacity for better visibility
                          scale: [0.8, 1.2, 0.8], // Increased scale for larger icons
                          rotate: [-10, 0, 10]
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ 
                          duration: 25,
                          repeat: Infinity,
                          ease: "linear",
                          times: [0, 0.5, 1]
                        }}
                        className="absolute flex items-center justify-center w-12 h-12 bg-white/60 backdrop-blur-[2px] rounded-xl shadow-lg" // Increased size and opacity
                      >
                        {getFileIcon(file.type)}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Landing page content */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center space-y-8 relative z-10"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <h2 className="text-3xl font-semibold">Organize Your Files with Ease</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      orgonizer is your intelligent file organization assistant. 
                      Automatically categorize and organize your files into a clean, 
                      structured folder system.
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                  >
                    <motion.div 
                      className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiFolder className="w-8 h-8 mx-auto mb-4 text-blue-500" />
                      <h3 className="text-xl font-semibold mb-2">Smart Categorization</h3>
                      <p className="text-gray-600">Files are automatically sorted by type and category</p>
                    </motion.div>

                    <motion.div 
                      className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiDownload className="w-8 h-8 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold mb-2">Easy Download</h3>
                      <p className="text-gray-600">Download your organized files in a single click</p>
                    </motion.div>

                    <motion.div 
                      className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiClock className="w-8 h-8 mx-auto mb-4 text-purple-500" />
                      <h3 className="text-xl font-semibold mb-2">History Tracking</h3>
                      <p className="text-gray-600">Keep track of all your organized files</p>
                    </motion.div>
                  </motion.div>

                  {/* Sign In Call to Action */}
                  <motion.div
                    className="mt-16 mb-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div 
                      className="inline-flex items-center gap-4 bg-black text-white px-8 py-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      whileHover={{ y: -5, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
                    >
                      <span className="text-xl font-bold">Ready to organize your files?</span>
                      <motion.button
                        className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                        onClick={() => setIsAuthOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign In to Start
                      </motion.button>
                    </motion.div>
                  </motion.div>

                  {/* Video Organizer Section */}
                  <motion.div 
                    className="mt-16 text-center space-y-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <FiVideo className="w-8 h-8 text-black" />
                      <h2 className="text-3xl font-bold">Video Organization</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <motion.div 
                        className="bg-white/80 backdrop-blur-sm p-8 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        whileHover={{ y: -5, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
                      >
                        <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                          <FiClock className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Time-Based Sorting</h3>
                        <p className="text-black">Organize videos by creation date and time ranges</p>
                      </motion.div>

                      <motion.div 
                        className="bg-white/80 backdrop-blur-sm p-8 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        whileHover={{ y: -5, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
                      >
                        <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                          <FiFolder className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Custom Folders</h3>
                        <p className="text-black">Create and manage folders with specific timeframes</p>
                      </motion.div>

                      <motion.div 
                        className="bg-white/80 backdrop-blur-sm p-8 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        whileHover={{ y: -5, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
                      >
                        <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                          <FiVideo className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Video Preview</h3>
                        <p className="text-black">View thumbnails and organize with visual context</p>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            ) : (
              <>
                <motion.div 
                  className="relative rounded-2xl bg-white p-16 border-2 border-black"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center space-y-8">
                    <div className="relative h-48 flex items-center justify-center">
                      <motion.div 
                        className="absolute w-32 h-32 rounded-full bg-black/5 flex items-center justify-center"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full bg-black/5"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <FiFolder className="w-16 h-16 text-black" />
                      </motion.div>

                      <AnimatePresence>
                        {fileAnimations.map(({ id, type, file, entry, exit }) => (
                          <motion.div
                            key={id}
                            className="absolute"
                            initial={type === 'absorb' ? { 
                              x: entry?.x || -300,
                              y: entry?.y || 0,
                              scale: 1,
                              opacity: 1 
                            } : { 
                              x: 0,
                              y: 0,
                              scale: 0.5,
                              opacity: 1 
                            }}
                            animate={type === 'absorb' ? {
                              x: 0,
                              y: 0,
                              scale: 0,
                              opacity: 0
                            } : {
                              x: exit?.x || 300,
                              y: exit?.y || 0,
                              scale: 1,
                              opacity: 0
                            }}
                            transition={{ 
                              duration: type === 'absorb' ? 1.5 : 1,
                              ease: type === 'absorb' ? 'easeIn' : 'easeOut'
                            }}
                            onAnimationComplete={() => {
                              setFileAnimations(prev => prev.filter(a => a.id !== id));
                            }}
                          >
                            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded px-2 py-1 shadow-sm">
                              <div className="w-4 h-4">
                                {getFileIcon(file.type)}
                              </div>
                              <span className="text-sm text-gray-600">{file.name}</span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                      <motion.h2 
                        className="text-3xl font-semibold text-black/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {organized ? 'Files Organized!' : 'Clean Your Folders'}
                      </motion.h2>
                      <motion.p 
                        className="text-gray-600/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {organized 
                          ? 'Your files have been intelligently categorized'
                          : 'Select a folder to organize or drop files here'}
                      </motion.p>
                    </div>

                    {error && (
                      <motion.div 
                        className="text-red-500 text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    {selectedPath && (
                      <motion.div 
                        className="text-sm text-gray-600 break-all"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Selected: {selectedPath}
                      </motion.div>
                    )}

                    <div className="flex gap-4 justify-center">
                      <motion.button
                        onClick={handleBrowse}
                        className="btn-secondary flex items-center gap-2"
                        disabled={organizing}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiUpload />
                        Browse Folder
                      </motion.button>

                      <motion.button
                        onClick={handleOrganize}
                        className="btn-primary flex items-center gap-2"
                        disabled={!selectedPath || organizing}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {organizing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Organizing...
                          </>
                        ) : organized ? (
                          <>
                            <FiCheck />
                            Organized!
                          </>
                        ) : (
                          <>
                            <FiFolder />
                            Organize Files
                          </>
                        )}
                      </motion.button>
                    </div>

                    {organized && (
                      <motion.div 
                        className="mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <button
                          onClick={() => setShowPreview(true)}
                          className="btn-secondary flex items-center gap-2 mx-auto"
                        >
                          <FiDownload />
                          Preview & Download
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {showPreview && previewData && (
                    <motion.div 
                      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div 
                        className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-black/10"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-semibold">Preview</h3>
                          <button 
                            onClick={() => setShowPreview(false)}
                            className="text-gray-600 hover:text-black"
                          >
                            <FiX size={24} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-medium mb-2">Organized Files</h4>
                            <ul className="space-y-2">
                              {previewData.files.map((file, index) => (
                                <li key={index} className="text-gray-600">{file.name}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-lg font-medium mb-2">Summary</h4>
                            <p className="text-gray-600">{previewData.summary}</p>
                          </div>

                          <button
                            className="btn-primary w-full mt-6"
                            onClick={handleDownload}
                          >
                            Download Organized Files
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-16 space-y-16">
                  <motion.div 
                    className="relative rounded-3xl bg-white p-8 border-2 border-black overflow-hidden min-h-[250px] bg-black/5"
                    initial={{ x: -100, y: 0, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col items-center gap-8">
                      <div className="flex items-center gap-6 w-full">
                        <motion.div
                          className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <FiFolder className="w-8 h-8" />
                        </motion.div>
                        <div className="flex-1">
                          <motion.h2 
                            className="text-2xl font-semibold mb-3 text-black"
                            whileHover={{ x: 5 }}
                          >
                            Smart Categorization
                          </motion.h2>
                          <motion.p 
                            className="text-black/80"
                            whileHover={{ x: 5 }}
                          >
                            AI-powered file organization based on content and type.
                          </motion.p>
                        </div>
                      </div>

                      {/* Smart Categorization Animation */}
                      <motion.div
                        className="relative w-40 h-40 flex items-end justify-center"
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute w-28 h-10 bg-gradient-to-r from-blue-400 to-blue-300 border-2 border-blue-500 rounded-lg shadow-lg overflow-hidden"
                            style={{
                              bottom: `${i * 12}px`,
                              zIndex: 3 - i
                            }}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{
                              y: [100, 0],
                              opacity: [0, 1],
                              scale: [0.95, 1]
                            }}
                            transition={{
                              duration: 0.8,
                              delay: i * 0.2,
                              repeat: Infinity,
                              repeatDelay: 2,
                              ease: "easeOut"
                            }}
                          >
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{
                                x: ['-100%', '200%']
                              }}
                              transition={{
                                duration: 1.5,
                                delay: i * 0.2,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "easeInOut"
                              }}
                            />
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50" />
                            <div className="absolute top-2 left-3 w-6 h-6 bg-blue-400/30 rounded" />
                            <div className="absolute top-2 right-3 w-6 h-6 bg-blue-400/30 rounded" />
                          </motion.div>
                        ))}
                        <motion.div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-400/50 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="relative rounded-3xl bg-white p-8 border-2 border-black overflow-hidden min-h-[250px] bg-black/5"
                    initial={{ x: -100, y: 0, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col items-center gap-8">
                      <div className="flex items-center gap-6 w-full">
                        <motion.div
                          className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <FiCheck className="w-8 h-8" />
                        </motion.div>
                        <div className="flex-1">
                          <motion.h2 
                            className="text-2xl font-semibold mb-3 text-black"
                            whileHover={{ x: 5 }}
                          >
                            Safe & Secure
                          </motion.h2>
                          <motion.p 
                            className="text-black/80"
                            whileHover={{ x: 5 }}
                          >
                            Your original files remain untouched. Work on a copy.
                          </motion.p>
                        </div>
                      </div>

                      {/* Safe & Secure Animation */}
                      <div className="relative h-48 flex items-center justify-center">
                        {/* Letters Container */}
                        <div className="relative">
                          {['S', 'A', 'F', 'E'].map((letter, index) => (
                            <motion.div
                              key={index}
                              className="absolute text-3xl font-bold"
                              style={{
                                left: `${index * 30 - 45}px`,
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }}
                              animate={{
                                opacity: [0, 1, 1, 0],
                                y: [-20, 0, 0, 20],
                                scale: [1.2, 1, 1, 0.8],
                                filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(4px)"]
                              }}
                              transition={{
                                duration: 5,
                                times: [0, 0.2 + index * 0.1, 0.7, 1],
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {letter}
                            </motion.div>
                          ))}

                          {/* Particle Effects */}
                          {[...Array(15)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-black/20 rounded-full"
                              style={{
                                left: '50%',
                                top: '50%'
                              }}
                              animate={{
                                opacity: [0, 0.5, 0],
                                scale: [0, 1, 0],
                                x: [0, (Math.random() - 0.5) * 80],
                                y: [0, (Math.random() - 0.5) * 80]
                              }}
                              transition={{
                                duration: 5,
                                times: [0.6, 0.8, 1],
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: i * 0.1
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="relative rounded-3xl bg-white p-8 border-2 border-black overflow-hidden min-h-[250px] bg-black/5"
                    initial={{ x: -100, y: 0, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col items-center gap-8">
                      <div className="flex items-center gap-6 w-full">
                        <motion.div
                          className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <FiUpload className="w-8 h-8" />
                        </motion.div>
                        <div className="flex-1">
                          <motion.h2 
                            className="text-2xl font-semibold mb-3 text-black"
                            whileHover={{ x: 5 }}
                          >
                            Easy to Use
                          </motion.h2>
                          <motion.p 
                            className="text-black/80"
                            whileHover={{ x: 5 }}
                          >
                            Simple drag & drop interface with instant results.
                          </motion.p>
                        </div>
                      </div>

                      {/* Easy to Use Animation */}
                      <motion.div
                        className="relative w-40 h-40 flex items-center justify-center"
                      >
                        {/* Sparkle Container */}
                        <motion.div
                          className="relative w-24 h-24 flex items-center justify-center"
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 180, 360]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          {/* Central Sparkle */}
                          <motion.div
                            className="absolute w-4 h-4 bg-blue-500 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-blue-300 rounded-full"
                              animate={{
                                scale: [1.2, 1.8, 1.2],
                                opacity: [0, 0.5, 0]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </motion.div>
                          
                          {/* Sparkle Rays */}
                          {[...Array(12)].map((_, index) => (
                            <motion.div
                              key={`ray-${index}`}
                              className="absolute w-6 h-0.5 bg-blue-400"
                              style={{
                                transformOrigin: 'center',
                                transform: `rotate(${index * 30}deg) translateX(12px)`
                              }}
                              animate={{
                                scale: [0.5, 1.5, 0.5],
                                opacity: [0, 0.8, 0]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: index * 0.1,
                                ease: "easeInOut"
                              }}
                            />
                          ))}

                          {/* Outer Sparkles */}
                          {[...Array(6)].map((_, index) => (
                            <motion.div
                              key={`sparkle-${index}`}
                              className="absolute w-2 h-2"
                              style={{
                                transformOrigin: 'center',
                                transform: `rotate(${index * 60}deg) translateX(24px)`
                              }}
                            >
                              <motion.div
                                className="w-full h-full bg-blue-400 rounded-full"
                                animate={{
                                  scale: [0, 1, 0],
                                  opacity: [0, 1, 0]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: index * 0.2,
                                  ease: "easeInOut"
                                }}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="text-center mt-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <a 
                    href="/guide" 
                    className="inline-flex items-center gap-2 text-black hover:text-black/80 transition-colors border-2 border-black rounded-full px-6 py-2"
                  >
                    View Guide →
                  </a>
                </motion.div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 