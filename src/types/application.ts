export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type DocumentStatus = 'generated' | 'signed';

export type DocumentType = 
  | 'participation_agreement'
  | 'antidoping_declaration'
  | 'ethical_declaration'
  | 'personal_data_consent'
  | 'nda';

export interface Document {
  id: string;
  type: DocumentType;
  name: string;
  createdAt: Date;
  uploadedAt?: Date;
  status: DocumentStatus;
  fileUrl?: string;
  version: number;
  fileSize?: number; // Размер в байтах
  signedFileUrl?: string; // URL подписанного документа
}

export interface Athlete {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Application {
  id: string;
  athleteId: string;
  athleteName: string;
  athleteEmail?: string;
  athletePhone?: string;
  competitionId: string;
  competitionName: string;
  competitionDiscipline?: string;
  competitionSport?: string;
  competitionDates: {
    start: Date;
    end: Date;
  };
  competitionParticipants?: {
    current: number;
    total: number;
  };
  submittedAt: Date;
  status: ApplicationStatus;
  statusChangedAt?: Date;
  rejectionReason?: string;
  documents?: Document[];
}