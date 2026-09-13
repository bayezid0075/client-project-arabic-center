const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const Invoice = require('../models/Invoice');
const ContactMessage = require('../models/ContactMessage');

const dashboardController = {
  async getDashboard(req, res) {
    try {
      const [studentStats, certStats, invoiceStats] = await Promise.all([
        Student.getStats(),
        Certificate.getStats(),
        Invoice.getStats()
      ]);

      const [recentStudents, recentCerts, recentInvoices, unreadMessages] = await Promise.all([
        Student.getRecent(5),
        Certificate.getRecent(5),
        Invoice.getRecent(5),
        ContactMessage.getUnreadCount()
      ]);

      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        studentStats,
        certStats,
        invoiceStats,
        recentStudents,
        recentCerts,
        recentInvoices,
        unreadMessages,
        pageName: 'dashboard'
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      req.flash('error', 'Error loading dashboard data');
      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        studentStats: { total: 0, active: 0, completed: 0 },
        certStats: { total: 0, valid: 0, revoked: 0 },
        invoiceStats: { total: 0, pending: 0, paid: 0, overdue: 0, totalRevenue: 0, totalCollected: 0 },
        recentStudents: [],
        recentCerts: [],
        recentInvoices: [],
        unreadMessages: 0,
        pageName: 'dashboard'
      });
    }
  }
};

module.exports = dashboardController;
