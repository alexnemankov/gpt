import React, { useState, useEffect, useCallback } from 'react';
import './DateTimeRangePicker.css';

const DateTimeRangePicker = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [allTimeRanges, setAllTimeRanges] = useState([]);
  const [message, setMessage] = useState({ text: '', type: 'info' }); // type: 'info', 'success', 'error'

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Format: YYYY-MM-DDTHH:mm
    return d.toISOString().substring(0, 16);
  };

  const fetchStoredTimeRanges = useCallback(async () => {
    setMessage({ text: 'Loading existing time ranges...', type: 'info' });
    try {
      const response = await fetch('/api/time-ranges/stored');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllTimeRanges(data.timeRanges || []);
      setMessage({ text: 'Time ranges loaded.', type: 'info' });
    } catch (error) {
      console.error("Failed to fetch time ranges:", error);
      setMessage({ text: `Error fetching time ranges: ${error.message}`, type: 'error' });
      setAllTimeRanges([]); // Clear ranges on error
    }
  }, []);

  useEffect(() => {
    fetchStoredTimeRanges();
  }, [fetchStoredTimeRanges]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ text: 'Processing your request...', type: 'info' });

    if (!startDate || !endDate || !recipientEmail) {
      setMessage({ text: 'Please fill in all fields: Start Date, End Date, and Email.', type: 'error' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setMessage({ text: 'Invalid date format. Please check your dates.', type: 'error' });
      return;
    }

    if (start >= end) {
      setMessage({ text: 'Start date must be before end date.', type: 'error' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setMessage({ text: 'Invalid email format.', type: 'error' });
      return;
    }

    try {
      // Step 1: POST to /api/time-range to save the new time range
      setMessage({ text: 'Saving time range...', type: 'info' });
      const postRangeResponse = await fetch('/api/time-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: start.toISOString(), end: end.toISOString() }),
      });

      if (!postRangeResponse.ok) {
        const errorData = await postRangeResponse.json();
        throw new Error(errorData.error || `Failed to save time range. Status: ${postRangeResponse.status}`);
      }
      const newRangeData = await postRangeResponse.json();
      const newRangeId = newRangeData.timeRange?._id;

      if (!newRangeId) {
        throw new Error('Failed to get ID of the newly created time range.');
      }
      setMessage({ text: 'Time range saved. Sending email...', type: 'info' });

      // Step 2: POST to /api/time-range/send-email
      const sendEmailResponse = await fetch('/api/time-range/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: start.toISOString(), end: end.toISOString(), recipientEmail }),
      });

      if (!sendEmailResponse.ok) {
        const errorData = await sendEmailResponse.json();
        // Don't stop the whole process for email failure, but log it.
        setMessage({ text: `Time range saved, but failed to send email: ${errorData.error || sendEmailResponse.statusText}. Proceeding to mark as inactive.`, type: 'error' });
      } else {
        setMessage({ text: 'Email sent. Marking time range as inactive...', type: 'info' });
      }

      // Step 3: PUT to /api/time-range/:id/inactive
      const markInactiveResponse = await fetch(`/api/time-range/${newRangeId}/inactive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!markInactiveResponse.ok) {
        const errorData = await markInactiveResponse.json();
        throw new Error(errorData.error || `Failed to mark time range as inactive. Status: ${markInactiveResponse.status}`);
      }

      setMessage({ text: 'Successfully booked and processed time range! Email sent (if configured) and slot marked inactive.', type: 'success' });

      // Clear form
      setStartDate('');
      setEndDate('');
      setRecipientEmail('');

      // Step 4: Re-fetch all time ranges
      fetchStoredTimeRanges();

    } catch (error) {
      console.error("Submission process failed:", error);
      setMessage({ text: `Error during submission: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div className="date-time-range-picker">
      <h2>Select Date and Time Range</h2>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="start-date">Start Date & Time:</label>
          <input
            type="datetime-local"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="end-date">End Date & Time:</label>
          <input
            type="datetime-local"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="recipient-email">Recipient Email:</label>
          <input
            type="email"
            id="recipient-email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <button type="submit" disabled={message.text === 'Processing your request...' || message.text === 'Saving time range...'}>
          Submit Time Range
        </button>
      </form>

      <div className="stored-time-ranges">
        <h3>Existing Booked Time Slots (Inactive):</h3>
        {allTimeRanges.length > 0 ? (
          <ul>
            {allTimeRanges.filter(range => !range.isActive).map((range) => (
              <li key={range._id}>
                From: {new Date(range.start).toLocaleString()} <br />
                To: {new Date(range.end).toLocaleString()} <br />
                Status: {range.isActive ? 'Active' : 'Inactive (Booked)'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No booked time slots found or still loading.</p>
        )}
      </div>
    </div>
  );
};

export default DateTimeRangePicker;
