import Tasks from "./components/Tasks";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Task List</h1>
        <p>
          Fetches tasks from <code>/api/tasks</code> and renders them.
        </p>
      </header>
      <main>
        <Tasks />
      </main>
    </div>
  );
}

export default App;
