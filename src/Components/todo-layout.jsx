import { Auth } from "./auth"
import Footer from "./Footer"

export const TodoLayout = ({ user, children }) => {
  if (!user) {
    // When not logged in, show only the login page
    return (
      <div className="login-page">
        <div className="login-logo">
        <img src="../Logo.svg" height="100px" alt="Note List App Logo" />
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
      <img src="../Logo.svg" height="50px" alt="Note List App Logo" />
        <h1>Dashboard</h1>
        <Auth isLoggedIn={true} />
      </div>
      <div className="main-content">{children}</div>
      <Footer />
    </div>
  )
}

export default TodoLayout

