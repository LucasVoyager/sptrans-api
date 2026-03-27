import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  Optional,
} from '@nestjs/common';
import { SpTransService } from './sptrans.service';

/**
 * Controller REST que expõe os endpoints da API SPTrans Olho Vivo.
 *
 * Prefixo: /sptrans
 */
@Controller('sptrans')
export class SpTransController {
  constructor(private readonly spTransService: SpTransService) {}

  // ─── Linhas ─────────────────────────────────────────────────────────────

  /** GET /sptrans/linhas?termos=8000 */
  @Get('linhas')
  buscarLinhas(@Query('termos') termos: string) {
    return this.spTransService.buscarLinhas(termos);
  }

  /** GET /sptrans/linhas/sentido?termos=8000&sentido=1 */
  @Get('linhas/sentido')
  buscarLinhaSentido(
    @Query('termos') termos: string,
    @Query('sentido', ParseIntPipe) sentido: number,
  ) {
    return this.spTransService.buscarLinhaSentido(termos, sentido);
  }

  // ─── Paradas ────────────────────────────────────────────────────────────

  /** GET /sptrans/paradas?termos=Afonso */
  @Get('paradas')
  buscarParadas(@Query('termos') termos: string) {
    return this.spTransService.buscarParadas(termos);
  }

  /** GET /sptrans/paradas/por-linha?codigoLinha=1273 */
  @Get('paradas/por-linha')
  buscarParadasPorLinha(
    @Query('codigoLinha', ParseIntPipe) codigoLinha: number,
  ) {
    return this.spTransService.buscarParadasPorLinha(codigoLinha);
  }

  /** GET /sptrans/paradas/por-corredor?codigoCorredor=8 */
  @Get('paradas/por-corredor')
  buscarParadasPorCorredor(
    @Query('codigoCorredor', ParseIntPipe) codigoCorredor: number,
  ) {
    return this.spTransService.buscarParadasPorCorredor(codigoCorredor);
  }

  // ─── Corredores ─────────────────────────────────────────────────────────

  /** GET /sptrans/corredores */
  @Get('corredores')
  listarCorredores() {
    return this.spTransService.listarCorredores();
  }

  // ─── Empresas ───────────────────────────────────────────────────────────

  /** GET /sptrans/empresas */
  @Get('empresas')
  listarEmpresas() {
    return this.spTransService.listarEmpresas();
  }

  // ─── Posição dos veículos ────────────────────────────────────────────────

  /** GET /sptrans/posicao */
  @Get('posicao')
  getPosicaoVeiculos() {
    return this.spTransService.getPosicaoVeiculos();
  }

  /** GET /sptrans/posicao/linha?codigoLinha=1273 */
  @Get('posicao/linha')
  getPosicaoPorLinha(
    @Query('codigoLinha', ParseIntPipe) codigoLinha: number,
  ) {
    return this.spTransService.getPosicaoPorLinha(codigoLinha);
  }

  /**
   * GET /sptrans/posicao/garagem?codigoEmpresa=999
   * GET /sptrans/posicao/garagem?codigoEmpresa=999&codigoLinha=1273
   */
  @Get('posicao/garagem')
  getPosicaoGaragem(
    @Query('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Query('codigoLinha') @Optional() codigoLinhaStr?: string,
  ) {
    const codigoLinha = codigoLinhaStr ? parseInt(codigoLinhaStr, 10) : undefined;
    return this.spTransService.getPosicaoGaragem(codigoEmpresa, codigoLinha);
  }

  // ─── Previsão de chegada ─────────────────────────────────────────────────

  /** GET /sptrans/previsao?codigoParada=340015329&codigoLinha=1273 */
  @Get('previsao')
  getPrevisao(
    @Query('codigoParada', ParseIntPipe) codigoParada: number,
    @Query('codigoLinha', ParseIntPipe) codigoLinha: number,
  ) {
    return this.spTransService.getPrevisao(codigoParada, codigoLinha);
  }

  /** GET /sptrans/previsao/linha?codigoLinha=1273 */
  @Get('previsao/linha')
  getPrevisaoPorLinha(
    @Query('codigoLinha', ParseIntPipe) codigoLinha: number,
  ) {
    return this.spTransService.getPrevisaoPorLinha(codigoLinha);
  }

  /** GET /sptrans/previsao/parada?codigoParada=340015329 */
  @Get('previsao/parada')
  getPrevisaoPorParada(
    @Query('codigoParada', ParseIntPipe) codigoParada: number,
  ) {
    return this.spTransService.getPrevisaoPorParada(codigoParada);
  }
}
