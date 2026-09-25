import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'component-definition.json');
const blocksPath = path.join(root, 'blocks');
const groups = new Map([
  ['blocks', { title: 'Blocks', id: 'blocks', components: [] }],
  ['header', { title: 'Header', id: 'header', components: [] }],
  ['footer', { title: 'Footer', id: 'footer', components: [] }],
]);

function getGroupId(blockName) {
  if (blockName.startsWith('header-')) return 'header';
  if (blockName.startsWith('footer-')) return 'footer';
  return 'blocks';
}

const directories = (await fs.readdir(blocksPath, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((first, second) => first.name.localeCompare(second.name));

const blockDefinitions = await Promise.all(directories.map(async (directory) => {
  const partialDirectory = path.join(blocksPath, directory.name);
  const partialNames = (await fs.readdir(partialDirectory))
    .filter((name) => name.startsWith('_') && name.endsWith('.json'))
    .sort();
  const partials = await Promise.all(partialNames.map(async (partialName) => {
    const partialPath = path.join(partialDirectory, partialName);
    return JSON.parse(await fs.readFile(partialPath, 'utf8'));
  }));

  return {
    groupId: getGroupId(directory.name),
    definitions: partials.flatMap((partial) => partial.definitions || []),
  };
}));

blockDefinitions.forEach(({ groupId, definitions }) => {
  groups.get(groupId).components.push(...definitions);
});

const definition = JSON.parse(await fs.readFile(outputPath, 'utf8'));
const generatedGroupIds = new Set(groups.keys());
const baseGroups = definition.groups.filter((group) => !generatedGroupIds.has(group.id));
const generatedGroups = [...groups.values()].filter((group) => (
  group.id === 'blocks' || group.components.length > 0
));
const componentIds = new Set();
const components = [...baseGroups, ...generatedGroups].flatMap((group) => group.components);

components.forEach((component) => {
  if (!component.id) {
    throw new Error('Component definition without an id');
  }
  if (componentIds.has(component.id)) {
    throw new Error(`Duplicate component definition id: ${component.id}`);
  }
  componentIds.add(component.id);
});

definition.groups = [...baseGroups, ...generatedGroups];
await fs.writeFile(outputPath, `${JSON.stringify(definition, null, 2)}\n`);
