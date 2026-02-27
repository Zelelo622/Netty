export const ROUTES = {
  HOME: "/",
  AUTH: "/sign-in",
  SETTINGS: "/settings",
  ALL_COMMUNITIES: "/communities",

  COMMUNITY: (name: string) => `/n/${name}`,
  POST: (community: string, postId: string) => `/n/${community}/post/${postId}`,
  CREATE_POST: (community: string) => `/n/${community}/submit`,
};
