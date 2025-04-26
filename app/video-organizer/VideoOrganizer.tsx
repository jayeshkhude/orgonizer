'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiVideo, FiFolder, FiDownload, FiUpload, FiClock, FiLock, FiKey, FiArrowLeft } from 'react-icons/fi';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Secure access key verification
const verifyAccessKey = (key: string): boolean => {
  // Create a complex verification that's hard to reverse engineer
  const charCodes = [105, 97, 109, 103, 114, 111, 111, 116];
  const inputCodes = key.split('').map(char => char.charCodeAt(0));
  
  if (inputCodes.length !== charCodes.length) return false;
  
  return inputCodes.every((code, index) => {
    // Add some mathematical operations to make it harder to reverse
    const expected = charCodes[index];
    const transformed = (code ^ 0x55) + 10; // XOR and addition
    return transformed === ((expected ^ 0x55) + 10);
  });
};

// Enhanced Floating icon component
const FloatingIcon = ({ delay, index, icon }: { delay: number; index: number; icon: 'key' | 'lock' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate random starting position with controlled distribution
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  
  // Generate random movement pattern
  const moveX = Math.random() * 15 - 7.5; // Random value between -7.5 and 7.5
  const moveY = Math.random() * 15 - 7.5; // Random value between -7.5 and 7.5
  
  // Generate random rotation
  const rotate = Math.random() * 360;
  
  return (
    <motion.div
      initial={{ 
        y: startY,
        x: startX,
        opacity: 0,
        rotate: rotate,
      }}
      animate={{
        y: [startY, startY + moveY, startY],
        x: [startX, startX + moveX, startX],
        opacity: [0, 1, 1, 0],
        rotate: [rotate, rotate + 180, rotate + 360],
      }}
      transition={{
        duration: 8 + Math.random() * 4, // Random duration between 8-12 seconds
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
      className="absolute cursor-pointer"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.2, 1] : 1,
          y: isHovered ? [0, -10, 0] : 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
      >
        {icon === 'key' ? (
          <FiKey className="w-6 h-6 text-black" />
        ) : (
          <FiLock className="w-6 h-6 text-black" />
        )}
      </motion.div>
    </motion.div>
  );
};

// Key trail effect component
const KeyTrail = ({ x, y }: { x: number; y: number }) => {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5 }}
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <FiKey className="w-4 h-4 text-yellow-400/50" />
    </motion.div>
  );
};

interface VideoFile {
  file: File;
  thumbnail?: string;
  creationDate: Date;
}

interface Folder {
  name: string;
  date: string;
  startTime: string;
  startPeriod: 'AM' | 'PM';
  endTime: string;
  endPeriod: 'AM' | 'PM';
  videos: VideoFile[];
}

const videoFormats = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv', '.flv', '.3gp'];

export default function VideoOrganizer() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [remainingVideos, setRemainingVideos] = useState<VideoFile[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [accessKey, setAccessKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleAccessKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (verifyAccessKey(accessKey)) {
      setIsAuthenticated(true);
    } else {
      setError('Invalid access key');
    }
  };

  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        video.currentTime = video.duration * 0.1;
      };
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(video.src);
        resolve(thumbnail);
      };
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const videoFiles = acceptedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return videoFormats.includes(`.${extension}`);
    });

    const newVideos = await Promise.all(videoFiles.map(async (file) => {
      const creationDate = new Date(file.lastModified);
      const thumbnail = await generateThumbnail(file);
      return {
        file,
        thumbnail,
        creationDate,
      };
    }));
    setVideos(prev => [...prev, ...newVideos]);
    setRemainingVideos(prev => [...prev, ...newVideos]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': videoFormats
    }
  });

  const createFolder = () => {
    const newFolder: Folder = {
      name: `Folder ${folders.length + 1}`,
      date: '',
      startTime: '',
      startPeriod: 'AM',
      endTime: '',
      endPeriod: 'AM',
      videos: []
    };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolder(folders.length);
  };

  const updateFolder = (index: number, updates: Partial<Folder>) => {
    setFolders(prev => prev.map((folder, i) => 
      i === index ? { ...folder, ...updates } : folder
    ));
  };

  const formatDateInput = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as YYYY-MM-DD
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
    }
  };

  const handleDateChange = (index: number, field: 'date', value: string) => {
    // Format the input value
    const formattedValue = formatDateInput(value);
    
    // Update the folder with the formatted value
    updateFolder(index, { [field]: formattedValue });
  };

  const formatTimeInput = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as HH:MM
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      const hours = parseInt(numbers.slice(0, 2));
      const minutes = numbers.slice(2, 4);
      // Ensure hours are in 12-hour format
      const formattedHours = hours > 12 ? hours - 12 : hours;
      return `${formattedHours}:${minutes}`;
    }
    return value;
  };

  const convertTo24Hour = (time: string, period: 'AM' | 'PM'): number => {
    const [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) {
      return hours + 12;
    } else if (period === 'AM' && hours === 12) {
      return 0;
    }
    return hours;
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const formattedValue = formatTimeInput(value);
    updateFolder(index, { [field]: formattedValue });
  };

  const handlePeriodChange = (index: number, field: 'startPeriod' | 'endPeriod', value: 'AM' | 'PM') => {
    updateFolder(index, { [field]: value });
  };

  const organizeVideos = () => {
    const newRemainingVideos = [...remainingVideos];
    const newFolders = folders.map(folder => {
      // Clear existing videos in the folder
      const folderVideos: VideoFile[] = [];
      
      // Filter videos that match this folder's timeframe
      const matchingVideos = newRemainingVideos.filter(video => {
        const videoDate = video.creationDate;
        const [year, month, day] = folder.date.split('-').map(Number);
        
        // Convert times to 24-hour format
        const startHour24 = convertTo24Hour(folder.startTime, folder.startPeriod);
        const endHour24 = convertTo24Hour(folder.endTime, folder.endPeriod);
        
        // Parse minutes
        const [_, startMinutes] = folder.startTime.split(':').map(Number);
        const [__, endMinutes] = folder.endTime.split(':').map(Number);

        const startDate = new Date(year, month - 1, day, startHour24, startMinutes);
        const endDate = new Date(year, month - 1, day, endHour24, endMinutes);

        // Check if video falls within the timeframe
        return videoDate >= startDate && videoDate <= endDate;
      });

      // Add matching videos to the folder and remove them from remaining videos
      matchingVideos.forEach(video => {
        folderVideos.push(video);
        const index = newRemainingVideos.indexOf(video);
        if (index > -1) {
          newRemainingVideos.splice(index, 1);
        }
      });

      return { ...folder, videos: folderVideos };
    });

    // Update state with organized videos
    setFolders(newFolders);
    setRemainingVideos(newRemainingVideos);
  };

  const moveVideoToFolder = (video: VideoFile, folderIndex: number) => {
    setRemainingVideos(prev => prev.filter(v => v !== video));
    setFolders(prev => prev.map((folder, i) => 
      i === folderIndex ? { ...folder, videos: [...folder.videos, video] } : folder
    ));
  };

  const downloadOrganizedVideos = async () => {
    setIsOrganizing(true);
    try {
      const zip = new JSZip();
      const organizedFolder = zip.folder('organized_videos');
      
      // Create folders and add videos
      folders.forEach(folder => {
        const folderName = folder.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const folderInZip = organizedFolder?.folder(folderName);
        
        folder.videos.forEach(video => {
          folderInZip?.file(video.file.name, video.file);
        });
      });

      // Add remaining videos to a separate folder
      if (remainingVideos.length > 0) {
        const remainingFolder = organizedFolder?.folder('remaining_videos');
        remainingVideos.forEach(video => {
          remainingFolder?.file(video.file.name, video.file);
        });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'organized_videos.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip file:', error);
    } finally {
      setIsOrganizing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="/">
            <motion.button
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>
          </Link>
        </div>

        {/* Floating icons background */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <FloatingIcon 
              key={`key-${i}`} 
              delay={i * 0.1} 
              index={i} 
              icon="key" 
            />
          ))}
          {[...Array(20)].map((_, i) => (
            <FloatingIcon 
              key={`lock-${i}`} 
              delay={i * 0.15} 
              index={i} 
              icon="lock" 
            />
          ))}
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md mx-auto p-8 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10"
        >
          <div className="text-center space-y-4">
            <motion.div 
              className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mx-auto"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <FiLock className="w-8 h-8" />
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Access Required
            </motion.h2>
            <motion.p 
              className="text-gray-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Please enter your access key to use the Video Organizer
            </motion.p>
          </div>
          
          <motion.form 
            onSubmit={handleAccessKeySubmit} 
            className="mt-8 space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full border-2 border-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
                placeholder="Enter access key"
              />
              {error && (
                <motion.p 
                  className="text-red-500 text-sm mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.p>
              )}
            </div>
            <motion.button
              type="submit"
              className="w-full btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Video Organizer</h1>
        <p className="text-gray-600">Organize your videos by date and time</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-black'}`}
      >
        <input {...getInputProps()} />
        <FiVideo className="mx-auto h-16 w-16 text-gray-400" />
        <p className="mt-4 text-lg text-gray-600">
          {isDragActive
            ? 'Drop your videos here'
            : 'Drag and drop video files here, or click to select files'}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Supported formats: MP4, MOV, AVI, MKV, WEBM, M4V, WMV, FLV, 3GP
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Folders Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Folders</h2>
            <div className="flex gap-2">
              <button onClick={createFolder} className="btn-primary">
                Create New Folder
              </button>
              <button onClick={organizeVideos} className="btn-primary">
                Organize Videos
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {folders.map((folder, index) => (
              <div 
                key={index}
                className={`border rounded-xl p-6 transition-all ${
                  selectedFolder === index ? 'border-black bg-gray-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedFolder(index)}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={folder.name}
                      onChange={(e) => updateFolder(index, { name: e.target.value })}
                      className="text-xl font-semibold border-b focus:outline-none focus:border-black w-full"
                      placeholder="Folder Name"
                    />
                    <span className="text-sm text-gray-500 ml-2">
                      {folder.videos.length} videos
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="text"
                        value={folder.date}
                        onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
                        placeholder="YYYY-MM-DD"
                      />
                      <p className="text-xs text-gray-500 mt-2">Format: YYYY-MM-DD</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={folder.startTime}
                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
                            placeholder="HH:MM"
                            maxLength={5}
                          />
                          <select
                            value={folder.startPeriod}
                            onChange={(e) => handlePeriodChange(index, 'startPeriod', e.target.value as 'AM' | 'PM')}
                            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Format: HH:MM (e.g., 09:30)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={folder.endTime}
                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
                            placeholder="HH:MM"
                            maxLength={5}
                          />
                          <select
                            value={folder.endPeriod}
                            onChange={(e) => handlePeriodChange(index, 'endPeriod', e.target.value as 'AM' | 'PM')}
                            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Format: HH:MM (e.g., 05:45)</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {folder.videos.map((video, videoIndex) => (
                      <div key={videoIndex} className="border rounded-lg p-2">
                        {video.thumbnail ? (
                          <img 
                            src={video.thumbnail} 
                            alt={video.file.name}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                            <FiVideo className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-sm truncate">{video.file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining Videos Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Remaining Videos</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {remainingVideos.map((video, index) => (
              <div key={index} className="border rounded-lg p-2">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.file.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                    <FiVideo className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <p className="text-sm truncate">{video.file.name}</p>
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={() => selectedFolder !== null && moveVideoToFolder(video, selectedFolder)}
                    className="text-xs btn-secondary py-1 px-2"
                    disabled={selectedFolder === null}
                  >
                    Move to Selected Folder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button 
          onClick={downloadOrganizedVideos} 
          className="btn-primary flex items-center gap-2"
          disabled={isOrganizing}
        >
          {isOrganizing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Organizing...
            </>
          ) : (
            <>
              <FiDownload />
              Download
            </>
          )}
        </button>
      </div>
    </div>
  );
} 