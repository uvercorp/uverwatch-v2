// TODO: Make a server-side implementation of this

// Lightweight local preset storage. Scoped by deployment and view key.

const STORAGE_PREFIX = 'uverwatch.presets';

function buildStorageKey(deploymentId, viewKey) {
	const dep = String(deploymentId || 'global');
	const view = String(viewKey || 'default');
	return `${STORAGE_PREFIX}.${dep}.${view}`;
}

function loadAll(deploymentId, viewKey) {
	try {
		const raw = localStorage.getItem(buildStorageKey(deploymentId, viewKey));
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (_) {
		return [];
	}
}

function saveAll(deploymentId, viewKey, presets) {
	localStorage.setItem(buildStorageKey(deploymentId, viewKey), JSON.stringify(presets || []));
}

function generateId() {
	return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getPresets(deploymentId, viewKey) {
	return loadAll(deploymentId, viewKey);
}

export function getDefaultPreset(deploymentId, viewKey) {
	const list = loadAll(deploymentId, viewKey);
	return list.find(p => p.isDefault) || null;
}

export function savePreset({ deploymentId, viewKey, name, filters, isDefault = false }) {
	const list = loadAll(deploymentId, viewKey);
	const newPreset = {
		id: generateId(),
		name: name || 'Untitled Preset',
		filters,
		isDefault: Boolean(isDefault),
		scope: 'personal',
		createdAt: new Date().toISOString(),
	};
	let next = list.concat(newPreset);
	if (newPreset.isDefault) {
		next = next.map(p => ({ ...p, isDefault: p.id === newPreset.id }));
	}
	saveAll(deploymentId, viewKey, next);
	return newPreset;
}

export function applyPreset(deploymentId, viewKey, presetId) {
	const list = loadAll(deploymentId, viewKey);
	const found = list.find(p => p.id === presetId);
	return found ? found.filters : null;
}

export function deletePreset(deploymentId, viewKey, presetId) {
	const list = loadAll(deploymentId, viewKey);
	const next = list.filter(p => p.id !== presetId);
	saveAll(deploymentId, viewKey, next);
	return next;
}

export function renamePreset(deploymentId, viewKey, presetId, newName) {
	const list = loadAll(deploymentId, viewKey);
	const next = list.map(p => (p.id === presetId ? { ...p, name: newName } : p));
	saveAll(deploymentId, viewKey, next);
	return next.find(p => p.id === presetId) || null;
}

export function setDefaultPreset(deploymentId, viewKey, presetId) {
	const list = loadAll(deploymentId, viewKey);
	const next = list.map(p => ({ ...p, isDefault: p.id === presetId }));
	saveAll(deploymentId, viewKey, next);
	return next.find(p => p.id === presetId) || null;
}




