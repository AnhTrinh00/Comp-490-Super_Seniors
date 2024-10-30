import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Signup from './Signup';
import Dashboard from './Dashboard';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/Dashboard' element={<Dashboard />}></Route>
          <Route path='/register' element={<Signup />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/home' element={<Home />}></Route>
          <Route path='/' element={<Home />}></Route>
          <Route path="/home" element={<Home />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/About" element={<About />} />
          <Route path="/Help" element={<Help />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
