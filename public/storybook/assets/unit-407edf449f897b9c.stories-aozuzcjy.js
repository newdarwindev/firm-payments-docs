import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TestEvidence-E0bvKaeb.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r=`unit-407edf449f897b9c`,i=`unit`,a=`FuzzParseCents`,o=`b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f`,s=`pass`,c=`https://github.com/newdarwindev/firm-payments/blob/b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f/internal/money/money_test.go#L28`,l=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/money`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/018c6289906c6693.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^FuzzParseCents$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-407edf449f897b9c/coverage.out`],u=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/018c6289906c6693.test`,`-cover`,`-covermode=atomic`,`.`],d=`4a8a7839941caed6f10b05d3a006fe7b3b799f09f183502cbc941823886ceea9`,f=`FuzzParseCents`,p=[`FuzzParseCents`,`FuzzParseCents/seed#0`,`FuzzParseCents/seed#1`,`FuzzParseCents/seed#2`,`FuzzParseCents/seed#3`,`FuzzParseCents/seed#4`,`FuzzParseCents/seed#5`],m=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,h=[{path:`internal/money/money.go`,sha256:`c8065c265e4388d96f163dc33f82f6232a2cdad303607a1ce674f9966c7612bc`,source:`// Package money parses USD amounts without floating-point arithmetic.
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
`,blocks:[{startLine:15,startColumn:2,endLine:16,endColumn:74,statements:2,count:6},{startLine:17,startColumn:3,endLine:18,endColumn:1,statements:1,count:1},{startLine:19,startColumn:2,endLine:20,endColumn:30,statements:2,count:5},{startLine:21,startColumn:3,endLine:21,endColumn:33,statements:1,count:15},{startLine:22,startColumn:4,endLine:23,endColumn:1,statements:1,count:1},{startLine:24,startColumn:3,endLine:25,endColumn:36,statements:2,count:14},{startLine:26,startColumn:4,endLine:27,endColumn:1,statements:1,count:0},{startLine:28,startColumn:3,endLine:28,endColumn:31,statements:1,count:14},{startLine:30,startColumn:2,endLine:31,endColumn:33,statements:2,count:4},{startLine:32,startColumn:3,endLine:32,endColumn:33,statements:1,count:5},{startLine:33,startColumn:4,endLine:34,endColumn:1,statements:1,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:13,statements:2,count:5},{startLine:37,startColumn:4,endLine:38,endColumn:1,statements:1,count:3},{startLine:39,startColumn:3,endLine:39,endColumn:17,statements:1,count:5},{startLine:41,startColumn:2,endLine:41,endColumn:36,statements:1,count:4},{startLine:42,startColumn:3,endLine:43,endColumn:1,statements:1,count:1},{startLine:44,startColumn:2,endLine:44,endColumn:19,statements:1,count:3}]}],g=`ac10d223b02fda7466125b4949a200bcc7febb664ca39578a9bd84a8d249bf18`,_=`54f42934859392a2111fd7ae226e0a107b5c41f708168d8806a32ed29e5495f2`,v={id:r,suite:i,name:a,sha:o,status:s,asserts:``,sourceURL:c,package:`github.com/newdarwindev/firm-payments/internal/money`,command:l,build:u,binarySHA256:d,selected:f,executed:p,group:!0,scope:m,total:22,covered:20,files:h,profileSHA256:g,gifSHA256:_}})))()}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),y(),{expect:b,userEvent:x,within:S,waitFor:C}=__STORYBOOK_MODULE_TEST__,w=v,T={id:`case-unit-407edf449f897b9c`,title:`Cases/unit/FuzzParseCents`,component:n,args:{evidence:w,mediaBase:`../cases/unit-407edf449f897b9c/`}},E={play:async({canvasElement:e})=>{let t=S(e);if(await b(t.getByRole(`heading`,{name:w.name})).toBeVisible(),await b(t.getByRole(`status`)).toHaveTextContent(`PASS`),await b(t.getByRole(`status`)).toHaveTextContent(w.total?w.covered+` / `+w.total+` Go statements covered`:`No instrumented Go statements`),w.files.length){let e=w.files[w.files.length-1];await x.selectOptions(t.getByRole(`combobox`,{name:`Source file`}),e.path),await b(t.getByLabelText(`Source code: `+e.path)).toBeVisible(),await b(t.getByText(`Source SHA256: `+e.sha256)).toBeVisible(),await b(t.getByRole(`link`,{name:`Line 1`})).toHaveAttribute(`href`,`#L1`)}t.getByRole(`button`,{name:`Play terminal recording`}).focus(),await x.keyboard(`{Enter}`);let n=t.getByAltText(`Terminal execution of `+w.name);await C(()=>b(n.complete&&n.naturalWidth>0).toBe(!0)),await x.click(t.getByRole(`button`,{name:`Pause terminal recording`}))}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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