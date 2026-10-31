package engine

import (
	_ "embed"
	"encoding/json"
	"strings"
)

//go:embed names.json
var rawNames []byte
var catalog []Name

func init() {
	if err := json.Unmarshal(rawNames, &catalog); err != nil {
		panic(err)
	}
}

type Request struct {
	Action  string   `json:"action"`
	Name    string   `json:"name"`
	N       int      `json:"n"`
	Mode    string   `json:"mode"`
	Variant int      `json:"variant"`
	Compare string   `json:"compare"`
	Weights *Weights `json:"weights"`
}

func encode(v any) string {
	b, err := json.Marshal(v)
	if err != nil {
		return `{"error":"Could not encode response"}`
	}
	return string(b)
}
func failure(s string) string { return encode(map[string]string{"error": s}) }
func lookup(s string) int {
	s = strings.TrimSpace(s)
	for i, n := range catalog {
		if strings.EqualFold(n.Name, s) {
			return i
		}
	}
	return -1
}

func invalidWeights(w Weights, mode string) string {
	for _, v := range []float64{w.Sound, w.Edge, w.Frequency, w.Last} {
		if v < 0 || v > 100 {
			return "Each weight must be between 0 and 100."
		}
	}
	if mode == "sound" && w.Frequency != 0 {
		return "The sound-only model has no frequency weight."
	}
	if w.Sound+w.Edge+w.Frequency == 0 {
		return "Give at least one ingredient some weight."
	}
	return ""
}

// Handle is the only public transport boundary. All state is immutable.
func Handle(input string) string {
	if len(input) > 2048 {
		return failure("Request too long.")
	}
	var req Request
	if json.Unmarshal([]byte(input), &req) != nil {
		return failure("Invalid request.")
	}
	if req.Action == "catalog" {
		names := make([]string, len(catalog))
		for i, n := range catalog {
			names[i] = n.Name
		}
		return encode(map[string]any{"names": names, "version": "baseline-1", "years": []int{1950, 2020}})
	}
	if req.Action != "rank" {
		return failure("Unknown action.")
	}
	target := lookup(req.Name)
	if target < 0 {
		return failure("This name is not in our pronunciation collection yet. Try another spelling or a name from the suggestions.")
	}
	if req.N < 1 || req.N > 20 {
		return failure("Choose between 1 and 20 results.")
	}
	if req.Mode != "sound" && req.Mode != "frequency" {
		return failure("Unknown model.")
	}
	if req.Variant < 0 || req.Variant >= len(catalog[target].Pronunciations) {
		return failure("Unknown pronunciation.")
	}
	w := defaultWeights(req.Mode)
	if req.Weights != nil {
		w = *req.Weights
		if msg := invalidWeights(w, req.Mode); msg != "" {
			return failure(msg)
		}
	}
	all := rank(catalog, target, req.Variant, w)
	out := map[string]any{"target": catalog[target], "results": all[:min(req.N, len(all))], "total": len(all), "version": "baseline-1", "weights": w.coefficients(), "custom": w != defaultWeights(req.Mode)}
	if req.Compare != "" {
		idx := lookup(req.Compare)
		if idx < 0 {
			out["comparisonError"] = "That comparison name is outside our collection."
		} else {
			maxCount := 1
			for _, n := range catalog {
				maxCount = max(maxCount, n.Count)
			}
			comp := score(catalog[target].Pronunciations[req.Variant], catalog[idx], w, maxCount)
			for _, r := range all {
				if idx != target && key(r.Phones) == key(comp.Phones) {
					comp.Rank = r.Rank
					break
				}
			}
			out["comparison"] = comp
		}
	}
	return encode(out)
}
