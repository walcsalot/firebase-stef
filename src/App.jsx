import { useState, useEffect } from "react";
import "./App.css";
import { Auth } from "./Components/auth";
import { db, auth } from "./config/firebase";
import { getDocs, collection, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Footer from "./Components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoDesc, setNewTodoDesc] = useState("");
  const [newTodoExpiry, setNewTodoExpiry] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("Low");
  const [newTodoCategory, setNewTodoCategory] = useState("Work");
  const [editingTodo, setEditingTodo] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [editPriority, setEditPriority] = useState("Low");
  const [editCategory, setEditCategory] = useState("Work");
  const [user, setUser] = useState(null);
  const todoListCollectionRef = collection(db, "todos");
  const [sortBy, setSortBy] = useState("newest");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Service Worker Registration for Notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.log('Service Worker registration failed', err));
    }
  }, []);

  // Notification Permission Check
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
    } else {
      console.log("Notification permission is:", Notification.permission);
    }
  }, []);

  const showNotification = (title, body) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "./assets/react.svg" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body, icon: "./assets/react.svg" });
        }
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    if (user) {
      autoCompleteExpiredTodos();
    }
  }, [todoList, user]);

  const getSortedTodos = () => {
    const sortedTodos = [...todoList];

    if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      sortedTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === "category") {
      sortedTodos.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === "newest") {
      sortedTodos.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    return sortedTodos;
  };

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

      toast.success("List added successfully!");
      setNewTodoName("");
      setNewTodoDesc("");
      setNewTodoExpiry("");
      setNewTodoPriority("Low");
      setNewTodoCategory("Work");
      getTodoList(user.uid);
    } catch (err) {
      console.error("Error adding List: ", err);
      toast.error("Failed to add List.");
    }
  };

  const toggleTodoCompletion = async (id, completed) => {
    try {
      await updateDoc(doc(db, "todos", id), { completed: !completed });
      toast.success(completed ? "List marked as incomplete!" : "List completed!");
      
      if (!completed) {
        const todo = todoList.find(t => t.id === id);
        showNotification("List Completed", `"${todo.name}" has been marked as complete!`);
      }
      
      getTodoList(user.uid);
    } catch (err) {
      console.error("Error updating List: ", err);
      toast.error("Failed to update List.");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, "todos", id));
      toast.success("List deleted successfully!");
      getTodoList(user.uid);
    } catch (err) {
      console.error("Error deleting List: ", err);
      toast.error("Failed to delete List.");
    }
  };

  const startEditing = (todo) => {
    setEditingTodo(todo.id);
    setEditName(todo.name);
    setEditDesc(todo.description);
    setEditExpiry(todo.expiryDate.split("T")[0]);
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "todos", id), {
        name: editName,
        description: editDesc,
        expiryDate: new Date(editExpiry).toISOString(),
        priority: editPriority,
        category: editCategory,
      });

      toast.success("List updated successfully!");
      setEditingTodo(null);
      getTodoList(user.uid);
    } catch (err) {
      console.error("Error updating List: ", err);
      toast.error("Failed to update List.");
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
  };

  const autoCompleteExpiredTodos = async () => {
    const now = new Date();
    const expiredTodos = todoList.filter((todo) => new Date(todo.expiryDate) < now && !todo.completed);

    for (const todo of expiredTodos) {
      try {
        await updateDoc(doc(db, "todos", todo.id), { completed: true });
        toast.info(`"${todo.name}" was auto-completed (past expiry).`);
        showNotification("List Expired", `"${todo.name}" has been auto-completed as it's past its expiry date.`);
      } catch (err) {
        console.error("Error auto-completing todo: ", err);
      }
    }

    if (expiredTodos.length > 0) {
      getTodoList(user.uid);
    }
  };

  const getToastPosition = () => {
    return isMobile ? "bottom-center" : "top-right";
  };

  return (
    <div className="app">
      <ToastContainer
        position={getToastPosition()}
        autoClose={3000}
        hideProgressBar={isMobile}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
        className="toast-container-custom"
        toastClassName="toast-custom"
        bodyClassName="toast-body-custom"
      />
      <Auth />
      {user ? (
        <div>
          <div className="todo-form">
            <input placeholder="List Name" value={newTodoName} onChange={(e) => setNewTodoName(e.target.value)} />
            <input
              placeholder="List Description"
              value={newTodoDesc}
              onChange={(e) => setNewTodoDesc(e.target.value)}
            />
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

          <h2>Note List</h2>

          <div className="sorting-controls">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="priority">Priority</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div className="todo-list">
            {getSortedTodos().map((todo) => (
              <div key={todo.id} className={`todo-card ${todo.completed ? "completed" : ""}`}>
                {editingTodo === todo.id ? (
                  <>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                    <input type="date" value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)} />
                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Others">Others</option>
                    </select>
                    <button onClick={() => saveEdit(todo.id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <h2>
                      {todo.name} <span className={`priority ${todo.priority.toLowerCase()}`}>{todo.priority}</span>
                    </h2>
                    <p>{todo.description}</p>
                    <p>
                      <strong>Date Added:</strong> {new Date(todo.dateAdded).toLocaleString()}
                    </p>
                    <p>
                      <strong>Expiry Date:</strong> {new Date(todo.expiryDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Category:</strong> {todo.category}
                    </p>
                    <button onClick={() => toggleTodoCompletion(todo.id, todo.completed)}>
                      {todo.completed ? "Mark as Incomplete" : "Mark as Complete"}
                    </button>
                    <button className="edit-btn" onClick={() => startEditing(todo)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Please log in to view and manage your todo list.</p>
      )}
      <Footer />
    </div>
  );
}

export default App;