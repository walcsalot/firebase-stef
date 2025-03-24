import { useState, useEffect } from "react";
import "./App.css"; // Import the CSS file
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
  const [sortBy, setSortBy] = useState("");

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
    let sortedTodos = [...todoList];
  
    if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      sortedTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === "category") {
      sortedTodos.sort((a, b) => a.category.localeCompare(b.category));
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
    setEditExpiry(todo.expiryDate.split("T")[0]); // Format YYYY-MM-DD
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
    const now = new Date(); // Get current date
    const expiredTodos = todoList.filter(
      (todo) => new Date(todo.expiryDate) < now && !todo.completed
    );

    for (const todo of expiredTodos) {
      try {
        await updateDoc(doc(db, "todos", todo.id), { completed: true });
        toast.info(`"${todo.name}" was auto-completed (past expiry).`);
      } catch (err) {
        console.error("Error auto-completing todo: ", err);
      }
    }

    if (expiredTodos.length > 0) {
      getTodoList(user.uid);
    }
  };

  return (
    <div className="app">
      <ToastContainer />
      <Auth />
      {user ? (
        <div>
          <h1>My Note List</h1>
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
          
          <div className="sorting-controls">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">None</option>
              <option value="priority">Priority</option>
              <option value="category">Category</option>
            </select>
          </div>

          <table className="todo-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Date Added</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSortedTodos().map((todo) => (
                <tr key={todo.id} className={todo.completed ? "completed" : ""}>
                  {editingTodo === todo.id ? (
                    <>
                      <td><input value={editName} onChange={(e) => setEditName(e.target.value)} /></td>
                      <td><input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} /></td>
                      <td><select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></td>
                      <td><select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}><option value="Work">Work</option><option value="Personal">Personal</option><option value="Others">Others</option></select></td>
                      <td><button onClick={() => saveEdit(todo.id)}>Save</button> <button onClick={cancelEdit}>Cancel</button></td>
                    </>
                  ) : (
                    <>
                      <td>{todo.name}</td>
                      <td>{todo.description}</td>
                      <td>{todo.priority}</td>
                      <td>{todo.category}</td>
                      <td>{new Date(todo.dateAdded).toLocaleString()}</td>
                      <td>{new Date(todo.expiryDate).toLocaleDateString()}</td>
                      <td><button onClick={() => toggleTodoCompletion(todo.id, todo.completed)}> 
                      {todo.completed ? "Mark as Incomplete" : "Mark as Complete"}
                      </button> </td>
                      <td><button onClick={() => startEditing(todo)}>Edit</button></td>
                      <td><button onClick={() => deleteTodo(todo.id)}>Delete</button></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Please log in to view your notes.</p>
      )}
      <Footer />
    </div>
  );
}

export default App;
