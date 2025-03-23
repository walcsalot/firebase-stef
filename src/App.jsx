import { useState } from 'react'
import './App.css'
import {Auth} from "./Components/auth";
import {db} from "./config/firebase";
import { useEffect } from 'react';
import { getDocs, collection, addDoc}  from "firebase/firestore"

function App() {
  const [TodoList, setTodoList] = useState([]);
  
  const [newTodoList, setNewTodoList] = useState([]);
  const [newListDesc, setListDesc] = useState([]);
  const TodoListCollectionRef = collection(db, "list");

  const getTodoList = async () => { 
    try {
      const data = await getDocs(TodoListCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setTodoList(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getTodoList();
  }, []);
    const onSubmitList = async () => {
      try {
      await addDoc(TodoListCollectionRef, {name: newTodoList, 
        description: newListDesc,
      });
      
      getTodoList();
    } catch (err) {
      console.error(err);
    } 
  }




  return (
    <>
      <div className='App'>
        <Auth />
        <div>
          <input placeholder="Create List" onChange={(e) => setNewTodoList(e.target.value)} />
          <input placeholder="Description" onChange={(e) => setListDesc(e.target.value)} />
          <button onClick={onSubmitList}>Submit List</button>
        </div>

        <div>
          {TodoList.map((lists) => (

            <div>
              <h1> {lists.name} </h1>
              <p> Description: {lists.description} </p>
              <p> Date Added: {lists.dateadded} </p>
              <p> Date Expiry: {lists.dateexpiry} </p>
              </div>
          ))} 
      </div>
      </div>
    </>
  )
}
export default App;
