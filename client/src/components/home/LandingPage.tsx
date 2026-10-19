import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  BookOpenCheck, 
  Headphones, 
  Award, 
  Bookmark,
  ChevronDown,
  ChevronUp,
  Brain,
  Rocket,
  Target
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { id: 'kanji', title: 'Hán Tự (Kanji)', desc: 'Hệ thống tra cứu và học Hán tự theo giáo trình chuẩn, phân rã bộ thủ logic.', icon: Sparkles, color: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-300' },
    { id: 'vocab', title: 'Từ Vựng (Vocab)', desc: 'Kho từ vựng khổng lồ từ N5-N1 kèm ví dụ minh họa và phát âm bản xứ.', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600', hover: 'hover:border-emerald-300' },
    { id: 'grammar', title: 'Ngữ Pháp', desc: 'Giải thích ngữ pháp siêu chi tiết bằng AI, so sánh các mẫu ngữ pháp dễ nhầm lẫn.', icon: GraduationCap, color: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-300' },
    { id: 'reading', title: 'Đọc Hiểu & Tin Tức', desc: 'Luyện đọc qua báo chí Nhật Bản thực tế (NHK, Livedoor) được AI tạo câu hỏi trắc nghiệm.', icon: BookOpenCheck, color: 'bg-amber-50 text-amber-600', hover: 'hover:border-amber-300' },
    { id: 'shadowing', title: 'Luyện Nghe', desc: 'Luyện nghe và nói nhại theo (Shadowing) qua các video YouTube thực tế sinh động.', icon: Headphones, color: 'bg-rose-50 text-rose-600', hover: 'hover:border-rose-300' },
    { id: 'exam', title: 'Thi Thử JLPT', desc: 'Kho đề thi JLPT khổng lồ với đồng hồ bấm giờ như thi thật, AI chấm điểm và giải thích.', icon: Award, color: 'bg-violet-50 text-violet-600', hover: 'hover:border-violet-300' },
    { id: 'personal', title: 'Sổ Tay Cá Nhân', desc: 'Ghi chú, lưu trữ từ vựng, ngữ pháp. Tự động nhắc nhở ôn tập bằng thuật toán Spaced Repetition.', icon: Bookmark, color: 'bg-teal-50 text-teal-600', hover: 'hover:border-teal-300' }
  ];

  const faqs = [
    { q: 'Hệ thống NihonAI phù hợp cho trình độ nào?', a: 'NihonAI được thiết kế cho mọi trình độ từ sơ cấp (N5) đến thượng cấp (N1). Bạn có thể dễ dàng chuyển đổi mục tiêu học tập ở góc phải màn hình để nhận lộ trình phù hợp.' },
    { q: 'Trí tuệ nhân tạo (AI) giúp tôi học thế nào?', a: 'AI trên hệ thống hoạt động như một gia sư 24/7. Nó giúp phân tích các bài báo Nhật Bản mới nhất, tạo bài tập đọc hiểu tự động, giải thích chi tiết tại sao bạn làm sai trong đề thi thử JLPT.' },
    { q: 'Tôi có thể dùng NihonAI trên điện thoại không?', a: 'Hoàn toàn được! Giao diện của chúng tôi được tối ưu hóa hiển thị cực kỳ hoàn hảo trên mọi kích thước màn hình từ Desktop, Tablet cho tới Điện thoại thông minh.' },
    { q: 'Chức năng "Sổ tay cá nhân" hoạt động ra sao?', a: 'Khi đang học bất cứ từ vựng, ngữ pháp hay hán tự nào, bạn chỉ cần bấm "Lưu vào sổ tay". Hệ thống sẽ tự tạo Flashcard và áp dụng thuật toán Lặp lại ngắt quãng (SRS) để nhắc bạn ôn tập đúng thời điểm bộ não chuẩn bị quên.' }
  ];

  return (
    <div className="w-full flex flex-col items-center animate-fade-in-up pb-12">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto mt-8 mb-16 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-sm mb-6">
          <Brain className="w-4 h-4" /> Nền tảng EdTech tiên phong ứng dụng Trí tuệ nhân tạo
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Học tiếng Nhật chuẩn xác <br className="hidden md:block"/> 
          cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">NihonAI Academy</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
          Xóa bỏ rào cản ngôn ngữ với phương pháp học tập toàn diện, thông minh. Lộ trình cá nhân hóa từ N5 đến N1 giúp bạn dễ dàng chinh phục kỳ thi JLPT và thành thạo giao tiếp thực tế.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => onNavigate('exam')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
          >
            <Target className="w-5 h-5" /> Thi thử JLPT ngay
          </button>
          <button 
            onClick={() => onNavigate('kanji')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
          >
            <Rocket className="w-5 h-5" /> Khám phá Hán tự
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white border-y border-slate-200/60 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Hệ sinh thái học tập toàn diện</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Mọi công cụ bạn cần để làm chủ tiếng Nhật đều hội tụ tại đây. Chỉ cần một tài khoản để truy cập kho dữ liệu không giới hạn.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.id} 
                onClick={() => onNavigate(feature.id)}
                className={`bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${feature.hover}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Câu hỏi thường gặp</h2>
          <p className="text-slate-500">Giải đáp nhanh các thắc mắc về hệ thống học tập NihonAI.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`border rounded-2xl transition-all duration-300 overflow-hidden ${openFaq === idx ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <button 
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span className={`font-semibold text-lg ${openFaq === idx ? 'text-indigo-700' : 'text-slate-800'}`}>
                  {faq.q}
                </span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-indigo-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="w-full max-w-6xl mx-auto mt-10 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 NihonAI Academy. Được phát triển để nâng tầm việc học tiếng Nhật bằng AI.</p>
      </footer>
    </div>
  );
};
