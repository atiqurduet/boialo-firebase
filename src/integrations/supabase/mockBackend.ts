// Firestore-backed PostgREST & Edge Functions adapter for Supabase client
// Keeps the existing project structure intact while persisting data in Firebase Firestore.
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';

const MENU_ID = '11111111-1111-4111-8111-111111111111';
const FOOTER_SEC_1 = '22222222-2222-4222-8222-222222222201';
const FOOTER_SEC_2 = '22222222-2222-4222-8222-222222222202';
const FOOTER_SEC_3 = '22222222-2222-4222-8222-222222222203';
const FOOTER_SEC_4 = '22222222-2222-4222-8222-222222222204';

const CAT_ISLAMIC = '33333333-3333-4333-8333-333333333301';
const CAT_NOVEL = '33333333-3333-4333-8333-333333333302';
const CAT_ACADEMIC = '33333333-3333-4333-8333-333333333303';
const CAT_CHILDREN = '33333333-3333-4333-8333-333333333304';
const CAT_SELFHELP = '33333333-3333-4333-8333-333333333305';
const CAT_HISTORY = '33333333-3333-4333-8333-333333333306';
const CAT_SCIENCE = '33333333-3333-4333-8333-333333333307';
const CAT_TRANSLATION = '33333333-3333-4333-8333-333333333308';
const CAT_MADRASA = '33333333-3333-4333-8333-333333333309';

const WRITER_1 = '44444444-4444-4444-8444-444444444401';
const WRITER_2 = '44444444-4444-4444-8444-444444444402';
const WRITER_3 = '44444444-4444-4444-8444-444444444403';
const WRITER_4 = '44444444-4444-4444-8444-444444444404';
const WRITER_5 = '44444444-4444-4444-8444-444444444405';
const WRITER_6 = '44444444-4444-4444-8444-444444444406';

const PUB_1 = '55555555-5555-4555-8555-555555555501';
const PUB_2 = '55555555-5555-4555-8555-555555555502';
const PUB_3 = '55555555-5555-4555-8555-555555555503';
const PUB_4 = '55555555-5555-4555-8555-555555555504';

const nowIso = new Date().toISOString();

const categoriesSeed = [
  // Parent Categories (Top 4 match screenshot: একাডেমিক, শিশু-কিশোর বই, ইতিহাস ও ঐতিহ্য, কওমি মাদ্রাসা)
  { id: CAT_ACADEMIC, name_bn: 'একাডেমিক', name_en: 'Academic Books', slug: 'academic', image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 1, is_active: true, created_at: nowIso },
  { id: CAT_CHILDREN, name_bn: 'শিশু-কিশোর বই', name_en: 'Children Books', slug: 'children', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 2, is_active: true, created_at: nowIso },
  { id: CAT_HISTORY, name_bn: 'ইতিহাস ও ঐতিহ্য', name_en: 'History & Tradition', slug: 'history', image_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 3, is_active: true, created_at: nowIso },
  { id: CAT_MADRASA, name_bn: 'কওমি মাদ্রাসা', name_en: 'Qawmi Madrasa', slug: 'qawmi-madrasa', image_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 4, is_active: true, created_at: nowIso },
  { id: CAT_ISLAMIC, name_bn: 'ইসলামি বই', name_en: 'Islamic Books', slug: 'islamic', image_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 5, is_active: true, created_at: nowIso },
  { id: CAT_NOVEL, name_bn: 'উপন্যাস ও সাহিত্য', name_en: 'Novels & Literature', slug: 'novels', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 6, is_active: true, created_at: nowIso },
  { id: CAT_SELFHELP, name_bn: 'আত্মউন্নয়ন ও মোটিভেশন', name_en: 'Self Help', slug: 'self-help', image_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 7, is_active: true, created_at: nowIso },
  { id: CAT_SCIENCE, name_bn: 'বিজ্ঞান ও প্রযুক্তি', name_en: 'Science & Tech', slug: 'science', image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 8, is_active: true, created_at: nowIso },
  { id: CAT_TRANSLATION, name_bn: 'অনুবাদ সাহিত্য', name_en: 'Translated Literature', slug: 'translation', image_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 9, is_active: true, created_at: nowIso },

  // Subcategories for একাডেমিক (Academic) - Matching screenshot
  { id: 'sub-acad-1', name_bn: 'ইউনিভার্সিটি', name_en: 'University Admission', slug: 'university-admission', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80', parent_id: CAT_ACADEMIC, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-acad-2', name_bn: 'একাদশ-দ্বাদশ শ্রেণি', name_en: 'HSC 11-12', slug: 'hsc-higher-secondary', image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80', parent_id: CAT_ACADEMIC, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-acad-3', name_bn: 'কারিগরি', name_en: 'Polytechnic Technical', slug: 'polytechnic-vocational', image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80', parent_id: CAT_ACADEMIC, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-acad-4', name_bn: 'মেডিকেল', name_en: 'Medical Admission', slug: 'medical-admission', image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80', parent_id: CAT_ACADEMIC, sort_order: 4, is_active: true, created_at: nowIso },

  // Subcategories for শিশু-কিশোর বই (Children) - Matching screenshot
  { id: 'sub-child-1', name_bn: 'শিশু-কিশোর', name_en: 'Children Books', slug: 'kids-stories', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80', parent_id: CAT_CHILDREN, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-child-2', name_bn: 'বয়স যখন ০-৪', name_en: 'Age 0-4', slug: 'kids-age-0-4', image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=80', parent_id: CAT_CHILDREN, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-child-3', name_bn: 'বয়স যখন ১২-১৭', name_en: 'Age 12-17', slug: 'kids-age-12-17', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80', parent_id: CAT_CHILDREN, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-child-4', name_bn: 'বয়স যখন ৪-৮', name_en: 'Age 4-8', slug: 'kids-age-4-8', image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80', parent_id: CAT_CHILDREN, sort_order: 4, is_active: true, created_at: nowIso },

  // Subcategories for ইতিহাস ও ঐতিহ্য (History) - Matching screenshot
  { id: 'sub-hist-1', name_bn: 'ইতিহাস ও সংস্কৃতি', name_en: 'History & Culture', slug: 'history-culture', image_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80', parent_id: CAT_HISTORY, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-hist-2', name_bn: 'দেশভিত্তিক ইতিহাস', name_en: 'Country History', slug: 'palestine-world-history', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80', parent_id: CAT_HISTORY, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-hist-3', name_bn: 'প্রত্নতাত্ত্বিক ইতিহাস', name_en: 'Archaeology History', slug: 'archaeological-history', image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80', parent_id: CAT_HISTORY, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-hist-4', name_bn: 'প্রাচীন সভ্যতার ইতিহাস', name_en: 'Ancient Civilization', slug: 'ancient-civilizations', image_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80', parent_id: CAT_HISTORY, sort_order: 4, is_active: true, created_at: nowIso },

  // Subcategories for কওমি মাদ্রাসা (Qawmi Madrasa) - Matching screenshot
  { id: 'sub-mad-1', name_bn: 'আদব বিভাগ', name_en: 'Adab Literature', slug: 'adab-department', image_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80', parent_id: CAT_MADRASA, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-mad-2', name_bn: 'আরবি ও উর্দু অভিধান', name_en: 'Arabic & Urdu Dictionary', slug: 'arabic-urdu-dictionary', image_url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80', parent_id: CAT_MADRASA, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-mad-3', name_bn: 'আরবি ব্যাকরণ', name_en: 'Arabic Grammar', slug: 'arabic-grammar', image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80', parent_id: CAT_MADRASA, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-mad-4', name_bn: 'উলূমুল হাদিস বিভাগ', name_en: 'Ulumul Hadith', slug: 'ulumul-hadith', image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80', parent_id: CAT_MADRASA, sort_order: 4, is_active: true, created_at: nowIso },

  // Subcategories for ইসলামি বই (Islamic)
  { id: 'sub-isl-1', name_bn: 'কুরআন ও তাফসির', name_en: 'Quran & Tafsir', slug: 'quran-tafsir', image_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80', parent_id: CAT_ISLAMIC, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-isl-2', name_bn: 'হাদিস ও সুন্নাহ', name_en: 'Hadith & Sunnah', slug: 'hadith-sunnah', image_url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80', parent_id: CAT_ISLAMIC, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-isl-3', name_bn: 'সীরাত ও ইতিহাস', name_en: 'Seerat', slug: 'seerat-rasool', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80', parent_id: CAT_ISLAMIC, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-isl-4', name_bn: 'দোয়া ও যিকর', name_en: 'Dua & Dhikr', slug: 'dua-dhikr', image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80', parent_id: CAT_ISLAMIC, sort_order: 4, is_active: true, created_at: nowIso },

  // Subcategories for উপন্যাস ও সাহিত্য (Novels & Literature)
  { id: 'sub-nov-1', name_bn: 'সমকালীন উপন্যাস', name_en: 'Contemporary Novel', slug: 'contemporary-novel', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80', parent_id: CAT_NOVEL, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-nov-2', name_bn: 'চিরায়ত সাহিত্য', name_en: 'Classic Literature', slug: 'classic-literature', image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80', parent_id: CAT_NOVEL, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-nov-3', name_bn: 'থ্রিলার ও রহস্য', name_en: 'Thriller & Mystery', slug: 'thriller-mystery', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80', parent_id: CAT_NOVEL, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-nov-4', name_bn: 'কবিতা ও গল্পগ্রন্থ', name_en: 'Poetry & Short Stories', slug: 'poetry-stories', image_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80', parent_id: CAT_NOVEL, sort_order: 4, is_active: true, created_at: nowIso },

  // Subcategories for আত্মউন্নয়ন ও মোটিভেশন (Self Help)
  { id: 'sub-self-1', name_bn: 'ব্যক্তিত্ব ও ক্যারিয়ার', name_en: 'Career & Personality', slug: 'career-personality', image_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80', parent_id: CAT_SELFHELP, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-self-2', name_bn: 'প্রোডাক্টিভিটি ও অভ্যাস', name_en: 'Productivity & Habits', slug: 'productivity-habits', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80', parent_id: CAT_SELFHELP, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-self-3', name_bn: 'মানসিক প্রশান্তি', name_en: 'Mindfulness', slug: 'mindfulness', image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80', parent_id: CAT_SELFHELP, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-self-4', name_bn: 'লিডারশিপ ও বিজনেস', name_en: 'Leadership & Business', slug: 'leadership-business', image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80', parent_id: CAT_SELFHELP, sort_order: 4, is_active: true, created_at: nowIso },

  // Subcategories for বিজ্ঞান ও প্রযুক্তি (Science & Tech)
  { id: 'sub-sci-1', name_bn: 'বিজ্ঞান ও মহাবিশ্ব', name_en: 'Science & Universe', slug: 'science-universe', image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80', parent_id: CAT_SCIENCE, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-sci-2', name_bn: 'প্রোগ্রামিং ও কোডিং', name_en: 'Programming & Coding', slug: 'programming-coding', image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80', parent_id: CAT_SCIENCE, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-sci-3', name_bn: 'সায়েন্স ফিকশন', name_en: 'Science Fiction', slug: 'sci-fi-books', image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80', parent_id: CAT_SCIENCE, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-sci-4', name_bn: 'গণিত ও অলিম্পিয়াড', name_en: 'Math & Olympiad', slug: 'math-olympiad', image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80', parent_id: CAT_SCIENCE, sort_order: 4, is_active: true, created_at: nowIso },

  // Subcategories for অনুবাদ সাহিত্য (Translated Literature)
  { id: 'sub-tr-1', name_bn: 'বিশ্বসাহিত্য অনুবাদ', name_en: 'World Literature', slug: 'world-literature-translated', image_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80', parent_id: CAT_TRANSLATION, sort_order: 1, is_active: true, created_at: nowIso },
  { id: 'sub-tr-2', name_bn: 'ইসলামি অনুবাদ গ্রন্থ', name_en: 'Islamic Translated', slug: 'islamic-translated', image_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80', parent_id: CAT_TRANSLATION, sort_order: 2, is_active: true, created_at: nowIso },
  { id: 'sub-tr-3', name_bn: 'আত্মজীবনী ও স্মৃতিকথা', name_en: 'Biography & Memoirs', slug: 'biography-memoirs', image_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80', parent_id: CAT_TRANSLATION, sort_order: 3, is_active: true, created_at: nowIso },
  { id: 'sub-tr-4', name_bn: 'দর্শন ও চিন্তাধারা', name_en: 'Philosophy & Thought', slug: 'philosophy-thought', image_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80', parent_id: CAT_TRANSLATION, sort_order: 4, is_active: true, created_at: nowIso },
];

const writersSeed = [
  { id: WRITER_1, name_bn: 'আরিফ আজাদ', name_en: 'Arif Azad', slug: 'arif-azad', bio_bn: 'জনপ্রিয় সমকালীন লেখক ও চিন্তাবিদ।', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', is_active: true, sort_order: 1, created_at: nowIso },
  { id: WRITER_2, name_bn: 'হুমায়ূন আহমেদ', name_en: 'Humayun Ahmed', slug: 'humayun-ahmed', bio_bn: 'বাংলা সাহিত্যের নন্দিত কথাসাহিত্যিক।', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', is_active: true, sort_order: 2, created_at: nowIso },
  { id: WRITER_3, name_bn: 'ড. মিজানুর রহমান আজহারী', name_en: 'Dr. Mizanur Rahman Azhari', slug: 'mizanur-rahman-azhari', bio_bn: 'বিশিষ্ট ইসলামি গবেষক ও লেখক।', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', is_active: true, sort_order: 3, created_at: nowIso },
  { id: WRITER_4, name_bn: 'মুহম্মদ জাফর ইকবাল', name_en: 'Muhammed Zafar Iqbal', slug: 'muhammed-zafar-iqbal', bio_bn: 'বিজ্ঞান কল্পকাহিনী ও শিশুসাহিত্যিক।', image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80', is_active: true, sort_order: 4, created_at: nowIso },
  { id: WRITER_5, name_bn: 'শায়খ আহমাদুল্লাহ', name_en: 'Shaykh Ahmadullah', slug: 'shaykh-ahmadullah', bio_bn: 'ইসলামি স্কলার ও লেখক।', image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', is_active: true, sort_order: 5, created_at: nowIso },
  { id: WRITER_6, name_bn: 'রবীন্দ্রনাথ ঠাকুর', name_en: 'Rabindranath Tagore', slug: 'rabindranath-tagore', bio_bn: 'বিশ্বকবি ও নোবেলজয়ী সাহিত্যিক।', image_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80', is_active: true, sort_order: 6, created_at: nowIso },
];

const publishersSeed = [
  { id: PUB_1, name_bn: 'সমকালীন প্রকাশন', name_en: 'Somokalin Prokashon', slug: 'somokalin', logo_url: null, is_active: true, sort_order: 1, created_at: nowIso },
  { id: PUB_2, name_bn: 'গার্ডিয়ান পাবলিকেশন্স', name_en: 'Guardian Publications', slug: 'guardian', logo_url: null, is_active: true, sort_order: 2, created_at: nowIso },
  { id: PUB_3, name_bn: 'প্রথমা প্রকাশন', name_en: 'Prothoma Prokashon', slug: 'prothoma', logo_url: null, is_active: true, sort_order: 3, created_at: nowIso },
  { id: PUB_4, name_bn: 'অন্যপ্রকাশ', name_en: 'Anyaprokash', slug: 'anyaprokash', logo_url: null, is_active: true, sort_order: 4, created_at: nowIso },
];

const productsSeed = [
  {
    id: '66666666-6666-4666-8666-666666666601',
    title_bn: 'প্যারাডক্সিক্যাল সাজিদ',
    title_en: 'Paradoxical Sajid',
    slug: 'paradoxical-sajid',
    description_bn: 'বিশ্বাস ও অবিশ্বাসের যুক্তিতর্ক নিয়ে রচিত সমকালীন বেস্টসেলার ইসলামি বই।',
    price: 240,
    original_price: 400,
    discount_percent: 40,
    author: 'আরিফ আজাদ',
    publisher: 'গার্ডিয়ান পাবলিকেশন্স',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: true,
    is_new_release: false,
    is_preorder: false,
    is_active: true,
    stock_quantity: 50,
    category_id: CAT_ISLAMIC,
    writer_id: WRITER_1,
    publisher_id: PUB_2,
    categories: categoriesSeed[0],
    writers: writersSeed[0],
    publishers: publishersSeed[1],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666602',
    title_bn: 'বেলা ফুরাবার আগে',
    title_en: 'Bela Furabar Age',
    slug: 'bela-furabar-age',
    description_bn: 'যুবসমাজের আত্মশুদ্ধি ও জীবনের লক্ষ্য নির্ধারণে অনন্য দিকনির্দেশনামূলক বই।',
    price: 270,
    original_price: 450,
    discount_percent: 40,
    author: 'আরিফ আজাদ',
    publisher: 'সমকালীন প্রকাশন',
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: true,
    is_new_release: true,
    is_preorder: false,
    is_active: true,
    stock_quantity: 42,
    category_id: CAT_ISLAMIC,
    writer_id: WRITER_1,
    publisher_id: PUB_1,
    categories: categoriesSeed[0],
    writers: writersSeed[0],
    publishers: publishersSeed[0],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666603',
    title_bn: 'ম্যাসেজ: আধুনিক মননে দ্বীনের ছোঁয়া',
    title_en: 'Message',
    slug: 'message-azhari',
    description_bn: 'আধুনিক যুগের জীবনঘনিষ্ঠ প্রশ্ন ও ইসলামের শাশ্বত সমাধান নিয়ে রচিত গ্রন্থ।',
    price: 300,
    original_price: 500,
    discount_percent: 40,
    author: 'ড. মিজানুর রহমান আজহারী',
    publisher: 'গার্ডিয়ান পাবলিকেশন্স',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: true,
    is_new_release: true,
    is_preorder: false,
    is_active: true,
    stock_quantity: 65,
    category_id: CAT_ISLAMIC,
    writer_id: WRITER_3,
    publisher_id: PUB_2,
    categories: categoriesSeed[0],
    writers: writersSeed[2],
    publishers: publishersSeed[1],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666604',
    title_bn: 'হিমু সমগ্র (১ম খণ্ড)',
    title_en: 'Himu Somogro Vol 1',
    slug: 'himu-somogro-1',
    description_bn: 'হুমায়ূন আহমেদের কালজয়ী চরিত্র হিমুর সেরা উপন্যাসগুলোর সংকলন।',
    price: 420,
    original_price: 600,
    discount_percent: 30,
    author: 'হুমায়ূন আহমেদ',
    publisher: 'অন্যপ্রকাশ',
    images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: true,
    is_new_release: false,
    is_preorder: false,
    is_active: true,
    stock_quantity: 35,
    category_id: CAT_NOVEL,
    writer_id: WRITER_2,
    publisher_id: PUB_4,
    categories: categoriesSeed[1],
    writers: writersSeed[1],
    publishers: publishersSeed[3],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666605',
    title_bn: 'অ্যাটমিক হ্যাবিটস (বাংলা অনুবাদ)',
    title_en: 'Atomic Habits (Bengali)',
    slug: 'atomic-habits-bn',
    description_bn: 'ক্ষুদ্র অভ্যাসের ইতিবাচক পরিবর্তনের মাধ্যমে অসাধারণ সাফল্য অর্জনের বিশ্বসেরা বই।',
    price: 210,
    original_price: 350,
    discount_percent: 40,
    author: 'জেমস ক্লিয়ার',
    publisher: 'প্রথমা প্রকাশন',
    images: ['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: true,
    is_new_release: true,
    is_preorder: false,
    is_active: true,
    stock_quantity: 80,
    category_id: CAT_SELFHELP,
    writer_id: WRITER_4,
    publisher_id: PUB_3,
    categories: categoriesSeed[4],
    writers: writersSeed[3],
    publishers: publishersSeed[2],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666606',
    title_bn: 'নবী জীবনের গল্প',
    title_en: 'Nobi Jiboner Golpo',
    slug: 'nobi-jiboner-golpo',
    description_bn: 'সহজ ও প্রাঞ্জল ভাষায় নবী করীম (সা.)-এর জীবনীর অনুপম বর্ণনা।',
    price: 250,
    original_price: 420,
    discount_percent: 40,
    author: 'শায়খ আহমাদুল্লাহ',
    publisher: 'সমকালীন প্রকাশন',
    images: ['https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: false,
    is_new_release: true,
    is_preorder: false,
    is_active: true,
    stock_quantity: 48,
    category_id: CAT_ISLAMIC,
    writer_id: WRITER_5,
    publisher_id: PUB_1,
    categories: categoriesSeed[0],
    writers: writersSeed[4],
    publishers: publishersSeed[0],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666607',
    title_bn: 'বিজ্ঞানের একশ মজার খেলা',
    title_en: '100 Fun Science Experiments',
    slug: 'bigganer-eksho-mojar-khela',
    description_bn: 'শিশু-কিশোরদের জন্য হাতে-কলমে বিজ্ঞানের চমৎকার সব পরীক্ষণ।',
    price: 180,
    original_price: 300,
    discount_percent: 40,
    author: 'মুহম্মদ জাফর ইকবাল',
    publisher: 'প্রথমা প্রকাশন',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=80'],
    is_featured: false,
    is_bestseller: true,
    is_new_release: true,
    is_preorder: false,
    is_active: true,
    stock_quantity: 60,
    category_id: CAT_CHILDREN,
    writer_id: WRITER_4,
    publisher_id: PUB_3,
    categories: categoriesSeed[3],
    writers: writersSeed[3],
    publishers: publishersSeed[2],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666608',
    title_bn: 'গীতাঞ্জলি ও নির্বাচিত কবিতা',
    title_en: 'Gitanjali & Selected Poems',
    slug: 'gitanjali-selected-poems',
    description_bn: 'রবীন্দ্রনাথ ঠাকুরের নোবেলজয়ী কাব্যগ্রন্থ ও কালজয়ী কবিতাসমূহ।',
    price: 220,
    original_price: 320,
    discount_percent: 31,
    author: 'রবীন্দ্রনাথ ঠাকুর',
    publisher: 'অন্যপ্রকাশ',
    images: ['https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: false,
    is_new_release: true,
    is_preorder: false,
    is_active: true,
    stock_quantity: 40,
    category_id: CAT_NOVEL,
    writer_id: WRITER_6,
    publisher_id: PUB_4,
    categories: categoriesSeed[1],
    writers: writersSeed[5],
    publishers: publishersSeed[3],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666609',
    title_bn: 'রাহে বেলায়াত (রাসূলুল্লাহ সা. এর দুআ ও যিকর)',
    title_en: 'Rahe Belayat',
    slug: 'rahe-belayat',
    description_bn: 'কুরআন ও সহীহ সুন্নাহর আলোকে দুআ, যিকর ও দৈনন্দিন আমলের প্রামাণ্য নির্ভরযোগ্য গাইড।',
    price: 350,
    original_price: 550,
    discount_percent: 36,
    author: 'শায়খ আহমাদুল্লাহ',
    publisher: 'সমকালীন প্রকাশন',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: true,
    is_new_release: false,
    is_preorder: false,
    is_active: true,
    stock_quantity: 45,
    category_id: CAT_ISLAMIC,
    writer_id: WRITER_5,
    publisher_id: PUB_1,
    categories: categoriesSeed[0],
    writers: writersSeed[4],
    publishers: publishersSeed[0],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666610',
    title_bn: 'মিসির আলি অমনিবাস (১ম খণ্ড)',
    title_en: 'Misir Ali Omnibus Vol 1',
    slug: 'misir-ali-omnibus-1',
    description_bn: 'রহস্য, সাইকোলজি ও যুক্তির টানটান উত্তেজনায় ঘেরা মিসির আলির কালজয়ী উপন্যাস সংকলন।',
    price: 480,
    original_price: 700,
    discount_percent: 31,
    author: 'হুমায়ূন আহমেদ',
    publisher: 'অন্যপ্রকাশ',
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: true,
    is_new_release: false,
    is_preorder: false,
    is_active: true,
    stock_quantity: 28,
    category_id: CAT_NOVEL,
    writer_id: WRITER_2,
    publisher_id: PUB_4,
    categories: categoriesSeed[1],
    writers: writersSeed[1],
    publishers: publishersSeed[3],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666611',
    title_bn: 'রিচার্জ ইউর ডাউন ব্যাটারি',
    title_en: 'Recharge Your Down Battery',
    slug: 'recharge-your-down-battery',
    description_bn: 'হতাশা কাটিয়ে জীবনে নতুন উদ্যমে কাজ শুরু করার বাস্তবমুখী দারুণ মোটিভেশনাল বই।',
    price: 230,
    original_price: 380,
    discount_percent: 39,
    author: 'মুহম্মদ জাফর ইকবাল',
    publisher: 'প্রথমা প্রকাশন',
    images: ['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: true,
    is_new_release: true,
    is_preorder: false,
    is_active: true,
    stock_quantity: 52,
    category_id: CAT_SELFHELP,
    writer_id: WRITER_4,
    publisher_id: PUB_3,
    categories: categoriesSeed[4],
    writers: writersSeed[3],
    publishers: publishersSeed[2],
    created_at: nowIso,
  },
  {
    id: '66666666-6666-4666-8666-666666666612',
    title_bn: 'একাত্তরের দিনগুলি',
    title_en: 'Ekattorer Dinguli',
    slug: 'ekattorer-dinguli',
    description_bn: 'মুক্তিযুদ্ধের রক্তস্নাত দিনগুলোর মর্মস্পর্শী ও অবিস্মরণীয় ঐতিহাসিক দিনলিপি।',
    price: 320,
    original_price: 480,
    discount_percent: 33,
    author: 'রবীন্দ্রনাথ ঠাকুর',
    publisher: 'অন্যপ্রকাশ',
    images: ['https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_bestseller: false,
    is_new_release: false,
    is_preorder: false,
    is_active: true,
    stock_quantity: 34,
    category_id: CAT_HISTORY,
    writer_id: WRITER_6,
    publisher_id: PUB_4,
    categories: categoriesSeed[5],
    writers: writersSeed[5],
    publishers: publishersSeed[3],
    created_at: nowIso,
  },
];

const universalProductsSeed = [
  {
    id: 'uprod-001',
    name_bn: 'প্রিমিয়াম ইসলামিক প্ল্যানার ও ডায়েরি ২০২৬',
    name_en: 'Premium Islamic Planner & Diary 2026',
    slug: 'islamic-planner-diary-2026',
    description_bn: 'সালাত ট্র্যাকার, কোরআন তিলাওয়াত গোল এবং ডেইলি তাসবিহ রুটিন সহ প্রিমিয়াম লেদার ফিনিশ হার্ডবাউন্ড ডায়েরি।',
    price: 450,
    original_price: 650,
    discount_percent: 31,
    brand: 'Boialo Craft',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_active: true,
    stock_quantity: 50,
    category_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
    product_type: 'stationery',
    created_at: nowIso,
  },
  {
    id: 'uprod-002',
    name_bn: 'খাস রয়েল উদ সুগন্ধি আতর (৬ মি.লি.)',
    name_en: 'Khas Royal Oudh Attar 6ml',
    slug: 'khas-royal-oudh-attar',
    description_bn: '১০০% অ্যালকোহলমুক্ত খাঁটি উড কাঠের মন মাতানো সুবাস ও দীর্ঘস্থায়ী প্রিমিয়াম আতর।',
    price: 850,
    original_price: 1200,
    discount_percent: 29,
    brand: 'Al-Haramain Scents',
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_active: true,
    stock_quantity: 35,
    category_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
    product_type: 'lifestyle',
    created_at: nowIso,
  },
  {
    id: 'uprod-003',
    name_bn: 'মেটালিক ক্যালিগ্রাফি গোল্ডেন বুকমার্ক সেট (৪ পিস)',
    name_en: 'Metallic Calligraphy Bookmarks (4 pcs)',
    slug: 'metallic-calligraphy-bookmarks',
    description_bn: 'সোনার রঙের সূক্ষ্ম ক্যালিগ্রাফি কাটআউট আর্ট সহ রাজকীয় বুকমার্ক সেট। বইপ্রেমীদের জন্য সেরা উপহার।',
    price: 180,
    original_price: 280,
    discount_percent: 36,
    brand: 'Boialo Craft',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80'],
    is_featured: true,
    is_active: true,
    stock_quantity: 120,
    category_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
    product_type: 'stationery',
    created_at: nowIso,
  },
  {
    id: 'uprod-004',
    name_bn: 'হ্যান্ডক্রাফটেড কাঠের ফোল্ডিং বুক স্ট্যান্ড (রেহাল)',
    name_en: 'Handcrafted Wooden Folding Book Stand',
    slug: 'wooden-folding-book-stand',
    description_bn: 'সেগুন কাঠের নান্দনিক খোদাই করা বুক রিডিং স্ট্যান্ড বা রেহাল। সহজে ভাঁজ করে রাখা যায়।',
    price: 650,
    original_price: 950,
    discount_percent: 32,
    brand: 'Boialo Craft',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80'],
    is_featured: false,
    is_active: true,
    stock_quantity: 25,
    category_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
    product_type: 'lifestyle',
    created_at: nowIso,
  },
];

const couponsSeed = [
  {
    id: 'cpn-1',
    code: 'BOIALO50',
    discount_type: 'fixed_amount',
    discount_amount: 50,
    min_order_amount: 500,
    max_discount_amount: 50,
    description_bn: 'যেকোনো বই অর্ডারে ৫০ টাকা ফ্ল্যাট ডিসকাউন্ট',
    is_active: true,
    usage_limit: 500,
    used_count: 38,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    created_at: nowIso,
  },
  {
    id: 'cpn-2',
    code: 'BOOK15',
    discount_type: 'percentage',
    discount_amount: 15,
    min_order_amount: 800,
    max_discount_amount: 150,
    description_bn: 'বইমেলা উপলক্ষে ১৫% স্পেশাল ছাড় (সর্বোচ্চ ১৫০ টাকা)',
    is_active: true,
    usage_limit: 1000,
    used_count: 142,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    created_at: nowIso,
  },
  {
    id: 'cpn-3',
    code: 'FREEDEL',
    discount_type: 'fixed_amount',
    discount_amount: 60,
    min_order_amount: 600,
    max_discount_amount: 60,
    description_bn: 'ঢাকা ও সারাদেশে ফ্রি হোম ডেলিভারি কুপন',
    is_active: true,
    usage_limit: 300,
    used_count: 89,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    created_at: nowIso,
  },
  {
    id: 'cpn-4',
    code: 'LUCKY100',
    discount_type: 'fixed_amount',
    discount_amount: 100,
    min_order_amount: 1000,
    max_discount_amount: 100,
    description_bn: '১০০০ টাকার বেশি অর্ডারে ১০০ টাকা অতিরিক্ত ছাড়',
    is_active: true,
    usage_limit: 200,
    used_count: 53,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    created_at: nowIso,
  },
];

const ordersSeed = [
  {
    id: 'ord-1001',
    order_number: 'ORD-2026-8821',
    user_id: 'customer-1',
    full_name: 'তানভীর আহমেদ',
    customer_name: 'তানভীর আহমেদ',
    phone: '01712345678',
    customer_phone: '01712345678',
    email: 'tanveer@example.com',
    customer_email: 'tanveer@example.com',
    delivery_area: 'ঢাকার ভিতরে',
    shipping_address: 'বাসা ১২, রোড ৫, ধানমন্ডি, ঢাকা',
    subtotal: 720,
    delivery_charge: 60,
    shipping_cost: 60,
    discount_amount: 50,
    total: 760,
    total_amount: 760,
    status: 'pending',
    payment_method: 'cod',
    payment_status: 'pending',
    is_gift_wrapped: true,
    gift_recipient: 'নাফিসা সুলতানা',
    gift_message: 'শুভ জন্মদিন বন্ধু! প্রিয় বইগুলো তোমার জন্য। অনেক ভালো কাটুক নতুন বছর। ❤️',
    gift_wrap_fee: 30,
    phone_verified: true,
    notes: 'বিকেল ৪টার পর ডেলিভারি দিলে ভালো হয়।',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'ord-1002',
    order_number: 'ORD-2026-8822',
    user_id: 'customer-2',
    full_name: 'সাদিয়া জাহান',
    customer_name: 'সাদিয়া জাহান',
    phone: '01898765432',
    customer_phone: '01898765432',
    email: 'sadia@example.com',
    customer_email: 'sadia@example.com',
    delivery_area: 'ঢাকার বাইরে',
    shipping_address: 'বাসা ৪/বি, জিইসি মোড়, চট্টগ্রাম',
    subtotal: 720,
    delivery_charge: 110,
    shipping_cost: 110,
    discount_amount: 0,
    total: 830,
    total_amount: 830,
    status: 'processing',
    courier_provider: 'steadfast',
    tracking_number: 'STEAD-8849201',
    courier_status: 'in_transit',
    payment_method: 'bkash',
    transaction_id: '9H87K2L1P0',
    payment_status: 'paid',
    is_gift_wrapped: false,
    phone_verified: true,
    notes: '',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'ord-1003',
    order_number: 'ORD-2026-8823',
    user_id: 'help.boialo@gmail.com',
    full_name: 'Boialo Admin Team',
    customer_name: 'Boialo Admin Team',
    phone: '01714005986',
    customer_phone: '01714005986',
    email: 'help.boialo@gmail.com',
    customer_email: 'help.boialo@gmail.com',
    delivery_area: 'ঢাকার ভিতরে',
    shipping_address: '৬০/এ, পুরানা পল্টন, ঢাকা-১০০০',
    subtotal: 510,
    delivery_charge: 60,
    shipping_cost: 60,
    discount_amount: 50,
    total: 520,
    total_amount: 520,
    status: 'shipped',
    courier_provider: 'pathao',
    tracking_number: 'PTH-9021884',
    courier_status: 'out_for_delivery',
    payment_method: 'cod',
    payment_status: 'pending',
    is_gift_wrapped: false,
    phone_verified: true,
    shipped_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'ord-1004',
    order_number: 'ORD-2026-8824',
    user_id: 'customer@boialo.com',
    full_name: 'ফারহানা করিম',
    customer_name: 'ফারহানা করিম',
    phone: '01611223344',
    customer_phone: '01611223344',
    email: 'customer@boialo.com',
    customer_email: 'customer@boialo.com',
    delivery_area: 'ঢাকার বাইরে',
    shipping_address: 'রোড ২, সেক্টর ১, উপশহর, রাজশাহী',
    subtotal: 430,
    delivery_charge: 110,
    shipping_cost: 110,
    discount_amount: 60,
    total: 480,
    total_amount: 480,
    status: 'delivered',
    courier_provider: 'steadfast',
    tracking_number: 'STEAD-7761092',
    courier_status: 'delivered',
    payment_method: 'nagad',
    transaction_id: 'NGD-4488102',
    payment_status: 'paid',
    is_gift_wrapped: true,
    gift_recipient: 'আফরিন জাহান',
    gift_message: 'প্রিয় বোন, বিজ্ঞানের মজার এই বইগুলো তোমার জন্য। অনেক বড় হও!',
    gift_wrap_fee: 30,
    phone_verified: true,
    shipped_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    delivered_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'ord-1005',
    order_number: 'ORD-2026-8825',
    user_id: 'customer-3',
    full_name: 'রফিকুল ইসলাম',
    customer_name: 'রফিকুল ইসলাম',
    phone: '01755667788',
    customer_phone: '01755667788',
    email: 'rafiq@example.com',
    customer_email: 'rafiq@example.com',
    delivery_area: 'ঢাকার ভিতরে',
    shipping_address: 'সেকশন ১০, মিরপুর, ঢাকা-১২১৬',
    subtotal: 420,
    delivery_charge: 60,
    shipping_cost: 60,
    discount_amount: 0,
    total: 480,
    total_amount: 480,
    status: 'delivered',
    courier_provider: 'pathao',
    tracking_number: 'PTH-8819021',
    courier_status: 'delivered',
    payment_method: 'cod',
    payment_status: 'paid',
    is_gift_wrapped: false,
    phone_verified: true,
    shipped_at: new Date(Date.now() - 3600000 * 90).toISOString(),
    delivered_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
];

const orderItemsSeed = [
  {
    id: 'oi-101',
    order_id: 'ord-1001',
    product_id: '66666666-6666-4666-8666-666666666601',
    product_title: 'প্যারাডক্সিক্যাল সাজিদ',
    product_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 240,
    unit_price: 240,
    total_price: 240,
    created_at: nowIso,
  },
  {
    id: 'oi-102',
    order_id: 'ord-1001',
    product_id: '66666666-6666-4666-8666-666666666602',
    product_title: 'বেলা ফুরাবার আগে',
    product_image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 270,
    unit_price: 270,
    total_price: 270,
    created_at: nowIso,
  },
  {
    id: 'oi-103',
    order_id: 'ord-1001',
    product_id: '66666666-6666-4666-8666-666666666605',
    product_title: 'অ্যাটমিক হ্যাবিটস (বাংলা অনুবাদ)',
    product_image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 210,
    unit_price: 210,
    total_price: 210,
    created_at: nowIso,
  },
  {
    id: 'oi-201',
    order_id: 'ord-1002',
    product_id: '66666666-6666-4666-8666-666666666603',
    product_title: 'ম্যাসেজ: আধুনিক মননে দ্বীনের ছোঁয়া',
    product_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 300,
    unit_price: 300,
    total_price: 300,
    created_at: nowIso,
  },
  {
    id: 'oi-202',
    order_id: 'ord-1002',
    product_id: '66666666-6666-4666-8666-666666666604',
    product_title: 'হিমু সমগ্র (১ম খণ্ড)',
    product_image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 420,
    unit_price: 420,
    total_price: 420,
    created_at: nowIso,
  },
  {
    id: 'oi-301',
    order_id: 'ord-1003',
    product_id: '66666666-6666-4666-8666-666666666601',
    product_title: 'প্যারাডক্সিক্যাল সাজিদ',
    product_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 240,
    unit_price: 240,
    total_price: 240,
    created_at: nowIso,
  },
  {
    id: 'oi-302',
    order_id: 'ord-1003',
    product_id: '66666666-6666-4666-8666-666666666602',
    product_title: 'বেলা ফুরাবার আগে',
    product_image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 270,
    unit_price: 270,
    total_price: 270,
    created_at: nowIso,
  },
  {
    id: 'oi-401',
    order_id: 'ord-1004',
    product_id: '66666666-6666-4666-8666-666666666607',
    product_title: 'বিজ্ঞানের একশ মজার খেলা',
    product_image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 180,
    unit_price: 180,
    total_price: 180,
    created_at: nowIso,
  },
  {
    id: 'oi-402',
    order_id: 'ord-1004',
    product_id: '66666666-6666-4666-8666-666666666606',
    product_title: 'নবী জীবনের গল্প',
    product_image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 250,
    unit_price: 250,
    total_price: 250,
    created_at: nowIso,
  },
  {
    id: 'oi-501',
    order_id: 'ord-1005',
    product_id: '66666666-6666-4666-8666-666666666604',
    product_title: 'হিমু সমগ্র (১ম খণ্ড)',
    product_image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=80',
    quantity: 1,
    price: 420,
    unit_price: 420,
    total_price: 420,
    created_at: nowIso,
  },
];

const profilesSeed = [
  {
    id: 'help.boialo@gmail.com',
    user_id: 'help.boialo@gmail.com',
    email: 'help.boialo@gmail.com',
    full_name: 'Boialo Super Admin',
    phone: '01714005986',
    address: '৬০/এ, পুরানা পল্টন',
    city: 'ঢাকা',
    created_at: nowIso,
  },
  {
    id: 'manager@boialo.com',
    user_id: 'manager@boialo.com',
    email: 'manager@boialo.com',
    full_name: 'তানভীর আহমেদ (ম্যানেজার)',
    phone: '01712345678',
    address: 'বাসা ১২, ধানমন্ডি',
    city: 'ঢাকা',
    created_at: nowIso,
  },
  {
    id: 'customer@boialo.com',
    user_id: 'customer@boialo.com',
    email: 'customer@boialo.com',
    full_name: 'ফারহানা করিম (পাঠক)',
    phone: '01611223344',
    address: 'উপশহর, সেক্টর ১',
    city: 'রাজশাহী',
    created_at: nowIso,
  },
];

const userRolesSeed = [
  { id: 'ur-1', user_id: 'help.boialo@gmail.com', email: 'help.boialo@gmail.com', role: 'super_admin', created_at: nowIso },
  { id: 'ur-2', user_id: 'manager@boialo.com', email: 'manager@boialo.com', role: 'manager', created_at: nowIso },
  { id: 'ur-3', user_id: 'customer@boialo.com', email: 'customer@boialo.com', role: 'customer', created_at: nowIso },
];

const tables: Record<string, any[]> = {
  site_settings: [
    { id: '1', setting_key: 'site_name', setting_value: 'বইআলো', setting_type: 'text', category: 'general' },
    { id: '2', setting_key: 'footer_description', setting_value: 'বাংলাদেশের সবচেয়ে বড় অনলাইন বই ও লাইফস্টাইল শপ। আমরা সেরা মানের বই ও পণ্য দ্রুততম সময়ে পৌঁছে দিই।', setting_type: 'text', category: 'general' },
    { id: '3', setting_key: 'copyright_text', setting_value: '© ২০২৫ বইআলো (Boialo). সর্বস্বত্ব সংরক্ষিত।', setting_type: 'text', category: 'general' },
    { id: '4', setting_key: 'pre_header_text', setting_value: '🎉 সকল বইয়ে ৪০% পর্যন্ত বিশেষ ছাড়! কুপন কোড: BOOK15', setting_type: 'text', category: 'general' },
    { id: '5', setting_key: 'pre_header_link', setting_value: '/offers', setting_type: 'text', category: 'general' },
    { id: '6', setting_key: 'pre_header_enabled', setting_value: 'true', setting_type: 'boolean', category: 'general' },
    { id: '7', setting_key: 'header_logo', setting_value: '', setting_type: 'text', category: 'branding' },
    { id: '8', setting_key: 'footer_logo', setting_value: '', setting_type: 'text', category: 'branding' },
    { id: '9', setting_key: 'favicon', setting_value: '', setting_type: 'text', category: 'branding' },
    { id: '10', setting_key: 'gift_wrap_enabled', setting_value: 'true', setting_type: 'boolean', category: 'features' },
    { id: '11', setting_key: 'gift_wrap_price', setting_value: '30', setting_type: 'number', category: 'features' },
    { id: '12', setting_key: 'gift_wrap_title', setting_value: 'প্রিমিয়াম গিফট র‍্যাপিং ও উইশ কার্ড', setting_type: 'text', category: 'features' },
    { id: '13', setting_key: 'flash_sale_enabled', setting_value: 'true', setting_type: 'boolean', category: 'features' },
    { id: '14', setting_key: 'flash_sale_title', setting_value: 'আজকের বিশেষ ফ্ল্যাশ ডিল - সীমিত সময়ের ধামাকা অফার!', setting_type: 'text', category: 'features' },
    { id: '15', setting_key: 'flash_sale_discount_percent', setting_value: '35', setting_type: 'number', category: 'features' },
    { id: '16', setting_key: 'flash_sale_end_time', setting_value: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), setting_type: 'text', category: 'features' },
    { id: '17', setting_key: 'combo_builder_enabled', setting_value: 'true', setting_type: 'boolean', category: 'features' },
    { id: '18', setting_key: 'combo_discount_percent', setting_value: '10', setting_type: 'number', category: 'features' },
    { id: '19', setting_key: 'scratch_win_enabled', setting_value: 'true', setting_type: 'boolean', category: 'features' },
    { id: '20', setting_key: 'scratch_win_coupon_code', setting_value: 'BOIALOWIN', setting_type: 'text', category: 'features' },
    { id: '21', setting_key: 'trust_courier_open_enabled', setting_value: 'true', setting_type: 'boolean', category: 'features' },
    { id: '22', setting_key: 'trust_badge_text', setting_value: 'ডেলিভারি ম্যানের সামনে পার্সেল খুলে দেখে নেওয়ার সুযোগ', setting_type: 'text', category: 'features' },
    { id: '23', setting_key: 'reading_goal_enabled', setting_value: 'true', setting_type: 'boolean', category: 'features' },
    { id: '24', setting_key: 'reading_goal_year', setting_value: '২০২৬', setting_type: 'text', category: 'features' },
    { id: '25', setting_key: 'low_stock_threshold', setting_value: '5', setting_type: 'number', category: 'features' },
  ],
  navigation_menus: [
    { id: MENU_ID, name: 'Main Navigation', slug: 'main-nav', location: 'header', created_at: nowIso, updated_at: nowIso },
  ],
  menu_items: [
    { id: '101', menu_id: MENU_ID, parent_id: null, title_bn: 'হোম', title_en: 'Home', url: '/', icon: null, sort_order: 1, is_active: true, open_in_new_tab: false },
    { id: '102', menu_id: MENU_ID, parent_id: null, title_bn: 'সকল বই', title_en: 'All Books', url: '/shop', icon: null, sort_order: 2, is_active: true, open_in_new_tab: false },
    { id: '102-s', menu_id: MENU_ID, parent_id: null, title_bn: 'সিলেবাস বইসেট', title_en: 'Syllabus Bundles', url: '/syllabus', icon: 'GraduationCap', sort_order: 3, is_active: true, open_in_new_tab: false },
    { id: '103', menu_id: MENU_ID, parent_id: null, title_bn: 'বিভাগসমূহ', title_en: 'Categories', url: '/categories', icon: null, sort_order: 4, is_active: true, open_in_new_tab: false },
    { id: '104', menu_id: MENU_ID, parent_id: null, title_bn: 'লেখক', title_en: 'Authors', url: '/authors', icon: null, sort_order: 5, is_active: true, open_in_new_tab: false },
    { id: '105', menu_id: MENU_ID, parent_id: null, title_bn: 'প্রকাশক', title_en: 'Publishers', url: '/publishers', icon: null, sort_order: 6, is_active: true, open_in_new_tab: false },
    { id: '106', menu_id: MENU_ID, parent_id: null, title_bn: 'আজকের অফার', title_en: 'Today Offers', url: '/offers', icon: null, sort_order: 7, is_active: true, open_in_new_tab: false },
    { id: '107', menu_id: MENU_ID, parent_id: null, title_bn: 'ই-বুক', title_en: 'E-Books', url: '/ebooks', icon: null, sort_order: 8, is_active: true, open_in_new_tab: false },
    { id: '108', menu_id: MENU_ID, parent_id: null, title_bn: 'প্রি-অর্ডার', title_en: 'Pre-order', url: '/preorder', icon: null, sort_order: 9, is_active: true, open_in_new_tab: false },
  ],
  footer_sections: [
    { id: FOOTER_SEC_1, title_bn: 'দ্রুত লিংক', title_en: 'Quick Links', section_type: 'links', sort_order: 1, is_active: true, content: {} },
    { id: FOOTER_SEC_2, title_bn: 'বিভাগসমূহ', title_en: 'Categories', section_type: 'links', sort_order: 2, is_active: true, content: {} },
    { id: FOOTER_SEC_3, title_bn: 'যোগাযোগ', title_en: 'Contact', section_type: 'contact', sort_order: 3, is_active: true, content: { address: '৬০/এ, পুরানা পল্টন, ঢাকা-১০০০, বাংলাদেশ', phone: '+৮৮০ ১৭০০-০০০০০০', email: 'help.boialo@gmail.com' } },
    { id: FOOTER_SEC_4, title_bn: 'সোশ্যাল মিডিয়া', title_en: 'Social Media', section_type: 'social', sort_order: 4, is_active: true, content: { facebook: 'https://facebook.com', youtube: 'https://youtube.com', instagram: 'https://instagram.com' } },
  ],
  footer_links: [
    { id: '201', section_id: FOOTER_SEC_1, title_bn: 'আমাদের সম্পর্কে', title_en: 'About Us', url: '/about', sort_order: 1, is_active: true },
    { id: '202', section_id: FOOTER_SEC_1, title_bn: 'যোগাযোগ করুন', title_en: 'Contact', url: '/contact', sort_order: 2, is_active: true },
    { id: '203', section_id: FOOTER_SEC_1, title_bn: 'সাধারণ জিজ্ঞাসা', title_en: 'FAQ', url: '/faq', sort_order: 3, is_active: true },
    { id: '204', section_id: FOOTER_SEC_1, title_bn: 'শর্তাবলী', title_en: 'Terms', url: '/terms', sort_order: 4, is_active: true },
    { id: '205', section_id: FOOTER_SEC_1, title_bn: 'গোপনীয়তা নীতি', title_en: 'Privacy', url: '/privacy', sort_order: 5, is_active: true },
    { id: '206', section_id: FOOTER_SEC_2, title_bn: 'ইসলামি বই', title_en: 'Islamic Books', url: '/categories/islamic', sort_order: 1, is_active: true },
    { id: '207', section_id: FOOTER_SEC_2, title_bn: 'উপন্যাস ও সাহিত্য', title_en: 'Novels', url: '/categories/novels', sort_order: 2, is_active: true },
    { id: '208', section_id: FOOTER_SEC_2, title_bn: 'একাডেমিক বই', title_en: 'Academic Books', url: '/categories/academic', sort_order: 3, is_active: true },
    { id: '209', section_id: FOOTER_SEC_2, title_bn: 'শিশু-কিশোর বই', title_en: 'Children Books', url: '/categories/children', sort_order: 4, is_active: true },
    { id: '210', section_id: FOOTER_SEC_2, title_bn: 'আত্মউন্নয়ন', title_en: 'Self Help', url: '/categories/self-help', sort_order: 5, is_active: true },
  ],
  banners: [
    {
      id: '77777777-7777-4777-8777-777777777701',
      title: 'অমর একুশে বইমেলা ও বেস্টসেলার কালেকশন - সর্বোচ্চ ৪০% ছাড়!',
      image_desktop: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&auto=format&fit=crop&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=80',
      link_url: '/shop',
      sort_order: 1,
      is_active: true,
    },
    {
      id: '77777777-7777-4777-8777-777777777702',
      title: 'ইসলামি ও আত্মউন্নয়নমূলক বইয়ে বিশেষ ফ্ল্যাশ সেল',
      image_desktop: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&auto=format&fit=crop&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80',
      link_url: '/offers',
      sort_order: 2,
      is_active: true,
    },
  ],
  popup_banners: [
    {
      id: '66666666-6666-4666-8666-666666666601',
      title: 'বইমেলা ও নববর্ষে বিশেষ উপহার অফার!',
      description: 'যেকোনো ৩টি বই অর্ডারে পাচ্ছেন নিশ্চিত ফ্রি ডেলিভারি ও প্রিমিয়াম ক্যালিগ্রাফি বুকমার্ক।',
      button_text: 'অফার দেখুন',
      button_link: '/offers',
      badge_text: 'সীমিত সময়ের অফার',
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      background_color: '#ffffff',
      text_color: '#1e293b',
      overlay_color: 'rgba(0, 0, 0, 0.6)',
      popup_type: 'modal',
      position: 'center',
      width: 520,
      height: null,
      border_radius: 20,
      padding: 24,
      text_align: 'center',
      title_size: 'lg',
      animation: 'fade',
      trigger_type: 'delay',
      trigger_delay: 3,
      trigger_scroll_percent: 30,
      show_frequency: 'once_per_session',
      show_close_button: true,
      close_on_overlay_click: true,
      auto_close_seconds: null,
      show_on_pages: ['/'],
      exclude_pages: [],
      show_to_logged_in: true,
      show_to_guests: true,
      device_target: 'all',
      is_active: true,
      sort_order: 1,
      created_at: nowIso,
      updated_at: nowIso,
    },
  ],
  categories: categoriesSeed,
  writers: writersSeed,
  publishers: publishersSeed,
  products: productsSeed,
  homepage_sections: [
    { id: '88888888-8888-4888-8888-888888888800', section_type: 'hero_slider', title_bn: 'হিরো ব্যানার স্লাইডার', title_en: 'Hero Slider', subtitle_bn: 'প্রধান ব্যানারসমূহ', sort_order: 1, is_active: true, settings: {} },
    { id: '88888888-8888-4888-8888-888888888810', section_type: 'promo_ticker', title_bn: 'প্রমোশনাল টিকার', title_en: 'Promo Ticker', subtitle_bn: null, sort_order: 2, is_active: true, settings: {} },
    { id: '88888888-8888-4888-8888-888888888808', section_type: 'trust_badges', title_bn: 'কেন আমাদের থেকে কিনবেন', title_en: 'Why Choose Us', subtitle_bn: null, sort_order: 3, is_active: true, settings: {} },
    { id: '88888888-8888-4888-8888-888888888801', section_type: 'flash_sale', title_bn: 'আজকের লিমিটেড টাইম ফ্ল্যাশ সেল', title_en: 'Flash Sale', subtitle_bn: 'সীমিত সময়ের জন্য বিশেষ মেগা ছাড় — স্টক শেষ হওয়ার আগেই অর্ডার করুন', sort_order: 4, is_active: true, settings: { min_discount: 30, limit: 4 } },
    { id: '88888888-8888-4888-8888-888888888820', section_type: 'category_subcategory_grid', title_bn: 'ক্যাটাগরি অনুযায়ী নির্বাচিত বই', title_en: 'Categories Showcase', subtitle_bn: 'আপনার পছন্দের বিভাগ থেকে প্রয়োজনীয় সকল বই ও রিসোর্স', sort_order: 5, is_active: true, settings: { max_parent_categories: 8, max_subcategories: 4, columns: 4 } },
    { id: '88888888-8888-4888-8888-888888888802', section_type: 'category_grid', title_bn: 'জনপ্রিয় ক্যাটাগরি', title_en: 'Popular Categories', subtitle_bn: 'সব ধরনের বই এক জায়গায়', sort_order: 6, is_active: true, settings: { columns: 4 } },
    { id: '88888888-8888-4888-8888-888888888811', section_type: 'book_spotlight', title_bn: 'আজকের সেরা বই স্পটলাইট', title_en: 'Book of the Day Spotlight', subtitle_bn: 'এই সপ্তাহের সবচেয়ে আলোচিত ও পাঠকপ্রিয় গ্রন্থ', sort_order: 6, is_active: true, settings: {} },
    { id: '88888888-8888-4888-8888-888888888803', section_type: 'new_releases', title_bn: 'নতুন প্রকাশিত বই', title_en: 'New Releases', subtitle_bn: 'সদ্য প্রকাশিত বইসমূহ', sort_order: 7, is_active: true, settings: { limit: 8 } },
    { id: '88888888-8888-4888-8888-888888888812', section_type: 'combo_builder', title_bn: 'কাস্টম কম্বো সেভার বিল্ডার', title_en: 'Custom Combo Saver Builder', subtitle_bn: 'যেকোনো ২টি বইয়ে ১০% ছাড় এবং ৩টি বইয়ে ১৫% মেগা ছাড় সাথে ফ্রি উপহার!', sort_order: 8, is_active: true, settings: { discount_percent: 10, tier2_discount: 15, enabled: true } },
    { id: '88888888-8888-4888-8888-888888888804', section_type: 'bestsellers', title_bn: 'বইমেলা বেস্টসেলার', title_en: 'Bestsellers', subtitle_bn: 'সবচেয়ে জনপ্রিয় বইসমূহ', sort_order: 9, is_active: true, settings: { limit: 8 } },
    { id: '88888888-8888-4888-8888-888888888813', section_type: 'top_selling_universal_products', title_bn: 'স্টেশনারি ও লাইফস্টাইল সংগ্রহ', title_en: 'Lifestyle & Stationery', subtitle_bn: 'ইসলামিক প্ল্যানার, খাঁটি উদ আতর, মেটালিক বুকমার্ক ও কাঠের রেহাল', sort_order: 10, is_active: true, settings: { limit: 8 } },
    { id: '88888888-8888-4888-8888-888888888805', section_type: 'top_authors', title_bn: 'জনপ্রিয় লেখকবৃন্দ', title_en: 'Top Authors', subtitle_bn: 'পাঠকপ্রিয় লেখকদের বই', sort_order: 11, is_active: true, settings: { limit: 6 } },
    { id: '88888888-8888-4888-8888-888888888806', section_type: 'promo_banner', title_bn: 'প্রমোশনাল ব্যানার', title_en: 'Promo Banner', subtitle_bn: 'বিশেষ অফার', sort_order: 12, is_active: true, settings: { title: 'প্রিমিয়াম বুকমার্ক ফ্রি!', description: '৪৯৯+ টাকার অর্ডারে ক্যালিগ্রাফি বুকমার্ক ফ্রি!', button_text: 'এখনই কিনুন', button_link: '/shop', badge_text: 'সীমিত সময়ের অফার' } },
    { id: '88888888-8888-4888-8888-888888888814', section_type: 'billboard', title_bn: 'স্পন্সর বিলবোর্ড', title_en: 'Sponsor Billboard', subtitle_bn: null, sort_order: 13, is_active: true, settings: {} },
    { id: '88888888-8888-4888-8888-888888888815', section_type: 'community_stats', title_bn: 'পাঠক পরিবার ও কমিউনিটি পরিসংখ্যান', title_en: 'Reader Community Stats', subtitle_bn: 'হাজারো সন্তুষ্ট পাঠকের আস্থার ঠিকানা', sort_order: 14, is_active: true, settings: {} },
    { id: '88888888-8888-4888-8888-888888888816', section_type: 'recently_viewed', title_bn: 'সম্প্রতি দেখা বইসমূহ', title_en: 'Recently Viewed', subtitle_bn: null, sort_order: 15, is_active: true, settings: {} },
    { id: '88888888-8888-4888-8888-888888888809', section_type: 'newsletter', title_bn: 'নিউজলেটার', title_en: 'Newsletter', subtitle_bn: null, sort_order: 16, is_active: true, settings: {} },
  ],
  product_types: [
    { id: '99999999-9999-4999-8999-999999999901', type_key: 'electronics', name_bn: 'ইলেকট্রনিক্স', name_en: 'Electronics', icon: 'Cpu', sort_order: 1, is_active: true },
    { id: '99999999-9999-4999-8999-999999999902', type_key: 'stationery', name_bn: 'স্টেশনারি', name_en: 'Stationery', icon: 'PenTool', sort_order: 2, is_active: true },
    { id: '99999999-9999-4999-8999-999999999903', type_key: 'lifestyle', name_bn: 'লাইফস্টাইল ও আতর', name_en: 'Lifestyle', icon: 'Sparkles', sort_order: 3, is_active: true },
  ],
  universal_categories: [
    { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', name_bn: 'নোটবুক ও ডায়েরি', name_en: 'Notebooks & Diaries', slug: 'notebooks', product_type: 'stationery', image_url: null, parent_id: null, sort_order: 1, is_active: true },
    { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', name_bn: 'প্রিমিয়াম আতর', name_en: 'Premium Attar', slug: 'attar', product_type: 'lifestyle', image_url: null, parent_id: null, sort_order: 2, is_active: true },
  ],
  universal_products: universalProductsSeed,
  coupons: couponsSeed,
  orders: ordersSeed,
  order_items: orderItemsSeed,
  profiles: profilesSeed,
  payment_methods: [
    { id: 'pay-1', name_bn: 'ক্যাশ অন ডেলিভারি', name_en: 'Cash on Delivery', provider: 'cod', is_active: true, sort_order: 1, config: {} },
    { id: 'pay-2', name_bn: 'বিকাশ পেমেন্ট', name_en: 'bKash', provider: 'bkash', is_active: true, sort_order: 2, config: {} },
    { id: 'pay-3', name_bn: 'নগদ পেমেন্ট', name_en: 'Nagad', provider: 'nagad', is_active: true, sort_order: 3, config: {} },
  ],
  courier_providers: [
    { id: 'cour-1', name_bn: 'পাঠাও কুরিয়ার', name_en: 'Pathao Courier', provider: 'pathao', is_active: true, sort_order: 1 },
    { id: 'cour-2', name_bn: 'স্টেডফাস্ট কুরিয়ার', name_en: 'Steadfast Courier', provider: 'steadfast', is_active: true, sort_order: 2 },
  ],
  delivery_zones: [
    { id: 'zone-1', name_bn: 'ঢাকা সিটি', name_en: 'Inside Dhaka', charge: 60, estimated_days: '১-২ দিন', is_active: true, sort_order: 1 },
    { id: 'zone-2', name_bn: 'ঢাকার বাইরে', name_en: 'Outside Dhaka', charge: 110, estimated_days: '৩-৫ দিন', is_active: true, sort_order: 2 },
  ],
  loyalty_settings: [
    { id: 'ls-1', setting_key: 'is_enabled', setting_value: { value: true } },
    { id: 'ls-2', setting_key: 'points_per_taka', setting_value: { value: 0.02 } },
    { id: 'ls-3', setting_key: 'points_value_taka', setting_value: { value: 1 } },
    { id: 'ls-4', setting_key: 'min_redeem_points', setting_value: { value: 20 } },
    { id: 'ls-5', setting_key: 'signup_bonus', setting_value: { value: 50 } },
    { id: 'ls-6', setting_key: 'review_bonus', setting_value: { value: 10 } },
    { id: 'ls-7', setting_key: 'referral_bonus', setting_value: { value: 50 } },
    { id: 'ls-8', setting_key: 'referred_bonus', setting_value: { value: 50 } },
    { id: 'ls-9', setting_key: 'free_delivery_points', setting_value: { value: 60 } },
  ],
  referral_settings: [
    { id: 'rs-1', setting_key: 'is_enabled', setting_value: true },
    { id: 'rs-2', setting_key: 'referrer_reward_amount', setting_value: 50 },
    { id: 'rs-3', setting_key: 'referred_reward_amount', setting_value: 50 },
    { id: 'rs-4', setting_key: 'free_delivery_points', setting_value: 60 },
    { id: 'rs-5', setting_key: 'point_to_taka_rate', setting_value: 1 },
    { id: 'rs-6', setting_key: 'min_order_amount', setting_value: 100 },
  ],
  referral_codes: [
    { id: 'ref-c-1', user_id: 'help.boialo@gmail.com', code: 'BOIALO50', total_referrals: 12, total_earned: 600, is_active: true, created_at: nowIso },
    { id: 'ref-c-2', user_id: 'customer@boialo.com', code: 'READER20', total_referrals: 3, total_earned: 150, is_active: true, created_at: nowIso },
  ],
  referral_rewards: [],
  loyalty_points: [
    { id: 'lp-1', user_id: 'help.boialo@gmail.com', points: 50, type: 'earned', source: 'signup_bonus', description: 'সাইনআপ বোনাস পয়েন্ট', created_at: nowIso },
    { id: 'lp-2', user_id: 'help.boialo@gmail.com', points: 50, type: 'earned', source: 'referral_bonus', description: 'বন্ধুকে রেফার করার জন্য বোনাস পয়েন্ট', created_at: nowIso },
    { id: 'lp-3', user_id: 'customer@boialo.com', points: 50, type: 'earned', source: 'signup_bonus', description: 'সাইনআপ বোনাস পয়েন্ট', created_at: nowIso },
    { id: 'lp-4', user_id: 'customer@boialo@gmail.com', points: 25, type: 'earned', source: 'order_reward', description: 'অর্ডার রিওয়ার্ড পয়েন্ট', created_at: nowIso },
  ],
  user_roles: userRolesSeed,
  admin_audit_logs: [
    { id: 'aal-1', action: 'update', table_name: 'products', record_id: '66666666-6666-4666-8666-666666666601', old_values: null, new_values: { price: 240 }, ip_address: '103.145.120.45', user_id: 'help.boialo@gmail.com', created_at: nowIso },
    { id: 'aal-2', action: 'create', table_name: 'categories', record_id: 'CAT_MADRASA', old_values: null, new_values: { name_bn: 'কওমি মাদ্রাসা' }, ip_address: '103.145.120.45', user_id: 'help.boialo@gmail.com', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'aal-3', action: 'status_change', table_name: 'orders', record_id: 'ORD-101', old_values: { status: 'pending' }, new_values: { status: 'confirmed' }, ip_address: '103.145.120.46', user_id: 'manager@boialo.com', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'aal-4', action: 'update', table_name: 'homepage_sections', record_id: 'sec-1', old_values: null, new_values: { is_active: true }, ip_address: '103.145.120.45', user_id: 'help.boialo@gmail.com', created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: 'aal-5', action: 'create', table_name: 'coupons', record_id: 'cp-new', old_values: null, new_values: { code: 'BOOK15' }, ip_address: '103.145.120.45', user_id: 'help.boialo@gmail.com', created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  login_logs: [
    { id: 'll-1', user_id: 'help.boialo@gmail.com', email: 'help.boialo@gmail.com', event_type: 'login', success: true, ip_address: '103.145.120.45', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0', created_at: nowIso },
    { id: 'll-2', user_id: 'manager@boialo.com', email: 'manager@boialo.com', event_type: 'login', success: true, ip_address: '103.145.120.46', user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/121.0.0.0', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'll-3', user_id: 'help.boialo@gmail.com', email: 'help.boialo@gmail.com', event_type: 'login', success: true, ip_address: '103.145.120.45', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0', created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  active_sessions: [
    { id: 'as-1', user_id: 'help.boialo@gmail.com', ip_address: '103.145.120.45', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0', is_active: true, logged_in_at: nowIso, last_activity_at: nowIso },
    { id: 'as-2', user_id: 'manager@boialo.com', ip_address: '103.145.120.46', user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/121.0.0.0', is_active: true, logged_in_at: new Date(Date.now() - 3600000).toISOString(), last_activity_at: new Date(Date.now() - 300000).toISOString() },
  ],
  order_status_history: [
    { id: 'osh-1', order_id: 'ORD-101', status: 'confirmed', notes: 'গ্রাহকের সাথে ফোনে কথা বলে কনফার্ম করা হয়েছে', changed_by: 'manager@boialo.com', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'osh-2', order_id: 'ORD-102', status: 'processing', notes: 'বই প্যাকিং সম্পন্ন হয়েছে', changed_by: 'help.boialo@gmail.com', created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  order_tasks: [
    { id: 'ot-1', assigned_to: 'manager@boialo.com', status: 'completed', created_at: new Date(Date.now() - 14400000).toISOString(), completed_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'ot-2', assigned_to: 'help.boialo@gmail.com', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 80000000).toISOString() },
  ],
  auto_logout_settings: [
    { id: 'als-1', user_id: 'help.boialo@gmail.com', timeout_minutes: 60, is_enabled: true },
    { id: 'als-2', user_id: 'manager@boialo.com', timeout_minutes: 30, is_enabled: true },
  ],
};

const STORAGE_PREFIX = 'boialo_db_table_v2_';
const MERGE_DEFAULT_TABLES = new Set([
  'categories',
  'universal_categories',
  'product_types',
  'homepage_sections',
  'products',
  'universal_products',
  'writers',
  'publishers',
]);

function loadTableFromStorage(tableName: string, defaultRows: any[]): any[] {
  if (typeof window === 'undefined' || !window.localStorage) return defaultRows;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + tableName);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (tableName === 'active_sessions') {
          return parsed.map((r: any) => ({
            ...r,
            logged_in_at: r.logged_in_at || r.created_at || nowIso,
            last_activity_at: r.last_activity_at || r.updated_at || r.created_at || nowIso,
          }));
        }
        if (MERGE_DEFAULT_TABLES.has(tableName) && Array.isArray(defaultRows) && defaultRows.length > 0) {
          const existingIds = new Set(parsed.map((r: any) => String(r.id)));
          const missingDefaults = defaultRows.filter((d: any) => !existingIds.has(String(d.id)));
          if (missingDefaults.length > 0) {
            const combined = [...parsed, ...missingDefaults];
            try {
              window.localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(combined));
            } catch {}
            return combined;
          }
        }
        return parsed;
      }
    }
  } catch {}
  return defaultRows;
}

export function saveTableToStorage(tableName: string, rows: any[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(rows));
  } catch {}
}

// Hydrate initial tables from localStorage if present
for (const key of Object.keys(tables)) {
  tables[key] = loadTableFromStorage(key, tables[key]);
}

function matchesCondition(rowVal: any, opExpr: string): boolean {
  if (opExpr.startsWith('eq.')) {
    const target = opExpr.slice(3);
    if (target === 'true') return rowVal === true || rowVal === 'true';
    if (target === 'false') return rowVal === false || rowVal === 'false';
    return String(rowVal ?? '') === target;
  }
  if (opExpr.startsWith('neq.')) {
    const target = opExpr.slice(4);
    return String(rowVal ?? '') !== target;
  }
  if (opExpr.startsWith('is.')) {
    const target = opExpr.slice(3).toLowerCase();
    if (target === 'null') return rowVal === null || rowVal === undefined;
    if (target === 'true') return rowVal === true;
    if (target === 'false') return rowVal === false;
  }
  if (opExpr.startsWith('in.(') && opExpr.endsWith(')')) {
    const inner = opExpr.slice(4, -1);
    const items = inner
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, ''));
    return items.includes(String(rowVal ?? ''));
  }
  if (opExpr.startsWith('ilike.') || opExpr.startsWith('like.')) {
    const pattern = opExpr.replace(/^(i?like)\./, '').replace(/\*/g, '').replace(/%/g, '').toLowerCase();
    return String(rowVal ?? '').toLowerCase().includes(pattern);
  }
  if (opExpr.startsWith('gte.') || opExpr.startsWith('gt.') || opExpr.startsWith('lte.') || opExpr.startsWith('lt.')) {
    const isThree = opExpr.startsWith('gte.') || opExpr.startsWith('lte.');
    const op = opExpr.slice(0, isThree ? 3 : 2);
    const target = opExpr.slice(isThree ? 4 : 3);
    const numRow = Number(rowVal);
    const numTarget = Number(target);
    if (!Number.isNaN(numRow) && !Number.isNaN(numTarget) && String(rowVal ?? '').trim() !== '' && target.trim() !== '') {
      if (op === 'gte') return numRow >= numTarget;
      if (op === 'gt') return numRow > numTarget;
      if (op === 'lte') return numRow <= numTarget;
      if (op === 'lt') return numRow < numTarget;
    }
    const dateRow = Date.parse(String(rowVal ?? ''));
    const dateTarget = Date.parse(target);
    if (!Number.isNaN(dateRow) && !Number.isNaN(dateTarget)) {
      if (op === 'gte') return dateRow >= dateTarget;
      if (op === 'gt') return dateRow > dateTarget;
      if (op === 'lte') return dateRow <= dateTarget;
      if (op === 'lt') return dateRow < dateTarget;
    }
    const strRow = String(rowVal ?? '');
    if (op === 'gte') return strRow >= target;
    if (op === 'gt') return strRow > target;
    if (op === 'lte') return strRow <= target;
    if (op === 'lt') return strRow < target;
  }
  return true;
}

function getHeader(headers: HeadersInit | undefined, name: string): string {
  if (!headers) return '';
  const lower = name.toLowerCase();
  if (headers instanceof Headers) {
    return headers.get(name) || headers.get(lower) || '';
  }
  if (Array.isArray(headers)) {
    const found = headers.find(([k]) => k.toLowerCase() === lower);
    return found ? found[1] : '';
  }
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return String(v);
  }
  return '';
}

function getCallerAuth(headers: HeadersInit | undefined) {
  // 1. Firebase auth session check
  if (auth.currentUser) {
    const email = (auth.currentUser.email || '').toLowerCase().trim();
    const isSuper = email === 'help.boialo@gmail.com';
    const assignedRole = (tables['user_roles'] || []).find(
      (r: any) => (r.user_id === auth.currentUser?.uid || (r.email && r.email.toLowerCase() === email))
    )?.role;
    const role = isSuper ? 'super_admin' : (assignedRole || null);
    const isAdmin = Boolean(isSuper || (role && ['super_admin', 'admin', 'manager', 'support'].includes(role)));
    return {
      userId: auth.currentUser.uid,
      email,
      role,
      isAdmin,
    };
  }

  // 2. Bearer token in request headers
  const authHeader = getHeader(headers, 'authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      let payloadStr = token;
      if (token.includes('.')) {
        payloadStr = token.split('.')[1] || token;
      }
      const base64 = payloadStr.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
      const decoded = JSON.parse(atob(base64 + pad));
      if (decoded && (decoded.email || decoded.sub)) {
        const email = String(decoded.email || '').toLowerCase().trim();
        const isSuper = email === 'help.boialo@gmail.com';
        const assignedRole = (tables['user_roles'] || []).find(
          (r: any) => (r.user_id === decoded.sub || (r.email && r.email.toLowerCase() === email))
        )?.role;
        const role = isSuper ? 'super_admin' : (assignedRole || (decoded.role !== 'customer' ? decoded.role : null));
        const isAdmin = Boolean(isSuper || (role && ['super_admin', 'admin', 'manager', 'support'].includes(role)));
        return {
          userId: decoded.sub,
          email,
          role,
          isAdmin,
        };
      }
    } catch {
      // not a base64 encoded token
    }
  }

  // 3. Fallback: Check localStorage supabase session on client
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.includes('supabase.auth.token') || key.includes('sb-') || key === 'boialo_user_session')) {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            const userObj = parsed?.user || parsed?.currentSession?.user || parsed;
            const email = (userObj?.email || '').toLowerCase().trim();
            if (email) {
              const isSuper = email === 'help.boialo@gmail.com';
              const assignedRole = (tables['user_roles'] || []).find(
                (r: any) => (r.user_id === userObj.id || (r.email && r.email.toLowerCase() === email))
              )?.role;
              const role = isSuper ? 'super_admin' : (assignedRole || userObj?.app_metadata?.role || null);
              const isAdmin = Boolean(isSuper || (role && ['super_admin', 'admin', 'manager', 'support'].includes(role)));
              return {
                userId: userObj.id || email,
                email,
                role,
                isAdmin,
              };
            }
          }
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  return null;
}

const syncedCollections = new Set<string>();
const CATALOG_COLLECTIONS = new Set([
  'site_settings',
  'navigation_menus',
  'menu_items',
  'footer_sections',
  'footer_links',
  'banners',
  'popup_banners',
  'categories',
  'writers',
  'publishers',
  'products',
  'homepage_sections',
  'product_types',
  'universal_categories',
  'universal_products',
  'payment_methods',
  'courier_providers',
  'delivery_zones',
  'pages',
  'page_sections',
  'social_media_posts',
  'coupons',
  'product_reviews',
  'url_redirects',
  'search_analytics',
  'loyalty_settings',
  'referral_settings',
  'referral_codes',
  'referral_rewards',
  'loyalty_points',
  'user_roles',
  'orders',
  'order_items',
  'profiles',
  'admin_audit_logs',
  'login_logs',
  'active_sessions',
  'order_status_history',
  'order_tasks',
  'auto_logout_settings',
]);

async function ensureFirestoreCollectionSynced(tableName: string): Promise<void> {
  if (!CATALOG_COLLECTIONS.has(tableName) || syncedCollections.has(tableName)) {
    return;
  }
  syncedCollections.add(tableName);
  try {
    const snap = await getDocs(collection(db, tableName));
    if (!snap.empty) {
      const dbRows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const dbIds = new Set(dbRows.map((r: any) => String(r.id)));

      const localRows = tables[tableName] || [];
      const localMap = new Map(localRows.map((r: any) => [String(r.id), r]));

      const merged = dbRows.map((dbRow: any) => {
        const local = localMap.get(String(dbRow.id));
        if (local && local.updated_at && (!dbRow.updated_at || new Date(local.updated_at) >= new Date(dbRow.updated_at))) {
          return local;
        }
        return dbRow;
      });

      const mergedIds = new Set(merged.map((r: any) => String(r.id)));
      const seededMissing = localRows.filter((r) => !mergedIds.has(String(r.id)));

      for (const m of seededMissing) {
        await setDoc(doc(db, tableName, String(m.id)), m).catch(() => {});
      }

      tables[tableName] = [...merged, ...seededMissing];
      saveTableToStorage(tableName, tables[tableName]);
    } else if (tables[tableName] && tables[tableName].length > 0) {
      // Seed initial records to Firestore in background
      for (const item of tables[tableName]) {
        const docId = String(item.id);
        await setDoc(doc(db, tableName, docId), { ...item, id: docId }).catch(() => {});
      }
      saveTableToStorage(tableName, tables[tableName]);
    }
  } catch {
    // Keep seeded in-memory records available if offline
  }
}

export async function handleMockSupabaseRequest(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const url = new URL(urlStr, 'https://mock.supabase.co');
  const method = (init?.method || (typeof input === 'object' && 'method' in input ? input.method : 'GET') || 'GET').toUpperCase();
  const headers = init?.headers || (typeof input === 'object' && 'headers' in input ? input.headers : undefined);
  const accept = getHeader(headers, 'accept');
  const wantsObject = accept.includes('application/vnd.pgrst.object+json');

  // 1. Auth endpoints (/auth/v1/signup, /auth/v1/token, /auth/v1/user, /auth/v1/logout)
  if (url.pathname.startsWith('/auth/v1/')) {
    const authAction = url.pathname.replace('/auth/v1/', '');
    if ((authAction === 'signup' || authAction === 'token') && method === 'POST') {
      try {
        const bodyText = typeof init?.body === 'string' ? init.body : '{}';
        const parsed = JSON.parse(bodyText || '{}');
        const email = String(parsed.email || 'user@boialo.com').toLowerCase().trim();
        const fullName = parsed?.data?.full_name || parsed?.options?.data?.full_name || email.split('@')[0];
        const uid = 'user-' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
        const assignedRole = (tables['user_roles'] || []).find(
          (r: any) => (r.email && r.email.toLowerCase() === email) || (r.user_id === uid)
        )?.role;
        const role = email === 'help.boialo@gmail.com' ? 'super_admin' : (assignedRole || 'customer');
        const sbUser = {
          id: uid,
          aud: 'authenticated',
          role: 'authenticated',
          email,
          email_confirmed_at: nowIso,
          app_metadata: { provider: 'email', role },
          user_metadata: { full_name: fullName },
          created_at: nowIso,
        };
        const token = btoa(JSON.stringify({ sub: uid, email, role }));
        return new Response(
          JSON.stringify({
            access_token: token,
            token_type: 'bearer',
            expires_in: 604800,
            refresh_token: token,
            user: sbUser,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch {
        return new Response(JSON.stringify({ user: null, session: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response(JSON.stringify({ user: null, session: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Edge Functions endpoints
  if (url.pathname.startsWith('/functions/v1/')) {
    if (url.pathname.includes('/search')) {
      try {
        const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
        const q = String(body?.query || url.searchParams.get('q') || '').toLowerCase().trim();
        const limit = Number(body?.limit) || 10;
        await ensureFirestoreCollectionSynced('products');
        await ensureFirestoreCollectionSynced('categories');
        await ensureFirestoreCollectionSynced('writers');
        await ensureFirestoreCollectionSynced('publishers');

        const allProducts = tables['products'] || [];
        const allUniversal = tables['universal_products'] || [];
        const allCategories = tables['categories'] || [];
        const allWriters = tables['writers'] || [];

        const matchedProducts = allProducts.filter((p: any) => {
          if (!p.is_active && p.is_active !== undefined) return false;
          if (!q) return true;
          return (
            (p.title_bn && p.title_bn.toLowerCase().includes(q)) ||
            (p.title_en && p.title_en.toLowerCase().includes(q)) ||
            (p.author && p.author.toLowerCase().includes(q)) ||
            (p.publisher && p.publisher.toLowerCase().includes(q)) ||
            (p.slug && p.slug.toLowerCase().includes(q))
          );
        });

        const matchedCategories = allCategories.filter((c: any) => {
          if (!c.is_active && c.is_active !== undefined) return false;
          if (!q) return false;
          return (
            (c.name_bn && c.name_bn.toLowerCase().includes(q)) ||
            (c.name_en && c.name_en.toLowerCase().includes(q)) ||
            (c.slug && c.slug.toLowerCase().includes(q))
          );
        });

        const autocomplete: string[] = [];
        matchedProducts.forEach((p: any) => {
          if (p.title_bn && !autocomplete.includes(p.title_bn)) autocomplete.push(p.title_bn);
          if (p.author && !autocomplete.includes(p.author)) autocomplete.push(p.author);
        });

        const suggestions: string[] = [];
        allWriters.filter((w: any) => (w.name_bn && w.name_bn.toLowerCase().includes(q))).forEach((w: any) => {
          suggestions.push(w.name_bn);
        });

        return new Response(
          JSON.stringify({
            products: matchedProducts.slice(0, limit),
            categories: matchedCategories.slice(0, 5),
            suggestions: suggestions.slice(0, 5),
            autocomplete: autocomplete.slice(0, 6),
            totalProducts: matchedProducts.length,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch {
        return new Response(
          JSON.stringify({ products: [], categories: [], suggestions: [], autocomplete: [], totalProducts: 0 }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (url.pathname.includes('/send-otp')) {
      return new Response(
        JSON.stringify({ success: true, verified: true, debug_otp: '123456' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, ok: true, results: [], data: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Storage endpoints
  if (url.pathname.startsWith('/storage/v1/')) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. RPC endpoints
  if (url.pathname.startsWith('/rest/v1/rpc/')) {
    const fnName = url.pathname.replace('/rest/v1/rpc/', '');
    if (fnName === 'get_my_admin_role') {
      const caller = getCallerAuth(headers);
      result = (caller && caller.isAdmin) ? (caller.role || 'admin') : null;
    } else if (fnName === 'has_role' || fnName === 'is_admin') {
      const caller = getCallerAuth(headers);
      result = Boolean(caller && caller.isAdmin);
    } else if (fnName === 'get_public_payment_methods') {
      result = (tables['payment_methods'] || []).filter((m: any) => m.is_active !== false);
    } else if (fnName === 'get_order_tracking') {
      try {
        const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
        const orderNum = (body?.p_order_number || url.searchParams.get('p_order_number') || '').toUpperCase().trim();
        await ensureFirestoreCollectionSynced('orders');
        const matched = (tables['orders'] || []).find(
          (o: any) => (o.order_number || '').toUpperCase() === orderNum
        );
        if (matched) {
          result = {
            order_number: matched.order_number,
            status: matched.status || 'processing',
            delivery_area: matched.delivery_area || 'ঢাকার ভিতরে',
            courier_provider: matched.courier_provider || null,
            tracking_number: matched.tracking_number || null,
            courier_status: matched.courier_status || null,
            created_at: matched.created_at,
            shipped_at: matched.shipped_at || null,
            delivered_at: matched.delivered_at || null,
          };
        } else {
          result = { error: 'Order not found' };
        }
      } catch {
        result = { error: 'Order not found' };
      }
    } else if (fnName.startsWith('get_') || fnName.startsWith('search_')) {
      result = [];
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 5. PostgREST Table endpoints (/rest/v1/<table>)
  if (url.pathname.startsWith('/rest/v1/')) {
    const tableName = url.pathname.replace('/rest/v1/', '').split('/')[0];
    await ensureFirestoreCollectionSynced(tableName);
    if (!tables[tableName]) {
      tables[tableName] = [];
    }
    let rows = [...tables[tableName]];

    // Filter rows by query params
    for (const [key, val] of url.searchParams.entries()) {
      if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(key)) continue;
      if (key === 'or') {
        const inner = val.replace(/^\(|\)$/g, '');
        const conditions = inner.split(',').map((c) => c.trim()).filter(Boolean);
        if (conditions.length > 0) {
          rows = rows.filter((row) => {
            return conditions.some((cond) => {
              const dotIdx = cond.indexOf('.');
              if (dotIdx === -1) return false;
              const field = cond.slice(0, dotIdx);
              const opExpr = cond.slice(dotIdx + 1);
              return matchesCondition(row[field], opExpr);
            });
          });
        }
        continue;
      }
      rows = rows.filter((row) => {
        if (!(key in row)) return true;
        return matchesCondition(row[key], val);
      });
    }

    // Handle mutations
    if (method === 'POST') {
      try {
        const bodyText = typeof init?.body === 'string' ? init.body : '';
        const parsed = bodyText ? JSON.parse(bodyText) : {};
        const items = Array.isArray(parsed) ? parsed : [parsed];
        const currentIso = new Date().toISOString();
        const inserted = items.map((item) => ({
          id: String(item.id || crypto.randomUUID()),
          created_at: currentIso,
          ...(tableName === 'active_sessions' ? { logged_in_at: currentIso, last_activity_at: currentIso } : {}),
          ...item,
        }));
        tables[tableName].push(...inserted);
        saveTableToStorage(tableName, tables[tableName]);
        if (CATALOG_COLLECTIONS.has(tableName) || tableName === 'orders' || tableName === 'profiles') {
          for (const rec of inserted) {
            try {
              await setDoc(doc(db, tableName, String(rec.id)), rec, { merge: true });
            } catch (err) {
              console.warn(`Firestore sync skipped for ${tableName}/${rec.id}:`, err);
            }
          }
        }
        const payload = wantsObject ? (inserted[0] ?? null) : inserted;
        return new Response(JSON.stringify(payload), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (postErr) {
        console.error(`Error inserting into ${tableName}:`, postErr);
        return new Response(JSON.stringify(wantsObject ? {} : []), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (method === 'PATCH') {
      try {
        const bodyText = typeof init?.body === 'string' ? init.body : '';
        const updates = bodyText ? JSON.parse(bodyText) : {};
        const matchingIds = new Set(rows.map((r) => r.id));
        const updated: any[] = [];
        tables[tableName] = tables[tableName].map((r) => {
          if (matchingIds.has(r.id)) {
            const next = { ...r, ...updates, updated_at: new Date().toISOString() };
            updated.push(next);
            return next;
          }
          return r;
        });
        saveTableToStorage(tableName, tables[tableName]);
        if (CATALOG_COLLECTIONS.has(tableName) || tableName === 'orders' || tableName === 'profiles') {
          for (const rec of updated) {
            try {
              await setDoc(doc(db, tableName, String(rec.id)), rec, { merge: true });
            } catch (err) {
              console.warn(`Firestore sync skipped for ${tableName}/${rec.id}:`, err);
            }
          }
        }
        const payload = wantsObject ? (updated[0] ?? null) : updated;
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify(wantsObject ? null : []), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (method === 'DELETE') {
      const matchingIds = new Set(rows.map((r) => r.id));
      tables[tableName] = tables[tableName].filter((r) => !matchingIds.has(r.id));
      saveTableToStorage(tableName, tables[tableName]);
      if (CATALOG_COLLECTIONS.has(tableName) || tableName === 'orders' || tableName === 'profiles') {
        for (const rec of rows) {
          try {
            await deleteDoc(doc(db, tableName, String(rec.id)));
          } catch (err) {
            console.warn(`Firestore delete skipped for ${tableName}/${rec.id}:`, err);
          }
        }
      }
      return new Response(JSON.stringify(wantsObject ? (rows[0] ?? null) : rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ordering
    const orderParam = url.searchParams.get('order');
    if (orderParam) {
      const [col, dir] = orderParam.split('.');
      const asc = dir !== 'desc';
      rows.sort((a, b) => {
        const va = a[col];
        const vb = b[col];
        if (va === vb) return 0;
        if (va === undefined || va === null) return 1;
        if (vb === undefined || vb === null) return -1;
        return (va < vb ? -1 : 1) * (asc ? 1 : -1);
      });
    }

    const total = rows.length;

    // Limit / Offset
    const offsetParam = Number(url.searchParams.get('offset') || 0);
    const limitParam = url.searchParams.get('limit');
    if (limitParam !== null) {
      rows = rows.slice(offsetParam, offsetParam + Number(limitParam));
    } else if (offsetParam > 0) {
      rows = rows.slice(offsetParam);
    }

    // Range header (e.g. 0-9)
    const rangeHeader = getHeader(headers, 'range');
    if (rangeHeader && rangeHeader.includes('-')) {
      const [startStr, endStr] = rangeHeader.replace(/items=/, '').split('-');
      const start = Number(startStr);
      const end = Number(endStr);
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        rows = rows.slice(start, end + 1);
      }
    }

    const contentRange = total > 0 ? `0-${Math.max(0, rows.length - 1)}/${total}` : `*/0`;

    if (method === 'HEAD') {
      return new Response(null, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': contentRange,
        },
      });
    }

    if (wantsObject) {
      return new Response(JSON.stringify(rows[0] ?? null), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': contentRange,
        },
      });
    }

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Range': contentRange,
      },
    });
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
