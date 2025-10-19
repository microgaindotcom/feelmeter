export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  category: string;
  createdAt: number;
  duration: number; 
}

export interface MeterQuestion {
  question: string;
  options: string[];
  type: 'radio' | 'slider';
}

export enum MeterCategory {
  Love = "ভালোবাসা",
  Friendship = "বন্ধুত্ব",
  Laziness = "অলসতা",
  Mood = "মুড",
  Maturity = "ম্যাচিউরিটি",
  Frustration = "হতাশার লেবেল",
  Foodie = "খাদ্য প্রেমিক",
  Intelligence = "বুদ্ধিমত্তা মিটার",
  Creativity = "সৃজনশীলতা স্কোর"
}
