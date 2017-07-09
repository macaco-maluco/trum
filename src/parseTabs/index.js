export default tabs => {
  return tabs.split('\n').filter(line => line.trim().length > 0).map(line => {
    const match = line.match(/^(.{1,3})\|(.+)/)

    return !match
      ? { symbol: 'invalid', notes: [] }
      : {
          symbol: match[1].trim().toLowerCase(),
          notes: match[2].split('').filter(note => note !== '|' && note !== ' '),
        }
  })
}
