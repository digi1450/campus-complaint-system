require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();

const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(express.static('public'));
app.use('/api', complaintRoutes);

// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.error('MongoDB error ❌', err));

// test route
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});