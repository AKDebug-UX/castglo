import { describe, it, expect, vi } from "vitest";
import { authAPI, api, API_ENDPOINTS } from "./api";

describe("authAPI", () => {
  describe("forgotPassword", () => {
    it("sends an object payload { email } when email string is provided", async () => {
      const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
        data: { success: true, message: "Reset link sent" },
      } as any);

      await authAPI.forgotPassword("test@mailinator.com");

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email: "test@mailinator.com" }
      );

      postSpy.mockRestore();
    });

    it("sends an object payload { email } when an object is provided", async () => {
      const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
        data: { success: true, message: "Reset link sent" },
      } as any);

      await authAPI.forgotPassword({ email: "user@example.com" });

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email: "user@example.com" }
      );

      postSpy.mockRestore();
    });
  });
});
