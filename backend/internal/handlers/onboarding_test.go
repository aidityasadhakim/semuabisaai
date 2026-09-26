package handlers

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"

	"semuabisaai/backend/internal/db"
	"semuabisaai/backend/internal/middleware"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) { return fn(request) }

func TestOnboardingAndQuestionLimit(t *testing.T) {
	database, err := db.NewConnection(context.Background(), filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := db.EnsureOnboardingSchema(context.Background(), database); err != nil {
		t.Fatal(err)
	}
	h := New(database, "test-key")
	requests := 0
	h.client = &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		requests++
		if request.Header.Get("Authorization") != "Bearer test-key" {
			t.Error("missing OpenRouter key")
		}
		if requests == 3 {
			return &http.Response{StatusCode: http.StatusServiceUnavailable, Body: io.NopCloser(strings.NewReader(`{}`)), Header: make(http.Header)}, nil
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{"choices":[{"message":{"content":"Jawaban uji."}}]}`)), Header: make(http.Header)}, nil
	})}
	e := echo.New()
	call := func(body string, userID string, handler echo.HandlerFunc) *httptest.ResponseRecorder {
		t.Helper()
		req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		if userID != "" {
			c.Set(middleware.UserIDKey, userID)
		}
		if err := handler(c); err != nil {
			e.HTTPErrorHandler(err, c)
		}
		return rec
	}
	result := call(`{"referral":"aidityasadhakim","profession":"guru","familiarity":"baru","goal":"belajar","city":"jakarta"}`, "", h.SaveOnboarding)
	if result.Code != http.StatusCreated {
		t.Fatalf("onboarding: %d %s", result.Code, result.Body.String())
	}
	if got := call(`{"profession":"invalid"}`, "", h.SaveOnboarding); got.Code != http.StatusBadRequest {
		t.Fatalf("invalid answer: %d", got.Code)
	}
	if got := call(`{}`, "", h.JoinWaitlist); got.Code != http.StatusUnauthorized {
		t.Fatalf("guest join: %d", got.Code)
	}
	if got := call(`{"question":"Apa itu Semua Bisa AI?"}`, "member", h.AskQuestion); got.Code != http.StatusForbidden {
		t.Fatalf("question before join: %d", got.Code)
	}
	if got := call(`{}`, "member", h.JoinWaitlist); got.Code != http.StatusOK {
		t.Fatalf("join: %d %s", got.Code, got.Body.String())
	}
	for i := 0; i < 5; i++ {
		got := call(`{"question":"Apa itu Semua Bisa AI?"}`, "member", h.AskQuestion)
		expected := http.StatusOK
		if i == 2 {
			expected = http.StatusBadGateway
		}
		if got.Code != expected {
			t.Fatalf("question %d: %d %s", i+1, got.Code, got.Body.String())
		}
	}
	if got := call(`{"question":"Pertanyaan keenam?"}`, "member", h.AskQuestion); got.Code != http.StatusTooManyRequests {
		t.Fatalf("sixth question: %d", got.Code)
	}
	if requests != 5 {
		t.Fatalf("OpenRouter calls = %d, want 5", requests)
	}
}
