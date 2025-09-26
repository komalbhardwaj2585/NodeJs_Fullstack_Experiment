const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory seat store
const seats = {};
const seatLocks = {}; // seatId -> { user, timestamp }
const LOCK_DURATION = 60 * 1000; // 1 minute

// Initialize seats (1 to 10)
for (let i = 1; i <= 10; i++) {
  seats[i] = { status: 'available' };
}

// Utility: Check and release expired locks
function releaseExpiredLocks() {
  const now = Date.now();
  for (const seatId in seatLocks) {
    const lock = seatLocks[seatId];
    if (now - lock.timestamp > LOCK_DURATION) {
      console.log(`Lock expired for seat ${seatId}`);
      delete seatLocks[seatId];
      if (seats[seatId].status === 'locked') {
        seats[seatId].status = 'available';
      }
    }
  }
}

// ... other route handlers above

// Root route
app.get('/', (req, res) => {
  res.send('🎟️ Ticket Booking System is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// GET /seats - list all seats
app.get('/seats', (req, res) => {
  releaseExpiredLocks();
  res.json(seats);
});

// POST /seats/:id/lock - lock a seat
app.post('/seats/:id/lock', (req, res) => {
  releaseExpiredLocks();
  const seatId = req.params.id;
  const user = req.body.user;

  if (!user) {
    return res.status(400).json({ error: 'User is required to lock a seat.' });
  }

  const seat = seats[seatId];
  if (!seat) {
    return res.status(404).json({ error: 'Seat not found.' });
  }

  if (seat.status === 'booked') {
    return res.status(400).json({ error: 'Seat is already booked.' });
  }

  if (seat.status === 'locked') {
    const currentLock = seatLocks[seatId];
    if (currentLock.user === user) {
      return res.json({ message: 'Seat already locked by you.' });
    } else {
      return res.status(403).json({ error: 'Seat is currently locked by another user.' });
    }
  }

  // Lock the seat
  seat.status = 'locked';
  seatLocks[seatId] = { user, timestamp: Date.now() };

  return res.json({ message: `Seat ${seatId} locked by ${user}` });
});

// POST /seats/:id/confirm - confirm booking
app.post('/seats/:id/confirm', (req, res) => {
  releaseExpiredLocks();
  const seatId = req.params.id;
  const user = req.body.user;

  if (!user) {
    return res.status(400).json({ error: 'User is required to confirm a seat.' });
  }

  const seat = seats[seatId];
  if (!seat) {
    return res.status(404).json({ error: 'Seat not found.' });
  }

  const lock = seatLocks[seatId];
  if (!lock || lock.user !== user) {
    return res.status(403).json({ error: 'You must lock the seat before confirming.' });
  }

  // Confirm the booking
  seat.status = 'booked';
  delete seatLocks[seatId];

  return res.json({ message: `Seat ${seatId} successfully booked by ${user}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
