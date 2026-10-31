import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-d807f9e16b0fce9b`,p=`unit`,m=`TestPrepare/self_payment`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/internal/contracts/validate_test.go#L14`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/contracts`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/c34f76946a530588.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestPrepare$/^self_payment$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-d807f9e16b0fce9b/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/c34f76946a530588.test`,`-cover`,`-covermode=atomic`,`.`],b=`75a4dcd1d59c2af5e2df99d36253a0a6a657274e66da84b6e26c1e7bad2e78d6`,x=`TestPrepare/self_payment`,S=[`TestPrepare`,`TestPrepare/self_payment`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[{path:`internal/contracts/errors.go`,sha256:`e9d6ec4d7e030ea919c9aa732d645f8280feec00251bf0b864d832d5524e5a9f`,source:`package contracts

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
`,blocks:[{startLine:26,startColumn:2,endLine:26,endColumn:18,statements:1,count:5},{startLine:27,startColumn:3,endLine:28,endColumn:1,statements:1,count:0},{startLine:29,startColumn:2,endLine:29,endColumn:22,statements:1,count:5},{startLine:30,startColumn:3,endLine:30,endColumn:46,statements:1,count:180},{startLine:31,startColumn:4,endLine:31,endColumn:16,statements:1,count:20},{startLine:32,startColumn:5,endLine:33,endColumn:1,statements:1,count:0},{startLine:34,startColumn:4,endLine:34,endColumn:12,statements:1,count:20},{startLine:36,startColumn:3,endLine:36,endColumn:75,statements:1,count:160},{startLine:37,startColumn:4,endLine:38,endColumn:1,statements:1,count:0},{startLine:40,startColumn:2,endLine:40,endColumn:33,statements:1,count:5},{startLine:44,startColumn:2,endLine:45,endColumn:9,statements:2,count:2},{startLine:46,startColumn:3,endLine:47,endColumn:1,statements:1,count:0},{startLine:48,startColumn:2,endLine:48,endColumn:63,statements:1,count:2},{startLine:49,startColumn:3,endLine:50,endColumn:1,statements:1,count:0},{startLine:51,startColumn:2,endLine:52,endColumn:39,statements:2,count:2},{startLine:53,startColumn:3,endLine:54,endColumn:28,statements:2,count:3},{startLine:55,startColumn:4,endLine:56,endColumn:1,statements:1,count:1},{startLine:57,startColumn:3,endLine:58,endColumn:17,statements:2,count:2},{startLine:59,startColumn:4,endLine:60,endColumn:1,statements:1,count:0},{startLine:61,startColumn:3,endLine:61,endColumn:41,statements:1,count:2},{startLine:62,startColumn:4,endLine:63,endColumn:1,statements:1,count:0},{startLine:64,startColumn:3,endLine:66,endColumn:125,statements:3,count:2},{startLine:68,startColumn:2,endLine:68,endColumn:19,statements:1,count:1}]}],T=[{path:`internal/contracts/validate_test.go`,label:`Selected test / case body · TestPrepare`,source:`func TestPrepare(t *testing.T) {
	req := contracts.BulkRequest{PayerFirmUUID: strings.ToUpper(payer), Payments: []contracts.Payment{{Amount: "1.25", PayeeFirmUUID: payee, Description: "first"}, {Amount: "2", PayeeFirmUUID: payee, Description: "second"}}}
	batch, err := contracts.Prepare(req)
	if err != nil {
		t.Fatal(err)
	}
	if batch.PayerUUID != payer || batch.Total != 325 || batch.Credits[payee] != 325 || len(batch.Payments) != 2 || batch.Payments[0].Description != "first" {
		t.Fatalf("invalid prepared batch: %+v", batch)
	}
	for _, tc := range []struct {
		name   string
		mutate func(*contracts.BulkRequest)
	}{
		{"bad payer", func(r *contracts.BulkRequest) { r.PayerFirmUUID = "invalid" }},
		{"bad recipient", func(r *contracts.BulkRequest) { r.Payments[0].PayeeFirmUUID = "x" }},
		{"self payment", func(r *contracts.BulkRequest) { r.Payments[0].PayeeFirmUUID = payer }},
		{"empty", func(r *contracts.BulkRequest) { r.Payments = nil }},
		{"too many", func(r *contracts.BulkRequest) { r.Payments = make([]contracts.Payment, contracts.MaxPayments+1) }},
		{"bad amount", func(r *contracts.BulkRequest) { r.Payments[0].Amount = "1.001" }},
		{"total overflow", func(r *contracts.BulkRequest) { r.Payments[0].Amount = "21474836.47" }},
	} {
		t.Run(tc.name, func(t *testing.T) {
			bad := req
			bad.Payments = append([]contracts.Payment{}, req.Payments...)
			tc.mutate(&bad)
			if _, err := contracts.Prepare(bad); !errors.Is(err, contracts.ErrInvalidRequest) {
				t.Fatalf("expected invalid request, got %v", err)
			}
		})
	}
}`,sha256:`f5e31d87022282d3e2f41c3bb265777ace4d0eb12737c525e557f0a4c7fe84b4`,startLine:14,endLine:44,assertLines:[18,21,40]}],E=`35b23769911c9df9d50b3dfb79469fdf8a0bc8cfcaca98ef39ea891691906ad9`,D=`408b18ff4cf1ba4c3e5ef54fff00e77ccbcd752a97e383e60c4592a60ff47f17`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/internal/contracts`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:37,covered:22,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-d807f9e16b0fce9b`,title:`Cases/unit/TestPrepare/self_payment`,component:d,args:{evidence:j,mediaBase:`../cases/unit-d807f9e16b0fce9b/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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