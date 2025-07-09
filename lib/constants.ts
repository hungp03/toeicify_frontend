export const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Luyện tập", path: "/practice-tests" },
    { name: "Blog", path: "/blog" },
    { name: "Flashcards", path: "/flashcards" },
    { name: "Tiến độ", path: "/progress" },
];

export enum ErrorCode {
  EXCEPTION = 1,
  BAD_CREDENTIALS = 2,
  RESOURCE_NOT_FOUND = 3,
  UNAUTHORIZED = 4,
  RESOURCE_INVALID = 5,
  RESOURCE_ALREADY_EXISTS = 6,
  METHOD_NOT_VALID = 7
}

