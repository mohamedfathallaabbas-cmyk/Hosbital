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
