const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// Path to the JSON file
const jsonFilePath = path.join(__dirname, 'db.json');

// Read and parse the JSON file
const readJsonFile = () => {
  const data = fs.readFileSync(jsonFilePath, 'utf8');
  return JSON.parse(data);
};

// Route to get a quiz by ID
app.get((req, res) => {
  const quizId = parseInt(req.params.id, 10);
  const { results } = readJsonFile(); // Read and parse the JSON file

  const quiz = results.find(q => q.id === quizId);

  if (quiz) {
    res.json(quiz);
  } else {
    res.status(404).json({ message: 'Quiz not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
