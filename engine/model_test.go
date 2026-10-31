package engine

import (
	"math"
	"testing"
)

func TestSoundDistance(t *testing.T) {
	for _, tt := range []struct {
		a, b []string
		want float64
	}{
		{[]string{"AY1", "Z", "AH0", "K"}, []string{"AY1", "Z", "AH0", "K"}, 0},
		{[]string{"AY1", "Z", "AH0", "K"}, []string{"AE1", "L", "IH0", "K", "S"}, .8},
		{[]string{"AA1"}, []string{"AA0"}, 0},
		{[]string{}, []string{"K"}, 1},
	} {
		if got := distance(tt.a, tt.b); math.Abs(got-tt.want) > 1e-9 {
			t.Errorf("distance(%v,%v)=%v want %v", tt.a, tt.b, got, tt.want)
		}
	}
}

func TestRankingExcludesTargetAndGroupsHomophones(t *testing.T) {
	names := []Name{
		{Name: "Target", Count: 100, Pronunciations: [][]string{{"AY1", "Z", "AH0", "K"}}},
		{Name: "TargetAlias", Count: 20, Pronunciations: [][]string{{"AY1", "Z", "AH0", "K"}}},
		{Name: "Other", Count: 500, Pronunciations: [][]string{{"AE1", "L", "IH0", "K", "S"}}},
		{Name: "OtherAlias", Count: 10, Pronunciations: [][]string{{"AE1", "L", "IH0", "K", "S"}}},
		{Name: "Closer", Count: 200, Pronunciations: [][]string{{"Z", "AE1", "K"}}},
	}
	got := rank(names, 0, 0, defaultWeights("sound"))
	if len(got) != 2 {
		t.Fatalf("got %d groups, want 2", len(got))
	}
	if got[0].Name != "Closer" || got[1].Name != "Other" {
		t.Fatalf("unexpected order: %+v", got)
	}
	if len(got[1].Aliases) != 1 || got[1].Aliases[0] != "OtherAlias" {
		t.Fatal("missing homophone spelling")
	}
	if got[0].Score <= got[1].Score {
		t.Fatal("sound ranking must follow scores")
	}
}

func TestFrequencyIsOptionalAndAlignmentExplainsEdits(t *testing.T) {
	a := Name{Name: "A", Count: 1, Pronunciations: [][]string{{"K", "AE1", "T"}}}
	b := Name{Name: "B", Count: 10000, Pronunciations: [][]string{{"K", "AE1", "N"}}}
	c := Name{Name: "C", Count: 1, Pronunciations: [][]string{{"K", "AE1", "N"}}}
	if score(a.Pronunciations[0], b, defaultWeights("sound"), 10000).Score != score(a.Pronunciations[0], c, defaultWeights("sound"), 10000).Score {
		t.Fatal("sound mode depends on frequency")
	}
	if score(a.Pronunciations[0], b, defaultWeights("frequency"), 10000).Score <= score(a.Pronunciations[0], c, defaultWeights("frequency"), 10000).Score {
		t.Fatal("frequency boost missing")
	}
	cells := align([]string{"K", "AE1", "T"}, []string{"K", "AE1", "T", "S"})
	if len(cells) != 4 || cells[3].From != "" || cells[3].To != "S" {
		t.Fatalf("bad alignment: %+v", cells)
	}
}

func TestWeightsAreRelativeAndEdgeBalanceChoosesWhichEdgeCounts(t *testing.T) {
	target := []string{"K", "AE1", "T"}
	sameStart := Name{Name: "Can", Count: 1, Pronunciations: [][]string{{"K", "AE1", "N"}}}
	sameEnd := Name{Name: "Pat", Count: 1, Pronunciations: [][]string{{"P", "AE1", "T"}}}
	small := score(target, sameStart, Weights{Sound: 17, Edge: 3, Last: 50}, 1)
	large := score(target, sameStart, Weights{Sound: 85, Edge: 15, Last: 50}, 1)
	if math.Abs(small.Score-large.Score) > 1e-12 {
		t.Fatalf("weights should be relative: %v vs %v", small.Score, large.Score)
	}
	lastOnly := Weights{Edge: 100, Last: 100}
	if got := score(target, sameStart, lastOnly, 1); got.Edge != 0 || got.Score != 0 {
		t.Fatalf("a shared first sound must not count when only the last sound is weighted: %+v", got)
	}
	if got := score(target, sameEnd, lastOnly, 1); got.Edge != 1 || got.Score != 1 {
		t.Fatalf("a shared last sound should count fully: %+v", got)
	}
	firstOnly := Weights{Edge: 100, Last: 0}
	if score(target, sameStart, firstOnly, 1).Score != 1 || score(target, sameEnd, firstOnly, 1).Score != 0 {
		t.Fatal("first-sound-only balance is wrong")
	}
}
