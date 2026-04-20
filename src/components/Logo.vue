<template>
  <div class="flex items-center gap-2">
    <svg
      :width="70"
      :height="70"
      viewBox="0 0 180 140"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        :d="markPath"
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      <circle :cx="dotCx" :cy="dotCy" :r="dotRadius" :fill="color" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  dark: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number,
    default: 30,
  },
  showText: {
    type: Boolean,
    default: true,
  },
});

// Logo parameters (from M Logo Explorations)
const humps = 2;
const humpHeight = 80;
const humpWidth = 38;
const decay = 0;
const strokeW = 22;
const gap = 20;
const dotR = 11;
const baseline = 120;
const pad = 20;

// Build the bouncing mark path
const buildMarkPath = () => {
  const widths = [];
  const heights = [];

  for (let i = 0; i < humps; i++) {
    const k = Math.pow(1 - decay, i);
    widths.push(humpWidth * (0.7 + 0.3 * k));
    heights.push(humpHeight * k);
  }

  let d = "";
  let x = pad;

  for (let i = 0; i < humps; i++) {
    const w = widths[i];
    const h = heights[i];
    const xMid = x + w / 2;
    const xEnd = x + w;

    if (i === 0) d += `M${x.toFixed(1)},${baseline} `;

    // Up arc
    const c1x = x + w * 0.08;
    const c1y = baseline - h * 1.05;
    const c2x = xMid - w * 0.18;
    const c2y = baseline - h;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${xMid.toFixed(1)},${(baseline - h).toFixed(1)} `;

    // Down arc
    const c3x = xMid + w * 0.18;
    const c3y = baseline - h;
    const c4x = xEnd - w * 0.08;
    const c4y = baseline - h * 1.05;
    d += `C${c3x.toFixed(1)},${c3y.toFixed(1)} ${c4x.toFixed(1)},${c4y.toFixed(1)} ${xEnd.toFixed(1)},${baseline.toFixed(1)} `;

    x = xEnd;
  }

  return { d, dotCx: x + gap + dotR, dotCy: baseline };
};

const markData = buildMarkPath();
const markPath = markData.d;
const dotCx = markData.dotCx;
const dotCy = markData.dotCy;
const strokeWidth = strokeW;
const dotRadius = dotR;

const color = computed(() => "#B55430");
const textColor = computed(() => (props.dark ? "#F2EFE9" : "#0E0D0B"));
</script>
