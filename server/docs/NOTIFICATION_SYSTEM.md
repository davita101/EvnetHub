# Real-Time Notification System Implementation Guide

This guide covers implementing a real-time notification system using Socket.io for the Conevent platform.

## Overview

### Notification Scenarios
1. **Event Created**: When a university uploads a new event, students interested in that university receive a notification
2. **Application Submitted**: When a student applies to an event, the university that created the event receives a notification
3. **Application Status Changed**: When a university accepts/rejects an application, the student gets notified

---

## Step 1: Create Notification Model

Create `src/models/notification.model.js`:

```javascript
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType'
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['Student', 'University']
  },
  type: {
    type: String,
    required: true,
    enum: ['new_event', 'new_application', 'application_accepted', 'application_rejected']
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University'
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, recipientType: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

---

## Step 2: Add Interested Universities to Student Model

Update `src/models/student.model.js` - add this field to the schema:

```javascript
interestedUniversities: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'University'
}]
```

---

## Step 3: Create Socket.io Configuration

Create `src/config/socket.config.js`:

```javascript
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./index.config');

// Store connected users: { oderId: socketId }
const connectedUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.id;
      socket.userType = decoded.role; // 'student' or 'university'
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userType})`);

    // Store user connection
    connectedUsers.set(socket.userId, socket.id);

    // Join user-specific room for targeted notifications
    socket.join(`user:${socket.userId}`);

    // Join role-based room
    socket.join(`role:${socket.userType}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });

    // Mark notification as read
    socket.on('notification:read', async (notificationId) => {
      try {
        const Notification = require('../models/notification.model');
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    // Mark all notifications as read
    socket.on('notifications:readAll', async () => {
      try {
        const Notification = require('../models/notification.model');
        await Notification.updateMany(
          { recipientId: socket.userId, isRead: false },
          { isRead: true }
        );
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    });
  });

  return io;
};

module.exports = { initializeSocket, connectedUsers };
```

---

## Step 4: Create Notification Service

Create `src/services/notification.service.js`:

```javascript
const Notification = require('../models/notification.model');
const Student = require('../models/student.model');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(recipientId, recipientType, notificationData) {
    const notification = await Notification.create({
      recipientId,
      recipientType,
      ...notificationData
    });

    // Emit to user's room (they'll receive if online)
    this.io.to(`user:${recipientId}`).emit('notification:new', notification);

    return notification;
  }

  /**
   * Send notification to multiple users
   */
  async sendToMultipleUsers(recipientIds, recipientType, notificationData) {
    const notifications = await Promise.all(
      recipientIds.map(recipientId =>
        Notification.create({
          recipientId,
          recipientType,
          ...notificationData
        })
      )
    );

    // Emit to each user's room
    recipientIds.forEach((recipientId, index) => {
      this.io.to(`user:${recipientId}`).emit('notification:new', notifications[index]);
    });

    return notifications;
  }

  /**
   * Notify students interested in a university about a new event
   */
  async notifyNewEvent(event, university) {
    // Find all students interested in this university
    const interestedStudents = await Student.find({
      interestedUniversities: university._id
    }).select('_id');

    if (interestedStudents.length === 0) return [];

    const studentIds = interestedStudents.map(s => s._id);

    return this.sendToMultipleUsers(studentIds, 'Student', {
      type: 'new_event',
      title: 'New Event Available',
      message: `${university.name} has posted a new event: "${event.title}"`,
      data: {
        eventId: event._id,
        universityId: university._id
      }
    });
  }

  /**
   * Notify university about a new application
   */
  async notifyNewApplication(application, student, event) {
    return this.sendToUser(event.universityId, 'University', {
      type: 'new_application',
      title: 'New Application Received',
      message: `${student.name} has applied to your event: "${event.title}"`,
      data: {
        applicationId: application._id,
        eventId: event._id,
        studentId: student._id
      }
    });
  }

  /**
   * Notify student about application status change
   */
  async notifyApplicationStatus(application, event, status) {
    const statusMessages = {
      accepted: 'Congratulations! Your application has been accepted',
      rejected: 'Your application has been reviewed'
    };

    return this.sendToUser(application.studentId, 'Student', {
      type: `application_${status}`,
      title: status === 'accepted' ? 'Application Accepted' : 'Application Update',
      message: `${statusMessages[status]} for "${event.title}"`,
      data: {
        applicationId: application._id,
        eventId: event._id
      }
    });
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;

    const query = { recipientId: userId };
    if (unreadOnly) query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('data.eventId', 'title date')
      .populate('data.universityId', 'name')
      .populate('data.studentId', 'name');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }
}

module.exports = NotificationService;
```

---

## Step 5: Update Server Configuration

Update `src/server.js`:

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');

// Import configurations
const config = require('./config/index.config');
const connectDB = require('./config/database.config');
const { initializeSocket } = require('./config/socket.config');
const NotificationService = require('./services/notification.service');
const routes = require('./routes/index.routes');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Initialize Notification Service and attach to app
const notificationService = new NotificationService(io);
app.set('notificationService', notificationService);

// Database Connection
connectDB();

// ... rest of middleware setup ...

// IMPORTANT: Change app.listen to server.listen
const PORT = config.port;

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Server running in ${config.env.toUpperCase()} mode`);
  console.log(`Port: ${PORT}`);
  console.log(`WebSocket: Enabled`);
  console.log('='.repeat(50));
});

module.exports = { app, io };
```

---

## Step 6: Create Notification Routes

Create `src/routes/notification.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');
const Notification = require('../models/notification.model');

// Get user's notifications
router.get('/', protect, catchAsync(async (req, res) => {
  const notificationService = req.app.get('notificationService');
  const { page, limit, unreadOnly } = req.query;

  const result = await notificationService.getUserNotifications(req.user._id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    unreadOnly: unreadOnly === 'true'
  });

  res.json({
    status: 'success',
    data: result
  });
}));

// Mark single notification as read
router.patch('/:id/read', protect, catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user._id },
    { isRead: true },
    { new: true }
  );

  res.json({
    status: 'success',
    data: { notification }
  });
}));

// Mark all notifications as read
router.patch('/read-all', protect, catchAsync(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({
    status: 'success',
    message: 'All notifications marked as read'
  });
}));

// Get unread count
router.get('/unread-count', protect, catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    recipientId: req.user._id,
    isRead: false
  });

  res.json({
    status: 'success',
    data: { unreadCount: count }
  });
}));

// Delete a notification
router.delete('/:id', protect, catchAsync(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    recipientId: req.user._id
  });

  res.json({
    status: 'success',
    message: 'Notification deleted'
  });
}));

module.exports = router;
```

Add to `src/routes/index.routes.js`:

```javascript
const notificationRoutes = require('./notification.routes');
router.use('/notifications', notificationRoutes);
```

---

## Step 7: Integrate with Event Controller

Update `src/controllers/event.controller.js` - add notification when creating event:

```javascript
// In your createEvent function, after successfully creating the event:

exports.createEvent = catchAsync(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    universityId: req.user._id
  });

  // Get university details for notification
  const University = require('../models/university.model');
  const university = await University.findById(req.user._id);

  // Send notifications to interested students
  const notificationService = req.app.get('notificationService');
  await notificationService.notifyNewEvent(event, university);

  res.status(201).json({
    status: 'success',
    data: { event }
  });
});
```

---

## Step 8: Integrate with Application Controller

Update `src/controllers/application.controller.js`:

```javascript
// When student creates application:
exports.createApplication = catchAsync(async (req, res) => {
  const { eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const application = await Application.create({
    eventId,
    studentId: req.user._id
  });

  // Notify university about new application
  const notificationService = req.app.get('notificationService');
  await notificationService.notifyNewApplication(application, req.user, event);

  res.status(201).json({
    status: 'success',
    data: { application }
  });
});

// When university updates application status:
exports.updateApplicationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const application = await Application.findById(id);
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const event = await Event.findById(application.eventId);

  application.status = status;
  await application.save();

  // Notify student about status change
  if (status === 'accepted' || status === 'rejected') {
    const notificationService = req.app.get('notificationService');
    await notificationService.notifyApplicationStatus(application, event, status);
  }

  res.json({
    status: 'success',
    data: { application }
  });
});
```

---

## Step 9: Add Interest/Uninterest Endpoints for Students

Create routes in `src/routes/student.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const Student = require('../models/student.model');
const catchAsync = require('../utils/catchAsync');

// Add university to interested list
router.post('/interests/:universityId', protect, restrictTo('student'), catchAsync(async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { interestedUniversities: req.params.universityId } },
    { new: true }
  ).populate('interestedUniversities', 'name logo');

  res.json({
    status: 'success',
    data: { interestedUniversities: student.interestedUniversities }
  });
}));

// Remove university from interested list
router.delete('/interests/:universityId', protect, restrictTo('student'), catchAsync(async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.user._id,
    { $pull: { interestedUniversities: req.params.universityId } },
    { new: true }
  ).populate('interestedUniversities', 'name logo');

  res.json({
    status: 'success',
    data: { interestedUniversities: student.interestedUniversities }
  });
}));

// Get interested universities
router.get('/interests', protect, restrictTo('student'), catchAsync(async (req, res) => {
  const student = await Student.findById(req.user._id)
    .populate('interestedUniversities', 'name logo description');

  res.json({
    status: 'success',
    data: { interestedUniversities: student.interestedUniversities }
  });
}));

module.exports = router;
```

---

## Step 10: Frontend Integration (React Example)

### Socket Hook

```javascript
// hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socketInstance = io(process.env.REACT_APP_API_URL, {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return { socket, isConnected };
};
```

### Notification Hook

```javascript
// hooks/useNotifications.js
import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';

export const useNotifications = (token) => {
  const { socket, isConnected } = useSocket(token);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    socket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message
        });
      }
    });

    return () => {
      socket.off('notification:new');
    };
  }, [socket]);

  const markAsRead = useCallback((notificationId) => {
    if (socket) {
      socket.emit('notification:read', notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [socket]);

  const markAllAsRead = useCallback(() => {
    if (socket) {
      socket.emit('notifications:readAll');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  }, [socket]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  };
};
```

### Notification Component

```jsx
// components/NotificationBell.jsx
import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationBell = ({ token }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(token);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notification-bell">
      <button onClick={() => setIsOpen(!isOpen)}>
        <BellIcon />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="header">
            <h3>Notifications</h3>
            <button onClick={markAllAsRead}>Mark all as read</button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user's notifications (paginated) |
| GET | `/api/notifications/unread-count` | Get unread notification count |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/notifications/:id` | Delete a notification |
| POST | `/api/students/interests/:universityId` | Follow a university |
| DELETE | `/api/students/interests/:universityId` | Unfollow a university |
| GET | `/api/students/interests` | Get followed universities |

---

## Socket Events

### Client -> Server
| Event | Payload | Description |
|-------|---------|-------------|
| `notification:read` | `notificationId` | Mark notification as read |
| `notifications:readAll` | - | Mark all notifications as read |

### Server -> Client
| Event | Payload | Description |
|-------|---------|-------------|
| `notification:new` | `Notification object` | New notification received |

---

## File Structure

```
src/
├── config/
│   └── socket.config.js          # Socket.io configuration
├── models/
│   └── notification.model.js     # Notification schema
├── services/
│   └── notification.service.js   # Notification business logic
├── routes/
│   ├── notification.routes.js    # Notification API routes
│   └── student.routes.js         # Student interest routes
└── controllers/
    ├── event.controller.js       # (updated)
    └── application.controller.js # (updated)
```

---

## Testing

Test the notification system:

1. **Connect to Socket**:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

2. **Listen for notifications**:
```javascript
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});
```

3. **Create an event as university** -> Students interested in that university should receive notification

4. **Apply to event as student** -> University should receive notification
