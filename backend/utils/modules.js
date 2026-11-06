const NAMES = ["Introduction", "Core Concepts", "Hands-on Practice", "Advanced Topics", "Final Project"];
const ICONS = ["🚀", "📘", "🛠️", "🧠", "🏁"];

function split(total, n) {
  const base = Math.floor(total / n);
  const extra = total % n;
  return Array.from({ length: n }, (_, i) => Math.max(1, base + (i < extra ? 1 : 0)));
}

function theoryFor(moduleTitle, courseTitle) {
  return [
    `${moduleTitle} is a core building block of ${courseTitle}. In this module you move from the big picture to hands-on practice, building small examples as you go.`,
    `Start by reading through the key ideas and the vocabulary used in this topic. Make short notes in your own words - explaining a concept simply is the best way to check that you understand it.`,
    `Next, try a small exercise: apply what you just read to a tiny example of your own. Mistakes at this stage are useful, because they show exactly what to revisit.`,
    `By the end you should be able to explain the key ideas, apply them in a short exercise, and see where they fit in the wider course. When you are comfortable, mark the module as read to move on.`
  ];
}

// Auto-generates module content for a course (used when an admin adds a course)
function generateModules(courseTitle, totalLessons, count = 3) {
  const lessons = split(Math.max(totalLessons || count, count), count);
  return lessons.map((l, i) => {
    const name = NAMES[i % NAMES.length];
    return {
      moduleId: `m${i + 1}`,
      title: `Module ${i + 1}: ${name}`,
      icon: ICONS[i % ICONS.length],
      lessons: l,
      videoMinutes: 10,
      theory: theoryFor(name, courseTitle)
    };
  });
}

// Spreads a new lesson total across existing modules (keeps module ids)
function rescaleModules(modules, newTotal) {
  const counts = split(Math.max(newTotal, modules.length), modules.length);
  return modules.map((m, i) => ({ ...(m.toObject ? m.toObject() : m), lessons: counts[i] }));
}

const sumLessons = (modules) => (modules || []).reduce((s, m) => s + (m.lessons || 0), 0);

module.exports = { generateModules, rescaleModules, sumLessons, split, theoryFor };
