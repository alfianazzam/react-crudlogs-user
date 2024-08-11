const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const database = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_azam",
});

database.connect((err) => {
  if (err) throw err;
  console.log("Database connected");
});

// Fetch users
app.get("/api/users", (req, res) => {
  console.log("GET USERS API REQUESTED");
  database.query("SELECT * FROM users", (err, rows) => {
    if (err) throw err;
    res.json({
      success: true,
      message: "Getting users data",
      data: rows,
    });
  });
});

// Fetch logs
app.get("/api/logs", (req, res) => {
  console.log("GET LOGS API REQUESTED");
  database.query("SELECT * FROM logs ORDER BY timestamp DESC", (err, rows) => {
    if (err) throw err;
    res.json({
      success: true,
      message: "Getting logs data",
      data: rows,
    });
  });
});

// Add log
const addLog = (action, username, details) => {
  const timestamp = new Date();
  const sql = "INSERT INTO logs (action, username, details, timestamp) VALUES (?, ?, ?, ?)";
  database.query(sql, [action, username, details, timestamp], (err, result) => {
    if (err) {
      console.error("Error inserting log:", err);
    }
  });
};

// Add user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  database.query("INSERT INTO users (username) VALUES (?)", [username], (err, result) => {
    if (err) throw err;
    // Log the action
    addLog('User Created', username, `User added with ID: ${result.insertId}`);
    res.json({
      success: true,
      message: "User created",
    });
  });
});

// Update user
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  database.query("UPDATE users SET username = ? WHERE id = ?", [username, id], (err, result) => {
    if (err) throw err;
    // Log the action
    addLog('User Updated', username, `User with ID: ${id} updated`);
    res.json({
      success: true,
      message: "User updated",
    });
  });
});

// Delete user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  database.query("SELECT username FROM users WHERE id = ?", [id], (err, rows) => {
    if (err) throw err;
    const username = rows[0].username;
    database.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) throw err;
      // Log the action
      addLog('User Deleted', username, `User with ID: ${id} deleted`);
      res.json({
        success: true,
        message: "User deleted",
      });
    });
  });
});

// Clear all logs
app.delete("/api/logs", (req, res) => {
  console.log("CLEAR ALL LOGS API REQUESTED");
  database.query("DELETE FROM logs", (err, result) => {
    if (err) {
      console.error("Error clearing logs:", err);
      return res.status(500).json({ success: false, message: "Error clearing logs" });
    }
    res.json({ success: true, message: "All logs cleared successfully" });
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
