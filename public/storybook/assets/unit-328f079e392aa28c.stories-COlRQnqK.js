import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-328f079e392aa28c`,p=`unit`,m=`TestRedirectAndCancellation`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/internal/ledgerclient/client_test.go#L44`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/ledgerclient`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/30e364b0f7d02fc2.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestRedirectAndCancellation$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-328f079e392aa28c/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/30e364b0f7d02fc2.test`,`-cover`,`-covermode=atomic`,`.`],b=`f50456c865b1ead07d01d53d7aa02b66c79ff99e91c141284fc9168c25b7c0e4`,x=`TestRedirectAndCancellation`,S=[`TestRedirectAndCancellation`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[{path:`internal/ledgerclient/client.go`,sha256:`67333f1ee3d09e69876270ff4fb5fae0ccd3c21a8a2d9e44adc8353c0dd590e9`,source:`// Package ledgerclient provides a bounded, non-retrying private HTTP client.
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
`,blocks:[{startLine:25,startColumn:2,endLine:26,endColumn:171,statements:2,count:7},{startLine:27,startColumn:3,endLine:28,endColumn:1,statements:1,count:5},{startLine:29,startColumn:2,endLine:29,endColumn:157,statements:1,count:2},{startLine:29,startColumn:159,endLine:29,endColumn:191,statements:1,count:1},{startLine:33,startColumn:2,endLine:34,endColumn:16,statements:2,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:1,statements:1,count:0},{startLine:37,startColumn:2,endLine:38,endColumn:16,statements:2,count:0},{startLine:39,startColumn:3,endLine:40,endColumn:1,statements:1,count:0},{startLine:41,startColumn:2,endLine:41,endColumn:15,statements:1,count:0},{startLine:41,startColumn:17,endLine:41,endColumn:39,statements:1,count:0},{startLine:42,startColumn:2,endLine:42,endColumn:37,statements:1,count:0},{startLine:43,startColumn:3,endLine:44,endColumn:1,statements:1,count:0},{startLine:45,startColumn:2,endLine:45,endColumn:12,statements:1,count:0},{startLine:49,startColumn:2,endLine:50,endColumn:16,statements:2,count:2},{startLine:51,startColumn:3,endLine:52,endColumn:1,statements:1,count:0},{startLine:53,startColumn:2,endLine:54,endColumn:16,statements:2,count:2},{startLine:55,startColumn:3,endLine:56,endColumn:1,statements:1,count:0},{startLine:57,startColumn:2,endLine:59,endColumn:16,statements:3,count:2},{startLine:60,startColumn:3,endLine:61,endColumn:1,statements:1,count:1},{startLine:62,startColumn:2,endLine:62,endColumn:15,statements:1,count:1},{startLine:62,startColumn:17,endLine:62,endColumn:39,statements:1,count:1},{startLine:63,startColumn:2,endLine:63,endColumn:42,statements:1,count:1},{startLine:64,startColumn:3,endLine:65,endColumn:1,statements:1,count:0},{startLine:68,startColumn:2,endLine:68,endColumn:102,statements:1,count:1},{startLine:69,startColumn:3,endLine:70,endColumn:1,statements:1,count:1},{startLine:71,startColumn:2,endLine:72,endColumn:91,statements:2,count:0},{startLine:73,startColumn:3,endLine:74,endColumn:1,statements:1,count:0},{startLine:75,startColumn:2,endLine:76,endColumn:24,statements:2,count:0},{startLine:78,startColumn:3,endLine:78,endColumn:196,statements:1,count:0},{startLine:79,startColumn:4,endLine:80,endColumn:1,statements:1,count:0},{startLine:82,startColumn:3,endLine:82,endColumn:45,statements:1,count:0},{startLine:83,startColumn:4,endLine:84,endColumn:1,statements:1,count:0},{startLine:86,startColumn:3,endLine:86,endColumn:48,statements:1,count:0},{startLine:87,startColumn:4,endLine:88,endColumn:1,statements:1,count:0},{startLine:90,startColumn:3,endLine:90,endColumn:48,statements:1,count:0},{startLine:91,startColumn:4,endLine:92,endColumn:1,statements:1,count:0},{startLine:94,startColumn:2,endLine:94,endColumn:12,statements:1,count:0}]}],T=[{path:`internal/ledgerclient/client_test.go`,label:`Selected test / case body · TestRedirectAndCancellation`,source:`func TestRedirectAndCancellation(t *testing.T) {
	var redirects atomic.Int32
	target := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { redirects.Add(1); w.WriteHeader(201) }))
	defer target.Close()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, target.URL, http.StatusTemporaryRedirect)
	}))
	defer srv.Close()
	client, err := ledgerclient.New(srv.URL)
	if err != nil {
		t.Fatal(err)
	}
	if err := client.Execute(t.Context(), contracts.BulkRequest{}); !errors.Is(err, contracts.ErrUnavailable) || redirects.Load() != 0 {
		t.Fatal("payment redirect was followed", err)
	}
	release := make(chan struct{})
	slow := httptest.NewServer(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		select {
		case <-r.Context().Done():
		case <-release:
		}
	}))
	defer slow.Close()
	defer close(release)
	client, err = ledgerclient.New(slow.URL)
	if err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(t.Context(), 20*time.Millisecond)
	defer cancel()
	if err := client.Execute(ctx, contracts.BulkRequest{}); !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("lost deadline: %v", err)
	}
	for _, url := range []string{"", "file:///tmp/x", "http://host/path", "http://user:pass@host", "http://host?x=1"} {
		if _, err := ledgerclient.New(url); err == nil {
			t.Errorf("accepted URL %q", url)
		}
	}
}`,sha256:`8a044cf344f97053f22d79ace8050ca47342be92bde7207ee927ea255212f547`,startLine:44,endLine:82,assertLines:[54,57,70,75,79]}],E=`0e031e4b1824a4b03a2f51989eaa12b539fe7a65865284f967010374ba26cf1c`,D=`80a751d0f4e0309172f849befd709594ddcab376552bb00917af9caf6401a3e2`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/internal/ledgerclient`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:46,covered:18,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-328f079e392aa28c`,title:`Cases/unit/TestRedirectAndCancellation`,component:d,args:{evidence:j,mediaBase:`../cases/unit-328f079e392aa28c/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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