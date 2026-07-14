import { useMemo } from 'react'

/**
 * useMessageSearch
 *
 * Computes all occurrences of `searchQuery` across `messages` using a
 * case-insensitive, trimmed indexOf loop.
 *
 * Time  complexity: O(N × L)  — N = number of messages, L = avg message length
 * Space complexity: O(M)      — M = total number of matches found
 *
 * @param {Array}  messages    - Redux messages array
 * @param {string} searchQuery - raw search string from the input
 *
 * @returns {{
 *   matches: Array<{ msgIndex: number, start: number, end: number, globalIndex: number }>,
 *   matchesPerMessage: Map<number, Array<{ start: number, end: number, globalIndex: number }>>,
 *   totalCount: number
 * }}
 */
function useMessageSearch(messages, searchQuery) {
  return useMemo(() => {
    const empty = { matches: [], matchesPerMessage: new Map(), totalCount: 0 }

    // Normalise the query
    const query = searchQuery.trim().toLowerCase()
    if (!query || !messages || messages.length === 0) return empty

    const matches = []                // flat list of all matches
    const matchesPerMessage = new Map() // msgIndex → [{start,end,globalIndex}]
    let globalIndex = 0

    for (let msgIndex = 0; msgIndex < messages.length; msgIndex++) {
      const raw = messages[msgIndex]?.message
      if (!raw || typeof raw !== 'string') continue

      const textLower = raw.toLowerCase()
      const msgMatches = []
      let pos = 0

      while (true) {
        const found = textLower.indexOf(query, pos)
        if (found === -1) break

        const match = {
          msgIndex,
          start: found,
          end: found + query.length,
          globalIndex,
        }

        matches.push(match)
        msgMatches.push({ start: found, end: found + query.length, globalIndex })
        globalIndex++
        pos = found + query.length // advance past this match (no overlapping)
      }

      if (msgMatches.length > 0) {
        matchesPerMessage.set(msgIndex, msgMatches)
      }
    }

    return { matches, matchesPerMessage, totalCount: matches.length }
  }, [messages, searchQuery])
}

export default useMessageSearch
