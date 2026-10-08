export function canCreateProjects(role) {
  return role === "employee";
}

export function canManageProjects(role) {
  return role === "employee";
}

export function canManageOperations(role) {
  return role === "employee";
}

export function canCreateTasks(role) {
  return role === "employee";
}
