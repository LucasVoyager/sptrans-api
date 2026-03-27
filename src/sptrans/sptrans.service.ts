import { Injectable } from '@nestjs/common';
import { SpTransHttpClient } from './infra/sptrans-http.client';
import { Linha } from './domain/linha.entity';
import { Parada } from './domain/parada.entity';
import { Corredor } from './domain/corredor.entity';
import { Empresa } from './domain/empresa.entity';
import { Posicao, PosicaoPorLinha } from './domain/posicao.entity';
import {
  PrevisaoParada,
  PrevisaoPorLinha,
} from './domain/previsao.entity';

/**
 * Serviço de alto nível para a API SPTrans Olho Vivo.
 *
 * Delega as chamadas HTTP ao `SpTransHttpClient` e devolve
 * objetos fortemente tipados com os dados da resposta.
 */
@Injectable()
export class SpTransService {
  constructor(private readonly httpClient: SpTransHttpClient) {}

  // ─── Linhas ─────────────────────────────────────────────────────────────

  /** Busca linhas por denominação ou número (total ou parcial). */
  buscarLinhas(termosBusca: string): Promise<Linha[]> {
    return this.httpClient.buscarLinhas<Linha[]>(termosBusca);
  }

  /** Busca a linha filtrando também pelo sentido de operação (1 ou 2). */
  buscarLinhaSentido(termosBusca: string, sentido: number): Promise<Linha[]> {
    return this.httpClient.buscarLinhaSentido<Linha[]>(termosBusca, sentido);
  }

  // ─── Paradas ────────────────────────────────────────────────────────────

  /** Busca paradas por nome ou endereço (total ou parcial). */
  buscarParadas(termosBusca: string): Promise<Parada[]> {
    return this.httpClient.buscarParadas<Parada[]>(termosBusca);
  }

  /** Retorna todas as paradas atendidas por uma linha. */
  buscarParadasPorLinha(codigoLinha: number): Promise<Parada[]> {
    return this.httpClient.buscarParadasPorLinha<Parada[]>(codigoLinha);
  }

  /** Retorna todas as paradas de um corredor inteligente. */
  buscarParadasPorCorredor(codigoCorredor: number): Promise<Parada[]> {
    return this.httpClient.buscarParadasPorCorredor<Parada[]>(codigoCorredor);
  }

  // ─── Corredores ─────────────────────────────────────────────────────────

  /** Retorna todos os corredores inteligentes da cidade. */
  listarCorredores(): Promise<Corredor[]> {
    return this.httpClient.listarCorredores<Corredor[]>();
  }

  // ─── Empresas ───────────────────────────────────────────────────────────

  /** Retorna todas as empresas operadoras por área. */
  listarEmpresas(): Promise<Empresa> {
    return this.httpClient.listarEmpresas<Empresa>();
  }

  // ─── Posição dos veículos ────────────────────────────────────────────────

  /** Posição de todos os veículos mapeados. */
  getPosicaoVeiculos(): Promise<Posicao> {
    return this.httpClient.getPosicao<Posicao>();
  }

  /** Posição de todos os veículos de uma linha específica. */
  getPosicaoPorLinha(codigoLinha: number): Promise<PosicaoPorLinha> {
    return this.httpClient.getPosicaoPorLinha<PosicaoPorLinha>(codigoLinha);
  }

  /** Veículos de uma empresa transmitindo em garagem (opcionalmente filtrado por linha). */
  getPosicaoGaragem(codigoEmpresa: number, codigoLinha?: number): Promise<Posicao> {
    return this.httpClient.getPosicaoGaragem<Posicao>(codigoEmpresa, codigoLinha);
  }

  // ─── Previsão de chegada ─────────────────────────────────────────────────

  /** Previsão de chegada dos veículos de uma linha em uma parada específica. */
  getPrevisao(codigoParada: number, codigoLinha: number): Promise<PrevisaoParada> {
    return this.httpClient.getPrevisao<PrevisaoParada>(codigoParada, codigoLinha);
  }

  /** Previsão de chegada de todos os veículos de uma linha em todas as suas paradas. */
  getPrevisaoPorLinha(codigoLinha: number): Promise<PrevisaoPorLinha> {
    return this.httpClient.getPrevisaoPorLinha<PrevisaoPorLinha>(codigoLinha);
  }

  /** Previsão de chegada de todas as linhas que atendem uma parada. */
  getPrevisaoPorParada(codigoParada: number): Promise<PrevisaoParada> {
    return this.httpClient.getPrevisaoPorParada<PrevisaoParada>(codigoParada);
  }
}
