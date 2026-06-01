const fs = require('fs');
const path = require('path');

const file = fs.readFileSync('src/pages/admin/AdminDashboard.bak.jsx', 'utf8');
const lines = file.split('\n');

const IMPORTS = `import { useState } from 'react';
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
`;

function getLines(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

const docs = IMPORTS + '\n' + getLines(31, 223) + '\n\nexport default DoctorsManagement;';
fs.writeFileSync('src/pages/admin/components/DoctorsManagement.jsx', docs);

const pats = IMPORTS + '\n' + getLines(225, 377) + '\n\nexport default PatientsManagement;';
fs.writeFileSync('src/pages/admin/components/PatientsManagement.jsx', pats);

const depts = IMPORTS + '\n' + getLines(379, 442) + '\n\nexport default DepartmentsManagement;';
fs.writeFileSync('src/pages/admin/components/DepartmentsManagement.jsx', depts);

const appts = IMPORTS + '\n' + getLines(444, 551) + '\n\nexport default AppointmentsManagement;';
fs.writeFileSync('src/pages/admin/components/AppointmentsManagement.jsx', appts);

const beds = IMPORTS + '\n' + getLines(553, 676) + '\n\nexport default BedsManagement;';
fs.writeFileSync('src/pages/admin/components/BedsManagement.jsx', beds);

const blog = IMPORTS + '\n' + getLines(678, 767) + '\n\nexport default BlogManagement;';
fs.writeFileSync('src/pages/admin/components/BlogManagement.jsx', blog);

const home = IMPORTS + '\n' + getLines(769, 807) + '\n\nexport default AdminHome;';
fs.writeFileSync('src/pages/admin/components/AdminHome.jsx', home);

const mainImports = getLines(1, 11) + '\nimport AdminHome from "./components/AdminHome";\nimport DoctorsManagement from "./components/DoctorsManagement";\nimport PatientsManagement from "./components/PatientsManagement";\nimport DepartmentsManagement from "./components/DepartmentsManagement";\nimport AppointmentsManagement from "./components/AppointmentsManagement";\nimport BedsManagement from "./components/BedsManagement";\nimport BlogManagement from "./components/BlogManagement";\n';
const sidebarLinks = getLines(19, 29);
const adminDashboard = mainImports + '\n' + sidebarLinks + '\n\n' + getLines(809, 858);
fs.writeFileSync('src/pages/admin/AdminDashboard.jsx', adminDashboard);

console.log('Done splitting');
