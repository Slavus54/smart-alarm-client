import React, {useState, useEffect, useContext, useMemo} from 'react';
import {Button} from 'uikit-react'
import {CookieWorker} from './libs/CookieWorker'
import Navbar from './components/Navbar'
import './App.css';

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let instance = new CookieWorker('web3-client')

    let data = instance.gain()

    if (data === null) {
      instance.save(null, 10)
    } else {
      setUser(data)
    }
  }, [])

  return (
    <div className="App">
        <Navbar />
    </div>
  );
}

export default App