'use client';

import { motion } from 'framer-motion';
import { FiFolder, FiUpload, FiCheck, FiArrowRight, FiFile, FiDownload } from 'react-icons/fi';
import Link from 'next/link';

interface File {
  name: string;
  x?: number;
  y?: number;
  size?: string;
}

interface Interactive {
  type: 'folder' | 'organize' | 'preview';
  files?: File[];
  categories?: string[];
}

interface Animation {
  initial: { x: number; opacity: number; y?: number };
  animate: { x: number; opacity: number; y?: number };
  transition: { duration: number; delay?: number };
}

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  animation: Animation;
  interactive: Interactive;
}

const steps: Step[] = [
  {
    title: "Select Your Folder",
    description: "Choose the folder containing files you want to organize. Our system will scan and categorize them automatically.",
    icon: <FiFolder className="w-8 h-8" />,
    animation: {
      initial: { x: -100, y: 0, opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      transition: { duration: 0.6, delay: 0.2 }
    },
    interactive: {
      type: "folder",
      files: [
        { name: "document.pdf", x: 0, y: 0 },
        { name: "image.jpg", x: 0, y: 0 },
        { name: "video.mp4", x: 0, y: 0 }
      ]
    }
  },
  {
    title: "Organize Files",
    description: "Watch as our system automatically categorizes your files into appropriate folders based on their types.",
    icon: <FiUpload className="w-8 h-8" />,
    animation: {
      initial: { x: -100, y: 0, opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      transition: { duration: 0.6, delay: 0.4 }
    },
    interactive: {
      type: "organize",
      categories: ["Documents", "Images", "Videos", "Others"]
    }
  },
  {
    title: "Preview & Download",
    description: "Review the organized files and download them in a neatly structured format.",
    icon: <FiCheck className="w-8 h-8" />,
    animation: {
      initial: { x: -100, y: 0, opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      transition: { duration: 0.6, delay: 0.6 }
    },
    interactive: {
      type: "preview",
      files: [
        { name: "Documents", size: "2.5 MB", x: 0, y: 0 },
        { name: "Images", size: "5.2 MB", x: 0, y: 0 },
        { name: "Videos", size: "15.7 MB", x: 0, y: 0 }
      ]
    }
  }
];

export default function Guide() {
  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-12"
        >
          How It Works
        </motion.h1>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative rounded-3xl bg-white p-8 border-2 border-black overflow-hidden min-h-[250px]"
              initial={step.animation.initial}
              animate={step.animation.animate}
              transition={step.animation.transition}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col items-center gap-8">
                <div className="flex items-center gap-6 w-full">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {step.icon}
                  </motion.div>
                  <div className="flex-1">
                    <motion.h2 
                      className="text-2xl font-semibold mb-3"
                      whileHover={{ x: 5 }}
                    >
                      {step.title}
                    </motion.h2>
                    <motion.p 
                      className="text-gray-600"
                      whileHover={{ x: 5 }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </div>

                {/* Interactive Animations - Now below the text */}
                <div className="w-full flex items-center justify-center">
                  {step.interactive.type === "folder" && step.interactive.files && (
                    <motion.div
                      className="relative w-32 h-32"
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
                      {step.interactive.files.map((file, i) => (
                        <motion.div
                          key={i}
                          className="absolute flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full text-xs shadow-sm"
                          style={{ 
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            y: [
                              i === 0 ? -20 : i === 1 ? 0 : 20,
                              i === 0 ? -25 : i === 1 ? 5 : 25,
                              i === 0 ? -20 : i === 1 ? 0 : 20
                            ],
                            x: [
                              i === 0 ? -20 : i === 1 ? 20 : -20,
                              i === 0 ? -25 : i === 1 ? 25 : -25,
                              i === 0 ? -20 : i === 1 ? 20 : -20
                            ]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        >
                          <FiFile className="w-3 h-3" />
                          <span>{file.name}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {step.interactive.type === "organize" && step.interactive.categories && (
                    <motion.div
                      className="grid grid-cols-2 gap-4"
                      animate={{
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {step.interactive.categories.map((category, i) => (
                        <motion.div
                          key={i}
                          className="bg-black/5 rounded-xl p-3 text-xs text-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            y: [20, 0, 20]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        >
                          {category}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {step.interactive.type === "preview" && step.interactive.files && (
                    <motion.div
                      className="space-y-3"
                      animate={{
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {step.interactive.files.map((file, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-2 bg-black/5 rounded-xl p-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            x: [20, 0, 20]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        >
                          <FiDownload className="w-4 h-4" />
                          <div className="text-xs">
                            <div>{file.name}</div>
                            {file.size && <div className="text-gray-500">{file.size}</div>}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-black hover:text-black/80 transition-colors border-2 border-black/10 rounded-full px-6 py-2"
          >
            Get Started
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
} 