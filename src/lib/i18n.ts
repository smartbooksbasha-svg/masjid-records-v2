import type { Lang } from './settings'
import { settings } from './settings'

/**
 * i18n — English strings ARE the keys. Add a new key in every dict when you
 * add new UI text; anything missing falls back to the English key.
 */
const EN: Record<string, string> = {}

const HI: Record<string, string> = {
  // groups
  Records: 'Records', Analytics: 'Reports', Profiles: 'Profiles', Administration: 'Administration', Account: 'Account',
  // nav
  Dashboard: 'Dashboard', Households: 'Ghar', 'Find Family': 'Family dhoondo', 'Add Household': 'Ghar jodo',
  'Reports & Analytics': 'Reports aur Analytics', 'Exports & Print': 'Export aur Print',
  Documents: 'Documents', 'Government Schemes': 'Sarkari Yojana', 'ID Card Designer': 'ID Card banane wala',
  'Masjid Profile': 'Masjid Profile', Users: 'Users', 'Audit Log': 'Audit Log', 'Recycle Bin': 'Recycle Bin',
  Notifications: 'Soochna', 'My Profile': 'Meri Profile', Settings: 'Settings',
  // common
  Save: 'Save karo', Cancel: 'Cancel', Delete: 'Delete', Edit: 'Badlo', Search: 'Dhoondo', Print: 'Print',
  Export: 'Export', Back: 'Wapas', Close: 'Band karo', Name: 'Naam', Phone: 'Phone', Address: 'Pata',
  Street: 'Gali', Status: 'Status', Members: 'Members', Total: 'Total', All: 'Sab', None: 'Koi nahi',
  'Log in': 'Login karo', 'Log out': 'Logout', Password: 'Password', Email: 'Email', Role: 'Role',
  Active: 'Active', Archived: 'Archived', Male: 'Mard', Female: 'Aurat', Married: 'Shaadi-shuda',
  Unmarried: 'Kunwara', Student: 'Student', Disabled: 'Divyang', Widow: 'Bewa',
  // dashboard
  'Community Records': 'Mohalle ka poora record', 'At a glance': 'Ek nazar me',
  'Population by street': 'Gali ke hisaab se aabadi', 'Housing types': 'Ghar ke prakar',
  'Education levels': 'Padhai ka star', Occupations: 'Kaam-dhandhe', 'Deeni taleem': 'Deeni taleem',
  'Documents held': 'Kaagaz', 'Government schemes': 'Sarkari yojana',
  'Recently added households': 'Naye jode gaye ghar',
  // households
  'Head of household': 'Ghar ke mukhiya', 'House no.': 'Ghar number', 'House type': 'Ghar ka prakar',
  'Date of birth': 'Janm tithi', Education: 'Padhai', Occupation: 'Kaam', Relation: 'Rishta',
  'Marital status': 'Shaadi', 'Full name': 'Poora naam', Gender: 'Ling', Notes: 'Note',
  'No households yet': 'Abhi koi ghar nahi', 'Load sample data': 'Demo data load karo',
  'Household details': 'Ghar ki jankari', Summary: 'Sankshep',
}

const TA: Record<string, string> = {
  Records: 'பதிவுகள்', Analytics: 'அறிக்கைகள்', Profiles: 'விவரங்கள்', Administration: 'நிர்வாகம்', Account: 'கணக்கு',
  Dashboard: 'முகப்பு', Households: 'வீடுகள்', 'Find Family': 'குடும்பம் தேடு', 'Add Household': 'வீடு சேர்',
  'Reports & Analytics': 'அறிக்கைகள்', 'Exports & Print': 'ஏற்றுமதி & அச்சு',
  Documents: 'ஆவணங்கள்', 'Government Schemes': 'அரசு திட்டங்கள்', 'ID Card Designer': 'அடையாள அட்டை',
  'Masjid Profile': 'மஸ்ஜித் விவரம்', Users: 'பயனர்கள்', 'Audit Log': 'தணிக்கை பதிவு', 'Recycle Bin': 'மறுசுழற்சி',
  Notifications: 'அறிவிப்புகள்', 'My Profile': 'எனது விவரம்', Settings: 'அமைப்புகள்',
  Save: 'சேமி', Cancel: 'ரத்து', Delete: 'நீக்கு', Edit: 'திருத்து', Search: 'தேடு', Print: 'அச்சிடு',
  Export: 'ஏற்றுமதி', Back: 'பின்', Close: 'மூடு', Name: 'பெயர்', Phone: 'தொலைபேசி', Address: 'முகவரி',
  Street: 'தெரு', Status: 'நிலை', Members: 'உறுப்பினர்கள்', Total: 'மொத்தம்', All: 'அனைத்தும்', None: 'இல்லை',
  'Log in': 'உள்நுழை', 'Log out': 'வெளியேறு', Password: 'கடவுச்சொல்', Email: 'மின்னஞ்சல்', Role: 'பங்கு',
  Active: 'செயலில்', Archived: 'காப்பகம்', Male: 'ஆண்', Female: 'பெண்', Married: 'திருமணமானவர்',
  Unmarried: 'திருமணமாகாதவர்', Student: 'மாணவர்', Disabled: 'மாற்றுத்திறனாளி', Widow: 'விதவை',
  'Community Records': 'சமூக பதிவுகள்', 'At a glance': 'ஒரு பார்வையில்',
  'Population by street': 'தெரு வாரியாக மக்கள் தொகை', 'Housing types': 'வீட்டு வகைகள்',
  'Education levels': 'கல்வி நிலை', Occupations: 'தொழில்கள்', 'Deeni taleem': 'மதக் கல்வி',
  'Documents held': 'ஆவணங்கள்', 'Government schemes': 'அரசு திட்டங்கள்',
  'Recently added households': 'சமீபத்தில் சேர்க்கப்பட்டவை',
  'Head of household': 'குடும்பத் தலைவர்', 'House no.': 'வீட்டு எண்', 'House type': 'வீட்டு வகை',
  'Date of birth': 'பிறந்த தேதி', Education: 'கல்வி', Occupation: 'தொழில்', Relation: 'உறவு',
  'Marital status': 'திருமண நிலை', 'Full name': 'முழு பெயர்', Gender: 'பாலினம்', Notes: 'குறிப்பு',
  'No households yet': 'இன்னும் வீடுகள் இல்லை', 'Load sample data': 'மாதிரி தரவு ஏற்று',
  'Household details': 'வீட்டு விவரம்', Summary: 'சுருக்கம்',
}

const UR: Record<string, string> = {
  Records: 'ریکارڈز', Analytics: 'رپورٹس', Profiles: 'پروفائلز', Administration: 'انتظامیہ', Account: 'اکاؤنٹ',
  Dashboard: 'ڈیش بورڈ', Households: 'گھرانے', 'Find Family': 'خاندان تلاش کریں', 'Add Household': 'گھرانہ شامل کریں',
  'Reports & Analytics': 'رپورٹس', 'Exports & Print': 'ایکسپورٹ اور پرنٹ',
  Documents: 'دستاویزات', 'Government Schemes': 'سرکاری اسکیمیں', 'ID Card Designer': 'شناختی کارڈ',
  'Masjid Profile': 'مسجد پروفائل', Users: 'صارفین', 'Audit Log': 'آڈٹ لاگ', 'Recycle Bin': 'ریسائیکل بِن',
  Notifications: 'اطلاعات', 'My Profile': 'میرا پروفائل', Settings: 'ترتیبات',
  Save: 'محفوظ کریں', Cancel: 'منسوخ', Delete: 'حذف', Edit: 'ترمیم', Search: 'تلاش', Print: 'پرنٹ',
  Export: 'ایکسپورٹ', Back: 'واپس', Close: 'بند', Name: 'نام', Phone: 'فون', Address: 'پتہ',
  Street: 'گلی', Status: 'حالت', Members: 'افراد', Total: 'کل', All: 'سب', None: 'کوئی نہیں',
  'Log in': 'لاگ ان', 'Log out': 'لاگ آؤٹ', Password: 'پاس ورڈ', Email: 'ای میل', Role: 'کردار',
  Active: 'فعال', Archived: 'محفوظ شدہ', Male: 'مرد', Female: 'عورت', Married: 'شادی شدہ',
  Unmarried: 'غیر شادی شدہ', Student: 'طالب علم', Disabled: 'معذور', Widow: 'بیوہ',
  'Community Records': 'کمیونٹی ریکارڈز', 'At a glance': 'ایک نظر میں',
  'Population by street': 'گلی کے حساب سے آبادی', 'Housing types': 'مکان کی اقسام',
  'Education levels': 'تعلیم کی سطح', Occupations: 'پیشے', 'Deeni taleem': 'دینی تعلیم',
  'Documents held': 'دستاویزات', 'Government schemes': 'سرکاری اسکیمیں',
  'Recently added households': 'حال ہی میں شامل',
  'Head of household': 'سربراہ خاندان', 'House no.': 'مکان نمبر', 'House type': 'مکان کی قسم',
  'Date of birth': 'تاریخ پیدائش', Education: 'تعلیم', Occupation: 'پیشہ', Relation: 'رشتہ',
  'Marital status': 'ازدواجی حالت', 'Full name': 'پورا نام', Gender: 'جنس', Notes: 'نوٹ',
  'No households yet': 'ابھی کوئی گھرانہ نہیں', 'Load sample data': 'نمونہ ڈیٹا لوڈ کریں',
  'Household details': 'گھرانے کی تفصیل', Summary: 'خلاصہ',
}

const DICTS: Record<Lang, Record<string, string>> = { en: EN, hi: HI, ta: TA, ur: UR }

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hinglish' },
  { id: 'ta', label: 'தமிழ்' },
  { id: 'ur', label: 'اردو' },
]

export function translate(key: string, lang: Lang): string {
  if (lang === 'en') return key
  return DICTS[lang]?.[key] ?? key
}

export function useT(): (key: string) => string {
  const s = settings.use()
  return (key: string) => translate(key, s.lang)
}
