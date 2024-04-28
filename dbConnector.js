const express = require('express');
const mysql = require('mysql2')
const cors = require('cors');
const bodyParser = require('body-parser');


const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'mobile',
    database: 'rocket_game'
});

const app = express();

// Configure CORS options
const corsOptions = {
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: 'GET,POST', // Allow only specified HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Allow only specified headers
    optionsSuccessStatus: 200 // Return status code 200 for preflight requests
};
  
// Enable CORS with the configured options
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Example route to fetch data from a table
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Error querying MySQL: ', err);
      res.status(500).send('Error querying MySQL');
      return;
    }
    res.json(results);
  });
});


app.post('/users', (req, res) => {

    let highScores = {bigUser: "", bigScore: 0, high_score: 0}

    db.query('SELECT high_score FROM users WHERE user_id = ?', [req.body.user_id], (err, results) => {
        highScores.high_score = results[0].high_score
        if (err) {
            console.error('Error querying MySQL: ', err);
            res.status(500).send('Error querying MySQL');
            return;
        }
        if (results[0].high_score < req.body.score) {
            db.query('UPDATE users SET high_score = ? WHERE user_id = ?', [req.body.score, req.body.user_id]);
            highScores.high_score = req.body.score
        }
    });

    db.query("SELECT username, high_score FROM users ORDER BY high_score DESC LIMIT 1", (err, results) => {
        if (err) {
            console.error('Error querying MySQL: ', err);
            res.status(500).send('Error querying MySQL');
            return;
        }
        highScores.bigScore = results[0].high_score;
        highScores.bigUser = results[0].username;
    });

    res.json(highScores)

});

app.post('/texture', (req, res) => {
    db.query('UPDATE users SET texture = ? WHERE user_id = ?', [req.body.texture, req.body.user_id], (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ', err);
        res.status(500).send('Error querying MySQL');
        return;
      }
      res.json(results);
    });
  });

app.post('/login', (req, res) => {
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [req.body.username, req.body.password], (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ', err);
        res.status(500).send('Error querying MySQL');
        return;
      }
      res.json(results);
    });
});

app.post('/create', (req, res) => {
    db.query('INSERT INTO users (username, password, high_score, texture) VALUES (?, ?, ?, ?)', [req.body.username, req.body.password, 0, 'rusty'], (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ', err);
        res.status(500).send('Error querying MySQL');
        return;
      }
      res.json(results);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
