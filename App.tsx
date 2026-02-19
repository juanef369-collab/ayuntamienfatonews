import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Radio, Send, Zap, Coffee, RefreshCcw, ArrowLeft, Archive, MessageSquare, History, Scale, Building2, Newspaper, Search, Mail, Twitter, Instagram, Linkedin, Globe, MapPin } from 'lucide-react';
import { NewsArticle, AppView, Redactor } from './types';
import { generateBreakingNews, generateNewsFromVoice, generateImage } from './services/gemini';
import ArticleCard from './components/ArticleCard';

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [user, setUser] = useState<Redactor | null>(null);
  const [loginForm, setLoginForm] = useState({ name: '', alias: '', bio: '' });
  
  const [view, setView] = useState<AppView>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dbData = localStorage.getItem('fatonews_db');
    if (dbData) {
      setArticles(JSON.parse(dbData));
    } else {
      loadInitialContent();
    }
    const savedUser = localStorage.getItem('fatonews_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('fatonews_db', JSON.stringify(articles));
    }
  }, [articles]);

  const loadInitialContent = async () => {
    setIsGenerating(true);
    try {
      const art = await generateBreakingNews();
      const img = await generateImage(art.imagePrompt);
      setArticles([{ ...art, imageUrl: img }]);
    } catch (e: any) {
      setError("Error municipal.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (text: string) => {
    if (isGenerating || !text.trim()) return;
    setIsGenerating(true);
    try {
      const article = await generateNewsFromVoice(text);
      const finalImg = pendingImage || await generateImage(article.imagePrompt);
      const newArticle = { ...article, imageUrl: finalImg, author: user?.alias || article.author };
      setArticles(prev => [newArticle, ...prev]);
      setTranscript(''); setKeyboardInput(''); setPendingImage(null);
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError("Error de rotativa.");
    } finally {
      setIsGenerating(false);
    }
  };

  const openArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(art => 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [articles, searchTerm]);

  return (
    <div className="min-h-screen pb-20">
      {/* Navegación Minimalista Superior */}
      <nav className="bg-white border-b border-gray-200 py-3 px-8 flex justify-between items-center no-print sticky top-0 z-[100]">
        <div className="flex items-center gap-6">
          <button onClick={() => setView('home')} className="text-xs font-black uppercase tracking-widest text-[#5a8a6a] flex items-center gap-2">
            <Newspaper size={16}/> Portada
          </button>
          <button onClick={() => setView('archive')} className="text-xs font-bold uppercase text-gray-400 hover:text-black transition-colors">
            Hemeroteca
          </button>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <button onClick={() => setView('profile')} className="flex items-center gap-2 text-xs font-bold uppercase">
              <span className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                <img src={user.avatarUrl} className="w-full h-full object-cover"/>
              </span>
              {user.alias}
            </button>
          ) : (
            <button onClick={() => setView('login')} className="text-[10px] font-bold border border-black px-3 py-1 uppercase hover:bg-black hover:text-white transition-all">Acceso Redacción</button>
          )}
        </div>
      </nav>

      {/* Header Estilo Imagen Proporcionada */}
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-8 text-center bg-white mt-4 border-x border-gray-100">
        <h1 className="newspaper-font text-8xl md:text-[120px] font-black title-green leading-none mb-2">
          AYUNTAMIENFATONEWS
        </h1>
        
        <div className="header-line py-2 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest px-2">
          <div className="flex items-center gap-2">
            <Globe size={12}/> www.fato-news.es
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <MapPin size={12}/> Planta 3, Despacho 302, Edificio Municipal
          </div>
        </div>

        <div className="py-6 border-b border-gray-100">
          <p className="font-black text-2xl md:text-5xl uppercase leading-none tracking-tighter">
            Últimos acontecimientos de nuestro entorno laboral
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 bg-white border-x border-gray-100 min-h-screen">
        {view === 'home' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
            
            {/* Artículo Principal (Ocupa todo el ancho arriba) */}
            {articles.length > 0 && (
              <ArticleCard article={articles[0]} isMain={true} onOpen={openArticle} />
            )}

            {/* Formulario de Generación Estilo "Carta al Editor" */}
            <div className="col-span-1 md:col-span-3 bg-[#f3f5f2] p-8 border-y-2 border-gray-200 my-12">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h3 className="newspaper-font text-3xl font-bold italic">Buzón de Filtraciones</h3>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-widest">Capture un rumor de pasillo para la rotativa</p>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    value={keyboardInput}
                    onChange={(e) => setKeyboardInput(e.target.value)}
                    placeholder="Escribe el chisme aquí..."
                    className="flex-1 border-b-2 border-black bg-transparent py-3 px-4 font-bold outline-none focus:border-[#5a8a6a]"
                  />
                  <button 
                    onClick={() => handleGenerate(keyboardInput)}
                    disabled={isGenerating}
                    className="bg-black text-white px-8 py-3 font-black uppercase text-xs hover:bg-[#5a8a6a] transition-all disabled:opacity-50"
                  >
                    {isGenerating ? 'Imprimiendo...' : 'Publicar'}
                  </button>
                  <button 
                    onClick={() => setIsRecording(!isRecording)} 
                    className={`p-3 rounded-full border-2 ${isRecording ? 'border-red-500 text-red-500 animate-pulse' : 'border-black'}`}
                  >
                    <Mic size={20}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Artículos Secundarios */}
            {articles.slice(1).map((art) => (
              <ArticleCard key={art.id} article={art} onOpen={openArticle} />
            ))}
          </div>
        ) : view === 'article' && selectedArticle ? (
          <div className="max-w-3xl mx-auto py-12 space-y-12">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 hover:text-black">
              <ArrowLeft size={16}/> Regresar
            </button>
            
            <header className="space-y-6">
              <span className="inline-block bg-[#5a8a6a] text-white px-3 py-1 text-[10px] font-black uppercase">{selectedArticle.category}</span>
              <h1 className="newspaper-font text-6xl md:text-8xl font-black leading-none uppercase tracking-tighter">
                {selectedArticle.title}
              </h1>
              <p className="text-2xl font-bold italic border-l-4 border-[#5a8a6a] pl-6 text-gray-500">
                "{selectedArticle.subtitle}"
              </p>
            </header>

            <div className="relative">
              <div className="sello-municipal -top-4 -right-4 scale-125"></div>
              <img src={selectedArticle.imageUrl} className="w-full h-auto grayscale-0 border-b-8 border-black"/>
              <p className="text-[10px] font-bold uppercase text-gray-400 mt-2 text-right">Archivo: {selectedArticle.id}</p>
            </div>

            <div className="font-serif text-xl leading-relaxed text-gray-800 space-y-6 columns-1 md:columns-2 gap-10">
              {selectedArticle.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <footer className="pt-12 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100"></div>
                <div>
                  <p className="text-xs font-bold uppercase">Escrito por</p>
                  <p className="font-black uppercase text-[#5a8a6a]">{selectedArticle.author}</p>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-xs font-black uppercase tracking-widest text-gray-300">Sección en construcción burocrática...</p>
          </div>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-[#2d2d2d] text-white pt-24 pb-12 mt-24">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-16 border-b border-gray-700 pb-16">
          <div className="space-y-6">
            <h2 className="newspaper-font text-3xl font-black text-[#5a8a6a]">AYUNTAMIENFATONEWS</h2>
            <p className="text-sm font-medium text-gray-400 italic">"Desde 1994 sirviendo la verdad más cuestionable de la administración pública."</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500">Navegación</h4>
            <ul className="text-sm space-y-2 font-bold uppercase tracking-tighter text-gray-300">
              <li><button onClick={() => setView('home')} className="hover:text-white">Portada</button></li>
              <li><button onClick={() => setView('archive')} className="hover:text-white">Hemeroteca</button></li>
              <li><button onClick={() => setView('legal')} className="hover:text-white">Código de Honor</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500">Suscripción</h4>
            <div className="flex">
              <input type="email" placeholder="Email corporativo..." className="bg-transparent border-b border-gray-600 flex-1 py-2 text-xs outline-none focus:border-[#5a8a6a]"/>
              <button className="text-[10px] font-black uppercase ml-4 text-[#5a8a6a]">Ok</button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-8 pt-8 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.5em] text-gray-600">
          <span>© 2024 AYUNTAMIENFATONEWS MEDIA</span>
          <div className="flex gap-4">
            <Twitter size={12}/>
            <Instagram size={12}/>
            <Linkedin size={12}/>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;