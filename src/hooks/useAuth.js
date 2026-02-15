/**
 * Hook to get current user and role for RBAC
 */
export function useAuth() {
  const getItem = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const userStr = getItem("user");
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    user = null;
  }

  return {
    user,
    isAdmin: user?.role === "admin",
    isStaff: user?.role === "staff",
  };
}
