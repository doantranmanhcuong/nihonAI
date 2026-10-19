'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Clock,
  ArrowRight,
  AlertCircle,
  Newspaper,
  ExternalLink,
  Search,
  RotateCw,
  Link as LinkIcon,
  Video,
  CheckCircle2,
  Globe,
  FileText
, ChevronLeft, ChevronRight , Calendar } from 'lucide-react';
import { ReadingArticle, QuotaStatus, } from './reading.types';
import { ReadingApi } from './reading.api';

type ReadingTab = 'NEWS' | 'LIBRARY' | 'IMPORT';
type JLPTFilter = 'ALL' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

interface SharedLibraryViewProps {
  onRequestAiGenerate?: () => void;
  onSelectArticle: (articleId: string) => void;
  onArticleGenerated: (article: ReadingArticle) => void;
  quota: QuotaStatus | null;
  onNavigateToVideo?: () => void;
}

let globalLibraryCache: ReadingArticle[] | null = null;

export const SharedLibraryView: React.FC<SharedLibraryViewProps> = ({ onRequestAiGenerate, onSelectArticle, onArticleGenerated, quota, onNavigateToVideo }) => {
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<ReadingTab>('NEWS');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Tin tức báo chí Nhật Bản
  const [loadingNewsId, setLoadingNewsId] = useState<string | null>(null);

  // Thư viện bài đọc CSDL
  const [libraryArticles, setLibraryArticles] = useState<ReadingArticle[]>(globalLibraryCache || []);
  const [isLibraryLoading, setIsLibraryLoading] = useState<boolean>(!globalLibraryCache);

  // Cào bài báo từ URL
  const [inputUrl, setInputUrl] = useState<string>('');
  const [urlLevel, setUrlLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N3');
  const [isImportingUrl, setIsImportingUrl] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Tự nhập văn bản tiếng Nhật
  const [customText, setCustomText] = useState<string>('');
  const [customLevel, setCustomLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N2');
  const [isSubmittingText, setIsSubmittingText] = useState<boolean>(false);
  const [textError, setTextError] = useState<string | null>(null);

  // Hướng dẫn 6 bước
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const sampleArticleText = `最近の日本社会で最も目立つ変化の一つは、一人で暮らす人が急速に増えていることです。統計によると、全世帯のうち単身世帯が占める割合はすでに三分の一を超えており、今後も増え続けると見られています。一人でご飯を食べたり、一人で映画を見たり、一人で旅行に出かけたりする姿は、もう特別なことではありません。以前は一人で何かをする人を気の毒に思う視線が多かったのですが、最近の若い世代はむしろ一人だけの時間を楽しむことを自然な生活スタイルとして受け入れています。

単身世帯が増える理由はさまざまです。結婚を遅らせたり、まったくしなかったりする人が多くなり、学業や仕事のために家族と離れて暮らす若者も増えました。平均寿命が延びるにつれて、配偶者を先に見送り、一人残される高齢者も多くなりました。さらに、個人の自由やプライバシーを大切にする価値観の変化も大きな影響を与えました。経済的に自立できる女性が増えたことも、重要な理由の一つに挙げられます。

「一人焼肉」や「一人カラオケ」という言葉が流行しているのも、この流れをよく示しています。一人で食事をすることはもう珍しい日常になり、飲食店も一人客のためのメニューを別に作っています。調査によると、若い世代の半数以上が一人で過ごす時間がどうしても必要だと答えており、一人で行う活動でストレスが解消されると話す人も多くいました。

こうした変化に合わせて、企業も素早く動いています。コンビニでは一人で食べやすいお弁当や小分けのおかずの種類が大きく増え、飲食店には一人用の席が用意され始めました。家電メーカーは小さな冷蔵庫や小型洗濯機のように単身世帯向けの製品を次々と発売しており、旅行会社では一人旅のための商品も販売しています。住宅市場でも小さなアパートやワンルームマンションを探す人が増え、小型住宅の価格が上がり続けています。専門家たちは、単身世帯が消費市場の流れを変える最も重要な力になったと言います。

しかし、一人暮らしに明るい面だけがあるわけではありません。急に病気になったとき助けてくれる人がいないこと、年を取るほど大きくなる孤独感、そして経済的な不安は、単身世帯がよく語る悩みです。特に一人暮らしの高齢者の場合、社会とのつながりが切れると、健康に問題が起きても誰も気づかないという危険な状況が生まれかねません。そのため政府は、単身世帯のための住宅支援や見守りサービス、孤独の問題を解決するための相談プログラムなど、さまざまな政策を準備しています。しかし、まだ支援が足りないという指摘も多くあります。

専門家たちは、今後単身世帯が全世帯の半分近くを占めるようになると予測しています。したがって、一人で暮らすことを個人の選択としてだけ見るのではなく、社会全体が単身者を支えるインフラを整え、新しいコミュニティの形を作っていくことが求められています。`;

  // 2. Tải danh sách bài đọc từ thư viện
  const fetchLibrary = async () => {
    if (!globalLibraryCache) {
      setIsLibraryLoading(true);
    }
    try {
      const res = await ReadingApi.getArticles({ limit: 500 });
      globalLibraryCache = res.items || [];
      setLibraryArticles(globalLibraryCache);
    } catch (err) {
      console.error('Lỗi khi tải thư viện bài đọc:', err);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  // Xử lý cào bài báo từ input URL
  const handleImportFromUrl = async () => {
    const clean = inputUrl.trim();
    if (!clean) {
      setUrlError('Vui lòng dán link bài báo tiếng Nhật.');
      return;
    }
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      setUrlError('Đường dẫn bài báo phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    setIsImportingUrl(true);
    setUrlError(null);

    try {
      const art = await ReadingApi.importArticleFromUrl(clean, urlLevel);
      onArticleGenerated(art);
    } catch (err: any) {
      setUrlError(err.message || 'Không thể cào và phân tích bài báo này.');
    } finally {
      setIsImportingUrl(false);
    }
  };

  // Xử lý tự nhập văn bản
  const handleProcessCustomText = async () => {
    const clean = customText.trim();
    if (!clean) {
      setTextError('Vui lòng dán đoạn văn tiếng Nhật vào khung nhập liệu.');
      return;
    }
    if (clean.length < 80) {
      setTextError('Văn bản quá ngắn (dưới 80 ký tự). Khuyến nghị dán đoạn văn từ 300 đến 3.000 ký tự.');
      return;
    }

    setIsSubmittingText(true);
    setTextError(null);

    try {
      const res = await ReadingApi.generateArticle({
        level: customLevel,
        topic: 'Bài đọc tự nhập',
        providedText: clean
      });
      onArticleGenerated(res.article);
    } catch (err: any) {
      setTextError(err.message || 'Có lỗi xảy ra khi phân tích bài đọc.');
    } finally {
      setIsSubmittingText(false);
    }
  };

  // Tính số lượng bài theo cấp độ
  

  const categoryConfigs = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'NHK_NEWS', label: 'Tin NHK' },
    { id: 'EXTERNAL_NEWS', label: 'Báo chí khác' },
    { id: 'AI_GENERATED', label: 'Bài đọc AI' }
  ];

  // Lọc bài báo theo tìm kiếm, cấp độ và trạng thái đã lưu
  const filteredLibrary = useMemo(() => {
    let list = libraryArticles;
    
    // Filter by Category
    if (selectedCategory !== 'ALL') {
      list = list.filter((a) => a.sourceType === selectedCategory);
    }
    
    // Filter by Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.topic && a.topic.toLowerCase().includes(q))
      );
    }
    
    // Sort
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return sortBy === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });
    
    return list;
  }, [libraryArticles, selectedCategory, searchTerm, sortBy]);
  
  const totalPages = Math.ceil(filteredLibrary.length / itemsPerPage);
  const paginatedLibrary = filteredLibrary.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full pb-16">
      {/* 1. HEADER GỌN GÀNG & THÔNG MINH */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 lg:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                Đọc Hiểu & Báo Nhật Dokkai
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                AI Phân Tích
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật 24/7 từ NHK và Livedoor News • Furigana chuẩn • Giọng đọc bản xứ & Trắc nghiệm JLPT
            </p>
          </div>
        </div>

        {/* Tab Switcher hiện đại dạng Segmented Control */}
                  <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shrink-0 overflow-x-auto">
            
          </div>
      </div>

              {/* 2. THANH ĐIỀU KHIỂN & LỌC THÔNG MINH */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Nút lọc Danh Mục */}
          <div className="flex flex-wrap items-center gap-2">
            {categoryConfigs.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
            {/* Sắp xếp */}
            <button
              onClick={() => setSortBy(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <Calendar className="w-4 h-4" />
              <span>{sortBy === 'NEWEST' ? 'Mới nhất' : 'Cũ nhất'}</span>
            </button>
            
            {/* Ô tìm kiếm */}
            <div className="relative flex-1 sm:min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm kiếm..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

      {/* 3. NỘI DUNG CHÍNH */}
      <div className="flex flex-col gap-4">
        {isLibraryLoading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs font-bold text-slate-600">
              Đang tải danh sách bài đọc...
            </span>
          </div>
        ) : filteredLibrary.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 text-slate-500 gap-4">
            <div className="text-sm font-semibold">Chưa có bài đọc nào phù hợp.</div>
            <button
              onClick={() => onRequestAiGenerate?.()}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              Yêu cầu AI viết bài mới
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedLibrary.map((news, idx) => {
                const isLoadingThis = loadingNewsId === news.id;
                const formattedDate = new Date(news.createdAt || Date.now()).toLocaleDateString('vi-VN', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={`news-${news.id}-${idx}`}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:shadow-md transition-all p-4 flex flex-col justify-between gap-3 group relative overflow-hidden"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Thumbnail */}
                      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-100 shrink-0">
                        {news.imageUrl ? (
                          <img
                            src={news.imageUrl}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <Newspaper className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm ${
                            news.sourceType === 'NHK_NEWS' ? 'bg-rose-600 text-white' : 
                            news.sourceType === 'EXTERNAL_NEWS' ? 'bg-blue-600 text-white' :
                            'bg-amber-500 text-white'
                          }`}>
                            {news.sourceType === 'NHK_NEWS' ? 'NHK News' : 
                             news.sourceType === 'EXTERNAL_NEWS' ? 'Báo Trích Dẫn' : 'AI Tạo'}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>

                        <h3 className="text-sm font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {news.title}
                        </h3>
                        
                        {news.topic && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {news.topic}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectArticle(news.id);
                          }}
                          className="w-full justify-center px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Vào Luyện Đọc</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          currentPage === page 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      {/* 4. KHUNG  HƯỚNG DẪN 6 BƯỚC ĐỌC HIỂU DOKKAI HIỆU QUẢ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <button
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-sm font-black text-slate-900">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Phương pháp luyện đọc hiểu Dokkai hiệu quả nhất (6 bước với 1 bài)</span>
          </div>
          {isGuideOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {isGuideOpen && (
          <div className="px-5 pb-5 pt-1 text-xs text-slate-800 leading-relaxed border-t border-slate-100 flex flex-col gap-3">
            <ol className="list-decimal pl-4 space-y-2">
              <li>
                <strong className="text-slate-900 font-bold">Nghe lần 1 KHÔNG nhìn chữ</strong> — đoán xem bài nói về chủ đề gì. Rèn thói quen nắm ý toàn cục trước.
              </li>
              <li>
                <strong className="text-slate-900 font-bold">Đọc + nghe theo highlight</strong> — chú ý ĐUÔI CÂU và từ nối (~が、~ので、しかし...) vì logic câu tiếng Nhật nằm ở cuối.
              </li>
              <li>
                <strong className="text-slate-900 font-bold">Shadowing từng câu</strong> — dùng nút &quot;Lặp câu&quot;, đọc thành tiếng theo giọng bản xứ để quen nhịp điệu và ngữ điệu tự nhiên.
              </li>
              <li>
                <strong className="text-slate-900 font-bold">Làm bộ câu hỏi cuối bài TRƯỚC khi mở bản dịch</strong> — kiểm tra đúng 3 dạng câu hỏi Dokkai tiêu chuẩn của đề thi JLPT thật.
              </li>
              <li>
                <strong className="text-slate-900 font-bold">Mở bản dịch đối chiếu</strong> — ghi chép 10–15 từ vựng hoặc mẫu ngữ pháp trọng tâm vào sổ tay để ôn lại qua flashcard.
              </li>
              <li>
                <strong className="text-slate-900 font-bold">Hôm sau nghe lại ở tốc độ 1.25x</strong> — nghe hiểu ngay không cần nhìn chữ hay bản dịch là bạn đã &quot;tiêu hóa&quot; xong bài này.
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
