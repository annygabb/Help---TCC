import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { verificarSenha } from '../utils/validacoes';
import './CampoSenha.css';

export function CampoSenha({
  value,
  onChange,
  placeholder = 'Senha',
  wrapperClassName = 'input-with-icon',
  inputClassName,
  iconStyle,
  ...inputProps
}) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className={`${wrapperClassName} campo-senha`}>
      <Lock size={20} color="#7c3aed" style={iconStyle} aria-hidden="true" />
      <input
        {...inputProps}
        type={visivel ? 'text' : 'password'}
        placeholder={placeholder}
        className={inputClassName}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="campo-senha-toggle"
        onClick={() => setVisivel((atual) => !atual)}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visivel}
        title={visivel ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visivel ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}

export function RequisitosSenha({ senha, id }) {
  const requisitos = verificarSenha(senha);
  const pendentes = requisitos.filter((r) => !r.atendido).length;

  return (
    <div className="requisitos-senha" id={id}>
      <p className="requisitos-senha-titulo">A senha precisa ter:</p>
      <ul>
        {requisitos.map(({ id: chave, texto, atendido }) => (
          <li key={chave} className={atendido ? 'atendido' : ''}>
            {atendido
              ? <Check size={14} aria-hidden="true" />
              : <X size={14} aria-hidden="true" />}
            <span>{texto}</span>
            <span className="sr-only">{atendido ? ' (cumprido)' : ' (pendente)'}</span>
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">
        {senha ? (pendentes ? `Faltam ${pendentes} requisitos na senha.` : 'A senha cumpre todos os requisitos.') : ''}
      </p>
    </div>
  );
}

export default CampoSenha;