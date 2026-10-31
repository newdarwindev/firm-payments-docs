import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-b62217e65b3f21fb`,p=`unit`,m=`TestPagesPublicationProvenance/matching`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/tests/gates_test.go#L59`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tests`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestPagesPublicationProvenance$/^matching$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-b62217e65b3f21fb/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-cover`,`-covermode=atomic`,`.`],b=`33e7f9b8c4f271a641e639fd1b03dc58cfba8e4453965fb262f9db2cb3fbee52`,x=`TestPagesPublicationProvenance/matching`,S=[`TestPagesPublicationProvenance`,`TestPagesPublicationProvenance/matching`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[],T=[{path:`tests/gates_test.go`,label:`Selected test / case body · TestPagesPublicationProvenance`,source:`func TestPagesPublicationProvenance(t *testing.T) {
	script, err := filepath.Abs("../scripts/site-publication")
	if err != nil {
		t.Fatal(err)
	}
	sha := strings.Repeat("a", 40)
	public := strings.Repeat("b", 40)
	for _, tc := range []struct {
		name, source, target, repository, url string
		ok                                    bool
	}{
		{"matching", sha, public, "newdarwindev/firm-payments-docs", "https://newdarwindev.github.io/firm-payments-docs/", true},
		{"stale", public, public, "newdarwindev/firm-payments-docs", "https://newdarwindev.github.io/firm-payments-docs/", false},
		{"invalid-commit", sha, "main", "newdarwindev/firm-payments-docs", "https://newdarwindev.github.io/firm-payments-docs/", false},
		{"wrong-repository", sha, public, "another/repository", "https://newdarwindev.github.io/firm-payments-docs/", false},
		{"redirected-site", sha, public, "newdarwindev/firm-payments-docs", "https://example.com/", false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			b, err := json.Marshal(map[string]string{"SourceSHA": tc.source, "PublicSHA": tc.target, "Repository": tc.repository, "SiteURL": tc.url})
			if err != nil {
				t.Fatal(err)
			}
			manifest := filepath.Join(t.TempDir(), "publication.json")
			if err := os.WriteFile(manifest, b, 0o600); err != nil {
				t.Fatal(err)
			}
			out, err := exec.CommandContext(t.Context(), "bash", script, manifest, sha).CombinedOutput()
			if (err == nil) != tc.ok || (tc.ok && strings.TrimSpace(string(out)) != public) {
				t.Fatalf("publication result %v, expected pass=%v: %s", err, tc.ok, out)
			}
		})
	}
}`,sha256:`cecaf47f05d84d56162722e8cc87cf4a2c24879befdd7f7cd730975849547b04`,startLine:59,endLine:91,assertLines:[62,79,83,87]}],E=`15e39ee7d1ea1e23c2caa82c7fa07907bc8ae826847b1499a894308734780a89`,D=`8f8bf043d0a342dbdb54a1bef3b3137b4c59a5083abd8a4a5e8ea6e7c00fed2d`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/tests`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:0,covered:0,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-b62217e65b3f21fb`,title:`Cases/unit/TestPagesPublicationProvenance/matching`,component:d,args:{evidence:j,mediaBase:`../cases/unit-b62217e65b3f21fb/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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