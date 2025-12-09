export type CompetitionStatus = 'planned' | 'ongoing' | 'completed';

export type Gender = 'male' | 'female' | 'mixed';

export type ParticipantStatus = 'pending' | 'approved' | 'rejected';

export interface Organizer {
  fullName: string;
  ogrn: string;
  inn: string;
}

export interface Participant {
  id: string;
  fullName: string;
  status: ParticipantStatus;
}

export interface Referee {
  id: string;
  fullName: string;
}

export interface Competition {
  id: string;
  officialFullName: string;
  officialShortName: string;
  alternativeNames?: string[];
  organizer: Organizer;
  coOrganizer?: Organizer;
  sportType: string;
  discipline: string;
  videoGame?: string;
  startDate: Date;
  endDate: Date;
  participantsCount: number;
  currentParticipants?: number;
  includedInMinistryList: boolean;
  gender: Gender;
  status: CompetitionStatus;
  participants?: Participant[];
  referees?: Referee[];
}

export interface CompetitionFilters {
  search: string;
  status: CompetitionStatus | 'all';
  dateFrom: Date | null;
  dateTo: Date | null;
  athleteFilter?: 'all' | 'applied' | 'available';
}