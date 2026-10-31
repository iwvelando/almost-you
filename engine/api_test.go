package engine

import (
	"encoding/json"
	"math"
	"strings"
	"testing"
)

func response(t *testing.T, input string) map[string]any {
	t.Helper()
	var out map[string]any
	if err := json.Unmarshal([]byte(Handle(input)), &out); err != nil {
		t.Fatal(err)
	}
	return out
}
func TestAPIValidationAndCatalog(t *testing.T) {
	for _, input := range []string{`{`, `{"action":"oops"}`, `{"action":"rank","name":"NotInDictionary"}`, `{"action":"rank","name":"Julian","n":99}`, `{"action":"rank","name":"Julian","n":5,"variant":99}`, `{"action":"rank","name":"Julian","n":5,"mode":"magic"}`} {
		if response(t, input)["error"] == nil {
			t.Errorf("accepted %s", input)
		}
	}
	out := response(t, `{"action":"catalog"}`)
	if len(out["names"].([]any)) < 1000 {
		t.Fatal("missing catalog")
	}
}
func TestAPIRankAndPair(t *testing.T) {
	input := `{"action":"rank","name":" julian ","n":5,"mode":"sound","compare":"Jillian"}`
	out := response(t, input)
	if out["error"] != nil {
		t.Fatal(out)
	}
	rows := out["results"].([]any)
	if len(rows) != 5 {
		t.Fatal("wrong result limit")
	}
	if out["target"].(map[string]any)["name"] != "Julian" {
		t.Fatal("name normalization failed")
	}
	pair := out["comparison"].(map[string]any)
	if pair["name"] != "Jillian" || pair["rank"].(float64) < 1 {
		t.Fatal("pair lookup failed")
	}
	five := Handle(input)
	twenty := response(t, strings.Replace(input, `"n":5`, `"n":20`, 1))
	if rows[0].(map[string]any)["score"] != twenty["results"].([]any)[0].(map[string]any)["score"] {
		t.Fatal("top N changed scores")
	}
	if Handle(input) != five {
		t.Fatal("nondeterministic response")
	}
	out = response(t, `{"action":"rank","name":"Steven","n":5,"mode":"frequency","compare":"Stephen"}`)
	if out["comparison"].(map[string]any)["rank"] != float64(0) {
		t.Fatal("homophone should be excluded from ranking")
	}
}

func TestTargetComparisonHasNoRankEvenWhenAnotherSpellingSharesItsSounds(t *testing.T) {
	out := response(t, `{"action":"rank","name":"Julian","n":5,"mode":"sound","variant":1,"compare":"Julian"}`)
	pair := out["comparison"].(map[string]any)
	if pair["sound"].(float64) == 1 {
		t.Fatal("test requires two different recorded pronunciations")
	}
	if pair["rank"].(float64) != 0 {
		t.Fatal("the excluded target must not inherit a different spelling's group rank")
	}
}

func TestDefaultWeightsAreImplicitAndReproduceThePublishedExample(t *testing.T) {
	implicit := `{"action":"rank","name":"Julian","n":5,"mode":"sound","compare":"Jillian"}`
	explicit := `{"action":"rank","name":"Julian","n":5,"mode":"sound","compare":"Jillian","weights":{"sound":85,"edge":15,"frequency":0,"last":50}}`
	if Handle(implicit) != Handle(explicit) {
		t.Fatal("explicit default weights must give the identical response")
	}
	out := response(t, implicit)
	if out["custom"] != false {
		t.Fatal("default weights must not be reported as custom")
	}
	w := out["weights"].(map[string]any)
	if w["sound"] != .85 || w["edge"] != .15 || w["frequency"] != float64(0) || w["last"] != .5 {
		t.Fatalf("effective coefficients not reported: %v", w)
	}
	if s := out["comparison"].(map[string]any)["score"].(float64); math.Abs(s-(.85*5/6+.15)) > 1e-12 {
		t.Fatalf("Julian/Jillian changed: %v", s)
	}
	freq := response(t, `{"action":"rank","name":"Julian","n":5,"mode":"frequency"}`)["weights"].(map[string]any)
	if freq["sound"] != .75 || freq["edge"] != .15 || freq["frequency"] != .1 {
		t.Fatalf("frequency defaults changed: %v", freq)
	}
}

func TestCustomWeightsRerankWithoutBreakingInvariants(t *testing.T) {
	input := `{"action":"rank","name":"Julian","n":5,"mode":"sound","compare":"Jillian","weights":{"sound":0,"edge":100,"frequency":0,"last":50}}`
	out := response(t, input)
	if out["error"] != nil {
		t.Fatal(out)
	}
	if out["custom"] != true {
		t.Fatal("changed weights must be reported as custom")
	}
	top := out["results"].([]any)[0].(map[string]any)
	if top["score"] != float64(1) || top["edge"] != float64(1) {
		t.Fatalf("edge-only weighting should rank shared-edge names first: %v", top)
	}
	if out["comparison"].(map[string]any)["score"] != float64(1) {
		t.Fatal("comparison must use the same weights")
	}
	twenty := response(t, strings.Replace(input, `"n":5`, `"n":20`, 1))
	for i, r := range out["results"].([]any) {
		if r.(map[string]any)["score"] != twenty["results"].([]any)[i].(map[string]any)["score"] {
			t.Fatal("N changed scores under custom weights")
		}
	}
	if Handle(input) != Handle(input) {
		t.Fatal("nondeterministic custom response")
	}
	defaults := response(t, `{"action":"rank","name":"Julian","n":5,"mode":"sound"}`)
	if defaults["results"].([]any)[0].(map[string]any)["name"] == top["name"] && defaults["results"].([]any)[0].(map[string]any)["score"] == top["score"] {
		t.Fatal("custom weights had no visible effect")
	}
}

func TestInvalidWeightsAreRejectedReadably(t *testing.T) {
	for _, w := range []string{
		`{"sound":-1,"edge":15,"frequency":0,"last":50}`,
		`{"sound":101,"edge":15,"frequency":0,"last":50}`,
		`{"sound":85,"edge":15,"frequency":0,"last":101}`,
		`{"sound":0,"edge":0,"frequency":0,"last":50}`,
		`{"sound":85,"edge":15,"frequency":10,"last":50}`,
	} {
		out := response(t, `{"action":"rank","name":"Julian","n":5,"mode":"sound","weights":`+w+`}`)
		if msg, ok := out["error"].(string); !ok || msg == "" {
			t.Errorf("accepted weights %s", w)
		}
	}
	if response(t, `{"action":"rank","name":"Julian","n":5,"mode":"frequency","weights":{"sound":0,"edge":0,"frequency":10,"last":50}}`)["error"] != nil {
		t.Fatal("frequency-only weighting is valid in frequency mode")
	}
}
