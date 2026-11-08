// Firestore-backed PostgREST & Edge Functions adapter for Supabase client
// Keeps the existing project structure intact while persisting data in Firebase Firestore.
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

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
  { id: CAT_ISLAMIC, name_bn: 'ইসলামি বই', name_en: 'Islamic Books', slug: 'islamic', image_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 1, is_active: true, created_at: nowIso },
  { id: CAT_NOVEL, name_bn: 'উপন্যাস ও সাহিত্য', name_en: 'Novels & Literature', slug: 'novels', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 2, is_active: true, created_at: nowIso },
  { id: CAT_ACADEMIC, name_bn: 'একাডেমিক বই', name_en: 'Academic Books', slug: 'academic', image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 3, is_active: true, created_at: nowIso },
  { id: CAT_CHILDREN, name_bn: 'শিশু-কিশোর বই', name_en: 'Children Books', slug: 'children', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 4, is_active: true, created_at: nowIso },
  { id: CAT_SELFHELP, name_bn: 'আত্মউন্নয়ন ও মোটিভেশন', name_en: 'Self Help', slug: 'self-help', image_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 5, is_active: true, created_at: nowIso },
  { id: CAT_HISTORY, name_bn: 'ইতিহাস ও ঐতিহ্য', name_en: 'History & Tradition', slug: 'history', image_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 6, is_active: true, created_at: nowIso },
  { id: CAT_SCIENCE, name_bn: 'বিজ্ঞান ও প্রযুক্তি', name_en: 'Science & Tech', slug: 'science', image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 7, is_active: true, created_at: nowIso },
  { id: CAT_TRANSLATION, name_bn: 'অনুবাদ সাহিত্য', name_en: 'Translated Literature', slug: 'translation', image_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80', parent_id: null, sort_order: 8, is_active: true, created_at: nowIso },
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
  ],
  navigation_menus: [
    { id: MENU_ID, name: 'Main Navigation', slug: 'main-nav', location: 'header', created_at: nowIso, updated_at: nowIso },
  ],
  menu_items: [
    { id: '101', menu_id: MENU_ID, parent_id: null, title_bn: 'হোম', title_en: 'Home', url: '/', icon: null, sort_order: 1, is_active: true, open_in_new_tab: false },
    { id: '102', menu_id: MENU_ID, parent_id: null, title_bn: 'সকল বই', title_en: 'All Books', url: '/shop', icon: null, sort_order: 2, is_active: true, open_in_new_tab: false },
    { id: '103', menu_id: MENU_ID, parent_id: null, title_bn: 'বিভাগসমূহ', title_en: 'Categories', url: '/categories', icon: null, sort_order: 3, is_active: true, open_in_new_tab: false },
    { id: '104', menu_id: MENU_ID, parent_id: null, title_bn: 'লেখক', title_en: 'Authors', url: '/authors', icon: null, sort_order: 4, is_active: true, open_in_new_tab: false },
    { id: '105', menu_id: MENU_ID, parent_id: null, title_bn: 'প্রকাশক', title_en: 'Publishers', url: '/publishers', icon: null, sort_order: 5, is_active: true, open_in_new_tab: false },
    { id: '106', menu_id: MENU_ID, parent_id: null, title_bn: 'আজকের অফার', title_en: 'Today Offers', url: '/offers', icon: null, sort_order: 6, is_active: true, open_in_new_tab: false },
    { id: '107', menu_id: MENU_ID, parent_id: null, title_bn: 'ই-বুক', title_en: 'E-Books', url: '/ebooks', icon: null, sort_order: 7, is_active: true, open_in_new_tab: false },
    { id: '108', menu_id: MENU_ID, parent_id: null, title_bn: 'প্রি-অর্ডার', title_en: 'Pre-order', url: '/preorder', icon: null, sort_order: 8, is_active: true, open_in_new_tab: false },
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
    { id: '88888888-8888-4888-8888-888888888801', section_type: 'flash_sale', title_bn: 'ফ্ল্যাশ সেল', title_en: 'Flash Sale', subtitle_bn: 'সর্বোচ্চ ছাড়', sort_order: 1, is_active: true, settings: { min_discount: 30, limit: 8 } },
    { id: '88888888-8888-4888-8888-888888888802', section_type: 'category_grid', title_bn: 'জনপ্রিয় ক্যাটাগরি', title_en: 'Popular Categories', subtitle_bn: 'সব ধরনের বই এক জায়গায়', sort_order: 2, is_active: true, settings: { columns: 4 } },
    { id: '88888888-8888-4888-8888-888888888803', section_type: 'new_releases', title_bn: 'নতুন প্রকাশিত বই', title_en: 'New Releases', subtitle_bn: 'সদ্য প্রকাশিত বইসমূহ', sort_order: 3, is_active: true, settings: { limit: 8 } },
    { id: '88888888-8888-4888-8888-888888888804', section_type: 'bestsellers', title_bn: 'বইমেলা বেস্টসেলার', title_en: 'Bestsellers', subtitle_bn: 'সবচেয়ে জনপ্রিয় বইসমূহ', sort_order: 4, is_active: true, settings: { limit: 8 } },
    { id: '88888888-8888-4888-8888-888888888805', section_type: 'top_authors', title_bn: 'জনপ্রিয় লেখকবৃন্দ', title_en: 'Top Authors', subtitle_bn: 'পাঠকপ্রিয় লেখকদের বই', sort_order: 5, is_active: true, settings: { limit: 6 } },
    { id: '88888888-8888-4888-8888-888888888806', section_type: 'promo_banner', title_bn: 'প্রমোশনাল ব্যানার', title_en: 'Promo Banner', subtitle_bn: 'বিশেষ অফার', sort_order: 6, is_active: true, settings: { title: 'প্রিমিয়াম বুকমার্ক ফ্রি!', description: '৪৯৯+ টাকার অর্ডারে ক্যালিগ্রাফি বুকমার্ক ফ্রি!', button_text: 'এখনই কিনুন', button_link: '/shop', badge_text: 'সীমিত সময়ের অফার' } },
    { id: '88888888-8888-4888-8888-888888888807', section_type: 'recommended', title_bn: 'আপনার জন্য সুপারিশকৃত', title_en: 'Recommended For You', subtitle_bn: 'আপনার পছন্দ অনুযায়ী', sort_order: 7, is_active: true, settings: { limit: 8 } },
    { id: '88888888-8888-4888-8888-888888888808', section_type: 'trust_badges', title_bn: 'কেন আমাদের থেকে কিনবেন', title_en: 'Why Choose Us', subtitle_bn: null, sort_order: 8, is_active: true, settings: {} },
    { id: '88888888-8888-4888-8888-888888888809', section_type: 'newsletter', title_bn: 'নিউজলেটার', title_en: 'Newsletter', subtitle_bn: null, sort_order: 9, is_active: true, settings: {} },
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
  universal_products: [],
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
  ],
  referral_rewards: [],
  loyalty_points: [
    { id: 'lp-1', user_id: 'help.boialo@gmail.com', points: 50, type: 'earned', source: 'signup_bonus', description: 'সাইনআপ বোনাস পয়েন্ট', created_at: nowIso },
    { id: 'lp-2', user_id: 'help.boialo@gmail.com', points: 50, type: 'earned', source: 'referral_bonus', description: 'বন্ধুকে রেফার করার জন্য বোনাস পয়েন্ট', created_at: nowIso },
  ],
};

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
  if (opExpr.startsWith('gte.')) {
    return Number(rowVal ?? 0) >= Number(opExpr.slice(4));
  }
  if (opExpr.startsWith('gt.')) {
    return Number(rowVal ?? 0) > Number(opExpr.slice(3));
  }
  if (opExpr.startsWith('lte.')) {
    return Number(rowVal ?? 0) <= Number(opExpr.slice(4));
  }
  if (opExpr.startsWith('lt.')) {
    return Number(rowVal ?? 0) < Number(opExpr.slice(3));
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
]);

async function ensureFirestoreCollectionSynced(tableName: string): Promise<void> {
  if (!CATALOG_COLLECTIONS.has(tableName) || syncedCollections.has(tableName)) {
    return;
  }
  syncedCollections.add(tableName);
  try {
    const snap = await getDocs(collection(db, tableName));
    if (!snap.empty) {
      tables[tableName] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } else if (tables[tableName] && tables[tableName].length > 0) {
      // Seed initial records to Firestore in background
      for (const item of tables[tableName]) {
        const docId = String(item.id);
        await setDoc(doc(db, tableName, docId), { ...item, id: docId }).catch(() => {});
      }
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
        const role = email === 'help.boialo@gmail.com' ? 'super_admin' : 'customer';
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
      return new Response(
        JSON.stringify({
          products: [],
          categories: [],
          suggestions: [],
          autocomplete: [],
          totalProducts: 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
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
      result = 'super_admin';
    } else if (fnName === 'has_role' || fnName === 'is_admin') {
      result = true;
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
      if (key === 'or') continue;
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
        const inserted = items.map((item) => ({
          id: String(item.id || crypto.randomUUID()),
          created_at: nowIso,
          ...item,
        }));
        tables[tableName].push(...inserted);
        if (CATALOG_COLLECTIONS.has(tableName) || tableName === 'orders' || tableName === 'profiles') {
          for (const rec of inserted) {
            try {
              await setDoc(doc(db, tableName, String(rec.id)), rec, { merge: true });
            } catch (err) {
              if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
                handleFirestoreError(err, OperationType.CREATE, `${tableName}/${rec.id}`);
              }
            }
          }
        }
        const payload = wantsObject ? (inserted[0] ?? null) : inserted;
        return new Response(JSON.stringify(payload), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
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
        if (CATALOG_COLLECTIONS.has(tableName) || tableName === 'orders' || tableName === 'profiles') {
          for (const rec of updated) {
            try {
              await setDoc(doc(db, tableName, String(rec.id)), rec, { merge: true });
            } catch (err) {
              if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
                handleFirestoreError(err, OperationType.UPDATE, `${tableName}/${rec.id}`);
              }
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
      if (CATALOG_COLLECTIONS.has(tableName) || tableName === 'orders' || tableName === 'profiles') {
        for (const rec of rows) {
          try {
            await deleteDoc(doc(db, tableName, String(rec.id)));
          } catch (err) {
            if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
              handleFirestoreError(err, OperationType.DELETE, `${tableName}/${rec.id}`);
            }
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
