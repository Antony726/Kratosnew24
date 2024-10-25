const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://alexantony726:A48woNKMaDMGJU60@kira.24umo.mongodb.net/?retryWrites=true&w=majority&appName=Kira', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a Schema and Model
const participantSchema = new mongoose.Schema({
    emailID: String,
    eventName: String,
    teamName: String,
    teamLeader: String,
    teamMembers: [String],
    status: String
});

const Participant = mongoose.model('Participant', participantSchema);

// Endpoint to add a new participant
app.post('/add-participant', async (req, res) => {
    try {
        const { emailID, eventName, teamName, teamLeader, teamMembers, status } = req.body;

        // Check if the participant already exists
        const existingParticipant = await Participant.findOne({ emailID });
        if (existingParticipant) {
            return res.status(400).json({ message: 'This QR code has already been used!' });
        }

        // Create a new participant
        const newParticipant = new Participant({ emailID, eventName, teamName, teamLeader, teamMembers, status });
        await newParticipant.save();

        res.status(200).json({ message: 'Participant added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding participant', error });
    }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
