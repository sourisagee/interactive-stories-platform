import { Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import formatResponse from "../utils/formatResponse";
import generateJwtTokens from "../utils/generateJwtTokens";
import cookieConfig from "../config/cookieConfig";
import { UserService } from "../services/user.service";
import { omitPassword } from "../middleware/validation/user.validation";
import type { JwtPayload, TypedResponse, UpdateUserData } from "../types";

export class UserController {
  static refreshTokens(req: Request, res: TypedResponse): void {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res
          .status(401)
          .clearCookie("refreshToken", cookieConfig)
          .json(
            formatResponse(401, "No refresh token", null, "No refresh token")
          );
        return;
      }

      const { user } = jwt.verify(
        refreshToken,
        process.env.SECRET_REFRESH_TOKEN as string
      ) as JwtPayload;

      const { accessToken, refreshToken: newRefreshToken } =
        generateJwtTokens({user});

      const { accessToken, refreshToken: newRefreshToken } = generateJwtTokens({user});
      
      res
        .status(200)
        .cookie("refreshToken", newRefreshToken, cookieConfig)
        .json(
          formatResponse(
            200,
            "Session extended",
            { user: user, accessToken },
            null
          )
        );
    } catch (error) {
      res
        .status(401)
        .clearCookie("refreshToken", cookieConfig)
        .json(
          formatResponse(
            401,
            "Invalid refresh token",
            null,
            "Invalid refresh token"
          )
        );
    }
  }

  static async signUp(req: Request, res: TypedResponse): Promise<void> {
    const { email, username, password, role } = req.body;
    const emailNorm = (email as string)?.trim().toLowerCase();
    try {
      const found = await UserService.getUserByEmail(emailNorm);
      if (found) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "User with this email already exists",
              null,
              "User with this email already exists"
            )
          );
        return;
      }
      const user = await UserService.createUser({
        username,
        email,
        password,
        role,
      });
      const { accessToken, refreshToken } = generateJwtTokens({ user });
      res
        .status(201)
        .cookie("refreshToken", refreshToken, cookieConfig)
        .json(
          formatResponse(
            201,
            "Registration successful",
            { user, accessToken },
            null
          )
        );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res
        .status(500)
        .json(formatResponse(500, "Internal server error", null, msg));
    }
  }

  static async signIn(req: Request, res: TypedResponse): Promise<void> {
    const { email, password } = req.body;
    try {
      const userFound = await UserService.getUserByEmail(
        (email as string)?.trim().toLowerCase()
      );
      if (!userFound) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "User with this email not found",
              null,
              "User with this email not found"
            )
          );
        return;
      }
      const valid = await bcrypt.compare(password, userFound.password);
      if (!valid) {
        res
          .status(400)
          .json(
            formatResponse(400, "Invalid password", null, "Invalid password")
          );
        return;
      }
      const user = omitPassword(userFound);
      const { accessToken, refreshToken } = generateJwtTokens({ user });
      res
        .status(200)
        .cookie("refreshToken", refreshToken, cookieConfig)
        .json(
          formatResponse(200, "Sign in successful", { user, accessToken }, null)
        );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res
        .status(500)
        .json(formatResponse(500, "Internal server error", null, msg));
    }
  }

  static signOut(req: Request, res: TypedResponse): void {
    console.log(req.cookies);

    res
      .clearCookie("refreshToken", cookieConfig)
      .json(formatResponse(200, "Sign out successful", null, null));
  }

  static async getAll(_req: Request, res: TypedResponse): Promise<void> {
    try {
      const users = await UserService.getAll();
      res.json(formatResponse(200, "OK", users, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res
        .status(500)
        .json(formatResponse(500, "Internal server error", null, msg));
    }
  }

  static async getById(req: Request, res: TypedResponse): Promise<void> {
    const id = Number(req.params.userId);
    if (Number.isNaN(id)) {
      res
        .status(400)
        .json(formatResponse(400, "Invalid user id", null, "Invalid user id"));
      return;
    }
    try {
      const user = await UserService.getById(id);
      if (!user) {
        res
          .status(404)
          .json(formatResponse(404, "User not found", null, "User not found"));
        return;
      }
      res.json(formatResponse(200, "OK", user, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res
        .status(500)
        .json(formatResponse(500, "Internal server error", null, msg));
    }
  }

  static async updateUserById(req: Request, res: TypedResponse): Promise<void> {
    const id = Number(req.params.userId);
    const currentId = res.locals.user?.id;
    if (Number.isNaN(id)) {
      res
        .status(400)
        .json(formatResponse(400, "Invalid user id", null, "Invalid user id"));
      return;
    }
    if (currentId !== id) {
      res
        .status(403)
        .json(
          formatResponse(
            403,
            "You can only update your own profile",
            null,
            "Forbidden"
          )
        );
      return;
    }
    try {
      const updated = await UserService.update(id, req.body as UpdateUserData);
      if (updated === null) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "Email already in use",
              null,
              "Email already in use"
            )
          );
        return;
      }
      res.json(formatResponse(200, "Profile updated", updated, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res
        .status(500)
        .json(formatResponse(500, "Internal server error", null, msg));
    }
  }

  static async deleteUserById(req: Request, res: TypedResponse): Promise<void> {
    const id = Number(req.params.userId);
    const currentId = res.locals.user?.id;
    if (Number.isNaN(id)) {
      res
        .status(400)
        .json(formatResponse(400, "Invalid user id", null, "Invalid user id"));
      return;
    }
    if (currentId !== id) {
      res
        .status(403)
        .json(
          formatResponse(
            403,
            "You can only delete your own account",
            null,
            "Forbidden"
          )
        );
      return;
    }
    try {
      const deleted = await UserService.delete(id);
      res.json(formatResponse(200, "Account deleted", deleted, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res
        .status(500)
        .json(formatResponse(500, "Internal server error", null, msg));
    }
  }
}
