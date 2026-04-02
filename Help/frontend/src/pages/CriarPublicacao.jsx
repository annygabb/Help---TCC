import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Smile, MessageSquare, Users } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import './CriarPublicacao.css';

const CriarPublicacao = ({ onClose, onPublish, user }) => {
  const [texto, setTexto] = useState("");
  const [privacidadePost, setPrivacidadePost] = useState("todos");
  const [comentarioStatus, setComentarioStatus] = useState(0);
  const [midia, setMidia] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    return () => { if (midia?.preview) URL.revokeObjectURL(midia.preview); };
  }, [midia]);

  const handleFileChange = (e, tipo) => {
    const file = e.target.files[0];
    if (file) setMidia({ file, tipo, preview: URL.createObjectURL(file) });
  };

  const onEmojiClick = (emojiData) => {
    setTexto(prev => prev + emojiData.emoji);
  };

  const getComentarioIcon = () => {
    if (comentarioStatus === 0) return <MessageSquare size={14} />;
    if (comentarioStatus === 1) return <Users size={14} />;
    return <X size={14} />;
  };

  const getComentarioLabel = () => {
    if (comentarioStatus === 0) return "On";
    if (comentarioStatus === 1) return "Seguidores";
    return "Off";
  };

  return (
    <div className="help-modal-overlay">
      <div className="help-modal-card">
        <div className="help-modal-header">
          <div className="help-user-section">
            <img src={user?.fotoPerfil || "https://via.placeholder.com/40"} alt="Perfil" className="help-avatar" />
            <div className="help-user-info">
              <span className="help-user-name">{user?.nome || "Ennie"}</span>
              <div className="help-selectors-container">
                <select
                  className="help-mini-select custom-select-bg"
                  value={privacidadePost}
                  onChange={(e) => setPrivacidadePost(e.target.value)}
                >
                  <option value="todos">🌐 Publicar para todos</option>
                  <option value="seguidores">👥 Seguidores</option>
                </select>

                <button
                  className={`help-mini-toggle status-${comentarioStatus}`}
                  onClick={() => setComentarioStatus((prev) => (prev + 1) % 3)}
                >
                  {getComentarioIcon()}
                  <span>Comentários: {getComentarioLabel()}</span>
                </button>
              </div>
            </div>
          </div>
          <button className="help-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="help-modal-body">
          <textarea
            placeholder="Sobre o que você quer falar?"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="help-textarea"
            autoFocus
          />

          {midia && (
            <div className="help-preview-container">
              <button className="help-remove-media" onClick={() => setMidia(null)}><X size={16} /></button>
              {midia.tipo === 'image' ? <img src={midia.preview} alt="Preview" /> : <video src={midia.preview} controls />}
            </div>
          )}
        </div>

        <div className="help-modal-footer">
          <div className="help-action-icons">
            <button className="help-icon-btn" onClick={() => imageInputRef.current.click()} title="Foto">
              <ImageIcon size={22} />
            </button>
            <button className="help-icon-btn" onClick={() => videoInputRef.current.click()} title="Vídeo">
              <Video size={22} />
            </button>
            <div className="help-emoji-trigger-wrapper">
              <button
                className="help-icon-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Emoji"
              >
                <Smile size={22} color={showEmojiPicker ? "#a855f7" : "currentColor"} />
              </button>

              {showEmojiPicker && (
                <div className="help-emoji-popover">
                  {/* Botão X para fechar o seletor */}
                  <button
                    className="help-emoji-close-x"
                    onClick={() => setShowEmojiPicker(false)}
                  >
                    <X size={16} />
                  </button>
                  <EmojiPicker
                    theme="dark"
                    onEmojiClick={onEmojiClick}
                    width="320px"
                    height="350px"
                    searchDisabled={true}
                    skinTonesDisabled={true}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>

            <input type="file" hidden ref={imageInputRef} accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
            <input type="file" hidden ref={videoInputRef} accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
          </div>

          <button
            className={`help-publish-btn ${(!texto.trim() && !midia) ? 'disabled' : ''}`}
            disabled={!texto.trim() && !midia}
            onClick={() => onPublish(texto, midia, { privacidadePost, comentarioStatus })}
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriarPublicacao;