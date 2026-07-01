import React from 'react';
import { createPortal } from 'react-dom';
import { HeartPulse, User, Calendar, MapPin, Phone } from 'lucide-react';

export default function PrintTemplate({ type, data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto no-print-bg print-template-container" dir="rtl">
      <div className="max-w-[800px] mx-auto p-10 bg-white print:p-0">
        
        {/* Buttons - Hidden on Print */}
        <div className="flex justify-center items-center gap-3 mb-8 no-print">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all font-cairo">
            إغلاق المعاينة
          </button>
          <button onClick={handlePrint} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-cairo">
            بدء الطباعة (Ctrl + P)
          </button>
        </div>

        {/* Report Content */}
        <div className="print-report border-[3px] border-double border-slate-200 p-8 min-h-[1000px] flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                <HeartPulse className="w-10 h-10" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black text-blue-600">مستشفى الشفاء التخصصي</h1>
                <p className="text-slate-500 font-bold">رعاية طبية نثق بها</p>
              </div>
            </div>
            <div className="text-left text-xs text-slate-400 space-y-1 font-bold">
              <div className="flex items-center justify-end gap-2"><MapPin className="w-3 h-3" /> القاهرة، مدينة نصر، شارع الطيران</div>
              <div className="flex items-center justify-end gap-2"><Phone className="w-3 h-3" /> +20 123 456 7890</div>
              <div className="flex items-center justify-end gap-2"><Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>

          {/* Patient Info Bar */}
          <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold text-sm">المريض:</span>
              <span className="text-slate-800 font-black">{data.patientName || data.patient?.user?.name}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-slate-400 font-bold text-sm">التاريخ:</span>
              <span className="text-slate-800 font-black">{new Date().toLocaleDateString('ar-EG')}</span>
            </div>
            {data.id && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-sm">الرقم المرجعي:</span>
                <span className="text-slate-800 font-mono font-bold">#{data.id}</span>
              </div>
            )}
          </div>

          {/* Content Based on Type */}
          <div className="flex-1">
            {type === 'prescription' && (
              <div className="prescription-body">
                <div className="flex items-center gap-2 mb-6 border-b border-dashed pb-2">
                  <span className="text-3xl font-black text-blue-600">Rx</span>
                  <div className="h-[2px] flex-1 bg-slate-100" />
                </div>
                <div className="space-y-6">
                  {data.items?.map((item, i) => (
                    <div key={i} className="border-b border-slate-50 pb-4">
                      <h4 className="text-xl font-black text-slate-800 mb-2">{i+1}. {item.name || item.medicine?.name}</h4>
                      <p className="text-slate-600 mr-6 font-bold">{item.dosage} — {item.frequency} — لمدة {item.duration}</p>
                    </div>
                  ))}
                  {(!data.items || data.items.length === 0) && (
                    <p className="text-slate-700 text-lg leading-relaxed">{data.diagnosis}</p>
                  )}
                </div>
                {data.notes && (
                  <div className="mt-10 p-4 border border-slate-100 rounded-xl">
                    <p className="text-sm font-bold text-slate-400 mb-1">ملاحظات إضافية:</p>
                    <p className="text-slate-700 italic">{data.notes}</p>
                  </div>
                )}
              </div>
            )}

            {type === 'invoice' && (
              <div className="invoice-body">
                <h3 className="text-xl font-black text-center mb-6 bg-slate-800 text-white py-2 rounded-lg">فاتورة خدمات طبية</h3>
                <table className="w-full text-right mb-8">
                  <thead className="border-b-2 border-slate-800">
                    <tr>
                      <th className="py-3 font-black text-slate-600">الخدمة</th>
                      <th className="py-3 font-black text-slate-600 text-center">الكمية</th>
                      <th className="py-3 font-black text-slate-600 text-left">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="py-4 font-bold text-slate-800">{item.description}</td>
                        <td className="py-4 text-center font-bold">{item.quantity || 1}</td>
                        <td className="py-4 text-left font-black">{item.amount} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-800">
                    <tr>
                      <td colSpan="2" className="py-4 font-black text-lg text-slate-800">الإجمالي النهائي</td>
                      <td className="py-4 text-left font-black text-2xl text-blue-600">{data.totalAmount} ج.م</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {type === 'lab' && (
              <div className="lab-body">
                <h3 className="text-xl font-black text-center mb-6 bg-blue-50 text-blue-800 py-2 rounded-lg">تقرير مخبري / أشعة</h3>
                <div className="mb-6">
                  <span className="text-slate-400 font-bold">نوع الفحص:</span>
                  <span className="mr-2 text-lg font-black text-slate-800">{data.testName || data.test?.name}</span>
                </div>
                <div className="p-6 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                  <p className="text-slate-400 font-bold mb-3">النتيجة والتقرير:</p>
                  <div className="text-slate-800 leading-loose whitespace-pre-wrap font-bold">
                    {data.result}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
            <div className="text-xs text-slate-400 max-w-xs font-bold leading-relaxed">
              هذا المستند معتمد إلكترونياً من قبل مستشفى الشفاء التخصصي. يرجى الاحتفاظ به كجزء من سجلك الطبي.
            </div>
            <div className="text-center w-48">
              <div className="h-20 flex items-center justify-center opacity-30 italic text-slate-300">ختم المستشفى</div>
              <div className="border-t border-slate-300 pt-2 font-black text-slate-800">التوقيع / الختم</div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide all page content by default during print */
          body * {
            visibility: hidden !important;
          }
          /* Show only the print template container and its descendants */
          .print-template-container,
          .print-template-container * {
            visibility: visible !important;
          }
          .print-template-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          /* Hide the preview buttons completely */
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          .print-report {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
