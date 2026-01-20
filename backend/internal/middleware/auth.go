package middleware

import (
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/labstack/echo/v4"
)

const (
	// UserIDKey is the context key for the authenticated user ID
	UserIDKey = "user_id"
)

// ClerkAuth returns a middleware that validates Clerk JWT tokens
// If clerkSecretKey is empty, authentication is bypassed
func ClerkAuth(clerkSecretKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Skip authentication if Clerk is not configured
			if clerkSecretKey == "" {
				return next(c)
			}

			// Get token from Authorization header
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing authorization header")
			}

			// Extract Bearer token
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid authorization header format")
			}
			token := parts[1]

			// Verify JWT with Clerk
			claims, err := jwt.Verify(c.Request().Context(), &jwt.VerifyParams{
				Token: token,
			})
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
			}

			// Store user ID in context
			c.Set(UserIDKey, claims.Subject)

			return next(c)
		}
	}
}

// GetUserID returns the authenticated user ID from the context
// Returns empty string if not authenticated
func GetUserID(c echo.Context) string {
	if userID, ok := c.Get(UserIDKey).(string); ok {
		return userID
	}
	return ""
}

// RequireUserID returns the authenticated user ID or an error if not authenticated
func RequireUserID(c echo.Context) (string, error) {
	userID := GetUserID(c)
	if userID == "" {
		return "", echo.NewHTTPError(http.StatusUnauthorized, "authentication required")
	}
	return userID, nil
}

// ============================================================================
// Alternative Auth Implementations
// ============================================================================
//
// To use a different authentication provider, replace the ClerkAuth middleware
// with your own implementation. The middleware should:
// 1. Extract the token from the Authorization header
// 2. Validate the token with your auth provider
// 3. Store the user ID in the context using c.Set(UserIDKey, userID)
//
// Example for custom JWT validation:
//
// func CustomJWTAuth(secretKey string) echo.MiddlewareFunc {
//     return func(next echo.HandlerFunc) echo.HandlerFunc {
//         return func(c echo.Context) error {
//             // Extract and validate token
//             // ...
//             c.Set(UserIDKey, userID)
//             return next(c)
//         }
//     }
// }
