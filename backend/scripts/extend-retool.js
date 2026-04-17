// Extends the Retool app JSON to add editable tables for all DB tables
const fs = require('fs');
const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const appState = JSON.parse(input.page.data.appState);
// appState = ["~#iR", ["^ ", "n", "appTemplate", "v", ["^ ", ...]]]
const templateData = appState[1][3]; // the ["^ ", ...] map contents

// Find plugins iOM array
const pluginsIdx = templateData.indexOf('plugins');
const pluginsList = templateData[pluginsIdx + 1][1]; // ["~#iOM", [key, val, key, val...]][1]

const RESOURCE_ID = '99369d0e-fd14-4413-a499-50d66fcb1ac5';
const RESOURCE_NAME = 'voide';
const NOW = `~m${Date.now()}`;

// Fix query1: set runWhenPageLoads=true (it's buried in the template map array)
// query1 is at pluginsList[6] (key) and pluginsList[7] (value)
// The template is inside the plugin value
function findPluginValue(name) {
  const idx = pluginsList.indexOf(name);
  return idx >= 0 ? pluginsList[idx + 1] : null;
}

// Patch query1 to run on page load
const query1Val = findPluginValue('query1');
if (query1Val) {
  const tmpl = query1Val[1][3]; // ["^ ", "n", "pluginTemplate", "v", ["^ ", ...]][3]
  const templateMap = tmpl[3]; // the inner ["^ ", ...] or ["^1J", [...]]
  // templateMap[1] is the flat array of key/value pairs
  const arr = templateMap[1];
  const rwplIdx = arr.indexOf('runWhenPageLoads');
  if (rwplIdx >= 0) arr[rwplIdx + 1] = true;
  // Remove broken filterBy
  const fbIdx = arr.indexOf('filterBy');
  if (fbIdx >= 0) arr[fbIdx + 1] = '';
  // Fix actionType to SELECT
  const atIdx = arr.indexOf('actionType');
  if (atIdx >= 0) arr[atIdx + 1] = 'SELECT';
}

function makeQuery(id, sql, page, opts = {}) {
  const tmplArr = [
    'queryRefreshTime', '',
    'allowedGroupIds', ['~#iL', []],
    'streamResponse', false,
    'records', '',
    'lastReceivedFromResourceAt', null,
    'isFunction', false,
    'databasePasswordOverride', '',
    'functionParameters', null,
    'queryDisabledMessage', '',
    'servedFromCache', false,
    'offlineUserQueryInputs', '',
    'functionDescription', null,
    'successMessage', opts.successMessage || '',
    'queryDisabled', '',
    'playgroundQuerySaveId', 'latest',
    'workflowParams', null,
    'resourceNameOverride', '',
    'runWhenModelUpdates', false,
    'workflowRunExecutionType', 'sync',
    'showFailureToaster', true,
    'query', sql,
    'playgroundQueryUuid', '',
    'playgroundQueryId', null,
    'error', null,
    'workflowRunBodyType', 'raw',
    'privateParams', ['~#iL', []],
    'queryRunOnSelectorUpdate', false,
    'runWhenPageLoadsDelay', '',
    'warningCodes', ['~#iL', []],
    'data', null,
    'recordId', '',
    'importedQueryInputs', ['~#iM', []],
    '_additionalScope', ['~#iL', []],
    'isImported', false,
    'showSuccessToaster', true,
    'dataArray', ['~#iL', []],
    'cacheKeyTtl', '',
    'filterBy', '',
    'requestSentTimestamp', null,
    'databaseHostOverride', '',
    'metadata', null,
    'editorMode', opts.editorMode || 'sql',
    'queryRunTime', null,
    'actionType', opts.actionType || 'SELECT',
    'changesetObject', opts.changesetObject || '',
    'shouldUseLegacySql', false,
    'offlineOptimisticResponse', null,
    'errorTransformer', 'return data.error',
    'finished', null,
    'databaseNameOverride', '',
    'confirmationMessage', opts.requireConfirmation ? 'Confirmar alterações?' : null,
    'isFetching', false,
    'changeset', opts.changeset || '',
    'rawData', null,
    'queryTriggerDelay', '0',
    'resourceTypeOverride', null,
    'watchedParams', ['~#iL', []],
    'enableErrorTransformer', false,
    'databaseWarehouseOverride', '',
    'enableBulkUpdates', opts.enableBulkUpdates || false,
    'showLatestVersionUpdatedWarning', false,
    'timestamp', 0,
    'importedQueryDefaults', ['~#iM', []],
    'enableTransformer', false,
    'showUpdateSetValueDynamicallyToggle', true,
    'overrideOrgCacheForUserCache', false,
    'bulkUpdatePrimaryKey', opts.bulkUpdatePrimaryKey || '',
    'runWhenPageLoads', opts.runWhenPageLoads || false,
    'transformer', 'return data',
    'events', null,
    'tableName', opts.tableName || '',
    'queryTimeout', '10000',
    'workflowId', null,
    'requireConfirmation', opts.requireConfirmation || false,
    'queryFailureConditions', '',
    'changesetIsObject', false,
    'enableCaching', false,
    'allowedGroups', ['~#iL', []],
    'databaseUsernameOverride', '',
    'databaseRoleOverride', '',
    'shouldEnableBatchQuerying', false,
    'doNotThrowOnNoOp', false,
    'offlineQueryType', 'None',
    'queryThrottleTime', '750',
    'updateSetValueDynamically', false,
    'notificationDuration', '',
  ];

  return ['~#iO', ['^ ', 'n', 'pluginTemplate', 'v', ['^ ',
    'id', id,
    'uuid', null,
    '_comment', null,
    'type', 'datasource',
    'subtype', 'SqlQueryUnified',
    'namespace', null,
    'resourceId', RESOURCE_ID,
    'resourceDisplayName', RESOURCE_NAME,
    'template', ['~#iM', tmplArr],
    'style', null,
    'position2', null,
    'mobilePosition2', null,
    'mobileAppPosition', null,
    'tabIndex', null,
    'container', '',
    'createdAt', NOW,
    'updatedAt', NOW,
    'folder', '',
    'presetName', null,
    'screen', page,
    'boxId', null,
    'subBoxIds', null,
  ]]];
}

function makeScreen(id, uuid, title, order) {
  return ['~#iO', ['^ ', 'n', 'pluginTemplate', 'v', ['^ ',
    'id', id,
    'uuid', uuid,
    '_comment', null,
    'type', 'screen',
    'subtype', 'Screen',
    'namespace', null,
    'resourceId', null,
    'resourceDisplayName', null,
    'template', ['~#iM', [
      'title', title,
      'browserTitle', '',
      'urlSlug', '',
      '_order', order,
      '_searchParams', ['~#iL', []],
      '_hashParams', ['~#iL', []],
      '_customShortcuts', ['~#iL', []],
    ]],
    'style', null,
    'position2', null,
    'mobilePosition2', null,
    'mobileAppPosition', null,
    'tabIndex', null,
    'container', '',
    'createdAt', NOW,
    'updatedAt', NOW,
    'folder', '',
    'presetName', null,
    'screen', null,
    'boxId', null,
    'subBoxIds', null,
  ]]];
}

function makeTable(id, uuid, queryId, primaryKey, page, editableCols, row, col, width, height) {
  const editableMap = ['~#iM', editableCols.flatMap(c => [c, true])];
  return ['~#iO', ['^ ', 'n', 'pluginTemplate', 'v', ['^ ',
    'id', id,
    'uuid', uuid,
    '_comment', null,
    'type', 'widget',
    'subtype', 'TableWidget2',
    'namespace', null,
    'resourceId', null,
    'resourceDisplayName', null,
    'template', ['~#iM', [
      'selectedRowKey', null,
      '_nextAfterCursor', '',
      '_clearChangesetOnSave', true,
      'heightType', 'fixed',
      'disableEdits', false,
      'autoColumnWidth', true,
      '_rowHeight', 'medium',
      '_columnIds', ['~#iL', []],
      '_isSaving', false,
      '_headerTextWrap', false,
      '_actionIds', ['~#iL', []],
      '_clearChangeset', false,
      'caseSensitiveFiltering', false,
      'disableSave', false,
      '_columnEditable', editableMap,
      '_toolbarPosition', 'bottom',
      '_groupByColumns', ['~#iL', []],
      '_primaryKeyColumnId', primaryKey,
      'changesetArray', [],
      'groupByColumns', [],
      'columnOrdering', [],
      'data', `{{ ${queryId}.data }}`,
      '_cellSelection', 'none',
      '_serverPaginated', false,
      '_linkedFilterId', null,
      'searchMode', 'fuzzy',
      '_rowSelection', 'single',
      '_showBorder', true,
      '_showHeader', true,
      '_currentPage', 0,
      'hidden', false,
      '_toolbarButtonIds', ['~#iL', ['1a', '3c', '4d']],
      '_toolbarButtonLabel', ['~#iM', ['1a', 'Filter', '3c', 'Download', '4d', 'Refresh']],
      '_toolbarButtonIcon', ['~#iM', ['1a', 'bold/interface-text-formatting-filter-2', '3c', 'bold/interface-download-button-2', '4d', 'bold/interface-arrows-round-left']],
      '_toolbarButtonType', ['~#iM', ['1a', 'filter', '3c', 'custom', '4d', 'custom']],
      '_toolbarButtonHidden', ['~#iM', ['1a', '', '3c', '', '4d', '']],
      '_showFooter', true,
      '_showToolbar', true,
      '_enableSaveActions', true,
      'emptyMessage', 'No rows found',
      'pagination', null,
      'selectedDataIndexes', [],
      'newRows', [],
      'sortArray', [],
      '_selectedCell', null,
      'overflowType', 'scroll',
      'selectedCell', null,
      '_defaultSelectedRow', ['~#iM', ['mode', 'index', 'indexType', 'display', 'index', 0]],
      '_hasNextPage', false,
      'events', ['~#iL', [
        ['~#iM', ['name', 'save', 'type', 'datasourceEvent', 'plugin', id.replace('table', 'queryUpdate'), 'waitForIt', true]],
      ]],
      'maintainSpaceWhenHidden', false,
      '_dynamicColumnsEnabled', false,
      '_columnHidden', ['~#iM', []],
      '_columnLabel', ['~#iM', []],
      '_columnCaption', ['~#iM', []],
      '_columnFormat', ['~#iM', []],
      '_columnFormatOptions', ['~#iM', []],
      '_columnSize', ['~#iM', []],
      '_columnAlignment', ['~#iM', []],
      '_columnSortDisabled', ['~#iM', []],
      'searchTerm', '',
      'selectedRows', [],
      'selectedRowKeys', [],
      '_disabledVirtualization', false,
      '_expandedRowDataIndexes', [],
      '_showColumnBorders', false,
      'changesetObject', null,
      'selectedDataIndex', null,
      'selectedRow', null,
      'selectedSourceRow', null,
      'selectedSourceRows', [],
    ]],
    'style', ['~#iM', []],
    'position2', ['~#iO', ['^ ', 'n', 'position2', 'v', ['^ ',
      'type', 'grid',
      'container', '',
      'rowGroup', 'body',
      'subcontainer', '',
      'row', row,
      'col', col,
      'height', height,
      'width', width,
      'tabNum', 0,
      'stackPosition', null,
    ]]],
    'mobilePosition2', null,
    'mobileAppPosition', null,
    'tabIndex', null,
    'container', '',
    'createdAt', NOW,
    'updatedAt', NOW,
    'folder', '',
    'presetName', null,
    'screen', page,
    'boxId', null,
    'subBoxIds', null,
  ]]];
}

// ── Update query for Products (bulk via changeset)
const queryUpdateProducts = makeQuery('queryUpdateProducts',
  `UPDATE "Product"
SET
  name            = c.name,
  category        = c.category,
  "priceInCents"  = c."priceInCents"::int,
  "oldPriceInCents" = NULLIF(c."oldPriceInCents", '')::int,
  badge           = NULLIF(c.badge, ''),
  featured        = c.featured::boolean,
  rating          = c.rating::numeric,
  reviews         = c.reviews::int
FROM (VALUES {{ table1.changesetArray.map(r =>
  \`('\${r.id}','\${r.name}','\${r.category}',\${r.priceInCents},'\${r.oldPriceInCents ?? ''}','\${r.badge ?? ''}',\${r.featured},\${r.rating},\${r.reviews})\`
).join(',') }})
AS c(id, name, category, "priceInCents", "oldPriceInCents", badge, featured, rating, reviews)
WHERE "Product".id = c.id`,
  'page1',
  { successMessage: 'Produtos atualizados!', requireConfirmation: true }
);

// ── Page 2: Users
const page2 = makeScreen('page2', 'a1b2c3d4-1111-1111-1111-000000000002', 'Usuários', 1);

const querySelectUsers = makeQuery('querySelectUsers',
  `SELECT id, email, "displayName", "firebaseUid", "createdAt" FROM "User" ORDER BY "createdAt" DESC`,
  'page2', { runWhenPageLoads: true }
);

const queryUpdateUsers = makeQuery('queryUpdateUsers',
  `UPDATE "User"
SET "displayName" = c."displayName"
FROM (VALUES {{ tableUsers.changesetArray.map(r => \`('\${r.id}','\${r.displayName ?? ''}')\`).join(',') }})
AS c(id, "displayName")
WHERE "User".id = c.id`,
  'page2',
  { successMessage: 'Usuários atualizados!', requireConfirmation: true }
);

const tableUsers = makeTable('tableUsers', 'b2c3d4e5-2222-2222-2222-000000000002',
  'querySelectUsers', 'id', 'page2', ['displayName'], 2, 0, 12, 8);

// ── Page 3: CartItems
const page3 = makeScreen('page3', 'c3d4e5f6-3333-3333-3333-000000000003', 'Itens do Carrinho', 2);

const querySelectCartItems = makeQuery('querySelectCartItems',
  `SELECT
  ci.id,
  ci."cartId",
  ci."productId",
  p.name AS "productName",
  ci.quantity,
  ci."createdAt",
  u.email AS "userEmail"
FROM "CartItem" ci
JOIN "Product" p ON p.id = ci."productId"
JOIN "Cart" c ON c.id = ci."cartId"
JOIN "User" u ON u.id = c."userId"
ORDER BY ci."createdAt" DESC`,
  'page3', { runWhenPageLoads: true }
);

const queryUpdateCartItems = makeQuery('queryUpdateCartItems',
  `UPDATE "CartItem"
SET quantity = c.quantity::int
FROM (VALUES {{ tableCartItems.changesetArray.map(r => \`('\${r.id}',\${r.quantity})\`).join(',') }})
AS c(id, quantity)
WHERE "CartItem".id = c.id`,
  'page3',
  { successMessage: 'Quantidades atualizadas!' }
);

const queryDeleteCartItem = makeQuery('queryDeleteCartItem',
  `DELETE FROM "CartItem" WHERE id = '{{ tableCartItems.selectedRow.data.id }}'`,
  'page3',
  { successMessage: 'Item removido!', requireConfirmation: true }
);

const tableCartItems = makeTable('tableCartItems', 'd4e5f6a7-4444-4444-4444-000000000004',
  'querySelectCartItems', 'id', 'page3', ['quantity'], 2, 0, 12, 8);

// ── Page 4: Carts
const page4 = makeScreen('page4', 'e5f6a7b8-5555-5555-5555-000000000005', 'Carrinhos', 3);

const querySelectCarts = makeQuery('querySelectCarts',
  `SELECT c.id, u.email AS "userEmail", c."updatedAt",
  COUNT(ci.id) AS "itemCount",
  SUM(p."priceInCents" * ci.quantity) AS "totalCents"
FROM "Cart" c
JOIN "User" u ON u.id = c."userId"
LEFT JOIN "CartItem" ci ON ci."cartId" = c.id
LEFT JOIN "Product" p ON p.id = ci."productId"
GROUP BY c.id, u.email, c."updatedAt"
ORDER BY c."updatedAt" DESC`,
  'page4', { runWhenPageLoads: true }
);

const tableCarts = makeTable('tableCarts', 'f6a7b8c9-6666-6666-6666-000000000006',
  'querySelectCarts', 'id', 'page4', [], 2, 0, 12, 8);

// ── Append all new plugins
const additions = [
  ['queryUpdateProducts', queryUpdateProducts],
  ['page2', page2],
  ['querySelectUsers', querySelectUsers],
  ['queryUpdateUsers', queryUpdateUsers],
  ['tableUsers', tableUsers],
  ['page3', page3],
  ['querySelectCartItems', querySelectCartItems],
  ['queryUpdateCartItems', queryUpdateCartItems],
  ['queryDeleteCartItem', queryDeleteCartItem],
  ['tableCartItems', tableCartItems],
  ['page4', page4],
  ['querySelectCarts', querySelectCarts],
  ['tableCarts', tableCarts],
];

for (const [key, val] of additions) {
  pluginsList.push(key, val);
}

// Also fix table1 to have primaryKey and save event
const table1Val = findPluginValue('table1');
if (table1Val) {
  const tmpl = table1Val[1][3][3]; // plugin -> ordered map -> template -> iM contents
  const arr = tmpl[1];
  const pkIdx = arr.indexOf('_primaryKeyColumnId');
  if (pkIdx >= 0) arr[pkIdx + 1] = 'id';
  const evIdx = arr.indexOf('events');
  if (evIdx >= 0) {
    arr[evIdx + 1] = ['~#iL', [
      ['~#iM', ['name', 'save', 'type', 'datasourceEvent', 'plugin', 'queryUpdateProducts', 'waitForIt', true]],
    ]];
  }
}

input.page.data.appState = JSON.stringify(appState);
process.stdout.write(JSON.stringify(input, null, 2));
