// Sample catalogue (same 9 courses as the original static site).
const { split, theoryFor } = require("../utils/modules");

const mod = (courseTitle, defs) =>
  defs.map(([title, icon, lessons], i) => ({
    moduleId: `m${i + 1}`,
    title: `Module ${i + 1}: ${title}`,
    icon,
    lessons,
    videoMinutes: [8, 10, 12, 15][i % 4],
    theory: theoryFor(title, courseTitle)
  }));

// [title, icon] list + total lessons -> modules with lessons spread evenly
const auto = (courseTitle, names, total) => {
  const counts = split(total, names.length);
  return mod(courseTitle, names.map(([t, i], k) => [t, i, counts[k]]));
};

const courses = [
  {
    title: "Full Stack Web Development", category: "Web Development", level: "Intermediate",
    instructor: "Arjun Kumar", rating: 4.8, duration: 24, price: 1999, emoji: "📱",
    description: "Master HTML, CSS, JavaScript, Node.js, and databases. Build real-world projects and land your first dev job.",
    modules: mod("Full Stack Web Development", [
      ["HTML Basics", "📝", 5], ["CSS Styling", "🎨", 7], ["JavaScript", "⚡", 10],
      ["React.js", "⚛️", 8], ["Backend with Node", "🖥️", 7], ["MongoDB", "🗄️", 5]
    ])
  },
  {
    title: "Python for Data Science", category: "Data Science", level: "Beginner",
    instructor: "Priya Nair", rating: 4.7, duration: 18, price: 0, emoji: "🐍",
    description: "Learn Python, NumPy, Pandas and data visualisation from scratch.",
    modules: auto("Python for Data Science", [["Python Basics", "🐍"], ["NumPy Arrays", "🔢"], ["Pandas DataFrames", "🐼"], ["Data Visualisation", "📊"], ["Intro to Modelling", "🧪"]], 36)
  },
  {
    title: "UI/UX Design Fundamentals", category: "Design", level: "Beginner",
    instructor: "Sneha Reddy", rating: 4.9, duration: 14, price: 1499, emoji: "🎨",
    description: "Learn design principles, wireframing and prototyping.",
    modules: auto("UI/UX Design Fundamentals", [["Design Principles", "📐"], ["Colour & Typography", "🎨"], ["Wireframing", "✏️"], ["Prototyping in Figma", "🧩"], ["Usability Testing", "🔍"]], 28)
  },
  {
    title: "React JS — From Zero to Hero", category: "Web Development", level: "Advanced",
    instructor: "Vikram Singh", rating: 4.9, duration: 30, price: 2499, emoji: "⚛️",
    description: "Build modern apps with React, hooks, routing and state management.",
    modules: auto("React JS — From Zero to Hero", [["JSX & Components", "🧱"], ["Props and State", "🔄"], ["Hooks", "🪝"], ["Routing", "🧭"], ["State Management", "🗃️"]], 50)
  },
  {
    title: "SQL & Database Design", category: "Database", level: "Beginner",
    instructor: "Meena Iyer", rating: 4.6, duration: 12, price: 0, emoji: "🗄️",
    description: "Write SQL queries and design normalised relational databases.",
    modules: auto("SQL & Database Design", [["Relational Basics", "📚"], ["SELECT Queries", "🔎"], ["Joins", "🔗"], ["Normalisation", "📏"], ["Indexes & Transactions", "⚙️"]], 24)
  },
  {
    title: "AWS Cloud Practitioner", category: "Cloud", level: "Intermediate",
    instructor: "Ravi Sharma", rating: 4.8, duration: 22, price: 2999, emoji: "☁️",
    description: "Understand core AWS services and prepare for the certification.",
    modules: auto("AWS Cloud Practitioner", [["Cloud Concepts", "☁️"], ["Core Services", "🧰"], ["Security & IAM", "🔐"], ["Pricing & Support", "💰"], ["Exam Prep", "🎯"]], 38)
  },
  {
    title: "Flutter App Development", category: "Mobile", level: "Intermediate",
    instructor: "Anika Patel", rating: 4.7, duration: 26, price: 1799, emoji: "📲",
    description: "Build cross-platform mobile apps with Flutter and Dart.",
    modules: auto("Flutter App Development", [["Dart Basics", "🎯"], ["Widgets", "🧩"], ["Layouts", "📐"], ["State Management", "🔄"], ["Publishing Apps", "🚀"]], 44)
  },
  {
    title: "Machine Learning with Python", category: "Data Science", level: "Advanced",
    instructor: "Dr. Suresh K", rating: 5.0, duration: 35, price: 3499, emoji: "🤖",
    description: "Supervised, unsupervised learning and model deployment.",
    modules: auto("Machine Learning with Python", [["ML Foundations", "🧠"], ["Regression", "📈"], ["Classification", "🗂️"], ["Clustering", "🫧"], ["Model Deployment", "🚀"]], 56)
  },
  {
    title: "HTML & CSS for Beginners", category: "Web Development", level: "Beginner",
    instructor: "Kavya Menon", rating: 4.5, duration: 10, price: 0, emoji: "🌐",
    description: "Build and style your first responsive web pages.",
    modules: auto("HTML & CSS for Beginners", [["HTML Structure", "🏗️"], ["CSS Selectors", "🎯"], ["Box Model", "📦"], ["Flexbox & Grid", "🧮"], ["Responsive Design", "📱"]], 20)
  }
];

courses.forEach((c) => {
  c.lessons = c.modules.reduce((s, m) => s + m.lessons, 0);
});

module.exports = courses;
