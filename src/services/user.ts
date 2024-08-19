import { createHmac, randomBytes } from "node:crypto";
import JWT from "jsonwebtoken";
import { prismaClient } from "../lib/db";

const SECRET_KEY = "flash";
export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface GetUserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  private static generateHash(salt: string, password: string) {
    const hashedPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    return hashedPassword;
  }
  public static getUserByEmail(email: string) {
    return prismaClient.user.findUnique({ where: { email } });
  }
  public static getUserById(id: string) {
    return prismaClient.user.findUnique({ where: { id } });
  }
  public static async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);
    if (!user) throw new Error("User Not Found");
    const userSalt = user.salt;
    const userHashedPassword = UserService.generateHash(userSalt, password);
    if (userHashedPassword !== user.password)
      throw new Error("Incorrect Password");

    const token = JWT.sign({ id: user.id, email: user.email }, SECRET_KEY);
    return token;
  }
  public static createUser(payload: CreateUserPayload) {
    const { email, firstName, password, lastName } = payload;
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = UserService.generateHash(salt, password);
    return prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        salt,
        password: hashedPassword,
      },
    });
  }

  public static decodeJWTToken(token: string) {
    return JWT.verify(token, SECRET_KEY);
  }
}

export default UserService;
