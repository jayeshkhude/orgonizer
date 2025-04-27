'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiVideo, FiFolder, FiClock, FiCalendar, FiLock } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import VideoOrganizer from './VideoOrganizer';

export default function VideoOrganizerPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Simulate page load for smooth animations
  useState(() => {
    setIsPageLoaded(true);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Professional Navigation */}
      <motion.div 
        className="fixed top-0 left-0 right-0 bg-black text-white shadow-lg z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <FiLock className="w-6 h-6 text-black" />
              <h1 className="text-xl font-bold">Video Organizer</h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content with Animation */}
      <main className="pt-24 px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Intro Section with Animation */}
          <motion.div 
            className="text-center space-y-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <FiVideo className="w-12 h-12 text-black" />
              <h2 className="text-5xl font-bold text-black tracking-tight">Video Organizer</h2>
              <FiLock className="w-12 h-12 text-yellow-500" />
            </div>
            <p className="text-xl text-black max-w-2xl mx-auto font-medium">
              Automatically organize your videos by timestamp, create custom folders, and manage your video collection efficiently.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              {
                icon: <FiClock className="w-8 h-8" />,
                title: "Time-Based Organization",
                description: "Sort videos by creation time"
              },
              {
                icon: <FiFolder className="w-8 h-8" />,
                title: "Custom Folders",
                description: "Create and manage custom folders"
              },
              {
                icon: <FiCalendar className="w-8 h-8" />,
                title: "Date Range Filtering",
                description: "Filter videos by date ranges"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-8 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)"
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-lg text-black">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Video Organizer Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-2xl border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <VideoOrganizer />
          </motion.div>

          {/* Guide Section */}
          <motion.div
            className="mt-24 text-center space-y-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-black">How to Use</h2>
              <p className="text-xl text-black max-w-2xl mx-auto font-medium">
                Follow our simple guide to organize your videos effectively
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Select Videos",
                  description: "Drop your videos or select a folder containing videos"
                },
                {
                  step: "2",
                  title: "Create Folders",
                  description: "Set up folders with specific date and time ranges"
                },
                {
                  step: "3",
                  title: "Organize",
                  description: "Let the system automatically sort your videos"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="relative bg-white p-8 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  whileHover={{ 
                    y: -5,
                    boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">{step.title}</h3>
                  <p className="text-lg text-black">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 