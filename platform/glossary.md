# Glossary

Key terms used across the Reast platform.

## Platform Terms

| Term              | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **Reast**         | A packaged interactive story — the file format (`.rea` / `.reast`) and the content it contains. |
| **Rea**           | The markup language used to write interactive stories.                                          |
| **Story**         | A complete interactive narrative written in Rea, published on the platform.                     |
| **Chapter**       | A top-level section of a story, defined by a `#` heading in Rea.                                |
| **Scene**         | A subsection within a chapter, defined by `##` or deeper headings.                              |
| **Choice**        | A decision point where the reader selects from options that affect the narrative.               |
| **Command**       | A `{keyword}` instruction in Rea that controls logic, media, or behavior.                       |
| **Variable**      | A named value (`{set name = value}`) that stores state during a reading session.                |
| **Reader**        | A person consuming/playing an interactive story.                                                |
| **Author**        | A person who writes and publishes interactive stories on the platform.                          |
| **Player**        | The runtime component that renders and executes Rea stories in the browser.                     |
| **Shelf**         | A reader's personal collection of saved/bookmarked stories.                                     |
| **Reading group** | Multiple readers experiencing the same story together with synchronized decisions.              |
| **Role**          | A character assignment in cooperative reading — each reader takes a different role.             |
| **Progress**      | The reader's current position and state within a story (auto-saved).                            |
| **Bookmark**      | A named save point within a story that the reader can return to.                                |

## Story Tiers

| Term              | Description                                               |
| ----------------- | --------------------------------------------------------- |
| **Free story**    | A story available to all readers without payment.         |
| **Premium story** | A story that requires a platform subscription to access.  |
| **Paid story**    | A story with a one-time purchase price set by the author. |

## Technical Terms

| Term              | Description                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Parser**        | The component that reads Rea source text and produces a structured document tree.      |
| **Runtime**       | The execution engine that processes commands, manages state, and drives the narrative. |
| **Renderer**      | The component that converts parsed Rea content into visible HTML/UI elements.          |
| **Web Component** | The `<reast-engine>` custom element that can embed stories on any website.             |
| **Offline mode**  | The ability to read downloaded stories without an internet connection.                 |
| **Snapshot**      | A serialized capture of the reader's complete state at a point in time.                |
| **Slug**          | A URL-friendly identifier for a story (e.g., `the-lantern-of-arath`).                  |
| **TUI**           | Text-based Unique Identifier — a short, human-readable ID using a safe character set.  |
