ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS session_version VARCHAR(36);
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS session_version VARCHAR(36);

DO $$
BEGIN
    IF to_regclass('public.perfil_cursos') IS NOT NULL THEN
        ALTER TABLE perfil_cursos ALTER COLUMN certificado_url TYPE TEXT;
    END IF;

    IF to_regclass('public.perfis') IS NOT NULL THEN
        ALTER TABLE perfis ADD COLUMN IF NOT EXISTS foto_url TEXT;
        ALTER TABLE perfis ADD COLUMN IF NOT EXISTS curriculo_url TEXT;
        ALTER TABLE perfis ALTER COLUMN foto_url TYPE TEXT;
        ALTER TABLE perfis ALTER COLUMN curriculo_url TYPE TEXT;

        UPDATE usuarios u
        SET foto_url = p.foto_url
        FROM perfis p
        WHERE p.usuario_id = u.id
          AND u.foto_url IS NULL
          AND p.foto_url IS NOT NULL;
    END IF;
END $$;
