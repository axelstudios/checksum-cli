import {createHash, getHashes} from 'node:crypto'
import {createReadStream} from 'node:fs'
import globby from 'globby'
import minimist from 'minimist'
import PQueue from 'p-queue'

const {compare: naturalSort} = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base'
})

const availableHashes: ReadonlyArray<string> = getHashes().sort(naturalSort)

const hashFile = (filename: string, algorithm: string) => {
  return new Promise<string>((resolve) => {
    const hash = createHash(algorithm)
    const input = createReadStream(filename)
    input.on('readable', () => {
      const data = input.read()
      if (data) {
        hash.update(data)
      } else {
        resolve(`${hash.digest('hex')}  ${filename}`)
      }
    })
  })
}

const {_: globs, algorithm, concurrency, verbose} = minimist(process.argv.slice(2), {
  alias: {
    algorithm: 'a',
    concurrency: 'c',
    verbose: 'v'
  },
  boolean: 'verbose',
  string: ['algorithm', 'concurrency'],
  default: {
    algorithm: 'sha256',
    concurrency: '10'
  }
}) as minimist.ParsedArgs & { algorithm: string; concurrency: string; verbose: boolean; }

if (!availableHashes.includes(algorithm)) {
  console.error(`Error: Unsupported algorithm '${algorithm}'\nAvailable algorithms: ${availableHashes.join(', ')}`)
  process.exit(1)
} else if (!/^\d+$/.test(concurrency)) {
  console.error(`Error: Invalid concurrency '${concurrency}'. Must be an unsigned integer`)
  process.exit(1)
}

;(async () => {
  const paths = (await globby(globs, {dot: true})).sort(naturalSort)

  if (paths.length) {
    const queueConcurrency = concurrency === '0' ? Infinity : Number(concurrency)
    const queue = new PQueue({concurrency: queueConcurrency})
    const hashes = await queue.addAll(paths.map((filename) => () => hashFile(filename, algorithm)))
    console.log(hashes.join('\n'))
  } else if (verbose) {
    console.log('No files found matching glob pattern')
  }
})()
