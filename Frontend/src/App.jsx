import { Routes, Route } from "react-router-dom";

const pages = [
  ["Login", "/login"],
  ["Dashboard", "/dashboard"],
  ["Projects", "/projects"],
  ["Create Project", "/projects/create"],
  ["Project Details", "/projects/:id"],
  ["Project Updates", "/projects/:id/updates"],
  ["Project Tasks", "/projects/:id/tasks"],
  ["Tasks", "/tasks"],
  ["Meetings", "/meetings"],
  ["Create Meeting", "/meetings/create"],
  ["Meeting Details", "/meetings/:id"],
  ["Meeting Room", "/meeting-room"],
  ["Intern Pods", "/intern-pods"],
  ["Intern Pod Details", "/intern-pods/:id"],
  ["Reports", "/reports"],
  ["Users", "/users"],
  ["Settings", "/settings"],
  ["Audit Logs", "/audit-logs"],
];

function Page({ name }) {
  return <main><h1>{name}</h1><p>InnerLoop page scaffold.</p></main>;
}

export default function App() {
  return (
    <Routes>
      {pages.map(([name, path]) => (
        <Route key={path} path={path} element={<Page name={name} />} />
      ))}
      <Route path="*" element={<Page name="Dashboard" />} />
    </Routes>
  );
}
