import { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, ShieldCheck, Mail, Phone, Settings, AlertTriangle } from 'lucide-react';
import Modal from '../../../components/hospital/Modal';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';

export default function InsuranceManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCompany, setActiveCompany] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  // Modals state
  const [addCoOpen, setAddCoOpen] = useState(false);
  const [editCo, setEditCo] = useState(null);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);

  const { toasts, addToast, removeToast } = useToast();

  // Forms state
  const [coForm, setCoForm] = useState({ name: '', email: '', phone: '' });
  const [classForm, setClassForm] = useState({
    name: '',
    defaultCoverage: 80,
    consultationCov: 80,
    labCoverage: 80,
    radCoverage: 80,
    pharmacyCoverage: 80,
    maxAnnualLimit: 10000
  });

  const loadCompanies = () => {
    setLoading(true);
    api.get('/insurance/companies')
      .then(res => {
        setCompanies(res.data || []);
        if (activeCompany) {
          const updated = res.data.find(c => c.id === activeCompany.id);
          if (updated) {
            setActiveCompany(updated);
            setClasses(updated.classes || []);
          }
        }
      })
      .catch(() => addToast('تعذر تحميل شركات التأمين', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const selectCompany = (co) => {
    setActiveCompany(co);
    setClasses(co.classes || []);
  };

  const handleAddCoSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/insurance/companies', coForm);
      addToast('تم إضافة شركة التأمين بنجاح ✓', 'success');
      setAddCoOpen(false);
      setCoForm({ name: '', email: '', phone: '' });
      loadCompanies();
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل في إضافة الشركة', 'error');
    }
  };

  const handleEditCoSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/insurance/companies/${editCo.id}`, coForm);
      addToast('تم تحديث شركة التأمين بنجاح ✓', 'success');
      setEditCo(null);
      setCoForm({ name: '', email: '', phone: '' });
      loadCompanies();
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل في تعديل الشركة', 'error');
    }
  };

  const handleAddClassSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/insurance/classes', {
        ...classForm,
        companyId: activeCompany.id
      });
      addToast('تم إضافة فئة التأمين بنجاح ✓', 'success');
      setAddClassOpen(false);
      setClassForm({
        name: '',
        defaultCoverage: 80,
        consultationCov: 80,
        labCoverage: 80,
        radCoverage: 80,
        pharmacyCoverage: 80,
        maxAnnualLimit: 10000
      });
      loadCompanies();
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل في إضافة فئة التأمين', 'error');
    }
  };

  const handleEditClassSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/insurance/classes/${editClass.id}`, classForm);
      addToast('تم تحديث فئة التأمين بنجاح ✓', 'success');
      setEditClass(null);
      loadCompanies();
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل في تعديل فئة التأمين', 'error');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('هل أنت متأكد من حذف فئة التأمين هذه؟')) return;
    try {
      await api.delete(`/insurance/classes/${classId}`);
      addToast('تم حذف فئة التأمين بنجاح', 'success');
      loadCompanies();
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل في حذف فئة التأمين', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)' }} />
          <h3 className="text-xl font-bold">إدارة شركات وفئات التأمين</h3>
        </div>
        <button
          onClick={() => {
            setCoForm({ name: '', email: '', phone: '' });
            setAddCoOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة شركة تأمين</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Companies List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col h-[600px]">
          <h4 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span>قائمة شركات التأمين</span>
          </h4>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : companies.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <ShieldCheck className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">لم يتم تسجيل شركات تأمين بعد</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {companies.map((co) => {
                const isSelected = activeCompany?.id === co.id;
                return (
                  <div
                    key={co.id}
                    onClick={() => selectCompany(co)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-purple-200 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-sm">{co.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoForm({ name: co.name, email: co.email || '', phone: co.phone || '' });
                            setEditCo(co);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-white transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-slate-500 text-xs">
                      {co.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{co.email}</span>
                        </div>
                      )}
                      {co.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{co.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100/50 flex justify-between items-center text-[10px] text-slate-400">
                      <span>الفئات المتاحة: {co.classes?.length || 0}</span>
                      <span>الوثائق النشطة: {co._count?.policies || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Classes & Schedule Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col h-[600px]">
          {activeCompany ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{activeCompany.name}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">جدول الفئات ونسب التغطية التأمينية</p>
                </div>
                <button
                  onClick={() => {
                    setClassForm({
                      name: '',
                      defaultCoverage: 80,
                      consultationCov: 80,
                      labCoverage: 80,
                      radCoverage: 80,
                      pharmacyCoverage: 80,
                      maxAnnualLimit: 10000
                    });
                    setAddClassOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 text-xs font-bold transition-all border border-purple-100 hover:border-purple-600"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>إضافة فئة (Class)</span>
                </button>
              </div>

              {classes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Settings className="w-12 h-12 mb-2 opacity-30 animate-pulse" />
                  <p className="text-sm">لم يتم تعريف فئات تغطية لهذه الشركة بعد</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    اضغط على زر "إضافة فئة" أعلاه لتعريف مستويات التغطية للكشوفات، التحاليل، والأدوية.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 text-xs">
                        <th className="py-3 px-2 font-bold text-slate-700">الفئة (Class)</th>
                        <th className="py-3 px-2">التغطية العامة</th>
                        <th className="py-3 px-2">الكشوفات</th>
                        <th className="py-3 px-2">التحاليل</th>
                        <th className="py-3 px-2">الأشعة</th>
                        <th className="py-3 px-2">الصيدلية</th>
                        <th className="py-3 px-2">الحد الأقصى</th>
                        <th className="py-3 px-2 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-600 text-xs font-medium">
                      {classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-2 font-bold text-slate-800">{cls.name}</td>
                          <td className="py-4 px-2">{cls.defaultCoverage}%</td>
                          <td className="py-4 px-2">{cls.consultationCov}%</td>
                          <td className="py-4 px-2">{cls.labCoverage}%</td>
                          <td className="py-4 px-2">{cls.radCoverage}%</td>
                          <td className="py-4 px-2">{cls.pharmacyCoverage}%</td>
                          <td className="py-4 px-2 font-semibold text-purple-600">
                            {cls.maxAnnualLimit?.toLocaleString()} ج.م
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setClassForm({
                                    name: cls.name,
                                    defaultCoverage: cls.defaultCoverage,
                                    consultationCov: cls.consultationCov,
                                    labCoverage: cls.labCoverage,
                                    radCoverage: cls.radCoverage,
                                    pharmacyCoverage: cls.pharmacyCoverage,
                                    maxAnnualLimit: cls.maxAnnualLimit
                                  });
                                  setEditClass(cls);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                                title="تعديل فئة التغطية"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClass(cls.id)}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <ShieldCheck className="w-16 h-16 mb-3 text-purple-200" />
              <h5 className="font-bold text-slate-700 text-base mb-1">تفاصيل فئات التأمين</h5>
              <p className="text-xs text-slate-400 max-w-xs">
                اختر شركة تأمين من القائمة الجانبية لعرض أو تعديل جدول فئات التغطية والحدود المالية المرتبطة بعقدها.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Company Modal */}
      <Modal open={addCoOpen} onClose={() => setAddCoOpen(false)} title="إضافة شركة تأمين جديدة" size="sm">
        <form onSubmit={handleAddCoSubmit} className="p-6 space-y-4 font-cairo">
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">اسم شركة التأمين *</label>
            <input
              required
              value={coForm.name}
              onChange={e => setCoForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
              placeholder="مثال: شركة بوبا للتأمين"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">البريد الإلكتروني للجهة</label>
            <input
              type="email"
              value={coForm.email}
              onChange={e => setCoForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
              placeholder="example@company.com"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">رقم الهاتف للتواصل</label>
            <input
              value={coForm.phone}
              onChange={e => setCoForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
              placeholder="مثال: 16816 أو 01000..."
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            تأكيد الإضافة
          </button>
        </form>
      </Modal>

      {/* Edit Company Modal */}
      <Modal open={!!editCo} onClose={() => setEditCo(null)} title="تعديل بيانات شركة التأمين" size="sm">
        <form onSubmit={handleEditCoSubmit} className="p-6 space-y-4 font-cairo">
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">اسم شركة التأمين *</label>
            <input
              required
              value={coForm.name}
              onChange={e => setCoForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">البريد الإلكتروني للجهة</label>
            <input
              type="email"
              value={coForm.email}
              onChange={e => setCoForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">رقم الهاتف للتواصل</label>
            <input
              value={coForm.phone}
              onChange={e => setCoForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            تحديث البيانات
          </button>
        </form>
      </Modal>

      {/* Add Class Modal */}
      <Modal open={addClassOpen} onClose={() => setAddClassOpen(false)} title="إضافة فئة تأمينية (جدول التغطية)" size="md">
        <form onSubmit={handleAddClassSubmit} className="p-6 space-y-4 font-cairo">
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">اسم الفئة (Class) *</label>
            <input
              required
              value={classForm.name}
              onChange={e => setClassForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
              placeholder="مثال: الفئة أ (Class A) أو البلاتينية"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">نسبة التغطية العامة (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={classForm.defaultCoverage}
                onChange={e => setClassForm(p => ({ ...p, defaultCoverage: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">الحد المالي السنوي (ج.م)</label>
              <input
                type="number"
                min="0"
                value={classForm.maxAnnualLimit}
                onChange={e => setClassForm(p => ({ ...p, maxAnnualLimit: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h5 className="font-bold text-slate-800 text-xs mb-2">تخصيص نسب التغطية حسب الخدمة الطبية (%)</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold mb-1">كشوفات العيادات الخارجية</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={classForm.consultationCov}
                  onChange={e => setClassForm(p => ({ ...p, consultationCov: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold mb-1">التحاليل الطبية والمختبر</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={classForm.labCoverage}
                  onChange={e => setClassForm(p => ({ ...p, labCoverage: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold mb-1">الأشعة (السونار، الرنين...)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={classForm.radCoverage}
                  onChange={e => setClassForm(p => ({ ...p, radCoverage: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold mb-1">الأدوية والصيدلية</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={classForm.pharmacyCoverage}
                  onChange={e => setClassForm(p => ({ ...p, pharmacyCoverage: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            حفظ الفئة والتغطية
          </button>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal open={!!editClass} onClose={() => setEditClass(null)} title="تعديل فئة وتغطية التأمين" size="md">
        <form onSubmit={handleEditClassSubmit} className="p-6 space-y-4 font-cairo">
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">اسم الفئة (Class) *</label>
            <input
              required
              value={classForm.name}
              onChange={e => setClassForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">نسبة التغطية العامة (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={classForm.defaultCoverage}
                onChange={e => setClassForm(p => ({ ...p, defaultCoverage: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">الحد المالي السنوي (ج.م)</label>
              <input
                type="number"
                min="0"
                value={classForm.maxAnnualLimit}
                onChange={e => setClassForm(p => ({ ...p, maxAnnualLimit: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h5 className="font-bold text-slate-800 text-xs mb-2">تخصيص نسب التغطية حسب الخدمة الطبية (%)</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold mb-1">كشوفات العيادات الخارجية</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={classForm.consultationCov}
                  onChange={e => setClassForm(p => ({ ...p, consultationCov: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold mb-1">التحاليل الطبية والمختبر</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={classForm.labCoverage}
                  onChange={e => setClassForm(p => ({ ...p, labCoverage: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold mb-1">الأشعة (السونار، الرنين...)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={classForm.radCoverage}
                  onChange={e => setClassForm(p => ({ ...p, radCoverage: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold mb-1">الأدوية والصيدلية</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={classForm.pharmacyCoverage}
                  onChange={e => setClassForm(p => ({ ...p, pharmacyCoverage: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-purple-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            تحديث الفئة والتغطية
          </button>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
