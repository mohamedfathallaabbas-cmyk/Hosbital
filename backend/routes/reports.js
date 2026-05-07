import express from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'MANAGER'));

// GET /occupancy - نسبة إشغال الأسرة
router.get('/occupancy', async (req, res) => {
  try {
    const totalBeds = await prisma.bed.count();
    const occupiedBeds = await prisma.bed.count({ where: { isOccupied: true } });
    
    const wards = await prisma.ward.findMany({
      include: {
        rooms: {
          include: {
            _count: { select: { beds: true } },
            beds: { where: { isOccupied: true } }
          }
        }
      }
    });

    const wardStats = wards.map(ward => {
      const total = ward.rooms.reduce((sum, room) => sum + room._count.beds, 0);
      const occupied = ward.rooms.reduce((sum, room) => sum + room.beds.length, 0);
      return {
        wardName: ward.name,
        totalBeds: total,
        occupiedBeds: occupied,
        occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(2) : 0
      };
    });

    res.json({
      totalBeds,
      occupiedBeds,
      occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0,
      wardStats
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب إحصائيات الإشغال' });
  }
});

// GET /doctor-performance - أداء كل طبيب
router.get('/doctor-performance', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { name: true } },
        department: { select: { name: true } },
        _count: { select: { appointments: { where: { status: 'COMPLETED' } }, admissions: true } }
      }
    });

    const performance = doctors.map(doc => ({
      doctorId: doc.id,
      name: doc.user.name,
      department: doc.department.name,
      completedAppointments: doc._count.appointments,
      totalAdmissions: doc._count.admissions
    }));

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب أداء الأطباء' });
  }
});

// GET /monthly-stats - إحصائيات شهرية
router.get('/monthly-stats', async (req, res) => {
  try {
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const apptsCount = await prisma.appointment.count({
        where: { date: { gte: startOfMonth, lte: endOfMonth } }
      });
      
      const revenueAgg = await prisma.invoice.aggregate({
        where: { status: 'PAID', createdAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { totalAmount: true }
      });

      monthlyData.push({
        month: date.toLocaleString('ar-EG', { month: 'long' }),
        appointments: apptsCount,
        revenue: revenueAgg._sum.totalAmount || 0
      });
    }
    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في الإحصائيات الشهرية' });
  }
});

// GET /department-load - عبء كل قسم
router.get('/department-load', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        doctors: {
          include: { _count: { select: { appointments: { where: { status: 'WAITING' } } } } }
        }
      }
    });

    const load = departments.map(dept => {
      const totalWaiting = dept.doctors.reduce((sum, doc) => sum + doc._count.appointments, 0);
      return {
        department: dept.name,
        doctorsCount: dept.doctors.length,
        waitingPatients: totalWaiting
      };
    });

    res.json(load);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب عبء الأقسام' });
  }
});

// GET /staff-summary - ملخص الموظفين بالفئات
router.get('/staff-summary', async (req, res) => {
  try {
    const categories = ['MEDICAL', 'ADMIN_STAFF', 'SECURITY', 'CLEANING', 'MAINTENANCE'];
    const summary = [];
    
    for (const cat of categories) {
      const count = await prisma.staff.count({ where: { category: cat } });
      const salaryAgg = await prisma.staff.aggregate({
        where: { category: cat },
        _sum: { salary: true, allowances: true }
      });
      
      summary.push({
        category: cat,
        count,
        totalSalaries: (salaryAgg._sum.salary || 0) + (salaryAgg._sum.allowances || 0)
      });
    }
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في ملخص الموظفين' });
  }
});

export default router;
