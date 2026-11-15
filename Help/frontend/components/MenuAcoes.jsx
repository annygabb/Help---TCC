import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import './MenuAcoes.css';

const DISTANCIA_DO_BOTAO = 6;
const MARGEM_DA_TELA = 8;

// Menu "⋯" acessível. Cada item: { chave, rotulo, icone, perigo, onSelecionar }.
// A lista é renderizada no <body> para não ser cortada por cartões com overflow: hidden.
export default function MenuAcoes({ rotulo, itens = [], className = '' }) {
  const idMenu = useId();
  const gatilhoRef = useRef(null);
  const menuRef = useRef(null);
  const focoInicial = useRef('primeiro');
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState(null);

  const opcoes = itens.filter(Boolean);

  const fechar = useCallback((devolverFoco) => {
    setAberto(false);
    setPosicao(null);
    if (devolverFoco) gatilhoRef.current?.focus({ preventScroll: true });
  }, []);

  const abrir = (foco) => {
    focoInicial.current = foco;
    setAberto(true);
  };

  const itensDoMenu = () => [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];

  // Posiciona a lista abaixo do botão (ou acima, se faltar espaço) e acompanha rolagem/redimensionamento.
  useLayoutEffect(() => {
    if (!aberto) return undefined;
    const posicionar = () => {
      const gatilho = gatilhoRef.current;
      const menu = menuRef.current;
      if (!gatilho || !menu) return;
      const area = gatilho.getBoundingClientRect();
      if (area.bottom < 0 || area.top > window.innerHeight) {
        fechar(false);
        return;
      }
      let top = area.bottom + DISTANCIA_DO_BOTAO;
      const topoAcima = area.top - DISTANCIA_DO_BOTAO - menu.offsetHeight;
      if (top + menu.offsetHeight > window.innerHeight - MARGEM_DA_TELA && topoAcima >= MARGEM_DA_TELA) top = topoAcima;
      const maiorLeft = window.innerWidth - menu.offsetWidth - MARGEM_DA_TELA;
      const left = Math.max(MARGEM_DA_TELA, Math.min(area.right - menu.offsetWidth, maiorLeft));
      setPosicao({ top, left });
    };
    posicionar();
    window.addEventListener('resize', posicionar);
    window.addEventListener('scroll', posicionar, true);
    return () => {
      window.removeEventListener('resize', posicionar);
      window.removeEventListener('scroll', posicionar, true);
    };
  }, [aberto, fechar]);

  // Depois de posicionada, leva o foco ao primeiro (ou último) item.
  useEffect(() => {
    if (!aberto || !posicao) return;
    const lista = itensDoMenu();
    if (document.activeElement && menuRef.current?.contains(document.activeElement)) return;
    const alvo = focoInicial.current === 'ultimo' ? lista[lista.length - 1] : lista[0];
    alvo?.focus({ preventScroll: true });
  }, [aberto, posicao]);

  // Clique fora fecha sem roubar o foco do que foi clicado.
  useEffect(() => {
    if (!aberto) return undefined;
    const aoPressionar = (event) => {
      if (menuRef.current?.contains(event.target) || gatilhoRef.current?.contains(event.target)) return;
      fechar(false);
    };
    document.addEventListener('mousedown', aoPressionar);
    document.addEventListener('touchstart', aoPressionar, { passive: true });
    return () => {
      document.removeEventListener('mousedown', aoPressionar);
      document.removeEventListener('touchstart', aoPressionar);
    };
  }, [aberto, fechar]);

  if (!opcoes.length) return null;

  const aoTeclarNoBotao = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      abrir('primeiro');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      abrir('ultimo');
    }
  };

  const aoTeclarNoMenu = (event) => {
    const lista = itensDoMenu();
    const atual = lista.indexOf(document.activeElement);
    const focar = (indice) => lista[(indice + lista.length) % lista.length]?.focus({ preventScroll: true });
    if (event.key === 'ArrowDown') { event.preventDefault(); focar(atual + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focar(atual - 1); }
    else if (event.key === 'Home') { event.preventDefault(); focar(0); }
    else if (event.key === 'End') { event.preventDefault(); focar(lista.length - 1); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); fechar(true); }
    else if (event.key === 'Tab') { fechar(true); }
  };

  const selecionar = (opcao) => {
    fechar(true);
    opcao.onSelecionar?.();
  };

  return (
    <div className={`menu-acoes ${className}`.trim()}>
      <button
        ref={gatilhoRef}
        type="button"
        className="menu-acoes-gatilho"
        aria-label={rotulo}
        title="Mais opções"
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={aberto ? idMenu : undefined}
        onClick={() => (aberto ? fechar(true) : abrir('primeiro'))}
        onKeyDown={aoTeclarNoBotao}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>
      {aberto && createPortal(
        <ul
          ref={menuRef}
          id={idMenu}
          className="menu-acoes-lista"
          role="menu"
          aria-label={rotulo}
          onKeyDown={aoTeclarNoMenu}
          style={posicao ? { top: posicao.top, left: posicao.left } : { top: 0, left: 0, visibility: 'hidden' }}
        >
          {opcoes.map((opcao) => {
            const Icone = opcao.icone;
            return (
              <li key={opcao.chave || opcao.rotulo} role="none">
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={`menu-acoes-item${opcao.perigo ? ' menu-acoes-item--perigo' : ''}`}
                  onClick={() => selecionar(opcao)}
                >
                  {Icone && <Icone size={17} aria-hidden="true" />}
                  <span>{opcao.rotulo}</span>
                </button>
              </li>
            );
          })}
        </ul>,
        document.body
      )}
    </div>
  );
}
