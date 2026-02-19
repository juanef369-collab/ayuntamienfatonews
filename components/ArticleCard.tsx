import React from 'react';
import { NewsArticle } from '../types';

interface ArticleCardProps {
  article: NewsArticle;
  isMain?: boolean;
  onOpen: (article: NewsArticle) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isMain = false, onOpen }) => {
  if (isMain) {
    return (
      <div 
        className="col-span-1 md:col-span-3 lg:col-span-3 cursor-pointer group mb-12"
        onClick={() => onOpen(article)}
      >
        <h2 className="newspaper-font text-5xl md:text-7xl font-black uppercase mb-6 leading-none tracking-tight group-hover:text-[#5a8a6a] transition-colors">
          {article.title}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="relative">
            <div className="sello-municipal top-4 right-4"></div>
            <img 
              src={article.imageUrl || `https://picsum.photos/seed/${article.id}/800/600`} 
              alt={article.title}
              className="w-full h-auto object-cover border-b-4 border-[#5a8a6a]"
            />
          </div>
          <div className="space-y-6">
            <p className="font-bold text-lg leading-snug">
              {article.subtitle}
            </p>
            <div className="font-serif text-gray-700 leading-relaxed text-lg line-clamp-6">
              {article.content}
            </div>
            <div className="pt-4 border-t border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-400">
              Corresponsal: {article.author} | {article.date}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col cursor-pointer group space-y-4 pb-8 border-b border-gray-100 last:border-0"
      onClick={() => onOpen(article)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={article.imageUrl || `https://picsum.photos/seed/${article.id}/600/400`} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-black text-2xl leading-tight group-hover:text-[#5a8a6a] transition-colors">
          {article.title}
        </h3>
        <p className="text-sm font-medium text-gray-500 italic line-clamp-3">
          {article.subtitle}
        </p>
        <div className="text-[10px] font-bold uppercase tracking-tighter text-gray-400 pt-2 flex justify-between">
          <span>{article.category}</span>
          <span>{article.date}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;