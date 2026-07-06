# Changelog

## v0.1.0 (Current)

Initial release of the Rea language specification and `@reast/engine`.

### Features

- Full Rea language specification (5 chapters + cheatsheet)
- Parser: lexer, block parser, inline parser, post-processor, analyser
- Runtime: interpreter, expression evaluator, state manager, flow navigator
- Loader: ZIP extraction, AES decryption, manifest parsing, media mapping
- Player: `<reast-engine>` Custom Element with Shadow DOM
- Validator: story structure validation with warnings
- Built-in functions: string, math, array, type, locale categories
- Security: URI scheme allowlist, path traversal protection, variable name sanitization
- Accessibility: ARIA live regions, focus management, semantic HTML rendering
- Reader preferences: font, size, line height, theme (light/sepia/dark/AMOLED)
- Reading position save/restore with LRU eviction

### Version Policy

The Rea language follows semantic versioning. Breaking changes to the language syntax or runtime behaviour will increment the major version. Previously published stories remain readable by newer engine versions.

When v1.0 is released, this version selector will allow switching between documentation versions for different engine releases.
