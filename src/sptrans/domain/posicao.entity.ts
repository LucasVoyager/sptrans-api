export class Veiculo {
  /** Prefixo do veículo */
  p: number | string;

  /** Acessível para pessoas com deficiência */
  a: boolean;

  /** Horário UTC da captura da localização (ISO 8601) */
  ta: string;

  /** Latitude */
  py: number;

  /** Longitude */
  px: number;

  /** Previsão de chegada (apenas em contextos de previsão) */
  t?: string;
}

export class LinhaVeiculos {
  /** Letreiro completo */
  c: string;

  /** Código identificador da linha */
  cl: number;

  /**
   * Sentido de operação:
   * 1 = Terminal Principal → Terminal Secundário
   * 2 = Terminal Secundário → Terminal Principal
   */
  sl: number;

  /** Letreiro de destino */
  lt0: string;

  /** Letreiro de origem */
  lt1: string;

  /** Quantidade de veículos localizados */
  qv: number;

  /** Relação de veículos localizados */
  vs: Veiculo[];
}

export class Posicao {
  /** Horário de referência da geração das informações */
  hr: string;

  /** Relação de linhas com veículos localizados */
  l: LinhaVeiculos[];
}

export class PosicaoPorLinha {
  /** Horário de referência */
  hr: string;

  /** Veículos da linha */
  vs: Veiculo[];
}
