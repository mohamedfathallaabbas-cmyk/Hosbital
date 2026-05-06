import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EGYPTIAN_PATIENTS } from '@/lib/egyptianData';

// Mocking risk levels based on patients data
const patientsWithRisk = EGYPTIAN_PATIENTS.map((p, i) => ({
  ...p,
  riskLevel: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
  trend: i % 3 === 0 ? 'up' : i % 2 === 0 ? 'flat' : 'down'
}));

const riskColors = {
  high: 'bg-red-50 text-red-600 border-red-100',
  medium: 'bg-amber-50 text-amber-600 border-amber-100',
  low: 'bg-green-50 text-green-600 border-green-100'
};

const riskLabels = {
  high: 'عالي الخطورة',
  medium: 'متوسط الخطورة',
  low: 'منخفض الخطورة'
};

export default function DoctorRisk() {
  const [filter, setFilter] = useState('all');

  const filteredPatients = patientsWithRisk.filter(p => filter === 'all' || p.riskLevel === filter);

  return (
    <div className="p-6 fade-in">
      <div className="section-header">
        <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} />
        <h3 className="text-xl font-bold">مستوى الخطورة للمرضى</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div 
          onClick={() => setFilter('high')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filter === 'high' ? 'ring-2 ring-red-500 bg-red-50 border-red-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
        >
          <div className="text-red-500 mb-2"><AlertTriangle className="w-6 h-6" /></div>
          <div className="text-2xl font-black text-slate-900">{patientsWithRisk.filter(p => p.riskLevel === 'high').length}</div>
          <div className="text-sm text-slate-500 font-medium">حالات حرجة</div>
        </div>
        
        <div 
          onClick={() => setFilter('medium')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filter === 'medium' ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
        >
          <div className="text-amber-500 mb-2"><AlertTriangle className="w-6 h-6" /></div>
          <div className="text-2xl font-black text-slate-900">{patientsWithRisk.filter(p => p.riskLevel === 'medium').length}</div>
          <div className="text-sm text-slate-500 font-medium">تحت المراقبة</div>
        </div>

        <div 
          onClick={() => setFilter('low')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filter === 'low' ? 'ring-2 ring-green-500 bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
        >
          <div className="text-green-500 mb-2"><AlertTriangle className="w-6 h-6" /></div>
          <div className="text-2xl font-black text-slate-900">{patientsWithRisk.filter(p => p.riskLevel === 'low').length}</div>
          <div className="text-sm text-slate-500 font-medium">حالة مستقرة</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-bold text-slate-800">قائمة المرضى ({filteredPatients.length})</h4>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-sm text-blue-600 hover:underline">عرض الكل</button>
          )}
        </div>
        
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="p-4">المريض</th>
              <th className="p-4">التشخيص</th>
              <th className="p-4">مستوى الخطورة</th>
              <th className="p-4">مؤشر الحالة</th>
              <th className="p-4">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{patient.name}</td>
                <td className="p-4 text-slate-600">{patient.diagnosis || 'غير محدد'}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskColors[patient.riskLevel]}`}>
                    {riskLabels[patient.riskLevel]}
                  </span>
                </td>
                <td className="p-4">
                  {patient.trend === 'up' ? <span className="flex items-center text-red-500 text-xs gap-1"><TrendingUp className="w-4 h-4"/> تتدهور</span> :
                   patient.trend === 'down' ? <span className="flex items-center text-green-500 text-xs gap-1"><TrendingDown className="w-4 h-4"/> تتحسن</span> :
                   <span className="flex items-center text-slate-400 text-xs gap-1"><Minus className="w-4 h-4"/> مستقرة</span>}
                </td>
                <td className="p-4">
                  <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">
                    مراجعة الملف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
