import { useState, useEffect } from "react"
import "./App.css"
import { db, auth } from "./config/firebase"
import { getDocs, collection, query, where } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { TodoCrud } from "./Components/todo-crud"
import { NotificationManager } from "./Components/notifications"
import { TodoSorter } from "./Components/todo-sorter"
import { TodoLayout } from "./Components/todo-layout"
import { ThemeProvider } from "./Components/theme-context"

// Helper function to format dates consistently
const formatDateOnly = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

function App() {
  const [todoList, setTodoList] = useState([])
  const [user, setUser] = useState(null)
  const todoListCollectionRef = collection(db, "todos")
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Initialize notification manager
  const { showNotification } = NotificationManager()

  // Initialize todo sorter
  const { getSortedTodos, renderSortingControls } = TodoSorter({ todoList })

  const getTodoList = async (userId) => {
    try {
      const q = query(todoListCollectionRef, where("userId", "==", userId))
      const data = await getDocs(q)
      setTodoList(
        data.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            // Format dates for display if needed
            formattedDateAdded: formatDateOnly(data.dateAdded),
            formattedExpiryDate: formatDateOnly(data.expiryDate),
          }
        }),
      )
    } catch (err) {
      console.error("Error fetching todos: ", err)
    }
  }

  // Initialize the TodoCrud component
  const { renderAddTodoForm, renderTodoItem, toggleTodoCompletion } = TodoCrud({
    user,
    todoListCollectionRef,
    getTodoList,
    showNotification,
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        getTodoList(currentUser.uid)
      } else {
        setTodoList([])
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      autoCompleteExpiredTodos()
    }
  }, [todoList, user])

  const autoCompleteExpiredTodos = async () => {
    const now = new Date()
    const expiredTodos = todoList.filter((todo) => new Date(todo.expiryDate) < now && !todo.completed)

    for (const todo of expiredTodos) {
      try {
        await toggleTodoCompletion(todo.id, false)
        toast.info(`"${todo.name}" was auto-completed (past expiry).`)
        showNotification("List Expired", `"${todo.name}" has been auto-completed as it's past its expiry date.`)
      } catch (err) {
        console.error("Error auto-completing todo: ", err)
      }
    }

    if (expiredTodos.length > 0) {
      getTodoList(user.uid)
    }
  }

  const getToastPosition = () => {
    return isMobile ? "bottom-center" : "top-right"
  }

  // Render the todo content only when user is logged in
  const renderTodoContent = () => (
    <>
      {renderAddTodoForm()}
      <h2>Note List</h2>
      {renderSortingControls()}
      <div className="todo-list">{getSortedTodos().map((todo) => renderTodoItem(todo))}</div>
    </>
  )

  return (
    <ThemeProvider>
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
        <TodoLayout user={user}>{renderTodoContent()}</TodoLayout>
      </div>
    </ThemeProvider>
  )
}

export default App

