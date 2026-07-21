import { describe, expect, it } from 'vitest';

import { buildDefaultPipelineSeed } from './defaults';

describe('buildDefaultPipelineSeed', () => {
  it('creates the pt-BR default pipeline with the expected order and colors', () => {
    expect(
      buildDefaultPipelineSeed({
        pipelineName: 'Funil de vendas',
        stages: {
          newLead: 'Novo lead',
          qualified: 'Qualificado',
          proposalSent: 'Proposta enviada',
          negotiation: 'Negociação',
          won: 'Ganho',
        },
      })
    ).toEqual({
      name: 'Funil de vendas',
      stages: [
        { name: 'Novo lead', color: '#3b82f6', position: 0 },
        { name: 'Qualificado', color: '#eab308', position: 1 },
        { name: 'Proposta enviada', color: '#f97316', position: 2 },
        { name: 'Negociação', color: '#8b5cf6', position: 3 },
        { name: 'Ganho', color: '#22c55e', position: 4 },
      ],
    });
  });
});
