import React from 'react'
import { BrowserRouter as Router , Route, Routes} from 'react-router-dom'
import Admin from './Components/Admin'


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Admin />}/>
        
      </Routes>
    </Router>
  )
}

export default App