import { useState, useEffect } from "react";
import "./App.css"; // Import the CSS file
import { Auth } from "./Components/auth";
import { db, auth } from "./config/firebase";
import { getDocs, collection, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoDesc, setNewTodoDesc] = useState("");
  const [newTodoExpiry, setNewTodoExpiry] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("Low");
  const [newTodoCategory, setNewTodoCategory] = useState("Work");
  const [user, setUser] = useState(null);
  const todoListCollectionRef = collection(db, "todos");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        getTodoList(currentUser.uid);
      } else {
        setTodoList([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const getTodoList = async (userId) => {
    try {
      const q = query(todoListCollectionRef, where("userId", "==", userId));
      const data = await getDocs(q);
      setTodoList(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching todos: ", err);
    }
  };

  const onSubmitTodo = async () => {
    if (!user) return alert("You must be logged in to add a todo.");
    if (!newTodoName.trim() || !newTodoDesc.trim() || !newTodoExpiry) return alert("Fill in all fields.");

    try {
      await addDoc(todoListCollectionRef, {
        name: newTodoName,
        description: newTodoDesc,
        completed: false,
        dateAdded: new Date().toISOString(),
        expiryDate: new Date(newTodoExpiry).toISOString(),
        priority: newTodoPriority,
        category: newTodoCategory,
        userId: user.uid,
      });

      setNewTodoName("");
      setNewTodoDesc("");
      setNewTodoExpiry("");
      setNewTodoPriority("Low");
      setNewTodoCategory("Work");
      getTodoList(user.uid);
    } catch (err) {
      console.error("Error adding todo: ", err);
    }
  };

  const toggleTodoCompletion = async (id, completed) => {
    try {
      await updateDoc(doc(db, "todos", id), { completed: !completed });
      getTodoList(user.uid);
    } catch (err) {
      console.error("Error updating todo: ", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, "todos", id));
      getTodoList(user.uid);
    } catch (err) {
      console.error("Error deleting todo: ", err);
    }
  };

  return (
    <div className="app">
      <Auth />
      {user ? (
        <div>
          <h1>My Todo List</h1>
          <div className="todo-form">
            <input placeholder="Todo Name" value={newTodoName} onChange={(e) => setNewTodoName(e.target.value)} />
            <input placeholder="Todo Description" value={newTodoDesc} onChange={(e) => setNewTodoDesc(e.target.value)} />
            <input type="date" value={newTodoExpiry} onChange={(e) => setNewTodoExpiry(e.target.value)} />
            <select value={newTodoPriority} onChange={(e) => setNewTodoPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <select value={newTodoCategory} onChange={(e) => setNewTodoCategory(e.target.value)}>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Others">Others</option>
            </select>
            <button onClick={onSubmitTodo}>Add Todo</button>
          </div>

          <div className="todo-list">
          {todoList.map((todo) => (
            <div key={todo.id} className={`todo-card ${todo.completed ? "completed" : ""}`}>
              <h2>
                {todo.name} <span className={`priority ${todo.priority.toLowerCase()}`}>{todo.priority}</span>
              </h2>
              <p>{todo.description}</p>
              <p><strong>Date Added:</strong> {new Date(todo.dateAdded).toLocaleString()}</p>
              <p><strong>Expiry Date:</strong> {new Date(todo.expiryDate).toLocaleDateString()}</p>
              <p><strong>Category:</strong> {todo.category}</p>
              <button onClick={() => toggleTodoCompletion(todo.id, todo.completed)}>
                {todo.completed ? "Mark as Incomplete" : "Mark as Complete"}
              </button>
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>Delete</button>
            </div>
          ))}
        </div>
        </div>
      ) : (
        <p>Please log in to view and manage your todo list.</p>
      )}
    </div>
  );
}

export default App;
