import React from 'react';
import { NewsArticle } from '../types';
import { Share2, ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  article: NewsArticle;
  isMain?: boolean;
  onOpen: (article: NewsArticle) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isMain = false, onOpen }) => {
  return (
    <div 
      className={`group relative flex flex-col cursor-pointer bg-white transition-all ${isMain ? 'md:col-span-2 lg:col-span-3 border-b-[12px] border-black pb-16' : 'border-b-4 border-black/5 pb-12 hover:border-black/20'}`}
      onClick={() => onOpen(article)}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-tighter">
          <span className="bg-red-600 text-white px-3 py-1 neo-border-sm">{article.category}</span>
          <span className="text-gray-400">{article.date}</span>
        </div>
        <Share2 size={16} className="text-gray-300 hover:text-black transition-colors" />
      </div>
      
      {isMain ? (
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-3 space-y-8">
            <h2 className="newspaper-font text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter group-hover:text-red-600 transition-colors">
              {article.title}
            </h2>
            <p className="text-3xl font-black italic text-gray-500 leading-none">
              — {article.subtitle}
            </p>
            <div className="prose prose-2xl max-w-none text-gray-800 leading-relaxed font-serif line-clamp-4">
              {article.content.split('\n')[0]}
            </div>
            <div className="flex items-center gap-6 pt-8 border-t-4 border-black">
              <div className="w-16 h-16 rounded-full border-4 border-black overflow-hidden bg-yellow-400">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author}`} alt="Avatar" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase">Enviado Especial</p>
                <p className="text-xl font-black uppercase">{article.author}</p>
              </div>
              <button className="ml-auto bg-black text-white px-8 py-4 font-black uppercase text-sm neo-border-sm group-hover:bg-red-600 transition-colors flex items-center gap-3">
                VER PORTADA <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 relative">
             <div className="sello-municipal -top-6 -right-6 scale-125 z-20"></div>
             <div className="neo-border overflow-hidden aspect-[3/4] bg-gray-100">
               <img 
                 src={article.imageUrl || `https://picsum.photos/seed/${article.id}/800/1000`} 
                 alt={article.title}
                 className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
               />
               <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/90 text-white text-[10px] font-black uppercase tracking-widest text-center border-t-2 border-red-600">
                 ARCHIVO MUNICIPAL Nº {article.id.slice(0,6).toUpperCase()}
               </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="relative mb-8 aspect-video neo-border-sm overflow-hidden bg-gray-100">
            <div className="sello-municipal -top-4 -right-4 scale-75 z-20 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src={article.imageUrl || `https://picsum.photos/seed/${article.id}/600/400`} 
              alt={article.title}
              className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
            />
          </div>
          <h3 className="newspaper-font text-4xl font-black mb-4 leading-none tracking-tighter group-hover:text-red-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-lg text-gray-500 italic font-medium leading-snug line-clamp-3 mb-8">
            {article.subtitle}
          </p>
          <div className="mt-auto flex items-center justify-between font-black uppercase text-[10px] pt-4 border-t border-black/10">
             <span>POR {article.author}</span>
             <span className="text-red-600">LEER →</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;