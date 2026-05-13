import { Controller, Post, Get, Body, Logger } from '@nestjs/common';
import { ExtractorService } from './extractor.service';

/**
 * Controller REST para o módulo Extrator.
 *
 * Permite triggerar o processamento de arquivos GTFS e de passageiros
 * via chamadas HTTP, e consultar o status da última execução.
 *
 * Prefixo: /extractor
 */
@Controller('extractor')
export class ExtractorController {
  private readonly logger = new Logger(ExtractorController.name);

  constructor(private readonly extractorService: ExtractorService) { }

  /**
   * POST /extractor/process-gtfs
   * Processa um arquivo ZIP GTFS local.
   *
   * Body: { "zipPath": "C:\\caminho\\para\\arquivo.zip" }
   */
  @Post('process-gtfs')
  async processGtfs(@Body() body: { zipPath: string }) {
    this.logger.log(`Requisição para processar GTFS: ${body.zipPath}`);
    return this.extractorService.processGtfs(body.zipPath);
  }

  /**
   * POST /extractor/process-passageiros
   * Processa um arquivo CSV de passageiros local.
   *
   * Body: { "csvPath": "C:\\caminho\\para\\PassageiroSpTransTotal.csv" }
   */
  @Post('process-passageiros')
  async processPassageiros(@Body() body: { csvPath: string }) {
    this.logger.log(`Requisição para processar Passageiros: ${body.csvPath}`);
    return this.extractorService.processPassageiros(body.csvPath);
  }

  /**
   * GET /extractor/status
   * Retorna o resultado da última execução do pipeline.
   */
  @Get('status')
  getStatus() {
    return this.extractorService.getStatus();
  }
}
