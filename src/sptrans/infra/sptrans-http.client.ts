import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * HTTP client responsável por toda comunicação direta com a API Olho Vivo SPTrans.
 *
 * Gerencia a autenticação via cookie (POST /Login/Autenticar) e fornece
 * um método genérico para cada endpoint da API.
 */
@Injectable()
export class SpTransHttpClient implements OnModuleInit {
  private readonly logger = new Logger(SpTransHttpClient.name);
  private readonly http: AxiosInstance;
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('SPTRANS_TOKEN');

    if (!token) {
      this.logger.warn(
        'SPTRANS_TOKEN não definido. Autenticação irá falhar.',
      );
    }

    this.token = token ?? '';

    // Axios mantém cookies automaticamente entre chamadas dentro da mesma
    // instância quando `withCredentials` está habilitado, mas como rodamos
    // em Node.js (sem browser) precisamos gerenciar o Set-Cookie manualmente.
    this.http = axios.create({
      baseURL: 'http://api.olhovivo.sptrans.com.br/v2.1',
      timeout: 15_000,
    });

    // Interceptor: propaga o cookie recebido no login para todas as chamadas.
    let sessionCookie = '';

    this.http.interceptors.response.use((response) => {
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        sessionCookie = setCookie.map((c: string) => c.split(';')[0]).join('; ');
      }
      return response;
    });

    this.http.interceptors.request.use((config) => {
      if (sessionCookie) {
        config.headers['Cookie'] = sessionCookie;
      }
      return config;
    });
  }

  /** Autentica na API SPTrans. Chamado automaticamente ao iniciar o módulo. */
  async onModuleInit(): Promise<void> {
    await this.autenticar();
  }

  async autenticar(): Promise<boolean> {
    try {
      const response = await this.http.post<boolean>(
        `/Login/Autenticar?token=${this.token}`,
      );
      const success = response.data === true || String(response.data) === 'true';

      if (success) {
        this.logger.log('Autenticação SPTrans realizada com sucesso.');
      } else {
        this.logger.error(
          'Falha na autenticação SPTrans. Verifique o token.',
        );
      }
      return success;
    } catch (error) {
      this.logger.error('Erro ao autenticar na API SPTrans:', error);
      return false;
    }
  }

  // ─── Linhas ─────────────────────────────────────────────────────────────

  async buscarLinhas<T>(termosBusca: string): Promise<T> {
    const { data } = await this.http.get<T>('/Linha/Buscar', {
      params: { termosBusca },
    });
    return data;
  }

  async buscarLinhaSentido<T>(termosBusca: string, sentido: number): Promise<T> {
    const { data } = await this.http.get<T>('/Linha/BuscarLinhaSentido', {
      params: { termosBusca, sentido },
    });
    return data;
  }

  // ─── Paradas ────────────────────────────────────────────────────────────

  async buscarParadas<T>(termosBusca: string): Promise<T> {
    const { data } = await this.http.get<T>('/Parada/Buscar', {
      params: { termosBusca },
    });
    return data;
  }

  async buscarParadasPorLinha<T>(codigoLinha: number): Promise<T> {
    const { data } = await this.http.get<T>('/Parada/BuscarParadasPorLinha', {
      params: { codigoLinha },
    });
    return data;
  }

  async buscarParadasPorCorredor<T>(codigoCorredor: number): Promise<T> {
    const { data } = await this.http.get<T>('/Parada/BuscarParadasPorCorredor', {
      params: { codigoCorredor },
    });
    return data;
  }

  // ─── Corredores ─────────────────────────────────────────────────────────

  async listarCorredores<T>(): Promise<T> {
    const { data } = await this.http.get<T>('/Corredor');
    return data;
  }

  // ─── Empresas ─────────────────────────────────────────────────────────

  async listarEmpresas<T>(): Promise<T> {
    const { data } = await this.http.get<T>('/Empresa');
    return data;
  }

  // ─── Posição dos veículos ───────────────────────────────────────────────

  async getPosicao<T>(): Promise<T> {
    const { data } = await this.http.get<T>('/Posicao');
    return data;
  }

  async getPosicaoPorLinha<T>(codigoLinha: number): Promise<T> {
    const { data } = await this.http.get<T>('/Posicao/Linha', {
      params: { codigoLinha },
    });
    return data;
  }

  async getPosicaoGaragem<T>(
    codigoEmpresa: number,
    codigoLinha?: number,
  ): Promise<T> {
    const { data } = await this.http.get<T>('/Posicao/Garagem', {
      params: { codigoEmpresa, ...(codigoLinha !== undefined && { codigoLinha }) },
    });
    return data;
  }

  // ─── Previsão de chegada ─────────────────────────────────────────────────

  async getPrevisao<T>(codigoParada: number, codigoLinha: number): Promise<T> {
    const { data } = await this.http.get<T>('/Previsao', {
      params: { codigoParada, codigoLinha },
    });
    return data;
  }

  async getPrevisaoPorLinha<T>(codigoLinha: number): Promise<T> {
    const { data } = await this.http.get<T>('/Previsao/Linha', {
      params: { codigoLinha },
    });
    return data;
  }

  async getPrevisaoPorParada<T>(codigoParada: number): Promise<T> {
    const { data } = await this.http.get<T>('/Previsao/Parada', {
      params: { codigoParada },
    });
    return data;
  }
}
