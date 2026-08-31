import { describe, expect, it } from 'vitest';

import { createWorkflowStore } from './workflow-store';

function makeStore() {
  return createWorkflowStore({ nodes: [], edges: [] });
}

describe('workflow-store — isDirty semantics', () => {
  it('initialises with isDirty=false and isSaving=false', () => {
    const store = makeStore();
    const { isDirty, isSaving } = store.getState();
    expect(isDirty).toBe(false);
    expect(isSaving).toBe(false);
  });

  it('select change does NOT set isDirty', () => {
    const store = makeStore();
    store.getState().onNodesChange([{ type: 'select', id: 'n1', selected: true }]);
    expect(store.getState().isDirty).toBe(false);
  });

  it('position change with dragging=true does NOT set isDirty', () => {
    const store = makeStore();
    store.getState().onNodesChange([{ type: 'position', id: 'n1', dragging: true }]);
    expect(store.getState().isDirty).toBe(false);
  });

  it('position change with dragging=false SETS isDirty (drop)', () => {
    const store = makeStore();
    store.getState().onNodesChange([{ type: 'position', id: 'n1', dragging: false }]);
    expect(store.getState().isDirty).toBe(true);
  });

  it('add change SETS isDirty', () => {
    const store = makeStore();
    // Using 'add' type - we don't need a real node for this test
    store
      .getState()
      .onNodesChange([
        { type: 'add', item: { id: 'n1', position: { x: 0, y: 0 }, data: {} } as never },
      ]);
    expect(store.getState().isDirty).toBe(true);
  });

  it('remove change SETS isDirty', () => {
    const store = makeStore();
    store.getState().onNodesChange([{ type: 'remove', id: 'n1' }]);
    expect(store.getState().isDirty).toBe(true);
  });

  it('dimensions change does NOT set isDirty', () => {
    const store = makeStore();
    store
      .getState()
      .onNodesChange([{ type: 'dimensions', id: 'n1', dimensions: { width: 100, height: 50 } }]);
    expect(store.getState().isDirty).toBe(false);
  });

  it('preserves isDirty=true when non-dirty change follows', () => {
    const store = makeStore();
    store.getState().onNodesChange([{ type: 'remove', id: 'n1' }]);
    expect(store.getState().isDirty).toBe(true);
    store.getState().onNodesChange([{ type: 'select', id: 'n2', selected: true }]);
    expect(store.getState().isDirty).toBe(true);
  });
});

describe('workflow-store — isSaving', () => {
  it('setSaving(true) sets isSaving', () => {
    const store = makeStore();
    store.getState().setSaving(true);
    expect(store.getState().isSaving).toBe(true);
  });

  it('setSaving(false) clears isSaving', () => {
    const store = makeStore();
    store.getState().setSaving(true);
    store.getState().setSaving(false);
    expect(store.getState().isSaving).toBe(false);
  });

  it('markClean resets isDirty but does not touch isSaving', () => {
    const store = makeStore();
    store.getState().onNodesChange([{ type: 'remove', id: 'n1' }]);
    store.getState().setSaving(true);
    store.getState().markClean();
    expect(store.getState().isDirty).toBe(false);
    expect(store.getState().isSaving).toBe(true);
  });
});
