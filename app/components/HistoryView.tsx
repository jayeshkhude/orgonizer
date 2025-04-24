'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { FiClock, FiDownload, FiTrash2 } from 'react-icons/fi';
import JSZip from 'jszip';
import { fileTypeFolders } from '../page';

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

interface HistoryItem {
  id: string;
  created_at: string;
  files: { name: string; type: string }[];
  summary: string;
}

export default function HistoryView() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHistory(history.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownload = async (files: { name: string; type: string }[]) => {
    try {
      const zip = new JSZip();
      
      // Create a map to track files by their categories
      const filesByCategory: { [key: string]: { [key: string]: { name: string, type: string }[] } } = {};
      
      // Group files by their main category and subcategory
      files.forEach(file => {
        const { mainCategory, subCategory } = getFileCategories(file.name);
        
        if (!filesByCategory[mainCategory]) {
          filesByCategory[mainCategory] = {};
        }
        if (!filesByCategory[mainCategory][subCategory]) {
          filesByCategory[mainCategory][subCategory] = [];
        }
        
        filesByCategory[mainCategory][subCategory].push(file);
      });

      // Create main folders for each category
      Object.entries(filesByCategory).forEach(([mainCategory, subCategories]) => {
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

      // Add a summary file
      const summary = Object.entries(filesByCategory)
        .map(([mainCategory, subCategories]) => {
          const subCategoryCounts = Object.entries(subCategories)
            .map(([subCategory, files]) => `${subCategory}: ${files.length} files`)
            .join(', ');
          return `${mainCategory} (${subCategoryCounts})`;
        })
        .join('; ');
      
      zip.file('summary.txt', summary);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'organized-files.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      setError('Failed to create download package: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiClock />
            <span>{new Date(item.created_at).toLocaleString()}</span>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">{item.summary}</p>
          </div>

          <div className="flex justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDownload(item.files)}
              className="btn-secondary flex items-center gap-2"
            >
              <FiDownload />
              Download
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(item.id)}
              className="btn-secondary flex items-center gap-2 text-red-500"
            >
              <FiTrash2 />
              Delete
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 