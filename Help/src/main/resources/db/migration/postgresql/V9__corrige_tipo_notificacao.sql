-- Os nomes gerados pelo Hibernate variam entre instalações. Atualiza somente
-- restrições CHECK que dependem exclusivamente da coluna tipo de notificacoes.
DO $$
DECLARE restricao record;
BEGIN
  IF to_regclass('public.notificacoes') IS NOT NULL THEN
    FOR restricao IN
      SELECT con.conname
        FROM pg_constraint con
        JOIN pg_attribute col ON col.attrelid = con.conrelid AND col.attname = 'tipo'
       WHERE con.conrelid = 'public.notificacoes'::regclass
         AND con.contype = 'c'
         AND con.conkey = ARRAY[col.attnum]::smallint[]
    LOOP
      EXECUTE format('ALTER TABLE public.notificacoes DROP CONSTRAINT %I', restricao.conname);
    END LOOP;
    ALTER TABLE public.notificacoes ADD CONSTRAINT ck_notificacao_tipo
      CHECK (tipo IN ('NOVO_SEGUIDOR', 'NOVA_MENSAGEM', 'NOVA_VAGA',
                      'EMPRESA_ATUALIZADA', 'NOVA_VAGA_EMPRESA', 'AVISO_ADMIN', 'OUTRO')) NOT VALID;
  END IF;
END $$;
