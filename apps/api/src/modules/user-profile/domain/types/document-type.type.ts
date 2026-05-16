export const DOCUMENT_TYPES = ['DNI', 'NIE', 'PASSPORT', 'CC'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

