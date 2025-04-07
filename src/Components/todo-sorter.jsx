"use client"

import { useState } from "react"

export const TodoSorter = ({ todoList }) => {
  const [sortBy, setSortBy] = useState("newest")

  const getSortedTodos = () => {
    const sortedTodos = [...todoList]

    if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 }
      sortedTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    } else if (sortBy === "category") {
      sortedTodos.sort((a, b) => a.category.localeCompare(b.category))
    } else if (sortBy === "newest") {
      sortedTodos.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    }

    return sortedTodos
  }

  const renderSortingControls = () => (
    <div className="sorting-controls">
      <label>Sort By:</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="newest">Newest First</option>
        <option value="priority">Priority</option>
        <option value="category">Category</option>
      </select>
    </div>
  )

  return {
    getSortedTodos,
    renderSortingControls,
  }
}

export default TodoSorter

