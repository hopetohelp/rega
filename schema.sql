-- מסד הנתונים של רגע לברך (D1). רק אירועים אנונימיים — בלי טקסטים של גולשים.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,       -- זמן (מילישניות)
  day TEXT NOT NULL,         -- תאריך בשעון ישראל, YYYY-MM-DD
  type TEXT NOT NULL,        -- visit | create | share | download | image
  idea TEXT, palette TEXT, music TEXT,
  device TEXT,               -- phone | tablet | desktop
  ms INTEGER,                -- זמן בניית הסרטון
  uid TEXT                   -- מזהה אקראי שנשמר במכשיר (לא זיהוי אישי)
);
CREATE INDEX IF NOT EXISTS events_type ON events(type);
CREATE INDEX IF NOT EXISTS events_day ON events(day);
CREATE INDEX IF NOT EXISTS events_uid ON events(uid);

-- פניות מהאתר (נגישות, פרטיות, כל דבר) — מגיעות לצוות האתר
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  topic TEXT,
  body TEXT NOT NULL,
  reply_to TEXT              -- איך לחזור לפונה, אם השאיר (רשות)
);
