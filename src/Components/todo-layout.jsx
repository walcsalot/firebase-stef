import { Auth } from "./auth"
import Footer from "./Footer"

export const TodoLayout = ({ user, children }) => {
  if (!user) {
    // When not logged in, show only the login page
    return (
      <div className="login-page">
        <div className="login-logo">
          <h1>Todo List App</h1>
          <p>Organize your tasks efficiently</p>
        </div>
        <Auth isLoggedIn={false} />
        <Footer />
      </div>
    )
  }

  // When logged in, show the app content with logout button
  return (
    <div className="app-content">
      <div className="app-header">
        <h1>Todo List App</h1>
        <Auth isLoggedIn={true} />
      </div>
      <div className="main-content">{children}</div>
      <Footer />
    </div>
  )
}

export default TodoLayout

