import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح: التوكن مفقود أو غير صالح' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'التوكن منتهي الصلاحية أو غير صحيح' });
  }
}

// middleware للتحقق من صلاحية دور محدد
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'غير مصرح' });
    const userRole = req.user?.role?.toUpperCase() ?? 'GUEST';
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: `هذه العملية تتطلب صلاحيات: ${roles.join(', ')}` });
    }
    next();
  };
}

// middleware لضمان أن المريض لا يصل إلا لبياناته الخاصة
export function enforcePatientOwnership(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح' });
  
  if (req.user.role === 'PATIENT') {
    // Override params or body to ensure patient only requests their own data
    // Assuming token payload has patientId or we get it via user id
    if (!req.user.patientId) {
      return res.status(403).json({ error: 'لا يوجد ملف مريض مرتبط بهذا الحساب' });
    }
    
    // Check patientId from params or body
    let targetId = req.params.patientId || req.body.patientId || req.query.patientId;
    
    // If the route is directly /api/patients/:id, then id is the patientId
    if (req.baseUrl.includes('/patients') && req.params.id) {
      targetId = targetId || req.params.id;
    }
    
    // If patient is trying to access another patient's ID
    if (targetId && String(targetId) !== String(req.user.patientId)) {
      return res.status(403).json({ error: 'غير مصرح لك بالوصول إلى بيانات مريض آخر' });
    }
    
    // Force patientId in body/query to be their own
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      req.body.patientId = req.user.patientId;
    }
    req.query.patientId = req.user.patientId;
    
    // Also attach to locals just in case
    res.locals.patientId = req.user.patientId;
  }
  
  next();
}
