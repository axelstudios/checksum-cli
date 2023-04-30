# checksum-cli

> Checksum files using glob patterns

This project builds on the work of [checksum](https://github.com/dshaw/checksum), with secure defaults and cross-platform support for glob patterns in file paths

## Install

```sh
npm install --global checksum-cli
```

## Usage

```
Usage
  $ checksum-cli <path|glob> …

Options
  --algorithm, -a    Set the hash algorithm, defaults to sha256
  --concurrency, -c  Set the number of files that can be hashed in parallel, defaults to 10
                     Setting concurrency to 0 will hash every file in parallel, but is not recommended since it could exceed the max open files limit
  --verbose, -v      Print message if no files match glob pattern, otherwise nothing is printed

Examples
  $ checksum-cli assets/**/*.png
  $ checksum-cli ** !node_modules
```
