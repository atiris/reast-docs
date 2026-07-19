# Real-world exploration menus

A room-exploration menu turns a scene into a place the reader can search, instead of a list of buttons to tap. This guide walks through building one, drawing and printing the marks it needs, testing it before publishing, and keeping it fair for the reader. For the language mechanics themselves, see [Exploration menus](/spec/03-narrative-interaction#exploration-menus) and [Real-world activation](/spec/03-narrative-interaction#real-world-activation) in the specification.

## The room example

Imagine a scene where the reader is physically standing in a room — a puzzle room, an escape-room prop, a museum exhibit — and can find three things: a QR sticker on a service door, a hand-painted tree on the wall, and a couch worth searching. None of them need to be found in order, and the reader might miss one entirely and still finish the story.

```rea
The room is quiet. Somewhere here is a way through, if you look for it.

{menu select=2 begin}
* hidden [&qr_door] The service door clicks open at the sound of your scan…
* hidden [&painted_tree] The painted tree on the wall shimmers, as if it recognizes you…
* hidden [&couch_secret] Under the couch you find an envelope, taped out of sight…
* [Give up and check the front desk]
{end menu}

{define action qr_door begin}
  name: The service door
  scan: ^REAST-DOOR-.*
{end define}

{define action painted_tree begin}
  name: The painted tree
  mark: emb1:Zk3q…
{end define}

{define action couch_secret begin}
  name: Under the couch
  description: look under the couch; lift the sofa; search beneath the seat
  listen: under the couch
{end define}
```

`select=2` keeps the menu open until the reader has found two of the three hidden options, or gives up through the visible "check the front desk" option. Each option wakes through a different channel: `qr_door` only responds to a scanned code matching the pattern, `painted_tree` only responds to a photo of the matching mark, and `couch_secret` responds to either typing "look under the couch" or saying it aloud. Whichever channel fires, the narration after the option plays exactly as if the reader had tapped a normal choice.

## Drawing and printing marks

A **mark** is a drawing — a smiley, an X, a painted tree, anything distinctive — that the reader photographs to activate an option. No QR code or printed pattern is required; the mark itself is the code.

In the editor, open **Draw a mark** from the toolbar, or use the drawn-mark field of the **Insert activation menu** dialog. Draw directly on the canvas, or upload a photo of something you've already painted or drawn on paper, wood, a wall — anywhere. The editor computes a signature from the drawing and writes it into the card's `mark:` field automatically; you never type or edit that value by hand. The dialog also warns you if the new mark is too similar to another mark already used in the story, so two hidden options don't accidentally answer to the same drawing.

Once a mark is saved, the "Draw a mark" dialog gives you a printable PNG asset of the drawing. Print it, or use it as a stencil to paint the mark for real — on a prop, a wall, a piece of card stock left at the location. The reader's camera matches a photo of the physical mark back to the signature on-device; nothing is uploaded anywhere to make the match.

## Testing your menu

- **Test each channel separately.** Scan the printed QR code, photograph the printed or painted mark, and type (then speak) the free-text phrase — confirm each one activates its own option and no other.
- **Test misses.** Scan an unrelated code, photograph something unrelated, type an unrelated phrase — the reader should get a gentle "nothing happened" response, not an error or a wrong option firing.
- **Play through the whole menu.** Discover options in a different order each run, and confirm `select=N` re-presents the menu correctly and closes once the count is met or the pool runs out.
- **Check undo.** Undo after a discovery should step back exactly one discovery, leaving earlier finds in place — see [Undo and saves inside a menu](/spec/03-narrative-interaction#undo-and-saves-inside-a-menu).
- **Preview in the location itself, if you can.** Lighting, distance, and printed size all affect whether a camera reliably reads a QR code or matches a mark; a mark that photographs cleanly on a monitor may not photograph as cleanly on a wall three meters away.

## Fairness: always leave a visible way onward

Hidden options are a reward for curious readers, never a requirement to finish the story. Two rules keep an exploration menu fair:

- **Always provide a visible way onward.** A menu should always include at least one non-`hidden` option — like "Give up and check the front desk" in the example above — so a reader who finds nothing can still continue. Never gate the main story behind a hidden option alone.
- **Hint hidden content in the prose, not in the choice label.** The classic complaint about old parser-based interactive fiction is "guess the verb" — content hidden so well the reader never realizes it exists. A hidden option's label only appears *after* it activates, so the invitation to search has to live in the surrounding narration instead: "Somewhere here is a way through, if you look for it" tells the reader there's something to find, without telling them what. Write the room's description so an attentive reader notices the door, the painted tree, and the suspicious couch — the discovery narration inside the option itself is where the payoff and any further hints belong.
