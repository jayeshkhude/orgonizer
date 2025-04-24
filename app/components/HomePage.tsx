'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiFolder, FiUpload, FiCheck, FiDownload, FiX, FiFile, FiArchive, FiArrowRight, FiImage, FiMusic, FiVideo, FiFileText, FiUser, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import Link from 'next/link';
import AuthPopup from './AuthPopup';
import { supabase } from '../lib/supabase';
import HistoryView from './HistoryView';
import { fileTypeFolders } from '../utils/fileTypes';

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

export default function HomePage() {
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

  // Copy all the useEffect hooks and other functions from page.tsx
  // ... rest of the component code ...

  return (
    <main className="min-h-screen bg-white text-black p-8">
      {/* Copy the entire JSX from page.tsx */}
    </main>
  );
} 