# Public Manus benchmark notes

## Sources
- https://manus.im/
- https://manus.im/blog/manus-my-computer-desktop
- https://manus.im/playbook
- https://www.youtube.com/watch?v=K27diMbCsuw
- https://www.youtube.com/watch?v=3mdNmNLcWYQ

## Observable patterns
- Manus homepage centers on a single task composer headed "What can I do for you?" with capability shortcuts for slides, websites, games, video, and more.
- Manus presents a low-structure, high-intelligence entry point rather than a dashboard-first flow.
- Public My Computer materials describe visible execution against local files, command line, browser, and applications.
- Manus explicitly requires user approval before terminal commands; the user remains in control.
- Manus connects tasks to projects, agents, and scheduled tasks.
- Orbit now has a similar agent-first composer, local plan review, progress inspector, library, and live runtime panel.
- Orbit is not yet functionally equivalent: local task runs remain browser-only previews; the live runtime is separate from the main task thread; browser/computer control and rich artifact generation are not implemented.

## Orbit screenshots captured
- /home/ubuntu/screenshots/5173-i74n9uxi5ysgmhl_2026-11-22_19-15-20_7084.webp
- /home/ubuntu/screenshots/5173-i74n9uxi5ysgmhl_2026-11-22_19-14-52_1422.webp
- /home/ubuntu/screenshots/5173-i74n9uxi5ysgmhl_2026-11-22_19-15-00_2185.webp
- Official reference screenshot: /home/ubuntu/screenshots/manus_im_2026-11-22_19-14-12_7675.webp

## GAIA evaluation findings

The official GAIA dataset contains more than 450 real-world questions across three levels. The public validation split is 165 questions; the test split is private and is intended for leaderboard submission. The dataset is gated on Hugging Face and requires accepting its conditions before downloading. Sources: https://huggingface.co/datasets/gaia-benchmark/GAIA and https://hal.cs.princeton.edu/gaia.

AgentQuest documents a reproducible GAIA validation runner and confirms that GAIA is single-interaction in its standard form. A full 165-question run would require a Hugging Face login, dataset access, and an agent harness with tool support. Source: https://github.com/nec-research/agentquest/blob/main/agentquest/benchmarks/gaia/README.md.

The original paper defines GAIA as real-world questions requiring reasoning, multimodality, web browsing, and tool use, and reports 466 questions with 300 private answers. Source: https://arxiv.org/abs/2311.12983.

Given the request to minimize credits, the responsible next evaluation is a small public-validation smoke subset, not the full 165-question run. A real full run should only start after Hugging Face access is available and the model/API cost is explicitly accepted.
