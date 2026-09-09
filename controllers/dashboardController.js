const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const Invoice = require('../models/Invoice');
const StudentIssue = require('../models/StudentIssue');
const ContactMessage = require('../models/ContactMessage');

const dashboardController = {
  async getDashboard(req, res) {
    try {
      const [studentStats, certStats, invoiceStats, issueStats] = await Promise.all([
        Student.getStats(),
        Certificate.getStats(),
        Invoice.getStats(),
        StudentIssue.getStats()
      ]);

      const [recentStudents, recentCerts, recentInvoices, recentIssues, unreadMessages] = await Promise.all([
        Student.getRecent(5),
        Certificate.getRecent(5),
        Invoice.getRecent(5),
        StudentIssue.getRecent(5),
        ContactMessage.getUnreadCount()
      ]);

      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        studentStats,
        certStats,
        invoiceStats,
        issueStats,
        recentStudents,
        recentCerts,
        recentInvoices,
        recentIssues,
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
        issueStats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
        recentStudents: [],
        recentCerts: [],
        recentInvoices: [],
        recentIssues: [],
        unreadMessages: 0,
        pageName: 'dashboard'
      });
    }
  }
};

module.exports = dashboardController;
