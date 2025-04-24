'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiVideo, FiFolder, FiDownload, FiUpload, FiClock } from 'react-icons/fi';
import JSZip from 'jszip';

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