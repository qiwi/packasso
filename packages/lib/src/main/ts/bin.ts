#!/usr/bin/env node
import { createCommandModules, program } from '@packasso/core'

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
const SEMREL = '@packasso/semrel'

const modules: Record<string, string[]> = {
  install: [
    GIT_IGNORE,
    LICENSE,
    TSC,
    BUILD_STAMP,
    TYPEDOC,
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
    TYPEDOC,
    BUILD_STAMP,
    TSC,
    LICENSE,
    GIT_IGNORE,
  ],
  build: [BUILD_STAMP, TSC, TYPEDOC],
  lint: [ESLINT, PRETTIER],
  audit: [YARN_AUDIT],
  test: [NODE_TEST],
  'test:unit': [NODE_TEST],
  'test:it': [NODE_TEST],
  'test:e2e': [NODE_TEST],
  'jest:test': [JEST],
  'jest:test:unit': [JEST],
  'jest:test:it': [JEST],
  'jest:test:e2e': [JEST],
  release: [SEMREL],
  clean: [BUILD_STAMP, TSC, NODE_TEST, JEST, TYPEDOC],
  purge: [
    GIT_IGNORE,
    LICENSE,
    TSC,
    ESLINT,
    PRETTIER,
    NODE_TEST,
    JEST,
    TYPEDOC,
    SEMREL,
  ],
}

program(createCommandModules(modules))
