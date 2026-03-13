import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import RecuperarSenha from './pages/RecuperarSenha.jsx';
import Feed from './pages/Feed.jsx'; // 1. Importação do novo componente Feed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />

        {/* 2. Rota para a página de Feed do usuário logado */}
        <Route path="/feed" element={<Feed />} />

        {/* 3. A rota curinga DEVE ser sempre a última */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;