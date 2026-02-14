import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, Smartphone, ChevronRight, ChevronLeft, Download } from 'lucide-react';

const steps = [
  {
    title: "Étape 1",
    description: "Appuyez sur le bouton 'Partager' dans la barre de navigation de Safari.",
    icon: <Share className="text-blue-500" />,
    image: "/step1_ios.png" // Mockup montrant l'icône de partage
  },
  {
    title: "Étape 2",
    description: "Faites défiler vers le bas et appuyez sur 'Sur l'écran d'accueil'.",
    icon: <PlusSquare className="text-primary-900" />,
    image: "/step2_ios.png" // Mockup montrant l'option
  },
  {
    title: "Étape 3",
    description: "Appuyez sur 'Ajouter' en haut à droite. L'icône Daara apparaîtra sur votre écran.",
    icon: <Smartphone className="text-gold-500" />,
    image: "/step3_ios.png" // Mockup de l'écran d'accueil
  }
];

export default function PWAInstallGuide({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-primary-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-900 rounded-xl text-white">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Installer Daara App</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Guide pour iOS / Safari</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center text-center">
              <div className="mb-8 relative">
                 <div className="w-48 h-96 bg-gray-900 rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden relative">
                    {/* Ici tu peux mettre tes captures d'écran ou une illustration */}
                    <div className="absolute inset-0 bg-primary-50 flex items-center justify-center p-4">
                       <motion.div 
                         key={currentStep}
                         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                         className="flex flex-col items-center"
                       >
                         {steps[currentStep].icon}
                         <div className="mt-4 text-[10px] font-bold text-primary-900 uppercase">Aperçu Étape {currentStep + 1}</div>
                       </motion.div>
                    </div>
                 </div>
                 {/* Badge étape */}
                 <div className="absolute -top-4 -right-4 bg-gold-500 text-primary-900 w-12 h-12 rounded-full flex items-center justify-center font-black shadow-lg border-4 border-white text-xl">
                   {currentStep + 1}
                 </div>
              </div>

              <h4 className="text-xl font-serif font-bold text-primary-900 mb-3">{steps[currentStep].title}</h4>
              <p className="text-gray-500 leading-relaxed mb-8">{steps[currentStep].description}</p>
            </div>

            {/* Footer Navigation */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button 
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="p-3 text-primary-900 disabled:opacity-20 transition-opacity"
              >
                <ChevronLeft size={28} />
              </button>

              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === i ? 'w-8 bg-gold-500' : 'w-2 bg-gray-300'}`} />
                ))}
              </div>

              {currentStep < steps.length - 1 ? (
                <button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="p-3 bg-primary-900 text-white rounded-full shadow-lg"
                >
                  <ChevronRight size={28} />
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="px-6 py-3 bg-gold-500 text-primary-900 font-bold rounded-full shadow-lg uppercase text-xs tracking-widest"
                >
                  J'ai compris
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}