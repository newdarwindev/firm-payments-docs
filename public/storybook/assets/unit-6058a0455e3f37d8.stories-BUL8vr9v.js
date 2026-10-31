import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-6058a0455e3f37d8`,p=`unit`,m=`TestPrePushRejectsUnverifiedTree/stale`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/tests/gates_test.go#L13`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tests`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestPrePushRejectsUnverifiedTree$/^stale$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-6058a0455e3f37d8/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-cover`,`-covermode=atomic`,`.`],b=`33e7f9b8c4f271a641e639fd1b03dc58cfba8e4453965fb262f9db2cb3fbee52`,x=`TestPrePushRejectsUnverifiedTree/stale`,S=[`TestPrePushRejectsUnverifiedTree`,`TestPrePushRejectsUnverifiedTree/stale`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[],T=[{path:`tests/gates_test.go`,label:`Selected test / case body · TestPrePushRejectsUnverifiedTree`,source:`func TestPrePushRejectsUnverifiedTree(t *testing.T) {
	hook, err := filepath.Abs("../.githooks/pre-push")
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	bin := filepath.Join(root, "bin")
	if err := os.MkdirAll(bin, 0o755); err != nil {
		t.Fatal(err)
	}
	fake := \`#!/bin/sh
case "$1 $2" in
 'rev-parse --show-toplevel') printf '%s\\n' "$FP_TEST_ROOT" ;;
 'rev-parse HEAD^{tree}') printf '%s\\n' "$FP_TEST_TREE" ;;
 *) exit 2 ;;
esac
\`
	if err := os.WriteFile(filepath.Join(bin, "git"), []byte(fake), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", bin+string(os.PathListSeparator)+os.Getenv("PATH"))
	t.Setenv("FP_TEST_ROOT", root)
	t.Setenv("FP_TEST_TREE", "verified-tree")
	if err := os.MkdirAll(filepath.Join(root, ".local"), 0o755); err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct {
		name, receipt string
		ok            bool
	}{{"missing", "", false}, {"stale", "other-tree\\n", false}, {"matching", "verified-tree\\n", true}} {
		t.Run(tc.name, func(t *testing.T) {
			if tc.receipt != "" {
				if err := os.WriteFile(filepath.Join(root, ".local", "verified-index"), []byte(tc.receipt), 0o600); err != nil {
					t.Fatal(err)
				}
			}
			command := exec.CommandContext(t.Context(), "bash", hook)
			output, err := command.CombinedOutput()
			if (err == nil) != tc.ok {
				t.Fatalf("gate result %v, expected pass=%v: %s", err, tc.ok, output)
			}
		})
	}
}`,sha256:`cecaf47f05d84d56162722e8cc87cf4a2c24879befdd7f7cd730975849547b04`,startLine:13,endLine:56,assertLines:[16,21,31,37,46,52]}],E=`15e39ee7d1ea1e23c2caa82c7fa07907bc8ae826847b1499a894308734780a89`,D=`f887eb98ce9d8d802ece84098c28e21df5e52545905f67136acb857cd1a4dd4e`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/tests`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:0,covered:0,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-6058a0455e3f37d8`,title:`Cases/unit/TestPrePushRejectsUnverifiedTree/stale`,component:d,args:{evidence:j,mediaBase:`../cases/unit-6058a0455e3f37d8/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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