#!/usr/bin/env node
import { createCommandModules, feature, program } from '@packasso/core'

const GIT_IGNORE = '@packasso/gitignore'
const LICENSE = '@packasso/license'
const YARN_AUDIT = '@packasso/yarn-audit'
const TSC = '@packasso/tsc'
const BUILD_STAMP = '@packasso/buildstamp'
const TYPEDOC = '@packasso/typedoc'
const ESLINT = '@packasso/eslint'
const PRETTIER = '@packasso/prettier'
const NODE_TEST = '@packasso/node-test'
const JEST = '@packasso/jest'
const COVERAGE = '@packasso/coverage'
const SEMREL = '@packasso/semrel'

const modules: Record<string, string[]> = {
  install: [
    GIT_IGNORE,
    LICENSE,
    TSC,
    BUILD_STAMP,
    TYPEDOC,
    NODE_TEST,
    JEST,
    ESLINT,
    PRETTIER,
    SEMREL,
  ],
  uninstall: [
    SEMREL,
    PRETTIER,
    ESLINT,
    JEST,
    NODE_TEST,
    TYPEDOC,
    BUILD_STAMP,
    TSC,
    LICENSE,
    GIT_IGNORE,
  ],
  build: [BUILD_STAMP, TSC, TYPEDOC],
  lint: [ESLINT, PRETTIER],
  audit: [YARN_AUDIT],
  test: feature('node_test')
    ? [NODE_TEST, JEST, COVERAGE]
    : [JEST, NODE_TEST, COVERAGE],
  release: [SEMREL],
  clean: [BUILD_STAMP, TSC, NODE_TEST, JEST, COVERAGE, TYPEDOC],
  purge: [
    SEMREL,
    COVERAGE,
    NODE_TEST,
    JEST,
    TSC,
    TYPEDOC,
    BUILD_STAMP,
    ESLINT,
    PRETTIER,
    LICENSE,
    GIT_IGNORE,
  ],
}

program(createCommandModules(modules))
