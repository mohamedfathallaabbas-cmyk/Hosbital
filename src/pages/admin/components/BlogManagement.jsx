import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, Building2, Calendar,
  Bed, FileText, BookOpen, Activity, Settings, LogOut,
  HeartPulse, PlusCircle, Pencil, Trash2, Search,
  Menu, X, BarChart3, Eye, Phone, MapPin, CheckCircle,
  Clock, User, Tag, Image, AlignLeft
} from 'lucide-react';
import StatCard from '../../../components/hospital/StatCard';
import Modal from '../../../components/hospital/Modal';
import ConfirmDialog from '../../../components/hospital/ConfirmDialog';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';
import { EGYPTIAN_DOCTORS, EGYPTIAN_PATIENTS, DEPARTMENTS } from '../../../lib/egyptianData';

// ===================== BLOG =====================
const INIT_POSTS = [
  { id: 1, title: 'كيف تحافظ على صحة قلبك في 10 خطوات', category: 'صحة القلب', author: 'د. أحمد السيد', date: '2026-04-15', status: 'published', img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 2, title: 'أهمية الفحص الدوري المبكر للكشف عن السرطان', category: 'الوقاية', author: 'د. سارة العمري', date: '2026-04-12', status: 'published', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 3, title: 'التغذية السليمة لمرضى السكري: دليل شامل', category: 'تغذية', author: 'د. فاطمة الزهراء', date: '2026-04-10', status: 'draft', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 4, title: 'تمارين يومية لتقوية العظام والمفاصل', category: 'رياضة وصحة', author: 'د. محمد الحارثي', date: '2026-04-08', status: 'published', img: '/hijab_exercise.png', content: 'محتوى المقال...' },
];

const CATEGORIES = ['صحة القلب', 'الوقاية', 'تغذية', 'رياضة وصحة', 'الصحة النفسية', 'نمط الحياة', 'أمراض مزمنة', 'طب الأطفال'];

function BlogManagement() {
  const [posts, setPosts] = useState(INIT_POSTS);
  const [addOpen, setAddOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { toasts, addToast, removeToast } = useToast();
  const emptyPost = { title: '', category: 'صحة القلب', author: '', date: new Date().toISOString().split('T')[0], status: 'draft', img: '', content: '' };
  const [form, setFormP] = useState(emptyPost);
  const setF = (k, v) => setFormP(p => ({ ...p, [k]: v }));

  const filtered = posts.filter(p => filterStatus === 'all' || p.status === filterStatus);

  const PostForm = ({ onSave, onClose }) => (
    <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div><label className="block text-slate-600 text-sm font-semibold mb-1">عنوان المقال</label><input required value={form.title} onChange={e => setF('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">التصنيف</label>
          <select value={form.category} onChange={e => setF('category', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الكاتب</label><input value={form.author} onChange={e => setF('author', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">تاريخ النشر</label><input type="date" value={form.date} onChange={e => setF('date', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الحالة</label>
          <select value={form.status} onChange={e => setF('status', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            <option value="draft">مسودة</option><option value="published">منشور</option>
          </select>
        </div>
      </div>
      <div><label className="block text-slate-600 text-sm font-semibold mb-1">رابط الصورة</label><input value={form.img} onChange={e => setF('img', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" placeholder="https://..." /></div>
      <div><label className="block text-slate-600 text-sm font-semibold mb-1">محتوى المقال</label><textarea value={form.content} onChange={e => setF('content', e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo resize-none" placeholder="اكتب محتوى المقال هنا..." /></div>
      <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 font-cairo">إلغاء</button><button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>حفظ المقال</button></div>
    </form>
  );

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} /><h3 className="text-xl font-bold">المدونة والمحتوى</h3></div>
        <div className="flex gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none">
            <option value="all">الكل</option><option value="published">منشور</option><option value="draft">مسودة</option>
          </select>
          <button onClick={() => { setFormP(emptyPost); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <PlusCircle className="w-4 h-4" />مقال جديد
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(post => (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
            {post.img && <img src={post.img} alt={post.title} className="w-full h-40 object-cover" />}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-info text-xs">{post.category}</span>
                <span className={post.status === 'published' ? 'badge-success text-xs' : 'badge-warning text-xs'}>{post.status === 'published' ? 'منشور' : 'مسودة'}</span>
              </div>
              <h4 className="font-bold text-slate-900 mb-2 leading-snug">{post.title}</h4>
              <p className="text-slate-400 text-xs mb-3">{post.author} — {post.date}</p>
              <div className="mt-auto flex gap-2">
                <button onClick={() => { setFormP({ ...post }); setEditPost(post); }} className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 text-sm font-medium flex items-center justify-center gap-1"><Pencil className="w-3.5 h-3.5" />تعديل</button>
                <button onClick={() => setDeletePost(post)} className="flex-1 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة مقال جديد" size="lg">
        <PostForm onSave={f => { setPosts(prev => [...prev, { ...f, id: Date.now() }]); setAddOpen(false); addToast('تم نشر المقال بنجاح ✓', 'success'); }} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editPost} onClose={() => setEditPost(null)} title="تعديل المقال" size="lg">
        {editPost && <PostForm onSave={f => { setPosts(prev => prev.map(p => p.id === editPost.id ? { ...p, ...f } : p)); setEditPost(null); addToast('تم تحديث المقال ✓', 'success'); }} onClose={() => setEditPost(null)} />}
      </Modal>
      <ConfirmDialog open={!!deletePost} onClose={() => setDeletePost(null)} onConfirm={() => { setPosts(prev => prev.filter(p => p.id !== deletePost.id)); addToast('تم حذف المقال', 'error'); }}
        title="حذف المقال" message={`هل أنت متأكد من حذف مقال "${deletePost?.title}"؟`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default BlogManagement;