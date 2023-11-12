import prisma from "../src/services/db";
import { password } from "bun";
type AdminDto = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  noHp: string;
  gender: "pria" | "wanita";
};

const createNewAdmin = async (user: AdminDto) => {
  const admin = await prisma.admin.create({
    data: {
      ...user,
      password: await password.hash(user.password),
    },
  });

  return admin;
};

const admin = await createNewAdmin({
  firstName: "Overlord",
  lastName: "Admin",
  email: "admin@gmail.com",
  gender: "pria",
  noHp: "081234567890",
  password: "admin123",
});

console.log(admin);
