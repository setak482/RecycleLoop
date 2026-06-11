import { GridManager } from './grid/GridManager.js';
import { PlaybackManager } from './playback/PlaybackManager.js';
import { ObjectManager } from './object/ObjectManager.js';
import { HistoryManager } from './history/HistoryManager.js';
import { SelectionManager } from './ui/SelectionManager.js';
import { setupUI } from './ui/setupUI.js';
import { attachZoomWheel, initZoomIndicator } from './ui/helpers/zoomHelper.js';

const grid = new GridManager('grid-canvas');
const playback = new PlaybackManager();
const objects = new ObjectManager(grid, playback);
const history = new HistoryManager(objects);
const selection = new SelectionManager(grid, objects);

objects.setHistory(history);

grid.init();
objects.init();
playback.init(grid);

const zoomIndicator = initZoomIndicator();
attachZoomWheel(grid, zoomIndicator);

setupUI(playback, objects, selection, grid, history);
selection.init();
