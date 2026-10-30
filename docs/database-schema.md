# Database Schema (Task 11)

MongoDB + Mongoose. Models live in `backend/models/`.

```
User 1───* Enrollment *───1 Course
User 1───* LearningProgress *───1 Course      (one per student+course)
User 1───* Certificate *───1 Course
User 1───* Notification
User 1───* Message *───1 User                 (sender / recipient)
User 1───* Activity                           (hours per day)
```

| Collection | Fields | Indexes / rules |
|---|---|---|
| users | name, email, password (bcrypt, `select:false`), role (`student`/`admin`), rollNo, adminId, timestamps | email unique; adminId unique sparse |
| courses | title, description, duration (hours), category, level, instructor, price, lessons, rating, emoji, modules[{moduleId,title,icon,lessons,videoMinutes,theory[]}] | text-searchable title |
| enrollments | student→User, course→Course, status (`active`/`completed`/`withdrawn`), enrolledAt | unique {student, course} |
| learningprogresses | student, course, completedLessons, totalLessons, progressPercentage, completedModules[], moduleProgress, lastActiveAt | unique {student, course} |
| notifications | recipient→User, message, isRead, createdAt | index {recipient, createdAt} |
| messages | sender→User, recipient→User, text (max 2000), createdAt | index {sender, recipient, createdAt} |
| certificates | student, course, code, issuedAt | code unique |
| activities | student, date (YYYY-MM-DD), hours | unique {student, date} |

A module counts as complete when its photo, video and theory parts are done. Course progress reaches 100% only when every module is complete, and then a certificate is issued.
