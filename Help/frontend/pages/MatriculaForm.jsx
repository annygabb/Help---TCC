import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

const MatriculaForm = ({ curso, onFinalizar, onFechar }) => {
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState({
    cidade: '', estado: '', genero: '', experiencia: '',
    momento: '', modelos: []
  });

  const handleCheckbox = (valor) => {
    const novosModelos = dados.modelos.includes(valor)
      ? dados.modelos.filter(m => m !== valor)
      : [...dados.modelos, valor];
    setDados({ ...dados, modelos: novosModelos });
  };

  return (
    <div className="modal-overlay">
      <div className="create-post-modal" style={{ width: '500px', padding: '25px' }}>
        <div className="modal-header" style={{ border: 'none', padding: '0 0 20px 0' }}>
          <h3 style={{ color: 'white' }}>Finalizar Matrícula: {curso.titulo}</h3>
          <button className="close-button" onClick={onFechar}><X color="white" /></button>
        </div>

        <div className="modal-content" style={{ color: '#e5e7eb' }}>
          {etapa === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input placeholder="Cidade" className="filter-select" style={{ flex: 2 }}
                  onChange={e => setDados({...dados, cidade: e.target.value})} />
                <input placeholder="UF" className="filter-select" style={{ flex: 1 }}
                  onChange={e => setDados({...dados, estado: e.target.value})} />
              </div>

              <select className="filter-select" onChange={e => setDados({...dados, genero: e.target.value})}>
                <option value="">Gênero</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não dizer">Prefiro não dizer</option>
              </select>

              <select className="filter-select" onChange={e => setDados({...dados, experiencia: e.target.value})}>
                <option value="">Anos de experiência na área</option>
                <option value="Sem experiência">Sem experiência</option>
                <option value="Menos de 1 ano">Menos de 1 ano</option>
                <option value="1 a 2 anos">1 a 2 anos</option>
                <option value="2 a 3 anos">2 a 3 anos</option>
                <option value="3 a 4 anos">3 a 4 anos</option>
                <option value="4 a 5 anos">4 a 5 anos</option>
                <option value="6 ou mais">6 ou mais</option>
              </select>

              <button className="publish-button" onClick={() => setEtapa(2)}>Próximo</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label>Qual o seu momento profissional?</label>
              <select className="filter-select" onChange={e => setDados({...dados, momento: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="Apenas estudo">Apenas estudo</option>
                <option value="Estudo e trabalho">Estudo e trabalho</option>
                <option value="Estudo e trabalho na área">Estudo e trabalho na área</option>
              </select>

              <label>Modelos de trabalho de interesse:</label>
              <div style={{ display: 'flex', gap: '15px' }}>
                {['Híbrido', 'Presencial', 'Home Office'].map(m => (
                  <label key={m} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="checkbox" onChange={() => handleCheckbox(m)} /> {m}
                  </label>
                ))}
              </div>

              <button className="publish-button" style={{ marginTop: '10px' }} onClick={() => onFinalizar(dados)}>
                Finalizar e Iniciar Curso
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};