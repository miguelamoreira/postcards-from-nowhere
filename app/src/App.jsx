import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/IndexScreen'
import PostcardScreenWrapper from "./pages/PostcardScreenWrapper";
import WriteBackScreen from "./pages/WriteBackScreen";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index></Index>}></Route>
        <Route path="/postcards/:id" element={<PostcardScreenWrapper></PostcardScreenWrapper>}></Route>
        <Route path='/postcards/writeBack' element={<WriteBackScreen></WriteBackScreen>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
