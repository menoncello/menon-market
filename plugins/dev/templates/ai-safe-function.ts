/**
 * 🤖 AI-Safe Function Template
 *
 * This template enforces best practices for AI-generated code:
 * - Maximum 15 lines total
 * - Complexity < 5
 * - Early validation in first 5 lines
 * - No 'any' types
 * - Proper error handling
 * - Single responsibility
 *
 * ESLint rules enforced:
 * - @typescript-eslint/no-explicit-any: error
 * - complexity: ["error", 5]
 * - max-lines-per-function: ["error", { "max": 30, "skipBlankLines": true, "skipComments": true }]
 * - max-params: ["error", 4]
 */

export async function processUserData(
  userId: string, // Required: User identifier
  action: "create" | "update" | "delete", // Required: Action to perform
  data?: unknown // Optional: User data for create/update
): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
  code?: string;
}> {
  // 🚨 Early validation (lines 1-5) - REQUIRED
  if (!userId || userId.trim().length === 0) {
    return {
      success: false,
      error: "User ID is required and cannot be empty",
      code: "INVALID_USER_ID",
    };
  }

  if (!["create", "update", "delete"].includes(action)) {
    return {
      success: false,
      error: "Invalid action. Must be create, update, or delete",
      code: "INVALID_ACTION",
    };
  }

  if (["create", "update"].includes(action) && !data) {
    return {
      success: false,
      error: "Data is required for create and update actions",
      code: "MISSING_DATA",
    };
  }

  // 🚨 Main logic (keep simple, max 10 more lines)
  try {
    switch (action) {
      case "create":
        return await createUser(userId, data as Record<string, unknown>);
      case "update":
        return await updateUser(userId, data as Record<string, unknown>);
      case "delete":
        return await deleteUser(userId);
      default:
        // This should never happen due to validation above
        return {
          success: false,
          error: "Unsupported action",
          code: "UNSUPPORTED_ACTION",
        };
    }
  } catch (error) {
    // 🚨 Proper error handling with specific error codes
    const errorCode = error instanceof Error ? getErrorCode(error) : "UNKNOWN_ERROR";
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      code: errorCode,
    };
  }
}

// 🚨 Helper functions - keep them small and focused
async function createUser(
  userId: string,
  userData: Record<string, unknown>
): Promise<{ success: boolean; data: unknown }> {
  // Implementation goes here - keep it simple
  const newUser = { id: userId, ...userData, createdAt: new Date().toISOString() };
  return { success: true, data: newUser };
}

async function updateUser(
  userId: string,
  userData: Record<string, unknown>
): Promise<{ success: boolean; data: unknown }> {
  // Implementation goes here - keep it simple
  const updatedUser = { id: userId, ...userData, updatedAt: new Date().toISOString() };
  return { success: true, data: updatedUser };
}

async function deleteUser(userId: string): Promise<{ success: boolean }> {
  // Implementation goes here - keep it simple
  console.log(`User ${userId} deleted`);
  return { success: true };
}

// 🚨 Error code mapper - small, focused function
function getErrorCode(error: Error): string {
  if (error.message.includes("not found")) return "USER_NOT_FOUND";
  if (error.message.includes("duplicate")) return "DUPLICATE_USER";
  if (error.message.includes("permission")) return "PERMISSION_DENIED";
  return "UNKNOWN_ERROR";
}
