#!/usr/bin/env node
/**
 * Валидатор info.json виджета InSales 4-го поколения.
 * Правила синхронизированы с WidgetType (app/models/widget_type.rb)
 * и WidgetTypesFolderSyncService.
 *
 * Usage:
 *   node validate-info-json.mjs path/to/info.json
 *   node validate-info-json.mjs path/to/widget-folder
 *   node validate-info-json.mjs --self-test
 */

import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SYSTEM_HANDLE_PREFIX = 'system_'

const PAGE_KINDS = new Set([
  'all', 'index', 'collection', 'product', 'cart', 'page',
  'search', 'blog', 'compare', 'favorite', 'article', 'shared_cart'
])

const WIDGET_LIST_KINDS = new Set([
  'header', 'before_content', 'content', 'sidebar', 'after_content',
  'footer', 'outside', 'top_panel', 'bottom_panel'
])

const INTERFACE_TYPES = new Set(['lite', 'service', 'pro'])

const KNOWN_LIBRARIES = new Set([
  'commonjs_v2', 'jquery', 'my-layout', 'vanilla-lazyload',
  'splide', 'splide3', 'fslightbox', 'micromodal', 'body-scroll-lock',
  'js-cookie', 'cut-list', 'nouislider', 'microalert', 'tvist-v1'
])

const ALLOWED_TOP_LEVEL_KEYS = new Set([
  'generation', 'type', 'handle', 'sku', 'page_kinds', 'widget_list_kinds',
  'widget_category_handle', 'name', 'description', 'libraries', 'visibility',
  'block_template_handle', 'tags', 'lite', 'published', 'archived', 'position',
  'show_blocks_before_settings'
])

const LOCALE_KEYS = new Set(['ru', 'ua', 'en', 'es'])

function normalizeType(type) {
  if (typeof type !== 'string') return null
  return type.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

function isSystemHandle(handle) {
  return typeof handle === 'string' && handle.startsWith(SYSTEM_HANDLE_PREFIX)
}

function isBlockListType(type) {
  const normalized = normalizeType(type)
  return normalized === 'block_list_widget_type'
}

function isSimpleType(type) {
  const normalized = normalizeType(type)
  return normalized === 'simple_widget_type'
}

function isTranslationsObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function validateTranslations(fieldName, value, errors, warnings, { requiredLocale = 'ru' } = {}) {
  if (typeof value === 'string') {
    if (!value.trim()) errors.push(`${fieldName}: не может быть пустой строкой`)
    return
  }

  if (!isTranslationsObject(value)) {
    errors.push(`${fieldName}: ожидается строка или объект переводов { ru, en, ... }`)
    return
  }

  const keys = Object.keys(value)
  if (keys.length === 0) {
    errors.push(`${fieldName}: объект переводов не может быть пустым`)
    return
  }

  keys.forEach((key) => {
    if (!LOCALE_KEYS.has(key)) {
      warnings.push(`${fieldName}: неизвестная локаль "${key}" (ожидаются: ${[...LOCALE_KEYS].join(', ')})`)
    }
    if (typeof value[key] !== 'string') {
      errors.push(`${fieldName}.${key}: значение должно быть строкой`)
    }
  })

  if (requiredLocale && !(requiredLocale in value)) {
    errors.push(`${fieldName}: обязательна локаль "${requiredLocale}"`)
  }
}

function validateStringArray(fieldName, value, allowedValues, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${fieldName}: должен быть массивом`)
    return
  }

  if (value.length === 0) {
    errors.push(`${fieldName}: не может быть пустым массивом`)
    return
  }

  value.forEach((item, index) => {
    if (typeof item !== 'string') {
      errors.push(`${fieldName}[${index}]: элемент должен быть строкой`)
      return
    }
    if (allowedValues && !allowedValues.has(item)) {
      errors.push(`${fieldName}[${index}]: недопустимое значение "${item}"`)
    }
  })
}

/**
 * @param {unknown} info
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateInfoJson(info) {
  const errors = []
  const warnings = []

  if (info === null || typeof info !== 'object' || Array.isArray(info)) {
    errors.push('info.json: корневой элемент должен быть JSON-объектом')
    return { errors, warnings }
  }

  const data = /** @type {Record<string, unknown>} */ (info)

  Object.keys(data).forEach((key) => {
    if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
      warnings.push(`Неизвестное поле "${key}" — бэкенд может его проигнорировать`)
    }
  })

  // type
  if (data.type === undefined || data.type === null || data.type === '') {
    errors.push('type: обязательное поле (SimpleWidgetType или BlockListWidgetType)')
  } else if (typeof data.type !== 'string') {
    errors.push('type: должен быть строкой')
  } else {
    const normalized = normalizeType(data.type)
    if (!isBlockListType(data.type) && !isSimpleType(data.type)) {
      errors.push(`type: недопустимое значение "${data.type}" (ожидается SimpleWidgetType или BlockListWidgetType)`)
    }
  }

  // handle
  const handle = data.handle
  if (handle === undefined || handle === null || handle === '') {
    errors.push('handle: обязательное поле')
  } else if (typeof handle !== 'string') {
    errors.push('handle: должен быть строкой')
  } else {
    const system = isSystemHandle(handle)

    if (system) {
      // системные виджеты: handle уже начинается с system_
    } else {
      if (!/^[a-zA-Z0-9_-]+$/.test(handle)) {
        errors.push('handle: для кастомного виджета допустимы только латиница, цифры, _ и -')
      }
    }
  }

  const systemWidget = typeof handle === 'string' && isSystemHandle(handle)

  // generation
  const generation = data.generation
  if (generation === undefined || generation === null) {
    warnings.push('generation: не указано — бэкенд выставит автоматически (обычно 3 или 4)')
  } else if (!Number.isInteger(generation) || ![2, 3, 4].includes(generation)) {
    errors.push('generation: допустимые значения — 2, 3 или 4')
  }

  const effectiveGeneration = typeof generation === 'number' ? generation : null

  // sku — только для системных виджетов gen 4+
  if ('sku' in data && data.sku !== null && data.sku !== undefined && data.sku !== '') {
    if (!systemWidget) {
      errors.push('sku: указывается только у системных виджетов (handle начинается с system_). Для кастомных виджетов поле не нужно — sku генерируется бэкендом')
    } else if (typeof data.sku !== 'string') {
      errors.push('sku: должен быть строкой')
    } else if (effectiveGeneration !== null && effectiveGeneration >= 4 && !/^[A-Z0-9]+$/.test(data.sku)) {
      errors.push(`sku: для системного виджета 4-го поколения формат — только заглавные латинские буквы и цифры (например "MW1"), получено "${data.sku}"`)
    }
  } else if (systemWidget && effectiveGeneration !== null && effectiveGeneration >= 4) {
    warnings.push('sku: для системного виджета 4-го поколения рекомендуется явно указать sku (иначе бэкенд сгенерирует автоматически)')
  }

  // name
  if (data.name === undefined || data.name === null) {
    errors.push('name: обязательное поле')
  } else {
    validateTranslations('name', data.name, errors, warnings)
  }

  // description
  if (data.description !== undefined && data.description !== null) {
    validateTranslations('description', data.description, errors, warnings, { requiredLocale: null })
  }

  // widget_category_handle
  if (data.widget_category_handle === undefined || data.widget_category_handle === null || data.widget_category_handle === '') {
    errors.push('widget_category_handle: обязательное поле (handle категории из WidgetCategory)')
  } else if (typeof data.widget_category_handle !== 'string') {
    errors.push('widget_category_handle: должен быть строкой')
  }

  // page_kinds
  validateStringArray('page_kinds', data.page_kinds, PAGE_KINDS, errors)

  // widget_list_kinds
  validateStringArray('widget_list_kinds', data.widget_list_kinds, WIDGET_LIST_KINDS, errors)

  // block_template_handle
  if (isBlockListType(/** @type {string} */ (data.type))) {
    if (!data.block_template_handle) {
      errors.push('block_template_handle: обязателен для BlockListWidgetType')
    } else if (typeof data.block_template_handle !== 'string') {
      errors.push('block_template_handle: должен быть строкой')
    }
  } else if (isSimpleType(/** @type {string} */ (data.type)) && data.block_template_handle) {
    errors.push('block_template_handle: не используется для SimpleWidgetType — удалите поле')
  }

  // libraries
  if (data.libraries !== undefined && data.libraries !== null) {
    if (!Array.isArray(data.libraries)) {
      errors.push('libraries: должен быть массивом строк')
    } else {
      data.libraries.forEach((lib, index) => {
        if (typeof lib !== 'string') {
          errors.push(`libraries[${index}]: элемент должен быть строкой`)
          return
        }
        if (!KNOWN_LIBRARIES.has(lib)) {
          warnings.push(`libraries[${index}]: неизвестная библиотека "${lib}" — проверьте handle в WidgetLibrary`)
        }
      })
    }
  }

  // visibility
  if (data.visibility !== undefined && data.visibility !== null) {
    validateStringArray('visibility', data.visibility, INTERFACE_TYPES, errors)
  }

  return { errors, warnings }
}

function resolveInfoJsonPath(inputPath) {
  const resolved = resolve(inputPath)

  if (!existsSync(resolved)) {
    throw new Error(`Путь не существует: ${resolved}`)
  }

  const stat = statSync(resolved)
  if (stat.isDirectory()) {
    return join(resolved, 'info.json')
  }

  return resolved
}

function loadInfoJson(filePath) {
  const content = readFileSync(filePath, 'utf8')
  try {
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Невалидный JSON в ${filePath}: ${error.message}`)
  }
}

function printResult(filePath, { errors, warnings }) {
  if (warnings.length > 0) {
    console.log(`\n⚠️  Предупреждения (${filePath}):`)
    warnings.forEach((w) => console.log(`  • ${w}`))
  }

  if (errors.length > 0) {
    console.error(`\n❌ Ошибки (${filePath}):`)
    errors.forEach((e) => console.error(`  • ${e}`))
    return false
  }

  console.log(`\n✅ info.json корректен: ${filePath}`)
  return true
}

function runSelfTest() {
  const fixturesDir = join(__dirname, 'fixtures', 'info-json')
  const cases = [
    { file: 'valid-system-gen4.json', shouldPass: true },
    { file: 'valid-custom-gen4.json', shouldPass: true },
    { file: 'invalid-custom-with-sku.json', shouldPass: false },
    { file: 'invalid-missing-type.json', shouldPass: false },
    { file: 'invalid-wrong-type.json', shouldPass: false },
    { file: 'invalid-block-without-template.json', shouldPass: false }
  ]

  let failed = 0

  cases.forEach(({ file, shouldPass }) => {
    const path = join(fixturesDir, file)
    const info = loadInfoJson(path)
    const result = validateInfoJson(info)
    const passed = result.errors.length === 0

    if (passed !== shouldPass) {
      console.error(`SELF-TEST FAIL: ${file} — ожидалось ${shouldPass ? 'valid' : 'invalid'}, получено ${passed ? 'valid' : 'invalid'}`)
      result.errors.forEach((e) => console.error(`  error: ${e}`))
      failed += 1
    } else {
      console.log(`SELF-TEST OK: ${file}`)
    }
  })

  if (failed > 0) {
    process.exit(1)
  }

  console.log(`\nВсе ${cases.length} self-test кейсов пройдены`)
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage:
  node validate-info-json.mjs <path/to/info.json|widget-folder>
  node validate-info-json.mjs --self-test

Проверяет info.json виджета InSales по правилам бэкенда.
sku — только для системных виджетов (handle начинается с system_).`)
    process.exit(args.length === 0 ? 1 : 0)
  }

  if (args.includes('--self-test')) {
    runSelfTest()
    return
  }

  let allOk = true

  args.forEach((inputPath) => {
    try {
      const infoPath = resolveInfoJsonPath(inputPath)
      if (!existsSync(infoPath)) {
        console.error(`❌ Файл не найден: ${infoPath}`)
        allOk = false
        return
      }
      const info = loadInfoJson(infoPath)
      const result = validateInfoJson(info)
      if (!printResult(infoPath, result)) allOk = false
    } catch (error) {
      console.error(`❌ ${error.message}`)
      allOk = false
    }
  })

  process.exit(allOk ? 0 : 1)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main()
}
