export function canCreateProjects(role) {
  return role === "employee";
}

export function canCreateTasks(role) {
  return role === "employee";
}
