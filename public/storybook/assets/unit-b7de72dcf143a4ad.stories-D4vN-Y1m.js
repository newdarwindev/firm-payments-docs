import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`unit-b7de72dcf143a4ad`,p=`unit`,m=`TestFunctionalEvidenceFailsClosed/failed`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/tools/evidence/main_test.go#L24`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/tools/evidence`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/b92f04025ce47388.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestFunctionalEvidenceFailsClosed$/^failed$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/unit-b7de72dcf143a4ad/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/b92f04025ce47388.test`,`-cover`,`-covermode=atomic`,`.`],b=`1dcf6c84766f614282820eed98b380bcd8c979fbedc67857b75e02303a2f65f1`,x=`TestFunctionalEvidenceFailsClosed/failed`,S=[`TestFunctionalEvidenceFailsClosed`,`TestFunctionalEvidenceFailsClosed/failed`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[{path:`tools/evidence/main.go`,sha256:`2b211cca8b0c139867771da337a9dedeb044cfb80b8168459063fb65bc1dfee9`,source:`// Command evidence turns actual Go test events and coverage counters into build artifacts.
package main

import (
	"bufio"
	"encoding/json"
	"encoding/xml"
	"errors"
	"flag"
	"fmt"
	"html/template"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

type testCase struct {
	Name    string  \`json:"name"\`
	Asserts string  \`json:"asserts"\`
	Status  string  \`json:"status,omitempty"\`
	Seconds float64 \`json:"seconds,omitempty"\`
	Output  string  \`json:"output,omitempty"\`
}
type testEvent struct {
	Action, Package, Test, Output string
	Elapsed                       float64
}
type report struct {
	Revision      string     \`json:"revision"\`
	Passed        int        \`json:"passed"\`
	Total         int        \`json:"total"\`
	PackagePassed bool       \`json:"package_passed"\`
	Cases         []testCase \`json:"cases"\`
}

func main() {
	if err := run(os.Args[1:], os.Stdin); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
func run(args []string, input io.Reader) error {
	if len(args) == 0 {
		return errors.New("usage: evidence functional|catalogue|coverage")
	}
	flags := flag.NewFlagSet(args[0], flag.ContinueOnError)
	catalogue := flags.String("catalogue", "testdata/functional-cases.json", "expected functional cases")
	out := flags.String("out", "artifacts/functional", "artifact directory")
	revision := flags.String("revision", "working-tree", "source revision")
	terminal := flags.Bool("terminal", false, "render live terminal dashboard")
	if err := flags.Parse(args[1:]); err != nil {
		return err
	}
	switch args[0] {
	case "functional":
		cases, err := loadCases(*catalogue)
		if err != nil {
			return err
		}
		r, checkErr := consume(input, cases, *revision, *terminal)
		if err := writeReport(*out, r); err != nil {
			return err
		}
		return checkErr
	case "catalogue":
		cases, err := loadCases(*catalogue)
		if err != nil {
			return err
		}
		var b strings.Builder
		b.WriteString("# Functional test catalogue\\n\\nEach case runs through actual Go service executables and PostgreSQL. Upstream fault cases use real Nginx redirects/rate limits and PostgreSQL row locks. No case may be skipped or missing from a successful build.\\n\\n| Test name (\`TestFunctional/…\`) | Assertions |\\n| --- | --- |\\n")
		for _, c := range cases {
			fmt.Fprintf(&b, "| \`%s\` | %s |\\n", c.Name, strings.ReplaceAll(c.Asserts, "|", "\\\\|"))
		}
		return os.WriteFile(*out, []byte(b.String()), 0o644)
	case "coverage":
		return coverage(*out, flags.Args())
	default:
		return errors.New("unknown evidence command")
	}
}
func loadCases(path string) ([]testCase, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var cases []testCase
	if err := json.Unmarshal(data, &cases); err != nil {
		return nil, err
	}
	if len(cases) == 0 {
		return nil, errors.New("empty functional catalogue")
	}
	seen := map[string]bool{}
	for i := range cases {
		c := &cases[i]
		if c.Name == "" || c.Asserts == "" || seen[c.Name] {
			return nil, errors.New("missing or duplicate functional specification")
		}
		seen[c.Name] = true
		c.Status = "queued"
	}
	return cases, nil
}
func consume(input io.Reader, cases []testCase, revision string, terminal bool) (report, error) {
	r := report{Revision: revision, Cases: cases, Total: len(cases)}
	indices := map[string]int{}
	for i, c := range cases {
		indices["TestFunctional/"+c.Name] = i
	}
	packageFailed := false
	unexpected := false
	if terminal {
		defer fmt.Print("\\033[?25h")
		render(r)
	}
	scanner := bufio.NewScanner(input)
	scanner.Buffer(make([]byte, 4096), 8<<20)
	for scanner.Scan() {
		var e testEvent
		if err := json.Unmarshal(scanner.Bytes(), &e); err != nil {
			return r, fmt.Errorf("invalid test event: %w", err)
		}
		if e.Package != "github.com/newdarwindev/firm-payments/tests/functional" {
			return r, errors.New("unexpected test package")
		}
		if e.Test == "" {
			if e.Action == "pass" {
				r.PackagePassed = true
			}
			if e.Action == "fail" {
				packageFailed = true
			}
		}
		if i, ok := indices[e.Test]; ok {
			c := &r.Cases[i]
			switch e.Action {
			case "run":
				if c.Status != "queued" {
					return r, errors.New("duplicate case execution")
				}
				c.Status = "running"
			case "pass", "fail", "skip":
				if c.Status != "running" {
					return r, errors.New("case completed without starting")
				}
				c.Status = e.Action
				c.Seconds = e.Elapsed
				if e.Action == "pass" {
					r.Passed++
				}
			case "output":
				c.Output += e.Output
			}
			if terminal && e.Action != "output" {
				render(r)
			}
		} else if strings.HasPrefix(e.Test, "TestFunctional/") {
			unexpected = true
		}
	}
	if err := scanner.Err(); err != nil {
		return r, err
	}
	if terminal {
		render(r)
	}
	if packageFailed || !r.PackagePassed || unexpected || r.Passed != r.Total {
		return r, fmt.Errorf("functional evidence incomplete: %d/%d passed, package passed=%v, package failed=%v, unexpected cases=%v", r.Passed, r.Total, r.PackagePassed, packageFailed, unexpected)
	}
	return r, nil
}
func render(r report) {
	var b strings.Builder
	b.WriteString("\\033[?25l\\033[H\\033[2J\\033[1;36mFIRM PAYMENTS  |  LIVE FUNCTIONAL TEST RUN\\033[0m\\n")
	fmt.Fprintf(&b, "Revision: %s\\nTwo API processes + two ledger processes + real PostgreSQL\\nActual go test -json events; rejected requests assert unchanged database state.\\n\\n", r.Revision)
	half := (len(r.Cases) + 1) / 2
	cell := func(c testCase) string {
		color := "\\033[90m"
		switch c.Status {
		case "pass":
			color = "\\033[32m"
		case "fail", "skip":
			color = "\\033[31m"
		case "running":
			color = "\\033[33m"
		}
		return fmt.Sprintf("%s%-7s %-43s %5.2fs\\033[0m", color, strings.ToUpper(c.Status), c.Name, c.Seconds)
	}
	for i := range half {
		b.WriteString(cell(r.Cases[i]))
		if j := i + half; j < len(r.Cases) {
			b.WriteString("   ")
			b.WriteString(cell(r.Cases[j]))
		}
		b.WriteByte('\\n')
	}
	fmt.Fprintf(&b, "\\nPASSED %d / %d | package success: %v\\n", r.Passed, r.Total, r.PackagePassed)
	if r.PackagePassed && r.Passed == r.Total {
		b.WriteString("\\033[1;32mALL FUNCTIONAL ASSERTIONS PASSED\\033[0m\\n")
	}
	fmt.Print(b.String())
}
func writeJSON(path string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(data, '\\n'), 0o644)
}
func writeReport(out string, r report) error {
	if err := os.MkdirAll(out, 0o755); err != nil {
		return err
	}
	if err := writeJSON(filepath.Join(out, "results.json"), r); err != nil {
		return err
	}
	type xmlCase struct {
		Name    string  \`xml:"name,attr"\`
		Time    float64 \`xml:"time,attr"\`
		Failure *string \`xml:"failure,omitempty"\`
		Output  string  \`xml:"system-out"\`
	}
	type xmlSuite struct {
		XMLName  xml.Name  \`xml:"testsuite"\`
		Name     string    \`xml:"name,attr"\`
		Tests    int       \`xml:"tests,attr"\`
		Failures int       \`xml:"failures,attr"\`
		Cases    []xmlCase \`xml:"testcase"\`
	}
	x := xmlSuite{Name: "functional", Tests: r.Total}
	for _, c := range r.Cases {
		xc := xmlCase{Name: c.Name, Time: c.Seconds, Output: c.Output}
		if c.Status != "pass" {
			message := "Case did not pass: " + c.Status
			xc.Failure = &message
			x.Failures++
		}
		x.Cases = append(x.Cases, xc)
	}
	data, err := xml.MarshalIndent(x, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(out, "junit.xml"), append([]byte(xml.Header), data...), 0o644); err != nil {
		return err
	}
	const page = \`<!doctype html><html lang="en"><meta charset="utf-8"><title>Functional test evidence</title><style>body{font:16px system-ui;background:#10151d;color:#e7edf6;max-width:1250px;margin:40px auto;padding:0 24px}a{color:#8dc6ff}table{border-collapse:collapse;width:100%}td,th{padding:12px;border-bottom:1px solid #354256;text-align:left;vertical-align:top}code{font-size:13px}.pass{color:#8de4aa}.fail,.skip,.queued,.running{color:#ffa4a4}video{width:100%}</style><h1>Functional test evidence</h1><p>Revision <code>{{.Revision}}</code> · {{.Passed}} / {{.Total}} passed · package success: {{.PackagePassed}}</p><video controls preload="metadata" src="functional-tests.mp4" poster="functional-tests-poster.png"></video><p><a href="results.json">JSON results</a> · <a href="junit.xml">JUnit</a> · <a href="functional-tests.jsonl">Original test events</a> · <a href="coverage.html">Process coverage</a></p><table><tr><th>Test</th><th>Assertions</th><th>Actual status</th><th>Seconds</th></tr>{{range .Cases}}<tr><td><code>{{.Name}}</code></td><td>{{.Asserts}}</td><td class="{{.Status}}">{{.Status}}</td><td>{{printf "%.2f" .Seconds}}</td></tr>{{end}}</table></html>\`
	file, err := os.Create(filepath.Join(out, "index.html"))
	if err != nil {
		return err
	}
	tmpl, err := template.New("report").Parse(page)
	if err != nil {
		_ = file.Close()
		return err
	}
	return errors.Join(tmpl.Execute(file, r), file.Close())
}

type block struct {
	Key                 string
	Statements, Covered int64
}
type coverageResult struct {
	Name       string  \`json:"name"\`
	Statements int64   \`json:"statements"\`
	Covered    int64   \`json:"covered"\`
	Percent    float64 \`json:"percent"\`
}

func readProfile(path string) (map[string]block, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer func() { _ = f.Close() }()
	scanner := bufio.NewScanner(f)
	if !scanner.Scan() || scanner.Text() != "mode: atomic" {
		return nil, errors.New("coverage requires atomic mode")
	}
	blocks := map[string]block{}
	for scanner.Scan() {
		fields := strings.Fields(scanner.Text())
		if len(fields) != 3 {
			return nil, errors.New("invalid coverage block")
		}
		n, e1 := strconv.ParseInt(fields[1], 10, 64)
		count, e2 := strconv.ParseInt(fields[2], 10, 64)
		if e1 != nil || e2 != nil || n < 0 || count < 0 {
			return nil, errors.New("invalid coverage counters")
		}
		b := block{Key: fields[0], Statements: n}
		if count > 0 {
			b.Covered = n
		}
		if old, ok := blocks[b.Key]; ok {
			if old.Statements != n {
				return nil, errors.New("inconsistent coverage blocks")
			}
			if old.Covered > b.Covered {
				b.Covered = old.Covered
			}
		}
		blocks[b.Key] = b
	}
	if len(blocks) == 0 {
		return nil, errors.New("empty coverage profile")
	}
	return blocks, scanner.Err()
}
func summarize(name string, blocks map[string]block) coverageResult {
	r := coverageResult{Name: name}
	for _, b := range blocks {
		r.Statements += b.Statements
		r.Covered += b.Covered
	}
	if r.Statements > 0 {
		r.Percent = 100 * float64(r.Covered) / float64(r.Statements)
	}
	return r
}
func coverage(out string, paths []string) error {
	if len(paths) != 3 {
		return errors.New("coverage requires unit, database-integration and functional profiles")
	}
	if err := os.MkdirAll(out, 0o755); err != nil {
		return err
	}
	names := []string{"unit", "database-integration", "functional-processes"}
	results := []coverageResult{}
	combined := map[string]block{}
	for i, path := range paths {
		blocks, err := readProfile(path)
		if err != nil {
			return fmt.Errorf("%s: %w", path, err)
		}
		results = append(results, summarize(names[i], blocks))
		for key, b := range blocks {
			if !strings.Contains(key, "/internal/") && !strings.Contains(key, "/cmd/") {
				continue
			}
			old, ok := combined[key]
			if ok && old.Statements != b.Statements {
				return errors.New("incompatible combined coverage blocks")
			}
			if !ok || b.Covered > old.Covered {
				combined[key] = b
			}
		}
	}
	if len(combined) == 0 {
		return errors.New("no application coverage blocks")
	}
	total := summarize("application-union", combined)
	results = append(results, total)
	if err := writeJSON(filepath.Join(out, "summary.json"), results); err != nil {
		return err
	}
	keys := make([]string, 0, len(combined))
	for key := range combined {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	var profile strings.Builder
	profile.WriteString("mode: atomic\\n")
	for _, key := range keys {
		b := combined[key]
		count := 0
		if b.Covered > 0 {
			count = 1
		}
		fmt.Fprintf(&profile, "%s %d %d\\n", key, b.Statements, count)
	}
	if err := os.WriteFile(filepath.Join(out, "combined.out"), []byte(profile.String()), 0o644); err != nil {
		return err
	}
	var text strings.Builder
	text.WriteString("Coverage from actual counters. Union includes application cmd/internal packages, excludes test/report tooling.\\n")
	for _, r := range results {
		fmt.Fprintf(&text, "%-25s %6.2f%% (%d/%d statements)\\n", r.Name, r.Percent, r.Covered, r.Statements)
	}
	if err := os.WriteFile(filepath.Join(out, "summary.txt"), []byte(text.String()), 0o644); err != nil {
		return err
	}
	svg := fmt.Sprintf(\`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28" role="img" aria-label="Application coverage: %.1f%%"><rect width="220" height="28" rx="5" fill="#174d37"/><text x="110" y="19" fill="white" text-anchor="middle" font-family="Verdana" font-size="12">Application coverage: %.1f%%</text></svg>\`, total.Percent, total.Percent)
	return os.WriteFile(filepath.Join(out, "coverage.svg"), []byte(svg), 0o644)
}
`,blocks:[{startLine:40,startColumn:2,endLine:40,endColumn:51,statements:1,count:0},{startLine:41,startColumn:3,endLine:43,endColumn:1,statements:2,count:0},{startLine:46,startColumn:2,endLine:46,endColumn:20,statements:1,count:0},{startLine:47,startColumn:3,endLine:48,endColumn:1,statements:1,count:0},{startLine:49,startColumn:2,endLine:54,endColumn:46,statements:6,count:0},{startLine:55,startColumn:3,endLine:56,endColumn:1,statements:1,count:0},{startLine:57,startColumn:2,endLine:57,endColumn:17,statements:1,count:0},{startLine:59,startColumn:3,endLine:60,endColumn:17,statements:2,count:0},{startLine:61,startColumn:4,endLine:62,endColumn:1,statements:1,count:0},{startLine:63,startColumn:3,endLine:64,endColumn:46,statements:2,count:0},{startLine:65,startColumn:4,endLine:66,endColumn:1,statements:1,count:0},{startLine:67,startColumn:3,endLine:67,endColumn:18,statements:1,count:0},{startLine:69,startColumn:3,endLine:70,endColumn:17,statements:2,count:0},{startLine:71,startColumn:4,endLine:72,endColumn:1,statements:1,count:0},{startLine:73,startColumn:3,endLine:75,endColumn:27,statements:3,count:0},{startLine:76,startColumn:4,endLine:77,endColumn:1,statements:1,count:0},{startLine:78,startColumn:3,endLine:78,endColumn:55,statements:1,count:0},{startLine:80,startColumn:3,endLine:80,endColumn:38,statements:1,count:0},{startLine:82,startColumn:3,endLine:82,endColumn:48,statements:1,count:0},{startLine:86,startColumn:2,endLine:87,endColumn:16,statements:2,count:0},{startLine:88,startColumn:3,endLine:89,endColumn:1,statements:1,count:0},{startLine:90,startColumn:2,endLine:91,endColumn:53,statements:2,count:0},{startLine:92,startColumn:3,endLine:93,endColumn:1,statements:1,count:0},{startLine:94,startColumn:2,endLine:94,endColumn:21,statements:1,count:0},{startLine:95,startColumn:3,endLine:96,endColumn:1,statements:1,count:0},{startLine:97,startColumn:2,endLine:98,endColumn:23,statements:2,count:0},{startLine:99,startColumn:3,endLine:100,endColumn:54,statements:2,count:0},{startLine:101,startColumn:4,endLine:102,endColumn:1,statements:1,count:0},{startLine:103,startColumn:3,endLine:104,endColumn:22,statements:2,count:0},{startLine:106,startColumn:2,endLine:106,endColumn:19,statements:1,count:0},{startLine:109,startColumn:2,endLine:111,endColumn:26,statements:3,count:5},{startLine:112,startColumn:3,endLine:113,endColumn:1,statements:1,count:5},{startLine:114,startColumn:2,endLine:116,endColumn:14,statements:3,count:5},{startLine:117,startColumn:3,endLine:119,endColumn:1,statements:2,count:0},{startLine:120,startColumn:2,endLine:122,endColumn:21,statements:3,count:5},{startLine:123,startColumn:3,endLine:124,endColumn:61,statements:2,count:7},{startLine:125,startColumn:4,endLine:126,endColumn:1,statements:1,count:1},{startLine:127,startColumn:3,endLine:127,endColumn:76,statements:1,count:6},{startLine:128,startColumn:4,endLine:129,endColumn:1,statements:1,count:1},{startLine:130,startColumn:3,endLine:130,endColumn:19,statements:1,count:5},{startLine:131,startColumn:4,endLine:131,endColumn:26,statements:1,count:1},{startLine:132,startColumn:5,endLine:133,endColumn:1,statements:1,count:1},{startLine:134,startColumn:4,endLine:134,endColumn:26,statements:1,count:1},{startLine:135,startColumn:5,endLine:136,endColumn:1,statements:1,count:0},{startLine:138,startColumn:3,endLine:138,endColumn:35,statements:1,count:5},{startLine:139,startColumn:4,endLine:140,endColumn:20,statements:2,count:3},{startLine:142,startColumn:5,endLine:142,endColumn:29,statements:1,count:1},{startLine:143,startColumn:6,endLine:144,endColumn:1,statements:1,count:0},{startLine:145,startColumn:5,endLine:145,endColumn:25,statements:1,count:1},{startLine:147,startColumn:5,endLine:147,endColumn:30,statements:1,count:2},{startLine:148,startColumn:6,endLine:149,endColumn:1,statements:1,count:1},{startLine:150,startColumn:5,endLine:152,endColumn:27,statements:3,count:1},{startLine:153,startColumn:6,endLine:154,endColumn:1,statements:1,count:0},{startLine:156,startColumn:5,endLine:156,endColumn:25,statements:1,count:0},{startLine:158,startColumn:4,endLine:158,endColumn:40,statements:1,count:2},{startLine:159,startColumn:5,endLine:160,endColumn:1,statements:1,count:0},{startLine:161,startColumn:10,endLine:161,endColumn:58,statements:1,count:2},{startLine:162,startColumn:4,endLine:163,endColumn:1,statements:1,count:1},{startLine:165,startColumn:2,endLine:165,endColumn:38,statements:1,count:2},{startLine:166,startColumn:3,endLine:167,endColumn:1,statements:1,count:0},{startLine:168,startColumn:2,endLine:168,endColumn:14,statements:1,count:2},{startLine:169,startColumn:3,endLine:170,endColumn:1,statements:1,count:0},{startLine:171,startColumn:2,endLine:171,endColumn:76,statements:1,count:2},{startLine:172,startColumn:3,endLine:173,endColumn:1,statements:1,count:2},{startLine:174,startColumn:2,endLine:174,endColumn:15,statements:1,count:0},{startLine:177,startColumn:2,endLine:181,endColumn:34,statements:5,count:0},{startLine:182,startColumn:3,endLine:183,endColumn:19,statements:2,count:0},{startLine:185,startColumn:4,endLine:185,endColumn:22,statements:1,count:0},{startLine:187,startColumn:4,endLine:187,endColumn:22,statements:1,count:0},{startLine:189,startColumn:4,endLine:189,endColumn:22,statements:1,count:0},{startLine:191,startColumn:3,endLine:191,endColumn:104,statements:1,count:0},{startLine:193,startColumn:2,endLine:193,endColumn:22,statements:1,count:0},{startLine:194,startColumn:3,endLine:195,endColumn:38,statements:2,count:0},{startLine:196,startColumn:4,endLine:198,endColumn:1,statements:2,count:0},{startLine:199,startColumn:3,endLine:199,endColumn:20,statements:1,count:0},{startLine:201,startColumn:2,endLine:202,endColumn:44,statements:2,count:0},{startLine:203,startColumn:3,endLine:204,endColumn:1,statements:1,count:0},{startLine:205,startColumn:2,endLine:205,endColumn:23,statements:1,count:0},{startLine:208,startColumn:2,endLine:209,endColumn:16,statements:2,count:0},{startLine:210,startColumn:3,endLine:211,endColumn:1,statements:1,count:0},{startLine:212,startColumn:2,endLine:212,endColumn:54,statements:1,count:0},{startLine:215,startColumn:2,endLine:215,endColumn:48,statements:1,count:0},{startLine:216,startColumn:3,endLine:217,endColumn:1,statements:1,count:0},{startLine:218,startColumn:2,endLine:218,endColumn:73,statements:1,count:0},{startLine:219,startColumn:3,endLine:220,endColumn:1,statements:1,count:0},{startLine:221,startColumn:2,endLine:226,endColumn:1,statements:1,count:0},{startLine:227,startColumn:2,endLine:233,endColumn:1,statements:1,count:0},{startLine:234,startColumn:2,endLine:235,endColumn:28,statements:2,count:0},{startLine:236,startColumn:3,endLine:237,endColumn:25,statements:2,count:0},{startLine:238,startColumn:4,endLine:241,endColumn:1,statements:3,count:0},{startLine:242,startColumn:3,endLine:242,endColumn:32,statements:1,count:0},{startLine:244,startColumn:2,endLine:245,endColumn:16,statements:2,count:0},{startLine:246,startColumn:3,endLine:247,endColumn:1,statements:1,count:0},{startLine:248,startColumn:2,endLine:248,endColumn:114,statements:1,count:0},{startLine:249,startColumn:3,endLine:250,endColumn:1,statements:1,count:0},{startLine:251,startColumn:2,endLine:253,endColumn:16,statements:3,count:0},{startLine:254,startColumn:3,endLine:255,endColumn:1,statements:1,count:0},{startLine:256,startColumn:2,endLine:257,endColumn:16,statements:2,count:0},{startLine:258,startColumn:3,endLine:260,endColumn:1,statements:2,count:0},{startLine:261,startColumn:2,endLine:261,endColumn:57,statements:1,count:0},{startLine:276,startColumn:2,endLine:277,endColumn:16,statements:2,count:0},{startLine:278,startColumn:3,endLine:279,endColumn:1,statements:1,count:0},{startLine:280,startColumn:2,endLine:280,endColumn:15,statements:1,count:0},{startLine:280,startColumn:17,endLine:280,endColumn:32,statements:1,count:0},{startLine:281,startColumn:2,endLine:282,endColumn:57,statements:2,count:0},{startLine:283,startColumn:3,endLine:284,endColumn:1,statements:1,count:0},{startLine:285,startColumn:2,endLine:286,endColumn:21,statements:2,count:0},{startLine:287,startColumn:3,endLine:288,endColumn:23,statements:2,count:0},{startLine:289,startColumn:4,endLine:290,endColumn:1,statements:1,count:0},{startLine:291,startColumn:3,endLine:293,endColumn:51,statements:3,count:0},{startLine:294,startColumn:4,endLine:295,endColumn:1,statements:1,count:0},{startLine:296,startColumn:3,endLine:297,endColumn:16,statements:2,count:0},{startLine:298,startColumn:4,endLine:299,endColumn:1,statements:1,count:0},{startLine:300,startColumn:3,endLine:300,endColumn:35,statements:1,count:0},{startLine:301,startColumn:4,endLine:301,endColumn:27,statements:1,count:0},{startLine:302,startColumn:5,endLine:303,endColumn:1,statements:1,count:0},{startLine:304,startColumn:4,endLine:304,endColumn:31,statements:1,count:0},{startLine:305,startColumn:5,endLine:306,endColumn:1,statements:1,count:0},{startLine:308,startColumn:3,endLine:308,endColumn:20,statements:1,count:0},{startLine:310,startColumn:2,endLine:310,endColumn:22,statements:1,count:0},{startLine:311,startColumn:3,endLine:312,endColumn:1,statements:1,count:0},{startLine:313,startColumn:2,endLine:313,endColumn:30,statements:1,count:0},{startLine:316,startColumn:2,endLine:317,endColumn:27,statements:2,count:0},{startLine:318,startColumn:3,endLine:320,endColumn:1,statements:2,count:0},{startLine:321,startColumn:2,endLine:321,endColumn:22,statements:1,count:0},{startLine:322,startColumn:3,endLine:323,endColumn:1,statements:1,count:0},{startLine:324,startColumn:2,endLine:324,endColumn:10,statements:1,count:0},{startLine:327,startColumn:2,endLine:327,endColumn:21,statements:1,count:0},{startLine:328,startColumn:3,endLine:329,endColumn:1,statements:1,count:0},{startLine:330,startColumn:2,endLine:330,endColumn:48,statements:1,count:0},{startLine:331,startColumn:3,endLine:332,endColumn:1,statements:1,count:0},{startLine:333,startColumn:2,endLine:336,endColumn:29,statements:4,count:0},{startLine:337,startColumn:3,endLine:338,endColumn:17,statements:2,count:0},{startLine:339,startColumn:4,endLine:340,endColumn:1,statements:1,count:0},{startLine:341,startColumn:3,endLine:342,endColumn:30,statements:2,count:0},{startLine:343,startColumn:4,endLine:343,endColumn:79,statements:1,count:0},{startLine:344,startColumn:5,endLine:344,endColumn:13,statements:1,count:0},{startLine:346,startColumn:4,endLine:347,endColumn:44,statements:2,count:0},{startLine:348,startColumn:5,endLine:349,endColumn:1,statements:1,count:0},{startLine:350,startColumn:4,endLine:350,endColumn:38,statements:1,count:0},{startLine:351,startColumn:5,endLine:352,endColumn:1,statements:1,count:0},{startLine:355,startColumn:2,endLine:355,endColumn:24,statements:1,count:0},{startLine:356,startColumn:3,endLine:357,endColumn:1,statements:1,count:0},{startLine:358,startColumn:2,endLine:360,endColumn:79,statements:3,count:0},{startLine:361,startColumn:3,endLine:362,endColumn:1,statements:1,count:0},{startLine:363,startColumn:2,endLine:364,endColumn:28,statements:2,count:0},{startLine:365,startColumn:3,endLine:366,endColumn:1,statements:1,count:0},{startLine:367,startColumn:2,endLine:370,endColumn:27,statements:4,count:0},{startLine:371,startColumn:3,endLine:373,endColumn:20,statements:3,count:0},{startLine:374,startColumn:4,endLine:375,endColumn:1,statements:1,count:0},{startLine:376,startColumn:3,endLine:376,endColumn:64,statements:1,count:0},{startLine:378,startColumn:2,endLine:378,endColumn:106,statements:1,count:0},{startLine:379,startColumn:3,endLine:380,endColumn:1,statements:1,count:0},{startLine:381,startColumn:2,endLine:383,endColumn:28,statements:3,count:0},{startLine:384,startColumn:3,endLine:385,endColumn:1,statements:1,count:0},{startLine:386,startColumn:2,endLine:386,endColumn:102,statements:1,count:0},{startLine:387,startColumn:3,endLine:388,endColumn:1,statements:1,count:0},{startLine:389,startColumn:2,endLine:390,endColumn:77,statements:2,count:0}]}],T=[{path:`tools/evidence/main_test.go`,label:`Selected test / case body · TestFunctionalEvidenceFailsClosed`,source:`func TestFunctionalEvidenceFailsClosed(t *testing.T) {
	pkg := "github.com/newdarwindev/firm-payments/tests/functional"
	for _, tc := range []struct {
		name, action             string
		packagePass, include, ok bool
	}{{"passed", "pass", true, true, true}, {"failed", "fail", false, true, false}, {"skipped", "skip", true, true, false}, {"missing", "pass", true, false, false}, {"missing package result", "pass", false, true, false}} {
		t.Run(tc.name, func(t *testing.T) {
			events := []testEvent{}
			if tc.include {
				events = append(events, testEvent{Package: pkg, Test: "TestFunctional/One", Action: "run"}, testEvent{Package: pkg, Test: "TestFunctional/One", Action: tc.action})
			}
			if tc.packagePass {
				events = append(events, testEvent{Package: pkg, Action: "pass"})
			}
			r, err := consume(strings.NewReader(stream(t, events...)), []testCase{{Name: "One", Asserts: "Database unchanged", Status: "queued"}}, "revision", false)
			if (err == nil) != tc.ok {
				t.Fatalf("passed=%d, error=%v", r.Passed, err)
			}
		})
	}
	for _, input := range []string{"not JSON", stream(t, testEvent{Package: "wrong", Action: "pass"}), stream(t, testEvent{Package: pkg, Test: "TestFunctional/One", Action: "pass"}), stream(t, testEvent{Package: pkg, Test: "TestFunctional/Other", Action: "pass"}, testEvent{Package: pkg, Action: "pass"})} {
		if _, err := consume(strings.NewReader(input), []testCase{{Name: "One", Status: "queued"}}, "x", false); err == nil {
			t.Fatal("invalid evidence accepted")
		}
	}
}`,sha256:`49f4bc5bd48a5a40fc78d28f1738e804cc5335d8ae89463d815b36ba0b506829`,startLine:24,endLine:49,assertLines:[40,46]},{path:`tools/evidence/main_test.go`,label:`Referenced test helper (static call graph) · stream`,source:`func stream(t *testing.T, events ...testEvent) string {
	t.Helper()
	var b strings.Builder
	for _, e := range events {
		data, err := json.Marshal(e)
		if err != nil {
			t.Fatal(err)
		}
		b.Write(data)
		b.WriteByte('\\n')
	}
	return b.String()
}`,sha256:`49f4bc5bd48a5a40fc78d28f1738e804cc5335d8ae89463d815b36ba0b506829`,startLine:11,endLine:23,assertLines:[17]}],E=`273545adfdd230bdedfc72ffd4694fb3fe283a84028fb6878c0c6ffa56a25106`,D=`cca68a6e283ba7bc45e50755d65361a1e7964fd64639382767be172fad9063fc`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/tools/evidence`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:229,covered:36,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-unit-b7de72dcf143a4ad`,title:`Cases/unit/TestFunctionalEvidenceFailsClosed/failed`,component:d,args:{evidence:j,mediaBase:`../cases/unit-b7de72dcf143a4ad/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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