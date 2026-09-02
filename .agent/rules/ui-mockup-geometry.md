---
trigger: model_decision
description: Best practices for positioning floating callout badges and directional pointers beside device mockups without overlap or viewport clipping.
---

# Floating Mockup Callout Geometry Guidelines

1. **Zero Overlap Boundary**:
   - To place a callout badge strictly *outside* a device frame on the left, use `right-[calc(100%+GAP)]` (or `right-full mr-GAP`).
   - To place a callout badge strictly *outside* a device frame on the right, use `left-[calc(100%+GAP)]` (or `left-full ml-GAP`).
   - **Never** use small negative offsets like `-left-16` or `-right-12` on wide elements (`w-[200px]+`), as `element_width - offset` will leave the majority of the element overlapping the device screen.

2. **Viewport Clipping Prevention**:
   - When placing external callouts on both sides of a 340px phone mockup, the total effective width is ~780px.
   - Ensure the parent column/grid has adequate allocation (e.g. `lg:grid-cols-[1fr_1.1fr]`) and use `overflow-x-clip` on the section wrapper rather than restrictive `overflow-hidden` that chops off right-aligned badges.
   - On smaller/mobile screens (`< lg`), hide or dock badges cleanly above/below with vertical pointers to prevent horizontal page scrolling.
