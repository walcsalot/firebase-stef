import { useState } from "react"
import { addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../config/firebase"
import { toast } from "react-toastify"

// Helper function to format dates consistently
const formatDateOnly = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

export const TodoCrud = ({ user, todoListCollectionRef, getTodoList, showNotification }) => {
  // State for adding new todos
  const [newTodoName, setNewTodoName] = useState("")
  const [newTodoDesc, setNewTodoDesc] = useState("")
  const [newTodoExpiry, setNewTodoExpiry] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState("Low")
  const [newTodoCategory, setNewTodoCategory] = useState("Work")

  // State for editing todos
  const [editingTodo, setEditingTodo] = useState(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editExpiry, setEditExpiry] = useState("")
  const [editPriority, setEditPriority] = useState("Low")
  const [editCategory, setEditCategory] = useState("Work")

  // Add a new todo
  const onSubmitTodo = async () => {
    if (!user) return alert("You must be logged in to add a todo.")
    if (!newTodoName.trim() || !newTodoDesc.trim() || !newTodoExpiry) return alert("Fill in all fields.")

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
      })

      toast.success("List added successfully!")
      setNewTodoName("")
      setNewTodoDesc("")
      setNewTodoExpiry("")
      setNewTodoPriority("Low")
      setNewTodoCategory("Work")
      getTodoList(user.uid)
    } catch (err) {
      console.error("Error adding List: ", err)
      toast.error("Failed to add List.")
    }
  }

  // Toggle todo completion status
  const toggleTodoCompletion = async (id, completed) => {
    try {
      await updateDoc(doc(db, "todos", id), { completed: !completed })
      toast.success(completed ? "List marked as incomplete!" : "List completed!")

      if (!completed) {
        const todo = document.querySelector(`[data-todo-id="${id}"]`)
        const todoName = todo ? todo.querySelector("h2").textContent.split(" ")[0] : "Todo"
        showNotification("List Completed", `"${todoName}" has been marked as complete!`)
      }

      getTodoList(user.uid)
    } catch (err) {
      console.error("Error updating List: ", err)
      toast.error("Failed to update List.")
    }
  }

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, "todos", id))
      toast.success("List deleted successfully!")
      getTodoList(user.uid)
    } catch (err) {
      console.error("Error deleting List: ", err)
      toast.error("Failed to delete List.")
    }
  }

  // Start editing a todo
  const startEditing = (todo) => {
    setEditingTodo(todo.id)
    setEditName(todo.name)
    setEditDesc(todo.description)
    setEditExpiry(todo.expiryDate.split("T")[0])
    setEditPriority(todo.priority)
    setEditCategory(todo.category)
  }

  // Save edited todo
  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "todos", id), {
        name: editName,
        description: editDesc,
        expiryDate: new Date(editExpiry).toISOString(),
        priority: editPriority,
        category: editCategory,
      })

      toast.success("List updated successfully!")
      setEditingTodo(null)
      getTodoList(user.uid)
    } catch (err) {
      console.error("Error updating List: ", err)
      toast.error("Failed to update List.")
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingTodo(null)
  }

  // Render the add todo form
  const renderAddTodoForm = () => (
    <div className="todo-form">
      <input placeholder="List Name" type="text" value={newTodoName} onChange={(e) => setNewTodoName(e.target.value)} />
      <input
        placeholder="List Description"
        type="text"
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
  )

  // Render todo items with edit functionality
  const renderTodoItem = (todo) => {
    // Format dates for display
    const dateAdded = formatDateOnly(todo.dateAdded)
    const expiryDate = formatDateOnly(todo.expiryDate)

    return (
      <div key={todo.id} className={`todo-card ${todo.completed ? "completed" : ""}`} data-todo-id={todo.id}>
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
              <strong>Date Added:</strong> {dateAdded}
            </p>
            <p>
              <strong>Expiry Date:</strong> {expiryDate}
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
    )
  }

  return {
    renderAddTodoForm,
    renderTodoItem,
    editingTodo,
    toggleTodoCompletion,
    deleteTodo,
    startEditing,
    saveEdit,
    cancelEdit,
  }
}

export default TodoCrud

