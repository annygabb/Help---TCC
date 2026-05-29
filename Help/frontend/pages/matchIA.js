const normalizar = (texto = '') =>
    String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const extrairNumeros = (texto = '') => {
    const matches = String(texto).match(/\d[\d.,]*/g) || [];

    return matches
        .map(valor => Number(valor.replace(/\./g, '').replace(',', '.')))
        .filter(Number.isFinite);
};

const nivelSenioridade = {
    estagiario: 0,
    junior: 1,
    pleno: 2,
    senior: 3,
    especialista: 4
};

const criarNivel = (score) => {
    if (score >= 85) return 'alto';
    if (score >= 70) return 'bom';
    if (score >= 50) return 'medio';
    return 'baixo';
};

const criarCor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
};

const criarRecomendacao = (score) => {
    if (score >= 85) return 'Altamente recomendado';
    if (score >= 70) return 'Bom candidato';
    if (score >= 50) return 'Precisa de triagem';
    return 'Baixa aderencia';
};

export const calcularMatchIA = (talento, vaga, pesos = {}) => {
    if (!talento || !vaga) {
        return {
            score: 0,
            nivel: 'baixo',
            cor: '#ef4444',
            recomendacao: 'Dados insuficientes',
            resumo: 'Nao ha dados suficientes para calcular o match.',
            pontosFortes: [],
            pontosAtencao: ['Complete os dados do candidato e da vaga.'],
            skillsEncontradas: [],
            skillsFaltantes: [],
            confianca: 0
        };
    }

    const skillsVaga = vaga.skillsExigidas || [];
    const skillsTalento = talento.skills || [];
    const skillsTalentoNormalizadas = skillsTalento.map(normalizar);

    const skillsEncontradas = skillsVaga.filter(skill =>
        skillsTalentoNormalizadas.includes(normalizar(skill))
    );

    const skillsFaltantes = skillsVaga.filter(skill =>
        !skillsTalentoNormalizadas.includes(normalizar(skill))
    );

    const percentualSkills = skillsVaga.length > 0
        ? (skillsEncontradas.length / skillsVaga.length) * 100
        : 0;

    const bonusCertificacao = talento.certificacoes?.length > 0 ? 10 : 0;
    const temFormacaoBase = ['engenharia', 'ciencia da computacao', 'sistemas']
        .some(curso => normalizar(talento.formacao).includes(curso));
    const bonusFormacao = temFormacaoBase ? 8 : 0;

    const scoreTecnico = Math.min(percentualSkills + bonusCertificacao + bonusFormacao, 100);

    const experienciaMinima = vaga.experienciaMinima || 1;
    const scoreExperiencia = Math.min((talento.experiencia / experienciaMinima) * 100, 100);

    const senioridadeTalento = nivelSenioridade[normalizar(talento.senioridade)] ?? null;
    const senioridadeVaga = nivelSenioridade[normalizar(vaga.senioridade)] ?? null;
    const scoreSenioridade = senioridadeTalento === null || senioridadeVaga === null
        ? 75
        : senioridadeTalento >= senioridadeVaga
            ? 100
            : Math.max(45, 100 - ((senioridadeVaga - senioridadeTalento) * 25));

    const vagaRemota = normalizar(vaga.modelo).includes('remoto');
    const localTalento = normalizar(talento.localizacao);
    const localVaga = normalizar(vaga.localizacao);
    const scoreLocalizacao = vagaRemota || localVaga.includes('brasil') || localTalento.includes('remoto')
        ? 100
        : localTalento && localVaga && localTalento === localVaga
            ? 100
            : 70;

    const numerosSalario = extrairNumeros(vaga.salario);
    const salarioMaximo = numerosSalario.length > 0 ? Math.max(...numerosSalario) : null;
    const pretensao = talento.pretensaoSalarial || null;
    const scoreSalarial = !salarioMaximo || !pretensao
        ? 80
        : pretensao <= salarioMaximo
            ? 100
            : pretensao <= salarioMaximo * 1.15
                ? 75
                : 50;

    const pesoTecnico = pesos.pesoSkills ?? 50;
    const pesoExperiencia = pesos.pesoExp ?? 50;
    const basePonderada = ((scoreTecnico * pesoTecnico) + (scoreExperiencia * pesoExperiencia)) / 100;

    const score = Math.round(
        (basePonderada * 0.72) +
        (scoreSenioridade * 0.1) +
        (scoreLocalizacao * 0.08) +
        (scoreSalarial * 0.1)
    );

    const pontosFortes = [];
    const pontosAtencao = [];

    if (skillsEncontradas.length > 0) {
        pontosFortes.push(`Domina ${skillsEncontradas.slice(0, 3).join(', ')}`);
    }

    if (talento.experiencia >= experienciaMinima) {
        pontosFortes.push('Experiencia atende a vaga');
    } else {
        pontosAtencao.push('Experiencia abaixo do minimo desejado');
    }

    if (talento.certificacoes?.length > 0) {
        pontosFortes.push('Possui certificacoes relevantes');
    }

    if (temFormacaoBase) {
        pontosFortes.push('Formacao alinhada com tecnologia');
    }

    if (skillsFaltantes.length > 0) {
        pontosAtencao.push(`Avaliar lacunas em ${skillsFaltantes.slice(0, 3).join(', ')}`);
    }

    if (scoreSalarial < 80) {
        pontosAtencao.push('Pretensao salarial pode exigir negociacao');
    }

    if (scoreSenioridade < 75) {
        pontosAtencao.push('Senioridade abaixo do nivel da vaga');
    }

    const recomendacao = criarRecomendacao(score);
    const resumo = `${recomendacao}: ${talento.nome} tem ${skillsEncontradas.length} de ${skillsVaga.length} skills-chave, ${talento.experiencia} anos de experiencia e aderencia ${criarNivel(score)} para ${vaga.cargo}.`;

    return {
        score,
        nivel: criarNivel(score),
        cor: criarCor(score),
        recomendacao,
        resumo,
        pontosFortes,
        pontosAtencao,
        skillsEncontradas,
        skillsFaltantes,
        confianca: Math.min(95, 55 + (skillsVaga.length * 5) + (skillsTalento.length * 3))
    };
};

export const analisarTalentoIA = (talento) => {
    if (!talento) {
        return {
            score: 0,
            recomendacao: 'Dados insuficientes',
            resumo: 'Complete o perfil para gerar uma analise.'
        };
    }

    let score = 55;

    if (talento.experiencia >= 3) score += 12;
    if (talento.experiencia >= 6) score += 8;
    if (talento.skills?.length >= 4) score += 10;
    if (talento.certificacoes?.length > 0) score += 8;
    if (['engenharia', 'ciencia', 'sistemas'].some(curso => normalizar(talento.formacao).includes(curso))) score += 7;

    const scoreFinal = Math.min(score, 100);

    return {
        score: scoreFinal,
        nivel: criarNivel(scoreFinal),
        cor: criarCor(scoreFinal),
        recomendacao: criarRecomendacao(scoreFinal),
        resumo: `${talento.nome} apresenta perfil ${criarNivel(scoreFinal)} com foco em ${talento.skills?.slice(0, 3).join(', ') || 'competencias principais'}.`
    };
};

const extrairJson = (texto = '') => {
    const limpo = texto
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');

    if (inicio === -1 || fim === -1) {
        throw new Error('Resposta da IA nao retornou JSON.');
    }

    return JSON.parse(limpo.slice(inicio, fim + 1));
};

const montarPromptMatch = (talento, vaga, analiseLocal) => `
Voce e uma IA especialista em recrutamento tech.
Analise a compatibilidade entre candidato e vaga.
Responda somente em JSON valido, sem markdown.

Formato obrigatorio:
{
  "score": 0,
  "recomendacao": "texto curto",
  "resumo": "texto curto para RH",
  "pontosFortes": ["item"],
  "pontosAtencao": ["item"],
  "perguntasEntrevista": ["pergunta"],
  "confianca": 0
}

Regras:
- score deve ir de 0 a 100.
- Nao invente habilidades que nao aparecem nos dados.
- Seja objetivo e profissional.
- Considere skills, experiencia, senioridade, formacao, certificacoes, localizacao e salario.

Candidato:
${JSON.stringify(talento, null, 2)}

Vaga:
${JSON.stringify(vaga, null, 2)}

Analise local inicial:
${JSON.stringify(analiseLocal, null, 2)}
`;

export const analisarMatchGemini = async (talento, vaga, pesos = {}) => {
    const analiseLocal = calcularMatchIA(talento, vaga, pesos);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
        return {
            ...analiseLocal,
            origem: 'local',
            aviso: 'Configure VITE_GEMINI_API_KEY no arquivo .env para usar a API Gemini.'
        };
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: montarPromptMatch(talento, vaga, analiseLocal)
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: 'application/json'
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API retornou ${response.status}`);
        }

        const data = await response.json();
        const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const json = extrairJson(texto);
        const score = Math.max(0, Math.min(100, Number(json.score) || analiseLocal.score));

        return {
            ...analiseLocal,
            ...json,
            score,
            nivel: criarNivel(score),
            cor: criarCor(score),
            origem: 'gemini'
        };
    } catch (error) {
        return {
            ...analiseLocal,
            origem: 'fallback',
            aviso: `Nao foi possivel consultar a API Gemini. Usando analise local. (${error.message})`
        };
    }
};
