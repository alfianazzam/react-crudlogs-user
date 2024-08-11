import { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  Table,
  Alert,
} from "react-bootstrap";
import Swal from "sweetalert2";

function App() {
  const endpoint = "http://localhost:3001/api/users";
  const logsEndpoint = "http://localhost:3001/api/logs";
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch(endpoint);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Error fetching users");
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(logsEndpoint);
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Error fetching logs");
    }
  };

  const addUser = async () => {
    if (!username) {
      setError("Username is required");
      return;
    }
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const result = await response.json();
      if (result.success) {
        fetchUsers();
        fetchLogs();
        setUsername("");
        setError("");
        Swal.fire("Success", "User added successfully!", "success");
      } else {
        setError(result.message);
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      setError("Error adding user");
      Swal.fire("Error", "Error adding user", "error");
    }
  };

  const updateUser = async () => {
    if (!username || editUserId === null) {
      setError("Username and user ID are required");
      return;
    }
    try {
      const response = await fetch(`${endpoint}/${editUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const result = await response.json();
      if (result.success) {
        fetchUsers();
        fetchLogs();
        setUsername("");
        setEditUserId(null);
        setError("");
        Swal.fire("Success", "User updated successfully!", "success");
      } else {
        setError(result.message);
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      setError("Error updating user");
      Swal.fire("Error", "Error updating user", "error");
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        fetchUsers();
        fetchLogs();
        setError("");
        Swal.fire("Success", "User deleted successfully!", "success");
      } else {
        setError(result.message);
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      setError("Error deleting user");
      Swal.fire("Error", "Error deleting user", "error");
    }
  };

  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();  // Prevent form submission
      editUserId === null ? addUser() : updateUser();
    }
  };

  const handleUserClick = (user) => {
    setEditUserId(user.id);
    setUsername(user.username);
  };

  const toggleLogs = () => {
    setShowLogs(!showLogs);
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  return (
    <div className="card rounded-5 shadow">
      <Container className="mt-4">
        <div className="stars"></div>
        <Row className="mb-4">
          <Col>
            <h1 className="text-center mb-4 neon-text">User Management</h1>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress} // Event handler untuk menangani enter
                  placeholder="Enter username"
                />
              </Form.Group>
              <Button
                onClick={editUserId === null ? addUser : updateUser}
                variant={editUserId === null ? "primary" : "success"}
                className={editUserId === null ? "pulse" : ""}
              >
                {editUserId === null ? "Add User" : "Update User"}
              </Button>
            </Form>
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <h2 className="text-center mb-3 neon-text">Users List</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <Button
                        variant="warning"
                        onClick={() => handleUserClick(user)}
                        className="me-2 pulse"
                      >
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => deleteUser(user.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="text-center mb-3 neon-text">Logs</h2>
              <Button
                variant={showLogs ? "warning" : "success"}
                onClick={toggleLogs}
              >
                {showLogs ? "Hide All Logs" : "Show All Logs"}
              </Button>
            </div>
            {showLogs && (
              <Table striped bordered hover className="overflow-auto max-h-96">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Username</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.username}</td>
                      <td>{log.action}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
