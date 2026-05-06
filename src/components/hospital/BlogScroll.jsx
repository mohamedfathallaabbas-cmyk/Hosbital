import { useRef, useState, useCallback } from 'react';
import { Clock, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const blogs = [
  { title: 'كيف تحافظ على صحة قلبك في 10 خطوات يومية', category: 'صحة القلب', date: '15 أبريل 2025', img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop', readTime: '5 دقائق' },
  { title: 'أهمية الفحص الدوري المبكر للكشف عن السرطان', category: 'الوقاية', date: '12 أبريل 2025', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop', readTime: '7 دقائق' },
  { title: 'التغذية السليمة لمرضى السكري: دليل شامل', category: 'تغذية', date: '10 أبريل 2025', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop', readTime: '8 دقائق' },
  { title: 'تمارين يومية لتقوية العظام والمفاصل', category: 'رياضة وصحة', date: '8 أبريل 2025', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop', readTime: '4 دقائق' },
  { title: 'الصحة النفسية: كيف تتعامل مع ضغوط الحياة', category: 'الصحة النفسية', date: '5 أبريل 2025', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop', readTime: '6 دقائق' },
  { title: 'أسرار النوم الصحي والعميق', category: 'نمط الحياة', date: '2 أبريل 2025', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=250&fit=crop', readTime: '5 دقائق' },
  { title: 'مرض الضغط: الأسباب والعلاج والوقاية', category: 'أمراض مزمنة', date: '30 مارس 2025', img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=250&fit=crop', readTime: '9 دقائق' },
  { title: 'كل ما تريد معرفته عن تحاليل الدم', category: 'تشخيص', date: '28 مارس 2025', img: 'https://images.unsplash.com/photo-1631549916768-4119b4220312?w=400&h=250&fit=crop', readTime: '6 دقائق' },
];

export default function BlogScroll() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const onMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);
  const stopDrag = () => setIsDragging(false);

  return (
    <section id="blog" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-3" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>المدونة الصحية</div>
            <h2 className="text-4xl font-black text-slate-900">نصائح من متخصصينا</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={() => scroll(-1)} className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          <style>{`.blog-scroll::-webkit-scrollbar { display: none; }`}</style>
          {blogs.map((blog, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.08, 0.4) }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-72 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white group"
              style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
            >
              <div className="relative overflow-hidden h-44">
                <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="badge-info text-xs">{blog.category}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>{blog.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight mb-3 line-clamp-2">{blog.title}</h3>
                <button className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                  اقرأ المزيد <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}