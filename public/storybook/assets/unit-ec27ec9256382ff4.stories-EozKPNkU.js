import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-ec27ec9256382ff4`,p=`unit`,m=`TestOriginalExamplesRemainDistinct`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/tests/fixtures_test.go#L14`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tests`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestOriginalExamplesRemainDistinct$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-ec27ec9256382ff4/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-cover`,`-covermode=atomic`,`.`],b=`33e7f9b8c4f271a641e639fd1b03dc58cfba8e4453965fb262f9db2cb3fbee52`,x=`TestOriginalExamplesRemainDistinct`,S=[`TestOriginalExamplesRemainDistinct`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[],T=[{path:`tests/fixtures_test.go`,label:`Selected test / case body · TestOriginalExamplesRemainDistinct`,source:`func TestOriginalExamplesRemainDistinct(t *testing.T) {
	for _, tc := range []struct {
		file    string
		amounts []string
	}{
		{"../testdata/original/sample-request.json", []string{"6250", "5800.5", "1200.75"}},
		{"../testdata/derived/request-format.json", []string{"1200.75", "300"}},
	} {
		b, err := os.ReadFile(tc.file)
		if err != nil {
			t.Fatal(err)
		}
		var req contracts.BulkRequest
		if err := json.Unmarshal(b, &req); err != nil {
			t.Fatal(err)
		}
		if req.PayerFirmUUID != "3f1c9a2e-7b4d-4c1e-9a55-2d8e6f0b7c41" || len(req.Payments) != len(tc.amounts) {
			t.Fatalf("changed original sample: %s", tc.file)
		}
		for i, amount := range tc.amounts {
			if req.Payments[i].Amount != amount {
				t.Errorf("%s payment %d changed: %q", tc.file, i, req.Payments[i].Amount)
			}
		}
	}
}`,sha256:`6e3eb42b8f0cbc3821627bdb4ec415ea861cf5dcc4a9d1df2762cc9822348819`,startLine:14,endLine:39,assertLines:[24,28,31,35]}],E=`15e39ee7d1ea1e23c2caa82c7fa07907bc8ae826847b1499a894308734780a89`,D=`e92949d4cf120cbca541a853650c6c998fc0785bb41468b83a805b81d2243cf6`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/tests`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:0,covered:0,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-ec27ec9256382ff4`,title:`Cases/unit/TestOriginalExamplesRemainDistinct`,component:d,args:{evidence:j,mediaBase:`../cases/unit-ec27ec9256382ff4/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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