package handlers

import (
	"bytes"
	"context"
	"encoding/json"
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
	result := call(`{"referral":"aidityasadhakim","name":"Alya","status":"bekerja","place":"Sekolah Negeri","profession":"guru","familiarity":"baru","goal":"belajar","city":"Jakarta"}`, "", h.SaveOnboarding)
	if result.Code != http.StatusCreated {
		t.Fatalf("onboarding: %d %s", result.Code, result.Body.String())
	}
	var storedName, storedStatus, storedPlace string
	if err := database.QueryRow(`SELECT name, status, place FROM onboarding_profiles LIMIT 1`).Scan(&storedName, &storedStatus, &storedPlace); err != nil {
		t.Fatal(err)
	}
	if storedName != "Alya" || storedStatus != "bekerja" || storedPlace != "Sekolah Negeri" {
		t.Fatalf("stored profile: %q, %q, %q", storedName, storedStatus, storedPlace)
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

func TestOnboardingIntroValidationAndLimit(t *testing.T) {
	database, err := db.NewConnection(context.Background(), filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := db.EnsureOnboardingSchema(context.Background(), database); err != nil {
		t.Fatal(err)
	}
	h := New(database, "test-key")
	modelCalls := 0
	h.client = &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		modelCalls++
		payload, _ := io.ReadAll(request.Body)
		if !strings.Contains(string(payload), `"max_tokens":100`) || !strings.Contains(string(payload), "deepseek/deepseek-v4.1-flash:nitro") {
			t.Errorf("unexpected intro model payload: %s", payload)
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{"choices":[{"message":{"content":"Alya, kegiatanmu di ITB bisa jadi titik awal mencoba AI dengan bijak."}}]}`)), Header: make(http.Header)}, nil
	})}
	e := echo.New()
	call := func(body string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/api/onboarding/intro", bytes.NewBufferString(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		if err := h.OnboardingIntro(c); err != nil {
			e.HTTPErrorHandler(err, c)
		}
		return rec
	}
	if got := call(`{"name":"A","status":"bekerja","place":"Kantor","city":"Bandung"}`); got.Code != http.StatusBadRequest {
		t.Fatalf("invalid profile: %d", got.Code)
	}
	body := `{"name":"Alya","status":"mahasiswa","place":"ITB","city":"Bandung"}`
	for i := 0; i < 10; i++ {
		got := call(body)
		if got.Code != http.StatusOK || !strings.Contains(got.Body.String(), "Alya") {
			t.Fatalf("intro %d: %d %s", i+1, got.Code, got.Body.String())
		}
		if i == 0 {
			if !strings.Contains(got.Body.String(), "ITB bisa jadi titik awal") {
				t.Fatalf("model reply was not returned: %s", got.Body.String())
			}
			h.openRouterKey = ""
		}
	}
	if modelCalls != 1 {
		t.Fatalf("intro model calls = %d, want 1", modelCalls)
	}
	if got := call(body); got.Code != http.StatusTooManyRequests {
		t.Fatalf("eleventh intro: %d %s", got.Code, got.Body.String())
	}
}

func TestOnboardingTurnPersonalizesQuestionWithinTopic(t *testing.T) {
	database, err := db.NewConnection(context.Background(), filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := db.EnsureOnboardingSchema(context.Background(), database); err != nil {
		t.Fatal(err)
	}
	h := New(database, "test-key")
	modelCalls := 0
	h.client = &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		modelCalls++
		payload, _ := io.ReadAll(request.Body)
		if !strings.Contains(string(payload), `"max_tokens":180`) || !strings.Contains(string(payload), "deepseek/deepseek-v4.1-flash:nitro") || !strings.Contains(string(payload), "ITB") {
			t.Errorf("unexpected turn request: %s", payload)
		}
		content := `{"reply":"Alya, kegiatanmu di ITB terdengar menarik untuk dicoba bersama AI.","question":"Alya, kamu tinggal di kota mana sekarang?"}`
		if modelCalls == 2 {
			content = `{"reply":"Bandung memberi konteks yang pas untuk ceritamu.","question":"Apa warna favoritmu?"}`
		}
		if modelCalls == 3 {
			content = `{"reply":"Belajar hal baru bisa jadi langkah awalmu, Alya.","question":"Apa lagi yang ingin kamu ketahui?"}`
		}
		encoded, _ := json.Marshal(map[string]any{"choices": []any{map[string]any{"message": map[string]string{"content": content}}}})
		return &http.Response{StatusCode: 200, Body: io.NopCloser(bytes.NewReader(encoded)), Header: make(http.Header)}, nil
	})}
	e := echo.New()
	call := func(body string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/api/onboarding/turn", bytes.NewBufferString(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		if err := h.OnboardingTurn(c); err != nil {
			e.HTTPErrorHandler(err, c)
		}
		return rec
	}
	if got := call(`{"lastStep":"profile","lastAnswer":"Alya","name":"A","status":"mahasiswa","place":"ITB"}`); got.Code != http.StatusBadRequest {
		t.Fatalf("invalid turn: %d", got.Code)
	}
	first := call(`{"lastStep":"profile","lastAnswer":"Alya · Mahasiswa · ITB","name":"Alya","status":"mahasiswa","place":"ITB"}`)
	if first.Code != http.StatusOK || !strings.Contains(first.Body.String(), "Alya, kamu tinggal di kota mana") {
		t.Fatalf("personalized question: %d %s", first.Code, first.Body.String())
	}
	second := call(`{"lastStep":"city","lastAnswer":"Bandung","name":"Alya","status":"mahasiswa","place":"ITB","city":"Bandung"}`)
	if second.Code != http.StatusOK || !strings.Contains(second.Body.String(), "bagian kuliah apa yang paling sering") || strings.Contains(second.Body.String(), "warna favoritmu") {
		t.Fatalf("off-topic question was not replaced: %d %s", second.Code, second.Body.String())
	}
	final := call(`{"lastStep":"goal","lastAnswer":"Belajar hal baru","name":"Alya","status":"mahasiswa","place":"ITB","city":"Bandung","activity":"Belajar","familiarity":"Belum pernah","goal":"Belajar hal baru"}`)
	if final.Code != http.StatusOK || !strings.Contains(final.Body.String(), `"question":""`) {
		t.Fatalf("final turn should not ask another question: %d %s", final.Code, final.Body.String())
	}
	h.openRouterKey = ""
	for i := 3; i < 30; i++ {
		got := call(`{"lastStep":"profile","lastAnswer":"Alya · Mahasiswa · ITB","name":"Alya","status":"mahasiswa","place":"ITB"}`)
		if got.Code != http.StatusOK {
			t.Fatalf("turn %d: %d %s", i+1, got.Code, got.Body.String())
		}
	}
	if got := call(`{"lastStep":"profile","lastAnswer":"Alya · Mahasiswa · ITB","name":"Alya","status":"mahasiswa","place":"ITB"}`); got.Code != http.StatusTooManyRequests {
		t.Fatalf("31st turn: %d %s", got.Code, got.Body.String())
	}
	if modelCalls != 3 {
		t.Fatalf("model calls = %d, want 3", modelCalls)
	}
}
