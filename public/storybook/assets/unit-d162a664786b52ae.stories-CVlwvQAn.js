import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TestEvidence-E0bvKaeb.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r=`unit-d162a664786b52ae`,i=`unit`,a=`TestSiteMarkdownDoesNotExecuteHTMLOrScriptURLs`,o=`b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f`,s=`pass`,c=`https://github.com/newdarwindev/firm-payments/blob/b7a40cfc5b8242c5cec6c81a94a2bede88ea1e0f/tools/requirements-site/main_test.go#L107`,l=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tools/requirements-site`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/9311f7c937a2d2ef.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestSiteMarkdownDoesNotExecuteHTMLOrScriptURLs$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-d162a664786b52ae/coverage.out`],u=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/9311f7c937a2d2ef.test`,`-cover`,`-covermode=atomic`,`.`],d=`9d28561128d3b8ab14078425c997ca7f632a9112d21595c381f759d3ac5659e8`,f=`TestSiteMarkdownDoesNotExecuteHTMLOrScriptURLs`,p=[`TestSiteMarkdownDoesNotExecuteHTMLOrScriptURLs`],m=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,h=[{path:`tools/requirements-site/build.go`,sha256:`004f6625bd6f9259ee7b4388f79968c8ab928e25c9444b3b0e1e2efb38820e31`,source:`package main

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
`,blocks:[{startLine:54,startColumn:2,endLine:55,endColumn:72,statements:2,count:0},{startLine:56,startColumn:3,endLine:57,endColumn:1,statements:1,count:0},{startLine:58,startColumn:2,endLine:60,endColumn:28,statements:3,count:0},{startLine:61,startColumn:3,endLine:62,endColumn:15,statements:2,count:0},{startLine:63,startColumn:4,endLine:64,endColumn:1,statements:1,count:0},{startLine:65,startColumn:3,endLine:67,endColumn:25,statements:3,count:0},{startLine:68,startColumn:4,endLine:69,endColumn:1,statements:1,count:0},{startLine:70,startColumn:3,endLine:71,endColumn:17,statements:2,count:0},{startLine:72,startColumn:4,endLine:73,endColumn:1,statements:1,count:0},{startLine:74,startColumn:3,endLine:74,endColumn:102,statements:1,count:0},{startLine:76,startColumn:2,endLine:76,endColumn:18,statements:1,count:0},{startLine:79,startColumn:2,endLine:80,endColumn:16,statements:2,count:0},{startLine:81,startColumn:3,endLine:82,endColumn:1,statements:1,count:0},{startLine:83,startColumn:2,endLine:84,endColumn:16,statements:2,count:0},{startLine:85,startColumn:3,endLine:86,endColumn:1,statements:1,count:0},{startLine:87,startColumn:2,endLine:88,endColumn:91,statements:2,count:0},{startLine:89,startColumn:3,endLine:90,endColumn:1,statements:1,count:0},{startLine:91,startColumn:2,endLine:91,endColumn:32,statements:1,count:0},{startLine:92,startColumn:3,endLine:93,endColumn:1,statements:1,count:0},{startLine:94,startColumn:2,endLine:94,endColumn:25,statements:1,count:0},{startLine:95,startColumn:3,endLine:95,endColumn:29,statements:1,count:0},{startLine:96,startColumn:4,endLine:97,endColumn:1,statements:1,count:0},{startLine:98,startColumn:3,endLine:98,endColumn:29,statements:1,count:0},{startLine:99,startColumn:4,endLine:100,endColumn:1,statements:1,count:0},{startLine:101,startColumn:3,endLine:102,endColumn:90,statements:2,count:0},{startLine:103,startColumn:4,endLine:104,endColumn:1,statements:1,count:0},{startLine:105,startColumn:3,endLine:105,endColumn:88,statements:1,count:0},{startLine:106,startColumn:4,endLine:107,endColumn:1,statements:1,count:0},{startLine:109,startColumn:2,endLine:112,endColumn:1,statements:1,count:0},{startLine:113,startColumn:2,endLine:113,endColumn:83,statements:1,count:0},{startLine:114,startColumn:3,endLine:115,endColumn:1,statements:1,count:0},{startLine:116,startColumn:2,endLine:116,endColumn:69,statements:1,count:0},{startLine:117,startColumn:3,endLine:118,endColumn:1,statements:1,count:0},{startLine:119,startColumn:2,endLine:120,endColumn:16,statements:2,count:0},{startLine:121,startColumn:3,endLine:122,endColumn:1,statements:1,count:0},{startLine:123,startColumn:2,endLine:123,endColumn:27,statements:1,count:0},{startLine:124,startColumn:3,endLine:125,endColumn:1,statements:1,count:0},{startLine:126,startColumn:2,endLine:126,endColumn:145,statements:1,count:0},{startLine:127,startColumn:3,endLine:128,endColumn:17,statements:2,count:0},{startLine:129,startColumn:4,endLine:130,endColumn:1,statements:1,count:0},{startLine:131,startColumn:3,endLine:131,endColumn:71,statements:1,count:0},{startLine:132,startColumn:4,endLine:133,endColumn:1,statements:1,count:0},{startLine:135,startColumn:2,endLine:135,endColumn:50,statements:1,count:0},{startLine:138,startColumn:2,endLine:139,endColumn:16,statements:2,count:0},{startLine:140,startColumn:3,endLine:141,endColumn:1,statements:1,count:0},{startLine:142,startColumn:2,endLine:143,endColumn:16,statements:2,count:0},{startLine:144,startColumn:3,endLine:145,endColumn:1,statements:1,count:0},{startLine:146,startColumn:2,endLine:147,endColumn:74,statements:2,count:0},{startLine:148,startColumn:3,endLine:149,endColumn:1,statements:1,count:0},{startLine:150,startColumn:2,endLine:150,endColumn:33,statements:1,count:0},{startLine:151,startColumn:3,endLine:151,endColumn:30,statements:1,count:0},{startLine:152,startColumn:4,endLine:153,endColumn:1,statements:1,count:0},{startLine:155,startColumn:2,endLine:155,endColumn:84,statements:1,count:0},{startLine:156,startColumn:3,endLine:158,endColumn:1,statements:2,count:0},{startLine:159,startColumn:2,endLine:159,endColumn:32,statements:1,count:0},{startLine:160,startColumn:3,endLine:161,endColumn:1,statements:1,count:0},{startLine:162,startColumn:2,endLine:162,endColumn:43,statements:1,count:0},{startLine:162,startColumn:45,endLine:162,endColumn:85,statements:1,count:0},{startLine:163,startColumn:2,endLine:163,endColumn:48,statements:1,count:0},{startLine:164,startColumn:3,endLine:165,endColumn:1,statements:1,count:0},{startLine:166,startColumn:2,endLine:167,endColumn:16,statements:2,count:0},{startLine:168,startColumn:3,endLine:169,endColumn:1,statements:1,count:0},{startLine:170,startColumn:2,endLine:170,endColumn:23,statements:1,count:0},{startLine:171,startColumn:3,endLine:172,endColumn:1,statements:1,count:0},{startLine:173,startColumn:2,endLine:173,endColumn:95,statements:1,count:0},{startLine:173,startColumn:97,endLine:173,endColumn:128,statements:1,count:0},{startLine:174,startColumn:2,endLine:174,endColumn:16,statements:1,count:0},{startLine:175,startColumn:3,endLine:176,endColumn:1,statements:1,count:0},{startLine:177,startColumn:2,endLine:177,endColumn:248,statements:1,count:0},{startLine:178,startColumn:3,endLine:180,endColumn:89,statements:3,count:0},{startLine:181,startColumn:4,endLine:182,endColumn:1,statements:1,count:0},{startLine:183,startColumn:3,endLine:184,endColumn:17,statements:2,count:0},{startLine:185,startColumn:4,endLine:186,endColumn:1,statements:1,count:0},{startLine:187,startColumn:3,endLine:189,endColumn:58,statements:3,count:0},{startLine:190,startColumn:4,endLine:191,endColumn:1,statements:1,count:0},{startLine:193,startColumn:2,endLine:193,endColumn:56,statements:1,count:0},{startLine:194,startColumn:3,endLine:195,endColumn:17,statements:2,count:0},{startLine:196,startColumn:4,endLine:197,endColumn:1,statements:1,count:0},{startLine:198,startColumn:3,endLine:198,endColumn:74,statements:1,count:0},{startLine:199,startColumn:4,endLine:200,endColumn:1,statements:1,count:0},{startLine:201,startColumn:3,endLine:201,endColumn:84,statements:1,count:0},{startLine:202,startColumn:4,endLine:203,endColumn:1,statements:1,count:0},{startLine:205,startColumn:2,endLine:206,endColumn:16,statements:2,count:0},{startLine:207,startColumn:3,endLine:208,endColumn:1,statements:1,count:0},{startLine:209,startColumn:2,endLine:209,endColumn:84,statements:1,count:0},{startLine:210,startColumn:3,endLine:211,endColumn:1,statements:1,count:0},{startLine:214,startColumn:2,endLine:223,endColumn:166,statements:1,count:0},{startLine:224,startColumn:3,endLine:224,endColumn:84,statements:1,count:0},{startLine:225,startColumn:4,endLine:226,endColumn:1,statements:1,count:0},{startLine:228,startColumn:2,endLine:228,endColumn:82,statements:1,count:0},{startLine:229,startColumn:3,endLine:230,endColumn:1,statements:1,count:0},{startLine:231,startColumn:2,endLine:231,endColumn:48,statements:1,count:0},{startLine:232,startColumn:3,endLine:233,endColumn:1,statements:1,count:0},{startLine:234,startColumn:2,endLine:234,endColumn:24,statements:1,count:0},{startLine:237,startColumn:2,endLine:237,endColumn:25,statements:1,count:0},{startLine:238,startColumn:3,endLine:240,endColumn:17,statements:3,count:0},{startLine:241,startColumn:4,endLine:242,endColumn:1,statements:1,count:0},{startLine:243,startColumn:3,endLine:245,endColumn:31,statements:3,count:0},{startLine:246,startColumn:4,endLine:247,endColumn:38,statements:2,count:0},{startLine:248,startColumn:5,endLine:248,endColumn:57,statements:1,count:0},{startLine:249,startColumn:6,endLine:250,endColumn:1,statements:1,count:0},{startLine:252,startColumn:4,endLine:252,endColumn:52,statements:1,count:0},{startLine:253,startColumn:5,endLine:254,endColumn:1,statements:1,count:0},{startLine:255,startColumn:4,endLine:255,endColumn:45,statements:1,count:0},{startLine:257,startColumn:3,endLine:257,endColumn:36,statements:1,count:0},{startLine:258,startColumn:4,endLine:259,endColumn:18,statements:2,count:0},{startLine:260,startColumn:5,endLine:261,endColumn:1,statements:1,count:0},{startLine:262,startColumn:4,endLine:262,endColumn:140,statements:1,count:0},{startLine:264,startColumn:3,endLine:265,endColumn:36,statements:2,count:0},{startLine:266,startColumn:4,endLine:267,endColumn:11,statements:2,count:0},{startLine:268,startColumn:5,endLine:269,endColumn:1,statements:1,count:0},{startLine:270,startColumn:4,endLine:270,endColumn:76,statements:1,count:0},{startLine:272,startColumn:3,endLine:272,endColumn:31,statements:1,count:0},{startLine:273,startColumn:4,endLine:274,endColumn:33,statements:2,count:0},{startLine:275,startColumn:5,endLine:276,endColumn:1,statements:1,count:0},{startLine:277,startColumn:4,endLine:277,endColumn:40,statements:1,count:0},{startLine:279,startColumn:3,endLine:279,endColumn:32,statements:1,count:0},{startLine:281,startColumn:2,endLine:281,endColumn:12,statements:1,count:0},{startLine:284,startColumn:2,endLine:285,endColumn:16,statements:2,count:0},{startLine:286,startColumn:3,endLine:287,endColumn:1,statements:1,count:0},{startLine:288,startColumn:2,endLine:288,endColumn:51,statements:1,count:0},{startLine:291,startColumn:2,endLine:292,endColumn:85,statements:2,count:0},{startLine:293,startColumn:3,endLine:293,endColumn:17,statements:1,count:0},{startLine:294,startColumn:4,endLine:295,endColumn:1,statements:1,count:0},{startLine:296,startColumn:3,endLine:296,endColumn:17,statements:1,count:0},{startLine:297,startColumn:4,endLine:298,endColumn:18,statements:2,count:0},{startLine:299,startColumn:5,endLine:300,endColumn:1,statements:1,count:0},{startLine:301,startColumn:4,endLine:301,endColumn:27,statements:1,count:0},{startLine:302,startColumn:5,endLine:303,endColumn:1,statements:1,count:0},{startLine:305,startColumn:3,endLine:305,endColumn:13,statements:1,count:0},{startLine:307,startColumn:3,endLine:308,endColumn:1,statements:1,count:0},{startLine:309,startColumn:2,endLine:311,endColumn:29,statements:3,count:0},{startLine:312,startColumn:3,endLine:313,endColumn:17,statements:2,count:0},{startLine:314,startColumn:4,endLine:315,endColumn:1,statements:1,count:0},{startLine:316,startColumn:3,endLine:316,endColumn:43,statements:1,count:0},{startLine:318,startColumn:2,endLine:318,endColumn:83,statements:1,count:0},{startLine:322,startColumn:2,endLine:324,endColumn:66,statements:3,count:1},{startLine:325,startColumn:3,endLine:326,endColumn:1,statements:1,count:0},{startLine:327,startColumn:2,endLine:327,endColumn:46,statements:1,count:1}]},{path:`tools/requirements-site/evidence.go`,sha256:`d74948d58c0a6fb86e4bf61ea2906402266b7afa9e9d212c7338129ae66e7d17`,source:`package main

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
`,blocks:[{startLine:54,startColumn:2,endLine:55,endColumn:16,statements:2,count:0},{startLine:56,startColumn:3,endLine:57,endColumn:1,statements:1,count:0},{startLine:58,startColumn:2,endLine:58,endColumn:33,statements:1,count:0},{startLine:61,startColumn:2,endLine:62,endColumn:16,statements:2,count:0},{startLine:63,startColumn:3,endLine:64,endColumn:1,statements:1,count:0},{startLine:65,startColumn:2,endLine:65,endColumn:15,statements:1,count:0},{startLine:65,startColumn:17,endLine:65,endColumn:32,statements:1,count:0},{startLine:66,startColumn:2,endLine:67,endColumn:41,statements:2,count:0},{startLine:68,startColumn:3,endLine:69,endColumn:1,statements:1,count:0},{startLine:70,startColumn:2,endLine:70,endColumn:44,statements:1,count:0},{startLine:73,startColumn:2,endLine:74,endColumn:16,statements:2,count:0},{startLine:75,startColumn:3,endLine:76,endColumn:1,statements:1,count:0},{startLine:77,startColumn:2,endLine:78,endColumn:73,statements:2,count:0},{startLine:79,startColumn:3,endLine:79,endColumn:21,statements:1,count:0},{startLine:80,startColumn:4,endLine:81,endColumn:1,statements:1,count:0},{startLine:82,startColumn:3,endLine:83,endColumn:51,statements:2,count:0},{startLine:84,startColumn:4,endLine:85,endColumn:1,statements:1,count:0},{startLine:86,startColumn:3,endLine:86,endColumn:78,statements:1,count:0},{startLine:87,startColumn:4,endLine:88,endColumn:1,statements:1,count:0},{startLine:89,startColumn:3,endLine:90,endColumn:17,statements:2,count:0},{startLine:91,startColumn:4,endLine:92,endColumn:1,statements:1,count:0},{startLine:93,startColumn:3,endLine:93,endColumn:31,statements:1,count:0},{startLine:94,startColumn:4,endLine:95,endColumn:1,statements:1,count:0},{startLine:96,startColumn:3,endLine:97,endColumn:17,statements:2,count:0},{startLine:98,startColumn:4,endLine:99,endColumn:1,statements:1,count:0},{startLine:100,startColumn:3,endLine:100,endColumn:18,statements:1,count:0},{startLine:101,startColumn:4,endLine:102,endColumn:1,statements:1,count:0},{startLine:103,startColumn:3,endLine:103,endColumn:22,statements:1,count:0},{startLine:105,startColumn:2,endLine:105,endColumn:22,statements:1,count:0},{startLine:106,startColumn:3,endLine:107,endColumn:1,statements:1,count:0},{startLine:108,startColumn:2,endLine:108,endColumn:82,statements:1,count:0},{startLine:109,startColumn:3,endLine:109,endColumn:17,statements:1,count:0},{startLine:110,startColumn:4,endLine:111,endColumn:1,statements:1,count:0},{startLine:112,startColumn:3,endLine:112,endColumn:16,statements:1,count:0},{startLine:113,startColumn:4,endLine:114,endColumn:1,statements:1,count:0},{startLine:115,startColumn:3,endLine:116,endColumn:17,statements:2,count:0},{startLine:117,startColumn:4,endLine:118,endColumn:1,statements:1,count:0},{startLine:119,startColumn:3,endLine:119,endColumn:60,statements:1,count:0},{startLine:120,startColumn:4,endLine:121,endColumn:1,statements:1,count:0},{startLine:122,startColumn:3,endLine:122,endColumn:13,statements:1,count:0},{startLine:126,startColumn:2,endLine:127,endColumn:16,statements:2,count:0},{startLine:128,startColumn:3,endLine:129,endColumn:1,statements:1,count:0},{startLine:130,startColumn:2,endLine:131,endColumn:16,statements:1,count:0},{startLine:131,startColumn:18,endLine:131,endColumn:71,statements:1,count:0},{startLine:132,startColumn:18,endLine:132,endColumn:53,statements:1,count:0},{startLine:133,startColumn:18,endLine:133,endColumn:51,statements:1,count:0},{startLine:135,startColumn:3,endLine:135,endColumn:32,statements:1,count:0},{startLine:136,startColumn:4,endLine:137,endColumn:1,statements:1,count:0},{startLine:139,startColumn:2,endLine:139,endColumn:18,statements:1,count:0},{startLine:142,startColumn:2,endLine:143,endColumn:88,statements:2,count:0},{startLine:144,startColumn:3,endLine:145,endColumn:1,statements:1,count:0},{startLine:146,startColumn:2,endLine:147,endColumn:105,statements:2,count:0},{startLine:148,startColumn:3,endLine:149,endColumn:1,statements:1,count:0},{startLine:150,startColumn:2,endLine:150,endColumn:58,statements:1,count:0},{startLine:151,startColumn:3,endLine:151,endColumn:124,statements:1,count:0},{startLine:152,startColumn:4,endLine:153,endColumn:1,statements:1,count:0},{startLine:155,startColumn:2,endLine:157,endColumn:32,statements:3,count:0},{startLine:158,startColumn:3,endLine:158,endColumn:165,statements:1,count:0},{startLine:159,startColumn:4,endLine:160,endColumn:1,statements:1,count:0},{startLine:161,startColumn:3,endLine:161,endColumn:76,statements:1,count:0},{startLine:162,startColumn:4,endLine:163,endColumn:1,statements:1,count:0},{startLine:164,startColumn:3,endLine:166,endColumn:31,statements:3,count:0},{startLine:167,startColumn:4,endLine:168,endColumn:1,statements:1,count:0},{startLine:169,startColumn:3,endLine:170,endColumn:60,statements:2,count:0},{startLine:171,startColumn:4,endLine:172,endColumn:1,statements:1,count:0},{startLine:173,startColumn:3,endLine:173,endColumn:29,statements:1,count:0},{startLine:175,startColumn:2,endLine:175,endColumn:30,statements:1,count:0},{startLine:176,startColumn:3,endLine:177,endColumn:1,statements:1,count:0},{startLine:178,startColumn:2,endLine:178,endColumn:18,statements:1,count:0},{startLine:182,startColumn:2,endLine:189,endColumn:1,statements:1,count:0},{startLine:191,startColumn:2,endLine:191,endColumn:124,statements:1,count:0},{startLine:192,startColumn:3,endLine:193,endColumn:1,statements:1,count:0},{startLine:194,startColumn:2,endLine:195,endColumn:100,statements:2,count:0},{startLine:196,startColumn:3,endLine:197,endColumn:1,statements:1,count:0},{startLine:198,startColumn:2,endLine:198,endColumn:186,statements:1,count:0},{startLine:199,startColumn:3,endLine:200,endColumn:1,statements:1,count:0},{startLine:201,startColumn:2,endLine:201,endColumn:37,statements:1,count:0},{startLine:202,startColumn:3,endLine:202,endColumn:93,statements:1,count:0},{startLine:203,startColumn:4,endLine:204,endColumn:1,statements:1,count:0},{startLine:205,startColumn:3,endLine:206,endColumn:17,statements:2,count:0},{startLine:207,startColumn:4,endLine:208,endColumn:1,statements:1,count:0},{startLine:209,startColumn:3,endLine:209,endColumn:301,statements:1,count:0},{startLine:211,startColumn:2,endLine:211,endColumn:155,statements:1,count:0},{startLine:212,startColumn:3,endLine:214,endColumn:17,statements:3,count:0},{startLine:215,startColumn:4,endLine:216,endColumn:1,statements:1,count:0},{startLine:217,startColumn:3,endLine:217,endColumn:50,statements:1,count:0},{startLine:219,startColumn:2,endLine:219,endColumn:12,statements:1,count:0},{startLine:223,startColumn:2,endLine:227,endColumn:1,statements:1,count:0},{startLine:228,startColumn:2,endLine:228,endColumn:120,statements:1,count:0},{startLine:229,startColumn:3,endLine:230,endColumn:1,statements:1,count:0},{startLine:231,startColumn:2,endLine:232,endColumn:29,statements:2,count:0},{startLine:233,startColumn:3,endLine:233,endColumn:36,statements:1,count:0},{startLine:234,startColumn:4,endLine:234,endColumn:70,statements:1,count:0},{startLine:235,startColumn:5,endLine:236,endColumn:1,statements:1,count:0},{startLine:237,startColumn:4,endLine:238,endColumn:79,statements:2,count:0},{startLine:239,startColumn:5,endLine:240,endColumn:1,statements:1,count:0},{startLine:241,startColumn:4,endLine:241,endColumn:16,statements:1,count:0},{startLine:244,startColumn:2,endLine:244,endColumn:12,statements:1,count:0},{startLine:245,startColumn:3,endLine:246,endColumn:1,statements:1,count:0},{startLine:247,startColumn:2,endLine:247,endColumn:12,statements:1,count:0},{startLine:251,startColumn:2,endLine:253,endColumn:53,statements:3,count:0},{startLine:254,startColumn:3,endLine:255,endColumn:17,statements:2,count:0},{startLine:256,startColumn:4,endLine:257,endColumn:1,statements:1,count:0},{startLine:258,startColumn:3,endLine:258,endColumn:63,statements:1,count:0},{startLine:259,startColumn:4,endLine:260,endColumn:1,statements:1,count:0},{startLine:261,startColumn:3,endLine:261,endColumn:18,statements:1,count:0},{startLine:262,startColumn:4,endLine:263,endColumn:1,statements:1,count:0},{startLine:264,startColumn:3,endLine:264,endColumn:13,statements:1,count:0},{startLine:266,startColumn:2,endLine:272,endColumn:1,statements:1,count:0},{startLine:273,startColumn:3,endLine:273,endColumn:71,statements:1,count:0},{startLine:274,startColumn:4,endLine:275,endColumn:1,statements:1,count:0},{startLine:276,startColumn:3,endLine:277,endColumn:35,statements:2,count:0},{startLine:278,startColumn:4,endLine:279,endColumn:1,statements:1,count:0},{startLine:280,startColumn:3,endLine:280,endColumn:114,statements:1,count:0},{startLine:282,startColumn:2,endLine:282,endColumn:69,statements:1,count:0},{startLine:283,startColumn:3,endLine:283,endColumn:51,statements:1,count:0},{startLine:284,startColumn:4,endLine:284,endColumn:80,statements:1,count:0},{startLine:285,startColumn:5,endLine:286,endColumn:1,statements:1,count:0},{startLine:289,startColumn:2,endLine:290,endColumn:12,statements:2,count:0},{startLine:299,startColumn:2,endLine:300,endColumn:16,statements:2,count:0},{startLine:301,startColumn:3,endLine:302,endColumn:1,statements:1,count:0},{startLine:303,startColumn:2,endLine:303,endColumn:15,statements:1,count:0},{startLine:303,startColumn:17,endLine:303,endColumn:35,statements:1,count:0},{startLine:304,startColumn:2,endLine:308,endColumn:21,statements:5,count:0},{startLine:309,startColumn:3,endLine:310,endColumn:61,statements:2,count:0},{startLine:311,startColumn:4,endLine:312,endColumn:1,statements:1,count:0},{startLine:313,startColumn:3,endLine:313,endColumn:65,statements:1,count:0},{startLine:314,startColumn:4,endLine:315,endColumn:1,statements:1,count:0},{startLine:316,startColumn:3,endLine:316,endColumn:41,statements:1,count:0},{startLine:317,startColumn:4,endLine:318,endColumn:1,statements:1,count:0},{startLine:319,startColumn:3,endLine:319,endColumn:41,statements:1,count:0},{startLine:320,startColumn:4,endLine:321,endColumn:41,statements:2,count:0},{startLine:322,startColumn:5,endLine:323,endColumn:1,statements:1,count:0},{startLine:324,startColumn:4,endLine:324,endColumn:170,statements:1,count:0},{startLine:327,startColumn:2,endLine:327,endColumn:38,statements:1,count:0},{startLine:328,startColumn:3,endLine:329,endColumn:1,statements:1,count:0},{startLine:330,startColumn:2,endLine:330,endColumn:23,statements:1,count:0},{startLine:331,startColumn:3,endLine:332,endColumn:1,statements:1,count:0},{startLine:333,startColumn:2,endLine:334,endColumn:27,statements:2,count:0},{startLine:335,startColumn:3,endLine:336,endColumn:1,statements:1,count:0},{startLine:337,startColumn:2,endLine:339,endColumn:27,statements:3,count:0},{startLine:340,startColumn:3,endLine:341,endColumn:27,statements:2,count:0},{startLine:342,startColumn:4,endLine:343,endColumn:1,statements:1,count:0},{startLine:344,startColumn:3,endLine:345,endColumn:49,statements:2,count:0},{startLine:346,startColumn:4,endLine:347,endColumn:1,statements:1,count:0},{startLine:348,startColumn:3,endLine:349,endColumn:17,statements:2,count:0},{startLine:350,startColumn:4,endLine:351,endColumn:1,statements:1,count:0},{startLine:352,startColumn:3,endLine:353,endColumn:30,statements:2,count:0},{startLine:354,startColumn:4,endLine:355,endColumn:18,statements:2,count:0},{startLine:356,startColumn:5,endLine:357,endColumn:1,statements:1,count:0},{startLine:358,startColumn:4,endLine:359,endColumn:18,statements:2,count:0},{startLine:360,startColumn:5,endLine:361,endColumn:10,statements:2,count:0},{startLine:364,startColumn:3,endLine:364,endColumn:24,statements:1,count:0},{startLine:365,startColumn:4,endLine:366,endColumn:1,statements:1,count:0},{startLine:367,startColumn:3,endLine:367,endColumn:23,statements:1,count:0},{startLine:369,startColumn:2,endLine:369,endColumn:17,statements:1,count:0},{startLine:372,startColumn:2,endLine:373,endColumn:39,statements:2,count:0},{startLine:374,startColumn:3,endLine:374,endColumn:55,statements:1,count:0},{startLine:375,startColumn:4,endLine:376,endColumn:1,statements:1,count:0},{startLine:377,startColumn:4,endLine:378,endColumn:1,statements:1,count:0},{startLine:380,startColumn:2,endLine:380,endColumn:38,statements:1,count:0},{startLine:383,startColumn:2,endLine:384,endColumn:1,statements:1,count:0},{startLine:386,startColumn:2,endLine:386,endColumn:29,statements:1,count:0},{startLine:387,startColumn:3,endLine:388,endColumn:1,statements:1,count:0},{startLine:389,startColumn:2,endLine:390,endColumn:16,statements:2,count:0},{startLine:391,startColumn:3,endLine:392,endColumn:1,statements:1,count:0},{startLine:393,startColumn:2,endLine:393,endColumn:18,statements:1,count:0},{startLine:394,startColumn:3,endLine:395,endColumn:1,statements:1,count:0},{startLine:396,startColumn:2,endLine:396,endColumn:40,statements:1,count:0},{startLine:397,startColumn:3,endLine:397,endColumn:55,statements:1,count:0},{startLine:398,startColumn:4,endLine:398,endColumn:67,statements:1,count:0},{startLine:399,startColumn:5,endLine:400,endColumn:1,statements:1,count:0},{startLine:402,startColumn:3,endLine:402,endColumn:51,statements:1,count:0},{startLine:404,startColumn:2,endLine:404,endColumn:36,statements:1,count:0},{startLine:405,startColumn:3,endLine:407,endColumn:17,statements:3,count:0},{startLine:408,startColumn:4,endLine:409,endColumn:1,statements:1,count:0},{startLine:410,startColumn:3,endLine:411,endColumn:46,statements:2,count:0},{startLine:412,startColumn:4,endLine:412,endColumn:28,statements:1,count:0},{startLine:414,startColumn:5,endLine:414,endColumn:30,statements:1,count:0},{startLine:415,startColumn:6,endLine:416,endColumn:1,statements:1,count:0},{startLine:418,startColumn:5,endLine:418,endColumn:73,statements:1,count:0},{startLine:419,startColumn:6,endLine:420,endColumn:39,statements:2,count:0},{startLine:421,startColumn:7,endLine:422,endColumn:1,statements:1,count:0},{startLine:425,startColumn:4,endLine:425,endColumn:15,statements:1,count:0},{startLine:427,startColumn:3,endLine:427,endColumn:15,statements:1,count:0},{startLine:428,startColumn:4,endLine:429,endColumn:1,statements:1,count:0},{startLine:431,startColumn:2,endLine:431,endColumn:72,statements:1,count:0}]},{path:`tools/requirements-site/main.go`,sha256:`b9c128ced994b37095175d2d36913e01555f205a7861462258b72d9d7dd7f09d`,source:`// Command requirements-site builds a public, requirement-by-requirement evidence site.
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
`,blocks:[{startLine:12,startColumn:2,endLine:12,endColumn:41,statements:1,count:0},{startLine:13,startColumn:3,endLine:15,endColumn:1,statements:2,count:0},{startLine:18,startColumn:2,endLine:25,endColumn:38,statements:8,count:0},{startLine:26,startColumn:3,endLine:27,endColumn:1,statements:1,count:0},{startLine:28,startColumn:2,endLine:28,endColumn:15,statements:1,count:0},{startLine:29,startColumn:3,endLine:30,endColumn:1,statements:1,count:0},{startLine:31,startColumn:2,endLine:31,endColumn:13,statements:1,count:0},{startLine:32,startColumn:3,endLine:33,endColumn:1,statements:1,count:0},{startLine:34,startColumn:2,endLine:34,endColumn:21,statements:1,count:0},{startLine:35,startColumn:3,endLine:36,endColumn:1,statements:1,count:0},{startLine:37,startColumn:2,endLine:37,endColumn:46,statements:1,count:0}]},{path:`tools/requirements-site/verify.go`,sha256:`9856c7983ec7f3372d1f8343ef0d0e7c52caf4a797d60601a7211cd13cbf1a57`,source:`package main

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

var publicFiles = map[string]bool{"index.html": true, "results/index.html": true, "build/index.html": true, "assets/style.css": true, "assets/site.js": true, "assignment.md": true, "verification.json": true, "results/results.json": true, ".nojekyll": true, "SHA256SUMS": true}

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
`,blocks:[{startLine:20,startColumn:2,endLine:21,endColumn:32,statements:2,count:0},{startLine:22,startColumn:3,endLine:23,endColumn:1,statements:1,count:0},{startLine:24,startColumn:2,endLine:28,endColumn:1,statements:1,count:0},{startLine:29,startColumn:2,endLine:30,endColumn:49,statements:2,count:0},{startLine:31,startColumn:3,endLine:32,endColumn:1,statements:1,count:0},{startLine:33,startColumn:2,endLine:33,endColumn:51,statements:1,count:0},{startLine:34,startColumn:3,endLine:35,endColumn:1,statements:1,count:0},{startLine:36,startColumn:2,endLine:36,endColumn:107,statements:1,count:0},{startLine:37,startColumn:3,endLine:38,endColumn:1,statements:1,count:0},{startLine:39,startColumn:2,endLine:40,endColumn:90,statements:2,count:0},{startLine:41,startColumn:3,endLine:42,endColumn:1,statements:1,count:0},{startLine:43,startColumn:2,endLine:43,endColumn:51,statements:1,count:0},{startLine:44,startColumn:3,endLine:45,endColumn:1,statements:1,count:0},{startLine:46,startColumn:2,endLine:47,endColumn:39,statements:2,count:0},{startLine:48,startColumn:3,endLine:48,endColumn:109,statements:1,count:0},{startLine:49,startColumn:4,endLine:50,endColumn:1,statements:1,count:0},{startLine:51,startColumn:3,endLine:51,endColumn:23,statements:1,count:0},{startLine:53,startColumn:2,endLine:54,endColumn:21,statements:2,count:0},{startLine:64,startColumn:2,endLine:65,endColumn:16,statements:2,count:0},{startLine:66,startColumn:3,endLine:67,endColumn:1,statements:1,count:0},{startLine:68,startColumn:2,endLine:70,endColumn:35,statements:3,count:0},{startLine:71,startColumn:3,endLine:71,endColumn:33,statements:1,count:0},{startLine:72,startColumn:4,endLine:72,endColumn:24,statements:1,count:0},{startLine:73,startColumn:5,endLine:74,endColumn:1,statements:1,count:0},{startLine:75,startColumn:4,endLine:75,endColumn:48,statements:1,count:0},{startLine:76,startColumn:5,endLine:77,endColumn:1,statements:1,count:0},{startLine:78,startColumn:4,endLine:78,endColumn:29,statements:1,count:0},{startLine:79,startColumn:5,endLine:79,endColumn:18,statements:1,count:0},{startLine:81,startColumn:6,endLine:81,endColumn:22,statements:1,count:0},{startLine:82,startColumn:7,endLine:83,endColumn:1,statements:1,count:0},{startLine:84,startColumn:6,endLine:84,endColumn:25,statements:1,count:0},{startLine:86,startColumn:6,endLine:86,endColumn:38,statements:1,count:0},{startLine:88,startColumn:6,endLine:88,endColumn:43,statements:1,count:0},{startLine:89,startColumn:7,endLine:90,endColumn:1,statements:1,count:0},{startLine:92,startColumn:6,endLine:92,endColumn:49,statements:1,count:0},{startLine:93,startColumn:7,endLine:94,endColumn:1,statements:1,count:0},{startLine:98,startColumn:3,endLine:98,endColumn:70,statements:1,count:0},{startLine:99,startColumn:4,endLine:99,endColumn:39,statements:1,count:0},{startLine:100,startColumn:5,endLine:101,endColumn:1,statements:1,count:0},{startLine:103,startColumn:3,endLine:103,endColumn:13,statements:1,count:0},{startLine:105,startColumn:2,endLine:105,endColumn:23,statements:1,count:0},{startLine:108,startColumn:2,endLine:109,endColumn:16,statements:2,count:0},{startLine:110,startColumn:3,endLine:111,endColumn:1,statements:1,count:0},{startLine:112,startColumn:2,endLine:112,endColumn:85,statements:1,count:0},{startLine:113,startColumn:3,endLine:113,endColumn:17,statements:1,count:0},{startLine:114,startColumn:4,endLine:115,endColumn:1,statements:1,count:0},{startLine:116,startColumn:3,endLine:116,endColumn:16,statements:1,count:0},{startLine:117,startColumn:4,endLine:118,endColumn:1,statements:1,count:0},{startLine:119,startColumn:3,endLine:120,endColumn:17,statements:2,count:0},{startLine:121,startColumn:4,endLine:122,endColumn:1,statements:1,count:0},{startLine:123,startColumn:3,endLine:123,endColumn:43,statements:1,count:0},{startLine:124,startColumn:4,endLine:125,endColumn:1,statements:1,count:0},{startLine:126,startColumn:3,endLine:127,endColumn:17,statements:2,count:0},{startLine:128,startColumn:4,endLine:129,endColumn:1,statements:1,count:0},{startLine:130,startColumn:3,endLine:130,endColumn:31,statements:1,count:0},{startLine:131,startColumn:4,endLine:132,endColumn:1,statements:1,count:0},{startLine:133,startColumn:3,endLine:133,endColumn:13,statements:1,count:0},{startLine:135,startColumn:3,endLine:136,endColumn:1,statements:1,count:0},{startLine:137,startColumn:2,endLine:137,endColumn:46,statements:1,count:0},{startLine:138,startColumn:3,endLine:139,endColumn:1,statements:1,count:0},{startLine:140,startColumn:2,endLine:141,endColumn:28,statements:2,count:0},{startLine:142,startColumn:3,endLine:143,endColumn:42,statements:2,count:0},{startLine:144,startColumn:4,endLine:145,endColumn:1,statements:1,count:0},{startLine:146,startColumn:3,endLine:146,endColumn:174,statements:1,count:0},{startLine:147,startColumn:4,endLine:147,endColumn:12,statements:1,count:0},{startLine:149,startColumn:3,endLine:150,endColumn:17,statements:2,count:0},{startLine:151,startColumn:4,endLine:152,endColumn:1,statements:1,count:0},{startLine:153,startColumn:3,endLine:155,endColumn:57,statements:3,count:0},{startLine:156,startColumn:4,endLine:157,endColumn:1,statements:1,count:0},{startLine:158,startColumn:3,endLine:158,endColumn:64,statements:1,count:0},{startLine:159,startColumn:4,endLine:160,endColumn:1,statements:1,count:0},{startLine:161,startColumn:3,endLine:161,endColumn:18,statements:1,count:0},{startLine:163,startColumn:2,endLine:163,endColumn:40,statements:1,count:0},{startLine:166,startColumn:2,endLine:166,endColumn:29,statements:1,count:0},{startLine:167,startColumn:3,endLine:167,endColumn:32,statements:1,count:0},{startLine:168,startColumn:4,endLine:169,endColumn:18,statements:2,count:0},{startLine:170,startColumn:5,endLine:171,endColumn:1,statements:1,count:0},{startLine:172,startColumn:4,endLine:172,endColumn:22,statements:1,count:0},{startLine:173,startColumn:5,endLine:173,endColumn:131,statements:1,count:0},{startLine:174,startColumn:6,endLine:175,endColumn:1,statements:1,count:0},{startLine:176,startColumn:5,endLine:176,endColumn:13,statements:1,count:0},{startLine:178,startColumn:4,endLine:178,endColumn:64,statements:1,count:0},{startLine:179,startColumn:5,endLine:180,endColumn:1,statements:1,count:0},{startLine:181,startColumn:4,endLine:182,endColumn:25,statements:2,count:0},{startLine:183,startColumn:5,endLine:184,endColumn:1,statements:1,count:0},{startLine:184,startColumn:11,endLine:184,endColumn:66,statements:1,count:0},{startLine:185,startColumn:5,endLine:186,endColumn:1,statements:1,count:0},{startLine:187,startColumn:4,endLine:187,endColumn:32,statements:1,count:0},{startLine:188,startColumn:5,endLine:189,endColumn:1,statements:1,count:0},{startLine:190,startColumn:4,endLine:191,endColumn:23,statements:2,count:0},{startLine:192,startColumn:5,endLine:193,endColumn:1,statements:1,count:0},{startLine:194,startColumn:4,endLine:194,endColumn:67,statements:1,count:0},{startLine:195,startColumn:5,endLine:196,endColumn:1,statements:1,count:0},{startLine:199,startColumn:2,endLine:199,endColumn:12,statements:1,count:0}]}],g=`286105d32ced625ad26a3e940f02665f0e456255ff27db20a473ccc47dfe507f`,_=`c06a7e0bac2e27857ea3d7c5d7b9ea7799c0419fda228c05536f1975fda253e2`,v={id:r,suite:i,name:a,sha:o,status:s,asserts:``,sourceURL:c,package:`github.com/newdarwindev/firm-payments/tools/requirements-site`,command:l,build:u,binarySHA256:d,selected:f,executed:p,group:!1,scope:m,total:551,covered:4,files:h,profileSHA256:g,gifSHA256:_}})))()}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),y(),{expect:b,userEvent:x,within:S,waitFor:C}=__STORYBOOK_MODULE_TEST__,w=v,T={id:`case-unit-d162a664786b52ae`,title:`Cases/unit/TestSiteMarkdownDoesNotExecuteHTMLOrScriptURLs`,component:n,args:{evidence:w,mediaBase:`../cases/unit-d162a664786b52ae/`}},E={play:async({canvasElement:e})=>{let t=S(e);if(await b(t.getByRole(`heading`,{name:w.name})).toBeVisible(),await b(t.getByRole(`status`)).toHaveTextContent(`PASS`),await b(t.getByRole(`status`)).toHaveTextContent(w.total?w.covered+` / `+w.total+` Go statements covered`:`No instrumented Go statements`),w.files.length){let e=w.files[w.files.length-1];await x.selectOptions(t.getByRole(`combobox`,{name:`Source file`}),e.path),await b(t.getByLabelText(`Source code: `+e.path)).toBeVisible(),await b(t.getByText(`Source SHA256: `+e.sha256)).toBeVisible(),await b(t.getByRole(`link`,{name:`Line 1`})).toHaveAttribute(`href`,`#L1`)}t.getByRole(`button`,{name:`Play terminal recording`}).focus(),await x.keyboard(`{Enter}`);let n=t.getByAltText(`Terminal execution of `+w.name);await C(()=>b(n.complete&&n.naturalWidth>0).toBe(!0)),await x.click(t.getByRole(`button`,{name:`Pause terminal recording`}))}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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