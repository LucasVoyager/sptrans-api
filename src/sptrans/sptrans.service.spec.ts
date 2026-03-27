import { Test, TestingModule } from '@nestjs/testing';
import { SpTransService } from './sptrans.service';
import { SpTransHttpClient } from './infra/sptrans-http.client';
import { Linha } from './domain/linha.entity';
import { Parada } from './domain/parada.entity';
import { Corredor } from './domain/corredor.entity';

/**
 * Testes unitários para SpTransService.
 * O SpTransHttpClient é substituído por um mock para isolar o service.
 */
describe('SpTransService', () => {
  let service: SpTransService;
  let httpClient: jest.Mocked<SpTransHttpClient>;

  const mockLinha: Linha = {
    cl: 1273,
    lc: false,
    lt: '8000',
    sl: 1,
    tl: 10,
    tp: 'PCA.RAMOS DE AZEVEDO',
    ts: 'TERMINAL LAPA',
  };

  const mockParada: Parada = {
    cp: 340015329,
    np: 'AFONSO BRAZ B/C1',
    ed: 'R ARMINDA/ R BALTHAZAR DA VEIGA',
    py: -23.592938,
    px: -46.672727,
  };

  const mockCorredor: Corredor = { cc: 8, nc: 'Campo Limpo' };

  beforeEach(async () => {
    const mockHttpClient: Partial<jest.Mocked<SpTransHttpClient>> = {
      buscarLinhas: jest.fn().mockResolvedValue([mockLinha]),
      buscarLinhaSentido: jest.fn().mockResolvedValue([mockLinha]),
      buscarParadas: jest.fn().mockResolvedValue([mockParada]),
      buscarParadasPorLinha: jest.fn().mockResolvedValue([mockParada]),
      buscarParadasPorCorredor: jest.fn().mockResolvedValue([mockParada]),
      listarCorredores: jest.fn().mockResolvedValue([mockCorredor]),
      listarEmpresas: jest.fn().mockResolvedValue({ hr: '11:20', e: [] }),
      getPosicao: jest.fn().mockResolvedValue({ hr: '11:30', l: [] }),
      getPosicaoPorLinha: jest.fn().mockResolvedValue({ hr: '19:57', vs: [] }),
      getPosicaoGaragem: jest.fn().mockResolvedValue({ hr: '11:30', l: [] }),
      getPrevisao: jest.fn().mockResolvedValue({ hr: '20:09', p: {} }),
      getPrevisaoPorLinha: jest.fn().mockResolvedValue({ hr: '20:18', ps: [] }),
      getPrevisaoPorParada: jest.fn().mockResolvedValue({ hr: '20:20', p: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpTransService,
        { provide: SpTransHttpClient, useValue: mockHttpClient },
      ],
    }).compile();

    service = module.get<SpTransService>(SpTransService);
    httpClient = module.get(SpTransHttpClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Linhas ────────────────────────────────────────────────────────────

  describe('buscarLinhas', () => {
    it('deve chamar httpClient.buscarLinhas com o termo correto', async () => {
      const result = await service.buscarLinhas('8000');
      expect(httpClient.buscarLinhas).toHaveBeenCalledWith('8000');
      expect(result).toEqual([mockLinha]);
    });
  });

  describe('buscarLinhaSentido', () => {
    it('deve chamar httpClient.buscarLinhaSentido com termos e sentido corretos', async () => {
      const result = await service.buscarLinhaSentido('8000', 1);
      expect(httpClient.buscarLinhaSentido).toHaveBeenCalledWith('8000', 1);
      expect(result).toEqual([mockLinha]);
    });
  });

  // ─── Paradas ───────────────────────────────────────────────────────────

  describe('buscarParadas', () => {
    it('deve chamar httpClient.buscarParadas com o termo correto', async () => {
      const result = await service.buscarParadas('Afonso');
      expect(httpClient.buscarParadas).toHaveBeenCalledWith('Afonso');
      expect(result).toEqual([mockParada]);
    });
  });

  describe('buscarParadasPorLinha', () => {
    it('deve chamar httpClient.buscarParadasPorLinha com o código correto', async () => {
      const result = await service.buscarParadasPorLinha(1273);
      expect(httpClient.buscarParadasPorLinha).toHaveBeenCalledWith(1273);
      expect(result).toEqual([mockParada]);
    });
  });

  describe('buscarParadasPorCorredor', () => {
    it('deve chamar httpClient.buscarParadasPorCorredor com o código correto', async () => {
      const result = await service.buscarParadasPorCorredor(8);
      expect(httpClient.buscarParadasPorCorredor).toHaveBeenCalledWith(8);
      expect(result).toEqual([mockParada]);
    });
  });

  // ─── Corredores ────────────────────────────────────────────────────────

  describe('listarCorredores', () => {
    it('deve chamar httpClient.listarCorredores', async () => {
      const result = await service.listarCorredores();
      expect(httpClient.listarCorredores).toHaveBeenCalled();
      expect(result).toEqual([mockCorredor]);
    });
  });

  // ─── Empresas ──────────────────────────────────────────────────────────

  describe('listarEmpresas', () => {
    it('deve chamar httpClient.listarEmpresas', async () => {
      const result = await service.listarEmpresas();
      expect(httpClient.listarEmpresas).toHaveBeenCalled();
      expect(result).toEqual({ hr: '11:20', e: [] });
    });
  });

  // ─── Posição ───────────────────────────────────────────────────────────

  describe('getPosicaoVeiculos', () => {
    it('deve chamar httpClient.getPosicao', async () => {
      const result = await service.getPosicaoVeiculos();
      expect(httpClient.getPosicao).toHaveBeenCalled();
      expect(result).toEqual({ hr: '11:30', l: [] });
    });
  });

  describe('getPosicaoPorLinha', () => {
    it('deve chamar httpClient.getPosicaoPorLinha com o código correto', async () => {
      const result = await service.getPosicaoPorLinha(1273);
      expect(httpClient.getPosicaoPorLinha).toHaveBeenCalledWith(1273);
      expect(result).toEqual({ hr: '19:57', vs: [] });
    });
  });

  describe('getPosicaoGaragem', () => {
    it('deve chamar httpClient.getPosicaoGaragem com empresa e linha', async () => {
      const result = await service.getPosicaoGaragem(999, 1273);
      expect(httpClient.getPosicaoGaragem).toHaveBeenCalledWith(999, 1273);
      expect(result).toEqual({ hr: '11:30', l: [] });
    });

    it('deve chamar httpClient.getPosicaoGaragem sem linha opcional', async () => {
      await service.getPosicaoGaragem(999);
      expect(httpClient.getPosicaoGaragem).toHaveBeenCalledWith(999, undefined);
    });
  });

  // ─── Previsão ──────────────────────────────────────────────────────────

  describe('getPrevisao', () => {
    it('deve chamar httpClient.getPrevisao com parada e linha correta', async () => {
      const result = await service.getPrevisao(340015329, 1273);
      expect(httpClient.getPrevisao).toHaveBeenCalledWith(340015329, 1273);
      expect(result).toEqual({ hr: '20:09', p: {} });
    });
  });

  describe('getPrevisaoPorLinha', () => {
    it('deve chamar httpClient.getPrevisaoPorLinha com o código correto', async () => {
      const result = await service.getPrevisaoPorLinha(1273);
      expect(httpClient.getPrevisaoPorLinha).toHaveBeenCalledWith(1273);
      expect(result).toEqual({ hr: '20:18', ps: [] });
    });
  });

  describe('getPrevisaoPorParada', () => {
    it('deve chamar httpClient.getPrevisaoPorParada com o código correto', async () => {
      const result = await service.getPrevisaoPorParada(340015329);
      expect(httpClient.getPrevisaoPorParada).toHaveBeenCalledWith(340015329);
      expect(result).toEqual({ hr: '20:20', p: {} });
    });
  });
});
