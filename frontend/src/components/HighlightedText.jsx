import React from 'react'

/**
 * HighlightedText
 *
 * Renders a text string with highlighted spans for all match ranges.
 * The active match gets a stronger highlight and a `data-match-id="active"`
 * attribute so that the parent can call scrollIntoView on it.
 *
 * Props:
 *   text              {string}  - the raw message text to display
 *   query             {string}  - the trimmed search query (used to check if search is active)
 *   matchRanges       {Array}   - [{ start, end, globalIndex }] sorted by start
 *   activeGlobalIndex {number}  - the currently-active global match index
 *   className         {string}  - optional extra class passed through
 */
function HighlightedText({ text, query, matchRanges, activeGlobalIndex, className = '' }) {
  // No search active or no text → plain render
  if (!query || !text || !matchRanges || matchRanges.length === 0) {
    return <span className={className}>{text}</span>
  }

  // Build segments: plain text interspersed with highlighted spans
  const segments = []
  let lastIndex = 0

  for (let i = 0; i < matchRanges.length; i++) {
    const { start, end, globalIndex } = matchRanges[i]

    // Text before this match
    if (start > lastIndex) {
      segments.push(
        <span key={`text-${i}`}>{text.slice(lastIndex, start)}</span>
      )
    }

    const isActive = globalIndex === activeGlobalIndex

    segments.push(
      <mark
        key={`match-${i}`}
        data-match-id={isActive ? 'active' : `match-${globalIndex}`}
        className={isActive ? 'search-highlight-active' : 'search-highlight'}
      >
        {text.slice(start, end)}
      </mark>
    )

    lastIndex = end
  }

  // Remaining text after the last match
  if (lastIndex < text.length) {
    segments.push(
      <span key="text-end">{text.slice(lastIndex)}</span>
    )
  }

  return <span className={className}>{segments}</span>
}

export default HighlightedText
