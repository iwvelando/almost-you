// Package engine implements an experimental similarity heuristic, not a fitted
// probability model of human name retrieval.
package engine

import (
	"math"
	"sort"
	"strings"
)

type Name struct {
	Name           string     `json:"name"`
	Count          int        `json:"count"`
	Pronunciations [][]string `json:"pronunciations"`
}
type Cell struct {
	From string `json:"from"`
	To   string `json:"to"`
}
type Result struct {
	Name      string   `json:"name"`
	Aliases   []string `json:"aliases"`
	Score     float64  `json:"score"`
	Sound     float64  `json:"sound"`
	Edge      float64  `json:"edge"`
	Frequency float64  `json:"frequency"`
	Phones    []string `json:"phones"`
	Alignment []Cell   `json:"alignment"`
	Rank      int      `json:"rank"`
}

func base(s string) string { return strings.TrimRight(s, "012") }
func key(p []string) string {
	v := make([]string, len(p))
	for i, s := range p {
		v[i] = base(s)
	}
	return strings.Join(v, " ")
}
func matrix(a, b []string) [][]int {
	d := make([][]int, len(a)+1)
	for i := range d {
		d[i] = make([]int, len(b)+1)
		d[i][0] = i
	}
	for j := range d[0] {
		d[0][j] = j
	}
	for i := 1; i <= len(a); i++ {
		for j := 1; j <= len(b); j++ {
			cost := 1
			if base(a[i-1]) == base(b[j-1]) {
				cost = 0
			}
			d[i][j] = min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+cost)
		}
	}
	return d
}
func distance(a, b []string) float64 {
	n := max(len(a), len(b))
	if n == 0 {
		return 0
	}
	return float64(matrix(a, b)[len(a)][len(b)]) / float64(n)
}
func align(a, b []string) []Cell {
	d := matrix(a, b)
	i, j := len(a), len(b)
	cells := []Cell{}
	for i > 0 || j > 0 {
		cost := 1
		if i > 0 && j > 0 && base(a[i-1]) == base(b[j-1]) {
			cost = 0
		}
		if i > 0 && j > 0 && d[i][j] == d[i-1][j-1]+cost {
			cells = append(cells, Cell{a[i-1], b[j-1]})
			i--
			j--
		} else if i > 0 && d[i][j] == d[i-1][j]+1 {
			cells = append(cells, Cell{From: a[i-1]})
			i--
		} else {
			cells = append(cells, Cell{To: b[j-1]})
			j--
		}
	}
	for l, r := 0, len(cells)-1; l < r; l, r = l+1, r-1 {
		cells[l], cells[r] = cells[r], cells[l]
	}
	return cells
}

// Weights are relative importances (0–100). Sound, Edge and Frequency are
// divided by their sum, so scores stay in [0,1]; Last is the share of E given
// to the final sound. None of these values is fitted to observed errors.
type Weights struct {
	Sound     float64 `json:"sound"`
	Edge      float64 `json:"edge"`
	Frequency float64 `json:"frequency"`
	Last      float64 `json:"last"`
}

func defaultWeights(mode string) Weights {
	if mode == "frequency" {
		return Weights{Sound: 75, Edge: 15, Frequency: 10, Last: 50}
	}
	return Weights{Sound: 85, Edge: 15, Last: 50}
}

// coefficients returns the normalized multipliers applied to P, E and F, and
// the final-sound share of E.
func (w Weights) coefficients() Weights {
	sum := w.Sound + w.Edge + w.Frequency
	return Weights{Sound: w.Sound / sum, Edge: w.Edge / sum, Frequency: w.Frequency / sum, Last: w.Last / 100}
}

func score(target []string, n Name, w Weights, maxCount int) Result {
	c := w.coefficients()
	p := n.Pronunciations[0]
	sound := 1 - distance(target, p)
	edge := 0.0
	if len(target) > 0 && len(p) > 0 {
		if base(target[0]) == base(p[0]) {
			edge += 1 - c.Last
		}
		if base(target[len(target)-1]) == base(p[len(p)-1]) {
			edge += c.Last
		}
	}
	frequency := math.Log1p(float64(n.Count)) / math.Log1p(float64(max(1, maxCount)))
	total := c.Sound*sound + c.Edge*edge + c.Frequency*frequency
	return Result{Name: n.Name, Aliases: []string{}, Score: total, Sound: sound, Edge: edge, Frequency: frequency, Phones: p, Alignment: align(target, p)}
}
func rank(names []Name, target, variant int, w Weights) []Result {
	p := names[target].Pronunciations[variant]
	groups := map[string][]Name{}
	maxCount := 1
	for _, n := range names {
		maxCount = max(maxCount, n.Count)
	}
	for i, n := range names {
		if i == target {
			continue
		}
		k := key(n.Pronunciations[0])
		if k == key(p) {
			continue
		}
		groups[k] = append(groups[k], n)
	}
	out := []Result{}
	for _, group := range groups {
		sort.Slice(group, func(i, j int) bool {
			if group[i].Count == group[j].Count {
				return group[i].Name < group[j].Name
			}
			return group[i].Count > group[j].Count
		})
		r := score(p, group[0], w, maxCount)
		for _, alias := range group[1:] {
			r.Aliases = append(r.Aliases, alias.Name)
		}
		out = append(out, r)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Score == out[j].Score {
			return out[i].Name < out[j].Name
		}
		return out[i].Score > out[j].Score
	})
	for i := range out {
		out[i].Rank = i + 1
	}
	return out
}
