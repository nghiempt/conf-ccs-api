const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// set port
const port = 4444;

// allow cors
app.use(cors());
app.use(bodyParser.json());

// create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// log staus connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to database');
        connection.release();
    })
    .catch(error => {
        console.error('Error connecting to database:', error);
    });

// ==============================================
app.get('/api/ccs/app/get-all-apps', async (req, res) => {
    const query = `SELECT * FROM ccs_app`;
    try {
        const [results] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching app details:', error);
        res.status(500).send('Error fetching app details');
    }
});

app.get('/api/ccs/category/get-all-categories', async (req, res) => {
    const query = `SELECT * FROM ccs_category`;
    try {
        const [results] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching category details:', error);
        res.status(500).send('Error fetching category details');
    }
});

app.get('/api/ccs/expert/get-all-experts', async (req, res) => {
    const query = `SELECT * FROM ccs_expert`;
    try {
        const [results] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching expert details:', error);
        res.status(500).send('Error fetching expert details');
    }
});

app.post('/api/ccs/expert/create', async (req, res) => {
    const { account_id, app_id, category_id, label_one, label_two, relevant_one, label_one_desc, label_two_desc, relevant_two } = req.body;

    try {
        const insertResult = await pool.query(
            'INSERT INTO ccs_expert (account_id, app_id, category_id, label_one, label_two, relevant_one, label_one_desc, label_two_desc, relevant_two) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [account_id, app_id, category_id, label_one, label_two, relevant_one, label_one_desc, label_two_desc, relevant_two]
        );
        res.status(201).send({ message: "Expert created successfully" });
    } catch (error) {
        console.error('Error creating an expert', error.message);
        res.status(500).send('Error creating an expert');
    }
});

app.post('/api/ccs/auth/sign-in', async (req, res) => {
    const { account_email, account_password } = req.body;
    const query = 'SELECT * FROM ccs_account WHERE account_email = ? AND account_password = ?';
    try {
        const [results] = await pool.query(query, [account_email, account_password]);
        if (results.length > 0) {
            const account = results[0];
            res.send({
                success: true,
                message: 'Sign-in successful',
                account: account
            });
        } else {
            res.send({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).send('Error during sign-in');
    }
});
// ==============================================

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});