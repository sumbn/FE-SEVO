// Content types (FLOW 6)
export interface Content {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}
export interface ContentMap {
  [key: string]: string;
}

// Course types (FLOW 2)
export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  ageRange?: string;
  duration?: string;
  status: 'published' | 'draft';
}

// Lead types (FLOW 3)
export interface LeadFormData {
  parentName: string;
  phone: string;
  studentName?: string;
  studentAge?: number;
  courseId?: string;
}
