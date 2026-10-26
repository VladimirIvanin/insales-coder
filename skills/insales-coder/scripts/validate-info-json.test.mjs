import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { validateInfoJson } from './validate-info-json.mjs'

export function runSelfTest() {
  const fixture = name => JSON.parse(readFileSync(new URL(`./fixtures/info-json/${name}.json`, import.meta.url)))
  const base = fixture('valid-custom-gen4')
  const typeError = 'type: ожидается SimpleWidgetType, simpleWidgetType, simple_widget_type, BlockListWidgetType, blockListWidgetType или block_list_widget_type'
  const cases = [
    ['custom fixture', base, {}, [], []],
    ['system fixture', fixture('valid-system-gen4'), { context: 'system' }, [], []],
    ['invalid custom sku fixture', fixture('invalid-custom-with-sku'), {}, ['sku: в контексте custom ожидается [A-Z0-9]+.digits'], []],
    ['missing type fixture', fixture('invalid-missing-type'), { context: 'system' }, [typeError], []],
    ['wrong type fixture', fixture('invalid-wrong-type'), { context: 'system' }, [typeError], []],
    ['missing template fixture', fixture('invalid-block-without-template'), { context: 'system' }, ['block_template_handle: обязательна непустая строка'], []],
    ['root array', [], {}, ['info.json: корневой элемент должен быть JSON-объектом'], []],
    ['empty arrays and optional description', { ...base, page_kinds: [], widget_list_kinds: [], visibility: [], description: {} }, {}, [], []],
    ['empty description', { ...base, description: '' }, {}, [], []],
    ['null translations', { ...base, name: { de: 'Name', en: null }, description: { ru: null } }, {}, [], []],
    ['missing description', { ...base, description: undefined }, {}, [], []],
    ['null description', { ...base, description: null }, {}, [], []],
    ['custom sku accepted', { ...base, sku: 'CU0.1' }, {}, [], []],
    ['system generated sku', { ...base, handle: 'system_example', sku: undefined }, { context: 'system' }, [], []],
    ['ownership is explicit', { ...base, handle: 'system_example' }, {}, ['handle: в контексте custom не должен начинаться с system_'], []],
    ['custom handle format', { ...base, handle: 'custom name' }, {}, ['handle: в контексте custom допустимы латиница, цифры, _ и -'], []],
    ['system context', base, { context: 'system' }, ['handle: в контексте system должен начинаться с system_'], []],
    ['known setter', { ...base, git_branch: 'development' }, {}, [], []],
    ['unknown setter', { ...base, bogus: true }, {}, [], ['bogus: checker не знает этот setter; folder sync присваивает поля модели и при отсутствии setter завершится UnknownAttributeError — сверьте с целевой платформой']],
    ['empty name locale', { ...base, name: { ru: '' } }, {}, ['name: нужен хотя бы один непустой перевод'], []],
    ['empty name', { ...base, name: ' ' }, {}, ['name: обязательна непустая строка или перевод'], []],
    ['null name', { ...base, name: null }, {}, ['name: ожидается строка или объект переводов'], []],
    ['locale independent', { ...base, name: { en: 'Name' } }, {}, [], []],
    ['selected locale absent', { ...base, name: { en: 'Name' } }, { locale: 'ru' }, ['name.ru: обязателен непустой перевод для выбранной локали'], []],
    ['selected locale empty', { ...base, name: { ru: null, en: 'Name' } }, { locale: 'ru' }, ['name.ru: обязателен непустой перевод для выбранной локали'], []],
    ['name value type', { ...base, name: { ru: 4 } }, {}, ['name.ru: ожидается строка или null', 'name: нужен хотя бы один непустой перевод'], []],
    ['description value type', { ...base, description: { en: 4 } }, {}, ['description.en: ожидается строка или null'], []],
    ['uppercase type', { ...base, type: 'SIMPLE_WIDGET_TYPE' }, {}, [typeError], []],
    ['empty type', { ...base, type: '' }, {}, [typeError], []],
    ['missing generation', { ...base, generation: undefined }, {}, ['generation: для полного gen4-пакета укажите 4 (defaults платформы и gen2/3 здесь не проверяются)'], []],
    ['enum drift', { ...base, page_kinds: ['multilink.all'] }, {}, ['page_kinds[0]: недопустимое значение "multilink.all"'], []],
    ['array required', { ...base, widget_list_kinds: null }, {}, ['widget_list_kinds: должен быть массивом'], []],
    ['library value type', { ...base, libraries: [1] }, {}, ['libraries[0]: элемент должен быть строкой'], []],
    ['simple without template setter', { ...base, type: 'SimpleWidgetType', block_template_handle: 'system-image-and-content' }, {}, ['block_template_handle: у SimpleWidgetType нет этого setter для folder sync'], []]
  ]
  for (const type of ['SimpleWidgetType', 'simpleWidgetType', 'simple_widget_type', 'BlockListWidgetType', 'blockListWidgetType', 'block_list_widget_type']) {
    const input = { ...base, type }
    if (type === 'SimpleWidgetType' || type === 'simpleWidgetType' || type === 'simple_widget_type') delete input.block_template_handle
    cases.push([`type alias ${type}`, input, {}, [], []])
  }
  for (const [label, input, options, errors, warnings] of cases) {
    assert.deepEqual(validateInfoJson(input, options), { errors, warnings }, label)
    console.log(`SELF-TEST OK: ${label}`)
  }
  assert.throws(() => validateInfoJson(base, { context: 'auto' }), /context: ожидается custom или system/)
  assert.throws(() => validateInfoJson(base, { locale: '' }), /locale: ожидается непустая строка/)
  const script = fileURLToPath(new URL('./validate-info-json.mjs', import.meta.url))
  const systemFixture = fileURLToPath(new URL('./fixtures/info-json/valid-system-gen4.json', import.meta.url))
  const validCli = spawnSync(process.execPath, [script, '--context', 'system', '--locale', 'ru', systemFixture], { cwd: tmpdir(), encoding: 'utf8' })
  assert.equal(validCli.status, 0, validCli.stderr)
  assert.match(validCli.stdout, /Локальная структурная проверка пройдена:/)
  const customCli = spawnSync(process.execPath, [script, systemFixture], { cwd: tmpdir(), encoding: 'utf8' })
  assert.equal(customCli.status, 1)
  assert.match(customCli.stderr, /handle: в контексте custom не должен начинаться с system_/)
  const invalidOption = spawnSync(process.execPath, [script, '--context'], { cwd: tmpdir(), encoding: 'utf8' })
  assert.equal(invalidOption.status, 1)
  assert.equal(invalidOption.stderr.trim(), '--context: требуется значение')
  console.log(`Все ${cases.length} self-test кейсов, 2 проверки API-опций и 3 CLI-проверки из другого cwd пройдены`)
}
