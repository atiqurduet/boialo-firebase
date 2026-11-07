# Boialo — cPanel MySQL Database & Media Library Setup

এই folder-এর ফাইল গুলো দিয়ে আপনি পুরো প্রজেক্টটি **cPanel MySQL (phpMyAdmin)** এবং **cPanel File Storage**-এ কোনোরকম frontend কোড বা ফোল্ডার স্ট্রাকচার পরিবর্তন ছাড়াই চালাতে পারবেন।

---

## ১. cPanel-এ MySQL Database তৈরি ও SQL Import

1. **cPanel → MySQL® Databases** (অথবা MySQL Database Wizard)-এ যান:
   - নতুন একটি Database তৈরি করুন (যেমন: `cpaneluser_boialo`)
   - নতুন একটি Database User ও Password তৈরি করুন (যেমন: `cpaneluser_dbuser`)
   - User-কে Database-এ **ALL PRIVILEGES** দিয়ে যুক্ত করুন।
2. **cPanel → phpMyAdmin**-এ যান:
   - বাম পাশ থেকে আপনার তৈরি করা ডাটাবেস (`cpaneluser_boialo`) সিলেক্ট করুন।
   - উপরের **Import** ট্যাবে ক্লিক করুন।
   - এই প্রজেক্টের `cpanel/mysql_schema.sql` ফাইলটি সিলেক্ট করে **Import / Go** বাটনে ক্লিক করুন।
   - এতে সব টেবিল (`products`, `categories`, `orders`, `writers`, `publishers`, `site_settings`, `homepage_sections` ইত্যাদি) এবং প্রাথমিক ডেটা তৈরি হয়ে যাবে।

---

## ২. cPanel-এ PHP API ও Media Folder আপলোড

cPanel `public_html/` ভিতরে নিচের স্ট্রাকচারে ফাইলগুলো রাখুন:

```
public_html/
├── index.html             <- (npm run build এর পর dist/ ফোল্ডারের সব ফাইল)
├── .htaccess              <- SPA routing এর জন্য
└── uploads/
    ├── .htaccess          <- cpanel/uploads/.htaccess থেকে
    └── api/
        ├── config.php     <- config.php.example থেকে rename করে MySQL ও Secret বসান
        ├── _helpers.php
        ├── db.php         <- MySQL REST Bridge (সব ডাটাবেস কুয়েরির জন্য)
        ├── upload.php     <- ইমেজ ও PDF আপলোডের জন্য
        └── delete.php     <- ফাইল ডিলিটের জন্য
```

---

## ৩. `config.php` কনফিগারেশন

`public_html/uploads/api/config.php.example` ফাইলটি rename করে `config.php` করুন এবং আপনার MySQL তথ্য বসান:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'cpaneluser_boialo');
define('DB_USER', 'cpaneluser_dbuser');
define('DB_PASS', 'YOUR_MYSQL_PASSWORD');
define('DB_CHARSET', 'utf8mb4');
```

---

## ৪. Frontend `.env` ও Build (cPanel Hosting-এর জন্য)

প্রজেক্টের রুটে `.env` ফাইলে আপনার ডোমেইনের `db.php` এবং `uploads` URL দিন:

```env
VITE_MYSQL_API_URL=https://your-domain.com/uploads/api/db.php
VITE_MEDIA_BASE_URL=https://your-domain.com/uploads
```

এরপর বিল্ড করুন:
```bash
npm install
npm run build
```

`dist/` ফোল্ডারের সব ফাইল `public_html/`-এ আপলোড করুন।
