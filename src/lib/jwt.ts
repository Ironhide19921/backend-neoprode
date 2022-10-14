import { IUser } from "../interfaces/user.interface";
import jwt from "jsonwebtoken";

class JWT {
  private secretKey =
    process.env.SECRET_KEY || "Anartz1789719871_!-iajyiajy874";
  // Información del payload para crear token que usaremos para autenticarnos
  sign(data: IUser, expiresIn = 60): string {
    return jwt.sign(
      {
        user: data,
      },
      this.secretKey,
      { expiresIn }
    );
    return "";
  }
}
export default JWT;
