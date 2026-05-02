"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLayout = calculateLayout;
const COLS = 3;
const NODE_WIDTH = 280;
const NODE_HEIGHT_BASE = 120;
const GAP_X = 80;
const GAP_Y = 60;
function calculateLayout(nodeCount) {
    return Array.from({ length: nodeCount }, (_, i) => ({
        x: (i % COLS) * (NODE_WIDTH + GAP_X),
        y: Math.floor(i / COLS) * (NODE_HEIGHT_BASE + GAP_Y)
    }));
}
