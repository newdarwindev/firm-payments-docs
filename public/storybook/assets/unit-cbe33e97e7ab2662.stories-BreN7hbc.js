import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-cbe33e97e7ab2662`,p=`unit`,m=`FuzzParseCents/seed#2`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/internal/money/money_test.go#L28`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/internal/money`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/018c6289906c6693.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^FuzzParseCents$/^seed#2$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-cbe33e97e7ab2662/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/018c6289906c6693.test`,`-cover`,`-covermode=atomic`,`.`],b=`4a8a7839941caed6f10b05d3a006fe7b3b799f09f183502cbc941823886ceea9`,x=`FuzzParseCents/seed#2`,S=[`FuzzParseCents`,`FuzzParseCents/seed#2`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[{path:`internal/money/money.go`,sha256:`c8065c265e4388d96f163dc33f82f6232a2cdad303607a1ce674f9966c7612bc`,source:`// Package money parses USD amounts without floating-point arithmetic.
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
`,blocks:[{startLine:15,startColumn:2,endLine:16,endColumn:74,statements:2,count:1},{startLine:17,startColumn:3,endLine:18,endColumn:1,statements:1,count:0},{startLine:19,startColumn:2,endLine:20,endColumn:30,statements:2,count:1},{startLine:21,startColumn:3,endLine:21,endColumn:33,statements:1,count:4},{startLine:22,startColumn:4,endLine:23,endColumn:1,statements:1,count:0},{startLine:24,startColumn:3,endLine:25,endColumn:36,statements:2,count:4},{startLine:26,startColumn:4,endLine:27,endColumn:1,statements:1,count:0},{startLine:28,startColumn:3,endLine:28,endColumn:31,statements:1,count:4},{startLine:30,startColumn:2,endLine:31,endColumn:33,statements:2,count:1},{startLine:32,startColumn:3,endLine:32,endColumn:33,statements:1,count:1},{startLine:33,startColumn:4,endLine:34,endColumn:1,statements:1,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:13,statements:2,count:1},{startLine:37,startColumn:4,endLine:38,endColumn:1,statements:1,count:1},{startLine:39,startColumn:3,endLine:39,endColumn:17,statements:1,count:1},{startLine:41,startColumn:2,endLine:41,endColumn:36,statements:1,count:1},{startLine:42,startColumn:3,endLine:43,endColumn:1,statements:1,count:0},{startLine:44,startColumn:2,endLine:44,endColumn:19,statements:1,count:1}]}],T=[{path:`internal/money/money_test.go`,label:`Selected test / case body · FuzzParseCents`,source:`func FuzzParseCents(f *testing.F) {
	for _, s := range []string{"1", "0.01", "5800.5", "21474836.48", "-1", ""} {
		f.Add(s)
	}
	f.Fuzz(func(t *testing.T, s string) {
		c, err := money.ParseCents(s)
		if err == nil && (c <= 0 || c > money.MaxCents) {
			t.Fatalf("out-of-range result %d for %q", c, s)
		}
	})
}`,sha256:`419060d18b2c125e1d6742fca73263dabcd5d5b260581da407ad62254b50bb05`,startLine:28,endLine:38,assertLines:[35]}],E=`8f0de23bbba346d8ca31e1ebf78c88466d2a69076f8f91c7654b32076dcfbb66`,D=`a2731f460eb7c801e1b07fb070978563014228159bcfd301aa17a015919bc38a`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/internal/money`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:22,covered:17,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-cbe33e97e7ab2662`,title:`Cases/unit/FuzzParseCents/seed#2`,component:d,args:{evidence:j,mediaBase:`../cases/unit-cbe33e97e7ab2662/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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