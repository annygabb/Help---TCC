import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('usuarioLogado');

  if (!user) {
    return <Navigate to="/login" replace />;//se o usuário não estiver logado, ele vai ser enviado pra logar
  }

  return children;
};

export default ProtectedRoute;