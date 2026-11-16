export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: string[];
}

export interface WrongQuestion {
  id: string;
  subject: string;
  topic: string;
  questionType: string;
  text: string;
  image: string | null;
  note: string;
  solved: boolean;
  createdAt: number;
}

export interface ExamResult {
  id: string;
  date: string;
  name: string;
  turkce: number;
  sosyal: number;
  matematik: number;
  fen: number;
  total: number;
}

export interface CheckedTopics {
  [key: string]: boolean;
}

export type TabId = 'matrix' | 'notebook' | 'analysis';
