#!/usr/bin/env node
import { createCommandModules, program } from '@packasso/core'

const BIN = '@packasso/bin'
const GIT_IGNORE = '@packasso/gitignore'
const LICENSE = '@packasso/license'
const YARN_AUDIT = '@packasso/yarn-audit'
const TSC = '@packasso/tsc'
const BUILD_STAMP = '@packasso/buildstamp'
const ESLINT = '@packasso/eslint'
const PRETTIER = '@packasso/prettier'
const NODE_TEST = '@packasso/node-test'
const COVERAGE = '@packasso/coverage'
const SEMREL = '@packasso/semrel'

const modules: Record<string, string[]> = {
  install: [
    GIT_IGNORE,
    LICENSE,
    BIN,
    TSC,
    BUILD_STAMP,
    ESLINT,
    PRETTIER,
    SEMREL,
  ],
  uninstall: [
    SEMREL,
    PRETTIER,
    ESLINT,
    BUILD_STAMP,
    TSC,
    BIN,
    LICENSE,
    GIT_IGNORE,
  ],
  build: [BUILD_STAMP, TSC],
  lint: [ESLINT, PRETTIER],
  audit: [YARN_AUDIT],
  test: [NODE_TEST, COVERAGE],
  release: [SEMREL],
  clean: [BUILD_STAMP, TSC, NODE_TEST, COVERAGE],
  purge: [
    SEMREL,
    NODE_TEST,
    COVERAGE,
    TSC,
    LICENSE,
    ESLINT,
    PRETTIER,
    GIT_IGNORE,
  ],
}

program(createCommandModules(modules))
