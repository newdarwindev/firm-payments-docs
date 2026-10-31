import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TestEvidence-E0bvKaeb.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r=`unit-c97ec15759e8e20a`,i=`unit`,a=`TestRequestBoundary/multiple_documents`,o=`b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f`,s=`pass`,c=`https://github.com/newdarwindev/firm-payments/blob/b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f/internal/httpapi/handler_test.go#L25`,l=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/httpapi`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/1e51f7ae8228a333.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestRequestBoundary$/^multiple_documents$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-c97ec15759e8e20a/coverage.out`],u=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/1e51f7ae8228a333.test`,`-cover`,`-covermode=atomic`,`.`],d=`96d98823f10266c1a87af470da8ccc55ee566b992786d2989931be874f636bff`,f=`TestRequestBoundary/multiple_documents`,p=[`TestRequestBoundary`,`TestRequestBoundary/multiple_documents`],m=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,h=[{path:`internal/httpapi/handler.go`,sha256:`88735bc861d5de82104c8490b718c51e031bf771dfeed4404af95002bb2b5313`,source:`// Package httpapi exposes the shared public and private payment transport.
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
`,blocks:[{startLine:22,startColumn:2,endLine:23,endColumn:78,statements:2,count:1},{startLine:24,startColumn:3,endLine:25,endColumn:1,statements:1,count:0},{startLine:26,startColumn:2,endLine:26,endColumn:77,statements:1,count:1},{startLine:27,startColumn:3,endLine:29,endColumn:36,statements:3,count:0},{startLine:30,startColumn:4,endLine:32,endColumn:1,statements:2,count:0},{startLine:33,startColumn:3,endLine:33,endColumn:68,statements:1,count:0},{startLine:35,startColumn:2,endLine:35,endColumn:77,statements:1,count:1},{startLine:36,startColumn:3,endLine:36,endColumn:59,statements:1,count:1},{startLine:37,startColumn:4,endLine:38,endColumn:49,statements:2,count:1},{startLine:39,startColumn:5,endLine:41,endColumn:1,statements:2,count:0},{startLine:43,startColumn:3,endLine:47,endColumn:47,statements:5,count:1},{startLine:48,startColumn:4,endLine:50,endColumn:1,statements:2,count:0},{startLine:51,startColumn:3,endLine:52,endColumn:61,statements:2,count:1},{startLine:53,startColumn:4,endLine:53,endColumn:18,statements:1,count:1},{startLine:54,startColumn:5,endLine:55,endColumn:1,statements:1,count:1},{startLine:56,startColumn:5,endLine:57,endColumn:1,statements:1,count:0},{startLine:58,startColumn:4,endLine:58,endColumn:10,statements:1,count:1},{startLine:60,startColumn:3,endLine:61,endColumn:13,statements:2,count:0},{startLine:62,startColumn:4,endLine:64,endColumn:1,statements:2,count:0},{startLine:65,startColumn:3,endLine:65,endColumn:51,statements:1,count:0},{startLine:66,startColumn:4,endLine:68,endColumn:1,statements:2,count:0},{startLine:69,startColumn:3,endLine:71,endColumn:53,statements:3,count:0},{startLine:72,startColumn:4,endLine:74,endColumn:1,statements:2,count:0},{startLine:75,startColumn:3,endLine:75,endColumn:36,statements:1,count:0},{startLine:77,startColumn:2,endLine:77,endColumn:12,statements:1,count:1},{startLine:81,startColumn:2,endLine:82,endColumn:31,statements:2,count:0},{startLine:83,startColumn:3,endLine:84,endColumn:1,statements:1,count:0},{startLine:85,startColumn:3,endLine:86,endColumn:1,statements:1,count:0},{startLine:90,startColumn:2,endLine:91,endColumn:9,statements:2,count:0},{startLine:93,startColumn:3,endLine:93,endColumn:105,statements:1,count:0},{startLine:95,startColumn:3,endLine:95,endColumn:104,statements:1,count:0},{startLine:97,startColumn:3,endLine:97,endColumn:86,statements:1,count:0},{startLine:99,startColumn:3,endLine:99,endColumn:80,statements:1,count:0},{startLine:101,startColumn:3,endLine:101,endColumn:92,statements:1,count:0},{startLine:103,startColumn:3,endLine:103,endColumn:88,statements:1,count:0},{startLine:105,startColumn:3,endLine:105,endColumn:124,statements:1,count:0},{startLine:107,startColumn:3,endLine:107,endColumn:57,statements:1,count:0},{startLine:109,startColumn:2,endLine:109,endColumn:40,statements:1,count:0},{startLine:112,startColumn:2,endLine:113,endColumn:1,statements:1,count:1},{startLine:115,startColumn:2,endLine:117,endColumn:53,statements:3,count:1},{startLine:118,startColumn:3,endLine:119,endColumn:1,statements:1,count:0},{startLine:134,startColumn:2,endLine:134,endColumn:41,statements:1,count:0},{startLine:135,startColumn:3,endLine:136,endColumn:1,statements:1,count:0},{startLine:137,startColumn:2,endLine:138,endColumn:32,statements:2,count:0},{startLine:139,startColumn:3,endLine:139,endColumn:64,statements:1,count:0},{startLine:140,startColumn:4,endLine:141,endColumn:1,statements:1,count:0},{startLine:142,startColumn:3,endLine:142,endColumn:130,statements:1,count:0},{startLine:144,startColumn:2,endLine:144,endColumn:18,statements:1,count:0}]}],g=`2f3a221de75aa0eb02aed92bac63ecc39cd4ad31645ca38e18f0d86a62e61202`,_=`8bfadcfbc0499936314f208fd21d3368a1afd52eda8f39352b737f2556f6bacb`,v={id:r,suite:i,name:a,sha:o,status:s,asserts:``,sourceURL:c,package:`github.com/newdarwindev/firm-payments/internal/httpapi`,command:l,build:u,binarySHA256:d,selected:f,executed:p,group:!1,scope:m,total:71,covered:22,files:h,profileSHA256:g,gifSHA256:_}})))()}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),y(),{expect:b,userEvent:x,within:S,waitFor:C}=__STORYBOOK_MODULE_TEST__,w=v,T={id:`case-unit-c97ec15759e8e20a`,title:`Cases/unit/TestRequestBoundary/multiple_documents`,component:n,args:{evidence:w,mediaBase:`../cases/unit-c97ec15759e8e20a/`}},E={play:async({canvasElement:e})=>{let t=S(e);if(await b(t.getByRole(`heading`,{name:w.name})).toBeVisible(),await b(t.getByRole(`status`)).toHaveTextContent(`PASS`),await b(t.getByRole(`status`)).toHaveTextContent(w.total?w.covered+` / `+w.total+` Go statements covered`:`No instrumented Go statements`),w.files.length){let e=w.files[w.files.length-1];await x.selectOptions(t.getByRole(`combobox`,{name:`Source file`}),e.path),await b(t.getByLabelText(`Source code: `+e.path)).toBeVisible(),await b(t.getByText(`Source SHA256: `+e.sha256)).toBeVisible(),await b(t.getByRole(`link`,{name:`Line 1`})).toHaveAttribute(`href`,`#L1`)}t.getByRole(`button`,{name:`Play terminal recording`}).focus(),await x.keyboard(`{Enter}`);let n=t.getByAltText(`Terminal execution of `+w.name);await C(()=>b(n.complete&&n.naturalWidth>0).toBe(!0)),await x.click(t.getByRole(`button`,{name:`Pause terminal recording`}))}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D=[`Recorded`]})))()}O();export{E as Recorded,D as __namedExportsOrder,T as default};