import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-ef1513aea19aa46b`,p=`unit`,m=`TestFailureMappingAndReadiness`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/internal/httpapi/handler_test.go#L57`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/httpapi`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/1e51f7ae8228a333.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestFailureMappingAndReadiness$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-ef1513aea19aa46b/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/1e51f7ae8228a333.test`,`-cover`,`-covermode=atomic`,`.`],b=`96d98823f10266c1a87af470da8ccc55ee566b992786d2989931be874f636bff`,x=`TestFailureMappingAndReadiness`,S=[`TestFailureMappingAndReadiness`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[{path:`internal/httpapi/handler.go`,sha256:`88735bc861d5de82104c8490b718c51e031bf771dfeed4404af95002bb2b5313`,source:`// Package httpapi exposes the shared public and private payment transport.
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
`,blocks:[{startLine:22,startColumn:2,endLine:23,endColumn:78,statements:2,count:7},{startLine:24,startColumn:3,endLine:25,endColumn:1,statements:1,count:7},{startLine:26,startColumn:2,endLine:26,endColumn:77,statements:1,count:7},{startLine:27,startColumn:3,endLine:29,endColumn:36,statements:3,count:7},{startLine:30,startColumn:4,endLine:32,endColumn:1,statements:2,count:7},{startLine:33,startColumn:3,endLine:33,endColumn:68,statements:1,count:0},{startLine:35,startColumn:2,endLine:35,endColumn:77,statements:1,count:7},{startLine:36,startColumn:3,endLine:36,endColumn:59,statements:1,count:7},{startLine:37,startColumn:4,endLine:38,endColumn:49,statements:2,count:0},{startLine:39,startColumn:5,endLine:41,endColumn:1,statements:2,count:0},{startLine:43,startColumn:3,endLine:47,endColumn:47,statements:5,count:7},{startLine:48,startColumn:4,endLine:50,endColumn:1,statements:2,count:0},{startLine:51,startColumn:3,endLine:52,endColumn:61,statements:2,count:7},{startLine:53,startColumn:4,endLine:53,endColumn:18,statements:1,count:0},{startLine:54,startColumn:5,endLine:55,endColumn:1,statements:1,count:0},{startLine:56,startColumn:5,endLine:57,endColumn:1,statements:1,count:0},{startLine:58,startColumn:4,endLine:58,endColumn:10,statements:1,count:0},{startLine:60,startColumn:3,endLine:61,endColumn:13,statements:2,count:7},{startLine:62,startColumn:4,endLine:64,endColumn:1,statements:2,count:0},{startLine:65,startColumn:3,endLine:65,endColumn:51,statements:1,count:7},{startLine:66,startColumn:4,endLine:68,endColumn:1,statements:2,count:0},{startLine:69,startColumn:3,endLine:71,endColumn:53,statements:3,count:7},{startLine:72,startColumn:4,endLine:74,endColumn:1,statements:2,count:7},{startLine:75,startColumn:3,endLine:75,endColumn:36,statements:1,count:0},{startLine:77,startColumn:2,endLine:77,endColumn:12,statements:1,count:7},{startLine:81,startColumn:2,endLine:82,endColumn:31,statements:2,count:0},{startLine:83,startColumn:3,endLine:84,endColumn:1,statements:1,count:0},{startLine:85,startColumn:3,endLine:86,endColumn:1,statements:1,count:0},{startLine:90,startColumn:2,endLine:91,endColumn:9,statements:2,count:7},{startLine:93,startColumn:3,endLine:93,endColumn:105,statements:1,count:1},{startLine:95,startColumn:3,endLine:95,endColumn:104,statements:1,count:1},{startLine:97,startColumn:3,endLine:97,endColumn:86,statements:1,count:0},{startLine:99,startColumn:3,endLine:99,endColumn:80,statements:1,count:1},{startLine:101,startColumn:3,endLine:101,endColumn:92,statements:1,count:1},{startLine:103,startColumn:3,endLine:103,endColumn:88,statements:1,count:1},{startLine:105,startColumn:3,endLine:105,endColumn:124,statements:1,count:1},{startLine:107,startColumn:3,endLine:107,endColumn:57,statements:1,count:1},{startLine:109,startColumn:2,endLine:109,endColumn:40,statements:1,count:7},{startLine:112,startColumn:2,endLine:113,endColumn:1,statements:1,count:14},{startLine:115,startColumn:2,endLine:117,endColumn:53,statements:3,count:21},{startLine:118,startColumn:3,endLine:119,endColumn:1,statements:1,count:0},{startLine:134,startColumn:2,endLine:134,endColumn:41,statements:1,count:7},{startLine:135,startColumn:3,endLine:136,endColumn:1,statements:1,count:0},{startLine:137,startColumn:2,endLine:138,endColumn:32,statements:2,count:7},{startLine:139,startColumn:3,endLine:139,endColumn:64,statements:1,count:7},{startLine:140,startColumn:4,endLine:141,endColumn:1,statements:1,count:0},{startLine:142,startColumn:3,endLine:142,endColumn:130,statements:1,count:7},{startLine:144,startColumn:2,endLine:144,endColumn:18,statements:1,count:7}]}],T=[{path:`internal/httpapi/handler_test.go`,label:`Selected test / case body · TestFailureMappingAndReadiness`,source:`func TestFailureMappingAndReadiness(t *testing.T) {
	for _, tc := range []struct {
		err    error
		status int
		code   string
	}{{contracts.ErrInsufficientFunds, 422, "insufficient_funds"}, {contracts.ErrUnknownFirm, 422, "unknown_firm"}, {contracts.ErrBalanceOverflow, 422, "balance_overflow"}, {contracts.ErrUnavailable, 503, "unavailable"}, {context.DeadlineExceeded, 504, "timeout"}, {context.Canceled, 503, "unavailable"}, {errors.New("private SQL details"), 500, "internal_error"}} {
		p := &processor{err: tc.err}
		h := httpapi.Handler("test", "/payments/bulk", p, func(context.Context) error { return contracts.ErrUnavailable })
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequestWithContext(t.Context(), http.MethodPost, "/payments/bulk", strings.NewReader(valid)))
		var body contracts.ErrorResponse
		if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
			t.Fatal(err)
		}
		if w.Code != tc.status || body.Error.Code != tc.code || strings.Contains(w.Body.String(), "private SQL") {
			t.Fatalf("wrong failure: %d %s", w.Code, w.Body.String())
		}
		for _, check := range []struct {
			method, path string
			status       int
		}{{"GET", "/healthz", 200}, {"GET", "/readyz", 503}, {"GET", "/payments/bulk", 405}, {"POST", "/unknown", 404}} {
			r := httptest.NewRecorder()
			h.ServeHTTP(r, httptest.NewRequestWithContext(t.Context(), check.method, check.path, nil))
			if r.Code != check.status {
				t.Errorf("%s: %d", check.path, r.Code)
			}
		}
	}
}`,sha256:`1d122a90fd1976493a1993fe43ac4f9f20e63af91453b2831974136c90ae6ef6`,startLine:57,endLine:85,assertLines:[69,72,81]}],E=`4d0cda288a17be73e1f2fa5e1c1ce1866f6d97f453ae7730ed08fe65311aafe0`,D=`25263e820b998bbbd59925c52ee12a17a1f4f0f16fef035376c214e8f6364ca8`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/internal/httpapi`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:71,covered:47,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-ef1513aea19aa46b`,title:`Cases/unit/TestFailureMappingAndReadiness`,component:d,args:{evidence:j,mediaBase:`../cases/unit-ef1513aea19aa46b/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await checkCode(canvasElement.querySelector('[aria-label="Covered implementation"]') as HTMLElement, evidence);
    await checkAssertions(canvasElement.querySelector('[aria-label="Test assertions"]') as HTMLElement, evidence);
    await checkRecording(canvasElement.querySelector('[aria-label="Terminal recording"]') as HTMLElement, evidence);
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Covered Code',
  render: ({
    evidence
  }) => <CodePane evidence={evidence} />,
  play: async ({
    canvasElement
  }) => checkCode(canvasElement, evidence)
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: ({
    evidence
  }) => <AssertionsPane evidence={evidence} />,
  play: async ({
    canvasElement
  }) => checkAssertions(canvasElement, evidence)
}`,...F.parameters?.docs?.source}}},I=[`Recorded`,`CoveredCode`,`Assertions`]})))()}L();export{F as Assertions,P as CoveredCode,N as Recorded,I as __namedExportsOrder,M as default};