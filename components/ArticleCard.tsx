import React from 'react';
import { NewsArticle } from '../types';
import { Tag } from 'lucide-react';

interface ArticleCardProps {
  article: NewsArticle;
  isMain?: boolean;
  onOpen: (article: NewsArticle) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isMain = false, onOpen }) => {
  const rogueTags = ["Escándalo", "Filtrado", "Canalla", "Sin Filtros", "Urgente", "Oculto"];
  const randomTag = rogueTags[Math.floor(Math.random() * rogueTags.length)];

  if (isMain) {
    return (
      <div 
        className="col-span-1 md:col-span-3 lg:col-span-3 cursor-pointer group border-b-2 border-black pb-12 mb-12"
        onClick={() => onOpen(article)}
      >
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/3 space-y-6">
            <div className="flex items-center gap-3 text-red-600 font-black text-xs uppercase tracking-tighter">
              <span className="bg-red-600 text-white px-2 py-0.5">Breaking News</span>
              <span className="flex items-center gap-1"><Tag size={12}/> {randomTag}</span>
            </div>
            <h2 className="newspaper-font text-5xl md:text-8xl font-black uppercase leading-none tracking-tighter group-hover:text-[#5a8a6a] transition-colors duration-300">
              {article.title}
            </h2>
            <p className="text-2xl font-bold leading-tight text-gray-700">
              {article.subtitle}
            </p>
          </div>
          <div className="lg:w-1/3 space-y-4">
            <div className="relative">
              <div className="sello-municipal -top-4 -left-4"></div>
              <img 
                src={article.imageUrl || `https://picsum.photos/seed/${article.id}/800/600`} 
                alt={article.title}
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500 border border-gray-200"
              />
            </div>
            <div className="font-serif italic text-gray-500 leading-relaxed text-sm line-clamp-4">
              {article.content}
            </div>
            <div className="pt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-100">
              <span>Por: {article.author}</span>
              <span>{article.date}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col cursor-pointer group space-y-5 border-b border-gray-100 md:border-b-0 md:pb-0 pb-10"
      onClick={() => onOpen(article)}
    >
      <div className="relative aspect-[16/10] overflow-hidden border border-gray-100">
        <img 
          src={article.imageUrl || `https://picsum.photos/seed/${article.id}/600/400`} 
          alt={article.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 text-[8px] font-black uppercase text-black">
          Exclusiva
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="newspaper-font text-3xl font-black leading-[0.9] uppercase group-hover:text-[#5a8a6a] transition-colors">
          {article.title}
        </h3>
        <p className="text-sm font-medium text-gray-500 line-clamp-2">
          {article.subtitle}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 border border-gray-200">{article.category}</span>
          <span className="text-[9px] font-bold text-gray-400">{article.date}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;