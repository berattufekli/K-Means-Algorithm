import './App.css';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Iteration from './Iteration';
import KMeans from './KMeans';
import Home from './Home';
import Knn from './Knn';
import Result from './Result';
import NavBar from './NavBar';

function App() {
  return (
    <Router>
      <ChakraProvider>
        <NavBar />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/kmeans" element={<KMeans />} />
          <Route path="/kmeans/iteration" element={<Iteration />} />
          <Route path="/knn" element={<Knn />} />
          <Route path="/knn/result" element={<Result />} />
        </Routes>
      </ChakraProvider>
    </Router>
  );
}

export default App;
