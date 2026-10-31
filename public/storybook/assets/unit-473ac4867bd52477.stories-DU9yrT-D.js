import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TestEvidence-E0bvKaeb.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r=`unit-473ac4867bd52477`,i=`unit`,a=`TestPagesPublicationProvenance/stale`,o=`b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f`,s=`pass`,c=`https://github.com/newdarwindev/firm-payments/blob/b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f/tests/gates_test.go#L59`,l=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tests`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestPagesPublicationProvenance$/^stale$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-473ac4867bd52477/coverage.out`],u=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/59830ebc3a418411.test`,`-cover`,`-covermode=atomic`,`.`],d=`33e7f9b8c4f271a641e639fd1b03dc58cfba8e4453965fb262f9db2cb3fbee52`,f=`TestPagesPublicationProvenance/stale`,p=[`TestPagesPublicationProvenance`,`TestPagesPublicationProvenance/stale`],m=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,h=[],g=`15e39ee7d1ea1e23c2caa82c7fa07907bc8ae826847b1499a894308734780a89`,_=`904bee6b4c80e9baf8d5a1f1f4dbc2e13406bf3beb331a71ae3abd2413e951da`,v={id:r,suite:i,name:a,sha:o,status:s,asserts:``,sourceURL:c,package:`github.com/newdarwindev/firm-payments/tests`,command:l,build:u,binarySHA256:d,selected:f,executed:p,group:!1,scope:m,total:0,covered:0,files:h,profileSHA256:g,gifSHA256:_}})))()}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),y(),{expect:b,userEvent:x,within:S,waitFor:C}=__STORYBOOK_MODULE_TEST__,w=v,T={id:`case-unit-473ac4867bd52477`,title:`Cases/unit/TestPagesPublicationProvenance/stale`,component:n,args:{evidence:w,mediaBase:`../cases/unit-473ac4867bd52477/`}},E={play:async({canvasElement:e})=>{let t=S(e);if(await b(t.getByRole(`heading`,{name:w.name})).toBeVisible(),await b(t.getByRole(`status`)).toHaveTextContent(`PASS`),await b(t.getByRole(`status`)).toHaveTextContent(w.total?w.covered+` / `+w.total+` Go statements covered`:`No instrumented Go statements`),w.files.length){let e=w.files[w.files.length-1];await x.selectOptions(t.getByRole(`combobox`,{name:`Source file`}),e.path),await b(t.getByLabelText(`Source code: `+e.path)).toBeVisible(),await b(t.getByText(`Source SHA256: `+e.sha256)).toBeVisible(),await b(t.getByRole(`link`,{name:`Line 1`})).toHaveAttribute(`href`,`#L1`)}t.getByRole(`button`,{name:`Play terminal recording`}).focus(),await x.keyboard(`{Enter}`);let n=t.getByAltText(`Terminal execution of `+w.name);await C(()=>b(n.complete&&n.naturalWidth>0).toBe(!0)),await x.click(t.getByRole(`button`,{name:`Pause terminal recording`}))}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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