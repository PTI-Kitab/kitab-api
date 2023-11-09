import { t } from "elysia";

export const Client = t.Object({
  id: t.Number(),
  firstName: t.String({
    minLength: 3,
    maxLength: 255,
    error: "Nama Depan minimal 3 karakter, maksimal 255 karakter",
  }),
  lastName: t.Optional(
    t.String({
      maxLength: 255,
      error: "Nama belakang maksimal 255 karakter",
    })
  ),
  noHp: t.String({
    pattern: `^(\\+62|62|0)8[1-9][0-9]{6,9}$`,
    error: "Nomor telepon tidak valid",
    default: "123",
  }),
  email: t.String({
    format: "email",
    error: "Email tidak valid",
    default: "",
  }),
  password: t.String({
    minLength: 8,
    error: "Password minimal 8 karakter",
  }),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const loginDto = t.Pick(Client, ["email", "password"]);
export const registerDto = t.Pick(Client, [
  "firstName",
  "lastName",
  "noHp",
  "email",
  "password",
]);
