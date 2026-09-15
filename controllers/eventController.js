const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');

const eventController = {
  async getAll(req, res) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const [events, total] = await Promise.all([
        Event.findAll(search, limit, offset),
        Event.countAll(search)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('admin/events/index', {
        title: 'Event Management',
        events,
        search,
        page,
        totalPages,
        total,
        pageName: 'events'
      });
    } catch (error) {
      console.error('Events list error:', error);
      req.flash('error', 'Error loading events');
      res.redirect('/admin/dashboard');
    }
  },

  async getCreate(req, res) {
    res.render('admin/events/create', {
      title: 'Create New Event',
      pageName: 'events'
    });
  },

  async postCreate(req, res) {
    try {
      const eventData = { ...req.body };
      if (req.file) {
        eventData.image = '/uploads/events/' + req.file.filename;
      }

      const result = await Event.create(eventData);
      req.flash('success', 'Event created successfully');
      res.redirect(`/admin/events/${result.id}`);
    } catch (error) {
      console.error('Event create error:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      req.flash('error', 'Error creating event');
      res.redirect('/admin/events/create');
    }
  },

  async getDetail(req, res) {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/admin/events');
      }

      res.render('admin/events/detail', {
        title: `Event: ${event.title}`,
        event,
        pageName: 'events'
      });
    } catch (error) {
      console.error('Event detail error:', error);
      req.flash('error', 'Error loading event');
      res.redirect('/admin/events');
    }
  },

  async getEdit(req, res) {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/admin/events');
      }

      res.render('admin/events/edit', {
        title: `Edit Event: ${event.title}`,
        event,
        pageName: 'events'
      });
    } catch (error) {
      console.error('Event edit form error:', error);
      req.flash('error', 'Error loading event');
      res.redirect('/admin/events');
    }
  },

  async postUpdate(req, res) {
    try {
      const existingEvent = await Event.findById(req.params.id);
      if (!existingEvent) {
        req.flash('error', 'Event not found');
        return res.redirect('/admin/events');
      }

      const eventData = { ...req.body };

      if (req.file) {
        eventData.image = '/uploads/events/' + req.file.filename;
        if (existingEvent.image && existingEvent.image.startsWith('/uploads/events/')) {
          const oldPath = path.join(__dirname, '..', existingEvent.image);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } else if (req.body.remove_image === '1') {
        eventData.image = null;
        if (existingEvent.image && existingEvent.image.startsWith('/uploads/events/')) {
          const oldPath = path.join(__dirname, '..', existingEvent.image);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } else {
        eventData.image = existingEvent.image;
      }

      await Event.update(req.params.id, eventData);
      req.flash('success', 'Event updated successfully');
      res.redirect(`/admin/events/${req.params.id}`);
    } catch (error) {
      console.error('Event update error:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      req.flash('error', 'Error updating event');
      res.redirect(`/admin/events/${req.params.id}/edit`);
    }
  },

  async postDelete(req, res) {
    try {
      const event = await Event.delete(req.params.id);
      if (event && event.image && event.image.startsWith('/uploads/events/')) {
        const imgPath = path.join(__dirname, '..', event.image);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }
      req.flash('success', 'Event deleted successfully');
      res.redirect('/admin/events');
    } catch (error) {
      console.error('Event delete error:', error);
      req.flash('error', 'Error deleting event');
      res.redirect('/admin/events');
    }
  },

  // Public methods
  async getPublicList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 9;
      const offset = (page - 1) * limit;

      const [events, total] = await Promise.all([
        Event.findActive(limit, offset),
        Event.findActiveCount()
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('public/events', {
        title: 'Events - Arabic Technical Training Center',
        events,
        page,
        totalPages,
        total,
        page: 'events'
      });
    } catch (error) {
      console.error('Public events list error:', error);
      res.render('public/events', {
        title: 'Events - Arabic Technical Training Center',
        events: [],
        page: 1,
        totalPages: 0,
        total: 0,
        page: 'events'
      });
    }
  },

  async getPublicDetail(req, res) {
    try {
      const event = await Event.findBySlug(req.params.slug);
      if (!event || !event.is_active) {
        req.flash('error', 'Event not found');
        return res.redirect('/events');
      }

      res.render('public/event-detail', {
        title: `${event.title} - Arabic Technical Training Center`,
        event,
        page: 'events'
      });
    } catch (error) {
      console.error('Public event detail error:', error);
      req.flash('error', 'Error loading event');
      res.redirect('/events');
    }
  }
};

module.exports = eventController;
