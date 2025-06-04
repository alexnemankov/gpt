const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer'); // Require Nodemailer
const app = express();
const port = process.env.PORT || 3001;

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dateTimeRangeApp';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// TimeRange Schema
const timeRangeSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const TimeRange = mongoose.model('TimeRange', timeRangeSchema);

// Middleware
app.use(express.json());

// --- Nodemailer Transporter Setup ---
let transporter;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"), // Default to 587 if not specified
    secure: (process.env.EMAIL_PORT === '465'), // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        // do not fail on invalid certs if set, for development purposes
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('Nodemailer transporter configuration error:', error.message);
      console.warn('Email functionality may be impaired. Ensure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS are set correctly.');
    } else {
      console.log('Nodemailer transporter configured successfully. Ready to send emails.');
    }
  });

} else {
  console.warn('Email service environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS) are not fully set. Email functionality will be disabled.');
  // Create a dummy transporter if config is missing, to prevent crashes if called
  transporter = {
    sendMail: () => Promise.reject(new Error('Email service is not configured. Missing environment variables.'))
  };
}
// --- End Nodemailer Setup ---

// POST endpoint for /api/time-range
app.post('/api/time-range', async (req, res) => {
  const { start, end } = req.body;
  if (!start || !end) return res.status(400).json({ error: 'Both "start" and "end" are required.' });
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime())) return res.status(400).json({ error: 'Invalid "start" date format.' });
  if (isNaN(endDate.getTime())) return res.status(400).json({ error: 'Invalid "end" date format.' });
  if (startDate >= endDate) return res.status(400).json({ error: '"start" date must be before "end" date.' });

  try {
    const newTimeRange = new TimeRange({ start: startDate, end: endDate });
    const savedTimeRange = await newTimeRange.save();
    res.status(201).json({ message: 'Time range saved.', timeRange: savedTimeRange });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save time range.', details: error.message });
  }
});

// GET endpoint for /api/time-ranges/stored
app.get('/api/time-ranges/stored', async (req, res) => {
  try {
    const storedTimeRanges = await TimeRange.find().sort({ createdAt: -1 });
    res.json({ message: 'Stored time ranges retrieved.', timeRanges: storedTimeRanges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve time ranges.', details: error.message });
  }
});

// PUT endpoint to mark a time range as inactive
app.put('/api/time-range/:id/inactive', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format.' });

  try {
    const updatedTimeRange = await TimeRange.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!updatedTimeRange) return res.status(404).json({ error: 'TimeRange not found.' });
    res.json({ message: 'Time range marked inactive.', timeRange: updatedTimeRange });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update time range.', details: error.message });
  }
});

// POST endpoint to send time range via email
app.post('/api/time-range/send-email', async (req, res) => {
  const { start, end, recipientEmail } = req.body;

  // 1. Validate presence of fields
  if (!start || !end || !recipientEmail) {
    return res.status(400).json({ error: 'Parameters "start", "end", and "recipientEmail" are required.' });
  }

  // 2. Validate dates
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime())) return res.status(400).json({ error: 'Invalid "start" date format.' });
  if (isNaN(endDate.getTime())) return res.status(400).json({ error: 'Invalid "end" date format.' });
  if (startDate >= endDate) return res.status(400).json({ error: '"start" date must be before "end" date.' });

  // 3. Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    return res.status(400).json({ error: 'Invalid "recipientEmail" format.' });
  }

  // 4. Construct email content
  const mailOptions = {
    from: process.env.EMAIL_FROM || `DateTimeRangeApp <noreply@example.com>`,
    to: recipientEmail,
    subject: 'Your Selected Time Range',
    text: `You have selected a time range from ${startDate.toUTCString()} to ${endDate.toUTCString()}.`,
    html: `<p>You have selected a time range from <strong>${startDate.toUTCString()}</strong> to <strong>${endDate.toUTCString()}</strong>.</p>`,
  };

  // 5. Send email
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Attempted to send email, but email service is not configured due to missing environment variables.');
        return res.status(503).json({ error: 'Email service is not configured on the server.' });
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    res.json({ message: `Email sent successfully to ${recipientEmail}. Message ID: ${info.messageId}` });
  } catch (error) {
    console.error('Error sending email:', error);
    // Check if the error is due to dummy transporter
    if (error.message.includes('Email service is not configured')) {
        return res.status(503).json({ error: 'Email service is not configured on the server. Please contact the administrator.' });
    }
    res.status(500).json({ error: 'Failed to send email.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
