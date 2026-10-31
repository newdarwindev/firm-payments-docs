import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TestEvidence-E0bvKaeb.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r=`unit-900d5840ee5af04e`,i=`unit`,a=`TestPrepare/too_many`,o=`b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f`,s=`pass`,c=`https://github.com/newdarwindev/firm-payments/blob/b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f/internal/contracts/validate_test.go#L14`,l=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/contracts`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/c34f76946a530588.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestPrepare$/^too_many$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-900d5840ee5af04e/coverage.out`],u=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/c34f76946a530588.test`,`-cover`,`-covermode=atomic`,`.`],d=`75a4dcd1d59c2af5e2df99d36253a0a6a657274e66da84b6e26c1e7bad2e78d6`,f=`TestPrepare/too_many`,p=[`TestPrepare`,`TestPrepare/too_many`],m=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,h=[{path:`internal/contracts/errors.go`,sha256:`e9d6ec4d7e030ea919c9aa732d645f8280feec00251bf0b864d832d5524e5a9f`,source:`package contracts

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
`,blocks:[{startLine:26,startColumn:2,endLine:26,endColumn:14,statements:1,count:0},{startLine:28,startColumn:3,endLine:28,endColumn:34,statements:1,count:0},{startLine:30,startColumn:3,endLine:30,endColumn:27,statements:1,count:0},{startLine:32,startColumn:3,endLine:32,endColumn:24,statements:1,count:0},{startLine:34,startColumn:3,endLine:34,endColumn:30,statements:1,count:0},{startLine:36,startColumn:3,endLine:36,endColumn:28,statements:1,count:0},{startLine:38,startColumn:3,endLine:38,endColumn:21,statements:1,count:0},{startLine:40,startColumn:3,endLine:40,endColumn:24,statements:1,count:0}]},{path:`internal/contracts/validate.go`,sha256:`c8c6e922a0e4e8c3df4763e01dc3260bd413c1684364a87d32e820d140f87d94`,source:`package contracts

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
`,blocks:[{startLine:26,startColumn:2,endLine:26,endColumn:18,statements:1,count:4},{startLine:27,startColumn:3,endLine:28,endColumn:1,statements:1,count:0},{startLine:29,startColumn:2,endLine:29,endColumn:22,statements:1,count:4},{startLine:30,startColumn:3,endLine:30,endColumn:46,statements:1,count:144},{startLine:31,startColumn:4,endLine:31,endColumn:16,statements:1,count:16},{startLine:32,startColumn:5,endLine:33,endColumn:1,statements:1,count:0},{startLine:34,startColumn:4,endLine:34,endColumn:12,statements:1,count:16},{startLine:36,startColumn:3,endLine:36,endColumn:75,statements:1,count:128},{startLine:37,startColumn:4,endLine:38,endColumn:1,statements:1,count:0},{startLine:40,startColumn:2,endLine:40,endColumn:33,statements:1,count:4},{startLine:44,startColumn:2,endLine:45,endColumn:9,statements:2,count:2},{startLine:46,startColumn:3,endLine:47,endColumn:1,statements:1,count:0},{startLine:48,startColumn:2,endLine:48,endColumn:63,statements:1,count:2},{startLine:49,startColumn:3,endLine:50,endColumn:1,statements:1,count:1},{startLine:51,startColumn:2,endLine:52,endColumn:39,statements:2,count:1},{startLine:53,startColumn:3,endLine:54,endColumn:28,statements:2,count:2},{startLine:55,startColumn:4,endLine:56,endColumn:1,statements:1,count:0},{startLine:57,startColumn:3,endLine:58,endColumn:17,statements:2,count:2},{startLine:59,startColumn:4,endLine:60,endColumn:1,statements:1,count:0},{startLine:61,startColumn:3,endLine:61,endColumn:41,statements:1,count:2},{startLine:62,startColumn:4,endLine:63,endColumn:1,statements:1,count:0},{startLine:64,startColumn:3,endLine:66,endColumn:125,statements:3,count:2},{startLine:68,startColumn:2,endLine:68,endColumn:19,statements:1,count:1}]}],g=`96e82efde49f7d0bcdba22e56bdead13982441bae8d7d013642bad05c0814a2f`,_=`2d4b908c57e1da6ff620f9a163c146a8cc762f7a44458e9eee2085b6331cb55c`,v={id:r,suite:i,name:a,sha:o,status:s,asserts:``,sourceURL:c,package:`github.com/newdarwindev/firm-payments/internal/contracts`,command:l,build:u,binarySHA256:d,selected:f,executed:p,group:!1,scope:m,total:37,covered:22,files:h,profileSHA256:g,gifSHA256:_}})))()}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),y(),{expect:b,userEvent:x,within:S,waitFor:C}=__STORYBOOK_MODULE_TEST__,w=v,T={id:`case-unit-900d5840ee5af04e`,title:`Cases/unit/TestPrepare/too_many`,component:n,args:{evidence:w,mediaBase:`../cases/unit-900d5840ee5af04e/`}},E={play:async({canvasElement:e})=>{let t=S(e);if(await b(t.getByRole(`heading`,{name:w.name})).toBeVisible(),await b(t.getByRole(`status`)).toHaveTextContent(`PASS`),await b(t.getByRole(`status`)).toHaveTextContent(w.total?w.covered+` / `+w.total+` Go statements covered`:`No instrumented Go statements`),w.files.length){let e=w.files[w.files.length-1];await x.selectOptions(t.getByRole(`combobox`,{name:`Source file`}),e.path),await b(t.getByLabelText(`Source code: `+e.path)).toBeVisible(),await b(t.getByText(`Source SHA256: `+e.sha256)).toBeVisible(),await b(t.getByRole(`link`,{name:`Line 1`})).toHaveAttribute(`href`,`#L1`)}t.getByRole(`button`,{name:`Play terminal recording`}).focus(),await x.keyboard(`{Enter}`);let n=t.getByAltText(`Terminal execution of `+w.name);await C(()=>b(n.complete&&n.naturalWidth>0).toBe(!0)),await x.click(t.getByRole(`button`,{name:`Pause terminal recording`}))}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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