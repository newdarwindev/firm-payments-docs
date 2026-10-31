import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TestEvidence-E0bvKaeb.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r=`unit-c3dbc2b5277859ec`,i=`unit`,a=`TestClientPreservesOutcomesWithoutRetry`,o=`b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f`,s=`pass`,c=`https://github.com/newdarwindev/firm-payments/blob/b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f/internal/ledgerclient/client_test.go#L16`,l=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/ledgerclient`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/30e364b0f7d02fc2.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestClientPreservesOutcomesWithoutRetry$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-c3dbc2b5277859ec/coverage.out`],u=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/30e364b0f7d02fc2.test`,`-cover`,`-covermode=atomic`,`.`],d=`f50456c865b1ead07d01d53d7aa02b66c79ff99e91c141284fc9168c25b7c0e4`,f=`TestClientPreservesOutcomesWithoutRetry`,p=[`TestClientPreservesOutcomesWithoutRetry`],m=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,h=[{path:`internal/ledgerclient/client.go`,sha256:`67333f1ee3d09e69876270ff4fb5fae0ccd3c21a8a2d9e44adc8353c0dd590e9`,source:`// Package ledgerclient provides a bounded, non-retrying private HTTP client.
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
`,blocks:[{startLine:25,startColumn:2,endLine:26,endColumn:171,statements:2,count:8},{startLine:27,startColumn:3,endLine:28,endColumn:1,statements:1,count:0},{startLine:29,startColumn:2,endLine:29,endColumn:157,statements:1,count:8},{startLine:29,startColumn:159,endLine:29,endColumn:191,statements:1,count:0},{startLine:33,startColumn:2,endLine:34,endColumn:16,statements:2,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:1,statements:1,count:0},{startLine:37,startColumn:2,endLine:38,endColumn:16,statements:2,count:0},{startLine:39,startColumn:3,endLine:40,endColumn:1,statements:1,count:0},{startLine:41,startColumn:2,endLine:41,endColumn:15,statements:1,count:0},{startLine:41,startColumn:17,endLine:41,endColumn:39,statements:1,count:0},{startLine:42,startColumn:2,endLine:42,endColumn:37,statements:1,count:0},{startLine:43,startColumn:3,endLine:44,endColumn:1,statements:1,count:0},{startLine:45,startColumn:2,endLine:45,endColumn:12,statements:1,count:0},{startLine:49,startColumn:2,endLine:50,endColumn:16,statements:2,count:8},{startLine:51,startColumn:3,endLine:52,endColumn:1,statements:1,count:0},{startLine:53,startColumn:2,endLine:54,endColumn:16,statements:2,count:8},{startLine:55,startColumn:3,endLine:56,endColumn:1,statements:1,count:0},{startLine:57,startColumn:2,endLine:59,endColumn:16,statements:3,count:8},{startLine:60,startColumn:3,endLine:61,endColumn:1,statements:1,count:0},{startLine:62,startColumn:2,endLine:62,endColumn:15,statements:1,count:8},{startLine:62,startColumn:17,endLine:62,endColumn:39,statements:1,count:8},{startLine:63,startColumn:2,endLine:63,endColumn:42,statements:1,count:8},{startLine:64,startColumn:3,endLine:65,endColumn:1,statements:1,count:1},{startLine:68,startColumn:2,endLine:68,endColumn:102,statements:1,count:7},{startLine:69,startColumn:3,endLine:70,endColumn:1,statements:1,count:2},{startLine:71,startColumn:2,endLine:72,endColumn:91,statements:2,count:5},{startLine:73,startColumn:3,endLine:74,endColumn:1,statements:1,count:0},{startLine:75,startColumn:2,endLine:76,endColumn:24,statements:2,count:5},{startLine:78,startColumn:3,endLine:78,endColumn:196,statements:1,count:1},{startLine:79,startColumn:4,endLine:80,endColumn:1,statements:1,count:0},{startLine:82,startColumn:3,endLine:82,endColumn:45,statements:1,count:2},{startLine:83,startColumn:4,endLine:84,endColumn:1,statements:1,count:1},{startLine:86,startColumn:3,endLine:86,endColumn:48,statements:1,count:1},{startLine:87,startColumn:4,endLine:88,endColumn:1,statements:1,count:0},{startLine:90,startColumn:3,endLine:90,endColumn:48,statements:1,count:1},{startLine:91,startColumn:4,endLine:92,endColumn:1,statements:1,count:0},{startLine:94,startColumn:2,endLine:94,endColumn:12,statements:1,count:4}]}],g=`8090f8c286e2265e8b12a1b79634438776c6dc3b94006c790e1d505c1fb8494a`,_=`1257cb14524081442fd8f7785c916a13cf1be2b204edc42b2445d8e403b22d85`,v={id:r,suite:i,name:a,sha:o,status:s,asserts:``,sourceURL:c,package:`github.com/newdarwindev/firm-payments/internal/ledgerclient`,command:l,build:u,binarySHA256:d,selected:f,executed:p,group:!1,scope:m,total:46,covered:26,files:h,profileSHA256:g,gifSHA256:_}})))()}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),y(),{expect:b,userEvent:x,within:S,waitFor:C}=__STORYBOOK_MODULE_TEST__,w=v,T={id:`case-unit-c3dbc2b5277859ec`,title:`Cases/unit/TestClientPreservesOutcomesWithoutRetry`,component:n,args:{evidence:w,mediaBase:`../cases/unit-c3dbc2b5277859ec/`}},E={play:async({canvasElement:e})=>{let t=S(e);if(await b(t.getByRole(`heading`,{name:w.name})).toBeVisible(),await b(t.getByRole(`status`)).toHaveTextContent(`PASS`),await b(t.getByRole(`status`)).toHaveTextContent(w.total?w.covered+` / `+w.total+` Go statements covered`:`No instrumented Go statements`),w.files.length){let e=w.files[w.files.length-1];await x.selectOptions(t.getByRole(`combobox`,{name:`Source file`}),e.path),await b(t.getByLabelText(`Source code: `+e.path)).toBeVisible(),await b(t.getByText(`Source SHA256: `+e.sha256)).toBeVisible(),await b(t.getByRole(`link`,{name:`Line 1`})).toHaveAttribute(`href`,`#L1`)}t.getByRole(`button`,{name:`Play terminal recording`}).focus(),await x.keyboard(`{Enter}`);let n=t.getByAltText(`Terminal execution of `+w.name);await C(()=>b(n.complete&&n.naturalWidth>0).toBe(!0)),await x.click(t.getByRole(`button`,{name:`Pause terminal recording`}))}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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