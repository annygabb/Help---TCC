CREATE TABLE IF NOT EXISTS controle_conversas (
    id UUID PRIMARY KEY,
    conta_id UUID NOT NULL,
    conta_tipo VARCHAR(20) NOT NULL,
    outro_id UUID NOT NULL,
    outro_tipo VARCHAR(20) NOT NULL,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    oculta_ate TIMESTAMP,
    CONSTRAINT uk_controle_conversa UNIQUE (conta_id, conta_tipo, outro_id, outro_tipo)
);
CREATE INDEX IF NOT EXISTS idx_controle_conversas_conta ON controle_conversas(conta_id, conta_tipo);
