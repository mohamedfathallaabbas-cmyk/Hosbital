import sys

path = 'src/pages/RoleSelect.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('  return (')
if idx == -1:
    sys.exit(1)

top = content[:idx]

new_return = """  return (
    <div className="min-h-screen relative font-cairo flex items-center justify-center overflow-hidden bg-slate-900" dir="rtl">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&fit=crop" alt="Hospital Background" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60 backdrop-blur-[2px]" />
      </div>
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-teal-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 w-full max-w-6xl px-4 py-12 mx-auto flex flex-col min-h-screen">
        <div className="text-center mb-12 pt-8">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl" style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
            <HeartPulse className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-4">نظام مستشفى الشفاء الطبي</motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl font-medium">اختر بوابتك للدخول إلى النظام</motion.p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'role' ? (
            <motion.div key="roles-grid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 w-full">
                {roles.map((role, i) => (
                  <motion.div key={role.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}
                    onClick={() => handleRoleSelect(role)} className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl group-hover:bg-white/10 transition-colors duration-300" />
                    <div className="relative h-full flex flex-col items-center text-center p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-white/20">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: role.gradient }} />
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: role.gradient }}>
                        <role.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{role.label}</h3>
                      <p className="text-sm text-slate-400 mb-2">{role.sublabel}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="login-form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
              className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 opacity-80" style={{ background: selectedRole?.gradient }} />
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: selectedRole?.gradient }}>
                    {selectedRole && <selectedRole.icon className="w-7 h-7 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedRole?.label}</h2>
                    <p className="text-slate-400 text-sm">تسجيل الدخول للنظام</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-cairo"
                        placeholder="أدخل بريدك الإلكتروني" required dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-2">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 pr-12 pl-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-cairo"
                        placeholder="أدخل كلمة المرور" required dir="ltr" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                    style={{ background: selectedRole?.gradient || 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
                    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" />دخول النظام</>}
                  </button>
                </form>

                {selectedRole?.id === 'patient' && (
                  <div className="mt-5 text-center">
                    <button type="button" onClick={openForgot} className="text-blue-400 text-sm hover:text-blue-300 font-medium flex items-center gap-1 mx-auto">
                      <KeyRound className="w-4 h-4" />نسيت كلمة المرور؟
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setStep('role')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mt-8 transition-colors bg-white/5 px-6 py-2.5 rounded-full border border-white/10">
                <ArrowRight className="w-4 h-4 rotate-180" />العودة لاختيار الدور
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} مستشفى الشفاء. جميع الحقوق محفوظة.</p>
        </div>
      </div>
      
      <AnimatePresence>
        {forgotStep !== '' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={closeForgot}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 pb-4 border-b border-slate-700" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <KeyRound className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-lg">استعادة كلمة المرور</h2>
                      <p className="text-blue-200 text-xs">حسابات المرضى فقط</p>
                    </div>
                  </div>
                  <button onClick={closeForgot} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">×</button>
                </div>
              </div>

              <div className="p-6 space-y-4" dir="rtl">
                {fpError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />{fpError}
                  </div>
                )}

                {forgotStep === 'email' && (
                  <>
                    <p className="text-slate-400 text-sm">أدخل البريد الإلكتروني المرتبط بحسابك كمريض.</p>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                      <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} dir="ltr"
                        className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <button onClick={handleFpStep1} disabled={fpLoading || !fpEmail.trim()}
                      className="w-full py-3 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      {fpLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'التحقق من الحساب'}
                    </button>
                  </>
                )}

                {forgotStep === 'reset' && (
                  <>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                      ✅ تم التحقق من البريد الإلكتروني <strong>{fpEmail}</strong>
                    </div>
                    {fpHasNid && (
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1.5">الرقم القومي</label>
                        <input type="text" value={fpNationalId} onChange={e => setFpNationalId(e.target.value)} dir="ltr"
                          className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-blue-500" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
                      <input type={fpShowPass ? 'text' : 'password'} value={fpNewPass} onChange={e => setFpNewPass(e.target.value)} dir="ltr"
                        className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
                      <input type="password" value={fpConfirm} onChange={e => setFpConfirm(e.target.value)} dir="ltr"
                        className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <button onClick={handleFpReset} disabled={fpLoading}
                      className="w-full py-3 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                      {fpLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'تغيير كلمة المرور'}
                    </button>
                  </>
                )}

                {forgotStep === 'done' && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-9 h-9 text-green-500" />
                    </div>
                    <h3 className="font-black text-white text-lg mb-2">تم التغيير بنجاح!</h3>
                    <button onClick={() => { closeForgot(); setPassword(''); }}
                      className="w-full py-3 rounded-xl text-white font-bold bg-green-600 hover:bg-green-700">
                      العودة لتسجيل الدخول
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(top + new_return)
