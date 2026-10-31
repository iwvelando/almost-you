//go:build js && wasm

package main

import (
	"almost-you/engine"
	"syscall/js"
)

func main() {
	handler := js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) != 1 || args[0].Type() != js.TypeString {
			return `{"error":"Expected one JSON string."}`
		}
		return engine.Handle(args[0].String())
	})
	js.Global().Set("almostYou", handler)
	select {}
}
