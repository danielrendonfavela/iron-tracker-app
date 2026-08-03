import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Dumbbell, Watch, Brain } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      icon: <Dumbbell className="w-12 h-12 text-red-500 mx-auto mb-4" />,
      title: "🏋 Sobrecarga Progresiva",
      description: "Lleva un registro preciso de tus series, RIR, RPE y utiliza calculadoras de 1RM para asegurar que estás progresando en cada sesión."
    },
    {
      icon: <Watch className="w-12 h-12 text-blue-500 mx-auto mb-4" />,
      title: "⌚ Inteligencia Biométrica WHOOP",
      description: "Integra tus datos de recuperación de WHOOP para la autorregulación de volumen según tu estado real de recuperación."
    },
    {
      icon: <Brain className="w-12 h-12 text-purple-500 mx-auto mb-4" />,
      title: "🧃 IRON COACH AI",
      description: "Tu asistente inteligente potenciado por Gemini 2.5 Flash. Analiza tu progreso y ajusta tus rutinas dinámicamente."
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border-2 border-red-600 p-8 max-w-md w-full shadow-2xl relative text-center flex flex-col min-h-[400px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
          title="Omitir tour"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-grow flex flex-col justify-center items-center mt-6">
          {slides[currentSlide].icon}
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase mb-4">
            {slides[currentSlide].title}
          </h2>
          <p className="text-sm font-semibold text-zinc-300 leading-relaxed mb-8">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Indicadores de progreso */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-red-600' : 'dw-2 bg-zinc-700'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 mt-auto">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex-1 p-3 text-xs font-black uppercase flex items-center justify-center gap-2 border transition-colors ${currentSlide === 0 ? 'border-zinc-800 text-zinc-700 cursor-not-allowed' : 'border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-400'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          
          <button
            onClick={nextSlide}
            className="flex-1 p-3 teyt-xs font-black uppercase flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            {currentSlide === slides.length - 1 ? (
              '¡Comenzar a Entrenar!'
            ) : (
              <>Siguiente <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
        >
          Omitir tour
        </button>
      </div>
    </div>
  );
};
