export class EmpresaItem {
  /** Código da empresa */
  c: number;

  /** Nome da empresa */
  n: string;

  /** Área de operação */
  a: number;
}

export class EmpresaArea {
  a: number;
  e: EmpresaItem[];
}

export class Empresa {
  /** Horário de referência */
  hr: string;

  /** Lista de áreas com empresas */
  e: EmpresaArea[];
}
