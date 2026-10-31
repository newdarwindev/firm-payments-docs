import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,f as r,h as i,i as a,m as o,n as s,p as c,t as l}from"./checks-B8kzV49f.js";import{n as u,t as d}from"./TestEvidence-BUEsn1nT.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{f=`exporter-4c9c8477e9416bf6`,p=`exporter`,m=`TestRecoverInterruptedManifestWrite`,h=`950b17fe1bc52dace1db4bba3a35007ba891d097`,g=`pass`,_=`https://github.com/newdarwindev/firm-payments/blob/950b17fe1bc52dace1db4bba3a35007ba891d097/docs/internal/dialog/dialog_test.go#L94`,v=[`go`,`tool`,`test2json`,`-t`,`-p`,`github.com/newdarwindev/firm-payments/docs/internal/dialog`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/83f04d902701b3fe.test`,`-test.v=test2json`,`-test.count=1`,`-test.timeout=180s`,`-test.run=^TestRecoverInterruptedManifestWrite$`,`-test.coverprofile=/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/runs/exporter-4c9c8477e9416bf6/coverage.out`],y=[`go`,`test`,`-c`,`-o`,`/home/runner/work/firm-payments/firm-payments/artifacts/test-evidence/bin/83f04d902701b3fe.test`,`-cover`,`-covermode=atomic`,`.`],b=`2abb97c6cb8bba2153c7f10e44c4830898876ecc2ddf0b4ebc09e422f267d7dc`,x=`TestRecoverInterruptedManifestWrite`,S=[`TestRecoverInterruptedManifestWrite`],C=`Go package test; includes parent setup and teardown. Unit tests may use test doubles. Full-suite race checks run separately.`,w=[{path:`docs/internal/dialog/dialog.go`,sha256:`00d9d183385574ff0742545408b1c0b7938314abed35fc549636f89c127aac46`,source:`// Package dialog preserves conversation records and generates a literal-text PDF source.
package dialog

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"
)

type Record struct {
	Type    string \`json:"type"\`
	Payload struct {
		Type    string \`json:"type"\`
		Role    string \`json:"role"\`
		Channel string \`json:"channel"\`
		Content []struct {
			Type string \`json:"type"\`
			Text string \`json:"text"\`
		} \`json:"content"\`
	} \`json:"payload"\`
}

type Entry struct {
	File         string \`json:"file"\`
	SHA256       string \`json:"sha256"\`
	Bytes        int    \`json:"bytes"\`
	Records      int    \`json:"records"\`
	SourceSHA256 string \`json:"source_sha256"\`
	SourceBytes  int    \`json:"source_bytes"\`
	CapturedAt   string \`json:"captured_at"\`
}

type Manifest struct {
	Schema int     \`json:"schema"\`
	Scope  string  \`json:"scope"\`
	Files  []Entry \`json:"files"\`
}

type Message struct {
	Role   string \`json:"role"\`
	Text   string \`json:"text"\`
	Source string \`json:"source"\`
	Record int    \`json:"record"\`
}

func hash(b []byte) string { x := sha256.Sum256(b); return hex.EncodeToString(x[:]) }

// Select preserves each original complete conversation/tool JSONL record byte-for-byte.
// Runtime metadata, configuration and private reasoning are not conversation exports.
func Select(source []byte) ([]byte, int, error) {
	var out bytes.Buffer
	count := 0
	lines := bytes.SplitAfter(source, []byte("\\n"))
	for i, line := range lines {
		if len(line) == 0 {
			continue
		}
		if line[len(line)-1] != '\\n' {
			break
		} // source writer may be midway through its last record
		var rec Record
		if err := json.Unmarshal(line, &rec); err != nil {
			return nil, 0, fmt.Errorf("record %d: %w", i+1, err)
		}
		if rec.Type != "response_item" {
			continue
		}
		p := rec.Payload
		keep := p.Type == "message" && (p.Role == "user" || p.Role == "assistant") && p.Channel != "analysis"
		switch p.Type {
		case "function_call", "function_call_output", "custom_tool_call", "custom_tool_call_output":
			keep = true
		}
		if keep {
			out.Write(line)
			count++
		}
	}
	return out.Bytes(), count, nil
}

func atomicWrite(name string, b []byte) error {
	if err := os.MkdirAll(filepath.Dir(name), 0o755); err != nil {
		return err
	}
	f, err := os.CreateTemp(filepath.Dir(name), ".export-*")
	if err != nil {
		return err
	}
	tmp := f.Name()
	defer func() { _ = os.Remove(tmp) }()
	if _, err := f.Write(b); err != nil {
		_ = f.Close()
		return err
	}
	if err := f.Sync(); err != nil {
		_ = f.Close()
		return err
	}
	if err := f.Close(); err != nil {
		return err
	}
	if err := os.Chmod(tmp, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, name)
}

// Sync exports only explicitly registered sessions; it never scans unrelated dialogue.
func Sync(repo string) error {
	lock, err := os.OpenFile(filepath.Join(repo, ".local", "dialog-sync.lock"), os.O_CREATE|os.O_RDWR, 0o600)
	if err != nil {
		return err
	}
	defer func() { _ = lock.Close() }()
	if err := syscall.Flock(int(lock.Fd()), syscall.LOCK_EX); err != nil {
		return err
	}
	defer func() { _ = syscall.Flock(int(lock.Fd()), syscall.LOCK_UN) }()
	list, err := os.ReadFile(filepath.Join(repo, ".local", "conversation-sources"))
	if err != nil {
		return err
	}
	dir := filepath.Join(repo, "docs", "conversations")
	m := Manifest{Schema: 1, Scope: "Original user/assistant and tool response_item records; no rewriting. Runtime/configuration records excluded."}
	old := Manifest{}
	if b, err := os.ReadFile(filepath.Join(dir, "manifest.json")); err == nil {
		if err := json.Unmarshal(b, &old); err != nil {
			return err
		}
	}
	entries := map[string]Entry{}
	for _, e := range old.Files {
		entries[e.File] = e
	}
	found := false
	for _, source := range strings.Split(strings.TrimSpace(string(list)), "\\n") {
		if source == "" {
			continue
		}
		found = true
		b, err := os.ReadFile(source)
		if err != nil {
			return err
		}
		raw, count, err := Select(b)
		if err != nil {
			return err
		}
		if count == 0 {
			return fmt.Errorf("no conversation records in %s", source)
		}
		name := filepath.Base(source)
		if !strings.HasSuffix(name, ".jsonl") {
			return errors.New("source must be a JSONL session")
		}
		relative := "raw/" + name
		previous, err := os.ReadFile(filepath.Join(dir, relative))
		if err != nil && !errors.Is(err, os.ErrNotExist) {
			return err
		}
		if !bytes.HasPrefix(raw, previous) {
			return fmt.Errorf("source history changed: %s; preserve old export and investigate", name)
		}
		existing, recorded := entries[relative]
		if bytes.Equal(previous, raw) && recorded && existing.SHA256 == hash(raw) && existing.Bytes == len(raw) && existing.Records == count {
			continue
		}
		if !bytes.Equal(previous, raw) {
			if err := atomicWrite(filepath.Join(dir, relative), raw); err != nil {
				return err
			}
		}
		entries[relative] = Entry{File: relative, SHA256: hash(raw), Bytes: len(raw), Records: count, SourceSHA256: hash(b), SourceBytes: len(b), CapturedAt: time.Now().UTC().Format(time.RFC3339)}
	}
	if !found {
		return errors.New("no registered project sessions")
	}
	for _, e := range entries {
		m.Files = append(m.Files, e)
	}
	sort.Slice(m.Files, func(i, j int) bool { return m.Files[i].File < m.Files[j].File })
	out, err := json.MarshalIndent(m, "", "  ")
	if err != nil {
		return err
	}
	return atomicWrite(filepath.Join(dir, "manifest.json"), append(out, '\\n'))
}

// Verify checks every exported file, checksum and declared record count.
func Verify(dir string) (Manifest, error) {
	var m Manifest
	b, err := os.ReadFile(filepath.Join(dir, "manifest.json"))
	if err != nil {
		return m, err
	}
	if err := json.Unmarshal(b, &m); err != nil {
		return m, err
	}
	if m.Schema != 1 || len(m.Files) == 0 {
		return m, errors.New("missing conversation manifest entries")
	}
	seen := map[string]bool{}
	for _, e := range m.Files {
		if filepath.Dir(e.File) != "raw" || filepath.Base(e.File) != strings.TrimPrefix(e.File, "raw/") {
			return m, errors.New("unsafe manifest path")
		}
		if seen[e.File] {
			return m, errors.New("duplicate manifest entry")
		}
		seen[e.File] = true
		raw, err := os.ReadFile(filepath.Join(dir, e.File))
		if err != nil {
			return m, err
		}
		selected, count, err := Select(raw)
		if err != nil {
			return m, err
		}
		if e.SHA256 != hash(raw) || e.Bytes != len(raw) || e.Records != count || !bytes.Equal(selected, raw) {
			return m, fmt.Errorf("integrity mismatch: %s", e.File)
		}
	}
	actual, err := filepath.Glob(filepath.Join(dir, "raw", "*.jsonl"))
	if err != nil {
		return m, err
	}
	if len(actual) != len(m.Files) {
		return m, errors.New("unmanifested raw export")
	}
	return m, nil
}

// Build leaves message text untouched and feeds it to TeX as verbatim file input.
// Dialogue cannot inject LaTeX commands, even when it contains TeX terminators.
func Build(dir, out string) error {
	m, err := Verify(dir)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(out, "messages"), 0o755); err != nil {
		return err
	}
	var messages []Message
	for _, e := range m.Files {
		raw, err := os.ReadFile(filepath.Join(dir, e.File))
		if err != nil {
			return err
		}
		for i, line := range bytes.Split(bytes.TrimSuffix(raw, []byte("\\n")), []byte("\\n")) {
			var rec Record
			if err := json.Unmarshal(line, &rec); err != nil {
				return err
			}
			p := rec.Payload
			if p.Type != "message" {
				continue
			}
			var text strings.Builder
			for _, c := range p.Content {
				switch c.Type {
				case "input_text", "output_text", "text":
					text.WriteString(c.Text)
				default:
					return fmt.Errorf("unsupported message content %q; export retained, PDF build stopped", c.Type)
				}
			}
			messages = append(messages, Message{Role: p.Role, Text: text.String(), Source: e.File, Record: i + 1})
		}
	}
	if len(messages) == 0 {
		return errors.New("no dialogue messages")
	}
	b, err := json.MarshalIndent(messages, "", "  ")
	if err != nil {
		return err
	}
	if err := atomicWrite(filepath.Join(out, "dialogue.json"), append(b, '\\n')); err != nil {
		return err
	}
	fonts := "\\\\RequirePackage{fontspec}\\n\\\\setmainfont{DejaVu Serif}\\n\\\\setsansfont{DejaVu Sans}\\n\\\\setmonofont{DejaVu Sans Mono}\\n"
	if err := atomicWrite(filepath.Join(out, "fonts.tex"), []byte(fonts)); err != nil {
		return err
	}
	var tex strings.Builder
	tex.WriteString("\\\\documentclass[english,use theme=ChatGPT-classical-dark,load-custom-font-file=fonts.tex]{Q-and-A}\\n\\\\usepackage{fvextra}\\n\\\\setmainfont{DejaVu Serif}\\n\\\\setsansfont{DejaVu Sans}\\n\\\\setmonofont{DejaVu Sans Mono}\\n\\\\SetLogoCode[Q]{\\\\textbf{User}}\\n\\\\SetLogoCode[A]{\\\\textbf{Codex}}\\n\\\\begin{document}\\n\\\\section*{Project conversation}\\nOriginal dialogue text; tool records are included in the companion raw JSONL archive.\\\\par\\n")
	for i, msg := range messages {
		name := fmt.Sprintf("messages/%06d.txt", i+1)
		if err := atomicWrite(filepath.Join(out, name), []byte(msg.Text)); err != nil {
			return err
		}
		env := "QA_A"
		if msg.Role == "user" {
			env = "QA_Q"
		}
		fmt.Fprintf(&tex, "\\\\begin{%s}\\n\\\\VerbatimInput[fontsize=\\\\footnotesize,breaklines=true,breakanywhere=true]{%s}\\n\\\\end{%s}\\n", env, name, env)
	}
	tex.WriteString("\\\\end{document}\\n")
	if err := atomicWrite(filepath.Join(out, "conversation.tex"), []byte(tex.String())); err != nil {
		return err
	}
	return atomicWrite(filepath.Join(out, "index.html"), []byte("<!doctype html><html lang=\\"en\\"><meta charset=\\"utf-8\\"><title>Conversation build</title><h1>Conversation build</h1><ul><li><a href=\\"conversation.pdf\\">Q-and-A PDF</a></li><li><a href=\\"conversation.tex\\">LaTeX source</a></li><li><a href=\\"dialogue.json\\">Exact dialogue text and provenance</a></li><li><a href=\\"raw-exports.zip\\">Raw conversation and tool records</a></li><li><a href=\\"manifest.json\\">Integrity manifest</a></li></ul></html>\\n"))
}

// CheckPDFLog rejects layout/glyph failures and incomplete compiler output.
func CheckPDFLog(name string) error {
	b, err := os.ReadFile(name)
	if err != nil {
		return err
	}
	text := string(b)
	for _, failure := range []string{"Missing character:", "Overfull \\\\hbox", "Overfull \\\\vbox"} {
		if strings.Contains(text, failure) {
			return fmt.Errorf("PDF quality check failed: %s", failure)
		}
	}
	if !strings.Contains(text, "Output written on conversation.pdf") {
		return errors.New("PDF log has no successful output marker")
	}
	return nil
}
`,blocks:[{startLine:55,startColumn:30,endLine:55,endColumn:86,statements:2,count:5},{startLine:60,startColumn:2,endLine:63,endColumn:29,statements:4,count:3},{startLine:64,startColumn:3,endLine:64,endColumn:21,statements:1,count:6},{startLine:65,startColumn:4,endLine:65,endColumn:12,statements:1,count:3},{startLine:67,startColumn:3,endLine:67,endColumn:32,statements:1,count:3},{startLine:68,startColumn:4,endLine:68,endColumn:9,statements:1,count:0},{startLine:70,startColumn:3,endLine:71,endColumn:52,statements:2,count:3},{startLine:72,startColumn:4,endLine:73,endColumn:1,statements:1,count:0},{startLine:74,startColumn:3,endLine:74,endColumn:34,statements:1,count:3},{startLine:75,startColumn:4,endLine:75,endColumn:12,statements:1,count:0},{startLine:77,startColumn:3,endLine:79,endColumn:17,statements:3,count:3},{startLine:81,startColumn:4,endLine:81,endColumn:15,statements:1,count:0},{startLine:83,startColumn:3,endLine:83,endColumn:11,statements:1,count:3},{startLine:84,startColumn:4,endLine:86,endColumn:1,statements:2,count:3},{startLine:88,startColumn:2,endLine:88,endColumn:32,statements:1,count:3},{startLine:92,startColumn:2,endLine:92,endColumn:63,statements:1,count:3},{startLine:93,startColumn:3,endLine:94,endColumn:1,statements:1,count:0},{startLine:95,startColumn:2,endLine:96,endColumn:16,statements:2,count:3},{startLine:97,startColumn:3,endLine:98,endColumn:1,statements:1,count:0},{startLine:99,startColumn:2,endLine:100,endColumn:15,statements:2,count:3},{startLine:100,startColumn:17,endLine:100,endColumn:37,statements:1,count:3},{startLine:101,startColumn:2,endLine:101,endColumn:38,statements:1,count:3},{startLine:102,startColumn:3,endLine:104,endColumn:1,statements:2,count:0},{startLine:105,startColumn:2,endLine:105,endColumn:33,statements:1,count:3},{startLine:106,startColumn:3,endLine:108,endColumn:1,statements:2,count:0},{startLine:109,startColumn:2,endLine:109,endColumn:34,statements:1,count:3},{startLine:110,startColumn:3,endLine:111,endColumn:1,statements:1,count:0},{startLine:112,startColumn:2,endLine:112,endColumn:45,statements:1,count:3},{startLine:113,startColumn:3,endLine:114,endColumn:1,statements:1,count:0},{startLine:115,startColumn:2,endLine:115,endColumn:29,statements:1,count:3},{startLine:120,startColumn:2,endLine:121,endColumn:16,statements:2,count:2},{startLine:122,startColumn:3,endLine:123,endColumn:1,statements:1,count:0},{startLine:124,startColumn:2,endLine:124,endColumn:15,statements:1,count:2},{startLine:124,startColumn:17,endLine:124,endColumn:35,statements:1,count:2},{startLine:125,startColumn:2,endLine:125,endColumn:71,statements:1,count:2},{startLine:126,startColumn:3,endLine:127,endColumn:1,statements:1,count:0},{startLine:128,startColumn:2,endLine:128,endColumn:15,statements:1,count:2},{startLine:128,startColumn:17,endLine:128,endColumn:69,statements:1,count:2},{startLine:129,startColumn:2,endLine:130,endColumn:16,statements:2,count:2},{startLine:131,startColumn:3,endLine:132,endColumn:1,statements:1,count:0},{startLine:133,startColumn:2,endLine:136,endColumn:76,statements:4,count:2},{startLine:137,startColumn:3,endLine:137,endColumn:49,statements:1,count:1},{startLine:138,startColumn:4,endLine:139,endColumn:1,statements:1,count:0},{startLine:141,startColumn:2,endLine:142,endColumn:30,statements:2,count:2},{startLine:143,startColumn:3,endLine:144,endColumn:1,statements:1,count:0},{startLine:145,startColumn:2,endLine:146,endColumn:78,statements:2,count:2},{startLine:147,startColumn:3,endLine:147,endColumn:19,statements:1,count:2},{startLine:148,startColumn:4,endLine:148,endColumn:12,statements:1,count:0},{startLine:150,startColumn:3,endLine:152,endColumn:17,statements:3,count:2},{startLine:153,startColumn:4,endLine:154,endColumn:1,statements:1,count:0},{startLine:155,startColumn:3,endLine:156,endColumn:17,statements:2,count:2},{startLine:157,startColumn:4,endLine:158,endColumn:1,statements:1,count:0},{startLine:159,startColumn:3,endLine:159,endColumn:17,statements:1,count:2},{startLine:160,startColumn:4,endLine:161,endColumn:1,statements:1,count:0},{startLine:162,startColumn:3,endLine:163,endColumn:41,statements:2,count:2},{startLine:164,startColumn:4,endLine:165,endColumn:1,statements:1,count:0},{startLine:166,startColumn:3,endLine:168,endColumn:52,statements:3,count:2},{startLine:169,startColumn:4,endLine:170,endColumn:1,statements:1,count:0},{startLine:171,startColumn:3,endLine:171,endColumn:38,statements:1,count:2},{startLine:172,startColumn:4,endLine:173,endColumn:1,statements:1,count:0},{startLine:174,startColumn:3,endLine:175,endColumn:136,statements:2,count:2},{startLine:176,startColumn:4,endLine:176,endColumn:12,statements:1,count:0},{startLine:178,startColumn:3,endLine:178,endColumn:34,statements:1,count:2},{startLine:179,startColumn:4,endLine:179,endColumn:73,statements:1,count:1},{startLine:180,startColumn:5,endLine:181,endColumn:1,statements:1,count:0},{startLine:183,startColumn:3,endLine:183,endColumn:191,statements:1,count:2},{startLine:185,startColumn:2,endLine:185,endColumn:12,statements:1,count:2},{startLine:186,startColumn:3,endLine:187,endColumn:1,statements:1,count:0},{startLine:188,startColumn:2,endLine:188,endColumn:28,statements:1,count:2},{startLine:189,startColumn:3,endLine:190,endColumn:1,statements:1,count:2},{startLine:191,startColumn:2,endLine:191,endColumn:42,statements:1,count:2},{startLine:191,startColumn:44,endLine:191,endColumn:86,statements:1,count:0},{startLine:192,startColumn:2,endLine:193,endColumn:16,statements:2,count:2},{startLine:194,startColumn:3,endLine:195,endColumn:1,statements:1,count:0},{startLine:196,startColumn:2,endLine:196,endColumn:76,statements:1,count:2},{startLine:201,startColumn:2,endLine:203,endColumn:16,statements:3,count:1},{startLine:204,startColumn:3,endLine:205,endColumn:1,statements:1,count:0},{startLine:206,startColumn:2,endLine:206,endColumn:46,statements:1,count:1},{startLine:207,startColumn:3,endLine:208,endColumn:1,statements:1,count:0},{startLine:209,startColumn:2,endLine:209,endColumn:40,statements:1,count:1},{startLine:210,startColumn:3,endLine:211,endColumn:1,statements:1,count:0},{startLine:212,startColumn:2,endLine:213,endColumn:28,statements:2,count:1},{startLine:214,startColumn:3,endLine:214,endColumn:99,statements:1,count:1},{startLine:215,startColumn:4,endLine:216,endColumn:1,statements:1,count:0},{startLine:217,startColumn:3,endLine:217,endColumn:19,statements:1,count:1},{startLine:218,startColumn:4,endLine:219,endColumn:1,statements:1,count:0},{startLine:220,startColumn:3,endLine:222,endColumn:17,statements:3,count:1},{startLine:223,startColumn:4,endLine:224,endColumn:1,statements:1,count:0},{startLine:225,startColumn:3,endLine:226,endColumn:17,statements:2,count:1},{startLine:227,startColumn:4,endLine:228,endColumn:1,statements:1,count:0},{startLine:229,startColumn:3,endLine:229,endColumn:104,statements:1,count:1},{startLine:230,startColumn:4,endLine:231,endColumn:1,statements:1,count:0},{startLine:233,startColumn:2,endLine:234,endColumn:16,statements:2,count:1},{startLine:235,startColumn:3,endLine:236,endColumn:1,statements:1,count:0},{startLine:237,startColumn:2,endLine:237,endColumn:33,statements:1,count:1},{startLine:238,startColumn:3,endLine:239,endColumn:1,statements:1,count:0},{startLine:240,startColumn:2,endLine:240,endColumn:15,statements:1,count:1},{startLine:246,startColumn:2,endLine:247,endColumn:16,statements:2,count:0},{startLine:248,startColumn:3,endLine:249,endColumn:1,statements:1,count:0},{startLine:250,startColumn:2,endLine:250,endColumn:75,statements:1,count:0},{startLine:251,startColumn:3,endLine:252,endColumn:1,statements:1,count:0},{startLine:253,startColumn:2,endLine:254,endColumn:28,statements:2,count:0},{startLine:255,startColumn:3,endLine:256,endColumn:17,statements:2,count:0},{startLine:257,startColumn:4,endLine:258,endColumn:1,statements:1,count:0},{startLine:259,startColumn:3,endLine:259,endColumn:87,statements:1,count:0},{startLine:260,startColumn:4,endLine:261,endColumn:53,statements:2,count:0},{startLine:262,startColumn:5,endLine:263,endColumn:1,statements:1,count:0},{startLine:264,startColumn:4,endLine:265,endColumn:27,statements:2,count:0},{startLine:266,startColumn:5,endLine:266,endColumn:13,statements:1,count:0},{startLine:268,startColumn:4,endLine:269,endColumn:32,statements:2,count:0},{startLine:270,startColumn:5,endLine:270,endColumn:19,statements:1,count:0},{startLine:272,startColumn:6,endLine:272,endColumn:30,statements:1,count:0},{startLine:274,startColumn:6,endLine:274,endColumn:101,statements:1,count:0},{startLine:277,startColumn:4,endLine:277,endColumn:106,statements:1,count:0},{startLine:280,startColumn:2,endLine:280,endColumn:24,statements:1,count:0},{startLine:281,startColumn:3,endLine:282,endColumn:1,statements:1,count:0},{startLine:283,startColumn:2,endLine:284,endColumn:16,statements:2,count:0},{startLine:285,startColumn:3,endLine:286,endColumn:1,statements:1,count:0},{startLine:287,startColumn:2,endLine:287,endColumn:90,statements:1,count:0},{startLine:288,startColumn:3,endLine:289,endColumn:1,statements:1,count:0},{startLine:290,startColumn:2,endLine:291,endColumn:84,statements:2,count:0},{startLine:292,startColumn:3,endLine:293,endColumn:1,statements:1,count:0},{startLine:294,startColumn:2,endLine:296,endColumn:31,statements:3,count:0},{startLine:297,startColumn:3,endLine:298,endColumn:81,statements:2,count:0},{startLine:299,startColumn:4,endLine:300,endColumn:1,statements:1,count:0},{startLine:301,startColumn:3,endLine:302,endColumn:25,statements:2,count:0},{startLine:303,startColumn:4,endLine:304,endColumn:1,statements:1,count:0},{startLine:305,startColumn:3,endLine:305,endColumn:145,statements:1,count:0},{startLine:307,startColumn:2,endLine:308,endColumn:98,statements:2,count:0},{startLine:309,startColumn:3,endLine:310,endColumn:1,statements:1,count:0},{startLine:311,startColumn:2,endLine:311,endColumn:512,statements:1,count:0},{startLine:316,startColumn:2,endLine:317,endColumn:16,statements:2,count:0},{startLine:318,startColumn:3,endLine:319,endColumn:1,statements:1,count:0},{startLine:320,startColumn:2,endLine:321,endColumn:95,statements:2,count:0},{startLine:322,startColumn:3,endLine:322,endColumn:38,statements:1,count:0},{startLine:323,startColumn:4,endLine:324,endColumn:1,statements:1,count:0},{startLine:326,startColumn:2,endLine:326,endColumn:67,statements:1,count:0},{startLine:327,startColumn:3,endLine:328,endColumn:1,statements:1,count:0},{startLine:329,startColumn:2,endLine:329,endColumn:12,statements:1,count:0}]}],T=[{path:`docs/internal/dialog/dialog_test.go`,label:`Selected test / case body · TestRecoverInterruptedManifestWrite`,source:`func TestRecoverInterruptedManifestWrite(t *testing.T) {
	repo := t.TempDir()
	source := filepath.Join(repo, "session.jsonl")
	original := sourceRecord("user", "unchanged original text")
	mustWrite(t, source, original)
	mustWrite(t, filepath.Join(repo, ".local", "conversation-sources"), []byte(source+"\\n"))
	if err := Sync(repo); err != nil {
		t.Fatal(err)
	}
	dir := filepath.Join(repo, "docs", "conversations")
	// Simulate a crash after the raw file is durable but before its manifest is saved.
	mustWrite(t, filepath.Join(dir, "manifest.json"), []byte(\`{"schema":1,"files":[]}\`))
	if err := Sync(repo); err != nil {
		t.Fatal(err)
	}
	if _, err := Verify(dir); err != nil {
		t.Fatal(err)
	}
	actual, err := os.ReadFile(filepath.Join(dir, "raw", "session.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(actual, original) {
		t.Fatal("recovery changed original dialogue bytes")
	}
}`,sha256:`8fce3ec2806da434eae76fbb01e54e60c2ae68a061a5a99259d067e61b4cf7e3`,startLine:94,endLine:119,assertLines:[101,107,110,114,117]},{path:`docs/internal/dialog/dialog_test.go`,label:`Referenced test helper (static call graph) · mustWrite`,source:`func mustWrite(t *testing.T, name string, b []byte) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(name), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(name, b, 0o600); err != nil {
		t.Fatal(err)
	}
}`,sha256:`8fce3ec2806da434eae76fbb01e54e60c2ae68a061a5a99259d067e61b4cf7e3`,startLine:84,endLine:92,assertLines:[87,90]},{path:`docs/internal/dialog/dialog_test.go`,label:`Referenced test helper (static call graph) · sourceRecord`,source:`func sourceRecord(role, text string) []byte {
	b, _ := json.Marshal(map[string]any{"type": "response_item", "payload": map[string]any{"type": "message", "role": role, "content": []map[string]string{{"type": "input_text", "text": text}}}})
	return append(b, '\\n')
}`,sha256:`8fce3ec2806da434eae76fbb01e54e60c2ae68a061a5a99259d067e61b4cf7e3`,startLine:12,endLine:15,assertLines:[]}],E=`70a9553bb8366954304bc8e71b3f4ac35ad1a87b692725642a34038297be0594`,D=`b576b5d9032c46ffce52a816f78d2e67af0225630dc6b31208b2456493713015`,O={id:f,suite:p,name:m,sha:h,status:g,asserts:``,sourceURL:_,package:`github.com/newdarwindev/firm-payments/docs/internal/dialog`,command:v,build:y,binarySHA256:b,selected:x,executed:S,group:!1,scope:C,total:188,covered:92,files:w,assertions:T,profileSHA256:E,gifSHA256:D}})))()}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{u(),o(),r(),t(),k(),A=i(),j=O,M={id:`case-exporter-4c9c8477e9416bf6`,title:`Cases/exporter/TestRecoverInterruptedManifestWrite`,component:d,args:{evidence:j,mediaBase:`../cases/exporter-4c9c8477e9416bf6/`}},N={play:async({canvasElement:e})=>{await s(e.querySelector(`[aria-label="Covered implementation"]`),j),await l(e.querySelector(`[aria-label="Test assertions"]`),j),await a(e.querySelector(`[aria-label="Terminal recording"]`),j)}},P={name:`Covered Code`,render:({evidence:e})=>(0,A.jsx)(c,{evidence:e}),play:async({canvasElement:e})=>s(e,j)},F={render:({evidence:e})=>(0,A.jsx)(n,{evidence:e}),play:async({canvasElement:e})=>l(e,j)},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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