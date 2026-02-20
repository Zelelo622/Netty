export const ROUTES = {
  HOME: "/",
  AUTH: "/sign-in",
  SETTINGS: "/settings",
  ALL_COMMUNITIES: "/communities",
  CREATE_COMMUNITY: "/communities/create",

  COMMUNITY: (name: string) => `/n/${name}`,
  POST: (community: string, postSlug: string) => `/n/${community}/post/${postSlug}`,
  CREATE_POST: (community: string) => `/n/${community}/submit`,
};
