import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TestEvidence-E0bvKaeb.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{r=`functional-16e3534ceac20c81`,i=`functional`,a=`UnknownPayer`,o=`b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f`,s=`pass`,c=`Unknown payer returns 422/unknown_firm; no writes.`,l=`https://github.com/newdarwindev/firm-payments/blob/b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f/tests/functional/payments_test.go#L97`,u=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tests/functional`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/3c37d0e2e00b6a17.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestFunctional$/^UnknownPayer$`],d=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/3c37d0e2e00b6a17.test`,`-tags=functional`,`.`],f=`c6554892940261411e043d0dae34dc634b40729d1666b15fe29e691ae703f56e`,p=`TestFunctional/UnknownPayer`,m=[`TestFunctional`,`TestFunctional/UnknownPayer`],h=`Service processes; includes startup, readiness and shutdown. Full-suite race checks run separately.`,g=[{path:`cmd/ledger-service/main.go`,sha256:`a17085386c95090ca909fd720696e8ddc5b413c719597caa17e1bd3878f7e813`,source:`package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/newdarwindev/firm-payments/internal/httpapi"
	"github.com/newdarwindev/firm-payments/internal/ledger"
	"github.com/newdarwindev/firm-payments/internal/server"
)

func main() {
	if err := run(); err != nil {
		slog.Error("ledger-service stopped", "error", err)
		os.Exit(1)
	}
}
func run() error {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return errors.New("DATABASE_URL is required")
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return fmt.Errorf("configure database: %w", err)
	}
	defer pool.Close()
	startup, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := pool.Ping(startup); err != nil {
		return fmt.Errorf("connect database: %w", err)
	}
	service := ledger.New(pool)
	addr := os.Getenv("LISTEN_ADDR")
	if addr == "" {
		addr = ":8081"
	}
	return server.Serve(ctx, addr, httpapi.Handler("ledger-service", "/internal/payments/bulk", service, service.Ready))
}
`,blocks:[{startLine:20,startColumn:2,endLine:20,endColumn:30,statements:1,count:2},{startLine:21,startColumn:3,endLine:23,endColumn:1,statements:2,count:0},{startLine:26,startColumn:2,endLine:27,endColumn:15,statements:2,count:2},{startLine:28,startColumn:3,endLine:29,endColumn:1,statements:1,count:0},{startLine:30,startColumn:2,endLine:33,endColumn:16,statements:4,count:2},{startLine:34,startColumn:3,endLine:35,endColumn:1,statements:1,count:0},{startLine:36,startColumn:2,endLine:39,endColumn:43,statements:4,count:2},{startLine:40,startColumn:3,endLine:41,endColumn:1,statements:1,count:0},{startLine:42,startColumn:2,endLine:44,endColumn:16,statements:3,count:2},{startLine:45,startColumn:3,endLine:46,endColumn:1,statements:1,count:0},{startLine:47,startColumn:2,endLine:47,endColumn:118,statements:1,count:2}]},{path:`cmd/payments-api/main.go`,sha256:`cd931d936121a5a35990c6b16c2b7d20a31eef94a23453937af18ed984de5f5b`,source:`package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/newdarwindev/firm-payments/internal/httpapi"
	"github.com/newdarwindev/firm-payments/internal/ledgerclient"
	"github.com/newdarwindev/firm-payments/internal/server"
)

func main() {
	if err := run(); err != nil {
		slog.Error("payments-api stopped", "error", err)
		os.Exit(1)
	}
}
func run() error {
	client, err := ledgerclient.New(os.Getenv("LEDGER_URL"))
	if err != nil {
		return fmt.Errorf("configure ledger: %w", err)
	}
	addr := os.Getenv("LISTEN_ADDR")
	if addr == "" {
		addr = ":8080"
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	return server.Serve(ctx, addr, httpapi.Handler("payments-api", "/payments/bulk", client, client.Ready))
}
`,blocks:[{startLine:17,startColumn:2,endLine:17,endColumn:30,statements:1,count:2},{startLine:18,startColumn:3,endLine:20,endColumn:1,statements:2,count:0},{startLine:23,startColumn:2,endLine:24,endColumn:16,statements:2,count:2},{startLine:25,startColumn:3,endLine:26,endColumn:1,statements:1,count:0},{startLine:27,startColumn:2,endLine:28,endColumn:16,statements:2,count:2},{startLine:29,startColumn:3,endLine:30,endColumn:1,statements:1,count:0},{startLine:31,startColumn:2,endLine:33,endColumn:105,statements:3,count:2}]},{path:`internal/contracts/errors.go`,sha256:`e9d6ec4d7e030ea919c9aa732d645f8280feec00251bf0b864d832d5524e5a9f`,source:`package contracts

import (
	"context"
	"errors"
)

var (
	ErrInvalidRequest    = errors.New("invalid payment request")
	ErrUnknownFirm       = errors.New("payer or recipient does not exist")
	ErrInsufficientFunds = errors.New("insufficient payer funds")
	ErrBalanceOverflow   = errors.New("recipient balance would exceed INTEGER cents")
	ErrUnavailable       = errors.New("ledger service unavailable")
	ErrInternal          = errors.New("internal payment failure")
)

type ErrorResponse struct {
	Error ErrorDetail \`json:"error"\`
}
type ErrorDetail struct {
	Code    string \`json:"code"\`
	Message string \`json:"message"\`
}

func ErrorForCode(code string) error {
	switch code {
	case "timeout":
		return context.DeadlineExceeded
	case "invalid_request":
		return ErrInvalidRequest
	case "unknown_firm":
		return ErrUnknownFirm
	case "insufficient_funds":
		return ErrInsufficientFunds
	case "balance_overflow":
		return ErrBalanceOverflow
	case "internal_error":
		return ErrInternal
	default:
		return ErrUnavailable
	}
}
`,blocks:[{startLine:26,startColumn:2,endLine:26,endColumn:14,statements:1,count:1},{startLine:28,startColumn:3,endLine:28,endColumn:34,statements:1,count:0},{startLine:30,startColumn:3,endLine:30,endColumn:27,statements:1,count:0},{startLine:32,startColumn:3,endLine:32,endColumn:24,statements:1,count:1},{startLine:34,startColumn:3,endLine:34,endColumn:30,statements:1,count:0},{startLine:36,startColumn:3,endLine:36,endColumn:28,statements:1,count:0},{startLine:38,startColumn:3,endLine:38,endColumn:21,statements:1,count:0},{startLine:40,startColumn:3,endLine:40,endColumn:24,statements:1,count:0}]},{path:`internal/contracts/validate.go`,sha256:`c8c6e922a0e4e8c3df4763e01dc3260bd413c1684364a87d32e820d140f87d94`,source:`package contracts

import (
	"fmt"
	"strings"

	"github.com/newdarwindev/firm-payments/internal/money"
)

const MaxPayments = 1000
const MaxBodyBytes int64 = 1 << 20

type PreparedPayment struct {
	PayeeUUID   string
	Cents       int64
	Description string
}
type Batch struct {
	PayerUUID string
	Payments  []PreparedPayment
	Total     int64
	Credits   map[string]int64
}

func canonicalUUID(s string) (string, bool) {
	if len(s) != 36 {
		return "", false
	}
	for i, c := range s {
		if i == 8 || i == 13 || i == 18 || i == 23 {
			if c != '-' {
				return "", false
			}
			continue
		}
		if (c < '0' || c > '9') && (c < 'a' || c > 'f') && (c < 'A' || c > 'F') {
			return "", false
		}
	}
	return strings.ToLower(s), true
}

func Prepare(req BulkRequest) (Batch, error) {
	payer, ok := canonicalUUID(req.PayerFirmUUID)
	if !ok {
		return Batch{}, fmt.Errorf("%w: payer_firm_uuid must be a UUID", ErrInvalidRequest)
	}
	if len(req.Payments) == 0 || len(req.Payments) > MaxPayments {
		return Batch{}, fmt.Errorf("%w: require 1 to %d payments", ErrInvalidRequest, MaxPayments)
	}
	batch := Batch{PayerUUID: payer, Credits: make(map[string]int64)}
	for _, payment := range req.Payments {
		payee, ok := canonicalUUID(payment.PayeeFirmUUID)
		if !ok || payee == payer {
			return Batch{}, fmt.Errorf("%w: recipients must be UUIDs different from the payer", ErrInvalidRequest)
		}
		cents, err := money.ParseCents(payment.Amount)
		if err != nil {
			return Batch{}, fmt.Errorf("%w: %w", ErrInvalidRequest, err)
		}
		if batch.Total > money.MaxCents-cents {
			return Batch{}, fmt.Errorf("%w: batch total exceeds INTEGER cents", ErrInvalidRequest)
		}
		batch.Total += cents
		batch.Credits[payee] += cents
		batch.Payments = append(batch.Payments, PreparedPayment{PayeeUUID: payee, Cents: cents, Description: payment.Description})
	}
	return batch, nil
}
`,blocks:[{startLine:26,startColumn:2,endLine:26,endColumn:18,statements:1,count:6},{startLine:27,startColumn:3,endLine:28,endColumn:1,statements:1,count:0},{startLine:29,startColumn:2,endLine:29,endColumn:22,statements:1,count:6},{startLine:30,startColumn:3,endLine:30,endColumn:46,statements:1,count:216},{startLine:31,startColumn:4,endLine:31,endColumn:16,statements:1,count:24},{startLine:32,startColumn:5,endLine:33,endColumn:1,statements:1,count:0},{startLine:34,startColumn:4,endLine:34,endColumn:12,statements:1,count:24},{startLine:36,startColumn:3,endLine:36,endColumn:75,statements:1,count:192},{startLine:37,startColumn:4,endLine:38,endColumn:1,statements:1,count:0},{startLine:40,startColumn:2,endLine:40,endColumn:33,statements:1,count:6},{startLine:44,startColumn:2,endLine:45,endColumn:9,statements:2,count:3},{startLine:46,startColumn:3,endLine:47,endColumn:1,statements:1,count:0},{startLine:48,startColumn:2,endLine:48,endColumn:63,statements:1,count:3},{startLine:49,startColumn:3,endLine:50,endColumn:1,statements:1,count:0},{startLine:51,startColumn:2,endLine:52,endColumn:39,statements:2,count:3},{startLine:53,startColumn:3,endLine:54,endColumn:28,statements:2,count:3},{startLine:55,startColumn:4,endLine:56,endColumn:1,statements:1,count:0},{startLine:57,startColumn:3,endLine:58,endColumn:17,statements:2,count:3},{startLine:59,startColumn:4,endLine:60,endColumn:1,statements:1,count:0},{startLine:61,startColumn:3,endLine:61,endColumn:41,statements:1,count:3},{startLine:62,startColumn:4,endLine:63,endColumn:1,statements:1,count:0},{startLine:64,startColumn:3,endLine:66,endColumn:125,statements:3,count:3},{startLine:68,startColumn:2,endLine:68,endColumn:19,statements:1,count:3}]},{path:`internal/httpapi/handler.go`,sha256:`88735bc861d5de82104c8490b718c51e031bf771dfeed4404af95002bb2b5313`,source:`// Package httpapi exposes the shared public and private payment transport.
package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"mime"
	"net/http"
	"time"

	"github.com/newdarwindev/firm-payments/internal/contracts"
)

type Processor interface {
	Execute(context.Context, contracts.BulkRequest) error
}

func Handler(service, route string, processor Processor, ready func(context.Context) error) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "alive", "service": service})
	})
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := ready(ctx); err != nil {
			writeFailure(w, http.StatusServiceUnavailable, "unavailable", "dependency not ready")
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
	})
	mux.HandleFunc("POST "+route, func(w http.ResponseWriter, r *http.Request) {
		if header := r.Header.Get("Content-Type"); header != "" {
			media, _, err := mime.ParseMediaType(header)
			if err != nil || media != "application/json" {
				writeFailure(w, 415, "unsupported_media_type", "use application/json")
				return
			}
		}
		r.Body = http.MaxBytesReader(w, r.Body, contracts.MaxBodyBytes)
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		var wire wireRequest
		if err := decoder.Decode(&wire); err != nil {
			decodeFailure(w, err)
			return
		}
		var extra any
		if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
			if err == nil {
				writeFailure(w, 400, "invalid_json", "exactly one JSON document is required")
			} else {
				decodeFailure(w, err)
			}
			return
		}
		req, valid := wire.request()
		if !valid {
			writeFailure(w, 422, "invalid_request", "all request and payment fields are required")
			return
		}
		if _, err := contracts.Prepare(req); err != nil {
			writeFailure(w, 422, "invalid_request", err.Error())
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 6*time.Second)
		defer cancel()
		if err := processor.Execute(ctx, req); err != nil {
			respondError(ctx, w, err)
			return
		}
		w.WriteHeader(http.StatusCreated)
	})
	return mux
}

func decodeFailure(w http.ResponseWriter, err error) {
	var tooLarge *http.MaxBytesError
	if errors.As(err, &tooLarge) {
		writeFailure(w, 413, "request_too_large", "request body exceeds 1 MiB")
	} else {
		writeFailure(w, 400, "invalid_json", "request must match the JSON payment structure")
	}
}

func respondError(ctx context.Context, w http.ResponseWriter, err error) {
	status, code, message := http.StatusInternalServerError, "internal_error", "payment could not be completed"
	switch {
	case errors.Is(err, context.DeadlineExceeded):
		status, code, message = 504, "timeout", "payment outcome may be uncertain; do not retry automatically"
	case errors.Is(err, context.Canceled):
		status, code, message = 503, "unavailable", "request was cancelled; payment outcome may be uncertain"
	case errors.Is(err, contracts.ErrInvalidRequest):
		status, code, message = 422, "invalid_request", contracts.ErrInvalidRequest.Error()
	case errors.Is(err, contracts.ErrUnknownFirm):
		status, code, message = 422, "unknown_firm", contracts.ErrUnknownFirm.Error()
	case errors.Is(err, contracts.ErrInsufficientFunds):
		status, code, message = 422, "insufficient_funds", contracts.ErrInsufficientFunds.Error()
	case errors.Is(err, contracts.ErrBalanceOverflow):
		status, code, message = 422, "balance_overflow", contracts.ErrBalanceOverflow.Error()
	case errors.Is(err, contracts.ErrUnavailable):
		status, code, message = 503, "unavailable", "ledger unavailable; a lost response can leave the payment outcome uncertain"
	default:
		slog.ErrorContext(ctx, "payment failed", "error", err)
	}
	writeFailure(w, status, code, message)
}
func writeFailure(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, contracts.ErrorResponse{Error: contracts.ErrorDetail{Code: code, Message: message}})
}
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		slog.Error("write response", "error", err)
	}
}

// Pointer fields distinguish an explicitly empty description from an absent field.
type wireRequest struct {
	Payer    *string        \`json:"payer_firm_uuid"\`
	Payments *[]wirePayment \`json:"payments"\`
}
type wirePayment struct {
	Amount      *string \`json:"amount"\`
	Payee       *string \`json:"payee_firm_uuid"\`
	Description *string \`json:"description"\`
}

func (w wireRequest) request() (contracts.BulkRequest, bool) {
	if w.Payer == nil || w.Payments == nil {
		return contracts.BulkRequest{}, false
	}
	req := contracts.BulkRequest{PayerFirmUUID: *w.Payer}
	for _, p := range *w.Payments {
		if p.Amount == nil || p.Payee == nil || p.Description == nil {
			return contracts.BulkRequest{}, false
		}
		req.Payments = append(req.Payments, contracts.Payment{Amount: *p.Amount, PayeeFirmUUID: *p.Payee, Description: *p.Description})
	}
	return req, true
}
`,blocks:[{startLine:22,startColumn:2,endLine:23,endColumn:78,statements:2,count:4},{startLine:24,startColumn:3,endLine:25,endColumn:1,statements:1,count:4},{startLine:26,startColumn:2,endLine:26,endColumn:77,statements:1,count:4},{startLine:27,startColumn:3,endLine:29,endColumn:36,statements:3,count:0},{startLine:30,startColumn:4,endLine:32,endColumn:1,statements:2,count:0},{startLine:33,startColumn:3,endLine:33,endColumn:68,statements:1,count:0},{startLine:35,startColumn:2,endLine:35,endColumn:77,statements:1,count:4},{startLine:36,startColumn:3,endLine:36,endColumn:59,statements:1,count:2},{startLine:37,startColumn:4,endLine:38,endColumn:49,statements:2,count:2},{startLine:39,startColumn:5,endLine:41,endColumn:1,statements:2,count:0},{startLine:43,startColumn:3,endLine:47,endColumn:47,statements:5,count:2},{startLine:48,startColumn:4,endLine:50,endColumn:1,statements:2,count:0},{startLine:51,startColumn:3,endLine:52,endColumn:61,statements:2,count:2},{startLine:53,startColumn:4,endLine:53,endColumn:18,statements:1,count:0},{startLine:54,startColumn:5,endLine:55,endColumn:1,statements:1,count:0},{startLine:56,startColumn:5,endLine:57,endColumn:1,statements:1,count:0},{startLine:58,startColumn:4,endLine:58,endColumn:10,statements:1,count:0},{startLine:60,startColumn:3,endLine:61,endColumn:13,statements:2,count:2},{startLine:62,startColumn:4,endLine:64,endColumn:1,statements:2,count:0},{startLine:65,startColumn:3,endLine:65,endColumn:51,statements:1,count:2},{startLine:66,startColumn:4,endLine:68,endColumn:1,statements:2,count:0},{startLine:69,startColumn:3,endLine:71,endColumn:53,statements:3,count:2},{startLine:72,startColumn:4,endLine:74,endColumn:1,statements:2,count:2},{startLine:75,startColumn:3,endLine:75,endColumn:36,statements:1,count:0},{startLine:77,startColumn:2,endLine:77,endColumn:12,statements:1,count:4},{startLine:81,startColumn:2,endLine:82,endColumn:31,statements:2,count:0},{startLine:83,startColumn:3,endLine:84,endColumn:1,statements:1,count:0},{startLine:85,startColumn:3,endLine:86,endColumn:1,statements:1,count:0},{startLine:90,startColumn:2,endLine:91,endColumn:9,statements:2,count:2},{startLine:93,startColumn:3,endLine:93,endColumn:105,statements:1,count:0},{startLine:95,startColumn:3,endLine:95,endColumn:104,statements:1,count:0},{startLine:97,startColumn:3,endLine:97,endColumn:86,statements:1,count:0},{startLine:99,startColumn:3,endLine:99,endColumn:80,statements:1,count:2},{startLine:101,startColumn:3,endLine:101,endColumn:92,statements:1,count:0},{startLine:103,startColumn:3,endLine:103,endColumn:88,statements:1,count:0},{startLine:105,startColumn:3,endLine:105,endColumn:124,statements:1,count:0},{startLine:107,startColumn:3,endLine:107,endColumn:57,statements:1,count:0},{startLine:109,startColumn:2,endLine:109,endColumn:40,statements:1,count:2},{startLine:112,startColumn:2,endLine:113,endColumn:1,statements:1,count:2},{startLine:115,startColumn:2,endLine:117,endColumn:53,statements:3,count:6},{startLine:118,startColumn:3,endLine:119,endColumn:1,statements:1,count:0},{startLine:134,startColumn:2,endLine:134,endColumn:41,statements:1,count:2},{startLine:135,startColumn:3,endLine:136,endColumn:1,statements:1,count:0},{startLine:137,startColumn:2,endLine:138,endColumn:32,statements:2,count:2},{startLine:139,startColumn:3,endLine:139,endColumn:64,statements:1,count:2},{startLine:140,startColumn:4,endLine:141,endColumn:1,statements:1,count:0},{startLine:142,startColumn:3,endLine:142,endColumn:130,statements:1,count:2},{startLine:144,startColumn:2,endLine:144,endColumn:18,statements:1,count:2}]},{path:`internal/ledger/service.go`,sha256:`e5838b664c68dcc99c9f7148428ec3ec2ad4c28a2f2a7724362bca606c6c16d8`,source:`// Package ledger owns the atomic PostgreSQL payment transaction.
package ledger

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/newdarwindev/firm-payments/internal/contracts"
	"github.com/newdarwindev/firm-payments/internal/money"
)

type Service struct{ pool *pgxpool.Pool }

func New(pool *pgxpool.Pool) *Service              { return &Service{pool: pool} }
func (s *Service) Ready(ctx context.Context) error { return s.pool.Ping(ctx) }

type firm struct {
	id      int32
	uuid    string
	balance int64
}

func (s *Service) Execute(ctx context.Context, req contracts.BulkRequest) error {
	batch, err := contracts.Prepare(req)
	if err != nil {
		return err
	}
	uuids := []string{batch.PayerUUID}
	for uuid := range batch.Credits {
		uuids = append(uuids, uuid)
	}
	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.ReadCommitted})
	if err != nil {
		return fmt.Errorf("begin payment: %w", err)
	}
	defer func() {
		cleanup, cancel := context.WithTimeout(context.WithoutCancel(ctx), 2*time.Second)
		defer cancel()
		if err := tx.Rollback(cleanup); err != nil && !errors.Is(err, pgx.ErrTxClosed) {
			slog.ErrorContext(cleanup, "payment rollback failed", "error", err)
		}
	}()
	// A single global row order protects overlapping batches across all instances.
	rows, err := tx.Query(ctx, \`SELECT id,uuid,balance_cents FROM firms WHERE uuid=ANY($1::text[]) ORDER BY id FOR UPDATE\`, uuids)
	if err != nil {
		return fmt.Errorf("lock firms: %w", err)
	}
	var locked []firm
	byUUID := make(map[string]firm, len(uuids))
	for rows.Next() {
		var f firm
		if err := rows.Scan(&f.id, &f.uuid, &f.balance); err != nil {
			rows.Close()
			return fmt.Errorf("read locked firm: %w", err)
		}
		locked = append(locked, f)
		byUUID[f.uuid] = f
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return fmt.Errorf("read firms: %w", err)
	}
	if len(byUUID) != len(uuids) {
		return contracts.ErrUnknownFirm
	}
	payer := byUUID[batch.PayerUUID]
	if payer.balance < batch.Total {
		return contracts.ErrInsufficientFunds
	}
	for _, f := range locked {
		balance := f.balance
		if f.uuid == batch.PayerUUID {
			balance -= batch.Total
		} else {
			credit := batch.Credits[f.uuid]
			if balance > money.MaxCents-credit {
				return contracts.ErrBalanceOverflow
			}
			balance += credit
		}
		result, err := tx.Exec(ctx, \`UPDATE firms SET balance_cents=$1 WHERE id=$2\`, balance, f.id)
		if err != nil {
			return fmt.Errorf("update balance: %w", err)
		}
		if result.RowsAffected() != 1 {
			return fmt.Errorf("%w: locked firm disappeared", contracts.ErrInternal)
		}
	}
	for _, p := range batch.Payments {
		if _, err := tx.Exec(ctx, \`INSERT INTO payments(payer_firm_id,payee_firm_id,amount_cents,description) VALUES($1,$2,$3,$4)\`, payer.id, byUUID[p.PayeeUUID].id, p.Cents, p.Description); err != nil {
			return fmt.Errorf("insert payment: %w", err)
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit payment (outcome may be uncertain): %w", err)
	}
	return nil
}
`,blocks:[{startLine:19,startColumn:54,endLine:19,endColumn:83,statements:1,count:2},{startLine:20,startColumn:54,endLine:20,endColumn:79,statements:1,count:0},{startLine:29,startColumn:2,endLine:30,endColumn:16,statements:2,count:1},{startLine:31,startColumn:3,endLine:32,endColumn:1,statements:1,count:0},{startLine:33,startColumn:2,endLine:34,endColumn:34,statements:2,count:1},{startLine:35,startColumn:3,endLine:36,endColumn:1,statements:1,count:1},{startLine:37,startColumn:2,endLine:38,endColumn:16,statements:2,count:1},{startLine:39,startColumn:3,endLine:40,endColumn:1,statements:1,count:0},{startLine:41,startColumn:2,endLine:41,endColumn:15,statements:1,count:1},{startLine:42,startColumn:3,endLine:44,endColumn:82,statements:3,count:1},{startLine:45,startColumn:4,endLine:46,endColumn:1,statements:1,count:0},{startLine:49,startColumn:2,endLine:50,endColumn:16,statements:2,count:1},{startLine:51,startColumn:3,endLine:52,endColumn:1,statements:1,count:0},{startLine:53,startColumn:2,endLine:55,endColumn:18,statements:3,count:1},{startLine:56,startColumn:3,endLine:57,endColumn:63,statements:2,count:1},{startLine:58,startColumn:4,endLine:60,endColumn:1,statements:2,count:0},{startLine:61,startColumn:3,endLine:62,endColumn:21,statements:2,count:1},{startLine:64,startColumn:2,endLine:65,endColumn:35,statements:2,count:1},{startLine:66,startColumn:3,endLine:67,endColumn:1,statements:1,count:0},{startLine:68,startColumn:2,endLine:68,endColumn:31,statements:1,count:1},{startLine:69,startColumn:3,endLine:70,endColumn:1,statements:1,count:1},{startLine:71,startColumn:2,endLine:72,endColumn:33,statements:2,count:0},{startLine:73,startColumn:3,endLine:74,endColumn:1,statements:1,count:0},{startLine:75,startColumn:2,endLine:75,endColumn:27,statements:1,count:0},{startLine:76,startColumn:3,endLine:77,endColumn:32,statements:2,count:0},{startLine:78,startColumn:4,endLine:79,endColumn:1,statements:1,count:0},{startLine:80,startColumn:4,endLine:81,endColumn:39,statements:2,count:0},{startLine:82,startColumn:5,endLine:83,endColumn:1,statements:1,count:0},{startLine:84,startColumn:4,endLine:84,endColumn:21,statements:1,count:0},{startLine:86,startColumn:3,endLine:87,endColumn:17,statements:2,count:0},{startLine:88,startColumn:4,endLine:89,endColumn:1,statements:1,count:0},{startLine:90,startColumn:3,endLine:90,endColumn:33,statements:1,count:0},{startLine:91,startColumn:4,endLine:92,endColumn:1,statements:1,count:0},{startLine:94,startColumn:2,endLine:94,endColumn:35,statements:1,count:0},{startLine:95,startColumn:3,endLine:95,endColumn:197,statements:1,count:0},{startLine:96,startColumn:4,endLine:97,endColumn:1,statements:1,count:0},{startLine:99,startColumn:2,endLine:99,endColumn:39,statements:1,count:0},{startLine:100,startColumn:3,endLine:101,endColumn:1,statements:1,count:0},{startLine:102,startColumn:2,endLine:102,endColumn:12,statements:1,count:0}]},{path:`internal/ledgerclient/client.go`,sha256:`67333f1ee3d09e69876270ff4fb5fae0ccd3c21a8a2d9e44adc8353c0dd590e9`,source:`// Package ledgerclient provides a bounded, non-retrying private HTTP client.
package ledgerclient

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/newdarwindev/firm-payments/internal/contracts"
)

type Client struct {
	base string
	http *http.Client
}

func New(base string) (*Client, error) {
	u, err := url.Parse(base)
	if err != nil || u.Host == "" || (u.Scheme != "http" && u.Scheme != "https") || u.RawQuery != "" || u.Fragment != "" || u.User != nil || (u.Path != "" && u.Path != "/") {
		return nil, fmt.Errorf("invalid LEDGER_URL")
	}
	return &Client{base: strings.TrimSuffix(base, "/"), http: &http.Client{Timeout: 8 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}}, nil
}

func (c *Client) Ready(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.base+"/readyz", nil)
	if err != nil {
		return err
	}
	res, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("%w: %w", contracts.ErrUnavailable, err)
	}
	defer func() { _ = res.Body.Close() }()
	if res.StatusCode != http.StatusOK {
		return contracts.ErrUnavailable
	}
	return nil
}

func (c *Client) Execute(ctx context.Context, payment contracts.BulkRequest) error {
	body, err := json.Marshal(payment)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.base+"/internal/payments/bulk", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	res, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("%w: %w", contracts.ErrUnavailable, err)
	}
	defer func() { _ = res.Body.Close() }()
	if res.StatusCode == http.StatusCreated {
		return nil
	}
	// A valid error body cannot override the transport outcome (for example,
	// a proxy returning a 500 with a stale insufficient-funds body).
	if res.StatusCode != 422 && res.StatusCode != 500 && res.StatusCode != 503 && res.StatusCode != 504 {
		return fmt.Errorf("%w: unexpected ledger status %d", contracts.ErrUnavailable, res.StatusCode)
	}
	var failure contracts.ErrorResponse
	if err := json.NewDecoder(io.LimitReader(res.Body, 64<<10)).Decode(&failure); err != nil {
		return fmt.Errorf("%w: invalid ledger response", contracts.ErrUnavailable)
	}
	err = contracts.ErrorForCode(failure.Error.Code)
	switch res.StatusCode {
	case 422:
		if !errors.Is(err, contracts.ErrInvalidRequest) && !errors.Is(err, contracts.ErrUnknownFirm) && !errors.Is(err, contracts.ErrInsufficientFunds) && !errors.Is(err, contracts.ErrBalanceOverflow) {
			return contracts.ErrUnavailable
		}
	case 500:
		if !errors.Is(err, contracts.ErrInternal) {
			return contracts.ErrUnavailable
		}
	case 503:
		if !errors.Is(err, contracts.ErrUnavailable) {
			return contracts.ErrUnavailable
		}
	case 504:
		if !errors.Is(err, context.DeadlineExceeded) {
			return contracts.ErrUnavailable
		}
	}
	return err
}
`,blocks:[{startLine:25,startColumn:2,endLine:26,endColumn:171,statements:2,count:2},{startLine:27,startColumn:3,endLine:28,endColumn:1,statements:1,count:0},{startLine:29,startColumn:2,endLine:29,endColumn:157,statements:1,count:2},{startLine:29,startColumn:159,endLine:29,endColumn:191,statements:1,count:0},{startLine:33,startColumn:2,endLine:34,endColumn:16,statements:2,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:1,statements:1,count:0},{startLine:37,startColumn:2,endLine:38,endColumn:16,statements:2,count:0},{startLine:39,startColumn:3,endLine:40,endColumn:1,statements:1,count:0},{startLine:41,startColumn:2,endLine:41,endColumn:15,statements:1,count:0},{startLine:41,startColumn:17,endLine:41,endColumn:39,statements:1,count:0},{startLine:42,startColumn:2,endLine:42,endColumn:37,statements:1,count:0},{startLine:43,startColumn:3,endLine:44,endColumn:1,statements:1,count:0},{startLine:45,startColumn:2,endLine:45,endColumn:12,statements:1,count:0},{startLine:49,startColumn:2,endLine:50,endColumn:16,statements:2,count:1},{startLine:51,startColumn:3,endLine:52,endColumn:1,statements:1,count:0},{startLine:53,startColumn:2,endLine:54,endColumn:16,statements:2,count:1},{startLine:55,startColumn:3,endLine:56,endColumn:1,statements:1,count:0},{startLine:57,startColumn:2,endLine:59,endColumn:16,statements:3,count:1},{startLine:60,startColumn:3,endLine:61,endColumn:1,statements:1,count:0},{startLine:62,startColumn:2,endLine:62,endColumn:15,statements:1,count:1},{startLine:62,startColumn:17,endLine:62,endColumn:39,statements:1,count:1},{startLine:63,startColumn:2,endLine:63,endColumn:42,statements:1,count:1},{startLine:64,startColumn:3,endLine:65,endColumn:1,statements:1,count:0},{startLine:68,startColumn:2,endLine:68,endColumn:102,statements:1,count:1},{startLine:69,startColumn:3,endLine:70,endColumn:1,statements:1,count:0},{startLine:71,startColumn:2,endLine:72,endColumn:91,statements:2,count:1},{startLine:73,startColumn:3,endLine:74,endColumn:1,statements:1,count:0},{startLine:75,startColumn:2,endLine:76,endColumn:24,statements:2,count:1},{startLine:78,startColumn:3,endLine:78,endColumn:196,statements:1,count:1},{startLine:79,startColumn:4,endLine:80,endColumn:1,statements:1,count:0},{startLine:82,startColumn:3,endLine:82,endColumn:45,statements:1,count:0},{startLine:83,startColumn:4,endLine:84,endColumn:1,statements:1,count:0},{startLine:86,startColumn:3,endLine:86,endColumn:48,statements:1,count:0},{startLine:87,startColumn:4,endLine:88,endColumn:1,statements:1,count:0},{startLine:90,startColumn:3,endLine:90,endColumn:48,statements:1,count:0},{startLine:91,startColumn:4,endLine:92,endColumn:1,statements:1,count:0},{startLine:94,startColumn:2,endLine:94,endColumn:12,statements:1,count:1}]},{path:`internal/money/money.go`,sha256:`c8065c265e4388d96f163dc33f82f6232a2cdad303607a1ce674f9966c7612bc`,source:`// Package money parses USD amounts without floating-point arithmetic.
package money

import (
	"errors"
	"math"
	"strings"
)

const MaxCents int64 = math.MaxInt32

var ErrInvalidAmount = errors.New("amount must be positive US dollars with at most two decimal places and fit INTEGER cents")

func ParseCents(amount string) (int64, error) {
	whole, fraction, decimal := strings.Cut(amount, ".")
	if whole == "" || (decimal && (len(fraction) < 1 || len(fraction) > 2)) {
		return 0, ErrInvalidAmount
	}
	var dollars int64
	for _, digit := range whole {
		if digit < '0' || digit > '9' {
			return 0, ErrInvalidAmount
		}
		value := int64(digit - '0')
		if dollars > (MaxCents-value)/10 {
			return 0, ErrInvalidAmount
		}
		dollars = dollars*10 + value
	}
	cents := dollars * 100
	for i, digit := range fraction {
		if digit < '0' || digit > '9' {
			return 0, ErrInvalidAmount
		}
		value := int64(digit - '0')
		if i == 0 {
			value *= 10
		}
		cents += value
	}
	if cents <= 0 || cents > MaxCents {
		return 0, ErrInvalidAmount
	}
	return cents, nil
}
`,blocks:[{startLine:15,startColumn:2,endLine:16,endColumn:74,statements:2,count:3},{startLine:17,startColumn:3,endLine:18,endColumn:1,statements:1,count:0},{startLine:19,startColumn:2,endLine:20,endColumn:30,statements:2,count:3},{startLine:21,startColumn:3,endLine:21,endColumn:33,statements:1,count:3},{startLine:22,startColumn:4,endLine:23,endColumn:1,statements:1,count:0},{startLine:24,startColumn:3,endLine:25,endColumn:36,statements:2,count:3},{startLine:26,startColumn:4,endLine:27,endColumn:1,statements:1,count:0},{startLine:28,startColumn:3,endLine:28,endColumn:31,statements:1,count:3},{startLine:30,startColumn:2,endLine:31,endColumn:33,statements:2,count:3},{startLine:32,startColumn:3,endLine:32,endColumn:33,statements:1,count:0},{startLine:33,startColumn:4,endLine:34,endColumn:1,statements:1,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:13,statements:2,count:0},{startLine:37,startColumn:4,endLine:38,endColumn:1,statements:1,count:0},{startLine:39,startColumn:3,endLine:39,endColumn:17,statements:1,count:0},{startLine:41,startColumn:2,endLine:41,endColumn:36,statements:1,count:3},{startLine:42,startColumn:3,endLine:43,endColumn:1,statements:1,count:0},{startLine:44,startColumn:2,endLine:44,endColumn:19,statements:1,count:3}]},{path:`internal/server/server.go`,sha256:`3a34cc88e2ae6fdb823cdbaf85cd321ce88493374844e7b8ed4bc795df52344e`,source:`// Package server owns bounded HTTP startup and graceful shutdown.
package server

import (
	"context"
	"errors"
	"net/http"
	"time"
)

func Serve(ctx context.Context, addr string, handler http.Handler) error {
	srv := &http.Server{Addr: addr, Handler: handler, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 10 * time.Second, WriteTimeout: 10 * time.Second, IdleTimeout: 60 * time.Second}
	done := make(chan error, 1)
	go func() { done <- srv.ListenAndServe() }()
	select {
	case err := <-done:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	case <-ctx.Done():
		cleanup, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		return srv.Shutdown(cleanup)
	}
}
`,blocks:[{startLine:12,startColumn:2,endLine:14,endColumn:12,statements:3,count:4},{startLine:14,startColumn:14,endLine:14,endColumn:44,statements:1,count:4},{startLine:15,startColumn:2,endLine:15,endColumn:9,statements:1,count:4},{startLine:17,startColumn:3,endLine:17,endColumn:43,statements:1,count:0},{startLine:18,startColumn:4,endLine:19,endColumn:1,statements:1,count:0},{startLine:20,startColumn:3,endLine:20,endColumn:13,statements:1,count:0},{startLine:22,startColumn:3,endLine:24,endColumn:31,statements:3,count:4}]}],_=`4d572a91e3f2327e9f55fabe1910473743d27437c9257ce25a175562e2258321`,v=`75ac16cdb079baad58b274300e3bc696ea10231ff3361ffdf3bd553fbd0a2c92`,y={id:r,suite:i,name:a,sha:o,status:s,asserts:c,sourceURL:l,package:``,command:u,build:d,binarySHA256:f,selected:p,executed:m,group:!1,scope:h,total:275,covered:149,files:g,profileSHA256:_,gifSHA256:v}})))()}var x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{t(),b(),{expect:x,userEvent:S,within:C,waitFor:w}=__STORYBOOK_MODULE_TEST__,T=y,E={id:`case-functional-16e3534ceac20c81`,title:`Cases/functional/UnknownPayer`,component:n,args:{evidence:T,mediaBase:`../cases/functional-16e3534ceac20c81/`}},D={play:async({canvasElement:e})=>{let t=C(e);if(await x(t.getByRole(`heading`,{name:T.name})).toBeVisible(),await x(t.getByRole(`status`)).toHaveTextContent(`PASS`),await x(t.getByRole(`status`)).toHaveTextContent(T.total?T.covered+` / `+T.total+` Go statements covered`:`No instrumented Go statements`),T.files.length){let e=T.files[T.files.length-1];await S.selectOptions(t.getByRole(`combobox`,{name:`Source file`}),e.path),await x(t.getByLabelText(`Source code: `+e.path)).toBeVisible(),await x(t.getByText(`Source SHA256: `+e.sha256)).toBeVisible(),await x(t.getByRole(`link`,{name:`Line 1`})).toHaveAttribute(`href`,`#L1`)}t.getByRole(`button`,{name:`Play terminal recording`}).focus(),await S.keyboard(`{Enter}`);let n=t.getByAltText(`Terminal execution of `+T.name);await w(()=>x(n.complete&&n.naturalWidth>0).toBe(!0)),await S.click(t.getByRole(`button`,{name:`Pause terminal recording`}))}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', {
      name: evidence.name
    })).toBeVisible();
    await expect(canvas.getByRole('status')).toHaveTextContent('PASS');
    await expect(canvas.getByRole('status')).toHaveTextContent(evidence.total ? evidence.covered + ' / ' + evidence.total + ' Go statements covered' : 'No instrumented Go statements');
    if (evidence.files.length) {
      const choice = evidence.files[evidence.files.length - 1]!;
      await userEvent.selectOptions(canvas.getByRole('combobox', {
        name: 'Source file'
      }), choice.path);
      await expect(canvas.getByLabelText('Source code: ' + choice.path)).toBeVisible();
      await expect(canvas.getByText('Source SHA256: ' + choice.sha256)).toBeVisible();
      await expect(canvas.getByRole('link', {
        name: 'Line 1'
      })).toHaveAttribute('href', '#L1');
    }
    canvas.getByRole('button', {
      name: 'Play terminal recording'
    }).focus();
    await userEvent.keyboard('{Enter}');
    const image = canvas.getByAltText('Terminal execution of ' + evidence.name) as HTMLImageElement;
    await waitFor(() => expect(image.complete && image.naturalWidth > 0).toBe(true));
    await userEvent.click(canvas.getByRole('button', {
      name: 'Pause terminal recording'
    }));
  }
}`,...D.parameters?.docs?.source}}},O=[`Recorded`]})))()}k();export{D as Recorded,O as __namedExportsOrder,E as default};