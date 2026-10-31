import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-81b20a0ab0c3c958`,p=`unit`,m=`TestParseCents`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/internal/money/money_test.go#L11`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/money`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/018c6289906c6693.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestParseCents$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-81b20a0ab0c3c958/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/018c6289906c6693.test`,`-cover`,`-covermode=atomic`,`.`],b=`4a8a7839941caed6f10b05d3a006fe7b3b799f09f183502cbc941823886ceea9`,x=`TestParseCents`,S=[`TestParseCents`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[{path:`internal/money/money.go`,sha256:`c8065c265e4388d96f163dc33f82f6232a2cdad303607a1ce674f9966c7612bc`,source:`// Package money parses USD amounts without floating-point arithmetic.
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
`,blocks:[{startLine:15,startColumn:2,endLine:16,endColumn:74,statements:2,count:24},{startLine:17,startColumn:3,endLine:18,endColumn:1,statements:1,count:4},{startLine:19,startColumn:2,endLine:20,endColumn:30,statements:2,count:20},{startLine:21,startColumn:3,endLine:21,endColumn:33,statements:1,count:165},{startLine:22,startColumn:4,endLine:23,endColumn:1,statements:1,count:8},{startLine:24,startColumn:3,endLine:25,endColumn:36,statements:2,count:157},{startLine:26,startColumn:4,endLine:27,endColumn:1,statements:1,count:1},{startLine:28,startColumn:3,endLine:28,endColumn:31,statements:1,count:156},{startLine:30,startColumn:2,endLine:31,endColumn:33,statements:2,count:11},{startLine:32,startColumn:3,endLine:32,endColumn:33,statements:1,count:13},{startLine:33,startColumn:4,endLine:34,endColumn:1,statements:1,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:13,statements:2,count:13},{startLine:37,startColumn:4,endLine:38,endColumn:1,statements:1,count:7},{startLine:39,startColumn:3,endLine:39,endColumn:17,statements:1,count:13},{startLine:41,startColumn:2,endLine:41,endColumn:36,statements:1,count:11},{startLine:42,startColumn:3,endLine:43,endColumn:1,statements:1,count:4},{startLine:44,startColumn:2,endLine:44,endColumn:19,statements:1,count:7}]}],T=[{path:`internal/money/money_test.go`,label:`Selected test / case body · TestParseCents`,source:`func TestParseCents(t *testing.T) {
	for _, tc := range []struct {
		input string
		want  int64
	}{{"6250", 625000}, {"5800.5", 580050}, {"1200.75", 120075}, {"0.01", 1}, {"0001.20", 120}, {"21474836.47", 2147483647}, {strings.Repeat("0", 100) + "1", 100}} {
		got, err := money.ParseCents(tc.input)
		if err != nil || got != tc.want {
			t.Errorf("%q: %d, %v; want %d", tc.input, got, err, tc.want)
		}
	}
	for _, input := range []string{"", "0", "0.00", "-1", "+1", "1.", ".1", "1.001", "1e2", "NaN", " 1", "1\\n", "1,000", "１２", "21474836.48", "21474837", strings.Repeat("9", 100)} {
		if _, err := money.ParseCents(input); !errors.Is(err, money.ErrInvalidAmount) {
			t.Errorf("accepted %q: %v", input, err)
		}
	}
}`,sha256:`419060d18b2c125e1d6742fca73263dabcd5d5b260581da407ad62254b50bb05`,startLine:11,endLine:26,assertLines:[18,23]}],E=`391a4e74c7b4c1ddcc61be700cf19057a99b74f6b16b828355050b1fd13d5710`,D=`6471d35324c9f06a31a602b128b68e1b030762bad7290b71241220e2572cde2e`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/internal/money`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:22,covered:21,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-81b20a0ab0c3c958`,title:`Cases/unit/TestParseCents`,component:d,args:{evidence:j,mediaBase:`../cases/unit-81b20a0ab0c3c958/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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