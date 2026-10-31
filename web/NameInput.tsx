import { useEffect, useRef, useState } from "react";

// An inline combobox avoids iOS's native datalist popover and keeps the input
// as the focused element during pointer selection, preserving the keyboard.
export function NameInput({
  value,
  onChange,
  catalog,
}: {
  value: string;
  onChange: (value: string) => void;
  catalog: string[];
}) {
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const list = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);
  const suggestions =
    value.trim().length > 1
      ? catalog
          .filter((name) =>
            name.toLowerCase().startsWith(value.trim().toLowerCase()),
          )
          .slice(0, 12)
      : [];
  const expanded = open && suggestions.length > 0;
  function choose(name: string) {
    // A mobile viewport adjustment can blur the field during a tap. Restore
    // focus inside the selection gesture, without scrolling or a pointer ring.
    if (input.current && document.activeElement !== input.current) {
      input.current.dataset.pointerFocus = "true";
      input.current.focus({ preventScroll: true });
    }
    onChange(name);
    setOpen(false);
    setActive(-1);
  }
  useEffect(() => {
    const menu = list.current,
      option = menu?.children[active] as HTMLElement | undefined;
    if (!menu || !option) return;
    if (option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
    else if (
      option.offsetTop + option.offsetHeight >
      menu.scrollTop + menu.clientHeight
    )
      menu.scrollTop =
        option.offsetTop + option.offsetHeight - menu.clientHeight;
  }, [active]);
  return (
    <div className="name-input-wrap">
      <label className="sr-only" htmlFor="your-name">
        Your name
      </label>
      <input
        ref={input}
        id="your-name"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? "name-suggestions" : undefined}
        aria-activedescendant={
          expanded && active >= 0 ? `name-option-${active}` : undefined
        }
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Do not unmount the pressed option before its pointerup arrives.
          if (pointer.current) return;
          setOpen(false);
          setActive(-1);
        }}
        onKeyDown={(e) => {
          delete e.currentTarget.dataset.pointerFocus;
          if (e.nativeEvent.isComposing) return;
          if (
            (e.key === "ArrowDown" || e.key === "ArrowUp") &&
            suggestions.length
          ) {
            e.preventDefault();
            setOpen(true);
            setActive((i) =>
              e.key === "ArrowDown"
                ? (i + 1) % suggestions.length
                : (i <= 0 ? suggestions.length : i) - 1,
            );
          } else if (e.key === "Enter" && expanded && active >= 0) {
            e.preventDefault();
            choose(suggestions[active]);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            setActive(-1);
          } else if (e.key === "Enter") {
            setOpen(false);
          }
        }}
        maxLength={80}
        autoComplete="off"
        autoCapitalize="words"
        autoCorrect="off"
        spellCheck={false}
      />
      {expanded && (
        <ul
          ref={list}
          id="name-suggestions"
          className="name-suggestions"
          role="listbox"
          aria-label="Name suggestions"
        >
          {suggestions.map((name, i) => (
            <li
              id={`name-option-${i}`}
              key={name}
              role="option"
              aria-selected={i === active}
              onPointerDown={(e) => {
                // Safari may suppress click after this cancellation. Handle a
                // stationary pointer release explicitly instead of refocusing.
                e.preventDefault();
                pointer.current = {
                  x: e.clientX,
                  y: e.clientY,
                  id: e.pointerId,
                };
                // Keep the release attached to this option if Safari shifts
                // the visual viewport while the keyboard is open.
                if (e.nativeEvent.isTrusted) {
                  e.currentTarget.setPointerCapture(e.pointerId);
                }
              }}
              onPointerCancel={() => {
                pointer.current = null;
                if (document.activeElement !== input.current) setOpen(false);
              }}
              onPointerUp={(e) => {
                const down = pointer.current;
                pointer.current = null;
                if (
                  down?.id === e.pointerId &&
                  Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8
                ) {
                  e.preventDefault();
                  choose(name);
                } else if (document.activeElement !== input.current) {
                  setOpen(false);
                }
              }}
              onClick={(e) => {
                if (e.detail === 0) choose(name);
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
