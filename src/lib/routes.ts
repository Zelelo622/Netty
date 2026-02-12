export const ROUTES = {
  HOME: "/",
  AUTH: "/sign-in",
  SETTINGS: "/settings",
  ALL_COMMUNITIES: "/communities",

  COMMUNITY: (name: string) => `/r/${name}`,
  POST: (community: string, id: string) => `/r/${community}/posts/${id}`,
};
