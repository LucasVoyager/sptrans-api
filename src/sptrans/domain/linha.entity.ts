export class Linha {
  /** Código identificador da linha (único por sentido de operação) */
  cl: number;

  /** Indica se a linha opera em modo circular */
  lc: boolean;

  /** Primeira parte do letreiro numérico (ex: "8000") */
  lt: string;

  /**
   * Sentido de operação:
   * 1 = Terminal Principal → Terminal Secundário
   * 2 = Terminal Secundário → Terminal Principal
   */
  sl: number;

  /**
   * Segunda parte do letreiro numérico (tipo de operação):
   * 10 = BASE, 21/23/32/41 = ATENDIMENTO
   */
  tl: number;

  /** Letreiro descritivo no sentido Principal → Secundário */
  tp: string;

  /** Letreiro descritivo no sentido Secundário → Principal */
  ts: string;
}
