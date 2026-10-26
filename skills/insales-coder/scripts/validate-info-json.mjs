#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const TYPES = new Map([
  ['SimpleWidgetType', 'simple'], ['simpleWidgetType', 'simple'], ['simple_widget_type', 'simple'],
  ['BlockListWidgetType', 'blocks'], ['blockListWidgetType', 'blocks'], ['block_list_widget_type', 'blocks']
])
const PAGE_KINDS = new Set('all index collection product cart page search blog compare favorite article shared_cart'.split(' '))
const LIST_KINDS = new Set('header before_content content sidebar after_content footer outside top_panel bottom_panel'.split(' '))
const VISIBILITY = new Set(['lite', 'service', 'pro'])
const KNOWN_FIELDS = new Set(`
  generation type handle sku page_kinds widget_list_kinds widget_category_handle
  name description libraries visibility block_template_handle tags lite published
  archived position show_blocks_before_settings git_branch git_folder_name
  id account_id theme_id snippet_id created_at updated_at block_template_id
  snippet_content settings_form settings_data messages widget_category_id
  preview_file_name preview_content_type preview_file_size preview_updated_at
  preview_synced_to_yandex snippet_css snippet_js setup snippet_scss
  name_translations description_translations widget_libraries_id widget_type_preview_id
  preview_synced_to_sbercloud block_settings_presets libraries_handles theme_editor_scss_compiler
`.trim().split(/\s+/))
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const present = value => typeof value === 'string' && value.trim().length > 0

export function validateInfoJson(info, { context = 'custom', locale } = {}) {
  const errors = []
  const warnings = []
  if (!['custom', 'system'].includes(context)) throw new Error('context: ожидается custom или system')
  if (locale !== undefined && !present(locale)) throw new Error('locale: ожидается непустая строка')
  if (!object(info)) return { errors: ['info.json: корневой элемент должен быть JSON-объектом'], warnings }

  function requiredString(field) {
    if (!present(info[field])) errors.push(`${field}: обязательна непустая строка`)
  }
  function array(field, allowed) {
    if (!Array.isArray(info[field])) {
      errors.push(`${field}: должен быть массивом`)
      return
    }
    info[field].forEach((value, index) => {
      if (typeof value !== 'string') errors.push(`${field}[${index}]: элемент должен быть строкой`)
      else if (allowed && !allowed.has(value)) errors.push(`${field}[${index}]: недопустимое значение "${value}"`)
      else if (!allowed && !present(value)) errors.push(`${field}[${index}]: handle не может быть пустым`)
    })
  }
  function translations(field, required) {
    const value = info[field]
    if (!required && (value === undefined || value === null)) return
    if (typeof value === 'string') {
      if (required && !present(value)) errors.push(`${field}: обязательна непустая строка или перевод`)
    } else if (object(value)) {
      for (const [key, translation] of Object.entries(value)) {
        if (translation !== null && typeof translation !== 'string') errors.push(`${field}.${key}: ожидается строка или null`)
      }
      if (required && locale !== undefined && !present(value[locale])) errors.push(`${field}.${locale}: обязателен непустой перевод для выбранной локали`)
      else if (required && locale === undefined && !Object.values(value).some(present)) errors.push(`${field}: нужен хотя бы один непустой перевод`)
    } else {
      errors.push(`${field}: ожидается строка или объект переводов${required ? '' : ', null или отсутствие поля'}`)
    }
  }

  for (const key of Object.keys(info)) {
    if (!KNOWN_FIELDS.has(key)) warnings.push(`${key}: checker не знает этот setter; folder sync присваивает поля модели и при отсутствии setter завершится UnknownAttributeError — сверьте с целевой платформой`)
  }
  if (!TYPES.has(info.type)) errors.push('type: ожидается SimpleWidgetType, simpleWidgetType, simple_widget_type, BlockListWidgetType, blockListWidgetType или block_list_widget_type')
  if (info.generation !== 4) errors.push('generation: для полного gen4-пакета укажите 4 (defaults платформы и gen2/3 здесь не проверяются)')
  requiredString('handle')
  if (present(info.handle)) {
    if (context === 'system' && !info.handle.startsWith('system_')) errors.push('handle: в контексте system должен начинаться с system_')
    if (context === 'custom' && info.handle.startsWith('system_')) errors.push('handle: в контексте custom не должен начинаться с system_')
    if (context === 'custom' && !/^[a-zA-Z0-9_-]+$/.test(info.handle)) errors.push('handle: в контексте custom допустимы латиница, цифры, _ и -')
  }
  if (info.sku !== undefined && info.sku !== null && info.sku !== '') {
    const format = context === 'system' ? /^[A-Z0-9]+$/ : /^[A-Z0-9]+\.\d+$/
    if (typeof info.sku !== 'string' || !format.test(info.sku)) errors.push(`sku: в контексте ${context} ожидается ${context === 'system' ? '[A-Z0-9]+' : '[A-Z0-9]+.digits'}`)
  }
  translations('name', true)
  translations('description', false)
  requiredString('widget_category_handle')
  array('page_kinds', PAGE_KINDS)
  array('widget_list_kinds', LIST_KINDS)
  if (TYPES.get(info.type) === 'blocks') requiredString('block_template_handle')
  if (TYPES.get(info.type) === 'simple' && 'block_template_handle' in info) errors.push('block_template_handle: у SimpleWidgetType нет этого setter для folder sync')
  if (info.libraries !== undefined && info.libraries !== null) array('libraries')
  if (info.visibility !== undefined && info.visibility !== null && info.visibility !== '') array('visibility', VISIBILITY)
  return { errors, warnings }
}

const usage = `Usage:
  node "$SKILL_DIR/scripts/validate-info-json.mjs" [--context custom|system] [--locale ru] <info.json|widget-folder> [...]

Структура info.json полного gen4-пакета. Контекст по умолчанию custom;
передайте system для folder/git импорта без account/theme. Locale необязательна.
Это не проверка остальных файлов, ссылок, уникальности, Liquid или runtime.`

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h') || !args.length) {
    console.log(usage)
    return args.length ? 0 : 1
  }
  const options = {}
  const paths = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--context' || args[i] === '--locale') {
      const key = args[i].slice(2)
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${args[i]}: требуется значение`)
      options[key] = args[++i]
    } else if (args[i].startsWith('-')) throw new Error(`Неизвестный аргумент: ${args[i]}`)
    else paths.push(args[i])
  }
  if (!paths.length) throw new Error('Укажите путь к info.json или папке виджета')
  let failed = false
  for (const input of paths) {
    try {
      const path = resolve(input)
      const file = statSync(path).isDirectory() ? join(path, 'info.json') : path
      const result = validateInfoJson(JSON.parse(readFileSync(file, 'utf8')), options)
      for (const warning of result.warnings) console.warn(`WARNING ${file}: ${warning}`)
      for (const error of result.errors) console.error(`ERROR ${file}: ${error}`)
      if (result.errors.length) failed = true
      else console.log(`Локальная структурная проверка пройдена: ${file}`)
    } catch (error) {
      console.error(`ERROR ${input}: ${error.message}`)
      failed = true
    }
  }
  return failed ? 1 : 0
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().then(code => { process.exitCode = code }).catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
