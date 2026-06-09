export const types = {
  pdf: 'application/pdf',
  allFiles: '*/*',
};

export interface DocumentPickerResponse {
  uri: string;
  name: string | null;
  size: number | null;
  type: string | null;
}

let nextResult: DocumentPickerResponse[] = [
  {uri: 'file:///mock/document.pdf', name: 'document.pdf', size: 1024, type: 'application/pdf'},
];

export function __setNextResult(result: DocumentPickerResponse[]): void {
  nextResult = result;
}

export function pick(): Promise<DocumentPickerResponse[]> {
  return Promise.resolve(nextResult);
}

export function pickSingle(): Promise<DocumentPickerResponse> {
  return Promise.resolve(nextResult[0]);
}

export function isCancel(_err: unknown): boolean {
  return false;
}

export default {types, pick, pickSingle, isCancel};
