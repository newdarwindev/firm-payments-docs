import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-62e4fffacae8cf93`,p=`unit`,m=`TestSiteArtifactIntegrityRejectsTamperingAndUnlistedFiles`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/tools/requirements-site/main_test.go#L65`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tools/requirements-site`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/9311f7c937a2d2ef.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestSiteArtifactIntegrityRejectsTamperingAndUnlistedFiles$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-62e4fffacae8cf93/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/9311f7c937a2d2ef.test`,`-cover`,`-covermode=atomic`,`.`],b=`d866313c631a43483ebb20002b7846c29d8893442dbee92860d012340e679cc0`,x=`TestSiteArtifactIntegrityRejectsTamperingAndUnlistedFiles`,S=[`TestSiteArtifactIntegrityRejectsTamperingAndUnlistedFiles`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[{path:`tools/requirements-site/assertions.go`,sha256:`c964a1317431f5bf4ea7e121c038a05177cddf387f1734773eccb38049b1e994`,source:`package main

import (
	"errors"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

// Test source is literal source, not a claim that every assertion branch ran.
type assertionSource struct {
	Path        string \`json:"path"\`
	Label       string \`json:"label"\`
	Source      string \`json:"source"\`
	SHA256      string \`json:"sha256"\`
	StartLine   int    \`json:"startLine"\`
	EndLine     int    \`json:"endLine"\`
	AssertLines []int  \`json:"assertLines"\`
}
type sourceNode struct {
	file string
	node ast.Node
	fset *token.FileSet
}
type testSourceIndex struct {
	functions map[string]sourceNode
	locations map[string]sourceNode
}

func indexTestSources(root, dir string) (testSourceIndex, error) {
	index := testSourceIndex{map[string]sourceNode{}, map[string]sourceNode{}}
	files, err := filepath.Glob(filepath.Join(root, dir, "*_test.go"))
	if err != nil {
		return index, err
	}
	for _, path := range files {
		fset := token.NewFileSet()
		file, err := parser.ParseFile(fset, path, nil, 0)
		if err != nil {
			return index, err
		}
		relative, err := filepath.Rel(root, path)
		if err != nil {
			return index, err
		}
		relative = filepath.ToSlash(relative)
		ast.Inspect(file, func(node ast.Node) bool {
			switch value := node.(type) {
			case *ast.FuncDecl:
				if value.Recv == nil {
					index.functions[value.Name.Name] = sourceNode{relative, value, fset}
				}
				index.locations[relative+"#L"+strconv.Itoa(fset.Position(value.Pos()).Line)] = sourceNode{relative, value, fset}
			case *ast.KeyValueExpr:
				if _, ok := value.Key.(*ast.BasicLit); ok {
					index.locations[relative+"#L"+strconv.Itoa(fset.Position(value.Pos()).Line)] = sourceNode{relative, value, fset}
				}
			}
			return true
		})
	}
	return index, nil
}

func (index testSourceIndex) snippets(root, location string) ([]assertionSource, error) {
	entry, ok := index.locations[location]
	if !ok {
		return nil, errors.New("test source location has no matching Go syntax node")
	}
	queue := []sourceNode{entry}
	seen := map[string]bool{}
	result := []assertionSource{}
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]
		key := current.file + ":" + strconv.Itoa(int(current.node.Pos()))
		if seen[key] {
			continue
		}
		seen[key] = true
		snippet, err := literalSnippet(root, current, len(result) == 0)
		if err != nil {
			return nil, err
		}
		result = append(result, snippet)
		for _, name := range localCalls(current.node) {
			if helper, exists := index.functions[name]; exists {
				queue = append(queue, helper)
			}
		}
	}
	return result, nil
}

func localCalls(node ast.Node) []string {
	names := map[string]bool{}
	ast.Inspect(node, func(node ast.Node) bool {
		if call, ok := node.(*ast.CallExpr); ok {
			if name, ok := call.Fun.(*ast.Ident); ok {
				names[name.Name] = true
			}
		}
		// Registry entries can refer to a named function rather than a literal.
		if entry, ok := node.(*ast.KeyValueExpr); ok {
			if name, ok := entry.Value.(*ast.Ident); ok {
				names[name.Name] = true
			}
		}
		return true
	})
	result := []string{}
	for name := range names {
		result = append(result, name)
	}
	sort.Strings(result)
	return result
}

func literalSnippet(root string, value sourceNode, selected bool) (assertionSource, error) {
	data, err := os.ReadFile(filepath.Join(root, value.file))
	if err != nil {
		return assertionSource{}, err
	}
	start, end := value.fset.Position(value.node.Pos()).Line, value.fset.Position(value.node.End()).Line
	label := "Referenced test helper (static call graph)"
	if selected {
		label = "Selected test / case body"
	}
	if declaration, ok := value.node.(*ast.FuncDecl); ok {
		label += " · " + declaration.Name.Name
	}
	lines := []int{}
	ast.Inspect(value.node, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if !ok {
			return true
		}
		selector, ok := call.Fun.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		receiver, ok := selector.X.(*ast.Ident)
		if !ok || (receiver.Name != "t" && receiver.Name != "b") {
			return true
		}
		for _, name := range []string{"Fatal", "Fatalf", "Error", "Errorf", "Fail", "FailNow"} {
			if selector.Sel.Name == name {
				lines = append(lines, value.fset.Position(call.Pos()).Line)
			}
		}
		return true
	})
	hash, err := fileHash(filepath.Join(root, value.file))
	if err != nil {
		return assertionSource{}, err
	}
	return assertionSource{value.file, label, strings.Join(strings.Split(string(data), "\\n")[start-1:end], "\\n"), hash, start, end, lines}, nil
}

func attachAssertions(root, revision string, results []result) error {
	indexes := map[string]testSourceIndex{}
	for i := range results {
		if !strings.HasPrefix(results[i].SourceURL, repository+"/blob/"+revision+"/") {
			return errors.New("test source revision mismatch")
		}
		location := strings.TrimPrefix(results[i].SourceURL, repository+"/blob/"+revision+"/")
		path, _, ok := strings.Cut(location, "#L")
		if !ok || !filepath.IsLocal(path) || !strings.HasSuffix(path, "_test.go") {
			return errors.New("unsafe test source URL")
		}
		dir := filepath.Dir(path)
		index, ok := indexes[dir]
		if !ok {
			var err error
			index, err = indexTestSources(root, dir)
			if err != nil {
				return err
			}
			indexes[dir] = index
		}
		sources, err := index.snippets(root, location)
		if err != nil {
			return err
		}
		results[i].Assertions = sources
	}
	return nil
}
`,blocks:[{startLine:36,startColumn:2,endLine:38,endColumn:16,statements:3,count:0},{startLine:39,startColumn:3,endLine:40,endColumn:1,statements:1,count:0},{startLine:41,startColumn:2,endLine:41,endColumn:29,statements:1,count:0},{startLine:42,startColumn:3,endLine:44,endColumn:17,statements:3,count:0},{startLine:45,startColumn:4,endLine:46,endColumn:1,statements:1,count:0},{startLine:47,startColumn:3,endLine:48,endColumn:17,statements:2,count:0},{startLine:49,startColumn:4,endLine:50,endColumn:1,statements:1,count:0},{startLine:51,startColumn:3,endLine:52,endColumn:46,statements:2,count:0},{startLine:53,startColumn:4,endLine:53,endColumn:32,statements:1,count:0},{startLine:55,startColumn:5,endLine:55,endColumn:26,statements:1,count:0},{startLine:56,startColumn:6,endLine:57,endColumn:1,statements:1,count:0},{startLine:58,startColumn:5,endLine:58,endColumn:117,statements:1,count:0},{startLine:60,startColumn:5,endLine:60,endColumn:47,statements:1,count:0},{startLine:61,startColumn:6,endLine:62,endColumn:1,statements:1,count:0},{startLine:64,startColumn:4,endLine:64,endColumn:15,statements:1,count:0},{startLine:67,startColumn:2,endLine:67,endColumn:19,statements:1,count:0},{startLine:71,startColumn:2,endLine:72,endColumn:9,statements:2,count:0},{startLine:73,startColumn:3,endLine:74,endColumn:1,statements:1,count:0},{startLine:75,startColumn:2,endLine:78,endColumn:21,statements:4,count:0},{startLine:79,startColumn:3,endLine:82,endColumn:16,statements:4,count:0},{startLine:83,startColumn:4,endLine:83,endColumn:12,statements:1,count:0},{startLine:85,startColumn:3,endLine:87,endColumn:17,statements:3,count:0},{startLine:88,startColumn:4,endLine:89,endColumn:1,statements:1,count:0},{startLine:90,startColumn:3,endLine:91,endColumn:49,statements:2,count:0},{startLine:92,startColumn:4,endLine:92,endColumn:55,statements:1,count:0},{startLine:93,startColumn:5,endLine:94,endColumn:1,statements:1,count:0},{startLine:97,startColumn:2,endLine:97,endColumn:20,statements:1,count:0},{startLine:101,startColumn:2,endLine:102,endColumn:45,statements:2,count:0},{startLine:103,startColumn:3,endLine:103,endColumn:43,statements:1,count:0},{startLine:104,startColumn:4,endLine:104,endColumn:45,statements:1,count:0},{startLine:105,startColumn:5,endLine:106,endColumn:1,statements:1,count:0},{startLine:109,startColumn:3,endLine:109,endColumn:48,statements:1,count:0},{startLine:110,startColumn:4,endLine:110,endColumn:48,statements:1,count:0},{startLine:111,startColumn:5,endLine:112,endColumn:1,statements:1,count:0},{startLine:114,startColumn:3,endLine:114,endColumn:14,statements:1,count:0},{startLine:116,startColumn:2,endLine:117,endColumn:26,statements:2,count:0},{startLine:118,startColumn:3,endLine:119,endColumn:1,statements:1,count:0},{startLine:120,startColumn:2,endLine:121,endColumn:15,statements:2,count:0},{startLine:125,startColumn:2,endLine:126,endColumn:16,statements:2,count:0},{startLine:127,startColumn:3,endLine:128,endColumn:1,statements:1,count:0},{startLine:129,startColumn:2,endLine:131,endColumn:14,statements:3,count:0},{startLine:132,startColumn:3,endLine:133,endColumn:1,statements:1,count:0},{startLine:134,startColumn:2,endLine:134,endColumn:55,statements:1,count:0},{startLine:135,startColumn:3,endLine:136,endColumn:1,statements:1,count:0},{startLine:137,startColumn:2,endLine:138,endColumn:51,statements:2,count:0},{startLine:139,startColumn:3,endLine:140,endColumn:10,statements:2,count:0},{startLine:141,startColumn:4,endLine:142,endColumn:1,statements:1,count:0},{startLine:143,startColumn:3,endLine:144,endColumn:10,statements:2,count:0},{startLine:145,startColumn:4,endLine:146,endColumn:1,statements:1,count:0},{startLine:147,startColumn:3,endLine:148,endColumn:60,statements:2,count:0},{startLine:149,startColumn:4,endLine:150,endColumn:1,statements:1,count:0},{startLine:151,startColumn:3,endLine:151,endColumn:90,statements:1,count:0},{startLine:152,startColumn:4,endLine:152,endColumn:33,statements:1,count:0},{startLine:153,startColumn:5,endLine:154,endColumn:1,statements:1,count:0},{startLine:156,startColumn:3,endLine:156,endColumn:14,statements:1,count:0},{startLine:158,startColumn:2,endLine:159,endColumn:16,statements:2,count:0},{startLine:160,startColumn:3,endLine:161,endColumn:1,statements:1,count:0},{startLine:162,startColumn:2,endLine:162,endColumn:141,statements:1,count:0},{startLine:166,startColumn:2,endLine:167,endColumn:25,statements:2,count:0},{startLine:168,startColumn:3,endLine:168,endColumn:81,statements:1,count:0},{startLine:169,startColumn:4,endLine:170,endColumn:1,statements:1,count:0},{startLine:171,startColumn:3,endLine:173,endColumn:77,statements:3,count:0},{startLine:174,startColumn:4,endLine:175,endColumn:1,statements:1,count:0},{startLine:176,startColumn:3,endLine:178,endColumn:10,statements:3,count:0},{startLine:179,startColumn:4,endLine:181,endColumn:18,statements:3,count:0},{startLine:182,startColumn:5,endLine:183,endColumn:1,statements:1,count:0},{startLine:184,startColumn:4,endLine:184,endColumn:24,statements:1,count:0},{startLine:186,startColumn:3,endLine:187,endColumn:17,statements:2,count:0},{startLine:188,startColumn:4,endLine:189,endColumn:1,statements:1,count:0},{startLine:190,startColumn:3,endLine:190,endColumn:34,statements:1,count:0},{startLine:192,startColumn:2,endLine:192,endColumn:12,statements:1,count:0}]},{path:`tools/requirements-site/build.go`,sha256:`6b4473ec5917141db8280038289a20f65b89a787c05e8e1b8a935fd6546ba652`,source:`package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
)

var rowMarker = regexp.MustCompile(\`(?m)^<!-- requirement: ([a-z0-9-]+) page: ([1-5]) -->\\n\`)

type testRef struct{ Suite, Name string }
type reference struct{ Path, Symbol string }
type mapping struct {
	ID, Kind, Note    string
	Tests             []testRef
	References        []reference
	Artifacts, Checks []string
}
type taskRow struct {
	ID, Markdown string
	Page, Line   int
}
type link struct{ Label, URL string }
type row struct {
	ID, Kind, Label, Note, Markdown string
	HTML                            template.HTML
	Page, Line                      int
	Tests                           []result
	References, Artifacts           []link
	Checks                          []check
}
type view struct {
	Title, Prefix, SHA, ShortSHA, Mode, VerifiedAt, BuildURL, SourceURL string
	Coverage                                                            string
	FunctionalCount                                                     int
	Rows                                                                []row
	Results                                                             []result
	Checks                                                              []check
	Artifacts                                                           []link
	Transcription                                                       string
}

func parseRecital(text string) ([]taskRow, error) {
	matches := rowMarker.FindAllStringSubmatchIndex(text, -1)
	if len(matches) == 0 || strings.TrimSpace(text[:matches[0][0]]) != "" {
		return nil, errors.New("recital needs explicit requirement markers")
	}
	seen := map[string]bool{}
	rows := []taskRow{}
	for i, m := range matches {
		id := text[m[2]:m[3]]
		if seen[id] {
			return nil, errors.New("duplicate requirement ID")
		}
		seen[id] = true
		end := len(text)
		if i+1 < len(matches) {
			end = matches[i+1][0]
		}
		body := strings.TrimSpace(text[m[1]:end])
		if body == "" {
			return nil, errors.New("empty recital row")
		}
		rows = append(rows, taskRow{id, body, int(text[m[4]] - '0'), strings.Count(text[:m[1]], "\\n") + 1})
	}
	return rows, nil
}
func loadRecital(root string) ([]taskRow, []mapping, string, error) {
	b, err := os.ReadFile(filepath.Join(root, "site/assignment.md"))
	if err != nil {
		return nil, nil, "", err
	}
	rows, err := parseRecital(string(b))
	if err != nil {
		return nil, nil, "", err
	}
	var mappings []mapping
	if err := readJSON(filepath.Join(root, "site/requirements.json"), &mappings); err != nil {
		return nil, nil, "", err
	}
	if len(rows) != len(mappings) {
		return nil, nil, "", errors.New("every recital row must have exactly one evidence mapping")
	}
	for i, r := range rows {
		if mappings[i].ID != r.ID {
			return nil, nil, "", errors.New("recital/map order or IDs differ")
		}
		if mappings[i].Note == "" {
			return nil, nil, "", errors.New("requirement explanation is missing")
		}
		kind := mappings[i].Kind
		if kind != "verified" && kind != "documented" && kind != "manual" && kind != "context" {
			return nil, nil, "", errors.New("unknown verification kind")
		}
		if kind == "verified" && len(mappings[i].Tests) == 0 && len(mappings[i].Checks) == 0 {
			return nil, nil, "", errors.New("verified row has no executable evidence")
		}
	}
	var source struct {
		PDF, SHA256, Transcription string
		Pages                      int
	}
	if err := readJSON(filepath.Join(root, "site/source.json"), &source); err != nil {
		return nil, nil, "", err
	}
	if source.PDF != "docs/source/assignment.pdf" || source.Pages != 5 {
		return nil, nil, "", errors.New("unexpected assignment provenance")
	}
	hash, err := fileHash(filepath.Join(root, source.PDF))
	if err != nil {
		return nil, nil, "", err
	}
	if hash != source.SHA256 {
		return nil, nil, "", errors.New("assignment PDF changed; re-audit the recital")
	}
	for _, file := range []string{"testdata/original/request-format.jsonc", "testdata/original/seed.sql", "testdata/original/sample-request.json"} {
		example, err := os.ReadFile(filepath.Join(root, file))
		if err != nil {
			return nil, nil, "", err
		}
		if !strings.Contains(string(b), strings.TrimSpace(string(example))) {
			return nil, nil, "", fmt.Errorf("original example changed in recital: %s", file)
		}
	}
	return rows, mappings, source.Transcription, nil
}
func build(root, input, out, revision string) error {
	rows, mappings, transcription, err := loadRecital(root)
	if err != nil {
		return err
	}
	data, err := loadInputs(root, input, revision)
	if err != nil {
		return err
	}
	if err := attachAssertions(root, revision, data.Results); err != nil {
		return err
	}
	v := view{Title: "Assignment × evidence", Prefix: "", SHA: revision, ShortSHA: revision[:7], Mode: data.Evidence.Mode, VerifiedAt: data.Evidence.VerifiedAt, BuildURL: data.Evidence.Service.URL, SourceURL: repository + "/tree/" + revision, Coverage: fmt.Sprintf("%.2f", data.Coverage), Transcription: transcription, Results: data.Results}
	if err := mapRows(root, revision, rows, mappings, data, &v); err != nil {
		return err
	}
	for _, r := range data.Results {
		if r.Suite == "functional" {
			v.FunctionalCount++
		}
	}
	for _, key := range []string{"service", "functional", "coverage", "conversation"} {
		a := data.Artifacts[key]
		v.Artifacts = append(v.Artifacts, link{a.Name, a.URL})
	}
	for _, c := range data.Checks {
		v.Checks = append(v.Checks, c)
	}
	sort.Slice(v.Checks, func(i, j int) bool { return v.Checks[i].ID < v.Checks[j].ID })
	if err := os.MkdirAll(out, 0o755); err != nil {
		return err
	}
	entries, err := os.ReadDir(out)
	if err != nil {
		return err
	}
	if len(entries) != 0 {
		return errors.New("site output must be empty; refuse stale public files")
	}
	tmpl, err := template.New("site").Funcs(template.FuncMap{"resultLink": func(r result) string { return "results/#" + r.Anchor }}).Parse(siteTemplate)
	if err != nil {
		return err
	}
	for _, page := range []struct{ name, title, template, prefix string }{{"index.html", "Assignment × evidence", "requirements", ""}, {"results/index.html", "Test results", "results", "../"}, {"build/index.html", "Build evidence", "build", "../"}} {
		v.Title = page.title
		v.Prefix = page.prefix
		if err := os.MkdirAll(filepath.Dir(filepath.Join(out, page.name)), 0o755); err != nil {
			return err
		}
		file, err := os.Create(filepath.Join(out, page.name))
		if err != nil {
			return err
		}
		renderErr := tmpl.ExecuteTemplate(file, page.template, v)
		closeErr := file.Close()
		if err := errors.Join(renderErr, closeErr); err != nil {
			return err
		}
	}
	for _, name := range []string{"style.css", "site.js"} {
		b, err := os.ReadFile(filepath.Join(root, "site/assets", name))
		if err != nil {
			return err
		}
		if err := os.MkdirAll(filepath.Join(out, "assets"), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(out, "assets", name), b, 0o644); err != nil {
			return err
		}
	}
	b, err := os.ReadFile(filepath.Join(root, "site/assignment.md"))
	if err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(out, "assignment.md"), b, 0o644); err != nil {
		return err
	}
	// Only selected report fields are serialized. Raw test output, conversations,
	// source-code coverage HTML and binaries are deliberately outside the public payload.
	for _, file := range []struct {
		path  string
		value any
	}{{"results/results.json", data.Results}, {"verification.json", struct {
		SourceSHA, Mode, VerifiedAt string
		FunctionalCases             int
		CoveragePercent             float64
		Rows                        int
		ServiceURL, ConversationURL string
	}{revision, data.Evidence.Mode, data.Evidence.VerifiedAt, v.FunctionalCount, data.Coverage, len(rows), data.Evidence.Service.URL, data.Evidence.Conversation.URL}}} {
		if err := writePublicJSON(filepath.Join(out, file.path), file.value); err != nil {
			return err
		}
	}
	if err := writePublicJSON(filepath.Join(out, "requirements.json"), v.Rows); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(out, ".nojekyll"), nil, 0o644); err != nil {
		return err
	}
	if err := writeSiteChecksums(out); err != nil {
		return err
	}
	return verifySite(out)
}
func mapRows(root, revision string, rows []taskRow, mappings []mapping, data inputData, v *view) error {
	for i, r := range rows {
		m := mappings[i]
		rendered, err := renderMarkdown(r.Markdown)
		if err != nil {
			return err
		}
		item := row{ID: r.ID, Kind: m.Kind, Note: m.Note, Markdown: r.Markdown, HTML: rendered, Page: r.Page, Line: r.Line}
		item.Label = map[string]string{"verified": "Verified by checks", "documented": "Documented + checked", "manual": "Owner action pending", "context": "Assignment context"}[m.Kind]
		for _, ref := range m.Tests {
			var found []result
			for _, test := range data.Results {
				if test.Suite == ref.Suite && test.Name == ref.Name {
					found = append(found, test)
				}
			}
			if len(found) != 1 || found[0].Status != "pass" {
				return fmt.Errorf("missing, ambiguous or failed requirement test: %s:%s", ref.Suite, ref.Name)
			}
			item.Tests = append(item.Tests, found[0])
		}
		for _, ref := range m.References {
			line, err := sourceLine(root, ref.Path, ref.Symbol)
			if err != nil {
				return err
			}
			item.References = append(item.References, link{filepath.Base(ref.Path) + fmt.Sprintf(":%d", line), sourceURL(revision, ref.Path, line)})
		}
		item.References = append(item.References, link{"Markdown source", sourceURL(revision, "site/assignment.md", r.Line)}, link{fmt.Sprintf("Original PDF · p.%d", r.Page), repository + "/blob/" + revision + "/docs/source/assignment.pdf#page=" + fmt.Sprint(r.Page)})
		for _, kind := range m.Artifacts {
			a, ok := data.Artifacts[kind]
			if !ok {
				return errors.New("mapping references unknown artifact")
			}
			item.Artifacts = append(item.Artifacts, link{kind + " artifact", a.URL})
		}
		for _, id := range m.Checks {
			c, ok := data.Checks[id]
			if !ok || c.Status != "pass" {
				return errors.New("mapping check is missing or failed")
			}
			item.Checks = append(item.Checks, c)
		}
		v.Rows = append(v.Rows, item)
	}
	return nil
}
func writePublicJSON(path string, value any) error {
	b, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(b, '\\n'), 0o644)
}
func writeSiteChecksums(root string) error {
	paths := []string{}
	if err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			rel, err := filepath.Rel(root, path)
			if err != nil {
				return err
			}
			if rel != "SHA256SUMS" {
				paths = append(paths, filepath.ToSlash(rel))
			}
		}
		return nil
	}); err != nil {
		return err
	}
	sort.Strings(paths)
	var b strings.Builder
	for _, path := range paths {
		sum, err := fileHash(filepath.Join(root, path))
		if err != nil {
			return err
		}
		fmt.Fprintf(&b, "%s  ./%s\\n", sum, path)
	}
	return os.WriteFile(filepath.Join(root, "SHA256SUMS"), []byte(b.String()), 0o644)
}

func renderMarkdown(text string) (template.HTML, error) {
	var rendered bytes.Buffer
	markdown := goldmark.New(goldmark.WithExtensions(extension.Table, extension.Strikethrough, extension.TaskList))
	if err := markdown.Convert([]byte(text), &rendered); err != nil {
		return "", err
	}
	return template.HTML(rendered.String()), nil
}
`,blocks:[{startLine:54,startColumn:2,endLine:55,endColumn:72,statements:2,count:0},{startLine:56,startColumn:3,endLine:57,endColumn:1,statements:1,count:0},{startLine:58,startColumn:2,endLine:60,endColumn:28,statements:3,count:0},{startLine:61,startColumn:3,endLine:62,endColumn:15,statements:2,count:0},{startLine:63,startColumn:4,endLine:64,endColumn:1,statements:1,count:0},{startLine:65,startColumn:3,endLine:67,endColumn:25,statements:3,count:0},{startLine:68,startColumn:4,endLine:69,endColumn:1,statements:1,count:0},{startLine:70,startColumn:3,endLine:71,endColumn:17,statements:2,count:0},{startLine:72,startColumn:4,endLine:73,endColumn:1,statements:1,count:0},{startLine:74,startColumn:3,endLine:74,endColumn:102,statements:1,count:0},{startLine:76,startColumn:2,endLine:76,endColumn:18,statements:1,count:0},{startLine:79,startColumn:2,endLine:80,endColumn:16,statements:2,count:0},{startLine:81,startColumn:3,endLine:82,endColumn:1,statements:1,count:0},{startLine:83,startColumn:2,endLine:84,endColumn:16,statements:2,count:0},{startLine:85,startColumn:3,endLine:86,endColumn:1,statements:1,count:0},{startLine:87,startColumn:2,endLine:88,endColumn:91,statements:2,count:0},{startLine:89,startColumn:3,endLine:90,endColumn:1,statements:1,count:0},{startLine:91,startColumn:2,endLine:91,endColumn:32,statements:1,count:0},{startLine:92,startColumn:3,endLine:93,endColumn:1,statements:1,count:0},{startLine:94,startColumn:2,endLine:94,endColumn:25,statements:1,count:0},{startLine:95,startColumn:3,endLine:95,endColumn:29,statements:1,count:0},{startLine:96,startColumn:4,endLine:97,endColumn:1,statements:1,count:0},{startLine:98,startColumn:3,endLine:98,endColumn:29,statements:1,count:0},{startLine:99,startColumn:4,endLine:100,endColumn:1,statements:1,count:0},{startLine:101,startColumn:3,endLine:102,endColumn:90,statements:2,count:0},{startLine:103,startColumn:4,endLine:104,endColumn:1,statements:1,count:0},{startLine:105,startColumn:3,endLine:105,endColumn:88,statements:1,count:0},{startLine:106,startColumn:4,endLine:107,endColumn:1,statements:1,count:0},{startLine:109,startColumn:2,endLine:112,endColumn:1,statements:1,count:0},{startLine:113,startColumn:2,endLine:113,endColumn:83,statements:1,count:0},{startLine:114,startColumn:3,endLine:115,endColumn:1,statements:1,count:0},{startLine:116,startColumn:2,endLine:116,endColumn:69,statements:1,count:0},{startLine:117,startColumn:3,endLine:118,endColumn:1,statements:1,count:0},{startLine:119,startColumn:2,endLine:120,endColumn:16,statements:2,count:0},{startLine:121,startColumn:3,endLine:122,endColumn:1,statements:1,count:0},{startLine:123,startColumn:2,endLine:123,endColumn:27,statements:1,count:0},{startLine:124,startColumn:3,endLine:125,endColumn:1,statements:1,count:0},{startLine:126,startColumn:2,endLine:126,endColumn:145,statements:1,count:0},{startLine:127,startColumn:3,endLine:128,endColumn:17,statements:2,count:0},{startLine:129,startColumn:4,endLine:130,endColumn:1,statements:1,count:0},{startLine:131,startColumn:3,endLine:131,endColumn:71,statements:1,count:0},{startLine:132,startColumn:4,endLine:133,endColumn:1,statements:1,count:0},{startLine:135,startColumn:2,endLine:135,endColumn:50,statements:1,count:0},{startLine:138,startColumn:2,endLine:139,endColumn:16,statements:2,count:0},{startLine:140,startColumn:3,endLine:141,endColumn:1,statements:1,count:0},{startLine:142,startColumn:2,endLine:143,endColumn:16,statements:2,count:0},{startLine:144,startColumn:3,endLine:145,endColumn:1,statements:1,count:0},{startLine:146,startColumn:2,endLine:146,endColumn:71,statements:1,count:0},{startLine:147,startColumn:3,endLine:148,endColumn:1,statements:1,count:0},{startLine:149,startColumn:2,endLine:150,endColumn:74,statements:2,count:0},{startLine:151,startColumn:3,endLine:152,endColumn:1,statements:1,count:0},{startLine:153,startColumn:2,endLine:153,endColumn:33,statements:1,count:0},{startLine:154,startColumn:3,endLine:154,endColumn:30,statements:1,count:0},{startLine:155,startColumn:4,endLine:156,endColumn:1,statements:1,count:0},{startLine:158,startColumn:2,endLine:158,endColumn:84,statements:1,count:0},{startLine:159,startColumn:3,endLine:161,endColumn:1,statements:2,count:0},{startLine:162,startColumn:2,endLine:162,endColumn:32,statements:1,count:0},{startLine:163,startColumn:3,endLine:164,endColumn:1,statements:1,count:0},{startLine:165,startColumn:2,endLine:165,endColumn:43,statements:1,count:0},{startLine:165,startColumn:45,endLine:165,endColumn:85,statements:1,count:0},{startLine:166,startColumn:2,endLine:166,endColumn:48,statements:1,count:0},{startLine:167,startColumn:3,endLine:168,endColumn:1,statements:1,count:0},{startLine:169,startColumn:2,endLine:170,endColumn:16,statements:2,count:0},{startLine:171,startColumn:3,endLine:172,endColumn:1,statements:1,count:0},{startLine:173,startColumn:2,endLine:173,endColumn:23,statements:1,count:0},{startLine:174,startColumn:3,endLine:175,endColumn:1,statements:1,count:0},{startLine:176,startColumn:2,endLine:176,endColumn:95,statements:1,count:0},{startLine:176,startColumn:97,endLine:176,endColumn:128,statements:1,count:0},{startLine:177,startColumn:2,endLine:177,endColumn:16,statements:1,count:0},{startLine:178,startColumn:3,endLine:179,endColumn:1,statements:1,count:0},{startLine:180,startColumn:2,endLine:180,endColumn:248,statements:1,count:0},{startLine:181,startColumn:3,endLine:183,endColumn:89,statements:3,count:0},{startLine:184,startColumn:4,endLine:185,endColumn:1,statements:1,count:0},{startLine:186,startColumn:3,endLine:187,endColumn:17,statements:2,count:0},{startLine:188,startColumn:4,endLine:189,endColumn:1,statements:1,count:0},{startLine:190,startColumn:3,endLine:192,endColumn:58,statements:3,count:0},{startLine:193,startColumn:4,endLine:194,endColumn:1,statements:1,count:0},{startLine:196,startColumn:2,endLine:196,endColumn:56,statements:1,count:0},{startLine:197,startColumn:3,endLine:198,endColumn:17,statements:2,count:0},{startLine:199,startColumn:4,endLine:200,endColumn:1,statements:1,count:0},{startLine:201,startColumn:3,endLine:201,endColumn:74,statements:1,count:0},{startLine:202,startColumn:4,endLine:203,endColumn:1,statements:1,count:0},{startLine:204,startColumn:3,endLine:204,endColumn:84,statements:1,count:0},{startLine:205,startColumn:4,endLine:206,endColumn:1,statements:1,count:0},{startLine:208,startColumn:2,endLine:209,endColumn:16,statements:2,count:0},{startLine:210,startColumn:3,endLine:211,endColumn:1,statements:1,count:0},{startLine:212,startColumn:2,endLine:212,endColumn:84,statements:1,count:0},{startLine:213,startColumn:3,endLine:214,endColumn:1,statements:1,count:0},{startLine:217,startColumn:2,endLine:226,endColumn:166,statements:1,count:0},{startLine:227,startColumn:3,endLine:227,endColumn:84,statements:1,count:0},{startLine:228,startColumn:4,endLine:229,endColumn:1,statements:1,count:0},{startLine:231,startColumn:2,endLine:231,endColumn:89,statements:1,count:0},{startLine:232,startColumn:3,endLine:233,endColumn:1,statements:1,count:0},{startLine:234,startColumn:2,endLine:234,endColumn:82,statements:1,count:0},{startLine:235,startColumn:3,endLine:236,endColumn:1,statements:1,count:0},{startLine:237,startColumn:2,endLine:237,endColumn:48,statements:1,count:0},{startLine:238,startColumn:3,endLine:239,endColumn:1,statements:1,count:0},{startLine:240,startColumn:2,endLine:240,endColumn:24,statements:1,count:0},{startLine:243,startColumn:2,endLine:243,endColumn:25,statements:1,count:0},{startLine:244,startColumn:3,endLine:246,endColumn:17,statements:3,count:0},{startLine:247,startColumn:4,endLine:248,endColumn:1,statements:1,count:0},{startLine:249,startColumn:3,endLine:251,endColumn:31,statements:3,count:0},{startLine:252,startColumn:4,endLine:253,endColumn:38,statements:2,count:0},{startLine:254,startColumn:5,endLine:254,endColumn:57,statements:1,count:0},{startLine:255,startColumn:6,endLine:256,endColumn:1,statements:1,count:0},{startLine:258,startColumn:4,endLine:258,endColumn:52,statements:1,count:0},{startLine:259,startColumn:5,endLine:260,endColumn:1,statements:1,count:0},{startLine:261,startColumn:4,endLine:261,endColumn:45,statements:1,count:0},{startLine:263,startColumn:3,endLine:263,endColumn:36,statements:1,count:0},{startLine:264,startColumn:4,endLine:265,endColumn:18,statements:2,count:0},{startLine:266,startColumn:5,endLine:267,endColumn:1,statements:1,count:0},{startLine:268,startColumn:4,endLine:268,endColumn:140,statements:1,count:0},{startLine:270,startColumn:3,endLine:271,endColumn:36,statements:2,count:0},{startLine:272,startColumn:4,endLine:273,endColumn:11,statements:2,count:0},{startLine:274,startColumn:5,endLine:275,endColumn:1,statements:1,count:0},{startLine:276,startColumn:4,endLine:276,endColumn:76,statements:1,count:0},{startLine:278,startColumn:3,endLine:278,endColumn:31,statements:1,count:0},{startLine:279,startColumn:4,endLine:280,endColumn:33,statements:2,count:0},{startLine:281,startColumn:5,endLine:282,endColumn:1,statements:1,count:0},{startLine:283,startColumn:4,endLine:283,endColumn:40,statements:1,count:0},{startLine:285,startColumn:3,endLine:285,endColumn:32,statements:1,count:0},{startLine:287,startColumn:2,endLine:287,endColumn:12,statements:1,count:0},{startLine:290,startColumn:2,endLine:291,endColumn:16,statements:2,count:0},{startLine:292,startColumn:3,endLine:293,endColumn:1,statements:1,count:0},{startLine:294,startColumn:2,endLine:294,endColumn:51,statements:1,count:0},{startLine:297,startColumn:2,endLine:298,endColumn:85,statements:2,count:1},{startLine:299,startColumn:3,endLine:299,endColumn:17,statements:1,count:2},{startLine:300,startColumn:4,endLine:301,endColumn:1,statements:1,count:0},{startLine:302,startColumn:3,endLine:302,endColumn:17,statements:1,count:2},{startLine:303,startColumn:4,endLine:304,endColumn:18,statements:2,count:1},{startLine:305,startColumn:5,endLine:306,endColumn:1,statements:1,count:0},{startLine:307,startColumn:4,endLine:307,endColumn:27,statements:1,count:1},{startLine:308,startColumn:5,endLine:309,endColumn:1,statements:1,count:1},{startLine:311,startColumn:3,endLine:311,endColumn:13,statements:1,count:2},{startLine:313,startColumn:3,endLine:314,endColumn:1,statements:1,count:0},{startLine:315,startColumn:2,endLine:317,endColumn:29,statements:3,count:1},{startLine:318,startColumn:3,endLine:319,endColumn:17,statements:2,count:1},{startLine:320,startColumn:4,endLine:321,endColumn:1,statements:1,count:0},{startLine:322,startColumn:3,endLine:322,endColumn:43,statements:1,count:1},{startLine:324,startColumn:2,endLine:324,endColumn:83,statements:1,count:1},{startLine:328,startColumn:2,endLine:330,endColumn:66,statements:3,count:0},{startLine:331,startColumn:3,endLine:332,endColumn:1,statements:1,count:0},{startLine:333,startColumn:2,endLine:333,endColumn:46,statements:1,count:0}]},{path:`tools/requirements-site/evidence.go`,sha256:`fdcd288cccac2139dc428cfff85a7a124d644d070428975d6663181f7b68c00f`,source:`package main

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

const repository = "https://github.com/newdarwindev/firm-payments"
const module = "github.com/newdarwindev/firm-payments"

var shaPattern = regexp.MustCompile(\`^[a-f0-9]{40}$\`)

type artifact struct {
	Kind, Name, URL, Directory string
	ID                         int64
}
type workflow struct {
	Name, URL, SHA, Conclusion string
	ID                         int64
}
type evidence struct {
	Mode, SHA, VerifiedAt string
	Service, Conversation workflow
	Artifacts             []artifact
}
type result struct {
	Suite, Name, Package, Asserts, Status, SourceURL, ArtifactURL, Anchor string
	Assertions                                                            []assertionSource
	Seconds                                                               float64
}
type inputData struct {
	Evidence  evidence
	Results   []result
	Coverage  float64
	Artifacts map[string]artifact
	Checks    map[string]check
}
type check struct{ ID, Title, Status, Detail, RunURL, ArtifactURL string }

func readJSON(path string, value any) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, value)
}
func fileHash(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer func() { _ = f.Close() }()
	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}
func verifyChecksums(root string) error {
	b, err := os.ReadFile(filepath.Join(root, "SHA256SUMS"))
	if err != nil {
		return err
	}
	listed := map[string]bool{}
	for _, line := range strings.Split(strings.TrimSpace(string(b)), "\\n") {
		if len(line) < 67 {
			return errors.New("invalid checksum manifest")
		}
		want, name := line[:64], strings.TrimPrefix(line[66:], "./")
		if _, err := hex.DecodeString(want); err != nil {
			return err
		}
		if !filepath.IsLocal(name) || listed[name] || strings.Contains(name, "\\\\") {
			return errors.New("unsafe or duplicate artifact path")
		}
		info, err := os.Lstat(filepath.Join(root, name))
		if err != nil {
			return err
		}
		if !info.Mode().IsRegular() {
			return errors.New("artifact links are forbidden")
		}
		got, err := fileHash(filepath.Join(root, name))
		if err != nil {
			return err
		}
		if got != want {
			return fmt.Errorf("checksum mismatch: %s", name)
		}
		listed[name] = true
	}
	if len(listed) == 0 {
		return errors.New("empty checksum manifest")
	}
	return filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		rel, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		if rel != "SHA256SUMS" && !listed[filepath.ToSlash(rel)] {
			return fmt.Errorf("unlisted artifact file: %s", rel)
		}
		return nil
	})
}
func loadInputs(root, input, revision string) (inputData, error) {
	data, err := loadProvenance(root, input, revision)
	if err != nil {
		return data, err
	}
	for _, load := range []func() error{
		func() error { return loadFunctional(root, input, revision, &data) },
		func() error { return loadCoverage(input, &data) },
		func() error { return loadChecks(input, &data) },
	} {
		if err := load(); err != nil {
			return data, err
		}
	}
	return data, nil
}
func loadProvenance(root, input, revision string) (inputData, error) {
	var data inputData
	if err := readJSON(filepath.Join(input, "evidence.json"), &data.Evidence); err != nil {
		return data, err
	}
	e := data.Evidence
	if !shaPattern.MatchString(revision) || e.SHA != revision || (e.Mode != "hosted" && e.Mode != "local") {
		return data, errors.New("evidence revision/mode mismatch")
	}
	for _, w := range []workflow{e.Service, e.Conversation} {
		if w.SHA != revision || w.Conclusion != "success" || w.ID <= 0 || !strings.HasPrefix(w.URL, repository+"/actions/runs/") {
			return data, errors.New("both exact-revision workflows must have succeeded")
		}
	}
	data.Artifacts = map[string]artifact{}
	allowed := map[string]bool{"service": true, "functional": true, "coverage": true, "conversation": true}
	for _, a := range e.Artifacts {
		if !allowed[a.Kind] || data.Artifacts[a.Kind].Kind != "" || !filepath.IsLocal(a.Directory) || a.ID <= 0 || !strings.HasPrefix(a.URL, repository+"/actions/runs/") {
			return data, errors.New("invalid artifact provenance")
		}
		if err := verifyChecksums(filepath.Join(input, a.Directory)); err != nil {
			return data, fmt.Errorf("%s: %w", a.Kind, err)
		}
		prefix := map[string]string{"service": "service-checks", "functional": "functional-tests", "coverage": "test-coverage", "conversation": "conversation-docs"}[a.Kind]
		runID := e.Service.ID
		if a.Kind == "conversation" {
			runID = e.Conversation.ID
		}
		expectedURL := fmt.Sprintf("%s/actions/runs/%d/artifacts/%d", repository, runID, a.ID)
		if a.Name != prefix+"-"+revision || a.URL != expectedURL {
			return data, errors.New("artifact name or run does not match source revision")
		}
		data.Artifacts[a.Kind] = a
	}
	if len(data.Artifacts) != 4 {
		return data, errors.New("all four evidence artifacts are required")
	}
	return data, nil
}

func loadFunctional(root, input, revision string, data *inputData) error {
	var functional struct {
		Revision      string \`json:"revision"\`
		Passed, Total int
		PackagePassed bool \`json:"package_passed"\`
		Cases         []struct {
			Name, Asserts, Status string
			Seconds               float64
		}
	}
	if err := readJSON(filepath.Join(input, data.Artifacts["functional"].Directory, "results.json"), &functional); err != nil {
		return err
	}
	var catalogue []struct{ Name, Asserts string }
	if err := readJSON(filepath.Join(root, "testdata/functional-cases.json"), &catalogue); err != nil {
		return err
	}
	if functional.Revision != revision || !functional.PackagePassed || functional.Passed != len(catalogue) || functional.Total != len(catalogue) || len(functional.Cases) != len(catalogue) {
		return errors.New("functional result set incomplete or stale")
	}
	for i, c := range functional.Cases {
		if c.Name != catalogue[i].Name || c.Asserts != catalogue[i].Asserts || c.Status != "pass" {
			return errors.New("functional catalogue/results mismatch")
		}
		line, err := sourceLine(root, "tests/functional/payments_test.go", c.Name)
		if err != nil {
			return err
		}
		data.Results = append(data.Results, result{Suite: "functional", Name: c.Name, Asserts: c.Asserts, Status: c.Status, Seconds: c.Seconds, SourceURL: sourceURL(revision, "tests/functional/payments_test.go", line), ArtifactURL: data.Artifacts["functional"].URL, Anchor: anchor("functional-" + c.Name)})
	}
	for _, item := range []struct{ suite, kind, file string }{{"unit", "service", "unit-tests.jsonl"}, {"exporter", "conversation", "exporter-tests.jsonl"}} {
		a := data.Artifacts[item.kind]
		records, err := readEvents(filepath.Join(input, a.Directory, item.file), item.suite, root, revision, a.URL)
		if err != nil {
			return err
		}
		data.Results = append(data.Results, records...)
	}
	return nil
}

func loadCoverage(input string, data *inputData) error {
	var coverage []struct {
		Name                string
		Statements, Covered int64
		Percent             float64
	}
	if err := readJSON(filepath.Join(input, data.Artifacts["coverage"].Directory, "summary.json"), &coverage); err != nil {
		return err
	}
	found := false
	for _, c := range coverage {
		if c.Name == "application-union" {
			if c.Statements <= 0 || c.Covered < 0 || c.Covered > c.Statements {
				return errors.New("invalid coverage counters")
			}
			data.Coverage = 100 * float64(c.Covered) / float64(c.Statements)
			if delta := data.Coverage - c.Percent; delta > 0.00001 || delta < -0.00001 {
				return errors.New("coverage percentage does not match counters")
			}
			found = true
		}
	}
	if !found {
		return errors.New("application coverage is missing")
	}
	return nil
}

func loadChecks(input string, data *inputData) error {
	e := data.Evidence
	data.Checks = map[string]check{}
	require := func(kind, path, contains string) error {
		b, err := os.ReadFile(filepath.Join(input, data.Artifacts[kind].Directory, path))
		if err != nil {
			return err
		}
		if contains != "" && !strings.Contains(string(b), contains) {
			return fmt.Errorf("missing verification marker: %s", path)
		}
		if len(b) == 0 {
			return fmt.Errorf("empty evidence file: %s", path)
		}
		return nil
	}
	for _, entry := range []struct{ id, title, kind, path, marker, detail string }{
		{"database", "PostgreSQL schema, constraints and original seed", "service", "database.log", "Original sample committed", "Schema/constraint SQL completed before the process acceptance sample."},
		{"containers", "Container build and sample acceptance", "service", "container-status.txt", "acceptance passed", "Both images built and the original sample produced the expected balances and rows."},
		{"readme", "README and contract validation", "service", "openapi.json", "\\"errors\\": 0", "Successful Service CI ran Markdown, shell, workflow and OpenAPI checks. Editorial quality remains a human judgment."},
		{"security", "Go dependency vulnerability checks", "service", "vulnerabilities.log", "No vulnerabilities found.", "The recorded Go scan reported no applicable vulnerabilities; this is not a production security certification."},
		{"conversation", "Original conversation preservation and dark PDF", "conversation", "conversation.tex", "use theme=ChatGPT-classical-dark", "Exporter cases, archive checksums and the successful PDF workflow verify the preserved snapshot."},
	} {
		if err := require(entry.kind, entry.path, entry.marker); err != nil {
			return err
		}
		run := e.Service.URL
		if entry.kind == "conversation" {
			run = e.Conversation.URL
		}
		data.Checks[entry.id] = check{entry.id, entry.title, "pass", entry.detail, run, data.Artifacts[entry.kind].URL}
	}
	for _, service := range []string{"payments-api", "ledger-service"} {
		for _, arch := range []string{"amd64", "arm64"} {
			if err := require("service", "bin/"+service+"-linux-"+arch, ""); err != nil {
				return err
			}
		}
	}
	data.Checks["distribution"] = check{"distribution", "Go service distribution builds", "pass", "Both services were built for Linux amd64 and arm64.", e.Service.URL, data.Artifacts["service"].URL}
	return nil
}

type goEvent struct {
	Action, Package, Test, Output string
	Elapsed                       float64
}

func readEvents(path, suite, root, revision, artifactURL string) ([]result, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer func() { _ = file.Close() }()
	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 4096), 8<<20)
	records := map[string]result{}
	complete := map[string]bool{}
	for scanner.Scan() {
		var e goEvent
		if err := json.Unmarshal(scanner.Bytes(), &e); err != nil {
			return nil, err
		}
		if e.Action == "fail" || (e.Test != "" && e.Action == "skip") {
			return nil, errors.New("failed or skipped evidence test")
		}
		if e.Test == "" && e.Action == "pass" {
			complete[e.Package] = true
		}
		if e.Test != "" && e.Action == "pass" {
			key := e.Package + "::" + e.Test
			if _, exists := records[key]; exists {
				return nil, errors.New("duplicate result event")
			}
			records[key] = result{Suite: suite, Name: e.Test, Package: e.Package, Status: "pass", Seconds: e.Elapsed, ArtifactURL: artifactURL, Anchor: anchor(suite + "-" + key)}
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, errors.New("empty test result stream")
	}
	keys := make([]string, 0, len(records))
	for key := range records {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	out := []result{}
	for _, key := range keys {
		r := records[key]
		if !complete[r.Package] {
			return nil, errors.New("test package has no successful completion")
		}
		dir := strings.TrimPrefix(r.Package, module+"/")
		if dir == r.Package || !filepath.IsLocal(dir) {
			return nil, errors.New("unexpected test package")
		}
		files, err := filepath.Glob(filepath.Join(root, dir, "*_test.go"))
		if err != nil {
			return nil, err
		}
		symbol := strings.Split(r.Name, "/")[0]
		for _, file := range files {
			relative, err := filepath.Rel(root, file)
			if err != nil {
				return nil, err
			}
			line, err := sourceLine(root, relative, symbol)
			if err == nil {
				r.SourceURL = sourceURL(revision, filepath.ToSlash(relative), line)
				break
			}
		}
		if r.SourceURL == "" {
			return nil, fmt.Errorf("test source not found: %s", key)
		}
		out = append(out, r)
	}
	return out, nil
}
func anchor(s string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(s) {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		} else {
			b.WriteByte('-')
		}
	}
	return strings.Trim(b.String(), "-")
}
func sourceURL(revision, path string, line int) string {
	return repository + "/blob/" + revision + "/" + filepath.ToSlash(path) + "#L" + strconv.Itoa(line)
}
func sourceLine(root, path, symbol string) (int, error) {
	if !filepath.IsLocal(path) {
		return 0, errors.New("source path escapes checkout")
	}
	b, err := os.ReadFile(filepath.Join(root, path))
	if err != nil {
		return 0, err
	}
	if symbol == "" {
		return 1, nil
	}
	if strings.HasPrefix(symbol, "text:") {
		for i, line := range strings.Split(string(b), "\\n") {
			if strings.Contains(line, strings.TrimPrefix(symbol, "text:")) {
				return i + 1, nil
			}
		}
		return 0, errors.New("text reference not found")
	}
	if strings.HasSuffix(path, ".go") {
		fset := token.NewFileSet()
		file, err := parser.ParseFile(fset, path, b, 0)
		if err != nil {
			return 0, err
		}
		line := 0
		ast.Inspect(file, func(node ast.Node) bool {
			switch n := node.(type) {
			case *ast.FuncDecl:
				if n.Name.Name == symbol {
					line = fset.Position(n.Pos()).Line
				}
			case *ast.KeyValueExpr:
				if key, ok := n.Key.(*ast.BasicLit); ok && key.Kind == token.STRING {
					value, err := strconv.Unquote(key.Value)
					if err == nil && value == symbol {
						line = fset.Position(key.Pos()).Line
					}
				}
			}
			return true
		})
		if line > 0 {
			return line, nil
		}
	}
	return 0, fmt.Errorf("source symbol not found: %s / %s", path, symbol)
}
`,blocks:[{startLine:55,startColumn:2,endLine:56,endColumn:16,statements:2,count:0},{startLine:57,startColumn:3,endLine:58,endColumn:1,statements:1,count:0},{startLine:59,startColumn:2,endLine:59,endColumn:33,statements:1,count:0},{startLine:62,startColumn:2,endLine:63,endColumn:16,statements:2,count:4},{startLine:64,startColumn:3,endLine:65,endColumn:1,statements:1,count:0},{startLine:66,startColumn:2,endLine:66,endColumn:15,statements:1,count:4},{startLine:66,startColumn:17,endLine:66,endColumn:32,statements:1,count:4},{startLine:67,startColumn:2,endLine:68,endColumn:41,statements:2,count:4},{startLine:69,startColumn:3,endLine:70,endColumn:1,statements:1,count:0},{startLine:71,startColumn:2,endLine:71,endColumn:44,statements:1,count:4},{startLine:74,startColumn:2,endLine:75,endColumn:16,statements:2,count:3},{startLine:76,startColumn:3,endLine:77,endColumn:1,statements:1,count:0},{startLine:78,startColumn:2,endLine:79,endColumn:73,statements:2,count:3},{startLine:80,startColumn:3,endLine:80,endColumn:21,statements:1,count:3},{startLine:81,startColumn:4,endLine:82,endColumn:1,statements:1,count:0},{startLine:83,startColumn:3,endLine:84,endColumn:51,statements:2,count:3},{startLine:85,startColumn:4,endLine:86,endColumn:1,statements:1,count:0},{startLine:87,startColumn:3,endLine:87,endColumn:78,statements:1,count:3},{startLine:88,startColumn:4,endLine:89,endColumn:1,statements:1,count:0},{startLine:90,startColumn:3,endLine:91,endColumn:17,statements:2,count:3},{startLine:92,startColumn:4,endLine:93,endColumn:1,statements:1,count:0},{startLine:94,startColumn:3,endLine:94,endColumn:31,statements:1,count:3},{startLine:95,startColumn:4,endLine:96,endColumn:1,statements:1,count:0},{startLine:97,startColumn:3,endLine:98,endColumn:17,statements:2,count:3},{startLine:99,startColumn:4,endLine:100,endColumn:1,statements:1,count:0},{startLine:101,startColumn:3,endLine:101,endColumn:18,statements:1,count:3},{startLine:102,startColumn:4,endLine:103,endColumn:1,statements:1,count:1},{startLine:104,startColumn:3,endLine:104,endColumn:22,statements:1,count:2},{startLine:106,startColumn:2,endLine:106,endColumn:22,statements:1,count:2},{startLine:107,startColumn:3,endLine:108,endColumn:1,statements:1,count:0},{startLine:109,startColumn:2,endLine:109,endColumn:82,statements:1,count:2},{startLine:110,startColumn:3,endLine:110,endColumn:17,statements:1,count:6},{startLine:111,startColumn:4,endLine:112,endColumn:1,statements:1,count:0},{startLine:113,startColumn:3,endLine:113,endColumn:16,statements:1,count:6},{startLine:114,startColumn:4,endLine:115,endColumn:1,statements:1,count:2},{startLine:116,startColumn:3,endLine:117,endColumn:17,statements:2,count:4},{startLine:118,startColumn:4,endLine:119,endColumn:1,statements:1,count:0},{startLine:120,startColumn:3,endLine:120,endColumn:60,statements:1,count:4},{startLine:121,startColumn:4,endLine:122,endColumn:1,statements:1,count:1},{startLine:123,startColumn:3,endLine:123,endColumn:13,statements:1,count:3},{startLine:127,startColumn:2,endLine:128,endColumn:16,statements:2,count:0},{startLine:129,startColumn:3,endLine:130,endColumn:1,statements:1,count:0},{startLine:131,startColumn:2,endLine:132,endColumn:16,statements:1,count:0},{startLine:132,startColumn:18,endLine:132,endColumn:71,statements:1,count:0},{startLine:133,startColumn:18,endLine:133,endColumn:53,statements:1,count:0},{startLine:134,startColumn:18,endLine:134,endColumn:51,statements:1,count:0},{startLine:136,startColumn:3,endLine:136,endColumn:32,statements:1,count:0},{startLine:137,startColumn:4,endLine:138,endColumn:1,statements:1,count:0},{startLine:140,startColumn:2,endLine:140,endColumn:18,statements:1,count:0},{startLine:143,startColumn:2,endLine:144,endColumn:88,statements:2,count:0},{startLine:145,startColumn:3,endLine:146,endColumn:1,statements:1,count:0},{startLine:147,startColumn:2,endLine:148,endColumn:105,statements:2,count:0},{startLine:149,startColumn:3,endLine:150,endColumn:1,statements:1,count:0},{startLine:151,startColumn:2,endLine:151,endColumn:58,statements:1,count:0},{startLine:152,startColumn:3,endLine:152,endColumn:124,statements:1,count:0},{startLine:153,startColumn:4,endLine:154,endColumn:1,statements:1,count:0},{startLine:156,startColumn:2,endLine:158,endColumn:32,statements:3,count:0},{startLine:159,startColumn:3,endLine:159,endColumn:165,statements:1,count:0},{startLine:160,startColumn:4,endLine:161,endColumn:1,statements:1,count:0},{startLine:162,startColumn:3,endLine:162,endColumn:76,statements:1,count:0},{startLine:163,startColumn:4,endLine:164,endColumn:1,statements:1,count:0},{startLine:165,startColumn:3,endLine:167,endColumn:31,statements:3,count:0},{startLine:168,startColumn:4,endLine:169,endColumn:1,statements:1,count:0},{startLine:170,startColumn:3,endLine:171,endColumn:60,statements:2,count:0},{startLine:172,startColumn:4,endLine:173,endColumn:1,statements:1,count:0},{startLine:174,startColumn:3,endLine:174,endColumn:29,statements:1,count:0},{startLine:176,startColumn:2,endLine:176,endColumn:30,statements:1,count:0},{startLine:177,startColumn:3,endLine:178,endColumn:1,statements:1,count:0},{startLine:179,startColumn:2,endLine:179,endColumn:18,statements:1,count:0},{startLine:183,startColumn:2,endLine:190,endColumn:1,statements:1,count:0},{startLine:192,startColumn:2,endLine:192,endColumn:124,statements:1,count:0},{startLine:193,startColumn:3,endLine:194,endColumn:1,statements:1,count:0},{startLine:195,startColumn:2,endLine:196,endColumn:100,statements:2,count:0},{startLine:197,startColumn:3,endLine:198,endColumn:1,statements:1,count:0},{startLine:199,startColumn:2,endLine:199,endColumn:186,statements:1,count:0},{startLine:200,startColumn:3,endLine:201,endColumn:1,statements:1,count:0},{startLine:202,startColumn:2,endLine:202,endColumn:37,statements:1,count:0},{startLine:203,startColumn:3,endLine:203,endColumn:93,statements:1,count:0},{startLine:204,startColumn:4,endLine:205,endColumn:1,statements:1,count:0},{startLine:206,startColumn:3,endLine:207,endColumn:17,statements:2,count:0},{startLine:208,startColumn:4,endLine:209,endColumn:1,statements:1,count:0},{startLine:210,startColumn:3,endLine:210,endColumn:301,statements:1,count:0},{startLine:212,startColumn:2,endLine:212,endColumn:155,statements:1,count:0},{startLine:213,startColumn:3,endLine:215,endColumn:17,statements:3,count:0},{startLine:216,startColumn:4,endLine:217,endColumn:1,statements:1,count:0},{startLine:218,startColumn:3,endLine:218,endColumn:50,statements:1,count:0},{startLine:220,startColumn:2,endLine:220,endColumn:12,statements:1,count:0},{startLine:224,startColumn:2,endLine:228,endColumn:1,statements:1,count:0},{startLine:229,startColumn:2,endLine:229,endColumn:120,statements:1,count:0},{startLine:230,startColumn:3,endLine:231,endColumn:1,statements:1,count:0},{startLine:232,startColumn:2,endLine:233,endColumn:29,statements:2,count:0},{startLine:234,startColumn:3,endLine:234,endColumn:36,statements:1,count:0},{startLine:235,startColumn:4,endLine:235,endColumn:70,statements:1,count:0},{startLine:236,startColumn:5,endLine:237,endColumn:1,statements:1,count:0},{startLine:238,startColumn:4,endLine:239,endColumn:79,statements:2,count:0},{startLine:240,startColumn:5,endLine:241,endColumn:1,statements:1,count:0},{startLine:242,startColumn:4,endLine:242,endColumn:16,statements:1,count:0},{startLine:245,startColumn:2,endLine:245,endColumn:12,statements:1,count:0},{startLine:246,startColumn:3,endLine:247,endColumn:1,statements:1,count:0},{startLine:248,startColumn:2,endLine:248,endColumn:12,statements:1,count:0},{startLine:252,startColumn:2,endLine:254,endColumn:53,statements:3,count:0},{startLine:255,startColumn:3,endLine:256,endColumn:17,statements:2,count:0},{startLine:257,startColumn:4,endLine:258,endColumn:1,statements:1,count:0},{startLine:259,startColumn:3,endLine:259,endColumn:63,statements:1,count:0},{startLine:260,startColumn:4,endLine:261,endColumn:1,statements:1,count:0},{startLine:262,startColumn:3,endLine:262,endColumn:18,statements:1,count:0},{startLine:263,startColumn:4,endLine:264,endColumn:1,statements:1,count:0},{startLine:265,startColumn:3,endLine:265,endColumn:13,statements:1,count:0},{startLine:267,startColumn:2,endLine:273,endColumn:1,statements:1,count:0},{startLine:274,startColumn:3,endLine:274,endColumn:71,statements:1,count:0},{startLine:275,startColumn:4,endLine:276,endColumn:1,statements:1,count:0},{startLine:277,startColumn:3,endLine:278,endColumn:35,statements:2,count:0},{startLine:279,startColumn:4,endLine:280,endColumn:1,statements:1,count:0},{startLine:281,startColumn:3,endLine:281,endColumn:114,statements:1,count:0},{startLine:283,startColumn:2,endLine:283,endColumn:69,statements:1,count:0},{startLine:284,startColumn:3,endLine:284,endColumn:51,statements:1,count:0},{startLine:285,startColumn:4,endLine:285,endColumn:80,statements:1,count:0},{startLine:286,startColumn:5,endLine:287,endColumn:1,statements:1,count:0},{startLine:290,startColumn:2,endLine:291,endColumn:12,statements:2,count:0},{startLine:300,startColumn:2,endLine:301,endColumn:16,statements:2,count:0},{startLine:302,startColumn:3,endLine:303,endColumn:1,statements:1,count:0},{startLine:304,startColumn:2,endLine:304,endColumn:15,statements:1,count:0},{startLine:304,startColumn:17,endLine:304,endColumn:35,statements:1,count:0},{startLine:305,startColumn:2,endLine:309,endColumn:21,statements:5,count:0},{startLine:310,startColumn:3,endLine:311,endColumn:61,statements:2,count:0},{startLine:312,startColumn:4,endLine:313,endColumn:1,statements:1,count:0},{startLine:314,startColumn:3,endLine:314,endColumn:65,statements:1,count:0},{startLine:315,startColumn:4,endLine:316,endColumn:1,statements:1,count:0},{startLine:317,startColumn:3,endLine:317,endColumn:41,statements:1,count:0},{startLine:318,startColumn:4,endLine:319,endColumn:1,statements:1,count:0},{startLine:320,startColumn:3,endLine:320,endColumn:41,statements:1,count:0},{startLine:321,startColumn:4,endLine:322,endColumn:41,statements:2,count:0},{startLine:323,startColumn:5,endLine:324,endColumn:1,statements:1,count:0},{startLine:325,startColumn:4,endLine:325,endColumn:170,statements:1,count:0},{startLine:328,startColumn:2,endLine:328,endColumn:38,statements:1,count:0},{startLine:329,startColumn:3,endLine:330,endColumn:1,statements:1,count:0},{startLine:331,startColumn:2,endLine:331,endColumn:23,statements:1,count:0},{startLine:332,startColumn:3,endLine:333,endColumn:1,statements:1,count:0},{startLine:334,startColumn:2,endLine:335,endColumn:27,statements:2,count:0},{startLine:336,startColumn:3,endLine:337,endColumn:1,statements:1,count:0},{startLine:338,startColumn:2,endLine:340,endColumn:27,statements:3,count:0},{startLine:341,startColumn:3,endLine:342,endColumn:27,statements:2,count:0},{startLine:343,startColumn:4,endLine:344,endColumn:1,statements:1,count:0},{startLine:345,startColumn:3,endLine:346,endColumn:49,statements:2,count:0},{startLine:347,startColumn:4,endLine:348,endColumn:1,statements:1,count:0},{startLine:349,startColumn:3,endLine:350,endColumn:17,statements:2,count:0},{startLine:351,startColumn:4,endLine:352,endColumn:1,statements:1,count:0},{startLine:353,startColumn:3,endLine:354,endColumn:30,statements:2,count:0},{startLine:355,startColumn:4,endLine:356,endColumn:18,statements:2,count:0},{startLine:357,startColumn:5,endLine:358,endColumn:1,statements:1,count:0},{startLine:359,startColumn:4,endLine:360,endColumn:18,statements:2,count:0},{startLine:361,startColumn:5,endLine:362,endColumn:10,statements:2,count:0},{startLine:365,startColumn:3,endLine:365,endColumn:24,statements:1,count:0},{startLine:366,startColumn:4,endLine:367,endColumn:1,statements:1,count:0},{startLine:368,startColumn:3,endLine:368,endColumn:23,statements:1,count:0},{startLine:370,startColumn:2,endLine:370,endColumn:17,statements:1,count:0},{startLine:373,startColumn:2,endLine:374,endColumn:39,statements:2,count:0},{startLine:375,startColumn:3,endLine:375,endColumn:55,statements:1,count:0},{startLine:376,startColumn:4,endLine:377,endColumn:1,statements:1,count:0},{startLine:378,startColumn:4,endLine:379,endColumn:1,statements:1,count:0},{startLine:381,startColumn:2,endLine:381,endColumn:38,statements:1,count:0},{startLine:384,startColumn:2,endLine:385,endColumn:1,statements:1,count:0},{startLine:387,startColumn:2,endLine:387,endColumn:29,statements:1,count:0},{startLine:388,startColumn:3,endLine:389,endColumn:1,statements:1,count:0},{startLine:390,startColumn:2,endLine:391,endColumn:16,statements:2,count:0},{startLine:392,startColumn:3,endLine:393,endColumn:1,statements:1,count:0},{startLine:394,startColumn:2,endLine:394,endColumn:18,statements:1,count:0},{startLine:395,startColumn:3,endLine:396,endColumn:1,statements:1,count:0},{startLine:397,startColumn:2,endLine:397,endColumn:40,statements:1,count:0},{startLine:398,startColumn:3,endLine:398,endColumn:55,statements:1,count:0},{startLine:399,startColumn:4,endLine:399,endColumn:67,statements:1,count:0},{startLine:400,startColumn:5,endLine:401,endColumn:1,statements:1,count:0},{startLine:403,startColumn:3,endLine:403,endColumn:51,statements:1,count:0},{startLine:405,startColumn:2,endLine:405,endColumn:36,statements:1,count:0},{startLine:406,startColumn:3,endLine:408,endColumn:17,statements:3,count:0},{startLine:409,startColumn:4,endLine:410,endColumn:1,statements:1,count:0},{startLine:411,startColumn:3,endLine:412,endColumn:46,statements:2,count:0},{startLine:413,startColumn:4,endLine:413,endColumn:28,statements:1,count:0},{startLine:415,startColumn:5,endLine:415,endColumn:30,statements:1,count:0},{startLine:416,startColumn:6,endLine:417,endColumn:1,statements:1,count:0},{startLine:419,startColumn:5,endLine:419,endColumn:73,statements:1,count:0},{startLine:420,startColumn:6,endLine:421,endColumn:39,statements:2,count:0},{startLine:422,startColumn:7,endLine:423,endColumn:1,statements:1,count:0},{startLine:426,startColumn:4,endLine:426,endColumn:15,statements:1,count:0},{startLine:428,startColumn:3,endLine:428,endColumn:15,statements:1,count:0},{startLine:429,startColumn:4,endLine:430,endColumn:1,statements:1,count:0},{startLine:432,startColumn:2,endLine:432,endColumn:72,statements:1,count:0}]},{path:`tools/requirements-site/main.go`,sha256:`b9c128ced994b37095175d2d36913e01555f205a7861462258b72d9d7dd7f09d`,source:`// Command requirements-site builds a public, requirement-by-requirement evidence site.
package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
func run(args []string) error {
	f := flag.NewFlagSet("requirements-site", flag.ContinueOnError)
	root := f.String("root", ".", "source checkout")
	input := f.String("input", ".local/site-input", "verified artifact inputs")
	out := f.String("out", "artifacts/requirements-site", "public output")
	revision := f.String("revision", "", "expected source SHA")
	artifact := f.Bool("check-artifact", false, "verify a complete artifact checksum inventory")
	verify := f.Bool("verify", false, "only verify the public site")
	if err := f.Parse(args); err != nil {
		return err
	}
	if *artifact {
		return verifyChecksums(*out)
	}
	if *verify {
		return verifySite(*out)
	}
	if *revision == "" {
		return errors.New("source revision is required")
	}
	return build(*root, *input, *out, *revision)
}
`,blocks:[{startLine:12,startColumn:2,endLine:12,endColumn:41,statements:1,count:0},{startLine:13,startColumn:3,endLine:15,endColumn:1,statements:2,count:0},{startLine:18,startColumn:2,endLine:25,endColumn:38,statements:8,count:0},{startLine:26,startColumn:3,endLine:27,endColumn:1,statements:1,count:0},{startLine:28,startColumn:2,endLine:28,endColumn:15,statements:1,count:0},{startLine:29,startColumn:3,endLine:30,endColumn:1,statements:1,count:0},{startLine:31,startColumn:2,endLine:31,endColumn:13,statements:1,count:0},{startLine:32,startColumn:3,endLine:33,endColumn:1,statements:1,count:0},{startLine:34,startColumn:2,endLine:34,endColumn:21,statements:1,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:1,statements:1,count:0},{startLine:37,startColumn:2,endLine:37,endColumn:46,statements:1,count:0}]},{path:`tools/requirements-site/verify.go`,sha256:`81efc745808b05275c4a9bb8e987f66cde52cfd4cb89087fa2674bbd09d60065`,source:`package main

import (
	"errors"
	"fmt"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"golang.org/x/net/html"
)

var publicFiles = map[string]bool{"index.html": true, "results/index.html": true, "build/index.html": true, "assets/style.css": true, "assets/site.js": true, "assignment.md": true, "requirements.json": true, "verification.json": true, "results/results.json": true, ".nojekyll": true, "SHA256SUMS": true}

// Extra files are accepted only from the generated UI/case inventory, with a narrow path/type boundary.
func allowedPublicFiles(root string) (map[string]bool, error) {
	allowed := map[string]bool{}
	for path := range publicFiles {
		allowed[path] = true
	}
	var extension struct {
		SourceSHA string
		CaseCount int
		Files     []string
	}
	path := filepath.Join(root, "extensions.json")
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return allowed, nil
	}
	if err := readJSON(path, &extension); err != nil {
		return nil, err
	}
	if !shaPattern.MatchString(extension.SourceSHA) || extension.CaseCount <= 0 || len(extension.Files) == 0 {
		return nil, errors.New("invalid extension provenance")
	}
	var verification struct{ SourceSHA string }
	if err := readJSON(filepath.Join(root, "verification.json"), &verification); err != nil {
		return nil, err
	}
	if verification.SourceSHA != extension.SourceSHA {
		return nil, errors.New("extension revision mismatch")
	}
	pattern := regexp.MustCompile(\`^(cases/(functional|unit|exporter)-[a-f0-9]{16}/(index\\.html|data\\.json|coverage\\.(out|html)|terminal\\.(gif|txt)|poster\\.png)|(viewer|storybook|storybook-checks)/[A-Za-z0-9_@./+-]+\\.(html|js|mjs|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|txt|xml|map))$\`)
	for _, file := range extension.Files {
		if !filepath.IsLocal(file) || strings.Contains(file, "..") || !pattern.MatchString(file) || allowed[file] {
			return nil, fmt.Errorf("unsafe/duplicate extension file: %s", file)
		}
		allowed[file] = true
	}
	allowed["extensions.json"] = true
	return allowed, nil
}

type pageInfo struct {
	IDs                                     map[string]bool
	Links                                   []string
	HasMain, HasTitle, HasViewport, HasLang bool
}

func inspectHTML(input io.Reader) (pageInfo, error) {
	root, err := html.Parse(input)
	if err != nil {
		return pageInfo{}, err
	}
	p := pageInfo{IDs: map[string]bool{}}
	var visit func(*html.Node) error
	visit = func(n *html.Node) error {
		if n.Type == html.ElementNode {
			if n.Data == "main" {
				p.HasMain = true
			}
			if n.Data == "title" && n.FirstChild != nil {
				p.HasTitle = true
			}
			for _, a := range n.Attr {
				switch a.Key {
				case "id":
					if p.IDs[a.Val] {
						return errors.New("duplicate HTML anchor")
					}
					p.IDs[a.Val] = true
				case "href", "src":
					p.Links = append(p.Links, a.Val)
				case "lang":
					if n.Data == "html" && a.Val == "en" {
						p.HasLang = true
					}
				case "name":
					if n.Data == "meta" && a.Val == "viewport" {
						p.HasViewport = true
					}
				}
			}
		}
		for child := n.FirstChild; child != nil; child = child.NextSibling {
			if err := visit(child); err != nil {
				return err
			}
		}
		return nil
	}
	return p, visit(root)
}
func verifySite(root string) error {
	allowed, err := allowedPublicFiles(root)
	if err != nil {
		return err
	}
	if err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		relative, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		if !allowed[filepath.ToSlash(relative)] {
			return fmt.Errorf("file outside public allowlist: %s", relative)
		}
		info, err := d.Info()
		if err != nil {
			return err
		}
		if !info.Mode().IsRegular() {
			return errors.New("public file is not regular")
		}
		return nil
	}); err != nil {
		return err
	}
	if err := verifyChecksums(root); err != nil {
		return err
	}
	pages := map[string]pageInfo{}
	for file := range allowed {
		path := filepath.Join(root, file)
		if _, err := os.Stat(path); err != nil {
			return err
		}
		if !strings.HasSuffix(file, ".html") || strings.HasPrefix(file, "storybook/") || strings.HasPrefix(file, "storybook-checks/") || strings.HasSuffix(file, "/coverage.html") {
			continue
		}
		data, err := os.Open(path)
		if err != nil {
			return err
		}
		p, parseErr := inspectHTML(data)
		closeErr := data.Close()
		if err := errors.Join(parseErr, closeErr); err != nil {
			return err
		}
		if !p.HasMain || !p.HasTitle || !p.HasViewport || !p.HasLang {
			return errors.New("page accessibility metadata missing")
		}
		pages[file] = p
	}
	return verifyPageLinks(pages, allowed)
}
func verifyPageLinks(pages map[string]pageInfo, allowed map[string]bool) error {
	for file, p := range pages {
		for _, href := range p.Links {
			target, err := url.Parse(href)
			if err != nil {
				return err
			}
			if target.IsAbs() {
				if target.Scheme != "https" || target.Host != "github.com" || !strings.HasPrefix(target.Path, "/newdarwindev/firm-payments/") {
					return fmt.Errorf("unexpected external destination: %s", target.Host)
				}
				continue
			}
			if target.Host != "" || strings.HasPrefix(target.Path, "/") {
				return errors.New("site links must be base-path safe")
			}
			local := filepath.Clean(filepath.Join(filepath.Dir(file), filepath.FromSlash(target.Path)))
			if target.Path == "" {
				local = file
			} else if strings.HasSuffix(target.Path, "/") || local == "." {
				local = filepath.Join(local, "index.html")
			}
			if !filepath.IsLocal(local) {
				return errors.New("link escapes public root")
			}
			local = filepath.ToSlash(local)
			if !allowed[local] {
				return fmt.Errorf("broken internal file link: %s -> %s", file, local)
			}
			if target.Fragment != "" && !pages[local].IDs[target.Fragment] {
				return fmt.Errorf("broken internal anchor: %s -> %s#%s", file, local, target.Fragment)
			}
		}
	}
	return nil
}
`,blocks:[{startLine:20,startColumn:2,endLine:21,endColumn:32,statements:2,count:0},{startLine:22,startColumn:3,endLine:23,endColumn:1,statements:1,count:0},{startLine:24,startColumn:2,endLine:28,endColumn:1,statements:1,count:0},{startLine:29,startColumn:2,endLine:30,endColumn:49,statements:2,count:0},{startLine:31,startColumn:3,endLine:32,endColumn:1,statements:1,count:0},{startLine:33,startColumn:2,endLine:33,endColumn:51,statements:1,count:0},{startLine:34,startColumn:3,endLine:35,endColumn:1,statements:1,count:0},{startLine:36,startColumn:2,endLine:36,endColumn:107,statements:1,count:0},{startLine:37,startColumn:3,endLine:38,endColumn:1,statements:1,count:0},{startLine:39,startColumn:2,endLine:40,endColumn:90,statements:2,count:0},{startLine:41,startColumn:3,endLine:42,endColumn:1,statements:1,count:0},{startLine:43,startColumn:2,endLine:43,endColumn:51,statements:1,count:0},{startLine:44,startColumn:3,endLine:45,endColumn:1,statements:1,count:0},{startLine:46,startColumn:2,endLine:47,endColumn:39,statements:2,count:0},{startLine:48,startColumn:3,endLine:48,endColumn:109,statements:1,count:0},{startLine:49,startColumn:4,endLine:50,endColumn:1,statements:1,count:0},{startLine:51,startColumn:3,endLine:51,endColumn:23,statements:1,count:0},{startLine:53,startColumn:2,endLine:54,endColumn:21,statements:2,count:0},{startLine:64,startColumn:2,endLine:65,endColumn:16,statements:2,count:0},{startLine:66,startColumn:3,endLine:67,endColumn:1,statements:1,count:0},{startLine:68,startColumn:2,endLine:70,endColumn:35,statements:3,count:0},{startLine:71,startColumn:3,endLine:71,endColumn:33,statements:1,count:0},{startLine:72,startColumn:4,endLine:72,endColumn:24,statements:1,count:0},{startLine:73,startColumn:5,endLine:74,endColumn:1,statements:1,count:0},{startLine:75,startColumn:4,endLine:75,endColumn:48,statements:1,count:0},{startLine:76,startColumn:5,endLine:77,endColumn:1,statements:1,count:0},{startLine:78,startColumn:4,endLine:78,endColumn:29,statements:1,count:0},{startLine:79,startColumn:5,endLine:79,endColumn:18,statements:1,count:0},{startLine:81,startColumn:6,endLine:81,endColumn:22,statements:1,count:0},{startLine:82,startColumn:7,endLine:83,endColumn:1,statements:1,count:0},{startLine:84,startColumn:6,endLine:84,endColumn:25,statements:1,count:0},{startLine:86,startColumn:6,endLine:86,endColumn:38,statements:1,count:0},{startLine:88,startColumn:6,endLine:88,endColumn:43,statements:1,count:0},{startLine:89,startColumn:7,endLine:90,endColumn:1,statements:1,count:0},{startLine:92,startColumn:6,endLine:92,endColumn:49,statements:1,count:0},{startLine:93,startColumn:7,endLine:94,endColumn:1,statements:1,count:0},{startLine:98,startColumn:3,endLine:98,endColumn:70,statements:1,count:0},{startLine:99,startColumn:4,endLine:99,endColumn:39,statements:1,count:0},{startLine:100,startColumn:5,endLine:101,endColumn:1,statements:1,count:0},{startLine:103,startColumn:3,endLine:103,endColumn:13,statements:1,count:0},{startLine:105,startColumn:2,endLine:105,endColumn:23,statements:1,count:0},{startLine:108,startColumn:2,endLine:109,endColumn:16,statements:2,count:0},{startLine:110,startColumn:3,endLine:111,endColumn:1,statements:1,count:0},{startLine:112,startColumn:2,endLine:112,endColumn:85,statements:1,count:0},{startLine:113,startColumn:3,endLine:113,endColumn:17,statements:1,count:0},{startLine:114,startColumn:4,endLine:115,endColumn:1,statements:1,count:0},{startLine:116,startColumn:3,endLine:116,endColumn:16,statements:1,count:0},{startLine:117,startColumn:4,endLine:118,endColumn:1,statements:1,count:0},{startLine:119,startColumn:3,endLine:120,endColumn:17,statements:2,count:0},{startLine:121,startColumn:4,endLine:122,endColumn:1,statements:1,count:0},{startLine:123,startColumn:3,endLine:123,endColumn:43,statements:1,count:0},{startLine:124,startColumn:4,endLine:125,endColumn:1,statements:1,count:0},{startLine:126,startColumn:3,endLine:127,endColumn:17,statements:2,count:0},{startLine:128,startColumn:4,endLine:129,endColumn:1,statements:1,count:0},{startLine:130,startColumn:3,endLine:130,endColumn:31,statements:1,count:0},{startLine:131,startColumn:4,endLine:132,endColumn:1,statements:1,count:0},{startLine:133,startColumn:3,endLine:133,endColumn:13,statements:1,count:0},{startLine:135,startColumn:3,endLine:136,endColumn:1,statements:1,count:0},{startLine:137,startColumn:2,endLine:137,endColumn:46,statements:1,count:0},{startLine:138,startColumn:3,endLine:139,endColumn:1,statements:1,count:0},{startLine:140,startColumn:2,endLine:141,endColumn:28,statements:2,count:0},{startLine:142,startColumn:3,endLine:143,endColumn:42,statements:2,count:0},{startLine:144,startColumn:4,endLine:145,endColumn:1,statements:1,count:0},{startLine:146,startColumn:3,endLine:146,endColumn:174,statements:1,count:0},{startLine:147,startColumn:4,endLine:147,endColumn:12,statements:1,count:0},{startLine:149,startColumn:3,endLine:150,endColumn:17,statements:2,count:0},{startLine:151,startColumn:4,endLine:152,endColumn:1,statements:1,count:0},{startLine:153,startColumn:3,endLine:155,endColumn:57,statements:3,count:0},{startLine:156,startColumn:4,endLine:157,endColumn:1,statements:1,count:0},{startLine:158,startColumn:3,endLine:158,endColumn:64,statements:1,count:0},{startLine:159,startColumn:4,endLine:160,endColumn:1,statements:1,count:0},{startLine:161,startColumn:3,endLine:161,endColumn:18,statements:1,count:0},{startLine:163,startColumn:2,endLine:163,endColumn:40,statements:1,count:0},{startLine:166,startColumn:2,endLine:166,endColumn:29,statements:1,count:0},{startLine:167,startColumn:3,endLine:167,endColumn:32,statements:1,count:0},{startLine:168,startColumn:4,endLine:169,endColumn:18,statements:2,count:0},{startLine:170,startColumn:5,endLine:171,endColumn:1,statements:1,count:0},{startLine:172,startColumn:4,endLine:172,endColumn:22,statements:1,count:0},{startLine:173,startColumn:5,endLine:173,endColumn:131,statements:1,count:0},{startLine:174,startColumn:6,endLine:175,endColumn:1,statements:1,count:0},{startLine:176,startColumn:5,endLine:176,endColumn:13,statements:1,count:0},{startLine:178,startColumn:4,endLine:178,endColumn:64,statements:1,count:0},{startLine:179,startColumn:5,endLine:180,endColumn:1,statements:1,count:0},{startLine:181,startColumn:4,endLine:182,endColumn:25,statements:2,count:0},{startLine:183,startColumn:5,endLine:184,endColumn:1,statements:1,count:0},{startLine:184,startColumn:11,endLine:184,endColumn:66,statements:1,count:0},{startLine:185,startColumn:5,endLine:186,endColumn:1,statements:1,count:0},{startLine:187,startColumn:4,endLine:187,endColumn:32,statements:1,count:0},{startLine:188,startColumn:5,endLine:189,endColumn:1,statements:1,count:0},{startLine:190,startColumn:4,endLine:191,endColumn:23,statements:2,count:0},{startLine:192,startColumn:5,endLine:193,endColumn:1,statements:1,count:0},{startLine:194,startColumn:4,endLine:194,endColumn:67,statements:1,count:0},{startLine:195,startColumn:5,endLine:196,endColumn:1,statements:1,count:0},{startLine:199,startColumn:2,endLine:199,endColumn:12,statements:1,count:0}]}],T=[{path:`tools/requirements-site/main_test.go`,label:`Selected test / case body · TestSiteArtifactIntegrityRejectsTamperingAndUnlistedFiles`,source:`func TestSiteArtifactIntegrityRejectsTamperingAndUnlistedFiles(t *testing.T) {
	root := t.TempDir()
	put(t, filepath.Join(root, "result.json"), "original")
	if err := writeSiteChecksums(root); err != nil {
		t.Fatal(err)
	}
	if err := verifyChecksums(root); err != nil {
		t.Fatal(err)
	}
	put(t, filepath.Join(root, "result.json"), "tampered")
	if err := verifyChecksums(root); err == nil {
		t.Fatal("tampered artifact accepted")
	}
	put(t, filepath.Join(root, "result.json"), "original")
	put(t, filepath.Join(root, "private.go"), "private source")
	if err := verifyChecksums(root); err == nil {
		t.Fatal("unlisted file accepted")
	}
}`,sha256:`57fde1740c2094407e5cf0ebfd91a508b4ce4fe9c0f7307f098615dfe9ec0a0f`,startLine:65,endLine:83,assertLines:[69,72,76,81]},{path:`tools/requirements-site/main_test.go`,label:`Referenced test helper (static call graph) · put`,source:`func put(t *testing.T, path, text string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(text), 0o600); err != nil {
		t.Fatal(err)
	}
}`,sha256:`57fde1740c2094407e5cf0ebfd91a508b4ce4fe9c0f7307f098615dfe9ec0a0f`,startLine:19,endLine:27,assertLines:[22,25]}],E=`0f7bfe120e2a45c6eb3765deba90b069efef6b29aabf04dba57b88dcedbaaaea`,D=`e137c46f2d854618fb3140a5d5efe755c8126ff443f53d7b79490fbe5176328a`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/tools/requirements-site`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:661,covered:49,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-62e4fffacae8cf93`,title:`Cases/unit/TestSiteArtifactIntegrityRejectsTamperingAndUnlistedFiles`,component:d,args:{evidence:j,mediaBase:`../cases/unit-62e4fffacae8cf93/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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