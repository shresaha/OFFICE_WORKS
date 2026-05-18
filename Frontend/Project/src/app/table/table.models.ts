export interface SystemHeading {
  id: string;
  name: string;
  created_at: string;
}

export interface CoreRow {
  core_name: string;

  values: {
    [systemHeadingId: string]: string | null;
  };
}

export interface TableGridResponse {
  headers: SystemHeading[];
  cores: string[];
  rows: CoreRow[];
}
