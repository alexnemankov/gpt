import React from 'react';
import './App.css';
import DateTimeRangePicker from './components/DateTimeRangePicker';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Date Time Range Picker</h1>
      </header>
      <main>
        <DateTimeRangePicker />
      </main>
    </div>
  );
}

export default App;
