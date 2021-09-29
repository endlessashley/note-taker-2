const express = require('express');
const fs = require('fs');
const util = require('util');
const uuid = require('./helpers/uuid')
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for Notes
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET route for retrieving every note
app.get('/api/notes', (req, res) =>
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
);

// POST route for submitting notes 
app.post('/api/notes', (req, res) => {
    // Destructure request 
    const { title, text, id } = req.body;

    // If destructuring was success
    if (title && text) {
        // Variable for new note
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.json(response);

        // Append new note to db.json
        readAndAppend(newNote, './db/db.json');

        // If title and text weren't entered
    } else {
        res.json('Error in posting note');
    }
});


// DELETE route to delete note at given id
app.delete('/api/notes/:id', (req, res) => {
    readAndDelete(req.params.id, './db/db.json');
    res.json(req.params.id);
});

app.listen(process.env.PORT || 3001, () =>
    console.log(`App listening at some port! 🚀`)
);

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);
/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );
/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};