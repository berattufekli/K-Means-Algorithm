import './App.css';
import { ChakraProvider } from '@chakra-ui/react';
import Home from './Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Iteration from './Iteration';

function App() {
  return (
    <Router>
      <ChakraProvider>
        <Routes>
          <Route exact path="/" element={<Home />} /> 
          <Route path="/iteration" element={<Iteration />} />
          
        </Routes>
      </ChakraProvider>
    </Router>
  );
}

export default App;
