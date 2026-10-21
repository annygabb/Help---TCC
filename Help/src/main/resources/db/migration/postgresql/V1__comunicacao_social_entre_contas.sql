DO $$
BEGIN
    IF to_regclass('public.mensagens') IS NOT NULL THEN
        ALTER TABLE mensagens ALTER COLUMN remetente_id DROP NOT NULL;
        ALTER TABLE mensagens ALTER COLUMN destinatario_id DROP NOT NULL;
        ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS remetente_empresa_id UUID REFERENCES empresas(id);
        ALTER TABLE mensagens ADD COLUMN IF NOT EXISTS destinatario_empresa_id UUID REFERENCES empresas(id);

        ALTER TABLE mensagens DROP CONSTRAINT IF EXISTS ck_mensagem_remetente_xor;
        ALTER TABLE mensagens ADD CONSTRAINT ck_mensagem_remetente_xor
            CHECK ((remetente_id IS NOT NULL) <> (remetente_empresa_id IS NOT NULL));
        ALTER TABLE mensagens DROP CONSTRAINT IF EXISTS ck_mensagem_destinatario_xor;
        ALTER TABLE mensagens ADD CONSTRAINT ck_mensagem_destinatario_xor
            CHECK ((destinatario_id IS NOT NULL) <> (destinatario_empresa_id IS NOT NULL));

        CREATE INDEX IF NOT EXISTS idx_mensagem_remetente_empresa ON mensagens(remetente_empresa_id);
        CREATE INDEX IF NOT EXISTS idx_mensagem_destinatario_empresa ON mensagens(destinatario_empresa_id);
    END IF;

    IF to_regclass('public.notificacoes') IS NOT NULL THEN
        ALTER TABLE notificacoes ALTER COLUMN usuario_id DROP NOT NULL;
        ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
        ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS origem_tipo VARCHAR(32);
        UPDATE notificacoes SET origem_tipo = 'USUARIO' WHERE origem_tipo IS NULL;

        ALTER TABLE notificacoes DROP CONSTRAINT IF EXISTS ck_notificacao_destinatario_xor;
        ALTER TABLE notificacoes ADD CONSTRAINT ck_notificacao_destinatario_xor
            CHECK ((usuario_id IS NOT NULL) <> (empresa_id IS NOT NULL));
        CREATE INDEX IF NOT EXISTS idx_notificacao_empresa ON notificacoes(empresa_id, data_criacao DESC);
    END IF;

    IF to_regclass('public.seguidores') IS NOT NULL THEN
        ALTER TABLE seguidores ALTER COLUMN seguidor_id DROP NOT NULL;
        ALTER TABLE seguidores ALTER COLUMN seguido_id DROP NOT NULL;
        ALTER TABLE seguidores ADD COLUMN IF NOT EXISTS seguidor_empresa_id UUID REFERENCES empresas(id);
        ALTER TABLE seguidores ADD COLUMN IF NOT EXISTS seguido_empresa_id UUID REFERENCES empresas(id);
        ALTER TABLE seguidores DROP CONSTRAINT IF EXISTS uk_seguidor_seguido;

        ALTER TABLE seguidores DROP CONSTRAINT IF EXISTS ck_seguidor_origem_xor;
        ALTER TABLE seguidores ADD CONSTRAINT ck_seguidor_origem_xor
            CHECK ((seguidor_id IS NOT NULL) <> (seguidor_empresa_id IS NOT NULL));
        ALTER TABLE seguidores DROP CONSTRAINT IF EXISTS ck_seguidor_destino_xor;
        ALTER TABLE seguidores ADD CONSTRAINT ck_seguidor_destino_xor
            CHECK ((seguido_id IS NOT NULL) <> (seguido_empresa_id IS NOT NULL));

        CREATE UNIQUE INDEX IF NOT EXISTS uk_seguidor_uu ON seguidores(seguidor_id, seguido_id)
            WHERE seguidor_id IS NOT NULL AND seguido_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uk_seguidor_ue ON seguidores(seguidor_id, seguido_empresa_id)
            WHERE seguidor_id IS NOT NULL AND seguido_empresa_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uk_seguidor_eu ON seguidores(seguidor_empresa_id, seguido_id)
            WHERE seguidor_empresa_id IS NOT NULL AND seguido_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uk_seguidor_ee ON seguidores(seguidor_empresa_id, seguido_empresa_id)
            WHERE seguidor_empresa_id IS NOT NULL AND seguido_empresa_id IS NOT NULL;
    END IF;
END $$;
