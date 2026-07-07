import { useState } from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../../components/hospital/Modal';
import ConfirmDialog from '../../../components/hospital/ConfirmDialog';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';

const INIT_POSTS = [
  { id: 1, title: 'كيف تحافظ على صحة قلبك في 10 خطوات', category: 'صحة القلب', author: 'د. أحمد السيد', date: '2026-04-15', status: 'published', img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 2, title: 'أهمية الفحص الدوري المبكر للكشف عن السرطان', category: 'الوقاية', author: 'د. سارة العمري', date: '2026-04-12', status: 'published', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 3, title: 'التغذية السليمة لمرضى السكري: دليل شامل', category: 'تغذية', author: 'د. فاطمة الزهراء', date: '2026-04-10', status: 'draft', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 4, title: 'تمارين يومية لتقوية العظام والمفاصل', category: 'رياضة وصحة', author: 'د. محمد الحارثي', date: '2026-04-08', status: 'published', img: '/hijab_exercise.png', content: 'محتوى المقال...' },
];

const CATEGORIES = ['صحة القلب', 'الوقاية', 'تغذية', 'رياضة وصحة', 'الصحة النفسية', 'نمط الحياة', 'أمراض مزمنة', 'طب الأطفال'];

export default function BlogManagement() {
  const [posts, setPosts] = useState(() => {
    const stored = localStorage.getItem('hospital_blog_posts');
    return stored ? JSON.parse(stored) : INIT_POSTS;
  });
  const [addOpen, setAddOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { toasts, addToast, removeToast } = useToast();
  
  const emptyPost = { title: '', category: 'صحة القلب', author: '', date: new Date().toISOString().split('T')[0], status: 'draft', img: '', content: '' };
  const [form, setFormP] = useState(emptyPost);
  const setF = (k, v) => setFormP(p => ({ ...p, [k]: v }));

  const filtered = posts.filter(p => filterStatus === 'all' || p.status === filterStatus);

  const savePosts = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem('hospital_blog_posts', JSON.stringify(newPosts));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newPost = { ...form, id: Date.now() };
    const updated = [newPost, ...posts];
    savePosts(updated);
    setAddOpen(false);
    addToast('تم نشر المقال بنجاح ✓', 'success');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updated = posts.map(p => p.id === editPost.id ? { ...p, ...form } : p);
    savePosts(updated);
    setEditPost(null);
    addToast('تم تحديث المقال ✓', 'success');
  };

  const handleDeleteConfirm = () => {
    const updated = posts.filter(p => p.id !== deletePost.id);
    savePosts(updated);
    setDeletePost(null);
    addToast('تم حذف المقال بنجاح', 'success');
  };

  const PostForm = ({ onSubmit, onClose }) => (
    <form className="p-6 space-y-4 font-cairo" onSubmit={onSubmit}>
      <div>
        <label className="block text-slate-600 text-sm font-semibold mb-1">عنوان المقال</label>
        <input required value={form.title} onChange={e => setF('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-teal-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">التصنيف</label>
          <select value={form.category} onChange={e => setF('category', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">الكاتب</label>
          <input required value={form.author} onChange={e => setF('author', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-teal-400" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">تاريخ النشر</label>
          <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">الحالة</label>
          <select value={form.status} onChange={e => setF('status', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none">
            <option value="draft">مسودة</option>
            <option value="published">منشور</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-slate-600 text-sm font-semibold mb-1">رابط الصورة</label>
        <input value={form.img} onChange={e => setF('img', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-teal-400" placeholder="https://..." />
      </div>
      <div>
        <label className="block text-slate-600 text-sm font-semibold mb-1">محتوى المقال</label>
        <textarea required value={form.content} onChange={e => setF('content', e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-teal-400 resize-none" placeholder="اكتب محتوى المقال هنا..." />
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">إلغاء</button>
        <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>حفظ المقال</button>
      </div>
    </form>
  );

  return (
    <div className="p-6 fade-in font-cairo">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} />
          <h3 className="text-xl font-bold">المدونة والمحتوى</h3>
        </div>
        <div className="flex gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none">
            <option value="all">الكل</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </select>
          <button onClick={() => { setFormP(emptyPost); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <PlusCircle className="w-4 h-4" />مقال جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(post => (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
            {post.img && <img src={post.img} alt={post.title} className="w-full h-40 object-cover" />}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-info text-xs">{post.category}</span>
                <span className={post.status === 'published' ? 'badge-success text-xs' : 'badge-warning text-xs'}>{post.status === 'published' ? 'منشور' : 'مسودة'}</span>
              </div>
              <h4 className="font-bold text-slate-900 mb-2 leading-snug">{post.title}</h4>
              <p className="text-slate-400 text-xs mb-3">{post.author} — {post.date}</p>
              <div className="mt-auto flex gap-2 pt-3">
                <button onClick={() => { setFormP({ ...post }); setEditPost(post); }} className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 text-sm font-medium flex items-center justify-center gap-1"><Pencil className="w-3.5 h-3.5" />تعديل</button>
                <button onClick={() => setDeletePost(post)} className="flex-1 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة مقال جديد" size="lg">
        <PostForm onSubmit={handleAddSubmit} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editPost} onClose={() => setEditPost(null)} title="تعديل المقال" size="lg">
        {editPost && <PostForm onSubmit={handleEditSubmit} onClose={() => setEditPost(null)} />}
      </Modal>
      <ConfirmDialog open={!!deletePost} onClose={() => setDeletePost(null)} onConfirm={handleDeleteConfirm}
        title="حذف المقال" message={`هل أنت متأكد من حذف مقال "${deletePost?.title}"؟`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}