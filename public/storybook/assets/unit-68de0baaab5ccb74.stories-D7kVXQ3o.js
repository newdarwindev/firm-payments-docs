import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-68de0baaab5ccb74`,p=`unit`,m=`TestOriginalFixtureIntegrity`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/tests/fixtures_test.go#L41`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tests`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestOriginalFixtureIntegrity$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-68de0baaab5ccb74/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-cover`,`-covermode=atomic`,`.`],b=`33e7f9b8c4f271a641e639fd1b03dc58cfba8e4453965fb262f9db2cb3fbee52`,x=`TestOriginalFixtureIntegrity`,S=[`TestOriginalFixtureIntegrity`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[],T=[{path:`tests/fixtures_test.go`,label:`Selected test / case body · TestOriginalFixtureIntegrity`,source:`func TestOriginalFixtureIntegrity(t *testing.T) {
	manifest, err := os.ReadFile("../testdata/original/SHA256SUMS")
	if err != nil {
		t.Fatal(err)
	}
	for _, line := range strings.Split(strings.TrimSpace(string(manifest)), "\\n") {
		fields := strings.Fields(line)
		if len(fields) != 2 {
			t.Fatal("invalid fixture manifest")
		}
		b, err := os.ReadFile("../testdata/original/" + fields[1])
		if err != nil {
			t.Fatal(err)
		}
		if fmt.Sprintf("%x", sha256.Sum256(b)) != fields[0] {
			t.Errorf("original fixture changed: %s", fields[1])
		}
	}
}`,sha256:`6e3eb42b8f0cbc3821627bdb4ec415ea861cf5dcc4a9d1df2762cc9822348819`,startLine:41,endLine:59,assertLines:[44,49,53,56]}],E=`15e39ee7d1ea1e23c2caa82c7fa07907bc8ae826847b1499a894308734780a89`,D=`01c68546d8871cf33b68a2206d42313e850b3b7f3a3b6460559e11678277400e`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/tests`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:0,covered:0,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-68de0baaab5ccb74`,title:`Cases/unit/TestOriginalFixtureIntegrity`,component:d,args:{evidence:j,mediaBase:`../cases/unit-68de0baaab5ccb74/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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